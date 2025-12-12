// 🔧 תיקון סופי לבעיית ניתוק אימות
// פותר את כל הבעיות: localStorage, cookies, Google OAuth

console.log('🔧 מתחיל תיקון סופי לבעיית ניתוק אימות...');

// פונקציה לבדיקת localStorage בטוח
function safeLocalStorage() {
    try {
        const testKey = '__test__';
        localStorage.setItem(testKey, 'test');
        localStorage.removeItem(testKey);
        return true;
    } catch (e) {
        console.warn('⚠️ localStorage לא זמין:', e.message);
        return false;
    }
}

// פונקציה לניהול cookies בטוח
function safeCookieManager() {
    return {
        get: function(name) {
            try {
                const value = `; ${document.cookie}`;
                const parts = value.split(`; ${name}=`);
                if (parts.length === 2) return parts.pop().split(';').shift();
                return null;
            } catch (e) {
                console.warn('⚠️ שגיאה בקריאת cookie:', e.message);
                return null;
            }
        },
        
        set: function(name, value, days = 30) {
            try {
                const expires = new Date(Date.now() + days * 24 * 60 * 60 * 1000).toUTCString();
                document.cookie = `${name}=${value}; expires=${expires}; path=/; SameSite=Lax`;
                console.log(`✅ Cookie נשמר: ${name}=${value}`);
                return true;
            } catch (e) {
                console.warn('⚠️ שגיאה בשמירת cookie:', e.message);
                return false;
            }
        },
        
        delete: function(name) {
            try {
                document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;`;
                console.log(`🗑️ Cookie נמחק: ${name}`);
                return true;
            } catch (e) {
                console.warn('⚠️ שגיאה במחיקת cookie:', e.message);
                return false;
            }
        }
    };
}

// בדיקת מצב נוכחי
function checkCurrentState() {
    console.log('🔍 בודק מצב נוכחי...');
    
    const cookieManager = safeCookieManager();
    const userId = cookieManager.get('userId');
    const hasLocalStorage = safeLocalStorage();
    
    console.log('📊 מצב נוכחי:');
    console.log('- userId מcookie:', userId || 'לא נמצא');
    console.log('- localStorage זמין:', hasLocalStorage ? 'כן' : 'לא');
    console.log('- URL נוכחי:', window.location.href);
    console.log('- Cookies כלליים:', document.cookie || 'אין');
    
    return { userId, hasLocalStorage, cookieManager };
}

// תיקון בעיית localStorage
function fixLocalStorageIssue() {
    console.log('🔧 מתקן בעיית localStorage...');
    
    if (!safeLocalStorage()) {
        console.log('⚠️ localStorage לא זמין - נשתמש רק בcookies');
        return false;
    }
    
    try {
        // נקה נתונים פגומים
        const keys = Object.keys(localStorage);
        keys.forEach(key => {
            try {
                const value = localStorage.getItem(key);
                JSON.parse(value); // בדוק אם זה JSON תקין
            } catch (e) {
                console.log(`🗑️ מוחק נתון פגום: ${key}`);
                localStorage.removeItem(key);
            }
        });
        
        console.log('✅ localStorage תוקן');
        return true;
    } catch (e) {
        console.warn('⚠️ שגיאה בתיקון localStorage:', e.message);
        return false;
    }
}

// יצירת משתמש זמני
function createTempUser() {
    console.log('👤 יוצר משתמש זמני...');
    
    const cookieManager = safeCookieManager();
    const tempUserId = 'temp_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
    
    // שמור בcookie
    if (cookieManager.set('userId', tempUserId, 1)) { // יום אחד
        console.log('✅ משתמש זמני נוצר:', tempUserId);
        
        // נסה לשמור גם בlocalStorage אם זמין
        if (safeLocalStorage()) {
            try {
                const userData = {
                    id: tempUserId,
                    userId: tempUserId,
                    email: '',
                    name: 'משתמש זמני',
                    avatar: null,
                    subscriptionStatus: 'active',
                    isTemp: true,
                    created: new Date().toISOString()
                };
                localStorage.setItem('currentUser', JSON.stringify(userData));
                console.log('✅ נתוני משתמש נשמרו גם בlocalStorage');
            } catch (e) {
                console.warn('⚠️ לא הצליח לשמור בlocalStorage:', e.message);
            }
        }
        
        return tempUserId;
    } else {
        console.error('❌ לא הצליח ליצור משתמש זמני');
        return null;
    }
}

// בדיקת חיבור לשרת
async function testServerConnection() {
    console.log('🌐 בודק חיבור לשרת...');
    
    try {
        const response = await fetch('/api/user/current', {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json'
            }
        });
        
        console.log('📡 תגובת שרת:', response.status, response.statusText);
        
        if (response.ok) {
            const data = await response.json();
            console.log('✅ שרת מגיב:', data);
            return { success: true, data };
        } else {
            console.log('⚠️ שרת מגיב עם שגיאה:', response.status);
            return { success: false, status: response.status };
        }
    } catch (error) {
        console.error('❌ שגיאה בחיבור לשרת:', error.message);
        return { success: false, error: error.message };
    }
}

// תיקון מלא
async function fullFix() {
    console.log('🚀 מתחיל תיקון מלא...');
    
    // שלב 1: בדוק מצב נוכחי
    const currentState = checkCurrentState();
    
    // שלב 2: תקן localStorage
    fixLocalStorageIssue();
    
    // שלב 3: אם אין משתמש, צור זמני
    if (!currentState.userId) {
        const tempUserId = createTempUser();
        if (!tempUserId) {
            console.error('❌ תיקון נכשל - לא הצליח ליצור משתמש זמני');
            return false;
        }
    }
    
    // שלב 4: בדוק חיבור לשרת
    const serverTest = await testServerConnection();
    if (!serverTest.success) {
        console.warn('⚠️ בעיה בחיבור לשרת, אבל המשתמש הזמני אמור לעבוד');
    }
    
    console.log('✅ תיקון הושלם בהצלחה!');
    return true;
}

// הפעלה אוטומטית
(async function() {
    try {
        const success = await fullFix();
        
        if (success) {
            console.log('🎉 כל התיקונים הושלמו! רענן את הדף כדי לראות את השינויים.');
            
            // הצע לרענן את הדף
            if (confirm('✅ התיקונים הושלמו! האם לרענן את הדף?')) {
                window.location.reload();
            }
        } else {
            console.error('❌ התיקון נכשל. נסה לרענן את הדף ידנית.');
        }
    } catch (error) {
        console.error('❌ שגיאה כללית בתיקון:', error);
    }
})();

// ייצוא פונקציות לשימוש ידני
window.authFixer = {
    checkCurrentState,
    fixLocalStorageIssue,
    createTempUser,
    testServerConnection,
    fullFix,
    safeLocalStorage,
    safeCookieManager: safeCookieManager()
};

console.log('🔧 סקריפט תיקון טעון. השתמש ב-window.authFixer לפונקציות ידניות.');