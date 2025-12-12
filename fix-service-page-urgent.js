const STRAPI_URL = 'http://localhost:1337';
const STRAPI_API_TOKEN = '8ba3301bbe92b271829befae8c0c268dbe65efa2bd66517f9309d2e3127c36eca41e91db5a53deb48e8d8aaf095d700bbc4dd1ab32ad509705723f052241d1f0a352eb020cb675aa2e4d733d4bb48855d206eafed5d1196975ad06365767082044a7b5d955e5e3b43398e13aabee36a89e70392a390ef5b96bb4deff6ca43c6a';

async function fixLatestServicePage() {
  try {
    // Get latest service page
    const response = await fetch(`${STRAPI_URL}/api/pages?sort=createdAt:desc&pagination[limit]=1`, {
      headers: { 'Authorization': `Bearer ${STRAPI_API_TOKEN}` }
    });
    const data = await response.json();
    const page = data.data[0];
    
    console.log('📄 Latest page:', page.title, '(ID:', page.id, ')');
    console.log('   Current userId:', page.userId);
    console.log('   Page type:', page.pageType);
    console.log('   Document ID:', page.documentId);
    
    // Add appointments section
    console.log('📅 Adding appointments section...');
    const sectionResponse = await fetch(`${STRAPI_URL}/api/sections`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${STRAPI_API_TOKEN}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        data: {
          type: 'appointments',
          enabled: true,
          order: 8,
          data: {
            title: '📅 קביעת תור',
            subtitle: 'קבע תור בקלות ונוחות',
            businessName: page.title,
            businessPhone: page.phone || '',
            workingHours: 'ראשון-חמישי: 08:00-17:00',
            workingDays: 'ראשון,שני,שלישי,רביעי,חמישי'
          },
          page: page.documentId || page.id
        }
      })
    });
    
    if (sectionResponse.ok) {
      const sectionData = await sectionResponse.json();
      console.log('✅ Added appointments section with ID:', sectionData.data.id);
    } else {
      const errorText = await sectionResponse.text();
      console.log('❌ Failed to add appointments section:', sectionResponse.status, errorText);
    }
    
    // Add about section
    console.log('📝 Adding about section...');
    const aboutResponse = await fetch(`${STRAPI_URL}/api/sections`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${STRAPI_API_TOKEN}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        data: {
          type: 'about',
          enabled: true,
          order: 2,
          data: {
            title: 'אודותינו',
            content: `ברוכים הבאים ל${page.title}! אנחנו מספקים שירותים מקצועיים ואיכותיים. צרו קשר לפרטים נוספים.`,
            image: 'https://images.unsplash.com/photo-1497366216548-37526070297c?q=80&w=2069&auto=format&fit=crop'
          },
          page: page.documentId || page.id
        }
      })
    });
    
    if (aboutResponse.ok) {
      console.log('✅ Added about section');
    } else {
      console.log('❌ Failed to add about section:', aboutResponse.status);
    }
    
    console.log('🎉 Page fixed! Now go to:', `http://localhost:5173/view/${page.slug}?newPage=true`);
    
  } catch (error) {
    console.error('Error:', error.message);
  }
}

fixLatestServicePage();