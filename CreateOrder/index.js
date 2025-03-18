const createHandler = require("azure-function-express").createHandler;
const express = require("express");
const app = express();
const orderService = require("../src/services/orderService");

app.post("/api/orders/create", async (req, res) => {
    try {
        const { customerId, userId, items } = req.body;
        const order = await orderService.createOrder(customerId, userId, items);
        res.status(201).json(order);
    } catch (error) {
        console.log(error); 
        res.status(400).json({ error: error.message });
    }
});

module.exports = createHandler(app);