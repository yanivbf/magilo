// Page-Specific Analytics Endpoint
// Returns analytics for a specific page

import { json } from '@sveltejs/kit';
import { STRAPI_URL, STRAPI_API_TOKEN } from '$env/static/private';

export async function GET({ params }) {
	try {
		const { pageId } = params;
		
		if (!pageId) {
			return json({ error: 'Missing pageId' }, { status: 400 });
		}
		
		// Fetch page purchases
		const purchasesResponse = await fetch(
			`${STRAPI_URL}/api/purchases?filters[page][id][$eq]=${pageId}&populate=*`,
			{
				headers: {
					'Authorization': `Bearer ${STRAPI_API_TOKEN}`
				}
			}
		);
		
		if (!purchasesResponse.ok) {
			throw new Error('Failed to fetch purchases');
		}
		
		const purchasesData = await purchasesResponse.json();
		const purchases = purchasesData.data || [];
		
		// Fetch page leads
		const leadsResponse = await fetch(
			`${STRAPI_URL}/api/leads?filters[page][id][$eq]=${pageId}&populate=*`,
			{
				headers: {
					'Authorization': `Bearer ${STRAPI_API_TOKEN}`
				}
			}
		);
		
		const leadsData = await leadsResponse.json();
		const leads = leadsData.data || [];
		
		// Calculate analytics
		const analytics = {
			pageId,
			totalSales: 0,
			totalOrders: purchases.length,
			totalCustomers: new Set(purchases.map(p => p.attributes.customerEmail)).size,
			totalLeads: leads.length,
			dailySales: {},
			monthlySales: {},
			topProducts: [],
			recentPurchases: []
		};
		
		// Calculate total sales
		analytics.totalSales = purchases.reduce((sum, p) => {
			return sum + (parseFloat(p.attributes.total) || 0);
		}, 0);
		
		// Calculate daily sales
		purchases.forEach(purchase => {
			const date = purchase.attributes.createdAt?.split('T')[0];
			if (date) {
				if (!analytics.dailySales[date]) {
					analytics.dailySales[date] = 0;
				}
				analytics.dailySales[date] += parseFloat(purchase.attributes.total) || 0;
			}
		});
		
		// Calculate monthly sales
		purchases.forEach(purchase => {
			const month = purchase.attributes.createdAt?.substring(0, 7);
			if (month) {
				if (!analytics.monthlySales[month]) {
					analytics.monthlySales[month] = 0;
				}
				analytics.monthlySales[month] += parseFloat(purchase.attributes.total) || 0;
			}
		});
		
		// Get recent purchases
		analytics.recentPurchases = purchases
			.sort((a, b) => new Date(b.attributes.createdAt) - new Date(a.attributes.createdAt))
			.slice(0, 20)
			.map(p => ({
				id: p.id,
				customerName: p.attributes.customerName,
				total: p.attributes.total,
				status: p.attributes.status,
				createdAt: p.attributes.createdAt
			}));
		
		// Calculate top products for this page
		const productSales = {};
		purchases.forEach(purchase => {
			const products = purchase.attributes.products || [];
			products.forEach(product => {
				if (!productSales[product.id]) {
					productSales[product.id] = {
						id: product.id,
						name: product.name,
						sales: 0,
						revenue: 0
					};
				}
				productSales[product.id].sales += product.quantity || 1;
				productSales[product.id].revenue += (product.price || 0) * (product.quantity || 1);
			});
		});
		
		analytics.topProducts = Object.values(productSales)
			.sort((a, b) => b.revenue - a.revenue)
			.slice(0, 10);
		
		return json(analytics);
		
	} catch (error) {
		console.error('Error getting page analytics:', error);
		return json({
			error: 'Failed to get page analytics'
		}, { status: 500 });
	}
}
