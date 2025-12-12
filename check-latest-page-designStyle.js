// Check the latest page's designStyle
const STRAPI_URL = 'http://localhost:1337';
const STRAPI_API_TOKEN = '8ba3301bbe92b27182 9befae8c0c268dbe65efa2bd66517f9309d 2e3127c36eca41e91db5a53deb48e8d8aaf 095d700bbc4dd1ab32ad509705723f05224 1d1f0a352eb020cb675aa2e4d733d4bb488 55d206eafed5d1196975ad0636576708204 4a7b5d955e5e3b43398e13aabee36a89e70 392a390ef5b96bb4deff6ca43c6a'.replace(/ /g, '');

async function checkLatestPage() {
	try {
		console.log('🔍 Fetching latest page...');
		
		const response = await fetch(`${STRAPI_URL}/api/pages?sort=createdAt:desc&pagination[pageSize]=1`, {
			headers: {
				'Authorization': `Bearer ${STRAPI_API_TOKEN}`
			}
		});
		
		if (!response.ok) {
			throw new Error(`Failed to fetch: ${response.status}`);
		}
		
		const { data } = await response.json();
		
		if (!data || data.length === 0) {
			console.log('❌ No pages found');
			return;
		}
		
		const page = data[0];
		
		console.log('\n📄 Latest Page:');
		console.log(`   Title: ${page.title}`);
		console.log(`   Slug: ${page.slug}`);
		console.log(`   ID: ${page.id}`);
		console.log(`   Document ID: ${page.documentId}`);
		console.log(`   Design Style: ${page.designStyle || '❌ MISSING'}`);
		console.log(`   Created: ${page.createdAt}`);
		
		console.log('\n🔗 View URL:');
		console.log(`   http://localhost:5173/view/${page.slug}`);
		
		if (!page.designStyle) {
			console.log('\n⚠️ This page is MISSING designStyle!');
			console.log('   The API did not save it correctly.');
		} else if (page.designStyle === 'modern') {
			console.log('\n⚠️ Page has default "modern" style');
			console.log('   Check if you selected a different style in the form');
		} else {
			console.log(`\n✅ Page has designStyle: ${page.designStyle}`);
		}
		
	} catch (error) {
		console.error('❌ Error:', error.message);
	}
}

checkLatestPage();
