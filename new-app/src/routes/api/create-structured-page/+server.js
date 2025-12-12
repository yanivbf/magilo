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
export async function POST({ request, getClientAddress, cookies }) {
	try {
		// Rate limiting
		const clientIp = getClientAddress();
		if (isRateLimited(clientIp, 20, 60000)) {
			return json({ error: 'Too many requests' }, { status: 429 });
		}
		
		const body = await request.json();
		console.log('🔍 CREATE STRUCTURED PAGE REQUEST:', JSON.stringify(body).substring(0, 300));

		// Extract data
		const userIdFromBody = body.userId || body.user_id;
		const userIdFromCookie = cookies.get('userId');
		const userId = userIdFromBody || userIdFromCookie; // CRITICAL: Get from body first, then cookies
		const pageData = body.formData || body.pageData || body.data || body;
		const pageType = body.pageType || pageData.pageType;
		const optionalSections = body.optionalSections || [];
		const selectedStyle = body.style || pageData.style || 'Modern'; // Get selected style
		
		// ✅ CRITICAL FIX: Get designStyle from multiple possible locations
		const designStyle = body.designStyle || pageData.designStyle || body.data?.designStyle || 'modern';
		console.log('🎨 DESIGN STYLE EXTRACTION:');
		console.log('   - body.designStyle:', body.designStyle);
		console.log('   - pageData.designStyle:', pageData.designStyle);
		console.log('   - body.data?.designStyle:', body.data?.designStyle);
		console.log('   - FINAL designStyle:', designStyle);
		
		console.log('🎨 DESIGN STYLE DEBUG:');
		console.log('   - body.designStyle:', body.designStyle);
		console.log('   - pageData.designStyle:', pageData.designStyle);
		console.log('   - body.data?.designStyle:', body.data?.designStyle);
		console.log('   - Final designStyle:', designStyle);
		
		console.log('🔍 USER ID DEBUG:');
		console.log('   - From body:', userIdFromBody);
		console.log('   - From cookie:', userIdFromCookie);
		console.log('   - Final userId:', userId);
		
		// CRITICAL DEBUG: Log optional sections
		console.log('🔍 OPTIONAL SECTIONS DEBUG:');
		console.log('   - Received optionalSections:', optionalSections);
		console.log('   - Is array?', Array.isArray(optionalSections));
		console.log('   - Length:', optionalSections.length);
		console.log('   - Includes FAQ?', optionalSections.includes('faq'));
		console.log('   - All sections:', optionalSections.join(', '));
		
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
		
		// Normalize pageType - convert frontend types to Strapi enum values (MUST BE BEFORE metadata)
		const pageTypeMap = {
			'onlineStore': 'store',
			'service': 'serviceProvider',
			'restaurant': 'restaurantMenu',
			'artist': 'generic',
			'message': 'messageInBottle'
		};
		const normalizedPageType = pageTypeMap[pageType] || pageType;
		
		console.log('🔍 CRITICAL DEBUG - Before createPage():');
		console.log('   - title:', title);
		console.log('   - slug:', slug);
		console.log('   - pageType:', normalizedPageType);
		console.log('   - userId:', finalUserId);
		console.log('📝 Creating structured page:', { title, slug, pageType: normalizedPageType, userId: finalUserId });

		// NO NEED for Strapi user relation - we use userId string field instead
		console.log('📝 Will create page with userId:', finalUserId);

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
			createdByUserId: finalUserId, // CRITICAL: Store creator ID for ownership check
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
		// IMPORTANT: Do NOT save userId here - page should not appear in dashboard until user clicks "שמור לאזור שלי"
		// Instead, save createdByUserId in metadata for temporary ownership (allows editing before saving)
		const pageResult = await createPage({
			title,
			slug,
			htmlContent: '<div>Structured page - content managed via sections</div>', // Minimal content to satisfy schema
			pageType: normalizedPageType,
			phone: pageData.phone || '',
			email: pageData.email || '',
			address: pageData.address || '',
			description: pageData.description || '',
			designStyle: designStyle, // Save design style for dynamic theming
			metadata: metadata,
			isActive: true
			// NOTE: userId is NOT set here - will be set when user clicks "שמור לאזור שלי"
			// Temporary ownership is tracked via metadata.createdByUserId
		});

		if (!pageResult) {
			throw new Error('Failed to create page in database');
		}

		console.log('✅ Page created with ID:', pageResult.id, 'documentId:', pageResult.documentId);
		const pageId = pageResult.documentId || pageResult.id;

		// 🤖 Generate AI content for sections if business name is provided
		let aiGeneratedContent = null;
		if (pageData.mainName && optionalSections.length > 0) {
			console.log('🤖 Requesting AI content generation from N8N...');
			console.log('📤 Sending to N8N:', { businessName: pageData.mainName, sections: optionalSections });
			try {
				const n8nResponse = await fetch('https://n8n-service-how4.onrender.com/webhook/jhfuhgufkhlkuho8erhfaadsgdrghre546yrthfg12w23', {
					method: 'POST',
					headers: { 'Content-Type': 'application/json' },
					body: JSON.stringify({
						action: 'generate_content',
						businessName: pageData.mainName,
						serviceType: normalizedPageType,
						description: pageData.description || '',
						phone: pageData.phone || '',
						email: pageData.email || '',
						address: pageData.address || '',
						sections: optionalSections.join(', ')
					})
				});
				
				if (n8nResponse.ok) {
					// Get response as text first to clean it
					let responseText = await n8nResponse.text();
					console.log('📥 N8N Response (raw, first 300 chars):', responseText.substring(0, 300));
					
					// Try to parse the initial response
					let n8nData;
					try {
						n8nData = JSON.parse(responseText);
						console.log('✅ Successfully parsed initial N8N response');
						console.log('📥 N8N Response structure:', Array.isArray(n8nData) ? 'Array' : 'Object');
						console.log('📥 N8N Response keys:', Object.keys(n8nData));
					} catch (parseError) {
						console.error('❌ Failed to parse initial N8N response:', parseError);
						throw new Error('Invalid JSON from N8N: ' + parseError.message);
					}
					
					// N8N returns an array with an object that has an "output" field
					// Example: [{"output": "```json\n{...}\n```"}]
					let contentJson;
					
					if (Array.isArray(n8nData) && n8nData.length > 0 && n8nData[0].output) {
						console.log('🔍 N8N returned array with output field');
						let outputText = n8nData[0].output;
						console.log('📥 Output field (first 300 chars):', outputText.substring(0, 300));
						
						// Remove markdown code blocks (```json and ```)
						outputText = outputText
							.replace(/```json\s*/g, '')  // Remove ```json
							.replace(/```\s*/g, '')      // Remove ```
							.replace(/\\n/g, ' ')        // Replace \n with space
							.replace(/\n/g, ' ')         // Replace actual newlines with space
							.replace(/\s+/g, ' ')        // Replace multiple spaces with single space
							.trim();
						
						console.log('📥 Cleaned output (first 300 chars):', outputText.substring(0, 300));
						
						try {
							contentJson = JSON.parse(outputText);
							console.log('✅ Successfully parsed content JSON from output field');
						} catch (parseError) {
							console.error('❌ Failed to parse content JSON:', parseError);
							console.error('📋 Output text (first 500 chars):', outputText.substring(0, 500));
							throw new Error('Invalid content JSON: ' + parseError.message);
						}
					} else if (n8nData.faq || n8nData.gallery || n8nData.testimonials) {
						// Direct format (no output wrapper)
						console.log('🔍 N8N returned direct format');
						contentJson = n8nData;
					} else {
						console.error('❌ Unexpected N8N response format');
						console.error('📋 Response:', JSON.stringify(n8nData).substring(0, 500));
						throw new Error('Unexpected N8N response format');
					}
					
					console.log('📥 Content JSON keys:', Object.keys(contentJson));
					console.log('📥 Content JSON (first 800 chars):', JSON.stringify(contentJson, null, 2).substring(0, 800));
					
					// The bot returns: { faq: [...], faqSubtitle: "...", gallery: [...], testimonials: [...], aboutText: "...", services: [...] }
					if (contentJson.faq || contentJson.gallery || contentJson.testimonials || contentJson.aboutText || contentJson.services) {
						aiGeneratedContent = {
							faq: contentJson.faq || [],
							faqSubtitle: contentJson.faqSubtitle || '',
							gallery: contentJson.gallery || [],
							testimonials: contentJson.testimonials || [],
							aboutText: contentJson.aboutText || '',
							services: contentJson.services || []
						};
						console.log('✅ AI content received from N8N and stored in aiGeneratedContent');
						console.log('📋 FAQ items:', aiGeneratedContent.faq.length);
						console.log('📋 FAQ subtitle:', aiGeneratedContent.faqSubtitle);
						console.log('📋 Gallery images:', aiGeneratedContent.gallery.length);
						console.log('📋 Testimonials:', aiGeneratedContent.testimonials.length);
						console.log('📋 Services:', aiGeneratedContent.services.length);
						console.log('📋 About text length:', aiGeneratedContent.aboutText.length);
						
						// Log first item of each array for verification
						if (aiGeneratedContent.faq.length > 0) {
							console.log('📋 First FAQ:', JSON.stringify(aiGeneratedContent.faq[0]));
						}
						if (aiGeneratedContent.testimonials.length > 0) {
							console.log('📋 First Testimonial:', JSON.stringify(aiGeneratedContent.testimonials[0]));
						}
					} else {
						console.warn('⚠️ N8N response missing expected fields');
						console.log('📋 Available fields:', Object.keys(contentJson));
						console.log('📋 Full response:', JSON.stringify(contentJson));
					}
				} else {
					console.warn('⚠️ N8N returned error:', n8nResponse.status);
					const errorText = await n8nResponse.text();
					console.warn('⚠️ Error details:', errorText);
				}
			} catch (error) {
				console.warn('⚠️ AI content generation failed, using defaults:', error.message);
			}
		}

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

		// Create sections based on optionalSections - ALL WITH AWAIT to ensure page is fully ready
		console.log('📝 Creating sections for page...');
		
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
						title: 'סרטון',
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
			const aboutText = aiGeneratedContent?.aboutText || pageData.aboutText || pageData.description || 'תיאור העסק שלנו';
			console.log('🔍 About text from AI:', aboutText.substring(0, 100) + '...');
			
			// Create a concise subtitle from the about text (first sentence or first 100 chars)
			let subtitle = '';
			if (aboutText) {
				// Try to get first sentence
				const firstSentence = aboutText.split(/[.!?]/)[0];
				if (firstSentence && firstSentence.length > 20 && firstSentence.length < 150) {
					subtitle = firstSentence.trim();
				} else if (aboutText.length > 100) {
					// Take first 100 chars and add ellipsis
					subtitle = aboutText.substring(0, 100).trim() + '...';
				}
			}
			
			await createSection({
				type: 'about',
				enabled: true,
				order: getSectionOrder('about'),
				data: {
					title: 'אודותינו',
					subtitle: subtitle,
					content: aboutText,
					image: pageData.headerImage || ''
				},
				page: pageId
			});
		}

		// 3. Services Section
		if (optionalSections.includes('services')) {
			console.log('📝 Creating Services section');
			const services = aiGeneratedContent?.services || [
				{ icon: '⚡', name: 'שירות 1', description: 'תיאור השירות', price: 150, duration: 60 },
				{ icon: '⚡', name: 'שירות 2', description: 'תיאור השירות', price: 200, duration: 90 },
				{ icon: '⚡', name: 'שירות 3', description: 'תיאור השירות', price: 250, duration: 120 }
			];
			console.log('🔍 Services from AI:', services.length, 'items');
			await createSection({
				type: 'services',
				enabled: true,
				order: getSectionOrder('services'),
				data: {
					title: 'השירותים שלנו',
					subtitle: 'מגוון שירותים איכותיים',
					services: services.map(s => ({
						icon: s.icon || '⚡',
						title: s.name || s.title,
						description: s.description,
						price: `₪${s.price}`
					}))
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
					title: 'מחירון',
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
			console.log('🔍 AI Generated Content available?', !!aiGeneratedContent);
			console.log('🔍 AI Gallery data:', aiGeneratedContent?.gallery);
			
			const galleryImages = aiGeneratedContent?.gallery || pageData.gallery || [
				'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?q=80&w=2070',
				'https://images.unsplash.com/photo-1523275335684-37898b6baf30?q=80&w=2099',
				'https://images.unsplash.com/photo-1572635196237-14b3f281503f?q=80&w=2080',
				'https://images.unsplash.com/photo-1560343090-f0409e92791a?q=80&w=2064',
				'https://images.unsplash.com/photo-1491553895911-0055eca6402d?q=80&w=2080',
				'https://images.unsplash.com/photo-1542291026-7eec264c27ff?q=80&w=2070'
			];
			console.log('🔍 Gallery images to save:', galleryImages.length, 'images');
			console.log('🔍 First image:', galleryImages[0]);
			
			const gallerySectionData = {
				type: 'gallery',
				enabled: true,
				order: getSectionOrder('gallery'),
				data: {
					title: 'גלריית תמונות',
					subtitle: 'הציצו בעבודות שלנו ותתרשמו בעצמכם',
					images: galleryImages
				},
				page: pageId
			};
			
			console.log('📤 Sending Gallery section to Strapi');
			const galleryResult = await createSection(gallerySectionData);
			console.log('✅ Gallery section created:', galleryResult?.id);
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
			
			// Create each product in Strapi - AWAIT ALL
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
			console.log('📝 Creating Team section with style:', selectedStyle);
			await createSection({
				type: 'team',
				enabled: true,
				order: getSectionOrder('team'),
				data: {
					title: 'הצוות שלנו',
					subtitle: 'הכירו את האנשים שלנו',
					style: selectedStyle,
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
			console.log('🔍 AI Generated Content available?', !!aiGeneratedContent);
			console.log('🔍 AI Testimonials data:', aiGeneratedContent?.testimonials);
			
			const testimonials = aiGeneratedContent?.testimonials || pageData.testimonials || [
				{
					name: 'לקוח מרוצה',
					text: 'שירות מעולה! ממליץ בחום',
					role: 'לקוח',
					rating: 5,
					image: 'https://i.pravatar.cc/150?img=1'
				},
				{
					name: 'לקוחה מרוצה',
					text: 'חוויה נהדרת, בהחלט אחזור',
					role: 'לקוחה',
					rating: 5,
					image: 'https://i.pravatar.cc/150?img=2'
				},
				{
					name: 'לקוח נאמן',
					text: 'המקום הכי טוב בעיר!',
					role: 'לקוח קבוע',
					rating: 5,
					image: 'https://i.pravatar.cc/150?img=3'
				}
			];
			console.log('🔍 Testimonials to save:', testimonials.length, 'items');
			console.log('🔍 First testimonial:', JSON.stringify(testimonials[0]));
			
			const testimonialsSectionData = {
				type: 'testimonials',
				enabled: true,
				order: getSectionOrder('testimonials'),
				data: {
					title: 'מה אומרים עלינו',
					subtitle: 'לקוחות מרוצים משתפים את החוויה שלהם',
					style: selectedStyle,
					items: testimonials
				},
				page: pageId
			};
			
			console.log('📤 Sending Testimonials section to Strapi');
			const testimonialsResult = await createSection(testimonialsSectionData);
			console.log('✅ Testimonials section created:', testimonialsResult?.id);
		}

		// 9. FAQ Section - ONLY IF SELECTED
		if (optionalSections.includes('faq')) {
			console.log('📝 Creating FAQ section');
			console.log('🔍 AI Generated Content available?', !!aiGeneratedContent);
			console.log('🔍 AI FAQ data:', aiGeneratedContent?.faq);
			console.log('🔍 AI FAQ subtitle:', aiGeneratedContent?.faqSubtitle);
			
			const faqItems = aiGeneratedContent?.faq || pageData.faq || [
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
			
			// Get contextual subtitle from AI or use default
			const faqSubtitle = aiGeneratedContent?.faqSubtitle || 'תשובות לשאלות הנפוצות ביותר';
			
			console.log('🔍 FAQ items to save:', faqItems.length, 'items');
			console.log('🔍 FAQ subtitle to save:', faqSubtitle);
			console.log('🔍 First FAQ item:', JSON.stringify(faqItems[0]));
			
			const faqSectionData = {
				type: 'faq',
				enabled: true,
				order: getSectionOrder('faq'),
				data: {
					title: 'שאלות ותשובות',
					subtitle: faqSubtitle,
					style: selectedStyle,
					items: faqItems
				},
				page: pageId
			};
			
			console.log('📤 Sending FAQ section to Strapi:', JSON.stringify(faqSectionData).substring(0, 500));
			const faqResult = await createSection(faqSectionData);
			console.log('✅ FAQ section created:', faqResult?.id);
		} else {
			console.log('⏭️ FAQ section NOT selected - skipping');
		}

		// 10. Contact Section (always add if there's contact info)
		if (pageData.phone || pageData.email || pageData.address || Object.values(metadata.socialLinks).some(link => link)) {
			console.log('📝 Creating Contact section');
			await createSection({
				type: 'contact',
				enabled: true,
				order: 99, // Contact always last
				data: {
					title: 'צור קשר',
					phone: pageData.phone || '',
					email: pageData.email || '',
					address: pageData.address || '',
					socialLinks: metadata.socialLinks
				},
				page: pageId
			});
		}

		console.log('✅ All sections created successfully');
		console.log('✅ Page fully ready - redirecting to view page');
		console.log('📋 Page details:', { id: pageResult.id, documentId: pageId, slug });

		return json({
			success: true,
			pageId: pageResult.id,
			documentId: pageId,
			slug: slug,
			pageUrl: `/view/${slug}` // Redirect to view page - owner sees edit mode
		});

	} catch (error) {
		console.error('❌ Error creating structured page:', error);
		console.error('❌ Error stack:', error.stack);
		console.error('❌ Error details:', {
			message: error.message,
			name: error.name,
			cause: error.cause
		});
		return json(
			{ 
				success: false,
				error: error instanceof Error ? error.message : 'Failed to create page',
				details: error instanceof Error ? error.stack : String(error)
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
