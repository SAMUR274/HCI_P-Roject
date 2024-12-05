// Sample product data - in a real application, this would come from a backend
// Product data with 20 daily commodities
const products = [
    { id: 1, name: 'Huggies Baby Wipes', price: 4.99, description: 'Gentle and safe wet wipes for babies', brand: 'Huggies', tag: ['alcohol-free', 'baby-friendly'], location: [85, 118], favorite: false }, 
    { id: 2, name: "Lay's Classic Potato Chips", price: 2.49, description: 'Crispy and delicious snack', brand: 'Lay’s', tag: ['snack', 'crispy'], location: [153, 85], favorite: false }, 
    { id: 3, name: 'Olay Facial Cleanser', price: 8.99, description: 'Deep cleansing with moisturizing effect', brand: 'Olay', tag: ['moisturizing', 'skin-care'], location: [95, 118], favorite: false }, 
    { id: 4, name: 'Pantene Shampoo', price: 5.99, description: 'For silky and strong hair', brand: 'Pantene', tag: ['hair-care', 'moisturizing'], location: [105, 118], favorite: false }, 
    { id: 5, name: 'Nestle KitKat', price: 1.49, description: 'Crispy wafer chocolate bar', brand: 'Nestle', tag: ['snack', 'chocolate'], location: [155, 93], favorite: false }, 
    { id: 6, name: 'Colgate Toothpaste', price: 3.99, description: 'Cavity protection and fresh breath', brand: 'Colgate', tag: ['oral-care', 'minty'], location: [155, 143], favorite: false }, 
    { id: 7, name: 'Dove Soap Bar', price: 2.99, description: 'Gentle cleansing soap with moisturizer', brand: 'Dove', tag: ['skin-care', 'hydrating'], location: [155, 160], favorite: false }, 
    { id: 8, name: 'Tide Laundry Detergent', price: 9.99, description: 'Powerful stain removal formula', brand: 'Tide', tag: ['laundry', 'stain-removal'], location: [155, 125], favorite: false }, 
    { id: 9, name: 'Quaker Oats', price: 4.49, description: 'Healthy breakfast choice', brand: 'Quaker', tag: ['breakfast', 'healthy'], location: [115, 160], favorite: false }, 
    { id: 10, name: 'Lindt Milk Chocolate', price: 3.49, description: 'Smooth and creamy milk chocolate', brand: 'Lindt', tag: ['snack', 'chocolate'], location: [115, 140], favorite: false }, 
    { id: 11, name: "Johnson's Baby Lotion", price: 5.49, description: 'Gentle moisturizer for baby skin', brand: 'Johnson’s', tag: ['baby-friendly', 'skin-care'], location: [115, 220], favorite: false }, 
    { id: 12, name: 'Kleenex Tissues', price: 1.99, description: 'Soft and absorbent facial tissues', brand: 'Kleenex', tag: ['soft', 'absorbent'], location: [125, 95], favorite: false }, 
    { id: 13, name: 'Coca-Cola (6-Pack)', price: 6.99, description: 'Refreshing carbonated beverage', brand: 'Coca-Cola', tag: ['beverage', 'carbonated'], location: [150, 110], favorite: false }, 
    { id: 14, name: 'Aquafina Bottled Water', price: 1.29, description: 'Pure and refreshing water', brand: 'Aquafina', tag: ['beverage', 'hydration'], location: [155, 127], favorite: false }, 
    { id: 15, name: 'Pringles Sour Cream Chips', price: 2.99, description: 'Flavored potato crisps in a can', brand: 'Pringles', tag: ['snack', 'flavored'], location: [115, 175], favorite: false }, 
    { id: 16, name: 'Gillette Razor', price: 7.99, description: 'Smooth and precise shaving', brand: 'Gillette', tag: ['shaving', 'precision'], location: [157, 215], favorite: false }, 
    { id: 17, name: 'Heinz Ketchup', price: 2.49, description: 'Classic tomato ketchup for every meal', brand: 'Heinz', tag: ['condiment', 'savory'], location: [155, 145], favorite: false }, 
    { id: 18, name: 'Febreze Air Freshener', price: 4.99, description: 'Eliminates odors and freshens the air', brand: 'Febreze', tag: ['freshener', 'air-care'], location: [155, 130], favorite: false }, 
    { id: 19, name: "Hershey's Milk Chocolate Bar", price: 1.29, description: 'Classic milk chocolate treat', brand: 'Hershey’s', tag: ['snack', 'chocolate'], location: [155, 178], favorite: false }, 
    { id: 20, name: 'Lipton Green Tea Bags', price: 5.99, description: 'Refreshing and healthy green tea', brand: 'Lipton', tag: ['beverage', 'healthy'], location: [45, 120], favorite: false }, 
];


let cart = []; // Now each cart item will include a quantity property

// Initialize the shopping page
function initializeShoppingPage() {
    displayProducts();
    updateCart();
}

// Search products by name, brand, or tag
function searchProducts() {
    const query = document.getElementById('searchBox').value.toLowerCase();
    const productGrid = document.getElementById('productGrid');

    // Filter products that match the search query
    const filteredProducts = products.filter(product =>
        product.name.toLowerCase().includes(query) ||
        product.brand.toLowerCase().includes(query) ||
        product.tag.some(tag => tag.toLowerCase().includes(query))
    );

    // Display filtered products
    productGrid.innerHTML = filteredProducts.map(product => `
        <div class="product-card">
            <h3>${product.name}</h3>
            <p class="price">$${product.price.toFixed(2)}</p>
            <p>${product.description}</p>
            <button class="add-to-cart-btn" onclick="addToCart(${product.id})">Add to Cart</button>
        </div>
    `).join('');
}

// Add event listener to search button
document.getElementById('searchButton').addEventListener('click', searchProducts);


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
        const cartItem = cart.find(item => item.id === productId);
        if (cartItem) {
            cartItem.quantity++; // Increase quantity if the product is already in the cart
        } else {
            cart.push({ ...product, quantity: 1 }); // Add product with quantity 1 if new
        }
        updateCart(); // Refresh cart display
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
    const totalPriceElement = document.getElementById('totalPrice');
    
    cartItems.innerHTML = cart.map((item, index) => `
        <li class="cart-item">
            <div class="cart-item-info">
                <span>${item.name} - $${item.price.toFixed(2)} x ${item.quantity}</span>
                <span>Total: $${(item.price * item.quantity).toFixed(2)}</span>
            </div>
            <div class="cart-item-controls">
                <button class="quantity-btn" onclick="changeQuantity(${index}, -1)">-</button>
                <span>${item.quantity}</span>
                <button class="quantity-btn" onclick="changeQuantity(${index}, 1)">+</button>
                <button class="remove-btn" onclick="removeFromCart(${index})">
                    <i class="fas fa-trash-alt"></i>
                </button>
            </div>
        </li>
    `).join('');
    
    // Update total items count
    totalItems.textContent = cart.reduce((total, item) => total + item.quantity, 0);
    
    // Update total price
    const totalPrice = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
    totalPriceElement.textContent = `$${totalPrice.toFixed(2)}`;
}


function changeQuantity(index, change) {
    cart[index].quantity += change;
    if (cart[index].quantity <= 0) {
        cart.splice(index, 1); // Remove item if quantity is zero or less
    }
    updateCart(); // Refresh cart display
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
// Populate filter dropdowns with unique brands and tags
function initializeFilters() {
    const brands = [...new Set(products.map(product => product.brand))];
    const tags = [...new Set(products.flatMap(product => product.tag))];

    const brandSelect = document.getElementById('filterBrand');
    const tagSelect = document.getElementById('filterTag');

    // Add unique brands to brand filter
    brands.forEach(brand => {
        const option = document.createElement('option');
        option.value = brand;
        option.textContent = brand;
        brandSelect.appendChild(option);
    });

    // Add unique tags to tag filter
    tags.forEach(tag => {
        const option = document.createElement('option');
        option.value = tag;
        option.textContent = tag;
        tagSelect.appendChild(option);
    });
}

// Apply filters to product list
function applyFilters() {
    const priceFilter = document.getElementById('filterPrice').value;
    const minPrice = parseFloat(document.getElementById('minPrice').value) || 0;
    const maxPrice = parseFloat(document.getElementById('maxPrice').value) || Infinity;
    const brandFilter = document.getElementById('filterBrand').value;
    const tagFilter = document.getElementById('filterTag').value;
    const favoriteFilter = document.getElementById('filterFavorite').value;

    let filteredProducts = [...products];

    // Filter by price range
    if (minPrice || maxPrice < Infinity) {
        filteredProducts = filteredProducts.filter(product => product.price >= minPrice && product.price <= maxPrice);
    }

    // Sort by price
    if (priceFilter === 'low-to-high') {
        filteredProducts.sort((a, b) => a.price - b.price);
    } else if (priceFilter === 'high-to-low') {
        filteredProducts.sort((a, b) => b.price - a.price);
    }

    // Filter by brand
    if (brandFilter) {
        filteredProducts = filteredProducts.filter(product => product.brand === brandFilter);
    }

    // Filter by tag
    if (tagFilter) {
        filteredProducts = filteredProducts.filter(product => product.tag.includes(tagFilter));
    }

    // Filter by favorite status
    if (favoriteFilter === 'favorite') {
        filteredProducts = filteredProducts.filter(product => product.favorite);
    } else if (favoriteFilter === 'unfavorite') {
        filteredProducts = filteredProducts.filter(product => !product.favorite);
    }

    // Display the filtered products
    displayFilteredProducts(filteredProducts);
}

// Display products in the grid
function displayProducts(productsToDisplay = products) {
    const productGrid = document.getElementById('productGrid');
    productGrid.innerHTML = productsToDisplay.map(product => `
        <div class="product-card">
            <img src="https://via.placeholder.com/100" alt="${product.name}" />
            <div class="product-details">
                <h3>${product.name}</h3>
                <p class="price">$${product.price.toFixed(2)}</p>
                <p>${product.description}</p>
                <button class="add-to-cart-btn" onclick="addToCart(${product.id})">Add to Cart</button>
            </div>
            <button class="favorite-btn ${product.favorite ? 'favorited' : ''}" onclick="toggleFavorite(${product.id})">★</button>
        </div>
    `).join('');
}


// Toggle favorite status for a product
function toggleFavorite(productId) {
    const product = products.find(p => p.id === productId);
    if (product) {
        product.favorite = !product.favorite;
        displayProducts(); // Re-render the product grid to reflect changes
    }
}

// Initialize the page when loaded
document.addEventListener('DOMContentLoaded', () => {
    initializeShoppingPage();
    displayProducts(); // Display all products initially

    // Back button functionality
    document.getElementById('backButton').addEventListener('click', () => {
        window.location.href = '../leaflet-store-locator/index.html';
    });
});

