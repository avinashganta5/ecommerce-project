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
            service: "order-service",
            status: "UP"
        });

    } catch (error) {
        res.status(500).json({
            service: "order-service",
            status: "DOWN"
        });
    }
});


// Get all orders
app.get("/api/orders", async (req, res) => {
    try {

        const [orders] = await db.query(
            "SELECT * FROM orders ORDER BY id DESC"
        );

        res.json(orders);

    } catch (error) {

        console.error(error);

        res.status(500).json({
            message: "Failed to get orders"
        });
    }
});


// Get order by ID
app.get("/api/orders/:id", async (req, res) => {
    try {

        const [orders] = await db.query(
            "SELECT * FROM orders WHERE id = ?",
            [req.params.id]
        );

        if (orders.length === 0) {
            return res.status(404).json({
                message: "Order not found"
            });
        }

        res.json(orders[0]);

    } catch (error) {

        console.error(error);

        res.status(500).json({
            message: "Failed to get order"
        });
    }
});


// Create order
app.post("/api/orders", async (req, res) => {

    const {
        user_id,
        product_id,
        quantity
    } = req.body;

    if (!user_id || !product_id || !quantity) {
        return res.status(400).json({
            message: "user_id, product_id and quantity are required"
        });
    }

    if (quantity <= 0) {
        return res.status(400).json({
            message: "Quantity must be greater than 0"
        });
    }

    try {

        // Check user
        const [users] = await db.query(
            "SELECT id FROM users WHERE id = ?",
            [user_id]
        );

        if (users.length === 0) {
            return res.status(404).json({
                message: "User not found"
            });
        }


        // Check product
        const [products] = await db.query(
            "SELECT id, name, price, stock FROM products WHERE id = ?",
            [product_id]
        );

        if (products.length === 0) {
            return res.status(404).json({
                message: "Product not found"
            });
        }

        const product = products[0];


        // Check stock
        if (product.stock < quantity) {
            return res.status(400).json({
                message: "Insufficient stock"
            });
        }


        // Calculate total
        const total = Number(product.price) * quantity;


        // Create order
        const [result] = await db.query(
            `INSERT INTO orders
            (user_id, product_id, quantity, total, status)
            VALUES (?, ?, ?, ?, ?)`,
            [
                user_id,
                product_id,
                quantity,
                total,
                "CREATED"
            ]
        );


        // Reduce stock
        await db.query(
            "UPDATE products SET stock = stock - ? WHERE id = ?",
            [quantity, product_id]
        );


        res.status(201).json({
            id: result.insertId,
            user_id,
            product_id,
            quantity,
            total,
            status: "CREATED"
        });

    } catch (error) {

        console.error(error);

        res.status(500).json({
            message: "Failed to create order"
        });
    }
});


// Update order status
app.patch("/api/orders/:id/status", async (req, res) => {

    const { status } = req.body;

    const allowedStatuses = [
        "CREATED",
        "CONFIRMED",
        "SHIPPED",
        "DELIVERED",
        "CANCELLED"
    ];

    if (!allowedStatuses.includes(status)) {
        return res.status(400).json({
            message: "Invalid order status"
        });
    }

    try {

        const [result] = await db.query(
            "UPDATE orders SET status = ? WHERE id = ?",
            [status, req.params.id]
        );

        if (result.affectedRows === 0) {
            return res.status(404).json({
                message: "Order not found"
            });
        }

        res.json({
            message: "Order status updated successfully",
            status
        });

    } catch (error) {

        console.error(error);

        res.status(500).json({
            message: "Failed to update order status"
        });
    }
});


app.listen(process.env.PORT, () => {
    console.log(
        `Order Service running on port ${process.env.PORT}`
    );
});