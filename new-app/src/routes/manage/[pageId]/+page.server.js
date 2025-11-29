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
		// Fetch page details
		const pageResponse = await fetch(`${STRAPI_URL}/api/pages/${pageId}?populate=*`, {
			headers: {
				Authorization: `Bearer ${STRAPI_API_TOKEN}`
			}
		});

		if (!pageResponse.ok) {
			throw error(404, 'Page not found');
		}

		const pageData = await pageResponse.json();
		const page = pageData.data
			? {
					id: pageData.data.id,
					documentId: pageData.data.documentId,
					...pageData.data.attributes
			  }
			: null;

		if (!page) {
			throw error(404, 'Page not found');
		}

		// Verify ownership
		if (page.userId !== userId) {
			throw error(403, 'Forbidden');
		}

		// Fetch leads for this page
		const leadsResponse = await fetch(
			`${STRAPI_URL}/api/leads?filters[pageId][$eq]=${pageId}&sort=createdAt:desc&populate=*`,
			{
				headers: {
					Authorization: `Bearer ${STRAPI_API_TOKEN}`
				}
			}
		);

		const leadsData = await leadsResponse.json();
		const leads = leadsData.data
			? leadsData.data.map((lead) => ({
					id: lead.id,
					documentId: lead.documentId,
					...lead.attributes
			  }))
			: [];

		// Fetch purchases for this page
		const purchasesResponse = await fetch(
			`${STRAPI_URL}/api/purchases?filters[pageId][$eq]=${pageId}&sort=createdAt:desc&populate=*`,
			{
				headers: {
					Authorization: `Bearer ${STRAPI_API_TOKEN}`
				}
			}
		);

		const purchasesData = await purchasesResponse.json();
		const purchases = purchasesData.data
			? purchasesData.data.map((purchase) => ({
					id: purchase.id,
					documentId: purchase.documentId,
					...purchase.attributes
			  }))
			: [];

		// Fetch analytics for this page
		const analyticsResponse = await fetch(
			`${STRAPI_URL}/api/analytics?filters[pageId][$eq]=${pageId}&populate=*`,
			{
				headers: {
					Authorization: `Bearer ${STRAPI_API_TOKEN}`
				}
			}
		);

		const analyticsData = await analyticsResponse.json();
		const analytics = analyticsData.data?.[0]?.attributes || {
			views: 0,
			clicks: 0,
			conversions: 0,
			revenue: 0
		};

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
