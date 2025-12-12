// Check if FAQ section exists in a page
const STRAPI_URL = 'http://localhost:1337';
const STRAPI_TOKEN = 'your-token-here'; // Replace with your token

async function checkFAQSection(slug) {
	try {
		console.log(`🔍 Checking page: ${slug}`);
		
		// Get page by slug
		const response = await fetch(
			`${STRAPI_URL}/api/pages?filters[slug][$eq]=${slug}&populate=sections`,
			{
				headers: {
					'Authorization': `Bearer ${STRAPI_TOKEN}`
				}
			}
		);
		
		if (!response.ok) {
			throw new Error(`HTTP error! status: ${response.status}`);
		}
		
		const result = await response.json();
		
		if (!result.data || result.data.length === 0) {
			console.log('❌ Page not found');
			return;
		}
		
		const page = result.data[0];
		console.log('\n📄 Page found:', page.attributes.title);
		console.log('📄 Page ID:', page.id);
		console.log('📄 Document ID:', page.documentId);
		
		const sections = page.attributes.sections || [];
		console.log('\n📋 Total sections:', sections.length);
		
		// List all sections
		console.log('\n📋 All sections:');
		sections.forEach((section, index) => {
			console.log(`  ${index + 1}. ${section.type} - enabled: ${section.enabled}`);
		});
		
		// Check for FAQ section
		const faqSection = sections.find(s => s.type === 'faq');
		
		if (faqSection) {
			console.log('\n✅ FAQ section found!');
			console.log('📋 FAQ data:', JSON.stringify(faqSection.data, null, 2));
		} else {
			console.log('\n❌ FAQ section NOT found!');
			console.log('📋 Available section types:', sections.map(s => s.type).join(', '));
		}
		
	} catch (error) {
		console.error('❌ Error:', error.message);
	}
}

// Usage: node check-faq-in-page.js <slug>
const slug = process.argv[2] || 'google-1-page-1765032575486';
checkFAQSection(slug);
