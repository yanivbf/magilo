// Fix ownership for all my pages
const STRAPI_URL = 'http://localhost:1337';
const STRAPI_TOKEN = 'b6a4ef5e9c3d0a8f7b2e1d4c6a9f8e7d3c2b1a0f9e8d7c6b5a4f3e2d1c0b9a8';
const MY_USER_ID = 'google_111351120503275674259';

async function fixAllPages() {
	try {
		console.log('🔍 Fetching all pages...\n');
		
		const response = await fetch(`${STRAPI_URL}/api/pages?pagination[limit]=100`, {
			headers: {
				'Authorization': `Bearer ${STRAPI_TOKEN}`
			}
		});
		
		const data = await response.json();
		const pages = data.data || [];
		
		console.log(`✅ Found ${pages.length} pages\n`);
		
		let fixed = 0;
		
		for (const page of pages) {
			const attrs = page.attributes || page;
			const pageId = page.documentId || page.id;
			
			// Check if already has userId
			if (attrs.userId === MY_USER_ID) {
				console.log(`⏭️  Skip: "${attrs.title}" - already has correct userId`);
				continue;
			}
			
			console.log(`🔧 Fixing: "${attrs.title}" (${pageId})`);
			
			// Update page with userId
			const updateResponse = await fetch(`${STRAPI_URL}/api/pages/${pageId}`, {
				method: 'PUT',
				headers: {
					'Content-Type': 'application/json',
					'Authorization': `Bearer ${STRAPI_TOKEN}`
				},
				body: JSON.stringify({
					data: {
						userId: MY_USER_ID,
						metadata: {
							...(attrs.metadata || {}),
							createdByUserId: MY_USER_ID
						}
					}
				})
			});
			
			if (updateResponse.ok) {
				console.log(`   ✅ Fixed!`);
				fixed++;
			} else {
				console.log(`   ❌ Failed`);
			}
		}
		
		console.log(`\n✅ Done! Fixed ${fixed} pages`);
		
	} catch (error) {
		console.error('❌ Error:', error.message);
	}
}

fixAllPages();
