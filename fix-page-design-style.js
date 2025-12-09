// תיקון אוטומטי - הוספת designStyle לדף
const STRAPI_URL = 'http://localhost:1337';
const STRAPI_TOKEN = 'b4c4ec1d7f11f9bd2939a0a385aff8c3d0e0e0b3e3b3b3b3b3b3b3b3b3b3b3b3b3b3b3b3b3b3b3b3b3b3b3b3b3b3b3b3b3b3b3b3';

// קבל את ה-page ID מה-command line
const pageId = process.argv[2];
const designStyle = process.argv[3] || 'modern'; // ברירת מחדל: modern

if (!pageId) {
	console.error('❌ חסר page ID!');
	console.log('\nשימוש:');
	console.log('node fix-page-design-style.js <pageId> [designStyle]');
	console.log('\nדוגמה:');
	console.log('node fix-page-design-style.js abc123 dark');
	console.log('\nעיצובים זמינים:');
	console.log('- modern (ברירת מחדל)');
	console.log('- dark (כהה)');
	console.log('- colorful (צבעוני)');
	console.log('- minimalist (מינימליסטי)');
	console.log('- elegant (אלגנטי)');
	console.log('- retro (רטרו)');
	console.log('- neon (נאון)');
	console.log('- luxury (לוקסוס)');
	console.log('- vintage (וינטג\')');
	process.exit(1);
}

async function fixPageDesignStyle() {
	try {
		console.log(`🔧 מתקן דף: ${pageId}`);
		console.log(`🎨 מגדיר עיצוב: ${designStyle}`);
		
		// עדכן את הדף
		const response = await fetch(
			`${STRAPI_URL}/api/pages/${pageId}`,
			{
				method: 'PUT',
				headers: {
					'Authorization': `Bearer ${STRAPI_TOKEN}`,
					'Content-Type': 'application/json'
				},
				body: JSON.stringify({
					data: {
						designStyle: designStyle
					}
				})
			}
		);
		
		if (!response.ok) {
			const error = await response.json();
			throw new Error(`HTTP error! status: ${response.status}, ${JSON.stringify(error)}`);
		}
		
		const result = await response.json();
		
		console.log('\n✅ הדף עודכן בהצלחה!');
		console.log('   ID:', result.data.id);
		console.log('   Document ID:', result.data.documentId);
		console.log('   Title:', result.data.title);
		console.log('   Design Style:', result.data.designStyle);
		
		console.log('\n🎯 עכשיו:');
		console.log('1. רענן את הדף בדפדפן (Ctrl+Shift+R)');
		console.log('2. הדף אמור להיראות עם העיצוב החדש!');
		
	} catch (error) {
		console.error('❌ שגיאה:', error.message);
	}
}

fixPageDesignStyle();
