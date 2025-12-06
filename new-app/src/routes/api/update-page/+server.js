// @ts-check
import { json } from '@sveltejs/kit';
import { updatePage, getPageById } from '$lib/server/strapi.js';
import { extractContactInfo, extractProducts, extractDescription } from '$lib/server/dataExtractor.js';
import { processPage } from '$lib/server/pageProcessor.js';
import { STRAPI_URL, STRAPI_API_TOKEN } from '$env/static/private';

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
		
		// Handle field update with nested path support
		if (field && value !== undefined) {
			console.log(`📝 Field update: ${field}`);
			console.log(`📄 Page ID received:`, pageId);
			
			// Get the current page (supports both numeric ID and documentId)
			const page = await getPageById(pageId);
			if (!page) {
				console.error('❌ Page not found:', pageId);
				return json({ error: 'Page not found' }, { status: 404 });
			}
			
			console.log(`✅ Page found:`, page.id, page.documentId);
			
			// Handle nested fields (e.g., "sections.0.data.image")
			if (field.includes('.')) {
				const parts = field.split('.');
				const rootField = parts[0];
				
				// SIMPLE FIX: Store section edits in metadata instead of trying to update Strapi components
				// This works exactly like title/description editing!
				if (rootField === 'sections') {
					console.log(`📦 Section field update detected: ${field}`);
					
					// Extract section index and field path
					// e.g., "sections.0.data.title" -> sectionIndex=0, fieldPath="data.title"
					const sectionIndex = parseInt(parts[1]);
					if (isNaN(sectionIndex)) {
						console.error(`❌ Invalid section index: ${parts[1]}`);
						return json({ error: 'Invalid section index' }, { status: 400 });
					}
					
					// Build the field path within the section (everything after "sections.X.")
					const fieldPath = parts.slice(2).join('.');
					console.log(`📦 Section index: ${sectionIndex}`);
					console.log(`📦 Field path: ${fieldPath}`);
					console.log(`📦 New value:`, JSON.stringify(value).substring(0, 100));
					
					// Get current metadata
					const currentMetadata = page.metadata || page.attributes?.metadata || {};
					
					// Initialize sectionOverrides if it doesn't exist
					if (!currentMetadata.sectionOverrides) {
						currentMetadata.sectionOverrides = {};
					}
					
					// Initialize this section's overrides if it doesn't exist
					if (!currentMetadata.sectionOverrides[sectionIndex]) {
						currentMetadata.sectionOverrides[sectionIndex] = {};
					}
					
					// Store the override using the field path
					currentMetadata.sectionOverrides[sectionIndex][fieldPath] = value;
					
					console.log(`💾 Storing section override in metadata:`, {
						sectionIndex,
						fieldPath,
						value: JSON.stringify(value).substring(0, 100)
					});
					
					// Update the page metadata
					const updateId = page.documentId || page.id;
					const result = await updatePage(updateId, { metadata: currentMetadata });
					
					console.log(`✅ Section override saved to metadata successfully`);
					return json({ success: true, pageId: updateId, updated: field });
				}
				
				// For other nested fields (not sections), use the old logic
				let data = page[rootField] || page.attributes?.[rootField];
				
				if (!data) {
					console.error(`❌ ${rootField} not found in page`);
					return json({ error: `${rootField} not found` }, { status: 400 });
				}
				
				// Make a deep copy
				data = JSON.parse(JSON.stringify(data));
				
				// Navigate to the target and update
				let target = data;
				for (let i = 1; i < parts.length - 1; i++) {
					const key = parts[i];
					if (target[key] === undefined) {
						console.error(`❌ Path not found: ${parts.slice(0, i + 1).join('.')}`);
						return json({ error: `Invalid field path: ${field}` }, { status: 400 });
					}
					target = target[key];
				}
				
				const finalKey = parts[parts.length - 1];
				target[finalKey] = value;
				
				console.log(`✅ Updated ${field} to:`, JSON.stringify(value).substring(0, 100));
				
				// Update the page
				const updateId = page.documentId || page.id;
				const updateData = { [rootField]: data };
				
				const result = await updatePage(updateId, updateData);
				
				console.log(`✅ Page updated successfully`);
				return json({ success: true, pageId: updateId, updated: field });
			} else {
				// Simple field update
				console.log(`✅ Simple field update: ${field} = ${value}`);
				
				// CRITICAL: Must use documentId for Strapi v5 updates
				const updateId = page.documentId || page.id;
				console.log(`📄 Using ID for update:`, updateId);
				
				const result = await updatePage(updateId, { [field]: value });
				console.log(`✅ Page updated successfully`);
				return json({ success: true, pageId: updateId, updated: field });
			}
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
