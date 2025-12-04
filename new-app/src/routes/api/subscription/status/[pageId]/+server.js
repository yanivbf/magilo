// Check Subscription Status for Page
import { json } from '@sveltejs/kit';
import { STRAPI_URL, STRAPI_API_TOKEN } from '$env/static/private';

export async function GET({ params }) {
	try {
		const { pageId } = params;
		
		if (!pageId) {
			return json({
				success: false,
				error: 'Missing pageId'
			}, { status: 400 });
		}
		
		// Find subscription for this page
		const response = await fetch(
			`${STRAPI_URL}/api/subscriptions?filters[page][id][$eq]=${pageId}&populate=*`,
			{
				headers: {
					'Authorization': `Bearer ${STRAPI_API_TOKEN}`
				}
			}
		);
		
		if (!response.ok) {
			throw new Error('Failed to fetch subscription');
		}
		
		const data = await response.json();
		const subscription = data.data?.[0];
		
		if (!subscription) {
			return json({
				success: true,
				hasSubscription: false,
				status: 'none',
				plan: null
			});
		}
		
		const now = new Date();
		const expiresAt = new Date(subscription.attributes.expiresAt);
		const isExpired = expiresAt < now;
		const status = subscription.attributes.status;
		
		// Determine effective status
		let effectiveStatus = status;
		if (status === 'active' && isExpired) {
			effectiveStatus = 'expired';
		}
		
		return json({
			success: true,
			hasSubscription: true,
			status: effectiveStatus,
			plan: subscription.attributes.plan,
			startDate: subscription.attributes.startDate,
			expiresAt: subscription.attributes.expiresAt,
			autoRenew: subscription.attributes.autoRenew,
			daysRemaining: Math.max(0, Math.ceil((expiresAt - now) / (1000 * 60 * 60 * 24)))
		});
		
	} catch (error) {
		console.error('Error checking subscription status:', error);
		return json({
			success: false,
			error: error.message || 'Failed to check subscription status'
		}, { status: 500 });
	}
}
