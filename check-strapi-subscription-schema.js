// Check Strapi subscription schema and test API
const STRAPI_URL = 'http://localhost:1337';
const STRAPI_API_TOKEN = '8ba3301bbe92b271829befae8c0c268dbe65efa2bd66517f9309d2e3127c36eca41e91db5a53deb48e8d8aaf095d700bbc4dd1ab32ad509705723f052241d1f0a352eb020cb675aa2e4d733d4bb48855d206eafed5d1196975ad06365767082044a7b5d955e5e3b43398e13aabee36a89e70392a390ef5b96bb4deff6ca43c6a';

async function checkStrapiConnection() {
    console.log('🔍 בודק חיבור ל-Strapi...');
    
    try {
        const response = await fetch(`${STRAPI_URL}/api/users/me`, {
            headers: {
                'Authorization': `Bearer ${STRAPI_API_TOKEN}`
            }
        });
        
        console.log('📡 Strapi connection status:', response.status);
        
        if (response.ok) {
            console.log('✅ חיבור ל-Strapi תקין');
        } else {
            console.log('❌ בעיה בחיבור ל-Strapi');
            const errorText = await response.text();
            console.log('   Error:', errorText);
        }
    } catch (error) {
        console.log('❌ שגיאה בחיבור:', error.message);
    }
}

async function checkSubscriptionSchema() {
    console.log('\n🔍 בודק סכמת subscriptions...');
    
    try {
        // Try to get subscriptions to see if the schema exists
        const response = await fetch(`${STRAPI_URL}/api/subscriptions`, {
            headers: {
                'Authorization': `Bearer ${STRAPI_API_TOKEN}`
            }
        });
        
        console.log('📡 Subscriptions API status:', response.status);
        
        if (response.ok) {
            const data = await response.json();
            console.log('✅ Subscriptions API עובד');
            console.log('   Data structure:', Object.keys(data));
            console.log('   Subscriptions count:', data.data?.length || 0);
        } else {
            console.log('❌ בעיה ב-Subscriptions API');
            const errorText = await response.text();
            console.log('   Error:', errorText);
        }
    } catch (error) {
        console.log('❌ שגיאה:', error.message);
    }
}

async function testCreateSubscription() {
    console.log('\n🔍 בודק יצירת מנוי...');
    
    const testData = {
        user: 1, // Test user ID
        page: 1, // Test page ID
        plan: 'premium',
        status: 'active',
        startDate: new Date().toISOString(),
        endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(), // 30 days from now
        autoRenew: false
    };
    
    console.log('📄 Test data:', JSON.stringify(testData, null, 2));
    
    try {
        const response = await fetch(`${STRAPI_URL}/api/subscriptions`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${STRAPI_API_TOKEN}`
            },
            body: JSON.stringify({ data: testData })
        });
        
        console.log('📡 Create subscription status:', response.status);
        
        if (response.ok) {
            const result = await response.json();
            console.log('✅ מנוי נוצר בהצלחה');
            console.log('   Result:', result.data);
            
            // Clean up - delete the test subscription
            if (result.data?.id) {
                await fetch(`${STRAPI_URL}/api/subscriptions/${result.data.id}`, {
                    method: 'DELETE',
                    headers: {
                        'Authorization': `Bearer ${STRAPI_API_TOKEN}`
                    }
                });
                console.log('🗑️ מנוי בדיקה נמחק');
            }
        } else {
            console.log('❌ שגיאה ביצירת מנוי');
            const errorText = await response.text();
            console.log('   Error:', errorText);
        }
    } catch (error) {
        console.log('❌ שגיאה:', error.message);
    }
}

async function checkUsersAndPages() {
    console.log('\n🔍 בודק משתמשים ודפים...');
    
    try {
        // Check users
        const usersResponse = await fetch(`${STRAPI_URL}/api/users?pagination[limit]=5`, {
            headers: {
                'Authorization': `Bearer ${STRAPI_API_TOKEN}`
            }
        });
        
        if (usersResponse.ok) {
            const usersData = await usersResponse.json();
            console.log('✅ Users API עובד');
            console.log('   Users count:', usersData.length || 0);
            if (usersData.length > 0) {
                console.log('   First user:', usersData[0]);
            }
        }
        
        // Check pages
        const pagesResponse = await fetch(`${STRAPI_URL}/api/pages?pagination[limit]=5`, {
            headers: {
                'Authorization': `Bearer ${STRAPI_API_TOKEN}`
            }
        });
        
        if (pagesResponse.ok) {
            const pagesData = await pagesResponse.json();
            console.log('✅ Pages API עובד');
            console.log('   Pages count:', pagesData.data?.length || 0);
            if (pagesData.data && pagesData.data.length > 0) {
                console.log('   First page:', {
                    id: pagesData.data[0].id,
                    documentId: pagesData.data[0].documentId,
                    userId: pagesData.data[0].userId
                });
            }
        }
    } catch (error) {
        console.log('❌ שגיאה:', error.message);
    }
}

// Run all checks
async function runAllChecks() {
    console.log('🚀 מתחיל בדיקות Strapi...\n');
    
    await checkStrapiConnection();
    await checkSubscriptionSchema();
    await checkUsersAndPages();
    await testCreateSubscription();
    
    console.log('\n✅ בדיקות הושלמו');
}

runAllChecks().catch(console.error);