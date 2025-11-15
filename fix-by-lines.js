const fs = require('fs');

const filePath = 'public/index.html';
const lines = fs.readFileSync(filePath, 'utf8').split('\n');

// תיקונים לפי מספרי שורות
const fixes = {
    521: { old: '׳"׳₪׳™ ׳"׳ ׳—׳™׳×׳" ׳©׳׳™', new: 'דפי הנחיתה שלי' },
    539: { old: '׳"׳₪׳¢׳ ׳׳ ׳•׳™ ׳׳¦׳₪׳™׳™׳" ׳'׳"׳£', new: 'הצטרף למנוי הפרימיום בלבד' },
    540: { old: '׳"׳₪׳¢׳ ׳׳ ׳•׳™ חודשי ׳'-₪39 ׳׳¦׳₪׳™׳™׳" ׳'׳"׳£ ׳–׳"', new: 'הצטרף למנוי חודשי ב-₪39 לפרימיום בלבד זה' },
    548: { old: '׳'׳™׳©׳" ׳׳׳׳" ׳׳"׳£', new: 'גישה מלאה לדף' },
    554: { old: '׳§׳™׳©׳•׳¨ ׳§׳'׳•׳¢ ׳׳"׳£', new: 'קישור קבוע לדף' },
    560: { old: '׳¢׳"׳›׳•׳ ׳™׳ ׳׳•׳˜׳•׳׳˜׳™׳™׳', new: 'עדכונים אוטומטיים' },
    567: { old: '׳׳—׳•׳"׳©', new: 'לחודש' },
    576: { old: '׳"׳₪׳¢׳ ׳׳ ׳•׳™', new: 'הצטרף למנוי' },
    588: { old: '׳׳ ׳•׳™ AutoPage Pro', new: 'מנוי AutoPage Pro' },
    589: { old: '׳"׳×׳—׳ ׳׳ ׳•׳™ חודשי ׳'-₪39 ׳•׳§׳'׳ ׳'׳™׳©׳" ׳׳׳׳"', new: 'המנוי הכי משתלם - רק ₪39 לחודש עם גישה מלאה' },
    597: { old: '׳™׳¦׳™׳¨׳× ׳"׳₪׳™׳ ׳׳׳ ׳"׳'׳'׳׳"', new: 'יצירת דפים ללא הגבלה' },
    603: { old: '׳§׳™׳©׳•׳¨ ׳§׳'׳•׳¢ ׳׳"׳£ ׳©׳׳', new: 'קישור קבוע לכל דף שלך' },
    609: { old: '׳×׳׳™׳›׳" ׳˜׳›׳ ׳™׳× 24/7', new: 'תמיכה טכנית 24/7' },
    616: { old: '׳׳—׳•׳"׳©', new: 'לחודש' },
    625: { old: '׳"׳×׳—׳ ׳׳ ׳•׳™', new: 'התנח במנוי' },
    639: { old: '׳₪׳׳ ׳ ׳׳ ׳"׳', new: 'פאנל ניהול' },
    662: { old: '׳׳©׳×׳׳©׳™׳', new: 'משתמשים' },
    731: { old: '׳׳©׳×׳׳©׳™׳ ׳'׳׳¢׳¨׳›׳×', new: 'משתמשים במערכת' },
    763: { old: '׳"׳₪׳™׳ ׳₪׳¢׳™׳׳™׳', new: 'דפים פעילים' },
};

let fixCount = 0;

Object.entries(fixes).forEach(([lineNum, fix]) => {
    const index = parseInt(lineNum) - 1;
    if (index >= 0 && index < lines.length && lines[index].includes(fix.old)) {
        lines[index] = lines[index].replace(fix.old, fix.new);
        console.log(`✓ שורה ${lineNum}: תוקן`);
        fixCount++;
    }
});

if (fixCount > 0) {
    fs.writeFileSync(filePath, lines.join('\n'), 'utf8');
    console.log(`\n✅ תוקנו ${fixCount} שורות!`);
} else {
    console.log('\n⚠️ לא נמצאו שורות לתקן');
}







