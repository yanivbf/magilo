// @ts-check
import { STRAPI_URL, STRAPI_API_TOKEN } from '$env/static/private';

/**
 * @typedef {Object} StrapiResponse
 * @property {any} data
 * @property {Object} meta
 */

/**
 * Base Strapi API client
 */
class StrapiClient {
	constructor() {
		this.baseUrl = STRAPI_URL || 'http://localhost:1337';
		this.apiToken = STRAPI_API_TOKEN;
	}

	/**
	 * Make a request to Strapi API
	 * @param {string} endpoint
	 * @param {RequestInit} options
	 * @returns {Promise<any>}
	 */
	async request(endpoint, options = {}) {
		const url = `${this.baseUrl}/api${endpoint}`;
		const headers = {
			'Content-Type': 'application/json',
			Authorization: `Bearer ${this.apiToken}`,
			...options.headers
		};

		const response = await fetch(url, {
			...options,
			headers
		});

		if (!response.ok) {
			const error = await response.json().catch(() => ({ error: 'Unknown error' }));
			console.error('❌ Strapi API Error:', JSON.stringify(error, null, 2));
			throw new Error(error.error?.message || error.message || JSON.stringify(error) || 'Strapi API error');
		}

		return response.json();
	}

	/**
	 * GET request
	 * @param {string} endpoint
	 * @param {Object} params
	 * @returns {Promise<any>}
	 */
	async get(endpoint, params = {}) {
		const queryString = new URLSearchParams(params).toString();
		const url = queryString ? `${endpoint}?${queryString}` : endpoint;
		return this.request(url, { method: 'GET' });
	}

	/**
	 * POST request
	 * @param {string} endpoint
	 * @param {any} data
	 * @returns {Promise<any>}
	 */
	async post(endpoint, data) {
		return this.request(endpoint, {
			method: 'POST',
			body: JSON.stringify({ data })
		});
	}

	/**
	 * PUT request
	 * @param {string} endpoint
	 * @param {any} data
	 * @returns {Promise<any>}
	 */
	async put(endpoint, data) {
		return this.request(endpoint, {
			method: 'PUT',
			body: JSON.stringify({ data })
		});
	}

	/**
	 * DELETE request
	 * @param {string} endpoint
	 * @returns {Promise<any>}
	 */
	async delete(endpoint) {
		return this.request(endpoint, { method: 'DELETE' });
	}
}

const strapi = new StrapiClient();

// ============================================================================
// USER OPERATIONS
// ============================================================================

/**
 * Create a new user
 * @param {Object} userData
 * @param {string} userData.name
 * @param {string} [userData.email]
 * @param {string} [userData.phone]
 * @param {number} [userData.wallet]
 * @param {string} [userData.avatar]
 * @returns {Promise<any>}
 */
export async function createUser(userData) {
	return strapi.post('/users', userData);
}

/**
 * Get user by ID
 * @param {string} id
 * @returns {Promise<any>}
 */
export async function getUserById(id) {
	const response = await strapi.get(`/users/${id}`, {
		populate: ['pages', 'purchases', 'leads']
	});
	return response.data;
}

/**
 * Update user
 * @param {string} id
 * @param {Object} data
 * @returns {Promise<any>}
 */
export async function updateUser(id, data) {
	return strapi.put(`/users/${id}`, data);
}

/**
 * Get all users
 * @returns {Promise<any[]>}
 */
export async function getAllUsers() {
	const response = await strapi.get('/users');
	return response.data;
}

// ============================================================================
// PAGE OPERATIONS
// ============================================================================

/**
 * Create a new page
 * @param {Object} pageData
 * @param {string} pageData.title
 * @param {string} pageData.slug
 * @param {string} pageData.htmlContent
 * @param {string} pageData.pageType
 * @param {string} [pageData.description]
 * @param {boolean} [pageData.isActive]
 * @param {string} [pageData.phone]
 * @param {string} [pageData.email]
 * @param {string} [pageData.city]
 * @param {string} [pageData.address]
 * @param {any[]} [pageData.products]
 * @param {Object} [pageData.metadata]
 * @param {string} pageData.userId - User ID to associate with
 * @returns {Promise<any>}
 */
export async function createPage(pageData) {
	const { userId, ...data} = pageData;
	const response = await strapi.post('/pages', {
		...data,
		user: userId
	});
	// Strapi returns { data: { id, attributes } }
	return response.data || response;
}

/**
 * Get page by slug
 * @param {string} slug
 * @returns {Promise<any>}
 */
export async function getPageBySlug(slug) {
	const response = await strapi.get('/pages', {
		'filters[slug][$eq]': slug,
		populate: '*'
	});
	return response.data?.[0] || null;
}

/**
 * Get page by ID
 * @param {string} id
 * @returns {Promise<any>}
 */
export async function getPageById(id) {
	const response = await strapi.get(`/pages/${id}`, {
		populate: ['user', 'purchases', 'leads', 'analytics']
	});
	return response.data;
}

/**
 * Get pages by user ID
 * @param {string} userId
 * @returns {Promise<any[]>}
 */
export async function getPagesByUser(userId) {
	const response = await strapi.get('/pages', {
		'filters[user][id][$eq]': userId,
		populate: ['analytics']
	});
	return response.data;
}

/**
 * Get active pages (for marketplace)
 * @param {Object} [filters]
 * @param {string} [filters.search] - Search in title, description, pageType
 * @param {string} [filters.pageType] - Filter by page type
 * @param {number} [filters.page] - Page number for pagination
 * @param {number} [filters.pageSize] - Items per page
 * @returns {Promise<{data: any[], meta: any}>}
 */
export async function getActivePages(filters = {}) {
	const params = {
		'filters[isActive][$eq]': true,
		populate: ['user'],
		'pagination[page]': filters.page || 1,
		'pagination[pageSize]': filters.pageSize || 25
	};

	// Add search filter
	if (filters.search) {
		params['filters[$or][0][title][$containsi]'] = filters.search;
		params['filters[$or][1][description][$containsi]'] = filters.search;
		params['filters[$or][2][pageType][$containsi]'] = filters.search;
	}

	// Add pageType filter
	if (filters.pageType) {
		params['filters[pageType][$eq]'] = filters.pageType;
	}

	const response = await strapi.get('/pages', params);
	return {
		data: response.data,
		meta: response.meta
	};
}

/**
 * Update page
 * @param {string} id
 * @param {Object} data
 * @returns {Promise<any>}
 */
export async function updatePage(id, data) {
	return strapi.put(`/pages/${id}`, data);
}

/**
 * Delete page (cascade deletes purchases, leads, analytics)
 * @param {string} id
 * @returns {Promise<any>}
 */
export async function deletePage(id) {
	return strapi.delete(`/pages/${id}`);
}

// ============================================================================
// PURCHASE OPERATIONS
// ============================================================================

/**
 * Create a new purchase
 * @param {Object} purchaseData
 * @param {any[]} purchaseData.products
 * @param {number} purchaseData.total
 * @param {string} purchaseData.paymentMethod
 * @param {string} purchaseData.customerName
 * @param {string} purchaseData.customerPhone
 * @param {string} [purchaseData.customerEmail]
 * @param {string} [purchaseData.customerAddress]
 * @param {boolean} [purchaseData.shipping]
 * @param {string} [purchaseData.status]
 * @param {string} purchaseData.userId
 * @param {string} purchaseData.pageId
 * @returns {Promise<any>}
 */
export async function createPurchase(purchaseData) {
	const { userId, pageId, ...data } = purchaseData;
	return strapi.post('/purchases', {
		...data,
		user: userId,
		page: pageId
	});
}

/**
 * Get purchases by page ID
 * @param {string} pageId
 * @returns {Promise<any[]>}
 */
export async function getPurchasesByPage(pageId) {
	const response = await strapi.get('/purchases', {
		'filters[page][id][$eq]': pageId,
		populate: ['user', 'page'],
		sort: 'createdAt:desc'
	});
	return response.data;
}

/**
 * Get purchases by user ID
 * @param {string} userId
 * @returns {Promise<any[]>}
 */
export async function getPurchasesByUser(userId) {
	const response = await strapi.get('/purchases', {
		'filters[user][id][$eq]': userId,
		populate: ['page'],
		sort: 'createdAt:desc'
	});
	return response.data;
}

/**
 * Update purchase status
 * @param {string} id
 * @param {string} status
 * @param {Object} [additionalData]
 * @returns {Promise<any>}
 */
export async function updatePurchaseStatus(id, status, additionalData = {}) {
	const data = {
		status,
		...additionalData
	};

	// Add timestamps based on status
	if (status === 'shipped' && !data.pickedAt) {
		data.pickedAt = new Date().toISOString();
	}
	if (status === 'delivered' && !data.deliveredAt) {
		data.deliveredAt = new Date().toISOString();
	}

	return strapi.put(`/purchases/${id}`, data);
}

// ============================================================================
// LEAD OPERATIONS
// ============================================================================

/**
 * Create a new lead
 * @param {Object} leadData
 * @param {string} leadData.name
 * @param {string} [leadData.phone]
 * @param {string} [leadData.email]
 * @param {string} [leadData.message]
 * @param {string} [leadData.appointmentDate]
 * @param {string} [leadData.appointmentStatus]
 * @param {string} leadData.userId
 * @param {string} leadData.pageId
 * @returns {Promise<any>}
 */
export async function createLead(leadData) {
	const { userId, pageId, ...data } = leadData;
	return strapi.post('/leads', {
		...data,
		user: userId,
		page: pageId
	});
}

/**
 * Get leads by page ID
 * @param {string} pageId
 * @returns {Promise<any[]>}
 */
export async function getLeadsByPage(pageId) {
	const response = await strapi.get('/leads', {
		'filters[page][id][$eq]': pageId,
		populate: ['user', 'page'],
		sort: 'createdAt:desc'
	});
	return response.data;
}

/**
 * Update lead appointment status
 * @param {string} id
 * @param {string} appointmentStatus
 * @returns {Promise<any>}
 */
export async function updateLeadStatus(id, appointmentStatus) {
	return strapi.put(`/leads/${id}`, { appointmentStatus });
}

// ============================================================================
// ANALYTICS OPERATIONS
// ============================================================================

/**
 * Get analytics for a page
 * @param {string} pageId
 * @returns {Promise<any>}
 */
export async function getAnalytics(pageId) {
	const response = await strapi.get('/analytics', {
		'filters[page][id][$eq]': pageId,
		populate: ['page']
	});
	return response.data?.[0] || null;
}

/**
 * Create analytics record for a page
 * @param {string} pageId
 * @returns {Promise<any>}
 */
export async function createAnalytics(pageId) {
	return strapi.post('/analytics', {
		totalSales: 0,
		totalOrders: 0,
		totalCustomers: 0,
		totalLeads: 0,
		dailySales: {},
		monthlySales: {},
		topProducts: [],
		recentPurchases: [],
		page: pageId
	});
}

/**
 * Update analytics
 * @param {string} id
 * @param {Object} data
 * @returns {Promise<any>}
 */
export async function updateAnalytics(id, data) {
	return strapi.put(`/analytics/${id}`, data);
}

/**
 * Increment analytics counters after purchase
 * @param {string} pageId
 * @param {Object} purchaseData
 * @returns {Promise<any>}
 */
export async function incrementPurchaseAnalytics(pageId, purchaseData) {
	const analytics = await getAnalytics(pageId);

	if (!analytics) {
		// Create analytics if it doesn't exist
		await createAnalytics(pageId);
		return incrementPurchaseAnalytics(pageId, purchaseData);
	}

	const today = new Date().toISOString().split('T')[0];
	const month = today.substring(0, 7);

	const dailySales = analytics.attributes.dailySales || {};
	const monthlySales = analytics.attributes.monthlySales || {};

	dailySales[today] = (dailySales[today] || 0) + purchaseData.total;
	monthlySales[month] = (monthlySales[month] || 0) + purchaseData.total;

	return updateAnalytics(analytics.id, {
		totalSales: analytics.attributes.totalSales + purchaseData.total,
		totalOrders: analytics.attributes.totalOrders + 1,
		dailySales,
		monthlySales
	});
}

/**
 * Increment lead counter
 * @param {string} pageId
 * @returns {Promise<any>}
 */
export async function incrementLeadAnalytics(pageId) {
	const analytics = await getAnalytics(pageId);

	if (!analytics) {
		await createAnalytics(pageId);
		return incrementLeadAnalytics(pageId);
	}

	return updateAnalytics(analytics.id, {
		totalLeads: analytics.attributes.totalLeads + 1
	});
}
