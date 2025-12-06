// Check latest page ownership
const fetch = (...args) => import('node-fetch').then(({default: fetch}) => fetch(...args));

const STRAPI_URL = 'http://localhost:1337';
const STRAPI_TOKEN = 'b6a4ef5e9c3d0a8f7b2e1d4c6a9f8e7d3c2b1a0f9e8d7c6b5a4f3e2d1c0b9a8';
const MY_USER_ID = 'google_111351120503275674259';

async function checkLatestPage() {
	try {
		console.log('🔍 Fetching latest page...\n');
		
		const response = await fetch(`${STRAPI_URL}/api/pages?sort=createdAt:desc&pagination[limit]=1`, {
			headers: {
				'Authorization': `Bearer ${STRAPI_TOKEN}`
			}
		});
		
		const data = await response.json();
		
		if (!data.data || data.data.length === 0) {
			console.log('❌ No pages found in database');
			return;
		}
		
		const page = data.data[0];
		const attrs = page.attributes || page;
		
		console.log('📄 LATEST PAGE:');
		console.log('   - ID:', page.id);
		console.log('   - Document ID:', page.documentId);
		console.log('   - Title:', attrs.title);
		console.log('   - Slug:', attrs.slug);
		console.log('   - Page Type:', attrs.pageType);
		console.log('');
		
		console.log('🔑 OWNERSHIP FIELDS:');
		console.log('   - userId field:', attrs.userId || '❌ NOT SET');
		console.log('   - metadata.createdByUserId:', attrs.metadata?.createdByUserId || '❌ NOT SET');
		console.log('   - user relation:', attrs.user || '❌ NOT SET');
		console.log('');
		
		console.log('✅ MY USER ID:', MY_USER_ID);
		console.log('');
		
		console.log('🎯 OWNERSHIP CHECK:');
		if (attrs.userId === MY_USER_ID) {
			console.log('   ✅ userId MATCHES - You are the owner!');
		} else {
			console.log('   ❌ userId DOES NOT MATCH');
			console.log('      Expected:', MY_USER_ID);
			console.log('      Got:', attrs.userId || 'null');
		}
		
		if (attrs.metadata?.createdByUserId === MY_USER_ID) {
			console.log('   ✅ metadata.createdByUserId MATCHES');
		} else {
			console.log('   ❌ metadata.createdByUserId DOES NOT MATCH');
		}
		
	} catch (error) {
		console.error('❌ Error:', error.message);
	}
}

checkLatestPage();
