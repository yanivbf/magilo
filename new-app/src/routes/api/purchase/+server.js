// @ts-check
import { json } from '@sveltejs/kit';
import { createPurchase, incrementPurchaseAnalytics } from '$lib/server/strapi.js';
import { STRAPI_URL, STRAPI_API_TOKEN } from '$env/static/private';

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
			paymentMethod,
			fullBody: body
		});

		// Validate required fields
		if (!userId) {
			console.error('❌ Missing userId');
			return json({ error: 'Missing userId' }, { status: 400 });
		}

		if (!pageId) {
			console.error('❌ Missing pageId');
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

		// Look up IDs in PARALLEL (not sequential) for speed
		const [strapiUserId, strapiPageId] = await Promise.all([
			// User lookup
			(async () => {
				if (!userId.startsWith('google_')) return userId;
				
				console.log(`🔍 Looking up user: ${userId}`);
				const res = await fetch(`${STRAPI_URL}/api/users?filters[userId][$eq]=${userId}`, {
					headers: { Authorization: `Bearer ${STRAPI_API_TOKEN}` }
				});
				
				if (!res.ok) throw new Error(`User not found: ${userId}`);
				const data = await res.json();
				
				if (!data.data || data.data.length === 0) throw new Error(`User not found: ${userId}`);
				return data.data[0].id;
			})(),
			
			// Page lookup
			(async () => {
				if (!isNaN(pageId)) return pageId;
				
				console.log(`🔍 Looking up page: ${pageId}`);
				const res = await fetch(`${STRAPI_URL}/api/pages/${pageId}`, {
					headers: { Authorization: `Bearer ${STRAPI_API_TOKEN}` }
				});
				
				if (!res.ok) throw new Error(`Page not found: ${pageId}`);
				const data = await res.json();
				
				if (!data.data || !data.data.id) throw new Error(`Page not found: ${pageId}`);
				return data.data.id;
			})()
		]);

		// Create purchase in Strapi
		console.log('💾 Creating purchase in Strapi with data:', {
			userId: strapiUserId,
			pageId: strapiPageId,
			productsCount: products.length,
			total,
			paymentMethod,
			customerName,
			customerPhone
		});
		
		const purchaseResponse = await createPurchase({
			userId: strapiUserId,
			pageId: strapiPageId,
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

		console.log('📥 Purchase response:', purchaseResponse);
		
		if (!purchaseResponse || !purchaseResponse.data) {
			console.error('❌ Invalid purchase response:', purchaseResponse);
			throw new Error('Invalid response from Strapi when creating purchase');
		}

		const purchaseId = purchaseResponse.data.id;
		console.log(`✅ Purchase created with ID: ${purchaseId}`);

		// Update analytics asynchronously (don't wait for it)
		incrementPurchaseAnalytics(pageId, { total }).catch(err => {
			console.error('⚠️ Failed to update analytics:', err);
		});

		return json({
			success: true,
			purchaseId,
			message: 'Purchase created successfully'
		});
	} catch (error) {
		const errorMessage = error instanceof Error ? error.message : String(error);
		const errorStack = error instanceof Error ? error.stack : undefined;
		
		console.error('❌ Error creating purchase:', errorMessage);
		if (errorStack) {
			console.error('❌ Stack trace:', errorStack);
		}
		
		return json(
			{
				error: 'Failed to create purchase',
				details: errorMessage,
				timestamp: new Date().toISOString()
			},
			{ status: 500 }
		);
	}
}
