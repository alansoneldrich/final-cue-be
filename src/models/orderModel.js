class Order {
    constructor(orderId, customerId, userId, dateCreated, poNumber, orderStatus) {
        this.orderId = orderId;
        this.customerId = customerId;
        this.userId = userId;
        this.dateCreated = dateCreated;
        this.poNumber = poNumber;
        this.orderStatus = orderStatus;
        this.orderDetails = [];
    }

    addOrderDetail(orderDetail) {
        this.orderDetails.push(orderDetail);
    }
}

module.exports = Order;
