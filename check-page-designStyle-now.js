// בדיקת designStyle של הדף האחרון
const STRAPI_URL = 'http://localhost:1337';
const STRAPI_TOKEN = '8ba3301bbe92b271829befae8c0c268dbe65efa2bd66517f9309d2e3127c36eca41e91db5a53deb48e8d8aaf095d700bbc4dd1ab32ad509705723f052241d1f0a352eb020cb675aa2e4d733d4bb48855d206eafed5d1196975ad06365767082044a7b5d955e5e3b43398e13aabee36a89e70392a390ef5b96bb4deff6ca43c6a';

async function checkLatestPageDesignStyle() {
	try {
		console.log('🔍 מחפש את הדף האחרון...');
		
		const response = await fetch(`${STRAPI_URL}/api/pages?sort=createdAt:desc&pagination[limit]=1&populate=*`, {
			headers: {
				'Authorization': `Bearer ${STRAPI_TOKEN}`
			}
		});
		
		if (!response.ok) {
			throw new Error(`HTTP error! status: ${response.status}`);
		}
		
		const result = await response.json();
		
		if (!result.data || result.data.length === 0) {
			console.log('❌ לא נמצאו דפים');
			return;
		}
		
		const page = result.data[0];
		console.log('\n📄 הדף האחרון:');
		console.log('   ID:', page.id);
		console.log('   documentId:', page.documentId);
		console.log('   כותרת:', page.title);
		console.log('   slug:', page.slug);
		console.log('   🎨 designStyle:', page.designStyle || 'לא מוגדר!');
		console.log('   נוצר:', new Date(page.createdAt).toLocaleString('he-IL'));
		
		// בדיקת הצבעים של העיצוב
		const designStyle = page.designStyle || 'modern';
		console.log('\n🎨 צבעי העיצוב:', designStyle);
		
		const colors = {
			modern: { bg: '#ffffff', bgAlt: '#f0fdfa' },
			colorful: { bg: '#ffffff', bgAlt: '#fef3c7' },
			elegant: { bg: '#ffffff', bgAlt: '#f8fafc' },
			minimalist: { bg: '#ffffff', bgAlt: '#fafafa' },
			retro: { bg: '#fef3c7', bgAlt: '#fef9c3' },
			dark: { bg: '#0f172a', bgAlt: '#0f172a' },
			neon: { bg: '#0f172a', bgAlt: '#1e293b' },
			luxury: { bg: '#fefce8', bgAlt: '#fef9c3' },
			vintage: { bg: '#fef3c7', bgAlt: '#fed7aa' }
		};
		
		const designColors = colors[designStyle] || colors.modern;
		console.log('   רקע ראשי (background):', designColors.bg);
		console.log('   רקע משני (backgroundAlt):', designColors.bgAlt);
		
		if (designStyle === 'dark') {
			console.log('\n✅ הדף מוגדר כ-DARK - הכל צריך להיות שחור!');
			console.log('   שני הרקעים זהים:', designColors.bg === designColors.bgAlt ? 'כן ✅' : 'לא ❌');
		} else {
			console.log('\n⚠️ הדף לא מוגדר כ-DARK!');
			console.log('   כדי לקבל דף שחור, צריך לשנות את designStyle ל-"dark"');
		}
		
		// הצעה לתיקון
		if (designStyle !== 'dark') {
			console.log('\n🔧 כדי לתקן, הרץ:');
			console.log(`   node fix-page-to-dark.js ${page.documentId}`);
		}
		
	} catch (error) {
		console.error('❌ שגיאה:', error.message);
	}
}

checkLatestPageDesignStyle();
