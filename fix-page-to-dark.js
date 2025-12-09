// תיקון designStyle של דף ל-DARK
const STRAPI_URL = 'http://localhost:1337';
const STRAPI_TOKEN = '8ba3301bbe92b271829befae8c0c268dbe65efa2bd66517f9309d2e3127c36eca41e91db5a53deb48e8d8aaf095d700bbc4dd1ab32ad509705723f052241d1f0a352eb020cb675aa2e4d733d4bb48855d206eafed5d1196975ad06365767082044a7b5d955e5e3b43398e13aabee36a89e70392a390ef5b96bb4deff6ca43c6a';

const documentId = process.argv[2];

if (!documentId) {
	console.log('❌ חסר documentId!');
	console.log('שימוש: node fix-page-to-dark.js <documentId>');
	process.exit(1);
}

async function fixPageToDark() {
	try {
		console.log('🔧 משנה את הדף ל-DARK...');
		console.log('   documentId:', documentId);
		
		const response = await fetch(`${STRAPI_URL}/api/pages/${documentId}`, {
			method: 'PUT',
			headers: {
				'Authorization': `Bearer ${STRAPI_TOKEN}`,
				'Content-Type': 'application/json'
			},
			body: JSON.stringify({
				data: {
					designStyle: 'dark'
				}
			})
		});
		
		if (!response.ok) {
			const error = await response.text();
			throw new Error(`HTTP error! status: ${response.status}, body: ${error}`);
		}
		
		const result = await response.json();
		const page = result.data;
		
		console.log('\n✅ הדף עודכן בהצלחה!');
		console.log('   🎨 designStyle חדש:', page.designStyle);
		console.log('   צבע רקע:', '#0f172a (כחול-שחור כהה)');
		console.log('   כל המקטעים:', 'שחורים (אותו צבע)');
		
		console.log('\n🚀 עכשיו:');
		console.log('   1. רענן את הדפדפן (Ctrl+Shift+R)');
		console.log('   2. הכל צריך להיות שחור!');
		
	} catch (error) {
		console.error('❌ שגיאה:', error.message);
	}
}

fixPageToDark();
