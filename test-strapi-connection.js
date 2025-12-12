// Test Strapi connection and page creation
const STRAPI_URL = 'http://localhost:1337';
const STRAPI_API_TOKEN = '8ba3301bbe92b271829befae8c0c268dbe65efa2bd66517f9309d2e3127c36eca41e91db5a53deb48e8d8aaf095d700bbc4dd1ab32ad509705723f052241d1f0a352eb020cb675aa2e4d733d4bb48855d206eafed5d1196975ad06365767082044a7b5d955e5e3b43398e13aabee36a89e70392a390ef5b96bb4deff6ca43c6a';

async function testConnection() {
	console.log('🔍 Testing Strapi connection...');
	
	try {
		// Test 1: Check if Strapi is running
		const healthCheck = await fetch(`${STRAPI_URL}/_health`);
		console.log('✅ Strapi health check:', healthCheck.status);
		
		// Test 2: Try to get pages
		const pagesResponse = await fetch(`${STRAPI_URL}/api/pages`, {
			headers: {
				'Authorization': `Bearer ${STRAPI_API_TOKEN}`
			}
		});
		
		console.log('📄 Pages API status:', pagesResponse.status);
		
		if (pagesResponse.ok) {
			const data = await pagesResponse.json();
			console.log('📄 Pages count:', data.data?.length || 0);
		} else {
			const error = await pagesResponse.text();
			console.error('❌ Pages API error:', error);
		}
		
		// Test 3: Try to create a minimal page
		console.log('\n🔍 Testing page creation...');
		const createResponse = await fetch(`${STRAPI_URL}/api/pages`, {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json',
				'Authorization': `Bearer ${STRAPI_API_TOKEN}`
			},
			body: JSON.stringify({
				data: {
					title: 'Test Page ' + Date.now(),
					slug: 'test-' + Date.now(),
					htmlContent: '<div>Test</div>',
					pageType: 'serviceProvider',
					userId: 'google_111351120503275674259',
					designStyle: 'modern',
					isActive: true
				}
			})
		});
		
		console.log('📝 Create page status:', createResponse.status);
		
		if (createResponse.ok) {
			const data = await createResponse.json();
			console.log('✅ Page created successfully!');
			console.log('📋 Page ID:', data.data?.id);
			console.log('📋 Document ID:', data.data?.documentId);
		} else {
			const error = await createResponse.text();
			console.error('❌ Create page error:', error);
		}
		
	} catch (error) {
		console.error('❌ Connection error:', error.message);
	}
}

testConnection();
