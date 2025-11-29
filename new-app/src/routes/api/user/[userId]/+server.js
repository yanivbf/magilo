// @ts-check
import { json } from '@sveltejs/kit';
import { getUserById, updateUser } from '$lib/server/strapi.js';

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
		const user = await getUserById(userId);

		if (!user) {
			return json({ error: 'User not found' }, { status: 404 });
		}

		console.log(`✅ Found user: ${user.attributes.name}`);

		// Transform response
		const transformedUser = {
			id: user.id,
			name: user.attributes.name,
			email: user.attributes.email,
			phone: user.attributes.phone,
			wallet: user.attributes.wallet,
			avatar: user.attributes.avatar,
			createdAt: user.attributes.createdAt,
			lastActive: user.attributes.lastActive,
			// Include counts if relations are populated
			pagesCount: user.attributes.pages?.data?.length || 0,
			purchasesCount: user.attributes.purchases?.data?.length || 0,
			leadsCount: user.attributes.leads?.data?.length || 0
		};

		return json({
			success: true,
			user: transformedUser
		});
	} catch (error) {
		console.error('❌ Error getting user:', error);
		return json(
			{
				error: 'Failed to get user',
				details: error.message
			},
			{ status: 500 }
		);
	}
}

/**
 * POST /api/user/[userId]
 * Update user data
 * @type {import('./$types').RequestHandler}
 */
export async function POST({ params, request }) {
	try {
		const { userId } = params;
		const body = await request.json();

		console.log('👤 UPDATE USER:', { userId, updates: Object.keys(body) });

		// Validate required fields
		if (!userId) {
			return json({ error: 'Missing userId' }, { status: 400 });
		}

		// Update user in Strapi
		await updateUser(userId, body);

		console.log(`✅ User ${userId} updated successfully`);

		return json({
			success: true,
			message: 'User updated successfully'
		});
	} catch (error) {
		console.error('❌ Error updating user:', error);
		return json(
			{
				error: 'Failed to update user',
				details: error.message
			},
			{ status: 500 }
		);
	}
}
