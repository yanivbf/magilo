// Deactivate Premium Subscription for Page
import { json } from '@sveltejs/kit';
import { STRAPI_URL, STRAPI_API_TOKEN } from '$env/static/private';

export async function POST({ request }) {
	try {
		const { pageId, userId } = await request.json();
		
		if (!pageId || !userId) {
			return json({
				success: false,
				error: 'Missing pageId or userId'
			}, { status: 400 });
		}
		
		// Find subscription for this page
		const subscriptionResponse = await fetch(
			`${STRAPI_URL}/api/subscriptions?filters[page][id][$eq]=${pageId}&populate=*`,
			{
				headers: {
					'Authorization': `Bearer ${STRAPI_API_TOKEN}`
				}
			}
		);
		
		const subscriptionData = await subscriptionResponse.json();
		const subscription = subscriptionData.data?.[0];
		
		if (!subscription) {
			return json({
				success: false,
				error: 'No active subscription found'
			}, { status: 404 });
		}
		
		// Update subscription status to cancelled
		const response = await fetch(`${STRAPI_URL}/api/subscriptions/${subscription.id}`, {
			method: 'PUT',
			headers: {
				'Content-Type': 'application/json',
				'Authorization': `Bearer ${STRAPI_API_TOKEN}`
			},
			body: JSON.stringify({
				data: {
					status: 'cancelled',
					cancelledAt: new Date().toISOString(),
					autoRenew: false
				}
			})
		});
		
		if (!response.ok) {
			throw new Error('Failed to deactivate subscription');
		}
		
		const result = await response.json();
		
		return json({
			success: true,
			message: 'Subscription deactivated successfully',
			subscription: result.data
		});
		
	} catch (error) {
		console.error('Error deactivating subscription:', error);
		return json({
			success: false,
			error: error.message || 'Failed to deactivate subscription'
		}, { status: 500 });
	}
}
