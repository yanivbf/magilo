// Test script to update About section image directly in Strapi
const STRAPI_URL = 'http://localhost:1337';
const STRAPI_API_TOKEN = 'your-token-here'; // Get from .env

async function testUpdateAboutImage() {
	try {
		// Step 1: Get the latest page
		console.log('📄 Step 1: Getting latest page...');
		const getResponse = await fetch(`${STRAPI_URL}/api/pages?sort=createdAt:desc&populate=*`, {
			headers: {
				'Authorization': `Bearer ${STRAPI_API_TOKEN}`
			}
		});
		
		if (!getResponse.ok) {
			console.error('❌ Failed to fetch pages:', getResponse.status);
			return;
		}
		
		const getResult = await getResponse.json();
		const pages = getResult.data;
		
		if (pages.length === 0) {
			console.log('❌ No pages found');
			return;
		}
		
		const latestPage = pages[0];
		const pageId = latestPage.documentId || latestPage.id;
		console.log('✅ Found page:', latestPage.title || latestPage.attributes?.title);
		console.log('🆔 Page ID:', pageId);
		
		// Step 2: Get current sections
		const sections = latestPage.sections || latestPage.attributes?.sections || [];
		console.log('\n📦 Current sections:', sections.length);
		
		// Find About section
		const aboutSectionIndex = sections.findIndex(s => s.type === 'about');
		
		if (aboutSectionIndex === -1) {
			console.log('❌ No About section found');
			return;
		}
		
		console.log('✅ About section found at index:', aboutSectionIndex);
		console.log('📋 Current image:', sections[aboutSectionIndex].data?.image || 'NO IMAGE');
		
		// Step 3: Update the image
		const newImageUrl = 'https://images.unsplash.com/photo-1522071820081-009f0129c71c?q=80&w=600';
		console.log('\n💾 Updating image to:', newImageUrl);
		
		// Clone sections and update
		const updatedSections = JSON.parse(JSON.stringify(sections));
		updatedSections[aboutSectionIndex].data.image = newImageUrl;
		
		// Update via API
		const updateResponse = await fetch(`${STRAPI_URL}/api/pages/${pageId}`, {
			method: 'PUT',
			headers: {
				'Authorization': `Bearer ${STRAPI_API_TOKEN}`,
				'Content-Type': 'application/json'
			},
			body: JSON.stringify({
				data: {
					sections: updatedSections
				}
			})
		});
		
		if (!updateResponse.ok) {
			const error = await updateResponse.text();
			console.error('❌ Update failed:', updateResponse.status, error);
			return;
		}
		
		const updateResult = await updateResponse.json();
		console.log('✅ Update successful!');
		
		// Step 4: Verify the update
		console.log('\n🔍 Verifying update...');
		const verifyResponse = await fetch(`${STRAPI_URL}/api/pages/${pageId}?populate=*`, {
			headers: {
				'Authorization': `Bearer ${STRAPI_API_TOKEN}`
			}
		});
		
		if (!verifyResponse.ok) {
			console.error('❌ Verification failed');
			return;
		}
		
		const verifyResult = await verifyResponse.json();
		const verifiedPage = verifyResult.data;
		const verifiedSections = verifiedPage.sections || verifiedPage.attributes?.sections || [];
		const verifiedAboutSection = verifiedSections[aboutSectionIndex];
		
		console.log('📋 New image:', verifiedAboutSection.data?.image || 'NO IMAGE');
		
		if (verifiedAboutSection.data?.image === newImageUrl) {
			console.log('✅ SUCCESS! Image was saved correctly!');
		} else {
			console.log('❌ FAILED! Image was not saved');
		}
		
	} catch (error) {
		console.error('❌ Error:', error.message);
	}
}

testUpdateAboutImage();
