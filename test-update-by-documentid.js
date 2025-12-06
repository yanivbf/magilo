// Test updating page by documentId
const STRAPI_URL = 'http://localhost:1337';
const STRAPI_API_TOKEN = '8ba3301bbe92b271829befae8c0c268dbe65efa2bd66517f9309d2e3127c36eca41e91db5a53deb48e8d8aaf095d700bbc4dd1ab32ad509705723f052241d1f0a352eb020cb675aa2e4d733d4bb48855d206eafed5d1196975ad06365767082044a7b5d955e5e3b43398e13aabee36a89e70392a390ef5b96bb4deff6ca43c6a';

async function testUpdate() {
	try {
		const documentId = 'o11gac1xczph38bebj10p2ju'; // Latest page
		
		console.log('🧪 Testing UPDATE with documentId:', documentId);
		
		// Try to update the title
		const response = await fetch(`${STRAPI_URL}/api/pages/${documentId}`, {
			method: 'PUT',
			headers: {
				'Authorization': `Bearer ${STRAPI_API_TOKEN}`,
				'Content-Type': 'application/json'
			},
			body: JSON.stringify({
				data: {
					title: 'לק גל - עודכן!'
				}
			})
		});
		
		console.log(`📡 Response status: ${response.status}`);
		
		if (response.ok) {
			const result = await response.json();
			console.log('✅ Update successful!');
			console.log(`   New title: ${result.data.title}`);
		} else {
			const error = await response.json();
			console.log('❌ Update failed:', JSON.stringify(error, null, 2));
		}
		
	} catch (error) {
		console.error('❌ Error:', error.message);
	}
}

testUpdate();
