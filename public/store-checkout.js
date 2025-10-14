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
        console.log('🔍 Store checkout init() called');
        console.log('📄 Current page:', window.location.href);
        console.log('🔍 Searching for products...');
        
        // Check if this is a store page
        const hasProducts = document.querySelector('.product-card, [class*="product"]');
        const productCount = document.querySelectorAll('.product-card, [class*="product"]').length;
        
        console.log(`📦 Found ${productCount} product elements`);
        
        if (!hasProducts) {
            console.log('⚠️ Not a store page, skipping');
            return;
        }
        
        console.log('✅ Store page detected, initializing checkout system...');
        console.log('🛒 Found addToCart buttons:', document.querySelectorAll('[onclick*="addToCart"]').length);
        
        // Remove any existing conflicting functions
        if (window.addToCart && window.addToCart.toString().includes('whatsapp')) {
            console.log('⚠️ Removing old WhatsApp checkout');
            delete window.addToCart;
            delete window.checkout;
        }
    
    // Get page info (decode URL-encoded characters)
    const storeId = decodeURIComponent(window.location.pathname.split('/').pop().replace('.html', '').replace('_html', ''));
    const userId = decodeURIComponent(window.location.pathname.split('/')[2]);
    
    // Initialize empty cart for this store (use window.cart to avoid conflicts)
    window.cart = window.cart || [];
    let cart = window.cart;
    
    // Only load cart if it exists AND this is not a fresh page load
    const existingCart = localStorage.getItem('cart_' + storeId);
    if (existingCart && window.sessionStorage.getItem('visited_' + storeId)) {
        try {
        cart = JSON.parse(existingCart);
            window.cart = cart;
        } catch (e) {
            console.error('Failed to parse cart from localStorage:', e);
            cart = [];
            window.cart = [];
        }
    }
    // Mark that we've visited this store in this session
    window.sessionStorage.setItem('visited_' + storeId, 'true');
    
    // Cart functions - UPDATED to read price dynamically from DOM
    window.addToCart = function(productName, price, image, eventObj) {
        cart = JSON.parse(localStorage.getItem('cart_' + storeId) || '[]');
        
        // Start with the provided values
        let actualPrice = parseFloat(price);
        let actualName = productName;
        let actualImage = image;
        
        console.log('🛒 addToCart called:', { productName, price, image });
        
        // Try multiple ways to find the clicked button
        let button = null;
        
        // Method 1: From event parameter
        const evt = eventObj || (typeof event !== 'undefined' ? event : null) || (typeof window.event !== 'undefined' ? window.event : null);
        if (evt && evt.target) {
            button = evt.target.closest('button') || evt.target;
            console.log('🎯 Method 1: Found button from event');
        }
        
        // Method 2: Use document.activeElement (the currently focused element)
        if (!button && document.activeElement && document.activeElement.tagName === 'BUTTON') {
            button = document.activeElement;
            console.log('🎯 Method 2: Found button from activeElement');
        }
        
        // Method 3: Find the button that was just clicked using text matching
        if (!button) {
            const allButtons = document.querySelectorAll('button');
            for (const btn of allButtons) {
                if (btn.textContent.includes('הוסף לעגלה') || btn.textContent.includes('🛒')) {
                    const card = btn.closest('.product-card, [class*="product"], .card, .item, section, div');
                    if (card) {
                        const nameEl = card.querySelector('h1, h2, h3, h4, [class*="title"], [class*="name"]');
                        if (nameEl && nameEl.textContent.trim() === productName) {
                            button = btn;
                            console.log('🎯 Method 3: Found button by matching product name');
                            break;
                        }
                    }
                }
            }
        }
        
        // If we found the button, try to read current values from the card
        if (button) {
            const card = button.closest('.product-card, [class*="product"], .card, .item, section, div');
            if (card) {
                console.log('📦 Found product card');
                
                // Try to find price in the card
                const priceElements = card.querySelectorAll('[class*="price"], .price, span, p');
                for (const el of priceElements) {
                    const text = el.textContent || '';
                    const match = text.match(/₪\s*(\d+(?:\.\d+)?)/);
                    if (match) {
                        const foundPrice = parseFloat(match[1]);
                        if (!isNaN(foundPrice) && foundPrice > 0) {
                            actualPrice = foundPrice;
                            console.log(`✅ Updated price from DOM: ₪${actualPrice}`);
                            break;
                        }
                    }
                }
                
                // Try to find product name
                const nameEl = card.querySelector('h1, h2, h3, h4, [class*="title"], [class*="name"]');
                if (nameEl && nameEl.textContent.trim()) {
                    actualName = nameEl.textContent.trim();
                    console.log(`✅ Updated name from DOM: ${actualName}`);
                }
                
                // Try to find image
                const img = card.querySelector('img');
                if (img && img.src) {
                    actualImage = img.src;
                }
            }
        }
        
        console.log('🎯 Final values:', { name: actualName, price: actualPrice, image: actualImage });
        
        // Validate that we have good values
        if (!actualName || actualName === 'undefined' || actualName === 'null') {
            console.error('❌ Invalid product name:', actualName);
            alert('שגיאה: לא ניתן לזהות את שם המוצר.\nנא לרענן את הדף ולנסות שוב.');
            return;
        }
        
        if (!actualPrice || isNaN(actualPrice) || actualPrice <= 0) {
            console.error('❌ Invalid price:', actualPrice);
            alert('שגיאה: לא ניתן לזהות את מחיר המוצר.\nנא לרענן את הדף ולנסות שוב.');
            return;
        }
        
        // Find existing item by name
        const existing = cart.find(item => item.name === actualName);
        
        if (existing) {
            // Update price and increase quantity
            existing.price = actualPrice;
            existing.quantity += 1;
            console.log(`➕ Increased quantity: ${actualName} (${existing.quantity})`);
        } else {
            // Add new item - DON'T SAVE BASE64 IMAGES (they're too big for localStorage!)
            const imageToSave = actualImage;
            
            // If image is base64 and very long, skip it
            if (imageToSave && imageToSave.startsWith('data:image') && imageToSave.length > 1000) {
                console.log('⚠️ Image is base64 and too large, skipping...');
                actualImage = '';
            }
            
            cart.push({
                id: Date.now(),
                name: actualName,
                price: actualPrice,
                quantity: 1,
                image: actualImage || ''
            });
            console.log(`🆕 Added new item: ${actualName}`);
        }
        
        // Save and update display
        try {
            localStorage.setItem('cart_' + storeId, JSON.stringify(cart));
            console.log('💾 Cart saved to localStorage successfully');
        } catch (e) {
            if (e.name === 'QuotaExceededError') {
                console.error('❌ localStorage full! Clearing old data...');
                // Clear old cart data
                localStorage.removeItem('cart_' + storeId);
                // Try to save again without images
                cart.forEach(item => item.image = '');
                try {
        localStorage.setItem('cart_' + storeId, JSON.stringify(cart));
                    console.log('✅ Cart saved without images');
                } catch (e2) {
                    console.error('❌ Still failed, cart will not persist');
                }
            }
        }
        updateCartDisplay();
        
        // Show notification with product details
        console.log('✅ Product added successfully:', { name: actualName, price: actualPrice, cartSize: cart.length });
        alert(`✅ ${actualName}\nנוסף לעגלה בהצלחה!\n\nמחיר: ₪${actualPrice}\nכמות בעגלה: ${cart.length}`);
        
        // Auto-open cart and scroll to it
        setTimeout(() => {
            const sidebar = document.getElementById('cart-sidebar');
            const backdrop = document.getElementById('cart-backdrop');
            
            if (sidebar && !sidebar.classList.contains('open')) {
                sidebar.classList.add('open');
                if (backdrop) backdrop.classList.add('open');
                console.log('🛒 Auto-opened cart after adding product');
                
                // Scroll page to top for better cart visibility
                window.scrollTo({ top: 0, behavior: 'smooth' });
                
                // Scroll cart to top
                setTimeout(() => {
                    const cartContent = sidebar.querySelector('div');
                    if (cartContent) {
                        cartContent.scrollTop = 0;
                    }
                    console.log('📜 Auto-scrolled cart to top');
                }, 100);
            }
        }, 100);
    };
    
    window.toggleCart = function() {
        const sidebar = document.getElementById('cart-sidebar');
        const backdrop = document.getElementById('cart-backdrop');
        
        if (sidebar) {
            const isOpen = sidebar.classList.contains('open');
            
            if (isOpen) {
                // Close cart
                sidebar.classList.remove('open');
                if (backdrop) backdrop.classList.remove('open');
            } else {
                // Open cart
                sidebar.classList.add('open');
                if (backdrop) backdrop.classList.add('open');
                
                // Auto-scroll page to top for better cart visibility
                window.scrollTo({ top: 0, behavior: 'smooth' });
                
                // Auto-scroll to top of cart sidebar
                setTimeout(() => {
                    const cartContent = sidebar.querySelector('div');
                    if (cartContent) {
                        cartContent.scrollTop = 0;
                    }
                    console.log('📜 Auto-scrolled cart to top');
                }, 100);
            }
        }
    };
    
    window.updateCartDisplay = function() {
        cart = JSON.parse(localStorage.getItem('cart_' + storeId) || '[]');
        const cartItems = document.getElementById('cart-items') || document.querySelector('.cart-items');
        const cartTotal = document.getElementById('cart-total') || document.querySelector('.cart-total');
        
        // Update cart count in button
        const cartCount = document.getElementById('cart-count');
        const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
        if (cartCount) {
            cartCount.textContent = totalItems;
        }
        
        // Update badge on cart icon (legacy support)
        const badge = document.getElementById('cart-badge');
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
                cartItems.innerHTML = '<div style="text-align: center; padding: 40px; color: #999; font-size: 16px;">העגלה ריקה</div>';
            } else {
                cartItems.innerHTML = cart.map(item => `
                    <div style="padding: 20px; border-bottom: 2px solid #eee; display: flex; justify-content: space-between; align-items: center; gap: 15px;">
                        <div style="flex: 1;">
                            <div style="font-weight: bold; font-size: 18px; margin-bottom: 8px;">${item.name}</div>
                            <div style="color: #666; font-size: 16px;">
                                <span style="color: #10b981; font-weight: 600;">₪${item.price}</span>
                                <span style="margin: 0 8px;">×</span>
                                <span style="font-weight: 600;">${item.quantity}</span>
                                <span style="margin: 0 8px;">=</span>
                                <span style="color: #3b82f6; font-weight: bold;">₪${(item.price * item.quantity).toFixed(2)}</span>
                            </div>
                        </div>
                        <div style="display: flex; flex-direction: column; gap: 8px; align-items: center;">
                            <button onclick="removeFromCart(${item.id})" 
                                    style="background: #ef4444; color: white; border: none; width: 40px; height: 40px; border-radius: 50%; cursor: pointer; font-size: 20px; display: flex; align-items: center; justify-content: center; box-shadow: 0 2px 8px rgba(239, 68, 68, 0.3); transition: all 0.2s;"
                                    onmouseover="this.style.transform='scale(1.1)'; this.style.background='#dc2626'"
                                    onmouseout="this.style.transform='scale(1)'; this.style.background='#ef4444'"
                                    title="הסר מהעגלה">
                                ✕
                            </button>
                            <div style="display: flex; gap: 4px;">
                                <button onclick="decreaseQuantity(${item.id})" 
                                        style="background: #f59e0b; color: white; border: none; width: 32px; height: 32px; border-radius: 6px; cursor: pointer; font-size: 18px; font-weight: bold;"
                                        title="הפחת כמות">
                                    −
                                </button>
                                <button onclick="increaseQuantity(${item.id})" 
                                        style="background: #10b981; color: white; border: none; width: 32px; height: 32px; border-radius: 6px; cursor: pointer; font-size: 18px; font-weight: bold;"
                                        title="הוסף כמות">
                                    +
                                </button>
                            </div>
                        </div>
                    </div>
                `).join('');
            }
        }
        
        if (cartTotal) {
            const total = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
            if (cart.length > 0) {
                // Only show the total, buttons are already in the sidebar
                cartTotal.innerHTML = `
                    <div style="font-size: 22px; font-weight: bold; color: #333; margin-bottom: 15px;">
                        סה"כ לתשלום: <span style="color: #667eea;">₪${total.toFixed(2)}</span>
                    </div>
                `;
            } else {
                cartTotal.innerHTML = '';
            }
        }
    };
    
    // Remove item from cart
    window.removeFromCart = function(itemId) {
        cart = JSON.parse(localStorage.getItem('cart_' + storeId) || '[]');
        cart = cart.filter(item => item.id !== itemId);
        localStorage.setItem('cart_' + storeId, JSON.stringify(cart));
        updateCartDisplay();
        console.log('🗑️ Item removed from cart');
    };
    
    // Increase quantity
    window.increaseQuantity = function(itemId) {
        cart = JSON.parse(localStorage.getItem('cart_' + storeId) || '[]');
        const item = cart.find(i => i.id === itemId);
        if (item) {
            item.quantity += 1;
            localStorage.setItem('cart_' + storeId, JSON.stringify(cart));
            updateCartDisplay();
            console.log('➕ Quantity increased');
        }
    };
    
    // Decrease quantity
    window.decreaseQuantity = function(itemId) {
        cart = JSON.parse(localStorage.getItem('cart_' + storeId) || '[]');
        const item = cart.find(i => i.id === itemId);
        if (item) {
            item.quantity -= 1;
            if (item.quantity <= 0) {
                // Remove item if quantity reaches 0
                cart = cart.filter(i => i.id !== itemId);
            }
            localStorage.setItem('cart_' + storeId, JSON.stringify(cart));
            updateCartDisplay();
            console.log('➖ Quantity decreased');
        }
    };
    
    // Clear entire cart
    window.clearCart = function() {
        if (confirm('האם אתה בטוח שברצונך לנקות את העגלה?')) {
            cart = [];
            localStorage.setItem('cart_' + storeId, JSON.stringify(cart));
            updateCartDisplay();
            console.log('🗑️ Cart cleared');
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
            <div style="padding: 25px; max-height: 100vh; overflow-y: auto;">
                <h3 style="margin-bottom: 25px; font-size: 26px; font-weight: bold; color: #1f2937;">💳 תשלום</h3>
                
                <div style="background: #f8f9fa; padding: 20px; border-radius: 12px; margin-bottom: 25px; border: 2px solid #e5e7eb;">
                    <h4 style="font-size: 20px; font-weight: bold; margin-bottom: 15px; color: #374151;">📋 סיכום הזמנה</h4>
                    ${cart.map(item => `
                        <div style="padding: 12px 0; border-bottom: 1px solid #e5e7eb; font-size: 16px;">
                            <div style="font-weight: 600; color: #1f2937; margin-bottom: 4px;">${item.name}</div>
                            <div style="color: #6b7280;">
                                <span style="color: #10b981;">₪${item.price}</span> × ${item.quantity} = 
                                <span style="font-weight: bold; color: #3b82f6;">₪${(item.price * item.quantity).toFixed(2)}</span>
                            </div>
                        </div>
                    `).join('')}
                    <div style="margin-top: 15px; font-weight: bold; border-top: 2px solid #d1d5db; padding-top: 15px; font-size: 20px; color: #1f2937;">
                        סה"כ: <span id="final-total" style="color: #3b82f6;">₪${total.toFixed(2)}</span>
                    </div>
                </div>
                
                <form id="checkout-form" style="display: flex; flex-direction: column; gap: 18px;">
                    <div>
                        <label style="display: block; font-size: 16px; font-weight: 600; margin-bottom: 8px; color: #374151;">שם מלא *</label>
                        <input type="text" id="checkout-name" required style="width: 100%; padding: 14px; border: 2px solid #d1d5db; border-radius: 8px; font-size: 16px; transition: border 0.2s;" onfocus="this.style.borderColor='#3b82f6'" onblur="this.style.borderColor='#d1d5db'">
                    </div>
                    
                    <div>
                        <label style="display: block; font-size: 16px; font-weight: 600; margin-bottom: 8px; color: #374151;">טלפון *</label>
                        <input type="tel" id="checkout-phone" required style="width: 100%; padding: 14px; border: 2px solid #d1d5db; border-radius: 8px; font-size: 16px; transition: border 0.2s;" onfocus="this.style.borderColor='#3b82f6'" onblur="this.style.borderColor='#d1d5db'">
                    </div>
                    
                    <div>
                        <label style="display: block; font-size: 16px; font-weight: 600; margin-bottom: 8px; color: #374151;">📧 אימייל *</label>
                        <input type="email" id="checkout-email" required style="width: 100%; padding: 14px; border: 2px solid #d1d5db; border-radius: 8px; font-size: 16px; transition: border 0.2s;" onfocus="this.style.borderColor='#3b82f6'" onblur="this.style.borderColor='#d1d5db'" placeholder="example@example.com">
                    </div>
                    
                    <div>
                        <label style="display: block; font-size: 16px; font-weight: 600; margin-bottom: 8px; color: #374151;">📍 כתובת *</label>
                        <input type="text" id="checkout-address" required placeholder="רחוב, עיר, מיקוד" style="width: 100%; padding: 14px; border: 2px solid #d1d5db; border-radius: 8px; font-size: 16px; transition: border 0.2s;" onfocus="this.style.borderColor='#3b82f6'" onblur="this.style.borderColor='#d1d5db'">
                    </div>
                    
                    <div style="background: #f3f4f6; padding: 16px; border-radius: 8px;">
                        <label style="display: flex; align-items: center; font-size: 17px; font-weight: 600; cursor: pointer;">
                            <input type="checkbox" id="checkout-shipping" onchange="toggleShipping()" style="width: 20px; height: 20px; margin-left: 10px; cursor: pointer;"> 
                            <span>📦 משלוח (+ ₪35)</span>
                        </label>
                    </div>
                    
                    <div>
                        <label style="display: block; font-size: 16px; font-weight: 600; margin-bottom: 8px; color: #374151;">💳 אמצעי תשלום *</label>
                        <select id="checkout-payment" onchange="togglePaymentFields()" style="width: 100%; padding: 14px; border: 2px solid #d1d5db; border-radius: 8px; font-size: 16px; cursor: pointer; background: white;">
                            <option value="credit">💳 כרטיס אשראי</option>
                            <option value="bit">📱 ביט</option>
                            <option value="paypal">🌐 PayPal</option>
                        </select>
                    </div>
                    
                    <div id="credit-fields">
                        <input type="text" id="card-number" placeholder="מספר כרטיס" style="width: 100%; padding: 14px; border: 2px solid #d1d5db; border-radius: 8px; font-size: 16px; margin-bottom: 12px;" onfocus="this.style.borderColor='#3b82f6'" onblur="this.style.borderColor='#d1d5db'">
                        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 12px;">
                            <input type="text" id="card-expiry" placeholder="MM/YY" style="padding: 14px; border: 2px solid #d1d5db; border-radius: 8px; font-size: 16px;" onfocus="this.style.borderColor='#3b82f6'" onblur="this.style.borderColor='#d1d5db'">
                            <input type="text" id="card-cvv" placeholder="CVV" style="padding: 14px; border: 2px solid #d1d5db; border-radius: 8px; font-size: 16px;" onfocus="this.style.borderColor='#3b82f6'" onblur="this.style.borderColor='#d1d5db'">
                        </div>
                    </div>
                    
                    <div id="bit-info" style="display: none; background: #dbeafe; padding: 16px; border-radius: 8px; font-size: 16px; text-align: center; border: 2px solid #3b82f6;">
                        📱 תועבר לאפליקציית ביט לאישור התשלום
                    </div>
                    
                    <div id="paypal-info" style="display: none; background: #fef3c7; padding: 16px; border-radius: 8px; font-size: 16px; text-align: center; border: 2px solid #f59e0b;">
                        🌐 תועבר לדף PayPal לאישור התשלום
                    </div>
                    
                    <button type="button" onclick="processPayment()" style="width: 100%; padding: 18px; background: linear-gradient(135deg, #10b981 0%, #059669 100%); color: white; border: none; border-radius: 12px; font-size: 20px; font-weight: bold; cursor: pointer; box-shadow: 0 4px 12px rgba(16, 185, 129, 0.3); transition: all 0.2s;" onmouseover="this.style.transform='translateY(-2px)'; this.style.boxShadow='0 6px 16px rgba(16, 185, 129, 0.4)'" onmouseout="this.style.transform='translateY(0)'; this.style.boxShadow='0 4px 12px rgba(16, 185, 129, 0.3)'">
                        ✅ אישור תשלום - ₪${total.toFixed(2)}
                    </button>
                    
                    <button type="button" onclick="cancelCheckout()" style="width: 100%; padding: 14px; background: #6b7280; color: white; border: none; border-radius: 8px; font-size: 17px; font-weight: 600; cursor: pointer; transition: background 0.2s;" onmouseover="this.style.background='#4b5563'" onmouseout="this.style.background='#6b7280'">
                        ← חזור לעגלה
                    </button>
                </form>
            </div>
        `;
    };
    
    window.toggleShipping = function() {
        const checkbox = document.getElementById('checkout-shipping');
        const total = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
        const shipping = checkbox.checked ? 35 : 0;
        
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
        const email = document.getElementById('checkout-email').value;
        const address = document.getElementById('checkout-address').value;
        
        if (!name || !phone || !email || !address) {
            alert('אנא מלא את כל השדות החובה (שם, טלפון, אימייל, כתובת)');
            return;
        }
        
        // Basic email validation
        if (!email.includes('@') || !email.includes('.')) {
            alert('אנא הזן כתובת אימייל תקינה');
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
                customerEmail: email,
                customerAddress: address,
                products: cart,
                total: total,
                shipping: shipping,
                createdAt: new Date().toISOString()
            })
        }).then(response => {
            if (!response.ok) {
                throw new Error('Server error');
            }
            return response.json();
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
            
            // Auto-close and scroll to top after 3 seconds
            setTimeout(() => {
                finishPayment();
            }, 3000);
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
        // Close cart
        const sidebar = document.getElementById('cart-sidebar');
        const backdrop = document.getElementById('cart-backdrop');
        
        if (sidebar) sidebar.classList.remove('open');
        if (backdrop) backdrop.classList.remove('open');
        
        // Scroll to top of page
        window.scrollTo({ top: 0, behavior: 'smooth' });
        
        // Reset cart sidebar content after animation
        setTimeout(() => {
        cancelCheckout();
        }, 500);
    };
    
    window.cancelCheckout = function() {
        const sidebar = document.getElementById('cart-sidebar');
        sidebar.innerHTML = `
            <div style="padding: 25px; height: 100%;">
                <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 25px; padding-bottom: 15px; border-bottom: 2px solid #f0f0f0;">
                    <h3 style="margin: 0; font-size: 24px; font-weight: bold;">🛒 עגלת קניות</h3>
                    <button id="cart-close-x" style="background: none; border: none; font-size: 32px; cursor: pointer; color: #999; line-height: 1;">×</button>
                </div>
                <div class="cart-items" style="min-height: 200px; max-height: calc(100vh - 400px); overflow-y: auto;"></div>
                <div class="cart-total" style="margin: 25px 0; font-weight: bold; text-align: center; font-size: 20px; padding: 15px; background: #f8f9fa; border-radius: 8px;"></div>
                <button id="cart-clear-btn" style="width: 100%; padding: 12px; background: #f59e0b; color: white; border: none; border-radius: 8px; cursor: pointer; font-weight: 600; font-size: 16px; margin-bottom: 10px; transition: background 0.2s;" onmouseover="this.style.background='#d97706'" onmouseout="this.style.background='#f59e0b'">
                    🗑️ נקה עגלה
                </button>
                <button id="cart-checkout-btn" style="width: 100%; padding: 16px; background: linear-gradient(135deg, #28a745 0%, #20c997 100%); color: white; border: none; border-radius: 10px; cursor: pointer; font-weight: bold; font-size: 18px; transition: transform 0.2s; box-shadow: 0 4px 15px rgba(40, 167, 69, 0.3); margin-bottom: 10px;" onmouseover="this.style.transform='translateY(-2px)'" onmouseout="this.style.transform='translateY(0)'">
                    💳 המשך לתשלום
                </button>
                <button id="cart-close-btn" style="width: 100%; padding: 12px; background: #6c757d; color: white; border: none; border-radius: 8px; cursor: pointer; font-weight: 500; font-size: 16px; transition: background 0.2s;" onmouseover="this.style.background='#5a6268'" onmouseout="this.style.background='#6c757d'">סגור</button>
            </div>
        `;
        
        // Reattach event listeners
        setTimeout(() => {
            const closeX = document.getElementById('cart-close-x');
            const closeBtn = document.getElementById('cart-close-btn');
            const clearBtn = document.getElementById('cart-clear-btn');
            const checkoutBtn = document.getElementById('cart-checkout-btn');
            
            if (closeX) closeX.onclick = window.toggleCart;
            if (closeBtn) closeBtn.onclick = window.toggleCart;
            if (clearBtn) clearBtn.onclick = window.clearCart;
            if (checkoutBtn) checkoutBtn.onclick = window.checkout;
        }, 100);
        
        updateCartDisplay();
    };
    
    // CRITICAL: Remove ALL AI-generated cart elements FIRST
    console.log('🧹 Cleaning up AI-generated cart elements...');
    
    // Find and remove ALL cart-related elements except our own
    const elementsToRemove = [];
    
    // Remove any cart icons in header/navigation
    document.querySelectorAll('header button, nav button, .cart-icon').forEach(el => {
        if (el.textContent.includes('🛒') || el.querySelector('[id*="cart"]') || el.querySelector('[class*="cart"]')) {
            elementsToRemove.push(el);
        }
    });
    
    // Remove any cart badges/counters
    document.querySelectorAll('[id*="cart-count"], [id*="badge"], .cart-count-badge, [class*="badge"]').forEach(el => {
        elementsToRemove.push(el);
    });
    
    // Remove duplicate cart sidebars (if any have content)
    document.querySelectorAll('#cart-sidebar').forEach((el, index) => {
        if (index > 0 || el.innerHTML.trim() !== '') {
            elementsToRemove.push(el);
        }
    });
    
    // Remove duplicate overlays
    document.querySelectorAll('#cart-overlay, .cart-overlay').forEach((el, index) => {
        if (index > 0 || el.innerHTML.trim() !== '') {
            elementsToRemove.push(el);
        }
    });
    
    // Actually remove the elements
    elementsToRemove.forEach(el => {
        if (el && el.parentNode) {
            console.log('🗑️ Removed:', el.tagName, el.id || el.className);
            el.remove();
        }
    });
    
    // Create sidebar with better styling
    // Build or rebuild cart sidebar
    let sidebar = document.getElementById('cart-sidebar');
    if (!sidebar) {
        sidebar = document.createElement('div');
        sidebar.id = 'cart-sidebar';
        document.body.appendChild(sidebar);
    }
    
    // Set cart sidebar styles and content
    sidebar.className = '';
        sidebar.style.cssText = 'position: fixed; top: 0; right: -450px; width: 450px; max-width: 100vw; height: 100vh; background: white; box-shadow: -4px 0 20px rgba(0,0,0,0.15); transition: right 0.4s cubic-bezier(0.4, 0, 0.2, 1); z-index: 99999; overflow-y: auto; font-family: Arial, sans-serif;';
        sidebar.innerHTML = `
            <div style="padding: 25px; height: 100%;">
                <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 25px; padding-bottom: 15px; border-bottom: 2px solid #f0f0f0;">
                <h3 style="margin: 0; font-size: 24px; font-weight: bold;">🛒 עגלת קניות</h3>
                <button id="cart-close-x" style="background: none; border: none; font-size: 32px; cursor: pointer; color: #999; line-height: 1;">×</button>
                </div>
            <div class="cart-items" style="min-height: 200px; max-height: calc(100vh - 400px); overflow-y: auto;"></div>
                <div class="cart-total" style="margin: 25px 0; font-weight: bold; text-align: center; font-size: 20px; padding: 15px; background: #f8f9fa; border-radius: 8px;"></div>
            <button id="cart-clear-btn" style="width: 100%; padding: 12px; background: #f59e0b; color: white; border: none; border-radius: 8px; cursor: pointer; font-weight: 600; font-size: 16px; margin-bottom: 10px; transition: background 0.2s;" onmouseover="this.style.background='#d97706'" onmouseout="this.style.background='#f59e0b'">
                🗑️ נקה עגלה
            </button>
            <button id="cart-checkout-btn" style="width: 100%; padding: 16px; background: linear-gradient(135deg, #28a745 0%, #20c997 100%); color: white; border: none; border-radius: 10px; cursor: pointer; font-weight: bold; font-size: 18px; transition: transform 0.2s; box-shadow: 0 4px 15px rgba(40, 167, 69, 0.3); margin-bottom: 10px;" onmouseover="this.style.transform='translateY(-2px)'" onmouseout="this.style.transform='translateY(0)'">
                    💳 המשך לתשלום
                </button>
            <button id="cart-close-btn" style="width: 100%; padding: 12px; background: #6c757d; color: white; border: none; border-radius: 8px; cursor: pointer; font-weight: 500; font-size: 16px; transition: background 0.2s;" onmouseover="this.style.background='#5a6268'" onmouseout="this.style.background='#6c757d'">סגור</button>
            </div>
        `;
        
        // Attach event listeners to buttons
        setTimeout(() => {
            const closeX = document.getElementById('cart-close-x');
            const closeBtn = document.getElementById('cart-close-btn');
            const clearBtn = document.getElementById('cart-clear-btn');
            const checkoutBtn = document.getElementById('cart-checkout-btn');
            
            if (closeX) closeX.onclick = window.toggleCart;
            if (closeBtn) closeBtn.onclick = window.toggleCart;
            if (clearBtn) clearBtn.onclick = window.clearCart;
            if (checkoutBtn) checkoutBtn.onclick = window.checkout;
        }, 100);
    
    // Build or rebuild overlay
    let backdrop = document.getElementById('cart-backdrop') || document.getElementById('cart-overlay');
    if (!backdrop) {
        backdrop = document.createElement('div');
        backdrop.id = 'cart-backdrop';
        document.body.appendChild(backdrop);
    }
    
    backdrop.className = '';
        backdrop.style.cssText = 'position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(0,0,0,0.5); opacity: 0; pointer-events: none; transition: opacity 0.3s; z-index: 99998;';
        backdrop.onclick = toggleCart;
        
        // Add CSS for open state
    if (!document.getElementById('cart-styles')) {
        const style = document.createElement('style');
        style.id = 'cart-styles';
        style.textContent = `
            /* Cart sidebar animation */
            #cart-sidebar.open { right: 0 !important; }
            #cart-backdrop.open { opacity: 1 !important; pointer-events: all !important; }
            
            /* Ensure cart icon ALWAYS stays fixed - below header */
            #floating-cart-icon {
                position: fixed !important;
                top: 100px !important;
                right: 20px !important;
                z-index: 9998 !important;
            }
            
            /* Hide any AI-generated cart elements */
            header [id*="cart"]:not(#floating-cart-icon),
            header [class*="cart"]:not(#floating-cart-icon),
            nav [id*="cart"]:not(#floating-cart-icon),
            nav [class*="cart"]:not(#floating-cart-icon),
            [id*="cart-item-count"],
            [class*="cart-count"]:not(#cart-badge),
            button:has([id*="cart"]):not(#floating-cart-icon) {
                display: none !important;
                visibility: hidden !important;
                opacity: 0 !important;
            }
            
            /* Ensure our cart icon is ALWAYS visible and fixed */
            #floating-cart-icon {
                display: flex !important;
                visibility: visible !important;
                opacity: 1 !important;
                position: fixed !important;
            }
        `;
        document.head.appendChild(style);
    }
    
    // Create cart icon if doesn't exist
    if (!document.getElementById('floating-cart-icon')) {
        const cartIcon = document.createElement('div');
        cartIcon.id = 'floating-cart-icon';
        cartIcon.style.cssText = 'position: fixed; top: 100px; right: 20px; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; width: 65px; height: 65px; border-radius: 50%; display: flex; align-items: center; justify-content: center; cursor: pointer; box-shadow: 0 6px 20px rgba(102, 126, 234, 0.4); z-index: 9998; font-size: 32px; transition: transform 0.3s;';
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

