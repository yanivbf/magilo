// תיקון מהיר לבעיית userId בדשבורד
// הרץ את זה בקונסול או כקובץ JavaScript

console.log('🔧 מתחיל תיקון מהיר לבעיית userId...');

const MAIN_USER_ID = 'google_111351120503275674259';

// פונקציה להגדרת Cookie
function setCookie(name, value, days = 30) {
    const expires = new Date(Date.now() + days * 24 * 60 * 60 * 1000).toUTCString();
    document.cookie = `${name}=${value}; expires=${expires}; path=/; SameSite=Lax`;
    console.log(`✅ Cookie נוצר: ${name}=${value}`);
}

// פונקציה לקריאת Cookie
function getCookie(name) {
    const value = `; ${document.cookie}`;
    const parts = value.split(`; ${name}=`);
    if (parts.length === 2) return parts.pop().split(';').shift();
    return null;
}

// 1. בדיקת מצב נוכחי
console.log('📊 מצב נוכחי:');
console.log('  userId cookie:', getCookie('userId'));
console.log('  subscriptionStatus cookie:', getCookie('subscriptionStatus'));

// 2. הגדרת Cookies הנכונים
console.log('🔧 מגדיר Cookies...');
setCookie('userId', MAIN_USER_ID, 30);
setCookie('subscriptionStatus', 'active', 30);
setCookie('subscriptionExpiry', new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(), 30);

// 3. הגדרת localStorage
console.log('💾 מגדיר localStorage...');
try {
    const userData = {
        id: MAIN_USER_ID,
        userId: MAIN_USER_ID,
        email: '',
        name: 'משתמש רשום',
        avatar: null,
        subscriptionStatus: 'active'
    };
    localStorage.setItem('currentUser', JSON.stringify(userData));
    console.log('✅ localStorage הוגדר בהצלחה');
} catch (e) {
    console.warn('⚠️ localStorage לא זמין:', e.message);
}

// 4. בדיקה שהתיקון עבד
console.log('🔍 בודק שהתיקון עבד...');
const newUserId = getCookie('userId');
const newSubscriptionStatus = getCookie('subscriptionStatus');

console.log('📊 מצב אחרי התיקון:');
console.log('  userId cookie:', newUserId);
console.log('  subscriptionStatus cookie:', newSubscriptionStatus);

if (newUserId === MAIN_USER_ID) {
    console.log('✅ התיקון הצליח!');
    console.log('🔄 מרענן את הדף בעוד 2 שניות...');
    
    setTimeout(() => {
        // נווט לדשבורד עם userId בURL כדי לוודא שהשרת יקבל אותו
        window.location.href = `/dashboard?userId=${MAIN_USER_ID}`;
    }, 2000);
} else {
    console.error('❌ התיקון נכשל - Cookie לא הוגדר נכון');
    console.log('🔄 מנסה שוב...');
    
    // ניסיון נוסף
    document.cookie = `userId=${MAIN_USER_ID}; path=/; max-age=${30 * 24 * 60 * 60}; SameSite=Lax`;
    document.cookie = `subscriptionStatus=active; path=/; max-age=${30 * 24 * 60 * 60}; SameSite=Lax`;
    
    setTimeout(() => {
        window.location.href = `/dashboard?userId=${MAIN_USER_ID}`;
    }, 1000);
}

console.log('🎯 תיקון הושלם!');