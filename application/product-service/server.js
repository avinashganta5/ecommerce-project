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
            service: "product-service",
            status: "UP"
        });

    } catch (error) {
        res.status(500).json({
            service: "product-service",
            status: "DOWN"
        });
    }
});


// Get all products
app.get("/api/products", async (req, res) => {
    try {
        const [products] = await db.query(
            "SELECT * FROM products ORDER BY id DESC"
        );

        res.json(products);

    } catch (error) {
        console.error(error);

        res.status(500).json({
            message: "Failed to get products"
        });
    }
});


// Get product by ID
app.get("/api/products/:id", async (req, res) => {
    try {
        const [products] = await db.query(
            "SELECT * FROM products WHERE id = ?",
            [req.params.id]
        );

        if (products.length === 0) {
            return res.status(404).json({
                message: "Product not found"
            });
        }

        res.json(products[0]);

    } catch (error) {
        console.error(error);

        res.status(500).json({
            message: "Failed to get product"
        });
    }
});


// Create product
app.post("/api/products", async (req, res) => {

    const {
        name,
        description,
        price,
        stock,
        category
    } = req.body;

    if (!name || price === undefined || stock === undefined) {
        return res.status(400).json({
            message: "Name, price and stock are required"
        });
    }

    try {

        const [result] = await db.query(
            `INSERT INTO products
            (name, description, price, stock, category)
            VALUES (?, ?, ?, ?, ?)`,
            [
                name,
                description || null,
                price,
                stock,
                category || null
            ]
        );

        res.status(201).json({
            id: result.insertId,
            name,
            description: description || null,
            price,
            stock,
            category: category || null
        });

    } catch (error) {

        console.error(error);

        res.status(500).json({
            message: "Failed to create product"
        });
    }
});


// Update product
app.put("/api/products/:id", async (req, res) => {

    const {
        name,
        description,
        price,
        stock,
        category
    } = req.body;

    try {

        const [result] = await db.query(
            `UPDATE products
             SET name = ?,
                 description = ?,
                 price = ?,
                 stock = ?,
                 category = ?
             WHERE id = ?`,
            [
                name,
                description || null,
                price,
                stock,
                category || null,
                req.params.id
            ]
        );

        if (result.affectedRows === 0) {
            return res.status(404).json({
                message: "Product not found"
            });
        }

        res.json({
            message: "Product updated successfully"
        });

    } catch (error) {

        console.error(error);

        res.status(500).json({
            message: "Failed to update product"
        });
    }
});


// Delete product
app.delete("/api/products/:id", async (req, res) => {

    try {

        const [result] = await db.query(
            "DELETE FROM products WHERE id = ?",
            [req.params.id]
        );

        if (result.affectedRows === 0) {
            return res.status(404).json({
                message: "Product not found"
            });
        }

        res.json({
            message: "Product deleted successfully"
        });

    } catch (error) {

        console.error(error);

        res.status(500).json({
            message: "Failed to delete product"
        });
    }
});


app.listen(process.env.PORT, () => {
    console.log(
        `Product Service running on port ${process.env.PORT}`
    );
});