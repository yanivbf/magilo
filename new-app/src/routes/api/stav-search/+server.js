// @ts-check
import { json } from '@sveltejs/kit';

/**
 * Enhanced Smart Search with Product & City Detection
 * @param {string} query - User search query
 * @param {Array} pages - All available pages
 * @returns {Object} - Search results with detected entities
 */
function smartSearch(query, pages) {
	const lowerQuery = query.toLowerCase();
	const words = lowerQuery.split(/\s+/).filter((w) => w.length > 2);

	// Enhanced category keywords with synonyms
	const categoryKeywords = {
		store: ['חנות', 'קנייה', 'מוצר', 'מכירה', 'קניות', 'לקנות', 'shop', 'store', 'buy', 'purchase'],
		service: ['שירות', 'מספרה', 'טיפול', 'תיקון', 'עיסוי', 'ספר', 'service', 'barber', 'salon', 'massage', 'repair'],
		event: ['אירוע', 'חתונה', 'מסיבה', 'יום הולדת', 'בר מצווה', 'event', 'wedding', 'party', 'birthday'],
		course: ['קורס', 'לימוד', 'הדרכה', 'סדנה', 'שיעור', 'course', 'training', 'workshop', 'class'],
		restaurant: ['מסעדה', 'אוכל', 'מזון', 'ארוחה', 'restaurant', 'food', 'meal', 'dining'],
		courier: ['משלוח', 'שליח', 'דליברי', 'delivery', 'courier', 'shipping']
	};

	// Comprehensive Israeli cities with variations
	const cities = [
		{ name: 'תל אביב', variations: ['תל אביב', 'תל-אביב', 'tel aviv', 'tlv', 'ת"א'] },
		{ name: 'ירושלים', variations: ['ירושלים', 'jerusalem', 'ירושלם', 'י-ם'] },
		{ name: 'חיפה', variations: ['חיפה', 'haifa'] },
		{ name: 'באר שבע', variations: ['באר שבע', 'באר-שבע', 'beer sheva', 'beersheba', 'ב"ש'] },
		{ name: 'נתניה', variations: ['נתניה', 'netanya'] },
		{ name: 'אשדוד', variations: ['אשדוד', 'ashdod'] },
		{ name: 'רמת גן', variations: ['רמת גן', 'רמת-גן', 'ramat gan', 'רמ"ג'] },
		{ name: 'פתח תקווה', variations: ['פתח תקווה', 'פתח-תקווה', 'petah tikva', 'פ"ת'] },
		{ name: 'ראשון לציון', variations: ['ראשון לציון', 'ראשון', 'rishon lezion'] },
		{ name: 'חולון', variations: ['חולון', 'holon'] },
		{ name: 'בת ים', variations: ['בת ים', 'bat yam'] },
		{ name: 'רחובות', variations: ['רחובות', 'rehovot'] },
		{ name: 'הרצליה', variations: ['הרצליה', 'herzliya'] },
		{ name: 'כפר סבא', variations: ['כפר סבא', 'kfar saba'] },
		{ name: 'מודיעין', variations: ['מודיעין', 'modiin'] },
		{ name: 'אילת', variations: ['אילת', 'eilat'] }
	];

	// Product keywords for detection
	const productKeywords = [
		'פיצה', 'המבורגר', 'סושי', 'שווארמה', 'פלאפל', 'חומוס', 'סלט',
		'נעליים', 'בגדים', 'חולצה', 'מכנסיים', 'שמלה', 'נעל',
		'ספר', 'מחשב', 'טלפון', 'אוזניות', 'מקלדת',
		'תספורת', 'צבע', 'פן', 'עיסוי', 'טיפול פנים',
		'pizza', 'burger', 'sushi', 'shoes', 'shirt', 'book', 'phone'
	];

	// Detect city from query
	let detectedCity = null;
	for (const city of cities) {
		for (const variation of city.variations) {
			if (lowerQuery.includes(variation.toLowerCase())) {
				detectedCity = city.name;
				break;
			}
		}
		if (detectedCity) break;
	}

	// Detect products from query
	const detectedProducts = [];
	for (const product of productKeywords) {
		if (lowerQuery.includes(product.toLowerCase())) {
			detectedProducts.push(product);
		}
	}

	// Detect category intent
	let detectedCategory = null;
	for (const [category, keywords] of Object.entries(categoryKeywords)) {
		if (keywords.some((kw) => lowerQuery.includes(kw))) {
			detectedCategory = category;
			break;
		}
	}

	const results = [];

	for (const page of pages) {
		let score = 0;
		const pageText = `${page.title} ${page.description} ${page.city} ${page.pageType}`.toLowerCase();
		const pageProducts = page.products || [];

		// Exact title match (highest priority)
		if (page.title.toLowerCase().includes(lowerQuery)) {
			score += 100;
		}

		// Word matches in title
		words.forEach((word) => {
			if (page.title.toLowerCase().includes(word)) {
				score += 50;
			}
		});

		// Word matches in description
		words.forEach((word) => {
			if (page.description && page.description.toLowerCase().includes(word)) {
				score += 20;
			}
		});

		// Product match (NEW - High priority)
		if (detectedProducts.length > 0) {
			detectedProducts.forEach((product) => {
				// Check in page products
				const hasProduct = pageProducts.some((p) => 
					p.name && p.name.toLowerCase().includes(product.toLowerCase())
				);
				if (hasProduct) {
					score += 80; // High score for product match
				}
				// Check in title/description
				if (pageText.includes(product.toLowerCase())) {
					score += 40;
				}
			});
		}

		// Category match (Enhanced)
		if (detectedCategory) {
			if (page.pageType === detectedCategory || 
			    page.pageType === `${detectedCategory}Provider` ||
			    page.pageType === `${detectedCategory}Menu`) {
				score += 60;
			}
		}

		// City match (Enhanced with detected city)
		if (detectedCity) {
			if (page.city === detectedCity) {
				score += 70; // Higher score for city match
			}
		}

		// General city keywords
		cities.forEach((city) => {
			city.variations.forEach((variation) => {
				if (lowerQuery.includes(variation.toLowerCase())) {
					if (page.city === city.name) {
						score += 40;
					}
				}
			});
		});

		// General relevance
		words.forEach((word) => {
			if (pageText.includes(word)) {
				score += 10;
			}
		});

		if (score > 0) {
			results.push({ ...page, score });
		}
	}

	// Sort by score (highest first)
	results.sort((a, b) => b.score - a.score);

	return {
		results,
		detectedCity,
		detectedProducts,
		detectedCategory
	};
}

/**
 * Generate enhanced response message with detected entities
 * @param {string} query - User query
 * @param {Object} searchData - Search results and detected entities
 * @returns {string} - Response message
 */
function generateResponseMessage(query, searchData) {
	const { results, detectedCity, detectedProducts, detectedCategory } = searchData;
	
	// Build context-aware message
	let message = '';
	
	// Add detected entities context
	const detections = [];
	if (detectedCity) detections.push(`📍 ${detectedCity}`);
	if (detectedProducts.length > 0) detections.push(`🛍️ ${detectedProducts.join(', ')}`);
	if (detectedCategory) {
		const categoryNames = {
			store: 'חנויות',
			service: 'שירותים',
			event: 'אירועים',
			course: 'קורסים',
			restaurant: 'מסעדות',
			courier: 'משלוחים'
		};
		detections.push(`🏷️ ${categoryNames[detectedCategory] || detectedCategory}`);
	}
	
	if (detections.length > 0) {
		message += `זיהיתי: ${detections.join(' • ')}\n\n`;
	}
	
	// Add results message
	if (results.length === 0) {
		message += 'מצטערת, לא מצאתי תוצאות מתאימות 😔\n\n';
		if (detectedCity || detectedProducts.length > 0) {
			message += 'נסה לחפש ללא העיר או המוצר הספציפי, או נסח אחרת!';
		} else {
			message += 'נסה לנסח אחרת או לחפש משהו אחר!';
		}
		return message;
	}

	if (results.length === 1) {
		message += `מצאתי בדיוק מה שחיפשת! 🎯`;
	} else if (results.length <= 3) {
		message += `מצאתי ${results.length} אפשרויות מעולות עבורך! ✨`;
	} else {
		message += `וואו! מצאתי ${results.length} תוצאות! הנה הכי רלוונטיות: 🔥`;
	}
	
	return message;
}

/** @type {import('./$types').RequestHandler} */
export async function POST({ request }) {
	try {
		const { message, allPages, context } = await request.json();

		if (!message || !allPages) {
			return json({ error: 'Missing required fields' }, { status: 400 });
		}

		// Perform enhanced smart search
		const searchData = smartSearch(message, allPages);

		// Generate context-aware response message
		const responseMessage = generateResponseMessage(message, searchData);

		return json({
			success: true,
			message: responseMessage,
			pages: searchData.results,
			count: searchData.results.length,
			detectedCity: searchData.detectedCity,
			detectedProducts: searchData.detectedProducts,
			detectedCategory: searchData.detectedCategory,
			context: context || 'general'
		});
	} catch (error) {
		console.error('Stav search error:', error);
		return json({ error: 'Search failed' }, { status: 500 });
	}
}
