// Check what's actually in Strapi for sections

const STRAPI_URL = 'http://localhost:1337';
const STRAPI_TOKEN = '8ba3301bbe92b271829befae8c0c268dbe65efa2bd66517f9309d2e3127c36eca41e91db5a53deb48e8d8aaf095d700bbc4dd1ab32ad509705723f052241d1f0a352eb020cb675aa2e4d733d4bb48855d206eafed5d1196975ad06365767082044a7b5d955e5e3b43398e13aabee36a89e70392a390ef5b96bb4deff6ca43c6a';

const pageId = 'fatwpc2p7xxnl9x9sm7nfv8r';

console.log('🔍 Checking page in Strapi...');
console.log('📄 Page ID:', pageId);

fetch(`${STRAPI_URL}/api/pages/${pageId}?populate[0]=sections`, {
	headers: {
		'Authorization': `Bearer ${STRAPI_TOKEN}`
	}
})
.then(res => {
	console.log('\n📡 Response status:', res.status);
	return res.json();
})
.then(data => {
	console.log('\n📦 Full response:', JSON.stringify(data, null, 2));
	
	if (data.data) {
		const sections = data.data.sections;
		console.log('\n📋 Sections array:', JSON.stringify(sections, null, 2));
		
		if (sections && sections.length > 0) {
			console.log('\n📦 First section:', JSON.stringify(sections[0], null, 2));
			console.log('\n✅ First section title:', sections[0]?.data?.title);
		} else {
			console.log('\n❌ No sections found!');
		}
	} else {
		console.log('\n❌ No data in response');
	}
})
.catch(error => {
	console.error('❌ Error:', error);
});
