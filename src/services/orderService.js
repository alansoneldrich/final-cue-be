const orderDAO = require("../dao/orderDao");
const productDAO = require("../dao/productDao");

class OrderService {
    static async createOrder(customerId, userId, items) {
        if (!customerId || !userId || !Array.isArray(items) || items.length === 0) {
            throw new Error("Invalid request: customerId, userId and items are required.");
        }
        
        let totalCost = 0;
        for (const item of items) {
            const product = await productDAO.getProductById(item.productId);
            if (!product) throw new Error(`Product ${item.productId} not found.`);
            item.price = product.price;
            totalCost += product.price * item.quantity;
        }

        return await orderDAO.insertOrder(customerId, userId, items);
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