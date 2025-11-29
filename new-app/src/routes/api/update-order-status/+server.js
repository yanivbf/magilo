// API endpoint to update order/purchase status
import { json } from '@sveltejs/kit';
import { STRAPI_URL, STRAPI_TOKEN } from '$env/static/private';

export async function POST({ request }) {
	try {
		const { orderId, status } = await request.json();

		if (!orderId || !status) {
			return json({ error: 'Missing orderId or status' }, { status: 400 });
		}

		// Update purchase status in Strapi
		const response = await fetch(`${STRAPI_URL}/api/purchases/${orderId}`, {
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
			console.error('Failed to update order status:', errorData);
			return json({ error: 'Failed to update order status' }, { status: 500 });
		}

		const data = await response.json();

		return json({ 
			success: true, 
			order: data.data 
		}, { status: 200 });

	} catch (error) {
		console.error('Error updating order status:', error);
		return json({ error: error.message }, { status: 500 });
	}
}
