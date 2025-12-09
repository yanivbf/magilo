// Quick check for FAQ section in latest page
const STRAPI_URL = 'http://localhost:1337';
const STRAPI_TOKEN = '8ba3301bbe92b271829befae8c0c268dbe65efa2bd66517f9309d2e3127c36eca41e91db5a53deb48e8d8aaf095d700bbc4dd1ab32ad509705723f052241d1f0a352eb020cb675aa2e4d733d4bb48855d206eafed5d1196975ad06365767082044a7b5d955e5e3b43398e13aabee36a89e70392a390ef5b96bb4deff6ca43c6a';

async function checkLatestPage() {
	try {
		console.log('🔍 Fetching latest page...');
		
		// Get latest page with sections
		const response = await fetch(
			`${STRAPI_URL}/api/pages?sort=createdAt:desc&pagination[limit]=1&populate=sections`,
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
			console.log('❌ No pages found');
			return;
		}
		
		const page = result.data[0];
		
		// Handle both Strapi v4 (attributes) and v5 (direct) formats
		const attrs = page.attributes || page;
		
		console.log('\n📄 Latest Page:', attrs.title);
		console.log('📄 Slug:', attrs.slug);
		console.log('📄 Document ID:', page.documentId);
		
		const sections = attrs.sections || [];
		console.log('\n📋 Total sections:', sections.length);
		
		// List all sections with details
		console.log('\n📋 All sections:');
		sections.forEach((section, index) => {
			console.log(`\n  ${index + 1}. Type: ${section.type}`);
			console.log(`     Enabled: ${section.enabled}`);
			console.log(`     Order: ${section.order}`);
			if (section.id) console.log(`     ID: ${section.id}`);
			if (section.data?.title) console.log(`     Title: ${section.data.title}`);
		});
		
		// Check for FAQ section specifically
		const faqSection = sections.find(s => s.type === 'faq');
		
		if (faqSection) {
			console.log('\n✅ FAQ SECTION FOUND!');
			console.log('📋 FAQ enabled:', faqSection.enabled);
			console.log('📋 FAQ order:', faqSection.order);
			console.log('📋 FAQ data:', JSON.stringify(faqSection.data, null, 2));
		} else {
			console.log('\n❌ FAQ SECTION NOT FOUND!');
			console.log('📋 Available types:', sections.map(s => s.type).join(', '));
		}
		
	} catch (error) {
		console.error('❌ Error:', error.message);
		console.error(error.stack);
	}
}

checkLatestPage();
