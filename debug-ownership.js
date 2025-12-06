// Debug script to check ownership data
const STRAPI_URL = 'http://localhost:1337';
const STRAPI_API_TOKEN = 'your-token-here'; // UPDATE THIS!

async function debugOwnership(slug) {
	try {
		console.log('🔍 Fetching page:', slug);
		
		// Get page from Strapi
		const response = await fetch(
			`${STRAPI_URL}/api/pages?filters[slug][$eq]=${slug}&populate=*`,
			{
				headers: {
					'Authorization': `Bearer ${STRAPI_API_TOKEN}`
				}
			}
		);
		
		if (!response.ok) {
			console.error('❌ Failed to fetch page:', response.status);
			return;
		}
		
		const result = await response.json();
		
		if (!result.data || result.data.length === 0) {
			console.error('❌ Page not found');
			return;
		}
		
		const page = result.data[0];
		const attrs = page.attributes || page;
		
		console.log('\n📄 PAGE DATA:');
		console.log('  - Page ID:', page.id);
		console.log('  - Document ID:', page.documentId);
		console.log('  - Slug:', attrs.slug);
		console.log('  - Title:', attrs.title);
		
		console.log('\n👤 OWNERSHIP DATA:');
		console.log('  - attrs.userId:', attrs.userId);
		console.log('  - attrs.user:', attrs.user);
		console.log('  - attrs.user?.data?.id:', attrs.user?.data?.id);
		console.log('  - attrs.user?.id:', attrs.user?.id);
		
		console.log('\n📋 METADATA:');
		console.log('  - metadata:', JSON.stringify(attrs.metadata, null, 2));
		console.log('  - metadata.createdByUserId:', attrs.metadata?.createdByUserId);
		
		console.log('\n🔑 WHAT TO CHECK:');
		console.log('  1. Open browser console on the page');
		console.log('  2. Run: document.cookie');
		console.log('  3. Find userId=XXXXX');
		console.log('  4. Compare with createdByUserId above');
		console.log('  5. They should match!');
		
		console.log('\n💡 SOLUTION:');
		if (!attrs.metadata?.createdByUserId) {
			console.log('  ❌ Page is missing createdByUserId in metadata');
			console.log('  ✅ Run fix-ownership.js to add it');
		} else {
			console.log('  ✅ Page has createdByUserId:', attrs.metadata.createdByUserId);
			console.log('  📝 Make sure your browser cookie userId matches this value');
		}
		
	} catch (error) {
		console.error('❌ Error:', error);
	}
}

// Get slug from command line
const slug = process.argv[2];

if (!slug) {
	console.log('Usage: node debug-ownership.js <page-slug>');
	console.log('Example: node debug-ownership.js my-page-1733410000000');
	process.exit(1);
}

debugOwnership(slug);
