const { executeQuery } = require("../config/database");
const sql = require("mssql"); 

module.exports = {
    async getProductById(productId) {
        const query = "SELECT product_Id, name, price FROM dbo.[PRODUCT] WHERE product_Id = @productId";
        const params = [
            { name: "productId", type: sql.Int, value: productId }
        ];
        const result = await executeQuery(query, params);
        return result.length > 0 ? result[0] : null;
    }
};