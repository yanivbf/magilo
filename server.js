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
  res.setHeader('Content-Security-Policy', "default-src 'self' 'unsafe-inline' 'unsafe-eval' data: blob:; connect-src 'self' https:; img-src 'self' data: blob: https:; script-src 'self' 'unsafe-inline' 'unsafe-eval' https:; style-src 'self' 'unsafe-inline' https:; font-src 'self' https:;");
  next();
});

app.use(express.static('public'));

// Serve index.html at root path
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Serve generated pages from output directory with proper HTML content type
app.use('/pages', (req, res, next) => {
    // Set content type to HTML for .html files
    if (req.path.endsWith('.html') || req.path.includes('html')) {
        res.setHeader('Content-Type', 'text/html; charset=utf-8');
    }
    next();
}, express.static('output'));

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

// Configure multer for image uploads
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    // קבל את ה-userId מהטופס או מהפרמטרים
    const userId = req.body.userId || req.params.userId;
    const pageName = req.body.pageName || 'general';
    console.log('Multer destination - userId:', userId, 'pageName:', pageName);
    
    if (!userId) {
      return cb(new Error('userId is required'), null);
    }
    
    // צור תיקייה ספציפית לדף
    const pageDir = path.join('output', userId, 'images', pageName);
    fs.ensureDirSync(pageDir);
    cb(null, pageDir);
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({ 
  storage: storage,
  limits: {
    fileSize: 50 * 1024 * 1024 // 50MB
  },
  fileFilter: (req, file, cb) => {
    // בדוק אם יש userId
    const userId = req.body.userId;
    if (!userId) {
      return cb(new Error('userId is required'), false);
    }
    cb(null, true);
  }
});

// API Routes

// Create a new page
app.post('/api/create-page', async (req, res) => {
  try {
    const { userId, title, htmlContent, pageData } = req.body;
    
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
      fileName = `${title || 'דף נחיתה'}_${Date.now()}.html`.replace(/[^a-zA-Z0-9\u0590-\u05FF]/g, '_');
    } else if (pageData) {
      // יש נתוני דף - צור HTML
      pageHtml = generatePageHtml(pageData, userId);
      fileName = `${pageData.title || 'דף נחיתה'}.html`.replace(/[^a-zA-Z0-9\u0590-\u05FF]/g, '_');
    } else {
      return res.status(400).json({ error: 'Missing htmlContent or pageData' });
    }
    
    // Auto-detect page type BEFORE saving
    let pageType = 'generic';
    const lowerHtml = pageHtml.toLowerCase();
    
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
    
    // Check for STORE-specific keywords
    const storeKeywords = ['חנות', 'store', 'shop', 'מכירה', 'sale', 'מבצע'];
    const hasStoreKeywords = storeKeywords.some(keyword => lowerHtml.includes(keyword.toLowerCase()));
    
    // Check template selection from request
    const selectedTemplate = req.body.selectedPageType;
    console.log('📋 Selected template:', selectedTemplate);
    
    // Priority: Template selection > Event keywords > Store keywords > Generic
    if (selectedTemplate === 'event') {
      pageType = 'event';
      console.log(`🎯 DETECTED from TEMPLATE: event (100% RELIABLE ✅)`);
    } else if (selectedTemplate === 'onlineStore') {
      pageType = 'store';
      console.log(`🎯 DETECTED from TEMPLATE: store (100% RELIABLE ✅)`);
    } else if (hasEventKeywords) {
      pageType = 'event';
      console.log(`✅ Detected EVENT page from keywords${hasPurchaseKeywords ? ' (with gifts/purchases)' : ''}`);
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
    
    // If it has purchase capability OR it's a store, inject checkout scripts
    if (hasPurchaseKeywords || pageType === 'store') {
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
      
      console.log('🛒 Page has purchase capability - cart & checkout available');
    }
    
    // Save HTML file
    const filePath = path.join(userDir, fileName);
    await fs.writeFile(filePath, pageHtml);
    
    // Create data folder for the page
    const fileNameWithoutExt = fileName.replace('.html', '');
    const dataDir = path.join(userDir, fileNameWithoutExt + '_data');
    await fs.ensureDir(dataDir);
    
    // Save metadata
    const metadataFile = path.join(dataDir, 'metadata.json');
    await fs.writeFile(metadataFile, JSON.stringify({
      pageType,
      createdAt: new Date().toISOString(),
      fileName: fileNameWithoutExt
    }, null, 2));
    
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
app.post('/api/upload-image', upload.single('image'), (req, res) => {
  try {
    console.log('Upload request received:', {
      userId: req.body.userId,
      hasFile: !!req.file,
      fileSize: req.file?.size,
      body: req.body
    });

    if (!req.file) {
      console.error('No file provided');
      return res.status(400).json({ error: 'No image file provided' });
    }

    const userId = req.body.userId;
    if (!userId) {
      console.error('No userId provided');
      return res.status(400).json({ error: 'No userId provided' });
    }
    console.log('Using userId:', userId);

    const imageUrl = `/pages/${userId}/images/${req.file.filename}`;
    
    console.log('Image uploaded successfully:', {
      filename: req.file.filename,
      imageUrl: imageUrl,
      path: req.file.path
    });

    res.json({ 
      success: true, 
      imageUrl,
      filename: req.file.filename 
    });

  } catch (error) {
    console.error('Error uploading image:', error);
    res.status(500).json({ error: 'Failed to upload image: ' + error.message });
  }
});

// Save page content
app.post('/api/save-page', async (req, res) => {
  try {
    const { userId, fileName, content } = req.body;
    
    if (!userId || !fileName || !content) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    const filePath = path.join('output', userId, fileName);
    await fs.writeFile(filePath, content);

    res.json({ success: true, message: 'Page saved successfully' });

  } catch (error) {
    console.error('Error saving page:', error);
    res.status(500).json({ error: 'Failed to save page' });
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
      // Check if it's a file (ends with _html) and not a directory (_html_data)
      return file.endsWith('_html') && !file.includes('_data');
    });
    console.log('HTML files found:', htmlFiles);
    
    const pages = htmlFiles.map(file => {
      // נקה את שם הקובץ להצגה
      let cleanTitle = file.replace('.html', '').replace(/_/g, ' ').replace(/^_+/, '');
      
      // אם השם ריק או מכיל רק מספרים, השתמש בשם ברירת מחדל
      if (!cleanTitle || cleanTitle.trim() === '' || /^\d+$/.test(cleanTitle.trim())) {
        cleanTitle = 'דף נחיתה';
      }
      
      return {
        fileName: file,
        title: cleanTitle,
        url: `/pages/${userId}/${encodeURIComponent(file)}`
      };
    });

    console.log('Returning pages:', pages);
    res.json({ pages });

  } catch (error) {
    console.error('Error getting pages:', error);
    res.status(500).json({ error: 'Failed to get pages: ' + error.message });
  }
});

// Update page endpoint
app.put('/api/update-page', async (req, res) => {
  try {
    const { userId, fileName, htmlContent } = req.body;
    
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
    const filePath = path.join(userDir, fileName);
    
    console.log('Deleting file:', filePath);
    
    // בדוק אם הקובץ קיים
    if (!await fs.pathExists(filePath)) {
      return res.status(404).json({ error: 'File not found' });
    }
    
    // מחק את הקובץ
    await fs.remove(filePath);
    
    // מחק את תיקיית התמונות הספציפית לדף הזה
    const pageName = fileName.replace('.html', '');
    const pageImagesDir = path.join(userDir, 'images', pageName);
    
    if (await fs.pathExists(pageImagesDir)) {
      console.log('Deleting page-specific images directory:', pageImagesDir);
      await fs.remove(pageImagesDir);
      console.log('Deleted page images directory:', pageImagesDir);
    }
    
    // מחק גם תמונות כלליות אם הן קיימות
    const generalImagesDir = path.join(userDir, 'images');
    if (await fs.pathExists(generalImagesDir)) {
      const imageFiles = await fs.readdir(generalImagesDir);
      console.log('Found general images to delete:', imageFiles);
      
      // מחק את כל התמונות הכלליות
      for (const imageFile of imageFiles) {
        const imagePath = path.join(generalImagesDir, imageFile);
        await fs.remove(imagePath);
        console.log('Deleted general image:', imagePath);
      }
      
      // אם התיקייה ריקה, מחק אותה
      try {
        const remainingFiles = await fs.readdir(generalImagesDir);
        if (remainingFiles.length === 0) {
          await fs.remove(generalImagesDir);
          console.log('Deleted empty general images directory:', generalImagesDir);
        }
      } catch (err) {
        // התיקייה כבר נמחקה או אין גישה אליה
        console.log('General images directory already deleted or inaccessible');
      }
    }
    
    console.log('File deleted successfully:', fileName);
    res.json({ success: true, message: 'File deleted successfully' });

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
      
      entries.forEach(entry => {
        if (entry.isDirectory() && entry.name !== 'default') { // התעלם מתיקיית default
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
          } else {
            userEmail = `${userId}@example.com`;
            userName = `משתמש ${userId.substring(0, 8)}`;
          }
          
          users.push({
            id: userId,
            email: userEmail,
            full_name: userName,
            created_at: new Date().toISOString(),
            subscription_status: totalPages > 0 ? 'active' : 'inactive',
            totalPages: totalPages,
            activeSubscriptions: totalPages, // כל דף פעיל
            totalRevenue: totalPages * 39, // ₪39 לכל דף
            isAdmin: isAdmin
          });
        }
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
      const userIds = fs.readdirSync(outputDir, { withFileTypes: true })
        .filter(entry => entry.isDirectory() && entry.name !== 'default')
        .map(entry => entry.name);
      
      console.log('User IDs found:', userIds);
      
      for (const userId of userIds) {
        const userDir = path.join(outputDir, userId);
          if (fs.existsSync(userDir)) {
            const files = fs.readdirSync(userDir);
            const htmlFiles = files.filter(file => file.endsWith('_html')); // קבצים שמסתיימים ב-_html
            
            console.log(`User ${userId}: ${htmlFiles.length} HTML files`);
            console.log(`Files found:`, files);
            
            htmlFiles.forEach(file => {
              const filePath = path.join(userDir, file);
              const stats = fs.statSync(filePath);
              
              allPages.push({
                fileName: file,
                title: file.replace('_html', '').replace(/_/g, ' ').trim(),
                userId: userId,
                created_at: stats.birthtime.toISOString(),
                url: `/output/${userId}/${file}`
              });
            });
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

// Save RSVP
app.post('/api/rsvp', async (req, res) => {
    try {
        const db = loadDatabase();
        const { eventId, userId, name, phone, email, guests, status, message } = req.body;
        
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
        
        // Save to event-specific data folder
        if (userId && eventId) {
            const cleanEventId = eventId.replace(/_html$/, '');
            const eventDataDir = path.join('output', userId, cleanEventId + '_data');
            const rsvpsFile = path.join(eventDataDir, 'rsvps.json');
            
            await fs.ensureDir(eventDataDir);
            
            let rsvps = [];
            if (await fs.pathExists(rsvpsFile)) {
                const fileContent = await fs.readFile(rsvpsFile, 'utf8');
                rsvps = JSON.parse(fileContent);
            }
            
            rsvps.push(rsvp);
            await fs.writeFile(rsvpsFile, JSON.stringify(rsvps, null, 2));
            console.log('✅ RSVP saved to event folder');
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

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
  console.log('AutoPage server is ready!');
});
