const fs = require('fs');

let content = fs.readFileSync('./public/index.html', 'utf8');
let changes = 0;

console.log('🔧 מתקן גיבריש בכרטיסים...\n');

// List of remaining gibberish in the cards JavaScript
const fixes = [
    // In line ~3395
    { old: 'text-gray-500">׳₪׳•׳¨׳¡׳:', new: 'text-gray-500">פורסם:', desc: 'Published label' },
    
    // In line ~4234 - default description
    { old: "'׳\"׳£ ׳ ׳—׳™׳×׳\" ׳׳§׳¦׳•׳¢׳™'", new: "'דף נחמד וקצועי'", desc: 'Default description' },
    
    // In line ~4259 - no pages header
    { old: '>׳¢׳\"׳™׳™׳ ׳׳™׳ ׳\"׳₪׳™ ׳ ׳—׳™׳×׳\"<', new: '>עדיין אין דפים נחמדים<', desc: 'No pages header' },
    
    // In line ~4260 - no pages text
    { old: '>׳\"׳\'׳™׳¢ ׳\"׳–׳׳ ׳׳™׳¦׳•׳¨ ׳׳× ׳\"׳£ ׳\"׳ ׳—׳™׳×׳\" ׳\"׳¨׳׳©׳•׳ ׳©׳׳.<', new: '>הקליק הנה ליצור את הדף הראשון שלך.<', desc: 'No pages text' },
];

fixes.forEach(fix => {
    if (content.includes(fix.old)) {
        content = content.split(fix.old).join(fix.new);
        console.log(`  ✓ ${fix.desc}`);
        changes++;
    }
});

if (changes > 0) {
    fs.writeFileSync('./public/index.html', content, 'utf8');
    console.log(`\n✅ תוקנו ${changes} אלמנטים בכרטיסים!\n`);
    console.log('🎉 עכשיו הכרטיסים צריכים להראות טוב!');
} else {
    console.log('\n⚠️  לא נמצאו דברים נוספים לתיקון\n');
}

// Count remaining gibberish
const remaining = (content.match(/׳/g) || []).length;
console.log(`\nתווי גיבריש שנותרו: ${remaining}`);









