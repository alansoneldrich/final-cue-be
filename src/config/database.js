const sql = require("mssql");

const config = {
  user: process.env.DB_USER,
  password: process.env.DB_PASS,
  server: process.env.DB_HOST,
  database: process.env.DB_NAME,
  options: {
    encrypt: true,
    trustServerCertificate: true,
  },
};

const connectionPool = new sql.ConnectionPool(config)
  .connect()
  .then(pool => {
    return pool;
  })
  .catch(err => {
    throw (err);
  });

async function executeQuery(query, params = []) {
  try {
    const pool = await connectionPool;
    const request = pool.request();
    if (!Array.isArray(params)) {
      throw new Error("Invalid params: Expected an array");
    }
    params.forEach(({ name, type, value }) => {
      request.input(name, type, value);
    });

    const result = await request.query(query);
    return result.recordset;
  } catch (error) {
    console.error("Database Query Error:", error); // Logs the error
    throw new Error("Database Error: " + error.message);
  }
}

module.exports = { executeQuery, sql };