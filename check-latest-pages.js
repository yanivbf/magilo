const STRAPI_URL = 'http://localhost:1337';
const STRAPI_API_TOKEN = '8ba3301bbe92b271829befae8c0c268dbe65efa2bd66517f9309d2e3127c36eca41e91db5a53deb48e8d8aaf095d700bbc4dd1ab32ad509705723f052241d1f0a352eb020cb675aa2e4d733d4bb48855d206eafed5d1196975ad06365767082044a7b5d955e5e3b43398e13aabee36a89e70392a390ef5b96bb4deff6ca43c6a';

async function checkLatestPages() {
  try {
    console.log('🔍 Fetching latest pages...\n');
    
    const response = await fetch(`${STRAPI_URL}/api/pages?sort=createdAt:desc&pagination[limit]=5`, {
      headers: {
        'Authorization': `Bearer ${STRAPI_API_TOKEN}`
      }
    });
    
    const data = await response.json();
    
    if (response.ok && data.data) {
      console.log(`✅ Found ${data.data.length} latest pages:\n`);
      
      data.data.forEach((page, index) => {
        console.log(`${index + 1}. ${page.title || 'ללא כותרת'}`);
        console.log(`   - ID: ${page.id}`);
        console.log(`   - documentId: ${page.documentId}`);
        console.log(`   - slug: ${page.slug}`);
        console.log(`   - pageType: ${page.pageType}`);
        console.log(`   - template: ${page.template || 'לא מוגדר'}`);
        console.log(`   - userId: ${page.userId}`);
        console.log(`   - נוצר: ${new Date(page.createdAt).toLocaleString('he-IL')}`);
        console.log('');
      });
    } else {
      console.log('❌ Error fetching pages');
    }
  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

checkLatestPages();
