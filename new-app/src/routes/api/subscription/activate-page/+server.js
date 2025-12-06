// Activate subscription for a specific page
import { json } from '@sveltejs/kit';
import { STRAPI_URL, STRAPI_API_TOKEN } from '$env/static/private';

/** @type {import('./$types').RequestHandler} */
export async function POST({ request }) {
	try {
		const { pageId, months = 1 } = await request.json();
		
		if (!pageId) {
			return json({ error: 'Page ID is required' }, { status: 400 });
		}
		
		console.log(`📄 Activating subscription for page ${pageId} for ${months} months`);
		
		// Calculate expiry date
		const expiryDate = new Date();
		expiryDate.setMonth(expiryDate.getMonth() + months);
		
		// Update page with subscription status
		const response = await fetch(`${STRAPI_URL}/api/pages/${pageId}`, {
			method: 'PUT',
			headers: {
				'Content-Type': 'application/json',
				'Authorization': `Bearer ${STRAPI_API_TOKEN}`
			},
			body: JSON.stringify({
				data: {
					subscriptionStatus: 'active',
					subscriptionExpiry: expiryDate.toISOString()
				}
			})
		});
		
		if (!response.ok) {
			const errorText = await response.text();
			console.error('❌ Failed to update page:', response.status, errorText);
			return json({ error: 'Failed to activate subscription' }, { status: 500 });
		}
		
		const result = await response.json();
		console.log('✅ Page subscription activated:', result);
		
		return json({
			success: true,
			pageId,
			subscriptionStatus: 'active',
			subscriptionExpiry: expiryDate.toISOString()
		});
	} catch (error) {
		console.error('❌ Error activating page subscription:', error);
		return json({ error: error.message }, { status: 500 });
	}
}
