// Activate Premium Subscription for Page
import { json } from '@sveltejs/kit';
import { STRAPI_URL, STRAPI_API_TOKEN } from '$env/static/private';

export async function POST({ request }) {
	try {
		const { pageId, userId, plan = 'premium', duration = 'monthly' } = await request.json();
		
		if (!pageId || !userId) {
			return json({
				success: false,
				error: 'Missing pageId or userId'
			}, { status: 400 });
		}
		
		// Check if subscription already exists
		const existingResponse = await fetch(
			`${STRAPI_URL}/api/subscriptions?filters[page][id][$eq]=${pageId}&populate=*`,
			{
				headers: {
					'Authorization': `Bearer ${STRAPI_API_TOKEN}`
				}
			}
		);
		
		const existingData = await existingResponse.json();
		const existing = existingData.data?.[0];
		
		const now = new Date();
		const expiresAt = new Date();
		
		// Set expiration based on duration
		if (duration === 'monthly') {
			expiresAt.setMonth(expiresAt.getMonth() + 1);
		} else if (duration === 'yearly') {
			expiresAt.setFullYear(expiresAt.getFullYear() + 1);
		} else {
			expiresAt.setMonth(expiresAt.getMonth() + 1); // Default to monthly
		}
		
		const subscriptionData = {
			page: pageId,
			plan,
			status: 'active',
			startDate: now.toISOString(),
			expiresAt: expiresAt.toISOString(),
			autoRenew: false
		};
		
		let response;
		
		if (existing) {
			// Update existing subscription
			response = await fetch(`${STRAPI_URL}/api/subscriptions/${existing.id}`, {
				method: 'PUT',
				headers: {
					'Content-Type': 'application/json',
					'Authorization': `Bearer ${STRAPI_API_TOKEN}`
				},
				body: JSON.stringify({ data: subscriptionData })
			});
		} else {
			// Create new subscription
			response = await fetch(`${STRAPI_URL}/api/subscriptions`, {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
					'Authorization': `Bearer ${STRAPI_API_TOKEN}`
				},
				body: JSON.stringify({ data: subscriptionData })
			});
		}
		
		if (!response.ok) {
			throw new Error('Failed to activate subscription');
		}
		
		const result = await response.json();
		
		return json({
			success: true,
			message: 'Subscription activated successfully',
			subscription: result.data
		});
		
	} catch (error) {
		console.error('Error activating subscription:', error);
		return json({
			success: false,
			error: error.message || 'Failed to activate subscription'
		}, { status: 500 });
	}
}
