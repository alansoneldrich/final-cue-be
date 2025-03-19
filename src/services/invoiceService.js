const invoiceDao = require("../dao/invoiceDao");
const orderDao = require("../dao/orderDao");


// Function to create an invoice
const createInvoice = async (orderId) => {
    try {

        const order = await orderDao.getOrderById(orderId);
        console.log("order?????????????????", order)
        if (order.status !== "Fulfilled") {
            throw new Error("Order is not yet fulfilled.");
        }

        // Get the next available invoice ID
        const nextInvoiceId = await invoiceDao.getNextInvoiceId();


        // Fetch order total cost
        const totalCost = await invoiceDao.getOrderTotalCost(orderId);
        if (!totalCost) {
            throw new Error("Order not found or has no products.");
        }

        // Generate invoice date and due date
        const invoiceDate = new Date().toISOString().slice(0, 19).replace("T", " ");
        const dueDate = new Date();
        dueDate.setDate(dueDate.getDate() + 30); // Due in 30 days

        // Insert invoice
        await invoiceDao.insertInvoice(nextInvoiceId, orderId, "Billed", invoiceDate);
        await orderDao.updateOrderStatus(orderId, "Billed")
        return {
            invoiceId: nextInvoiceId,
            status: "Billed",
            totalCost,
            dueDate: dueDate.toISOString().split("T")[0] // Format as YYYY-MM-DD
        };

    } catch (error) {
        throw new Error("Service Error: " + error.message);
    }
};

module.exports = {
    createInvoice
};
