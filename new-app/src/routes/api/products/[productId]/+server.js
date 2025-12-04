import { json } from '@sveltejs/kit';
import { STRAPI_URL, STRAPI_TOKEN } from '$env/static/private';

export async function PATCH({ params, request }) {
	try {
		const { productId } = params;
		const data = await request.json();
		
		const response = await fetch(`${STRAPI_URL}/api/products/${productId}`, {
			method: 'PUT',
			headers: {
				'Content-Type': 'application/json',
				'Authorization': `Bearer ${STRAPI_TOKEN}`
			},
			body: JSON.stringify({
				data
			})
		});
		
		if (!response.ok) {
			const errorData = await response.json();
			console.error('Strapi error:', errorData);
			throw new Error('Failed to update product');
		}
		
		const result = await response.json();
		
		return json({
			success: true,
			product: result.data
		});
		
	} catch (error) {
		console.error('Update product error:', error);
		return json({ error: error.message }, { status: 500 });
	}
}

export async function DELETE({ params }) {
	try {
		const { productId } = params;
		
		const response = await fetch(`${STRAPI_URL}/api/products/${productId}`, {
			method: 'DELETE',
			headers: {
				'Authorization': `Bearer ${STRAPI_TOKEN}`
			}
		});
		
		if (!response.ok) {
			const errorData = await response.json();
			console.error('Strapi error:', errorData);
			throw new Error('Failed to delete product');
		}
		
		return json({
			success: true
		});
		
	} catch (error) {
		console.error('Delete product error:', error);
		return json({ error: error.message }, { status: 500 });
	}
}
