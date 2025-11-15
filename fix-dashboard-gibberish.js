const fs = require('fs');

const filePath = 'public/index.html';
let content = fs.readFileSync(filePath, 'utf8');

// רשימת תיקונים
const fixes = [
    // פאנל דשבורד
    { bad: /׳׳©׳×׳׳©׳™׳ ׳'׳׳¢׳¨׳›׳×/g, good: 'משתמשים במערכת' },
    { bad: /׳"׳₪׳™׳ ׳₪׳¢׳™׳׳™׳(?!׳)/g, good: 'דפים פעילים' },
    { bad: /׳"׳₪׳™׳ ׳׳ ׳₪׳¢׳™׳׳™׳/g, good: 'דפים לא פעילים' },
    { bad: /׳₪׳¢׳™׳׳•׳× ׳׳—׳¨׳•׳ ׳"/g, good: 'פעילות אחרונה' },
    { bad: /סטטיסטיקות ׳׳"׳™׳¨׳•׳×/g, good: 'סטטיסטיקות אחרונות' },
    { bad: /׳׳©׳×׳׳©׳™׳ ׳—׳"׳©׳™׳ ׳"׳©׳'׳•׳¢/g, good: 'משתמשים חדשים השבוע' },
    { bad: /׳"׳₪׳™׳ ׳©׳ ׳•׳¦׳¨׳• ׳"׳©׳'׳•׳¢/g, good: 'דפים שנוצרו השבוע' },
    
    // תיקון ג‚× ל-₪
    { bad: /ג‚×/g, good: '₪' },
];

let fixCount = 0;
fixes.forEach(fix => {
    const matches = content.match(fix.bad);
    if (matches) {
        console.log(`מצאתי ${matches.length} מופעים של: ${fix.bad}`);
        content = content.replace(fix.bad, fix.good);
        fixCount += matches.length;
    }
});

if (fixCount > 0) {
    fs.writeFileSync(filePath, content, 'utf8');
    console.log(`\n✅ תוקנו ${fixCount} מופעים!`);
} else {
    console.log('\n⚠️ לא נמצאו דברים לתקן');
}







