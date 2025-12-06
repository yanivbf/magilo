// Fix ownership for existing pages
const fs = require('fs');
const path = require('path');

// Try to read token from .env file
let STRAPI_TOKEN = 'your-token-here';
try {
	const envPath = path.join(__dirname, 'new-app', '.env');
	const envContent = fs.readFileSync(envPath, 'utf8');
	const tokenMatch = envContent.match(/STRAPI_API_TOKEN=(.+)/);
	if (tokenMatch) {
		STRAPI_TOKEN = tokenMatch[1].trim();
		console.log('✅ Loaded token from .env file');
	}
} catch (error) {
	console.log('⚠️  Could not read .env file, using default token');
	console.log('   Please update STRAPI_TOKEN in this script manually');
}

const STRAPI_URL = 'http://localhost:1337';

async function fixOwnership() {
	try {
		console.log('🔍 Fetching all pages...');
		
		// Get all pages
		const pagesResponse = await fetch(`${STRAPI_URL}/api/pages?populate=*`, {
			headers: {
				'Authorization': `Bearer ${STRAPI_TOKEN}`
			}
		});
		
		const pagesData = await pagesResponse.json();
		const pages = pagesData.data;
		
		console.log(`📄 Found ${pages.length} pages`);
		
		for (const page of pages) {
			const pageId = page.documentId || page.id;
			const attrs = page.attributes || page;
			const userId = attrs.userId;
			const metadata = attrs.metadata || {};
			
			// If page has userId but no createdByUserId in metadata, add it
			if (userId && !metadata.createdByUserId) {
				console.log(`\n🔧 Fixing page: ${attrs.title} (${pageId})`);
				console.log(`   Adding createdByUserId: ${userId}`);
				
				const updatedMetadata = {
					...metadata,
					createdByUserId: userId
				};
				
				// Update the page
				const updateResponse = await fetch(`${STRAPI_URL}/api/pages/${pageId}`, {
					method: 'PUT',
					headers: {
						'Content-Type': 'application/json',
						'Authorization': `Bearer ${STRAPI_TOKEN}`
					},
					body: JSON.stringify({
						data: {
							metadata: updatedMetadata
						}
					})
				});
				
				if (updateResponse.ok) {
					console.log(`   ✅ Fixed!`);
				} else {
					const error = await updateResponse.text();
					console.log(`   ❌ Failed: ${error}`);
				}
			} else if (metadata.createdByUserId) {
				console.log(`✓ Page "${attrs.title}" already has createdByUserId`);
			} else {
				console.log(`⚠ Page "${attrs.title}" has no userId - skipping`);
			}
		}
		
		console.log('\n✅ Done! Refresh your page now.');
		
	} catch (error) {
		console.error('❌ Error:', error);
	}
}

fixOwnership();
