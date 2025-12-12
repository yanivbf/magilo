// Debug script for service page creation
const fetch = require('node-fetch');

async function testCreateServicePage() {
    console.log('🔍 Testing service page creation...');
    
    const requestData = {
        userId: 'test_user_' + Date.now(),
        pageType: 'service',
        designStyle: 'modern',
        formData: {
            mainName: 'מוסך דוד - בדיקה',
            description: 'מוסך מקצועי עם ניסיון של 20 שנה',
            phone: '050-1234567',
            email: 'test@example.com',
            address: 'רחוב הרצל 123, תל אביב'
        },
        optionalSections: ['about', 'appointments', 'faq'],
        style: 'Modern'
    };
    
    console.log('📤 Request data:', JSON.stringify(requestData, null, 2));
    
    try {
        const response = await fetch('http://localhost:5175/api/create-structured-page', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(requestData)
        });
        
        console.log('📡 Response status:', response.status);
        console.log('📡 Response headers:', Object.fromEntries(response.headers.entries()));
        
        const responseText = await response.text();
        console.log('📥 Response body (raw):', responseText);
        
        if (response.ok) {
            try {
                const result = JSON.parse(responseText);
                console.log('✅ Success! Page created:', result);
                console.log('🔗 Page URL:', `http://localhost:5175${result.pageUrl}`);
            } catch (parseError) {
                console.error('❌ Failed to parse success response:', parseError);
            }
        } else {
            try {
                const error = JSON.parse(responseText);
                console.error('❌ API Error:', error);
            } catch (parseError) {
                console.error('❌ Raw error response:', responseText);
            }
        }
    } catch (error) {
        console.error('❌ Network error:', error.message);
    }
}

// Run the test
testCreateServicePage().catch(console.error);