// Script to check and fix pages in Strapi
const STRAPI_URL = 'http://localhost:1337';
const STRAPI_API_TOKEN = '8ba3301bbe92b271829befae8c0c268dbe65efa2bd66517f9309d2e3127c36eca41e91db5a53deb48e8d8aaf095d700bbc4dd1ab32ad509705723f052241d1f0a352eb020cb675aa2e4d733d4bb48855d206eafed5d1196975ad06365767082044a7b5d955e5e3b43398e13aabee36a89e70392a390ef5b96bb4deff6ca43c6a';

async function checkAndFixPages() {
	try {
		console.log('🔍 Fetching all pages from Strapi...');
		
		const response = await fetch(`${STRAPI_URL}/api/pages?populate=*`, {
			headers: {
				'Authorization': `Bearer ${STRAPI_API_TOKEN}`
			}
		});
		
		if (!response.ok) {
			throw new Error(`Failed to fetch pages: ${response.status}`);
		}
		
		const result = await response.json();
		const pages = result.data || [];
		
		console.log(`\n📊 Found ${pages.length} pages\n`);
		
		for (const page of pages) {
			const attrs = page.attributes || page;
			console.log(`\n📄 Page ID: ${page.id}`);
			console.log(`   documentId: ${page.documentId}`);
			console.log(`   title: "${attrs.title || 'MISSING'}"`);
			console.log(`   slug: "${attrs.slug || 'MISSING'}"`);
			console.log(`   pageType: ${attrs.pageType}`);
			console.log(`   userId: ${attrs.userId || 'MISSING'}`);
			console.log(`   user relation: ${attrs.user?.data?.id || 'MISSING'}`);
			
			// Check if title is missing
			if (!attrs.title || attrs.title.trim() === '') {
				console.log(`   ⚠️  WARNING: Title is missing!`);
				
				// Try to generate a title from pageType
				const pageTypeLabels = {
					'store': 'חנות מקוונת',
					'onlineStore': 'חנות מקוונת',
					'event': 'אירוע',
					'service': 'שירות',
					'serviceProvider': 'שירות',
					'restaurant': 'מסעדה',
					'restaurantMenu': 'מסעדה',
					'course': 'קורס',
					'workshop': 'סדנה',
					'messageInBottle': 'הודעה בבקבוק',
					'generic': 'דף נחיתה'
				};
				
				const suggestedTitle = pageTypeLabels[attrs.pageType] || 'דף נחיתה';
				console.log(`   💡 Suggested title: "${suggestedTitle}"`);
				
				// Update the page with a title
				console.log(`   🔧 Fixing title...`);
				const updateResponse = await fetch(`${STRAPI_URL}/api/pages/${page.documentId || page.id}`, {
					method: 'PUT',
					headers: {
						'Authorization': `Bearer ${STRAPI_API_TOKEN}`,
						'Content-Type': 'application/json'
					},
					body: JSON.stringify({
						data: {
							title: suggestedTitle
						}
					})
				});
				
				if (updateResponse.ok) {
					console.log(`   ✅ Title fixed!`);
				} else {
					console.log(`   ❌ Failed to fix title: ${updateResponse.status}`);
				}
			}
			
			// Check if slug is missing
			if (!attrs.slug || attrs.slug.trim() === '') {
				console.log(`   ⚠️  WARNING: Slug is missing!`);
			}
		}
		
		console.log('\n✅ Check complete!');
		
	} catch (error) {
		console.error('❌ Error:', error.message);
	}
}

// Run the script
checkAndFixPages();
