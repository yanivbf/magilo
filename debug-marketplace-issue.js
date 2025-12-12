// בדיקת בעיית המרקטפלייס
const STRAPI_URL = 'http://localhost:1337';
const STRAPI_API_TOKEN = '8ba3301bbe92b271829befae8c0c268dbe65efa2bd66517f9309d2e3127c36eca41e91db5a53deb48e8d8aaf095d700bbc4dd1ab32ad509705723f052241d1f0a352eb020cb675aa2e4d733d4bb48855d206eafed5d1196975ad06365767082044a7b5d955e5e3b43398e13aabee36a89e70392a390ef5b96bb4deff6ca43c6a';

async function debugMarketplace() {
  console.log('🔍 בודק למה המרקטפלייס לא מציג דפים...\n');
  
  try {
    // 1. בדוק כמה דפים יש בכלל
    const allResponse = await fetch(`${STRAPI_URL}/api/pages?pagination[pageSize]=100`, {
      headers: { 'Authorization': `Bearer ${STRAPI_API_TOKEN}` }
    });
    const allData = await allResponse.json();
    const allPages = allData.data || [];
    
    console.log(`📊 סה"כ דפים במערכת: ${allPages.length}`);
    
    // 2. בדוק כמה דפים פעילים (isActive: true)
    const activeResponse = await fetch(
      `${STRAPI_URL}/api/pages?filters[isActive][$eq]=true&pagination[pageSize]=100`,
      { headers: { 'Authorization': `Bearer ${STRAPI_API_TOKEN}` } }
    );
    const activeData = await activeResponse.json();
    const activePages = activeData.data || [];
    
    console.log(`✅ דפים פעילים (isActive=true): ${activePages.length}`);
    
    // 3. בדוק מה המרקטפלייס API מחזיר
    console.log('\n🌍 בודק מה המרקטפלייס API מחזיר...');
    const marketResponse = await fetch('http://localhost:5173/api/pages/all/marketplace');
    const marketData = await marketResponse.json();
    
    console.log('Response status:', marketResponse.status);
    console.log('Response data:', JSON.stringify(marketData, null, 2));
    
    if (marketData.pages) {
      console.log(`\n📋 המרקטפלייס מחזיר: ${marketData.pages.length} דפים`);
    }
    
    // 4. הצג את הדפים הקיימים שלך (לא הדוגמה)
    console.log('\n📋 הדפים הקיימים שלך:\n');
    const yourPages = allPages.filter(p => 
      p.attributes.userId && 
      p.attributes.userId.startsWith('google_') &&
      !p.attributes.userId.startsWith('sample_')
    );
    
    console.log(`יש לך ${yourPages.length} דפים:`);
    yourPages.slice(0, 10).forEach((page, i) => {
      console.log(`${i + 1}. ${page.attributes.title}`);
      console.log(`   - Active: ${page.attributes.isActive}`);
      console.log(`   - Type: ${page.attributes.pageType}`);
      console.log(`   - City: ${page.attributes.city || 'לא צוין'}`);
    });
    
  } catch (error) {
    console.error('❌ שגיאה:', error.message);
  }
}

debugMarketplace();
