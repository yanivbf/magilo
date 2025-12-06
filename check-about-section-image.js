// Quick script to check if About section image is saved in Strapi
const STRAPI_URL = 'http://localhost:1337';
const STRAPI_API_TOKEN = 'your-token-here'; // Get from .env

async function checkAboutSectionImage() {
	try {
		// Get the latest page
		const response = await fetch(`${STRAPI_URL}/api/pages?sort=createdAt:desc&populate=*`, {
			headers: {
				'Authorization': `Bearer ${STRAPI_API_TOKEN}`
			}
		});
		
		if (!response.ok) {
			console.error('❌ Failed to fetch pages:', response.status);
			return;
		}
		
		const result = await response.json();
		const pages = result.data;
		
		if (pages.length === 0) {
			console.log('❌ No pages found');
			return;
		}
		
		const latestPage = pages[0];
		console.log('\n📄 Latest Page:', latestPage.title || latestPage.attributes?.title);
		console.log('🆔 Page ID:', latestPage.id);
		console.log('📋 Document ID:', latestPage.documentId);
		
		// Check sections
		const sections = latestPage.sections || latestPage.attributes?.sections || [];
		console.log('\n📦 Total Sections:', sections.length);
		
		// Find About section
		const aboutSection = sections.find(s => s.type === 'about');
		
		if (!aboutSection) {
			console.log('❌ No About section found');
			console.log('\nAvailable sections:', sections.map(s => s.type).join(', '));
			return;
		}
		
		console.log('\n✅ About Section Found!');
		console.log('📋 Section Data:', JSON.stringify(aboutSection.data, null, 2));
		console.log('\n🖼️ Image URL:', aboutSection.data?.image || 'NO IMAGE');
		
		if (aboutSection.data?.image) {
			console.log('✅ Image is saved in Strapi!');
		} else {
			console.log('❌ No image found in About section data');
		}
		
	} catch (error) {
		console.error('❌ Error:', error.message);
	}
}

checkAboutSectionImage();
