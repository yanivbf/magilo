// Show detailed page information for debugging
const fs = require('fs');
const path = require('path');

// Try to read token from .env file
let STRAPI_TOKEN = 'your-token-here';
try {
	const envPath = path.join(__dirname, 'new-app', '.env');
	const envContent = fs.readFileSync(envPath, 'utf8');
	const tokenMatch = envContent.match(/STRAPI_API_TOKEN=(.+)/);
	if (tokenMatch) {
		STRAPI_TOKEN = tokenMatch[1].trim();
	}
} catch (error) {
	console.log('⚠️  Could not read .env file');
}

const STRAPI_URL = 'http://localhost:1337';

async function showPageInfo(slug) {
	try {
		console.log('🔍 Fetching page:', slug);
		console.log('');
		
		// Get page from Strapi
		const response = await fetch(
			`${STRAPI_URL}/api/pages?filters[slug][$eq]=${slug}&populate=*`,
			{
				headers: {
					'Authorization': `Bearer ${STRAPI_TOKEN}`
				}
			}
		);
		
		if (!response.ok) {
			console.error('❌ Failed to fetch page:', response.status);
			console.log('');
			console.log('Make sure:');
			console.log('1. Strapi is running (http://localhost:1337)');
			console.log('2. Token is correct in new-app/.env');
			return;
		}
		
		const result = await response.json();
		
		if (!result.data || result.data.length === 0) {
			console.error('❌ Page not found with slug:', slug);
			console.log('');
			console.log('Available pages:');
			
			// Show all pages
			const allPagesResponse = await fetch(`${STRAPI_URL}/api/pages`, {
				headers: {
					'Authorization': `Bearer ${STRAPI_TOKEN}`
				}
			});
			
			if (allPagesResponse.ok) {
				const allPages = await allPagesResponse.json();
				allPages.data.forEach(p => {
					const attrs = p.attributes || p;
					console.log(`  - ${attrs.slug} (${attrs.title})`);
				});
			}
			return;
		}
		
		const page = result.data[0];
		const attrs = page.attributes || page;
		
		console.log('═══════════════════════════════════════════════════════');
		console.log('📄 PAGE INFORMATION');
		console.log('═══════════════════════════════════════════════════════');
		console.log('');
		console.log('Basic Info:');
		console.log('  Title:', attrs.title);
		console.log('  Slug:', attrs.slug);
		console.log('  Page ID:', page.id);
		console.log('  Document ID:', page.documentId);
		console.log('  Page Type:', attrs.pageType);
		console.log('');
		
		console.log('═══════════════════════════════════════════════════════');
		console.log('👤 OWNERSHIP DATA (THIS IS IMPORTANT!)');
		console.log('═══════════════════════════════════════════════════════');
		console.log('');
		console.log('1. attrs.userId:', attrs.userId || '❌ MISSING');
		console.log('2. attrs.user:', attrs.user ? '✅ EXISTS' : '❌ MISSING');
		if (attrs.user) {
			console.log('   - attrs.user.data?.id:', attrs.user.data?.id || '❌ MISSING');
			console.log('   - attrs.user.id:', attrs.user.id || '❌ MISSING');
		}
		console.log('3. metadata.createdByUserId:', attrs.metadata?.createdByUserId || '❌ MISSING');
		console.log('');
		
		console.log('═══════════════════════════════════════════════════════');
		console.log('📋 METADATA');
		console.log('═══════════════════════════════════════════════════════');
		console.log('');
		if (attrs.metadata) {
			console.log(JSON.stringify(attrs.metadata, null, 2));
		} else {
			console.log('❌ No metadata found');
		}
		console.log('');
		
		console.log('═══════════════════════════════════════════════════════');
		console.log('🔍 DIAGNOSIS');
		console.log('═══════════════════════════════════════════════════════');
		console.log('');
		
		const hasUserId = !!attrs.userId;
		const hasCreatedBy = !!attrs.metadata?.createdByUserId;
		const hasUserRelation = !!(attrs.user?.data?.id || attrs.user?.id);
		
		if (hasCreatedBy) {
			console.log('✅ Page has createdByUserId in metadata');
			console.log('   Value:', attrs.metadata.createdByUserId);
			console.log('');
			console.log('📝 TO FIX OWNERSHIP:');
			console.log('   1. Open your page in browser');
			console.log('   2. Open console (F12)');
			console.log('   3. Type: document.cookie');
			console.log('   4. Find: userId=XXXXX');
			console.log('   5. Make sure it matches:', attrs.metadata.createdByUserId);
			console.log('');
			console.log('   If they don\'t match:');
			console.log('   - Logout and login again');
			console.log('   - Or create a new page (will work correctly)');
		} else {
			console.log('❌ Page is MISSING createdByUserId in metadata');
			console.log('');
			console.log('📝 TO FIX:');
			console.log('   Run: node fix-ownership.js');
			console.log('');
			console.log('   This will add createdByUserId to all pages');
		}
		
		console.log('');
		console.log('═══════════════════════════════════════════════════════');
		console.log('🎯 WHAT YOU SHOULD SEE IN BROWSER');
		console.log('═══════════════════════════════════════════════════════');
		console.log('');
		console.log('In browser console (F12):');
		console.log('  👤 Is owner: true  ← Should be TRUE');
		console.log('');
		console.log('On the page:');
		console.log('  ✅ "החלף רקע" button (left side, pulsing)');
		console.log('  ✅ Edit toolbar with 3 buttons (top center)');
		console.log('  ✅ Camera icons on gallery images (pulsing)');
		console.log('');
		
	} catch (error) {
		console.error('❌ Error:', error.message);
	}
}

// Get slug from command line
const slug = process.argv[2];

if (!slug) {
	console.log('Usage: node show-page-info.js <page-slug>');
	console.log('');
	console.log('Example:');
	console.log('  node show-page-info.js my-page-1733410000000');
	console.log('');
	console.log('To find your page slug:');
	console.log('  1. Open your page in browser');
	console.log('  2. Look at URL: http://localhost:5173/view/YOUR-SLUG-HERE');
	console.log('  3. Copy the slug part');
	process.exit(1);
}

showPageInfo(slug);
