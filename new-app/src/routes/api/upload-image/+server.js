// @ts-check
import { json } from '@sveltejs/kit';
import { uploadImage, validateImageFile } from '$lib/server/imageUpload.js';

/**
 * POST /api/upload-image
 * Upload an image to Strapi media library
 * @type {import('./$types').RequestHandler}
 */
export async function POST({ request }) {
	try {
		const formData = await request.formData();
		const file = formData.get('image');
		const userId = formData.get('userId');
		const pageName = formData.get('pageName') || 'general';

		console.log('🔍 UPLOAD IMAGE REQUEST:', {
			hasFile: !!file,
			userId,
			pageName
		});

		// Validate required fields
		if (!file || !(file instanceof File)) {
			return json({ error: 'Missing or invalid image file' }, { status: 400 });
		}

		if (!userId) {
			return json({ error: 'Missing userId' }, { status: 400 });
		}

		// Validate file
		const validation = validateImageFile(file);
		if (!validation.valid) {
			return json({ error: validation.error }, { status: 400 });
		}

		console.log(`📤 Uploading image: ${file.name} (${file.size} bytes)`);

		// Upload to Strapi
		const result = await uploadImage(file, userId, pageName);

		console.log(`✅ Image uploaded successfully: ${result.url}`);

		return json({
			success: true,
			url: result.url,
			id: result.id,
			message: 'Image uploaded successfully'
		});
	} catch (error) {
		console.error('❌ Error uploading image:', error);
		return json(
			{
				error: 'Failed to upload image',
				details: error.message
			},
			{ status: 500 }
		);
	}
}
