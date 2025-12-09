// Fix all pages to have a designStyle field
const STRAPI_URL = 'http://localhost:1337';
const STRAPI_API_TOKEN = 'your-token-here'; // Get from .env

async function fixAllPages() {
	try {
		console.log('🔍 Fetching all pages...');
		
		// Get all pages
		const response = await fetch(`${STRAPI_URL}/api/pages?pagination[pageSize]=100`, {
			headers: {
				'Authorization': `Bearer ${STRAPI_API_TOKEN}`
			}
		});
		
		if (!response.ok) {
			throw new Error(`Failed to fetch pages: ${response.status}`);
		}
		
		const { data: pages } = await response.json();
		console.log(`📄 Found ${pages.length} pages`);
		
		let fixed = 0;
		let skipped = 0;
		
		for (const page of pages) {
			const pageId = page.documentId || page.id;
			const currentDesignStyle = page.designStyle;
			
			console.log(`\n📄 Page: ${page.title} (ID: ${pageId})`);
			console.log(`   Current designStyle: ${currentDesignStyle}`);
			
			// If designStyle is missing or undefined, set it to 'modern'
			if (!currentDesignStyle || currentDesignStyle === 'undefined' || currentDesignStyle === 'null') {
				console.log(`   ⚠️ Missing designStyle - setting to 'modern'`);
				
				const updateResponse = await fetch(`${STRAPI_URL}/api/pages/${pageId}`, {
					method: 'PUT',
					headers: {
						'Content-Type': 'application/json',
						'Authorization': `Bearer ${STRAPI_API_TOKEN}`
					},
					body: JSON.stringify({
						data: {
							designStyle: 'modern'
						}
					})
				});
				
				if (updateResponse.ok) {
					console.log(`   ✅ Updated to 'modern'`);
					fixed++;
				} else {
					const error = await updateResponse.text();
					console.error(`   ❌ Failed to update:`, error);
				}
			} else {
				console.log(`   ✓ Already has designStyle: ${currentDesignStyle}`);
				skipped++;
			}
		}
		
		console.log(`\n✅ Done!`);
		console.log(`   Fixed: ${fixed} pages`);
		console.log(`   Skipped: ${skipped} pages`);
		
	} catch (error) {
		console.error('❌ Error:', error.message);
	}
}

fixAllPages();
