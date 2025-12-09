// Script to check and fix purchases relation to pages
const fs = require('fs');

const STRAPI_URL = 'http://localhost:1337';

async function fixPurchasesRelation(STRAPI_API_TOKEN) {
	console.log('🔍 Checking purchases and their page relations...\n');
	
	// 1. Get all purchases
	const purchasesRes = await fetch(`${STRAPI_URL}/api/purchases?populate=*`, {
		headers: { Authorization: `Bearer ${STRAPI_API_TOKEN}` }
	});
	const purchasesData = await purchasesRes.json();
	
	console.log(`📦 Found ${purchasesData.data?.length || 0} total purchases\n`);
	
	if (!purchasesData.data || purchasesData.data.length === 0) {
		console.log('❌ No purchases found!');
		return;
	}
	
	// 2. Get all pages
	const pagesRes = await fetch(`${STRAPI_URL}/api/pages`, {
		headers: { Authorization: `Bearer ${STRAPI_API_TOKEN}` }
	});
	const pagesData = await pagesRes.json();
	
	console.log(`📄 Found ${pagesData.data?.length || 0} total pages\n`);
	
	// 3. Group purchases by page
	const purchasesByPage = {};
	const orphanPurchases = [];
	
	purchasesData.data.forEach(purchase => {
		const pageId = purchase.attributes?.page?.data?.id;
		if (pageId) {
			if (!purchasesByPage[pageId]) {
				purchasesByPage[pageId] = [];
			}
			purchasesByPage[pageId].push(purchase);
		} else {
			orphanPurchases.push(purchase);
		}
	});
	
	console.log('📊 Purchases by page:');
	Object.keys(purchasesByPage).forEach(pageId => {
		const page = pagesData.data.find(p => p.id == pageId);
		const pageName = page?.attributes?.title || page?.attributes?.slug || 'Unknown';
		console.log(`   Page ${pageId} (${pageName}): ${purchasesByPage[pageId].length} purchases`);
	});
	
	if (orphanPurchases.length > 0) {
		console.log(`\n⚠️  Found ${orphanPurchases.length} orphan purchases (no page relation):`);
		orphanPurchases.forEach(p => {
			console.log(`   - Purchase ${p.id}: ${p.attributes?.customerName} - ₪${p.attributes?.total}`);
		});
	}
	
	// 4. Show details for first page with purchases
	const firstPageId = Object.keys(purchasesByPage)[0];
	if (firstPageId) {
		const page = pagesData.data.find(p => p.id == firstPageId);
		console.log(`\n📋 Details for page ${firstPageId}:`);
		console.log(`   Title: ${page?.attributes?.title}`);
		console.log(`   Slug: ${page?.attributes?.slug}`);
		console.log(`   DocumentId: ${page?.documentId}`);
		console.log(`   Numeric ID: ${page?.id}`);
		console.log(`   Purchases: ${purchasesByPage[firstPageId].length}`);
		
		console.log(`\n   First purchase:`);
		const firstPurchase = purchasesByPage[firstPageId][0];
		console.log(`   - ID: ${firstPurchase.id}`);
		console.log(`   - Customer: ${firstPurchase.attributes.customerName}`);
		console.log(`   - Total: ₪${firstPurchase.attributes.total}`);
		console.log(`   - Products: ${firstPurchase.attributes.products?.length || 0}`);
		console.log(`   - Page relation: ${firstPurchase.attributes.page?.data?.id}`);
	}
	
	// 5. Test query by page ID
	console.log(`\n🧪 Testing query for page ${firstPageId}...`);
	const testRes = await fetch(
		`${STRAPI_URL}/api/purchases?filters[page][id][$eq]=${firstPageId}&populate=*`,
		{
			headers: { Authorization: `Bearer ${STRAPI_API_TOKEN}` }
		}
	);
	const testData = await testRes.json();
	console.log(`   Result: ${testData.data?.length || 0} purchases found`);
	
	// 6. Show management URL
	if (firstPageId) {
		const page = pagesData.data.find(p => p.id == firstPageId);
		console.log(`\n🔗 Management URL for this page:`);
		console.log(`   http://localhost:5173/manage/${page?.documentId}`);
	}
}

// Read token from .env
const envContent = fs.readFileSync('new-app/.env', 'utf8');
const tokenMatch = envContent.match(/STRAPI_API_TOKEN=(.+)/);
if (tokenMatch) {
	const STRAPI_API_TOKEN = tokenMatch[1].trim();
	fixPurchasesRelation(STRAPI_API_TOKEN).catch(console.error);
} else {
	console.error('❌ Could not find STRAPI_API_TOKEN in .env file');
}
