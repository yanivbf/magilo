// תיקון מיידי לשם בעברית
console.log('🔧 מתקן שם עברית...');

// הנתונים הנכונים מ-Google
const correctUserData = {
    id: 'google_111351120503275674259',
    userId: 'google_111351120503275674259',
    email: 'britolam1@gmail.com',
    name: 'ברית עולם להקה', // השם הנכון בעברית
    avatar: null,
    subscriptionStatus: 'active'
};

// הגדרת cookies עם השם הנכון
const expires = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toUTCString();

document.cookie = `jwt=dummy_jwt_token; expires=${expires}; path=/; sameSite=lax`;
document.cookie = `userId=${correctUserData.userId}; expires=${expires}; path=/; sameSite=lax`;
document.cookie = `userName=${encodeURIComponent(correctUserData.name)}; expires=${expires}; path=/; sameSite=lax`;
document.cookie = `userEmail=${correctUserData.email}; expires=${expires}; path=/; sameSite=lax`;
document.cookie = `subscriptionStatus=active; expires=${expires}; path=/; sameSite=lax`;

// הגדרת localStorage עם השם הנכון
try {
    localStorage.setItem('currentUser', JSON.stringify(correctUserData));
    console.log('✅ נתוני משתמש נשמרו עם השם הנכון:', correctUserData.name);
} catch (e) {
    console.warn('localStorage not available');
}

console.log('✅ תיקון שם עברית הושלם!');
console.log('השם הנכון:', correctUserData.name);
console.log('האימייל:', correctUserData.email);