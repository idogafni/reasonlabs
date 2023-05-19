// Improved Builder Pattern
class Pizza {
    constructor(dough = "Regular Dough", toppings = []) {
        this.dough = dough;
        this.toppings = toppings;
    }
}

class PizzaBuilder {
    constructor() {
        this.pizza = new Pizza();
    }

    addTopping(topping) {
        this.pizza.toppings.push(topping);
        return this;
    }

    build() {
        return this.pizza;
    }
}

// Improved Observer Pattern
class PizzaShop {
    constructor() {
        this.observers = [];
    }

    subscribe(observer) {
        this.observers.push(observer);
    }

    broadcast(message) {
        this.observers.forEach(observer => observer.notify(message));
    }
}

class OrderObserver {
    constructor(name) {
        this.name = name;
    }

    notify(message) {
        console.log(`${this.name} notified: ${message}`);
    }
}

// Improved Singleton Pattern with Concurrency
class Oven {
    constructor() {
        if (Oven._instance) {
            return Oven._instance;
        }
        Oven._instance = this;
    }

    async cook(order) {
        console.log(`Oven started cooking Order ${order}...`);
        // Simulating the cooking process
        await new Promise(resolve => setTimeout(resolve, 1000));
        console.log(`Oven finished cooking Order ${order}.`);
    }
}

class Waiter {
    constructor() {
        if (Waiter._instance) {
            return Waiter._instance;
        }
        Waiter._instance = this;
    }

    async serve(order) {
        console.log(`Waiter started serving Order ${order}...`);
        // Simulating the serving process
        await new Promise(resolve => setTimeout(resolve, 1000));
        console.log(`Waiter finished serving Order ${order}.`);
    }
}

module.exports = {
    PizzaBuilder,
    PizzaShop,
    OrderObserver,
    Oven,
    Waiter,
};