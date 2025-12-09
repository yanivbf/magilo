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
		// Get subscription status from cookies (workaround for Strapi users plugin limitation)
		let subscriptionStatus = cookies.get('subscriptionStatus') || 'inactive';
		let subscriptionExpiry = cookies.get('subscriptionExpiry') || null;
		
		console.log('✅ User subscription status from cookies:', subscriptionStatus);
		
		// Fetch pages by user relation (only essential fields for dashboard)
		const response1 = await fetch(
			`${STRAPI_URL}/api/pages?filters[user][id][$eq]=${userId}&fields[0]=title&fields[1]=slug&fields[2]=pageType&fields[3]=description&fields[4]=isActive&fields[5]=phone&fields[6]=email&fields[7]=address&fields[8]=metadata&fields[9]=subscriptionStatus&fields[10]=subscriptionExpiry&fields[11]=createdAt&fields[12]=updatedAt`,
			{
				headers: {
					'Authorization': `Bearer ${STRAPI_API_TOKEN}`
				}
			}
		);
		
		// Fetch pages by userId field (only essential fields for dashboard)
		const response2 = await fetch(
			`${STRAPI_URL}/api/pages?filters[userId][$eq]=${userId}&fields[0]=title&fields[1]=slug&fields[2]=pageType&fields[3]=description&fields[4]=isActive&fields[5]=phone&fields[6]=email&fields[7]=address&fields[8]=metadata&fields[9]=subscriptionStatus&fields[10]=subscriptionExpiry&fields[11]=createdAt&fields[12]=updatedAt`,
			{
				headers: {
					'Authorization': `Bearer ${STRAPI_API_TOKEN}`
				}
			}
		);
		
		let pages = [];
		
		if (response1.ok) {
			const result1 = await response1.json();
			pages = [...(result1.data || [])];
		}
		
		if (response2.ok) {
			const result2 = await response2.json();
			// Add pages from second query, avoiding duplicates
			const existingIds = new Set(pages.map(p => p.id));
			const newPages = (result2.data || []).filter(p => !existingIds.has(p.id));
			pages = [...pages, ...newPages];
		}
		
		if (!response1.ok && !response2.ok) {
			const errorText = await response1.text();
			console.error('❌ Strapi API Error:', response1.status, errorText);
			throw new Error(`Failed to fetch pages: ${response1.status} ${response1.statusText}`);
		}
		
		console.log(`✅ Successfully fetched ${pages.length} pages for user ${userId}`);
		
		// Transform Strapi data to match our format
		// Strapi v5 returns data directly, not in attributes
		const transformedPages = pages.map(page => {
			// Check if data is in attributes (Strapi v4 format) or directly (Strapi v5 format)
			const pageData = page.attributes || page;
			
			return {
				id: page.id,
				documentId: page.documentId,
				title: pageData.title,
				slug: pageData.slug,
				pageType: pageData.pageType,
				description: pageData.description,
				isActive: pageData.isActive,
				phone: pageData.phone,
				email: pageData.email,
				address: pageData.address,
				metadata: pageData.metadata,
				subscriptionStatus: pageData.subscriptionStatus || 'none', // PER PAGE
				subscriptionExpiry: pageData.subscriptionExpiry || null, // PER PAGE
				createdAt: pageData.createdAt || page.createdAt,
				updatedAt: pageData.updatedAt || page.updatedAt
			};
		});
		
		return {
			pages: transformedPages,
			userId,
			subscriptionStatus,
			subscriptionExpiry,
			error: null
		};
	} catch (error) {
		console.error('❌ Error fetching pages:', error);
		return {
			pages: [],
			userId,
			subscriptionStatus: 'inactive',
			subscriptionExpiry: null,
			error: error.message
		};
	}
}
