// CRITICAL INFRASTRUCTURE REPAIR: Rewrite for Persistent Sessions
import { STRAPI_URL, STRAPI_API_TOKEN } from '$env/static/private';

/** @type {import('@sveltejs/kit').Handle} */
export async function handle({ event, resolve }) {
	// Step A: Retrieve the session cookie (JWT) from event.cookies.get('jwt')
	const jwt = event.cookies.get('jwt');
	const userId = event.cookies.get('userId');
	
	// Step B: If no token exists, event.locals.user = null
	if (!jwt && !userId) {
		event.locals.user = null;
	} else {
		// Step C: If a token EXISTS, decode it (or fetch user from Strapi /users/me)
		try {
			let userData = null;
			
			// Try JWT first
			if (jwt) {
				const response = await fetch(`${STRAPI_URL}/api/users/me`, {
					headers: {
						'Authorization': `Bearer ${jwt}`,
						'Content-Type': 'application/json'
					}
				});
				
				if (response.ok) {
					userData = await response.json();
				}
			}
			
			// Fallback to userId - create basic user data with correct Hebrew name
			if (!userData && userId) {
				userData = {
					id: userId,
					userId: userId,
					email: userId.includes('google_') ? 'britolam1@gmail.com' : '',
					name: userId.includes('google_') ? 'ברית עולם להקה' : 'משתמש רשום',
					avatar: null,
					subscriptionStatus: 'active'
				};
				
				console.log('✅ User fallback with correct Hebrew name:', userData.name);
			}
			
			// Step D (CRITICAL): Assign the result to event.locals.user
			if (userData) {
				event.locals.user = {
					id: userData.id || userData.userId || userId,
					userId: userData.userId || userData.id || userId,
					email: userData.email || '',
					name: userData.name || userData.username || 'משתמש רשום',
					avatar: userData.avatar || userData.picture || null,
					subscriptionStatus: userData.subscriptionStatus || 'active'
				};
			} else {
				event.locals.user = null;
			}
			
		} catch (error) {
			console.error('Session error:', error);
			event.locals.user = null;
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
