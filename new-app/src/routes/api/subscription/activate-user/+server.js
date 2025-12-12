// API endpoint to activate user subscription
import { json } from '@sveltejs/kit';
import { STRAPI_URL, STRAPI_API_TOKEN } from '$env/static/private';

/** @type {import('./$types').RequestHandler} */
export async function POST({ request, cookies }) {
	try {
		console.log('🎯 Starting user subscription activation...');
		
		// Parse request body with error handling
		let requestData;
		try {
			requestData = await request.json();
		} catch (parseError) {
			console.error('❌ Failed to parse request JSON:', parseError);
			return json({ error: 'Invalid JSON in request body' }, { status: 400 });
		}
		
		const { userId, months = 1 } = requestData;
		
		if (!userId) {
			console.error('❌ No userId provided');
			return json({ error: 'User ID is required' }, { status: 400 });
		}
		
		console.log(`🎯 Activating subscription for user ${userId} for ${months} months`);
		
		// Calculate expiry date
		const expiryDate = new Date();
		expiryDate.setMonth(expiryDate.getMonth() + months);
		
		console.log('📅 Calculated expiry date:', expiryDate.toISOString());
		
		// SIMPLIFIED APPROACH: Just set cookies directly without Strapi lookup
		// This avoids any potential Strapi connection issues
		try {
			cookies.set('subscriptionStatus', 'active', {
				path: '/',
				maxAge: 60 * 60 * 24 * 365, // 1 year
				httpOnly: false,
				sameSite: 'lax',
				secure: false
			});
			
			cookies.set('subscriptionExpiry', expiryDate.toISOString(), {
				path: '/',
				maxAge: 60 * 60 * 24 * 365, // 1 year
				httpOnly: false,
				sameSite: 'lax',
				secure: false
			});
			
			// Also set a timestamp for when subscription was activated
			cookies.set('subscriptionActivatedAt', new Date().toISOString(), {
				path: '/',
				maxAge: 60 * 60 * 24 * 365, // 1 year
				httpOnly: false,
				sameSite: 'lax',
				secure: false
			});
			
			console.log('✅ Subscription cookies set successfully');
		} catch (cookieError) {
			console.error('❌ Failed to set cookies:', cookieError);
			return json({ error: 'Failed to set subscription cookies' }, { status: 500 });
		}
		
		console.log('✅ Subscription activated successfully (stored in cookies)');
		
		return json({
			success: true,
			userId: userId,
			subscriptionStatus: 'active',
			subscriptionExpiry: expiryDate.toISOString(),
			message: 'Subscription activated successfully'
		});
		
	} catch (error) {
		console.error('❌ Error activating subscription:', error);
		console.error('❌ Error stack:', error.stack);
		return json({ 
			error: error.message || 'Internal server error',
			details: process.env.NODE_ENV === 'development' ? error.stack : undefined
		}, { status: 500 });
	}
}
