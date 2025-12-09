// Script to fix templates design styles - convert back to proper JavaScript
const fs = require('fs');

const allDesignStyles = `[
		{
			id: 'modern',
			name: 'מודרני',
			description: 'עיצוב נקי ומודרני עם צבעים רעננים',
			colors: {
				primary: '#14b8a6',
				secondary: '#8b5cf6',
				accent: '#3b82f6'
			}
		},
		{
			id: 'colorful',
			name: 'צבעוני',
			description: 'עיצוב תוסס ומלא חיים עם צבעים עזים',
			colors: {
				primary: '#f97316',
				secondary: '#a855f7',
				accent: '#ec4899'
			}
		},
		{
			id: 'elegant',
			name: 'אלגנטי',
			description: 'עיצוב מעודן ומקצועי',
			colors: {
				primary: '#1e40af',
				secondary: '#6b7280',
				accent: '#1e293b'
			}
		},
		{
			id: 'dark',
			name: 'כהה',
			description: 'עיצוב כהה ומסתורי',
			colors: {
				primary: '#3b82f6',
				secondary: '#8b5cf6',
				accent: '#06b6d4'
			}
		},
		{
			id: 'minimalist',
			name: 'מינימליסטי',
			description: 'עיצוב פשוט ונקי',
			colors: {
				primary: '#000000',
				secondary: '#ffffff',
				accent: '#6b7280'
			}
		},
		{
			id: 'retro',
			name: 'רטרו',
			description: 'עיצוב וינטג\\' עם צבעים חמים',
			colors: {
				primary: '#fbbf24',
				secondary: '#f97316',
				accent: '#dc2626'
			}
		},
		{
			id: 'neon',
			name: 'נאון',
			description: 'עיצוב נאון זוהר ומרהיב',
			colors: {
				primary: '#a855f7',
				secondary: '#ec4899',
				accent: '#06b6d4'
			}
		},
		{
			id: 'luxury',
			name: 'לוקסוס',
			description: 'עיצוב יוקרתי עם זהב',
			colors: {
				primary: '#fbbf24',
				secondary: '#eab308',
				accent: '#000000'
			}
		},
		{
			id: 'vintage',
			name: 'וינטג\\'',
			description: 'עיצוב עתיק וחם',
			colors: {
				primary: '#d97706',
				secondary: '#dc2626',
				accent: '#92400e'
			}
		}
	]`;

const templateFiles = [
	'new-app/src/lib/templates/store.js',
	'new-app/src/lib/templates/event.js',
	'new-app/src/lib/templates/service.js',
	'new-app/src/lib/templates/course.js',
	'new-app/src/lib/templates/artist.js',
	'new-app/src/lib/templates/message.js',
	'new-app/src/lib/templates/restaurant.js',
	'new-app/src/lib/templates/workshop.js',
	'new-app/src/lib/templates/quick.js',
	'new-app/src/lib/templates/faq.js'
];

console.log('🔧 Fixing templates design styles...\n');

templateFiles.forEach(filePath => {
	try {
		let content = fs.readFileSync(filePath, 'utf8');
		
		// Find designStyles array and replace it (including JSON format)
		const designStylesRegex = /designStyles:\s*\[[\s\S]*?\n\t\]/;
		
		if (designStylesRegex.test(content)) {
			content = content.replace(designStylesRegex, `designStyles: ${allDesignStyles}`);
			
			fs.writeFileSync(filePath, content, 'utf8');
			console.log(`✅ Fixed: ${filePath.split('/').pop()}`);
		} else {
			console.log(`⚠️  No designStyles found in: ${filePath.split('/').pop()}`);
		}
	} catch (error) {
		console.error(`❌ Error fixing ${filePath}:`, error.message);
	}
});

console.log('\n✨ All templates fixed!');
