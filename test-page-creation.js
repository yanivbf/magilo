// Test script to check if userId is being saved
const STRAPI_URL = 'http://localhost:1337';
const STRAPI_API_TOKEN = '8ba3301bbe92b271829befae8c0c268dbe65efa2bd66517f9309d2e3127c36eca41e91db5a53deb48e8d8aaf095d700bbc4dd1ab32ad509705723f052241d1f0a352eb020cb675aa2e4d733d4bb48855d206eafed5d1196975ad06365767082044a7b5d955e5e3b43398e13aabee36a89e70392a390ef5b96bb4deff6ca43c6a';

async function testPageCreation() {
	console.log('🧪 Testing page creation with userId...\n');
	
	const testData = {
		data: {
			title: 'Test Page ' + Date.now(),
			slug: 'test-page-' + Date.now(),
			htmlContent: '<div>Test content</div>',
			pageType: 'store',
			userId: 'google_111351120503275674259',
			isActive: true,
			metadata: {
				createdByUserId: 'google_111351120503275674259'
			}
		}
	};
	
	console.log('📤 Sending data to Strapi:');
	console.log(JSON.stringify(testData, null, 2));
	console.log('');
	
	try {
		const response = await fetch(`${STRAPI_URL}/api/pages`, {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json',
				'Authorization': `Bearer ${STRAPI_API_TOKEN}`
			},
			body: JSON.stringify(testData)
		});
		
		if (!response.ok) {
			const error = await response.json();
			console.error('❌ Strapi returned error:', JSON.stringify(error, null, 2));
			return;
		}
		
		const result = await response.json();
		console.log('✅ Page created successfully!');
		console.log('📥 Strapi response:');
		console.log(JSON.stringify(result, null, 2));
		console.log('');
		
		// Now fetch it back to verify userId was saved
		const pageId = result.data.documentId || result.data.id;
		console.log(`🔍 Fetching page ${pageId} to verify userId...`);
		
		const fetchResponse = await fetch(`${STRAPI_URL}/api/pages/${pageId}`, {
			headers: {
				'Authorization': `Bearer ${STRAPI_API_TOKEN}`
			}
		});
		
		const fetchedPage = await fetchResponse.json();
		console.log('📥 Fetched page data:');
		console.log(JSON.stringify(fetchedPage, null, 2));
		console.log('');
		
		const userId = fetchedPage.data?.userId || fetchedPage.data?.attributes?.userId;
		if (userId) {
			console.log('✅ SUCCESS: userId was saved:', userId);
		} else {
			console.log('❌ PROBLEM: userId was NOT saved!');
			console.log('Available fields:', Object.keys(fetchedPage.data?.attributes || fetchedPage.data || {}));
		}
		
	} catch (error) {
		console.error('❌ Error:', error.message);
	}
}

testPageCreation();
