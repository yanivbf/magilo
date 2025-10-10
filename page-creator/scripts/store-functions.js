// Store Functions for Online Store

// Check if user has subscription
function checkSubscription() {
    // Check localStorage for subscription status
    const subscription = localStorage.getItem('userSubscription');
    return subscription === 'active';
}

// Simulate subscription check
function simulateSubscriptionCheck() {
    // For demo purposes, randomly assign subscription status
    const hasSubscription = Math.random() > 0.3; // 70% chance of having subscription
    localStorage.setItem('userSubscription', hasSubscription ? 'active' : 'inactive');
    return hasSubscription;
}

// Add to cart functionality
function addToCart(productId, productName, price, image) {
    let cart = JSON.parse(localStorage.getItem('cart') || '[]');
    
    // Check if product already exists
    const existingItem = cart.find(item => item.id === productId);
    
    if (existingItem) {
        existingItem.quantity += 1;
    } else {
        cart.push({
            id: productId,
            name: productName,
            price: price,
            image: image,
            quantity: 1
        });
    }
    
    localStorage.setItem('cart', JSON.stringify(cart));
    updateCartDisplay();
    
    // Show success message
    showNotification(`${productName} נוסף לעגלה!`);
}

// Update cart display
function updateCartDisplay() {
    const cart = JSON.parse(localStorage.getItem('cart') || '[]');
    const cartCount = cart.reduce((total, item) => total + item.quantity, 0);
    
    // Update cart count badge
    const cartBadge = document.querySelector('.cart-count-badge');
    if (cartBadge) {
        cartBadge.textContent = cartCount;
        cartBadge.style.display = cartCount > 0 ? 'block' : 'none';
    }
    
    // Update cart sidebar if open
    updateCartSidebar();
}

// Update cart sidebar
function updateCartSidebar() {
    const cart = JSON.parse(localStorage.getItem('cart') || '[]');
    const cartItems = document.querySelector('.cart-items');
    
    if (cartItems) {
        cartItems.innerHTML = cart.map(item => `
            <div class="cart-item flex items-center justify-between p-3 border-b">
                <div class="flex items-center">
                    <img src="${item.image}" alt="${item.name}" class="w-12 h-12 object-cover rounded">
                    <div class="ml-3">
                        <h4 class="font-semibold">${item.name}</h4>
                        <p class="text-gray-600">₪${item.price}</p>
                    </div>
                </div>
                <div class="flex items-center">
                    <button onclick="updateQuantity('${item.id}', -1)" class="px-2 py-1 bg-gray-200 rounded">-</button>
                    <span class="mx-2">${item.quantity}</span>
                    <button onclick="updateQuantity('${item.id}', 1)" class="px-2 py-1 bg-gray-200 rounded">+</button>
                    <button onclick="removeFromCart('${item.id}')" class="ml-2 text-red-600">×</button>
                </div>
            </div>
        `).join('');
    }
    
    // Update total
    const total = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    const totalElement = document.querySelector('.cart-total');
    if (totalElement) {
        totalElement.textContent = `₪${total}`;
    }
}

// Update item quantity
function updateQuantity(productId, change) {
    let cart = JSON.parse(localStorage.getItem('cart') || '[]');
    const item = cart.find(item => item.id === productId);
    
    if (item) {
        item.quantity += change;
        if (item.quantity <= 0) {
            cart = cart.filter(item => item.id !== productId);
        }
    }
    
    localStorage.setItem('cart', JSON.stringify(cart));
    updateCartDisplay();
}

// Remove item from cart
function removeFromCart(productId) {
    let cart = JSON.parse(localStorage.getItem('cart') || '[]');
    cart = cart.filter(item => item.id !== productId);
    localStorage.setItem('cart', JSON.stringify(cart));
    updateCartDisplay();
}

// Quick buy functionality
function quickBuy(productId, productName, price, image) {
    // Check subscription first
    if (!checkSubscription()) {
        showSubscriptionPrompt();
        return;
    }
    
    // Add to cart and proceed to checkout
    addToCart(productId, productName, price, image);
    openCheckout();
}

// Show subscription prompt
function showSubscriptionPrompt() {
    const modal = document.createElement('div');
    modal.className = 'fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50';
    modal.innerHTML = `
        <div class="bg-white rounded-lg p-6 max-w-md mx-4">
            <h3 class="text-xl font-bold mb-4">מנוי נדרש</h3>
            <p class="text-gray-600 mb-6">על מנת לבצע קנייה, נדרש מנוי פעיל. האם ברצונך לרכוש מנוי?</p>
            <div class="flex gap-3">
                <button onclick="purchaseSubscription()" class="flex-1 bg-purple-600 text-white py-2 rounded-lg hover:bg-purple-700">
                    רכוש מנוי
                </button>
                <button onclick="this.closest('.fixed').remove()" class="flex-1 bg-gray-300 text-gray-700 py-2 rounded-lg hover:bg-gray-400">
                    ביטול
                </button>
            </div>
        </div>
    `;
    document.body.appendChild(modal);
}

// Purchase subscription (simulated)
function purchaseSubscription() {
    // Simulate subscription purchase
    localStorage.setItem('userSubscription', 'active');
    
    // Close modal
    document.querySelector('.fixed.inset-0').remove();
    
    // Show success message
    showNotification('המנוי נרכש בהצלחה! כעת תוכל לבצע קניות.');
}

// Open checkout
function openCheckout() {
    const cart = JSON.parse(localStorage.getItem('cart') || '[]');
    
    if (cart.length === 0) {
        showNotification('העגלה ריקה');
        return;
    }
    
    // Show checkout modal
    const modal = document.createElement('div');
    modal.className = 'fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50';
    
    const total = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    
    modal.innerHTML = `
        <div class="bg-white rounded-lg p-6 max-w-md mx-4">
            <h3 class="text-xl font-bold mb-4">סיכום הזמנה</h3>
            <div class="space-y-2 mb-4">
                ${cart.map(item => `
                    <div class="flex justify-between">
                        <span>${item.name} x${item.quantity}</span>
                        <span>₪${item.price * item.quantity}</span>
                    </div>
                `).join('')}
            </div>
            <div class="border-t pt-4 mb-4">
                <div class="flex justify-between font-bold">
                    <span>סה"כ:</span>
                    <span>₪${total}</span>
                </div>
            </div>
            <div class="mb-4">
                <label class="block text-sm font-medium mb-2">פרטי כרטיס אשראי</label>
                <input type="text" placeholder="מספר כרטיס" class="w-full border rounded p-2 mb-2">
                <input type="text" placeholder="תאריך תפוגה (MM/YY)" class="w-full border rounded p-2 mb-2">
                <input type="text" placeholder="CVV" class="w-full border rounded p-2">
            </div>
            <div class="flex gap-3">
                <button onclick="processPayment(${total})" class="flex-1 bg-green-600 text-white py-2 rounded-lg hover:bg-green-700">
                    שלם עכשיו
                </button>
                <button onclick="this.closest('.fixed').remove()" class="flex-1 bg-gray-300 text-gray-700 py-2 rounded-lg hover:bg-gray-400">
                    ביטול
                </button>
            </div>
        </div>
    `;
    document.body.appendChild(modal);
}

// Process payment (simulated)
function processPayment(amount) {
    // Simulate payment processing
    showNotification('מעבד תשלום...');
    
    setTimeout(() => {
        // Clear cart
        localStorage.removeItem('cart');
        updateCartDisplay();
        
        // Close modal
        document.querySelector('.fixed.inset-0').remove();
        
        // Show success
        showNotification(`תשלום של ₪${amount} בוצע בהצלחה!`);
    }, 2000);
}

// Show notification
function showNotification(message) {
    const notification = document.createElement('div');
    notification.className = 'fixed top-4 right-4 bg-green-600 text-white px-6 py-3 rounded-lg shadow-lg z-50';
    notification.textContent = message;
    document.body.appendChild(notification);
    
    setTimeout(() => {
        notification.remove();
    }, 3000);
}

// Toggle cart sidebar
function toggleCart() {
    const cartSidebar = document.querySelector('.cart-sidebar');
    if (cartSidebar) {
        cartSidebar.classList.toggle('open');
    }
}

// Initialize store functions
function initializeStore() {
    // Initialize subscription status
    if (!localStorage.getItem('userSubscription')) {
        simulateSubscriptionCheck();
    }
    
    // Initialize cart
    updateCartDisplay();
    
    // Add event listeners
    document.addEventListener('click', (e) => {
        if (e.target.matches('[data-action="add-to-cart"]')) {
            const product = e.target.closest('.product-item');
            const id = product.dataset.productId;
            const name = product.querySelector('.product-name').textContent;
            const price = parseFloat(product.querySelector('.product-price').textContent.replace('₪', ''));
            const image = product.querySelector('.product-image').src;
            
            addToCart(id, name, price, image);
        }
        
        if (e.target.matches('[data-action="quick-buy"]')) {
            const product = e.target.closest('.product-item');
            const id = product.dataset.productId;
            const name = product.querySelector('.product-name').textContent;
            const price = parseFloat(product.querySelector('.product-price').textContent.replace('₪', ''));
            const image = product.querySelector('.product-image').src;
            
            quickBuy(id, name, price, image);
        }
    });
}

// Export functions
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        checkSubscription,
        addToCart,
        updateCartDisplay,
        quickBuy,
        processPayment,
        initializeStore
    };
}

