const STRAPI_URL = 'http://localhost:1337';
const STRAPI_API_TOKEN = '8ba3301bbe92b271829befae8c0c268dbe65efa2bd66517f9309d2e3127c36eca41e91db5a53deb48e8d8aaf095d700bbc4dd1ab32ad509705723f052241d1f0a352eb020cb675aa2e4d733d4bb48855d206eafed5d1196975ad06365767082044a7b5d955e5e3b43398e13aabee36a89e70392a390ef5b96bb4deff6ca43c6a';

const documentId = 'srt8860tdezpn8nctrwf9t28';

async function checkPage() {
  try {
    console.log('🔍 Checking new store page:', documentId, '\n');
    
    const response = await fetch(`${STRAPI_URL}/api/pages/${documentId}?populate=*`, {
      headers: {
        'Authorization': `Bearer ${STRAPI_API_TOKEN}`
      }
    });
    
    const data = await response.json();
    
    if (response.ok && data.data) {
      const page = data.data;
      console.log('✅ Page found!');
      console.log('   - title:', page.title);
      console.log('   - pageType:', page.pageType);
      console.log('   - template:', page.template || 'לא מוגדר ❌');
      console.log('   - sections:', page.sections?.length || 0);
      console.log('   - products:', page.storeProducts?.length || 0);
      console.log('\n📋 Sections:');
      if (page.sections && page.sections.length > 0) {
        page.sections.forEach(s => {
          console.log(`   - ${s.type} (order: ${s.order}, enabled: ${s.enabled})`);
        });
      } else {
        console.log('   ❌ No sections found!');
      }
      
      console.log('\n📦 Products:');
      if (page.storeProducts && page.storeProducts.length > 0) {
        page.storeProducts.forEach(p => {
          console.log(`   - ${p.name} (₪${p.price})`);
        });
      } else {
        console.log('   ❌ No products found!');
      }
    } else {
      console.log('❌ Error:', data);
    }
  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

checkPage();
