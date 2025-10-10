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
    
    // Add style information
    prompt += `\n\nStyle: ${data.style}`;
    
    // Add language information
    prompt += `\n\nLanguage: Hebrew (RTL)`;
    prompt += `\n\nCurrency: Israeli Shekel (₪)`;
    
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
