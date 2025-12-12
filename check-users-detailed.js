// Check users in detail to understand the authentication issue
const STRAPI_URL = 'http://localhost:1337';
const STRAPI_API_TOKEN = '8ba3301bbe92b271829befae8c0c268dbe65efa2bd66517f9309d2e3127c36eca41e91db5a53deb48e8d8aaf095d700bbc4dd1ab32ad509705723f052241d1f0a352eb020cb675aa2e4d733d4bb48855d206eafed5d1196975ad06365767082044a7b5d955e5e3b43398e13aabee36a89e70392a390ef5b96bb4deff6ca43c6a';

async function checkUsersDetailed() {
    try {
        console.log('🔍 Checking users in detail...\n');
        
        // Get all users
        const usersResponse = await fetch(`${STRAPI_URL}/api/users?pagination[limit]=20`, {
            headers: {
                'Authorization': `Bearer ${STRAPI_API_TOKEN}`
            }
        });
        
        if (!usersResponse.ok) {
            console.log('❌ Cannot fetch users:', usersResponse.status);
            return;
        }
        
        const users = await usersResponse.json();
        console.log(`✅ Found ${users.data.length} users total\n`);
        
        users.data.forEach((user, index) => {
            console.log(`User ${index + 1}:`);
            console.log(`   ID: ${user.id}`);
            console.log(`   userId: ${user.userId}`);
            console.log(`   email: ${user.email}`);
            console.log(`   name: ${user.name}`);
            console.log(`   subscriptionStatus: ${user.subscriptionStatus}`);
            console.log('');
        });
        
        // Check pages and their ownership
        console.log('📄 Checking pages and ownership...\n');
        
        const pagesResponse = await fetch(`${STRAPI_URL}/api/pages?pagination[limit]=10`, {
            headers: {
                'Authorization': `Bearer ${STRAPI_API_TOKEN}`
            }
        });
        
        let pages = null;
        if (pagesResponse.ok) {
            pages = await pagesResponse.json();
            
            pages.data.forEach((page, index) => {
                console.log(`Page ${index + 1}:`);
                console.log(`   ID: ${page.id}`);
                console.log(`   documentId: ${page.documentId}`);
                console.log(`   slug: ${page.slug}`);
                console.log(`   title: ${page.title}`);
                console.log(`   userId: ${page.userId}`);
                console.log(`   subscriptionStatus: ${page.subscriptionStatus}`);
                console.log('');
            });
        }
        
        // Find matching user-page pairs
        console.log('🔗 Looking for user-page matches...\n');
        
        const userIds = users.data.map(u => u.userId).filter(Boolean);
        
        if (pages) {
            const pageUserIds = pages.data.map(p => p.userId).filter(Boolean);
        
            console.log('User IDs in system:', userIds);
            console.log('Page user IDs:', pageUserIds);
            
            // Find matches
            const matches = [];
            userIds.forEach(userId => {
                const matchingPages = pages.data.filter(p => p.userId === userId);
                if (matchingPages.length > 0) {
                    matches.push({ userId, pages: matchingPages });
                }
            });
            
            if (matches.length > 0) {
                console.log('\n✅ Found user-page matches:');
                matches.forEach(match => {
                    console.log(`   User ${match.userId} owns ${match.pages.length} pages:`);
                    match.pages.forEach(page => {
                        console.log(`     - ${page.slug} (${page.documentId})`);
                    });
                });
            } else {
                console.log('\n❌ No user-page matches found!');
                console.log('   This might be why subscription authentication is failing.');
            }
        }
        
    } catch (error) {
        console.error('❌ Error:', error.message);
    }
}

// Run the check
checkUsersDetailed();