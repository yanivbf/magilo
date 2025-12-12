const STRAPI_URL = 'http://localhost:1337';
const STRAPI_API_TOKEN = '8ba3301bbe92b271829befae8c0c268dbe65efa2bd66517f9309d2e3127c36eca41e91db5a53deb48e8d8aaf095d700bbc4dd1ab32ad509705723f052241d1f0a352eb020cb675aa2e4d733d4bb48855d206eafed5d1196975ad06365767082044a7b5d955e5e3b43398e13aabee36a89e70392a390ef5b96bb4deff6ca43c6a';

async function checkLatestPage() {
  try {
    const response = await fetch(`${STRAPI_URL}/api/pages?sort=createdAt:desc&pagination[limit]=3`, {
      headers: { 'Authorization': `Bearer ${STRAPI_API_TOKEN}` }
    });
    const data = await response.json();
    
    console.log('📄 Latest 3 Pages:');
    data.data.forEach((page, i) => {
      console.log(`\n${i+1}. Page:`);
      console.log('   ID:', page.id);
      console.log('   DocumentID:', page.documentId);
      console.log('   Title:', page.title);
      console.log('   Type:', page.pageType);
      console.log('   UserId:', page.userId);
      console.log('   Sections:', page.sections?.length || 0);
      
      if (page.sections) {
        page.sections.forEach((s, idx) => {
          console.log(`   Section ${idx}: ${s.type} (enabled: ${s.enabled})`);
        });
      }
    });
  } catch (error) {
    console.error('Error:', error.message);
  }
}

checkLatestPage();