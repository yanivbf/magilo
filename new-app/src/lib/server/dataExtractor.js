// @ts-check

/**
 * Extract contact information from HTML content
 * @param {string} html - HTML content
 * @returns {Object} - Extracted contact info
 */
export function extractContactInfo(html) {
	const contactInfo = {
		phone: '',
		email: '',
		city: '',
		address: ''
	};

	// Extract phone number
	contactInfo.phone = extractPhone(html);

	// Extract email
	contactInfo.email = extractEmail(html);

	// Extract city
	contactInfo.city = extractCity(html);

	// Extract address
	contactInfo.address = extractAddress(html);

	return contactInfo;
}

/**
 * Extract phone number from HTML
 * @param {string} html
 * @returns {string}
 */
function extractPhone(html) {
	// Israeli phone patterns: 05X-XXXXXXX, 0X-XXXXXXX, +972-XX-XXXXXXX
	const phonePatterns = [
		/\+972[-\s]?5\d[-\s]?\d{7}/g,
		/\+972[-\s]?\d[-\s]?\d{7}/g,
		/05\d[-\s]?\d{7}/g,
		/0\d[-\s]?\d{7}/g,
		/\d{3}[-\s]?\d{7}/g,
		/\d{2}[-\s]?\d{7}/g
	];

	for (const pattern of phonePatterns) {
		const matches = html.match(pattern);
		if (matches && matches.length > 0) {
			// Clean up the phone number
			return matches[0].replace(/[-\s]/g, '');
		}
	}

	return '';
}

/**
 * Extract email from HTML
 * @param {string} html
 * @returns {string}
 */
function extractEmail(html) {
	const emailPattern = /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g;
	const matches = html.match(emailPattern);

	if (matches && matches.length > 0) {
		return matches[0];
	}

	return '';
}

/**
 * Extract city from HTML
 * @param {string} html
 * @returns {string}
 */
function extractCity(html) {
	// Common Hebrew city keywords
	const cityKeywords = ['עיר', 'city', 'מיקום', 'location'];
	const israeliCities = [
		'תל אביב',
		'ירושלים',
		'חיפה',
		'ראשון לציון',
		'פתח תקווה',
		'אשדוד',
		'נתניה',
		'באר שבע',
		'בני ברק',
		'חולון',
		'רמת גן',
		'אשקלון',
		'רחובות',
		'בת ים',
		'כפר סבא',
		'הרצליה',
		'מודיעין',
		'נצרת',
		'לוד',
		'רמלה'
	];

	// Try to find city names in the HTML
	for (const city of israeliCities) {
		if (html.includes(city)) {
			return city;
		}
	}

	// Try to find city near keywords
	for (const keyword of cityKeywords) {
		const regex = new RegExp(`${keyword}[:\\s]+([א-ת\\s]+)`, 'i');
		const match = html.match(regex);
		if (match && match[1]) {
			return match[1].trim();
		}
	}

	return '';
}

/**
 * Extract address from HTML
 * @param {string} html
 * @returns {string}
 */
function extractAddress(html) {
	// Look for address patterns
	const addressKeywords = ['כתובת', 'address', 'רחוב', 'street'];

	for (const keyword of addressKeywords) {
		const regex = new RegExp(`${keyword}[:\\s]+([^<>]+)`, 'i');
		const match = html.match(regex);
		if (match && match[1]) {
			// Clean up the address
			return match[1].trim().substring(0, 200);
		}
	}

	return '';
}

/**
 * Extract products from HTML content
 * @param {string} html - HTML content
 * @returns {Array<Object>} - Array of products
 */
export function extractProducts(html) {
	const products = [];

	// Multiple selector strategies for finding products
	const productSelectors = [
		'.product-card',
		'[class*="product"]',
		'.card',
		'.item',
		'[data-product]'
	];

	// Create a temporary DOM-like structure (simplified)
	// In a real implementation, you might use a library like jsdom or cheerio
	// For now, we'll use regex patterns to extract product data

	// Pattern 1: Look for product cards with name, price, and image
	const productPattern =
		/<div[^>]*class="[^"]*product[^"]*"[^>]*>[\s\S]*?<\/div>/gi;
	const matches = html.match(productPattern);

	if (matches) {
		for (const match of matches) {
			const product = {
				name: extractProductName(match),
				price: extractProductPrice(match),
				image: extractProductImage(match),
				description: extractProductDescription(match)
			};

			// Only add if we found at least name and price
			if (product.name && product.price) {
				products.push(product);
			}
		}
	}

	return products;
}

/**
 * Extract product name from HTML snippet
 * @param {string} html
 * @returns {string}
 */
function extractProductName(html) {
	// Look for common product name patterns
	const patterns = [
		/<h[1-6][^>]*>([^<]+)<\/h[1-6]>/i,
		/<[^>]*class="[^"]*name[^"]*"[^>]*>([^<]+)</i,
		/<[^>]*class="[^"]*title[^"]*"[^>]*>([^<]+)</i
	];

	for (const pattern of patterns) {
		const match = html.match(pattern);
		if (match && match[1]) {
			return match[1].trim();
		}
	}

	return '';
}

/**
 * Extract product price from HTML snippet
 * @param {string} html
 * @returns {number}
 */
function extractProductPrice(html) {
	// Look for price patterns (₪, $, numbers)
	const pricePatterns = [
		/₪\s*(\d+(?:,\d{3})*(?:\.\d{2})?)/,
		/(\d+(?:,\d{3})*(?:\.\d{2})?)\s*₪/,
		/\$\s*(\d+(?:,\d{3})*(?:\.\d{2})?)/,
		/(\d+(?:,\d{3})*(?:\.\d{2})?)\s*\$/,
		/מחיר[:\s]+(\d+(?:,\d{3})*(?:\.\d{2})?)/i,
		/price[:\s]+(\d+(?:,\d{3})*(?:\.\d{2})?)/i
	];

	for (const pattern of pricePatterns) {
		const match = html.match(pattern);
		if (match && match[1]) {
			// Remove commas and convert to number
			return parseFloat(match[1].replace(/,/g, ''));
		}
	}

	return 0;
}

/**
 * Extract product image from HTML snippet
 * @param {string} html
 * @returns {string}
 */
function extractProductImage(html) {
	// Look for img tags
	const imgPattern = /<img[^>]+src="([^"]+)"/i;
	const match = html.match(imgPattern);

	if (match && match[1]) {
		return match[1];
	}

	return '';
}

/**
 * Extract product description from HTML snippet
 * @param {string} html
 * @returns {string}
 */
function extractProductDescription(html) {
	// Look for description or paragraph text
	const patterns = [
		/<p[^>]*>([^<]+)<\/p>/i,
		/<[^>]*class="[^"]*description[^"]*"[^>]*>([^<]+)</i
	];

	for (const pattern of patterns) {
		const match = html.match(pattern);
		if (match && match[1]) {
			return match[1].trim().substring(0, 200);
		}
	}

	return '';
}

/**
 * Extract page description from meta tags
 * @param {string} html - HTML content
 * @returns {string} - Extracted description
 */
export function extractDescription(html) {
	// Try meta description tag first
	let patterns = [
		/<meta[^>]+name=["']description["'][^>]+content=["']([^"']+)["'][^>]*>/i,
		/<meta[^>]+content=["']([^"']+)["'][^>]+name=["']description["'][^>]*>/i
	];

	for (const pattern of patterns) {
		const match = html.match(pattern);
		if (match && match[1] && match[1].trim()) {
			return match[1].trim();
		}
	}

	// Try og:description
	patterns = [
		/<meta[^>]+property=["']og:description["'][^>]+content=["']([^"']+)["'][^>]*>/i,
		/<meta[^>]+content=["']([^"']+)["'][^>]+property=["']og:description["'][^>]*>/i
	];

	for (const pattern of patterns) {
		const match = html.match(pattern);
		if (match && match[1] && match[1].trim()) {
			return match[1].trim();
		}
	}

	return '';
}

/**
 * Detect page type from HTML content and selected type
 * @param {string} html - HTML content
 * @param {string} [selectedType] - User-selected page type (highest priority)
 * @returns {string} - Detected page type
 */
export function detectPageType(html, selectedType) {
	// Priority 1: User-selected type (if provided)
	if (selectedType) {
		return selectedType;
	}

	const lowerHtml = html.toLowerCase();

	// Priority 2: Check for specific keywords

	// Event keywords
	const eventKeywords = [
		'rsvp',
		'אישור הגעה',
		'מוזמנים',
		'countdown-timer',
		'חתונה',
		'wedding',
		'בר מצווה',
		'אירוע',
		'הזמנה לאירוע'
	];
	if (eventKeywords.some((keyword) => lowerHtml.includes(keyword))) {
		return 'event';
	}

	// Service provider / appointment keywords
	const appointmentKeywords = [
		'תור',
		'appointment',
		'booking',
		'קביעת תור',
		'schedule',
		'calendar',
		'זמן פנוי',
		'available time',
		'מספרה',
		'barber',
		'hairdresser',
		'salon'
	];
	if (appointmentKeywords.some((keyword) => lowerHtml.includes(keyword))) {
		return 'serviceProvider';
	}

	// Store keywords
	const storeKeywords = [
		'addtocart',
		'shopping-cart',
		'cart-icon',
		'product-card',
		'btn-add-cart',
		'מוצר',
		'קנה עכשיו',
		'הוסף לעגלה',
		'חנות',
		'store',
		'shop'
	];
	if (storeKeywords.some((keyword) => lowerHtml.includes(keyword))) {
		return 'store';
	}

	// Default to generic
	return 'generic';
}

/**
 * Extract page data from Strapi page object (supports both HTML and sections-based pages)
 * Handles both Strapi v4 (nested attributes) and v5 (flat) formats
 * @param {any} page - Strapi page object
 * @returns {Object} - Extracted page data
 */
export function extractPageDataFromStrapi(page) {
	if (!page) {
		return {
			hasHtmlContent: false,
			hasSections: false,
			title: '',
			pageType: 'generic',
			description: '',
			sections: [],
			products: []
		};
	}

	// Strapi v5 uses flat format (data directly on page object)
	// Strapi v4 uses nested format (data under page.attributes)
	const attrs = page.attributes || page;
	
	// Check if this is a sections-based page
	// v5: attrs.sections is array directly
	// v4: attrs.sections.data is array
	const sectionsArray = Array.isArray(attrs.sections) ? attrs.sections : (attrs.sections?.data || []);
	const productsArray = Array.isArray(attrs.storeProducts) ? attrs.storeProducts : (attrs.storeProducts?.data || []);
	
	const hasSections = sectionsArray.length > 0;
	const hasProducts = productsArray.length > 0;
	const hasHtmlContent = attrs.htmlContent && attrs.htmlContent.trim().length > 0;

	return {
		hasHtmlContent,
		hasSections,
		hasProducts,
		title: attrs.title || '',
		pageType: attrs.pageType || 'generic',
		description: attrs.description || '',
		sections: sectionsArray.map(s => {
			// v5: data directly on s, v4: data under s.attributes
			const sAttrs = s.attributes || s;
			return {
				id: s.id,
				documentId: s.documentId,
				type: sAttrs.type,
				enabled: sAttrs.enabled,
				order: sAttrs.order ?? 99,
				data: sAttrs.data || {}
			};
		}).sort((a, b) => a.order - b.order), // Sort by order field
		products: productsArray.map(p => {
			// v5: data directly on p, v4: data under p.attributes
			const pAttrs = p.attributes || p;
			return {
				id: p.id,
				documentId: p.documentId,
				name: pAttrs.name,
				description: pAttrs.description,
				price: pAttrs.price,
				image: pAttrs.image,
				enabled: pAttrs.enabled,
				order: pAttrs.order
			};
		}),
		productsCount: productsArray.length
	};
}
