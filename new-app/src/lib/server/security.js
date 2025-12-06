// @ts-check

/**
 * Security utilities for input sanitization and validation
 */

/**
 * Enhanced HTML escaping to prevent XSS attacks
 * @param {string} text - Text to escape
 * @returns {string} - Escaped text
 */
export function escapeHtml(text) {
	if (!text) return '';
	return String(text)
		.replace(/&/g, '&amp;')
		.replace(/</g, '&lt;')
		.replace(/>/g, '&gt;')
		.replace(/"/g, '&quot;')
		.replace(/'/g, '&#039;')
		.replace(/\//g, '&#x2F;'); // Forward slash for extra safety
}

/**
 * Sanitize URL to prevent javascript: and data: URIs
 * @param {string} url - URL to sanitize
 * @returns {string} - Safe URL or empty string
 */
export function sanitizeUrl(url) {
	if (!url) return '';
	
	const urlStr = String(url).trim().toLowerCase();
	
	// Block dangerous protocols
	const dangerousProtocols = ['javascript:', 'data:', 'vbscript:', 'file:'];
	for (const protocol of dangerousProtocols) {
		if (urlStr.startsWith(protocol)) {
			console.warn('⚠️ Blocked dangerous URL protocol:', protocol);
			return '';
		}
	}
	
	// Only allow http, https, mailto, tel, and relative URLs
	if (urlStr.startsWith('http://') || 
	    urlStr.startsWith('https://') || 
	    urlStr.startsWith('mailto:') || 
	    urlStr.startsWith('tel:') ||
	    urlStr.startsWith('/') ||
	    urlStr.startsWith('#')) {
		return url;
	}
	
	// If no protocol, assume relative URL
	if (!urlStr.includes(':')) {
		return url;
	}
	
	console.warn('⚠️ Blocked suspicious URL:', url);
	return '';
}

/**
 * Validate and sanitize page data before processing
 * @param {Object} data - Page data to validate
 * @returns {{valid: boolean, sanitized: Object, errors: string[]}}
 */
export function validatePageData(data) {
	const errors = [];
	const sanitized = {};
	
	// Required fields - accept mainName, businessName, or eventName
	const nameField = data.mainName || data.businessName || data.eventName;
	if (!nameField || typeof nameField !== 'string') {
		errors.push('mainName, businessName, or eventName is required and must be a string');
	} else {
		sanitized.mainName = escapeHtml(nameField.trim());
		if (data.businessName) {
			sanitized.businessName = escapeHtml(data.businessName.trim());
		}
		if (data.eventName) {
			sanitized.eventName = escapeHtml(data.eventName.trim());
		}
	}
	
	// Optional text fields
	const textFields = ['description', 'phone', 'email', 'address', 'city'];
	for (const field of textFields) {
		if (data[field]) {
			sanitized[field] = escapeHtml(String(data[field]).trim());
		}
	}
	
	// URL fields
	const urlFields = ['logo', 'image', 'videoUrl', 'video'];
	for (const field of urlFields) {
		if (data[field]) {
			const sanitizedUrl = sanitizeUrl(data[field]);
			if (sanitizedUrl) {
				sanitized[field] = sanitizedUrl;
			} else {
				errors.push(`Invalid URL in field: ${field}`);
			}
		}
	}
	
	// Social links
	if (data.facebookLink) sanitized.facebookLink = sanitizeUrl(data.facebookLink);
	if (data.instagramLink) sanitized.instagramLink = sanitizeUrl(data.instagramLink);
	if (data.youtubeLink) sanitized.youtubeLink = sanitizeUrl(data.youtubeLink);
	if (data.tiktokLink) sanitized.tiktokLink = sanitizeUrl(data.tiktokLink);
	if (data.linkedinLink) sanitized.linkedinLink = sanitizeUrl(data.linkedinLink);
	if (data.twitterLink) sanitized.twitterLink = sanitizeUrl(data.twitterLink);
	if (data.whatsappLink) sanitized.whatsappLink = sanitizeUrl(data.whatsappLink);
	
	// Products array
	if (data.products && Array.isArray(data.products)) {
		sanitized.products = data.products.map(product => ({
			id: product.id,
			name: escapeHtml(String(product.name || '')),
			description: escapeHtml(String(product.description || '')),
			price: Number(product.price) || 0,
			image: sanitizeUrl(product.image || '')
		}));
	}
	
	// Gallery array
	if (data.gallery && Array.isArray(data.gallery)) {
		sanitized.gallery = data.gallery
			.map(url => sanitizeUrl(url))
			.filter(url => url !== '');
	}
	
	// FAQ array
	if (data.faq && Array.isArray(data.faq)) {
		sanitized.faq = data.faq.map(item => ({
			question: escapeHtml(String(item.question || '')),
			answer: escapeHtml(String(item.answer || ''))
		}));
	}
	
	// Copy other safe fields
	const safeFields = ['pageType', 'includeGallery', 'includeFAQ', 'includeTestimonials', 'includeAbout'];
	for (const field of safeFields) {
		if (data[field] !== undefined) {
			sanitized[field] = data[field];
		}
	}
	
	return {
		valid: errors.length === 0,
		sanitized,
		errors
	};
}

/**
 * Validate email format
 * @param {string} email - Email to validate
 * @returns {boolean}
 */
export function isValidEmail(email) {
	if (!email) return false;
	const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
	return emailRegex.test(email);
}

/**
 * Validate phone number (basic validation)
 * @param {string} phone - Phone to validate
 * @returns {boolean}
 */
export function isValidPhone(phone) {
	if (!phone) return false;
	// Allow digits, spaces, dashes, parentheses, and plus sign
	const phoneRegex = /^[\d\s\-\(\)\+]+$/;
	return phoneRegex.test(phone) && phone.replace(/\D/g, '').length >= 7;
}

/**
 * Strip dangerous HTML tags and attributes
 * @param {string} html - HTML to sanitize
 * @returns {string} - Sanitized HTML
 */
export function sanitizeHtml(html) {
	if (!html) return '';
	
	// Remove script tags and their content
	let sanitized = html.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '');
	
	// Remove event handlers (onclick, onerror, etc.)
	sanitized = sanitized.replace(/\s*on\w+\s*=\s*["'][^"']*["']/gi, '');
	sanitized = sanitized.replace(/\s*on\w+\s*=\s*[^\s>]*/gi, '');
	
	// Remove javascript: URLs
	sanitized = sanitized.replace(/href\s*=\s*["']javascript:[^"']*["']/gi, 'href="#"');
	sanitized = sanitized.replace(/src\s*=\s*["']javascript:[^"']*["']/gi, 'src=""');
	
	// Remove data: URLs (can be used for XSS)
	sanitized = sanitized.replace(/href\s*=\s*["']data:[^"']*["']/gi, 'href="#"');
	sanitized = sanitized.replace(/src\s*=\s*["']data:[^"']*["']/gi, 'src=""');
	
	// Remove iframe tags (except from trusted domains)
	sanitized = sanitized.replace(/<iframe(?![^>]*src=["']https:\/\/(www\.)?youtube\.com)[^>]*>.*?<\/iframe>/gi, '');
	
	// Remove object and embed tags
	sanitized = sanitized.replace(/<object[^>]*>.*?<\/object>/gi, '');
	sanitized = sanitized.replace(/<embed[^>]*>/gi, '');
	
	return sanitized;
}

/**
 * Rate limiting helper (simple in-memory implementation)
 */
const rateLimitStore = new Map();

/**
 * Check if request should be rate limited
 * @param {string} identifier - IP or user ID
 * @param {number} maxRequests - Max requests per window
 * @param {number} windowMs - Time window in milliseconds
 * @returns {boolean} - True if rate limit exceeded
 */
export function isRateLimited(identifier, maxRequests = 100, windowMs = 60000) {
	const now = Date.now();
	const key = `${identifier}`;
	
	if (!rateLimitStore.has(key)) {
		rateLimitStore.set(key, { count: 1, resetTime: now + windowMs });
		return false;
	}
	
	const record = rateLimitStore.get(key);
	
	if (now > record.resetTime) {
		// Reset window
		rateLimitStore.set(key, { count: 1, resetTime: now + windowMs });
		return false;
	}
	
	if (record.count >= maxRequests) {
		return true;
	}
	
	record.count++;
	return false;
}

/**
 * Clean up old rate limit records (call periodically)
 */
export function cleanupRateLimits() {
	const now = Date.now();
	for (const [key, record] of rateLimitStore.entries()) {
		if (now > record.resetTime) {
			rateLimitStore.delete(key);
		}
	}
}

// Cleanup every 5 minutes
setInterval(cleanupRateLimits, 5 * 60 * 1000);
