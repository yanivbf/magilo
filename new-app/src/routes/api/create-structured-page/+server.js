// @ts-check
import { json } from '@sveltejs/kit';
import { createPage, createSection, createProduct } from '$lib/server/strapi.js';
import { generateSlug } from '$lib/server/htmlGenerator.js';
import { validatePageData, isRateLimited, sanitizeHtml } from '$lib/server/security.js';

/**
 * POST /api/create-structured-page
 * Create a new page with structured data (NO HTML)
 * @type {import('./$types').RequestHandler}
 */
export async function POST({ request, getClientAddress }) {
	try {
		// Rate limiting
		const clientIp = getClientAddress();
		if (isRateLimited(clientIp, 20, 60000)) {
			return json({ error: 'Too many requests' }, { status: 429 });
		}
		
		const body = await request.json();
		console.log('🔍 CREATE STRUCTURED PAGE REQUEST:', JSON.stringify(body).substring(0, 300));

		// Extract data
		const userId = body.userId || body.user_id;
		const pageData = body.formData || body.pageData || body.data || body;
		const pageType = body.pageType || pageData.pageType;
		const optionalSections = body.optionalSections || [];
		
		// Validate
		const validation = validatePageData(pageData);
		if (!validation.valid) {
			return json({ 
				error: 'Invalid page data', 
				details: validation.errors 
			}, { status: 400 });
		}
		
		Object.assign(pageData, validation.sanitized);
		
		// Generate userId if needed
		let finalUserId = userId;
		if (!finalUserId || finalUserId === 'temp_user') {
			finalUserId = 'user_' + Date.now() + '_' + Math.random().toString(36).substring(2, 9);
			console.log('🆕 Generated new userId:', finalUserId);
		}

		if (!pageData.mainName) {
			return json({ error: 'Missing mainName' }, { status: 400 });
		}
		
		const title = pageData.mainName || pageData.title || 'Untitled';
		const slug = generateSlug(title, finalUserId);
		
		// Normalize pageType - convert 'onlineStore' to 'store' (MUST BE BEFORE metadata)
		const normalizedPageType = pageType === 'onlineStore' ? 'store' : pageType;
		
		console.log('📝 Creating structured page:', { title, slug, pageType: normalizedPageType, userId: finalUserId });

		// Build metadata with default header image based on page type
		const defaultHeaderImages = {
			'store': 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?q=80&w=2070&auto=format&fit=crop',
			'service': 'https://images.unsplash.com/photo-1497366216548-37526070297c?q=80&w=2069&auto=format&fit=crop',
			'event': 'https://images.unsplash.com/photo-1492684223066-81342ee5ff30?q=80&w=2070&auto=format&fit=crop',
			'artist': 'https://images.unsplash.com/photo-1460661419201-fd4cecdf8a8b?q=80&w=2080&auto=format&fit=crop',
			'course': 'https://images.unsplash.com/photo-1524178232363-1fb2b075b655?q=80&w=2070&auto=format&fit=crop',
			'workshop': 'https://images.unsplash.com/photo-1552664730-d307ca884978?q=80&w=2070&auto=format&fit=crop',
			'restaurant': 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?q=80&w=2070&auto=format&fit=crop'
		};
		
		const metadata = {
			videoUrl: pageData.youtubeLink || pageData.videoUrl || pageData.video || '',
			embedYoutubeVideo: pageData.embedYoutubeVideo || false,
			headerImage: pageData.headerImage || defaultHeaderImages[normalizedPageType] || 'https://images.unsplash.com/photo-1557804506-669a67965ba0?q=80&w=2074',
			socialLinks: {
				facebook: pageData.facebookLink || pageData.facebook || '',
				instagram: pageData.instagramLink || pageData.instagram || '',
				whatsapp: pageData.whatsappLink || pageData.whatsapp || pageData.phone || '',
				youtube: pageData.youtubeLink || pageData.youtube || '',
				tiktok: pageData.tiktokLink || pageData.tiktok || '',
				linkedin: pageData.linkedinLink || pageData.linkedin || '',
				twitter: pageData.twitterLink || pageData.twitter || ''
			}
		};
		
		// Create page in Strapi (minimal HTML content for schema requirement)
		const pageResult = await createPage({
			title,
			slug,
			htmlContent: '<div>Structured page - content managed via sections</div>', // Minimal content to satisfy schema
			pageType: normalizedPageType,
			phone: pageData.phone || '',
			email: pageData.email || '',
			city: pageData.city || '',
			address: pageData.address || '',
			description: pageData.description || '',
			metadata: metadata,
			isActive: true,
			userId: finalUserId
		});

		if (!pageResult) {
			throw new Error('Failed to create page in database');
		}

		console.log('✅ Page created with ID:', pageResult.id, 'documentId:', pageResult.documentId);
		const pageId = pageResult.documentId || pageResult.id;

		// Define preferred section order
		const sectionOrderMap = {
			about: 0,
			products: 1,
			gallery: 2,
			services: 3,
			pricing: 4,
			team: 5,
			video: 6,
			testimonials: 7,
			faq: 8
		};

		// Helper function to get order for section type
		const getSectionOrder = (type) => sectionOrderMap[type] ?? 99;

		// Create sections based on optionalSections
		// 1. Video Section - Create if embedYoutubeVideo is checked OR if 'video' is in optionalSections
		if (pageData.embedYoutubeVideo || optionalSections.includes('video')) {
			const videoUrl = pageData.youtubeLink || metadata.videoUrl || '';
			if (videoUrl) {
				console.log('📝 Creating Video section with URL:', videoUrl);
				await createSection({
					type: 'video',
					enabled: true,
					order: getSectionOrder('video'),
					data: {
						title: '🎥 סרטון',
						subtitle: 'צפו בסרטון שלנו',
						videoUrl: videoUrl,
						description: 'סרטון המציג את העסק שלנו'
					},
					page: pageId
				});
			}
		}

		// 2. About Section
		if (optionalSections.includes('about')) {
			console.log('📝 Creating About section');
			await createSection({
				type: 'about',
				enabled: true,
				order: getSectionOrder('about'),
				data: {
					title: 'אודותינו',
					content: pageData.aboutText || pageData.description || 'תיאור העסק שלנו',
					image: pageData.headerImage || '',
					features: [
						{ icon: '🎯', title: 'מקצועיות', text: 'צוות מקצועי ומנוסה' },
						{ icon: '⚡', title: 'מהירות', text: 'שירות מהיר ויעיל' },
						{ icon: '💎', title: 'איכות', text: 'איכות ללא פשרות' }
					]
				},
				page: pageId
			});
		}

		// 3. Services Section
		if (optionalSections.includes('services')) {
			console.log('📝 Creating Services section');
			await createSection({
				type: 'services',
				enabled: true,
				order: getSectionOrder('services'),
				data: {
					title: '🛠️ השירותים שלנו',
					subtitle: 'מגוון שירותים איכותיים',
					services: [
						{ icon: '🔧', title: 'שירות 1', description: 'תיאור השירות', price: '₪150' },
						{ icon: '⚙️', title: 'שירות 2', description: 'תיאור השירות', price: '₪200' },
						{ icon: '🛠️', title: 'שירות 3', description: 'תיאור השירות', price: '₪250' }
					]
				},
				page: pageId
			});
		}

		// 4. Pricing Section
		if (optionalSections.includes('pricing')) {
			console.log('📝 Creating Pricing section');
			await createSection({
				type: 'pricing',
				enabled: true,
				order: getSectionOrder('pricing'),
				data: {
					title: '💰 מחירון',
					subtitle: 'בחר את החבילה המתאימה לך',
					plans: [
						{
							name: 'בסיסי',
							price: '₪99',
							period: 'לחודש',
							features: ['תכונה 1', 'תכונה 2', 'תכונה 3'],
							highlighted: false
						},
						{
							name: 'מתקדם',
							price: '₪199',
							period: 'לחודש',
							features: ['כל התכונות הבסיסיות', 'תכונה 4', 'תכונה 5', 'תכונה 6'],
							highlighted: true
						},
						{
							name: 'מקצועי',
							price: '₪299',
							period: 'לחודש',
							features: ['כל התכונות המתקדמות', 'תכונה 7', 'תכונה 8', 'תמיכה 24/7'],
							highlighted: false
						}
					]
				},
				page: pageId
			});
		}

		// 5. Gallery Section
		if (optionalSections.includes('gallery')) {
			console.log('📝 Creating Gallery section');
			const galleryImages = pageData.gallery || [
				'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?q=80&w=2070',
				'https://images.unsplash.com/photo-1523275335684-37898b6baf30?q=80&w=2099',
				'https://images.unsplash.com/photo-1572635196237-14b3f281503f?q=80&w=2080',
				'https://images.unsplash.com/photo-1560343090-f0409e92791a?q=80&w=2064',
				'https://images.unsplash.com/photo-1491553895911-0055eca6402d?q=80&w=2080',
				'https://images.unsplash.com/photo-1542291026-7eec264c27ff?q=80&w=2070'
			];
			
			await createSection({
				type: 'gallery',
				enabled: true,
				order: getSectionOrder('gallery'),
				data: {
					title: 'גלריית תמונות',
					subtitle: 'הציצו בעבודות שלנו ותתרשמו בעצמכם',
					images: galleryImages
				},
				page: pageId
			});
		}

		// 6. Products Section (for stores)
		if (normalizedPageType === 'store') {
			console.log('🛍️ Creating Products section');
			
			// Get products from pageData or generate sample products
			let products = pageData.products || [];
			if (products.length === 0) {
				const productCount = parseInt(pageData.productCount) || 6;
				products = generateSampleProducts(productCount);
			}
			
			// Create each product in Strapi
			for (let i = 0; i < products.length; i++) {
				const product = products[i];
				await createProduct({
					name: product.name || `מוצר ${i + 1}`,
					description: product.description || 'תיאור המוצר',
					price: product.price || 99,
					image: product.image || `https://placehold.co/400x400/667eea/white?text=מוצר+${i + 1}`,
					enabled: true,
					order: i,
					page: pageId
				});
			}
			
			// Create products section
			await createSection({
				type: 'products',
				enabled: true,
				order: getSectionOrder('products'),
				data: {
					title: 'המוצרים שלנו',
					subtitle: 'בחר מוצר והוסף לעגלה'
				},
				page: pageId
			});
		}

		// 7. Team Section
		if (optionalSections.includes('team')) {
			console.log('📝 Creating Team section');
			await createSection({
				type: 'team',
				enabled: true,
				order: getSectionOrder('team'),
				data: {
					title: '👥 הצוות שלנו',
					subtitle: 'הכירו את האנשים שלנו',
					members: [
						{ name: 'יוסי כהן', role: 'מנכ"ל', bio: 'מנהיג הצוות עם ניסיון של 10 שנים', image: '' },
						{ name: 'שרה לוי', role: 'מנהלת שיווק', bio: 'מומחית בשיווק דיגיטלי', image: '' },
						{ name: 'דוד ישראלי', role: 'מפתח ראשי', bio: 'מפתח מנוסה עם תשוקה לטכנולוגיה', image: '' }
					]
				},
				page: pageId
			});
		}

		// 8. Testimonials Section
		if (optionalSections.includes('testimonials')) {
			console.log('📝 Creating Testimonials section');
			const testimonials = pageData.testimonials || [
				{
					name: 'לקוח מרוצה',
					text: 'שירות מעולה! ממליץ בחום',
					rating: 5,
					image: 'https://i.pravatar.cc/150?img=1'
				},
				{
					name: 'לקוחה מרוצה',
					text: 'חוויה נהדרת, בהחלט אחזור',
					rating: 5,
					image: 'https://i.pravatar.cc/150?img=2'
				},
				{
					name: 'לקוח נאמן',
					text: 'המקום הכי טוב בעיר!',
					rating: 5,
					image: 'https://i.pravatar.cc/150?img=3'
				}
			];
			
			await createSection({
				type: 'testimonials',
				enabled: true,
				order: getSectionOrder('testimonials'),
				data: {
					title: 'מה אומרים עלינו',
					subtitle: 'לקוחות מרוצים משתפים את החוויה שלהם',
					items: testimonials
				},
				page: pageId
			});
		}

		// 9. FAQ Section
		if (optionalSections.includes('faq')) {
			console.log('📝 Creating FAQ section');
			const faqItems = pageData.faq || [
				{
					question: 'איך אני מזמין?',
					answer: 'פשוט לחץ על המוצר הרצוי והוסף אותו לעגלה. לאחר מכן עבור לתשלום.'
				},
				{
					question: 'כמה זמן לוקח המשלוח?',
					answer: 'המשלוח לוקח בין 2-5 ימי עסקים, תלוי במיקום.'
				},
				{
					question: 'האם יש אחריות על המוצרים?',
					answer: 'כן, יש אחריות של שנה על כל המוצרים.'
				}
			];
			
			await createSection({
				type: 'faq',
				enabled: true,
				order: getSectionOrder('faq'),
				data: {
					title: 'שאלות ותשובות',
					subtitle: 'תשובות לשאלות הנפוצות ביותר',
					items: faqItems
				},
				page: pageId
			});
		}

		// 10. Contact Section (always add if there's contact info)
		if (pageData.phone || pageData.email || pageData.address || Object.values(metadata.socialLinks).some(link => link)) {
			console.log('📝 Creating Contact section');
			await createSection({
				type: 'contact',
				enabled: true,
				order: 99, // Contact always last
				data: {
					title: '📞 צור קשר',
					phone: pageData.phone || '',
					email: pageData.email || '',
					address: pageData.address || '',
					socialLinks: metadata.socialLinks
				},
				page: pageId
			});
		}

		console.log('✅ Page created successfully');

		return json({
			success: true,
			pageId: pageResult.id,
			documentId: pageId,
			slug: slug,
			pageUrl: `/view/${slug}` // Redirect directly to view page (full page with all sections)
		});

	} catch (error) {
		console.error('❌ Error creating structured page:', error);
		return json(
			{ 
				success: false,
				error: error instanceof Error ? error.message : 'Failed to create page'
			},
			{ status: 500 }
		);
	}
}

/**
 * Generate sample products for store pages
 */
function generateSampleProducts(count = 6) {
	const products = [];
	const productNames = [
		'מוצר מעולה 1',
		'מוצר איכותי 2', 
		'מוצר מומלץ 3',
		'מוצר פופולרי 4',
		'מוצר חדש 5',
		'מוצר מיוחד 6',
		'מוצר נבחר 7',
		'מוצר מדהים 8',
		'מוצר ייחודי 9',
		'מוצר נהדר 10',
		'מוצר משתלם 11',
		'מוצר מושלם 12'
	];
	
	for (let i = 0; i < count; i++) {
		products.push({
			name: productNames[i] || `מוצר ${i + 1}`,
			description: 'תיאור המוצר - ערוך אותי בדף הניהול',
			price: (i + 1) * 50 + 49,
			image: `https://placehold.co/400x400/667eea/white?text=מוצר+${i + 1}`
		});
	}
	
	return products;
}
