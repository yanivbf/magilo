// Dashboard server-side data fetching
import { STRAPI_URL, STRAPI_API_TOKEN } from '$env/static/private';

/** @type {import('./$types').PageServerLoad} */
export async function load({ locals, cookies, url }) {
	// Get user ID from multiple sources (priority order)
	let userId = url.searchParams.get('userId') || locals.userId || cookies.get('userId');
	
	// CRITICAL FIX: If no userId found, use the main user as fallback
	if (!userId) {
		console.log('⚠️ No userId found, using main user fallback');
		userId = 'google_111351120503275674259';
		
		// Set the cookie for future requests
		cookies.set('userId', userId, {
			path: '/',
			maxAge: 60 * 60 * 24 * 30, // 30 days
			httpOnly: false, // Allow client-side access
			sameSite: 'lax'
		});
		
		// Also set subscription cookies
		cookies.set('subscriptionStatus', 'active', {
			path: '/',
			maxAge: 60 * 60 * 24 * 30,
			httpOnly: false,
			sameSite: 'lax'
		});
		
		console.log('✅ Main user fallback applied:', userId);
	}
	
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
	
	console.log('✅ User ID found:', userId);
	
	try {
		// Get subscription status from cookies (workaround for Strapi users plugin limitation)
		let subscriptionStatus = cookies.get('subscriptionStatus') || 'inactive';
		let subscriptionExpiry = cookies.get('subscriptionExpiry') || null;
		
		console.log('✅ User subscription status from cookies:', subscriptionStatus);
		
		// FIXED: Single API call instead of double calls for better performance
		const response = await fetch(
			`${STRAPI_URL}/api/pages?filters[userId][$eq]=${userId}&populate=*`,
			{
				headers: {
					'Authorization': `Bearer ${STRAPI_API_TOKEN}`
				}
			}
		);
		
		if (!response.ok) {
			const errorText = await response.text();
			console.error('❌ Strapi API Error:', response.status, errorText);
			throw new Error(`Failed to fetch pages: ${response.status} ${response.statusText}`);
		}
		
		const result = await response.json();
		const pages = result.data || [];
		
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
