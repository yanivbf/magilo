// Check purchases directly in Strapi
const fs = require('fs');

const STRAPI_URL = 'http://localhost:1337';

async function checkPurchases(STRAPI_API_TOKEN) {
	console.log('🔍 Checking purchases in Strapi...\n');
	
	try {
		const res = await fetch(`${STRAPI_URL}/api/purchases?populate=*`, {
			headers: { Authorization: `Bearer ${STRAPI_API_TOKEN}` }
		});
		
		if (!res.ok) {
			console.log('❌ Failed to fetch purchases:', res.status, res.statusText);
			const error = await res.json();
			console.log('Error:', JSON.stringify(error, null, 2));
			return;
		}
		
		const data = await res.json();
		
		console.log(`📦 Total purchases: ${data.data?.length || 0}\n`);
		
		if (data.data && data.data.length > 0) {
			console.log('First purchase (raw):');
			console.log(JSON.stringify(data.data[0], null, 2));
		} else {
			console.log('⚠️  No purchases found in Strapi!');
			console.log('\n💡 This means purchases are not being saved to Strapi.');
			console.log('   Check the API logs when creating a purchase.');
		}
	} catch (error) {
		console.log('❌ Error:', error.message);
	}
}

// Read token from .env
const envContent = fs.readFileSync('new-app/.env', 'utf8');
const tokenMatch = envContent.match(/STRAPI_API_TOKEN=(.+)/);
if (tokenMatch) {
	const STRAPI_API_TOKEN = tokenMatch[1].trim();
	checkPurchases(STRAPI_API_TOKEN).catch(console.error);
} else {
	console.error('❌ Could not find STRAPI_API_TOKEN in .env file');
}
