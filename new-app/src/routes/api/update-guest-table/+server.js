// Update Guest Table Assignment
import { json } from '@sveltejs/kit';
import { STRAPI_URL, STRAPI_API_TOKEN } from '$env/static/private';

export async function POST({ request }) {
	try {
		const { guestId, table } = await request.json();
		
		if (!guestId || table === undefined) {
			return json({
				success: false,
				error: 'Missing guestId or table'
			}, { status: 400 });
		}
		
		// Update guest in Strapi
		const response = await fetch(`${STRAPI_URL}/api/guests/${guestId}`, {
			method: 'PUT',
			headers: {
				'Content-Type': 'application/json',
				'Authorization': `Bearer ${STRAPI_API_TOKEN}`
			},
			body: JSON.stringify({
				data: {
					table: parseInt(table)
				}
			})
		});
		
		if (!response.ok) {
			throw new Error('Failed to update guest table');
		}
		
		return json({ success: true });
		
	} catch (error) {
		console.error('Error updating guest table:', error);
		return json({
			success: false,
			error: error.message
		}, { status: 500 });
	}
}
