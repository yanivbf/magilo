// @ts-check
import { json } from '@sveltejs/kit';
import { STRAPI_URL, STRAPI_API_TOKEN } from '$env/static/private';

/**
 * DELETE /api/purchase/[purchaseId]
 * Delete a purchase
 * @type {import('./$types').RequestHandler}
 */
export async function DELETE({ params }) {
	try {
		const { purchaseId } = params;

		console.log('🗑️ DELETE PURCHASE:', purchaseId);

		if (!purchaseId) {
			return json({ error: 'Missing purchaseId' }, { status: 400 });
		}

		// Delete purchase from Strapi
		const response = await fetch(`${STRAPI_URL}/api/purchases/${purchaseId}`, {
			method: 'DELETE',
			headers: {
				'Authorization': `Bearer ${STRAPI_API_TOKEN}`,
				'Content-Type': 'application/json'
			}
		});

		if (!response.ok) {
			const errorData = await response.json();
			console.error('❌ Strapi error:', errorData);
			return json(
				{
					error: 'Failed to delete purchase',
					details: errorData
				},
				{ status: response.status }
			);
		}

		console.log(`✅ Purchase ${purchaseId} deleted successfully`);

		return json({
			success: true,
			message: 'Purchase deleted successfully'
		});
	} catch (error) {
		console.error('❌ Error deleting purchase:', error);
		return json(
			{
				error: 'Failed to delete purchase',
				details: error.message
			},
			{ status: 500 }
		);
	}
}
