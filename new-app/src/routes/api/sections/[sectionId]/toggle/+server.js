import { json } from '@sveltejs/kit';
import { STRAPI_URL, STRAPI_TOKEN } from '$env/static/private';

export async function PATCH({ params, request }) {
	try {
		const { sectionId } = params;
		const { enabled } = await request.json();
		
		const response = await fetch(`${STRAPI_URL}/api/sections/${sectionId}`, {
			method: 'PUT',
			headers: {
				'Content-Type': 'application/json',
				'Authorization': `Bearer ${STRAPI_TOKEN}`
			},
			body: JSON.stringify({
				data: {
					enabled
				}
			})
		});
		
		if (!response.ok) {
			const errorData = await response.json();
			console.error('Strapi error:', errorData);
			throw new Error('Failed to toggle section');
		}
		
		const result = await response.json();
		
		return json({
			success: true,
			section: result.data
		});
		
	} catch (error) {
		console.error('Toggle section error:', error);
		return json({ error: error.message }, { status: 500 });
	}
}
