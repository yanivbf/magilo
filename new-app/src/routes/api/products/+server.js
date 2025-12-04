import { json } from '@sveltejs/kit';
import { STRAPI_URL, STRAPI_TOKEN } from '$env/static/private';

export async function POST({ request, cookies }) {
	try {
		const data = await request.json();
		const { name, description, price, image, enabled, pageId } = data;
		
		if (!name || !price) {
			return json({ error: 'Name and price are required' }, { status: 400 });
		}
		
		// Create product in Strapi
		const response = await fetch(`${STRAPI_URL}/api/products`, {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json',
				'Authorization': `Bearer ${STRAPI_TOKEN}`
			},
			body: JSON.stringify({
				data: {
					name,
					description: description || '',
					price: parseFloat(price),
					image: image || null,
					enabled: enabled !== false,
					order: 0,
					page: pageId
				}
			})
		});
		
		if (!response.ok) {
			const errorData = await response.json();
			console.error('Strapi error:', errorData);
			throw new Error('Failed to create product in Strapi');
		}
		
		const result = await response.json();
		
		return json({
			success: true,
			product: result.data
		});
		
	} catch (error) {
		console.error('Create product error:', error);
		return json({ error: error.message }, { status: 500 });
	}
}
