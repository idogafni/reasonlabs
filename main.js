const { Worker, isMainThread, parentPort, workerData } = require('worker_threads');
const { MongoClient } = require('mongodb');
const { PizzaBuilder, PizzaShop, OrderObserver, Oven, Waiter } = require('./server');

async function processOrder(orderIndex, toppings) {
    const pizzaBuilder = new PizzaBuilder();
    toppings.forEach(topping => pizzaBuilder.addTopping(topping));
    const pizza = pizzaBuilder.build();

    const pizzaShop = new PizzaShop();
    pizzaShop.subscribe(new OrderObserver('ToppingChefObserver'));
    pizzaShop.subscribe(new OrderObserver('OvenObserver'));
    pizzaShop.subscribe(new OrderObserver('WaiterObserver'));

    const oven = new Oven();
    const waiter = new Waiter();

    pizzaShop.broadcast(`Order ${orderIndex} has been started.`);
    await oven.cook(orderIndex);
    pizzaShop.broadcast(`Order ${orderIndex} has been cooked.`);
    await waiter.serve(orderIndex);
    pizzaShop.broadcast(`Order ${orderIndex} has been served.`);

    return { orderIndex, toppings: pizza.toppings };
}

async function saveOrderReportToDb(completedOrders) {
    const url = 'mongodb://mongo:27017';
    const dbName = 'pizzaOrders';
    const client = new MongoClient(url);

    try {
        await client.connect();

        console.log("Connected successfully to MongoDB server");

        const db = client.db(dbName);
        const collection = db.collection('orders');

        // Insert all the orders to the database
        const result = await collection.insertMany(completedOrders);
        console.log(`Inserted ${result.insertedCount} documents into the collection.`);
    } catch (err) {
        console.error(err);
    } finally {
        await client.close();
    }
}

if (isMainThread) {
    function main() {
        const orders = [
            { toppings: ["Cheese"] },
            { toppings: ["Pepperoni", "Mushrooms"] },
            { toppings: ["Chicken", "Onions", "Bell Peppers"] },
            { toppings: ["Margherita"] },
            { toppings: ["Sausage", "Olives", "Tomatoes"] }
        ];

        const orderPromises = orders.map((order, index) => {
            return new Promise((resolve, reject) => {
                const worker = new Worker(__filename, {
                    workerData: { orderIndex: index + 1, toppings: order.toppings }
                });

                worker.on('message', resolve);
                worker.on('error', reject);
                worker.on('exit', (code) => {
                    if (code !== 0) {
                        reject(new Error(`Worker stopped with exit code ${code}`));
                    }
                });
            });
        });

        Promise.all(orderPromises)
            .then(async completedOrders => {
                console.log('---- Order Report ----');
                completedOrders.forEach(order => {
                    console.log(`Order ${order.orderIndex}: ${order.toppings.join(', ')}`);
                });
                // Save the order report to the database
                await saveOrderReportToDb(completedOrders);
            })
            .catch(error => {
                console.error(error);
            });
    }

    main();
} else {
    const { orderIndex, toppings } = workerData;
    processOrder(orderIndex, toppings)
        .then(completedOrder => parentPort.postMessage(completedOrder));
}