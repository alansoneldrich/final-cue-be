const { executeQuery } = require("../config/database");
const sql = require("mssql");

module.exports = {
    async getAvailablePONumber() {
        const poQuery = `SELECT TOP 1 PO_NUMBER FROM dbo.[ORDER] ORDER BY ORDER_ID DESC`;
        return await executeQuery(poQuery);
    },

    async insertOrder(customerId, userId, items, newPoNumber) {

        // Validate parameters
        if (!customerId || !userId || !items || items.length === 0) {
            throw new Error("Missing required fields: customerId, userId, items.");
        }

        
        // Insert new data into ORDER table
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

        // Check if response is empty or failed
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
    },

    async getOrderById(orderId) {
        const query = `
            SELECT 
                O.ORDER_ID AS orderId,
                O.CUSTOMER_ID AS customerId,
                O.PO_NUMBER AS poNumber,
                O.ORDER_STATUS AS status,
                O.DATE_CREATED AS createdDate,
                OD.PRODUCT_ID AS productId,
                OD.QUANTITY AS quantity,
                OD.PRICE AS price
            FROM dbo.[ORDER] O
            LEFT JOIN dbo.[ORDER_DETAILS] OD ON O.ORDER_ID = OD.ORDER_ID
            WHERE O.ORDER_ID = @orderId
        `;

        const result = await executeQuery(query, [{ name: "orderId", type: sql.Int, value: orderId }]);

        if (result.length === 0) {
            return null;
        }

        const order = {
            orderId: result[0].orderId,
            customerId: result[0].customerId,
            poNumber: result[0].poNumber,
            status: result[0].status,
            createdDate: result[0].createdDate,
            items: result.map(row => ({
                productId: row.productId,
                quantity: row.quantity,
                price: row.price
            }))
        };


        return order;
    },

    async getOrderDetails(orderId) {
        const result = await executeQuery(
            "SELECT od.PRODUCT_ID, od.QUANTITY, od.PRICE FROM dbo.ORDER_DETAILS od WHERE od.ORDER_ID = @orderId",
            [{ name: "orderId", type: sql.Int, value: orderId }]
        );
        return result.recordset;
    },
    
    async updateOrderStatus(orderId, status) {
        await executeQuery(
            "UPDATE dbo.[ORDER] SET ORDER_STATUS = @status WHERE ORDER_ID = @orderId",
            [
                { name: "orderId", type: sql.Int, value: orderId },
                { name: "status", type: sql.VarChar, value: status }
            ]
        );
    }
    
};
