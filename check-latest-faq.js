// Check FAQ in latest page
const STRAPI_URL = 'http://localhost:1337';
const STRAPI_TOKEN = '8ba3301bbe92b271829befae8c0c268dbe65efa2bd66517f9309d2e3127c36eca41e91db5a53deb48e8d8aaf095d700bbc4dd1ab32ad509705723f052241d1f0a352eb020cb675aa2e4d733d4bb48855d206eafed5d1196975ad06365767082044a7b5d955e5e3b43398e13aabee36a89e70392a390ef5b96bb4deff6ca43c6a';

async function checkLatestFAQ() {
	try {
		console.log('🔍 Fetching latest page...');
		
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
		const attrs = page.attributes || page;
		
		console.log('\n📄 Latest Page:', attrs.title);
		console.log('📄 Slug:', attrs.slug);
		
		const sections = attrs.sections || [];
		const faqSection = sections.find(s => s.type === 'faq');
		
		if (faqSection) {
			console.log('\n✅ FAQ SECTION FOUND!');
			console.log('\n📋 FAQ Title:', faqSection.data?.title);
			console.log('📋 FAQ Subtitle:', faqSection.data?.subtitle);
			console.log('📋 FAQ Items:', faqSection.data?.items?.length || 0);
			
			if (faqSection.data?.items && faqSection.data.items.length > 0) {
				console.log('\n📋 First FAQ Item:');
				console.log('   Q:', faqSection.data.items[0].question);
				console.log('   A:', faqSection.data.items[0].answer.substring(0, 100) + '...');
			}
			
			if (!faqSection.data?.subtitle) {
				console.log('\n⚠️ WARNING: FAQ subtitle is missing!');
				console.log('   This means the bot did not return faqSubtitle');
			}
		} else {
			console.log('\n❌ FAQ SECTION NOT FOUND!');
		}
		
	} catch (error) {
		console.error('❌ Error:', error.message);
	}
}

checkLatestFAQ();
