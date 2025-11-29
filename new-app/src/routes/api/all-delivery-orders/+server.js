// API endpoint for courier/driver app to get all delivery orders
import { json } from '@sveltejs/kit';
import { STRAPI_URL, STRAPI_TOKEN } from '$env/static/private';

export async function GET({ request }) {
	try {
		// Fetch all purchases from Strapi
		const response = await fetch(`${STRAPI_URL}/api/purchases?populate=*`, {
			headers: {
				'Authorization': `Bearer ${STRAPI_TOKEN}`,
				'Content-Type': 'application/json'
			}
		});

		if (!response.ok) {
			console.error('Failed to fetch purchases from Strapi');
			return json({ orders: [] }, { status: 200 });
		}

		const data = await response.json();
		const purchases = data.data || [];

		// Transform purchases into delivery orders format
		const orders = purchases.map(purchase => {
			const attrs = purchase.attributes || {};
			
			return {
				id: purchase.id,
				status: attrs.status || 'pending',
				customerName: attrs.customerName || attrs.name || 'לקוח',
				customerPhone: attrs.customerPhone || attrs.phone || '',
				customerAddress: attrs.customerAddress || attrs.address || '',
				storeName: attrs.pageName || attrs.storeName || 'חנות',
				pageName: attrs.pageName || '',
				products: attrs.products || [],
				total: attrs.total || 0,
				deliveryFee: attrs.deliveryFee || 30,
				createdAt: attrs.createdAt,
				updatedAt: attrs.updatedAt
			};
		});

		return json({ orders }, { status: 200 });

	} catch (error) {
		console.error('Error fetching delivery orders:', error);
		return json({ orders: [], error: error.message }, { status: 500 });
	}
}
