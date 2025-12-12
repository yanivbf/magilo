// Debug script to check purchases filtering
const fs = require('fs');

const STRAPI_URL = 'http://localhost:1337';

async function debugPurchases(STRAPI_API_TOKEN) {
	const pageId = 'k77rpcxbzzx38yi0icdca77y'; // The documentId from the URL
	
	console.log('🔍 Debugging purchases for pageId:', pageId);
	
	// First, let's find the page and get its numeric ID
	console.log('\n1️⃣ Finding page by documentId...');
	const pageResponse = await fetch(`${STRAPI_URL}/api/pages/${pageId}?populate=*`, {
		headers: {
			Authorization: `Bearer ${STRAPI_API_TOKEN}`
		}
	});
	const pageData = await pageResponse.json();
	
	if (pageData.data) {
		console.log('✅ Page found!');
		console.log('   - Numeric ID:', pageData.data.id);
		console.log('   - DocumentId:', pageData.data.documentId);
		console.log('   - Title:', pageData.data.attributes?.title || pageData.data.title);
		
		const numericId = pageData.data.id;
		
		// Now try to get purchases using the numeric ID
		console.log('\n2️⃣ Fetching purchases with numeric ID filter...');
		const purchasesResponse = await fetch(
			`${STRAPI_URL}/api/purchases?filters[page][id][$eq]=${numericId}&sort=createdAt:desc&populate=*`,
			{
				headers: {
					Authorization: `Bearer ${STRAPI_API_TOKEN}`
				}
			}
		);
		const purchasesData = await purchasesResponse.json();
		
		console.log('✅ Purchases response:', purchasesData.data?.length || 0, 'purchases found');
		
		if (purchasesData.data && purchasesData.data.length > 0) {
			console.log('\n📦 First purchase:');
			const first = purchasesData.data[0];
			console.log('   - ID:', first.id);
			console.log('   - DocumentId:', first.documentId);
			console.log('   - Customer:', first.attributes.customerName);
			console.log('   - Total:', first.attributes.total);
			console.log('   - Products:', first.attributes.products?.length || 0);
			console.log('   - Page relation:', first.attributes.page?.data?.id);
		}
		
		// Also try getting ALL purchases to see what's there
		console.log('\n3️⃣ Fetching ALL purchases (no filter)...');
		const allPurchasesResponse = await fetch(
			`${STRAPI_URL}/api/purchases?sort=createdAt:desc&populate=*`,
			{
				headers: {
					Authorization: `Bearer ${STRAPI_API_TOKEN}`
				}
			}
		);
		const allPurchasesData = await allPurchasesResponse.json();
		
		console.log('✅ Total purchases in system:', allPurchasesData.data?.length || 0);
		
		if (allPurchasesData.data && allPurchasesData.data.length > 0) {
			console.log('\n📊 Page IDs in purchases:');
			const pageIds = new Set();
			allPurchasesData.data.forEach(p => {
				const pageId = p.attributes.page?.data?.id;
				if (pageId) pageIds.add(pageId);
			});
			console.log('   Unique page IDs:', Array.from(pageIds));
			console.log('   Looking for:', numericId);
			console.log('   Match found:', pageIds.has(numericId));
		}
		
	} else {
		console.log('❌ Page not found!');
		console.log('Response:', pageData);
	}
}

// Read token from .env file
const envContent = fs.readFileSync('new-app/.env', 'utf8');
const tokenMatch = envContent.match(/STRAPI_API_TOKEN=(.+)/);
if (tokenMatch) {
	const STRAPI_API_TOKEN = tokenMatch[1].trim();
	debugPurchases(STRAPI_API_TOKEN).catch(console.error);
} else {
	console.error('❌ Could not find STRAPI_API_TOKEN in .env file');
}
