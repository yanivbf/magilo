// @ts-check
import { json } from '@sveltejs/kit';
import { updatePage, getPageById } from '$lib/server/strapi.js';
import { extractContactInfo, extractProducts, extractDescription } from '$lib/server/dataExtractor.js';
import { processPage } from '$lib/server/pageProcessor.js';

/**
 * Update page handler (shared logic)
 */
async function handleUpdatePage(request) {
	try {
		const body = await request.json();
		const { pageId, htmlContent, title, isActive, headerImage, field, value, metadata } = body;
		const description = body.description;

		console.log('🔍 UPDATE PAGE REQUEST:', {
			pageId,
			hasHtmlContent: !!htmlContent,
			hasTitle: !!title,
			hasDescription: !!description,
			hasHeaderImage: !!headerImage,
			hasMetadata: !!metadata,
			isActive,
			field,
			hasValue: value !== undefined
		});

		// Validate required fields
		if (!pageId) {
			return json({ error: 'Missing pageId' }, { status: 400 });
		}
		
		// Handle simple field update
		if (field && value !== undefined) {
			console.log(`📝 Simple field update: ${field}`);
			const updateData = {};
			
			// Support nested field paths like "sections.0.data.images"
			if (field.includes('.')) {
				// Get the page first
				const page = await getPageById(pageId);
				if (!page) {
					return json({ error: 'Page not found' }, { status: 404 });
				}
				
				// Parse the field path
				const parts = field.split('.');
				const rootField = parts[0];
				
				// Get the root object
				let obj = page[rootField] || page.attributes?.[rootField];
				if (!obj) {
					console.error(`❌ Root field not found: ${rootField}`);
					return json({ error: `Field ${rootField} not found` }, { status: 400 });
				}
				
				// Navigate to the parent of the target field
				for (let i = 1; i < parts.length - 1; i++) {
					const part = parts[i];
					if (obj[part] === undefined) {
						console.error(`❌ Field path not found at: ${parts.slice(0, i + 1).join('.')}`);
						return json({ error: `Field path not found` }, { status: 400 });
					}
					obj = obj[part];
				}
				
				// Set the final value
				const lastPart = parts[parts.length - 1];
				obj[lastPart] = value;
				
				// Update the root field
				updateData[rootField] = page[rootField] || page.attributes?.[rootField];
				console.log(`✅ Updated nested field: ${field}`);
			} else {
				// Simple field update
				updateData[field] = value;
				console.log(`✅ Updated field: ${field}`);
			}
			
			const response = await updatePage(pageId, updateData);
			console.log(`✅ Page ${pageId} updated successfully`);
			
			return json({
				success: true,
				pageId,
				message: 'Field updated successfully'
			});
		}

		// Get existing page to determine pageType
		const existingPage = await getPageById(pageId);
		if (!existingPage) {
			console.error('❌ Page not found:', pageId);
			return json({ error: 'Page not found' }, { status: 404 });
		}
		
		console.log('✅ Found page:', existingPage.id, existingPage.documentId);

		const pageType = existingPage.pageType || existingPage.attributes?.pageType;

		// Prepare update data
		const updateData = {};

		// Update title if provided
		if (title !== undefined) {
			updateData.title = title;
			console.log('📝 Updating title:', title);
		}
		
		// Update description if provided
		if (description !== undefined) {
			updateData.description = description;
			console.log('📝 Updating description:', description);
		}
		
		// Update headerImage if provided
		if (headerImage) {
			updateData.headerImage = headerImage;
			console.log('📝 Updating headerImage:', headerImage);
		}
		
		// Update metadata if provided
		if (metadata) {
			// Merge with existing metadata
			const currentMetadata = existingPage.metadata || existingPage.attributes?.metadata || {};
			updateData.metadata = { ...currentMetadata, ...metadata };
			console.log('📝 Updating metadata:', updateData.metadata);
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

/**
 * PUT /api/update-page
 * Update an existing page
 * @type {import('./$types').RequestHandler}
 */
export async function PUT({ request }) {
	return handleUpdatePage(request);
}

/**
 * POST /api/update-page
 * Update an existing page (alternative method)
 * @type {import('./$types').RequestHandler}
 */
export async function POST({ request }) {
	return handleUpdatePage(request);
}
