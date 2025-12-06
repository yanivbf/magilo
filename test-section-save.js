// Test section editing - does it actually save?

const pageId = 'fatwpc2p7xxnl9x9sm7nfv8r'; // Your page documentId
const newTitle = `בדיקה ${Date.now()}`;

console.log('🧪 Testing section save...');
console.log('📄 Page ID:', pageId);
console.log('✏️ New title:', newTitle);

fetch('http://localhost:5173/api/update-page', {
	method: 'POST',
	headers: {
		'Content-Type': 'application/json'
	},
	body: JSON.stringify({
		pageId: pageId,
		field: 'sections.0.data.title',
		value: newTitle
	})
})
.then(res => res.json())
.then(result => {
	console.log('✅ Save result:', result);
	
	// Now fetch the page to see if it saved
	console.log('\n🔍 Fetching page to verify...');
	return fetch(`http://localhost:1337/api/pages/${pageId}?populate[0]=sections`);
})
.then(res => res.json())
.then(page => {
	console.log('\n📄 Page data:', page);
	const firstSection = page.data?.sections?.[0];
	console.log('\n📦 First section:', firstSection);
	console.log('\n✅ Section title:', firstSection?.data?.title);
	console.log('\n🎯 Expected:', newTitle);
	console.log('🎯 Match:', firstSection?.data?.title === newTitle ? '✅ YES!' : '❌ NO');
})
.catch(error => {
	console.error('❌ Error:', error);
});
