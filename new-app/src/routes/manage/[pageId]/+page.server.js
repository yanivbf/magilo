// @ts-check
import { error } from '@sveltejs/kit';
import { STRAPI_URL, STRAPI_API_TOKEN } from '$env/static/private';

/** @type {import('./$types').PageServerLoad} */
export async function load({ params, locals, cookies }) {
	const { pageId } = params;
	const userId = locals.userId || cookies.get('userId');

	if (!userId) {
		throw error(401, 'Unauthorized');
	}

	try {
		console.log('🔍 Looking for page:', pageId);
		
		// Try multiple strategies to find the page
		let pageResponse;
		let pageData;
		let pageItem = null;
		
		// Strategy 1: Try by documentId
		try {
			pageResponse = await fetch(`${STRAPI_URL}/api/pages/${pageId}?populate=deep,3`, {
				headers: {
					Authorization: `Bearer ${STRAPI_API_TOKEN}`
				}
			});
			pageData = await pageResponse.json();
			if (pageResponse.ok && pageData.data) {
				pageItem = pageData.data;
				console.log('✅ Found by documentId');
			}
		} catch (e) {
			console.log('❌ Not found by documentId');
		}
		
		// Strategy 2: Try by slug
		if (!pageItem) {
			try {
				pageResponse = await fetch(`${STRAPI_URL}/api/pages?filters[slug][$eq]=${pageId}&populate=deep,3`, {
					headers: {
						Authorization: `Bearer ${STRAPI_API_TOKEN}`
					}
				});
				pageData = await pageResponse.json();
				if (pageResponse.ok && pageData.data && pageData.data.length > 0) {
					pageItem = pageData.data[0];
					console.log('✅ Found by slug');
				}
			} catch (e) {
				console.log('❌ Not found by slug');
			}
		}
		
		// Strategy 3: Try by numeric ID
		if (!pageItem && !isNaN(pageId)) {
			try {
				pageResponse = await fetch(`${STRAPI_URL}/api/pages?filters[id][$eq]=${pageId}&populate=deep,3`, {
					headers: {
						Authorization: `Bearer ${STRAPI_API_TOKEN}`
					}
				});
				pageData = await pageResponse.json();
				if (pageResponse.ok && pageData.data && pageData.data.length > 0) {
					pageItem = pageData.data[0];
					console.log('✅ Found by numeric ID');
				}
			} catch (e) {
				console.log('❌ Not found by numeric ID');
			}
		}

		if (!pageItem) {
			console.error('❌ Page not found with any strategy');
			throw error(404, 'Page not found');
		}

		// Extract page data (handle both v4 and v5 formats)
		const page = {
			id: pageItem.id,
			documentId: pageItem.documentId || pageItem.id,
			...(pageItem.attributes || pageItem)
		};
		
		// Ensure template field exists (fallback to pageType if missing)
		if (!page.template && page.pageType) {
			page.template = page.pageType;
			console.log('⚠️ Template field missing, using pageType:', page.pageType);
		}
		
		console.log('📄 Page loaded:', page.title || page.slug);
		console.log('👤 Page userId:', page.userId);
		console.log('👤 Current userId:', userId);

		// Verify ownership (skip in development or if page has no userId yet)
		const isDev = process.env.NODE_ENV === 'development';
		if (!isDev && page.userId && page.userId !== userId) {
			console.error('❌ Ownership mismatch!');
			throw error(403, 'Forbidden');
		}

		// Use the actual page ID for related data
		const actualPageId = page.id;

		// Fetch leads for this page (with error handling)
		let leads = [];
		try {
			const leadsResponse = await fetch(
				`${STRAPI_URL}/api/leads?filters[pageId][$eq]=${actualPageId}&sort=createdAt:desc&populate=*`,
				{
					headers: {
						Authorization: `Bearer ${STRAPI_API_TOKEN}`
					}
				}
			);
			if (leadsResponse.ok) {
				const leadsData = await leadsResponse.json();
				leads = leadsData.data
					? leadsData.data.map((lead) => ({
							id: lead.id,
							documentId: lead.documentId,
							...lead.attributes
					  }))
					: [];
			}
		} catch (err) {
			console.warn('Could not fetch leads:', err);
		}

		// Fetch purchases for this page (with error handling)
		let purchases = [];
		try {
			const purchasesResponse = await fetch(
				`${STRAPI_URL}/api/purchases?filters[pageId][$eq]=${actualPageId}&sort=createdAt:desc&populate=*`,
				{
					headers: {
						Authorization: `Bearer ${STRAPI_API_TOKEN}`
					}
				}
			);
			if (purchasesResponse.ok) {
				const purchasesData = await purchasesResponse.json();
				purchases = purchasesData.data
					? purchasesData.data.map((purchase) => ({
							id: purchase.id,
							documentId: purchase.documentId,
							...purchase.attributes
					  }))
					: [];
			}
		} catch (err) {
			console.warn('Could not fetch purchases:', err);
		}

		// Fetch analytics for this page (with error handling)
		let analytics = {
			views: 0,
			clicks: 0,
			conversions: 0,
			revenue: 0
		};
		try {
			const analyticsResponse = await fetch(
				`${STRAPI_URL}/api/analytics?filters[pageId][$eq]=${actualPageId}&populate=*`,
				{
					headers: {
						Authorization: `Bearer ${STRAPI_API_TOKEN}`
					}
				}
			);
			if (analyticsResponse.ok) {
				const analyticsData = await analyticsResponse.json();
				analytics = analyticsData.data?.[0]?.attributes || analytics;
			}
		} catch (err) {
			console.warn('Could not fetch analytics:', err);
		}

		// Fetch products for this page (if applicable)
		let products = [];
		try {
			const productsResponse = await fetch(
				`${STRAPI_URL}/api/products?filters[page][id][$eq]=${actualPageId}&sort=order:asc`,
				{
					headers: {
						Authorization: `Bearer ${STRAPI_API_TOKEN}`
					}
				}
			);
			if (productsResponse.ok) {
				const productsData = await productsResponse.json();
				products = productsData.data
					? productsData.data.map((p) => ({
							id: p.id,
							documentId: p.documentId,
							...p.attributes
					  }))
					: [];
			}
		} catch (err) {
			console.warn('Could not fetch products:', err);
		}

		// Fetch sections for this page (if applicable)
		let sections = [];
		try {
			const sectionsResponse = await fetch(
				`${STRAPI_URL}/api/sections?filters[page][id][$eq]=${actualPageId}&sort=order:asc`,
				{
					headers: {
						Authorization: `Bearer ${STRAPI_API_TOKEN}`
					}
				}
			);
			if (sectionsResponse.ok) {
				const sectionsData = await sectionsResponse.json();
				sections = sectionsData.data
					? sectionsData.data.map((s) => ({
							id: s.id,
							documentId: s.documentId,
							...s.attributes
					  }))
					: [];
			}
		} catch (err) {
			console.warn('Could not fetch sections:', err);
		}

		// Add products and sections to page data
		page.products = products;
		page.storeProducts = products; // Keep for backwards compatibility
		page.sections = sections;

		return {
			page,
			leads,
			purchases,
			analytics
		};
	} catch (err) {
		console.error('Error loading page management data:', err);
		throw error(500, 'Failed to load page data');
	}
}
