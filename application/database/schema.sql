CREATE DATABASE IF NOT EXISTS shopsphere;

USE shopsphere;


-- =========================
-- USERS
-- =========================

CREATE TABLE IF NOT EXISTS users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(150) NOT NULL UNIQUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);


-- =========================
-- PRODUCTS
-- =========================

CREATE TABLE IF NOT EXISTS products (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(150) NOT NULL,
    description TEXT,
    price DECIMAL(10,2) NOT NULL,
    stock INT NOT NULL DEFAULT 0,
    category VARCHAR(100),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);


-- =========================
-- ORDERS
-- =========================

CREATE TABLE IF NOT EXISTS orders (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    product_id INT NOT NULL,
    quantity INT NOT NULL,
    total DECIMAL(10,2) NOT NULL,
    status VARCHAR(30) NOT NULL DEFAULT 'CREATED',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);


-- =========================
-- SAMPLE USERS
-- =========================

INSERT IGNORE INTO users
(name, email)
VALUES
('Avinash', 'avinash@example.com'),
('Rahul', 'rahul@example.com'),
('Kiran', 'kiran@example.com');


-- =========================
-- SAMPLE PRODUCTS
-- =========================

INSERT IGNORE INTO products
(name, description, price, stock, category)
VALUES
(
    'Laptop',
    'Developer laptop',
    75000.00,
    10,
    'Electronics'
),
(
    'Keyboard',
    'Mechanical keyboard',
    3500.00,
    25,
    'Accessories'
),
(
    'Mouse',
    'Wireless mouse',
    1500.00,
    40,
    'Accessories'
),
(
    'Monitor',
    '24 inch monitor',
    12000.00,
    15,
    'Electronics'
);