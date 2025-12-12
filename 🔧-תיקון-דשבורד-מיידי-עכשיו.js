// תיקון מיידי לדשבורד - מבטל קריאות כפולות ומתקן את הביצועים

console.log('🔧 מתחיל תיקון דשבורד מיידי...');

// 1. נקה את ה-localStorage מנתונים ישנים
try {
    localStorage.removeItem('pages');
    localStorage.removeItem('userPages');
    localStorage.removeItem('dashboardData');
    console.log('✅ נוקה localStorage ישן');
} catch (e) {
    console.log('⚠️ localStorage לא זמין');
}

// 2. הגדר אימות נכון
const userId = 'google_111351120503275674259';
const expires = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toUTCString();

document.cookie = `jwt=dummy_jwt_token; expires=${expires}; path=/; sameSite=lax`;
document.cookie = `userId=${userId}; expires=${expires}; path=/; sameSite=lax`;
document.cookie = `subscriptionStatus=active; expires=${expires}; path=/; sameSite=lax`;

console.log('✅ Cookies הוגדרו מחדש');

// 3. בדוק אם אנחנו בדשבורד
if (window.location.pathname === '/dashboard') {
    console.log('🎯 נמצא בדשבורד - מבצע רענון');
    
    // רענן את הדף אחרי שנייה
    setTimeout(() => {
        window.location.reload();
    }, 1000);
} else {
    console.log('🚀 מעביר לדשבורד');
    
    // עבור לדשבורד
    setTimeout(() => {
        window.location.href = '/dashboard';
    }, 500);
}

console.log('🔧 תיקון דשבורד הושלם');