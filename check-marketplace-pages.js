// בדיקת דפים במרקטפלייס
const STRAPI_URL = 'http://localhost:1337';
const STRAPI_API_TOKEN = 'b0f1e8c8e3f8b8e8e8e8e8e8e8e8e8e8e8e8e8e8e8e8e8e8e8e8e8e8e8e8e8e8e8e8e8e8e8e8e8e8e8e8e8e8e8e8e8e8e8e8e8e8e8e8e8e8e8e8e8e8e8e8e8e8';

async function checkMarketplacePages() {
  console.log('🔍 בודק דפים במרקטפלייס...\n');
  
  try {
    // 1. בדוק כמה דפים יש בכלל
    const allPagesResponse = await fetch(`${STRAPI_URL}/api/pages?pagination[pageSize]=100`, {
      headers: {
        'Authorization': `Bearer ${STRAPI_API_TOKEN}`
      }
    });
    
    const allPagesData = await allPagesResponse.json();
    const allPages = allPagesData.data || [];
    
    console.log(`📊 סה"כ דפים במערכת: ${allPages.length}`);
    
    // 2. בדוק כמה דפים פעילים (isActive: true)
    const activePagesResponse = await fetch(
      `${STRAPI_URL}/api/pages?filters[isActive][$eq]=true&pagination[pageSize]=100`,
      {
        headers: {
          'Authorization': `Bearer ${STRAPI_API_TOKEN}`
        }
      }
    );
    
    const activePagesData = await activePagesResponse.json();
    const activePages = activePagesData.data || [];
    
    console.log(`✅ דפים פעילים (isActive=true): ${activePages.length}`);
    
    // 3. הצג את כל הדפים ואת הסטטוס שלהם
    console.log('\n📋 רשימת כל הדפים:\n');
    
    allPages.forEach((page, index) => {
      const isActive = page.attributes.isActive;
      const title = page.attributes.title;
      const pageType = page.attributes.pageType;
      const slug = page.attributes.slug;
      
      console.log(`${index + 1}. ${isActive ? '✅' : '❌'} ${title}`);
      console.log(`   - Slug: ${slug}`);
      console.log(`   - Type: ${pageType}`);
      console.log(`   - Active: ${isActive}`);
      console.log('');
    });
    
    // 4. אם אין דפים פעילים, הצע לתקן
    if (activePages.length === 0 && allPages.length > 0) {
      console.log('⚠️ אין דפים פעילים! כל הדפים מוגדרים כ-isActive=false');
      console.log('\n🔧 כדי לתקן, הרץ את הסקריפט: activate-all-pages.js');
    }
    
    // 5. בדוק אם יש דפים בלי userId
    const pagesWithoutUser = allPages.filter(p => !p.attributes.userId);
    if (pagesWithoutUser.length > 0) {
      console.log(`\n⚠️ ${pagesWithoutUser.length} דפים ללא userId (לא משויכים למשתמש)`);
    }
    
  } catch (error) {
    console.error('❌ שגיאה:', error.message);
  }
}

checkMarketplacePages();
