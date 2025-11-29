// @ts-check
import { json } from '@sveltejs/kit';
import { updatePurchaseStatus } from '$lib/server/strapi.js';

/**
 * PUT /api/purchase/[purchaseId]/status
 * Update purchase status
 * @type {import('./$types').RequestHandler}
 */
export async function PUT({ params, request }) {
	try {
		const { purchaseId } = params;
		const body = await request.json();
		const { status, statusText, driverId, driverName } = body;

		console.log('🛒 UPDATE PURCHASE STATUS:', {
			purchaseId,
			status,
			statusText
		});

		// Validate required fields
		if (!purchaseId) {
			return json({ error: 'Missing purchaseId' }, { status: 400 });
		}

		if (!status) {
			return json({ error: 'Missing status' }, { status: 400 });
		}

		// Validate status value
		const validStatuses = ['pending', 'processing', 'shipped', 'delivered', 'cancelled'];
		if (!validStatuses.includes(status)) {
			return json(
				{
					error: `Invalid status. Must be one of: ${validStatuses.join(', ')}`
				},
				{ status: 400 }
			);
		}

		// Prepare additional data
		const additionalData = {};
		if (statusText) additionalData.statusText = statusText;
		if (driverId) additionalData.driverId = driverId;
		if (driverName) additionalData.driverName = driverName;

		// Update purchase status in Strapi
		await updatePurchaseStatus(purchaseId, status, additionalData);

		console.log(`✅ Purchase ${purchaseId} status updated to: ${status}`);

		return json({
			success: true,
			message: 'Purchase status updated successfully'
		});
	} catch (error) {
		console.error('❌ Error updating purchase status:', error);
		return json(
			{
				error: 'Failed to update purchase status',
				details: error.message
			},
			{ status: 500 }
		);
	}
}
