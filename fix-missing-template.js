// Fix pages with missing template field
const STRAPI_URL = 'http://localhost:1337';
const STRAPI_API_TOKEN = 'b7c4c0a8a1f9c8e0b5d4e3f2a1b0c9d8e7f6a5b4c3d2e1f0a9b8c7d6e5f4a3b2c1d0e9f8a7b6c5d4e3f2a1b0c9d8';

async function fixMissingTemplates() {
    console.log('🔍 Fetching all pages...\n');
    
    const response = await fetch(`${STRAPI_URL}/api/pages?pagination[limit]=1000`, {
        headers: {
            'Authorization': `Bearer ${STRAPI_API_TOKEN}`
        }
    });
    
    const data = await response.json();
    const pages = data.data || [];
    
    console.log(`✅ Found ${pages.length} pages\n`);
    
    let fixed = 0;
    let skipped = 0;
    
    for (const page of pages) {
        const pageData = page.attributes || page;
        const template = pageData.template;
        const pageType = pageData.pageType;
        const documentId = page.documentId;
        const title = pageData.title;
        
        if (!template || template === 'לא מוגדר') {
            console.log(`🔧 Fixing: ${title} (ID: ${page.id})`);
            console.log(`   pageType: ${pageType} → template: ${pageType}`);
            
            const updateResponse = await fetch(`${STRAPI_URL}/api/pages/${documentId}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${STRAPI_API_TOKEN}`
                },
                body: JSON.stringify({
                    data: {
                        template: pageType
                    }
                })
            });
            
            if (updateResponse.ok) {
                console.log(`   ✅ Fixed!\n`);
                fixed++;
            } else {
                console.log(`   ❌ Failed to update\n`);
            }
        } else {
            skipped++;
        }
    }
    
    console.log(`\n✅ Done!`);
    console.log(`   Fixed: ${fixed} pages`);
    console.log(`   Skipped: ${skipped} pages (already have template)`);
}

fixMissingTemplates().catch(console.error);
