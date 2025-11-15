const fs = require('fs');

console.log('🔧 מתקן את כל הגיבריש בממשק המשתמש...\n');

let content = fs.readFileSync('./public/index.html', 'utf8');
let totalFixed = 0;

// רשימה מלאה של כל הגיבריש והתיקון שלו
const allReplacements = [
    // משפטים ומילים ארוכות
    ['text-gray-500">דפים פעילים<', 'text-gray-500">דפים פעילים<'],  // Already fixed check
    ['דפים פעילים', 'דפים פעילים'], // Keep if exists
];

// בואו נתקן בצורה אחרת - נמצא את כל התווים הבעייתיים ונחליף אותם
// נחפש דפוסים ספציפיים עם הקונטקסט שלהם

const patterns = [
    { pattern: /text-gray-500">[^<]*׳[^<]*</g, context: 'labels in gray' },
    { pattern: /text-gray-900">[^<]*׳[^<]*</g, context: 'headers in dark gray' },
    { pattern: /placeholder="[^"]*׳[^"]*"/g, context: 'input placeholders' },
    { pattern: />[^<]*׳[^<]*</g, context: 'any text with gibberish' },
];

// בואו נספור כמה גיבריש יש
const gibbCount = (content.match(/׳/g) || []).length;
console.log(`נמצאו ${gibbCount} תווי גיבריש בסך הכל`);

// עכשיו נמצא את כל המקומות בהם יש גיבריש בממשק משתמש (לא בהערות)
const lines = content.split('\n');
const problematicLines = [];

lines.forEach((line, index) => {
    // דלג על הערות
    if (line.trim().startsWith('//') || line.trim().startsWith('/*') || line.includes('<!--')) {
        return;
    }
    
    // אם יש גיבריש ויש HTML/attributes
    if (line.includes('׳') && (line.includes('class=') || line.includes('id=') || line.includes('placeholder=') || line.match(/>[^<]+</))) {
        problematicLines.push({
            lineNum: index + 1,
            content: line.trim().substring(0, 80) + '...'
        });
    }
});

console.log(`\nנמצאו ${problematicLines.length} שורות עם גיבריש בממשק משתמש:\n`);
problematicLines.slice(0, 15).forEach(item => {
    console.log(`  שורה ${item.lineNum}: ${item.content}`);
});

console.log('\n💡 יש לתקן את השורות האלה ידנית או לספק מילון תרגום מלא');







