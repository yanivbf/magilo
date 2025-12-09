// בדיקת הזמנות ב-Strapi
const STRAPI_URL = 'http://localhost:1337';
const STRAPI_API_TOKEN = '8ba3301bbe92b271829befae8c0c268dbe65efa2bd66517f9309d2e3127c36eca41e91db5a53deb48e8d8aaf095d700bbc4dd1ab32ad509705723f052241d1f0a352eb020cb675aa2e4d733d4bb48855d206eafed5d1196975ad06365767082044a7b5d955e5e3b43398e13aabee36a89e70392a390ef5b96bb4deff6ca43c6a';

async function checkPurchases() {
    try {
        console.log('🔍 בודק הזמנות ב-Strapi...');
        
        const response = await fetch(`${STRAPI_URL}/api/purchases?populate=*`, {
            headers: {
                'Authorization': `Bearer ${STRAPI_API_TOKEN}`
            }
        });
        
        if (!response.ok) {
            console.error('❌ שגיאה בקבלת הזמנות:', response.status, response.statusText);
            const text = await response.text();
            console.error('Response:', text);
            return;
        }
        
        const data = await response.json();
        
        console.log('📦 מספר הזמנות:', data.data.length);
        console.log('📋 הזמנות:');
        console.log(JSON.stringify(data.data, null, 2));
        
        if (data.data.length === 0) {
            console.log('⚠️ אין הזמנות במערכת!');
        } else {
            data.data.forEach((purchase, index) => {
                console.log(`\n--- הזמנה ${index + 1} ---`);
                console.log('ID:', purchase.id);
                console.log('שם לקוח:', purchase.attributes.customerName);
                console.log('טלפון:', purchase.attributes.customerPhone);
                console.log('סכום:', purchase.attributes.total);
                console.log('סטטוס:', purchase.attributes.status);
                console.log('מוצרים:', purchase.attributes.products);
            });
        }
        
    } catch (error) {
        console.error('❌ שגיאה:', error.message);
    }
}

checkPurchases();
