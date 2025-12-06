// @ts-check
import { json } from '@sveltejs/kit';
import { getUserById, updateUser, createUser } from '$lib/server/strapi.js';

/**
 * GET /api/user/[userId]
 * Get user data
 * @type {import('./$types').RequestHandler}
 */
export async function GET({ params }) {
	try {
		const { userId } = params;

		if (!userId) {
			return json({ error: 'Missing userId' }, { status: 400 });
		}

		console.log(`👤 Getting user: ${userId}`);

		// Get user from Strapi
		let user;
		try {
			user = await getUserById(userId);
		} catch (getUserError) {
			console.error(`❌ getUserById failed for ${userId}:`, getUserError.message);
			return json({ error: 'User not found', details: getUserError.message }, { status: 404 });
		}

		if (!user) {
			console.warn(`⚠️ User not found: ${userId}`);
			return json({ error: 'User not found' }, { status: 404 });
		}

		console.log(`✅ Found user: ${user.name || 'Unknown'}`);

		// Strapi v5 returns data directly (no nested attributes)
		const transformedUser = {
			id: user.id || userId,
			userId: user.userId || userId,
			name: user.name || 'משתמש',
			email: user.email || '',
			phone: user.phone || null,
			wallet: user.wallet || 0,
			avatar: user.avatar || null,
			subscriptionStatus: user.subscriptionStatus || 'inactive',
			createdAt: user.createdAt || new Date().toISOString(),
			lastActive: user.lastActive || new Date().toISOString(),
			// Include counts if relations are populated
			pagesCount: user.pages?.length || 0,
			purchasesCount: user.purchases?.length || 0,
			leadsCount: user.leads?.length || 0
		};

		return json({
			success: true,
			user: transformedUser
		}, {
			headers: {
				'Content-Type': 'application/json; charset=utf-8'
			}
		});
	} catch (error) {
		console.error('❌ Error getting user:', error);
		return json(
			{
				error: 'Failed to get user',
				details: error.message,
				stack: error.stack
			},
			{ status: 500 }
		);
	}
}

/**
 * POST /api/user/[userId]
 * Create or update user data
 * @type {import('./$types').RequestHandler}
 */
export async function POST({ params, request }) {
	try {
		const { userId } = params;
		const body = await request.json();

		console.log('👤 CREATE/UPDATE USER:', { userId, updates: Object.keys(body) });

		// Validate required fields
		if (!userId) {
			return json({ error: 'Missing userId' }, { status: 400 });
		}

		// Try to get existing user
		let user;
		try {
			user = await getUserById(userId);
			console.log('✅ User exists, updating...');
			// Update existing user
			await updateUser(userId, body);
		} catch (error) {
			// User doesn't exist, create new one
			console.log('👤 User does not exist, creating new user...');
			user = await createUser({
				userId,
				email: body.email,
				name: body.name || body.email?.split('@')[0] || 'משתמש חדש',
				avatar: body.avatar || null
			});
			console.log('✅ User created successfully');
		}

		return json({
			success: true,
			message: 'User saved successfully',
			user
		});
	} catch (error) {
		console.error('❌ Error saving user:', error);
		return json(
			{
				error: 'Failed to save user',
				details: error.message
			},
			{ status: 500 }
		);
	}
}
