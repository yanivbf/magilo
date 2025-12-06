// Test script to verify section updates are working
// Run with: node test-section-update.js

const STRAPI_URL = 'http://localhost:1337';
const STRAPI_API_TOKEN = 'your-token-here'; // Replace with actual token from .env

async function testSectionUpdate() {
	const pageId = 287; // The numeric ID from console logs
	
	console.log('🔍 Step 1: Get current page data');
	const getResponse = await fetch(`${STRAPI_URL}/api/pages/${pageId}?populate=*`, {
		headers: {
			'Authorization': `Bearer ${STRAPI_API_TOKEN}`
		}
	});
	
	const pageData = await getResponse.json();
	console.log('📄 Current page:', JSON.stringify(pageData, null, 2));
	
	// Get current sections
	const sections = pageData.data.sections || [];
	console.log(`📦 Current sections count: ${sections.length}`);
	
	if (sections.length > 0 && sections[0].data) {
		console.log(`📍 Section 0 current image: ${sections[0].data.image}`);
		
		// Update the image
		const newImageUrl = `http://localhost:1337/uploads/test_${Date.now()}.png`;
		sections[0].data.image = newImageUrl;
		
		console.log('\n💾 Step 2: Update section image');
		const updateResponse = await fetch(`${STRAPI_URL}/api/pages/${pageId}`, {
			method: 'PUT',
			headers: {
				'Content-Type': 'application/json',
				'Authorization': `Bearer ${STRAPI_API_TOKEN}`
			},
			body: JSON.stringify({
				data: {
					sections: sections
				}
			})
		});
		
		const updateResult = await updateResponse.json();
		console.log('✅ Update response:', JSON.stringify(updateResult, null, 2));
		
		// Wait a moment
		await new Promise(resolve => setTimeout(resolve, 1000));
		
		console.log('\n🔍 Step 3: Verify the update');
		const verifyResponse = await fetch(`${STRAPI_URL}/api/pages/${pageId}?populate=*`, {
			headers: {
				'Authorization': `Bearer ${STRAPI_API_TOKEN}`,
				'Cache-Control': 'no-cache'
			}
		});
		
		const verifyData = await verifyResponse.json();
		const updatedImage = verifyData.data.sections[0].data.image;
		console.log(`📍 Section 0 updated image: ${updatedImage}`);
		
		if (updatedImage === newImageUrl) {
			console.log('\n✅ SUCCESS: Section update persisted correctly!');
		} else {
			console.log('\n❌ FAILURE: Section update did NOT persist!');
			console.log(`   Expected: ${newImageUrl}`);
			console.log(`   Got: ${updatedImage}`);
		}
	} else {
		console.log('❌ No sections found or section 0 has no data');
	}
}

testSectionUpdate().catch(console.error);
