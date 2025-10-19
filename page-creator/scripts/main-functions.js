// Main Functions for Page Creator

// Form submission handler
async function handleFormSubmit(event) {
    event.preventDefault();

    if (!state.selectedStyle) {
        showModal('modal_error_style');
        return;
    }

    

    setLoading(true);

    const formData = new FormData(ui.detailsForm);
    let data = Object.fromEntries(formData.entries());

    // נגישות, AI Bot ו-WhatsApp תמיד מופיעים
    data.addAccessibility = true;
    data.addAiBot = true;
    data.useAsBackground = document.getElementById('use-as-background').checked;

    data.style = state.selectedStyle;
    data.pageType = state.selectedPageType;

    state.originalDescription = data.description;

    // Collect Floating CTA data
    const enableFloatingCta = document.getElementById('enableFloatingCta')?.checked;
    if (enableFloatingCta) {
        data.floatingCta = {
            enabled: true,
            text: document.getElementById('ctaText')?.value || 'קנה עכשיו!',
            link: document.getElementById('ctaLink')?.value || '',
            style: document.querySelector('input[name="ctaStyle"]:checked')?.value || 'solid',
            position: document.querySelector('input[name="ctaPosition"]:checked')?.value || 'bottom-right',
            countdown: {
                enabled: document.getElementById('enableCountdown')?.checked || false,
                text: document.getElementById('countdownText')?.value || 'המבצע נגמר בעוד',
                date: document.getElementById('countdownDate')?.value || '',
                time: document.getElementById('countdownTime')?.value || '23:59'
            }
        };
    }

    // Collect courses data if this is a digital course page
    if (data.pageType === 'onlineCourse') {
        console.log('🎓 Collecting courses data for onlineCourse page...');
        const courseNames = document.getElementsByName('courseName[]');
        const courseVideos = document.getElementsByName('courseVideo[]');
        const coursePrices = document.getElementsByName('coursePrice[]');
        const courseDescriptions = document.getElementsByName('courseDescription[]');
        
        console.log('📊 Found fields:', {
            courseNames: courseNames.length,
            courseVideos: courseVideos.length,
            coursePrices: coursePrices.length,
            courseDescriptions: courseDescriptions.length
        });
        
        data.courses = [];
        for (let i = 0; i < courseNames.length; i++) {
            if (courseNames[i].value.trim()) {
                const course = {
                    name: courseNames[i].value.trim(),
                    video: courseVideos[i].value.trim(),
                    price: coursePrices[i].value || '0',
                    description: courseDescriptions[i].value.trim() || 'קורס מקצועי ומקיף'
                };
                console.log(`📚 Course ${i + 1}:`, course);
                data.courses.push(course);
            }
        }
        
        console.log('✅ Total courses collected:', data.courses.length);
        console.log('📦 Courses array:', data.courses);
    }

    // הוסף נתוני שפה ומדינה
    data = addLanguageToPageData(data);

    const masterPrompt = createMasterPrompt(data);

    switchView(ui.formView, ui.previewView);

    try {
        let htmlContent = await generateHtmlFromApi(masterPrompt);
        
        // Add store JavaScript if this is an online store
        if (data.pageType === 'onlineStore') {
            console.log('Detected online store, injecting store scripts...');
            // Use the store injector function directly
            htmlContent = injectStoreScripts(htmlContent);
            console.log('Store scripts injected successfully');
        }
        
        // הוסף קישורים לתחתית הדף
        const finalHtml = addFooterLinks(htmlContent, data);
        
        // שמור את ה-HTML המלא למשתנה גלובלי כדי שהשמירה תשמור אותו עם הסקריפטים
        window.generatedPageHTML = finalHtml;

        ui.previewIframe.srcdoc = finalHtml;

        ui.previewIframe.onload = () => {
            setLoading(false);
            showModal('modal_success');
        };

    } catch (error) {
        console.error('Error generating page:', error);
        setLoading(false);
        showModal('modal_error');
    }
}

// Generate HTML from API
async function generateHtmlFromApi(prompt) {
    try {
        const response = await fetch('/api/generate-html', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ prompt })
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        return data.html;
    } catch (error) {
        console.error('Error calling API:', error);
        throw error;
    }
}

// Inject store-specific JavaScript into HTML
function injectStoreScripts(htmlContent) {
    console.log('Starting store script injection...');
    
    // Ensure DOCTYPE exists
    if (!htmlContent.trim().toLowerCase().startsWith('<!doctype')) {
        htmlContent = '<!DOCTYPE html>\n' + htmlContent;
    }
    
    // Remove any existing store scripts to avoid duplicates
    htmlContent = htmlContent.replace(/<script[^>]*>[\s\S]*?function addToCart[\s\S]*?<\/script>/gi, '');
    htmlContent = htmlContent.replace(/<script[^>]*>[\s\S]*?localStorage\.getItem\('cart'\)[\s\S]*?<\/script>/gi, '');
    htmlContent = htmlContent.replace(/<script[^>]*>[\s\S]*?cart-sidebar[\s\S]*?<\/script>/gi, '');
    
    // Remove any management buttons from the generated HTML
    htmlContent = htmlContent.replace(/<button[^>]*onclick=["\']handleManagementClick\(\)["\'][^>]*>.*?<\/button>/gi, '');
    htmlContent = htmlContent.replace(/<button[^>]*onclick=["\']openManagement\(\)["\'][^>]*>.*?<\/button>/gi, '');
    htmlContent = htmlContent.replace(/<button[^>]*>ניהול<\/button>/gi, '');
    htmlContent = htmlContent.replace(/<button[^>]*>Management<\/button>/gi, '');
    
    console.log('Injecting fresh store scripts...');
    
    const storeScript = `
<script>
console.log('Store scripts loaded!');

// Store functionality
let cart = JSON.parse(localStorage.getItem('cart') || '[]');

function updateCartDisplay() {
    cart = JSON.parse(localStorage.getItem('cart') || '[]');
    const cartCount = cart.reduce((total, item) => total + item.quantity, 0);
    
    // Update cart count badge
    const cartBadge = document.querySelector('.cart-count-badge') || 
                      document.getElementById('cart-count-badge') || 
                      document.getElementById('cart-count');
    if (cartBadge) {
        cartBadge.textContent = cartCount;
        cartBadge.style.display = cartCount > 0 ? 'block' : 'none';
    }
    
    // Update cart sidebar
    const cartItems = document.querySelector('.cart-items') || document.getElementById('cart-items');
    const cartTotal = document.querySelector('.cart-total') || document.getElementById('cart-total');
    
    if (cartItems) {
        if (cart.length === 0) {
            cartItems.innerHTML = \`
                <div style="text-align: center; color: #666; padding: 40px;">
                    <div style="font-size: 48px; margin-bottom: 15px;">🛒</div>
                    <div style="font-size: 18px; font-weight: bold; margin-bottom: 10px;">העגלה ריקה</div>
                    <div style="font-size: 14px;">הוסף פריטים כדי להתחיל לקנות</div>
                </div>
            \`;
        } else {
            cartItems.innerHTML = cart.map(item => \`
                <div style="display: flex; justify-content: space-between; align-items: center; padding: 15px; border-bottom: 1px solid #eee; background: white; margin-bottom: 10px; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
                    <div style="flex: 1;">
                        <div style="font-weight: bold; color: #333; margin-bottom: 5px;">\${item.name}</div>
                        <div style="color: #666; font-size: 14px;">₪\${item.price} x \${item.quantity}</div>
                    </div>
                    <div style="font-weight: bold; color: #007bff; font-size: 16px;">₪\${item.price * item.quantity}</div>
                </div>
            \`).join('');
        }
    }
    
    if (cartTotal) {
        const total = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
        cartTotal.textContent = '₪' + total;
    }
}

function addToCart(productName, price, image) {
    console.log('Adding to cart:', productName, price, image);
    
    cart = JSON.parse(localStorage.getItem('cart') || '[]');
    
    // Check if product already exists
    const existingItem = cart.find(item => item.name === productName);
    
    if (existingItem) {
        existingItem.quantity += 1;
    } else {
        cart.push({
            id: 'p_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9),
            name: productName,
            price: parseFloat(price),
            quantity: 1,
            image: image || ''
        });
    }
    
    localStorage.setItem('cart', JSON.stringify(cart));
    updateCartDisplay();
    
    // Show success message
    alert(productName + ' נוסף לעגלה!');
}

function quickBuy(productName, price, image) {
    console.log('Quick buy:', productName, price, image);
    
    // Add to cart first
    addToCart(productName, price, image);
    
    // Open cart sidebar
    const cartSidebar = document.querySelector('.cart-sidebar') || document.getElementById('cart-sidebar');
    if (cartSidebar) {
        cartSidebar.classList.add('open');
    }
    
    // Proceed to checkout after a short delay
    setTimeout(() => {
        checkout();
    }, 1000);
}

function checkout() {
    cart = JSON.parse(localStorage.getItem('cart') || '[]');
    
    if (cart.length === 0) {
        alert('העגלה ריקה');
        return;
    }
    
    const total = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    
    // Check subscription
    const hasSubscription = localStorage.getItem('userSubscription') === 'active';
    if (!hasSubscription) {
        if (confirm('על מנת לבצע הזמנה, נדרש מנוי. האם ברצונך לרכוש מנוי?')) {
            localStorage.setItem('userSubscription', 'active');
            alert('המנוי נרכש! כעת תוכל לבצע הזמנה.');
        } else {
            return;
        }
    }
    
    // Open checkout in a new window
    const checkoutWindow = window.open('', 'checkout', 'width=600,height=700,scrollbars=yes,resizable=yes');
    
    checkoutWindow.document.write(`
        <!DOCTYPE html>
        <html lang="he" dir="rtl">
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>תשלום - ${document.title}</title>
            <style>
                body {
                    font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
                    margin: 0;
                    padding: 20px;
                    background: #f5f5f5;
                    direction: rtl;
                }
                .checkout-container {
                    max-width: 500px;
                    margin: 0 auto;
                    background: white;
                    padding: 30px;
                    border-radius: 10px;
                    box-shadow: 0 4px 20px rgba(0,0,0,0.1);
                }
                .checkout-header {
                    text-align: center;
                    margin-bottom: 30px;
                    padding-bottom: 20px;
                    border-bottom: 2px solid #007bff;
                }
                .checkout-header h1 {
                    color: #007bff;
                    margin: 0;
                    font-size: 28px;
                }
                .order-summary {
                    margin-bottom: 30px;
                }
                .order-item {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    padding: 15px 0;
                    border-bottom: 1px solid #eee;
                }
                .order-item:last-child {
                    border-bottom: none;
                }
                .item-name {
                    font-weight: bold;
                    color: #333;
                }
                .item-quantity {
                    color: #666;
                    font-size: 14px;
                }
                .item-price {
                    font-weight: bold;
                    color: #007bff;
                }
                .total-section {
                    background: #f8f9fa;
                    padding: 20px;
                    border-radius: 8px;
                    margin: 20px 0;
                }
                .total-line {
                    display: flex;
                    justify-content: space-between;
                    margin: 10px 0;
                    font-size: 18px;
                }
                .total-final {
                    font-size: 24px;
                    font-weight: bold;
                    color: #007bff;
                    border-top: 2px solid #007bff;
                    padding-top: 10px;
                }
                .payment-form {
                    margin-top: 30px;
                }
                .form-group {
                    margin-bottom: 20px;
                }
                .form-group label {
                    display: block;
                    margin-bottom: 8px;
                    font-weight: bold;
                    color: #333;
                }
                .form-group input {
                    width: 100%;
                    padding: 12px;
                    border: 2px solid #ddd;
                    border-radius: 6px;
                    font-size: 16px;
                    box-sizing: border-box;
                }
                .form-group input:focus {
                    border-color: #007bff;
                    outline: none;
                }
                .payment-buttons {
                    display: flex;
                    gap: 15px;
                    margin-top: 30px;
                }
                .btn {
                    flex: 1;
                    padding: 15px;
                    border: none;
                    border-radius: 8px;
                    font-size: 18px;
                    font-weight: bold;
                    cursor: pointer;
                    transition: all 0.3s;
                }
                .btn-primary {
                    background: #007bff;
                    color: white;
                }
                .btn-primary:hover {
                    background: #0056b3;
                }
                .btn-secondary {
                    background: #6c757d;
                    color: white;
                }
                .btn-secondary:hover {
                    background: #545b62;
                }
                .success-message {
                    text-align: center;
                    padding: 40px;
                    color: #28a745;
                    font-size: 20px;
                    font-weight: bold;
                }
                .loading {
                    text-align: center;
                    padding: 40px;
                    color: #007bff;
                    font-size: 18px;
                }
            </style>
        </head>
        <body>
            <div class="checkout-container">
                <div class="checkout-header">
                    <h1>💳 תשלום</h1>
                </div>
                
                <div class="order-summary">
                    <h3>סיכום הזמנה</h3>
                    <div id="order-items"></div>
                </div>
                
                <div class="total-section">
                    <div class="total-line">
                        <span>סה"כ:</span>
                        <span id="total-amount">₪${total}</span>
                    </div>
                </div>
                
                <div class="payment-form" id="payment-form">
                    <h3>פרטי תשלום</h3>
                    <div class="form-group">
                        <label for="card-number">מספר כרטיס אשראי</label>
                        <input type="text" id="card-number" placeholder="1234 5678 9012 3456" maxlength="19">
                    </div>
                    <div class="form-group">
                        <label for="expiry">תאריך תפוגה</label>
                        <input type="text" id="expiry" placeholder="MM/YY" maxlength="5">
                    </div>
                    <div class="form-group">
                        <label for="cvv">CVV</label>
                        <input type="text" id="cvv" placeholder="123" maxlength="3">
                    </div>
                    <div class="form-group">
                        <label for="name">שם על הכרטיס</label>
                        <input type="text" id="name" placeholder="שם מלא">
                    </div>
                    
                    <div class="payment-buttons">
                        <button class="btn btn-secondary" onclick="window.close()">ביטול</button>
                        <button class="btn btn-primary" onclick="processPayment()">שלם עכשיו</button>
                    </div>
                </div>
                
                <div id="loading" class="loading" style="display: none;">
                    <div>מעבד תשלום...</div>
                    <div style="margin-top: 10px;">⏳</div>
                </div>
                
                <div id="success" class="success-message" style="display: none;">
                    <div>✅ התשלום בוצע בהצלחה!</div>
                    <div style="margin-top: 10px; font-size: 16px; color: #666;">הזמנתך התקבלה ותטופל בקרוב</div>
                </div>
            </div>
            
            <script>
                // Display order items
                const cart = ${JSON.stringify(cart)};
                const orderItems = document.getElementById('order-items');
                
                cart.forEach(item => {
                    const itemDiv = document.createElement('div');
                    itemDiv.className = 'order-item';
                    itemDiv.innerHTML = \`
                        <div>
                            <div class="item-name">\${item.name}</div>
                            <div class="item-quantity">כמות: \${item.quantity}</div>
                        </div>
                        <div class="item-price">₪\${item.price * item.quantity}</div>
                    \`;
                    orderItems.appendChild(itemDiv);
                });
                
                function processPayment() {
                    const cardNumber = document.getElementById('card-number').value;
                    const expiry = document.getElementById('expiry').value;
                    const cvv = document.getElementById('cvv').value;
                    const name = document.getElementById('name').value;
                    
                    if (!cardNumber || !expiry || !cvv || !name) {
                        alert('אנא מלא את כל השדות');
                        return;
                    }
                    
                    // Show loading
                    document.getElementById('payment-form').style.display = 'none';
                    document.getElementById('loading').style.display = 'block';
                    
                    // Simulate payment processing
                    setTimeout(() => {
                        document.getElementById('loading').style.display = 'none';
                        document.getElementById('success').style.display = 'block';
                        
                        // Clear cart in parent window
                        if (window.opener) {
                            window.opener.localStorage.removeItem('cart');
                            window.opener.updateCartDisplay();
                        }
                        
                        // Close window after 3 seconds
                        setTimeout(() => {
                            window.close();
                        }, 3000);
                    }, 3000);
                }
                
                // Format card number
                document.getElementById('card-number').addEventListener('input', function(e) {
                    let value = e.target.value.replace(/\s/g, '').replace(/[^0-9]/gi, '');
                    let formattedValue = value.match(/.{1,4}/g)?.join(' ') || value;
                    e.target.value = formattedValue;
                });
                
                // Format expiry date
                document.getElementById('expiry').addEventListener('input', function(e) {
                    let value = e.target.value.replace(/\D/g, '');
                    if (value.length >= 2) {
                        value = value.substring(0, 2) + '/' + value.substring(2, 4);
                    }
                    e.target.value = value;
                });
                
                // Format CVV
                document.getElementById('cvv').addEventListener('input', function(e) {
                    e.target.value = e.target.value.replace(/\D/g, '');
                });
            </script>
        </body>
        </html>
    `);
    
    checkoutWindow.document.close();
}

function toggleCart() {
    const cartSidebar = document.querySelector('.cart-sidebar') || document.getElementById('cart-sidebar');
    if (cartSidebar) {
        cartSidebar.classList.toggle('open');
    }
}

function clearCart() {
    if (confirm('האם אתה בטוח שברצונך לנקות את העגלה?')) {
        localStorage.removeItem('cart');
        updateCartDisplay();
        alert('העגלה נוקתה בהצלחה!');
    }
}

// Make functions globally available for onclick handlers
window.addToCart = addToCart;
window.quickBuy = quickBuy;
window.toggleCart = toggleCart;
window.checkout = checkout;
window.clearCart = clearCart;

// Initialize store when page loads
document.addEventListener('DOMContentLoaded', function() {
    console.log('DOM loaded, initializing store...');
    
    // Create cart sidebar if it doesn't exist
    if (!document.getElementById('cart-sidebar')) {
        const sidebar = document.createElement('div');
        sidebar.id = 'cart-sidebar';
        sidebar.className = 'cart-sidebar';
        sidebar.innerHTML = \`
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px; padding-bottom: 15px; border-bottom: 2px solid #007bff;">
                <h3 style="margin: 0; color: #007bff; font-size: 24px;">🛒 עגלת קניות</h3>
                <button onclick="toggleCart()" style="background: #dc3545; color: white; border: none; font-size: 20px; width: 35px; height: 35px; border-radius: 50%; cursor: pointer; display: flex; align-items: center; justify-content: center;">×</button>
            </div>
            <div class="cart-items" style="max-height: 400px; overflow-y: auto;"></div>
            <div class="cart-total" style="font-weight: bold; text-align: center; padding: 15px; background: #f8f9fa; border-radius: 8px; margin: 20px 0; font-size: 18px; color: #007bff;"></div>
            <button onclick="checkout()" style="width: 100%; padding: 15px; background: #28a745; color: white; border: none; border-radius: 8px; margin-top: 10px; cursor: pointer; font-size: 16px; font-weight: bold; transition: all 0.3s;">💳 המשך לתשלום</button>
            <button onclick="clearCart()" style="width: 100%; padding: 10px; background: #dc3545; color: white; border: none; border-radius: 8px; margin-top: 10px; cursor: pointer; font-size: 14px;">🗑️ נקה עגלה</button>
        \`;
        document.body.appendChild(sidebar);
    }
    
    // Create cart count badge if it doesn't exist
    if (!document.querySelector('.cart-count-badge')) {
        const badge = document.createElement('span');
        badge.className = 'cart-count-badge';
        badge.style.cssText = 'position: fixed; top: 20px; right: 20px; background: red; color: white; border-radius: 50%; width: 25px; height: 25px; display: flex; align-items: center; justify-content: center; font-size: 12px; z-index: 1001;';
        document.body.appendChild(badge);
    }
    
    // Initialize cart display
    updateCartDisplay();
    
    // Add event listeners for cart buttons (backup for data-action attributes)
    document.addEventListener('click', function(e) {
        if (e.target.matches('[data-action="add-to-cart"]')) {
            const product = e.target.closest('.product-item');
            if (product) {
                const name = product.querySelector('.product-name')?.textContent || 'מוצר';
                const price = parseFloat(product.querySelector('.product-price')?.textContent?.replace('₪', '') || '0');
                const image = product.querySelector('.product-image')?.src || '';
                addToCart(name, price, image);
            }
        }
        
        if (e.target.matches('[data-action="quick-buy"]')) {
            const product = e.target.closest('.product-item');
            if (product) {
                const name = product.querySelector('.product-name')?.textContent || 'מוצר';
                const price = parseFloat(product.querySelector('.product-price')?.textContent?.replace('₪', '') || '0');
                const image = product.querySelector('.product-image')?.src || '';
                quickBuy(name, price, image);
            }
        }
        
        if (e.target.matches('[data-action="toggle-cart"]')) {
            toggleCart();
        }
    });
    
    console.log('Store initialized successfully!');
});
</script>

<style>
.cart-sidebar {
    position: fixed;
    top: 0;
    right: -450px;
    width: 450px;
    height: 100vh;
    background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%);
    box-shadow: -5px 0 25px rgba(0,0,0,0.15);
    transition: right 0.4s cubic-bezier(0.4, 0, 0.2, 1);
    z-index: 1000;
    padding: 25px;
    overflow-y: auto;
    border-left: 3px solid #007bff;
}

.cart-sidebar.open {
    right: 0;
}

.cart-count-badge {
    position: fixed;
    top: 20px;
    right: 20px;
    background: linear-gradient(135deg, #dc3545 0%, #c82333 100%);
    color: white;
    border-radius: 50%;
    width: 30px;
    height: 30px;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 14px;
    font-weight: bold;
    z-index: 1001;
    box-shadow: 0 4px 12px rgba(220, 53, 69, 0.4);
    animation: pulse 2s infinite;
}

@keyframes pulse {
    0% { transform: scale(1); }
    50% { transform: scale(1.1); }
    100% { transform: scale(1); }
}
</style>
`;

    // Insert before </body> tag
    if (htmlContent.includes('</body>')) {
        htmlContent = htmlContent.replace('</body>', storeScript + '</body>');
        console.log('Store scripts injected before </body> tag');
    } else {
        // If no </body> tag, append at the end
        htmlContent += storeScript;
        console.log('Store scripts appended to end of HTML');
    }
    
    console.log('Store script injection completed');
    console.log('HTML length after injection:', htmlContent.length);
    return htmlContent;
}

// Add footer links to the page
function addFooterLinks(htmlContent, data) {
    // Check if footer already exists (AI might have added it)
    if (htmlContent.includes('נוצר עם') || htmlContent.includes('AutoPage') || htmlContent.includes('<footer')) {
        console.log('Footer already exists, skipping...');
        return htmlContent;
    }
    
    // Add footer with links
    const footer = `
<footer style="background: #f8f9fa; padding: 20px; text-align: center; margin-top: 40px; border-top: 1px solid #dee2e6;">
    <div style="max-width: 1200px; margin: 0 auto;">
        <p style="margin: 0; color: #6c757d; font-size: 14px;">
            נוצר עם <a href="http://localhost:3002" style="color: #007bff; text-decoration: none;">AutoPage</a> - בונה דפים אוטומטי
        </p>
    </div>
</footer>`;

    // Insert before </body> tag
    if (htmlContent.includes('</body>')) {
        htmlContent = htmlContent.replace('</body>', footer + '</body>');
    } else {
        htmlContent += footer;
    }
    
    return htmlContent;
}

// Add language data to page data
function addLanguageToPageData(data) {
    // Add language and country data
    data.language = 'he';
    data.country = 'IL';
    data.currency = 'ILS';
    data.timezone = 'Asia/Jerusalem';
    
    return data;
}

// Create master prompt for AI
function createMasterPrompt(data) {
    const template = pageTemplates[data.pageType];
    if (!template) {
        throw new Error('Template not found');
    }

    let prompt = template.structurePrompt;
    
    // Add CRITICAL CONTACT INFORMATION FIRST (most important!)
    prompt += `\n\n========================================`;
    prompt += `\n🔥 CRITICAL - USE THIS EXACT INFORMATION 🔥`;
    prompt += `\n========================================`;
    
    if (data.mainName) {
        prompt += `\n\n**Business/Person Name (USE EXACTLY)**: ${data.mainName}`;
        prompt += `\n⚠️ IMPORTANT: This is the ACTUAL business/person name - USE IT EVERYWHERE in the page!`;
    }
    
    if (data.contactName) {
        prompt += `\n\n**Contact Person Name (USE EXACTLY)**: ${data.contactName}`;
    }
    
    if (data.phone) {
        const cleanPhone = data.phone.replace(/[^0-9]/g, '');
        prompt += `\n\n**Phone Number (USE EXACTLY)**: ${data.phone}`;
        prompt += `\n⚠️ CRITICAL: Make phone CLICKABLE everywhere it appears!`;
        prompt += `\n📞 Phone link format: <a href="tel:${data.phone}">${data.phone}</a>`;
        prompt += `\n💬 WhatsApp link format: <a href="https://wa.me/${cleanPhone}">WhatsApp</a>`;
        prompt += `\n✅ Example usage in contact section:`;
        prompt += `\n   <a href="tel:${data.phone}" style="color: #007bff; text-decoration: none;">${data.phone}</a>`;
        prompt += `\n   <a href="https://wa.me/${cleanPhone}" style="color: #25D366;">צור קשר בWhatsApp</a>`;
    }
    
    if (data.email) {
        prompt += `\n\n**Email Address (USE EXACTLY)**: ${data.email}`;
        prompt += `\n⚠️ CRITICAL: Make email CLICKABLE everywhere it appears!`;
        prompt += `\n📧 Email link format: <a href="mailto:${data.email}">${data.email}</a>`;
        prompt += `\n✅ Example usage: <a href="mailto:${data.email}" style="color: #007bff; text-decoration: none;">${data.email}</a>`;
    }
    
    if (data.address) {
        const encodedAddress = encodeURIComponent(data.address);
        prompt += `\n\n**Address (USE EXACTLY)**: ${data.address}`;
        prompt += `\n⚠️ CRITICAL: Make address CLICKABLE for navigation!`;
        prompt += `\n🗺️ Navigation link format: <a href="https://www.google.com/maps/search/?api=1&query=${encodedAddress}">${data.address}</a>`;
        prompt += `\n🚗 Waze link format: <a href="https://waze.com/ul?q=${encodedAddress}">נווט בWaze</a>`;
        prompt += `\n✅ Example usage:`;
        prompt += `\n   <a href="https://www.google.com/maps/search/?api=1&query=${encodedAddress}" target="_blank" style="color: #007bff;">`;
        prompt += `\n     📍 ${data.address} - לחץ לניווט`;
        prompt += `\n   </a>`;
    }
    
    prompt += `\n\n========================================`;
    prompt += `\n✅ VERIFICATION CHECKLIST - ALL MUST BE CLICKABLE:`;
    prompt += `\n- [ ] Phone is CLICKABLE: <a href="tel:${data.phone}">`;
    prompt += `\n- [ ] WhatsApp is CLICKABLE: <a href="https://wa.me/...">`;
    prompt += `\n- [ ] Email is CLICKABLE: <a href="mailto:${data.email}">`;
    if (data.address) {
        prompt += `\n- [ ] Address is CLICKABLE: <a href="https://www.google.com/maps/search/...">`;
    }
    prompt += `\n- [ ] NO plain text for contact details - ALL must be links!`;
    prompt += `\n========================================`;
    
    // Add specific data to prompt
    if (data.title) {
        prompt += `\n\nTitle: ${data.title}`;
    }
    if (data.description) {
        prompt += `\n\nDescription: ${data.description}`;
    }
    if (data.websiteLink) {
        prompt += `\n\nMain Link: ${data.websiteLink}`;
    }
    if (data.additionalLink) {
        prompt += `\n\nAdditional External Link: ${data.additionalLink}`;
    }
    if (data.buttonText) {
        prompt += `\n\nButton Text: ${data.buttonText}`;
    }
    if (data.productManagement) {
        prompt += `\n\nProduct Management: ${data.productManagement}`;
    }
    if (data.menuItems) {
        prompt += `\n\nMenu Items: ${data.menuItems}`;
    }
    if (data.pricing) {
        prompt += `\n\nPricing: ${data.pricing}`;
    }
    if (data.courseDetails) {
        prompt += `\n\nCourse Details: ${data.courseDetails}`;
    }
    
    // Add courses data for digital course platforms
    if (data.courses && data.courses.length > 0) {
        console.log('📝 Adding courses to prompt:', data.courses);
        
        prompt += `\n\n========================================`;
        prompt += `\n📚 **DIGITAL COURSES** (${data.courses.length} courses)`;
        prompt += `\n========================================`;
        prompt += `\n\n⚠️⚠️⚠️ CRITICAL INSTRUCTIONS ⚠️⚠️⚠️`;
        prompt += `\n- YOU MUST CREATE EXACTLY ${data.courses.length} COURSE CARDS`;
        prompt += `\n- DO NOT CREATE YOUR OWN COURSES`;
        prompt += `\n- DO NOT CHANGE THE COURSE NAMES, PRICES, OR DESCRIPTIONS`;
        prompt += `\n- USE THE EXACT DATA PROVIDED BELOW`;
        prompt += `\n\n**CREATE ONE COURSE CARD FOR EACH OF THE FOLLOWING:**`;
        
        data.courses.forEach((course, index) => {
            prompt += `\n\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`;
            prompt += `\n**Course ${index + 1} of ${data.courses.length}:**`;
            prompt += `\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`;
            prompt += `\n📝 Course Name (EXACT): "${course.name}"`;
            prompt += `\n🎥 Video Link: ${course.video}`;
            prompt += `\n💰 Price (EXACT): ₪${course.price}`;
            prompt += `\n📄 Description (EXACT): "${course.description}"`;
            prompt += `\n🔘 Button Code (EXACT): onclick="addToCart('${course.name}', ${course.price}, 'THUMBNAIL_URL', event)"`;
            prompt += `\n🖼️ Thumbnail: Use Unsplash education/learning image`;
        });
        
        prompt += `\n\n========================================`;
        prompt += `\n✅ VERIFICATION CHECKLIST:`;
        prompt += `\n- [ ] Created ${data.courses.length} course cards (not more, not less)`;
        prompt += `\n- [ ] Used exact course names from above`;
        prompt += `\n- [ ] Used exact prices from above`;
        prompt += `\n- [ ] Used exact descriptions from above`;
        prompt += `\n- [ ] Used exact onclick code for each button`;
        prompt += `\n========================================`;
        prompt += `\n\n**AFTER PURCHASE**: The video should be accessible to the user.`;
        
        console.log('✅ Courses section added to prompt');
    } else {
        console.warn('⚠️ No courses data found! data.courses:', data.courses);
    }
    
    // Add workshop details for live courses
    if (data.workshopDate || data.workshopLocation || data.instructorName) {
        prompt += `\n\n🎓 **Workshop/Webinar Details**:`;
        if (data.workshopDate) prompt += `\n- Date: ${data.workshopDate}`;
        if (data.workshopLocation) prompt += `\n- Location: ${data.workshopLocation}`;
        if (data.instructorName) prompt += `\n- Instructor: ${data.instructorName}`;
        if (data.instructorBio) prompt += `\n- Instructor Bio: ${data.instructorBio}`;
    }
    
    // Add style information
    prompt += `\n\nStyle: ${data.style}`;
    
    // Add language information
    prompt += `\n\nLanguage: Hebrew (RTL)`;
    prompt += `\n\nCurrency: Israeli Shekel (₪)`;
    
    // Add Floating CTA if enabled
    if (data.floatingCta && data.floatingCta.enabled) {
        prompt += `\n\n=== FLOATING CALL-TO-ACTION BUTTON ===`;
        prompt += `\n\nCREATE A FLOATING CALL-TO-ACTION BUTTON with the following specifications:`;
        prompt += `\n\n1. **Button Text**: "${data.floatingCta.text}"`;
        prompt += `\n2. **Position**: ${data.floatingCta.position}`;
        prompt += `\n3. **Style**: ${data.floatingCta.style}`;
        
        if (data.floatingCta.link) {
            prompt += `\n4. **Action**: Link to ${data.floatingCta.link}`;
        } else {
            prompt += `\n4. **Action**: Scroll to #cta section (if exists) or to contact form`;
        }
        
        prompt += `\n\n**STYLE SPECIFICATIONS:**`;
        
        if (data.floatingCta.style === 'solid') {
            prompt += `\n- Background: Solid bright color (e.g., #FF6B6B, #4ECDC4, #FFD93D)`;
            prompt += `\n- Shadow: Large shadow for depth (box-shadow: 0 4px 20px rgba(0,0,0,0.3))`;
        } else if (data.floatingCta.style === 'gradient') {
            prompt += `\n- Background: Linear gradient (e.g., linear-gradient(135deg, #667eea 0%, #764ba2 100%))`;
            prompt += `\n- Shadow: Large shadow with gradient color tint`;
        } else if (data.floatingCta.style === 'pulse') {
            prompt += `\n- Background: Solid bright color`;
            prompt += `\n- Animation: Continuous pulse effect using CSS @keyframes`;
            prompt += `\n- CSS: @keyframes pulse { 0%, 100% { transform: scale(1); } 50% { transform: scale(1.05); } }`;
            prompt += `\n- Apply: animation: pulse 2s ease-in-out infinite;`;
        } else if (data.floatingCta.style === 'flash') {
            prompt += `\n- Background: Bright color that flashes`;
            prompt += `\n- Animation: Flashing effect using CSS @keyframes`;
            prompt += `\n- CSS: @keyframes flash { 0%, 50%, 100% { opacity: 1; } 25%, 75% { opacity: 0.7; } }`;
            prompt += `\n- Apply: animation: flash 1.5s ease-in-out infinite;`;
        }
        
        prompt += `\n\n**POSITION SPECIFICATIONS:**`;
        if (data.floatingCta.position === 'bottom-right') {
            prompt += `\n- position: fixed; bottom: 20px; right: 20px; (for LTR)`;
            prompt += `\n- position: fixed; bottom: 20px; left: 20px; (for RTL)`;
        } else if (data.floatingCta.position === 'bottom-left') {
            prompt += `\n- position: fixed; bottom: 20px; left: 20px; (for LTR)`;
            prompt += `\n- position: fixed; bottom: 20px; right: 20px; (for RTL)`;
        } else if (data.floatingCta.position === 'bottom-center') {
            prompt += `\n- position: fixed; bottom: 20px; left: 50%; transform: translateX(-50%);`;
        } else if (data.floatingCta.position === 'top-center') {
            prompt += `\n- position: fixed; top: 20px; left: 50%; transform: translateX(-50%);`;
        }
        
        prompt += `\n- z-index: 9999; (ensure it's above all content)`;
        prompt += `\n- padding: 16px 32px;`;
        prompt += `\n- border-radius: 50px;`;
        prompt += `\n- font-size: 18px;`;
        prompt += `\n- font-weight: bold;`;
        prompt += `\n- color: white;`;
        prompt += `\n- cursor: pointer;`;
        prompt += `\n- transition: all 0.3s ease;`;
        prompt += `\n- On hover: transform: translateY(-2px); box-shadow: 0 6px 25px rgba(0,0,0,0.4);`;
        
        // Add countdown timer if enabled
        if (data.floatingCta.countdown && data.floatingCta.countdown.enabled && data.floatingCta.countdown.date) {
            const countdownDateTime = `${data.floatingCta.countdown.date}T${data.floatingCta.countdown.time}`;
            prompt += `\n\n**COUNTDOWN TIMER:**`;
            prompt += `\n- Display above the button: "${data.floatingCta.countdown.text}"`;
            prompt += `\n- Target date/time: ${countdownDateTime}`;
            prompt += `\n- Format: "XX ימים XX שעות XX דקות XX שניות"`;
            prompt += `\n- Style: Small text above button, same color scheme`;
            prompt += `\n- Update every second using JavaScript`;
            prompt += `\n\n**COUNTDOWN JAVASCRIPT:**`;
            prompt += `\n<script>`;
            prompt += `\nconst countdownDate = new Date('${countdownDateTime}').getTime();`;
            prompt += `\nconst countdownElement = document.getElementById('countdown-timer');`;
            prompt += `\nconst updateCountdown = () => {`;
            prompt += `\n  const now = new Date().getTime();`;
            prompt += `\n  const distance = countdownDate - now;`;
            prompt += `\n  if (distance < 0) {`;
            prompt += `\n    countdownElement.innerHTML = 'המבצע הסתיים';`;
            prompt += `\n    return;`;
            prompt += `\n  }`;
            prompt += `\n  const days = Math.floor(distance / (1000 * 60 * 60 * 24));`;
            prompt += `\n  const hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));`;
            prompt += `\n  const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));`;
            prompt += `\n  const seconds = Math.floor((distance % (1000 * 60)) / 1000);`;
            prompt += `\n  countdownElement.innerHTML = days + ' ימים ' + hours + ' שעות ' + minutes + ' דקות ' + seconds + ' שניות';`;
            prompt += `\n};`;
            prompt += `\nupdateCountdown();`;
            prompt += `\nsetInterval(updateCountdown, 1000);`;
            prompt += `\n</script>`;
        }
        
        prompt += `\n\n**IMPORTANT**: The floating CTA button must be ALWAYS VISIBLE on scroll, positioned FIXED, and have HIGH z-index to stay above all content.`;
    }
    
    return prompt;
}

// Export functions for use in main HTML file
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        handleFormSubmit,
        addFooterLinks,
        generateHtmlFromApi,
        injectStoreScripts
    };
}
