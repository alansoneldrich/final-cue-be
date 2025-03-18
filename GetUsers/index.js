const createHandler = require("azure-function-express").createHandler;
const express = require("express");
const app = express();
const userService = require("../src/services/userService");

app.get("/api/users", async (req, res) => {
  try {
    const users = await userService.getAllUsers();
    res.json(users);
  } catch (error) {
    console.error("Error fetching users:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
});

module.exports = createHandler(app);
