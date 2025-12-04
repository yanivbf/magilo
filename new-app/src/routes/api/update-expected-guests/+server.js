// Update Expected Guests Count for Event
import { json } from '@sveltejs/kit';
import { STRAPI_URL, STRAPI_API_TOKEN } from '$env/static/private';

export async function POST({ request }) {
	try {
		const { pageId, expectedGuests } = await request.json();
		
		if (!pageId || !expectedGuests) {
			return json({
				success: false,
				error: 'Missing pageId or expectedGuests'
			}, { status: 400 });
		}
		
		// Update page in Strapi
		const response = await fetch(`${STRAPI_URL}/api/pages/${pageId}`, {
			method: 'PUT',
			headers: {
				'Content-Type': 'application/json',
				'Authorization': `Bearer ${STRAPI_API_TOKEN}`
			},
			body: JSON.stringify({
				data: {
					expectedGuests: parseInt(expectedGuests)
				}
			})
		});
		
		if (!response.ok) {
			throw new Error('Failed to update expected guests');
		}
		
		return json({ success: true });
		
	} catch (error) {
		console.error('Error updating expected guests:', error);
		return json({
			success: false,
			error: error.message
		}, { status: 500 });
	}
}
