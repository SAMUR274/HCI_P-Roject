// Sample product data - in a real application, this would come from a backend
const products = [
    { id: 1, name: 'Laptop', price: 999.99, location: [100, 150] },
    { id: 2, name: 'Tablet', price: 499.99, location: [200, 100] },
    { id: 3, name: 'Smartphone', price: 699.99, location: [150, 200] },
    { id: 4, name: 'Headphones', price: 199.99, location: [120, 180] },
    { id: 5, name: 'Smart Watch', price: 299.99, location: [180, 160] },
    { id: 6, name: 'Camera', price: 799.99, location: [220, 140] }
];

let cart = [];

// Initialize the shopping page
function initializeShoppingPage() {
    displayProducts();
    updateCart();
}

// Display products in the grid
function displayProducts() {
    const productGrid = document.getElementById('productGrid');
    productGrid.innerHTML = products.map(product => `
        <div class="product-card">
            <h3>${product.name}</h3>
            <p class="price">$${product.price.toFixed(2)}</p>
            <button class="add-to-cart-btn" onclick="addToCart(${product.id})">
                Add to Cart
            </button>
        </div>
    `).join('');
}

// Add item to cart
function addToCart(productId) {
    const product = products.find(p => p.id === productId);
    if (product) {
        cart.push({ ...product });
        updateCart();
    }
}

// Remove item from cart
function removeFromCart(index) {
    cart.splice(index, 1);
    updateCart();
}

// Update cart display
function updateCart() {
    const cartItems = document.getElementById('cartItems');
    const totalItems = document.getElementById('totalItems');
    
    cartItems.innerHTML = cart.map((item, index) => `
        <li class="cart-item">
            <span>${item.name} - $${item.price.toFixed(2)}</span>
            <button class="remove-btn" onclick="removeFromCart(${index})">Remove</button>
        </li>
    `).join('');
    
    totalItems.textContent = cart.length;
}

// Handle "DONE" button click
function proceedToFloorMap() {
    // Save cart items to localStorage
    const cartData = cart.map(item => ({
        name: item.name,
        location: item.location
    }));
    
    localStorage.setItem('selectedItems', JSON.stringify(cartData));
    
    // Redirect to floor map page
    window.location.href = 'floor-map.html';
}

// Initialize the page when loaded
document.addEventListener('DOMContentLoaded', initializeShoppingPage); 