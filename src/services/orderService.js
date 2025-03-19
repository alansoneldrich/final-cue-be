const orderDAO = require("../dao/orderDao");
const productDAO = require("../dao/productDao");

class OrderService {
    static async createOrder(customerId, userId, items) {
        // Validate request
        if (!customerId || !userId || !Array.isArray(items) || items.length === 0) {
            throw new Error("Invalid request: customerId, userId and items are required.");
        }
        
        // Validate items if existing and calculate total cost
        let totalCost = 0;
        for (const item of items) {
            const product = await productDAO.getProductById(item.productId);
            if (!product) throw new Error(`Product ${item.productId} not found.`);
            item.price = product.price;
            totalCost += product.price * item.quantity;
        }

        // Get the next available PO number
        const lastPoResult = await orderDAO.getAvailablePONumber();
        let newPoNumber = "PO-000000001";
        if (lastPoResult.length > 0) {
            const lastPo = lastPoResult[0].PO_NUMBER;
            const lastPoNum = parseInt(lastPo.replace("PO-", ""), 10) + 1;
            newPoNumber = `PO-${lastPoNum.toString().padStart(9, "0")}`;
        }

        return await orderDAO.insertOrder(customerId, userId, items, newPoNumber);
    }

    static async getOrders(filters) {
        return await orderDAO.getOrders(filters);
    }

    static async getOrderById(orderId) {
        if (!orderId) {
            throw new Error("Order ID is required.");
        }

        const order = await orderDAO.getOrderById(orderId);
        if (!order) {
            throw new Error(`Order ${orderId} not found.`);
        }

        return order;
    }
}

module.exports = OrderService;