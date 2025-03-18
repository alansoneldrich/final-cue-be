const User = require("../models/userModel");
const Customer = require("../models/customerModel");
const Role = require("../models/roleModel");
const userDAO = require("../dao/userDao");

class UserService {
    static mapUsers(rows) {
        const usersMap = new Map();

        rows.forEach(row => {
            if (!usersMap.has(row.userId)) {
                usersMap.set(row.userId, new User(row.userId, row.firstName, row.lastName, row.email));
            }

            if (row.customerId) {
                const user = usersMap.get(row.userId);
                const role = new Role(row.roleId, row.roleName);
                const customer = new Customer(row.customerId, row.customerName, role);
                user.addCustomer(customer);
            }
        });

        return Array.from(usersMap.values());
    }

    static async getAllUsers() {
        try {
            const rawUsers = await userDAO.getUsers();
            return this.mapUsers(rawUsers);
        } catch (error) {
            console.error("Error in getUsers:", error);
            throw error;
        }
    }
}

module.exports = UserService;
