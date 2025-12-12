// Check subscription authentication issue
const STRAPI_URL = 'http://localhost:1337';
const STRAPI_API_TOKEN = '8ba3301bbe92b271829befae8c0c268dbe65efa2bd66517f9309d2e3127c36eca41e91db5a53deb48e8d8aaf095d700bbc4dd1ab32ad509705723f052241d1f0a352eb020cb675aa2e4d733d4bb48855d206eafed5d1196975ad06365767082044a7b5d955e5e3b43398e13aabee36a89e70392a390ef5b96bb4deff6ca43c6a';

async function checkSubscriptionAuth() {
    try {
        console.log('🔍 Checking subscription authentication issue...\n');
        
        // 1. Check if we can connect to Strapi
        console.log('1. Testing Strapi connection...');
        const strapiResponse = await fetch(`${STRAPI_URL}/api/pages?pagination[limit]=5`, {
            headers: {
                'Authorization': `Bearer ${STRAPI_API_TOKEN}`
            }
        });
        
        if (!strapiResponse.ok) {
            console.log('❌ Cannot connect to Strapi:', strapiResponse.status);
            console.log('   Make sure Strapi is running on port 1337');
            return;
        }
        
        const pages = await strapiResponse.json();
        console.log('✅ Strapi connection OK');
        console.log(`   Found ${pages.data.length} pages`);
        
        if (pages.data.length > 0) {
            const firstPage = pages.data[0];
            console.log(`   First page: ID=${firstPage.id}, documentId=${firstPage.documentId}, slug=${firstPage.slug}`);
            console.log(`   Page userId: ${firstPage.userId}`);
            
            // 2. Test subscription API call (simulate what the frontend does)
            console.log('\n2. Testing subscription API call...');
            
            // This simulates the API call from the frontend
            const testPageId = firstPage.documentId || firstPage.id;
            console.log(`   Testing with pageId: ${testPageId}`);
            
            // Note: This won't work from Node.js because we don't have cookies
            // But we can check the API structure
            console.log('   API endpoint: POST /api/subscription/activate-page');
            console.log('   Expected body:', JSON.stringify({ documentId: testPageId, months: 1 }, null, 2));
            
            console.log('\n📋 To test authentication:');
            console.log('   1. Open browser to http://localhost:5173');
            console.log('   2. Login with Google');
            console.log('   3. Open test-subscription-auth.html');
            console.log(`   4. Use pageId: ${testPageId}`);
        }
        
        // 3. Check users in Strapi
        console.log('\n3. Checking users in Strapi...');
        const usersResponse = await fetch(`${STRAPI_URL}/api/users?pagination[limit]=5`, {
            headers: {
                'Authorization': `Bearer ${STRAPI_API_TOKEN}`
            }
        });
        
        if (usersResponse.ok) {
            const users = await usersResponse.json();
            console.log(`✅ Found ${users.data.length} users`);
            
            if (users.data.length > 0) {
                const firstUser = users.data[0];
                console.log(`   First user: ID=${firstUser.id}, userId=${firstUser.userId}, email=${firstUser.email}`);
            }
        } else {
            console.log('❌ Cannot fetch users:', usersResponse.status);
        }
        
    } catch (error) {
        console.error('❌ Error:', error.message);
    }
}

// Run the check
checkSubscriptionAuth();