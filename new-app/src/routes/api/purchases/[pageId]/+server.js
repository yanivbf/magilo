// @ts-check
import { json } from '@sveltejs/kit';
import { getPurchasesByPage } from '$lib/server/strapi.js';

/**
 * GET /api/purchases/[pageId]
 * Get all purchases for a page
 * @type {import('./$types').RequestHandler}
 */
export async function GET({ params }) {
	try {
		const { pageId } = params;

		if (!pageId) {
			return json({ error: 'Missing pageId' }, { status: 400 });
		}

		console.log(`🛒 Getting purchases for page: ${pageId}`);

		// Get purchases from Strapi
		const purchases = await getPurchasesByPage(pageId);

		console.log(`✅ Found ${purchases.length} purchases for page ${pageId}`);

		// Transform response
		const transformedPurchases = purchases.map((purchase) => ({
			id: purchase.id,
			products: purchase.attributes.products,
			total: purchase.attributes.total,
			paymentMethod: purchase.attributes.paymentMethod,
			customerName: purchase.attributes.customerName,
			customerPhone: purchase.attributes.customerPhone,
			customerEmail: purchase.attributes.customerEmail,
			customerAddress: purchase.attributes.customerAddress,
			shipping: purchase.attributes.shipping,
			status: purchase.attributes.status,
			statusText: purchase.attributes.statusText,
			createdAt: purchase.attributes.createdAt,
			updatedAt: purchase.attributes.updatedAt,
			pickedAt: purchase.attributes.pickedAt,
			deliveredAt: purchase.attributes.deliveredAt,
			driverId: purchase.attributes.driverId,
			driverName: purchase.attributes.driverName,
			// Include user info if populated
			user: purchase.attributes.user?.data
				? {
						id: purchase.attributes.user.data.id,
						name: purchase.attributes.user.data.attributes.name
					}
				: null
		}));

		return json({
			success: true,
			purchases: transformedPurchases,
			count: transformedPurchases.length
		});
	} catch (error) {
		console.error('❌ Error getting purchases:', error);
		return json(
			{
				error: 'Failed to get purchases',
				details: error.message
			},
			{ status: 500 }
		);
	}
}
