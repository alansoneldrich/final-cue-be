const { executeQuery } = require("../config/database");
const sql = require("mssql");

module.exports = {
    async insertOrder(customerId, userId, items) {
        if (!customerId || !userId || !items || items.length === 0) {
            throw new Error("Missing required fields: customerId, userId, items.");
        }

        const poQuery = `SELECT TOP 1 PO_NUMBER FROM dbo.[ORDER] ORDER BY ORDER_ID DESC`;
        const lastPoResult = await executeQuery(poQuery);

        let newPoNumber = "PO-000000001"; // Default if no orders exist
        if (lastPoResult.length > 0) {
            const lastPo = lastPoResult[0].PO_NUMBER;
            const lastPoNum = parseInt(lastPo.replace("PO-", ""), 10) + 1;
            newPoNumber = `PO-${lastPoNum.toString().padStart(9, "0")}`;
        }

        const orderQuery = `
            INSERT INTO dbo.[ORDER] (CUSTOMER_ID, USER_ID, DATE_CREATED, PO_NUMBER, ORDER_STATUS)
            VALUES (@customerId, @userId, GETDATE(), @poNumber, 'Pending');
            SELECT SCOPE_IDENTITY() AS orderId;
        `;

        const orderResult = await executeQuery(orderQuery, [
            { name: "customerId", type: sql.Int, value: customerId },
            { name: "userId", type: sql.Int, value: userId },
            { name: "poNumber", type: sql.VarChar, value: newPoNumber }
        ]);

        if (!orderResult || orderResult.length === 0) {
            throw new Error("Failed to insert order.");
        }

        const orderId = orderResult[0].orderId;
        let totalCost = 0;

        for (const item of items) {
            if (!item.productId || !item.quantity || !item.price) {
                throw new Error("Each order item must have productId, quantity, and price.");
            }

            totalCost += item.price * item.quantity;

            await executeQuery(
                `INSERT INTO dbo.[ORDER_DETAILS] (ORDER_ID, PRODUCT_ID, QUANTITY, PRICE) 
                 VALUES (@orderId, @productId, @quantity, @price)`,
                [
                    { name: "orderId", type: sql.Int, value: orderId },
                    { name: "productId", type: sql.Int, value: item.productId },
                    { name: "quantity", type: sql.Int, value: item.quantity },
                    { name: "price", type: sql.Float, value: item.price }
                ]
            );
        }

        totalCost = totalCost.toFixed(2);

        return { orderId, status: "Pending", totalCost };
    },

    async getOrders({ status, startDate, endDate, customerId }) {
        let query = `
            SELECT 
                O.ORDER_ID AS orderId, 
                O.ORDER_STATUS AS status, 
                O.CUSTOMER_ID AS customerId, 
                O.DATE_CREATED AS createdDate,
                SUM(OD.PRICE * OD.QUANTITY) AS totalCost
            FROM dbo.[ORDER] O
            LEFT JOIN dbo.[ORDER_DETAILS] OD ON O.ORDER_ID = OD.ORDER_ID
            WHERE 1=1
        `;
        let params = [];

        if (status) {
            query += " AND O.ORDER_STATUS = @status";
            params.push({ name: "status", type: sql.VarChar, value: status });
        }
        if (startDate) {
            query += " AND O.DATE_CREATED >= @startDate";
            params.push({ name: "startDate", type: sql.DateTime, value: new Date(startDate) });
        }
        if (endDate) {
            query += " AND O.DATE_CREATED <= @endDate";
            params.push({ name: "endDate", type: sql.DateTime, value: new Date(endDate) });
        }
        if (customerId) {
            query += " AND O.CUSTOMER_ID = @customerId";
            params.push({ name: "customerId", type: sql.Int, value: customerId });
        }

        query += " GROUP BY O.ORDER_ID, O.ORDER_STATUS, O.CUSTOMER_ID, O.DATE_CREATED";

        return await executeQuery(query, params);
    }
};
