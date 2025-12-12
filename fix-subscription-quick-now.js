// תיקון מהיר למנוי - הפעלה אוטומטית
const STRAPI_URL = 'http://localhost:1337';
const STRAPI_API_TOKEN = 'your-api-token-here'; // צריך להחליף

async function quickFixSubscription() {
    console.log('🔧 מתחיל תיקון מהיר למנוי...');
    
    try {
        // 1. מצא את המשתמש
        const userId = 'google_117656147186'; // המשתמש שלך
        console.log(`🔍 מחפש משתמש: ${userId}`);
        
        const userResponse = await fetch(
            `${STRAPI_URL}/api/users?filters[userId][$eq]=${userId}`,
            {
                headers: {
                    'Authorization': `Bearer ${STRAPI_API_TOKEN}`
                }
            }
        );
        
        if (!userResponse.ok) {
            throw new Error('לא מצאתי את המשתמש');
        }
        
        const userData = await userResponse.json();
        if (!userData.data || userData.data.length === 0) {
            throw new Error('משתמש לא קיים ב-Strapi');
        }
        
        const strapiUserId = userData.data[0].id;
        console.log(`✅ מצאתי משתמש עם ID: ${strapiUserId}`);
        
        // 2. מצא את הדף
        const pageId = 'fatwpc2p7xxnl9x9sm7nfv8r';
        console.log(`🔍 מחפש דף: ${pageId}`);
        
        const pageResponse = await fetch(
            `${STRAPI_URL}/api/pages?filters[documentId][$eq]=${pageId}`,
            {
                headers: {
                    'Authorization': `Bearer ${STRAPI_API_TOKEN}`
                }
            }
        );
        
        if (!pageResponse.ok) {
            throw new Error('לא מצאתי את הדף');
        }
        
        const pageData = await pageResponse.json();
        if (!pageData.data || pageData.data.length === 0) {
            throw new Error('דף לא קיים ב-Strapi');
        }
        
        const strapiPageId = pageData.data[0].id;
        console.log(`✅ מצאתי דף עם ID: ${strapiPageId}`);
        
        // 3. בדוק אם יש כבר מנוי
        const existingSubResponse = await fetch(
            `${STRAPI_URL}/api/subscriptions?filters[user][id][$eq]=${strapiUserId}&filters[page][id][$eq]=${strapiPageId}`,
            {
                headers: {
                    'Authorization': `Bearer ${STRAPI_API_TOKEN}`
                }
            }
        );
        
        const existingSubData = await existingSubResponse.json();
        
        if (existingSubData.data && existingSubData.data.length > 0) {
            console.log('✅ כבר יש מנוי קיים!');
            
            // עדכן את המנוי הקיים
            const subscriptionId = existingSubData.data[0].id;
            const expiryDate = new Date();
            expiryDate.setFullYear(expiryDate.getFullYear() + 1); // שנה
            
            const updateResponse = await fetch(
                `${STRAPI_URL}/api/subscriptions/${subscriptionId}`,
                {
                    method: 'PUT',
                    headers: {
                        'Authorization': `Bearer ${STRAPI_API_TOKEN}`,
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({
                        data: {
                            status: 'active',
                            plan: 'premium',
                            startDate: new Date().toISOString(),
                            expiresAt: expiryDate.toISOString(),
                            autoRenew: true
                        }
                    })
                }
            );
            
            if (updateResponse.ok) {
                console.log('🎉 מנוי עודכן בהצלחה!');
            } else {
                console.error('❌ שגיאה בעדכון מנוי');
            }
        } else {
            console.log('📝 יוצר מנוי חדש...');
            
            // צור מנוי חדש
            const expiryDate = new Date();
            expiryDate.setFullYear(expiryDate.getFullYear() + 1); // שנה
            
            const createResponse = await fetch(
                `${STRAPI_URL}/api/subscriptions`,
                {
                    method: 'POST',
                    headers: {
                        'Authorization': `Bearer ${STRAPI_API_TOKEN}`,
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({
                        data: {
                            user: strapiUserId,
                            page: strapiPageId,
                            status: 'active',
                            plan: 'premium',
                            startDate: new Date().toISOString(),
                            expiresAt: expiryDate.toISOString(),
                            autoRenew: true
                        }
                    })
                }
            );
            
            if (createResponse.ok) {
                console.log('🎉 מנוי חדש נוצר בהצלחה!');
            } else {
                const errorData = await createResponse.json();
                console.error('❌ שגיאה ביצירת מנוי:', errorData);
            }
        }
        
        console.log('✅ תיקון הושלם! נסה לרענן את הדף');
        
    } catch (error) {
        console.error('❌ שגיאה בתיקון:', error.message);
    }
}

// הרץ את התיקון
quickFixSubscription();