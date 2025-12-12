// בדיקה ישירה של דפים ב-Strapi
const STRAPI_URL = 'http://localhost:1337';
const STRAPI_API_TOKEN = '8ba3301bbe92b271829befae8c0c268dbe65efa2bd66517f9309d2e3127c36eca41e91db5a53deb48e8d8aaf095d700bbc4dd1ab32ad509705723f052241d1f0a352eb020cb675aa2e4d733d4bb48855d206eafed5d1196975ad06365767082044a7b5d955e5e3b43398e13aabee36a89e70392a390ef5b96bb4deff6ca43c6a';

async function checkPages() {
  console.log('🔍 בודק דפים ב-Strapi...\n');
  
  try {
    const response = await fetch(`${STRAPI_URL}/api/pages?pagination[pageSize]=100`, {
      headers: {
        'Authorization': `Bearer ${STRAPI_API_TOKEN}`
      }
    });
    
    if (!response.ok) {
      console.log('❌ שגיאה:', response.status, response.statusText);
      const error = await response.json();
      console.log('Error details:', JSON.stringify(error, null, 2));
      return;
    }
    
    const data = await response.json();
    console.log('📥 Response:', JSON.stringify(data, null, 2));
    
    const pages = data.data || [];
    console.log(`\n📊 סה"כ דפים: ${pages.length}`);
    
    if (pages.length > 0) {
      console.log('\n📋 רשימת דפים:\n');
      pages.forEach((page, index) => {
        console.log(`${index + 1}. ${page.attributes.title}`);
        console.log(`   - ID: ${page.id}`);
        console.log(`   - Slug: ${page.attributes.slug}`);
        console.log(`   - Type: ${page.attributes.pageType}`);
        console.log(`   - Active: ${page.attributes.isActive}`);
        console.log('');
      });
    }
    
  } catch (error) {
    console.error('❌ שגיאה:', error.message);
  }
}

checkPages();
