// בדיקה מהירה - מה ה-designStyle של הדף?
const STRAPI_URL = 'http://localhost:1337';
const STRAPI_TOKEN = 'b4c4ec1d7f11f9bd2939a0a385aff8c3d0e0e0b3e3b3b3b3b3b3b3b3b3b3b3b3b3b3b3b3b3b3b3b3b3b3b3b3b3b3b3b3b3b3b3b3';

// הכנס את ה-slug של הדף שלך כאן (מה-URL)
const PAGE_SLUG = 'google_1-page-1765165177663'; // שנה את זה ל-slug האמיתי!

async function checkPageDesignStyle() {
	try {
		console.log(`🔍 בודק דף: ${PAGE_SLUG}`);
		
		const response = await fetch(
			`${STRAPI_URL}/api/pages?filters[slug][$eq]=${PAGE_SLUG}&populate=*`,
			{
				headers: {
					'Authorization': `Bearer ${STRAPI_TOKEN}`
				}
			}
		);
		
		if (!response.ok) {
			throw new Error(`HTTP error! status: ${response.status}`);
		}
		
		const result = await response.json();
		
		if (!result.data || result.data.length === 0) {
			console.error('❌ דף לא נמצא!');
			console.log('💡 בדוק את ה-slug - האם הוא נכון?');
			return;
		}
		
		const page = result.data[0];
		console.log('\n📄 מצאתי את הדף:');
		console.log('   ID:', page.id);
		console.log('   Document ID:', page.documentId);
		console.log('   Title:', page.title);
		console.log('   Slug:', page.slug);
		console.log('\n🎨 Design Style:', page.designStyle || '❌ לא מוגדר!');
		
		if (!page.designStyle) {
			console.log('\n⚠️ הבעיה: הדף לא נוצר עם designStyle!');
			console.log('\n🔧 פתרון:');
			console.log('1. לך ל-Dashboard');
			console.log('2. ערוך את הדף');
			console.log('3. בחר עיצוב מהרשימה (כהה/צבעוני/מודרני וכו\')');
			console.log('4. שמור את הדף');
			console.log('\nאו הרץ את הסקריפט הזה כדי לתקן:');
			console.log(`node fix-page-design-style.js ${page.documentId || page.id}`);
		} else {
			console.log('\n✅ ה-designStyle מוגדר נכון!');
			console.log('\n🔍 אם הדף עדיין לבן, בדוק:');
			console.log('1. עשה Hard Refresh (Ctrl+Shift+R)');
			console.log('2. פתח DevTools (F12) ובדוק שגיאות ב-Console');
			console.log('3. בדוק שה-DynamicDesignWrapper מופיע ב-HTML');
		}
		
	} catch (error) {
		console.error('❌ שגיאה:', error.message);
	}
}

checkPageDesignStyle();
