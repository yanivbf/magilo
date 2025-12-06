// @ts-check
import { STRAPI_URL, STRAPI_API_TOKEN } from '$env/static/private';

// Guest Management Functions
export async function createOrUpdateGuest(guestData) {
	try {
		const client = new StrapiClient();
		
		// Check if guest already exists (by name + page)
		const existing = await client.get('/guests', {
			filters: {
				name: guestData.name,
				page: guestData.page
			}
		});
		
		if (existing.data && existing.data.length > 0) {
			// Update existing guest
			const guestId = existing.data[0].id;
			const updated = await client.put(`/guests/${guestId}`, {
				data: guestData
			});
			return { success: true, data: updated.data };
		} else {
			// Create new guest
			const created = await client.post('/guests', {
				data: guestData
			});
			return { success: true, data: created.data };
		}
	} catch (error) {
		console.error('Error creating/updating guest:', error);
		return { success: false, error: error.message };
	}
}

export async function getPageGuests(pageId) {
	try {
		const client = new StrapiClient();
		const response = await client.get('/guests', {
			filters: {
				page: pageId
			},
			populate: '*',
			sort: ['name:asc']
		});
		
		return { success: true, data: response.data || [] };
	} catch (error) {
		console.error('Error getting page guests:', error);
		return { success: false, error: error.message, data: [] };
	}
}

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
			headers,
			// Disable caching to always get fresh data
			cache: 'no-store'
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
	const response = await strapi.post('/users', userData);
	// Strapi returns { data: { id, attributes } }
	return response;
}

/**
 * Get user by ID or userId
 * @param {string} id - Can be numeric ID or userId (like "google_123456789")
 * @returns {Promise<any>}
 */
export async function getUserById(id) {
	// If id starts with "google_" or other prefix, search by userId field
	if (id && (id.startsWith('google_') || id.includes('_'))) {
		console.log('🔍 Searching user by userId field:', id);
		
		// Use Strapi v5 filter syntax
		const response = await strapi.get('/users', {
			'filters[userId][$eq]': id,
			'populate[0]': 'pages',
			'populate[1]': 'purchases',
			'populate[2]': 'leads'
		});
		
		console.log('📥 Strapi response for userId query:', JSON.stringify(response, null, 2));
		
		if (response.data && response.data.length > 0) {
			console.log('✅ Found user by userId:', response.data[0].id);
			return response.data[0];
		}
		
		console.error(`❌ User not found with userId: ${id}`);
		throw new Error(`User not found with userId: ${id}`);
	}
	
	// Otherwise, search by numeric ID
	console.log('🔍 Searching user by numeric ID:', id);
	const response = await strapi.get(`/users/${id}`, {
		'populate[0]': 'pages',
		'populate[1]': 'purchases',
		'populate[2]': 'leads'
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
	const { userId, user, ...data} = pageData;
	
	// Build the data object for Strapi
	const strapiData = {
		...data
	};
	
	// CRITICAL: Save userId (string) as the main ownership field
	if (userId) {
		strapiData.userId = userId;
		console.log('✅ Adding userId field:', userId);
		
		// ALSO: Link to Strapi user if exists (for professional user management)
		try {
			// Find the Strapi user by userId field
			const userResponse = await strapi.get('/users', {
				'filters[userId][$eq]': userId
			});
			
			if (userResponse.data && userResponse.data.length > 0) {
				const strapiUser = userResponse.data[0];
				// Use documentId for Strapi v5, fallback to numeric id
				const strapiUserId = strapiUser.documentId || strapiUser.id;
				strapiData.user = strapiUserId;
				console.log('✅ Linking page to Strapi user:', strapiUserId);
			} else {
				console.log('⚠️ Strapi user not found for userId:', userId);
			}
		} catch (error) {
			console.log('⚠️ Could not link to Strapi user:', error.message);
		}
	} else {
		console.log('⚠️ WARNING: No userId provided - page will not have an owner!');
	}
	
	// CRITICAL DEBUG: Log the exact data being sent
	console.log('🔍 CRITICAL DEBUG - Data being sent to Strapi:');
	console.log('   - title:', strapiData.title);
	console.log('   - slug:', strapiData.slug);
	console.log('   - pageType:', strapiData.pageType);
	console.log('   - userId:', strapiData.userId);
	console.log('   - user (relation):', strapiData.user);
	console.log('   - metadata.createdByUserId:', strapiData.metadata?.createdByUserId);
	
	const response = await strapi.post('/pages', strapiData);
	
	// DEBUG: Log what Strapi returned
	console.log('📥 Strapi response - page created with ID:', response.data?.id);
	
	// Strapi returns { data: { id, attributes } }
	return response.data || response;
}

/**
 * Get page by slug
 * @param {string} slug
 * @returns {Promise<any>}
 */
export async function getPageBySlug(slug) {
	// Strapi v5 requires explicit populate with array syntax
	const response = await strapi.get('/pages', {
		'filters[slug][$eq]': slug,
		'populate[0]': 'sections',
		'populate[1]': 'storeProducts'
	});
	
	console.log('🔍 Full Strapi response:', JSON.stringify(response, null, 2));
	
	const page = response.data?.[0] || null;
	if (page) {
		console.log('📄 Page found:', page.id);
		console.log('📄 Page object keys:', Object.keys(page));
		console.log('📄 Page attributes:', page.attributes ? 'exists' : 'missing');
		if (page.attributes) {
			console.log('📄 Page attributes keys:', Object.keys(page.attributes));
			console.log('📄 Sections:', page.attributes.sections);
			console.log('📄 Products:', page.attributes.storeProducts);
		}
	} else {
		console.log('❌ No page found for slug:', slug);
	}
	return page;
}

/**
 * Get page by ID (supports both numeric ID and documentId)
 * @param {string|number} id
 * @returns {Promise<any>}
 */
export async function getPageById(id) {
	// CRITICAL: In Strapi v5, documentId is the primary identifier
	// Try documentId first (works for both documentId strings and numeric IDs)
	try {
		console.log('🔍 Getting page by ID:', id);
		const response = await strapi.get(`/pages/${id}`, {
			'populate[0]': 'sections',
			'populate[1]': 'storeProducts',
			'populate[2]': 'user'
		});
		
		if (response.data) {
			console.log('✅ Found page:', response.data.id, response.data.documentId);
			return response.data;
		}
	} catch (error) {
		console.log('⚠️ Direct lookup failed:', error.message);
	}
	
	// If direct lookup failed and it looks like a documentId, try searching
	if (typeof id === 'string' && !/^\d+$/.test(id)) {
		try {
			console.log('🔍 Searching all pages for documentId:', id);
			const response = await strapi.get('/pages', {
				'populate[0]': 'sections',
				'populate[1]': 'storeProducts',
				'populate[2]': 'user',
				'pagination[pageSize]': 100
			});
			
			if (response.data && response.data.length > 0) {
				// Find the page with matching documentId
				const page = response.data.find(p => p.documentId === id);
				if (page) {
					console.log('✅ Found page by documentId search:', page.id);
					return page;
				}
			}
		} catch (error) {
			console.error(`❌ Failed to search pages:`, error.message);
		}
	}
	
	console.error(`❌ Page not found with ID: ${id}`);
	return null;
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
		populate: [],
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
 * Update page (supports both numeric ID and documentId)
 * @param {string|number} id
 * @param {Object} data
 * @returns {Promise<any>}
 */
export async function updatePage(id, data) {
	// CRITICAL: In Strapi v5, documentId works directly in PUT requests
	console.log('💾 Updating page:', id);
	console.log('💾 Data keys:', Object.keys(data));
	
	// CRITICAL FIX: Remove documentId and id from data payload
	// Strapi v5 doesn't accept these fields in the update body
	const { documentId, id: numericId, ...cleanData } = data;
	
	if (documentId || numericId) {
		console.log('⚠️ Removed documentId/id from payload (not allowed in Strapi v5 updates)');
	}
	
	console.log('💾 Clean data keys:', Object.keys(cleanData));
	
	try {
		const result = await strapi.put(`/pages/${id}`, cleanData);
		console.log('✅ Page updated successfully');
		return result;
	} catch (error) {
		console.error('❌ Update failed:', error.message);
		throw error;
	}
}

/**
 * Delete page (cascade deletes purchases, leads, analytics)
 * @param {string} id - Can be numeric ID or documentId
 * @returns {Promise<any>}
 */
export async function deletePage(id) {
	try {
		console.log('🗑️ Deleting page:', id);
		const result = await strapi.delete(`/pages/${id}`);
		console.log('✅ Page deleted successfully');
		return result;
	} catch (error) {
		console.error('❌ Error deleting page:', error.message);
		throw error;
	}
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
		populate: ['page'],
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
		populate: ['page'],
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
 * Create a section for a page
 * @param {Object} sectionData
 * @returns {Promise<any>}
 */
export async function createSection(sectionData) {
	const { page, ...data } = sectionData;
	return strapi.post('/sections', {
		...data,
		page: page
	});
}

/**
 * Create a product for a page
 * @param {Object} productData
 * @param {string} productData.name
 * @param {string} productData.description
 * @param {number} productData.price
 * @param {string} productData.image
 * @param {boolean} productData.enabled
 * @param {number} productData.order
 * @param {string} productData.page - Page ID
 * @returns {Promise<any>}
 */
export async function createProduct(productData) {
	const { page, ...data } = productData;
	return strapi.post('/products', {
		...data,
		page: page
	});
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
