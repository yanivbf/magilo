// Test fetching purchases for management page
const fs = require('fs');

const STRAPI_URL = 'http://localhost:1337';

async function testManagementPage(STRAPI_API_TOKEN) {
	const pageDocumentId = 'h26iw2dm83ighs67i7xcubhh'; // From the purchase data above
	
	console.log(`🔍 Testing management page for: ${pageDocumentId}\n`);
	
	// 1. Get page by documentId
	console.log('1️⃣ Getting page by documentId...');
	const pageRes = await fetch(`${STRAPI_URL}/api/pages/${pageDocumentId}`, {
		headers: { Authorization: `Bearer ${STRAPI_API_TOKEN}` }
	});
	const pageData = await pageRes.json();
	
	if (!pageData.data) {
		console.log('❌ Page not found!');
		return;
	}
	
	const page = pageData.data;
	console.log(`✅ Page found:`);
	console.log(`   ID: ${page.id}`);
	console.log(`   DocumentId: ${page.documentId}`);
	console.log(`   Title: ${page.attributes?.title || page.title}\n`);
	
	// 2. Get purchases for this page using numeric ID
	console.log(`2️⃣ Getting purchases for page ID ${page.id}...`);
	const purchasesRes = await fetch(
		`${STRAPI_URL}/api/purchases?filters[page][id][$eq]=${page.id}&sort=createdAt:desc&populate=*`,
		{
			headers: { Authorization: `Bearer ${STRAPI_API_TOKEN}` }
		}
	);
	const purchasesData = await purchasesRes.json();
	
	console.log(`✅ Found ${purchasesData.data?.length || 0} purchases\n`);
	
	if (purchasesData.data && purchasesData.data.length > 0) {
		console.log('First purchase:');
		const p = purchasesData.data[0];
		console.log(`   ID: ${p.id}`);
		console.log(`   Customer: ${p.attributes?.customerName || p.customerName}`);
		console.log(`   Total: ₪${p.attributes?.total || p.total}`);
		console.log(`   Products: ${(p.attributes?.products || p.products)?.length || 0}`);
		console.log(`   Page ID: ${p.attributes?.page?.data?.id || 'N/A'}`);
	}
	
	console.log(`\n🔗 Management URL:`);
	console.log(`   http://localhost:5173/manage/${pageDocumentId}`);
}

// Read token from .env
const envContent = fs.readFileSync('new-app/.env', 'utf8');
const tokenMatch = envContent.match(/STRAPI_API_TOKEN=(.+)/);
if (tokenMatch) {
	const STRAPI_API_TOKEN = tokenMatch[1].trim();
	testManagementPage(STRAPI_API_TOKEN).catch(console.error);
} else {
	console.error('❌ Could not find STRAPI_API_TOKEN in .env file');
}
