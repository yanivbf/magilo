// @ts-check
import { STRAPI_URL, STRAPI_API_TOKEN } from '$env/static/private';

/**
 * Upload image to Strapi media library
 * @param {File} file - Image file
 * @param {string} userId - User ID (for organizing uploads)
 * @param {string} pageName - Page name (for organizing uploads)
 * @returns {Promise<{url: string, id: string}>} - Uploaded image URL and ID
 */
export async function uploadImage(file, userId, pageName) {
	const formData = new FormData();
	formData.append('files', file);

	// Add metadata
	formData.append('path', `users/${userId}/${pageName}`);

	const response = await fetch(`${STRAPI_URL}/api/upload`, {
		method: 'POST',
		headers: {
			Authorization: `Bearer ${STRAPI_API_TOKEN}`
		},
		body: formData
	});

	if (!response.ok) {
		const error = await response.json().catch(() => ({ error: 'Upload failed' }));
		throw new Error(error.error?.message || 'Failed to upload image');
	}

	const data = await response.json();

	// Strapi returns an array of uploaded files
	if (data && data.length > 0) {
		const uploadedFile = data[0];
		return {
			url: `${STRAPI_URL}${uploadedFile.url}`,
			id: uploadedFile.id
		};
	}

	throw new Error('No file uploaded');
}

/**
 * Delete image from Strapi media library
 * @param {string} imageId - Image ID in Strapi
 * @returns {Promise<void>}
 */
export async function deleteImage(imageId) {
	const response = await fetch(`${STRAPI_URL}/api/upload/files/${imageId}`, {
		method: 'DELETE',
		headers: {
			Authorization: `Bearer ${STRAPI_API_TOKEN}`
		}
	});

	if (!response.ok) {
		const error = await response.json().catch(() => ({ error: 'Delete failed' }));
		throw new Error(error.error?.message || 'Failed to delete image');
	}
}

/**
 * Get all images for a user
 * @param {string} userId - User ID
 * @returns {Promise<Array>} - Array of images
 */
export async function getUserImages(userId) {
	const response = await fetch(
		`${STRAPI_URL}/api/upload/files?filters[folder][path][$contains]=users/${userId}`,
		{
			headers: {
				Authorization: `Bearer ${STRAPI_API_TOKEN}`
			}
		}
	);

	if (!response.ok) {
		throw new Error('Failed to fetch user images');
	}

	const data = await response.json();
	return data.map((file) => ({
		id: file.id,
		url: `${STRAPI_URL}${file.url}`,
		name: file.name,
		size: file.size,
		createdAt: file.createdAt
	}));
}

/**
 * Validate image file
 * @param {File} file - File to validate
 * @param {Object} [options] - Validation options
 * @param {number} [options.maxSize] - Max file size in bytes (default: 10MB)
 * @param {string[]} [options.allowedTypes] - Allowed MIME types
 * @returns {{valid: boolean, error?: string}}
 */
export function validateImageFile(file, options = {}) {
	const maxSize = options.maxSize || 10 * 1024 * 1024; // 10MB default
	const allowedTypes = options.allowedTypes || [
		'image/jpeg',
		'image/jpg',
		'image/png',
		'image/gif',
		'image/webp',
		'image/svg+xml'
	];

	// Check file size
	if (file.size > maxSize) {
		return {
			valid: false,
			error: `File size exceeds ${maxSize / 1024 / 1024}MB limit`
		};
	}

	// Check file type
	if (!allowedTypes.includes(file.type)) {
		return {
			valid: false,
			error: `File type ${file.type} is not allowed. Allowed types: ${allowedTypes.join(', ')}`
		};
	}

	return { valid: true };
}
