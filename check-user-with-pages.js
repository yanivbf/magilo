// Check user with all their pages (professional user management)
const STRAPI_URL = 'http://localhost:1337';
const STRAPI_API_TOKEN = '8ba3301bbe92b271829befae8c0c268dbe65efa2bd66517f9309d2e3127c36eca41e91db5a53deb48e8d8aaf095d700bbc4dd1ab32ad509705723f052241d1f0a352eb020cb675aa2e4d733d4bb48855d206eafed5d1196975ad06365767082044a7b5d955e5e3b43398e13aabee36a89e70392a390ef5b96bb4deff6ca43c6a';

async function checkUserWithPages() {
	const userId = 'google_111351120503275674259';
	
	console.log('🔍 Checking user and their pages...\n');
	console.log('👤 User ID:', userId);
	console.log('');
	
	try {
		// 1. Find the Strapi user
		console.log('📡 Step 1: Finding Strapi user...');
		const userResponse = await fetch(`${STRAPI_URL}/api/users?filters[userId][$eq]=${userId}&populate=pages`, {
			headers: {
				'Authorization': `Bearer ${STRAPI_API_TOKEN}`
			}
		});
		
		const userData = await userResponse.json();
		
		if (!userData.data || userData.data.length === 0) {
			console.log('❌ User not found in Strapi!');
			return;
		}
		
		const user = userData.data[0];
		console.log('✅ User found in Strapi!');
		console.log('');
		console.log('👤 User Details:');
		console.log('   - ID:', user.id);
		console.log('   - DocumentID:', user.documentId);
		console.log('   - Name:', user.name);
		console.log('   - Email:', user.email);
		console.log('   - userId:', user.userId);
		console.log('   - Subscription:', user.subscriptionStatus);
		console.log('');
		
		// 2. Get pages linked to this user (via relation)
		console.log('📡 Step 2: Getting pages linked to user (via Strapi relation)...');
		const pagesViaRelation = await fetch(`${STRAPI_URL}/api/pages?filters[user][id][$eq]=${user.id}`, {
			headers: {
				'Authorization': `Bearer ${STRAPI_API_TOKEN}`
			}
		});
		
		const pagesRelationData = await pagesViaRelation.json();
		console.log(`✅ Found ${pagesRelationData.data?.length || 0} pages via Strapi relation`);
		console.log('');
		
		// 3. Get pages by userId field (old method)
		console.log('📡 Step 3: Getting pages by userId field (old method)...');
		const pagesByUserId = await fetch(`${STRAPI_URL}/api/pages?filters[userId][$eq]=${userId}`, {
			headers: {
				'Authorization': `Bearer ${STRAPI_API_TOKEN}`
			}
		});
		
		const pagesByUserIdData = await pagesByUserId.json();
		console.log(`✅ Found ${pagesByUserIdData.data?.length || 0} pages via userId field`);
		console.log('');
		
		// 4. Show all pages
		const allPages = new Map();
		
		// Add pages from relation
		if (pagesRelationData.data) {
			pagesRelationData.data.forEach(page => {
				allPages.set(page.id, { ...page, source: 'relation' });
			});
		}
		
		// Add pages from userId field
		if (pagesByUserIdData.data) {
			pagesByUserIdData.data.forEach(page => {
				if (allPages.has(page.id)) {
					allPages.get(page.id).source = 'both';
				} else {
					allPages.set(page.id, { ...page, source: 'userId' });
				}
			});
		}
		
		console.log('📊 Summary:');
		console.log('═══════════════════════════════════════════════════════════');
		console.log(`Total unique pages: ${allPages.size}`);
		console.log('');
		
		if (allPages.size === 0) {
			console.log('❌ No pages found for this user!');
			console.log('');
			console.log('💡 This means:');
			console.log('   - User exists in Strapi ✅');
			console.log('   - But no pages are linked to them ❌');
			console.log('   - Try creating a new page to test the fix!');
		} else {
			let relationCount = 0;
			let userIdCount = 0;
			let bothCount = 0;
			
			allPages.forEach((page, id) => {
				console.log(`📄 Page ${id}:`);
				console.log(`   - Title: ${page.title}`);
				console.log(`   - Slug: ${page.slug}`);
				console.log(`   - Type: ${page.pageType}`);
				console.log(`   - userId field: ${page.userId || '❌ MISSING'}`);
				console.log(`   - Linked via: ${page.source}`);
				
				if (page.source === 'relation') relationCount++;
				else if (page.source === 'userId') userIdCount++;
				else if (page.source === 'both') bothCount++;
				
				console.log('');
			});
			
			console.log('📊 Breakdown:');
			console.log(`   - Linked via Strapi relation only: ${relationCount}`);
			console.log(`   - Linked via userId field only: ${userIdCount}`);
			console.log(`   - Linked via BOTH (✅ BEST): ${bothCount}`);
			console.log('');
			
			if (bothCount === allPages.size) {
				console.log('🎉 PERFECT! All pages are linked via BOTH methods!');
				console.log('   This is a professional user management system! ✅');
			} else if (userIdCount > 0 && relationCount === 0 && bothCount === 0) {
				console.log('⚠️ Pages are only linked via userId field (old method)');
				console.log('   The fix will apply to NEW pages you create.');
				console.log('   Old pages will continue to work via userId field.');
			} else {
				console.log('✅ Mix of old and new pages - this is normal during migration!');
			}
		}
		
		console.log('═══════════════════════════════════════════════════════════');
		
	} catch (error) {
		console.error('❌ Error:', error.message);
	}
}

checkUserWithPages();
