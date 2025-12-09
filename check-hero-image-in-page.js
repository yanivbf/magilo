// Check if hero image is saved in Strapi for a specific page
const STRAPI_URL = 'http://localhost:1337';
const STRAPI_TOKEN = '8ba3301bbe92b271829befae8c0c268dbe65efa2bd66517f9309d2e3127c36eca41e91db5a53deb48e8d8aaf095d700bbc4dd1ab32ad509705723f052241d1f0a352eb020cb675aa2e4d733d4bb48855d206eafed5d1196975ad06365767082044a7b5d955e5e3b43398e13aabee36a89e70392a390ef5b96bb4deff6ca43c6a';

async function checkHeroImage() {
    try {
        // Get the latest page
        const response = await fetch(`${STRAPI_URL}/api/pages?sort=createdAt:desc&pagination[limit]=1&populate=*`, {
            headers: {
                'Authorization': `Bearer ${STRAPI_TOKEN}`
            }
        });
        
        const data = await response.json();
        
        if (data.data && data.data.length > 0) {
            const page = data.data[0];
            console.log('📄 Page:', page.title || page.slug);
            console.log('🆔 Document ID:', page.documentId);
            console.log('📦 Metadata:', JSON.stringify(page.metadata, null, 2));
            console.log('🖼️ Header Image:', page.metadata?.headerImage || 'NO IMAGE');
            
            if (page.metadata?.headerImage) {
                console.log('✅ Hero image EXISTS in Strapi!');
                console.log('🔗 Image URL:', page.metadata.headerImage);
            } else {
                console.log('❌ NO hero image in metadata');
            }
        } else {
            console.log('❌ No pages found');
        }
    } catch (error) {
        console.error('❌ Error:', error.message);
    }
}

checkHeroImage();
