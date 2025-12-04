// @ts-check
import { json } from '@sveltejs/kit';
import { getActivePages } from '$lib/server/strapi.js';

/**
 * GET /api/pages/all/marketplace
 * Get all active pages for marketplace display
 * Supports search, filtering, and pagination
 * @type {import('./$types').RequestHandler}
 */
export async function GET({ url }) {
	try {
		// Get query parameters
		const search = url.searchParams.get('search') || '';
		const pageType = url.searchParams.get('pageType') || '';
		const page = parseInt(url.searchParams.get('page') || '1');
		const pageSize = parseInt(url.searchParams.get('pageSize') || '25');

		console.log('🌍 MARKETPLACE REQUEST:', {
			search,
			pageType,
			page,
			pageSize
		});

		// Get active pages from Strapi
		const result = await getActivePages({
			search,
			pageType,
			page,
			pageSize
		});

		console.log(`✅ Found ${result.data.length} marketplace pages`);

		// Transform response with safety checks
		const transformedPages = result.data
			.filter((page) => page && page.attributes) // Filter out invalid pages
			.map((page) => ({
				id: page.id,
				title: page.attributes.title || 'ללא כותרת',
				slug: page.attributes.slug || `page-${page.id}`,
				pageType: page.attributes.pageType || 'unknown',
				description: page.attributes.description || '',
				phone: page.attributes.phone || '',
				email: page.attributes.email || '',
				city: page.attributes.city || '',
				products: page.attributes.products || [],
				createdAt: page.attributes.createdAt,
				// Include user info if populated
				user: page.attributes.user?.data
					? {
							id: page.attributes.user.data.id,
							name: page.attributes.user.data.attributes?.name || 'משתמש'
						}
					: null
			}));

		return json({
			success: true,
			pages: transformedPages,
			pagination: {
				page: result.meta.pagination.page,
				pageSize: result.meta.pagination.pageSize,
				pageCount: result.meta.pagination.pageCount,
				total: result.meta.pagination.total
			}
		});
	} catch (error) {
		console.error('❌ Error getting marketplace pages:', error);
		return json(
			{
				error: 'Failed to get marketplace pages',
				details: error.message
			},
			{ status: 500 }
		);
	}
}
