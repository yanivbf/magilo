// Get current user information for debugging
import { json } from '@sveltejs/kit';

/** @type {import('./$types').RequestHandler} */
export async function GET({ cookies, locals }) {
	try {
		const userId = cookies.get('userId');
		
		console.log('🔍 CURRENT USER API DEBUG:');
		console.log('   - Cookie userId:', userId);
		console.log('   - Locals userId:', locals.userId);
		console.log('   - Locals user:', locals.user);
		console.log('   - All cookies:', cookies.getAll());
		
		if (!userId) {
			return json({ 
				authenticated: false, 
				error: 'No userId cookie found',
				cookies: cookies.getAll()
			}, { status: 401 });
		}
		
		return json({
			authenticated: true,
			userId: userId,
			localsUserId: locals.userId,
			user: locals.user,
			cookies: cookies.getAll()
		});
		
	} catch (error) {
		console.error('❌ Error in current user API:', error);
		return json({ error: error.message }, { status: 500 });
	}
}