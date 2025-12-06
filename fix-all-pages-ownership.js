// Fix ownership for all pages - add userId field
const STRAPI_URL = 'http://localhost:1337';
const STRAPI_API_TOKEN = 'your-token-here'; // Will read from .env

async function fixAllPages() {
	console.log('🔧 Starting to fix all pages ownership...\n');
	
	// Read token from .env
	const fs = require('fs');
	const envContent = fs.readFileSync('new-app/.env', 'utf8');
	const tokenMatch = envContent.match(/STRAPI_API_TOKEN=(.+)/);
	const token = tokenMatch ? tokenMatch[1].trim() : STRAPI_API_TOKEN;
	
	// Your user ID
	const YOUR_USER_ID = 'ef0bfa04-0d2a-48b0-8c0e-67c8b4ed0241';
	
	try {
		// Get all pages
		const response = await fetch(`${STRAPI_URL}/api/pages?pagination[limit]=100`, {
			headers: {
				'Authorization': `Bearer ${token}`
			}
		});
		
		const data = await response.json();
		const pages = data.data || [];
		
		console.log(`📄 Found ${pages.length} pages\n`);
		
		let fixed = 0;
		let skipped = 0;
		
		for (const page of pages) {
			const pageId = page.documentId || page.id;
			const attrs = page.attributes || page;
			const currentUserId = attrs.userId;
			const metadata = attrs.metadata || {};
			
			console.log(`\n📄 Page: ${attrs.title || attrs.slug}`);
			console.log(`   ID: ${pageId}`);
			console.log(`   Current userId: ${currentUserId || 'NONE'}`);
			console.log(`   Metadata createdByUserId: ${metadata.createdByUserId || 'NONE'}`);
			
			// Check if needs fixing
			if (currentUserId === YOUR_USER_ID && metadata.createdByUserId === YOUR_USER_ID) {
				console.log(`   ✅ Already correct - skipping`);
				skipped++;
				continue;
			}
			
			// Update page
			const updateData = {
				userId: YOUR_USER_ID,
				metadata: {
					...metadata,
					createdByUserId: YOUR_USER_ID
				}
			};
			
			const updateResponse = await fetch(`${STRAPI_URL}/api/pages/${pageId}`, {
				method: 'PUT',
				headers: {
					'Authorization': `Bearer ${token}`,
					'Content-Type': 'application/json'
				},
				body: JSON.stringify({ data: updateData })
			});
			
			if (updateResponse.ok) {
				console.log(`   ✅ Fixed!`);
				fixed++;
			} else {
				const errorText = await updateResponse.text();
				console.log(`   ❌ Failed: ${errorText}`);
			}
		}
		
		console.log(`\n\n✅ Done!`);
		console.log(`   Fixed: ${fixed}`);
		console.log(`   Skipped: ${skipped}`);
		console.log(`   Total: ${pages.length}`);
		
	} catch (error) {
		console.error('❌ Error:', error.message);
	}
}

fixAllPages();
