// בדיקה מהירה - מה יש בדשבורד
const STRAPI_URL = 'http://localhost:1337';
const STRAPI_API_TOKEN = '8ba3301bbe92b271829befae8c0c268dbe65efa2bd66517f9309d2e3127c36eca41e91db5a53deb48e8d8aaf095d700bbc4dd1ab32ad509705723f052241d1f0a352eb020cb675aa2e4d733d4bb48855d206eafed5d1196975ad06365767082044a7b5d955e5e3b43398e13aabee36a89e70392a390ef5b96bb4deff6ca43c6a';

async function checkPages() {
    try {
        const response = await fetch(`${STRAPI_URL}/api/pages?populate=*`, {
            headers: {
                Authorization: `Bearer ${STRAPI_API_TOKEN}`
            }
        });
        
        const data = await response.json();
        
        console.log('📦 סה"כ דפים:', data.data?.length || 0);
        
        if (data.data && data.data.length > 0) {
            console.log('\n📄 דפים קיימים:');
            data.data.forEach(page => {
                const attrs = page.attributes || page;
                console.log(`
  - ID: ${page.id}
  - documentId: ${page.documentId}
  - slug: ${attrs.slug}
  - title: ${attrs.title}
  - pageType: ${attrs.pageType || attrs.template}
  - userId: ${attrs.userId}
                `);
            });
            
            // מצא דפי חנות
            const storePages = data.data.filter(p => {
                const attrs = p.attributes || p;
                return attrs.pageType === 'store' || attrs.template === 'store' || 
                       attrs.pageType === 'onlineStore';
            });
            
            console.log('\n🛒 דפי חנות:', storePages.length);
            storePages.forEach(page => {
                const attrs = page.attributes || page;
                console.log(`
  חנות: ${attrs.title}
  - documentId: ${page.documentId}
  - slug: ${attrs.slug}
  - URL לניהול: /manage/${page.documentId}
                `);
            });
        }
    } catch (error) {
        console.error('❌ שגיאה:', error.message);
    }
}

checkPages();
