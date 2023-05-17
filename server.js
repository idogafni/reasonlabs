const { Worker, isMainThread, parentPort, workerData } = require('worker_threads');

// Builder Pattern: PizzaBuilder
class Pizza {
    constructor() {
        this.toppings = [];
    }

    addTopping(topping) {
        this.toppings.push(topping);
    }
}

class PizzaBuilder {
    constructor() {
        this.pizza = new Pizza();
    }

    buildDough() {
        this.pizza.addTopping("Regular Dough");
    }

    buildToppings() {
        // Implementation for adding toppings
    }

    buildCooking() {
        // Implementation for cooking process
    }

    getResult() {
        return this.pizza;
    }
}

// Observer Pattern: OrderObserver
class OrderObserver {
    constructor(order) {
        this.order = order;
    }

    notify() {
        console.log(`Order ${this.order} has been completed.`);
    }
}

class ToppingChefObserver extends OrderObserver {
    notify() {
        console.log(`Topping chef finished adding toppings for Order ${this.order}.`);
    }
}

class OvenObserver extends OrderObserver {
    notify() {
        console.log(`Oven finished cooking Order ${this.order}.`);
    }
}

class WaiterObserver extends OrderObserver {
    notify() {
        console.log(`Waiter finished serving Order ${this.order}.`);
    }
}

// Singleton Pattern: Oven, Waiter
class Oven {
    constructor() {
        if (!Oven.instance) {
            Oven.instance = this;
        }
        return Oven.instance;
    }

    cook(order) {
        console.log(`Oven started cooking Order ${order}...`);
        // Cooking process
        console.log(`Oven finished cooking Order ${order}.`);
    }
}

class Waiter {
    constructor() {
        if (!Waiter.instance) {
            Waiter.instance = this;
        }
        return Waiter.instance;
    }

    serve(order) {
        console.log(`Waiter started serving Order ${order}...`);
        // Serving process
        console.log(`Waiter finished serving Order ${order}.`);
    }
}

// Function to process each order in a worker thread
function processOrder(orderIndex, toppings) {
    const pizzaBuilder = new PizzaBuilder();
    pizzaBuilder.buildDough();
    // Add more steps to build the pizza

    const pizza = pizzaBuilder.getResult();

    const oven = new Oven();
    const waiter = new Waiter();

    const orderObserver = new OrderObserver(orderIndex);
    const toppingChefObserver = new ToppingChefObserver(orderIndex);
    const ovenObserver = new OvenObserver(orderIndex);
    const waiterObserver = new WaiterObserver(orderIndex);

    // Register observers
    orderObserver.notify();
    toppingChefObserver.notify();
    ovenObserver.notify();
    waiterObserver.notify();

    oven.cook(orderIndex);
    waiter.serve(orderIndex);

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

    const orderPromises= orders.map((order, index) => {
        return new Promise((resolve, reject) => {
            const worker = new Worker(__filename, {
                workerData: { orderIndex: index + 1, toppings: order.toppings }
            });

            worker.on('message', resolve);
            worker.on('error', reject);
            worker.on('exit', (code) => {
                if (code !== 0)
                    reject(new Error(`Worker stopped with exit code ${code}`));
            }
            );
        });
    });

    Promise.all(orderPromises)
        .then(completedOrders => {
            console.log('---- Order Report ----');
            completedOrders.forEach(order => {
                console.log('Order ${order.orderIndex}: ${order.toppings.join(', ')}');
            });
        })
        .catch(error => {
            console.error(error);
        });
}

// Worker thread
if (!isMainThread) {
    const { orderIndex, toppings } = workerData;
    const completedOrder = processOrder(orderIndex, toppings);
    parentPort.postMessage(completedOrder);
}

// Run the main function
main();