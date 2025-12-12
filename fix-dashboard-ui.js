const fs = require('fs');

console.log('🔧 מתקן גיבריש בדשבורד...\n');

let content = fs.readFileSync('./public/index.html', 'utf8');
let changes = 0;

// Based on exact line numbers from grep results
const fixes = [
    // Line 764 - active pages
    { search: 'text-gray-500">׳"׳₪׳™׳ ׳₪׳¢׳™׳׳™׳<', replace: 'text-gray-500">דפים פעילים<', desc: 'Active pages label' },
    
    // Line 780 - inactive pages  
    { search: 'text-gray-500">׳"׳₪׳™׳ ׳׳ ׳₪׳¢׳™׳׳™׳<', replace: 'text-gray-500">דפים לא פעילים<', desc: 'Inactive pages label' },
    
    // Line 790 - recent activity
    { search: 'text-gray-900">׳₪׳¢׳™׳׳•׳× ׳׳—׳¨׳•׳ ׳"<', replace: 'text-gray-900">פעילות אחרונה<', desc: 'Recent activity header' },
    
    // Line 794 - activity comment
    { search: '<!-- ׳₪׳¢׳™׳׳•׳× ׳׳׳™׳×׳™׳× ׳×׳™׳˜׳¢׳ ׳›׳׳ -->', replace: '<!-- פעילות דינמית תיטען כאן -->', desc: 'Activity comment' },
    
    // Line 810 - weekly new pages
    { search: 'text-gray-500">׳"׳₪׳™׳ ׳©׳ ׳•׳¦׳¨׳• ׳"׳©׳'׳•׳¢<', replace: 'text-gray-500">דפים שנוצרו השבוע<', desc: 'Weekly pages label' },
];

fixes.forEach(fix => {
    if (content.includes(fix.search)) {
        content = content.replace(fix.search, fix.replace);
        console.log(`  ✓ ${fix.desc}`);
        changes++;
    } else {
        console.log(`  ⚠ Not found: ${fix.desc}`);
    }
});

if (changes > 0) {
    fs.writeFileSync('./public/index.html', content, 'utf8');
    console.log(`\n✅ תוקנו ${changes} אלמנטים בדשבורד!\n`);
} else {
    console.log('\n⚠️  לא נמצאו התאמות\n');
}









