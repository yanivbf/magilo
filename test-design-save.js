// Quick test to verify designStyle is saved
const fetch = require('node-fetch');

async function testDesignStyleSave() {
    console.log('🧪 Testing designStyle save...\n');
    
    const testData = {
        userId: 'test_user_' + Date.now(),
        pageType: 'store',
        designStyle: 'colorful', // ✅ Testing colorful style
        formData: {
            mainName: 'חנות בדיקה',
            phone: '050-1234567',
            description: 'חנות לבדיקת designStyle',
            designStyle: 'colorful' // ✅ Also in formData
        },
        optionalSections: ['about', 'gallery']
    };
    
    console.log('📤 Sending request with designStyle:', testData.designStyle);
    console.log('📤 Full data:', JSON.stringify(testData, null, 2));
    
    try {
        const response = await fetch('http://localhost:5174/api/create-structured-page', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(testData)
        });
        
        const result = await response.json();
        
        if (result.success) {
            console.log('\n✅ Page created successfully!');
            console.log('📄 Slug:', result.slug);
            console.log('🔗 URL:', `http://localhost:5174/view/${result.slug}`);
            console.log('\n🔍 Now check if the page has colorful design!');
        } else {
            console.log('\n❌ Failed:', result.error);
        }
    } catch (error) {
        console.error('\n❌ Error:', error.message);
    }
}

testDesignStyleSave();
