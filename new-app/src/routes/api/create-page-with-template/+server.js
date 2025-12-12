// @ts-check
import { json } from '@sveltejs/kit';
import { createPage, createAnalytics } from '$lib/server/strapi.js';
import { generateSlug } from '$lib/server/htmlGenerator.js';
import { extractContactInfo, extractProducts, extractDescription, detectPageType } from '$lib/server/dataExtractor.js';
import { extractContactInfoFromHTML, extractProductsFromHTML } from '$lib/server/dataExtractorLegacy.js';
import { processPage } from '$lib/server/pageProcessor.js';
import { validatePageData, isRateLimited, sanitizeHtml } from '$lib/server/security.js';

/**
 * POST /api/create-page-with-template
 * Create a new page using template system (legacy compatibility)
 * @type {import('./$types').RequestHandler}
 */
export async function POST({ request, getClientAddress }) {
	try {
		// Rate limiting
		const clientIp = getClientAddress();
		if (isRateLimited(clientIp, 20, 60000)) { // 20 requests per minute
			return json({ error: 'Too many requests. Please try again later.' }, { status: 429 });
		}
		
		const body = await request.json();
		
		console.log('🔍 CREATE PAGE WITH TEMPLATE REQUEST (RAW):', JSON.stringify(body).substring(0, 200));

		// Extract data - the legacy page-creator sends data in formData
		const userId = body.userId || body.user_id;
		const pageData = body.formData || body.pageData || body.data || body;
		let pageType = body.pageType || pageData.pageType;
		const optionalSections = body.optionalSections || [];
		const selectedStyle = body.style || pageData.style || 'Modern'; // Get selected style
		
		// Validate and sanitize page data
		const validation = validatePageData(pageData);
		if (!validation.valid) {
			console.error('❌ Validation errors:', validation.errors);
			return json({ 
				error: 'Invalid page data', 
				details: validation.errors 
			}, { status: 400 });
		}
		
		// Use sanitized data
		Object.assign(pageData, validation.sanitized);
		
		console.log('📋 Optional sections received:', optionalSections);
		
		// Map optional sections to boolean flags
		pageData.includeGallery = optionalSections.includes('gallery');
		pageData.includeFAQ = optionalSections.includes('faq');
		pageData.includeTestimonials = optionalSections.includes('testimonials');
		pageData.includeAbout = optionalSections.includes('about');
		
		console.log('✅ Mapped optional sections:', {
			includeGallery: pageData.includeGallery,
			includeFAQ: pageData.includeFAQ,
			includeTestimonials: pageData.includeTestimonials,
			includeAbout: pageData.includeAbout
		});
		
		// Map legacy page types to Strapi schema
		const pageTypeMap = {
			'onlineStore': 'store',
			'serviceProvider': 'serviceProvider',
			'event': 'event',
			'onlineCourse': 'course',
			'liveWorkshop': 'workshop',
			'restaurantMenu': 'restaurantMenu',
			'messageInBottle': 'messageInBottle'
		};
		pageType = pageTypeMap[pageType] || pageType;

		console.log('🔍 CREATE PAGE WITH TEMPLATE REQUEST:', {
			userId,
			pageType,
			hasPageData: !!pageData,
			mainName: pageData?.mainName
		});

		// Get current user from session if userId is temp_user
		let finalUserId = userId;
		if (!finalUserId || finalUserId === 'temp_user') {
			// Generate a new user ID
			finalUserId = 'user_' + Date.now() + '_' + Math.random().toString(36).substring(2, 9);
			console.log('🆕 Generated new userId:', finalUserId);
		}

		if (!pageData || !pageData.mainName) {
			return json({ error: 'Missing pageData or mainName' }, { status: 400 });
		}
		
		// Add pageType to pageData
		pageData.pageType = pageType;

		// Extract title from pageData
		const title = pageData.mainName || pageData.title || pageData.storeName || pageData.businessName || pageData.eventName || 'Untitled';
		
		// CRITICAL: Ensure products exist for store pages
		if (pageType === 'store' || pageType === 'onlineStore') {
			if (!pageData.products || !Array.isArray(pageData.products) || pageData.products.length === 0) {
				console.log('⚠️ No products found, generating sample products');
				// Generate sample products based on productCount or default to 6
				const productCount = parseInt(pageData.productCount) || 6;
				pageData.products = generateSampleProducts(productCount);
			} else {
				console.log('🛍️ Found', pageData.products.length, 'products in pageData');
			}
		}
		
		// Generate AI content AUTOMATICALLY for optional sections
		// Check if any optional sections are enabled
		const hasOptionalSections = pageData.includeGallery || pageData.includeFAQ || 
		                            pageData.includeTestimonials || pageData.includeAbout;
		
		if (hasOptionalSections) {
			console.log('🤖 Generating AI content automatically for optional sections...');
			try {
				const aiResponse = await fetch('https://n8n-service-how4.onrender.com/webhook/jhfuhgufkhlkuho8erhfaadsgdrghre546yrthfg12w23', {
					method: 'POST',
					headers: { 'Content-Type': 'application/json' },
					body: JSON.stringify({
						businessName: pageData.mainName || title,
						pageType: pageType,
						description: pageData.description || '',
						phone: pageData.phone || '',
						email: pageData.email || '',
						includeGallery: pageData.includeGallery,
						includeFAQ: pageData.includeFAQ,
						includeTestimonials: pageData.includeTestimonials,
						includeAbout: pageData.includeAbout,
						action: 'generate_page_content'
					})
				});
				
				if (aiResponse.ok) {
					const aiContent = await aiResponse.json();
					console.log('✅ AI content generated:', Object.keys(aiContent));
					console.log('📝 AI content sample (GALLERY_HTML):', aiContent.GALLERY_HTML?.substring(0, 200));
					// Merge AI content into pageData - support both formats
					if (aiContent.ABOUT_HTML) pageData.ABOUT_HTML = aiContent.ABOUT_HTML;
					if (aiContent.aboutText) pageData.aboutText = aiContent.aboutText;
					if (aiContent.GALLERY_HTML) pageData.GALLERY_HTML = aiContent.GALLERY_HTML;
					if (aiContent.gallery) pageData.gallery = aiContent.gallery;
					if (aiContent.TESTIMONIALS_HTML) pageData.TESTIMONIALS_HTML = aiContent.TESTIMONIALS_HTML;
					if (aiContent.testimonials) pageData.testimonials = aiContent.testimonials;
					if (aiContent.FAQ_HTML) pageData.FAQ_HTML = aiContent.FAQ_HTML;
					if (aiContent.faq) pageData.faq = aiContent.faq;
				} else {
					console.log('⚠️ AI content generation failed, using empty placeholders');
				}
			} catch (error) {
				console.log('⚠️ AI content generation error:', error.message, '- using empty placeholders');
			}
		}
		
		// Use template engine to generate full HTML
		console.log('🎨 Rendering template:', pageType, 'with sections:', optionalSections);
		const { renderTemplate } = await import('$lib/server/templateEngine.js');
		const htmlContent = await renderTemplate(pageType, pageData, optionalSections);

		console.log(`🎯 Page type: ${pageType}`);

		// Process HTML (clean, inject scripts, fix WhatsApp)
		let processedHtml = processPage(htmlContent, pageType);
		
		// Additional security: sanitize HTML to remove dangerous content
		processedHtml = sanitizeHtml(processedHtml);

		// Extract metadata
		const contactInfo = extractContactInfoFromHTML(processedHtml);
		const products = extractProductsFromHTML(processedHtml);
		const description = extractDescription(processedHtml);

		// Generate slug
		const slug = generateSlug(title, finalUserId);

		// Note: User should already exist from authentication
		// If using temp_user, we'll create the page without a user relation
		console.log('📝 Creating page for userId:', finalUserId);

		// Build metadata object with all additional info
		// Parse gallery - can be array of objects {url, caption} or array of strings
		let galleryImages = [];
		if (pageData.gallery) {
			if (Array.isArray(pageData.gallery)) {
				// Convert to array of URLs (extract url from objects if needed)
				galleryImages = pageData.gallery.map(item => {
					if (typeof item === 'string') return item;
					if (item && item.url) return item.url;
					return null;
				}).filter(url => url && url.startsWith('http'));
			} else if (typeof pageData.gallery === 'string') {
				// Split by newlines and filter empty lines (legacy support)
				galleryImages = pageData.gallery
					.split('\n')
					.map(url => url.trim())
					.filter(url => url.length > 0 && url.startsWith('http'));
			}
		} else if (pageData.images) {
			galleryImages = Array.isArray(pageData.images) ? pageData.images : [];
		}
		
		// Add default gallery images if includeGallery is enabled but no images provided
		if (pageData.includeGallery && galleryImages.length === 0) {
			galleryImages = [
				'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?q=80&w=2070&auto=format&fit=crop',
				'https://images.unsplash.com/photo-1523275335684-37898b6baf30?q=80&w=2099&auto=format&fit=crop',
				'https://images.unsplash.com/photo-1572635196237-14b3f281503f?q=80&w=2080&auto=format&fit=crop',
				'https://images.unsplash.com/photo-1560343090-f0409e92791a?q=80&w=2064&auto=format&fit=crop',
				'https://images.unsplash.com/photo-1491553895911-0055eca6402d?q=80&w=2080&auto=format&fit=crop',
				'https://images.unsplash.com/photo-1542291026-7eec264c27ff?q=80&w=2070&auto=format&fit=crop'
			];
			console.log('🖼️ Added default gallery images');
		}
		
		const metadata = {
			videoUrl: pageData.videoUrl || pageData.video || '',
			gallery: galleryImages,
			socialLinks: {
				facebook: pageData.facebookLink || pageData.facebook || pageData.facebookUrl || '',
				instagram: pageData.instagramLink || pageData.instagram || pageData.instagramUrl || '',
				whatsapp: pageData.whatsappLink || pageData.whatsapp || pageData.whatsappNumber || contactInfo.phone || '',
				youtube: pageData.youtubeLink || pageData.youtube || pageData.youtubeUrl || '',
				tiktok: pageData.tiktokLink || pageData.tiktok || pageData.tiktokUrl || '',
				linkedin: pageData.linkedinLink || pageData.linkedin || pageData.linkedinUrl || '',
				twitter: pageData.twitterLink || pageData.twitter || pageData.twitterUrl || ''
			},
			// Additional fields based on page type
			...(pageType === 'event' && {
				eventDate: pageData.eventDate || pageData.date,
				eventTime: pageData.eventTime || pageData.time,
				location: pageData.location || pageData.venue
			}),
			...(pageType === 'artist' && {
				genre: pageData.genre,
				bio: pageData.bio
			})
		};

		// Create page in Strapi
		// Note: Don't link to user if it's a temp user
		// CRITICAL: Use products from pageData if available (from ProductGallery), otherwise extract from HTML
		let finalProducts = (pageData.products && Array.isArray(pageData.products) && pageData.products.length > 0) 
			? pageData.products 
			: products;
		
		// Add default products from template if none exist
		if (finalProducts.length === 0) {
			try {
				const { getTemplateById } = await import('$lib/templates/index.js');
				const template = getTemplateById(pageType);
				if (template && template.defaultProducts) {
					finalProducts = template.defaultProducts;
					console.log('🛍️ Adding default products from template:', finalProducts.length);
				}
			} catch (error) {
				console.log('⚠️ Could not load default products:', error.message);
			}
		}
		
		console.log('💾 Saving products to Strapi:', finalProducts.length, 'products');
		
		const pageDataToCreate = {
			title,
			slug,
			htmlContent: processedHtml,
			pageType: pageType,
			phone: contactInfo.phone,
			email: contactInfo.email,
			city: contactInfo.city,
			address: contactInfo.address,
			products: finalProducts,
			description: description,
			metadata: metadata,
			isActive: true,
			// Optional sections
			includeGallery: pageData.includeGallery || false,
			includeFAQ: pageData.includeFAQ || false,
			includeTestimonials: pageData.includeTestimonials || false,
			includeAbout: pageData.includeAbout || false
		};
		
		// ALWAYS add userId - required by Strapi schema
		pageDataToCreate.userId = finalUserId;
		console.log('✅ Setting userId for page:', finalUserId);
		
		console.log('🚀 About to create page with data:', {
			includeGallery: pageDataToCreate.includeGallery,
			includeFAQ: pageDataToCreate.includeFAQ,
			includeTestimonials: pageDataToCreate.includeTestimonials,
			includeAbout: pageDataToCreate.includeAbout
		});

		const pageResult = await createPage(pageDataToCreate);

		if (!pageResult) {
			throw new Error('Failed to create page in database');
		}

		console.log('✅ Page created with ID:', pageResult.id, 'documentId:', pageResult.documentId);
		console.log('🔍 Checking if should create sections. includeFAQ:', pageData.includeFAQ, 'pageType:', pageType);

		// CRITICAL: Create products gallery section for store pages
		if ((pageType === 'store' || pageType === 'onlineStore') && finalProducts.length > 0) {
			console.log('🛍️ Creating products gallery section with', finalProducts.length, 'products');
			try {
				const { createSection } = await import('$lib/server/strapi.js');
				
				const productsSection = await createSection({
					type: 'products',
					enabled: true,
					order: 0,
					data: {
						title: 'המוצרים שלנו',
						subtitle: 'בחר מוצר והוסף לעגלה',
						products: finalProducts
					},
					page: pageResult.documentId || pageResult.id
				});
				console.log('✅ Products gallery section created:', productsSection.id);
			} catch (error) {
				console.error('❌ Failed to create products section:', error.message, error);
			}
		}
		
		// Create default sections if includeFAQ is enabled
		if (pageData.includeFAQ) {
			console.log('✅ includeFAQ is TRUE, proceeding to create sections');
			try {
				const { getTemplateById } = await import('$lib/templates/index.js');
				const template = getTemplateById(pageType);
				if (template && template.defaultSections) {
					console.log('📋 Creating default sections from template:', template.defaultSections.length);
					
					// Import createSection function
					const { createSection } = await import('$lib/server/strapi.js');
					
					// Create each section
					for (const sectionData of template.defaultSections) {
						try {
							console.log('📝 Creating section:', sectionData.title, 'with style:', selectedStyle);
							
							// Add style to section data if it's a visual section
							const sectionWithStyle = {
								...sectionData,
								page: pageResult.documentId || pageResult.id
							};
							
							// Add style to data object for visual sections
							if (sectionData.type === 'testimonials' || sectionData.type === 'faq' || sectionData.type === 'team') {
								sectionWithStyle.data = {
									...sectionData.data,
									style: selectedStyle
								};
							}
							
							const sectionResult = await createSection(sectionWithStyle);
							console.log('✅ Section created:', sectionResult.id);
						} catch (error) {
							console.error('❌ Failed to create section:', error.message, error);
						}
					}
				} else {
					console.log('⚠️ No default sections found in template');
				}
			} catch (error) {
				console.error('❌ Could not create default sections:', error.message, error);
			}
		} else {
			console.log('ℹ️ includeFAQ is false, skipping sections creation');
		}

		// Create analytics entry
		try {
			await createAnalytics(pageResult.id);
		} catch (error) {
			console.log('⚠️ Analytics creation failed:', error.message);
		}

		console.log('✅ Page created successfully:', pageResult.id);

		return json({
			success: true,
			pageId: pageResult.id,
			slug: slug,
			pageUrl: `/view/${slug}`
		});

	} catch (error) {
		console.error('❌ Error creating page:', error);
		return json(
			{ 
				success: false,
				error: error.message || 'Failed to create page' 
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
			id: i + 1,
			name: productNames[i] || `מוצר ${i + 1}`,
			description: 'תיאור המוצר - ערוך אותי בדף הניהול',
			price: (i + 1) * 50 + 49,
			image: `https://placehold.co/400x400/667eea/white?text=מוצר+${i + 1}`
		});
	}
	
	return products;
}

/**
 * Generate basic HTML from page data
 */
function generateHTMLFromPageData(data) {
	const mainName = data.mainName || data.storeName || data.businessName || data.eventName || data.courseName || data.artistName || 'My Page';
	const description = data.description || '';
	const phone = data.phone || '';
	const email = data.email || '';
	const pageType = data.pageType || 'landing';
	
	let html = '<!DOCTYPE html>\n';
	html += '<html lang="he" dir="rtl">\n';
	html += '<head>\n';
	html += '  <meta charset="UTF-8">\n';
	html += '  <meta name="viewport" content="width=device-width, initial-scale=1.0">\n';
	html += '  <meta name="page-type" content="' + pageType + '">\n';
	html += '  <title>' + escapeHtml(mainName) + '</title>\n';
	html += '  <style>\n';
	html += '    * { margin: 0; padding: 0; box-sizing: border-box; }\n';
	html += '    body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; }\n';
	html += '    .bg-gray-50 { background-color: #f9fafb; }\n';
	html += '    .min-h-screen { min-height: 100vh; }\n';
	html += '    .bg-gradient-to-r { background: linear-gradient(to right, #9333ea, #ec4899); }\n';
	html += '    .text-white { color: white; }\n';
	html += '    .py-16 { padding-top: 4rem; padding-bottom: 4rem; }\n';
	html += '    .text-center { text-align: center; }\n';
	html += '    .text-4xl { font-size: 2.25rem; }\n';
	html += '    .text-2xl { font-size: 1.5rem; }\n';
	html += '    .text-xl { font-size: 1.25rem; }\n';
	html += '    .font-bold { font-weight: 700; }\n';
	html += '    .mb-4 { margin-bottom: 1rem; }\n';
	html += '    .mb-6 { margin-bottom: 1.5rem; }\n';
	html += '    .mb-2 { margin-bottom: 0.5rem; }\n';
	html += '    .container { max-width: 1200px; margin: 0 auto; }\n';
	html += '    .mx-auto { margin-left: auto; margin-right: auto; }\n';
	html += '    .px-4 { padding-left: 1rem; padding-right: 1rem; }\n';
	html += '    .py-12 { padding-top: 3rem; padding-bottom: 3rem; }\n';
	html += '    .p-8 { padding: 2rem; }\n';
	html += '    .bg-white { background-color: white; }\n';
	html += '    .rounded-lg { border-radius: 0.5rem; }\n';
	html += '    .shadow-lg { box-shadow: 0 10px 15px -3px rgba(0,0,0,0.1); }\n';
	html += '  </style>\n';
	html += '</head>\n';
	html += '<body class="bg-gray-50">\n';
	html += '  <div class="min-h-screen">\n';
	html += '    <header class="bg-gradient-to-r from-purple-600 to-pink-500 text-white py-16 text-center">\n';
	html += '      <h1 class="text-4xl font-bold mb-4">' + escapeHtml(mainName) + '</h1>\n';
	html += '      <p class="text-xl">' + escapeHtml(description) + '</p>\n';
	html += '    </header>\n';
	html += '    <main class="container mx-auto px-4 py-12">\n';
	html += '      <div class="bg-white rounded-lg shadow-lg p-8">\n';
	html += '        <h2 class="text-2xl font-bold mb-6">צור קשר</h2>\n';
	if (phone) {
		html += '        <p class="mb-2">📞 ' + escapeHtml(phone) + '</p>\n';
	}
	if (email) {
		html += '        <p class="mb-2">📧 ' + escapeHtml(email) + '</p>\n';
	}
	html += '      </div>\n';
	html += '    </main>\n';
	html += '  </div>\n';
	html += '</body>\n';
	html += '</html>';
	
	return html;
}

/**
 * Escape HTML special characters
 */
function escapeHtml(text) {
	if (!text) return '';
	return text
		.replace(/&/g, '&amp;')
		.replace(/</g, '&lt;')
		.replace(/>/g, '&gt;')
		.replace(/"/g, '&quot;')
		.replace(/'/g, '&#039;');
}
