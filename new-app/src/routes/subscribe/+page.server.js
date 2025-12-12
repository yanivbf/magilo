// Server-side authentication check for subscription page
import { redirect } from '@sveltejs/kit';
import { STRAPI_URL, STRAPI_API_TOKEN } from '$env/static/private';

/** @type {import('./$types').PageServerLoad} */
export async function load({ cookies, url, request }) {
	const userId = cookies.get('userId');
	const pageId = url.searchParams.get('pageId');
	
	console.log('🔍 SUBSCRIPTION SERVER DEBUG:');
	console.log('   - userId from server cookies:', userId);
	console.log('   - pageId from URL:', pageId);
	console.log('   - All server cookies:', cookies.getAll());
	console.log('   - Request headers:', Object.fromEntries(request.headers.entries()));
	console.log('   - URL:', url.toString());
	
	// If no userId, let client handle it (don't redirect to avoid Google OAuth issues)
	if (!userId) {
		console.log('⚠️ No userId on server, letting client handle authentication');
		// Don't redirect - let the client handle this
	}
	
	// If no pageId, try to get user's first page
	let finalPageId = pageId;
	if (!pageId && userId) {
		console.log('⚠️ No pageId, trying to get user\'s first page');
		try {
			const userPagesResponse = await fetch(`${STRAPI_URL}/api/pages?filters[userId][$eq]=${userId}&pagination[limit]=1`, {
				headers: {
					'Authorization': `Bearer ${STRAPI_API_TOKEN}`
				}
			});
			
			if (userPagesResponse.ok) {
				const userPagesData = await userPagesResponse.json();
				if (userPagesData.data && userPagesData.data.length > 0) {
					finalPageId = userPagesData.data[0].documentId || userPagesData.data[0].id;
					console.log('✅ Found user\'s first page:', finalPageId);
				}
			}
		} catch (error) {
			console.error('Error fetching user pages:', error);
		}
	}
	
	// If still no pageId, redirect to dashboard
	if (!finalPageId) {
		console.log('❌ No pageId found, redirecting to dashboard');
		throw redirect(302, '/dashboard');
	}
	
	// Return the data to the client
	return {
		userId,
		pageId: finalPageId,
		authenticated: true,
		debug: {
			serverTime: new Date().toISOString(),
			cookieCount: Object.keys(cookies.getAll()).length,
			hasUserId: !!userId,
			hasPageId: !!finalPageId,
			originalPageId: pageId,
			finalPageId: finalPageId
		}
	};
}