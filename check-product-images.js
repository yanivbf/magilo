// בדיקת תמונות מוצרים בגלריה
const STRAPI_URL = 'http://localhost:1337';
const API_TOKEN = 'b3e0f6f9a8e7c5d4b2a1f8e7d6c5b4a3f2e1d0c9b8a7f6e5d4c3b2a1f0e9d8c7b6a5f4e3d2c1b0a9f8e7d6c5b4a3f2e1d0c9b8a7f6e5d4c3b2a1f0e9d8c7b6a5f4e3d2c1b0a9f8e7d6c5b4a3f2e1d0c9b8a7f6e5d4c3b2a1f0e9d8c7';

async function checkProductImages() {
	try {
		console.log('🔍 מחפש דפים עם גלריית מוצרים...\n');
		
		// Get all pages
		const response = await fetch(`${STRAPI_URL}/api/pages?populate=*`, {
			headers: {
				'Authorization': `Bearer ${API_TOKEN}`
			}
		});
		
		if (!response.ok) {
			throw new Error(`HTTP error! status: ${response.status}`);
		}
		
		const result = await response.json();
		const pages = result.data;
		
		console.log(`📄 נמצאו ${pages.length} דפים\n`);
		
		// Find pages with ProductsGallery section
		for (const page of pages) {
			const sections = page.sections || [];
			const productsSection = sections.find(s => s.type === 'ProductsGallery');
			
			if (productsSection) {
				console.log(`\n📦 דף: ${page.title || page.slug}`);
				console.log(`   ID: ${page.documentId}`);
				console.log(`   Slug: ${page.slug}`);
				
				const products = productsSection.data?.products || [];
				console.log(`   מוצרים: ${products.length}`);
				
				if (products.length > 0) {
					console.log('\n   🖼️ תמונות מוצרים:');
					products.forEach((product, index) => {
						console.log(`   ${index + 1}. ${product.name}`);
						console.log(`      תמונה: ${product.image || '❌ אין תמונה'}`);
						console.log(`      מחיר: ₪${product.price}`);
					});
				}
			}
		}
		
	} catch (error) {
		console.error('❌ שגיאה:', error.message);
	}
}

checkProductImages();
