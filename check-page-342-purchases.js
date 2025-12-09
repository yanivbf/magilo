// Check purchases for page 342
const fs = require('fs');

const STRAPI_URL = 'http://localhost:1337';

async function checkPage342(STRAPI_API_TOKEN) {
	const pageId = 342;
	const documentId = 'k77rpcxbzzx38yi0icdca77y';
	
	console.log(`🔍 Checking page ${pageId} (${documentId})...\n`);
	
	// Get purchases for this page
	const purchasesRes = await fetch(
		`${STRAPI_URL}/api/purchases?filters[page][id][$eq]=${pageId}&sort=createdAt:desc&populate=*`,
		{
			headers: { Authorization: `Bearer ${STRAPI_API_TOKEN}` }
		}
	);
	const purchasesData = await purchasesRes.json();
	
	console.log(`📦 Found ${purchasesData.data?.length || 0} purchases for page ${pageId}\n`);
	
	if (purchasesData.data && purchasesData.data.length > 0) {
		console.log('✅ Purchases exist for this page!');
		purchasesData.data.slice(0, 3).forEach((p, i) => {
			console.log(`\n${i + 1}. Purchase ${p.id}:`);
			console.log(`   Customer: ${p.customerName || p.attributes?.customerName}`);
			console.log(`   Total: ₪${p.total || p.attributes?.total}`);
			console.log(`   Products: ${(p.products || p.attributes?.products)?.length || 0}`);
		});
	} else {
		console.log('❌ No purchases found for this page!');
		console.log('\n💡 The purchases you created are probably linked to a different page.');
		console.log('   You need to create a new order on THIS page to see it here.');
	}
	
	console.log(`\n🔗 Management URL:`);
	console.log(`   http://localhost:5173/manage/${documentId}`);
}

// Read token from .env
const envContent = fs.readFileSync('new-app/.env', 'utf8');
const tokenMatch = envContent.match(/STRAPI_API_TOKEN=(.+)/);
if (tokenMatch) {
	const STRAPI_API_TOKEN = tokenMatch[1].trim();
	checkPage342(STRAPI_API_TOKEN).catch(console.error);
} else {
	console.error('❌ Could not find STRAPI_API_TOKEN in .env file');
}
