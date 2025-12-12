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
    
    // Collect property details if this is a real estate page
    if (data.pageType === 'realEstate') {
        console.log('🏠 Collecting property details for realEstate page...');
        
        // Collect property specs
        data.propertyDetails = {
            beds: document.getElementById('propertyBeds')?.value || '3',
            baths: document.getElementById('propertyBaths')?.value || '2',
            sqm: document.getElementById('propertySqm')?.value || '120',
            price: document.getElementById('propertyPrice')?.value || '2,500,000',
            agentName: document.getElementById('agentName')?.value || 'משה כהן'
        };
        
        // Note: Actual image files will be uploaded separately via /api/upload-image
        // These fields are just for form reference
        const mainImageFile = document.getElementById('propertyMainImage')?.files[0];
        const image1File = document.querySelector('input[name="propertyImage1"]')?.files[0];
        const image2File = document.querySelector('input[name="propertyImage2"]')?.files[0];
        const image3File = document.querySelector('input[name="propertyImage3"]')?.files[0];
        const image4File = document.querySelector('input[name="propertyImage4"]')?.files[0];
        const agentPhotoFile = document.getElementById('agentPhoto')?.files[0];
        
        data.propertyDetails.hasMainImage = !!mainImageFile;
        data.propertyDetails.hasGalleryImages = [image1File, image2File, image3File, image4File].filter(Boolean).length;
        data.propertyDetails.hasAgentPhoto = !!agentPhotoFile;
        
        console.log('📊 Property details:', data.propertyDetails);
        console.log(`📸 Images: Main=${!!mainImageFile}, Gallery=${data.propertyDetails.hasGalleryImages}, Agent=${!!agentPhotoFile}`);
    }

    // Collect menu categories if this is a restaurant menu page
    if (data.pageType === 'restaurantMenu') {
        console.log('🍽️ Collecting menu categories for restaurantMenu page...');
        
        const categoryContainers = document.querySelectorAll('.menu-category-item');
        data.menuCategories = [];
        
        categoryContainers.forEach((container, categoryIndex) => {
            const categoryName = container.querySelector('input[name="categoryName[]"]')?.value || `קטגוריה ${categoryIndex + 1}`;
            
            // Get all items in this category
            const itemNames = container.querySelectorAll(`input[name="itemName_${categoryIndex}[]"]`);
            const itemPrices = container.querySelectorAll(`input[name="itemPrice_${categoryIndex}[]"]`);
            const itemDescriptions = container.querySelectorAll(`input[name="itemDescription_${categoryIndex}[]"]`);
            
            const items = [];
            for (let i = 0; i < itemNames.length; i++) {
                if (itemNames[i].value.trim()) {
                    // Collect options for this item
                    const options = [];
                    const optionNames = container.querySelectorAll(`input[name="itemOptionName_${categoryIndex}_${i}[]"]`);
                    const optionPrices = container.querySelectorAll(`input[name="itemOptionPrice_${categoryIndex}_${i}[]"]`);
                    const optionTypes = container.querySelectorAll(`select[name="itemOptionType_${categoryIndex}_${i}[]"]`);
                    
                    for (let j = 0; j < optionNames.length; j++) {
                        const optionName = optionNames[j]?.value?.trim();
                        const optionPrice = optionPrices[j]?.value?.trim();
                        const optionType = optionTypes[j]?.value?.trim();
                        
                        if (optionName) {
                            options.push({
                                name: optionName,
                                price: optionPrice || '0',
                                type: optionType || 'single'
                            });
                        }
                    }
                    
                    items.push({
                        name: itemNames[i].value.trim(),
                        price: itemPrices[i].value || '0',
                        description: itemDescriptions[i].value.trim() || '',
                        options: options
                    });
                }
            }
            
            if (items.length > 0) {
                data.menuCategories.push({
                    name: categoryName,
                    items: items
                });
                console.log(`📋 Category "${categoryName}": ${items.length} items`);
            }
        });
        
        console.log('✅ Total categories collected:', data.menuCategories.length);
        console.log('📦 Menu data:', data.menuCategories);
    }
    
    // Collect branches data for pages with physical addresses (NOT for landing pages)
    if (data.pageType === 'onlineStore' || data.pageType === 'serviceProvider' || 
        data.pageType === 'realEstate' || data.pageType === 'product' || 
        data.pageType === 'restaurantMenu' || data.pageType === 'event' || data.pageType === 'general') {
        console.log('🏢 Collecting branches data for page type:', data.pageType);
        
        const branchNames = document.getElementsByName('branchName[]');
        const branchAddresses = document.getElementsByName('branchAddress[]');
        const branchPhones = document.getElementsByName('branchPhone[]');
        
        data.branches = [];
        
        for (let i = 0; i < branchNames.length; i++) {
            const name = branchNames[i]?.value?.trim();
            const address = branchAddresses[i]?.value?.trim();
            const phone = branchPhones[i]?.value?.trim();
            
            if (name || address || phone) {
                data.branches.push({
                    name: name || `סניף ${i + 1}`,
                    address: address || '',
                    phone: phone || ''
                });
            }
        }
        
        console.log('✅ Total branches collected:', data.branches.length);
        console.log('🏢 Branches data:', data.branches);
    }

    // הוסף נתוני שפה ומדינה
    data = addLanguageToPageData(data);

    const masterPrompt = createMasterPrompt(data);

    switchView(ui.formView, ui.previewView);

    try {
        let htmlContent = await generateHtmlFromApi(masterPrompt);
        
        // Add store JavaScript if this is an online store or restaurant menu
        if (data.pageType === 'onlineStore' || data.pageType === 'restaurantMenu') {
            console.log(`Detected ${data.pageType}, injecting store scripts...`);
            // Use the store injector function directly
            htmlContent = injectStoreScripts(htmlContent);
            console.log('Store scripts injected successfully');
        }
        
        // Add appointment JavaScript if this is a serviceProvider with appointments
        if (data.pageType === 'serviceProvider' && (data.appointments === 'true' || data.appointments === true || data.appointments === 'on')) {
            console.log(`Detected serviceProvider with appointments, injecting appointment scripts...`);
            htmlContent = injectAppointmentScripts(htmlContent);
            console.log('Appointment scripts injected successfully');
        }
        
        // Enforcement: ensure mandatory bubbles/buttons are present (per page type)
        let processedHtml = ensureMandatoryFloatingElements(htmlContent, data);

        // הוסף קישורים לתחתית הדף
        const finalHtml = addFooterLinks(processedHtml, data);
        
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

// Ensure AI/WhatsApp/Accessibility bubbles exist where required (except flyer/post/checkout)
function ensureMandatoryFloatingElements(htmlContent, data) {
    try {
        const pageType = (data?.pageType || '').toLowerCase();
        const excludedTypes = new Set(['flyer', 'post', 'checkout']);
        if (excludedTypes.has(pageType)) return htmlContent;

        // Normalize content for checks
        const lc = (htmlContent || '').toLowerCase();

        // Helper: inject before </body>
        const injectBeforeBodyEnd = (snippet) => {
            if (!snippet) return htmlContent;
            if (lc.includes('</body>')) {
                return htmlContent.replace(/</body>/i, snippet + '\n</body>');
            }
            return (htmlContent || '') + '\n' + snippet;
        };

        // WhatsApp bubble enforcement
        const hasWhatsApp = lc.includes('wa.me') || lc.includes('whatsapp-bubble');
        if (!hasWhatsApp) {
            const rawPhone = (data?.phone || data?.businessPhone || '').toString();
            const cleaned = rawPhone.replace(/[^\d]/g, '');
            const intl = cleaned.startsWith('972') ? cleaned : (cleaned.startsWith('0') ? ('972' + cleaned.slice(1)) : cleaned);
            const waPhone = intl && intl.length >= 9 ? intl : '972504443333';
            const waSnippet = `\n<!-- WhatsApp Floating Bubble (auto-injected) -->\n<a class="whatsapp-bubble" href="https://wa.me/${waPhone}?text=${encodeURIComponent('שלום! יש לי שאלה') }"\n   style="position: fixed; bottom: 20px; left: 20px; width: 64px; height: 64px; background: linear-gradient(135deg, #25D366 0%, #128C7E 100%); border-radius: 50%; display: flex; align-items: center; justify-content: center; box-shadow: 0 4px 12px rgba(37, 211, 102, 0.4); z-index: 10000; transition: transform 0.3s ease;"\n   aria-label="פתח וואטסאפ" target="_blank" rel="noopener">\n   <svg xmlns="http://www.w3.org/2000/svg" width="30" height="30" viewBox="0 0 24 24" fill="#fff" aria-hidden="true"><path d="M.057 24l1.687-6.163a10.9 10.9 0 01-1.62-5.729C.122 5.281 5.403 0 12.057 0c3.19 0 6.167 1.244 8.412 3.488A11.82 11.82 0 0124 11.936c-.003 6.653-5.284 11.936-11.938 11.936a11.95 11.95 0 01-6.119-1.675L.057 24zm6.597-3.807c1.766.995 3.003 1.591 5.347 1.591 5.448 0 9.886-4.434 9.889-9.877.003-5.462-4.415-9.89-9.881-9.893-5.452 0-9.887 4.434-9.889 9.881 0 2.225.651 3.891 1.746 5.564l-.999 3.648 3.787-.914zm11.387-5.464c-.074-.124-.272-.198-.57-.347-.297-.149-1.758-.868-2.03-.967-.272-.099-.47-.149-.669.149-.198.297-.767.967-.94 1.165-.173.198-.347.223-.644.074-.297-.149-1.255-.462-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.297-.347.446-.521.149-.173.198-.297.297-.495.099-.198.05-.372-.025-.521-.074-.149-.669-1.611-.916-2.206-.242-.579-.487-.501-.669-.51l-.57-.01c-.198 0-.52.074-.792.372s-1.04 1.016-1.04 2.479 1.065 2.876 1.213 3.074c.149.198 2.095 3.2 5.076 4.487.709.306 1.262.489 1.694.626.712.226 1.36.194 1.872.117.571-.085 1.758-.718 2.006-1.41.248-.694.248-1.289.173-1.41z"/></svg>\n</a>`;
            htmlContent = injectBeforeBodyEnd(waSnippet);
        }

        return htmlContent;
    } catch (e) {
        console.error('ensureMandatoryFloatingElements failed:', e);
        return htmlContent;
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

// Inject appointment booking scripts for serviceProvider pages
function injectAppointmentScripts(htmlContent) {
    console.log('Starting appointment script injection...');
    
    // Check if appointment booking form exists
    const hasBookingForm = htmlContent.includes('id="booking-form"') || htmlContent.includes('id="contact-form"');
    const hasAppointmentKeywords = htmlContent.includes('appointment') || htmlContent.includes('calendar') || htmlContent.includes('selected-date') || htmlContent.includes('selected-time');
    
    if (!hasBookingForm && !hasAppointmentKeywords) {
        console.log('No appointment form found, skipping injection');
        return htmlContent;
    }
    
    // Check if scripts already exist
    if (htmlContent.includes('Appointment Booking Handler') || htmlContent.includes('generateTimeSlots')) {
        console.log('Appointment scripts already exist, skipping injection');
        return htmlContent;
    }
    
    console.log('Injecting fresh appointment scripts...');
    
    const appointmentScript = `
<script>
console.log('📅 Appointment scripts loaded!');

// 📅 Appointment Booking Handler
document.addEventListener('DOMContentLoaded', function() {
  const bookingForm = document.getElementById('booking-form') || document.getElementById('contact-form');
  
  if (bookingForm) {
    console.log('✅ Booking form found, initializing...');
    
    // Handle form submission
    bookingForm.addEventListener('submit', async function(e) {
      e.preventDefault();
      
      // Get form data
      const formData = new FormData(bookingForm);
      const appointmentDate = document.getElementById('appointment-date')?.value || document.getElementById('selected-date')?.value;
      const appointmentTime = document.getElementById('appointment-time')?.value || document.getElementById('selected-time')?.value;
      
      // Validate date and time
      if (!appointmentDate || !appointmentTime) {
        alert('❌ אנא בחר תאריך ושעה לתור');
        return;
      }
      
      // Get userId and pageId from URL path
      const pathParts = window.location.pathname.split('/');
      const userId = pathParts[2];
      const pageId = pathParts[3].replace('.html', '');
      
      // Prepare appointment data
      const appointmentData = {
        userId: userId,
        pageId: pageId,
        customerName: formData.get('name'),
        name: formData.get('name'),
        phone: formData.get('phone'),
        email: formData.get('email') || '',
        service: formData.get('service') || '',
        date: appointmentDate,
        time: appointmentTime,
        duration: formData.get('duration') || '',
        price: formData.get('price') || '',
        notes: formData.get('notes') || ''
      };
      
      console.log('📅 Sending appointment:', appointmentData);
      
      try {
        // Send to API
        const response = await fetch('/api/appointments', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(appointmentData)
        });
        
        const result = await response.json();
        
        if (result.success) {
          // Success message
          alert('✅ התור נקבע בהצלחה!\\n\\n📅 תאריך: ' + appointmentDate + '\\n🕐 שעה: ' + appointmentTime + '\\n\\nנתראה בקרוב! 😊');
          
          // Reset form
          bookingForm.reset();
          if (document.getElementById('appointment-date')) {
            document.getElementById('appointment-date').value = '';
          }
          if (document.getElementById('appointment-time')) {
            document.getElementById('appointment-time').value = '';
          }
          if (document.getElementById('selected-date')) {
            document.getElementById('selected-date').value = '';
          }
          if (document.getElementById('selected-time')) {
            document.getElementById('selected-time').value = '';
          }
          
          // Scroll to top
          window.scrollTo({ top: 0, behavior: 'smooth' });
        } else {
          alert('❌ שגיאה בשמירת התור. אנא נסה שוב.');
        }
      } catch (error) {
        console.error('Error saving appointment:', error);
        alert('❌ שגיאה בשמירת התור. אנא נסה שוב או צור קשר טלפונית.');
      }
    });
  }
  
  // Initialize time slots if needed
  const timeSlotsGrid = document.getElementById('time-slots-grid');
  const dateSelector = document.getElementById('selected-date-display');
  
  if (timeSlotsGrid || dateSelector) {
    console.log('✅ Time slots interface found, initializing calendar...');
    
    let currentDate = new Date();
    currentDate.setHours(0, 0, 0, 0);
    
    // Generate time slots for a day
    function generateTimeSlots(date) {
      if (!timeSlotsGrid) return;
      
      timeSlotsGrid.innerHTML = '';
      
      // Default working hours: 9:00 - 18:00
      const workingHours = { start: 9, end: 18 };
      const slotDuration = 30; // minutes
      
      const slots = [];
      for (let hour = workingHours.start; hour < workingHours.end; hour++) {
        for (let minute = 0; minute < 60; minute += slotDuration) {
          const timeString = \`\${String(hour).padStart(2, '0')}:\${String(minute).padStart(2, '0')}\`;
          slots.push(timeString);
        }
      }
      
      // Create slot buttons
      slots.forEach(time => {
        const slotBtn = document.createElement('button');
        slotBtn.type = 'button';
        slotBtn.className = 'time-slot available';
        slotBtn.textContent = time;
        slotBtn.onclick = function() {
          // Remove selection from all slots
          document.querySelectorAll('.time-slot').forEach(s => s.classList.remove('selected'));
          // Mark this slot as selected
          this.classList.add('selected');
          // Update hidden input
          if (document.getElementById('appointment-time')) {
            document.getElementById('appointment-time').value = time;
          }
        };
        timeSlotsGrid.appendChild(slotBtn);
      });
    }
    
    // Update date display
    function updateDateDisplay() {
      if (!dateSelector) return;
      
      const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
      dateSelector.textContent = currentDate.toLocaleDateString('he-IL', options);
      
      // Update hidden input
      if (document.getElementById('appointment-date')) {
        const year = currentDate.getFullYear();
        const month = String(currentDate.getMonth() + 1).padStart(2, '0');
        const day = String(currentDate.getDate()).padStart(2, '0');
        document.getElementById('appointment-date').value = \`\${year}-\${month}-\${day}\`;
      }
      
      // Update day name
      const dayName = document.getElementById('day-name');
      if (dayName) {
        dayName.textContent = currentDate.toLocaleDateString('he-IL', { weekday: 'long' });
      }
      
      generateTimeSlots(currentDate);
    }
    
    // Previous day button
    const prevDayBtn = document.getElementById('prev-day');
    if (prevDayBtn) {
      prevDayBtn.addEventListener('click', function() {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        if (currentDate > today) {
          currentDate.setDate(currentDate.getDate() - 1);
          updateDateDisplay();
        }
      });
    }
    
    // Next day button
    const nextDayBtn = document.getElementById('next-day');
    if (nextDayBtn) {
      nextDayBtn.addEventListener('click', function() {
        currentDate.setDate(currentDate.getDate() + 1);
        updateDateDisplay();
      });
    }
    
    // Quick date buttons
    const quickDateBtns = document.querySelectorAll('.quick-date-btn');
    quickDateBtns.forEach((btn, index) => {
      btn.addEventListener('click', function() {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        currentDate = new Date(today);
        currentDate.setDate(today.getDate() + index);
        updateDateDisplay();
      });
    });
    
    // Initialize
    updateDateDisplay();
  }
});

// Add selected style for time slots
const style = document.createElement('style');
style.textContent = \`
  .time-slot {
    padding: 12px;
    border: 2px solid #ddd;
    border-radius: 8px;
    cursor: pointer;
    transition: all 0.3s;
    text-align: center;
    font-weight: 600;
  }
  .time-slot.available {
    background: #d4edda;
    border-color: #28a745;
    color: #155724;
  }
  .time-slot.available:hover {
    background: #28a745;
    color: white;
    transform: translateY(-2px);
  }
  .time-slot.selected {
    background: #007bff !important;
    border-color: #0056b3 !important;
    color: white !important;
    transform: scale(1.05);
  }
\`;
document.head.appendChild(style);

console.log('✅ Appointment system initialized successfully!');
</script>
`;

    // Insert before </body> tag
    if (htmlContent.includes('</body>')) {
        htmlContent = htmlContent.replace('</body>', appointmentScript + '</body>');
        console.log('Appointment scripts injected before </body> tag');
    } else {
        // If no </body> tag, append at the end
        htmlContent += appointmentScript;
        console.log('Appointment scripts appended to end of HTML');
    }
    
    console.log('Appointment script injection completed');
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
            prompt += `\n🔘 Purchase Button (EXACT): <button onclick="purchaseCourse('${course.name.replace(/'/g, "\\'")}', ${course.price})" class="btn-purchase">קנה עכשיו - ₪${course.price}</button>`;
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
    
    // Add menu categories data for restaurant menus
    if (data.menuCategories && data.menuCategories.length > 0) {
        console.log('📝 Adding menu categories to prompt:', data.menuCategories);
        
        prompt += `\n\n========================================`;
        prompt += `\n🍽️ **RESTAURANT MENU** (${data.menuCategories.length} categories)`;
        prompt += `\n========================================`;
        prompt += `\n\n⚠️⚠️⚠️ CRITICAL INSTRUCTIONS ⚠️⚠️⚠️`;
        prompt += `\n- YOU MUST CREATE EXACTLY ${data.menuCategories.length} CATEGORIES`;
        prompt += `\n- DO NOT CREATE YOUR OWN MENU ITEMS`;
        prompt += `\n- DO NOT CHANGE THE NAMES, PRICES, OR DESCRIPTIONS`;
        prompt += `\n- USE THE EXACT DATA PROVIDED BELOW`;
        prompt += `\n- ORGANIZE ITEMS BY CATEGORY SECTIONS`;
        prompt += `\n\n**CREATE MENU SECTIONS FOR EACH OF THE FOLLOWING CATEGORIES:**`;
        
        data.menuCategories.forEach((category, catIndex) => {
            prompt += `\n\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`;
            prompt += `\n**Category ${catIndex + 1} of ${data.menuCategories.length}: ${category.name}**`;
            prompt += `\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`;
            prompt += `\n\n🍴 **${category.name}** - ${category.items.length} items`;
            prompt += `\n\nCreate a section with category title "${category.name}" and the following menu items:`;
            
            category.items.forEach((item, itemIndex) => {
                prompt += `\n\n   ${itemIndex + 1}. **${item.name}**`;
                prompt += `\n      • Price (EXACT): ₪${item.price}`;
                if (item.description) {
                    prompt += `\n      • Description: "${item.description}"`;
                }
                
                // Add options if they exist
                if (item.options && item.options.length > 0) {
                    prompt += `\n      • Options:`;
                    item.options.forEach((option, optionIndex) => {
                        prompt += `\n        - ${option.name} (${option.type === 'single' ? 'single choice' : 'multiple choice'})`;
                        if (option.price && option.price !== '0') {
                            prompt += ` - +₪${option.price}`;
                        }
                    });
                }
                
                prompt += `\n      • Button (EXACT): <button onclick="addToCart('${item.name.replace(/'/g, "\\'")}', ${item.price}, 'food-image-url', event)" class="btn-add-to-cart">הוסף לעגלה</button>`;
                prompt += `\n      • Image: Use Unsplash food/dish image for "${item.name}"`;
            });
        });
        
        prompt += `\n\n========================================`;
        prompt += `\n✅ VERIFICATION CHECKLIST:`;
        prompt += `\n- [ ] Created ${data.menuCategories.length} category sections`;
        prompt += `\n- [ ] Used exact category names from above`;
        prompt += `\n- [ ] Created exact number of items per category`;
        prompt += `\n- [ ] Used exact item names, prices, and descriptions`;
        prompt += `\n- [ ] Used exact onclick code for each button (with 'event' parameter)`;
        prompt += `\n- [ ] Each item has an appetizing food image`;
        prompt += `\n========================================`;
        
        console.log('✅ Menu categories section added to prompt');
    }
    
    // Add branches data for pages with physical addresses
    if (data.branches && data.branches.length > 0) {
        console.log('🏢 Adding branches to prompt:', data.branches);
        
        prompt += `\n\n========================================`;
        prompt += `\n🏢 **BRANCHES** (${data.branches.length} branches)`;
        prompt += `\n========================================`;
        prompt += `\n\n⚠️⚠️⚠️ CRITICAL INSTRUCTIONS ⚠️⚠️⚠️`;
        prompt += `\n- YOU MUST CREATE A BRANCHES SECTION`;
        prompt += `\n- PLACE IT RIGHT AFTER THE ADDRESS/CONTACT SECTION`;
        prompt += `\n- DISPLAY ALL ${data.branches.length} BRANCHES`;
        prompt += `\n- USE THE EXACT DATA PROVIDED BELOW`;
        prompt += `\n- CREATE A "הוסף סניפים שלנו" BUTTON`;
        prompt += `\n\n**CREATE BRANCHES SECTION WITH THE FOLLOWING BRANCHES:**`;
        
        data.branches.forEach((branch, branchIndex) => {
            prompt += `\n\n   ${branchIndex + 1}. **${branch.name || 'סניף ' + (branchIndex + 1)}**`;
            if (branch.address) {
                prompt += `\n      • Address: ${branch.address}`;
            }
            if (branch.phone) {
                prompt += `\n      • Phone: ${branch.phone}`;
            }
        });
        
        prompt += `\n\n**BRANCHES SECTION LAYOUT:`;
        prompt += `\n- Title: "סניפים שלנו" or "מיקומים"`;
        prompt += `\n- Place immediately after contact/address section`;
        prompt += `\n- Show each branch with name, address, and phone`;
        prompt += `\n- Use clean, organized layout (cards or list)`;
        prompt += `\n- Add "הוסף סניפים שלנו" button INSIDE the branches section`;
        
        prompt += `\n\n**CREATE A "הוסף סניפים שלנו" BUTTON THAT:`;
        prompt += `\n- PLACE IT AT THE BOTTOM OF THE BRANCHES SECTION (after all branches)`;
        prompt += `\n- STYLE IT AS A SMALL, SECONDARY BUTTON (not prominent)`;
        prompt += `\n- POSITION IT BELOW THE ADDRESS/CONTACT INFO`;
        prompt += `\n- OPENS A MODAL OR SIDEBAR`;
        prompt += `\n- ALLOWS ADDING NEW BRANCHES`;
        prompt += `\n- DISPLAYS ALL EXISTING BRANCHES`;
        prompt += `\n- ALLOWS EDITING/DELETING BRANCHES**`;
        
        prompt += `\n\n**BUTTON STYLING:`;
        prompt += `\n- Small size (not large/prominent)`;
        prompt += `\n- Secondary color (gray or light)`;
        prompt += `\n- Positioned at bottom of branches list`;
        prompt += `\n- Text: "הוסף סניפים שלנו" or "ניהול סניפים"`;
        
        prompt += `\n\n========================================`;
        prompt += `\n✅ VERIFICATION CHECKLIST:`;
        prompt += `\n- [ ] Created branches section with all ${data.branches.length} branches`;
        prompt += `\n- [ ] Used exact branch names, addresses, and phone numbers`;
        prompt += `\n- [ ] Created "הוסף סניפים שלנו" button`;
        prompt += `\n- [ ] Button opens modal/sidebar for branch management`;
        prompt += `\n========================================`;
        
        console.log('✅ Branches section added to prompt');
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
    
    
    return prompt;
}

// Export functions for use in main HTML file
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        handleFormSubmit,
        addFooterLinks,
        generateHtmlFromApi,
        injectStoreScripts,
        injectAppointmentScripts
    };
}
