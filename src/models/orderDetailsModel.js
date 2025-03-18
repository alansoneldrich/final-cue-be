class OrderDetails {
    constructor(orderId, productId, quantity, price) {
        this.orderId = orderId;
        this.productId = productId;
        this.quantity = quantity;
        this.price = price;
    }
}

module.exports = OrderDetails;
