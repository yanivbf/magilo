// Quick fix for page ownership issues
// Run this to fix pages that belong to the wrong user

const STRAPI_URL = 'http://localhost:1337';
const STRAPI_API_TOKEN = 'your-token-here'; // Replace with actual token

async function fixPageOwnership() {
    console.log('🔧 Starting page ownership fix...');
    
    try {
        // Get current user from cookie (simulate browser)
        const userId = 'google_111351120503275674259'; // Replace with actual userId
        console.log('👤 Current user:', userId);
        
        // Get all pages for this user
        const response = await fetch(
            `${STRAPI_URL}/api/pages?filters[userId][$eq]=${userId}`,
            {
                headers: {
                    'Authorization': `Bearer ${STRAPI_API_TOKEN}`
                }
            }
        );
        
        if (!response.ok) {
            throw new Error(`Failed to fetch pages: ${response.status}`);
        }
        
        const result = await response.json();
        const pages = result.data || [];
        
        console.log(`📄 Found ${pages.length} pages for user ${userId}`);
        
        if (pages.length === 0) {
            console.log('⚠️ No pages found. User needs to create a new page.');
            return;
        }
        
        // Check each page
        for (const page of pages) {
            const pageData = page.attributes || page;
            const pageUserId = pageData.userId;
            const pageId = page.documentId || page.id;
            
            console.log(`\n📋 Page: ${pageData.title}`);
            console.log(`   ID: ${pageId}`);
            console.log(`   Current userId: ${pageUserId}`);
            
            if (pageUserId === userId) {
                console.log('   ✅ Ownership is correct');
            } else {
                console.log('   ❌ Wrong owner! Fixing...');
                
                // Update the page to have correct userId
                const updateResponse = await fetch(
                    `${STRAPI_URL}/api/pages/${pageId}`,
                    {
                        method: 'PUT',
                        headers: {
                            'Authorization': `Bearer ${STRAPI_API_TOKEN}`,
                            'Content-Type': 'application/json'
                        },
                        body: JSON.stringify({
                            data: {
                                userId: userId
                            }
                        })
                    }
                );
                
                if (updateResponse.ok) {
                    console.log('   ✅ Fixed ownership!');
                } else {
                    console.log('   ❌ Failed to fix ownership');
                }
            }
        }
        
        console.log('\n🎉 Page ownership fix completed!');
        
    } catch (error) {
        console.error('❌ Error:', error.message);
    }
}

// Run the fix
fixPageOwnership();