// Fix old pages that don't have designStyle
const fetch = require('node-fetch');

const STRAPI_URL = 'http://localhost:1337';
const STRAPI_API_TOKEN = 'your-token-here'; // Replace with actual token

async function fixOldPages() {
    console.log('🔧 Fixing old pages without designStyle...\n');
    
    try {
        // Get all pages
        const response = await fetch(`${STRAPI_URL}/api/pages?pagination[limit]=1000`, {
            headers: {
                'Authorization': `Bearer ${STRAPI_API_TOKEN}`
            }
        });
        
        const result = await response.json();
        const pages = result.data || [];
        
        console.log(`📋 Found ${pages.length} pages\n`);
        
        let fixed = 0;
        let skipped = 0;
        
        for (const page of pages) {
            const pageId = page.documentId || page.id;
            const designStyle = page.designStyle;
            
            if (!designStyle || designStyle === null) {
                console.log(`🔧 Fixing page ${pageId} (${page.title})...`);
                
                // Update page with default designStyle
                const updateResponse = await fetch(`${STRAPI_URL}/api/pages/${pageId}`, {
                    method: 'PUT',
                    headers: {
                        'Authorization': `Bearer ${STRAPI_API_TOKEN}`,
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({
                        data: {
                            designStyle: 'modern' // Default to modern
                        }
                    })
                });
                
                if (updateResponse.ok) {
                    console.log(`   ✅ Fixed! Set to 'modern'\n`);
                    fixed++;
                } else {
                    console.log(`   ❌ Failed to update\n`);
                }
            } else {
                console.log(`⏭️  Page ${pageId} already has designStyle: ${designStyle}`);
                skipped++;
            }
        }
        
        console.log(`\n✅ Done!`);
        console.log(`   Fixed: ${fixed} pages`);
        console.log(`   Skipped: ${skipped} pages (already had designStyle)`);
        
    } catch (error) {
        console.error('❌ Error:', error.message);
    }
}

fixOldPages();
