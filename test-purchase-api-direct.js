// Direct test of the purchase API
// Run with: node test-purchase-api-direct.js

const STRAPI_URL = 'http://localhost:1337';
const STRAPI_API_TOKEN = 'your-token-here'; // Replace with actual token from .env

async function testPurchaseAPI() {
	console.log('🧪 Testing Purchase API directly...\n');
	
	// Test 1: Check if we can reach Strapi
	console.log('1️⃣ Testing Strapi connection...');
	try {
		const response = await fetch(`${STRAPI_URL}/api/purchases`, {
			headers: {
				'Authorization': `Bearer ${STRAPI_API_TOKEN}`
			}
		});
		console.log(`✅ Strapi reachable: ${response.status}`);
	} catch (error) {
		console.error(`❌ Cannot reach Strapi: ${error.message}`);
		return;
	}
	
	// Test 2: Try to create a purchase with minimal data
	console.log('\n2️⃣ Testing purchase creation...');
	const testPurchase = {
		data: {
			products: [
				{ name: 'Test Product', quantity: 1, price: 100, total: 100 }
			],
			total: 100,
			paymentMethod: 'credit',
			customerName: 'Test Customer',
			customerPhone: '050-1234567',
			customerEmail: 'test@example.com',
			customerAddress: 'Test Address',
			shipping: true,
			status: 'pending',
			user: 1, // Replace with actual user ID
			page: 1  // Replace with actual page ID
		}
	};
	
	console.log('📤 Sending:', JSON.stringify(testPurchase, null, 2));
	
	try {
		const response = await fetch(`${STRAPI_URL}/api/purchases`, {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json',
				'Authorization': `Bearer ${STRAPI_API_TOKEN}`
			},
			body: JSON.stringify(testPurchase)
		});
		
		const data = await response.json();
		
		if (response.ok) {
			console.log('✅ Purchase created successfully!');
			console.log('📥 Response:', JSON.stringify(data, null, 2));
		} else {
			console.error('❌ Failed to create purchase');
			console.error('📥 Error response:', JSON.stringify(data, null, 2));
		}
	} catch (error) {
		console.error('❌ Request failed:', error.message);
	}
}

testPurchaseAPI();
