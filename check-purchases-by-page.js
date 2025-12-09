// Quick script to check purchases are properly linked to pages
const STRAPI_URL = 'http://localhost:1337';
const STRAPI_API_TOKEN = 'your-token-here'; // Replace with actual token from .env

async function checkPurchases() {
	try {
		console.log('🔍 Checking all purchases...\n');
		
		// Get all purchases
		const response = await fetch(`${STRAPI_URL}/api/purchases?populate=page`, {
			headers: {
				'Authorization': `Bearer ${STRAPI_API_TOKEN}`
			}
		});
		
		if (!response.ok) {
			throw new Error(`HTTP ${response.status}: ${response.statusText}`);
		}
		
		const data = await response.json();
		const purchases = data.data || [];
		
		console.log(`📦 Total purchases: ${purchases.length}\n`);
		
		// Group by page
		const byPage = {};
		
		purchases.forEach(purchase => {
			const pageData = purchase.attributes.page?.data;
			const pageId = pageData?.id || 'NO_PAGE';
			const pageTitle = pageData?.attributes?.title || 'Unknown';
			
			if (!byPage[pageId]) {
				byPage[pageId] = {
					title: pageTitle,
					count: 0,
					purchases: []
				};
			}
			
			byPage[pageId].count++;
			byPage[pageId].purchases.push({
				id: purchase.id,
				customer: purchase.attributes.customerName,
				total: purchase.attributes.total,
				date: purchase.attributes.createdAt?.split('T')[0]
			});
		});
		
		// Display results
		console.log('📊 Purchases by page:\n');
		Object.entries(byPage).forEach(([pageId, info]) => {
			console.log(`\n🏪 Page ID: ${pageId}`);
			console.log(`   Title: ${info.title}`);
			console.log(`   Orders: ${info.count}`);
			console.log('   ─────────────────────────');
			info.purchases.forEach(p => {
				console.log(`   • Order #${p.id}: ${p.customer} - ₪${p.total} (${p.date})`);
			});
		});
		
		// Check for orphaned purchases
		const orphaned = byPage['NO_PAGE'];
		if (orphaned) {
			console.log('\n\n⚠️  WARNING: Found orphaned purchases (not linked to any page):');
			console.log(`   Count: ${orphaned.count}`);
			orphaned.purchases.forEach(p => {
				console.log(`   • Order #${p.id}: ${p.customer} - ₪${p.total}`);
			});
		}
		
	} catch (error) {
		console.error('❌ Error:', error.message);
	}
}

checkPurchases();
