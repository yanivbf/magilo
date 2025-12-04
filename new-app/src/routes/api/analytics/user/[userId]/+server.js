// User-Specific Analytics Endpoint
// Returns aggregated analytics for all pages owned by a user

import { json } from '@sveltejs/kit';
import { STRAPI_URL, STRAPI_API_TOKEN } from '$env/static/private';

export async function GET({ params }) {
	try {
		const { userId } = params;
		
		if (!userId) {
			return json({ error: 'Missing userId' }, { status: 400 });
		}
		
		// First, get all pages for this user
		const pagesResponse = await fetch(
			`${STRAPI_URL}/api/pages?filters[user][userId][$eq]=${userId}&populate=*`,
			{
				headers: {
					'Authorization': `Bearer ${STRAPI_API_TOKEN}`
				}
			}
		);
		
		if (!pagesResponse.ok) {
			throw new Error('Failed to fetch user pages');
		}
		
		const pagesData = await pagesResponse.json();
		const pages = pagesData.data || [];
		const pageIds = pages.map(p => p.id);
		
		if (pageIds.length === 0) {
			return json({
				userId,
				totalPages: 0,
				totalSales: 0,
				totalOrders: 0,
				totalCustomers: 0,
				totalLeads: 0,
				dailySales: {},
				monthlySales: {},
				topProducts: [],
				recentPurchases: [],
				pageBreakdown: []
			});
		}
		
		// Fetch all purchases for user's pages
		const purchasesPromises = pageIds.map(pageId =>
			fetch(
				`${STRAPI_URL}/api/purchases?filters[page][id][$eq]=${pageId}&populate=*`,
				{
					headers: {
						'Authorization': `Bearer ${STRAPI_API_TOKEN}`
					}
				}
			).then(r => r.json())
		);
		
		const purchasesResults = await Promise.all(purchasesPromises);
		const allPurchases = purchasesResults.flatMap(r => r.data || []);
		
		// Fetch all leads for user's pages
		const leadsPromises = pageIds.map(pageId =>
			fetch(
				`${STRAPI_URL}/api/leads?filters[page][id][$eq]=${pageId}&populate=*`,
				{
					headers: {
						'Authorization': `Bearer ${STRAPI_API_TOKEN}`
					}
				}
			).then(r => r.json())
		);
		
		const leadsResults = await Promise.all(leadsPromises);
		const allLeads = leadsResults.flatMap(r => r.data || []);
		
		// Calculate analytics
		const analytics = {
			userId,
			totalPages: pages.length,
			totalSales: 0,
			totalOrders: allPurchases.length,
			totalCustomers: new Set(allPurchases.map(p => p.attributes.customerEmail)).size,
			totalLeads: allLeads.length,
			dailySales: {},
			monthlySales: {},
			topProducts: [],
			recentPurchases: [],
			pageBreakdown: []
		};
		
		// Calculate total sales
		analytics.totalSales = allPurchases.reduce((sum, p) => {
			return sum + (parseFloat(p.attributes.total) || 0);
		}, 0);
		
		// Calculate daily sales
		allPurchases.forEach(purchase => {
			const date = purchase.attributes.createdAt?.split('T')[0];
			if (date) {
				if (!analytics.dailySales[date]) {
					analytics.dailySales[date] = 0;
				}
				analytics.dailySales[date] += parseFloat(purchase.attributes.total) || 0;
			}
		});
		
		// Calculate monthly sales
		allPurchases.forEach(purchase => {
			const month = purchase.attributes.createdAt?.substring(0, 7);
			if (month) {
				if (!analytics.monthlySales[month]) {
					analytics.monthlySales[month] = 0;
				}
				analytics.monthlySales[month] += parseFloat(purchase.attributes.total) || 0;
			}
		});
		
		// Get recent purchases
		analytics.recentPurchases = allPurchases
			.sort((a, b) => new Date(b.attributes.createdAt) - new Date(a.attributes.createdAt))
			.slice(0, 20)
			.map(p => ({
				id: p.id,
				customerName: p.attributes.customerName,
				total: p.attributes.total,
				createdAt: p.attributes.createdAt
			}));
		
		// Calculate top products across all pages
		const productSales = {};
		allPurchases.forEach(purchase => {
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
		
		// Page breakdown
		analytics.pageBreakdown = pages.map(page => {
			const pagePurchases = allPurchases.filter(p => 
				p.attributes.page?.data?.id === page.id
			);
			const pageLeads = allLeads.filter(l => 
				l.attributes.page?.data?.id === page.id
			);
			
			return {
				pageId: page.id,
				pageTitle: page.attributes.title,
				pageSlug: page.attributes.slug,
				sales: pagePurchases.reduce((sum, p) => sum + (parseFloat(p.attributes.total) || 0), 0),
				orders: pagePurchases.length,
				leads: pageLeads.length
			};
		}).sort((a, b) => b.sales - a.sales);
		
		return json(analytics);
		
	} catch (error) {
		console.error('Error getting user analytics:', error);
		return json({
			error: 'Failed to get user analytics'
		}, { status: 500 });
	}
}
