// יצירת דפים לדוגמה למרקטפלייס
const STRAPI_URL = 'http://localhost:1337';
const STRAPI_API_TOKEN = '8ba3301bbe92b271829befae8c0c268dbe65efa2bd66517f9309d2e3127c36eca41e91db5a53deb48e8d8aaf095d700bbc4dd1ab32ad509705723f052241d1f0a352eb020cb675aa2e4d733d4bb48855d206eafed5d1196975ad06365767082044a7b5d955e5e3b43398e13aabee36a89e70392a390ef5b96bb4deff6ca43c6a';

const samplePages = [
  // חנויות
  {
    title: 'חנות הצעצועים של דני',
    slug: 'toy-store-danny',
    pageType: 'store',
    description: 'חנות צעצועים מקסימה עם מגוון רחב של צעצועים לכל הגילאים',
    city: 'תל אביב',
    phone: '03-1234567',
    email: 'danny@toys.com',
    isActive: true,
    userId: 'sample_user_1',
    htmlContent: '<h1>חנות הצעצועים של דני</h1><p>ברוכים הבאים!</p>',
    products: [
      { name: 'בובה', price: 50, description: 'בובה יפה' },
      { name: 'רכב צעצוע', price: 80, description: 'רכב מהיר' },
      { name: 'לגו', price: 120, description: 'סט לגו גדול' }
    ]
  },
  {
    title: 'חנות הבגדים של שרה',
    slug: 'clothes-store-sarah',
    pageType: 'store',
    description: 'אופנה עכשווית במחירים משתלמים',
    city: 'ירושלים',
    phone: '02-9876543',
    email: 'sarah@clothes.com',
    isActive: true,
    userId: 'sample_user_2',
    htmlContent: '<h1>חנות הבגדים של שרה</h1><p>אופנה עכשווית!</p>',
    products: [
      { name: 'חולצה', price: 90, description: 'חולצה מעוצבת' },
      { name: 'מכנסיים', price: 150, description: 'מכנסיים נוחים' },
      { name: 'שמלה', price: 200, description: 'שמלה יפה' }
    ]
  },
  {
    title: 'חנות הספרים של משה',
    slug: 'book-store-moshe',
    pageType: 'store',
    description: 'ספרים לכל הגילאים - רומנים, מתח, ילדים ועוד',
    city: 'חיפה',
    phone: '04-5555555',
    email: 'moshe@books.com',
    isActive: true,
    userId: 'sample_user_3',
    htmlContent: '<h1>חנות הספרים של משה</h1><p>ספרים מעולים!</p>',
    products: [
      { name: 'ספר ילדים', price: 40, description: 'ספר מצויר' },
      { name: 'רומן', price: 60, description: 'רומן מרתק' },
      { name: 'ספר מתח', price: 55, description: 'מתח עד הסוף' }
    ]
  },
  
  // מספרות
  {
    title: 'מספרת אלי - תל אביב',
    slug: 'barber-eli-tlv',
    pageType: 'serviceProvider',
    description: 'מספרה מקצועית לגברים - תספורות מעוצבות וגילוח',
    city: 'תל אביב',
    phone: '03-7777777',
    email: 'eli@barber.com',
    isActive: true,
    userId: 'sample_user_4',
    htmlContent: '<h1>מספרת אלי</h1><p>תספורות מקצועיות!</p>',
    products: [
      { name: 'תספורת', price: 80, description: 'תספורת מעוצבת' },
      { name: 'גילוח', price: 50, description: 'גילוח מקצועי' },
      { name: 'צבע', price: 120, description: 'צביעת שיער' }
    ]
  },
  {
    title: 'מספרת רחל - ירושלים',
    slug: 'barber-rachel-jerusalem',
    pageType: 'serviceProvider',
    description: 'מספרה לנשים - תספורות, צבעים וטיפולים',
    city: 'ירושלים',
    phone: '02-8888888',
    email: 'rachel@salon.com',
    isActive: true,
    userId: 'sample_user_5',
    htmlContent: '<h1>מספרת רחל</h1><p>יופי ואלגנטיות!</p>',
    products: [
      { name: 'תספורת נשים', price: 120, description: 'תספורת מעוצבת' },
      { name: 'צבע', price: 200, description: 'צביעה מקצועית' },
      { name: 'פן', price: 150, description: 'פן מושלם' }
    ]
  },
  
  // אירועים
  {
    title: 'אירועי חלומות - חתונות ובר מצווה',
    slug: 'dream-events',
    pageType: 'event',
    description: 'ארגון אירועים מושלם - חתונות, בר מצווה, ימי הולדת',
    city: 'תל אביב',
    phone: '03-9999999',
    email: 'info@dreamevents.com',
    isActive: true,
    userId: 'sample_user_6',
    htmlContent: '<h1>אירועי חלומות</h1><p>האירוע המושלם שלכם!</p>',
    products: [
      { name: 'חתונה', price: 50000, description: 'חתונה מושלמת' },
      { name: 'בר מצווה', price: 30000, description: 'בר מצווה בלתי נשכח' },
      { name: 'יום הולדת', price: 5000, description: 'יום הולדת מיוחד' }
    ]
  },
  {
    title: 'אירועי VIP - אירועים יוקרתיים',
    slug: 'vip-events',
    pageType: 'event',
    description: 'אירועים יוקרתיים ברמה הגבוהה ביותר',
    city: 'הרצליה',
    phone: '09-1111111',
    email: 'info@vipevents.com',
    isActive: true,
    userId: 'sample_user_7',
    htmlContent: '<h1>אירועי VIP</h1><p>יוקרה ואלגנטיות!</p>',
    products: [
      { name: 'חתונה VIP', price: 100000, description: 'חתונה יוקרתית' },
      { name: 'אירוע עסקי', price: 40000, description: 'אירוע עסקי מקצועי' }
    ]
  },
  
  // קורסים
  {
    title: 'קורס פיתוח אתרים - אקדמיית קוד',
    slug: 'web-dev-course',
    pageType: 'course',
    description: 'קורס פיתוח אתרים מקיף - HTML, CSS, JavaScript ועוד',
    city: 'תל אביב',
    phone: '03-2222222',
    email: 'info@codeacademy.com',
    isActive: true,
    userId: 'sample_user_8',
    htmlContent: '<h1>קורס פיתוח אתרים</h1><p>למד לפתח אתרים!</p>',
    products: [
      { name: 'קורס מלא', price: 5000, description: 'קורס מקיף' },
      { name: 'שיעור פרטי', price: 200, description: 'שיעור אישי' }
    ]
  },
  {
    title: 'קורס צילום מקצועי - סטודיו אור',
    slug: 'photography-course',
    pageType: 'course',
    description: 'קורס צילום מקצועי - מהבסיס ועד למתקדמים',
    city: 'ירושלים',
    phone: '02-3333333',
    email: 'info@photostu dio.com',
    isActive: true,
    userId: 'sample_user_9',
    htmlContent: '<h1>קורס צילום</h1><p>צלם כמו מקצוען!</p>',
    products: [
      { name: 'קורס בסיסי', price: 2000, description: 'קורס למתחילים' },
      { name: 'קורס מתקדם', price: 4000, description: 'קורס למתקדמים' }
    ]
  },
  
  // מסעדה
  {
    title: 'מסעדת הפיצה של יוסי',
    slug: 'pizza-yossi',
    pageType: 'restaurantMenu',
    description: 'פיצה איטלקית אמיתית - הכי טעימה בעיר!',
    city: 'תל אביב',
    phone: '03-4444444',
    email: 'yossi@pizza.com',
    isActive: true,
    userId: 'sample_user_10',
    htmlContent: '<h1>מסעדת הפיצה של יוסי</h1><p>פיצה מעולה!</p>',
    products: [
      { name: 'פיצה מרגריטה', price: 45, description: 'פיצה קלאסית' },
      { name: 'פיצה פפרוני', price: 55, description: 'עם פפרוני' },
      { name: 'פיצה ירקות', price: 50, description: 'עם ירקות טריים' },
      { name: 'פסטה', price: 40, description: 'פסטה איטלקית' }
    ]
  }
];

async function createSamplePages() {
  console.log('🚀 יוצר דפים לדוגמה...\n');
  
  let successCount = 0;
  let errorCount = 0;
  
  for (const pageData of samplePages) {
    try {
      console.log(`📄 יוצר: ${pageData.title}...`);
      
      const response = await fetch(`${STRAPI_URL}/api/pages`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${STRAPI_API_TOKEN}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ data: pageData })
      });
      
      if (response.ok) {
        const result = await response.json();
        console.log(`✅ נוצר בהצלחה! ID: ${result.data.id}`);
        successCount++;
      } else {
        const error = await response.json();
        console.log(`❌ שגיאה: ${error.error?.message || 'Unknown error'}`);
        errorCount++;
      }
      
    } catch (error) {
      console.log(`❌ שגיאה: ${error.message}`);
      errorCount++;
    }
  }
  
  console.log(`\n📊 סיכום:`);
  console.log(`✅ נוצרו בהצלחה: ${successCount} דפים`);
  console.log(`❌ שגיאות: ${errorCount} דפים`);
  
  if (successCount > 0) {
    console.log(`\n🎉 מעולה! עכשיו תוכל לראות את הדפים במרקטפלייס:`);
    console.log(`http://localhost:5173/marketplace`);
    console.log(`\nוגם לבדוק את סתיו:`);
    console.log(`פתח את המרקטפלייס ולחץ על הכפתור הסגול בפינה`);
  }
}

createSamplePages();
