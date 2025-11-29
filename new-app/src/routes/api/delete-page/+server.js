// @ts-check
import { json } from '@sveltejs/kit';
import { deletePage } from '$lib/server/strapi.js';

/**
 * DELETE /api/delete-page
 * Delete a page (cascade deletes purchases, leads, analytics)
 * @type {import('./$types').RequestHandler}
 */
export async function DELETE({ request }) {
	try {
		const body = await request.json();
		const { pageId } = body;

		console.log('🔍 DELETE PAGE REQUEST:', { pageId });

		// Validate required fields
		if (!pageId) {
			return json({ error: 'Missing pageId' }, { status: 400 });
		}

		// Delete page from Strapi (cascade deletes related records)
		await deletePage(pageId);

		console.log(`✅ Page ${pageId} deleted successfully (with cascade)`);

		return json({
			success: true,
			message: 'Page deleted successfully'
		});
	} catch (error) {
		console.error('❌ Error deleting page:', error);
		return json(
			{
				error: 'Failed to delete page',
				details: error.message
			},
			{ status: 500 }
		);
	}
}
