const express = require('express');
const cors = require('cors');
const path = require('path');
const fs = require('fs-extra');
const multer = require('multer');

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));
app.use(express.static('public'));

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
    
    // Save HTML file
    const filePath = path.join(userDir, fileName);
    await fs.writeFile(filePath, pageHtml);

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
    
    const htmlFiles = files.filter(file => file.endsWith('.html') || file.includes('html'));
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

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
  console.log('AutoPage server is ready!');
});
