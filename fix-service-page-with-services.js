const STRAPI_URL = 'http://localhost:1337';
const STRAPI_API_TOKEN = '8ba3301bbe92b271829befae8c0c268dbe65efa2bd66517f9309d2e3127c36eca41e91db5a53deb48e8d8aaf095d700bbc4dd1ab32ad509705723f052241d1f0a352eb020cb675aa2e4d733d4bb48855d206eafed5d1196975ad06365767082044a7b5d955e5e3b43398e13aabee36a89e70392a390ef5b96bb4deff6ca43c6a';

async function fixServicePageWithServices() {
  try {
    // Get latest service page
    const response = await fetch(`${STRAPI_URL}/api/pages?sort=createdAt:desc&pagination[limit]=1`, {
      headers: { 'Authorization': `Bearer ${STRAPI_API_TOKEN}` }
    });
    const data = await response.json();
    const page = data.data[0];
    
    console.log('📄 Latest page:', page.title, '(ID:', page.id, ')');
    console.log('   Slug:', page.slug);
    
    // Add services section with appointment booking functionality
    console.log('📅 Adding services section with appointment booking...');
    const servicesResponse = await fetch(`${STRAPI_URL}/api/sections`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${STRAPI_API_TOKEN}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        data: {
          type: 'services',
          enabled: true,
          order: 3,
          data: {
            title: '📅 השירותים שלנו וקביעת תורים',
            subtitle: 'בחר שירות וקבע תור בקלות',
            services: [
              {
                name: 'ייעוץ אישי',
                description: 'ייעוץ מקצועי ואישי המותאם לצרכים שלך',
                price: '200 ₪',
                duration: '60 דקות',
                icon: '👤'
              },
              {
                name: 'טיפול מקצועי',
                description: 'טיפול איכותי עם ציוד מתקדם',
                price: '300 ₪',
                duration: '90 דקות',
                icon: '🔧'
              },
              {
                name: 'ייעוץ טלפוני',
                description: 'ייעוץ מהיר וזמין בטלפון',
                price: '100 ₪',
                duration: '30 דקות',
                icon: '📞'
              }
            ],
            appointmentBooking: {
              enabled: true,
              businessName: page.title,
              businessPhone: page.phone || '',
              workingHours: 'ראשון-חמישי: 08:00-17:00',
              workingDays: ['ראשון', 'שני', 'שלישי', 'רביעי', 'חמישי'],
              timeSlots: ['08:00', '09:00', '10:00', '11:00', '12:00', '13:00', '14:00', '15:00', '16:00', '17:00']
            }
          },
          page: page.documentId || page.id
        }
      })
    });
    
    if (servicesResponse.ok) {
      const servicesData = await servicesResponse.json();
      console.log('✅ Added services section with appointment booking, ID:', servicesData.data.id);
    } else {
      const errorText = await servicesResponse.text();
      console.log('❌ Failed to add services section:', servicesResponse.status, errorText);
    }
    
    // Add contact section
    console.log('📞 Adding contact section...');
    const contactResponse = await fetch(`${STRAPI_URL}/api/sections`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${STRAPI_API_TOKEN}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        data: {
          type: 'contact',
          enabled: true,
          order: 99,
          data: {
            title: 'צור קשר',
            phone: page.phone || '',
            email: page.email || '',
            address: page.address || '',
            socialLinks: {
              facebook: '',
              instagram: '',
              whatsapp: page.phone || '',
              youtube: '',
              tiktok: '',
              linkedin: '',
              twitter: ''
            }
          },
          page: page.documentId || page.id
        }
      })
    });
    
    if (contactResponse.ok) {
      console.log('✅ Added contact section');
    } else {
      console.log('❌ Failed to add contact section:', contactResponse.status);
    }
    
    console.log('🎉 Page fixed! Now go to:', `http://localhost:5173/view/${page.slug}?newPage=true`);
    
  } catch (error) {
    console.error('Error:', error.message);
  }
}

fixServicePageWithServices();