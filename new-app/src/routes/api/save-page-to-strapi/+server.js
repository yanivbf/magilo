// @ts-check
import { json } from '@sveltejs/kit';
import { createPage, createAnalytics } from '$lib/server/strapi.js';
import { generateSlug } from '$lib/server/htmlGenerator.js';
import { extractContactInfo, extractProducts, extractDescription } from '$lib/server/dataExtractor.js';
import { processPage } from '$lib/server/pageProcessor.js';

/**
 * POST /api/save-page-to-strapi
 * Save a complete HTML page to Strapi (from legacy page creator)
 * @type {import('./$types').RequestHandler}
 */
export async function POST({ request }) {
	try {
		const body = await request.json();
		
		console.log('💾 SAVE PAGE TO STRAPI REQUEST');

		const { userId, fileName, content, pageType, pageName } = body;

		if (!userId || !fileName || !content) {
			return json({ error: 'Missing required fields' }, { status: 400 });
		}

		// Extract title from fileName or pageName
		const title = pageName || fileName.replace(/_html\.html$/, '').replace(/_/g, ' ');

		// Process HTML
		const processedHtml = processPage(content, pageType || 'generic');

		// Extract metadata
		const contactInfo = extractContactInfo(processedHtml);
		const products = extractProducts(processedHtml);
		const description = extractDescription(processedHtml);

		// Generate slug
		const slug = generateSlug(title, userId);

		console.log('📝 Creating page in Strapi:', {
			title,
			slug,
			pageType,
			userId
		});

		// Create page in Strapi
		const pageDataToCreate = {
			title,
			slug,
			htmlContent: processedHtml,
			pageType: pageType || 'generic',
			phone: contactInfo.phone,
			email: contactInfo.email,
			city: contactInfo.city,
			address: contactInfo.address,
			products: products,
			description: description,
			isActive: true,
			userId: userId
		};

		const pageResult = await createPage(pageDataToCreate);

		if (!pageResult) {
			throw new Error('Failed to create page in Strapi');
		}

		// Create analytics entry
		try {
			await createAnalytics(pageResult.id);
		} catch (error) {
			console.log('⚠️ Analytics creation failed:', error.message);
		}

		console.log('✅ Page saved to Strapi successfully:', pageResult.id);

		return json({
			success: true,
			pageId: pageResult.id,
			slug: slug,
			pageUrl: `/view/${slug}`,
			message: 'Page saved to Strapi successfully'
		});

	} catch (error) {
		console.error('❌ Error saving page to Strapi:', error);
		return json(
			{ 
				success: false,
				error: error.message || 'Failed to save page to Strapi' 
			},
			{ status: 500 }
		);
	}
}
