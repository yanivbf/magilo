// @ts-check
import { json } from '@sveltejs/kit';
import { createPurchase, incrementPurchaseAnalytics } from '$lib/server/strapi.js';

/**
 * POST /api/purchase
 * Create a new purchase
 * @type {import('./$types').RequestHandler}
 */
export async function POST({ request }) {
	try {
		const body = await request.json();
		const {
			userId,
			pageId,
			products,
			total,
			paymentMethod,
			customerName,
			customerPhone,
			customerEmail,
			customerAddress,
			shipping
		} = body;

		console.log('🛒 PURCHASE REQUEST:', {
			userId,
			pageId,
			productsCount: products?.length,
			total,
			paymentMethod
		});

		// Validate required fields
		if (!userId) {
			return json({ error: 'Missing userId' }, { status: 400 });
		}

		if (!pageId) {
			return json({ error: 'Missing pageId' }, { status: 400 });
		}

		if (!products || products.length === 0) {
			return json({ error: 'Missing products' }, { status: 400 });
		}

		if (!total || total <= 0) {
			return json({ error: 'Invalid total amount' }, { status: 400 });
		}

		if (!paymentMethod) {
			return json({ error: 'Missing paymentMethod' }, { status: 400 });
		}

		if (!customerName) {
			return json({ error: 'Missing customerName' }, { status: 400 });
		}

		if (!customerPhone) {
			return json({ error: 'Missing customerPhone' }, { status: 400 });
		}

		// Create purchase in Strapi
		const purchaseResponse = await createPurchase({
			userId,
			pageId,
			products,
			total,
			paymentMethod,
			customerName,
			customerPhone,
			customerEmail: customerEmail || '',
			customerAddress: customerAddress || '',
			shipping: shipping || false,
			status: 'pending'
		});

		const purchaseId = purchaseResponse.data.id;
		console.log(`✅ Purchase created with ID: ${purchaseId}`);

		// Update analytics
		try {
			await incrementPurchaseAnalytics(pageId, { total });
			console.log(`✅ Analytics updated for page ${pageId}`);
		} catch (analyticsError) {
			console.error('⚠️ Failed to update analytics:', analyticsError);
			// Don't fail the request if analytics update fails
		}

		return json({
			success: true,
			purchaseId,
			message: 'Purchase created successfully'
		});
	} catch (error) {
		console.error('❌ Error creating purchase:', error);
		return json(
			{
				error: 'Failed to create purchase',
				details: error.message
			},
			{ status: 500 }
		);
	}
}
