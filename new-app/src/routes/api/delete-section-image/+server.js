// @ts-check
import { json } from '@sveltejs/kit';
import { getPageById, updatePage } from '$lib/server/strapi.js';

/**
 * POST /api/delete-section-image
 * Delete an image from a section
 * @type {import('./$types').RequestHandler}
 */
export async function POST({ request }) {
	try {
		const { pageId, sectionId, sectionIndex, imageIndex } = await request.json();

		console.log('🔍 DELETE SECTION IMAGE REQUEST:', {
			pageId,
			sectionId,
			sectionIndex,
			imageIndex
		});

		// Validate required fields
		if (!pageId) {
			return json({ error: 'Missing pageId' }, { status: 400 });
		}

		if (imageIndex === null || imageIndex === undefined) {
			return json({ error: 'Missing imageIndex' }, { status: 400 });
		}

		// Get page data
		const page = await getPageById(pageId);
		if (!page) {
			return json({ error: 'Page not found' }, { status: 404 });
		}

		// Update page data - remove image
		const sections = page.sections || [];
		const sectionIdx = parseInt(sectionIndex || sectionId);

		if (sectionIdx >= 0 && sectionIdx < sections.length) {
			const section = sections[sectionIdx];

			if (section.images && Array.isArray(section.images)) {
				const imgIdx = parseInt(imageIndex);
				if (imgIdx >= 0 && imgIdx < section.images.length) {
					section.images.splice(imgIdx, 1);

					// Update page in Strapi
					await updatePage(pageId, { sections });
					console.log(`✅ Image deleted from section`);

					return json({
						success: true,
						message: 'Image deleted successfully'
					});
				}
			}
		}

		return json({ error: 'Image not found' }, { status: 404 });
	} catch (error) {
		console.error('❌ Error deleting section image:', error);
		return json(
			{
				error: 'Failed to delete section image',
				details: error.message
			},
			{ status: 500 }
		);
	}
}
