import { json } from '@sveltejs/kit';
import { STRAPI_URL, STRAPI_API_TOKEN } from '$env/static/private';

export async function PUT({ params, request }) {
	try {
		const { pageId } = params;
		const { services } = await request.json();
		
		// Update page with new services array
		const response = await fetch(`${STRAPI_URL}/api/pages/${pageId}`, {
			method: 'PUT',
			headers: {
				'Content-Type': 'application/json',
				'Authorization': `Bearer ${STRAPI_API_TOKEN}`
			},
			body: JSON.stringify({
				data: {
					services
				}
			})
		});
		
		if (!response.ok) {
			const errorData = await response.json();
			console.error('Strapi error:', errorData);
			throw new Error('Failed to update services');
		}
		
		const result = await response.json();
		
		return json({
			success: true,
			services: result.data.attributes.services
		});
		
	} catch (error) {
		console.error('Update services error:', error);
		return json({ error: error.message }, { status: 500 });
	}
}
