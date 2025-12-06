// Script to link all existing pages to a user
const STRAPI_URL = 'http://localhost:1337';
const STRAPI_API_TOKEN = '8ba3301bbe92b271829befae8c0c268dbe65efa2bd66517f9309d2e3127c36eca41e91db5a53deb48e8d8aaf095d700bbc4dd1ab32ad509705723f052241d1f0a352eb020cb675aa2e4d733d4bb48855d206eafed5d1196975ad06365767082044a7b5d955e5e3b43398e13aabee36a89e70392a390ef5b96bb4deff6ca43c6a';

async function linkPagesToUser() {
	try {
		// Get current user ID from command line argument
		const userId = process.argv[2];
		
		if (!userId) {
			console.log('❌ Please provide userId as argument');
			console.log('Usage: node link-pages-to-user.js <userId>');
			return;
		}
		
		console.log(`🔍 Looking for user with userId: ${userId}`);
		
		// Find or create user in Strapi
		const searchResponse = await fetch(
			`${STRAPI_URL}/api/users?filters[userId][$eq]=${userId}`,
			{
				headers: {
					'Authorization': `Bearer ${STRAPI_API_TOKEN}`
				}
			}
		);
		
		let strapiUserId = null;
		
		if (searchResponse.ok) {
			const searchResult = await searchResponse.json();
			if (searchResult.data && searchResult.data.length > 0) {
				strapiUserId = searchResult.data[0].id;
				console.log(`✅ Found existing user with Strapi ID: ${strapiUserId}`);
			}
		}
		
		// If not found, create new user
		if (!strapiUserId) {
			console.log('👤 User not found, creating new user...');
			
			const createResponse = await fetch(
				`${STRAPI_URL}/api/users`,
				{
					method: 'POST',
					headers: {
						'Authorization': `Bearer ${STRAPI_API_TOKEN}`,
						'Content-Type': 'application/json'
					},
					body: JSON.stringify({
						data: {
							userId: userId,
							name: `משתמש ${userId.substring(0, 8)}`,
							email: `${userId}@autopage.local`,
							wallet: 0,
							subscriptionStatus: 'inactive'
						}
					})
				}
			);
			
			if (createResponse.ok) {
				const createResult = await createResponse.json();
				strapiUserId = createResult.data?.id || createResult.id;
				console.log(`✅ Created new user with Strapi ID: ${strapiUserId}`);
			} else {
				const errorText = await createResponse.text();
				console.error('❌ Failed to create user:', errorText);
				return;
			}
		}
		
		// Get all pages
		console.log('\n📄 Fetching all pages...');
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
		
		console.log(`📊 Found ${pages.length} pages`);
		
		// Link each page to the user
		let linked = 0;
		let skipped = 0;
		
		for (const page of pages) {
			// Skip if already has a user
			if (page.user) {
				console.log(`⏭️  Page ${page.id} (${page.title}) already has a user`);
				skipped++;
				continue;
			}
			
			// Update page with user relation
			const updateResponse = await fetch(
				`${STRAPI_URL}/api/pages/${page.id}`,
				{
					method: 'PUT',
					headers: {
						'Authorization': `Bearer ${STRAPI_API_TOKEN}`,
						'Content-Type': 'application/json'
					},
					body: JSON.stringify({
						data: {
							user: strapiUserId,
							userId: userId
						}
					})
				}
			);
			
			if (updateResponse.ok) {
				console.log(`✅ Linked page ${page.id} (${page.title}) to user ${strapiUserId}`);
				linked++;
			} else {
				const errorText = await updateResponse.text();
				console.error(`❌ Failed to link page ${page.id}:`, errorText);
			}
		}
		
		console.log(`\n🎉 Done! Linked ${linked} pages, skipped ${skipped} pages`);
		
	} catch (error) {
		console.error('❌ Error:', error);
	}
}

linkPagesToUser();
