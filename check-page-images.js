// בדיקת תמונות בדפים
const STRAPI_URL = 'http://localhost:1337';
const STRAPI_API_TOKEN = '8ba3301bbe92b271829befae8c0c268dbe65efa2bd66517f9309d2e3127c36eca41e91db5a53deb48e8d8aaf095d700bbc4dd1ab32ad509705723f052241d1f0a352eb020cb675aa2e4d733d4bb48855d206eafed5d1196975ad06365767082044a7b5d955e5e3b43398e13aabee36a89e70392a390ef5b96bb4deff6ca43c6a';

async function checkPageImages() {
  console.log('🖼️ בודק תמונות בדפים...\n');
  
  try {
    // Get first 10 pages
    const response = await fetch(`${STRAPI_URL}/api/pages?pagination[pageSize]=10`, {
      headers: { 'Authorization': `Bearer ${STRAPI_API_TOKEN}` }
    });
    
    const data = await response.json();
    const pages = data.data || [];
    
    console.log(`📊 בודק ${pages.length} דפים:\n`);
    
    pages.forEach((page, i) => {
      console.log(`${i + 1}. ${page.title || 'ללא כותרת'} (ID: ${page.id})`);
      console.log(`   - heroImage: ${page.heroImage || 'אין'}`);
      console.log(`   - image: ${page.image || 'אין'}`);
      
      if (page.products && page.products.length > 0) {
        console.log(`   - מוצרים: ${page.products.length}`);
        const firstProduct = page.products[0];
        console.log(`     • מוצר ראשון: ${firstProduct.name}`);
        console.log(`     • תמונת מוצר: ${firstProduct.image || 'אין'}`);
      } else {
        console.log(`   - מוצרים: 0`);
      }
      
      console.log('');
    });
    
  } catch (error) {
    console.error('❌ שגיאה:', error.message);
  }
}

checkPageImages();
