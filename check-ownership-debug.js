// Check ownership debug for latest page
const STRAPI_URL = 'http://localhost:1337';
const STRAPI_TOKEN = 'b6a4ef5e9c3d0a8f7b2e1d4c6a9f8e7d3c2b1a0f9e8d7c6b5a4f3e2d1c0b9a8';

async function checkLatestPage() {
	try {
		// Get latest page
		const response = await fetch(`${STRAPI_URL}/api/pages?sort=createdAt:desc&pagination[limit]=1`, {
			headers: {
				'Authorization': `Bearer ${STRAPI_TOKEN}`
			}
		});
		
		const data = await response.json();
		const page = data.data[0];
		
		if (!page) {
			console.log('❌ No pages found');
			return;
		}
		
		const attrs = page.attributes || page;
		
		console.log('\n📄 LATEST PAGE DEBUG:');
		console.log('   - Page ID:', page.id);
		console.log('   - Document ID:', page.documentId);
		console.log('   - Title:', attrs.title);
		console.log('   - Slug:', attrs.slug);
		console.log('   - userId field:', attrs.userId);
		console.log('   - metadata.createdByUserId:', attrs.metadata?.createdByUserId);
		console.log('   - user relation:', attrs.user);
		
		console.log('\n🔍 OWNERSHIP CHECK:');
		console.log('   Current userId from cookie: google_111351120503275674259');
		console.log('   Page userId:', attrs.userId);
		console.log('   Match?', attrs.userId === 'google_111351120503275674259');
		
	} catch (error) {
		console.error('❌ Error:', error.message);
	}
}

checkLatestPage();
