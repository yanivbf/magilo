// Google OAuth authentication endpoint
import { json } from '@sveltejs/kit';
import { STRAPI_URL, STRAPI_API_TOKEN } from '$env/static/private';

/** @type {import('./$types').RequestHandler} */
export async function POST({ request, cookies }) {
	try {
		const { googleId, email, name, picture } = await request.json();

		if (!googleId || !email) {
			return json({ error: 'Missing required fields' }, { status: 400 });
		}

		// Create a unique userId from Google ID
		const userId = `google_${googleId}`;

		// Check if user already exists in our custom user collection
		const existingUserResponse = await fetch(
			`${STRAPI_URL}/api/users?filters[userId][$eq]=${userId}`,
			{
				headers: {
					Authorization: `Bearer ${STRAPI_API_TOKEN}`
				}
			}
		);

		const existingUserData = await existingUserResponse.json();
		let user;

		if (existingUserData.data && existingUserData.data.length > 0) {
			// User exists, update last active
			const existingUser = existingUserData.data[0];
			user = {
				id: existingUser.id,
				documentId: existingUser.documentId,
				...(existingUser.attributes || existingUser)
			};

			// Update last active time
			await fetch(`${STRAPI_URL}/api/users/${user.documentId || user.id}`, {
				method: 'PUT',
				headers: {
					'Content-Type': 'application/json',
					Authorization: `Bearer ${STRAPI_API_TOKEN}`
				},
				body: JSON.stringify({
					data: {
						lastActive: new Date().toISOString()
					}
				})
			});

			console.log('✅ Existing user logged in:', user.userId);
		} else {
			// Create new user
			const createResponse = await fetch(`${STRAPI_URL}/api/users`, {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
					Authorization: `Bearer ${STRAPI_API_TOKEN}`
				},
				body: JSON.stringify({
					data: {
						userId: userId,
						email: email,
						name: name || email.split('@')[0],
						avatar: picture || null,
						subscriptionStatus: 'active', // Give new users active subscription
						lastActive: new Date().toISOString()
					}
				})
			});

			const createData = await createResponse.json();
			
			if (!createResponse.ok) {
				console.error('Error creating user:', createData);
				throw new Error('Failed to create user');
			}

			user = {
				id: createData.data.id,
				documentId: createData.data.documentId,
				...(createData.data.attributes || createData.data)
			};

			console.log('✅ New user created:', user.userId);
		}

		// CRITICAL: Set cookies with proper settings for persistent sessions
		// Set JWT cookie (primary)
		cookies.set('jwt', 'dummy_jwt_token', {
			path: '/', // MANDATORY - prevents cookie from being stuck in /auth
			httpOnly: false, // Allow client access if needed
			secure: false, // MANDATORY for localhost/dev environment
			sameSite: 'lax', // Proper cross-site setting
			maxAge: 60 * 60 * 24 * 30 // 30 days
		});
		
		// Set userId cookie (fallback)
		cookies.set('userId', user.userId, {
			path: '/',
			httpOnly: false,
			secure: false,
			sameSite: 'lax',
			maxAge: 60 * 60 * 24 * 30
		});
		
		// Set subscription status cookie
		cookies.set('subscriptionStatus', user.subscriptionStatus || 'active', {
			path: '/',
			httpOnly: false,
			secure: false,
			sameSite: 'lax',
			maxAge: 60 * 60 * 24 * 30
		});

		console.log('✅ Cookie set for user:', user.userId);
		console.log('✅ Cookie details:', {
			name: 'userId',
			value: user.userId,
			httpOnly: false,
			maxAge: '30 days'
		});

		// Return user data with proper Hebrew name encoding
		const responseData = {
			id: user.userId,
			userId: user.userId,
			email: user.email,
			name: user.name || 'ברית עולם להקה', // Ensure Hebrew name is set
			avatar: user.avatar,
			subscriptionStatus: user.subscriptionStatus
		};
		
		console.log('✅ Returning user data with Hebrew name:', responseData.name);
		
		return json(responseData, {
			headers: {
				'Content-Type': 'application/json; charset=utf-8'
			}
		});
	} catch (error) {
		console.error('Google auth error:', error);
		return json({ error: 'Authentication failed' }, { status: 500 });
	}
}
