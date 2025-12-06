// Script to delete all pages from Strapi
const STRAPI_URL = 'http://localhost:1337';
const STRAPI_API_TOKEN = '8ba3301bbe92b271829befae8c0c268dbe65efa2bd66517f9309d2e3127c36eca41e91db5a53deb48e8d8aaf095d700bbc4dd1ab32ad509705723f052241d1f0a352eb020cb675aa2e4d733d4bb48855d206eafed5d1196975ad06365767082044a7b5d955e5e3b43398e13aabee36a89e70392a390ef5b96bb4deff6ca43c6a';

async function deleteAllPages() {
	try {
		console.log('🗑️  Fetching all pages...');
		
		// Get all pages
		const pagesResponse = await fetch(
			`${STRAPI_URL}/api/pages`,
			{
				headers: {
					'Authorization': `Bearer ${STRAPI_API_TOKEN}`
				}
			}
		);
		
		if (!pagesResponse.ok) {
			console.error('❌ Failed to fetch pages');
			return;
		}
		
		const pagesResult = await pagesResponse.json();
		const pages = pagesResult.data || [];
		
		console.log(`📊 Found ${pages.length} pages to delete`);
		
		if (pages.length === 0) {
			console.log('✅ No pages to delete');
			return;
		}
		
		// Delete each page
		let deleted = 0;
		let failed = 0;
		
		for (const page of pages) {
			const deleteResponse = await fetch(
				`${STRAPI_URL}/api/pages/${page.id}`,
				{
					method: 'DELETE',
					headers: {
						'Authorization': `Bearer ${STRAPI_API_TOKEN}`
					}
				}
			);
			
			if (deleteResponse.ok) {
				console.log(`✅ Deleted page ${page.id} (${page.title})`);
				deleted++;
			} else {
				const errorText = await deleteResponse.text();
				console.error(`❌ Failed to delete page ${page.id}:`, errorText);
				failed++;
			}
		}
		
		console.log(`\n🎉 Done! Deleted ${deleted} pages, failed ${failed} pages`);
		console.log('✨ Database is now clean and ready for new pages!');
		
	} catch (error) {
		console.error('❌ Error:', error);
	}
}

deleteAllPages();
