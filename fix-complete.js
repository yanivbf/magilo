const fs = require('fs');

const filePath = 'public/index.html';
let content = fs.readFileSync(filePath, 'utf8');

// מילון מלא של תיקונים
const fixes = [
    // תיאורים - החלף "דף נחמד" בתיאורים
    { pattern: /description: 'דף נחמד ׳׳§׳¦׳•׳¢׳™'/g, replacement: "description: 'דף נחיתה מקצועי'" },
    { pattern: /\|\| 'דף נחמד ׳׳§׳¦׳•׳¢׳™'/g, replacement: "|| 'דף נחיתה מקצועי'" },
    
    // קרוסלת תמונות
    { pattern: /'דף נחמד ׳׳¢׳¡׳§'/g, replacement: "'דף נחיתה עסקי'" },
    { pattern: /'׳×׳₪׳¨׳™׳˜ ׳׳׳¡׳¢׳"׳"'/g, replacement: "'אתר מסחרי'" },
    { pattern: /'׳§׳˜׳׳•׳' ׳׳•׳¦׳¨׳™׳'/g, replacement: "'קטלוג מוצרים'" },
    { pattern: /'׳₪׳•׳¡׳˜ ׳©׳™׳•׳•׳§׳™'/g, replacement: "'פורטל שיווקי'" },
    { pattern: /'׳›׳¨׳˜׳™׳¡ ׳'׳™׳§׳•׳¨ ׳"׳™׳'׳™׳˜׳׳™'/g, replacement: "'כרטיס ביקור דיגיטלי'" },
    
    // דשבורד - כרטיסיות
    { pattern: /׳׳©׳×׳׳©׳™׳ ׳'׳׳¢׳¨׳›׳×/g, replacement: 'משתמשים במערכת' },
    { pattern: /׳"׳₪׳™׳ ׳₪׳¢׳™׳׳™׳(?!׳)/g, replacement: 'דפים פעילים' },
    { pattern: /׳"׳₪׳™׳ ׳׳ ׳₪׳¢׳™׳׳™׳/g, replacement: 'דפים לא פעילים' },
    { pattern: /׳"׳›׳ ׳¡׳•׳× חודשי׳•׳×/g, replacement: 'הכנסות חודשיות' },
    { pattern: /׳"׳›׳ ׳¡׳•׳× ׳"׳©׳'׳•׳¢/g, replacement: 'הכנסות השבוע' },
    
    // כותרות סקשנים
    { pattern: /׳₪׳¢׳™׳׳•׳× ׳׳—׳¨׳•׳ ׳"/g, replacement: 'פעילות אחרונה' },
    { pattern: /סטטיסטיקות ׳׳"׳™׳¨׳•׳×/g, replacement: 'סטטיסטיקות אחרונות' },
    { pattern: /׳׳©׳×׳׳©׳™׳ ׳—׳"׳©׳™׳ ׳"׳©׳'׳•׳¢/g, replacement: 'משתמשים חדשים השבוע' },
    { pattern: /׳"׳₪׳™׳ ׳©׳ ׳•׳¦׳¨׳• ׳"׳©׳'׳•׳¢/g, replacement: 'דפים שנוצרו השבוע' },
    
    // סטטוס badges
    { pattern: /'׳₪׳¢׳™׳'/g, replacement: "'פעיל'" },
    { pattern: /'׳׳ ׳₪׳¢׳™׳'/g, replacement: "'לא פעיל'" },
    
    // טעינה
    { pattern: /׳˜׳•׳¢׳ ׳"׳₪׳™׳/g, replacement: 'טוען דפים' },
    { pattern: /׳˜׳•׳¢׳/g, replacement: 'טוען' },
    { pattern: /׳׳—׳'׳¨/g, replacement: 'מחבר' },
    
    // הודעות
    { pattern: /התחבר׳× ׳'׳"׳¦׳׳—׳"/g, replacement: 'התחברנו בהצלחה' },
    
    // טפסים ושדות
    { pattern: />׳©׳</g, replacement: '>שם<' },
    { pattern: />׳׳™׳׳™׳™׳</g, replacement: '>אימייל<' },
    { pattern: />׳¡׳™׳¡׳׳"</g, replacement: '>סיסמה<' },
    { pattern: />׳׳—׳™׳¨</g, replacement: '>מחיר<' },
    { pattern: />׳׳–׳•׳¨</g, replacement: '>אזור<' },
    { pattern: />׳¡׳•׳'</g, replacement: '>סוג<' },
    
    // ניהול
    { pattern: /׳ ׳™׳"׳•׳ ׳׳©׳×׳׳©׳™׳/g, replacement: 'ניהול משתמשים' },
    { pattern: /׳"׳™׳¡׳˜׳•׳¨׳™׳™׳× ׳×׳©׳׳•׳׳™׳/g, replacement: 'היסטוריית תשלומים' },
    { pattern: /׳¡׳˜׳˜׳•׳¡ ׳"׳₪׳™׳/g, replacement: 'סטטוס דפים' },
    { pattern: /סטטיסטיקות ׳׳©׳×׳׳©׳™׳/g, replacement: 'סטטיסטיקות משתמשים' },
    { pattern: /הגדרות ׳׳¢׳¨׳›׳×/g, replacement: 'הגדרות מערכת' },
    { pattern: /׳©׳ ׳"׳׳¢׳¨׳›׳×/g, replacement: 'שם המערכת' },
    { pattern: /׳׳™׳׳™׳™׳ ׳׳ ׳"׳/g, replacement: 'אימייל ליצירת קשר' },
    { pattern: /הגדרות ׳׳'׳˜׳—׳"/g, replacement: 'הגדרות מתקדמות' },
    { pattern: /׳ ׳™׳§׳•׳™ ׳ ׳×׳•׳ ׳™׳/g, replacement: 'ניקוי נתונים' },
    
    // הערות בקוד
    { pattern: /׳ ׳˜׳¢׳ ׳'׳ ׳₪׳¨׳"/g, replacement: 'לא נטען בפירוש' },
    { pattern: /׳ ׳§׳" ׳׳× ׳©׳ ׳"׳"׳£/g, replacement: 'נקה את שם הדף' },
    { pattern: /׳"׳׳¨ ׳"׳₪׳™׳ ׳׳§׳•׳׳™׳™׳ ׳׳₪׳•׳¨׳׳˜/g, replacement: 'המר דפים מקומיים לפורמט' },
    { pattern: /׳—׳׳¥ ׳©׳ ׳ ׳§׳™/g, replacement: 'חלץ שם נקי' },
    
    // כללי - סימן שקל
    { pattern: /ג‚×/g, replacement: '₪' },
    
    // תאריכים
    { pattern: /׳ ׳•׳¦׳¨:/g, replacement: 'נוצר:' },
    { pattern: /׳₪׳•׳¨׳¡׳:/g, replacement: 'פורסם:' },
];

let totalFixed = 0;

console.log('\n🔧 מתקן גיבריש...\n');

fixes.forEach((fix, index) => {
    const matches = content.match(fix.pattern);
    if (matches && matches.length > 0) {
        console.log(`✓ ${matches.length}x: ${fix.pattern.source.substring(0, 30)}...`);
        content = content.replace(fix.pattern, fix.replacement);
        totalFixed += matches.length;
    }
});

if (totalFixed > 0) {
    fs.writeFileSync(filePath, content, 'utf8');
    console.log(`\n✅ סה"כ תוקנו ${totalFixed} מופעים!`);
} else {
    console.log('\n⚠️ לא נמצאו דברים לתקן');
}

// ספירה של גיבריש שנותר
const remaining = (content.match(/׳/g) || []).length;
console.log(`📊 תווי ׳ שנותרו: ${remaining}\n`);







