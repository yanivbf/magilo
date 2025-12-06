// Check if page 303 exists in Strapi
const STRAPI_URL = 'http://localhost:1337';
const STRAPI_API_TOKEN = '8ba3301bbe92b271829befae8c0c268dbe65efa2bd66517f9309d2e3127c36eca41e91db5a53deb48e8d8aaf095d700bbc4dd1ab32ad509705723f052241d1f0a352eb020cb675aa2e4d733d4bb48855d206eafed5d1196975ad06365767082044a7b5d955e5e3b43398e13aabee36a89e70392a390ef5b96bb4deff6ca43c6a';

async function checkPage() {
	try {
		// Try to get page 303 directly
		console.log('🔍 Trying to get page 303...');
		const response = await fetch(`${STRAPI_URL}/api/pages/303`, {
			headers: {
				'Authorization': `Bearer ${STRAPI_API_TOKEN}`
			}
		});
		
		console.log('📡 Response status:', response.status);
		
		if (response.ok) {
			const data = await response.json();
			console.log('✅ Page 303 found:', JSON.stringify(data, null, 2));
		} else {
			const error = await response.json();
			console.log('❌ Page 303 not found:', JSON.stringify(error, null, 2));
			
			// Try to get all pages and find the one with slug
			console.log('\n🔍 Getting all pages to find the correct ID...');
			const allResponse = await fetch(`${STRAPI_URL}/api/pages?pagination[pageSize]=100`, {
				headers: {
					'Authorization': `Bearer ${STRAPI_API_TOKEN}`
				}
			});
			
			if (allResponse.ok) {
				const allData = await allResponse.json();
				console.log(`\n📋 Found ${allData.data.length} pages:`);
				allData.data.forEach(page => {
					console.log(`   - ID: ${page.id}, documentId: ${page.documentId}, slug: ${page.slug}, title: ${page.title}`);
				});
			}
		}
	} catch (error) {
		console.error('❌ Error:', error.message);
	}
}

checkPage();
