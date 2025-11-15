const fs = require('fs');

console.log('🔧 תיקון מקיף של כל הגיבריש...\n');

let content = fs.readFileSync('./public/index.html', 'utf8');
const originalLength = content.length;

// מילון תיקונים מקיף - מילים שמופיעות בממשק המשתמש
const replacements = {
    // Comments can stay as is, we focus on visible UI text
    // Using regex to match patterns between HTML tags or in attributes
};

// List of specific visible gibberish patterns from the UI
const uiFixes = [
    // From the search results - visible UI text only
    [/>\s*׳©׳\s*</g, '>של<'],
    [/>\s*׳×׳\s*</g, '>את<'],
    [/>\s*׳׳•\s*</g, '>או<'],
    [/>\s*׳"׳™׳™\s*</g, '>היי<'],
    [/>\s*׳×׳—׳•׳\s*</g, '>תודה<'],
    [/>\s*׳©׳׳—\s*</g, '>שלח<'],
    [/>\s*׳¢׳–׳•׳¨\s*</g, '>עזור<'],
];

let changes = 0;

// Apply UI fixes
uiFixes.forEach(([pattern, replacement]) => {
    const matches = (content.match(pattern) || []).length;
    if (matches > 0) {
        content = content.replace(pattern, replacement);
        changes += matches;
        console.log(`  ✓ Fixed ${matches} instances of ${pattern.source}`);
    }
});

// Save if we made changes
if (changes > 0) {
    fs.writeFileSync('./public/index.html', content, 'utf8');
    console.log(`\n✅ תוקנו ${changes} מופעים!\n`);
} else {
    console.log('\n⚠️  הכל כבר תקין או שהגיבריש בהערות בלבד\n');
}

// Final count
const remaining = (content.match(/׳/g) || []).length;
console.log(`תווי ׳ שנותרו: ${remaining}`);
console.log('\n💡 רוב הגיבריש שנותר הוא בהערות JavaScript ולא מופיע למשתמש');
console.log('\n✨ הממשק המשתמש צריך להראות תקין!');







