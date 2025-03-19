const createHandler = require("azure-function-express").createHandler;
const express = require("express");
const app = express();
const invoiceService = require("../src/services/invoiceService");

app.post("/api/invoice", async (req, res) => {
    try {
        const { orderId } = req.body;
        const invoice = await invoiceService.createInvoice(orderId);
        res.status(200).json(invoice);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

module.exports = createHandler(app);