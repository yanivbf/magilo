// תיקון מהיר - הפעלת מנוי ישירות ב-Strapi
const fetch = require('node-fetch');

const STRAPI_URL = 'http://localhost:1337';
// צריך להחליף עם ה-API Token שלך מ-Strapi Admin
const STRAPI_API_TOKEN = 'your-strapi-api-token-here';

async function fixSubscriptionDirect() {
    console.log('🚀 מתחיל תיקון מנוי ישיר...');
    
    try {
        const userId = 'google_117656147186'; // המשתמש שלך
        const pageDocumentId = 'fatwpc2p7xxnl9x9sm7nfv8r'; // הדף שלך
        
        console.log(`👤 משתמש: ${userId}`);
        console.log(`📄 דף: ${pageDocumentId}`);
        
        // 1. מצא את המשתמש ב-Strapi
        console.log('🔍 מחפש משתמש...');
        const userResponse = await fetch(
            `${STRAPI_URL}/api/users?filters[userId][$eq]=${userId}`,
            {
                headers: {
                    'Authorization': `Bearer ${STRAPI_API_TOKEN}`
                }
            }
        );
        
        if (!userResponse.ok) {
            throw new Error(`שגיאה בחיפוש משתמש: ${userResponse.status}`);
        }
        
        const userData = await userResponse.json();
        if (!userData.data || userData.data.length === 0) {
            throw new Error('משתמש לא נמצא ב-Strapi');
        }
        
        const strapiUserId = userData.data[0].id;
        console.log(`✅ נמצא משתמש: ID ${strapiUserId}`);
        
        // 2. מצא את הדף ב-Strapi
        console.log('🔍 מחפש דף...');
        const pageResponse = await fetch(
            `${STRAPI_URL}/api/pages?filters[documentId][$eq]=${pageDocumentId}`,
            {
                headers: {
                    'Authorization': `Bearer ${STRAPI_API_TOKEN}`
                }
            }
        );
        
        if (!pageResponse.ok) {
            throw new Error(`שגיאה בחיפוש דף: ${pageResponse.status}`);
        }
        
        const pageData = await pageResponse.json();
        if (!pageData.data || pageData.data.length === 0) {
            throw new Error('דף לא נמצא ב-Strapi');
        }
        
        const strapiPageId = pageData.data[0].id;
        console.log(`✅ נמצא דף: ID ${strapiPageId}`);
        
        // 3. בדוק אם יש כבר מנוי
        console.log('🔍 בודק מנוי קיים...');
        const existingSubResponse = await fetch(
            `${STRAPI_URL}/api/subscriptions?filters[user][id][$eq]=${strapiUserId}&filters[page][id][$eq]=${strapiPageId}`,
            {
                headers: {
                    'Authorization': `Bearer ${STRAPI_API_TOKEN}`
                }
            }
        );
        
        const existingSubData = await existingSubResponse.json();
        
        // 4. צור או עדכן מנוי
        const expiryDate = new Date();
        expiryDate.setFullYear(expiryDate.getFullYear() + 1); // שנה מהיום
        
        const subscriptionData = {
            user: strapiUserId,
            page: strapiPageId,
            status: 'active',
            plan: 'premium',
            startDate: new Date().toISOString(),
            expiresAt: expiryDate.toISOString(),
            autoRenew: true
        };
        
        if (existingSubData.data && existingSubData.data.length > 0) {
            // עדכן מנוי קיים
            const subscriptionId = existingSubData.data[0].id;
            console.log(`🔄 מעדכן מנוי קיים: ID ${subscriptionId}`);
            
            const updateResponse = await fetch(
                `${STRAPI_URL}/api/subscriptions/${subscriptionId}`,
                {
                    method: 'PUT',
                    headers: {
                        'Authorization': `Bearer ${STRAPI_API_TOKEN}`,
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({
                        data: subscriptionData
                    })
                }
            );
            
            if (updateResponse.ok) {
                console.log('✅ מנוי עודכן בהצלחה!');
            } else {
                const errorData = await updateResponse.json();
                console.error('❌ שגיאה בעדכון מנוי:', errorData);
            }
        } else {
            // צור מנוי חדש
            console.log('📝 יוצר מנוי חדש...');
            
            const createResponse = await fetch(
                `${STRAPI_URL}/api/subscriptions`,
                {
                    method: 'POST',
                    headers: {
                        'Authorization': `Bearer ${STRAPI_API_TOKEN}`,
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({
                        data: subscriptionData
                    })
                }
            );
            
            if (createResponse.ok) {
                const newSub = await createResponse.json();
                console.log('✅ מנוי חדש נוצר בהצלחה!');
                console.log(`📋 פרטי מנוי: ID ${newSub.data.id}`);
            } else {
                const errorData = await createResponse.json();
                console.error('❌ שגיאה ביצירת מנוי:', errorData);
            }
        }
        
        // 5. אמת שהמנוי עובד
        console.log('🔍 מאמת מנוי...');
        const verifyResponse = await fetch(
            `${STRAPI_URL}/api/subscriptions?filters[user][id][$eq]=${strapiUserId}&filters[page][id][$eq]=${strapiPageId}&populate=*`,
            {
                headers: {
                    'Authorization': `Bearer ${STRAPI_API_TOKEN}`
                }
            }
        );
        
        if (verifyResponse.ok) {
            const verifyData = await verifyResponse.json();
            if (verifyData.data && verifyData.data.length > 0) {
                const sub = verifyData.data[0].attributes;
                console.log('🎉 אימות הצליח!');
                console.log(`📊 סטטוס: ${sub.status}`);
                console.log(`📅 תוקף עד: ${sub.expiresAt}`);
                console.log(`💎 תוכנית: ${sub.plan}`);
            }
        }
        
        console.log('✅ תיקון הושלם בהצלחה!');
        console.log('🔄 עכשיו רענן את הדף בדפדפן');
        
    } catch (error) {
        console.error('❌ שגיאה בתיקון:', error.message);
        console.log('\n💡 פתרונות אפשריים:');
        console.log('1. בדוק שה-Strapi רץ על http://localhost:1337');
        console.log('2. בדוק שה-API Token נכון');
        console.log('3. בדוק שהמשתמש והדף קיימים ב-Strapi');
    }
}

// הרץ את התיקון
if (require.main === module) {
    fixSubscriptionDirect();
}

module.exports = { fixSubscriptionDirect };