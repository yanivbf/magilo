// Test loading page data from server
async function testPageLoad() {
	try {
		const slug = 'google_1-page-1765033176050';
		console.log('🔍 Loading page:', slug);
		
		const response = await fetch(`http://localhost:5173/view/${slug}`);
		
		if (!response.ok) {
			console.error('❌ Failed to load page:', response.status);
			return;
		}
		
		const html = await response.text();
		
		// Check if FAQ section is in the HTML
		if (html.includes('faq')) {
			console.log('✅ FAQ found in HTML');
			
			// Count occurrences
			const matches = html.match(/faq/gi);
			console.log(`📋 "faq" appears ${matches.length} times in HTML`);
			
			// Check for FAQ section specifically
			if (html.includes('id="faq"')) {
				console.log('✅ FAQ section div found: <div id="faq">');
			} else {
				console.log('❌ FAQ section div NOT found');
			}
			
			// Check for FAQ component
			if (html.includes('FAQSection')) {
				console.log('✅ FAQSection component found');
			} else {
				console.log('❌ FAQSection component NOT found');
			}
			
		} else {
			console.log('❌ FAQ NOT found in HTML');
		}
		
		// Check for other sections
		const sections = ['gallery', 'products', 'testimonials', 'about', 'video', 'contact'];
		console.log('\n📋 Checking other sections:');
		sections.forEach(section => {
			if (html.includes(`id="${section}"`)) {
				console.log(`  ✅ ${section}`);
			} else {
				console.log(`  ❌ ${section}`);
			}
		});
		
	} catch (error) {
		console.error('❌ Error:', error.message);
	}
}

testPageLoad();
