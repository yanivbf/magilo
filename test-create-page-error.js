// Test create page to see the exact error
const testData = {
	userId: 'google_111351120503275674259',
	pageType: 'store', // או איזה סוג דף שניסית ליצור
	formData: {
		mainName: 'חנות בדיקה',
		description: 'תיאור החנות',
		phone: '050-1234567',
		email: 'test@test.com',
		designStyle: 'colorful' // זה מה שבחרת
	},
	optionalSections: [] // או המקטעים שבחרת
};

fetch('http://localhost:5174/api/create-structured-page', {
	method: 'POST',
	headers: {
		'Content-Type': 'application/json'
	},
	body: JSON.stringify(testData)
})
.then(res => res.json())
.then(data => {
	console.log('✅ Response:', data);
})
.catch(error => {
	console.error('❌ Error:', error);
});
