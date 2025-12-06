// @ts-check
import { json } from '@sveltejs/kit';
import { getPageById, updatePage, getUserById, createUser } from '$lib/server/strapi.js';

/**
 * Save a page to a user's area
 * @param {Object} params
 * @param {Request} params.request
 * @param {Object} params.cookies
 */
export async function POST({ request, cookies }) {
	try {
		const { pageId, userId, userName, userEmail } = await request.json();
		
		if (!pageId || !userId) {
			return json({ error: 'Missing pageId or userId' }, { status: 400 });
		}
		
		console.log('💾 Saving page to user:', { pageId, userId, userName, userEmail });
		
		// CRITICAL: Set userId cookie to maintain session
		cookies.set('userId', userId, {
			path: '/',
			maxAge: 60 * 60 * 24 * 30, // 30 days
			httpOnly: false,
			sameSite: 'lax'
		});
		console.log('✅ Set userId cookie:', userId);
		
		// Get the current page to check if it already has a user
		const page = await getPageById(pageId);
		
		if (!page) {
			console.error('❌ Page not found:', pageId);
			return json({ error: 'Page not found' }, { status: 404 });
		}
		
		console.log('📄 Current page data:', page);
		
		// Get or create the user in Strapi
		let strapiUser;
		
		// First, try to find user by email if provided (most reliable)
		if (userEmail) {
			try {
				const { STRAPI_URL } = await import('$env/static/private');
				const { STRAPI_API_TOKEN } = await import('$env/static/private');
				
				console.log('🔍 Searching for user by email:', userEmail);
				const searchResponse = await fetch(`${STRAPI_URL}/api/users?filters[email][$eq]=${encodeURIComponent(userEmail)}`, {
					headers: {
						'Authorization': `Bearer ${STRAPI_API_TOKEN}`,
						'Content-Type': 'application/json'
					}
				});
				
				if (searchResponse.ok) {
					const searchResult = await searchResponse.json();
					if (searchResult.data && searchResult.data.length > 0) {
						strapiUser = searchResult.data[0];
						console.log('✅ Found user by email:', strapiUser);
					}
				}
			} catch (searchError) {
				console.log('⚠️ Could not search by email:', searchError);
			}
		}
		
		// If not found by email, try by userId (might be a Strapi ID)
		if (!strapiUser) {
			try {
				console.log('🔍 Trying to get user by ID:', userId);
				strapiUser = await getUserById(userId);
				console.log('✅ Found existing Strapi user by ID:', strapiUser);
			} catch (error) {
				console.log('⚠️ User not found by ID');
			}
		}
		
		// If still not found, create new user
		if (!strapiUser) {
			console.log('👤 Creating new user in Strapi...');
			try {
				const newUserData = {
					name: userName || userEmail?.split('@')[0] || 'משתמש',
					email: userEmail || '',
					wallet: 0
				};
				
				console.log('📝 Creating user with data:', newUserData);
				const createResult = await createUser(newUserData);
				console.log('📦 Create result:', createResult);
				
				// Handle both response formats
				strapiUser = createResult.data || createResult;
				console.log('✅ Created new Strapi user:', strapiUser);
			} catch (createError) {
				console.error('❌ Failed to create user in Strapi:', createError);
				return json({ 
					error: 'Failed to create user. Please try logging in again.',
					needsLogin: true
				}, { status: 500 });
			}
		}
		
		// Get the numeric ID from Strapi user (handle both formats)
		const strapiUserId = strapiUser.id || strapiUser.documentId;
		console.log('🔢 Strapi user object:', strapiUser);
		console.log('🔢 Using Strapi user ID:', strapiUserId);
		
		if (!strapiUserId) {
			console.error('❌ Could not extract user ID from:', strapiUser);
			return json({ 
				error: 'Invalid user data',
				needsLogin: true
			}, { status: 500 });
		}
		
		// Check if page already has this user
		const currentUserId = page.user?.documentId || page.user?.id;
		console.log('📄 Current page user ID:', currentUserId);
		
		if (currentUserId && (currentUserId === strapiUserId || currentUserId === userId)) {
			console.log('ℹ️ Page already saved to this user');
			return json({ 
				success: true, 
				alreadySaved: true,
				message: 'Page already saved to your area' 
			});
		}
		
		// Update the page to link it to the user using numeric ID
		console.log('🔗 Linking page', pageId, 'to user', strapiUserId, 'with UUID', userId);
		const result = await updatePage(pageId, {
			user: strapiUserId,
			userId: userId // Also save the UUID for easy querying
		});
		
		console.log('✅ Page saved to user successfully:', result);
		
		return json({ 
			success: true, 
			message: 'Page saved to your area',
			page: result.data
		});
		
	} catch (/** @type {any} */ error) {
		console.error('❌ Error saving page to user:', error);
		console.error('❌ Error stack:', error.stack);
		return json({ 
			error: error.message || 'Unknown error occurred',
			details: error.toString()
		}, { status: 500 });
	}
}
