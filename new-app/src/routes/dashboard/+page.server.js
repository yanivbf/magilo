// Dashboard server-side data fetching
import { STRAPI_URL, STRAPI_API_TOKEN } from '$env/static/private';

/** @type {import('./$types').PageServerLoad} */
export async function load({ locals, cookies, url }) {
	// Get user ID from multiple sources (priority order)
	let userId = url.searchParams.get('userId') || locals.userId || cookies.get('userId');
	
	// If userId is in URL, save it to cookie for future requests
	if (url.searchParams.get('userId')) {
		cookies.set('userId', url.searchParams.get('userId'), {
			path: '/',
			maxAge: 60 * 60 * 24 * 30, // 30 days
			httpOnly: false, // Allow client-side access
			sameSite: 'lax'
		});
		userId = url.searchParams.get('userId');
	}
	
	if (!userId) {
		console.log('❌ No user ID found in:', { 
			url: url.searchParams.get('userId'), 
			locals: locals.userId, 
			cookies: cookies.get('userId') 
		});
		return {
			pages: [],
			userId: null,
			error: 'No user ID found. Please log in again.'
		};
	}
	
	console.log('✅ User ID found:', userId);
	
	try {
		// CRITICAL FIX: Use correct Strapi filter format for user relation
		// filters[user][id][$eq] instead of filters[userId][$eq]
		const response = await fetch(`${STRAPI_URL}/api/pages?filters[user][id][$eq]=${userId}&populate=*`, {
			headers: {
				'Authorization': `Bearer ${STRAPI_API_TOKEN}`
			}
		});
		
		if (!response.ok) {
			const errorText = await response.text();
			console.error('❌ Strapi API Error:', response.status, errorText);
			throw new Error(`Failed to fetch pages: ${response.status} ${response.statusText}`);
		}
		
		const result = await response.json();
		const pages = result.data || [];
		
		console.log(`✅ Successfully fetched ${pages.length} pages for user ${userId}`);
		
		// Transform Strapi data to match our format
		const transformedPages = pages.map(page => ({
			id: page.id,
			...page.attributes,
			documentId: page.documentId
		}));
		
		return {
			pages: transformedPages,
			userId,
			error: null
		};
	} catch (error) {
		console.error('❌ Error fetching pages:', error);
		return {
			pages: [],
			userId,
			error: error.message
		};
	}
}
