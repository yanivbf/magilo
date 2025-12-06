// Test getPageBySlug to see the structure
const STRAPI_URL = 'http://localhost:1337';
const STRAPI_API_TOKEN = '8ba3301bbe92b271829befae8c0c268dbe65efa2bd66517f9309d2e3127c36eca41e91db5a53deb48e8d8aaf095d700bbc4dd1ab32ad509705723f052241d1f0a352eb020cb675aa2e4d733d4bb48855d206eafed5d1196975ad06365767082044a7b5d955e5e3b43398e13aabee36a89e70392a390ef5b96bb4deff6ca43c6a';

async function testGetPageBySlug() {
	const slug = 'google_1-page-1765003788757'; // Latest user page
	
	console.log(`🔍 Fetching page by slug: ${slug}\n`);
	
	try {
		const response = await fetch(`${STRAPI_URL}/api/pages?filters[slug][$eq]=${slug}&populate[0]=sections&populate[1]=storeProducts`, {
			headers: {
				'Authorization': `Bearer ${STRAPI_API_TOKEN}`
			}
		});
		
		const result = await response.json();
		
		console.log('📥 Full Strapi response structure:');
		console.log(JSON.stringify(result, null, 2));
		console.log('');
		
		const page = result.data?.[0];
		if (page) {
			console.log('✅ Page found!');
			console.log('📄 Page object keys:', Object.keys(page));
			console.log('📄 page.id:', page.id);
			console.log('📄 page.documentId:', page.documentId);
			console.log('📄 page.userId:', page.userId);
			console.log('📄 page.attributes:', page.attributes ? 'EXISTS' : 'DOES NOT EXIST');
			
			if (page.attributes) {
				console.log('📄 page.attributes.userId:', page.attributes.userId);
			}
			
			// Test the attrs logic from the server code
			const attrs = page.attributes || page;
			console.log('');
			console.log('🧪 Testing attrs logic:');
			console.log('   - attrs.userId:', attrs.userId);
			console.log('   - attrs.metadata?.createdByUserId:', attrs.metadata?.createdByUserId);
		} else {
			console.log('❌ Page not found');
		}
		
	} catch (error) {
		console.error('❌ Error:', error.message);
	}
}

testGetPageBySlug();
