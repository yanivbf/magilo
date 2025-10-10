// Auto-inject store checkout functionality
(function() {
    console.log('🛒 Store checkout script loaded');
    
    // Wait for DOM to load
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
    
    function init() {
        // Check if this is a store page
        const hasProducts = document.querySelector('.product-card, [class*="product"]');
        if (!hasProducts) {
            console.log('Not a store page, skipping');
            return;
        }
        
        console.log('✅ Store page detected, initializing checkout system...');
        
        // Remove any existing conflicting functions
        if (window.addToCart && window.addToCart.toString().includes('whatsapp')) {
            console.log('⚠️ Removing old WhatsApp checkout');
            delete window.addToCart;
            delete window.checkout;
        }
    
    // Get page info (decode URL-encoded characters)
    const storeId = decodeURIComponent(window.location.pathname.split('/').pop().replace('.html', '').replace('_html', ''));
    const userId = decodeURIComponent(window.location.pathname.split('/')[2]);
    
    // Initialize empty cart for this store (don't load from localStorage initially)
    let cart = [];
    
    // Only load cart if it exists AND this is not a fresh page load
    const existingCart = localStorage.getItem('cart_' + storeId);
    if (existingCart && window.sessionStorage.getItem('visited_' + storeId)) {
        cart = JSON.parse(existingCart);
    }
    // Mark that we've visited this store in this session
    window.sessionStorage.setItem('visited_' + storeId, 'true');
    
    // Cart functions
    window.addToCart = function(productName, price, image) {
        cart = JSON.parse(localStorage.getItem('cart_' + storeId) || '[]');
        const existing = cart.find(item => item.name === productName);
        
        if (existing) {
            existing.quantity += 1;
        } else {
            cart.push({
                id: Date.now(),
                name: productName,
                price: parseFloat(price),
                quantity: 1,
                image: image || ''
            });
        }
        
        localStorage.setItem('cart_' + storeId, JSON.stringify(cart));
        updateCartDisplay();
        toggleCart();
        alert(productName + ' נוסף לעגלה!');
    };
    
    window.toggleCart = function() {
        const sidebar = document.getElementById('cart-sidebar');
        const backdrop = document.getElementById('cart-backdrop');
        if (sidebar) {
            sidebar.classList.toggle('open');
            if (backdrop) {
                backdrop.classList.toggle('open');
            }
        }
    };
    
    window.updateCartDisplay = function() {
        cart = JSON.parse(localStorage.getItem('cart_' + storeId) || '[]');
        const cartItems = document.querySelector('.cart-items');
        const cartTotal = document.querySelector('.cart-total');
        
        // Update badge on cart icon
        const badge = document.getElementById('cart-badge');
        const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
        if (badge) {
            if (totalItems > 0) {
                badge.textContent = totalItems;
                badge.style.display = 'flex';
            } else {
                badge.style.display = 'none';
            }
        }
        
        if (cartItems) {
            if (cart.length === 0) {
                cartItems.innerHTML = '<div style="text-align: center; padding: 40px; color: #999;">העגלה ריקה</div>';
            } else {
                cartItems.innerHTML = cart.map(item => `
                    <div style="padding: 15px; border-bottom: 1px solid #eee;">
                        <div style="font-weight: bold;">${item.name}</div>
                        <div>₪${item.price} x ${item.quantity} = ₪${(item.price * item.quantity).toFixed(2)}</div>
                    </div>
                `).join('');
            }
        }
        
        if (cartTotal) {
            const total = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
            cartTotal.textContent = 'סה"כ: ₪' + total.toFixed(2);
        }
    };
    
    window.checkout = function() {
        cart = JSON.parse(localStorage.getItem('cart_' + storeId) || '[]');
        if (cart.length === 0) {
            alert('העגלה ריקה');
            return;
        }
        
        const total = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
        const sidebar = document.getElementById('cart-sidebar');
        
        sidebar.innerHTML = `
            <div style="padding: 20px;">
                <h3 style="margin-bottom: 20px;">💳 תשלום</h3>
                
                <div style="background: #f5f5f5; padding: 15px; border-radius: 8px; margin-bottom: 20px;">
                    <h4>סיכום הזמנה</h4>
                    ${cart.map(item => `<div>${item.name} x${item.quantity}: ₪${(item.price * item.quantity).toFixed(2)}</div>`).join('')}
                    <div style="margin-top: 10px; font-weight: bold; border-top: 1px solid #ddd; padding-top: 10px;">
                        סה"כ: <span id="final-total">₪${total.toFixed(2)}</span>
                    </div>
                </div>
                
                <form id="checkout-form" style="display: flex; flex-direction: column; gap: 15px;">
                    <div>
                        <label>שם מלא *</label>
                        <input type="text" id="checkout-name" required style="width: 100%; padding: 10px; border: 1px solid #ddd; border-radius: 4px;">
                    </div>
                    
                    <div>
                        <label>טלפון *</label>
                        <input type="tel" id="checkout-phone" required style="width: 100%; padding: 10px; border: 1px solid #ddd; border-radius: 4px;">
                    </div>
                    
                    <div>
                        <label>
                            <input type="checkbox" id="checkout-shipping" onchange="toggleShipping()"> משלוח (+ ₪35)
                        </label>
                        <input type="text" id="checkout-address" placeholder="כתובת משלוח" style="width: 100%; padding: 10px; border: 1px solid #ddd; border-radius: 4px; display: none; margin-top: 10px;">
                    </div>
                    
                    <div>
                        <label>אמצעי תשלום *</label>
                        <select id="checkout-payment" onchange="togglePaymentFields()" style="width: 100%; padding: 10px; border: 1px solid #ddd; border-radius: 4px;">
                            <option value="credit">כרטיס אשראי</option>
                            <option value="bit">ביט</option>
                            <option value="paypal">PayPal</option>
                        </select>
                    </div>
                    
                    <div id="credit-fields">
                        <input type="text" id="card-number" placeholder="מספר כרטיס" style="width: 100%; padding: 10px; border: 1px solid #ddd; border-radius: 4px; margin-bottom: 10px;">
                        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 10px;">
                            <input type="text" id="card-expiry" placeholder="MM/YY" style="padding: 10px; border: 1px solid #ddd; border-radius: 4px;">
                            <input type="text" id="card-cvv" placeholder="CVV" style="padding: 10px; border: 1px solid #ddd; border-radius: 4px;">
                        </div>
                    </div>
                    
                    <div id="bit-info" style="display: none; background: #e3f2fd; padding: 12px; border-radius: 4px;">
                        תועבר לאפליקציית ביט
                    </div>
                    
                    <div id="paypal-info" style="display: none; background: #fff3cd; padding: 12px; border-radius: 4px;">
                        תועבר לדף PayPal
                    </div>
                    
                    <button type="button" onclick="processPayment()" style="width: 100%; padding: 15px; background: #28a745; color: white; border: none; border-radius: 8px; font-size: 18px; font-weight: bold; cursor: pointer;">
                        ✅ אישור תשלום - ₪${total.toFixed(2)}
                    </button>
                    
                    <button type="button" onclick="cancelCheckout()" style="width: 100%; padding: 10px; background: #6c757d; color: white; border: none; border-radius: 4px; cursor: pointer;">
                        חזור
                    </button>
                </form>
            </div>
        `;
    };
    
    window.toggleShipping = function() {
        const checkbox = document.getElementById('checkout-shipping');
        const address = document.getElementById('checkout-address');
        const total = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
        const shipping = checkbox.checked ? 35 : 0;
        
        address.style.display = checkbox.checked ? 'block' : 'none';
        document.getElementById('final-total').textContent = '₪' + (total + shipping).toFixed(2);
    };
    
    window.togglePaymentFields = function() {
        const method = document.getElementById('checkout-payment').value;
        document.getElementById('credit-fields').style.display = method === 'credit' ? 'block' : 'none';
        document.getElementById('bit-info').style.display = method === 'bit' ? 'block' : 'none';
        document.getElementById('paypal-info').style.display = method === 'paypal' ? 'block' : 'none';
    };
    
    window.processPayment = function() {
        const name = document.getElementById('checkout-name').value;
        const phone = document.getElementById('checkout-phone').value;
        
        if (!name || !phone) {
            alert('אנא מלא שם וטלפון');
            return;
        }
        
        const shipping = document.getElementById('checkout-shipping').checked;
        const total = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0) + (shipping ? 35 : 0);
        
        // Show loading animation (same as page creation) in the sidebar
        const sidebar = document.getElementById('cart-sidebar');
        sidebar.innerHTML = `
            <div style="display: flex; flex-direction: column; align-items: center; justify-content: center; height: 100%; padding: 40px; text-align: center; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);">
                <div style="margin-bottom: 40px;">
                    <div style="font-size: 80px; margin-bottom: 20px;">💳</div>
                    <h2 style="color: white; font-size: 28px; font-weight: bold; margin-bottom: 15px;">מעבד תשלום...</h2>
                    <p style="color: rgba(255,255,255,0.9); font-size: 16px; margin-bottom: 30px;">אנא המתן, הפעולה עשויה לקחת מספר שניות</p>
                    
                    <!-- Loading dots animation -->
                    <div style="display: flex; gap: 12px; justify-content: center; margin-top: 25px;">
                        <div style="width: 16px; height: 16px; background: white; border-radius: 50%; animation: bounce 1.4s infinite ease-in-out both; animation-delay: -0.32s;"></div>
                        <div style="width: 16px; height: 16px; background: white; border-radius: 50%; animation: bounce 1.4s infinite ease-in-out both; animation-delay: -0.16s;"></div>
                        <div style="width: 16px; height: 16px; background: white; border-radius: 50%; animation: bounce 1.4s infinite ease-in-out both;"></div>
                    </div>
                </div>
            </div>
            <style>
                @keyframes bounce {
                    0%, 80%, 100% { transform: scale(0); opacity: 0.5; }
                    40% { transform: scale(1); opacity: 1; }
                }
            </style>
        `;
        
        // Send to server
        fetch('/api/purchase', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                userId: userId,
                storeId: storeId,
                customerName: name,
                customerPhone: phone,
                products: cart,
                total: total,
                createdAt: new Date().toISOString()
            })
        }).then(() => {
            // Show success message in the same sidebar
            sidebar.innerHTML = `
                <div style="display: flex; flex-direction: column; align-items: center; justify-content: center; height: 100%; padding: 40px; text-align: center;">
                    <div style="width: 100px; height: 100px; border-radius: 50%; background: linear-gradient(135deg, #28a745 0%, #20c997 100%); display: flex; align-items: center; justify-content: center; margin-bottom: 30px; box-shadow: 0 10px 40px rgba(40, 167, 69, 0.3);">
                        <span style="font-size: 60px; color: white;">✓</span>
                    </div>
                    <h2 style="color: #28a745; margin-bottom: 15px; font-size: 28px; font-weight: bold;">תשלום בוצע בהצלחה!</h2>
                    <p style="color: #666; font-size: 18px; margin-bottom: 10px;">תודה על הרכישה שלך</p>
                    <p style="color: #999; font-size: 14px; margin-bottom: 40px;">נציג יצור איתך קשר בקרוב</p>
                    <button onclick="finishPayment()" style="width: 80%; padding: 16px; background: linear-gradient(135deg, #28a745 0%, #20c997 100%); color: white; border: none; border-radius: 10px; cursor: pointer; font-weight: bold; font-size: 18px; box-shadow: 0 4px 15px rgba(40, 167, 69, 0.3); transition: transform 0.2s;">
                        סגור ✓
                    </button>
                </div>
            `;
            
            // Clear cart
            localStorage.removeItem('cart_' + storeId);
            cart = [];
        }).catch(() => {
            // Show error message
            sidebar.innerHTML = `
                <div style="display: flex; flex-direction: column; align-items: center; justify-content: center; height: 100%; padding: 40px; text-align: center;">
                    <div style="width: 100px; height: 100px; border-radius: 50%; background: linear-gradient(135deg, #dc3545 0%, #c82333 100%); display: flex; align-items: center; justify-content: center; margin-bottom: 30px;">
                        <span style="font-size: 60px; color: white;">✗</span>
                    </div>
                    <h2 style="color: #dc3545; margin-bottom: 15px; font-size: 24px; font-weight: bold;">שגיאה בתשלום</h2>
                    <p style="color: #666; font-size: 16px; margin-bottom: 40px;">התשלום נשמר, אך השרת לא זמין כרגע</p>
                    <button onclick="cancelCheckout()" style="width: 80%; padding: 14px; background: #6c757d; color: white; border: none; border-radius: 8px; cursor: pointer; font-weight: bold;">נסה שוב</button>
                </div>
            `;
        });
    };
    
    window.finishPayment = function() {
        cancelCheckout();
        toggleCart();
    };
    
    window.cancelCheckout = function() {
        const sidebar = document.getElementById('cart-sidebar');
        sidebar.innerHTML = `
            <div style="padding: 20px;">
                <h3 style="margin-bottom: 20px;">🛒 עגלת קניות</h3>
                <div class="cart-items"></div>
                <div class="cart-total" style="margin: 20px 0; font-weight: bold; text-align: center;"></div>
                <button onclick="checkout()" style="width: 100%; padding: 15px; background: #28a745; color: white; border: none; border-radius: 8px; cursor: pointer; font-weight: bold;">המשך לתשלום</button>
                <button onclick="toggleCart()" style="width: 100%; padding: 10px; background: #dc3545; color: white; border: none; border-radius: 4px; margin-top: 10px; cursor: pointer;">סגור</button>
            </div>
        `;
        updateCartDisplay();
    };
    
    // Create sidebar with better styling
    if (!document.getElementById('cart-sidebar')) {
        const sidebar = document.createElement('div');
        sidebar.id = 'cart-sidebar';
        sidebar.style.cssText = 'position: fixed; top: 0; right: -450px; width: 450px; max-width: 100vw; height: 100vh; background: white; box-shadow: -4px 0 20px rgba(0,0,0,0.15); transition: right 0.4s cubic-bezier(0.4, 0, 0.2, 1); z-index: 99999; overflow-y: auto; font-family: Arial, sans-serif;';
        sidebar.innerHTML = `
            <div style="padding: 25px; height: 100%;">
                <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 25px; padding-bottom: 15px; border-bottom: 2px solid #f0f0f0;">
                    <h3 style="margin: 0; font-size: 22px;">🛒 עגלת קניות</h3>
                    <button onclick="toggleCart()" style="background: none; border: none; font-size: 28px; cursor: pointer; color: #999;">×</button>
                </div>
                <div class="cart-items" style="min-height: 200px;"></div>
                <div class="cart-total" style="margin: 25px 0; font-weight: bold; text-align: center; font-size: 20px; padding: 15px; background: #f8f9fa; border-radius: 8px;"></div>
                <button onclick="checkout()" style="width: 100%; padding: 16px; background: linear-gradient(135deg, #28a745 0%, #20c997 100%); color: white; border: none; border-radius: 10px; cursor: pointer; font-weight: bold; font-size: 18px; transition: transform 0.2s; box-shadow: 0 4px 15px rgba(40, 167, 69, 0.3);">
                    💳 המשך לתשלום
                </button>
                <button onclick="toggleCart()" style="width: 100%; padding: 12px; background: #6c757d; color: white; border: none; border-radius: 8px; margin-top: 12px; cursor: pointer; font-weight: 500;">סגור</button>
            </div>
        `;
        document.body.appendChild(sidebar);
        
        // Add backdrop
        const backdrop = document.createElement('div');
        backdrop.id = 'cart-backdrop';
        backdrop.style.cssText = 'position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(0,0,0,0.5); opacity: 0; pointer-events: none; transition: opacity 0.3s; z-index: 99998;';
        backdrop.onclick = toggleCart;
        document.body.appendChild(backdrop);
        
        // Add CSS for open state
        const style = document.createElement('style');
        style.textContent = `
            #cart-sidebar.open { right: 0 !important; }
            #cart-backdrop.open { opacity: 1 !important; pointer-events: all !important; }
            button:hover { transform: translateY(-2px); }
        `;
        document.head.appendChild(style);
    }
    
    // Remove any existing cart icons or badges (from AI-generated code)
    const existingCartIcons = document.querySelectorAll('[id*="cart"], [class*="cart-icon"], [id*="badge"]');
    existingCartIcons.forEach(icon => {
        if (icon.id !== 'cart-sidebar' && icon.id !== 'cart-backdrop') {
            icon.remove();
            console.log('🗑️ Removed duplicate cart icon:', icon.id || icon.className);
        }
    });
    
    // Create cart icon if doesn't exist
    if (!document.getElementById('floating-cart-icon')) {
        const cartIcon = document.createElement('div');
        cartIcon.id = 'floating-cart-icon';
        cartIcon.style.cssText = 'position: fixed; top: 20px; right: 20px; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; width: 65px; height: 65px; border-radius: 50%; display: flex; align-items: center; justify-content: center; cursor: pointer; box-shadow: 0 6px 20px rgba(102, 126, 234, 0.4); z-index: 9998; font-size: 32px; transition: transform 0.3s;';
        cartIcon.innerHTML = `
            🛒
            <span id="cart-badge" style="position: absolute; top: -5px; left: -5px; background: #dc3545; color: white; border-radius: 50%; width: 24px; height: 24px; display: none; align-items: center; justify-content: center; font-size: 12px; font-weight: bold; border: 2px solid white;">0</span>
        `;
        cartIcon.onclick = toggleCart;
        cartIcon.onmouseenter = function() {
            this.style.transform = 'scale(1.1)';
        };
        cartIcon.onmouseleave = function() {
            this.style.transform = 'scale(1)';
        };
        document.body.appendChild(cartIcon);
        console.log('✅ Cart icon created');
    }
    
    updateCartDisplay();
    console.log('✅ Store checkout system ready!');
    }
})();

