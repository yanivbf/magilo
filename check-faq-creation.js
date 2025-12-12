// בדיקה מהירה - האם FAQ נוצר בדף האחרון
const STRAPI_URL = 'http://localhost:1337';
const STRAPI_TOKEN = 'your-token-here'; // תחליף בטוקן שלך

async function checkLatestPage() {
    try {
        // קבל את הדף האחרון
        const response = await fetch(`${STRAPI_URL}/api/pages?sort=createdAt:desc&pagination[limit]=1&populate=*`, {
            headers: {
                'Authorization': `Bearer ${STRAPI_TOKEN}`
            }
        });
        
        const result = await response.json();
        const page = result.data[0];
        
        console.log('📄 הדף האחרון שנוצר:');
        console.log('   - ID:', page.id);
        console.log('   - כותרת:', page.title);
        console.log('   - Slug:', page.slug);
        console.log('   - נוצר:', new Date(page.createdAt).toLocaleString('he-IL'));
        
        // בדוק sections
        const sectionsResponse = await fetch(`${STRAPI_URL}/api/sections?filters[page][documentId][$eq]=${page.documentId}&sort=order:asc`, {
            headers: {
                'Authorization': `Bearer ${STRAPI_TOKEN}`
            }
        });
        
        const sectionsResult = await sectionsResponse.json();
        const sections = sectionsResult.data;
        
        console.log('\n📋 מקטעים בדף:');
        sections.forEach(section => {
            console.log(`   - ${section.type} (enabled: ${section.enabled}, order: ${section.order})`);
            if (section.type === 'faq') {
                console.log('     ✅ FAQ נמצא!');
                console.log('     📝 כותרת:', section.data?.title);
                console.log('     📝 כותרת משנה:', section.data?.subtitle);
                console.log('     📝 מספר שאלות:', section.data?.items?.length || 0);
            }
        });
        
        const hasFAQ = sections.some(s => s.type === 'faq');
        if (!hasFAQ) {
            console.log('\n❌ אין מקטע FAQ בדף!');
            console.log('   סוגי המקטעים שנמצאו:', sections.map(s => s.type).join(', '));
        }
        
    } catch (error) {
        console.error('❌ שגיאה:', error.message);
    }
}

checkLatestPage();
