// API endpoint to update appointment status
import { json } from '@sveltejs/kit';
import { STRAPI_URL, STRAPI_TOKEN } from '$env/static/private';

export async function PUT({ params, request }) {
	const { appointmentId } = params;

	try {
		const { status } = await request.json();

		if (!status) {
			return json({ error: 'Missing status' }, { status: 400 });
		}

		// Update lead/appointment status in Strapi
		const response = await fetch(`${STRAPI_URL}/api/leads/${appointmentId}`, {
			method: 'PUT',
			headers: {
				'Authorization': `Bearer ${STRAPI_TOKEN}`,
				'Content-Type': 'application/json'
			},
			body: JSON.stringify({
				data: {
					status: status,
					updatedAt: new Date().toISOString()
				}
			})
		});

		if (!response.ok) {
			const errorData = await response.json();
			console.error('Failed to update appointment status:', errorData);
			return json({ error: 'Failed to update appointment status' }, { status: 500 });
		}

		const data = await response.json();

		return json({ 
			success: true, 
			appointment: data.data 
		}, { status: 200 });

	} catch (error) {
		console.error('Error updating appointment status:', error);
		return json({ error: error.message }, { status: 500 });
	}
}
