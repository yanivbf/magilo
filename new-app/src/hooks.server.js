// Server-side hooks for session management and security
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
	
	// Add security headers
	response.headers.set('X-Frame-Options', 'SAMEORIGIN');
	response.headers.set('X-Content-Type-Options', 'nosniff');
	response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');
	response.headers.set('Permissions-Policy', 'geolocation=(), microphone=(), camera=()');
	
	// Content Security Policy - DISABLED FOR DEVELOPMENT
	// TODO: Re-enable with proper YouTube support in production
	// const cspDirectives = [
	// 	"default-src 'self'",
	// 	"script-src 'self' 'unsafe-inline' 'unsafe-eval' https://accounts.google.com https://cdnjs.cloudflare.com https://cdn.jsdelivr.net https://cdn.enable.co.il https://enable.co.il",
	// 	"style-src 'self' 'unsafe-inline' https://cdnjs.cloudflare.com https://fonts.googleapis.com https://accounts.google.com https://cdn.enable.co.il https://enable.co.il",
	// 	"img-src 'self' data: blob: https: http: http://localhost:1337",
	// 	"font-src 'self' https://cdnjs.cloudflare.com https://fonts.gstatic.com https://fonts.googleapis.com",
	// 	"connect-src 'self' http://localhost:1337 https://osoqfadqohqcauawzmmq.supabase.co https://accounts.google.com https://api.openai.com",
	// 	"frame-src 'self' https://accounts.google.com https://www.youtube.com https://www.youtube-nocookie.com https://youtube.com",
	// 	"object-src 'none'",
	// 	"base-uri 'self'",
	// 	"form-action 'self'",
	// 	"frame-ancestors 'self'"
	// ].join('; ');
	// 
	// response.headers.set('Content-Security-Policy', cspDirectives);
	
	return response;
}
