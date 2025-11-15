// 🤖 סתיו בוט - גרסה פשוטה שעובדת!
// כל ההודעות עוברות ל-N8N שמחליט מה לעשות

let lastSentUserMessage = '';
let lastSentUserMessageTime = 0;
let lastInputWasVoice = false;

// פונקציה פשוטה לשליחת הודעה
async function sendStavMessageSimple() {
    const input = document.getElementById('stavChatInput');
    const userMessage = input.value.trim();
    
    if (!userMessage) return;
    
    // מנע הודעות כפולות
    const now = Date.now();
    if (userMessage === lastSentUserMessage && (now - lastSentUserMessageTime) < 10000) {
        console.log('⚠️ Ignoring duplicate:', userMessage);
        return;
    }
    
    lastSentUserMessage = userMessage;
    lastSentUserMessageTime = now;
    
    // שמור אם זה היה קול
    const wasVoice = lastInputWasVoice;
    
    // הצג הודעת משתמש
    addStavMessage(userMessage, true);
    input.value = '';
    
    // הצג "סתיו מקלידה..."
    const typingDiv = document.createElement('div');
    typingDiv.className = 'stav-message bot stav-typing-indicator';
    typingDiv.id = 'stav-typing-indicator';
    typingDiv.innerHTML = `
        <div class="stav-loader">
            <div class="inner one"></div>
            <div class="inner two"></div>
            <div class="inner three"></div>
        </div>
        <span>סתיו מקלידה...</span>
    `;
    const messagesDiv = document.getElementById('stavChatMessages');
    messagesDiv.appendChild(typingDiv);
    messagesDiv.scrollTop = messagesDiv.scrollHeight;
    
    try {
        // 1. קבל את כל הדפים
        console.log('📊 Fetching all pages...');
        const pagesResponse = await fetch('/api/pages/all');
        if (!pagesResponse.ok) {
            throw new Error('Failed to fetch pages');
        }
        const pagesData = await pagesResponse.json();
        const allPages = pagesData.pages || [];
        
        console.log(`✅ Got ${allPages.length} pages`);
        
        // 2. שלח הכל ל-N8N
        console.log('📤 Sending to N8N:', userMessage);
        
        const n8nResponse = await fetch('/api/n8n-webhook', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                message: userMessage,
                context: 'stav-marketplace',
                allPages: allPages.map(p => ({
                    title: p.title,
                    description: p.description,
                    pageType: p.pageType,
                    category: p.category,
                    city: p.city,
                    phone: p.phone,
                    premium: p.premium,
                    pageId: p.pageId,
                    userId: p.userId
                }))
            })
        });
        
        // הסר "מקלידה..."
        const typingIndicator = document.getElementById('stav-typing-indicator');
        if (typingIndicator) typingIndicator.remove();
        
        if (!n8nResponse.ok) {
            throw new Error('N8N returned error');
        }
        
        const n8nData = await n8nResponse.json();
        console.log('✅ N8N response:', n8nData);
        
        // 3. הצג את התשובה
        let botMessage = '';
        
        // אם N8N החזיר רשימת דפים
        if (n8nData.pages && Array.isArray(n8nData.pages) && n8nData.pages.length > 0) {
            console.log(`📋 N8N returned ${n8nData.pages.length} pages`);
            
            // בנה הודעה עם הדפים
            botMessage = n8nData.message || `מצאתי ${n8nData.pages.length} אפשרויות:\n\n`;
            
            n8nData.pages.slice(0, 5).forEach((page, idx) => {
                botMessage += `${idx + 1}. **${page.title}**`;
                if (page.description) {
                    botMessage += ` - ${page.description}`;
                }
                if (page.city) {
                    botMessage += `\n   📍 ${page.city}`;
                }
                if (page.phone) {
                    botMessage += ` • 📞 ${page.phone}`;
                }
                botMessage += `\n\n`;
            });
            
            // שמור את הדפים בהקשר
            window.stavCurrentPages = n8nData.pages;
        } 
        // אם N8N החזיר רק טקסט
        else if (n8nData.message || n8nData.response) {
            botMessage = n8nData.message || n8nData.response;
        }
        // fallback
        else {
            botMessage = 'מצטערת, לא הבנתי. תוכל לנסח את זה אחרת?';
        }
        
        // הצג את ההודעה
        addStavMessage(botMessage, false);
        
        // אם זה היה קול - דבר
        if (wasVoice && botMessage) {
            speakText(botMessage);
        }
        
        lastInputWasVoice = false;
        
    } catch (error) {
        console.error('❌ Error:', error);
        
        // הסר "מקלידה..."
        const typingIndicator = document.getElementById('stav-typing-indicator');
        if (typingIndicator) typingIndicator.remove();
        
        // הצג שגיאה
        addStavMessage('אופס, משהו השתבש. נסה שוב.', false);
    }
}

// הפונקציה הזו מדברת (TTS)
function speakText(text) {
    // כאן תהיה הלוגיקה של Google TTS שכבר קיימת
    console.log('🔊 Speaking:', text);
    // TODO: קרא לפונקציה הקיימת של TTS
}

// הפונקציה הזו מוסיפה הודעה לצ'אט
function addStavMessage(message, isUser) {
    const messagesDiv = document.getElementById('stavChatMessages');
    const messageDiv = document.createElement('div');
    messageDiv.className = `stav-message ${isUser ? 'user' : 'bot'}`;
    messageDiv.textContent = message;
    messagesDiv.appendChild(messageDiv);
    messagesDiv.scrollTop = messagesDiv.scrollHeight;
}












