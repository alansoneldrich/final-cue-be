const createHandler = require("azure-function-express").createHandler;
const express = require("express");
const app = express();
const orderService = require("../src/services/orderService");

app.get("/api/orders/:orderId", async (req, res) => {
    try {
        const { orderId } = req.params;
        const order = await orderService.getOrderById(orderId);
        res.status(200).json(order);
    } catch (error) {
        res.status(404).json({ error: error.message });
    }
});

module.exports = createHandler(app);