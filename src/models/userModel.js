class User {
    constructor(userId, firstName, lastName, email) {
        this.userId = userId;
        this.firstName = firstName;
        this.lastName = lastName;
        this.email = email;
        this.customers = [];
    }

    addCustomer(customer) {
        this.customers.push(customer);
    }
}

module.exports = User;
