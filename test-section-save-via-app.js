// Test if section changes actually persist in Strapi

const pageSlug = 'brit-olam'; // Change to your page slug
const newTitle = `בדיקה ${Date.now()}`;

console.log('🧪 Testing section save via app API...');
console.log('📄 Page slug:', pageSlug);
console.log('✏️ New title:', newTitle);

// First, get the page to find its documentId
fetch(`http://localhost:5173/view/${pageSlug}`)
	.then(res => res.text())
	.then(html => {
		// Extract pageId from the HTML (it's in the script)
		const match = html.match(/pageId['"]\s*:\s*['"]([^'"]+)['"]/);
		if (!match) {
			console.error('❌ Could not find pageId in HTML');
			return;
		}
		
		const pageId = match[1];
		console.log('\n📄 Found page ID:', pageId);
		
		// Now save a change
		console.log('\n💾 Saving change...');
		return fetch('http://localhost:5173/api/update-page', {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json'
			},
			body: JSON.stringify({
				pageId: pageId,
				field: 'sections.0.data.title',
				value: newTitle
			})
		});
	})
	.then(res => res.json())
	.then(result => {
		console.log('✅ Save result:', result);
		
		// Wait a bit for Strapi to process
		console.log('\n⏳ Waiting 2 seconds for Strapi...');
		return new Promise(resolve => setTimeout(resolve, 2000));
	})
	.then(() => {
		// Now fetch the page again to see if it changed
		console.log('\n🔍 Fetching page again...');
		return fetch(`http://localhost:5173/view/${pageSlug}`);
	})
	.then(res => res.text())
	.then(html => {
		// Check if the new title appears in the HTML
		if (html.includes(newTitle)) {
			console.log('\n✅ SUCCESS! The change persisted!');
			console.log('🎯 Found new title in HTML:', newTitle);
		} else {
			console.log('\n❌ FAILED! The change did NOT persist!');
			console.log('🎯 Expected to find:', newTitle);
			console.log('📄 HTML snippet:', html.substring(html.indexOf('אודות') - 100, html.indexOf('אודות') + 200));
		}
	})
	.catch(error => {
		console.error('❌ Error:', error);
	});
