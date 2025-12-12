// Script to link orphan purchases to their pages
const fs = require('fs');

const STRAPI_URL = 'http://localhost:1337';

async function linkPurchasesToPages(STRAPI_API_TOKEN) {
	console.log('🔗 Linking orphan purchases to pages...\n');
	
	// 1. Get all purchases
	const purchasesRes = await fetch(`${STRAPI_URL}/api/purchases?populate=*`, {
		headers: { Authorization: `Bearer ${STRAPI_API_TOKEN}` }
	});
	const purchasesData = await purchasesRes.json();
	
	console.log(`📦 Found ${purchasesData.data?.length || 0} total purchases`);
	
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
	
	// 3. Find orphan purchases (no page relation)
	const orphanPurchases = purchasesData.data.filter(p => !p.page?.data?.id);
	
	console.log(`⚠️  Found ${orphanPurchases.length} orphan purchases\n`);
	
	if (orphanPurchases.length === 0) {
		console.log('✅ All purchases are already linked to pages!');
		return;
	}
	
	// 4. Since all purchases are from the same store, link them to the first page
	// (In a real scenario, you'd need logic to determine which page each purchase belongs to)
	const targetPage = pagesData.data[0];
	
	if (!targetPage) {
		console.log('❌ No pages found to link purchases to!');
		return;
	}
	
	console.log(`🎯 Will link all orphan purchases to page:`);
	console.log(`   ID: ${targetPage.id}`);
	console.log(`   Title: ${targetPage.title || targetPage.slug}`);
	console.log(`   DocumentId: ${targetPage.documentId}\n`);
	
	// 5. Update each orphan purchase
	let updated = 0;
	let failed = 0;
	
	for (const purchase of orphanPurchases) {
		try {
			const updateRes = await fetch(`${STRAPI_URL}/api/purchases/${purchase.id}`, {
				method: 'PUT',
				headers: {
					'Content-Type': 'application/json',
					Authorization: `Bearer ${STRAPI_API_TOKEN}`
				},
				body: JSON.stringify({
					data: {
						page: targetPage.id
					}
				})
			});
			
			if (updateRes.ok) {
				updated++;
				console.log(`✅ Linked purchase ${purchase.id}`);
			} else {
				failed++;
				const error = await updateRes.json();
				console.log(`❌ Failed to link purchase ${purchase.id}:`, error);
			}
		} catch (error) {
			failed++;
			console.log(`❌ Error linking purchase ${purchase.id}:`, error.message);
		}
	}
	
	console.log(`\n📊 Summary:`);
	console.log(`   ✅ Successfully linked: ${updated}`);
	console.log(`   ❌ Failed: ${failed}`);
	console.log(`\n🔗 Management URL:`);
	console.log(`   http://localhost:5173/manage/${targetPage.documentId}`);
}

// Read token from .env
const envContent = fs.readFileSync('new-app/.env', 'utf8');
const tokenMatch = envContent.match(/STRAPI_API_TOKEN=(.+)/);
if (tokenMatch) {
	const STRAPI_API_TOKEN = tokenMatch[1].trim();
	linkPurchasesToPages(STRAPI_API_TOKEN).catch(console.error);
} else {
	console.error('❌ Could not find STRAPI_API_TOKEN in .env file');
}
