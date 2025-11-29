// @ts-check
import { json } from '@sveltejs/kit';
import { updatePage, getPageById } from '$lib/server/strapi.js';
import { extractContactInfo, extractProducts, extractDescription } from '$lib/server/dataExtractor.js';
import { processPage } from '$lib/server/pageProcessor.js';

/**
 * PUT /api/update-page
 * Update an existing page
 * @type {import('./$types').RequestHandler}
 */
export async function PUT({ request }) {
	try {
		const body = await request.json();
		const { pageId, htmlContent, title, isActive } = body;

		console.log('🔍 UPDATE PAGE REQUEST:', {
			pageId,
			hasHtmlContent: !!htmlContent,
			hasTitle: !!title,
			isActive
		});

		// Validate required fields
		if (!pageId) {
			return json({ error: 'Missing pageId' }, { status: 400 });
		}

		// Get existing page to determine pageType
		const existingPage = await getPageById(pageId);
		if (!existingPage) {
			return json({ error: 'Page not found' }, { status: 404 });
		}

		const pageType = existingPage.attributes.pageType;

		// Prepare update data
		const updateData = {};

		// Update title if provided
		if (title) {
			updateData.title = title;
		}

		// Update isActive if provided
		if (typeof isActive === 'boolean') {
			updateData.isActive = isActive;
		}

		// Update HTML content if provided
		if (htmlContent) {
			// Process HTML (clean, inject scripts, fix WhatsApp)
			const processedHtml = processPage(htmlContent, pageType);

			// Extract updated metadata
			const contactInfo = extractContactInfo(processedHtml);
			const products = extractProducts(processedHtml);
			const description = extractDescription(processedHtml);

			console.log('✅ Extracted updated metadata:', {
				phone: contactInfo.phone,
				city: contactInfo.city,
				email: contactInfo.email,
				productsCount: products.length
			});

			updateData.htmlContent = processedHtml;
			updateData.phone = contactInfo.phone;
			updateData.email = contactInfo.email;
			updateData.city = contactInfo.city;
			updateData.address = contactInfo.address;
			updateData.products = products;
			updateData.description = description;
		}

		// Update page in Strapi
		const response = await updatePage(pageId, updateData);

		console.log(`✅ Page ${pageId} updated successfully`);

		return json({
			success: true,
			pageId,
			message: 'Page updated successfully'
		});
	} catch (error) {
		console.error('❌ Error updating page:', error);
		return json(
			{
				error: 'Failed to update page',
				details: error.message
			},
			{ status: 500 }
		);
	}
}
