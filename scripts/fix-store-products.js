// Script to fix existing store page by adding products gallery section
import { readFileSync } from 'fs';

// Read .env file manually
let STRAPI_TOKEN = '';
try {
	const envContent = readFileSync('new-app/.env', 'utf-8');
	const tokenMatch = envContent.match(/STRAPI_API_TOKEN=(.+)/);
	if (tokenMatch) {
		STRAPI_TOKEN = tokenMatch[1].trim();
	}
} catch (e) {
	console.error('Could not read .env file');
}

const STRAPI_URL = 'http://localhost:1337';

// Sample products
const sampleProducts = [
	{
		id: 1,
		name: 'מוצר מעולה 1',
		description: 'תיאור המוצר - ערוך אותי בדף הניהול',
		price: 99,
		image: 'https://placehold.co/400x400/667eea/white?text=מוצר+1'
	},
	{
		id: 2,
		name: 'מוצר איכותי 2',
		description: 'תיאור המוצר - ערוך אותי בדף הניהול',
		price: 149,
		image: 'https://placehold.co/400x400/667eea/white?text=מוצר+2'
	},
	{
		id: 3,
		name: 'מוצר מומלץ 3',
		description: 'תיאור המוצר - ערוך אותי בדף הניהול',
		price: 199,
		image: 'https://placehold.co/400x400/667eea/white?text=מוצר+3'
	},
	{
		id: 4,
		name: 'מוצר פופולרי 4',
		description: 'תיאור המוצר - ערוך אותי בדף הניהול',
		price: 249,
		image: 'https://placehold.co/400x400/667eea/white?text=מוצר+4'
	},
	{
		id: 5,
		name: 'מוצר חדש 5',
		description: 'תיאור המוצר - ערוך אותי בדף הניהול',
		price: 299,
		image: 'https://placehold.co/400x400/667eea/white?text=מוצר+5'
	},
	{
		id: 6,
		name: 'מוצר מיוחד 6',
		description: 'תיאור המוצר - ערוך אותי בדף הניהול',
		price: 349,
		image: 'https://placehold.co/400x400/667eea/white?text=מוצר+6'
	}
];

async function fixStorePage(pageId) {
	console.log('🔧 Starting to fix store page with ID:', pageId);
	
	// 1. Get the page
	console.log('📄 Fetching page...');
	const pageResponse = await fetch(`${STRAPI_URL}/api/pages/${pageId}?populate=*`, {
		headers: {
			'Authorization': `Bearer ${STRAPI_TOKEN}`
		}
	});
	
	if (!pageResponse.ok) {
		throw new Error(`Failed to fetch page: ${pageResponse.statusText}`);
	}
	
	const pageData = await pageResponse.json();
	const page = pageData.data;
	
	if (!page) {
		throw new Error('Page not found');
	}
	
	console.log('✅ Page found:', page.attributes.title);
	console.log('📦 Page ID:', page.id);
	console.log('📦 Document ID:', page.documentId);
	
	// 2. Check if products section already exists
	const sections = page.attributes.sections?.data || [];
	const hasProductsSection = sections.some(s => s.attributes.type === 'products');
	
	if (hasProductsSection) {
		console.log('⚠️ Products section already exists. Updating it...');
		const productsSection = sections.find(s => s.attributes.type === 'products');
		
		// Update existing section
		const updateResponse = await fetch(`${STRAPI_URL}/api/sections/${productsSection.id}`, {
			method: 'PUT',
			headers: {
				'Authorization': `Bearer ${STRAPI_TOKEN}`,
				'Content-Type': 'application/json'
			},
			body: JSON.stringify({
				data: {
					type: 'products',
					enabled: true,
					order: 0,
					data: {
						title: 'המוצרים שלנו',
						subtitle: 'בחר מוצר והוסף לעגלה',
						products: sampleProducts
					}
				}
			})
		});
		
		if (!updateResponse.ok) {
			throw new Error(`Failed to update section: ${updateResponse.statusText}`);
		}
		
		console.log('✅ Products section updated!');
	} else {
		console.log('➕ Creating new products section...');
		
		// Create new section
		const createResponse = await fetch(`${STRAPI_URL}/api/sections`, {
			method: 'POST',
			headers: {
				'Authorization': `Bearer ${STRAPI_TOKEN}`,
				'Content-Type': 'application/json'
			},
			body: JSON.stringify({
				data: {
					type: 'products',
					enabled: true,
					order: 0,
					data: {
						title: 'המוצרים שלנו',
						subtitle: 'בחר מוצר והוסף לעגלה',
						products: sampleProducts
					},
					page: page.documentId || page.id
				}
			})
		});
		
		if (!createResponse.ok) {
			const errorText = await createResponse.text();
			throw new Error(`Failed to create section: ${createResponse.statusText} - ${errorText}`);
		}
		
		const newSection = await createResponse.json();
		console.log('✅ Products section created!', newSection.data.id);
	}
	
	console.log('🎉 Done! Visit your page to see the products gallery.');
}

// Get page ID from command line
const pageId = process.argv[2];

if (!pageId) {
	console.error('❌ Please provide a page ID');
	console.log('Usage: node scripts/fix-store-products.js <page-id>');
	console.log('Example: node scripts/fix-store-products.js 128');
	process.exit(1);
}

if (!STRAPI_TOKEN) {
	console.error('❌ STRAPI_API_TOKEN not found in environment');
	process.exit(1);
}

// Run the fix
fixStorePage(pageId)
	.then(() => {
		console.log('✅ Success!');
		process.exit(0);
	})
	.catch((error) => {
		console.error('❌ Error:', error.message);
		process.exit(1);
	});
