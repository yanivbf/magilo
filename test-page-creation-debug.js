// Test page creation to debug 500 error
// Using built-in fetch (Node 18+)

async function testPageCreation() {
	console.log('🧪 Testing page creation...');
	
	const testData = {
		userId: 'test_user_123',
		pageType: 'onlineStore',
		formData: {
			mainName: 'חנות בדיקה',
			contactName: 'יוסי',
			email: 'test@example.com',
			phone: '050-1234567',
			description: 'חנות לבדיקה',
			address: 'תל אביב'
		},
		optionalSections: ['about', 'services', 'gallery', 'faq'],
		designStyle: 'modern'
	};
	
	try {
		console.log('📤 Sending request to create-structured-page...');
		console.log('📋 Data:', JSON.stringify(testData, null, 2));
		
		const response = await fetch('http://localhost:5173/api/create-structured-page', {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json'
			},
			body: JSON.stringify(testData)
		});
		
		console.log('📥 Response status:', response.status);
		
		const responseText = await response.text();
		console.log('📥 Response body:', responseText);
		
		if (!response.ok) {
			console.error('❌ Request failed with status:', response.status);
			try {
				const errorData = JSON.parse(responseText);
				console.error('❌ Error details:', errorData);
			} catch (e) {
				console.error('❌ Could not parse error response');
			}
		} else {
			console.log('✅ Page created successfully!');
			const result = JSON.parse(responseText);
			console.log('✅ Result:', result);
		}
		
	} catch (error) {
		console.error('❌ Test failed:', error.message);
		console.error('❌ Stack:', error.stack);
	}
}

testPageCreation();
