const express = require("express");
const cors = require("cors");
const { createProxyMiddleware } = require("http-proxy-middleware");
require("dotenv").config();

const app = express();


// CORS
app.use(cors());


// Gateway health
app.get("/health", (req, res) => {
    res.json({
        service: "api-gateway",
        status: "UP"
    });
});


// User Service
app.use(
    createProxyMiddleware({
        target: process.env.USER_SERVICE_URL,
        changeOrigin: true,
        pathFilter: "/api/users"
    })
);


// Product Service
app.use(
    createProxyMiddleware({
        target: process.env.PRODUCT_SERVICE_URL,
        changeOrigin: true,
        pathFilter: "/api/products"
    })
);


// Order Service
app.use(
    createProxyMiddleware({
        target: process.env.ORDER_SERVICE_URL,
        changeOrigin: true,
        pathFilter: "/api/orders"
    })
);


// Unknown route
app.use((req, res) => {
    res.status(404).json({
        message: "Route not found"
    });
});


app.listen(process.env.PORT, () => {
    console.log(
        `API Gateway running on port ${process.env.PORT}`
    );
});