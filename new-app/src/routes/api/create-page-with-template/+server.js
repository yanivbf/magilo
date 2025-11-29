// @ts-check
import { json } from '@sveltejs/kit';
import { createPage, createAnalytics } from '$lib/server/strapi.js';
import { generateSlug } from '$lib/server/htmlGenerator.js';
import { extractContactInfo, extractProducts, extractDescription, detectPageType } from '$lib/server/dataExtractor.js';
import { extractContactInfoFromHTML, extractProductsFromHTML } from '$lib/server/dataExtractorLegacy.js';
import { processPage } from '$lib/server/pageProcessor.js';

/**
 * POST /api/create-page-with-template
 * Create a new page using template system (legacy compatibility)
 * @type {import('./$types').RequestHandler}
 */
export async function POST({ request }) {
	try {
		const body = await request.json();
		
		console.log('🔍 CREATE PAGE WITH TEMPLATE REQUEST (RAW):', JSON.stringify(body).substring(0, 200));

		// Extract data - the legacy page-creator sends data in formData
		const userId = body.userId || body.user_id;
		const pageData = body.formData || body.pageData || body.data || body;
		let pageType = body.pageType || pageData.pageType;
		
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
		
		// Use template engine to generate full HTML
		console.log('🎨 Rendering template:', pageType);
		const { renderTemplate } = await import('$lib/server/templateEngine.js');
		const htmlContent = await renderTemplate(pageType, pageData);

		console.log(`🎯 Page type: ${pageType}`);

		// Process HTML (clean, inject scripts, fix WhatsApp)
		const processedHtml = processPage(htmlContent, pageType);

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
		const metadata = {
			videoUrl: pageData.videoUrl || pageData.video || '',
			gallery: pageData.gallery || pageData.images || [],
			socialLinks: {
				facebook: pageData.facebook || pageData.facebookUrl || '',
				instagram: pageData.instagram || pageData.instagramUrl || '',
				whatsapp: pageData.whatsapp || pageData.whatsappNumber || contactInfo.phone || '',
				youtube: pageData.youtube || pageData.youtubeUrl || '',
				tiktok: pageData.tiktok || pageData.tiktokUrl || ''
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
		const pageDataToCreate = {
			title,
			slug,
			htmlContent: processedHtml,
			pageType: pageType,
			phone: contactInfo.phone,
			email: contactInfo.email,
			city: contactInfo.city,
			address: contactInfo.address,
			products: products,
			description: description,
			metadata: metadata,
			isActive: true
		};
		
		// Only add user if it's not a temp user
		if (finalUserId && !finalUserId.startsWith('user_')) {
			pageDataToCreate.userId = finalUserId;
		}
		
		const pageResult = await createPage(pageDataToCreate);

		if (!pageResult) {
			throw new Error('Failed to create page in database');
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
