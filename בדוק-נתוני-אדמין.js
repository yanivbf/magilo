// בדיקת נתוני אדמין - מה באמת מגיע מהשרת
const STRAPI_URL = 'http://localhost:1337';
const STRAPI_TOKEN = '8ba3301bbe92b271829befae8c0c268dbe65efa2bd66517f9309d2e3127c36eca41e91db5a53deb48e8d8aaf095d700bbc4dd1ab32ad509705723f052241d1f0a352eb020cb675aa2e4d733d4bb48855d206eafed5d1196975ad06365767082044a7b5d955e5e3b43398e13aabee36a89e70392a390ef5b96bb4deff6ca43c6a';

async function checkAdminData() {
    console.log('🔍 בודק נתוני אדמין...\n');
    
    try {
        // 1. בדוק משתמשים
        console.log('👥 בודק משתמשים...');
        const usersRes = await fetch(`${STRAPI_URL}/api/users?populate=*&sort=createdAt:desc`, {
            headers: { 'Authorization': `Bearer ${STRAPI_TOKEN}` }
        });
        
        if (usersRes.ok) {
            const users = await usersRes.json();
            console.log(`✅ נמצאו ${users.length || 0} משתמשים`);
            if (users.length > 0) {
                console.log('📋 משתמש ראשון:', {
                    id: users[0].id,
                    username: users[0].username,
                    email: users[0].email
                });
            }
        } else {
            console.log('❌ שגיאה בטעינת משתמשים:', usersRes.status);
        }
        
        console.log('');
        
        // 2. בדוק דפים
        console.log('📄 בודק דפים...');
        const pagesRes = await fetch(`${STRAPI_URL}/api/pages?populate=*&sort=createdAt:desc`, {
            headers: { 'Authorization': `Bearer ${STRAPI_TOKEN}` }
        });
        
        if (pagesRes.ok) {
            const pages = await pagesRes.json();
            const pagesCount = pages.data?.length || 0;
            console.log(`✅ נמצאו ${pagesCount} דפים`);
            if (pagesCount > 0) {
                const firstPage = pages.data[0];
                console.log('📋 דף ראשון:', {
                    id: firstPage.id,
                    documentId: firstPage.documentId,
                    title: firstPage.title || firstPage.attributes?.title,
                    slug: firstPage.slug || firstPage.attributes?.slug,
                    pageType: firstPage.pageType || firstPage.attributes?.pageType
                });
            }
        } else {
            console.log('❌ שגיאה בטעינת דפים:', pagesRes.status);
        }
        
        console.log('');
        
        // 3. בדוק רכישות
        console.log('🛒 בודק רכישות...');
        const purchasesRes = await fetch(`${STRAPI_URL}/api/purchases?populate=*&sort=createdAt:desc`, {
            headers: { 'Authorization': `Bearer ${STRAPI_TOKEN}` }
        });
        
        if (purchasesRes.ok) {
            const purchases = await purchasesRes.json();
            const purchasesCount = purchases.data?.length || 0;
            console.log(`✅ נמצאו ${purchasesCount} רכישות`);
            if (purchasesCount > 0) {
                const firstPurchase = purchases.data[0];
                console.log('📋 רכישה ראשונה:', {
                    id: firstPurchase.id,
                    productName: firstPurchase.attributes?.productName,
                    totalPrice: firstPurchase.attributes?.totalPrice,
                    customerName: firstPurchase.attributes?.customerName
                });
            }
        } else {
            console.log('❌ שגיאה בטעינת רכישות:', purchasesRes.status);
        }
        
        console.log('');
        
        // 4. בדוק מנויים
        console.log('💎 בודק מנויים פעילים...');
        const subscriptionsRes = await fetch(`${STRAPI_URL}/api/subscriptions?populate=*&filters[status][$eq]=active`, {
            headers: { 'Authorization': `Bearer ${STRAPI_TOKEN}` }
        });
        
        if (subscriptionsRes.ok) {
            const subscriptions = await subscriptionsRes.json();
            const subsCount = subscriptions.data?.length || 0;
            console.log(`✅ נמצאו ${subsCount} מנויים פעילים`);
            if (subsCount > 0) {
                const firstSub = subscriptions.data[0];
                console.log('📋 מנוי ראשון:', {
                    id: firstSub.id,
                    status: firstSub.attributes?.status,
                    startDate: firstSub.attributes?.startDate,
                    expiryDate: firstSub.attributes?.expiryDate
                });
            }
        } else {
            console.log('❌ שגיאה בטעינת מנויים:', subscriptionsRes.status);
        }
        
        console.log('');
        console.log('✅ בדיקה הושלמה!');
        
    } catch (error) {
        console.error('❌ שגיאה:', error.message);
    }
}

checkAdminData();
