// @ts-check
import { json } from '@sveltejs/kit';
import { createPage, createAnalytics } from '$lib/server/strapi.js';
import { generateSlug } from '$lib/server/htmlGenerator.js';
import { extractContactInfo, extractProducts, extractDescription, detectPageType } from '$lib/server/dataExtractor.js';
import { extractContactInfoFromHTML, extractProductsFromHTML } from '$lib/server/dataExtractorLegacy.js';
import { processPage } from '$lib/server/pageProcessor.js';

/**
 * POST /api/create-page
 * Create a new page
 * @type {import('./$types').RequestHandler}
 */
export async function POST({ request }) {
	try {
		const body = await request.json();
		const { userId, title, htmlContent, pageData, selectedPageType } = body;

		console.log('🔍 CREATE PAGE REQUEST:', {
			userId,
			title,
			selectedPageType,
			hasHtmlContent: !!htmlContent
		});

		// Validate required fields
		if (!userId) {
			return json({ error: 'Missing userId' }, { status: 400 });
		}

		if (!title) {
			return json({ error: 'Missing title' }, { status: 400 });
		}

		if (!htmlContent && !pageData) {
			return json({ error: 'Missing htmlContent or pageData' }, { status: 400 });
		}

		// Use provided HTML or generate from pageData
		let pageHtml = htmlContent || '';

		// TODO: If pageData is provided, generate HTML from it
		// For now, we require htmlContent

		if (!pageHtml) {
			return json({ error: 'HTML content is required' }, { status: 400 });
		}

		// Detect page type (priority: selectedPageType > keyword analysis)
		const pageType = detectPageType(pageHtml, selectedPageType);
		console.log(`🎯 Detected page type: ${pageType}`);

		// Process HTML (clean, inject scripts, fix WhatsApp)
		const processedHtml = processPage(pageHtml, pageType);

		// Extract metadata using legacy functions (more comprehensive)
		const contactInfo = extractContactInfoFromHTML(processedHtml);
		const products = extractProductsFromHTML(processedHtml);
		const description = extractDescription(processedHtml);

		console.log('✅ Extracted metadata:', {
			phone: contactInfo.phone,
			city: contactInfo.city,
			email: contactInfo.email,
			productsCount: products.length,
			description: description.substring(0, 50)
		});

		// Generate slug
		const slug = generateSlug(title, userId);
		console.log(`📝 Generated slug: ${slug}`);

		// Ensure user exists in Strapi (create if not exists)
		try {
			const { getUser, createUser } = await import('$lib/server/strapi.js');
			let user = await getUser(userId);
			if (!user) {
				console.log('👤 User not found, creating...');
				user = await createUser({
					id: userId,
					username: `user_${userId.substring(0, 8)}`,
					email: `${userId}@autopage.local`
				});
			}
		} catch (error) {
			console.log('⚠️ User check/create failed:', error.message);
		}

		// Create page in Strapi
		const pageResponse = await createPage({
			title,
			slug,
			htmlContent: processedHtml,
			pageType,
			description,
			isActive: false, // Default: not active until subscription
			phone: contactInfo.phone,
			email: contactInfo.email,
			city: contactInfo.city,
			address: contactInfo.address,
			products,
			metadata: {
				createdAt: new Date().toISOString(),
				...body.metadata
			},
			userId
		});

		const pageId = pageResponse.data.id;
		console.log(`✅ Page created with ID: ${pageId}`);

		// Create analytics record for the page
		try {
			await createAnalytics(pageId);
			console.log(`✅ Analytics created for page ${pageId}`);
		} catch (analyticsError) {
			console.error('⚠️ Failed to create analytics:', analyticsError);
			// Don't fail the request if analytics creation fails
		}

		// Return success response
		return json({
			success: true,
			pageId,
			slug,
			pageUrl: `/pages/${slug}`,
			message: 'Page created successfully'
		});
	} catch (error) {
		console.error('❌ Error creating page:', error);
		return json(
			{
				error: 'Failed to create page',
				details: error.message
			},
			{ status: 500 }
		);
	}
}
