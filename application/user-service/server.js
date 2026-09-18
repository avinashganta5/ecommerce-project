const express = require("express");
const mysql = require("mysql2/promise");
require("dotenv").config();

const app = express();

app.use(express.json());

const db = mysql.createPool({
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME
});


// Health check
app.get("/health", async (req, res) => {
    try {
        await db.query("SELECT 1");

        res.json({
            service: "user-service",
            status: "UP"
        });

    } catch (error) {
        res.status(500).json({
            service: "user-service",
            status: "DOWN"
        });
    }
});


// Get all users
app.get("/api/users", async (req, res) => {
    try {
        const [users] = await db.query(
            "SELECT * FROM users ORDER BY id DESC"
        );

        res.json(users);

    } catch (error) {
        console.error(error);

        res.status(500).json({
            message: "Failed to get users"
        });
    }
});


// Get user by ID
app.get("/api/users/:id", async (req, res) => {
    try {
        const [users] = await db.query(
            "SELECT * FROM users WHERE id = ?",
            [req.params.id]
        );

        if (users.length === 0) {
            return res.status(404).json({
                message: "User not found"
            });
        }

        res.json(users[0]);

    } catch (error) {
        console.error(error);

        res.status(500).json({
            message: "Failed to get user"
        });
    }
});


// Create user
app.post("/api/users", async (req, res) => {

    const { name, email } = req.body;

    if (!name || !email) {
        return res.status(400).json({
            message: "Name and email are required"
        });
    }

    try {

        const [result] = await db.query(
            "INSERT INTO users (name, email) VALUES (?, ?)",
            [name, email]
        );

        res.status(201).json({
            id: result.insertId,
            name: name,
            email: email
        });

    } catch (error) {

        console.error(error);

        if (error.code === "ER_DUP_ENTRY") {
            return res.status(409).json({
                message: "Email already exists"
            });
        }

        res.status(500).json({
            message: "Failed to create user"
        });
    }
});


app.listen(process.env.PORT, () => {
    console.log(
        `User Service running on port ${process.env.PORT}`
    );
});