import { json } from '@sveltejs/kit';
import { STRAPI_URL, STRAPI_API_TOKEN } from '$env/static/private';

// @ts-nocheck
export async function GET({ cookies, locals }) {
	try {
		// Check if user is admin - check both cookies and locals
		const userEmail = cookies.get('userEmail') || locals.user?.email;
		const userId = cookies.get('userId') || locals.user?.id;
		
		// For development, allow if userId exists (you can make this stricter in production)
		if (!userId && userEmail !== 'britolam1@gmail.com') {
			return json({ error: 'Unauthorized' }, { status: 403 });
		}
		
		// Fetch all data from Strapi
		const [usersRes, pagesRes, purchasesRes, subscriptionsRes] = await Promise.all([
			fetch(`${STRAPI_URL}/api/users?populate=*&sort=createdAt:desc`, {
				headers: { 'Authorization': `Bearer ${STRAPI_API_TOKEN}` }
			}),
			fetch(`${STRAPI_URL}/api/pages?populate=*&sort=createdAt:desc`, {
				headers: { 'Authorization': `Bearer ${STRAPI_API_TOKEN}` }
			}),
			fetch(`${STRAPI_URL}/api/purchases?populate=*&sort=createdAt:desc`, {
				headers: { 'Authorization': `Bearer ${STRAPI_API_TOKEN}` }
			}),
			fetch(`${STRAPI_URL}/api/subscriptions?populate=*&filters[status][$eq]=active`, {
				headers: { 'Authorization': `Bearer ${STRAPI_API_TOKEN}` }
			})
		]);
		
		const users = usersRes.ok ? await usersRes.json() : { data: [] };
		const pages = pagesRes.ok ? await pagesRes.json() : { data: [] };
		const purchases = purchasesRes.ok ? await purchasesRes.json() : { data: [] };
		const subscriptions = subscriptionsRes.ok ? await subscriptionsRes.json() : { data: [] };
		
		// Calculate stats
		const totalUsers = users.data?.length || 0;
		const totalPages = pages.data?.length || 0;
		const totalPurchases = purchases.data?.length || 0;
		
		// Calculate subscription revenue
		const activeSubscriptions = subscriptions.data?.length || 0;
		const subscriptionRevenue = activeSubscriptions * 59; // ₪59 per subscription
		
		// Calculate purchase revenue
		const purchaseRevenue = purchases.data?.reduce((sum, purchase) => {
			return sum + (purchase.attributes?.totalPrice || 0);
		}, 0) || 0;
		
		// Calculate total revenue (subscriptions + purchases)
		const totalRevenue = subscriptionRevenue + purchaseRevenue;
		
		// Break down revenue by type
		const deliveryRevenue = purchases.data?.filter(p => p.attributes?.type === 'delivery').reduce((sum, p) => sum + (p.attributes?.totalPrice || 0), 0) || 0;
		const storeRevenue = purchases.data?.filter(p => p.attributes?.type === 'store').reduce((sum, p) => sum + (p.attributes?.totalPrice || 0), 0) || 0;
		const eventRevenue = purchases.data?.filter(p => p.attributes?.type === 'event').reduce((sum, p) => sum + (p.attributes?.totalPrice || 0), 0) || 0;
		
		// Get recent users (last 5)
		const recentUsers = (users.data || []).slice(0, 5).map(user => ({
			id: user.id,
			name: user.username || user.email,
			email: user.email,
			avatar: user.avatar || null,
			createdAt: user.createdAt
		}));
		
		// Get recent purchases (last 5)
		const recentPurchases = (purchases.data || []).slice(0, 5).map(purchase => ({
			id: purchase.id,
			productName: purchase.attributes?.productName || 'מוצר',
			customerName: purchase.attributes?.customerName || 'לקוח',
			totalPrice: purchase.attributes?.totalPrice || 0,
			createdAt: purchase.attributes?.createdAt
		}));
		
		// Get all purchases with full details
		const allPurchases = (purchases.data || []).map(purchase => ({
			id: purchase.id,
			documentId: purchase.documentId,
			productName: purchase.attributes?.productName || 'מוצר',
			customerName: purchase.attributes?.customerName || 'לקוח',
			customerEmail: purchase.attributes?.customerEmail || '',
			totalPrice: purchase.attributes?.totalPrice || 0,
			status: purchase.attributes?.status || 'pending',
			type: purchase.attributes?.type || 'store',
			createdAt: purchase.attributes?.createdAt
		}));
		
		// Get recent pages (last 10)
		const recentPages = (pages.data || []).slice(0, 10).map(page => ({
			id: page.id,
			title: page.attributes?.title || 'ללא שם',
			slug: page.attributes?.slug || page.documentId,
			pageType: page.attributes?.pageType || 'כללי',
			owner: {
				name: page.attributes?.owner?.data?.attributes?.username || page.attributes?.owner?.data?.attributes?.email,
				email: page.attributes?.owner?.data?.attributes?.email
			},
			createdAt: page.attributes?.createdAt
		}));
		
		// Get active subscriptions list with details
		const activeSubscriptionsList = (subscriptions.data || []).map(sub => ({
			id: sub.id,
			pageTitle: sub.attributes?.page?.data?.attributes?.title || 'ללא שם',
			ownerEmail: sub.attributes?.user?.data?.attributes?.email || 'לא ידוע',
			startDate: sub.attributes?.startDate,
			expiryDate: sub.attributes?.expiryDate,
			status: sub.attributes?.status
		}));
		
		// Get all users with their pages count and subscription status
		const allUsers = (users.data || []).map(user => {
			const userPages = pages.data?.filter(p => p.attributes?.owner?.data?.id === user.id) || [];
			const userSub = subscriptions.data?.find(s => s.attributes?.user?.data?.id === user.id);
			
			return {
				id: user.id,
				name: user.username || user.email,
				email: user.email,
				avatar: user.avatar || null,
				pagesCount: userPages.length,
				subscriptionStatus: userSub ? 'active' : 'inactive',
				isOnline: false, // TODO: Implement real-time status
				createdAt: user.createdAt
			};
		});
		
		// Get all pages with subscription status
		const allPages = (pages.data || []).map(page => {
			const pageSub = subscriptions.data?.find(s => s.attributes?.page?.data?.id === page.id);
			
			return {
				id: page.id,
				documentId: page.documentId,
				title: page.attributes?.title || 'ללא שם',
				slug: page.attributes?.slug || page.documentId,
				pageType: page.attributes?.pageType || 'כללי',
				owner: {
					name: page.attributes?.owner?.data?.attributes?.username || page.attributes?.owner?.data?.attributes?.email,
					email: page.attributes?.owner?.data?.attributes?.email
				},
				subscriptionStatus: pageSub ? 'active' : 'inactive',
				createdAt: page.attributes?.createdAt
			};
		});
		
		return json({
			totalUsers,
			totalPages,
			totalPurchases,
			totalRevenue,
			activeSubscriptions,
			recentUsers,
			recentPurchases,
			recentPages,
			allUsers,
			allPages,
			allPurchases,
			activeSubscriptionsList,
			financialData: {
				subscriptionRevenue,
				deliveryRevenue,
				storeRevenue,
				eventRevenue,
				monthlyRevenue: [], // TODO: Calculate monthly breakdown
				yearlyReport: {} // TODO: Generate yearly report
			}
		});
		
	} catch (error) {
		console.error('Error fetching admin stats:', error);
		return json({
			totalUsers: 0,
			totalPages: 0,
			totalPurchases: 0,
			totalRevenue: 0,
			activeSubscriptions: 0,
			recentUsers: [],
			recentPurchases: [],
			recentPages: [],
			allUsers: [],
			allPages: [],
			allPurchases: [],
			activeSubscriptionsList: [],
			financialData: {
				subscriptionRevenue: 0,
				deliveryRevenue: 0,
				storeRevenue: 0,
				eventRevenue: 0,
				monthlyRevenue: [],
				yearlyReport: {}
			}
		});
	}
}
