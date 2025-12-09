// Quick test to check if a page has designStyle
const STRAPI_URL = 'http://localhost:1337';
const STRAPI_API_TOKEN = 'your-token-here'; // Get from .env

async function checkPageDesignStyle(slug) {
	try {
		console.log(`🔍 Checking page: ${slug}`);
		
		const response = await fetch(`${STRAPI_URL}/api/pages?filters[slug][$eq]=${slug}&populate=*`, {
			headers: {
				'Authorization': `Bearer ${STRAPI_API_TOKEN}`
			}
		});
		
		if (!response.ok) {
			throw new Error(`Failed to fetch page: ${response.status}`);
		}
		
		const { data } = await response.json();
		
		if (!data || data.length === 0) {
			console.log('❌ Page not found');
			return;
		}
		
		const page = data[0];
		const designStyle = page.designStyle;
		
		console.log('\n📄 Page Details:');
		console.log(`   Title: ${page.title}`);
		console.log(`   ID: ${page.id}`);
		console.log(`   Document ID: ${page.documentId}`);
		console.log(`   Design Style: ${designStyle || '❌ MISSING'}`);
		
		if (!designStyle) {
			console.log('\n⚠️ This page is missing designStyle!');
			console.log('   Run: node fix-pages-designStyle.js');
		} else {
			console.log(`\n✅ Page has designStyle: ${designStyle}`);
		}
		
	} catch (error) {
		console.error('❌ Error:', error.message);
	}
}

// Get slug from command line argument
const slug = process.argv[2];

if (!slug) {
	console.log('Usage: node test-designStyle-check.js <page-slug>');
	console.log('Example: node test-designStyle-check.js my-store-123');
	process.exit(1);
}

checkPageDesignStyle(slug);
