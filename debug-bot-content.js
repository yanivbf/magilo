// Debug script - Check if bot content is being saved to Strapi
// Run this after creating a page to see what sections were created

const STRAPI_URL = 'http://localhost:1337';
const STRAPI_TOKEN = 'your-token-here'; // Replace with your token

async function checkPageSections(slug) {
  try {
    console.log('🔍 Checking sections for page:', slug);
    
    // Get page by slug
    const pageResponse = await fetch(
      `${STRAPI_URL}/api/pages?filters[slug][$eq]=${slug}&populate=*`,
      {
        headers: {
          'Authorization': `Bearer ${STRAPI_TOKEN}`
        }
      }
    );
    
    const pageData = await pageResponse.json();
    
    if (!pageData.data || pageData.data.length === 0) {
      console.error('❌ Page not found');
      return;
    }
    
    const page = pageData.data[0];
    console.log('✅ Page found:', page.attributes.title);
    console.log('📋 Page ID:', page.id);
    console.log('📋 Document ID:', page.documentId);
    
    // Get sections for this page
    const sectionsResponse = await fetch(
      `${STRAPI_URL}/api/sections?filters[page][documentId][$eq]=${page.documentId}&populate=*`,
      {
        headers: {
          'Authorization': `Bearer ${STRAPI_TOKEN}`
        }
      }
    );
    
    const sectionsData = await sectionsResponse.json();
    
    console.log('\n📊 SECTIONS FOUND:', sectionsData.data.length);
    
    sectionsData.data.forEach((section, index) => {
      console.log(`\n--- Section ${index + 1} ---`);
      console.log('Type:', section.attributes.type);
      console.log('Enabled:', section.attributes.enabled);
      console.log('Order:', section.attributes.order);
      console.log('Data:', JSON.stringify(section.attributes.data, null, 2).substring(0, 300));
    });
    
    // Check specific sections
    const faqSection = sectionsData.data.find(s => s.attributes.type === 'faq');
    if (faqSection) {
      console.log('\n✅ FAQ Section exists');
      console.log('📋 FAQ items:', faqSection.attributes.data?.items?.length || 0);
      if (faqSection.attributes.data?.items?.length > 0) {
        console.log('📋 First FAQ:', faqSection.attributes.data.items[0]);
      }
    } else {
      console.log('\n❌ No FAQ section found');
    }
    
    const gallerySection = sectionsData.data.find(s => s.attributes.type === 'gallery');
    if (gallerySection) {
      console.log('\n✅ Gallery Section exists');
      console.log('📋 Gallery images:', gallerySection.attributes.data?.images?.length || 0);
    } else {
      console.log('\n❌ No Gallery section found');
    }
    
    const testimonialsSection = sectionsData.data.find(s => s.attributes.type === 'testimonials');
    if (testimonialsSection) {
      console.log('\n✅ Testimonials Section exists');
      console.log('📋 Testimonials:', testimonialsSection.attributes.data?.items?.length || 0);
    } else {
      console.log('\n❌ No Testimonials section found');
    }
    
    const aboutSection = sectionsData.data.find(s => s.attributes.type === 'about');
    if (aboutSection) {
      console.log('\n✅ About Section exists');
      console.log('📋 About text length:', aboutSection.attributes.data?.content?.length || 0);
      console.log('📋 About text preview:', aboutSection.attributes.data?.content?.substring(0, 100));
    } else {
      console.log('\n❌ No About section found');
    }
    
  } catch (error) {
    console.error('❌ Error:', error);
  }
}

// Usage: Replace 'your-page-slug' with the actual slug
checkPageSections('your-page-slug');
