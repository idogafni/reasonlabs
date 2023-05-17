const { Worker, isMainThread, parentPort, workerData } = require('worker_threads');

// Constants
const DOUGH_PREP_TIME = 7000; // 7 seconds
const TOPPING_PREP_TIME = 4000; // 4 seconds
const OVEN_COOK_TIME = 10000; // 10 seconds
const WAITER_SERVE_TIME = 5000; // 5 seconds

// Function to simulate a chef preparing dough
function prepareDough(orderIndex) {
    console.log(`Dough chef started preparing dough for Order ${orderIndex}...`);
    return new Promise(resolve => {
        setTimeout(() => {
            console.log(`Dough chef finished preparing dough for Order ${orderIndex}.`);
            resolve();
        }, DOUGH_PREP_TIME);
    });
}

// Function to simulate a chef adding toppings
function addToppings(orderIndex, toppings) {
    console.log(`Topping chef started adding ${toppings.join(', ')} toppings for Order ${orderIndex}...`);
    return new Promise(resolve => {
        setTimeout(() => {
            console.log(`Topping chef finished adding ${toppings.join(', ')} toppings for Order ${orderIndex}.`);
            resolve();
        }, TOPPING_PREP_TIME * toppings.length);
    });
}

// Function to simulate the oven cooking the pizza
function cookPizza(orderIndex) {
    console.log(`Oven started cooking Order ${orderIndex}...`);
    return new Promise(resolve => {
        setTimeout(() => {
            console.log(`Oven finished cooking Order ${orderIndex}.`);
            resolve();
        }, OVEN_COOK_TIME);
    });
}

// Function to simulate the waiter serving the pizza
function servePizza(orderIndex) {
    console.log(`Waiter started serving Order ${orderIndex}...`);
    return new Promise(resolve => {
        setTimeout(() => {
            console.log(`Waiter finished serving Order ${orderIndex}.`);
            resolve();
        }, WAITER_SERVE_TIME);
    });
}

// Function to process each order
async function processOrder(orderIndex, toppings) {
    await prepareDough(orderIndex);
    await addToppings(orderIndex, toppings);
    await cookPizza(orderIndex);
    await servePizza(orderIndex);
    return { orderIndex, toppings };
}

// Main function
function main() {
    const orders = [
        { toppings: ["Cheese"] },
        { toppings: ["Pepperoni", "Mushrooms"] },
        { toppings: ["Chicken", "Onions", "Bell Peppers"] },
        { toppings: ["Margherita"] },
        { toppings: ["Sausage", "Olives", "Tomatoes"] }
    ];

    const startTime = Date.now();

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
        .then(completedOrders => {
            const endTime = Date.now();
            const totalTime = endTime - startTime;

            console.log('---- Order Report ----');
            console.log(`Preparation Time (ms): ${totalTime}`);

            completedOrders.forEach(order => {
                console.log(`Order ${order.orderIndex}: ${order.toppings.join(', ')}`);
            });
        })
        .catch(error => {
            console.error(error);
        });
}

// Worker thread
if (!isMainThread) {
    const { orderIndex, toppings } = workerData;
    processOrder(orderIndex, toppings)
        .then(completedOrder => {
            parentPort.postMessage(completedOrder);
        })
        .catch(error => {
            console.error(error);
            process.exit(1);
        });
}

// Run the main function
main();

