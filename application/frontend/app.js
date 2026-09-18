const BASE_URL = "http://localhost:3000/api";

let allProducts = [];
let allUsers = [];


// =========================
// API HELPER
// =========================

async function api(endpoint, options = {}) {

    const response = await fetch(
        `${BASE_URL}${endpoint}`,
        options
    );

    const data = await response.json();

    if (!response.ok) {
        throw new Error(
            data.message || "Request failed"
        );
    }

    return data;
}


// =========================
// PRODUCTS
// =========================

async function loadProducts() {

    const container =
        document.getElementById("products-container");

    container.innerHTML =
        "<p>Loading products...</p>";

    try {

        allProducts = await api("/products");

        createCategoryList();

        displayProducts(allProducts);

    } catch (error) {

        container.innerHTML = `
            <p>
                Failed to load products:
                ${error.message}
            </p>
        `;
    }
}


// =========================
// CATEGORY FILTER
// =========================

function createCategoryList() {

    const categorySelect =
        document.getElementById("category");

    const categories = [
        ...new Set(
            allProducts
                .map(product => product.category)
                .filter(Boolean)
        )
    ];

    categorySelect.innerHTML = `
        <option value="all">
            All Categories
        </option>
    `;

    categories.forEach(category => {

        categorySelect.innerHTML += `
            <option value="${category}">
                ${category}
            </option>
        `;

    });
}


// =========================
// FILTER PRODUCTS
// =========================

function filterProducts() {

    const search =
        document
            .getElementById("search")
            .value
            .toLowerCase();

    const category =
        document.getElementById("category").value;

    const filteredProducts =
        allProducts.filter(product => {

            const matchesSearch =
                product.name
                    .toLowerCase()
                    .includes(search);

            const matchesCategory =
                category === "all" ||
                product.category === category;

            return matchesSearch &&
                   matchesCategory;
        });

    displayProducts(filteredProducts);
}


// =========================
// DISPLAY PRODUCTS
// =========================

function displayProducts(products) {

    const container =
        document.getElementById("products-container");

    if (products.length === 0) {

        container.innerHTML = `
            <p>
                No products found.
            </p>
        `;

        return;
    }

    container.innerHTML =
        products.map(product => {

            const outOfStock =
                product.stock <= 0;

            return `

                <div class="product-card">

                    <span class="product-category">
                        ${product.category || "General"}
                    </span>

                    <h3>
                        ${product.name}
                    </h3>

                    <p class="product-description">
                        ${product.description || "No description available."}
                    </p>

                    <div class="product-price">
                        ₹${Number(product.price).toLocaleString("en-IN")}
                    </div>

                    <p class="product-stock">
                        ${
                            outOfStock
                                ? "Out of stock"
                                : `${product.stock} items available`
                        }
                    </p>

                    <div class="order-controls">

                        <input
                            type="number"
                            class="quantity"
                            id="quantity-${product.id}"
                            value="1"
                            min="1"
                            max="${product.stock}"
                            ${outOfStock ? "disabled" : ""}
                        >

                        <button
                            class="order-button"
                            onclick="placeOrder(${product.id})"
                            ${outOfStock ? "disabled" : ""}
                        >
                            ${
                                outOfStock
                                    ? "Out of Stock"
                                    : "Buy Now"
                            }
                        </button>

                    </div>

                </div>

            `;

        }).join("");
}


// =========================
// PLACE ORDER
// =========================

async function placeOrder(productId) {

    const quantityInput =
        document.getElementById(
            `quantity-${productId}`
        );

    const quantity =
        Number(quantityInput.value);

    if (quantity <= 0) {

        alert("Quantity must be greater than 0");

        return;
    }


    // Ask which user is placing the order

    if (allUsers.length === 0) {

        await loadUsers();
    }

    const userId =
        prompt(
            `Enter User ID:\n\n` +
            allUsers
                .map(user =>
                    `${user.id} - ${user.name}`
                )
                .join("\n")
        );

    if (!userId) {
        return;
    }


    try {

        const order = await api(
            "/orders",
            {
                method: "POST",

                headers: {
                    "Content-Type":
                        "application/json"
                },

                body: JSON.stringify({
                    user_id: Number(userId),
                    product_id: productId,
                    quantity: quantity
                })
            }
        );


        alert(
            `Order #${order.id} created successfully!`
        );


        // Refresh products because stock changed

        await loadProducts();

        // Refresh orders

        await loadOrders();

        // Scroll to orders

        document
            .getElementById("orders")
            .scrollIntoView({
                behavior: "smooth"
            });

    } catch (error) {

        alert(
            `Order failed: ${error.message}`
        );
    }
}


// =========================
// USERS
// =========================

async function loadUsers() {

    const container =
        document.getElementById(
            "users-container"
        );

    container.innerHTML =
        "<p>Loading users...</p>";

    try {

        allUsers = await api("/users");

        if (allUsers.length === 0) {

            container.innerHTML =
                "<p>No users found.</p>";

            return;
        }


        container.innerHTML =
            allUsers.map(user => `

                <div class="user-card">

                    <h3>
                        ${user.name}
                    </h3>

                    <p>
                        ${user.email}
                    </p>

                    <p>
                        User ID: ${user.id}
                    </p>

                </div>

            `).join("");

    } catch (error) {

        container.innerHTML = `
            <p>
                Failed to load users:
                ${error.message}
            </p>
        `;
    }
}


// =========================
// ORDERS
// =========================

async function loadOrders() {

    const container =
        document.getElementById(
            "orders-container"
        );

    container.innerHTML =
        "<p>Loading orders...</p>";

    try {

        const orders =
            await api("/orders");

        if (orders.length === 0) {

            container.innerHTML =
                "<p>No orders found.</p>";

            return;
        }


        container.innerHTML = `

            <div class="order-table-wrapper">

                <table class="order-table">

                    <thead>

                        <tr>
                            <th>Order</th>
                            <th>User</th>
                            <th>Product</th>
                            <th>Quantity</th>
                            <th>Total</th>
                            <th>Status</th>
                        </tr>

                    </thead>

                    <tbody>

                        ${orders.map(order => `

                            <tr>

                                <td>
                                    #${order.id}
                                </td>

                                <td>
                                    User #${order.user_id}
                                </td>

                                <td>
                                    Product #${order.product_id}
                                </td>

                                <td>
                                    ${order.quantity}
                                </td>

                                <td>
                                    ₹${Number(order.total).toLocaleString("en-IN")}
                                </td>

                                <td class="status">
                                    ${order.status}
                                </td>

                            </tr>

                        `).join("")}

                    </tbody>

                </table>

            </div>
        `;

    } catch (error) {

        container.innerHTML = `
            <p>
                Failed to load orders:
                ${error.message}
            </p>
        `;
    }
}


// =========================
// INITIAL LOAD
// =========================

document.addEventListener(
    "DOMContentLoaded",
    () => {

        loadProducts();

        loadUsers();

        loadOrders();

    }
);