// @ts-check
import { json } from '@sveltejs/kit';
import { STRAPI_URL, STRAPI_API_TOKEN } from '$env/static/private';

/**
 * POST /api/user/create-or-find
 * Create or find a user in Strapi
 */
export async function POST({ request, cookies }) {
	try {
		const { userId, email, name } = await request.json();
		
		if (!userId) {
			return json({ error: 'Missing userId' }, { status: 400 });
		}
		
		console.log('🔍 Looking for user:', { userId, email, name });
		
		// Try to find user by userId field (UUID)
		const searchResponse = await fetch(
			`${STRAPI_URL}/api/users?filters[userId][$eq]=${userId}`,
			{
				headers: {
					'Authorization': `Bearer ${STRAPI_API_TOKEN}`
				}
			}
		);
		
		let strapiUserId = null;
		
		if (searchResponse.ok) {
			const searchResult = await searchResponse.json();
			if (searchResult.data && searchResult.data.length > 0) {
				strapiUserId = searchResult.data[0].id;
				console.log('✅ Found existing user with Strapi ID:', strapiUserId);
				
				// Set userId cookie so user stays logged in
				cookies.set('userId', userId, {
					path: '/',
					maxAge: 60 * 60 * 24 * 30, // 30 days
					httpOnly: false,
					sameSite: 'lax'
				});
				
				return json({
					success: true,
					found: true,
					strapiUserId,
					message: 'User found'
				});
			}
		}
		
		// User not found - create new one
		console.log('👤 User not found, creating new user with userId:', userId);
		
		const createResponse = await fetch(
			`${STRAPI_URL}/api/users`,
			{
				method: 'POST',
				headers: {
					'Authorization': `Bearer ${STRAPI_API_TOKEN}`,
					'Content-Type': 'application/json'
				},
				body: JSON.stringify({
					data: {
						userId: userId, // UUID for easy querying
						name: name || `משתמש ${userId.substring(0, 8)}`,
						email: email || `${userId}@autopage.local`,
						wallet: 0,
						subscriptionStatus: 'inactive'
					}
				})
			}
		);
		
		if (!createResponse.ok) {
			const errorText = await createResponse.text();
			console.error('❌ Failed to create user:', errorText);
			return json({ 
				error: 'Failed to create user',
				details: errorText
			}, { status: 500 });
		}
		
		const createResult = await createResponse.json();
		strapiUserId = createResult.data?.id || createResult.id;
		
		console.log('✅ Created new user with Strapi ID:', strapiUserId);
		
		// Set userId cookie so user stays logged in
		cookies.set('userId', userId, {
			path: '/',
			maxAge: 60 * 60 * 24 * 30, // 30 days
			httpOnly: false,
			sameSite: 'lax'
		});
		
		return json({
			success: true,
			found: false,
			strapiUserId,
			message: 'User created'
		});
		
	} catch (error) {
		console.error('❌ Error in create-or-find:', error);
		return json({ 
			error: error.message || 'Unknown error'
		}, { status: 500 });
	}
}
