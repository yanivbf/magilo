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
export async function POST({ request, cookies }) {
	try {
		const body = await request.json();
		const { userId, title, htmlContent, pageData, selectedPageType } = body;

		console.log('🔍 CREATE PAGE REQUEST:', {
			userId,
			title,
			selectedPageType,
			hasHtmlContent: !!htmlContent
		});

		// CRITICAL: Set userId cookie to maintain session
		if (userId) {
			cookies.set('userId', userId, {
				path: '/',
				maxAge: 60 * 60 * 24 * 30, // 30 days
				httpOnly: false,
				sameSite: 'lax'
			});
			console.log('✅ Set userId cookie:', userId);
		}

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

		// Ensure user exists in Strapi and get their numeric ID
		let strapiUserId = null;
		try {
			const { STRAPI_URL, STRAPI_API_TOKEN } = await import('$env/static/private');
			
			// Try to find user by userId field (UUID)
			const searchResponse = await fetch(
				`${STRAPI_URL}/api/users?filters[userId][$eq]=${userId}`,
				{
					headers: {
						'Authorization': `Bearer ${STRAPI_API_TOKEN}`
					}
				}
			);
			
			if (searchResponse.ok) {
				const searchResult = await searchResponse.json();
				if (searchResult.data && searchResult.data.length > 0) {
					strapiUserId = searchResult.data[0].id;
					console.log('✅ Found existing Strapi user with ID:', strapiUserId);
				}
			}
			
			// If not found, create new user
			if (!strapiUserId) {
				console.log('👤 User not found in Strapi, creating...');
				
				const createResponse = await fetch(
					`${STRAPI_URL}/api/users`,
					{
						method: 'POST',
						headers: {
							'Authorization': `Bearer ${STRAPI_API_TOKEN}`,
							'Content-Type': 'application/json'
						},
						body: JSON.stringify({
							data: {
								userId: userId,
								name: `משתמש ${userId.substring(0, 8)}`,
								email: `${userId}@autopage.local`,
								wallet: 0,
								subscriptionStatus: 'inactive'
							}
						})
					}
				);
				
				if (createResponse.ok) {
					const createResult = await createResponse.json();
					strapiUserId = createResult.data?.id || createResult.id;
					console.log('✅ Created new Strapi user with ID:', strapiUserId);
				} else {
					const errorText = await createResponse.text();
					console.error('❌ Failed to create user:', errorText);
				}
			}
		} catch (error) {
			console.error('⚠️ User check/create failed:', error.message);
		}

		// Create page in Strapi with user relation
		console.log('📝 Creating page with:', {
			title,
			slug,
			userId,
			strapiUserId,
			hasUserRelation: !!strapiUserId
		});
		
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
			userId: userId, // Save the UUID for easy querying
			user: strapiUserId // Set the relation with numeric Strapi user ID (CRITICAL!)
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
