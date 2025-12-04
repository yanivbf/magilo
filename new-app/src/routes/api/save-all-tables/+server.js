// Save All Table Assignments at Once
import { json } from '@sveltejs/kit';
import { STRAPI_URL, STRAPI_API_TOKEN } from '$env/static/private';

export async function POST({ request }) {
	try {
		const { guests } = await request.json();
		
		if (!guests || !Array.isArray(guests)) {
			return json({
				success: false,
				error: 'Missing or invalid guests array'
			}, { status: 400 });
		}
		
		// Update all guests in parallel
		const updates = guests.map(guest => 
			fetch(`${STRAPI_URL}/api/guests/${guest.id}`, {
				method: 'PUT',
				headers: {
					'Content-Type': 'application/json',
					'Authorization': `Bearer ${STRAPI_API_TOKEN}`
				},
				body: JSON.stringify({
					data: {
						table: parseInt(guest.table) || 0
					}
				})
			})
		);
		
		await Promise.all(updates);
		
		return json({ success: true });
		
	} catch (error) {
		console.error('Error saving table assignments:', error);
		return json({
			success: false,
			error: error.message
		}, { status: 500 });
	}
}
