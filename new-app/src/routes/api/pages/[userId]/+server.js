// @ts-check
import { json } from '@sveltejs/kit';
import { getPagesByUser } from '$lib/server/strapi.js';

/**
 * GET /api/pages/[userId]
 * Get all pages for a user
 * @type {import('./$types').RequestHandler}
 */
export async function GET({ params }) {
	try {
		const { userId } = params;

		if (!userId) {
			return json({ error: 'Missing userId' }, { status: 400 });
		}

		console.log(`📄 Getting pages for user: ${userId}`);

		// Get pages from Strapi
		const pages = await getPagesByUser(userId);

		console.log(`✅ Found ${pages.length} pages for user ${userId}`);

		// Transform response to match legacy format
		const transformedPages = pages.map((page) => ({
			id: page.id,
			title: page.attributes.title,
			slug: page.attributes.slug,
			pageType: page.attributes.pageType,
			description: page.attributes.description,
			isActive: page.attributes.isActive,
			phone: page.attributes.phone,
			email: page.attributes.email,
			city: page.attributes.city,
			address: page.attributes.address,
			products: page.attributes.products || [],
			metadata: page.attributes.metadata || {},
			createdAt: page.attributes.createdAt,
			updatedAt: page.attributes.updatedAt,
			// Include analytics if populated
			analytics: page.attributes.analytics?.data
				? {
						id: page.attributes.analytics.data.id,
						totalSales: page.attributes.analytics.data.attributes.totalSales,
						totalOrders: page.attributes.analytics.data.attributes.totalOrders,
						totalLeads: page.attributes.analytics.data.attributes.totalLeads
					}
				: null
		}));

		return json({
			success: true,
			pages: transformedPages,
			count: transformedPages.length
		});
	} catch (error) {
		console.error('❌ Error getting pages:', error);
		return json(
			{
				error: 'Failed to get pages',
				details: error.message
			},
			{ status: 500 }
		);
	}
}
