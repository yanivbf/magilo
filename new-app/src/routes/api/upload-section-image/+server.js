// @ts-check
import { json } from '@sveltejs/kit';
import { uploadImage, validateImageFile } from '$lib/server/imageUpload.js';
import { getPageById, updatePage } from '$lib/server/strapi.js';

/**
 * POST /api/upload-section-image
 * Upload an image for a section and update the page data
 * @type {import('./$types').RequestHandler}
 */
export async function POST({ request }) {
	try {
		const formData = await request.formData();
		const file = formData.get('image');
		const pageId = formData.get('pageId');
		const sectionIndex = formData.get('sectionIndex') || formData.get('sectionId');
		const imageIndex = formData.get('imageIndex');
		const action = formData.get('action'); // 'replace' or 'add'

		console.log('🔍 UPLOAD SECTION IMAGE REQUEST:', {
			hasFile: !!file,
			pageId,
			sectionIndex,
			imageIndex,
			action
		});

		// Validate required fields
		if (!file || !(file instanceof File)) {
			return json({ error: 'Missing or invalid image file' }, { status: 400 });
		}

		if (!pageId) {
			return json({ error: 'Missing pageId' }, { status: 400 });
		}

		// Validate file
		const validation = validateImageFile(file);
		if (!validation.valid) {
			return json({ error: validation.error }, { status: 400 });
		}

		console.log(`📤 Uploading section image: ${file.name} (${file.size} bytes)`);

		// Get page data
		const page = await getPageById(pageId);
		if (!page) {
			return json({ error: 'Page not found' }, { status: 404 });
		}

		// Upload to Strapi
		const result = await uploadImage(file, page.userId || 'unknown', page.pageName || 'section');

		console.log(`✅ Section image uploaded successfully: ${result.url}`);

		// Update page data with new image URL
		const sections = page.sections || [];
		
		console.log(`📊 Page has ${sections.length} sections`);
		console.log(`📍 Requested sectionIndex: ${sectionIndex}`);
		
		if (sectionIndex !== null && sectionIndex !== undefined) {
			const sectionIdx = parseInt(sectionIndex);
			console.log(`🔢 Parsed sectionIndex: ${sectionIdx}`);

			if (sectionIdx >= 0 && sectionIdx < sections.length) {
				const section = sections[sectionIdx];
				console.log(`📦 Section type: ${section.type}, has images: ${!!section.data?.images}`);

				if (action === 'add') {
					// Add new image to gallery
					if (!section.data) section.data = {};
					if (!section.data.images) {
						section.data.images = [];
					}
					section.data.images.push(result.url);
					console.log(`➕ Added image, total: ${section.data.images.length}`);
				} else {
					// Replace existing image
					const imgIdx = parseInt(imageIndex);
					console.log(`🔄 Replacing image at index: ${imgIdx}`);
					if (section.data && section.data.images && imgIdx >= 0 && imgIdx < section.data.images.length) {
						section.data.images[imgIdx] = result.url;
						console.log(`✅ Replaced image at index ${imgIdx}`);
					} else {
						console.error(`❌ Cannot replace - images array:`, section.data?.images);
					}
				}

				// Update page in Strapi
				await updatePage(pageId, { sections });
				console.log(`✅ Page updated with new section image`);
			} else {
				console.error(`❌ Invalid sectionIndex: ${sectionIdx}, sections length: ${sections.length}`);
			}
		} else {
			console.error(`❌ sectionIndex is null or undefined`);
		}

		return json({
			success: true,
			imageUrl: result.url,
			id: result.id,
			message: 'Section image uploaded successfully'
		});
	} catch (error) {
		console.error('❌ Error uploading section image:', error);
		return json(
			{
				error: 'Failed to upload section image',
				details: error.message
			},
			{ status: 500 }
		);
	}
}
