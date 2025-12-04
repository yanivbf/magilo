// @ts-check
import { json } from '@sveltejs/kit';

/**
 * Detect if query is a general conversation/question
 * @param {string} query - User query
 * @returns {Object|null} - Response if it's a general question, null otherwise
 */
function handleGeneralConversation(query) {
	const lowerQuery = query.toLowerCase();
	
	// Greetings
	const greetings = ['שלום', 'היי', 'הי', 'בוקר טוב', 'ערב טוב', 'מה נשמע', 'מה קורה'];
	if (greetings.some(g => lowerQuery.includes(g))) {
		return {
			isGeneral: true,
			message: 'שלום! 👋 אני סתיו, העוזרת הדיגיטלית שלך. אני כאן כדי לעזור לך למצוא דפים, עסקים ושירותים במרקטפלייס. איך אוכל לעזור?'
		};
	}
	
	// How are you
	if (lowerQuery.includes('מה שלומך') || lowerQuery.includes('איך את')) {
		return {
			isGeneral: true,
			message: 'תודה ששאלת! 😊 אני פה ומוכנה לעזור. מה תרצה לחפש היום?'
		};
	}
	
	// Thank you
	if (lowerQuery.includes('תודה') || lowerQuery.includes('תודה רבה')) {
		return {
			isGeneral: true,
			message: 'בשמחה! 💜 אם יש לך עוד שאלות, אני כאן.'
		};
	}
	
	// General knowledge questions
	if (lowerQuery.includes('מה גודל ישראל') || lowerQuery.includes('שטח ישראל')) {
		return {
			isGeneral: true,
			message: 'ישראל היא מדינה קטנה אבל מדהימה! 🇮🇱 השטח שלה הוא כ-22,000 קמ"ר (כולל הגדה המערבית ורמת הגולן). אבל אני בעיקר מתמחה בעזרה למצוא עסקים ושירותים - מה תרצה לחפש?'
		};
	}
	
	if (lowerQuery.includes('מי את') || lowerQuery.includes('מי זאת סתיו')) {
		return {
			isGeneral: true,
			message: 'אני סתיו! 🤖 העוזרת הדיגיטלית החכמה של AutoPage. אני עוזרת לאנשים למצוא דפים, עסקים, מוצרים ושירותים במרקטפלייס. אני יכולה לחפש לפי עיר, מחיר, קטגוריה ועוד!'
		};
	}
	
	if (lowerQuery.includes('מה את יכולה') || lowerQuery.includes('איך את עובדת') || lowerQuery.includes('עזרה')) {
		return {
			isGeneral: true,
			message: 'אני יכולה לעזור לך למצוא:\n🏪 חנויות ועסקים\n🎉 אירועים\n🎓 קורסים\n🔧 בעלי מקצוע\n🍽️ מסעדות\n\nפשוט תגיד לי מה אתה מחפש, ואני אמצא את זה בשבילך! אפשר גם לחפש לפי עיר או מחיר.'
		};
	}
	
	// Jokes and fun
	if (lowerQuery.includes('בדיחה') || lowerQuery.includes('תצחיקי')) {
		return {
			isGeneral: true,
			message: 'למה המחשב הלך לרופא? כי היה לו וירוס! 😄\n\nאבל ברצינות, בוא נמצא משהו מעניין במרקטפלייס - מה תרצה לחפש?'
		};
	}
	
	// Weather (redirect to search)
	if (lowerQuery.includes('מזג אוויר') || lowerQuery.includes('מה מזג')) {
		return {
			isGeneral: true,
			message: 'אני לא יכולה לבדוק מזג אוויר, אבל אני מומחית במציאת עסקים ושירותים! 🌤️ מה תרצה לחפש?'
		};
	}
	
	// Compliments
	if (lowerQuery.includes('את מדהימה') || lowerQuery.includes('את נחמדה') || lowerQuery.includes('כל הכבוד')) {
		return {
			isGeneral: true,
			message: 'אוו תודה! 🥰 את/ה גם נחמד/ה! איך אוכל לעזור לך היום?'
		};
	}
	
	return null;
}

/**
 * Enhanced Smart Search with Product, City, Price & Gift Detection
 * Based on legacy Stav bot smart search logic
 * @param {string} query - User search query
 * @param {Array} pages - All available pages
 * @returns {Object} - Search results with detected entities
 */
function smartSearch(query, pages) {
	const lowerQuery = query.toLowerCase();
	const words = lowerQuery.split(/\s+/).filter((w) => w.length > 2);
	
	// Price detection
	let maxPrice = null;
	const pricePatterns = [
		/עד\s+(\d+)/,
		/מתחת\s+ל?-?(\d+)/,
		/פחות\s+מ?-?(\d+)/,
		/עד\s+₪?(\d+)/,
		/מקסימום\s+(\d+)/
	];
	
	for (const pattern of pricePatterns) {
		const match = lowerQuery.match(pattern);
		if (match) {
			maxPrice = parseInt(match[1]);
			break;
		}
	}
	
	// Gift detection with smart mapping
	const giftMapping = {
		'מתנה לילד': ['צעצוע', 'משחק', 'בובה', 'רכב', 'לגו'],
		'מתנה לילדה': ['בובה', 'צעצוע', 'משחק', 'תכשיט'],
		'מתנה לאמא': ['תכשיט', 'פרח', 'ספא', 'עיסוי', 'שעון'],
		'מתנה לאבא': ['שעון', 'כלי עבודה', 'ספורט', 'טכנולוגיה'],
		'מתנה לחבר': ['משחק', 'ספר', 'אוזניות', 'תכשיט'],
		'מתנה לחברה': ['תכשיט', 'פרח', 'שוקולד', 'קוסמטיקה']
	};
	
	let detectedGift = null;
	let giftCategories = [];
	for (const [giftType, categories] of Object.entries(giftMapping)) {
		if (lowerQuery.includes(giftType.toLowerCase())) {
			detectedGift = giftType;
			giftCategories = categories;
			break;
		}
	}

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

		// Gift category match (NEW - Smart gift detection)
		if (detectedGift && giftCategories.length > 0) {
			giftCategories.forEach((giftCat) => {
				// Check in products
				const hasGiftProduct = pageProducts.some((p) => 
					p.name && p.name.toLowerCase().includes(giftCat.toLowerCase())
				);
				if (hasGiftProduct) {
					score += 90; // Very high score for gift match
				}
				// Check in title/description
				if (pageText.includes(giftCat.toLowerCase())) {
					score += 45;
				}
			});
		}

		// Product match (High priority)
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
			} else if (page.city && page.city !== detectedCity) {
				// Penalize wrong city
				score -= 30;
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
			results.push({ ...page, score, products: pageProducts });
		}
	}

	// Sort by score (highest first)
	results.sort((a, b) => b.score - a.score);
	
	// Filter by price if detected
	let filteredResults = results;
	if (maxPrice !== null) {
		filteredResults = results.map(page => {
			// Filter products by price
			const affordableProducts = (page.products || []).filter(p => {
				const price = parseFloat(p.price);
				return !isNaN(price) && price <= maxPrice;
			});
			
			// If page has products, only keep if some are affordable
			if (page.products && page.products.length > 0) {
				if (affordableProducts.length > 0) {
					return { ...page, products: affordableProducts, priceFiltered: true };
				}
				return null; // Skip pages with no affordable products
			}
			
			// For pages without products, keep them
			return page;
		}).filter(Boolean);
	}

	return {
		results: filteredResults,
		detectedCity,
		detectedProducts,
		detectedCategory,
		detectedGift,
		maxPrice
	};
}

/**
 * Generate enhanced response message with detected entities
 * @param {string} query - User query
 * @param {Object} searchData - Search results and detected entities
 * @returns {string} - Response message
 */
function generateResponseMessage(query, searchData) {
	const { results, detectedCity, detectedProducts, detectedCategory, detectedGift, maxPrice } = searchData;
	
	// Build context-aware message
	let message = '';
	
	// Add detected entities context
	const detections = [];
	if (detectedGift) detections.push(`🎁 ${detectedGift}`);
	if (maxPrice) detections.push(`💰 עד ₪${maxPrice}`);
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
		if (maxPrice) {
			message += `לא מצאתי מוצרים עד ₪${maxPrice}. נסה להגדיל את התקציב!`;
		} else if (detectedCity) {
			message += `לא מצאתי תוצאות ב${detectedCity}. נסה עיר אחרת או חיפוש כללי יותר!`;
		} else if (detectedGift) {
			message += 'נסה לנסח אחרת, למשל "צעצועים" או "תכשיטים"';
		} else if (detectedProducts.length > 0) {
			message += 'נסה לחפש ללא המוצר הספציפי, או נסח אחרת!';
		} else {
			message += 'נסה לנסח אחרת או לחפש משהו אחר!';
		}
		return message;
	}

	// Smart response based on context
	if (detectedGift) {
		message += `מצאתי ${results.length} רעיונות מעולים ${detectedGift}! 🎁✨`;
	} else if (maxPrice) {
		const totalProducts = results.reduce((sum, page) => sum + (page.products?.length || 0), 0);
		if (totalProducts > 0) {
			message += `מצאתי ${totalProducts} מוצרים עד ₪${maxPrice} ב-${results.length} חנויות! 💰`;
		} else {
			message += `מצאתי ${results.length} אפשרויות בתקציב שלך! 💰`;
		}
	} else if (results.length === 1) {
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

		// First, try smart search for marketplace queries
		const searchData = smartSearch(message, allPages);
		
		// If we found results, return them
		if (searchData.results.length > 0) {
			const responseMessage = generateResponseMessage(message, searchData);
			return json({
				success: true,
				message: responseMessage,
				pages: searchData.results,
				count: searchData.results.length,
				detectedCity: searchData.detectedCity,
				detectedProducts: searchData.detectedProducts,
				detectedCategory: searchData.detectedCategory,
				detectedGift: searchData.detectedGift,
				maxPrice: searchData.maxPrice,
				context: context || 'general'
			});
		}

		// No results from search - send to N8N for intelligent response
		console.log('🤖 No search results, sending to N8N for AI response');
		
		const N8N_WEBHOOK_URL = 'https://n8n-service-how4.onrender.com/webhook/jhfuhgufkhlkuho8erhf757754jhldkbsjkbmreketpg';
		
		try {
			const n8nResponse = await fetch(N8N_WEBHOOK_URL, {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({
					message: message,
					pages: allPages.slice(0, 10), // Send top 10 pages for context
					context: context || 'marketplace-chat'
				})
			});

			if (n8nResponse.ok) {
				const n8nData = await n8nResponse.json();
				console.log('✅ N8N response received');
				
				// Extract message from various possible formats
				const aiMessage = n8nData.message || n8nData.response || n8nData.text || 'מצטערת, לא הצלחתי להבין את השאלה';
				
				return json({
					success: true,
					message: aiMessage,
					pages: n8nData.pages || [],
					count: (n8nData.pages || []).length,
					isAI: true,
					context: context || 'general'
				});
			} else {
				console.error('❌ N8N webhook error:', n8nResponse.status);
				// Fallback to general conversation
				const generalResponse = handleGeneralConversation(message);
				if (generalResponse) {
					return json({
						success: true,
						message: generalResponse.message,
						pages: [],
						count: 0,
						isGeneral: true,
						context: context || 'general'
					});
				}
			}
		} catch (n8nError) {
			console.error('❌ N8N request failed:', n8nError);
			// Fallback to general conversation
			const generalResponse = handleGeneralConversation(message);
			if (generalResponse) {
				return json({
					success: true,
					message: generalResponse.message,
					pages: [],
					count: 0,
					isGeneral: true,
					context: context || 'general'
				});
			}
		}

		// Final fallback
		return json({
			success: true,
			message: 'מצטערת, לא מצאתי תוצאות. נסה לנסח אחרת או שאל משהו אחר! 😊',
			pages: [],
			count: 0,
			context: context || 'general'
		});
		
	} catch (error) {
		console.error('Stav search error:', error);
		return json({ error: 'Search failed' }, { status: 500 });
	}
}
