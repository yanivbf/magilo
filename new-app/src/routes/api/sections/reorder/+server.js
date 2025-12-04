import { json } from '@sveltejs/kit';
import { STRAPI_URL, STRAPI_TOKEN } from '$env/static/private';

export async function POST({ request }) {
	try {
		const { sections } = await request.json();
		
		// Update each section's order
		const updatePromises = sections.map(({ id, order }) =>
			fetch(`${STRAPI_URL}/api/sections/${id}`, {
				method: 'PUT',
				headers: {
					'Content-Type': 'application/json',
					'Authorization': `Bearer ${STRAPI_TOKEN}`
				},
				body: JSON.stringify({
					data: {
						order
					}
				})
			})
		);
		
		const responses = await Promise.all(updatePromises);
		
		// Check if all updates succeeded
		const allSucceeded = responses.every(r => r.ok);
		
		if (!allSucceeded) {
			throw new Error('Failed to update some sections');
		}
		
		return json({
			success: true
		});
		
	} catch (error) {
		console.error('Reorder sections error:', error);
		return json({ error: error.message }, { status: 500 });
	}
}
