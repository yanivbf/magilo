const express = require('express');
const cors = require('cors');
const path = require('path');
const fs = require('fs-extra');
const multer = require('multer');

const app = express();
const PORT = process.env.PORT || 3002;

// Database management
const DATABASE_FILE = 'database.json';

// Load database
function loadDatabase() {
    try {
        if (fs.existsSync(DATABASE_FILE)) {
            return JSON.parse(fs.readFileSync(DATABASE_FILE, 'utf8'));
        }
        return {
            users: {},
            purchases: {},
            products: {},
            stores: {},
            analytics: {
                totalSales: 0,
                totalUsers: 0,
                totalProducts: 0,
                dailySales: {},
                monthlySales: {},
                topProducts: [],
                recentPurchases: []
            }
        };
    } catch (error) {
        console.error('Error loading database:', error);
        return {
            users: {},
            purchases: {},
            products: {},
            stores: {},
            analytics: {
                totalSales: 0,
                totalUsers: 0,
                totalProducts: 0,
                dailySales: {},
                monthlySales: {},
                topProducts: [],
                recentPurchases: []
            }
        };
    }
}

// Save database
function saveDatabase(data) {
    try {
        fs.writeFileSync(DATABASE_FILE, JSON.stringify(data, null, 2));
        return true;
    } catch (error) {
        console.error('Error saving database:', error);
        return false;
    }
}

// Get user ID from session or create new one
function getUserId(req) {
    let userId = req.headers['user-id'] || req.body.userId || req.query.userId;
    if (!userId) {
        userId = 'user_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
    }
    return userId;
}

// Middleware
app.use(cors());
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));

// Add CSP headers to prevent the Chrome DevTools error
app.use((req, res, next) => {
  res.setHeader('Content-Security-Policy', "default-src 'self' 'unsafe-inline' 'unsafe-eval' data: blob:; connect-src 'self' https:; img-src 'self' data: blob: https:; script-src 'self' 'unsafe-inline' 'unsafe-eval' https:; style-src 'self' 'unsafe-inline' https:; font-src 'self' https:; frame-src 'self' https://www.youtube.com https://www.youtube-nocookie.com https://accounts.google.com;");
  next();
});

app.use(express.static('public'));

// Serve index.html at root path
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Serve marketplace.html at /marketplace
app.get('/marketplace', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'marketplace.html'));
});

// Also serve marketplace.html directly
app.get('/marketplace.html', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'marketplace.html'));
});

// Serve generated pages from output directory with proper HTML content type
app.use('/pages', (req, res, next) => {
    // Set content type to HTML for .html files
    if (req.path.endsWith('.html') || req.path.includes('html')) {
        res.setHeader('Content-Type', 'text/html; charset=utf-8');
    }
    next();
}, express.static('output'));

// Serve HTML files with correct Content-Type under /users route
app.get('/users/:userId/:fileName', (req, res) => {
    const { userId, fileName } = req.params;
    const filePath = path.join(__dirname, 'output', userId, fileName);
    
    res.setHeader('Content-Type', 'text/html; charset=utf-8');
    res.sendFile(filePath, (err) => {
        if (err) {
            res.status(404).send('File not found');
        }
    });
});

// Serve all assets
app.use('/output', express.static(path.join(__dirname, 'output')));

// Serve clean pages for viewing (without editor tools)
app.get('/view/:userId/:fileName', async (req, res) => {
    try {
        const { userId, fileName } = req.params;
        const filePath = path.join('output', userId, fileName);
        
        if (!await fs.pathExists(filePath)) {
            return res.status(404).send('File not found');
        }
        
        let htmlContent = await fs.readFile(filePath, 'utf8');
        
        // הוסף DOCTYPE אם חסר
        if (!htmlContent.trim().toLowerCase().startsWith('<!doctype')) {
            htmlContent = '<!DOCTYPE html>\n' + htmlContent;
        }
        
        // הסר את כל הקוד של סרגל הכלים והעריכה
        // הסר script tags שקשורים לעריכה
        htmlContent = htmlContent.replace(/<script[^>]*>[\s\S]*?<\/script>/gi, function(match) {
            // שמור רק scripts שלא קשורים לעריכה
            if (match.includes('editor') || match.includes('edit') || match.includes('toolbar') || match.includes('tools')) {
                return '';
            }
            return match;
        });
        
        // הסר elements של סרגל הכלים
        htmlContent = htmlContent.replace(/<div[^>]*id="[^"]*(tools|editor|toolbar)[^"]*"[^>]*>[\s\S]*?<\/div>/gi, '');
        htmlContent = htmlContent.replace(/<div[^>]*class="[^"]*(tools|editor|toolbar)[^"]*"[^>]*>[\s\S]*?<\/div>/gi, '');
        
        res.setHeader('Content-Type', 'text/html; charset=utf-8');
        res.send(htmlContent);
        
    } catch (error) {
        console.error('Error serving clean page:', error);
        res.status(500).send('Error loading page');
    }
});

// Serve full app page
app.get('/full-app', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'full-app.html'));
});

// Serve reset password page
app.get('/reset-password', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'reset-password.html'));
});

// Serve page creator
app.get('/page-creator', (req, res) => {
    res.sendFile(path.join(__dirname, 'page-creator', 'page-creator.html'));
});

app.get('/page-creator/page-creator.html', (req, res) => {
    res.sendFile(path.join(__dirname, 'page-creator', 'page-creator.html'));
});

// Serve page-templates.js
app.get('/templates/page-templates.js', (req, res) => {
    res.setHeader('Content-Type', 'application/javascript');
    res.sendFile(path.join(__dirname, 'page-creator', 'templates', 'page-templates.js'));
});

app.get('/page-creator/templates/page-templates.js', (req, res) => {
    res.setHeader('Content-Type', 'application/javascript');
    res.sendFile(path.join(__dirname, 'page-creator', 'templates', 'page-templates.js'));
});

// Configure multer for image uploads
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    // Try to get userId from multiple sources
    const userId = req.body?.userId || req.params?.userId || req.query?.userId;
    const pageName = req.body?.pageName || 'general';
    
    console.log('📂 Multer destination - userId:', userId, 'pageName:', pageName);
    
    // If no userId, use a fallback
    const finalUserId = userId || 'temp_' + Date.now();
    
    // Create directory for images
    const pageDir = path.join('output', finalUserId, 'images', pageName);
    fs.ensureDirSync(pageDir);
    
    console.log('✅ Destination created:', pageDir);
    cb(null, pageDir);
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const filename = uniqueSuffix + path.extname(file.originalname);
    console.log('📝 Generated filename:', filename);
    cb(null, filename);
  }
});

const upload = multer({ 
  storage: storage,
  limits: {
    fileSize: 50 * 1024 * 1024 // 50MB
  },
  fileFilter: (req, file, cb) => {
    // Don't check userId here - multer fileFilter runs before body is parsed
    // We'll check userId in the route handler instead
    cb(null, true);
  }
});

// API Routes

// Create a new page
app.post('/api/create-page', async (req, res) => {
  try {
    const { userId, title, htmlContent, pageData, selectedPageType } = req.body;
    
    console.log('🔍 CREATE PAGE REQUEST:', {
      userId,
      title,
      selectedPageType,
      hasHtmlContent: !!htmlContent
    });
    
    if (!userId) {
      return res.status(400).json({ error: 'Missing userId' });
    }

    // Create user directory
    const userDir = path.join('output', userId);
    await fs.ensureDir(userDir);

    let pageHtml;
    let fileName;

    if (htmlContent) {
      // יש תוכן HTML מוכן - שמור אותו ישירות
      pageHtml = htmlContent;
      // Special naming for messageInBottle pages
      if (selectedPageType === 'messageInBottle') {
        fileName = `מסר_בבקבוק_${Date.now()}_html`.replace(/[^a-zA-Z0-9\u0590-\u05FF]/g, '_');
      } else {
      fileName = `${title || 'דף נחיתה'}_${Date.now()}_html`.replace(/[^a-zA-Z0-9\u0590-\u05FF]/g, '_');
      }
      
      // 🍾 For messageInBottle, inject metadata into the HTML
      if (selectedPageType === 'messageInBottle' && req.body.messageInBottleData) {
        const data = req.body.messageInBottleData;
        
        // Replace placeholders in the HTML with actual data
        pageHtml = pageHtml.replace(/\$\{name\}/g, data.name || '');
        pageHtml = pageHtml.replace(/\$\{request\}/g, data.request || '');
        pageHtml = pageHtml.replace(/\$\{area\}/g, data.area || '');
        pageHtml = pageHtml.replace(/\$\{phone\}/g, data.phone || 'לא צוין');
        pageHtml = pageHtml.replace(/\$\{price\}/g, data.price || '0');
        pageHtml = pageHtml.replace(/\$\{priceType\}/g, data.priceType || 'כללי');
        
        console.log('🍾 Injected messageInBottle data into HTML');
      }
    } else if (pageData) {
      // יש נתוני דף - צור HTML
      pageHtml = generatePageHtml(pageData, userId);
      fileName = `${pageData.title || 'דף נחיתה'}.html`.replace(/[^a-zA-Z0-9\u0590-\u05FF]/g, '_');
    } else {
      return res.status(400).json({ error: 'Missing htmlContent or pageData' });
    }
    
    // Use selectedPageType from client or auto-detect page type BEFORE saving
    let pageType = selectedPageType || 'generic';
    const lowerHtml = pageHtml.toLowerCase();
    
    console.log(`🎯 Page type from client: ${selectedPageType || 'not provided'}`);
    console.log(`🎯 Using page type: ${pageType}`);
    
    // FORCE messageInBottle if selectedPageType is messageInBottle
    if (selectedPageType === 'messageInBottle') {
      pageType = 'messageInBottle';
      console.log(`🍾 FORCED pageType to messageInBottle!`);
    }
    
    // Check for purchase/shopping indicators (always check for script injection)
    const purchaseKeywords = ['addtocart', 'shopping-cart', 'cart-icon', 'product-card', 'btn-add-cart', 
                             'מוצר', 'מחיר', 'קנה עכשיו', 'הוסף לעגלה', 'product', 'price', 'מחיר:', '₪',
                             'תשלום', 'payment', 'checkout', 'קנייה', 'רכישה', 'מתנה', 'gift'];
    const hasPurchaseKeywords = purchaseKeywords.some(keyword => lowerHtml.includes(keyword.toLowerCase()));
    
    // Detect page type using keyword analysis
    console.log('🔍 Analyzing page type...');
    
    // Check for RSVP/event indicators (HIGHEST PRIORITY)
    const eventKeywords = ['rsvp', 'אישור הגעה', 'מוזמנים', 'countdown-timer', 'חתונה', 'wedding', 'בר מצווה', 'אירוע', 'הזמנה לאירוע'];
    const hasEventKeywords = eventKeywords.some(keyword => lowerHtml.includes(keyword.toLowerCase()));
    
    // Check for APPOINTMENT/SERVICE PROVIDER keywords (HIGH PRIORITY)
    // Including professions like: barber, hairdresser, beauty salon, etc.
    const appointmentKeywords = ['תור', 'appointment', 'booking', 'קביעת תור', 'schedule', 'calendar', 'זמן פנוי', 'available time',
                                  'מספרה', 'barber', 'hairdresser', 'salon', 'יפהפה', 'תספורת', 'גילוח', 'טיפול שיער',
                                  'קוסמטיקאית', 'מסאז', 'פדיקור', 'מניקור', 'ציפורניים', 'אסתטיקאית', 'טיפוח'];
    const hasAppointmentKeywords = appointmentKeywords.some(keyword => lowerHtml.includes(keyword.toLowerCase()));
    
    // Check for STORE-specific keywords
    const storeKeywords = ['חנות', 'store', 'shop', 'מכירה', 'sale', 'מבצע'];
    const hasStoreKeywords = storeKeywords.some(keyword => lowerHtml.includes(keyword.toLowerCase()));
    
    // Check template selection from request
    const selectedTemplate = req.body.selectedPageType;
    console.log('📋 Selected template:', selectedTemplate);
    
    // Priority: Template selection (HIGHEST) > Event keywords > Appointment keywords > Store keywords > Generic
    // CRITICAL: Template selection ALWAYS wins, no matter what keywords are found
    if (selectedTemplate === 'event') {
      pageType = 'event';
      console.log(`🎯 DETECTED from TEMPLATE: event (100% RELIABLE ✅) - IGNORING ALL KEYWORDS`);
    } else if (selectedTemplate === 'serviceProvider' || selectedTemplate === 'appointment') {
      pageType = 'serviceProvider';
      console.log(`🎯 DETECTED from TEMPLATE: serviceProvider (100% RELIABLE ✅) - IGNORING ALL KEYWORDS`);
    } else if (selectedTemplate === 'onlineStore') {
      pageType = 'store';
      console.log(`🎯 DETECTED from TEMPLATE: store (100% RELIABLE ✅) - IGNORING ALL KEYWORDS`);
    } else if (selectedTemplate === 'restaurantMenu') {
      pageType = 'restaurantMenu'; // Restaurant menus use store functionality (cart, checkout)
      console.log(`🎯 DETECTED from TEMPLATE: restaurantMenu (RESTAURANT/CAFE MENU - store with categories) (100% RELIABLE ✅) - IGNORING ALL KEYWORDS`);
    } else if (selectedTemplate === 'onlineCourse') {
      pageType = 'course'; // Digital courses use BOTH store management (purchases) AND leads management (registrations)
      console.log(`🎯 DETECTED from TEMPLATE: course (DIGITAL COURSES - store + leads management) (100% RELIABLE ✅) - IGNORING ALL KEYWORDS`);
    } else if (selectedTemplate === 'liveWorkshop') {
      pageType = 'workshop'; // Live workshops/webinars use leads management for registrations
      console.log(`🎯 DETECTED from TEMPLATE: workshop (LIVE WORKSHOP/WEBINAR - leads management) (100% RELIABLE ✅) - IGNORING ALL KEYWORDS`);
    } else if (selectedTemplate === 'messageInBottle') {
      pageType = 'messageInBottle'; // Message in a Bottle pages use messages management
      console.log(`🎯 DETECTED from TEMPLATE: messageInBottle (MESSAGE IN BOTTLE - messages management) (100% RELIABLE ✅) - IGNORING ALL KEYWORDS`);
      console.log(`🍾 MESSAGE IN BOTTLE PAGE DETECTED! pageType set to: ${pageType}`);
    } else if (hasEventKeywords) {
      pageType = 'event';
      console.log(`✅ Detected EVENT page from keywords${hasPurchaseKeywords ? ' (with gifts/purchases)' : ''}`);
    } else if (hasAppointmentKeywords) {
      pageType = 'serviceProvider';
      console.log(`✅ Detected SERVICE PROVIDER page from appointment keywords`);
    } else if (hasPurchaseKeywords || hasStoreKeywords) {
      pageType = 'store';
      console.log(`✅ Detected STORE page from keywords`);
    }
    
    // FORCE INJECT meta tag to ensure future detection is 100% reliable
    const metaTag = `<meta name="page-type" content="${pageType}">`;
    if (!pageHtml.includes('page-type')) {
      if (pageHtml.includes('</head>')) {
        pageHtml = pageHtml.replace('</head>', `    ${metaTag}\n</head>`);
        console.log(`✅ Injected meta tag: ${metaTag}`);
      }
    }
    
    // If it's a store OR course (digital courses), inject checkout scripts
    if (pageType === 'store' || pageType === 'course' || pageType === 'restaurantMenu') {
      const storeScriptInjection = `
<script src="/store-checkout.js"></script>
<!-- CHECKOUT_SCRIPTS_INJECTED -->`;
      
      // Try to inject before </body>, or before </html>, or at the end
      if (pageHtml.includes('</body>')) {
        pageHtml = pageHtml.replace('</body>', storeScriptInjection + '\n</body>');
        console.log('✅ Checkout script injected before </body>');
      } else if (pageHtml.includes('</html>')) {
        pageHtml = pageHtml.replace('</html>', storeScriptInjection + '\n</html>');
        console.log('✅ Checkout script injected before </html>');
      } else {
        pageHtml += storeScriptInjection;
        console.log('✅ Checkout script appended to end of HTML');
      }
      
      if (pageType === 'course') {
        console.log('📚 Digital course page - cart & checkout available for course purchases');
      } else {
        console.log('🛒 Page has purchase capability - cart & checkout available');
      }
    }
    
    // 📊 DEBUG: Log HTML length before fixEventPageWhatsApp
    console.log('📊 HTML length BEFORE fixEventPageWhatsApp:', pageHtml.length);
    console.log('📊 First 500 chars:', pageHtml.substring(0, 500));
    console.log('📊 Last 500 chars:', pageHtml.substring(pageHtml.length - 500));
    console.log('📊 Has <body>?', pageHtml.includes('<body'));
    console.log('📊 Has </body>?', pageHtml.includes('</body>'));
    
    // ✅ INJECT universal data extractor for ALL page types BEFORE saving
    pageHtml = injectPageDataExtractor(pageHtml, pageType);
    
    // ✅ FIX WhatsApp code in event pages BEFORE saving
    pageHtml = fixEventPageWhatsApp(pageHtml, pageType);
    
    // ✅ FIX Store/Course page issues (cart, bubbles) BEFORE saving
    if (pageType === 'store' || pageType === 'course' || pageType === 'restaurantMenu') {
      pageHtml = fixStorePageIssues(pageHtml);
    }
    
    // 📊 DEBUG: Log HTML length after fixes
    console.log('📊 HTML length AFTER fixes:', pageHtml.length);
    console.log('📊 First 500 chars after:', pageHtml.substring(0, 500));
    console.log('📊 Last 500 chars after:', pageHtml.substring(pageHtml.length - 500));
    
    // Save HTML file
    const filePath = path.join(userDir, fileName);
    await fs.writeFile(filePath, pageHtml);
    
    // Create data folder for the page
    const fileNameWithoutExt = fileName.replace('.html', '');
    const dataDir = path.join(userDir, fileNameWithoutExt + '_data');
    await fs.ensureDir(dataDir);
    
    // Save metadata
    const metadataFile = path.join(dataDir, 'metadata.json');
    
    // Extract description from HTML to save in metadata
    let description = '';
    try {
      // Try meta description tag first
      let descMatch = pageHtml.match(/<meta[^>]+name=["']description["'][^>]+content=["']([^"']+)["'][^>]*>/i) ||
                    pageHtml.match(/<meta[^>]+content=["']([^"']+)["'][^>]+name=["']description["'][^>]*>/i);
      if (descMatch && descMatch[1] && descMatch[1].trim()) {
        description = descMatch[1].trim();
        console.log(`✅ Extracted description from HTML: ${description.substring(0, 50)}...`);
      } else {
        // Try og:description
        descMatch = pageHtml.match(/<meta[^>]+property=["']og:description["'][^>]+content=["']([^"']+)["'][^>]*>/i) ||
                  pageHtml.match(/<meta[^>]+content=["']([^"']+)["'][^>]+property=["']og:description["'][^>]*>/i);
        if (descMatch && descMatch[1] && descMatch[1].trim()) {
          description = descMatch[1].trim();
          console.log(`✅ Extracted description from og:description: ${description.substring(0, 50)}...`);
        }
      }
    } catch (error) {
      console.log(`⚠️ Error extracting description:`, error.message);
    }
    
    // Extract full metadata from HTML (contact info, products, etc.)
    console.log('🔍 Extracting full metadata from page HTML...');
    const contactInfo = extractContactInfoFromHTML(pageHtml);
    const products = extractProductsFromHTML(pageHtml);
    
    console.log('✅ Extracted metadata:', {
      phone: contactInfo.phone,
      city: contactInfo.city,
      email: contactInfo.email,
      address: contactInfo.address,
      productsCount: products.length
    });
    
    const metadataContent = {
      pageType,
      createdAt: new Date().toISOString(),
      fileName: fileNameWithoutExt,
      description: description || undefined,  // Only include if exists
      isActive: false,  // Default: not active until subscription is purchased
      // Contact info
      phone: contactInfo.phone,
      phones: contactInfo.phones || [],
      email: contactInfo.email,
      city: contactInfo.city,
      address: contactInfo.address,
      // Products and prices
      products: products || []
    };
    
    // Add messageInBottle specific data if available
    console.log(`🔍 DEBUG pageType: ${pageType}`);
    console.log(`🔍 DEBUG messageInBottleData exists:`, !!req.body.messageInBottleData);
    console.log(`🔍 DEBUG req.body.messageInBottleData:`, req.body.messageInBottleData);
    
    if (pageType === 'messageInBottle' && req.body.messageInBottleData) {
      const bottleData = req.body.messageInBottleData;
      console.log(`🍾 Processing messageInBottle data:`, bottleData);
      metadataContent.name = bottleData.name;
      metadataContent.request = bottleData.request;
      metadataContent.area = bottleData.area;
      // Override phone if provided in bottle data
      if (bottleData.phone) metadataContent.phone = bottleData.phone;
      metadataContent.price = bottleData.price;
      metadataContent.priceType = bottleData.priceType;
      console.log(`🍾 Adding messageInBottle data to metadata:`, metadataContent);
    } else {
      console.log(`⚠️ NOT adding messageInBottle data. pageType=${pageType}, hasData=${!!req.body.messageInBottleData}`);
    }
    
    await fs.writeFile(metadataFile, JSON.stringify(metadataContent, null, 2));
    console.log(`💾 Saved metadata to: ${metadataFile}`);
    console.log(`📋 Metadata content:`, metadataContent);
    
    // EXTRA LOG for messageInBottle
    if (pageType === 'messageInBottle') {
      console.log(`🍾 MESSAGE IN BOTTLE METADATA SAVED! File: ${fileName}, Type: ${pageType}`);
    }
    
    // Initialize empty data files
    const purchasesFile = path.join(dataDir, 'purchases.json');
    const customersFile = path.join(dataDir, 'customers.json');
    const leadsFile = path.join(dataDir, 'leads.json');
    const analyticsFile = path.join(dataDir, 'analytics.json');
    
    if (!await fs.pathExists(purchasesFile)) {
      await fs.writeFile(purchasesFile, '[]');
    }
    if (!await fs.pathExists(customersFile)) {
      await fs.writeFile(customersFile, '[]');
    }
    if (!await fs.pathExists(leadsFile)) {
      await fs.writeFile(leadsFile, '[]');
    }
    if (!await fs.pathExists(analyticsFile)) {
      await fs.writeFile(analyticsFile, JSON.stringify({
        totalSales: 0,
        totalOrders: 0,
        totalCustomers: 0,
        totalLeads: 0,
        createdAt: new Date().toISOString()
      }, null, 2));
    }
    
    console.log('Created data folder for page:', dataDir);

    // Return page URL
    const pageUrl = `/pages/${userId}/${fileName}`;
    res.json({ 
      success: true, 
      pageUrl,
      fileName,
      message: 'Page created successfully' 
    });

  } catch (error) {
    console.error('Error creating page:', error);
    res.status(500).json({ error: 'Failed to create page' });
  }
});

// Upload image
// Image upload endpoint moved to line ~3121 (merged version)
// This old version is replaced by the newer one below

// Save page content
// ✅ UNIVERSAL FUNCTION - Inject page data extractor for ALL page types
function injectPageDataExtractor(html, pageType) {
  console.log(`📊 Injecting universal data extractor for ${pageType} page...`);
  
  // Check if already injected
  if (html.includes('function extractPageData()')) {
    console.log('⏭️ Data extractor already exists');
    return html;
  }
  
  // Universal data extraction function - works for ALL page types
  const dataExtractorScript = `
<script>
// 📊 UNIVERSAL PAGE DATA EXTRACTOR - AUTO-GENERATED
function extractPageData() {
  const data = {};
  
  // For STORES: Extract products - IMPROVED VERSION
  if (document.querySelector('.product-card, [class*="product"], .card, .item, section')) {
    const products = [];
    
    // Try multiple selectors to find products
    const productSelectors = [
      '.product-card',
      '[class*="product"]',
      '.card',
      '.item',
      'section > div',
      'div[class*="card"]',
      'div[class*="item"]'
    ];
    
    productSelectors.forEach(selector => {
      const productCards = document.querySelectorAll(selector);
      productCards.forEach(card => {
        // Look for product name in various elements
        const nameEl = card.querySelector('h1, h2, h3, h4, h5, h6, .title, [class*="title"], [class*="name"], [class*="product"]') ||
                      card.querySelector('p, span, div');
        
        // Look for price in various elements
        const priceEl = card.querySelector('[class*="price"], .cost, .amount') || 
                       Array.from(card.querySelectorAll('*')).find(el => 
                         el.textContent.includes('₪') && 
                         !el.querySelector('*') && 
                         el.textContent.match(/\\d+/)
                       );
        
        if (nameEl && priceEl) {
          const name = nameEl.textContent.trim().replace(/\\s+/g, ' ');
          const priceMatch = priceEl.textContent.match(/(\\d+(?:[.,]\\d+)?)/);
          
          if (name && name.length > 2 && name.length < 100 && priceMatch) {
            const price = parseFloat(priceMatch[1].replace(',', '.'));
            if (price > 0) {
              products.push({
                name: name,
                price: price,
                description: (card.querySelector('p, .desc, [class*="desc"]') || {textContent: ''}).textContent.trim().substring(0, 200)
              });
            }
          }
        }
      });
    });
    
    data.products = products;
    console.log(\`🛒 Extracted \${products.length} products from live page\`, products);
  }
  
  // For ALL pages: Extract general content
  data.pageContent = {
    title: document.title || document.querySelector('h1')?.textContent || '',
    headings: Array.from(document.querySelectorAll('h1, h2, h3')).map(h => h.textContent.trim()).filter(t => t),
    sections: Array.from(document.querySelectorAll('section, .section, [class*="section"]')).length
  };
  
  console.log('📊 Page data extracted:', data);
  return data;
}

// 🚀 LIVE DATA EXTRACTOR - For bot to get current page data
function getLivePageData() {
  const data = extractPageData();
  
  // Send data to bot endpoint
  if (data.products && data.products.length > 0) {
    fetch('/api/update-live-products', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        userId: window.location.pathname.split('/')[2],
        pageId: window.location.pathname.split('/')[3],
        products: data.products,
        timestamp: new Date().toISOString()
      })
    }).then(response => response.json())
      .then(result => {
        console.log('✅ Live products updated for bot:', result);
      })
      .catch(error => {
        console.error('❌ Error updating live products:', error);
      });
  }
  
  return data;
}

// 🔄 Auto-update products when page changes
let lastProductsHash = '';
function checkForProductChanges() {
  const currentData = extractPageData();
  const currentHash = JSON.stringify(currentData.products);
  
  if (currentHash !== lastProductsHash) {
    lastProductsHash = currentHash;
    getLivePageData();
    console.log('🔄 Products changed, updating bot data');
  }
}

// Check for changes every 2 seconds
setInterval(checkForProductChanges, 2000);

// 🚀 Force update products when page loads
document.addEventListener('DOMContentLoaded', function() {
  setTimeout(() => {
    getLivePageData();
  }, 1000);
});

// 🔄 Force update products when user edits
function forceUpdateProducts() {
  getLivePageData();
}

// 🎯 Make forceUpdateProducts available globally
window.forceUpdateProducts = forceUpdateProducts;

// 🚀 Auto-update products when page content changes
const observer = new MutationObserver(function(mutations) {
  mutations.forEach(function(mutation) {
    if (mutation.type === 'childList' || mutation.type === 'characterData') {
      // Check if content changed
      setTimeout(() => {
        checkForProductChanges();
      }, 500);
    }
  });
});

// Start observing
document.addEventListener('DOMContentLoaded', function() {
  observer.observe(document.body, {
    childList: true,
    subtree: true,
    characterData: true
  });
});

// 🎯 Manual trigger for testing
window.updateBotProducts = function() {
  console.log('🔄 Manual update triggered');
  getLivePageData();
};

// Alias for backward compatibility
function extractProductsFromPage() {
  const data = extractPageData();
  return data.products || [];
}
</script>`;
  
  // Inject before </body>
  if (html.includes('</body>')) {
    html = html.replace('</body>', dataExtractorScript + '\n</body>');
    console.log('✅ Universal data extractor injected successfully');
  } else {
    console.log('⚠️ No </body> tag found, appending at end');
    html += dataExtractorScript;
  }
  
  return html;
}

// Function to fix STORE pages (cart, bubbles, etc.)
function fixStorePageIssues(html) {
  console.log('🛒 Fixing store page issues...');
  let fixedCount = 0;
  
  // 1. FIX: Remove ALL content and attributes from cart placeholders
  // The cart-sidebar, cart-overlay, and cart-button-placeholder should be COMPLETELY EMPTY
  // The JavaScript (store-checkout.js) will build them
  
  // ⚔️ AGGRESSIVE FIX: Find and replace ALL variations of cart elements
  // This will match cart-sidebar with any attributes (class, style, etc.) and any content
  // It will replace everything with a clean, empty div
  
  // Step 1: CRITICAL - Remove broken cart HTML that n8n creates
  // n8n sometimes creates: <div id="cart-sidebar"></div><div id="cart-items">...</div>...
  // We need to clean up the orphaned cart-items and cart-total divs
  
  // First, remove ALL orphaned cart elements that appear right after cart-sidebar
  // Pattern: <div id="cart-sidebar"></div> followed by ANY divs until we hit a real element
  // This aggressive approach removes everything between cart-sidebar and the next major section
  
  // Remove cart-items divs
  html = html.replace(
    /(<div\s+id=["']cart-sidebar["']><\/div>)\s*<div[^>]*id=["']cart-items["'][^>]*>[\s\S]*?<\/div>/gi,
    '$1'
  );
  console.log('🧹 Removed orphaned cart-items after cart-sidebar');
  
  // Remove any div that contains cart-total and appears right after cart-sidebar
  html = html.replace(
    /(<div\s+id=["']cart-sidebar["']><\/div>)\s*<div[^>]*>[\s\S]*?cart-total[\s\S]*?<\/div>/gi,
    '$1'
  );
  console.log('🧹 Removed orphaned cart-total sections');
  
  // Remove standalone divs with checkoutViaWhatsApp between cart-sidebar and header
  html = html.replace(
    /(<div\s+id=["']cart-sidebar["']><\/div>)\s*<div[^>]*>[\s\S]*?checkoutViaWhatsApp[\s\S]*?<\/div>/gi,
    '$1'
  );
  console.log('🧹 Removed orphaned checkout sections');
  
  // Remove any standalone cart-total divs or checkout buttons outside cart-sidebar
  html = html.replace(
    /<div[^>]*>([\s\S]*?)<span[^>]*id=["']cart-total["'][^>]*>[\s\S]*?<\/span>[\s\S]*?<\/div>/gi,
    (match) => {
      // Only remove if it's NOT inside cart-sidebar already
      if (!match.includes('cart-sidebar')) {
        console.log('🧹 Removed orphaned cart-total section');
        return '';
      }
      return match;
    }
  );
  
  // Remove orphaned WhatsApp checkout buttons (simple approach - remove all outside <header>)
  // We'll look for checkout buttons that appear before the </header> tag
  const headerEndIndex = html.indexOf('</header>');
  if (headerEndIndex > 0) {
    const headerSection = html.substring(0, headerEndIndex);
    const restOfPage = html.substring(headerEndIndex);
    
    // Remove checkout buttons from header area only
    const cleanedHeader = headerSection.replace(
      /<button[^>]*onclick=["']checkoutViaWhatsApp\(\)["'][^>]*>[\s\S]*?<\/button>/gi,
      () => {
        console.log('🧹 Removed orphaned WhatsApp checkout button from header area');
        return '';
      }
    );
    
    html = cleanedHeader + restOfPage;
  }
  
  // Now handle the cart placeholders themselves
  const cartPatterns = [
    // cart-sidebar - all variations
    /<div[^>]*\s+id=["']cart-sidebar["'][^>]*>[\s\S]*?<\/div>/gi,
    /<div\s+id=["']cart-sidebar["'][^>]*>[\s\S]*?<\/div>/gi,
    
    // cart-overlay - all variations
    /<div[^>]*\s+id=["']cart-overlay["'][^>]*>[\s\S]*?<\/div>/gi,
    /<div\s+id=["']cart-overlay["'][^>]*>[\s\S]*?<\/div>/gi,
    
    // cart-button-placeholder - all variations
    /<div[^>]*\s+id=["']cart-button-placeholder["'][^>]*>[\s\S]*?<\/div>/gi,
    /<div\s+id=["']cart-button-placeholder["'][^>]*>[\s\S]*?<\/div>/gi,
    
    // cart-backdrop - all variations
    /<div[^>]*\s+id=["']cart-backdrop["'][^>]*>[\s\S]*?<\/div>/gi,
    /<div\s+id=["']cart-backdrop["'][^>]*>[\s\S]*?<\/div>/gi,
  ];
  
  // Apply all patterns
  for (const pattern of cartPatterns) {
    if (html.match(pattern)) {
      const matches = html.match(pattern);
      for (const match of matches) {
        // Determine which type of cart element this is
        if (match.includes('cart-sidebar')) {
          html = html.replace(match, '<div id="cart-sidebar"></div>');
          console.log('✅ Cleaned cart-sidebar (AGGRESSIVE MODE)');
          fixedCount++;
        } else if (match.includes('cart-overlay')) {
          html = html.replace(match, '<div id="cart-overlay"></div>');
          console.log('✅ Cleaned cart-overlay (AGGRESSIVE MODE)');
          fixedCount++;
        } else if (match.includes('cart-button-placeholder')) {
          html = html.replace(match, '<div id="cart-button-placeholder"></div>');
          console.log('✅ Cleaned cart-button-placeholder (AGGRESSIVE MODE)');
          fixedCount++;
        } else if (match.includes('cart-backdrop')) {
          html = html.replace(match, '<div id="cart-backdrop"></div>');
          console.log('✅ Cleaned cart-backdrop (AGGRESSIVE MODE)');
          fixedCount++;
        }
      }
    }
  }
  
  // Step 2: Extra aggressive cleanup - remove any remaining cart icons/buttons in header
  // ⚠️ IMPORTANT: Only remove cart buttons in header/nav, NOT the "רכוש את הקורס" buttons!
  // These buttons have onclick="addToCart(...)" and should stay
  html = html.replace(/<header[^>]*>([\s\S]*?)<\/header>/gi, function(headerMatch) {
    return headerMatch.replace(/<button[^>]*\b(?:id|class)=["'][^"']*cart[^"']*["'][^>]*>[\s\S]*?<\/button>/gi, '');
  });
  html = html.replace(/<nav[^>]*>([\s\S]*?)<\/nav>/gi, function(navMatch) {
    return navMatch.replace(/<button[^>]*\b(?:id|class)=["'][^"']*cart[^"']*["'][^>]*>[\s\S]*?<\/button>/gi, '');
  });
  console.log('✅ Removed cart buttons from header/nav only (preserving course purchase buttons)');
  
  // 2. FIX: Ensure bubbles have correct z-index and are clickable
  // Find WhatsApp bubble and ensure it has proper styling
  const whatsappBubbleRegex = /<a[^>]*href=["']https?:\/\/wa\.me\/[^"']*["'][^>]*>([\s\S]*?)<\/a>/gi;
  html = html.replace(whatsappBubbleRegex, (match) => {
    // Ensure z-index is high enough and pointer-events are enabled
    let fixed = match.replace(/z-index:\s*\d+/gi, 'z-index: 10000');
    if (!fixed.includes('z-index')) {
      fixed = fixed.replace(/style=["']/, 'style="z-index: 10000; ');
    }
    fixed = fixed.replace(/pointer-events:\s*none/gi, '');
    return fixed;
  });
  
  // 3. FIX: Ensure AI bot bubble is clickable
  // Look for bot button/div with purple background
  const botBubbleRegex = /<(?:button|div)[^>]*(?:background[^>]*#8B5CF6|#8B5CF6[^>]*background)[^>]*>([\s\S]*?)<\/(?:button|div)>/gi;
  html = html.replace(botBubbleRegex, (match) => {
    let fixed = match.replace(/z-index:\s*\d+/gi, 'z-index: 10000');
    if (!fixed.includes('z-index')) {
      fixed = fixed.replace(/style=["']/, 'style="z-index: 10000; ');
    }
    fixed = fixed.replace(/pointer-events:\s*none/gi, '');
    return fixed;
  });
  
  // 4. FIX: Add AGGRESSIVE CSS to FORCE cart closed and bubbles visible
  const fixCSS = `
<style id="store-page-fixes">
  /* ⚔️ AGGRESSIVE FIX: Force cart to start CLOSED - multiple rules for maximum compatibility */
  #cart-sidebar { 
    right: -450px !important; 
    transform: translateX(0) !important;
    display: block !important;
  }
  
  #cart-sidebar.open { 
    right: 0 !important; 
  }
  
  #cart-overlay, #cart-backdrop { 
    opacity: 0 !important; 
    pointer-events: none !important;
    display: block !important;
  }
  
  #cart-overlay.open, #cart-backdrop.open { 
    opacity: 1 !important; 
    pointer-events: all !important; 
  }
  
  /* Force empty cart elements to have no content */
  #cart-sidebar:empty::before,
  #cart-overlay:empty::before,
  #cart-backdrop:empty::before,
  #cart-button-placeholder:empty::before {
    content: '' !important;
  }
  
  /* Ensure floating bubbles are ALWAYS clickable and visible AND FIXED */
  a[href*="wa.me"], 
  [id*="whatsapp"], 
  [id*="bot"], 
  [style*="#8B5CF6"],
  [style*="25D366"] {
    position: fixed !important; /* צף עם הגלילה */
    z-index: 10000 !important;
    pointer-events: all !important;
    cursor: pointer !important;
  }
  
  /* ✨ FIX: Ensure bot button stays fixed while scrolling */
  #ai-bot-btn {
    position: fixed !important;
    bottom: 20px !important;
    right: 20px !important;
    z-index: 10000 !important;
  }
  
  /* ✨ FIX: Ensure WhatsApp bubble stays fixed */
  a[href*="wa.me"] {
    position: fixed !important;
    bottom: 20px !important;
    left: 20px !important;
    z-index: 10000 !important;
  }
  
  /* ✨ FIX: Ensure body has NORMAL font size (override any 1% bugs) */
  body {
    font-size: 16px !important; /* Normal readable size */
  }
  
  /* ✨ FIX: Ensure all text elements are readable */
  body p {
    font-size: 16px !important;
  }
  
  body h1 {
    font-size: 2.5rem !important;
  }
  
  body h2 {
    font-size: 2rem !important;
  }
  
  body h3 {
    font-size: 1.75rem !important;
  }
  
  body h4 {
    font-size: 1.5rem !important;
  }
  
  body button, body a {
    font-size: 16px !important;
  }
  
  body input, body textarea, body select {
    font-size: 16px !important;
  }
  
  /* ✨ FIX: Ensure AI bot chat has READABLE FONT SIZES */
  #ai-chat-window {
    font-size: 16px !important; /* Override body's 1% */
  }
  
  #ai-chat-window h3 {
    font-size: 20px !important; /* Larger title */
  }
  
  #ai-chat-window p,
  #ai-chat-messages p,
  #ai-chat-messages div {
    font-size: 16px !important; /* Readable message text */
  }
  
  #ai-user-input {
    font-size: 16px !important; /* Larger input text */
  }
  
  #ai-send-btn {
    font-size: 16px !important; /* Larger button text */
  }
  
  /* Also fix any dynamically created message elements */
  #ai-chat-messages > div {
    font-size: 16px !important;
  }
  
  #ai-chat-messages > div > p {
    font-size: 16px !important;
  }
  
  /* Ensure bubbles don't hide behind cart */
  #floating-cart-icon {
    z-index: 9998 !important;
  }
  
  /* Remove duplicate cart elements */
  header [id*="cart"]:not(#floating-cart-icon),
  nav [id*="cart"]:not(#floating-cart-icon),
  header button[id*="cart"]:not(#floating-cart-icon),
  nav button[id*="cart"]:not(#floating-cart-icon) {
    display: none !important;
  }
</style>`;
  
  if (!html.includes('store-page-fixes')) {
    if (html.includes('</head>')) {
      html = html.replace('</head>', fixCSS + '\n</head>');
      console.log('✅ Added store page fix CSS');
      fixedCount++;
    }
  }
  
  console.log(`🛒 Fixed ${fixedCount} store page issues`);
  return html;
}

// Function to fix WhatsApp code in event pages
function fixEventPageWhatsApp(html, pageType) {
  console.log(`🔍 fixEventPageWhatsApp called with pageType: "${pageType}"`);
  
  if (pageType !== 'event') {
    console.log(`⏭️ Skipping fix - pageType is "${pageType}", not "event"`);
    return html;
  }
  
  console.log('🔧 Fixing WhatsApp code in event page...');
  let fixedCount = 0;
  
  // 1. Remove WhatsApp floating bubble
  const wa1 = html;
  html = html.replace(/<a[^>]*wa\.me[^>]*>[\s\S]*?<\/a>/gi, '');
  html = html.replace(/<!--\s*WhatsApp Floating Bubble\s*-->[\s\S]*?<\/a>/gi, '');
  if (html !== wa1) fixedCount++;
  
  // 2. Remove ANY JavaScript that mentions WhatsApp or wa.me
  const wa2 = html;
  html = html.replace(/const\s+whatsappUrl\s*=[\s\S]*?;/gi, '');
  html = html.replace(/let\s+whatsappUrl\s*=[\s\S]*?;/gi, '');
  html = html.replace(/var\s+whatsappUrl\s*=[\s\S]*?;/gi, '');
  html = html.replace(/window\.open\([^)]*wa\.me[^)]*\);?/gi, '');
  html = html.replace(/location\.href\s*=\s*[^;]*wa\.me[^;]*;/gi, '');
  if (html !== wa2) fixedCount++;
  
  // 3. Fix RSVP form submission - inject the correct handler
  // NEW APPROACH: Don't try to delete existing scripts (too risky), just inject our script at the end
  const rsvpFormFix = `
<script>
// ✅ RSVP Form - API Submission (Server-Fixed - Overrides any existing handlers)
(function() {
        document.addEventListener('DOMContentLoaded', function() {
            const rsvpForm = document.getElementById('rsvp-form');
            if (!rsvpForm) {
                console.log('⚠️ RSVP form not found on this page');
                return;
            }
            
        // Remove all existing submit listeners by cloning the form
        const newForm = rsvpForm.cloneNode(true);
        rsvpForm.parentNode.replaceChild(newForm, rsvpForm);
        
        newForm.addEventListener('submit', async (e) => {
                e.preventDefault();
            e.stopPropagation();
            console.log('📝 RSVP Form submitted (server-fixed handler)');
                
                const eventId = window.location.pathname.split('/').pop().replace('.html', '').replace('_html', '');
                const userId = window.location.pathname.split('/')[2];
                
                const name = document.getElementById('rsvp-name').value;
                const phone = document.getElementById('rsvp-phone').value;
                const email = document.getElementById('rsvp-email') ? document.getElementById('rsvp-email').value : '';
                
                // Check if user selected "לא מגיע" (declined)
                const statusYes = document.getElementById('rsvp-status-yes');
                const statusNo = document.getElementById('rsvp-status-no');
                const status = statusYes && statusYes.checked ? 'confirmed' : (statusNo && statusNo.checked ? 'declined' : 'confirmed');
                
                // Only count guests if confirmed, otherwise 0
                const guests = status === 'confirmed' ? (
                    document.getElementById('rsvp-guests') ? parseInt(document.getElementById('rsvp-guests').value) || 1 : 
                    document.getElementById('guest-count') ? parseInt(document.getElementById('guest-count').value) || 1 : 1
                ) : 0;
                
                const notes = document.getElementById('rsvp-notes') ? document.getElementById('rsvp-notes').value : '';
                
                console.log('📤 Sending RSVP to API...', { eventId, userId, name, guests, status });
                
                try {
                    const response = await fetch('/api/rsvp', {
                        method: 'POST',
                        headers: {'Content-Type': 'application/json'},
                        body: JSON.stringify({
                            eventId, userId, name, phone, email, guests,
                            status: status,
                            message: notes
                        })
                    });
                    
                    console.log('📥 API Response:', response.status, response.ok);
                    
                    if (response.ok) {
                    console.log('✅ RSVP recorded successfully!');
                    
                    // הצג הודעת הצלחה ברורה
                        const successDiv = document.getElementById('rsvp-success') || document.getElementById('rsvp-message');
                        if (successDiv) {
                        successDiv.innerHTML = '<div style="background: linear-gradient(135deg, #10b981 0%, #059669 100%); color: white; padding: 30px; border-radius: 16px; text-align: center; font-size: 24px; font-weight: bold; box-shadow: 0 10px 40px rgba(16, 185, 129, 0.3); margin: 20px 0;"><div style="font-size: 48px; margin-bottom: 10px;">✅</div>תודה רבה ' + name + '!<br>אישור ההגעה נשלח בהצלחה 🎉</div>';
                            successDiv.classList.remove('hidden', 'text-red-600', 'text-red-500', 'text-red-400');
                            successDiv.classList.add('text-green-500', 'block');
                            successDiv.style.display = 'block';
                        successDiv.style.visibility = 'visible';
                        successDiv.style.opacity = '1';
                    }
                    
                    // הצג גם alert לוודא שהמשתמש רואה
                    alert('✅ תודה רבה ' + name + '!\\n\\nאישור ההגעה נשלח בהצלחה 🎉\\n\\nנתראה באירוע!');
                    
                    // נקה את הטופס
                    newForm.reset();
                    
                    // גלול חזרה לראש הדף אחרי שנייה
                    setTimeout(() => {
                        window.scrollTo({ top: 0, behavior: 'smooth' });
                    }, 1500);
                    } else {
                        console.error('❌ API Error:', response.status);
                    alert('אירעה שגיאה בשליחת האישור. נסה שוב.');
                    }
                } catch (error) {
                    console.error('❌ RSVP Error:', error);
                alert('אירעה שגיאה בשליחת האישור. נסה שוב.');
                }
            });
        });
})();
    </script>`;
  
  const wa3 = html;
  // Inject the script before </body> if there's an RSVP form
    if (html.includes('id="rsvp-form"') || html.includes("id='rsvp-form'")) {
      if (html.includes('</body>')) {
        html = html.replace('</body>', rsvpFormFix + '\n</body>');
        fixedCount++;
        console.log('✅ Injected RSVP form handler before </body>');
    } else if (html.includes('</html>')) {
      html = html.replace('</html>', rsvpFormFix + '\n</html>');
      fixedCount++;
      console.log('✅ Injected RSVP form handler before </html>');
    }
  }
  
  // 4. Add WhatsApp bubble if missing (for event pages)
  const whatsappBubbleHTML = `
<!-- WhatsApp Floating Bubble -->
<a href="https://wa.me/9724443333?text=היי,%20אני%20מעוניין%20בפרטים%20נוספים" 
   target="_blank" 
   style="position: fixed; bottom: 20px; left: 20px; width: 64px; height: 64px; background: linear-gradient(135deg, #25D366 0%, #128C7E 100%); border-radius: 50%; display: flex; align-items: center; justify-content: center; box-shadow: 0 4px 12px rgba(37, 211, 102, 0.4); z-index: 9999; transition: transform 0.3s ease;"
   onmouseover="this.style.transform='scale(1.1)'"
   onmouseout="this.style.transform='scale(1)'">
   <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="white">
      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893A11.821 11.821 0 0020.893 3.488"/>
   </svg>
</a>`;

  if (!html.includes('wa.me') && !html.includes('WhatsApp') && html.includes('</body>')) {
    html = html.replace('</body>', whatsappBubbleHTML + '\n</body>');
    fixedCount++;
    console.log('✅ Added WhatsApp bubble');
  }
  
  // 5. Remove "Contact Form" section from event pages (they use WhatsApp bubble instead)
  // Try multiple patterns to catch different variations
  const contactFormPatterns = [
    // By ID - exact match
    /<section[^>]*\sid=["']contact-form["'][^>]*>[\s\S]*?<\/section>/gi,
    /<section[^>]*\sid=["']contact-form-section["'][^>]*>[\s\S]*?<\/section>/gi,
    /<section[^>]*\sid=["']contact["'][^>]*>[\s\S]*?<\/section>/gi,
    /<div[^>]*\sid=["']contact-form-section["'][^>]*>[\s\S]*?<\/div>/gi,
    // By class
    /<section[^>]*class=["'][^"']*contact-form[^"']*["'][^>]*>[\s\S]*?<\/section>/gi,
    // By heading text (Hebrew variations + English)
    /<section[^>]*>[\s\S]*?<h[1-6][^>]*>(?:צור קשר|צרו קשר|יצירת קשר|Contact(?:\s+(?:Us|Form))?)<\/h[1-6]>[\s\S]*?<\/section>/gi
  ];
  
  contactFormPatterns.forEach((pattern, index) => {
    if (html.match(pattern)) {
      html = html.replace(pattern, '');
      fixedCount++;
      console.log(`✅ Removed contact form section (pattern ${index + 1})`);
    }
  });
  
  // Also remove the contact form JavaScript
  const contactFormJsPatterns = [
    /<script[\s\S]*?getElementById\(['"]contact-form['"]\)[\s\S]*?<\/script>/gi,
    /<script[\s\S]*?getElementById\(["']contact-form-section["']\)[\s\S]*?<\/script>/gi,
    // Script that mentions "contact form" in comments
    /<script>[\s\S]*?\/\/\s*(?:Contact Form|טופס צור קשר)[\s\S]*?<\/script>/gi
  ];
  
  contactFormJsPatterns.forEach((pattern, index) => {
    if (html.match(pattern)) {
      html = html.replace(pattern, '');
      console.log(`✅ Removed contact form JavaScript (pattern ${index + 1})`);
    }
  });
  
  // Remove form elements with id="contact-form"
  const formPattern = /<form[^>]*id=["']contact-form["'][^>]*>[\s\S]*?<\/form>/gi;
  if (html.match(formPattern)) {
    html = html.replace(formPattern, '');
    fixedCount++;
    console.log('✅ Removed contact form element');
  }
  
  // 6. Manage Guests button removed - users access it via dashboard only
  // No need to add it to the public event page
  
  // 7. Remove any alert/confirm messages about WhatsApp
  const wa4 = html;
  html = html.replace(/alert\([^)]*[וו]אטס[אא]פ[^)]*\);?/gi, '');
  html = html.replace(/alert\([^)]*WhatsApp[^)]*\);?/gi, '');
  if (html !== wa4) fixedCount++;
  
  // 8. Fix countdown timer - remove dir attribute, change to grid-cols-4, add seconds
  if (html.includes('id="countdown-timer"')) {
    // Fix grid-cols-3 to grid-cols-4
    html = html.replace(/grid-cols-3/gi, 'grid-cols-4');
    
    // Remove dir="ltr" or dir="rtl" from countdown grid container (let Hebrew RTL be natural)
    html = html.replace(/(<div[^>]*class="[^"]*grid[^"]*grid-cols-[^"]*"[^>]*)\s*dir="(?:ltr|rtl)"/gi, '$1');
    
    // Add a script to fix countdown: add seconds if missing AND reverse order for RTL
    const countdownFixScript = `
<script>
// Fix countdown timer - ensure seconds are present and order is reversed for RTL
(function() {
    document.addEventListener('DOMContentLoaded', function() {
        const countdownSection = document.getElementById('countdown-timer');
        if (!countdownSection) return;
        
        // Find the grid container
        const gridContainer = countdownSection.querySelector('.grid, [class*="grid-cols"]');
        if (!gridContainer) return;
        
        // Get all countdown boxes
        const days = document.getElementById('days');
        const hours = document.getElementById('hours');
        const minutes = document.getElementById('minutes');
        let seconds = document.getElementById('seconds');
        
        // Add seconds if missing
        if (!seconds && minutes) {
            console.log('⏰ Adding missing seconds to countdown timer');
            const minutesBox = minutes.closest('.countdown-box, div[class*="countdown"]');
            if (minutesBox && minutesBox.parentElement) {
                const secondsBox = minutesBox.cloneNode(true);
                const secondsNum = secondsBox.querySelector('#minutes, [id*="minutes"]');
                const secondsLabel = secondsBox.querySelector('span');
                if (secondsNum && secondsLabel) {
                    secondsNum.id = 'seconds';
                    secondsNum.textContent = '00';
                    secondsLabel.textContent = 'שניות';
                    minutesBox.parentElement.appendChild(secondsBox);
                    seconds = secondsNum;
                }
            }
        }
        
        // Reverse order for RTL: seconds → minutes → hours → days
        if (days && hours && minutes && seconds) {
            const daysBox = days.closest('.countdown-box, div[class*="countdown"]');
            const hoursBox = hours.closest('.countdown-box, div[class*="countdown"]');
            const minutesBox = minutes.closest('.countdown-box, div[class*="countdown"]');
            const secondsBox = seconds.closest('.countdown-box, div[class*="countdown"]');
            
            if (daysBox && hoursBox && minutesBox && secondsBox && gridContainer) {
                console.log('⏰ Reversing countdown order for RTL display');
                gridContainer.innerHTML = '';
                gridContainer.appendChild(secondsBox);
                gridContainer.appendChild(minutesBox);
                gridContainer.appendChild(hoursBox);
                gridContainer.appendChild(daysBox);
            }
        }
    });
})();
</script>`;
    
    if (html.includes('</body>')) {
      html = html.replace('</body>', countdownFixScript + '\n</body>');
    }
    
    console.log('✅ Fixed countdown timer (3→4 cols, removed dir, reversed order for RTL)');
    fixedCount++;
  }
  
  // 9. Remove accessibility BUBBLES (floating widgets) - users should use top bar button instead
  const accessibilityBubblePatterns = [
    // Floating accessibility widget/bubble
    /<div[^>]*(?:accessibility-widget|accessibility-bubble|accessibility-menu|נגישות)[^>]*style="[^"]*(?:position:\s*fixed|position:fixed)[^"]*"[^>]*>[\s\S]*?<\/div>/gi,
    /<button[^>]*(?:accessibility-widget|accessibility-bubble|accessibility-menu|נגישות)[^>]*style="[^"]*(?:position:\s*fixed|position:fixed)[^"]*"[^>]*>[\s\S]*?<\/button>/gi,
    // By class name with fixed position
    /<div[^>]*class="[^"]*(?:accessibility-widget|accessibility-bubble|accessibility-floating|נגישות)[^"]*"[^>]*>[\s\S]*?<\/div>/gi
  ];
  
  accessibilityBubblePatterns.forEach((pattern, index) => {
    const beforeRemoval = html;
    html = html.replace(pattern, '');
    if (html !== beforeRemoval) {
      console.log(`✅ Removed accessibility floating bubble (pattern ${index + 1})`);
      fixedCount++;
    }
  });
  
  // Remove accessibility JavaScript that creates floating widgets
  const accessibilityJsPattern = /<script[\s\S]*?(?:accessibility|נגישות)[\s\S]*?(?:position.*fixed|floating)[\s\S]*?<\/script>/gi;
  const beforeJsRemoval = html;
  html = html.replace(accessibilityJsPattern, '');
  if (html !== beforeJsRemoval) {
    console.log('✅ Removed accessibility floating widget script');
    fixedCount++;
  }
  
  // 9.5. AI Bot is ALLOWED - do NOT remove it (only accessibility bubble should be removed)
  
  // 10. Add "All Rights Reserved - Created by AutoPage" copyright
  const copyrightText = `
    <div style="text-align: center; padding: 15px 20px; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; font-size: 13px; margin-top: 30px;">
        <p style="margin: 0; font-weight: 500;">
            ✨ כל הזכויות שמורות - נוצר על ידי <strong>AutoPage</strong> ✨
        </p>
        <p style="margin: 5px 0 0 0; font-size: 11px; opacity: 0.9;">
            יצירת דפי נחיתה מתקדמים בקלות | <a href="http://localhost:3002" style="color: white; text-decoration: underline;">www.autopage.co.il</a>
        </p>
    </div>`;
  
  if (html.includes('</body>') && !html.includes('נוצר על ידי AutoPage')) {
    html = html.replace('</body>', copyrightText + '\n</body>');
    console.log('✅ Added AutoPage copyright notice');
    fixedCount++;
  }
  
  console.log(`✅ WhatsApp code fixed! (${fixedCount} changes made)`);
  return html;
}

// Extract contact info from HTML (for metadata)
function extractContactInfoFromHTML(html) {
  const contactInfo = {};
  
  // Extract phone numbers
  const phonePatterns = [
    /\+972[\s\-\)]?\s*5[0-9][\s\-]?\d{3}[\s\-]?\d{4}/g,
    /\+972[\s\-\)]?\s*7[0-9][\s\-]?\d{3}[\s\-]?\d{4}/g,
    /0?5[0-9][\s\-]?\d{3}[\s\-]?\d{4}/g,
    /0?7[0-9][\s\-]?\d{3}[\s\-]?\d{4}/g,
    /0[57]\d(?:[\.\s\-]?\d){8}/g
  ];
  
  let foundPhones = [];
  const phoneScores = new Map();
  
  // Search in contact/footer areas (higher priority)
  const contactAreaPattern = /<(?:section|div|footer)[^>]*(?:class|id)="[^"]*(?:contact|footer|info|details)[^"]*"[^>]*>([\s\S]{500,3000})<\/[^>]+>/gi;
  const contactAreas = [...html.matchAll(contactAreaPattern)];
  
  contactAreas.forEach(areaMatch => {
    const areaHtml = areaMatch[1];
    phonePatterns.forEach(pattern => {
      const matches = areaHtml.match(pattern);
      if (matches) {
        matches.forEach(match => {
          let phone = match.replace(/[\s\-\(\)\.]/g, '');
          if (phone.startsWith('+972')) phone = phone.replace('+972', '0');
          if (phone.length === 9 && (phone.startsWith('5') || phone.startsWith('7'))) phone = '0' + phone;
          if (phone.length === 10 && phone.startsWith('0') && (phone[1] === '5' || phone[1] === '7')) {
            const isValidPhone = phone.match(/^0[57][0-9]{8}$/);
            if (isValidPhone && !phone.match(/^0+$/) && phone !== '0500000000' && phone !== '0700000000') {
              const formatted = `${phone.substring(0, 3)}-${phone.substring(3, 6)}-${phone.substring(6)}`;
              if (!foundPhones.includes(formatted)) foundPhones.push(formatted);
              phoneScores.set(formatted, (phoneScores.get(formatted) || 0) + 5);
            }
          }
        });
      }
    });
  });
  
  // Search entire HTML
  phonePatterns.forEach(pattern => {
    const matches = html.match(pattern);
    if (matches) {
      matches.forEach(match => {
        let phone = match.replace(/[\s\-\(\)\.]/g, '');
        if (phone.startsWith('+972')) phone = phone.replace('+972', '0');
        if (phone.length === 9 && (phone.startsWith('5') || phone.startsWith('7'))) phone = '0' + phone;
        if (phone.length === 10 && phone.startsWith('0') && (phone[1] === '5' || phone[1] === '7')) {
          const isValidPhone = phone.match(/^0[57][0-9]{8}$/);
          if (isValidPhone && !phone.match(/^0+$/) && phone !== '0500000000' && phone !== '0700000000') {
            const formatted = `${phone.substring(0, 3)}-${phone.substring(3, 6)}-${phone.substring(6)}`;
            if (!foundPhones.includes(formatted)) foundPhones.push(formatted);
            phoneScores.set(formatted, (phoneScores.get(formatted) || 0) + 1);
          }
        }
      });
    }
  });
  
  // Boost phones near "טלפון"
  const proximityMatches = [...html.matchAll(/טלפון[:\s\-]*([^<\n]{0,60})/gi)];
  proximityMatches.forEach(pm => {
    const seg = (pm[1] || '').toString();
    const hits = seg.match(/0[57]\d[\d\s\-\.]{7,}/g) || [];
    hits.forEach(h => {
      let normalized = h.replace(/[^0-9]/g, '');
      if (normalized.length === 9 && (normalized.startsWith('5') || normalized.startsWith('7'))) normalized = '0' + normalized;
      if (/^0[57]\d{8}$/.test(normalized)) {
        const formatted = `${normalized.substring(0, 3)}-${normalized.substring(3, 6)}-${normalized.substring(6)}`;
        phoneScores.set(formatted, (phoneScores.get(formatted) || 0) + 3);
      }
    });
  });
  
  if (foundPhones.length > 0) {
    const validPhones = foundPhones.filter(phone => {
      const digits = phone.replace(/-/g, '');
      const firstDigit = digits[0];
      const isAllSame = digits.split('').every(d => d === firstDigit);
      const isPlaceholder = phone.includes('000-000') || phone.includes('111-111');
      return !isAllSame && !isPlaceholder;
    });
    
    if (validPhones.length > 0) {
      const ranked = [...new Set(validPhones)]
        .map(p => ({ phone: p, score: phoneScores.get(p) || 0 }))
        .sort((a, b) => b.score - a.score);
      contactInfo.phones = ranked.map(r => r.phone);
      contactInfo.phone = contactInfo.phones[0];
    }
  }
  
  // Extract email
  const emailMatch = html.match(/([a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,})/);
  if (emailMatch) contactInfo.email = emailMatch[1];
  
  // Extract city
  const cities = [
    'תל אביב', 'ירושלים', 'חיפה', 'באר שבע', 'נתניה', 'אשדוד', 'רמת גן', 'פתח תקווה', 
    'בני ברק', 'חולון', 'רחובות', 'כפר סבא', 'אילת', 'רעננה', 'הרצליה', 'חדרה', 
    'קריית ביאליק', 'קריית מוצקין', 'ראשון לציון', 'נהריה', 'הוד השרון', 'גבעתיים', 
    'קריית אתא', 'קריית שמונה', 'בית שאן', 'עפולה'
  ];
  
  // Prioritize cities in contact/footer areas
  for (const city of cities) {
    // Check contact areas first
    const inContactArea = contactAreas.some(area => area[1].includes(city));
    if (inContactArea) {
      contactInfo.city = city;
      break;
    }
  }
  
  // If not found in contact areas, check entire HTML
  if (!contactInfo.city) {
    for (const city of cities) {
      if (html.includes(city)) {
        contactInfo.city = city;
        break;
      }
    }
  }
  
  // Extract address - FIRST try navigation button links (Google Maps / Waze)
  // Users add address to navigation buttons, this is the most accurate source
  const navigationButtonPatterns = [
    // Google Maps: href="https://www.google.com/maps?q=..." or href="https://maps.google.com/?q=..."
    /href\s*=\s*["']https?:\/\/(?:www\.)?(?:maps\.)?google\.com\/maps[^"']*q=([^"'\&]+)/gi,
    /href\s*=\s*["']https?:\/\/(?:www\.)?(?:maps\.)?google\.com\/maps[^"']*daddr=([^"'\&]+)/gi,
    // Waze: href="https://waze.com/ul?q=..." or href="https://www.waze.com/ul?q=..."
    /href\s*=\s*["']https?:\/\/(?:www\.)?waze\.com\/ul[^"']*q=([^"'\&]+)/gi,
    /href\s*=\s*["']https?:\/\/(?:www\.)?waze\.com\/ul[^"']*ll=([^"'\&]+)/gi,
    // General navigation link with address in text
    /<a[^>]*href\s*=\s*["'](?:https?:\/\/(?:maps|waze))[^"']*["'][^>]*>([^<]{10,100})<\/a>/gi
  ];
  
  for (const pattern of navigationButtonPatterns) {
    const matches = [...html.matchAll(pattern)];
    if (matches && matches.length > 0) {
      for (const match of matches) {
        if (match[1]) {
          // Decode URL-encoded address
          let address = decodeURIComponent(match[1].trim());
          // Clean up address
          address = address.replace(/\+/g, ' ').replace(/%20/g, ' ').replace(/\s+/g, ' ').trim();
          // Check if it looks like a real address (contains Hebrew/English, not just coordinates)
          if (address.length > 5 && (address.match(/[א-ת]/) || address.match(/[a-zA-Z]/))) {
            // Prioritize addresses with street names
            if (address.match(/רחוב|street|st\./i) || address.match(/\d+/)) {
              contactInfo.address = address;
              console.log('📍 Found address from navigation button:', contactInfo.address);
              break;
            } else if (!contactInfo.address) {
              // Use this as fallback if no street address found yet
              contactInfo.address = address;
              console.log('📍 Found address from navigation button (fallback):', contactInfo.address);
            }
          }
        }
      }
      if (contactInfo.address) break;
    }
  }
  
  // If no address from navigation button, try text patterns
  if (!contactInfo.address) {
    const addressPatterns = [
      /([א-ת\s]+,\s*רחוב\s+[א-ת\s\d]+)/g,
      /([א-ת\s]+,\s*[א-ת\s\d]+\s+\d+)/g,
      /(רחוב\s+[א-ת\s\d]+,\s*[א-ת\s]+)/g,
      /כתובת[:\s]*([^<\n]{5,80})/gi
    ];
    
    for (const pattern of addressPatterns) {
      const matches = html.match(pattern);
      if (matches && matches[0]) {
        let address = matches[0].replace(/כתובת[:\s]*/gi, '').trim();
        if (address.length > 5) {
          contactInfo.address = address;
          console.log('📍 Found address from text pattern:', contactInfo.address);
          break;
        }
      }
    }
  }
  
  return contactInfo;
}

// Extract products from HTML (for metadata)
function extractProductsFromHTML(html) {
  const products = [];
  
  // Get page title and h1 to exclude them
  const pageTitleMatch = html.match(/<title[^>]*>([^<]+)<\/title>/i);
  const pageH1Match = html.match(/<h1[^>]*>([^<]{3,80})<\/h1>/i);
  const pageTitle = pageTitleMatch ? pageTitleMatch[1].trim() : '';
  const pageH1 = pageH1Match ? pageH1Match[1].trim() : '';
  
  const excludePatterns = [
    'נגישות', 'אודות', 'צור קשר', 'דף הבית', 'עלינו', 'תקנון', 'מדיניות', 
    'פרטיות', 'תנאים', 'שירות', 'משלוחים', 'החזרות', 'איך להזמין',
    'גלרי', 'המוצרים', 'תיאור', 'המיוחדים', 'הכל על', 'כל הזכויות',
    'זכויות יוצרים', 'ברוכים הבאים', 'לקוחות', 'שאלות', 'תשובות',
    'מוצרים שלנו', 'המוצרים שלנו', 'תפריט', 'כותרת', 'כותרת ראשית',
    pageTitle, pageH1
  ].filter(Boolean);
  
  const excludeFromName = [
    '₪', 'שקל', 'ש"ח', 'מחיר', 'מחירים', 'מחירון',
    'טלפון', 'מייל', 'אימייל', 'כתובת', 'עיר', 'ישראל',
    'טוהר', 'יופי', 'איכות', 'השראה', 'חלום', 'אמת', 'נשמה'
  ];
  
  // Strategy 1: product-card elements
  const productCardPattern = /<div[^>]*class="[^"]*product-card[^"]*"[^>]*>([\s\S]{50,2000})<\/div>/gi;
  const productCardMatches = [...html.matchAll(productCardPattern)];
  
  productCardMatches.forEach(cardMatch => {
    const cardHtml = cardMatch[1];
    let nameMatch = cardHtml.match(/<h[34][^>]*>([^<]{3,100})<\/h[34]>/i) ||
                    cardHtml.match(/<[^>]*class="[^"]*product-name[^"]*"[^>]*>([^<]{3,100})<\/[^>]+>/i);
    
    if (nameMatch && nameMatch[1]) {
      const name = nameMatch[1].replace(/<[^>]*>/g, '').trim();
      
      // Check exclusions
      if (excludePatterns.some(ex => name.includes(ex))) return;
      if (excludeFromName.some(ex => name.includes(ex))) return;
      if (name.length <= 2 || name.length > 100) return;
      
      // Extract price
      const priceMatch = cardHtml.match(/₪\s*(\d+(?:[,\s]\d+)*(?:\.\d+)?)/) || 
                        cardHtml.match(/(\d+(?:[,\s]\d+)*(?:\.\d+)?)\s*(?:₪|שקל|ש"ח)/);
      
      if (priceMatch) {
        const priceStr = priceMatch[1].replace(/[,\s]/g, '');
        const price = parseFloat(priceStr);
        if (price >= 50 && price <= 50000) {
          products.push({ name, price });
        }
      }
    }
  });
  
  // Strategy 2: Direct pattern search (h2-h6, p, span with price nearby)
  if (products.length === 0 || true) { // Always run this strategy
    const productPattern = /<(?:h[23456]|p|span|strong|b)[^>]*>([^<]{3,80})<\/[^>]+>/gi;
    const matches = [...html.matchAll(productPattern)];
    
    matches.forEach(match => {
      const text = match[1].replace(/<[^>]*>/g, '').trim();
      
      // Check exclusions
      if (excludePatterns.some(ex => text.includes(ex))) return;
      if (excludeFromName.some(ex => text.includes(ex))) return;
      if (text.length <= 2 || text.length > 80) return;
      if (text.length <= 8 && !text.match(/\d/)) return; // Skip short non-numeric names
      
      // Look for price within 500 chars
      const startPos = match.index;
      const searchArea = html.substring(startPos, Math.min(startPos + 500, html.length));
      const priceMatch = searchArea.match(/₪\s*(\d+(?:[,\s]\d+)*(?:\.\d+)?)/) || 
                        searchArea.match(/(\d+(?:[,\s]\d+)*(?:\.\d+)?)\s*(?:₪|שקל|ש"ח)/);
      
      if (priceMatch) {
        const priceStr = priceMatch[1].replace(/[,\s]/g, '');
        const price = parseFloat(priceStr);
        if (price >= 50 && price <= 50000) {
          // Check if already exists
          if (!products.some(p => p.name === text)) {
            products.push({ name: text, price });
          }
        }
      }
    });
  }
  
  // Remove duplicates and filter
  const uniqueProducts = [];
  products.forEach(p => {
    if (!uniqueProducts.some(up => up.name === p.name && up.price === p.price)) {
      uniqueProducts.push(p);
    }
  });
  
  return uniqueProducts;
}

app.post('/api/save-page', async (req, res) => {
  try {
    let { userId, fileName, content, pageType, pageName } = req.body;
    
    if (!userId || !fileName || !content) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    // Fix WhatsApp code for event pages
    content = fixEventPageWhatsApp(content, pageType);
    
    // Fix store/course page issues (cart, bubbles) BEFORE saving
    if (pageType === 'store' || pageType === 'course' || pageType === 'restaurantMenu') {
      console.log(`🔧 Applying fixStorePageIssues for ${pageType} page during save`);
      content = fixStorePageIssues(content);
    }

    const filePath = path.join('output', userId, fileName);
    await fs.writeFile(filePath, content);

    // Save metadata with pageType
    if (pageType || pageName || req.body.expectedGuests || req.body.hasTickets) {
      const metadataDir = path.join('output', userId, `${fileName.replace('.html', '')}_data`);
      await fs.ensureDir(metadataDir);
      
      const metadata = {
        pageType: pageType || 'other',
        pageName: pageName || '',
        expectedGuests: parseInt(req.body.expectedGuests) || 0,
        hasTickets: req.body.hasTickets === true || req.body.hasTickets === 'true' || req.body.hasTickets === 'on',
        lastUpdated: new Date().toISOString()
      };
      
      // For service providers with appointment booking - save workingDays, workingHours, breaks, services
      if (req.body.workingDays) {
        metadata.workingDays = req.body.workingDays;
      }
      if (req.body.workingHours) {
        metadata.workingHours = req.body.workingHours;
      }
      if (req.body.breaks) {
        metadata.breaks = req.body.breaks;
      }
      if (req.body.services) {
        metadata.services = req.body.services;
      }
      
        // Extract products from store pages for bot access - LIVE VERSION
        if (pageType === 'store') {
          // Force empty products to ensure bot reads from live page
          metadata.products = [];
          console.log('✅ Products will be read from live page, not cached');
        }
      
      const metadataPath = path.join(metadataDir, 'metadata.json');
      await fs.writeJSON(metadataPath, metadata, { spaces: 2 });
      console.log('✅ Saved metadata:', metadata);
    }

    res.json({ success: true, message: 'Page saved successfully' });

  } catch (error) {
    console.error('Error saving page:', error);
    res.status(500).json({ error: 'Failed to save page' });
  }
});

// Update services for an existing page
app.put('/api/update-services/:userId/:pageId', async (req, res) => {
  try {
    const { userId, pageId } = req.params;
    const { services } = req.body;
    
    if (!userId || !pageId) {
      return res.status(400).json({ error: 'Missing userId or pageId' });
    }
    
    // Load existing metadata
    const metadataDir = path.join('output', userId, `${pageId.replace('.html', '')}_data`);
    const metadataPath = path.join(metadataDir, 'metadata.json');
    
    if (!await fs.pathExists(metadataPath)) {
      return res.status(404).json({ error: 'Metadata file not found' });
    }
    
    const metadata = await fs.readJSON(metadataPath);
    
    // Update services
    metadata.services = services || [];
    metadata.lastUpdated = new Date().toISOString();
    
    // Save updated metadata
    await fs.writeJSON(metadataPath, metadata, { spaces: 2, encoding: 'utf8' });
    
    console.log('✅ Services updated for', pageId, ':', services);
    
    res.json({ success: true, message: 'Services updated successfully', services });
    
  } catch (error) {
    console.error('Error updating services:', error);
    res.status(500).json({ error: 'Failed to update services' });
  }
});

// Submit lead from Message in a Bottle response form
app.post('/api/submit-lead', async (req, res) => {
  try {
    const { userId, pageName, name, phone, email, message } = req.body;
    
    console.log('📩 Lead submission:', { userId, pageName, name, phone, email, message });
    
    if (!userId || !pageName || !name || !phone) {
      return res.status(400).json({ error: 'Missing required fields: userId, pageName, name, phone' });
    }
    
    // Create leads directory
    const leadsDir = path.join('output', userId, `${pageName}_data`);
    await fs.ensureDir(leadsDir);
    
    const leadsPath = path.join(leadsDir, 'leads.json');
    
    // Load existing leads or create new array
    let leads = [];
    if (await fs.pathExists(leadsPath)) {
      try {
        leads = await fs.readJSON(leadsPath);
      } catch (error) {
        console.log('⚠️ Could not read existing leads, starting fresh');
      }
    }
    
    // Add new lead
    const newLead = {
      id: Date.now().toString(),
      name: name.trim(),
      phone: phone.trim(),
      email: email ? email.trim() : '',
      message: message ? message.trim() : '',
      timestamp: new Date().toISOString(),
      status: 'new'
    };
    
    leads.push(newLead);
    
    // Save leads
    await fs.writeJSON(leadsPath, leads, { spaces: 2 });
    
    console.log('✅ Lead saved:', newLead);
    
    res.json({ 
      success: true, 
      message: 'ההודעה נשלחה בהצלחה! 🎉',
      leadId: newLead.id 
    });
    
  } catch (error) {
    console.error('❌ Error saving lead:', error);
    res.status(500).json({ error: 'Failed to save lead: ' + error.message });
  }
});

// Get leads for a specific page
app.get('/api/leads/:userId/:pageName', async (req, res) => {
  try {
    const { userId, pageName } = req.params;
    
    console.log('📬 Getting leads for:', { userId, pageName });
    
    const leadsPath = path.join('output', userId, `${pageName}_data`, 'leads.json');
    
    if (!await fs.pathExists(leadsPath)) {
      return res.json({ leads: [] });
    }
    
    const leads = await fs.readJSON(leadsPath);
    
    console.log(`✅ Found ${leads.length} leads for ${pageName}`);
    res.json({ leads });
    
  } catch (error) {
    console.error('❌ Error getting leads:', error);
    res.status(500).json({ error: 'Failed to get leads: ' + error.message });
  }
});

// Get ALL pages from ALL users (for Stav bot - includes messageInBottle)
app.get('/api/pages/all', async (req, res) => {
  try {
    console.log('🤖 Getting ALL pages from ALL users (for Stav bot)');
    
    const outputDir = path.join('output');
    const allPages = [];
    
    // Read all user directories
    const allDirs = await fs.readdir(outputDir);
    
    // סנן תיקיות שאינן משתמשים אמיתיים
    const userDirs = [];
    for (const dirName of allDirs) {
      const userDirPath = path.join(outputDir, dirName);
      const stats = await fs.stat(userDirPath);
      
      // Skip if not a directory
      if (!stats.isDirectory()) continue;
      
      // התעלם מתיקיות: default, temp_*, USER_ID_PLACEHOLDER, תיקיות שמתחילות ב-user_
      if (dirName === 'default' || 
          dirName.startsWith('temp_') || 
          dirName === 'USER_ID_PLACEHOLDER' ||
          dirName.startsWith('user_')) {
        continue;
      }
      
      userDirs.push(dirName);
    }
    
    for (const userId of userDirs) {
      const userDirPath = path.join(outputDir, userId);
      
      console.log(`📂 Reading pages from user: ${userId}`);
      
      // Read this user's pages
      const files = await fs.readdir(userDirPath);
      
      // ONLY real HTML files! No ghost pages from _data folders
      const htmlFiles = files.filter(f => f.endsWith('_html') && !f.endsWith('_html_data'));
      
      console.log(`   Found ${htmlFiles.length} pages for user ${userId}`);
      
      // Process each page
      for (const fileName of htmlFiles) {
        const pageId = fileName.replace('_html', '');
        const metadataPath = path.join(userDirPath, `${fileName}_data`, 'metadata.json');
        
        let pageType = 'unknown';
        let expectedGuests = 0;
        let hasTickets = false;
        
        // Try to load metadata
        let metadata = {};
        if (await fs.pathExists(metadataPath)) {
          try {
            metadata = await fs.readJSON(metadataPath);
            pageType = metadata.pageType || 'unknown';
            expectedGuests = metadata.expectedGuests || 0;
            hasTickets = metadata.hasTickets || false;
          } catch (error) {
            console.log(`   ⚠️ Could not read metadata for ${fileName}`);
          }
        }
        
        // Check if HTML file exists
        const htmlFilePath = path.join(userDirPath, fileName);
        const hasHtmlFile = await fs.pathExists(htmlFilePath);
        
        // For messageInBottle pages, include the metadata fields
        let title = fileName.replace(/_\d{13}(_html)?$/, '').replace(/_html$/, '').replace(/_/g, ' ').trim();
        
        // For messageInBottle, use name from metadata
        if (pageType === 'messageInBottle' && metadata.name) {
          title = metadata.name;
        }
        
        const pageData = {
          fileName: fileName,
          pageId: pageId,
          url: `/users/${userId}/${encodeURIComponent(fileName)}`,
          title: title,
          description: `${pageType} page`,
          pageType: pageType,
          expectedGuests: expectedGuests,
          hasHtmlFile: hasHtmlFile,
          userId: userId,
          hasTickets: hasTickets
        };
        
        // Add messageInBottle specific data
        if (pageType === 'messageInBottle') {
          pageData.name = metadata.name;
          pageData.request = metadata.request;
          pageData.area = metadata.area;
          pageData.phone = metadata.phone;
          pageData.price = metadata.price;
          pageData.priceType = metadata.priceType;
        }
        
        allPages.push(pageData);
      }
    }
    
    console.log(`✅ Total pages for Stav: ${allPages.length}`);
    res.json({ pages: allPages });
    
  } catch (error) {
    console.error('Error getting all pages:', error);
    res.status(500).json({ error: 'Failed to get all pages: ' + error.message });
  }
});

// Get ALL pages from ALL users (for marketplace display - filtered)
app.get('/api/pages/all/marketplace', async (req, res) => {
  try {
    console.log('🌍 Getting ALL pages from ALL users for marketplace');
    
    const outputDir = path.join('output');
    const allPages = [];
    
    // 🎯 Define which page types should appear in marketplace
    const MARKETPLACE_PAGE_TYPES = [
      'store',            // חנות מקוונת
      'serviceProvider',  // נותן שירותים
      'course',           // קורסים דיגיטליים
      'realEstate',       // נכסים למכירה
      'product',          // דף מוצר
      'restaurantMenu'    // תפריט מסעדה
      // event - will be checked separately for hasTickets
    ];
    
    // Read all user directories
    const allDirs = await fs.readdir(outputDir);
    
    // סנן תיקיות שאינן משתמשים אמיתיים
    const userDirs = [];
    for (const dirName of allDirs) {
      const userDirPath = path.join(outputDir, dirName);
      const stats = await fs.stat(userDirPath);
      
      // Skip if not a directory
      if (!stats.isDirectory()) continue;
      
      // התעלם מתיקיות: default, temp_*, USER_ID_PLACEHOLDER, תיקיות שמתחילות ב-user_
      if (dirName === 'default' || 
          dirName.startsWith('temp_') || 
          dirName === 'USER_ID_PLACEHOLDER' ||
          dirName.startsWith('user_')) {
        continue;
      }
      
      userDirs.push(dirName);
    }
    
    for (const userId of userDirs) {
      const userDirPath = path.join(outputDir, userId);
      
      console.log(`📂 Reading pages from user: ${userId}`);
      
      // Read this user's pages
      const files = await fs.readdir(userDirPath);
      
      // ⛔ NEW: ONLY real HTML files! No ghost pages from _data folders
      const htmlFiles = files.filter(f => f.endsWith('_html') && !f.endsWith('_html_data'));
      
      console.log(`   Found ${htmlFiles.length} pages for user ${userId}`);
      
      // Process each page
      for (const fileName of htmlFiles) {
        const pageId = fileName.replace('_html', '');
        const metadataPath = path.join(userDirPath, `${fileName}_data`, 'metadata.json');
        
        let pageType = 'unknown';
        let expectedGuests = 0;
        let hasTickets = false;
        
        // Try to load metadata (includes contact info, products, city, etc.)
        let metadata = {};
        if (await fs.pathExists(metadataPath)) {
          try {
            metadata = await fs.readJSON(metadataPath);
            pageType = metadata.pageType || 'unknown';
            expectedGuests = metadata.expectedGuests || 0;
            hasTickets = metadata.hasTickets || false;
            // Metadata now includes: phone, phones, email, city, address, products
          } catch (error) {
            console.log(`   ⚠️ Could not read metadata for ${fileName}`);
          }
        } else {
          // If no metadata exists, try to extract it from HTML (for old pages)
          try {
            const htmlFilePath = path.join(userDirPath, fileName);
            if (await fs.pathExists(htmlFilePath)) {
              const htmlContent = await fs.readFile(htmlFilePath, 'utf8');
              console.log(`   🔍 Extracting metadata for old page: ${fileName}`);
              const contactInfo = extractContactInfoFromHTML(htmlContent);
              const products = extractProductsFromHTML(htmlContent);
              metadata = {
                ...metadata,
                phone: contactInfo.phone,
                phones: contactInfo.phones || [],
                email: contactInfo.email,
                city: contactInfo.city,
                address: contactInfo.address,
                products: products || []
              };
              // Save metadata for future use
              await fs.ensureDir(path.join(userDirPath, `${fileName}_data`));
              await fs.writeFile(metadataPath, JSON.stringify({ pageType, ...metadata }, null, 2));
              console.log(`   ✅ Saved extracted metadata for ${fileName}`);
            }
          } catch (error) {
            console.log(`   ⚠️ Could not extract metadata for ${fileName}:`, error.message);
          }
        }
        
        // 🎯 SMART FILTER: Include pages based on content, not just pageType!
        let shouldInclude = false;
        let includeReason = '';
        
        // 0️⃣ FIRST: Skip messageInBottle pages immediately
        if (pageType === 'messageInBottle' || pageType === 'message') {
          console.log(`   🍾 Skipping "${fileName}" - message in bottle (Stav only)`);
          continue; // Skip immediately, don't even add to array
        }
        
        // Check if page has appointments (for landing pages or any other type)
        const hasAppointments = metadata.appointments !== undefined && metadata.appointments !== null;
        
        // 1️⃣ Check if it's a marketplace-friendly page type
        if (MARKETPLACE_PAGE_TYPES.includes(pageType)) {
          shouldInclude = true;
          includeReason = `pageType: ${pageType}`;
        }
        
        // 1️⃣.5️⃣ Landing pages with appointments should be treated as serviceProvider for marketplace
        else if (pageType === 'landing' && hasAppointments) {
          pageType = 'serviceProvider'; // Override pageType to serviceProvider for marketplace
          shouldInclude = true;
          includeReason = `landing page with appointments`;
        }
        
        // 2️⃣ Check if event with paid tickets
        else if (pageType === 'event' && hasTickets) {
          shouldInclude = true;
          includeReason = 'event with paid tickets';
        }
        
        // 3️⃣ NEW: Check HTML content for products, services, or prices
        else {
          try {
            const htmlFilePath = path.join(userDirPath, fileName);
            const htmlContent = await fs.readFile(htmlFilePath, 'utf8');
            const lowerHtml = htmlContent.toLowerCase();
            
            // 🍾 CRITICAL: Check if this is a messageInBottle page (by checking for bottle indicators)
            const isMessageInBottle = lowerHtml.includes('🍾 מסר בבקבוק') || 
                                     lowerHtml.includes('response-form') ||
                                     lowerHtml.includes('השאר הודעה') ||
                                     lowerHtml.includes('hidden info for bot only');
            
            if (isMessageInBottle) {
              console.log(`   🍾 Skipping "${fileName}" - message in bottle page (Stav only)`);
              continue; // Skip this page entirely
            }
            
            // Check for service provider keywords (including barber, salon, etc.)
            const serviceProviderKeywords = ['מספרה', 'barber', 'hairdresser', 'salon', 'יפהפה', 'תספורת', 'גילוח', 'טיפול שיער',
                                             'קוסמטיקאית', 'מסאז', 'פדיקור', 'מניקור', 'ציפורניים', 'אסתטיקאית', 'טיפוח',
                                             'תור', 'appointment', 'booking', 'קביעת תור', 'schedule', 'calendar',
                                             'נגר', 'plumber', 'electrician', 'בעל מקצוע', 'נותן שירות', 'service provider',
                                             'צלמים', 'צלם', 'צילום', 'photographer', 'מורה', 'מאמנת', 'מאמן', 'personal trainer',
                                             'יועצת', 'יועץ', 'מנעולן', 'locksmith', 'זגג', 'glazier', 'צבעי', 'painter'];
            const hasServiceProviderKeywords = serviceProviderKeywords.some(keyword => lowerHtml.includes(keyword.toLowerCase()));
            
            // Check for restaurant keywords
            const restaurantKeywords = ['מסעדה', 'restaurant', 'תפריט', 'menu', 'אוכל', 'food', 'מזון', 'מטבח', 'kitchen',
                                       'שף', 'chef', 'פיצה', 'pizza', 'בורגר', 'burger', 'סושי', 'sushi', 'תאילנדי', 'thai',
                                       'איטלקי', 'italian', 'סיני', 'chinese', 'קונדיטוריה', 'bakery', 'מאפייה'];
            const hasRestaurantKeywords = restaurantKeywords.some(keyword => lowerHtml.includes(keyword.toLowerCase()));
            
            // If landing page has service provider keywords, treat as serviceProvider
            if (pageType === 'landing' && hasServiceProviderKeywords) {
              pageType = 'serviceProvider';
              shouldInclude = true;
              includeReason = 'landing page with service provider keywords';
            }
            
            // If landing page has restaurant keywords, treat as restaurantMenu
            else if (pageType === 'landing' && hasRestaurantKeywords) {
              pageType = 'restaurantMenu';
              shouldInclude = true;
              includeReason = 'landing page with restaurant keywords';
            }
            
            // Check for product cards, service listings, or price tags
            const hasProducts = htmlContent.includes('product-card') || 
                               htmlContent.includes('class="product') ||
                               htmlContent.includes('data-product');
            
            const hasServices = htmlContent.includes('service-card') ||
                               htmlContent.includes('שירות');
            
            const hasPrices = htmlContent.includes('₪') || 
                             htmlContent.includes('price') ||
                             htmlContent.match(/\d+\s*₪/);
            
            // Check for "מחיר" BUT exclude message in bottle pages
            const hasPriceWithoutBottle = htmlContent.includes('מחיר') && 
                                         !htmlContent.includes('hidden info for bot only');
            
            if (hasProducts || (hasServices && !htmlContent.includes('hidden info for bot only')) || 
                (hasPrices && !htmlContent.includes('hidden info for bot only')) || hasPriceWithoutBottle) {
              shouldInclude = true;
              includeReason = 'has products/services/prices';
            }
          } catch (error) {
            console.log(`   ⚠️ Could not read HTML for ${fileName}`);
          }
        }
        
        // Skip pages that shouldn't be in marketplace
        if (!shouldInclude) {
          console.log(`   ⛔ Skipping "${fileName}" - pageType: ${pageType}, no marketplace content`);
          continue;
        }
        
        console.log(`   ✅ Including "${fileName}" - ${includeReason}`);
        
        // Check if HTML file exists
        const htmlFilePath = path.join(userDirPath, fileName);
        const hasHtmlFile = await fs.pathExists(htmlFilePath);
        
        // Use metadata for contact info, products, etc.
        allPages.push({
          fileName: fileName,
          pageId: pageId,
          url: `/users/${userId}/${encodeURIComponent(fileName)}`,
          title: fileName.replace(/_\d{13}(_html)?$/, '').replace(/_html$/, '').replace(/_/g, ' ').trim(),
          description: metadata.description || `${pageType} page`,
          pageType: pageType,
          expectedGuests: expectedGuests,
          hasHtmlFile: hasHtmlFile,
          userId: userId,
          hasTickets: hasTickets,
          // Include metadata for search and display
          phone: metadata.phone,
          phones: metadata.phones || [],
          email: metadata.email,
          city: metadata.city,
          address: metadata.address,
          products: metadata.products || []
        });
      }
    }
    
    console.log(`✅ Total marketplace pages: ${allPages.length}`);
    res.json({ pages: allPages });
    
  } catch (error) {
    console.error('Error getting all marketplace pages:', error);
    res.status(500).json({ error: 'Failed to get marketplace pages: ' + error.message });
  }
});

// Get user pages
app.get('/api/pages/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    const userDir = path.join('output', userId);
    
    console.log('Getting pages for user:', userId);
    console.log('User directory:', userDir);
    
    if (!await fs.pathExists(userDir)) {
      console.log('User directory does not exist');
      return res.json({ pages: [] });
    }

    const files = await fs.readdir(userDir);
    console.log('Files in directory:', files);
    
    // Filter only actual HTML files, not _data folders
    const htmlFiles = files.filter(file => {
      // Check if it's a file (ends with .html or _html) and not a directory (_html_data)
      return (file.endsWith('.html') || file.endsWith('_html')) && !file.includes('_data');
    });
    
    // ⛔ NEW: ONLY return pages with actual HTML files!
    // Don't create "ghost pages" from _data folders without HTML
    const allPages = [...htmlFiles]; // ONLY real HTML files!
    console.log('✅ Valid HTML files found:', htmlFiles);
    console.log('📊 Total REAL pages (with HTML):', allPages.length);
    
    const pages = await Promise.all(allPages.map(async file => {
      // נקה את שם הקובץ להצגה
      let cleanTitle = file.replace('.html', '').replace(/_/g, ' ').replace(/^_+/, '');
      
      // נקה את השם מ-timestamps ומספרים ארוכים
      cleanTitle = cleanTitle.replace(/\d{13,}/g, '').replace(/\s+/g, ' ').trim();
      
      // אם השם ריק או מכיל רק מספרים, השתמש בשם ברירת מחדל
      if (!cleanTitle || cleanTitle.trim() === '' || /^\d+$/.test(cleanTitle.trim())) {
        cleanTitle = 'דף נחיתה';
      }
      
      // Load metadata if exists
      let pageType = null;
      let expectedGuests = 0;
      try {
        // Remove both .html and _html suffixes
        const fileNameBase = file.replace('.html', '').replace(/_html$/, '');
        const metadataPath = path.join(userDir, `${fileNameBase}_data`, 'metadata.json');
        if (await fs.pathExists(metadataPath)) {
          const metadata = await fs.readJSON(metadataPath);
          pageType = metadata.pageType;
          expectedGuests = metadata.expectedGuests || 0;
          console.log(`📋 Loaded metadata for ${file}: pageType=${pageType}, expectedGuests=${expectedGuests}`);
        } else {
          // Try alternative path with _html_data
          const altMetadataPath = path.join(userDir, `${file}_data`, 'metadata.json');
          if (await fs.pathExists(altMetadataPath)) {
            const metadata = await fs.readJSON(altMetadataPath);
            pageType = metadata.pageType;
            expectedGuests = metadata.expectedGuests || 0;
            console.log(`📋 Loaded metadata (alt) for ${file}: pageType=${pageType}, expectedGuests=${expectedGuests}`);
          } else {
            // If no metadata exists, try to detect from content
            try {
              const htmlFilePath = path.join(userDir, file);
              if (await fs.pathExists(htmlFilePath)) {
                const htmlContent = await fs.readFile(htmlFilePath, 'utf8');
                const lowerContent = htmlContent.toLowerCase();
                
                // Check for messageInBottle indicators
                if (lowerContent.includes('🍾') || 
                    lowerContent.includes('מסר בבקבוק') || 
                    lowerContent.includes('response-form') ||
                    lowerContent.includes('ערוך פרטי הפוסט')) {
                  pageType = 'messageInBottle';
                  console.log(`🔍 Auto-detected messageInBottle from content for ${file}`);
                  
                  // Create metadata file for future use
                  await fs.ensureDir(path.dirname(metadataPath));
                  await fs.writeFile(metadataPath, JSON.stringify({
                    pageType: 'messageInBottle',
                    createdAt: new Date().toISOString(),
                    fileName: fileNameBase,
                    autoDetected: true
                  }, null, 2));
                  console.log(`💾 Created metadata file for auto-detected messageInBottle: ${metadataPath}`);
                }
              }
            } catch (detectionError) {
              console.log(`Could not auto-detect page type for ${file}:`, detectionError.message);
            }
          }
        }
      } catch (err) {
        console.log(`No metadata for ${file}:`, err.message);
      }
      
      // Check if page is active from metadata
      let isActive = false;
      try {
        const fileNameBase = file.replace('.html', '').replace(/_html$/, '');
        const metadataPath = path.join(userDir, `${fileNameBase}_data`, 'metadata.json');
        if (await fs.pathExists(metadataPath)) {
          const metadata = await fs.readJSON(metadataPath);
          isActive = metadata.isActive === true;
        }
      } catch (err) {
        console.log(`Could not check isActive for ${file}:`, err.message);
      }
      
      // Check if actual HTML file exists
      const htmlFilePath = path.join(userDir, file);
      const hasHtmlFile = await fs.pathExists(htmlFilePath);
      
      // Create display title with page type
      let displayTitle = cleanTitle;
      if (pageType) {
        const pageTypeLabels = {
          'messageInBottle': 'מסר בבקבוק',
          'store': 'חנות',
          'onlineStore': 'חנות מקוונת',
          'event': 'הזמנה',
          'serviceProvider': 'נותן שירותים',
          'course': 'קורס',
          'workshop': 'סדנה',
          'restaurantMenu': 'תפריט מסעדה',
          'realEstate': 'נדל"ן',
          'product': 'מוצר'
        };
        
        const typeLabel = pageTypeLabels[pageType] || pageType;
        displayTitle = `${typeLabel} - ${cleanTitle}`;
      }
      
      return {
        fileName: file,
        title: displayTitle, // Use display title with page type
        url: `/pages/${userId}/${encodeURIComponent(file)}`,
        pageType: pageType, // Add pageType to response
        expectedGuests: expectedGuests, // Add expected guests for table calculations
        hasHtmlFile: hasHtmlFile, // Indicate if HTML file exists
        isActive: isActive // Add isActive status
      };
    }));

    // Return ALL pages - including ones with only _data folders
    // The client can decide whether to display them or not
    console.log('Returning pages:', pages.length, 'total pages');
    res.json({ pages: pages });

  } catch (error) {
    console.error('Error getting pages:', error);
    res.status(500).json({ error: 'Failed to get pages: ' + error.message });
  }
});

// Update page endpoint
app.put('/api/update-page', async (req, res) => {
  try {
    let { userId, fileName, htmlContent } = req.body;
    
    if (!userId || !fileName || !htmlContent) {
      return res.status(400).json({ error: 'Missing userId, fileName, or htmlContent' });
    }

    const userDir = path.join('output', userId);
    const filePath = path.join(userDir, fileName);
    
    console.log('Updating file:', filePath);
    
    // בדוק אם הקובץ קיים
    if (!await fs.pathExists(filePath)) {
      return res.status(404).json({ error: 'File not found' });
    }
    
    // 🔧 CRITICAL FIX: Determine page type and apply fixEventPageWhatsApp
    let pageType = 'general';
    
    // Try to detect page type from metadata
    const dataFolderName = fileName.replace('.html', '').replace('_html', '_html_data');
    const metadataPath = path.join(userDir, dataFolderName, 'metadata.json');
    
    if (await fs.pathExists(metadataPath)) {
      try {
        const metadata = await fs.readJson(metadataPath);
        pageType = metadata.pageType || 'general';
        console.log('📋 Detected pageType from metadata:', pageType);
      } catch (err) {
        console.warn('⚠️ Could not read metadata, detecting from HTML...');
      }
    }
    
    // Fallback: detect from HTML
    if (pageType === 'general') {
      if (htmlContent.includes('page-type') && htmlContent.includes('content="event"')) {
        pageType = 'event';
      }
    }
    
    console.log(`🎯 Final pageType for update: ${pageType}`);
    
    // ✅ INJECT universal data extractor for ALL page types BEFORE saving
    htmlContent = injectPageDataExtractor(htmlContent, pageType);
    
    // Apply fixEventPageWhatsApp for event pages BEFORE saving
    if (pageType === 'event') {
      console.log('🔧 Applying fixEventPageWhatsApp BEFORE saving...');
      htmlContent = fixEventPageWhatsApp(htmlContent, pageType);
      console.log('✅ fixEventPageWhatsApp applied successfully');
    }
    
    // Apply fixStorePageIssues for store pages BEFORE saving
    if (pageType === 'store' || pageType === 'restaurantMenu') {
      console.log('🔧 Applying fixStorePageIssues BEFORE saving...');
      htmlContent = fixStorePageIssues(htmlContent);
      console.log('✅ fixStorePageIssues applied successfully');
    }
    
    // עדכן את הקובץ
    await fs.writeFile(filePath, htmlContent);
    
    console.log('File updated successfully:', fileName);
    res.json({ success: true, message: 'File updated successfully' });

  } catch (error) {
    console.error('Error updating page:', error);
    res.status(500).json({ error: 'Failed to update page: ' + error.message });
  }
});

// Delete page endpoint
app.delete('/api/delete-page', async (req, res) => {
  try {
    const { userId, fileName } = req.body;
    
    if (!userId || !fileName) {
      return res.status(400).json({ error: 'Missing userId or fileName' });
    }

    const userDir = path.join('output', userId);
    
    // Decode URL-encoded fileName
    const decodedFileName = decodeURIComponent(fileName);
    const filePath = path.join(userDir, decodedFileName);
    
    console.log('Deleting page:', decodedFileName);
    console.log('File path:', filePath);
    
    let deletedSomething = false;
    
    // מחק את קובץ ה-HTML אם קיים
    if (await fs.pathExists(filePath)) {
      await fs.remove(filePath);
      console.log('✅ Deleted HTML file');
      deletedSomething = true;
    } else {
      console.log('⚠️ HTML file not found, will try to delete data folders');
    }
    
    // מחק את תיקיות הנתונים (_data folders)
    const fileNameBase = decodedFileName.replace('.html', '').replace(/_html$/, '');
    
    // Try to delete _data folder
    const dataDir1 = path.join(userDir, `${fileNameBase}_data`);
    if (await fs.pathExists(dataDir1)) {
      await fs.remove(dataDir1);
      console.log('✅ Deleted _data folder:', dataDir1);
      deletedSomething = true;
    }
    
    // Try to delete _html_data folder
    const dataDir2 = path.join(userDir, `${fileNameBase}_html_data`);
    if (await fs.pathExists(dataDir2)) {
      await fs.remove(dataDir2);
      console.log('✅ Deleted _html_data folder:', dataDir2);
      deletedSomething = true;
    }
    
    // Try to delete alternative _html_data folder (for files ending with _html)
    const dataDir3 = path.join(userDir, `${decodedFileName}_data`);
    if (await fs.pathExists(dataDir3)) {
      await fs.remove(dataDir3);
      console.log('✅ Deleted alternative _data folder:', dataDir3);
      deletedSomething = true;
    }
    
    // מחק את תיקיית התמונות הספציפית לדף הזה
    const pageImagesDir = path.join(userDir, 'images', fileNameBase);
    if (await fs.pathExists(pageImagesDir)) {
      await fs.remove(pageImagesDir);
      console.log('✅ Deleted page images folder');
      deletedSomething = true;
    }
    
    // Check if we deleted anything
    if (!deletedSomething) {
      console.log('❌ Nothing was deleted - page not found');
      return res.status(404).json({ error: 'Page not found (no HTML file or data folders)' });
    }
    
    // Clean up database.json
    try {
      const db = loadDatabase();
      const pageId = fileNameBase;
      
      // Delete purchases related to this page
      let deletedPurchases = 0;
      Object.keys(db.purchases).forEach(purchaseId => {
        const purchase = db.purchases[purchaseId];
        if (purchase.storeId === pageId || purchase.storeId === decodedFileName || 
            purchase.pageName === pageId || purchase.pageName === decodedFileName) {
          delete db.purchases[purchaseId];
          deletedPurchases++;
        }
      });
      
      // Delete leads (event guests) related to this page
      let deletedLeads = 0;
      if (db.leads) {
        Object.keys(db.leads).forEach(leadId => {
          const lead = db.leads[leadId];
          if (lead.eventId === pageId || lead.eventId === decodedFileName || 
              lead.pageId === pageId || lead.pageId === decodedFileName) {
            delete db.leads[leadId];
            deletedLeads++;
          }
        });
      }
      
      // Update user purchases array
      if (db.users[userId] && db.users[userId].purchases) {
        const originalLength = db.users[userId].purchases.length;
        db.users[userId].purchases = db.users[userId].purchases.filter(purchaseId => {
          return db.purchases[purchaseId]; // Keep only purchases that still exist
        });
        const removedCount = originalLength - db.users[userId].purchases.length;
        console.log(`🗑️ Removed ${removedCount} purchases from user's purchase list`);
      }
      
      // Recalculate analytics
      db.analytics.totalSales = Object.values(db.purchases).reduce((sum, p) => sum + (p.total || 0), 0);
      db.analytics.recentPurchases = Object.values(db.purchases)
        .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
        .slice(0, 50);
      
      saveDatabase(db);
      console.log(`🧹 Cleaned database: ${deletedPurchases} purchases, ${deletedLeads} leads removed`);
    } catch (dbError) {
      console.error('⚠️ Error cleaning database:', dbError);
      // Don't fail the request if DB cleanup fails
    }
    
    console.log('✅ Page deleted successfully:', decodedFileName);
    res.json({ success: true, message: 'Page deleted successfully' });

  } catch (error) {
    console.error('Error deleting page:', error);
    res.status(500).json({ error: 'Failed to delete page: ' + error.message });
  }
});

// Generate HTML with built-in editor
function generatePageHtml(pageData, userId) {
  return `
<!DOCTYPE html>
<html lang="he" dir="rtl">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${pageData.title || 'דף חדש'}</title>
    <style>
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }
        
        body {
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            line-height: 1.6;
            color: #333;
            background-color: #f5f5f5;
        }
        
        .editor-toolbar {
            position: fixed;
            top: 20px;
            right: 20px;
            background: white;
            padding: 15px;
            border-radius: 10px;
            box-shadow: 0 4px 20px rgba(0,0,0,0.1);
            z-index: 1000;
            display: flex;
            gap: 10px;
            align-items: center;
        }
        
        .editor-toolbar button {
            padding: 8px 12px;
            border: none;
            border-radius: 5px;
            background: #007bff;
            color: white;
            cursor: pointer;
            font-size: 14px;
            transition: background 0.3s;
        }
        
        .editor-toolbar button:hover {
            background: #0056b3;
        }
        
        .editor-toolbar button.danger {
            background: #dc3545;
        }
        
        .editor-toolbar button.danger:hover {
            background: #c82333;
        }
        
        .page-container {
            max-width: 1200px;
            margin: 0 auto;
            padding: 20px;
            background: white;
            min-height: 100vh;
            box-shadow: 0 0 20px rgba(0,0,0,0.1);
        }
        
        .editable {
            outline: none;
            padding: 5px;
            margin: 5px 0;
            border-radius: 3px;
            transition: background 0.2s;
        }
        
        .editable:hover {
            background: #f8f9fa;
        }
        
        .editable:focus {
            background: #e3f2fd;
            border: 2px solid #2196f3;
        }
        
        .image-upload-area {
            border: 2px dashed #ccc;
            padding: 20px;
            text-align: center;
            margin: 20px 0;
            border-radius: 10px;
            cursor: pointer;
            transition: border-color 0.3s;
        }
        
        .image-upload-area:hover {
            border-color: #007bff;
        }
        
        .image-upload-area.dragover {
            border-color: #007bff;
            background: #f8f9fa;
        }
        
        .hidden {
            display: none;
        }
        
        .status-message {
            position: fixed;
            bottom: 20px;
            right: 20px;
            background: #28a745;
            color: white;
            padding: 10px 15px;
            border-radius: 5px;
            z-index: 1001;
            opacity: 0;
            transition: opacity 0.3s;
        }
        
        .status-message.show {
            opacity: 1;
        }
        
        .status-message.error {
            background: #dc3545;
        }
    </style>
</head>
<body>
    <div class="editor-toolbar">
        <button onclick="toggleEdit()" id="editBtn">עריכה</button>
        <button onclick="savePage()" id="saveBtn">שמירה</button>
        <button onclick="addImage()" id="imageBtn">הוספת תמונה</button>
        <input type="file" id="imageInput" accept="image/*" class="hidden" onchange="handleImageUpload(event)">
    </div>
    
    <div class="page-container" id="pageContainer">
        <h1 class="editable" data-type="title">${pageData.title || 'כותרת הדף'}</h1>
        <div class="editable" data-type="content">
            ${pageData.content || '<p>תוכן הדף שלך כאן...</p>'}
        </div>
    </div>
    
    <div class="status-message" id="statusMessage"></div>

    <script>
        let isEditing = false;
        const userId = '${userId}';
        const fileName = '${pageData.title || 'דף נחיתה'}.html'.replace(/[^a-zA-Z0-9\u0590-\u05FF]/g, '_');
        
        // נקה את היסטוריית הצ'אט בטעינת הדף
        window.addEventListener('load', function() {
            clearChatHistory();
        });
        
        function toggleEdit() {
            isEditing = !isEditing;
            const editables = document.querySelectorAll('.editable');
            const editBtn = document.getElementById('editBtn');
            
            editables.forEach(el => {
                el.contentEditable = isEditing;
            });
            
            editBtn.textContent = isEditing ? 'סיום עריכה' : 'עריכה';
            editBtn.style.background = isEditing ? '#28a745' : '#007bff';
            
            // נקה את היסטוריית הצ'אט כשנכנסים למצב עריכה
            if (isEditing) {
                clearChatHistory();
            }
        }
        
        function clearChatHistory() {
            // נקה את היסטוריית הצ'אט
            const chatHistory = localStorage.getItem('chatHistory_' + fileName);
            if (chatHistory) {
                localStorage.setItem('chatHistory_' + fileName, JSON.stringify([]));
            }
            
            // נקה את תצוגת הצ'אט אם הוא פתוח
            const chatWindow = document.querySelector('.chat-window');
            if (chatWindow) {
                const messageHistory = chatWindow.querySelector('.message-history');
                if (messageHistory) {
                    messageHistory.innerHTML = '';
                }
            }
        }
        
        function savePage() {
            const content = document.documentElement.outerHTML;
            
            fetch('/api/save-page', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    userId: userId,
                    fileName: fileName,
                    content: content
                })
            })
            .then(response => response.json())
            .then(data => {
                if (data.success) {
                    showStatus('הדף נשמר בהצלחה!', 'success');
                } else {
                    showStatus('שגיאה בשמירת הדף', 'error');
                }
            })
            .catch(error => {
                console.error('Error saving page:', error);
                showStatus('שגיאה בשמירת הדף', 'error');
            });
        }
        
        function addImage() {
            document.getElementById('imageInput').click();
        }
        
        function handleImageUpload(event) {
            const file = event.target.files[0];
            if (!file) return;
            
            const formData = new FormData();
            formData.append('image', file);
            formData.append('userId', userId);
            formData.append('pageName', fileName.replace('.html', ''));
            
            fetch('/api/upload-image', {
                method: 'POST',
                body: formData
            })
            .then(response => response.json())
            .then(data => {
                if (data.success) {
                    insertImage(data.imageUrl);
                    showStatus('התמונה הועלתה בהצלחה!', 'success');
                } else {
                    showStatus('שגיאה בהעלאת התמונה', 'error');
                }
            })
            .catch(error => {
                console.error('Error uploading image:', error);
                showStatus('שגיאה בהעלאת התמונה', 'error');
            });
        }
        
        function insertImage(imageUrl) {
            const container = document.getElementById('pageContainer');
            const img = document.createElement('img');
            img.src = imageUrl;
            img.style.maxWidth = '100%';
            img.style.height = 'auto';
            img.style.margin = '20px 0';
            img.style.borderRadius = '10px';
            img.style.boxShadow = '0 4px 15px rgba(0,0,0,0.1)';
            
            container.appendChild(img);
        }
        
        function showStatus(message, type = 'success') {
            const statusEl = document.getElementById('statusMessage');
            statusEl.textContent = message;
            statusEl.className = 'status-message ' + type + ' show';
            
            setTimeout(() => {
                statusEl.classList.remove('show');
            }, 3000);
        }
        
        // Auto-save every 30 seconds
        setInterval(() => {
            if (isEditing) {
                savePage();
            }
        }, 30000);
    </script>
</body>
</html>`;
}

// API endpoint לקבלת כל המשתמשים
app.get('/api/users', async (req, res) => {
  try {
    // קבל את כל התיקיות ב-output
    const outputDir = path.join(__dirname, 'output');
    const users = [];
    
    console.log('Checking output directory:', outputDir);
    
    if (fs.existsSync(outputDir)) {
      const entries = fs.readdirSync(outputDir, { withFileTypes: true });
      console.log('Found directories:', entries.map(e => e.name));
      
      // סנן תיקיות שאינן משתמשים אמיתיים - לפני הלולאה
      // משתמש אמיתי = UUID או user_* שיש להם דפים
      const UUID_PATTERN = /^[a-f0-9]{8}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{12}$/i;
      
      const validEntries = entries.filter(entry => {
        if (!entry.isDirectory()) {
          console.log(`Skipping non-directory: ${entry.name}`);
          return false;
        }
        
        const userId = entry.name;
        
        // התעלם מתיקיות: default, temp_*, USER_ID_PLACEHOLDER
        if (userId === 'default' || 
            userId.startsWith('temp_') || 
            userId === 'USER_ID_PLACEHOLDER') {
          console.log(`Skipping non-user directory: ${userId}`);
          return false;
        }
        
        // בדוק אם זה UUID (משתמש אמיתי)
        if (UUID_PATTERN.test(userId)) {
          return true;
        }
        
        // בדוק אם זה user_* - כלול אותו אם יש לו תיקייה
        if (userId.startsWith('user_')) {
          const userDir = path.join(outputDir, userId);
          if (fs.existsSync(userDir)) {
            // כלול את התיקייה גם אם אין לה דפים (יכול להיות משתמש ישן)
            console.log(`✅ Including user_* directory: ${userId}`);
            return true;
          }
          console.log(`Skipping user_* directory that doesn't exist: ${userId}`);
          return false;
        }
        
        // כל דבר אחר - התעלם
        console.log(`Skipping unknown directory format: ${userId}`);
        return false;
      });
      
      console.log(`✅ /api/users: Valid user directories: ${validEntries.length} (filtered from ${entries.length} total directories)`);
      console.log(`✅ /api/users: Valid user IDs:`, validEntries.map(e => e.name));
      
      if (validEntries.length === 0) {
        console.warn('⚠️ /api/users: No valid user directories found!');
      }
      
      validEntries.forEach(entry => {
        const userId = entry.name;
        
        const userDir = path.join(outputDir, userId);
        
        // חשב נתונים אמיתיים למשתמש
        let totalPages = 0;
        
        if (fs.existsSync(userDir)) {
          const files = fs.readdirSync(userDir);
          totalPages = files.filter(file => file.endsWith('_html')).length; // קבצים שמסתיימים ב-_html
          console.log(`User ${userId}: ${totalPages} pages`);
        }
        
        // בדוק אם זה המנהל
        const isAdmin = userId === 'fae06b49-1239-4ba5-93db-244ce2851fb4';
        
        // הוסף את כל המשתמשים (גם אם אין להם דפים)
        let userEmail, userName;
        
        if (isAdmin) {
          userEmail = 'admin@autopage.com';
          userName = 'מנהל המערכת';
        } else if (userId === '3ed25bfd-680d-4c09-a027-1a846170c13e') {
          userEmail = 'ehaleiameleh@gmail.com';
          userName = 'משתמש רגיל';
        } else if (userId.startsWith('user_')) {
          // משתמש עם user_ prefix
          userEmail = `${userId}@autopage.com`;
          userName = `משתמש ${userId.substring(5, 13)}`; // חלק מה-ID
        } else {
          userEmail = `${userId}@example.com`;
          userName = `משתמש ${userId.substring(0, 8)}`;
        }
        
        // בדוק את תאריך יצירת התיקיה כדי לדעת מתי המשתמש נוצר
        let createdAt = new Date().toISOString();
        try {
          const stats = fs.statSync(userDir);
          createdAt = stats.birthtime.toISOString();
        } catch (error) {
          console.log(`Could not get creation time for ${userId}:`, error.message);
        }
        
        users.push({
          id: userId,
          email: userEmail,
          full_name: userName,
          created_at: createdAt, // תאריך יצירת התיקיה
          subscription_status: totalPages > 0 ? 'active' : 'inactive',
          totalPages: totalPages,
          activeSubscriptions: totalPages, // כל דף פעיל
          totalRevenue: totalPages * 39, // ₪39 לכל דף
          isAdmin: isAdmin
        });
      });
    }
    
    console.log('Real users found:', users.length, users.map(u => ({ id: u.id, name: u.full_name, pages: u.totalPages })));
    res.json(users);
  } catch (error) {
    console.error('Error getting users:', error);
    res.status(500).json({ error: 'Failed to get users' });
  }
});

// API endpoint לקבלת כל הדפים במערכת
app.get('/api/all-pages', async (req, res) => {
  try {
    const allPages = [];
    const outputDir = path.join(__dirname, 'output');
    
    console.log('Getting all pages from:', outputDir);
    
    if (fs.existsSync(outputDir)) {
      const entries = fs.readdirSync(outputDir, { withFileTypes: true })
        .filter(entry => entry.isDirectory());
      
      // סנן תיקיות שאינן משתמשים אמיתיים (בדיוק כמו ב-/api/users)
      // משתמש אמיתי = UUID או user_* שיש לו תיקייה
      const UUID_PATTERN = /^[a-f0-9]{8}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{12}$/i;
      
      const userIds = entries
        .filter(entry => {
          if (!entry.isDirectory()) return false;
          const userId = entry.name;
          
          // התעלם מתיקיות: default, temp_*, USER_ID_PLACEHOLDER
          if (userId === 'default' || 
              userId.startsWith('temp_') || 
              userId === 'USER_ID_PLACEHOLDER') {
            return false;
          }
          
          // בדוק אם זה UUID (משתמש אמיתי)
          if (UUID_PATTERN.test(userId)) {
            return true;
          }
          
          // בדוק אם זה user_* - כלול אותו אם יש לו תיקייה
          if (userId.startsWith('user_')) {
            return true;
          }
          
          // כל דבר אחר - התעלם
          return false;
        })
        .map(entry => entry.name);
      
      console.log('User IDs found:', userIds);
      
      for (const userId of userIds) {
        const userDir = path.join(outputDir, userId);
          if (fs.existsSync(userDir)) {
            const entries = fs.readdirSync(userDir, { withFileTypes: true });
            
            // קודם, תן לנו לזהות את כל הדפים - גם קבצי HTML וגם תיקיות _html_data/_html_html_data
            const pageMap = new Map(); // נשתמש ב-Map כדי למנוע כפילויות
            
            // שלב 1: קבצי HTML רגילים
            const htmlFiles = entries.filter(entry => !entry.isDirectory() && entry.name.endsWith('_html'));
            console.log(`User ${userId}: ${htmlFiles.length} HTML files`);
            
            htmlFiles.forEach(entry => {
              const file = entry.name;
              const filePath = path.join(userDir, file);
              const stats = fs.statSync(filePath);
              
              // Check if page is active from metadata
              let isActive = false;
              const fileNameWithoutExt = file.replace('_html', '');
              
              try {
                // נסה למצוא metadata בשתי תיקיות אפשריות
                const metaPath1 = path.join(userDir, `${fileNameWithoutExt}_html_data`, 'metadata.json');
                const metaPath2 = path.join(userDir, `${fileNameWithoutExt}_html_html_data`, 'metadata.json');
                
                let metaPath = fs.existsSync(metaPath1) ? metaPath1 : metaPath2;
                
                if (fs.existsSync(metaPath)) {
                  const meta = JSON.parse(fs.readFileSync(metaPath, 'utf8'));
                  isActive = meta.isActive === true;
                  if (isActive) {
                    console.log(`✅ Page ${file} is ACTIVE`);
                  }
                }
              } catch (error) {
                console.log(`⚠️ Error reading isActive from metadata: ${file}`, error.message);
                isActive = false;
              }

              pageMap.set(fileNameWithoutExt, {
                fileName: file,
                title: file.replace('_html', '').replace(/_/g, ' ').trim(),
                userId: userId,
                created_at: stats.birthtime.toISOString(),
                url: `/output/${userId}/${file}`,
                isActive: isActive
              });
              
              if (isActive) {
                console.log(`✅ /api/all-pages: Page ${file} is ACTIVE (userId: ${userId})`);
              }
            });
            
            // שלב 2: רק תיקיות _html_html_data שיש להן גם קובץ HTML מקורי
            // כדי למנוע כפילויות ולבדוק דפים שיש להם רק _html_html_data
            const htmlHtmlDataDirs = entries.filter(entry => 
              entry.isDirectory() && entry.name.endsWith('_html_html_data')
            );
            
            htmlHtmlDataDirs.forEach(entry => {
              const dirName = entry.name;
              let pageName = dirName.replace('_html_html_data', '');
              const correspondingHtmlFile = `${pageName}_html`;
              
              // בדוק אם יש קובץ HTML שמתאים לתיקייה הזו
              const htmlFileExists = entries.some(e => !e.isDirectory() && e.name === correspondingHtmlFile);
              
              // אם אין קובץ HTML מקורי - זה דף שנמחק, לא נכלול אותו
              if (!htmlFileExists) {
                return; // skip deleted pages
              }
              
              // אם כבר ראינו את הדף הזה מקובץ HTML בשלב 1, זה אומר שיש בעיה ב-metadata
              // נעדכן את ה-isActive מה-_html_html_data אם הוא לא עודכן בשלב 1
              if (pageMap.has(pageName)) {
                const existingPage = pageMap.get(pageName);
                // אם הדף לא פעיל בשלב 1, נבדוק שוב
                if (!existingPage.isActive) {
                  try {
                    const metaPath = path.join(userDir, dirName, 'metadata.json');
                    if (fs.existsSync(metaPath)) {
                      const meta = JSON.parse(fs.readFileSync(metaPath, 'utf8'));
                      if (meta.isActive === true) {
                        existingPage.isActive = true;
                        console.log(`✅ Updated page ${pageName} to ACTIVE from _html_html_data`);
                      }
                    }
                  } catch (error) {
                    console.log(`⚠️ Error re-checking metadata for ${dirName}:`, error.message);
                  }
                }
              }
            });
            
            // הוסף את כל הדפים מה-Map לרשימה
            allPages.push(...Array.from(pageMap.values()));
            
          } else {
            console.log(`User ${userId}: directory not found`);
          }
      }
    }
    
    console.log(`Total pages found: ${allPages.length}`);
    res.json(allPages);
  } catch (error) {
    console.error('Error getting all pages:', error);
    res.status(500).json({ error: 'Failed to get all pages' });
  }
});

// API endpoint for bot to get current page data (products, etc.) - LIVE VERSION
app.get('/api/page-data/:userId/:pageId', async (req, res) => {
  try {
    const { userId, pageId } = req.params;
    const userDir = path.join(__dirname, 'output', userId);
    
    if (!await fs.pathExists(userDir)) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    // Look for the HTML file
    const files = await fs.readdir(userDir);
    const htmlFile = files.find(file => file.includes(pageId) && file.endsWith('.html'));
    
    if (!htmlFile) {
      return res.status(404).json({ error: 'Page not found' });
    }
    
    const htmlPath = path.join(userDir, htmlFile);
    const htmlContent = await fs.readFile(htmlPath, 'utf-8');
    
    // Extract products from HTML content using improved patterns
    const products = [];
    
    // More flexible product extraction patterns
    const productPatterns = [
      // Standard patterns
      /<h[1-6][^>]*class="[^"]*product[^"]*"[^>]*>([^<]+)<\/h[1-6]>/gi,
      /<h[1-6][^>]*class="[^"]*title[^"]*"[^>]*>([^<]+)<\/h[1-6]>/gi,
      /<h[1-6][^>]*class="[^"]*name[^"]*"[^>]*>([^<]+)<\/h[1-6]>/gi,
      // Generic heading patterns
      /<h[1-6][^>]*>([^<]+)<\/h[1-6]>/gi
    ];
    
    const pricePatterns = [
      /<[^>]*class="[^"]*price[^"]*"[^>]*>₪(\d+(?:[.,]\d+)?)<\/[^>]*>/gi,
      /<[^>]*class="[^"]*cost[^"]*"[^>]*>₪(\d+(?:[.,]\d+)?)<\/[^>]*>/gi,
      /₪(\d+(?:[.,]\d+)?)/gi
    ];
    
    // Extract all potential product names
    const productNames = [];
    productPatterns.forEach(pattern => {
      let match;
      while ((match = pattern.exec(htmlContent)) !== null) {
        const name = match[1].trim();
        if (name && name.length > 2 && name.length < 100) {
          productNames.push(name);
        }
      }
    });
    
    // Extract all potential prices
    const prices = [];
    pricePatterns.forEach(pattern => {
      let match;
      while ((match = pattern.exec(htmlContent)) !== null) {
        const price = match[1].replace(',', '.');
        if (price && !isNaN(parseFloat(price))) {
          prices.push(parseFloat(price));
        }
      }
    });
    
    // Match products with prices (try to pair them intelligently)
    const minLength = Math.min(productNames.length, prices.length);
    for (let i = 0; i < minLength; i++) {
      products.push({
        name: productNames[i],
        price: prices[i]
      });
    }
    
    // If we have more names than prices, add products without prices
    if (productNames.length > prices.length) {
      for (let i = prices.length; i < productNames.length; i++) {
        products.push({
          name: productNames[i],
          price: 0 // Will be updated when user edits
        });
      }
    }
    
    // Extract page content
    const pageContent = {
      title: htmlContent.match(/<title>([^<]+)<\/title>/)?.[1] || '',
      products: products,
      headings: productNames,
      sections: (htmlContent.match(/<section/g) || []).length
    };
    
    res.json({
      success: true,
      pageContent: pageContent,
      products: products,
      timestamp: new Date().toISOString()
    });
    
  } catch (error) {
    console.error('Error getting page data:', error);
    res.status(500).json({ error: 'Failed to get page data' });
  }
});

// API endpoint to update live products for bot
app.post('/api/update-live-products', async (req, res) => {
  try {
    const { userId, pageId, products } = req.body;
    
    // Store live products in memory for bot access
    if (!global.liveProducts) {
      global.liveProducts = {};
    }
    
    const key = `${userId}_${pageId}`;
    global.liveProducts[key] = {
      products: products,
      timestamp: new Date().toISOString()
    };
    
    console.log('✅ Live products updated:', key, products);
    
    res.json({
      success: true,
      message: 'Live products updated',
      products: products
    });
    
  } catch (error) {
    console.error('Error updating live products:', error);
    res.status(500).json({ error: 'Failed to update live products' });
  }
});

// Public pages API for marketplace (returns normalized structure)
app.get('/api/public-pages', async (req, res) => {
  try {
    const pages = [];
    const outputDir = path.join(__dirname, 'output');
    if (fs.existsSync(outputDir)) {
      const entries = fs.readdirSync(outputDir, { withFileTypes: true })
        .filter(entry => entry.isDirectory());
      
      // סנן תיקיות שאינן משתמשים אמיתיים (בדיוק כמו ב-/api/users)
      // משתמש אמיתי = UUID או user_* שיש לו תיקייה
      const UUID_PATTERN = /^[a-f0-9]{8}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{12}$/i;
      
      const userIds = entries
        .filter(entry => {
          if (!entry.isDirectory()) return false;
          const userId = entry.name;
          
          // התעלם מתיקיות: default, temp_*, USER_ID_PLACEHOLDER
          if (userId === 'default' || 
              userId.startsWith('temp_') || 
              userId === 'USER_ID_PLACEHOLDER') {
            return false;
          }
          
          // בדוק אם זה UUID (משתמש אמיתי)
          if (UUID_PATTERN.test(userId)) {
            return true;
          }
          
          // בדוק אם זה user_* - כלול אותו אם יש לו תיקייה
          if (userId.startsWith('user_')) {
            return true;
          }
          
          // כל דבר אחר - התעלם
          return false;
        })
        .map(entry => entry.name);

      for (const userId of userIds) {
        const userDir = path.join(outputDir, userId);
        if (!fs.existsSync(userDir)) continue;

        const files = fs.readdirSync(userDir);
        const htmlFiles = files.filter(f => f.endsWith('_html'));
        const dataFolders = files.filter(f => f.endsWith('_html_data'));

        // Pages with actual HTML files
        htmlFiles.forEach(file => {
          const filePath = path.join(userDir, file);
          
          // Check if HTML file still exists and is readable
          if (!fs.existsSync(filePath)) {
            console.log(`⚠️ HTML file missing: ${filePath}`);
            return;
          }
          
          const stats = fs.statSync(filePath);
          
          // Check if file is not empty
          if (stats.size === 0) {
            console.log(`⚠️ HTML file is empty: ${filePath}`);
            return;
          }
          
          // Check if file contains valid HTML content
          try {
            const htmlContent = fs.readFileSync(filePath, 'utf8');
            if (!htmlContent.includes('<html') && !htmlContent.includes('<!DOCTYPE')) {
              console.log(`⚠️ HTML file doesn't contain valid HTML: ${filePath}`);
              return;
            }
          } catch (error) {
            console.log(`⚠️ Cannot read HTML file: ${filePath}`, error.message);
            return;
          }
          
          // Only add pages that have valid HTML files
          console.log(`✅ Valid HTML file found: ${file}`);

          // Try detect page type and thumbnail/description from metadata
          let pageType = 'other';
          let thumbnail = '';
          let description = '';
          let products = [];
          try {
            const metaDir = file.replace(/_html$/, '') + '_html_data';
            const metaPath = path.join(userDir, metaDir, 'metadata.json');
            if (fs.existsSync(metaPath)) {
              const meta = JSON.parse(fs.readFileSync(metaPath, 'utf8'));
              if (meta && meta.pageType) pageType = meta.pageType;
              thumbnail = meta.thumbnail || meta.coverImage || thumbnail;
              description = meta.description || description;
              products = meta.products || [];
            }
            // If no pageType from metadata, try reading meta tag from HTML
            if (pageType === 'other') {
              try {
                const html = fs.readFileSync(filePath, 'utf8');
                const m = html.match(/<meta\s+name=["']page-type["']\s+content=["']([^"']+)["'][^>]*>/i);
                if (m && m[1]) pageType = m[1];
              } catch {}
            }
            // Fallback: first image inside _html_data
            if (!thumbnail) {
              const dataDir = path.join(userDir, metaDir);
              if (fs.existsSync(dataDir)) {
                const images = fs.readdirSync(dataDir).filter(n => /\.(png|jpe?g|webp|gif)$/i.test(n));
                if (images.length > 0) {
                  thumbnail = `/output/${userId}/${metaDir}/${images[0]}`;
                }
              }
            }
            
            // Fallback: extract first image from HTML content
            if (!thumbnail) {
              try {
                const htmlContent = fs.readFileSync(filePath, 'utf8');
                const imgMatch = htmlContent.match(/<img[^>]+src=["']([^"']+)["'][^>]*>/i);
                if (imgMatch && imgMatch[1]) {
                  let imgSrc = imgMatch[1];
                  // Convert relative paths to absolute
                  if (imgSrc.startsWith('/pages/')) {
                    imgSrc = imgSrc.replace('/pages/', '/output/');
                  } else if (imgSrc.startsWith('./') || !imgSrc.startsWith('http')) {
                    imgSrc = `/output/${userId}/${metaDir}/${imgSrc}`;
                  }
                  thumbnail = imgSrc;
                }
              } catch (error) {
                console.log(`⚠️ Error extracting image from HTML: ${filePath}`, error.message);
              }
            }
            
            // Use the page URL as thumbnail - this will show the actual page
            if (!thumbnail) {
              thumbnail = `/view/${userId}/${file}`;
            }
            // Final fallback: extract image from HTML (og:image or first <img> / background-image)
            if (!thumbnail) {
              try {
                const html = fs.readFileSync(filePath, 'utf8');
                let img = null;
                let m;
                m = html.match(/<meta[^>]+property=["']og:image["'][^>]+content=["']([^"']+)["'][^>]*>/i) ||
                    html.match(/<meta[^>]+content=["']([^"']+)["'][^>]+property=["']og:image["'][^>]*>/i);
                if (m && m[1]) img = m[1];
                if (!img) {
                  m = html.match(/<img[^>]+src=["']([^"']+)["'][^>]*>/i);
                  if (m && m[1]) img = m[1];
                }
                if (!img) {
                  m = html.match(/background-image\s*:\s*url\(([^)]+)\)/i);
                  if (m && m[1]) img = m[1].replace(/["']/g, '');
                }
                if (img) {
                  if (/^https?:\/\//i.test(img) || img.startsWith('/')) {
                    thumbnail = img;
                  } else {
                    // relative path -> assume under _html_data or same folder
                    const rel = img.replace(/^\.\//, '');
                    const candidate1 = `/output/${userId}/${metaDir}/${rel}`;
                    const candidate2 = `/output/${userId}/${rel}`;
                    const abs1 = path.join(userDir, metaDir, rel);
                    const abs2 = path.join(userDir, rel);
                    if (fs.existsSync(abs1)) thumbnail = candidate1; else if (fs.existsSync(abs2)) thumbnail = candidate2; else thumbnail = img;
                  }
                }
              } catch {}
            }
          } catch {}

          // Normalize thumbnail to absolute /output path when possible
          if (thumbnail && !/^https?:\/\//i.test(thumbnail) && !thumbnail.startsWith('/')) {
            const pageId = file.replace(/_html$/, '');
            const metaDir = pageId + '_html_data';
            const rel = thumbnail.replace(/^\.\//, '');
            const abs1 = path.join(userDir, metaDir, rel);
            const abs2 = path.join(userDir, rel);
            if (fs.existsSync(abs1)) thumbnail = `/output/${userId}/${metaDir}/${rel}`;
            else if (fs.existsSync(abs2)) thumbnail = `/output/${userId}/${rel}`;
          }

          // Extract real title from HTML content
          let realTitle = file.replace('_html', '').replace(/_/g, ' ').trim();
          try {
            const htmlContent = fs.readFileSync(filePath, 'utf8');
            // Try to extract title from <title> tag
            const titleMatch = htmlContent.match(/<title[^>]*>([^<]+)<\/title>/i);
            if (titleMatch && titleMatch[1]) {
              realTitle = titleMatch[1].trim();
            } else {
              // Try to extract from <h1> tag
              const h1Match = htmlContent.match(/<h1[^>]*>([^<]+)<\/h1>/i);
              if (h1Match && h1Match[1]) {
                realTitle = h1Match[1].trim();
              } else {
                // Try to extract from meta title
                const metaTitleMatch = htmlContent.match(/<meta[^>]+name=["']title["'][^>]+content=["']([^"']+)["'][^>]*>/i);
                if (metaTitleMatch && metaTitleMatch[1]) {
                  realTitle = metaTitleMatch[1].trim();
                }
              }
            }
          } catch (error) {
            console.log(`⚠️ Error extracting title from HTML: ${filePath}`, error.message);
          }

          // Extract description from HTML if not found in metadata
          if (!description || description.trim() === '') {
            try {
              const htmlContent = fs.readFileSync(filePath, 'utf8');
              
              // Remove script and style tags to get clean text
              const cleanHtml = htmlContent
                .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, '')
                .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, '')
                .replace(/<[^>]+>/g, ' ')
                .replace(/\s+/g, ' ')
                .trim();
              
              // Try meta description tag first - simple and effective regex
              let descMatch = htmlContent.match(/<meta[^>]*name\s*=\s*["']description["'][^>]*content\s*=\s*["']([^"']+)["'][^>]*>/i) ||
                            htmlContent.match(/<meta[^>]*content\s*=\s*["']([^"']+)["'][^>]*name\s*=\s*["']description["'][^>]*>/i);
              if (descMatch && descMatch[1] && descMatch[1].trim()) {
                description = descMatch[1].trim();
                console.log(`✅ Found description from meta tag: ${description.substring(0, 50)}...`);
              } else {
                // Try og:description - simple regex
                descMatch = htmlContent.match(/<meta[^>]*property\s*=\s*["']og:description["'][^>]*content\s*=\s*["']([^"']+)["'][^>]*>/i) ||
                          htmlContent.match(/<meta[^>]*content\s*=\s*["']([^"']+)["'][^>]*property\s*=\s*["']og:description["'][^>]*>/i);
                if (descMatch && descMatch[1] && descMatch[1].trim()) {
                  description = descMatch[1].trim();
                  console.log(`✅ Found description from og:description: ${description.substring(0, 50)}...`);
                } else {
                  // Try to extract from common description classes/ids
                  const descSelectors = [
                    /<p[^>]*class=["'][^"']*desc[^"']*["'][^>]*>([^<]+)<\/p>/i,
                    /<div[^>]*class=["'][^"']*desc[^"']*["'][^>]*>([^<]+)<\/div>/i,
                    /<div[^>]*id=["'][^"']*desc[^"']*["'][^>]*>([^<]+)<\/div>/i,
                    /<p[^>]*class=["'][^"']*subtitle[^"']*["'][^>]*>([^<]+)<\/p>/i,
                    /<h2[^>]*>([^<]+)<\/h2>/i,
                    /<h3[^>]*>([^<]+)<\/h3>/i,
                  ];
                  
                  let found = false;
                  for (const pattern of descSelectors) {
                    const match = htmlContent.match(pattern);
                    if (match && match[1] && match[1].trim() && match[1].trim().length > 10) {
                      description = match[1].trim().substring(0, 200);
                      console.log(`✅ Found description from selector: ${description.substring(0, 50)}...`);
                      found = true;
                      break;
                    }
                  }
                  
                  if (!found) {
                    // Try to extract first meaningful paragraph (after h1)
                    const pMatches = htmlContent.match(/<p[^>]*>([^<]+)<\/p>/gi);
                    if (pMatches && pMatches.length > 0) {
                      // Take first paragraph that has enough text
                      for (const pMatch of pMatches) {
                        const textMatch = pMatch.match(/>([^<]+)</);
                        if (textMatch && textMatch[1] && textMatch[1].trim().length > 20) {
                          description = textMatch[1].trim().substring(0, 200);
                          console.log(`✅ Found description from paragraph: ${description.substring(0, 50)}...`);
                          found = true;
                          break;
                        }
                      }
                    }
                  }
                  
                  if (!found && cleanHtml.length > 100) {
                    // Extract first meaningful sentence from clean HTML
                    const sentences = cleanHtml.split(/[.!?]\s+/).filter(s => s.trim().length > 20);
                    if (sentences.length > 0) {
                      description = sentences[0].trim().substring(0, 200);
                      console.log(`✅ Found description from text content: ${description.substring(0, 50)}...`);
                    }
                  }
                  
                  if (!description || description.trim() === '') {
                    // Default description based on page type
                    const typeDescriptions = {
                      'store': 'חנות מקוונת עם מגוון מוצרים ושירותים',
                      'event': 'אירוע מיוחד עם אפשרות להרשמה והזמנת כרטיסים',
                      'course': 'קורס מקצועי עם אפשרות לרישום ותשלום',
                      'serviceProvider': 'שירות מקצועי איכותי',
                      'messageInBottle': 'מסר בבקבוק - הזמינו שירות ייחודי',
                      'other': 'דף נחיתה מקצועי'
                    };
                    description = typeDescriptions[pageType] || 'דף נחיתה מקצועי';
                    console.log(`⚠️ Using default description for ${pageType}: ${description}`);
                  }
                }
              }
            } catch (error) {
              console.log(`⚠️ Error extracting description from HTML: ${filePath}`, error.message);
              // Fallback to default description
              const typeDescriptions = {
                'store': 'חנות מקוונת',
                'event': 'אירוע מיוחד',
                'course': 'קורס מקצועי',
                'serviceProvider': 'שירות מקצועי',
                'messageInBottle': 'מסר בבקבוק',
                'other': 'דף נחיתה'
              };
              description = typeDescriptions[pageType] || 'דף נחיתה';
            }
          }

          // Ensure description always exists - if still empty, use default
          if (!description || description.trim() === '') {
            const typeDescriptions = {
              'store': 'חנות מקוונת עם מגוון מוצרים ושירותים',
              'event': 'אירוע מיוחד עם אפשרות להרשמה והזמנת כרטיסים',
              'course': 'קורס מקצועי עם אפשרות לרישום ותשלום',
              'serviceProvider': 'שירות מקצועי איכותי',
              'messageInBottle': 'מסר בבקבוק - הזמינו שירות ייחודי',
              'other': 'דף נחיתה מקצועי'
            };
            description = typeDescriptions[pageType] || 'דף נחיתה מקצועי';
            console.log(`⚠️ Using default description for ${file} (${pageType}): ${description}`);
          }

          // Check if page is active (has active subscription) from metadata
          let isActive = false;
          try {
            const metaDir = file.replace(/_html$/, '') + '_html_data';
            const metaPath = path.join(userDir, metaDir, 'metadata.json');
            if (fs.existsSync(metaPath)) {
              const meta = JSON.parse(fs.readFileSync(metaPath, 'utf8'));
              // אם isActive מוגדר כ-true, הדף פעיל. אחרת, לא פעיל (default: false)
              isActive = meta.isActive === true;
            } else {
              // אין metadata.json - נחשב כלא פעיל
              isActive = false;
            }
          } catch (error) {
            console.log(`⚠️ Error reading isActive from metadata: ${file}`, error.message);
            // במקרה של שגיאה, נחשב כלא פעיל
            isActive = false;
          }

          pages.push({
            pageId: file.replace(/_html$/, ''),
            userId,
            pageType,
            title: realTitle,
            description: description || 'דף נחיתה מקצועי', // Always include description
            created_at: stats.birthtime.toISOString(),
            url: `/output/${userId}/${file}`,
            thumbnail,
            products: products.length > 0 ? products : undefined,
            isActive: isActive  // Add isActive status
          });
        });

        // Pages that have only data folders (_html_data) but no explicit HTML file
        dataFolders.forEach(folder => {
          const pageId = folder.replace(/_html_data$/, '');
          const htmlFile = `${pageId}_html`;
          const filePath = path.join(userDir, htmlFile);
          
          // If already added via htmlFiles, skip
          if (pages.find(p => p.userId === userId && p.pageId === pageId)) return;
          
          // SKIP if HTML file doesn't exist - we only want pages with actual HTML files
          if (!fs.existsSync(filePath)) {
            console.log(`⚠️ Skipping data folder without HTML file: ${folder}`);
            return;
          }
          
          // Check if HTML file is valid
          try {
            const stats = fs.statSync(filePath);
            if (stats.size === 0) {
              console.log(`⚠️ Skipping data folder with empty HTML file: ${folder}`);
              return;
            }
            
            const htmlContent = fs.readFileSync(filePath, 'utf8');
            if (!htmlContent.includes('<html') && !htmlContent.includes('<!DOCTYPE')) {
              console.log(`⚠️ Skipping data folder with invalid HTML file: ${folder}`);
              return;
            }
          } catch (error) {
            console.log(`⚠️ Skipping data folder with unreadable HTML file: ${folder}`, error.message);
            return;
          }

          // Metadata
          let pageType = 'other';
          let thumbnail = '';
          let description = '';
          try {
            const metaPath = path.join(userDir, folder, 'metadata.json');
            if (fs.existsSync(metaPath)) {
              const meta = JSON.parse(fs.readFileSync(metaPath, 'utf8'));
              pageType = meta.pageType || pageType;
              thumbnail = meta.thumbnail || meta.coverImage || thumbnail;
              description = meta.description || description;
            }
            if (!thumbnail) {
              const dataDirAbs = path.join(userDir, folder);
              const images = fs.readdirSync(dataDirAbs).filter(n => /\.(png|jpe?g|webp|gif)$/i.test(n));
              if (images.length > 0) {
                thumbnail = `/output/${userId}/${folder}/${images[0]}`;
              }
            }
          } catch {}

          // Stats based on folder time
          const stats = fs.statSync(path.join(userDir, folder));
          // Normalize thumbnail for data-folder page
          if (thumbnail && !/^https?:\/\//i.test(thumbnail) && !thumbnail.startsWith('/')) {
            const rel = thumbnail.replace(/^\.\//, '');
            const abs1 = path.join(userDir, folder, rel);
            const abs2 = path.join(userDir, rel);
            if (fs.existsSync(abs1)) thumbnail = `/output/${userId}/${folder}/${rel}`;
            else if (fs.existsSync(abs2)) thumbnail = `/output/${userId}/${rel}`;
          }

          // Extract real title from HTML content for data-folder pages too
          let realTitle = pageId.replace(/_/g, ' ').trim();
          try {
            const htmlContent = fs.readFileSync(filePath, 'utf8');
            // Try to extract title from <title> tag
            const titleMatch = htmlContent.match(/<title[^>]*>([^<]+)<\/title>/i);
            if (titleMatch && titleMatch[1]) {
              realTitle = titleMatch[1].trim();
            } else {
              // Try to extract from <h1> tag
              const h1Match = htmlContent.match(/<h1[^>]*>([^<]+)<\/h1>/i);
              if (h1Match && h1Match[1]) {
                realTitle = h1Match[1].trim();
              } else {
                // Try to extract from meta title
                const metaTitleMatch = htmlContent.match(/<meta[^>]+name=["']title["'][^>]+content=["']([^"']+)["'][^>]*>/i);
                if (metaTitleMatch && metaTitleMatch[1]) {
                  realTitle = metaTitleMatch[1].trim();
                }
              }
            }
          } catch (error) {
            console.log(`⚠️ Error extracting title from HTML: ${filePath}`, error.message);
          }

          // Extract description from HTML if not found in metadata (same as above)
          if (!description || description.trim() === '') {
            try {
              const htmlContent = fs.readFileSync(filePath, 'utf8');
              
              // Remove script and style tags to get clean text
              const cleanHtml = htmlContent
                .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, '')
                .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, '')
                .replace(/<[^>]+>/g, ' ')
                .replace(/\s+/g, ' ')
                .trim();
              
              // Try meta description tag first - simple and effective regex
              let descMatch = htmlContent.match(/<meta[^>]*name\s*=\s*["']description["'][^>]*content\s*=\s*["']([^"']+)["'][^>]*>/i) ||
                            htmlContent.match(/<meta[^>]*content\s*=\s*["']([^"']+)["'][^>]*name\s*=\s*["']description["'][^>]*>/i);
              if (descMatch && descMatch[1] && descMatch[1].trim()) {
                description = descMatch[1].trim();
                console.log(`✅ Found description from meta tag: ${description.substring(0, 50)}...`);
              } else {
                // Try og:description - simple regex
                descMatch = htmlContent.match(/<meta[^>]*property\s*=\s*["']og:description["'][^>]*content\s*=\s*["']([^"']+)["'][^>]*>/i) ||
                          htmlContent.match(/<meta[^>]*content\s*=\s*["']([^"']+)["'][^>]*property\s*=\s*["']og:description["'][^>]*>/i);
                if (descMatch && descMatch[1] && descMatch[1].trim()) {
                  description = descMatch[1].trim();
                  console.log(`✅ Found description from og:description: ${description.substring(0, 50)}...`);
                } else {
                  // Try to extract from common description classes/ids
                  const descSelectors = [
                    /<p[^>]*class=["'][^"']*desc[^"']*["'][^>]*>([^<]+)<\/p>/i,
                    /<div[^>]*class=["'][^"']*desc[^"']*["'][^>]*>([^<]+)<\/div>/i,
                    /<div[^>]*id=["'][^"']*desc[^"']*["'][^>]*>([^<]+)<\/div>/i,
                    /<p[^>]*class=["'][^"']*subtitle[^"']*["'][^>]*>([^<]+)<\/p>/i,
                    /<h2[^>]*>([^<]+)<\/h2>/i,
                    /<h3[^>]*>([^<]+)<\/h3>/i,
                  ];
                  
                  let found = false;
                  for (const pattern of descSelectors) {
                    const match = htmlContent.match(pattern);
                    if (match && match[1] && match[1].trim() && match[1].trim().length > 10) {
                      description = match[1].trim().substring(0, 200);
                      console.log(`✅ Found description from selector: ${description.substring(0, 50)}...`);
                      found = true;
                      break;
                    }
                  }
                  
                  if (!found) {
                    // Try to extract first meaningful paragraph (after h1)
                    const pMatches = htmlContent.match(/<p[^>]*>([^<]+)<\/p>/gi);
                    if (pMatches && pMatches.length > 0) {
                      // Take first paragraph that has enough text
                      for (const pMatch of pMatches) {
                        const textMatch = pMatch.match(/>([^<]+)</);
                        if (textMatch && textMatch[1] && textMatch[1].trim().length > 20) {
                          description = textMatch[1].trim().substring(0, 200);
                          console.log(`✅ Found description from paragraph: ${description.substring(0, 50)}...`);
                          found = true;
                          break;
                        }
                      }
                    }
                  }
                  
                  if (!found && cleanHtml.length > 100) {
                    // Extract first meaningful sentence from clean HTML
                    const sentences = cleanHtml.split(/[.!?]\s+/).filter(s => s.trim().length > 20);
                    if (sentences.length > 0) {
                      description = sentences[0].trim().substring(0, 200);
                      console.log(`✅ Found description from text content: ${description.substring(0, 50)}...`);
                    }
                  }
                  
                  if (!description || description.trim() === '') {
                    // Default description based on page type
                    const typeDescriptions = {
                      'store': 'חנות מקוונת עם מגוון מוצרים ושירותים',
                      'event': 'אירוע מיוחד עם אפשרות להרשמה והזמנת כרטיסים',
                      'course': 'קורס מקצועי עם אפשרות לרישום ותשלום',
                      'serviceProvider': 'שירות מקצועי איכותי',
                      'messageInBottle': 'מסר בבקבוק - הזמינו שירות ייחודי',
                      'other': 'דף נחיתה מקצועי'
                    };
                    description = typeDescriptions[pageType] || 'דף נחיתה מקצועי';
                    console.log(`⚠️ Using default description for ${pageType}: ${description}`);
                  }
                }
              }
            } catch (error) {
              console.log(`⚠️ Error extracting description from HTML: ${filePath}`, error.message);
              // Fallback to default description
              const typeDescriptions = {
                'store': 'חנות מקוונת',
                'event': 'אירוע מיוחד',
                'course': 'קורס מקצועי',
                'serviceProvider': 'שירות מקצועי',
                'messageInBottle': 'מסר בבקבוק',
                'other': 'דף נחיתה'
              };
              description = typeDescriptions[pageType] || 'דף נחיתה';
            }
          }

          // Ensure description always exists - if still empty, use default
          if (!description || description.trim() === '') {
            const typeDescriptions = {
              'store': 'חנות מקוונת עם מגוון מוצרים ושירותים',
              'event': 'אירוע מיוחד עם אפשרות להרשמה והזמנת כרטיסים',
              'course': 'קורס מקצועי עם אפשרות לרישום ותשלום',
              'serviceProvider': 'שירות מקצועי איכותי',
              'messageInBottle': 'מסר בבקבוק - הזמינו שירות ייחודי',
              'other': 'דף נחיתה מקצועי'
            };
            description = typeDescriptions[pageType] || 'דף נחיתה מקצועי';
            console.log(`⚠️ Using default description for ${pageId} (${pageType}): ${description}`);
          }

          pages.push({
            pageId,
            userId,
            pageType,
            title: realTitle,
            description: description || 'דף נחיתה מקצועי', // Always include description
            created_at: stats.birthtime.toISOString(),
            url: `/output/${userId}/${htmlFile}`,
            thumbnail
          });
        });
      }
    }
    res.json({ pages });
  } catch (e) {
    console.error('Error building public pages list:', e);
    res.status(500).json({ pages: [] });
  }
});

// API endpoint ליצירת HTML מהיר
app.post('/api/generate-html', async (req, res) => {
  try {
    const { prompt } = req.body;
    console.log('Generating HTML with prompt:', prompt.substring(0, 100) + '...');
    
    // יצירת HTML בסיסי מהיר
    const html = generateQuickHtml(prompt);
    
    res.json({ html });
  } catch (error) {
    console.error('Error generating HTML:', error);
    res.status(500).json({ error: 'Failed to generate HTML' });
  }
});

// פונקציה ליצירת HTML מהיר
function generateQuickHtml(prompt) {
  console.log('Full prompt received:', prompt);
  
  // בדוק אם זה "מסר בבקבוק"
  if (prompt.includes('מסר בבקבוק') || prompt.includes('messageInBottle')) {
    return generateMessageInBottleHtml(prompt);
  }
  
  // חילוץ פרטים מהפרומפט
  const titleMatch = prompt.match(/Title:\s*(.+?)(?:\n|$)/);
  const title = titleMatch ? titleMatch[1].trim() : 'דף נחיתה';
  
  const descriptionMatch = prompt.match(/Description:\s*(.+?)(?:\n|$)/);
  const description = descriptionMatch ? descriptionMatch[1].trim() : 'דף נחיתה פשוט ויעיל';
  
  const businessTypeMatch = prompt.match(/Business Type:\s*(.+?)(?:\n|$)/);
  const businessType = businessTypeMatch ? businessTypeMatch[1].trim() : 'עסק';
  
  console.log('Extracted details:', { title, description, businessType });
  
  return `<!DOCTYPE html>
<html lang="he" dir="rtl">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${title}</title>
    <script src="https://cdn.tailwindcss.com"></script>
    <link href="https://fonts.googleapis.com/css2?family=Rubik:wght@400;500;700&display=swap" rel="stylesheet">
    <style>
        body { font-family: 'Rubik', sans-serif; }
        .product-item { transition: transform 0.3s; }
        .product-item:hover { transform: translateY(-5px); }
    </style>
</head>
<body class="bg-gray-50">
    <!-- Header -->
    <header class="bg-white shadow-lg sticky top-0 z-50">
        <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div class="flex justify-between items-center py-4">
                <div class="flex items-center">
                    <h1 class="text-2xl font-bold text-blue-600">${title}</h1>
                </div>
                <div class="flex items-center space-x-4">
                    <button onclick="toggleCart()" class="relative bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700">
                        🛒 עגלה
                        <span class="cart-count-badge absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs"></span>
                    </button>
                </div>
            </div>
        </div>
    </header>

    <!-- Hero Section -->
    <section class="bg-gradient-to-r from-blue-600 to-purple-600 text-white py-20">
        <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h2 class="text-4xl font-bold mb-4">${title}</h2>
            <p class="text-xl mb-4">${description}</p>
            <p class="text-lg mb-8 opacity-90">${businessType}</p>
            <button onclick="toggleCart()" class="bg-white text-blue-600 px-8 py-3 rounded-lg font-bold hover:bg-gray-100">
                התחל לקנות עכשיו
            </button>
        </div>
    </section>

    <!-- Products Section -->
    <section class="py-16">
        <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <h3 class="text-3xl font-bold text-center mb-12">המוצרים שלנו</h3>
            <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                <!-- Product 1 -->
                <div class="product-item bg-white rounded-lg shadow-lg overflow-hidden">
                    <img src="https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=400&h=300&fit=crop" alt="מוצר 1" class="w-full h-48 object-cover">
                    <div class="p-6">
                        <h4 class="product-name text-xl font-bold mb-2">${businessType} - מוצר 1</h4>
                        <p class="text-gray-600 mb-4">מוצר איכותי מ-${title}</p>
                        <div class="flex justify-between items-center">
                            <span class="product-price text-2xl font-bold text-blue-600">₪99</span>
                            <div class="space-x-2">
                                <button onclick="addToCart('${businessType} - מוצר 1', 99, 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=400&h=300&fit=crop')" class="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700">הוסף לעגלה</button>
                                <button onclick="quickBuy('${businessType} - מוצר 1', 99, 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=400&h=300&fit=crop')" class="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700">קנייה מהירה</button>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- Product 2 -->
                <div class="product-item bg-white rounded-lg shadow-lg overflow-hidden">
                    <img src="https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=400&h=300&fit=crop" alt="מוצר 2" class="w-full h-48 object-cover">
                    <div class="p-6">
                        <h4 class="product-name text-xl font-bold mb-2">${businessType} - מוצר 2</h4>
                        <p class="text-gray-600 mb-4">מוצר איכותי מ-${title}</p>
                        <div class="flex justify-between items-center">
                            <span class="product-price text-2xl font-bold text-blue-600">₪149</span>
                            <div class="space-x-2">
                                <button onclick="addToCart('${businessType} - מוצר 2', 149, 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=400&h=300&fit=crop')" class="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700">הוסף לעגלה</button>
                                <button onclick="quickBuy('${businessType} - מוצר 2', 149, 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=400&h=300&fit=crop')" class="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700">קנייה מהירה</button>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- Product 3 -->
                <div class="product-item bg-white rounded-lg shadow-lg overflow-hidden">
                    <img src="https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=400&h=300&fit=crop" alt="מוצר 3" class="w-full h-48 object-cover">
                    <div class="p-6">
                        <h4 class="product-name text-xl font-bold mb-2">${businessType} - מוצר 3</h4>
                        <p class="text-gray-600 mb-4">מוצר איכותי מ-${title}</p>
                        <div class="flex justify-between items-center">
                            <span class="product-price text-2xl font-bold text-blue-600">₪199</span>
                            <div class="space-x-2">
                                <button onclick="addToCart('${businessType} - מוצר 3', 199, 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=400&h=300&fit=crop')" class="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700">הוסף לעגלה</button>
                                <button onclick="quickBuy('${businessType} - מוצר 3', 199, 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=400&h=300&fit=crop')" class="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700">קנייה מהירה</button>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- Product 4 -->
                <div class="product-item bg-white rounded-lg shadow-lg overflow-hidden">
                    <img src="https://images.unsplash.com/photo-1572635196237-14b3f281503f?w=400&h=300&fit=crop" alt="מוצר 4" class="w-full h-48 object-cover">
                    <div class="p-6">
                        <h4 class="product-name text-xl font-bold mb-2">${businessType} - מוצר 4</h4>
                        <p class="text-gray-600 mb-4">מוצר איכותי מ-${title}</p>
                        <div class="flex justify-between items-center">
                            <span class="product-price text-2xl font-bold text-blue-600">₪249</span>
                            <div class="space-x-2">
                                <button onclick="addToCart('${businessType} - מוצר 4', 249, 'https://images.unsplash.com/photo-1572635196237-14b3f281503f?w=400&h=300&fit=crop')" class="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700">הוסף לעגלה</button>
                                <button onclick="quickBuy('${businessType} - מוצר 4', 249, 'https://images.unsplash.com/photo-1572635196237-14b3f281503f?w=400&h=300&fit=crop')" class="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700">קנייה מהירה</button>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- Product 5 -->
                <div class="product-item bg-white rounded-lg shadow-lg overflow-hidden">
                    <img src="https://images.unsplash.com/photo-1546868871-7041f2a55e12?w=400&h=300&fit=crop" alt="מוצר 5" class="w-full h-48 object-cover">
                    <div class="p-6">
                        <h4 class="product-name text-xl font-bold mb-2">${businessType} - מוצר 5</h4>
                        <p class="text-gray-600 mb-4">מוצר איכותי מ-${title}</p>
                        <div class="flex justify-between items-center">
                            <span class="product-price text-2xl font-bold text-blue-600">₪299</span>
                            <div class="space-x-2">
                                <button onclick="addToCart('${businessType} - מוצר 5', 299, 'https://images.unsplash.com/photo-1546868871-7041f2a55e12?w=400&h=300&fit=crop')" class="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700">הוסף לעגלה</button>
                                <button onclick="quickBuy('${businessType} - מוצר 5', 299, 'https://images.unsplash.com/photo-1546868871-7041f2a55e12?w=400&h=300&fit=crop')" class="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700">קנייה מהירה</button>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- Product 6 -->
                <div class="product-item bg-white rounded-lg shadow-lg overflow-hidden">
                    <img src="https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=400&h=300&fit=crop" alt="מוצר 6" class="w-full h-48 object-cover">
                    <div class="p-6">
                        <h4 class="product-name text-xl font-bold mb-2">${businessType} - מוצר 6</h4>
                        <p class="text-gray-600 mb-4">מוצר איכותי מ-${title}</p>
                        <div class="flex justify-between items-center">
                            <span class="product-price text-2xl font-bold text-blue-600">₪349</span>
                            <div class="space-x-2">
                                <button onclick="addToCart('${businessType} - מוצר 6', 349, 'https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=400&h=300&fit=crop')" class="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700">הוסף לעגלה</button>
                                <button onclick="quickBuy('${businessType} - מוצר 6', 349, 'https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=400&h=300&fit=crop')" class="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700">קנייה מהירה</button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </section>

    <!-- Footer -->
    <footer class="bg-gray-800 text-white py-8">
        <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <p>&copy; 2024 ${title}. כל הזכויות שמורות.</p>
        </div>
    </footer>
</body>
</html>`;
}

// API Routes for Store Management

// Get user data
app.get('/api/user/:userId', (req, res) => {
    try {
        const db = loadDatabase();
        const userId = req.params.userId;
        
        if (!db.users[userId]) {
            db.users[userId] = {
                id: userId,
                name: 'משתמש חדש',
                email: '',
                phone: '',
                wallet: 0,
                purchases: [],
                createdAt: new Date().toISOString(),
                lastActive: new Date().toISOString()
            };
            saveDatabase(db);
        }
        
        res.json(db.users[userId]);
    } catch (error) {
        console.error('Error getting user:', error);
        res.status(500).json({ error: 'Failed to get user data' });
    }
});

// Update user data
app.post('/api/user/:userId', (req, res) => {
    try {
        const db = loadDatabase();
        const userId = req.params.userId;
        const userData = req.body;
        
        if (!db.users[userId]) {
            db.users[userId] = {
                id: userId,
                name: 'משתמש חדש',
                email: '',
                phone: '',
                wallet: 0,
                purchases: [],
                createdAt: new Date().toISOString(),
                lastActive: new Date().toISOString()
            };
        }
        
        db.users[userId] = { ...db.users[userId], ...userData, lastActive: new Date().toISOString() };
        saveDatabase(db);
        
        res.json(db.users[userId]);
    } catch (error) {
        console.error('Error updating user:', error);
        res.status(500).json({ error: 'Failed to update user data' });
    }
});

// Record purchase
// Submit lead/form
app.post('/api/lead', async (req, res) => {
    try {
        const db = loadDatabase();
        const { userId, pageId, pageName, formData } = req.body;
        
        const leadId = 'lead_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
        
        const lead = {
            id: leadId,
            userId,
            pageId,
            pageName,
            name: formData.name || 'לא צוין',
            email: formData.email || 'לא צוין',
            phone: formData.phone || 'לא צוין',
            message: formData.message || '',
            additionalFields: formData,
            status: 'new',
            createdAt: new Date().toISOString()
        };
        
        // Save to global database
        if (!db.leads) db.leads = {};
        db.leads[leadId] = lead;
        
        // Save to page-specific data folder
        if (userId && pageId) {
            console.log('Attempting to save lead to folder. userId:', userId, 'pageId:', pageId);
            const pageDataDir = path.join('output', userId, pageId + '_data');
            console.log('Page data directory:', pageDataDir);
            
            await fs.ensureDir(pageDataDir);
            
            const leadsFile = path.join(pageDataDir, 'leads.json');
            let pageLeads = [];
            
            try {
                if (await fs.pathExists(leadsFile)) {
                    pageLeads = JSON.parse(await fs.readFile(leadsFile, 'utf8'));
                    console.log('Existing leads loaded:', pageLeads.length);
                }
            } catch (error) {
                console.error('Error reading leads file:', error);
            }
            
            pageLeads.push(lead);
            await fs.writeFile(leadsFile, JSON.stringify(pageLeads, null, 2));
            console.log('✅ Lead saved to page data folder:', pageDataDir);
            console.log('Total leads in file now:', pageLeads.length);
        } else {
            console.warn('⚠️ Cannot save to page folder - missing userId or pageId');
        }
        
        saveDatabase(db);
        
        res.json({ success: true, leadId });
    } catch (error) {
        console.error('Error saving lead:', error);
        res.status(500).json({ error: 'Failed to save lead' });
    }
});

app.post('/api/purchase', async (req, res) => {
    try {
        const db = loadDatabase();
        const { userId, storeId, pageName, products, total, paymentMethod } = req.body;
        
        const purchaseId = 'purchase_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
        
        const purchase = {
            id: purchaseId,
            userId,
            storeId,
            pageName,
            products,
            total,
            paymentMethod,
            customerName: req.body.customerName || 'לא צוין',
            customerPhone: req.body.customerPhone || 'לא צוין',
            customerEmail: req.body.customerEmail || '',
            customerAddress: req.body.customerAddress || 'לא צוין',
            shipping: req.body.shipping || false,
            status: 'new',
            createdAt: new Date().toISOString()
        };
        
        // Save to global database
        db.purchases[purchaseId] = purchase;
        
        // Save to page-specific data folder
        if (userId && storeId) {
            console.log('Attempting to save purchase to folder. userId:', userId, 'storeId:', storeId);
            const pageDataDir = path.join('output', userId, storeId + '_data');
            console.log('Page data directory:', pageDataDir);
            
            await fs.ensureDir(pageDataDir);
            
            const purchasesFile = path.join(pageDataDir, 'purchases.json');
            let pagePurchases = [];
            
            try {
                if (await fs.pathExists(purchasesFile)) {
                    pagePurchases = JSON.parse(await fs.readFile(purchasesFile, 'utf8'));
                    console.log('Existing purchases loaded:', pagePurchases.length);
                }
            } catch (error) {
                console.error('Error reading purchases file:', error);
            }
            
            pagePurchases.push(purchase);
            await fs.writeFile(purchasesFile, JSON.stringify(pagePurchases, null, 2));
            console.log('✅ Purchase saved to page data folder:', pageDataDir);
            console.log('Total purchases in file now:', pagePurchases.length);
        } else {
            console.warn('⚠️ Cannot save to page folder - missing userId or storeId');
        }
        
        // Update user
        if (!db.users[userId]) {
            db.users[userId] = {
                id: userId,
                name: 'משתמש חדש',
                email: '',
                phone: '',
                wallet: 0,
                purchases: [],
                createdAt: new Date().toISOString(),
                lastActive: new Date().toISOString()
            };
        }
        
        db.users[userId].purchases.push(purchaseId);
        db.users[userId].lastActive = new Date().toISOString();
        
        // Update analytics
        db.analytics.totalSales += total;
        db.analytics.recentPurchases.unshift(purchase);
        if (db.analytics.recentPurchases.length > 50) {
            db.analytics.recentPurchases = db.analytics.recentPurchases.slice(0, 50);
        }
        
        // Update daily sales
        const today = new Date().toISOString().split('T')[0];
        if (!db.analytics.dailySales[today]) {
            db.analytics.dailySales[today] = 0;
        }
        db.analytics.dailySales[today] += total;
        
        // Update monthly sales
        const month = new Date().toISOString().substring(0, 7);
        if (!db.analytics.monthlySales[month]) {
            db.analytics.monthlySales[month] = 0;
        }
        db.analytics.monthlySales[month] += total;
        
        // Update top products
        products.forEach(product => {
            if (!db.analytics.topProducts.find(p => p.id === product.id)) {
                db.analytics.topProducts.push({
                    id: product.id,
                    name: product.name,
                    sales: 0,
                    revenue: 0
                });
            }
            const topProduct = db.analytics.topProducts.find(p => p.id === product.id);
            topProduct.sales += product.quantity;
            topProduct.revenue += product.price * product.quantity;
        });
        
        // Sort top products by revenue
        db.analytics.topProducts.sort((a, b) => b.revenue - a.revenue);
        
        saveDatabase(db);
        
        res.json({ success: true, purchaseId });
    } catch (error) {
        console.error('Error recording purchase:', error);
        res.status(500).json({ error: 'Failed to record purchase' });
    }
});

// API endpoint לשמירת מנוי פעיל לדף
app.post('/api/subscription/activate', async (req, res) => {
  try {
    const { userId, pageId } = req.body;
    
    if (!userId || !pageId) {
      return res.status(400).json({ error: 'Missing userId or pageId' });
    }
    
    const userDir = path.join('output', userId);
    const fileName = `${pageId}_html`;
    const metaDir = path.join(userDir, `${pageId}_html_data`);
    const metaPath = path.join(metaDir, 'metadata.json');
    
    // Ensure metadata directory exists
    await fs.ensureDir(metaDir);
    
    // Read existing metadata or create new
    let metadata = {};
    if (await fs.pathExists(metaPath)) {
      try {
        metadata = await fs.readJson(metaPath);
      } catch (error) {
        console.log(`⚠️ Error reading metadata: ${metaPath}`, error.message);
      }
    }
    
    // Update isActive status
    metadata.isActive = true;
    metadata.subscriptionActivatedAt = new Date().toISOString();
    
    // Save updated metadata
    await fs.writeFile(metaPath, JSON.stringify(metadata, null, 2));
    
    console.log(`✅ Subscription activated for page: ${userId}/${pageId}`);
    res.json({ success: true, message: 'Subscription activated' });
  } catch (error) {
    console.error('Error activating subscription:', error);
    res.status(500).json({ error: 'Failed to activate subscription' });
  }
});

// API endpoint לביטול מנוי לדף
app.post('/api/subscription/deactivate', async (req, res) => {
  try {
    const { userId, pageId } = req.body;
    
    if (!userId || !pageId) {
      return res.status(400).json({ error: 'Missing userId or pageId' });
    }
    
    const userDir = path.join('output', userId);
    const metaDir = path.join(userDir, `${pageId}_html_data`);
    const metaPath = path.join(metaDir, 'metadata.json');
    
    if (!await fs.pathExists(metaPath)) {
      return res.status(404).json({ error: 'Page metadata not found' });
    }
    
    // Read existing metadata
    const metadata = await fs.readJson(metaPath);
    
    // Update isActive status
    metadata.isActive = false;
    metadata.subscriptionDeactivatedAt = new Date().toISOString();
    
    // Save updated metadata
    await fs.writeFile(metaPath, JSON.stringify(metadata, null, 2));
    
    console.log(`✅ Subscription deactivated for page: ${userId}/${pageId}`);
    res.json({ success: true, message: 'Subscription deactivated' });
  } catch (error) {
    console.error('Error deactivating subscription:', error);
    res.status(500).json({ error: 'Failed to deactivate subscription' });
  }
});

// Get store analytics
app.get('/api/analytics/:storeId', (req, res) => {
    try {
        const db = loadDatabase();
        const storeId = req.params.storeId;
        
        const storePurchases = Object.values(db.purchases).filter(p => p.storeId === storeId);
        
        const analytics = {
            totalSales: storePurchases.reduce((sum, p) => sum + p.total, 0),
            totalOrders: storePurchases.length,
            averageOrderValue: storePurchases.length > 0 ? storePurchases.reduce((sum, p) => sum + p.total, 0) / storePurchases.length : 0,
            recentPurchases: storePurchases.slice(0, 10),
            dailySales: {},
            monthlySales: {},
            topProducts: []
        };
        
        // Calculate daily sales for this store
        storePurchases.forEach(purchase => {
            const day = purchase.createdAt.split('T')[0];
            if (!analytics.dailySales[day]) {
                analytics.dailySales[day] = 0;
            }
            analytics.dailySales[day] += purchase.total;
        });
        
        // Calculate monthly sales for this store
        storePurchases.forEach(purchase => {
            const month = purchase.createdAt.substring(0, 7);
            if (!analytics.monthlySales[month]) {
                analytics.monthlySales[month] = 0;
            }
            analytics.monthlySales[month] += purchase.total;
        });
        
        // Calculate top products for this store
        const productSales = {};
        storePurchases.forEach(purchase => {
            purchase.products.forEach(product => {
                if (!productSales[product.id]) {
                    productSales[product.id] = {
                        id: product.id,
                        name: product.name,
                        sales: 0,
                        revenue: 0
                    };
                }
                productSales[product.id].sales += product.quantity;
                productSales[product.id].revenue += product.price * product.quantity;
            });
        });
        
        analytics.topProducts = Object.values(productSales).sort((a, b) => b.revenue - a.revenue);
        
        res.json(analytics);
    } catch (error) {
        console.error('Error getting analytics:', error);
        res.status(500).json({ error: 'Failed to get analytics' });
    }
});

// Get global analytics
app.get('/api/analytics', (req, res) => {
    try {
        const db = loadDatabase();
        res.json(db.analytics);
    } catch (error) {
        console.error('Error getting global analytics:', error);
        res.status(500).json({ error: 'Failed to get global analytics' });
    }
});

// Get analytics for specific user
app.get('/api/analytics/user/:userId', (req, res) => {
    try {
        const db = loadDatabase();
        const userId = req.params.userId;
        
        const userPurchases = Object.values(db.purchases).filter(p => p.userId === userId);
        
        const analytics = {
            totalSales: userPurchases.reduce((sum, p) => sum + p.total, 0),
            totalOrders: userPurchases.length,
            totalUsers: 1,
            averageOrderValue: userPurchases.length > 0 ? userPurchases.reduce((sum, p) => sum + p.total, 0) / userPurchases.length : 0,
            recentPurchases: userPurchases.slice(0, 10),
            dailySales: {},
            monthlySales: {},
            topProducts: []
        };
        
        // Calculate daily sales for this user
        userPurchases.forEach(purchase => {
            const day = purchase.createdAt.split('T')[0];
            if (!analytics.dailySales[day]) {
                analytics.dailySales[day] = 0;
            }
            analytics.dailySales[day] += purchase.total;
        });
        
        // Calculate monthly sales for this user
        userPurchases.forEach(purchase => {
            const month = purchase.createdAt.substring(0, 7);
            if (!analytics.monthlySales[month]) {
                analytics.monthlySales[month] = 0;
            }
            analytics.monthlySales[month] += purchase.total;
        });
        
        // Calculate top products for this user
        const productSales = {};
        userPurchases.forEach(purchase => {
            purchase.products.forEach(product => {
                if (!productSales[product.id]) {
                    productSales[product.id] = {
                        id: product.id,
                        name: product.name,
                        sales: 0,
                        revenue: 0
                    };
                }
                productSales[product.id].sales += product.quantity;
                productSales[product.id].revenue += product.price * product.quantity;
            });
        });
        
        analytics.topProducts = Object.values(productSales).sort((a, b) => b.revenue - a.revenue);
        
        res.json(analytics);
    } catch (error) {
        console.error('Error getting user analytics:', error);
        res.status(500).json({ error: 'Failed to get user analytics' });
    }
});

// Get leads for specific page
app.get('/api/leads/page/:pageName', async (req, res) => {
    try {
        const db = loadDatabase();
        const pageName = req.params.pageName;
        const userId = req.query.userId;
        
        console.log('Getting leads for page:', pageName, 'userId:', userId);
        
        let pageLeads = [];
        
        // Try to load from page-specific data folder first
        if (userId && pageName) {
            const pageDataDir = path.join('output', userId, pageName + '_data');
            const leadsFile = path.join(pageDataDir, 'leads.json');
            
            console.log('Looking for leads in:', pageDataDir);
            
            try {
                if (await fs.pathExists(leadsFile)) {
                    const fileContent = await fs.readFile(leadsFile, 'utf8');
                    pageLeads = JSON.parse(fileContent);
                    console.log('Loaded leads from page data folder:', pageLeads.length);
                }
            } catch (error) {
                console.error('Error reading page leads file:', error);
            }
        }
        
        // If no leads found in page folder, try global database
        if (pageLeads.length === 0 && db.leads) {
            console.log('No leads in folder, checking global database...');
            pageLeads = Object.values(db.leads).filter(l => {
                return l.pageId === pageName || l.pageName === pageName;
            });
        }
        
        console.log('Total leads found:', pageLeads.length);
        
        res.json({
            leads: pageLeads,
            totalLeads: pageLeads.length,
            newLeads: pageLeads.filter(l => l.status === 'new').length,
            contactedLeads: pageLeads.filter(l => l.status === 'contacted').length
        });
    } catch (error) {
        console.error('Error getting page leads:', error);
        res.status(500).json({ error: 'Failed to get page leads' });
    }
});

// Get analytics for specific page
app.get('/api/analytics/page/:pageName', async (req, res) => {
    try {
        const db = loadDatabase();
        const pageName = decodeURIComponent(req.params.pageName);
        const userId = decodeURIComponent(req.query.userId);
        
        console.log('Getting analytics for page:', pageName, 'userId:', userId);
        
        let pagePurchases = [];
        
        // Try to load from page-specific data folder first
        if (userId && pageName) {
            // Remove '_html' suffix if it exists (it's already part of the folder name)
            const cleanPageName = pageName.replace(/_html$/, '');
            const pageDataDir = path.join('output', userId, cleanPageName + '_data');
            const purchasesFile = path.join(pageDataDir, 'purchases.json');
            
            console.log('Looking for purchases in:', pageDataDir);
            
            try {
                if (await fs.pathExists(purchasesFile)) {
                    const fileContent = await fs.readFile(purchasesFile, 'utf8');
                    pagePurchases = JSON.parse(fileContent);
                    console.log('Loaded purchases from page data folder:', pagePurchases.length);
                }
            } catch (error) {
                console.error('Error reading page purchases file:', error);
            }
        }
        
        // If no purchases found in page folder, try global database
        if (pagePurchases.length === 0) {
            console.log('No purchases in folder, checking global database...');
            pagePurchases = Object.values(db.purchases).filter(p => {
                // Check multiple matching conditions
                const nameMatch = p.storeId === pageName || 
                                p.pageName === pageName || 
                                pageName.includes(p.storeId) ||
                                p.storeId?.includes(pageName.replace('_html', ''));
                
                if (nameMatch) {
                    console.log('Found matching purchase:', p.id, 'storeId:', p.storeId);
                }
                return nameMatch;
            });
        }
        
        console.log('Total purchases found:', pagePurchases.length);
        
        // Build customer list with purchase history
        const customerMap = {};
        pagePurchases.forEach(purchase => {
            const customerId = purchase.customerPhone || purchase.customerEmail || purchase.userId;
            if (!customerMap[customerId]) {
                customerMap[customerId] = {
                    name: purchase.customerName || 'לקוח',
                    phone: purchase.customerPhone || '',
                    email: purchase.customerEmail || '',
                    address: purchase.customerAddress || '',
                    purchaseCount: 0,
                    totalSpent: 0
                };
            }
            customerMap[customerId].purchaseCount++;
            customerMap[customerId].totalSpent += purchase.total;
        });
        
        const analytics = {
            totalSales: pagePurchases.reduce((sum, p) => sum + p.total, 0),
            totalOrders: pagePurchases.length,
            totalCustomers: Object.keys(customerMap).length,
            averageOrderValue: pagePurchases.length > 0 ? pagePurchases.reduce((sum, p) => sum + p.total, 0) / pagePurchases.length : 0,
            purchases: pagePurchases.slice(0, 10),
            customers: Object.values(customerMap),
            dailySales: {},
            monthlySales: {},
            topProducts: []
        };
        
        // Calculate daily sales for this page
        pagePurchases.forEach(purchase => {
            const day = purchase.createdAt.split('T')[0];
            if (!analytics.dailySales[day]) {
                analytics.dailySales[day] = 0;
            }
            analytics.dailySales[day] += purchase.total;
        });
        
        // Calculate monthly sales for this page
        pagePurchases.forEach(purchase => {
            const month = purchase.createdAt.substring(0, 7);
            if (!analytics.monthlySales[month]) {
                analytics.monthlySales[month] = 0;
            }
            analytics.monthlySales[month] += purchase.total;
        });
        
        // Calculate top products for this page
        const productSales = {};
        pagePurchases.forEach(purchase => {
            purchase.products.forEach(product => {
                if (!productSales[product.id]) {
                    productSales[product.id] = {
                        id: product.id,
                        name: product.name,
                        count: 0,
                        revenue: 0
                    };
                }
                productSales[product.id].count += product.quantity;
                productSales[product.id].revenue += product.price * product.quantity;
            });
        });
        
        analytics.topProducts = Object.values(productSales).sort((a, b) => b.revenue - a.revenue);
        
        // Load metadata to get pageType
        let pageType = 'store'; // default
        if (userId && pageName) {
            const cleanPageName = pageName.replace(/_html$/, '');
            const metadataPath = path.join('output', userId, cleanPageName + '_html_data', 'metadata.json');
            
            try {
                if (await fs.pathExists(metadataPath)) {
                    const metadata = await fs.readJSON(metadataPath);
                    pageType = metadata.pageType || 'store';
                    console.log(`📋 Loaded pageType from metadata: ${pageType}`);
                }
            } catch (error) {
                console.warn('⚠️ Could not read metadata:', error.message);
            }
        }
        
        analytics.metadata = { pageType };
        
        res.json(analytics);
    } catch (error) {
        console.error('Error getting page analytics:', error);
        res.status(500).json({ error: 'Failed to get page analytics' });
    }
});

// Update order status
app.post('/api/order/:orderId/status', async (req, res) => {
    try {
        const db = loadDatabase();
        const { orderId } = req.params;
        const { status } = req.body;
        
        console.log('Updating order:', orderId, 'to status:', status);
        
        // Update in global database
        if (db.purchases[orderId]) {
            db.purchases[orderId].status = status;
            if (status === 'completed') {
                db.purchases[orderId].completedAt = new Date().toISOString();
            }
            saveDatabase(db);
            console.log('✅ Order status updated in database');
        }
        
        // Also update in page-specific data folder
        const purchase = db.purchases[orderId];
        if (purchase && purchase.userId && purchase.storeId) {
            const cleanStoreId = purchase.storeId.replace(/_html$/, '');
            const pageDataDir = path.join('output', purchase.userId, cleanStoreId + '_data');
            const purchasesFile = path.join(pageDataDir, 'purchases.json');
            
            try {
                if (await fs.pathExists(purchasesFile)) {
                    const fileContent = await fs.readFile(purchasesFile, 'utf8');
                    const purchases = JSON.parse(fileContent);
                    const purchaseIndex = purchases.findIndex(p => p.id === orderId);
                    if (purchaseIndex !== -1) {
                        purchases[purchaseIndex].status = status;
                        if (status === 'completed') {
                            purchases[purchaseIndex].completedAt = new Date().toISOString();
                        }
                        await fs.writeFile(purchasesFile, JSON.stringify(purchases, null, 2));
                        console.log('✅ Order status updated in folder');
                    }
                }
            } catch (error) {
                console.error('Error updating order in folder:', error);
            }
        }
        
        res.json({ success: true, order: db.purchases[orderId] });
    } catch (error) {
        console.error('Error updating order status:', error);
        res.status(500).json({ error: 'Failed to update order status' });
    }
});

// Get appointments for a page
app.get('/api/appointments/:userId/:pageId', async (req, res) => {
    try {
        const { userId, pageId } = req.params;
        const cleanPageId = pageId.replace(/_html$/, '');
        const appointmentsFile = path.join('output', userId, cleanPageId + '_data', 'appointments.json');
        
        console.log('📅 Getting appointments from:', appointmentsFile);
        
        let appointments = [];
        if (await fs.pathExists(appointmentsFile)) {
            const fileContent = await fs.readFile(appointmentsFile, 'utf8');
            appointments = JSON.parse(fileContent);
        }
        
        res.json({ appointments });
    } catch (error) {
        console.error('Error getting appointments:', error);
        res.status(500).json({ error: 'Failed to get appointments', appointments: [] });
    }
});

// Create new appointment
app.post('/api/appointments', async (req, res) => {
    try {
        const appointmentData = req.body;
        const { userId, pageId } = appointmentData;
        
        if (!userId || !pageId) {
            return res.status(400).json({ error: 'Missing userId or pageId' });
        }
        
        const cleanPageId = pageId.replace(/_html$/, '');
        const pageDataDir = path.join('output', userId, cleanPageId + '_data');
        const appointmentsFile = path.join(pageDataDir, 'appointments.json');
        
        // Ensure directory exists
        await fs.ensureDir(pageDataDir);
        
        // Load existing appointments
        let appointments = [];
        if (await fs.pathExists(appointmentsFile)) {
            const fileContent = await fs.readFile(appointmentsFile, 'utf8');
            appointments = JSON.parse(fileContent);
        }
        
        // Create new appointment
        const newAppointment = {
            id: Date.now().toString(),
            ...appointmentData,
            status: 'pending',
            createdAt: new Date().toISOString()
        };
        
        appointments.push(newAppointment);
        
        // Save appointments
        await fs.writeFile(appointmentsFile, JSON.stringify(appointments, null, 2));
        
        console.log('✅ Appointment created:', newAppointment.id);
        res.json({ success: true, appointment: newAppointment });
    } catch (error) {
        console.error('Error creating appointment:', error);
        res.status(500).json({ error: 'Failed to create appointment' });
    }
});

// Update appointment status
app.put('/api/appointments/:appointmentId/status', async (req, res) => {
    try {
        const { appointmentId } = req.params;
        const { status } = req.body;
        
        // Find appointment in all user folders
        const outputDir = 'output';
        const userDirs = await fs.readdir(outputDir);
        
        for (const userId of userDirs) {
            const userPath = path.join(outputDir, userId);
            const stat = await fs.stat(userPath);
            if (!stat.isDirectory()) continue;
            
            const pageDirs = await fs.readdir(userPath);
            for (const pageDir of pageDirs) {
                if (!pageDir.endsWith('_data')) continue;
                
                const appointmentsFile = path.join(userPath, pageDir, 'appointments.json');
                if (await fs.pathExists(appointmentsFile)) {
                    const fileContent = await fs.readFile(appointmentsFile, 'utf8');
                    const appointments = JSON.parse(fileContent);
                    const appointmentIndex = appointments.findIndex(a => a.id === appointmentId);
                    
                    if (appointmentIndex !== -1) {
                        appointments[appointmentIndex].status = status;
                        appointments[appointmentIndex].updatedAt = new Date().toISOString();
                        await fs.writeFile(appointmentsFile, JSON.stringify(appointments, null, 2));
                        console.log('✅ Appointment status updated:', appointmentId);
                        return res.json({ success: true, appointment: appointments[appointmentIndex] });
                    }
                }
            }
        }
        
        res.status(404).json({ error: 'Appointment not found' });
    } catch (error) {
        console.error('Error updating appointment status:', error);
        res.status(500).json({ error: 'Failed to update appointment status' });
    }
});

// Save RSVP
app.post('/api/rsvp', async (req, res) => {
    try {
        console.log('🎉 RSVP Request received!');
        console.log('📥 Body:', JSON.stringify(req.body, null, 2));
        
        const db = loadDatabase();
        const { eventId, userId, name, phone, email, guests, status, message } = req.body;
        
        if (!eventId || !userId) {
            console.error('❌ Missing eventId or userId!', { eventId, userId });
            return res.status(400).json({ error: 'Missing eventId or userId' });
        }
        
        const rsvpId = 'rsvp_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
        
        const rsvp = {
            id: rsvpId,
            eventId,
            userId,
            name: name || 'אורח',
            phone: phone || '',
            email: email || '',
            guests: guests || 1,
            status: status || 'pending',
            message: message || '',
            createdAt: new Date().toISOString()
        };
        
        // Save to global database
        if (!db.rsvps) db.rsvps = {};
        db.rsvps[rsvpId] = rsvp;
        saveDatabase(db);
        
        // Save to event-specific data folder (as leads.json for guest management)
        if (userId && eventId) {
            console.log('💾 Saving RSVP - eventId:', eventId, 'userId:', userId);
            
            // Decode URL encoding (e.g., %D7%97 -> ח)
            const decodedEventId = decodeURIComponent(eventId);
            console.log('🔓 Decoded eventId:', decodedEventId);
            
            // Clean eventId - remove _html suffix if present
            const cleanEventId = decodedEventId.replace(/_html$/, '');
            
            // ALWAYS use _html_data folder (this is where the page creator saves metadata)
            const eventDataDir = path.join('output', userId, cleanEventId + '_html_data');
            const leadsFile = path.join(eventDataDir, 'leads.json');
            
            console.log('📂 Saving to folder:', eventDataDir);
            
            await fs.ensureDir(eventDataDir);
            console.log('📂 Saving to folder:', eventDataDir);
            
            // Convert RSVP to lead format
            // IMPORTANT: guests field now contains TOTAL people count (including the person themselves)
            // So if someone says "2 people", guests = 2, which means plus = 1 (1 companion)
            const totalPeople = parseInt(rsvp.guests) || 0;
            
            // Map status to Hebrew
            let hebrewStatus = 'ממתין';
            if (rsvp.status === 'confirmed') hebrewStatus = 'מאושר';
            if (rsvp.status === 'declined') hebrewStatus = 'לא מגיע';
            
            const lead = {
                id: rsvpId,
                name: rsvp.name,
                phone: rsvp.phone,
                email: rsvp.email,
                plus: rsvp.status === 'confirmed' ? Math.max(0, totalPeople - 1) : 0, // Only count companions if confirmed
                status: hebrewStatus,
                table: 0, // Will be assigned later
                notes: rsvp.message || '',
                gift: '',
                giftAmount: 0,
                createdAt: rsvp.createdAt
            };
            
            console.log('👤 Lead data:', lead);
            
            let leads = [];
            if (await fs.pathExists(leadsFile)) {
                const fileContent = await fs.readFile(leadsFile, 'utf8');
                const data = JSON.parse(fileContent);
                leads = Array.isArray(data) ? data : Object.values(data);
                console.log('📋 Existing leads:', leads.length);
            }
            
            // חיפוש מוזמן קיים לפי שם או טלפון
            const cleanPhone = (phone || '').replace(/[^\d]/g, '');
            console.log('🔍 מחפש מוזמן קיים...');
            console.log('📱 טלפון שהתקבל:', phone, '➡️ נקי:', cleanPhone);
            console.log('👤 שם שהתקבל:', name);
            console.log('📋 סה"כ מוזמנים ברשימה:', leads.length);
            
            const existingGuestIndex = leads.findIndex(g => {
                const guestPhone = (g.phone || '').replace(/[^\d]/g, '');
                console.log(`  🔎 בודק: "${g.name}" | טלפון: ${g.phone} ➡️ נקי: ${guestPhone}`);
                
                // התאמה לפי טלפון (אם קיים)
                if (cleanPhone && guestPhone && cleanPhone === guestPhone) {
                    console.log(`  ✅ התאמה לפי טלפון! ${cleanPhone} === ${guestPhone}`);
                    return true;
                }
                // או התאמה לפי שם מדויק
                if (name && g.name && g.name.trim().toLowerCase() === name.trim().toLowerCase()) {
                    console.log(`  ✅ התאמה לפי שם! "${name.trim().toLowerCase()}" === "${g.name.trim().toLowerCase()}"`);
                    return true;
                }
                return false;
            });
            
            console.log('🎯 תוצאת חיפוש: index =', existingGuestIndex);
            
            if (existingGuestIndex !== -1) {
                // מוזמן קיים - עדכן את הסטטוס והפרטים
                console.log('✅ מצאתי מוזמן קיים! מעדכן סטטוס...');
                console.log('   📝 לפני עדכון:', JSON.stringify(leads[existingGuestIndex]));
                
                // Update status based on RSVP
                leads[existingGuestIndex].status = hebrewStatus; // מאושר / לא מגיע / ממתין
                leads[existingGuestIndex].name = rsvp.name || leads[existingGuestIndex].name; // עדכן שם
                leads[existingGuestIndex].phone = rsvp.phone || leads[existingGuestIndex].phone;
                leads[existingGuestIndex].email = rsvp.email || leads[existingGuestIndex].email;
                // Convert total people to companions (subtract 1), but only if confirmed
                const totalPeopleUpdate = parseInt(rsvp.guests) || 0;
                leads[existingGuestIndex].plus = rsvp.status === 'confirmed' ? Math.max(0, totalPeopleUpdate - 1) : 0;
                if (rsvp.message) {
                    leads[existingGuestIndex].notes = (leads[existingGuestIndex].notes ? leads[existingGuestIndex].notes + ' | ' : '') + rsvp.message;
                }
                leads[existingGuestIndex].updatedAt = new Date().toISOString();
                
                console.log('   📝 אחרי עדכון:', JSON.stringify(leads[existingGuestIndex]));
                console.log('✅ עדכנתי מוזמן:', leads[existingGuestIndex].name);
            } else {
                // מוזמן חדש - הוסף לרשימה
                console.log('➕ מוזמן חדש - מוסיף לרשימה');
            leads.push(lead);
            }
            
            await fs.writeFile(leadsFile, JSON.stringify(leads, null, 2));
            console.log('✅ RSVP saved to leads.json! Total leads:', leads.length);
            console.log('✅ File path:', leadsFile);
        }
        
        res.json({ success: true, rsvp });
    } catch (error) {
        console.error('Error saving RSVP:', error);
        res.status(500).json({ error: 'Failed to save RSVP' });
    }
});

// Get event RSVPs
app.get('/api/event/:eventId/rsvps', async (req, res) => {
    try {
        const db = loadDatabase();
        const eventId = decodeURIComponent(req.params.eventId);
        const userId = decodeURIComponent(req.query.userId);
        
        console.log('Getting RSVPs for event:', eventId, 'userId:', userId);
        
        let eventRsvps = [];
        
        // Try to load from event-specific data folder first
        if (userId && eventId) {
            const cleanEventId = eventId.replace(/_html$/, '');
            const eventDataDir = path.join('output', userId, cleanEventId + '_data');
            const rsvpsFile = path.join(eventDataDir, 'rsvps.json');
            
            console.log('Looking for RSVPs in:', eventDataDir);
            
            try {
                if (await fs.pathExists(rsvpsFile)) {
                    const fileContent = await fs.readFile(rsvpsFile, 'utf8');
                    eventRsvps = JSON.parse(fileContent);
                    console.log('Loaded RSVPs from event folder:', eventRsvps.length);
                }
            } catch (error) {
                console.error('Error reading RSVPs file:', error);
            }
        }
        
        // If no RSVPs found in folder, try global database
        if (eventRsvps.length === 0 && db.rsvps) {
            console.log('No RSVPs in folder, checking global database...');
            eventRsvps = Object.values(db.rsvps).filter(r => 
                r.eventId === eventId || 
                eventId.includes(r.eventId) ||
                r.eventId?.includes(eventId.replace('_html', ''))
            );
        }
        
        console.log('Total RSVPs found:', eventRsvps.length);
        
        res.json({ 
            rsvps: eventRsvps,
            total: eventRsvps.length,
            confirmed: eventRsvps.filter(r => r.status === 'confirmed').length,
            pending: eventRsvps.filter(r => r.status === 'pending' || !r.status).length,
            declined: eventRsvps.filter(r => r.status === 'declined').length
        });
    } catch (error) {
        console.error('Error getting event RSVPs:', error);
        res.status(500).json({ error: 'Failed to get event RSVPs' });
    }
});

// Update lead status
app.post('/api/lead/:leadId/status', async (req, res) => {
    try {
        const db = loadDatabase();
        const { leadId } = req.params;
        const { status } = req.body;
        
        console.log('Updating lead:', leadId, 'to status:', status);
        
        // Update in global database
        if (db.leads && db.leads[leadId]) {
            db.leads[leadId].status = status;
            db.leads[leadId].updatedAt = new Date().toISOString();
            saveDatabase(db);
            console.log('✅ Lead status updated in database');
        }
        
        // Also update in page-specific data folder
        const lead = db.leads?.[leadId];
        if (lead && lead.userId && lead.pageId) {
            const cleanPageId = lead.pageId.replace(/_html$/, '');
            const pageDataDir = path.join('output', lead.userId, cleanPageId + '_data');
            const leadsFile = path.join(pageDataDir, 'leads.json');
            
            try {
                if (await fs.pathExists(leadsFile)) {
                    const fileContent = await fs.readFile(leadsFile, 'utf8');
                    const leads = JSON.parse(fileContent);
                    const leadIndex = leads.findIndex(l => l.id === leadId);
                    if (leadIndex !== -1) {
                        leads[leadIndex].status = status;
                        leads[leadIndex].updatedAt = new Date().toISOString();
                        await fs.writeFile(leadsFile, JSON.stringify(leads, null, 2));
                        console.log('✅ Lead status updated in folder');
                    }
                }
            } catch (error) {
                console.error('Error updating lead in folder:', error);
            }
        }
        
        res.json({ success: true, lead: db.leads?.[leadId] });
    } catch (error) {
        console.error('Error updating lead status:', error);
        res.status(500).json({ error: 'Failed to update lead status' });
    }
});

// Get user purchases
app.get('/api/user/:userId/purchases', (req, res) => {
    try {
        const db = loadDatabase();
        const userId = req.params.userId;
        
        const userPurchases = db.users[userId]?.purchases?.map(purchaseId => db.purchases[purchaseId]) || [];
        
        res.json(userPurchases);
    } catch (error) {
        console.error('Error getting user purchases:', error);
        res.status(500).json({ error: 'Failed to get user purchases' });
    }
});

// Upload image (replaces old image)
app.post('/api/upload-image', upload.single('image'), async (req, res) => {
    try {
        console.log('📤 Image upload request:', {
            hasFile: !!req.file,
            userId: req.body.userId,
            pageName: req.body.pageName,
            fileSize: req.file?.size,
            filePath: req.file?.path
        });
        
        if (!req.file) {
            return res.status(400).json({ error: 'No image uploaded' });
        }
        
        const { userId, pageName, oldImageUrl } = req.body;
        
        if (!userId) {
            console.error('❌ Missing userId');
            return res.status(400).json({ error: 'Missing userId' });
        }
        
        // pageName is optional - default to 'general'
        const actualPageName = pageName || 'general';
        
        // Delete old image if exists
        if (oldImageUrl) {
            try {
                const oldImagePath = path.join(__dirname, oldImageUrl.replace(/^\//, ''));
                if (await fs.pathExists(oldImagePath)) {
                    await fs.remove(oldImagePath);
                    console.log('🗑️ Deleted old image:', oldImagePath);
                }
            } catch (deleteError) {
                console.warn('⚠️ Could not delete old image:', deleteError);
            }
        }
        
        // 🔧 FIX: Move file from temp to correct user directory
        const tempPath = req.file.path; // Where multer saved it (temp_XXX)
        const correctDir = path.join(__dirname, 'output', userId, 'images', actualPageName);
        const correctPath = path.join(correctDir, req.file.filename);
        
        console.log('📁 Moving file:', {
            from: tempPath,
            to: correctPath
        });
        
        // Ensure correct directory exists
        await fs.ensureDir(correctDir);
        
        // Move file to correct location
        await fs.move(tempPath, correctPath, { overwrite: true });
        
        console.log('✅ File moved successfully');
        
        // Build image URL with pageName
        const imageUrl = `/pages/${userId}/images/${actualPageName}/${req.file.filename}`;
        
        // Verify file exists on disk in correct location
        const fileExists = await fs.pathExists(correctPath);
        
        console.log('✅ Image uploaded:', {
            imageUrl,
            diskPath: correctPath,
            fileExists,
            filename: req.file.filename
        });
        
        if (!fileExists) {
            console.error('❌ File was not saved to disk!', correctPath);
            return res.status(500).json({ error: 'File was not saved correctly' });
        }
        
        // Return in BOTH formats for compatibility
        res.json({ 
            success: true,              // Old format
            imageUrl: imageUrl,         // Old format  
            filename: req.file.filename, // Old format
            url: imageUrl,              // New format
            fileName: req.file.originalname // New format
        });
        
    } catch (error) {
        console.error('❌ Error uploading image:', error);
        res.status(500).json({ error: 'Failed to upload image: ' + error.message });
    }
});

// Upload menu item image
app.post('/api/upload-menu-image', upload.single('image'), async (req, res) => {
    try {
        console.log('🍽️ Menu image upload request:', {
            hasFile: !!req.file,
            userId: req.body.userId,
            pageId: req.body.pageId,
            menuItemIndex: req.body.menuItemIndex
        });

        if (!req.file) {
            return res.status(400).json({ error: 'No image uploaded' });
        }

        const { userId, pageId, menuItemIndex } = req.body;

        if (!userId || !pageId) {
            return res.status(400).json({ error: 'Missing userId or pageId' });
        }

        // Create directory for menu images
        const menuImagesDir = path.join(__dirname, 'output', userId, `${pageId}_html_data`, 'menu-images');
        await fs.ensureDir(menuImagesDir);

        // Generate unique filename
        const timestamp = Date.now();
        const originalName = req.file.originalname;
        const extension = path.extname(originalName);
        const filename = `menu-item-${menuItemIndex || 'unknown'}-${timestamp}${extension}`;
        const filepath = path.join(menuImagesDir, filename);

        // Move uploaded file
        await fs.move(req.file.path, filepath);

        // Generate URL
        const imageUrl = `/output/${userId}/${pageId}_html_data/menu-images/${filename}`;

        console.log('✅ Menu image uploaded successfully:', {
            filename,
            imageUrl,
            menuItemIndex
        });

        res.json({
            success: true,
            imageUrl: imageUrl,
            filename: filename,
            menuItemIndex: menuItemIndex
        });

    } catch (error) {
        console.error('❌ Error uploading menu image:', error);
        res.status(500).json({ error: 'Failed to upload menu image: ' + error.message });
    }
});

// Manage branches for pages
app.post('/api/manage-branches', async (req, res) => {
    try {
        const { userId, pageId, action, branchData } = req.body;
        
        console.log('🏢 Managing branches:', { userId, pageId, action, branchData });
        
        if (!userId || !pageId || !action) {
            return res.status(400).json({ error: 'Missing required fields' });
        }
        
        const cleanPageId = pageId.replace('_html', '');
        const dataDir = path.join(__dirname, 'output', userId, `${cleanPageId}_html_data`);
        await fs.ensureDir(dataDir);
        
        const branchesFile = path.join(dataDir, 'branches.json');
        let branches = [];
        
        // Load existing branches
        try {
            const existingData = await fs.readFile(branchesFile, 'utf8');
            branches = JSON.parse(existingData);
        } catch (e) {
            // File doesn't exist yet, start with empty array
        }
        
        if (action === 'add') {
            // Add new branch
            const newBranch = {
                id: Date.now().toString(),
                name: branchData.name || '',
                address: branchData.address || '',
                phone: branchData.phone || '',
                createdAt: new Date().toISOString()
            };
            branches.push(newBranch);
            
        } else if (action === 'update') {
            // Update existing branch
            const branchIndex = branches.findIndex(b => b.id === branchData.id);
            if (branchIndex !== -1) {
                branches[branchIndex] = {
                    ...branches[branchIndex],
                    name: branchData.name || branches[branchIndex].name,
                    address: branchData.address || branches[branchIndex].address,
                    phone: branchData.phone || branches[branchIndex].phone,
                    updatedAt: new Date().toISOString()
                };
            }
            
        } else if (action === 'delete') {
            // Delete branch
            branches = branches.filter(b => b.id !== branchData.id);
        }
        
        // Save updated branches
        await fs.writeFile(branchesFile, JSON.stringify(branches, null, 2));
        
        console.log('✅ Branches updated successfully:', branches.length);
        
        res.json({
            success: true,
            branches: branches,
            message: `Branch ${action}ed successfully`
        });
        
    } catch (error) {
        console.error('❌ Error managing branches:', error);
        res.status(500).json({ error: 'Failed to manage branches: ' + error.message });
    }
});

// Get branches for a page
app.get('/api/branches/:userId/:pageId', async (req, res) => {
    try {
        const { userId, pageId } = req.params;
        const cleanPageId = pageId.replace('_html', '');
        const dataDir = path.join(__dirname, 'output', userId, `${cleanPageId}_html_data`);
        const branchesFile = path.join(dataDir, 'branches.json');
        
        let branches = [];
        try {
            const existingData = await fs.readFile(branchesFile, 'utf8');
            branches = JSON.parse(existingData);
        } catch (e) {
            // File doesn't exist, return empty array
        }
        
        res.json({
            success: true,
            branches: branches
        });
        
    } catch (error) {
        console.error('❌ Error getting branches:', error);
        res.status(500).json({ error: 'Failed to get branches: ' + error.message });
    }
});

// Upload expense file (invoice/receipt)
app.post('/api/upload-expense-file', upload.single('file'), async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ error: 'No file uploaded' });
        }
        
        const { userId, storeId, oldFileUrl } = req.body;
        
        if (!userId || !storeId) {
            return res.status(400).json({ error: 'Missing userId or storeId' });
        }
        
        // Delete old expense file if exists
        if (oldFileUrl) {
            try {
                const oldFilePath = path.join(__dirname, 'output', oldFileUrl.replace('/expenses/', ''));
                if (await fs.pathExists(oldFilePath)) {
                    await fs.remove(oldFilePath);
                    console.log('🗑️ Deleted old expense file:', oldFilePath);
                }
            } catch (deleteError) {
                console.warn('⚠️ Could not delete old expense file:', deleteError);
            }
        }
        
        // Move file to expenses folder
        const expensesDir = path.join('output', userId, storeId + '_expenses');
        await fs.ensureDir(expensesDir);
        
        const fileName = Date.now() + '_' + req.file.originalname;
        const destPath = path.join(expensesDir, fileName);
        
        await fs.move(req.file.path, destPath);
        
        // Return file URL
        const fileUrl = `/expenses/${userId}/${storeId}_expenses/${fileName}`;
        
        console.log('✅ Expense file uploaded:', fileUrl);
        res.json({ url: fileUrl, fileName: req.file.originalname });
        
    } catch (error) {
        console.error('Error uploading expense file:', error);
        res.status(500).json({ error: 'Failed to upload file' });
    }
});

// Get leads for specific event page
app.get('/api/get-leads', async (req, res) => {
    try {
        const { userId, pageId } = req.query;
        
        if (!userId || !pageId) {
            return res.status(400).json({ error: 'Missing userId or pageId' });
        }
        
        // Load leads from leads.json file
        const leadsFile = path.join('output', userId, pageId.replace('_html', '') + '_html_data', 'leads.json');
        
        let leads = [];
        if (await fs.pathExists(leadsFile)) {
            const data = await fs.readJson(leadsFile);
            leads = Array.isArray(data) ? data : Object.values(data);
        }
        
        console.log(`✅ Loaded ${leads.length} leads for ${pageId}`);
        res.json({ leads });
        
    } catch (error) {
        console.error('Error getting leads:', error);
        res.status(500).json({ error: 'Failed to get leads' });
    }
});

// Add guests to event
app.post('/api/add-guests', async (req, res) => {
    try {
        const { userId, pageId, guests, replaceAll } = req.body;
        
        if (!userId || !pageId || !guests || !Array.isArray(guests)) {
            return res.status(400).json({ error: 'Missing required fields' });
        }
        
        const leadsFile = path.join('output', userId, pageId.replace('_html', '') + '_html_data', 'leads.json');
        
        // Load existing leads OR start fresh if replaceAll
        let leads = [];
        if (!replaceAll && await fs.pathExists(leadsFile)) {
            const data = await fs.readJson(leadsFile);
            leads = Array.isArray(data) ? data : Object.values(data);
        }
        
        // Add new guests
        const timestamp = Date.now();
        for (const guest of guests) {
            leads.push({
                id: `guest_${timestamp}_${Math.random().toString(36).substr(2, 9)}`,
                name: guest.name,
                phone: guest.phone,
                email: '',
                plus: 0,
                status: 'ממתין', // Pending
                table: 0,
                notes: '',
                gift: '',
                giftAmount: 0,
                invitationSent: false,
                createdAt: new Date().toISOString()
            });
        }
        
        // Save leads
        await fs.ensureDir(path.dirname(leadsFile));
        await fs.writeFile(leadsFile, JSON.stringify(leads, null, 2));
        
        const action = replaceAll ? 'Replaced' : 'Added';
        console.log(`✅ ${action} ${guests.length} guests to ${pageId} (Total: ${leads.length})`);
        res.json({ success: true, count: guests.length, total: leads.length });
        
    } catch (error) {
        console.error('Error adding guests:', error);
        res.status(500).json({ error: 'Failed to add guests: ' + error.message });
    }
});

// Update expected guests limit
app.post('/api/update-expected-guests', async (req, res) => {
    try {
        const { userId, pageId, expectedGuests } = req.body;
        
        if (!userId || !pageId || expectedGuests === undefined) {
            return res.status(400).json({ error: 'Missing required fields' });
        }
        
        const cleanPageId = pageId.replace('_html', '');
        const metadataPath = path.join('output', userId, cleanPageId + '_html_data', 'metadata.json');
        
        // Load existing metadata
        let metadata = {};
        if (await fs.pathExists(metadataPath)) {
            metadata = await fs.readJson(metadataPath);
        }
        
        // Update expected guests
        metadata.expectedGuests = parseInt(expectedGuests);
        metadata.lastUpdated = new Date().toISOString();
        
        // Save metadata
        await fs.ensureDir(path.dirname(metadataPath));
        await fs.writeJson(metadataPath, metadata, { spaces: 2 });
        
        console.log(`✅ Updated expected guests for ${pageId} to ${expectedGuests}`);
        res.json({ success: true, expectedGuests: metadata.expectedGuests });
        
    } catch (error) {
        console.error('Error updating expected guests:', error);
        res.status(500).json({ error: 'Failed to update expected guests: ' + error.message });
    }
});

// Update single guest table assignment
app.post('/api/update-guest-table', async (req, res) => {
    try {
        const { userId, pageId, guestId, table } = req.body;
        
        if (!userId || !pageId || !guestId || table === undefined) {
            return res.status(400).json({ error: 'Missing required fields' });
        }
        
        const cleanPageId = pageId.replace('_html', '');
        const leadsFile = path.join('output', userId, cleanPageId + '_html_data', 'leads.json');
        
        if (!await fs.pathExists(leadsFile)) {
            return res.status(404).json({ error: 'Leads file not found' });
        }
        
        // Load leads
        const data = await fs.readJson(leadsFile);
        let leads = Array.isArray(data) ? data : Object.values(data);
        
        // Find and update guest
        const guestIndex = leads.findIndex(g => g.id === guestId);
        if (guestIndex === -1) {
            return res.status(404).json({ error: 'Guest not found' });
        }
        
        leads[guestIndex].table = parseInt(table);
        leads[guestIndex].updatedAt = new Date().toISOString();
        
        // Save leads
        await fs.writeJson(leadsFile, leads, { spaces: 2 });
        
        console.log(`✅ Updated table for guest ${guestId} to table ${table}`);
        res.json({ success: true });
        
    } catch (error) {
        console.error('Error updating guest table:', error);
        res.status(500).json({ error: 'Failed to update table: ' + error.message });
    }
});

// Save all table assignments
app.post('/api/save-all-tables', async (req, res) => {
    try {
        const { userId, pageId, guests: guestUpdates } = req.body;
        
        if (!userId || !pageId || !Array.isArray(guestUpdates)) {
            return res.status(400).json({ error: 'Missing required fields' });
        }
        
        const cleanPageId = pageId.replace('_html', '');
        const leadsFile = path.join('output', userId, cleanPageId + '_html_data', 'leads.json');
        
        if (!await fs.pathExists(leadsFile)) {
            return res.status(404).json({ error: 'Leads file not found' });
        }
        
        // Load leads
        const data = await fs.readJson(leadsFile);
        let leads = Array.isArray(data) ? data : Object.values(data);
        
        // Update all tables
        guestUpdates.forEach(update => {
            const guestIndex = leads.findIndex(g => g.id === update.id);
            if (guestIndex !== -1) {
                leads[guestIndex].table = parseInt(update.table);
                leads[guestIndex].updatedAt = new Date().toISOString();
            }
        });
        
        // Save leads
        await fs.writeJson(leadsFile, leads, { spaces: 2 });
        
        console.log(`✅ Saved table assignments for ${guestUpdates.length} guests`);
        res.json({ success: true });
        
    } catch (error) {
        console.error('Error saving table assignments:', error);
        res.status(500).json({ error: 'Failed to save tables: ' + error.message });
    }
});

// Mark invitation as sent
app.post('/api/mark-invitation-sent', async (req, res) => {
    try {
        const { userId, pageId, guestId } = req.body;
        
        if (!userId || !pageId || !guestId) {
            return res.status(400).json({ error: 'Missing required fields' });
        }
        
        const leadsFile = path.join('output', userId, pageId.replace('_html', '') + '_html_data', 'leads.json');
        
        if (!await fs.pathExists(leadsFile)) {
            return res.status(404).json({ error: 'Leads file not found' });
        }
        
        // Load leads
        const data = await fs.readJson(leadsFile);
        let leads = Array.isArray(data) ? data : Object.values(data);
        
        // Find and update guest
        const guest = leads.find(l => l.id === guestId);
        if (guest) {
            guest.invitationSent = true;
            guest.invitationSentAt = new Date().toISOString();
        }
        
        // Save leads
        await fs.writeFile(leadsFile, JSON.stringify(leads, null, 2));
        
        res.json({ success: true });
        
    } catch (error) {
        console.error('Error marking invitation as sent:', error);
        res.status(500).json({ error: 'Failed to mark invitation' });
    }
});

// Clean orphaned data (leads/purchases for deleted pages)
app.post('/api/clean-orphaned-data', async (req, res) => {
    try {
        const { userId } = req.body;
        
        if (!userId) {
            return res.status(400).json({ error: 'Missing userId' });
        }
        
        const db = loadDatabase();
        const userDir = path.join('output', userId);
        
        // Get list of existing pages (HTML files + _html_data folders)
        let existingPages = new Set();
        
        if (await fs.pathExists(userDir)) {
            const files = await fs.readdir(userDir);
            
            // Add HTML files
            files.filter(f => f.endsWith('_html')).forEach(f => existingPages.add(f));
            
            // Add pages from _data folders
            files.filter(f => f.endsWith('_html_data')).forEach(f => {
                existingPages.add(f.replace('_data', ''));
            });
        }
        
        console.log('📋 Existing pages:', Array.from(existingPages));
        
        // Clean purchases
        let deletedPurchases = 0;
        Object.keys(db.purchases).forEach(purchaseId => {
            const purchase = db.purchases[purchaseId];
            if (purchase.userId === userId) {
                const pageExists = Array.from(existingPages).some(page => 
                    purchase.storeId === page || 
                    purchase.storeId === page.replace('_html', '') ||
                    purchase.pageName === page ||
                    purchase.pageName === page.replace('_html', '')
                );
                
                if (!pageExists) {
                    delete db.purchases[purchaseId];
                    deletedPurchases++;
                }
            }
        });
        
        // Clean leads
        let deletedLeads = 0;
        if (db.leads) {
            Object.keys(db.leads).forEach(leadId => {
                const lead = db.leads[leadId];
                if (lead.userId === userId) {
                    const pageExists = Array.from(existingPages).some(page => 
                        lead.eventId === page || 
                        lead.eventId === page.replace('_html', '') ||
                        lead.pageId === page ||
                        lead.pageId === page.replace('_html', '')
                    );
                    
                    if (!pageExists) {
                        delete db.leads[leadId];
                        deletedLeads++;
                    }
                }
            });
        }
        
        // Update user purchases array
        if (db.users[userId] && db.users[userId].purchases) {
            const originalLength = db.users[userId].purchases.length;
            db.users[userId].purchases = db.users[userId].purchases.filter(purchaseId => {
                return db.purchases[purchaseId];
            });
            const removedCount = originalLength - db.users[userId].purchases.length;
            console.log(`🗑️ Removed ${removedCount} orphaned purchases from user's list`);
        }
        
        // Recalculate analytics
        db.analytics.totalSales = Object.values(db.purchases).reduce((sum, p) => sum + (p.total || 0), 0);
        db.analytics.recentPurchases = Object.values(db.purchases)
            .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
            .slice(0, 50);
        
        saveDatabase(db);
        
        console.log(`🧹 Cleaned orphaned data: ${deletedPurchases} purchases, ${deletedLeads} leads`);
        res.json({ 
            success: true, 
            message: `נוקו ${deletedPurchases} קניות ו-${deletedLeads} מוזמנים יתומים`,
            deletedPurchases,
            deletedLeads
        });
        
    } catch (error) {
        console.error('Error cleaning orphaned data:', error);
        res.status(500).json({ error: 'Failed to clean data' });
    }
});

// 🗑️ Clean orphaned _data folders (folders without matching _html files)
app.post('/api/clean-orphaned-folders', async (req, res) => {
    try {
        const { userId } = req.body;
        
        if (!userId) {
            return res.status(400).json({ error: 'Missing userId' });
        }
        
        const userDir = path.join('output', userId);
        
        if (!await fs.pathExists(userDir)) {
            return res.json({ success: true, deletedFolders: 0, message: 'User directory not found' });
        }
        
        console.log(`🧹 Cleaning orphaned folders for user: ${userId}`);
        
        const files = await fs.readdir(userDir);
        
        // Get list of existing HTML files (real pages)
        const htmlFiles = new Set();
        files.filter(f => f.endsWith('_html')).forEach(f => {
            htmlFiles.add(f.replace('_html', '')); // Store base name without _html
        });
        
        console.log(`📄 Found ${htmlFiles.size} HTML files:`, Array.from(htmlFiles));
        
        // Find all _data folders
        const dataFolders = files.filter(f => f.endsWith('_data') || f.endsWith('_html_data'));
        console.log(`📂 Found ${dataFolders.length} data folders`);
        
        let deletedFolders = 0;
        const deletedList = [];
        
        for (const folder of dataFolders) {
            // Extract base name (remove _data or _html_data)
            let baseName = folder.replace('_html_data', '').replace('_data', '');
            
            // Check if corresponding HTML file exists
            const hasHtml = htmlFiles.has(baseName);
            
            if (!hasHtml) {
                // This is an orphaned folder - delete it!
                const folderPath = path.join(userDir, folder);
                await fs.remove(folderPath);
                console.log(`🗑️ Deleted orphaned folder: ${folder}`);
                deletedFolders++;
                deletedList.push(folder);
            } else {
                console.log(`✅ Keeping folder (has HTML): ${folder}`);
            }
        }
        
        console.log(`🧹 Cleanup complete: Deleted ${deletedFolders} orphaned folders`);
        
        res.json({
            success: true,
            deletedFolders,
            deletedList,
            message: `נמחקו ${deletedFolders} תיקיות יתומות`
        });
    } catch (error) {
        console.error('Error cleaning orphaned folders:', error);
        res.status(500).json({ error: 'Failed to clean folders' });
    }
});

// Fix all old event pages - remove WhatsApp and add API submission
app.post('/api/fix-old-event-pages', async (req, res) => {
    try {
        const { userId } = req.body;
        
        if (!userId) {
            return res.status(400).json({ error: 'Missing userId' });
        }
        
        const userDir = path.join('output', userId);
        
        if (!await fs.pathExists(userDir)) {
            return res.status(404).json({ error: 'User directory not found' });
        }
        
        const files = await fs.readdir(userDir);
        const htmlFiles = files.filter(f => f.endsWith('_html'));
        
        let fixedCount = 0;
        let skippedCount = 0;
        
        console.log(`🔧 Starting to fix ${htmlFiles.length} pages...`);
        
        for (const fileName of htmlFiles) {
            const filePath = path.join(userDir, fileName);
            const dataDir = path.join(userDir, fileName + '_data');
            const metadataFile = path.join(dataDir, 'metadata.json');
            
            // Check if it's an event page
            let pageType = 'generic';
            if (await fs.pathExists(metadataFile)) {
                try {
                    const metadata = JSON.parse(await fs.readFile(metadataFile, 'utf8'));
                    pageType = metadata.pageType || 'generic';
                } catch (e) {
                    console.log(`⚠️ Could not read metadata for ${fileName}`);
                }
            }
            
            if (pageType !== 'event') {
                skippedCount++;
                continue;
            }
            
            // Read the HTML file
            let htmlContent = await fs.readFile(filePath, 'utf8');
            
            // Fix the WhatsApp code
            const fixedHtml = fixEventPageWhatsApp(htmlContent, pageType);
            
            // Only save if something changed
            if (fixedHtml !== htmlContent) {
                await fs.writeFile(filePath, fixedHtml, 'utf8');
                console.log(`✅ Fixed: ${fileName}`);
                fixedCount++;
            } else {
                console.log(`⏭️ Already fixed: ${fileName}`);
                skippedCount++;
            }
        }
        
        console.log(`\n🎉 Fixed ${fixedCount} event pages, skipped ${skippedCount} pages`);
        
        res.json({ 
            success: true, 
            message: `תוקנו ${fixedCount} דפי אירוע, דילגנו על ${skippedCount} דפים`,
            fixedCount,
            skippedCount,
            totalPages: htmlFiles.length
        });
        
    } catch (error) {
        console.error('Error fixing old event pages:', error);
        res.status(500).json({ error: 'Failed to fix pages: ' + error.message });
    }
});

// Delete expense file
app.post('/api/delete-expense-file', async (req, res) => {
    try {
        const { fileUrl, userId, storeId } = req.body;
        
        if (!fileUrl) {
            return res.status(400).json({ error: 'Missing fileUrl' });
        }
        
        const filePath = path.join(__dirname, 'output', fileUrl.replace('/expenses/', ''));
        
        if (await fs.pathExists(filePath)) {
            await fs.remove(filePath);
            console.log('🗑️ Deleted expense file:', filePath);
            res.json({ success: true, message: 'File deleted successfully' });
        } else {
            console.warn('⚠️ Expense file not found:', filePath);
            res.json({ success: false, message: 'File not found' });
        }
        
    } catch (error) {
        console.error('Error deleting expense file:', error);
        res.status(500).json({ error: 'Failed to delete file' });
    }
});

// Update bot actions in all pages
app.get('/api/update-bot-actions', async (req, res) => {
  try {
    console.log('🤖 Starting to update bot actions in all pages...');
    const outputDir = 'output';
    
    if (!await fs.pathExists(outputDir)) {
      return res.json({ message: 'No output directory found', updated: 0 });
    }
    
    let updatedCount = 0;
    const userDirs = await fs.readdir(outputDir);
    
    const newBotActions = `} else if (data.action === 'scroll_to_products') {
        console.log('📜 Bot requested to scroll to products');
        
        // Find the products section and scroll to it
        const productSection = document.querySelector('[class*="product"], .products, #products, section:has(.product-card)');
        if (productSection) {
          productSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
          console.log('✅ Scrolled to products section');
        } else {
          console.warn('⚠️ Products section not found');
        }
        
        // Display the message
        addBotMessage(data.message || 'הנה המוצרים שלנו! 🛍️');
      } else if (data.action === 'scroll_to_product' && data.product_name) {
        console.log('📜 Bot requested to scroll to specific product:', data.product_name);
        
        // Find the specific product card
        const allProducts = document.querySelectorAll('.product-card, [class*="product"]');
        let targetProduct = null;
        
        for (const product of allProducts) {
          const nameEl = product.querySelector('h1, h2, h3, h4, [class*="title"], [class*="name"]');
          if (nameEl && nameEl.textContent.trim().toLowerCase().includes(data.product_name.toLowerCase())) {
            targetProduct = product;
            break;
          }
        }
        
        if (targetProduct) {
          targetProduct.scrollIntoView({ behavior: 'smooth', block: 'center' });
          // Highlight the product briefly
          targetProduct.style.transition = 'all 0.3s ease';
          targetProduct.style.boxShadow = '0 0 30px rgba(102, 126, 234, 0.8)';
          targetProduct.style.transform = 'scale(1.05)';
          setTimeout(() => {
            targetProduct.style.boxShadow = '';
            targetProduct.style.transform = '';
          }, 2000);
          console.log('✅ Scrolled to product:', data.product_name);
        } else {
          console.warn('⚠️ Product not found:', data.product_name);
        }
        
        addBotMessage(data.message || 'הנה המוצר! 🎯');
      } else if (data.action === 'fill_contact_form' && data.name && data.phone) {
        console.log('📝 Bot requested to fill contact form');
        
        // Find the contact form
        const forms = document.querySelectorAll('form');
        let contactForm = null;
        
        for (const form of forms) {
          const inputs = form.querySelectorAll('input, textarea');
          const hasName = Array.from(inputs).some(inp => inp.name?.includes('name') || inp.placeholder?.includes('שם'));
          const hasPhone = Array.from(inputs).some(inp => inp.name?.includes('phone') || inp.placeholder?.includes('טלפון'));
          
          if (hasName && hasPhone) {
            contactForm = form;
            break;
          }
        }
        
        if (contactForm) {
          // Fill the form
          const nameInput = contactForm.querySelector('input[name*="name"], input[placeholder*="שם"]');
          const phoneInput = contactForm.querySelector('input[name*="phone"], input[type="tel"], input[placeholder*="טלפון"]');
          const messageInput = contactForm.querySelector('textarea, input[name*="message"], input[placeholder*="הודעה"]');
          
          if (nameInput) nameInput.value = data.name;
          if (phoneInput) phoneInput.value = data.phone;
          if (messageInput && data.message_text) messageInput.value = data.message_text;
          
          // Scroll to the form
          contactForm.scrollIntoView({ behavior: 'smooth', block: 'center' });
          
          // Highlight the form briefly
          contactForm.style.transition = 'all 0.3s ease';
          contactForm.style.boxShadow = '0 0 30px rgba(16, 185, 129, 0.8)';
          setTimeout(() => {
            contactForm.style.boxShadow = '';
          }, 2000);
          
          console.log('✅ Contact form filled');
        } else {
          console.warn('⚠️ Contact form not found');
        }
        
        addBotMessage(data.message || 'מילאתי את הטופס בשבילך! ✅');
      } else if (data.action === 'open_whatsapp') {
        console.log('💬 Bot requested to open WhatsApp');
        
        // Find and click the WhatsApp bubble
        const whatsappBubble = document.querySelector('[id*="whatsapp"], [class*="whatsapp"], a[href*="wa.me"]');
        if (whatsappBubble) {
          whatsappBubble.click();
          console.log('✅ Opened WhatsApp');
        } else {
          console.warn('⚠️ WhatsApp bubble not found');
        }
        
        addBotMessage(data.message || 'פותח את WhatsApp... 💬');
      } else if (data.action === 'scroll_to_section' && data.section_name) {
        console.log('📜 Bot requested to scroll to section:', data.section_name);
        
        // Try to find the section by various methods
        const sectionName = data.section_name.toLowerCase();
        let targetSection = null;
        
        // Method 1: By ID
        targetSection = document.getElementById(sectionName);
        
        // Method 2: By heading text
        if (!targetSection) {
          const headings = document.querySelectorAll('h1, h2, h3, h4, h5, h6');
          for (const heading of headings) {
            if (heading.textContent.toLowerCase().includes(sectionName)) {
              targetSection = heading.closest('section') || heading.parentElement;
              break;
            }
          }
        }
        
        // Method 3: By section with matching text
        if (!targetSection) {
          const sections = document.querySelectorAll('section, .section, [class*="section"]');
          for (const section of sections) {
            if (section.textContent.toLowerCase().includes(sectionName)) {
              targetSection = section;
              break;
            }
          }
        }
        
        if (targetSection) {
          targetSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
          console.log('✅ Scrolled to section:', data.section_name);
        } else {
          console.warn('⚠️ Section not found:', data.section_name);
        }
        
        addBotMessage(data.message || 'הנה החלק שחיפשת! 📍');
      } else if (data.action === 'highlight_element' && data.element_text) {
        console.log('✨ Bot requested to highlight element:', data.element_text);
        
        // Find element by text content
        const allElements = document.querySelectorAll('button, a, h1, h2, h3, h4, .btn, [class*="button"]');
        let targetElement = null;
        
        for (const el of allElements) {
          if (el.textContent.toLowerCase().includes(data.element_text.toLowerCase())) {
            targetElement = el;
            break;
          }
        }
        
        if (targetElement) {
          // Scroll to element
          targetElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
          
          // Create pulsing highlight effect
          const originalBoxShadow = targetElement.style.boxShadow;
          const originalTransform = targetElement.style.transform;
          let pulseCount = 0;
          
          const pulseInterval = setInterval(() => {
            if (pulseCount % 2 === 0) {
              targetElement.style.boxShadow = '0 0 40px rgba(234, 179, 8, 1)';
              targetElement.style.transform = 'scale(1.1)';
            } else {
              targetElement.style.boxShadow = '0 0 20px rgba(234, 179, 8, 0.5)';
              targetElement.style.transform = 'scale(1)';
            }
            pulseCount++;
            
            if (pulseCount >= 6) {
              clearInterval(pulseInterval);
              targetElement.style.boxShadow = originalBoxShadow;
              targetElement.style.transform = originalTransform;
            }
          }, 400);
          
          console.log('✅ Highlighted element');
        } else {
          console.warn('⚠️ Element not found:', data.element_text);
        }
        
        addBotMessage(data.message || 'הנה מה שחיפשת! ✨');
      } else {
        // Regular message - display as is
        addBotMessage(data.message || data.response || 'מצטערת, לא הצלחתי להבין');
      }`;
    
    for (const userId of userDirs) {
      const userDir = path.join(outputDir, userId);
      const stat = await fs.stat(userDir);
      
      if (!stat.isDirectory()) continue;
      
      const files = await fs.readdir(userDir);
      
      for (const file of files) {
        // Only fix HTML files
        if (!file.endsWith('.html') && !file.endsWith('_html')) continue;
        
        const filePath = path.join(userDir, file);
        const fileStats = await fs.stat(filePath);
        
        if (!fileStats.isFile()) continue;
        
        console.log(`🤖 Updating bot actions in: ${file}`);
        
        let html = await fs.readFile(filePath, 'utf-8');
        const originalHtml = html;
        
        // Find and replace the old bot action handler
        const oldActionPattern = /\} else if \(data\.action === 'scroll_to_products'\) \{[\s\S]*?\} else \{[\s\S]*?addBotMessage\(data\.message \|\| data\.response \|\| 'מצטערת, לא הצלחתי להבין'\);[\s\S]*?\}/;
        
        if (oldActionPattern.test(html)) {
          html = html.replace(oldActionPattern, newBotActions);
          
          await fs.writeFile(filePath, html);
          console.log(`✅ Updated: ${file}`);
          updatedCount++;
        } else {
          console.log(`⏭️ Skipped (pattern not found): ${file}`);
        }
      }
    }
    
    console.log(`🎉 Updated ${updatedCount} pages with new bot actions`);
    res.json({ 
      success: true, 
      message: `Updated ${updatedCount} pages with new bot actions`, 
      updated: updatedCount 
    });
    
  } catch (error) {
    console.error('Error updating bot actions:', error);
    res.status(500).json({ error: 'Failed to update bot actions: ' + error.message });
  }
});

// Fix old store pages (cart, bubbles, etc.)
app.get('/api/fix-old-store-pages', async (req, res) => {
  try {
    console.log('🛒 Starting to fix old store pages...');
    const outputDir = 'output';
    
    if (!await fs.pathExists(outputDir)) {
      return res.json({ message: 'No output directory found', fixed: 0 });
    }
    
    let fixedCount = 0;
    const userDirs = await fs.readdir(outputDir);
    
    for (const userId of userDirs) {
      const userDir = path.join(outputDir, userId);
      const stat = await fs.stat(userDir);
      
      if (!stat.isDirectory()) continue;
      
      const files = await fs.readdir(userDir);
      
      for (const file of files) {
        // Only fix HTML files
        if (!file.endsWith('.html') && !file.endsWith('_html')) continue;
        
        const filePath = path.join(userDir, file);
        const fileStats = await fs.stat(filePath);
        
        if (!fileStats.isFile()) continue;
        
        // Check if this is a store page
        const metadataFolder = file.replace('.html', '').replace(/_html$/, '_html_data');
        const metadataPath = path.join(userDir, metadataFolder, 'metadata.json');
        
        let isStore = false;
        if (await fs.pathExists(metadataPath)) {
          const metadata = await fs.readJson(metadataPath);
          isStore = metadata.pageType === 'store';
        }
        
        if (!isStore) {
          // Fallback: check HTML content for store indicators
          let html = await fs.readFile(filePath, 'utf-8');
          if (html.includes('page-type') && html.includes('content="store"')) {
            isStore = true;
          } else if (html.includes('addToCart') || html.includes('cart-sidebar') || html.includes('store-checkout.js')) {
            isStore = true;
          }
        }
        
        if (!isStore) continue;
        
        console.log(`🛒 Fixing store page: ${file}`);
        
        let html = await fs.readFile(filePath, 'utf-8');
        const originalHtml = html;
        
        // Apply all store fixes
        html = fixStorePageIssues(html);
        
        // Only save if something changed
        if (html !== originalHtml) {
          await fs.writeFile(filePath, html);
          console.log(`✅ Fixed: ${file}`);
          fixedCount++;
        } else {
          console.log(`⏭️ Skipped (no changes needed): ${file}`);
        }
      }
    }
    
    console.log(`🎉 Fixed ${fixedCount} store pages`);
    res.json({ 
      success: true, 
      message: `Fixed ${fixedCount} store pages`, 
      fixed: fixedCount 
    });
    
  } catch (error) {
    console.error('Error fixing old store pages:', error);
    res.status(500).json({ error: 'Failed to fix old store pages: ' + error.message });
    }
});

// Check if user purchased course (by phone number)
app.get('/api/check-purchase', async (req, res) => {
    try {
        const { userId, storeId, phone } = req.query;
        
        console.log('🔍 Checking purchase:', { userId, storeId, phone });
        
        if (!userId || !storeId || !phone) {
            return res.status(400).json({ error: 'Missing required parameters' });
        }
        
        // Check purchases.json in the page data folder
        const pageDataDir = path.join('output', userId, storeId + '_data');
        const purchasesFile = path.join(pageDataDir, 'purchases.json');
        
        console.log('📁 Looking in:', purchasesFile);
        
        if (await fs.pathExists(purchasesFile)) {
            const purchases = await fs.readJson(purchasesFile);
            console.log(`📦 Found ${purchases.length} purchases`);
            
            // Check if any purchase matches the phone number
            const userPurchase = purchases.find(p => 
                p.customerPhone === phone || 
                p.phone === phone ||
                (p.customerPhone && p.customerPhone.replace(/\D/g, '') === phone.replace(/\D/g, ''))
            );
            
            if (userPurchase) {
                console.log('✅ Purchase found for phone:', phone);
                return res.json({ purchased: true, purchase: userPurchase });
            }
        }
        
        console.log('🔒 No purchase found for phone:', phone);
        res.json({ purchased: false });
        
    } catch (error) {
        console.error('❌ Error checking purchase:', error);
        res.status(500).json({ error: 'Failed to check purchase' });
    }
});

// Save lead from forms (property, restaurant, landing pages, etc.)
app.post('/api/save-lead', async (req, res) => {
    try {
        const { userId, pageId, leadData } = req.body;
        
        console.log('📝 Saving lead:', { userId, pageId, leadData });
        
        if (!userId || !pageId || !leadData) {
            return res.status(400).json({ error: 'Missing required fields' });
        }
        
        const cleanPageId = pageId.replace('_html', '');
        const pageDataDir = path.join('output', userId, cleanPageId + '_html_data');
        const leadsFile = path.join(pageDataDir, 'leads.json');
        
        // Ensure directory exists
        await fs.ensureDir(pageDataDir);
        
        // Load existing leads
        let leads = [];
        if (await fs.pathExists(leadsFile)) {
            try {
                const fileContent = await fs.readFile(leadsFile, 'utf8');
                const data = JSON.parse(fileContent);
                leads = Array.isArray(data) ? data : [];
            } catch (error) {
                console.warn('⚠️ Could not parse leads file, starting fresh:', error);
                leads = [];
            }
        }
        
        // Add new lead with ID and timestamp
        const newLead = {
            id: 'lead_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9),
            ...leadData,
            timestamp: leadData.timestamp || new Date().toISOString(),
            status: 'new'
        };
        
        leads.push(newLead);
        
        // Save leads
        await fs.writeFile(leadsFile, JSON.stringify(leads, null, 2));
        
        console.log(`✅ Lead saved successfully. Total leads: ${leads.length}`);
        res.json({ success: true, leadId: newLead.id, total: leads.length });
        
    } catch (error) {
        console.error('❌ Error saving lead:', error);
        res.status(500).json({ error: 'Failed to save lead: ' + error.message });
    }
});

// Fix bot JSON response parsing in all existing pages
app.get('/api/fix-bot-json-parsing', async (req, res) => {
  try {
    console.log('🤖 Starting to fix bot JSON parsing in all pages...');
    const outputDir = 'output';
    
    if (!await fs.pathExists(outputDir)) {
      return res.json({ message: 'No output directory found', fixed: 0 });
    }
    
    let fixedCount = 0;
    const userDirs = await fs.readdir(outputDir);
    
    for (const userId of userDirs) {
      const userDir = path.join(outputDir, userId);
      const stat = await fs.stat(userDir);
      
      if (!stat.isDirectory()) continue;
      
      const files = await fs.readdir(userDir);
      
      for (const file of files) {
        // Only fix HTML files
        if (!file.endsWith('.html') && !file.endsWith('_html')) continue;
        
        const filePath = path.join(userDir, file);
        const fileStats = await fs.stat(filePath);
        
        if (!fileStats.isFile()) continue;
        
        console.log(`🤖 Fixing bot JSON parsing in: ${file}`);
        
        let html = await fs.readFile(filePath, 'utf-8');
        const originalHtml = html;
        
        // Find the bot response parsing code and replace it
        const oldPattern = /if \(data\.message && typeof data\.message === 'string' && data\.message\.startsWith\('\{'\)\) \{[\s\S]*?\}\s*console\.log\('📊 Final parsed data:', data\);/;
        
        const newCode = `if (data.message && typeof data.message === 'string' && data.message.startsWith('{')) {
            try { 
                const parsed = JSON.parse(data.message); 
                data = parsed; 
            } catch (e) { 
                console.warn('message field looks like JSON but failed to parse'); 
            }
        }
        
        // 🔍 CRITICAL FIX: If entire response is a JSON string, parse it
        if (typeof data === 'string' && data.trim().startsWith('{')) {
            try {
                console.log('🔍 Entire response is JSON string, parsing...');
                data = JSON.parse(data);
            } catch (e) {
                console.warn('Failed to parse response as JSON:', e);
            }
        }
        
        // 🔍 Extract "response" field if it exists (n8n sometimes returns {response: "text", pages: []})
        if (data && typeof data === 'object' && data.response && !data.action) {
            console.log('🔍 Extracting response field from data');
            const responseText = data.response;
            const pages = data.pages;
            data = {
                message: responseText,
                pages: pages
            };
        }
        
        console.log('📊 Final parsed data:', data);`;
        
        // Also fix the else block that displays messages without actions
        const oldElsePattern = /\} else \{\s*addBotMessage\(data\.message \|\|[^}]+\}(?!\s*else)/;
        const newElseCode = `} else {
                    // Display the message from the bot - use response field if no message field
                    const messageToShow = data.message || data.response || 'מצטערת, לא הצלחתי להבין. נסה שוב?';
                    console.log('🤖 Displaying bot message (no action):', messageToShow);
                    addBotMessage(messageToShow);
                }`;
        
        let wasFixed = false;
        
        if (oldPattern.test(html)) {
          html = html.replace(oldPattern, newCode);
          wasFixed = true;
        }
        
        // Also fix the else block
        if (oldElsePattern.test(html)) {
          html = html.replace(oldElsePattern, newElseCode);
          wasFixed = true;
        }
        
        if (wasFixed) {
          await fs.writeFile(filePath, html);
          console.log(`✅ Fixed: ${file}`);
          fixedCount++;
        } else {
          console.log(`⏭️ Skipped (pattern not found or already fixed): ${file}`);
        }
      }
    }
    
    console.log(`🎉 Fixed ${fixedCount} pages with new bot JSON parsing`);
    res.json({ 
      success: true, 
      message: `Fixed ${fixedCount} pages with new bot JSON parsing`, 
      fixed: fixedCount 
    });
    
  } catch (error) {
    console.error('Error fixing bot JSON parsing:', error);
    res.status(500).json({ error: 'Failed to fix bot JSON parsing: ' + error.message });
    }
});

// פונקציה ליצירת HTML עבור "מסר בבקבוק"
function generateMessageInBottleHtml(prompt) {
  console.log('🍾 Generating Message in a Bottle HTML');
  
  // חילוץ פרטים מהפרומפט - תמיכה במספר פורמטים
  console.log('🔍 Full prompt content:');
  console.log('='.repeat(50));
  console.log(prompt);
  console.log('='.repeat(50));
  
  // Try multiple patterns for name
  let name = 'תמר';
  const namePatterns = [
    /Project\/Business Name:\s*(.+?)(?:\n|$)/i,
    /שם[:\s]*(.+?)(?:\n|$)/i,
    /name[:\s]*(.+?)(?:\n|$)/i,
    /messageName[:\s]*(.+?)(?:\n|$)/i
  ];
  for (const pattern of namePatterns) {
    const match = prompt.match(pattern);
    if (match && match[1].trim()) {
      name = match[1].trim();
      break;
    }
  }
  
  // Try multiple patterns for request
  let request = 'נקיון בתים';
  const requestPatterns = [
    /Core Message:\s*(.+?)(?:\n|$)/i,
    /בקשה[:\s]*(.+?)(?:\n|$)/i,
    /request[:\s]*(.+?)(?:\n|$)/i,
    /messageRequest[:\s]*(.+?)(?:\n|$)/i,
    /שירות[:\s]*(.+?)(?:\n|$)/i
  ];
  for (const pattern of requestPatterns) {
    const match = prompt.match(pattern);
    if (match && match[1].trim()) {
      request = match[1].trim();
      break;
    }
  }
  
  // Try multiple patterns for area
  let area = 'הרצליה';
  const areaPatterns = [
    /Area:\s*(.+?)(?:\n|$)/i,
    /אזור[:\s]*(.+?)(?:\n|$)/i,
    /area[:\s]*(.+?)(?:\n|$)/i,
    /messageArea[:\s]*(.+?)(?:\n|$)/i
  ];
  for (const pattern of areaPatterns) {
    const match = prompt.match(pattern);
    if (match && match[1].trim()) {
      area = match[1].trim();
      break;
    }
  }
  
  // Try multiple patterns for price
  let price = '100';
  const pricePatterns = [
    /Price:\s*(.+?)(?:\n|$)/i,
    /מחיר[:\s]*(.+?)(?:\n|$)/i,
    /price[:\s]*(.+?)(?:\n|$)/i,
    /messagePrice[:\s]*(.+?)(?:\n|$)/i
  ];
  for (const pattern of pricePatterns) {
    const match = prompt.match(pattern);
    if (match && match[1].trim()) {
      price = match[1].trim().replace(/[^\d]/g, '') || '100';
      break;
    }
  }
  
  // Try multiple patterns for price type
  let priceType = 'שעתי';
  const priceTypePatterns = [
    /Price Type:\s*(.+?)(?:\n|$)/i,
    /סוג מחיר[:\s]*(.+?)(?:\n|$)/i,
    /priceType[:\s]*(.+?)(?:\n|$)/i,
    /messagePriceType[:\s]*(.+?)(?:\n|$)/i
  ];
  for (const pattern of priceTypePatterns) {
    const match = prompt.match(pattern);
    if (match && match[1].trim()) {
      priceType = match[1].trim();
      break;
    }
  }
  
  // Try multiple patterns for phone
  let phone = '';
  const phonePatterns = [
    /Phone:\s*(.+?)(?:\n|$)/i,
    /טלפון[:\s]*(.+?)(?:\n|$)/i,
    /phone[:\s]*(.+?)(?:\n|$)/i,
    /messagePhone[:\s]*(.+?)(?:\n|$)/i
  ];
  for (const pattern of phonePatterns) {
    const match = prompt.match(pattern);
    if (match && match[1].trim()) {
      phone = match[1].trim();
      break;
    }
  }
  
  console.log('🍾 Extracted Message in a Bottle details:', { name, request, area, phone, price, priceType });
  
  // Try to extract from "ACTUAL USER DATA FOR MESSAGE IN BOTTLE" section
  console.log('🔍 Searching for ACTUAL USER DATA section in prompt...');
  console.log('Prompt length:', prompt.length);
  console.log('First 500 chars of prompt:', prompt.substring(0, 500));
  
  const actualDataMatch = prompt.match(/ACTUAL USER DATA FOR MESSAGE IN BOTTLE:([\s\S]+?)(?:\*\*JSON DATA:\*\*|JSON DATA:|$)/i);
  console.log('actualDataMatch found:', !!actualDataMatch);
  if (actualDataMatch) {
    console.log('✅ Found ACTUAL USER DATA section:', actualDataMatch[1]);
    
    const actualDataSection = actualDataMatch[1];
    
    // Extract name - more flexible matching
    const nameMatch = actualDataSection.match(/messageName[:\s]*([^\n\r]+)/i);
    if (nameMatch && nameMatch[1].trim() && nameMatch[1].trim() !== '') {
      name = nameMatch[1].trim();
      console.log('✅ Extracted name:', name);
    }
    
    // Extract request - more flexible matching
    const requestMatch = actualDataSection.match(/messageRequest[:\s]*([^\n\r]+)/i);
    if (requestMatch && requestMatch[1].trim() && requestMatch[1].trim() !== '') {
      request = requestMatch[1].trim();
      console.log('✅ Extracted request:', request);
    }
    
    // Extract area - more flexible matching
    const areaMatch = actualDataSection.match(/messageArea[:\s]*([^\n\r]+)/i);
    if (areaMatch && areaMatch[1].trim() && areaMatch[1].trim() !== '') {
      area = areaMatch[1].trim();
      console.log('✅ Extracted area:', area);
    }
    
    // Extract phone - more flexible matching
    const phoneMatch = actualDataSection.match(/messagePhone[:\s]*([^\n\r]+)/i);
    if (phoneMatch && phoneMatch[1].trim() && phoneMatch[1].trim() !== '') {
      phone = phoneMatch[1].trim();
      console.log('✅ Extracted phone:', phone);
    }
    
    // Extract price - more flexible matching
    const priceMatch = actualDataSection.match(/messagePrice[:\s]*([^\n\r]+)/i);
    if (priceMatch && priceMatch[1].trim() && priceMatch[1].trim() !== '' && priceMatch[1].trim() !== '0') {
      price = priceMatch[1].trim();
      console.log('✅ Extracted price:', price);
    }
    
    // Extract price type - more flexible matching
    const priceTypeMatch = actualDataSection.match(/messagePriceType[:\s]*([^\n\r]+)/i);
    if (priceTypeMatch && priceTypeMatch[1].trim() && priceTypeMatch[1].trim() !== '') {
      priceType = priceTypeMatch[1].trim();
      console.log('✅ Extracted price type:', priceType);
    }
  }
  
  // Also try to extract from JSON section
  try {
    const jsonMatch = prompt.match(/\{[\s\S]*"messageName"[\s\S]*?\}/);
    if (jsonMatch) {
      console.log('🔍 Found JSON section:', jsonMatch[0]);
      const jsonData = JSON.parse(jsonMatch[0]);
      
      // Use JSON data if available and not empty
      if (jsonData.messageName && jsonData.messageName.trim()) {
        name = jsonData.messageName.trim();
        console.log('✅ JSON extracted name:', name);
      }
      if (jsonData.messageRequest && jsonData.messageRequest.trim()) {
        request = jsonData.messageRequest.trim();
        console.log('✅ JSON extracted request:', request);
      }
      if (jsonData.messageArea && jsonData.messageArea.trim()) {
        area = jsonData.messageArea.trim();
        console.log('✅ JSON extracted area:', area);
      }
      if (jsonData.messagePhone && jsonData.messagePhone.trim()) {
        phone = jsonData.messagePhone.trim();
        console.log('✅ JSON extracted phone:', phone);
      }
      if (jsonData.messagePrice && jsonData.messagePrice.trim() && jsonData.messagePrice.trim() !== '0') {
        price = jsonData.messagePrice.trim();
        console.log('✅ JSON extracted price:', price);
      }
      if (jsonData.messagePriceType && jsonData.messagePriceType.trim()) {
        priceType = jsonData.messagePriceType.trim();
        console.log('✅ JSON extracted price type:', priceType);
      }
    }
  } catch (e) {
    console.log('Could not parse JSON from prompt:', e.message);
  }
  
  return `<!DOCTYPE html>
<html lang="he" dir="rtl">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>שלח הודעה</title>
    <script src="https://cdn.tailwindcss.com"></script>
</head>
<body class="bg-gray-50 min-h-screen flex items-center justify-center">
    <!-- Hidden info for bot only - המידע האמיתי של תמר -->
    <div style="display:none !important; visibility:hidden !important; position:absolute !important; left:-9999px !important; opacity:0 !important; height:0 !important; overflow:hidden !important; width:0 !important; margin:0 !important; padding:0 !important; font-size:0 !important; line-height:0 !important;">
        <h1>🍾 מסר בבקבוק</h1>
        <h2>שם: ${name}</h2>
        <p>בקשה/שירות: ${request}</p>
        <p>אזור: ${area}</p>
        <p>מחיר: ₪${price} ${priceType}</p>
        <p>זמין עכשיו! צור קשר עם ${name} עבור ${request} באזור ${area}</p>
        <p>מסר בבקבוק - זמני ודחוף</p>
    </div>
    
    <div class="max-w-md w-full p-8">
        <!-- No display of post details to users - only to bot in hidden section -->
        
        <form id="response-form" class="space-y-4 bg-white p-6 rounded-lg shadow-lg">
            <h3 class="text-lg font-semibold text-gray-900 mb-4 text-center">💬 השאר הודעה</h3>
            
            <div>
                <input type="text" name="name" required placeholder="השם שלך" class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500">
            </div>
            
            <div>
                <input type="tel" name="phone" required placeholder="טלפון ליצירת קשר" class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500">
            </div>
            
            <div>
                <input type="email" name="email" placeholder="אימייל (לא חובה)" class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500">
            </div>
            
            <div>
                <textarea name="message" rows="3" placeholder="הודעה קצרה (לא חובה)" class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"></textarea>
            </div>
            
            <button type="submit" class="w-full bg-blue-600 text-white py-3 px-4 rounded-lg font-semibold hover:bg-blue-700 transition-colors">
                📩 שלח הודעה
            </button>
        </form>
    </div>

    <!-- No management button on the page itself - only in management interface -->

    <script>
        document.addEventListener('DOMContentLoaded', function() {
            // No display or edit on the page - only the form for users
            // Data editing is done in management interface only
            
            const responseForm = document.getElementById('response-form');
            if (responseForm) {
                responseForm.addEventListener('submit', async function(e) {
                    e.preventDefault();
                    
                    const formData = new FormData(this);
                    const data = {
                        userId: 'USER_ID_PLACEHOLDER',
                        pageName: 'PAGE_NAME_PLACEHOLDER',
                        name: formData.get('name'),
                        phone: formData.get('phone'),
                        email: formData.get('email') || '',
                        message: formData.get('message') || ''
                    };
                    
                    if (!data.name || !data.phone) {
                        alert('נא למלא שם וטלפון');
                        return;
                    }
                    
                    try {
                        const response = await fetch('/api/submit-lead', {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify(data)
                        });
                        
                        if (response.ok) {
                            alert('ההודעה נשלחה! 🎉');
                            this.reset();
                        } else {
                            alert('שגיאה בשליחת ההודעה');
                        }
                    } catch (error) {
                        alert('שגיאה בשליחת ההודעה');
                    }
                });
            }
        });
    </script>
</body>
</html>`;
}

// Serve expense files
app.use('/expenses', express.static('output'));

// API endpoint to force update metadata for existing pages
app.post('/api/update-page-metadata/:userId/:fileName', async (req, res) => {
  try {
    const { userId, fileName } = req.params;
    const { pageType } = req.body;
    
    console.log(`🔄 Updating metadata for ${fileName} to pageType: ${pageType}`);
    
    const userDir = path.join('output', userId);
    const fileNameBase = fileName.replace('.html', '').replace(/_html$/, '');
    const metadataPath = path.join(userDir, `${fileNameBase}_data`, 'metadata.json');
    
    // Ensure directory exists
    await fs.ensureDir(path.dirname(metadataPath));
    
    // Create or update metadata
    const metadataContent = {
      pageType: pageType,
      createdAt: new Date().toISOString(),
      fileName: fileNameBase,
      updatedAt: new Date().toISOString(),
      forceUpdated: true
    };
    
    await fs.writeFile(metadataPath, JSON.stringify(metadataContent, null, 2));
    console.log(`✅ Updated metadata for ${fileName}:`, metadataContent);
    
    res.json({ success: true, message: 'Metadata updated successfully' });
  } catch (error) {
    console.error('Error updating metadata:', error);
    res.status(500).json({ error: 'Failed to update metadata: ' + error.message });
  }
});

// N8N Webhook Proxy - to fix CORS issues
const https = require('https');
const N8N_WEBHOOK_URL = 'https://n8n-service-how4.onrender.com/webhook/jhfuhgufkhlkuho8erhf757754jhldkbsjkbmreketpg';

app.post('/api/n8n-webhook', async (req, res) => {
  try {
    const requestData = JSON.stringify(req.body);
    
    const url = new URL(N8N_WEBHOOK_URL);
    const options = {
      hostname: url.hostname,
      port: 443,
      path: url.pathname + url.search,
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(requestData)
      }
    };
    
    const proxyReq = https.request(options, (proxyRes) => {
      let data = '';
      proxyRes.on('data', (chunk) => {
        data += chunk;
      });
      proxyRes.on('end', () => {
        // Set CORS headers
        res.setHeader('Access-Control-Allow-Origin', '*');
        res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
        res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
        
        // Try to parse as JSON, if fails send as text
        try {
          const jsonData = JSON.parse(data);
          res.setHeader('Content-Type', 'application/json');
          res.status(proxyRes.statusCode);
          res.json(jsonData);
        } catch (e) {
          // Not JSON, send as text
          res.setHeader('Content-Type', 'text/plain');
          res.status(proxyRes.statusCode);
          res.send(data);
        }
      });
    });
    
    proxyReq.on('error', (error) => {
      console.error('❌ N8N proxy error:', error);
      res.setHeader('Access-Control-Allow-Origin', '*');
      res.status(500).json({ error: 'Proxy error: ' + error.message });
    });
    
    proxyReq.write(requestData);
    proxyReq.end();
  } catch (error) {
    console.error('❌ N8N proxy error:', error);
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.status(500).json({ error: 'Proxy error: ' + error.message });
  }
});

// Handle OPTIONS for CORS preflight
app.options('/api/n8n-webhook', (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  res.status(200).end();
});

// API endpoint to update all existing pages with descriptions
app.post('/api/update-all-descriptions', async (req, res) => {
  try {
    const outputDir = path.join(__dirname, 'output');
    let updated = 0;
    let skipped = 0;
    let errors = 0;
    
    if (!fs.existsSync(outputDir)) {
      return res.json({ success: true, message: 'No output directory found', updated: 0 });
    }
    
    const userIds = fs.readdirSync(outputDir, { withFileTypes: true })
      .filter(entry => entry.isDirectory() && entry.name !== 'default')
      .map(entry => entry.name);
    
    console.log(`🔄 Starting to update descriptions for ${userIds.length} users...`);
    
    for (const userId of userIds) {
      const userDir = path.join(outputDir, userId);
      if (!fs.existsSync(userDir)) continue;
      
      const files = fs.readdirSync(userDir);
      const htmlFiles = files.filter(f => f.endsWith('_html'));
      
      for (const file of htmlFiles) {
        try {
          const filePath = path.join(userDir, file);
          const fileNameWithoutExt = file.replace('_html', '');
          const metaDir = fileNameWithoutExt + '_html_data';
          const metaPath = path.join(userDir, metaDir, 'metadata.json');
          
          // Read existing metadata or create new
          let metadata = {};
          if (fs.existsSync(metaPath)) {
            metadata = JSON.parse(fs.readFileSync(metaPath, 'utf8'));
          }
          
          // Skip if description already exists
          if (metadata.description && metadata.description.trim() !== '') {
            skipped++;
            continue;
          }
          
          // Extract description from HTML
          const htmlContent = fs.readFileSync(filePath, 'utf8');
          let description = '';
          
          // Try meta description tag
          let descMatch = htmlContent.match(/<meta[^>]*name\s*=\s*["']description["'][^>]*content\s*=\s*["']([^"']+)["'][^>]*>/i) ||
                        htmlContent.match(/<meta[^>]*content\s*=\s*["']([^"']+)["'][^>]*name\s*=\s*["']description["'][^>]*>/i);
          if (descMatch && descMatch[1] && descMatch[1].trim()) {
            description = descMatch[1].trim();
          } else {
            // Try og:description
            descMatch = htmlContent.match(/<meta[^>]*property\s*=\s*["']og:description["'][^>]*content\s*=\s*["']([^"']+)["'][^>]*>/i) ||
                      htmlContent.match(/<meta[^>]*content\s*=\s*["']([^"']+)["'][^>]*property\s*=\s*["']og:description["'][^>]*>/i);
            if (descMatch && descMatch[1] && descMatch[1].trim()) {
              description = descMatch[1].trim();
            } else {
              // Try to extract from paragraph or other sources
              const cleanHtml = htmlContent
                .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, '')
                .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, '');
              
              const pMatches = htmlContent.match(/<p[^>]*>([^<]+)<\/p>/gi);
              if (pMatches && pMatches.length > 0) {
                for (const pMatch of pMatches) {
                  const textMatch = pMatch.match(/>([^<]+)</);
                  if (textMatch && textMatch[1] && textMatch[1].trim().length > 20) {
                    description = textMatch[1].trim().substring(0, 200);
                    break;
                  }
                }
              }
            }
          }
          
          // If still no description, use default based on page type
          if (!description || description.trim() === '') {
            const pageType = metadata.pageType || 'other';
            const typeDescriptions = {
              'store': 'חנות מקוונת עם מגוון מוצרים ושירותים',
              'event': 'אירוע מיוחד עם אפשרות להרשמה והזמנת כרטיסים',
              'course': 'קורס מקצועי עם אפשרות לרישום ותשלום',
              'serviceProvider': 'שירות מקצועי איכותי',
              'messageInBottle': 'מסר בבקבוק - הזמינו שירות ייחודי',
              'other': 'דף נחיתה מקצועי'
            };
            description = typeDescriptions[pageType] || 'דף נחיתה מקצועי';
          }
          
          // Update metadata
          metadata.description = description;
          if (!metadata.pageType) {
            // Try to detect page type if missing
            const lowerHtml = htmlContent.toLowerCase();
            if (lowerHtml.includes('onlineStore') || lowerHtml.includes('product') || lowerHtml.includes('מוצר')) {
              metadata.pageType = 'store';
            } else if (lowerHtml.includes('event') || lowerHtml.includes('אירוע')) {
              metadata.pageType = 'event';
            } else if (lowerHtml.includes('course') || lowerHtml.includes('קורס')) {
              metadata.pageType = 'course';
            } else {
              metadata.pageType = 'other';
            }
          }
          
          // Ensure metadata directory exists
          const metadataDir = path.join(userDir, metaDir);
          await fs.ensureDir(metadataDir);
          
          // Save updated metadata
          await fs.writeFile(metaPath, JSON.stringify(metadata, null, 2));
          updated++;
          
          console.log(`✅ Updated: ${userId}/${file} - Description: ${description.substring(0, 50)}...`);
        } catch (error) {
          errors++;
          console.error(`❌ Error updating ${userId}/${file}:`, error.message);
        }
      }
    }
    
    console.log(`✅ Update complete! Updated: ${updated}, Skipped: ${skipped}, Errors: ${errors}`);
    res.json({ 
      success: true, 
      updated, 
      skipped, 
      errors,
      message: `Updated ${updated} pages, skipped ${skipped} (already had descriptions), ${errors} errors` 
    });
  } catch (error) {
    console.error('Error updating descriptions:', error);
    res.status(500).json({ error: 'Failed to update descriptions', message: error.message });
  }
});

// Update metadata for existing pages (batch or single)
app.post('/api/update-metadata', async (req, res) => {
  try {
    const { userId, pageId, allPages } = req.body;
    let updated = 0;
    let errors = 0;
    
    if (allPages) {
      // Update all pages - iterate through all users
      const outputDir = path.join('output');
      const allDirs = await fs.readdir(outputDir);
      const userDirs = allDirs.filter(d => {
        const dirPath = path.join(outputDir, d);
        try {
          return fs.statSync(dirPath).isDirectory() && 
                 d !== 'default' && 
                 !d.startsWith('temp_') && 
                 d !== 'USER_ID_PLACEHOLDER' &&
                 !d.startsWith('user_');
        } catch {
          return false;
        }
      });
      
      for (const uid of userDirs) {
        const userDirPath = path.join(outputDir, uid);
        const files = await fs.readdir(userDirPath);
        const htmlFiles = files.filter(f => f.endsWith('_html') && !f.endsWith('_html_data'));
        
        for (const fileName of htmlFiles) {
          try {
            const metadataPath = path.join(userDirPath, `${fileName}_data`, 'metadata.json');
            const htmlFilePath = path.join(userDirPath, fileName);
            
            // Skip if metadata already exists and is recent
            if (await fs.pathExists(metadataPath)) {
              const metadata = await fs.readJSON(metadataPath);
              if (metadata.city && metadata.phone && metadata.products && metadata.products.length > 0) {
                continue; // Skip if already has full metadata
              }
            }
            
            // Extract metadata from HTML
            const htmlContent = await fs.readFile(htmlFilePath, 'utf8');
            const contactInfo = extractContactInfoFromHTML(htmlContent);
            const products = extractProductsFromHTML(htmlContent);
            
            // Load existing metadata or create new
            let existingMetadata = {};
            if (await fs.pathExists(metadataPath)) {
              existingMetadata = await fs.readJSON(metadataPath);
            }
            
            // Update metadata
            const updatedMetadata = {
              ...existingMetadata,
              phone: contactInfo.phone || existingMetadata.phone,
              phones: contactInfo.phones || existingMetadata.phones || [],
              email: contactInfo.email || existingMetadata.email,
              city: contactInfo.city || existingMetadata.city,
              address: contactInfo.address || existingMetadata.address,
              products: products.length > 0 ? products : (existingMetadata.products || []),
              metadataUpdated: new Date().toISOString()
            };
            
            // Save updated metadata
            await fs.ensureDir(path.join(userDirPath, `${fileName}_data`));
            await fs.writeFile(metadataPath, JSON.stringify(updatedMetadata, null, 2));
            updated++;
            
            console.log(`✅ Updated metadata for ${uid}/${fileName}`);
          } catch (error) {
            errors++;
            console.error(`❌ Error updating ${uid}/${fileName}:`, error.message);
          }
        }
      }
      
      res.json({ 
        success: true, 
        updated, 
        errors,
        message: `Updated metadata for ${updated} pages, ${errors} errors` 
      });
    } else if (userId && pageId) {
      // Update single page
      const fileName = `${pageId}_html`;
      const userDirPath = path.join('output', userId);
      const htmlFilePath = path.join(userDirPath, fileName);
      const metadataPath = path.join(userDirPath, `${fileName}_data`, 'metadata.json');
      
      if (!await fs.pathExists(htmlFilePath)) {
        return res.status(404).json({ error: 'Page not found' });
      }
      
      // Extract metadata from HTML
      const htmlContent = await fs.readFile(htmlFilePath, 'utf8');
      const contactInfo = extractContactInfoFromHTML(htmlContent);
      const products = extractProductsFromHTML(htmlContent);
      
      // Load existing metadata or create new
      let existingMetadata = {};
      if (await fs.pathExists(metadataPath)) {
        existingMetadata = await fs.readJSON(metadataPath);
      }
      
      // Update metadata
      const updatedMetadata = {
        ...existingMetadata,
        phone: contactInfo.phone || existingMetadata.phone,
        phones: contactInfo.phones || existingMetadata.phones || [],
        email: contactInfo.email || existingMetadata.email,
        city: contactInfo.city || existingMetadata.city,
        address: contactInfo.address || existingMetadata.address,
        products: products.length > 0 ? products : (existingMetadata.products || []),
        metadataUpdated: new Date().toISOString()
      };
      
      // Save updated metadata
      await fs.ensureDir(path.join(userDirPath, `${fileName}_data`));
      await fs.writeFile(metadataPath, JSON.stringify(updatedMetadata, null, 2));
      
      res.json({ 
        success: true, 
        message: 'Metadata updated successfully',
        metadata: updatedMetadata
      });
    } else {
      res.status(400).json({ error: 'Missing userId and pageId, or allPages flag' });
    }
  } catch (error) {
    console.error('Error updating metadata:', error);
    res.status(500).json({ error: 'Failed to update metadata: ' + error.message });
  }
});

// Get Stav status (active/inactive)
app.get('/api/stav/status', (req, res) => {
  try {
    const db = loadDatabase();
    const stavSettings = db.settings?.stav || { active: true, enabled: true };
    res.json({ 
      active: stavSettings.active !== false && stavSettings.enabled !== false,
      enabled: stavSettings.enabled !== false
    });
  } catch (error) {
    console.error('Error getting Stav status:', error);
    // Default to active if error
    res.json({ active: true, enabled: true });
  }
});

// ============================================
// DAY SETTINGS API
// ============================================

// Manage day settings (close day, block slots, reopen)
app.post('/api/day-settings', async (req, res) => {
  try {
    const { userId, pageId, date, action, startTime, endTime } = req.body;
    
    if (!userId || !pageId || !date || !action) {
      return res.status(400).json({ error: 'Missing required fields' });
    }
    
    const settingsDir = path.join('output', userId, `${pageId.replace('.html', '')}_data`);
    const settingsPath = path.join(settingsDir, 'day-settings.json');
    
    // Ensure directory exists
    await fs.ensureDir(settingsDir);
    
    // Load existing settings
    let settings = {};
    if (await fs.pathExists(settingsPath)) {
      settings = await fs.readJSON(settingsPath);
    }
    
    // Handle different actions
    if (action === 'close') {
      // Close entire day
      settings[date] = { closed: true };
      console.log(`✅ Day ${date} closed for ${pageId}`);
      
    } else if (action === 'block') {
      // Block specific time slots
      if (!startTime || !endTime) {
        return res.status(400).json({ error: 'Missing startTime or endTime for block action' });
      }
      
      if (!settings[date]) {
        settings[date] = {};
      }
      
      if (!settings[date].blockedSlots) {
        settings[date].blockedSlots = [];
      }
      
      settings[date].blockedSlots.push({ start: startTime, end: endTime });
      console.log(`✅ Blocked ${startTime}-${endTime} on ${date} for ${pageId}`);
      
    } else if (action === 'reopen') {
      // Reopen day (remove all blocks)
      delete settings[date];
      console.log(`✅ Day ${date} reopened for ${pageId}`);
      
    } else {
      return res.status(400).json({ error: 'Invalid action' });
    }
    
    // Save settings
    await fs.writeJSON(settingsPath, settings, { spaces: 2, encoding: 'utf8' });
    
    res.json({ success: true, message: 'Day settings updated successfully' });
    
  } catch (error) {
    console.error('Error updating day settings:', error);
    res.status(500).json({ error: 'Failed to update day settings' });
  }
});

// Get day settings for a specific page
app.get('/api/day-settings/:userId/:pageId', async (req, res) => {
  try {
    const { userId, pageId } = req.params;
    
    const settingsPath = path.join('output', userId, `${pageId.replace('.html', '')}_data`, 'day-settings.json');
    
    if (await fs.pathExists(settingsPath)) {
      const settings = await fs.readJSON(settingsPath);
      res.json(settings);
    } else {
      res.json({});
    }
    
  } catch (error) {
    console.error('Error loading day settings:', error);
    res.status(500).json({ error: 'Failed to load day settings' });
  }
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
  console.log('AutoPage server is ready!');
});
