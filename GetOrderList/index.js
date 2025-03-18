const createHandler = require("azure-function-express").createHandler;
const express = require("express");
const app = express();
const orderService = require("../src/services/orderService");

app.get("/api/orders", async (req, res) => {
    try {
        const { status, startDate, endDate, customerId } = req.query;
        const orders = await orderService.getOrders({ status, startDate, endDate, customerId });
        res.json({ orders });
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

module.exports = createHandler(app);