// API endpoint to activate user subscription
import { json } from '@sveltejs/kit';
import { STRAPI_URL, STRAPI_API_TOKEN } from '$env/static/private';

/** @type {import('./$types').RequestHandler} */
export async function POST({ request, cookies }) {
	try {
		const { userId, months = 1 } = await request.json();
		
		if (!userId) {
			return json({ error: 'User ID is required' }, { status: 400 });
		}
		
		console.log(`🎯 Activating subscription for user ${userId} for ${months} months`);
		
		// First, find the user by userId field to get the numeric Strapi ID
		const searchResponse = await fetch(
			`${STRAPI_URL}/api/users?filters[userId][$eq]=${userId}`,
			{
				headers: {
					'Authorization': `Bearer ${STRAPI_API_TOKEN}`
				}
			}
		);
		
		if (!searchResponse.ok) {
			console.error('❌ Failed to search for user');
			return json({ error: 'User not found' }, { status: 404 });
		}
		
		const searchResult = await searchResponse.json();
		
		if (!searchResult.data || searchResult.data.length === 0) {
			console.error('❌ User not found in Strapi');
			return json({ error: 'User not found' }, { status: 404 });
		}
		
		const strapiUserId = searchResult.data[0].id;
		console.log(`✅ Found user with Strapi ID: ${strapiUserId}`);
		
		// Calculate expiry date
		const expiryDate = new Date();
		expiryDate.setMonth(expiryDate.getMonth() + months);
		
		// WORKAROUND: Strapi users plugin doesn't allow direct updates via API
		// So we'll store subscription status in cookies for now
		// In production, you'd want to create a custom subscription table
		
		cookies.set('subscriptionStatus', 'active', {
			path: '/',
			maxAge: 60 * 60 * 24 * 365, // 1 year
			httpOnly: false,
			sameSite: 'lax'
		});
		
		cookies.set('subscriptionExpiry', expiryDate.toISOString(), {
			path: '/',
			maxAge: 60 * 60 * 24 * 365, // 1 year
			httpOnly: false,
			sameSite: 'lax'
		});
		
		console.log('✅ Subscription activated successfully (stored in cookies)');
		
		return json({
			success: true,
			subscriptionStatus: 'active',
			subscriptionExpiry: expiryDate.toISOString()
		});
		
	} catch (error) {
		console.error('❌ Error activating subscription:', error);
		return json({ error: error.message }, { status: 500 });
	}
}
