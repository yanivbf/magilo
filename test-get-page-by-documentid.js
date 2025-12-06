// Test getting page by documentId
const STRAPI_URL = 'http://localhost:1337';
const STRAPI_API_TOKEN = '8ba3301bbe92b271829befae8c0c268dbe65efa2bd66517f9309d2e3127c36eca41e91db5a53deb48e8d8aaf095d700bbc4dd1ab32ad509705723f052241d1f0a352eb020cb675aa2e4d733d4bb48855d206eafed5d1196975ad06365767082044a7b5d955e5e3b43398e13aabee36a89e70392a390ef5b96bb4deff6ca43c6a';

async function testGetPage() {
	try {
		// Get a recent page to test with
		console.log('🔍 Getting recent pages...');
		const response = await fetch(`${STRAPI_URL}/api/pages?pagination[pageSize]=5&sort=id:desc`, {
			headers: {
				'Authorization': `Bearer ${STRAPI_API_TOKEN}`
			}
		});
		
		if (!response.ok) {
			throw new Error(`Failed to get pages: ${response.status}`);
		}
		
		const data = await response.json();
		const latestPage = data.data[0];
		
		console.log('\n📄 Latest page:');
		console.log(`   - ID: ${latestPage.id}`);
		console.log(`   - documentId: ${latestPage.documentId}`);
		console.log(`   - slug: ${latestPage.slug}`);
		console.log(`   - title: ${latestPage.title}`);
		
		// Test 1: Get by numeric ID
		console.log('\n🧪 Test 1: Get by numeric ID');
		const response1 = await fetch(`${STRAPI_URL}/api/pages/${latestPage.id}`, {
			headers: {
				'Authorization': `Bearer ${STRAPI_API_TOKEN}`
			}
		});
		console.log(`   Status: ${response1.status}`);
		if (response1.ok) {
			const page1 = await response1.json();
			console.log(`   ✅ Success! Got page: ${page1.data.title}`);
		}
		
		// Test 2: Get by documentId
		console.log('\n🧪 Test 2: Get by documentId');
		const response2 = await fetch(`${STRAPI_URL}/api/pages/${latestPage.documentId}`, {
			headers: {
				'Authorization': `Bearer ${STRAPI_API_TOKEN}`
			}
		});
		console.log(`   Status: ${response2.status}`);
		if (response2.ok) {
			const page2 = await response2.json();
			console.log(`   ✅ Success! Got page: ${page2.data.title}`);
		} else {
			console.log(`   ❌ Failed - documentId not supported in URL`);
		}
		
	} catch (error) {
		console.error('❌ Error:', error.message);
	}
}

testGetPage();
