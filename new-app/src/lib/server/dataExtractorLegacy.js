// @ts-check
// Legacy data extraction functions ported from Express server

/**
 * Extract contact information from HTML (ported from legacy)
 * @param {string} html - HTML content
 * @returns {Object} - Contact information
 */
export function extractContactInfoFromHTML(html) {
	const contactInfo = {};

	// Extract phone numbers
	const phonePatterns = [
		/\+972[\s\-\)]?\s*5[0-9][\s\-]?\d{3}[\s\-]?\d{4}/g,
		/\+972[\s\-\)]?\s*7[0-9][\s\-]?\d{3}[\s\-]?\d{4}/g,
		/0?5[0-9][\s\-]?\d{3}[\s\-]?\d{4}/g,
		/0?7[0-9][\s\-]?\d{3}[\s\-]?\d{4}/g,
		/0[57]\d(?:[\.\s\-]?\d){8}/g
	];

	let foundPhones = [];
	const phoneScores = new Map();

	// Search in contact/footer areas (higher priority)
	const contactAreaPattern =
		/<(?:section|div|footer)[^>]*(?:class|id)="[^"]*(?:contact|footer|info|details)[^"]*"[^>]*>([\s\S]{500,3000})<\/[^>]+>/gi;
	const contactAreas = [...html.matchAll(contactAreaPattern)];

	contactAreas.forEach((areaMatch) => {
		const areaHtml = areaMatch[1];
		phonePatterns.forEach((pattern) => {
			const matches = areaHtml.match(pattern);
			if (matches) {
				matches.forEach((match) => {
					let phone = match.replace(/[\s\-\(\)\.]/g, '');
					if (phone.startsWith('+972')) phone = phone.replace('+972', '0');
					if (phone.length === 9 && (phone.startsWith('5') || phone.startsWith('7')))
						phone = '0' + phone;
					if (
						phone.length === 10 &&
						phone.startsWith('0') &&
						(phone[1] === '5' || phone[1] === '7')
					) {
						const isValidPhone = phone.match(/^0[57][0-9]{8}$/);
						if (
							isValidPhone &&
							!phone.match(/^0+$/) &&
							phone !== '0500000000' &&
							phone !== '0700000000'
						) {
							const formatted = `${phone.substring(0, 3)}-${phone.substring(3, 6)}-${phone.substring(6)}`;
							if (!foundPhones.includes(formatted)) foundPhones.push(formatted);
							phoneScores.set(formatted, (phoneScores.get(formatted) || 0) + 5);
						}
					}
				});
			}
		});
	});

	// Search entire HTML
	phonePatterns.forEach((pattern) => {
		const matches = html.match(pattern);
		if (matches) {
			matches.forEach((match) => {
				let phone = match.replace(/[\s\-\(\)\.]/g, '');
				if (phone.startsWith('+972')) phone = phone.replace('+972', '0');
				if (phone.length === 9 && (phone.startsWith('5') || phone.startsWith('7')))
					phone = '0' + phone;
				if (
					phone.length === 10 &&
					phone.startsWith('0') &&
					(phone[1] === '5' || phone[1] === '7')
				) {
					const isValidPhone = phone.match(/^0[57][0-9]{8}$/);
					if (
						isValidPhone &&
						!phone.match(/^0+$/) &&
						phone !== '0500000000' &&
						phone !== '0700000000'
					) {
						const formatted = `${phone.substring(0, 3)}-${phone.substring(3, 6)}-${phone.substring(6)}`;
						if (!foundPhones.includes(formatted)) foundPhones.push(formatted);
						phoneScores.set(formatted, (phoneScores.get(formatted) || 0) + 1);
					}
				}
			});
		}
	});

	// Boost phones near "טלפון"
	const proximityMatches = [...html.matchAll(/טלפון[:\s\-]*([^<\n]{0,60})/gi)];
	proximityMatches.forEach((pm) => {
		const seg = (pm[1] || '').toString();
		const hits = seg.match(/0[57]\d[\d\s\-\.]{7,}/g) || [];
		hits.forEach((h) => {
			let normalized = h.replace(/[^0-9]/g, '');
			if (normalized.length === 9 && (normalized.startsWith('5') || normalized.startsWith('7')))
				normalized = '0' + normalized;
			if (/^0[57]\d{8}$/.test(normalized)) {
				const formatted = `${normalized.substring(0, 3)}-${normalized.substring(3, 6)}-${normalized.substring(6)}`;
				phoneScores.set(formatted, (phoneScores.get(formatted) || 0) + 3);
			}
		});
	});

	if (foundPhones.length > 0) {
		const validPhones = foundPhones.filter((phone) => {
			const digits = phone.replace(/-/g, '');
			const firstDigit = digits[0];
			const isAllSame = digits.split('').every((d) => d === firstDigit);
			const isPlaceholder = phone.includes('000-000') || phone.includes('111-111');
			return !isAllSame && !isPlaceholder;
		});

		if (validPhones.length > 0) {
			const ranked = [...new Set(validPhones)]
				.map((p) => ({ phone: p, score: phoneScores.get(p) || 0 }))
				.sort((a, b) => b.score - a.score);
			contactInfo.phones = ranked.map((r) => r.phone);
			contactInfo.phone = contactInfo.phones[0];
		}
	}

	// Extract email
	const emailMatch = html.match(/([a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,})/);
	if (emailMatch) contactInfo.email = emailMatch[1];

	// Extract city
	const cities = [
		'תל אביב',
		'ירושלים',
		'חיפה',
		'באר שבע',
		'נתניה',
		'אשדוד',
		'רמת גן',
		'פתח תקווה',
		'בני ברק',
		'חולון',
		'רחובות',
		'כפר סבא',
		'אילת',
		'רעננה',
		'הרצליה',
		'חדרה',
		'קריית ביאליק',
		'קריית מוצקין',
		'ראשון לציון',
		'נהריה',
		'הוד השרון',
		'גבעתיים',
		'קריית אתא',
		'קריית שמונה',
		'בית שאן',
		'עפולה'
	];

	// Prioritize cities in contact/footer areas
	for (const city of cities) {
		const inContactArea = contactAreas.some((area) => area[1].includes(city));
		if (inContactArea) {
			contactInfo.city = city;
			break;
		}
	}

	// If not found in contact areas, check entire HTML
	if (!contactInfo.city) {
		for (const city of cities) {
			if (html.includes(city)) {
				contactInfo.city = city;
				break;
			}
		}
	}

	// Extract address from navigation buttons (Google Maps / Waze)
	const navigationButtonPatterns = [
		/href\s*=\s*["']https?:\/\/(?:www\.)?(?:maps\.)?google\.com\/maps[^"']*q=([^"'\&]+)/gi,
		/href\s*=\s*["']https?:\/\/(?:www\.)?(?:maps\.)?google\.com\/maps[^"']*daddr=([^"'\&]+)/gi,
		/href\s*=\s*["']https?:\/\/(?:www\.)?waze\.com\/ul[^"']*q=([^"'\&]+)/gi,
		/href\s*=\s*["']https?:\/\/(?:www\.)?waze\.com\/ul[^"']*ll=([^"'\&]+)/gi,
		/<a[^>]*href\s*=\s*["'](?:https?:\/\/(?:maps|waze))[^"']*["'][^>]*>([^<]{10,100})<\/a>/gi
	];

	for (const pattern of navigationButtonPatterns) {
		const matches = [...html.matchAll(pattern)];
		if (matches && matches.length > 0) {
			for (const match of matches) {
				if (match[1]) {
					let address = decodeURIComponent(match[1].trim());
					address = address.replace(/\+/g, ' ').replace(/%20/g, ' ').replace(/\s+/g, ' ').trim();
					if (address.length > 5 && (address.match(/[א-ת]/) || address.match(/[a-zA-Z]/))) {
						if (address.match(/רחוב|street|st\./i) || address.match(/\d+/)) {
							contactInfo.address = address;
							break;
						} else if (!contactInfo.address) {
							contactInfo.address = address;
						}
					}
				}
			}
			if (contactInfo.address) break;
		}
	}

	// If no address from navigation button, try text patterns
	if (!contactInfo.address) {
		const addressPatterns = [
			/([א-ת\s]+,\s*רחוב\s+[א-ת\s\d]+)/g,
			/([א-ת\s]+,\s*[א-ת\s\d]+\s+\d+)/g,
			/(רחוב\s+[א-ת\s\d]+,\s*[א-ת\s]+)/g,
			/כתובת[:\s]*([^<\n]{5,80})/gi
		];

		for (const pattern of addressPatterns) {
			const matches = html.match(pattern);
			if (matches && matches[0]) {
				let address = matches[0].replace(/כתובת[:\s]*/gi, '').trim();
				if (address.length > 5) {
					contactInfo.address = address;
					break;
				}
			}
		}
	}

	return contactInfo;
}

/**
 * Extract products from HTML (ported from legacy)
 * @param {string} html - HTML content
 * @returns {Array} - Array of products
 */
export function extractProductsFromHTML(html) {
	const products = [];

	// Get page title and h1 to exclude them
	const pageTitleMatch = html.match(/<title[^>]*>([^<]+)<\/title>/i);
	const pageH1Match = html.match(/<h1[^>]*>([^<]{3,80})<\/h1>/i);
	const pageTitle = pageTitleMatch ? pageTitleMatch[1].trim() : '';
	const pageH1 = pageH1Match ? pageH1Match[1].trim() : '';

	const excludePatterns = [
		'נגישות',
		'אודות',
		'צור קשר',
		'דף הבית',
		'עלינו',
		'תקנון',
		'מדיניות',
		'פרטיות',
		'תנאים',
		'שירות',
		'משלוחים',
		'החזרות',
		'איך להזמין',
		'גלרי',
		'המוצרים',
		'תיאור',
		'המיוחדים',
		'הכל על',
		'כל הזכויות',
		'זכויות יוצרים',
		'ברוכים הבאים',
		'לקוחות',
		'שאלות',
		'תשובות',
		'מוצרים שלנו',
		'המוצרים שלנו',
		'תפריט',
		'כותרת',
		'כותרת ראשית',
		pageTitle,
		pageH1
	].filter(Boolean);

	const excludeFromName = [
		'₪',
		'שקל',
		'ש"ח',
		'מחיר',
		'מחירים',
		'מחירון',
		'טלפון',
		'מייל',
		'אימייל',
		'כתובת',
		'עיר',
		'ישראל',
		'טוהר',
		'יופי',
		'איכות',
		'השראה',
		'חלום',
		'אמת',
		'נשמה'
	];

	// Strategy 1: product-card elements
	const productCardPattern =
		/<div[^>]*class="[^"]*product-card[^"]*"[^>]*>([\s\S]{50,2000})<\/div>/gi;
	const productCardMatches = [...html.matchAll(productCardPattern)];

	productCardMatches.forEach((cardMatch) => {
		const cardHtml = cardMatch[1];
		let nameMatch =
			cardHtml.match(/<h[34][^>]*>([^<]{3,100})<\/h[34]>/i) ||
			cardHtml.match(
				/<[^>]*class="[^"]*product-name[^"]*"[^>]*>([^<]{3,100})<\/[^>]+>/i
			);

		if (nameMatch && nameMatch[1]) {
			const name = nameMatch[1].replace(/<[^>]*>/g, '').trim();

			// Check exclusions
			if (excludePatterns.some((ex) => name.includes(ex))) return;
			if (excludeFromName.some((ex) => name.includes(ex))) return;
			if (name.length <= 2 || name.length > 100) return;

			// Extract price
			const priceMatch =
				cardHtml.match(/₪\s*(\d+(?:[,\s]\d+)*(?:\.\d+)?)/) ||
				cardHtml.match(/(\d+(?:[,\s]\d+)*(?:\.\d+)?)\s*(?:₪|שקל|ש"ח)/);

			if (priceMatch) {
				const priceStr = priceMatch[1].replace(/[,\s]/g, '');
				const price = parseFloat(priceStr);
				if (price >= 50 && price <= 50000) {
					products.push({ name, price });
				}
			}
		}
	});

	// Strategy 2: Direct pattern search
	const productPattern = /<(?:h[23456]|p|span|strong|b)[^>]*>([^<]{3,80})<\/[^>]+>/gi;
	const matches = [...html.matchAll(productPattern)];

	matches.forEach((match) => {
		const text = match[1].replace(/<[^>]*>/g, '').trim();

		// Check exclusions
		if (excludePatterns.some((ex) => text.includes(ex))) return;
		if (excludeFromName.some((ex) => text.includes(ex))) return;
		if (text.length <= 2 || text.length > 80) return;
		if (text.length <= 8 && !text.match(/\d/)) return;

		// Look for price within 500 chars
		const startPos = match.index;
		const searchArea = html.substring(startPos, Math.min(startPos + 500, html.length));
		const priceMatch =
			searchArea.match(/₪\s*(\d+(?:[,\s]\d+)*(?:\.\d+)?)/) ||
			searchArea.match(/(\d+(?:[,\s]\d+)*(?:\.\d+)?)\s*(?:₪|שקל|ש"ח)/);

		if (priceMatch) {
			const priceStr = priceMatch[1].replace(/[,\s]/g, '');
			const price = parseFloat(priceStr);
			if (price >= 50 && price <= 50000) {
				if (!products.some((p) => p.name === text)) {
					products.push({ name: text, price });
				}
			}
		}
	});

	// Remove duplicates
	const uniqueProducts = [];
	products.forEach((p) => {
		if (!uniqueProducts.some((up) => up.name === p.name && up.price === p.price)) {
			uniqueProducts.push(p);
		}
	});

	return uniqueProducts;
}
