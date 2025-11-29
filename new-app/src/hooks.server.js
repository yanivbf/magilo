// Server-side hooks for session management
import { STRAPI_URL, STRAPI_API_TOKEN } from '$env/static/private';

/** @type {import('@sveltejs/kit').Handle} */
export async function handle({ event, resolve }) {
	// Get user ID from cookie
	const userId = event.cookies.get('userId');
	
	if (userId) {
		// Attach user ID to locals for use in load functions
		event.locals.userId = userId;
		
		// Optionally fetch user data from Strapi
		try {
			const response = await fetch(`${STRAPI_URL}/api/users?filters[userId][$eq]=${userId}`, {
				headers: {
					'Authorization': `Bearer ${STRAPI_API_TOKEN}`
				}
			});
			
			if (response.ok) {
				const result = await response.json();
				if (result.data && result.data.length > 0) {
					event.locals.user = result.data[0];
				}
			}
		} catch (error) {
			console.error('Error fetching user from Strapi:', error);
		}
	}
	
	const response = await resolve(event);
	return response;
}
