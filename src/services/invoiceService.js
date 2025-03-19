const invoiceDao = require("../dao/invoiceDao");
const orderDao = require("../dao/orderDao");


// Function to create an invoice
const createInvoice = async (orderId) => {
    try {
        const invoiceStatusBilled = "Billed"

        // Check if order is fulfilled
        const order = await orderDao.getOrderById(orderId);
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
        dueDate.setDate(dueDate.getDate() + 7);

        // Update Order Status
        await invoiceDao.insertInvoice(nextInvoiceId, orderId, invoiceStatusBilled, invoiceDate);

        // Insert invoice
        await orderDao.updateOrderStatus(orderId, invoiceStatusBilled)
        return {
            invoiceId: nextInvoiceId,
            status: invoiceStatusBilled,
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
