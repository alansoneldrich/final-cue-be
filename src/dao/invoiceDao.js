const sql = require("mssql");
const { executeQuery } = require("../config/database");

// Get the next available invoice ID manually
const getNextInvoiceId = async () => {
    const result = await executeQuery(
        "SELECT ISNULL(MAX(INVOICE_ID), 0) + 1 AS nextInvoiceId FROM INVOICE"
    );
    return result[0].nextInvoiceId;
};

// Fetch the total cost of an order
const getOrderTotalCost = async (orderId) => {
    
    const result = await executeQuery(
        `
        SELECT SUM(od.QUANTITY * p.PRICE) AS totalCost
        FROM ORDER_DETAILS od
        JOIN PRODUCT p ON od.PRODUCT_ID = p.PRODUCT_ID
        WHERE od.ORDER_ID = @orderId
        `,
        [{ name: "orderId", type: sql.Int, value: orderId }]
    );

    return result.length > 0 ? result[0].totalCost : null;
};

// Insert a new invoice
const insertInvoice = async (invoiceId, orderId, invoiceStatus, invoiceDate) => {
    await executeQuery(
        `
        INSERT INTO INVOICE (INVOICE_ID, ORDER_ID, INVOICE_STATUS, INVOICE_DATE)
        VALUES (@invoiceId, @orderId, @invoiceStatus, @invoiceDate)
        `,
        [
            { name: "invoiceId", type: sql.Int, value: invoiceId },
            { name: "orderId", type: sql.Int, value: orderId },
            { name: "invoiceStatus", type: sql.NChar(10), value: invoiceStatus },
            { name: "invoiceDate", type: sql.DateTime, value: invoiceDate }
        ]
    );
};

module.exports = {
    getNextInvoiceId,
    getOrderTotalCost,
    insertInvoice
};
