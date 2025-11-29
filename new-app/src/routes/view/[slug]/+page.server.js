// @ts-check
import { error } from '@sveltejs/kit';
import { getPageBySlug } from '$lib/server/strapi.js';
import { cleanHtml, removeEditorTools } from '$lib/server/pageProcessor.js';

/**
 * Load page data by slug (clean view without editor tools)
 * @type {import('./$types').PageServerLoad}
 */
export async function load({ params }) {
	const { slug } = params;

	try {
		// Get page from Strapi
		console.log('🔍 Loading page with slug:', slug);
		const page = await getPageBySlug(slug);
		console.log('📄 Page result:', page ? 'Found' : 'Not found');
		console.log('📄 Full page data:', JSON.stringify(page, null, 2));

		if (!page) {
			console.error('❌ Page not found for slug:', slug);
			throw error(404, 'Page not found');
		}

		// Handle both Strapi v4 format (attributes) and direct format
		const attrs = page.attributes || page;
		const htmlContent = attrs.htmlContent;
		const title = attrs.title;
		const pageType = attrs.pageType;
		const description = attrs.description;
		const products = attrs.products;
		const phone = attrs.phone;
		const email = attrs.email;
		const city = attrs.city;
		const address = attrs.address;
		const metadata = attrs.metadata;

		console.log('📄 Extracted data:', {
			hasHtmlContent: !!htmlContent,
			title,
			pageType,
			description,
			hasProducts: !!products,
			productsCount: products?.length || 0
		});

		if (!htmlContent) {
			console.error('❌ No HTML content in page');
			console.error('Page attributes:', page.attributes);
			console.error('Page direct:', { htmlContent: page.htmlContent });
			throw error(500, 'Page has no content');
		}

		// Clean HTML and remove editor tools
		let cleanedHtml = cleanHtml(htmlContent);
		cleanedHtml = removeEditorTools(cleanedHtml);

		console.log('✅ Returning cleaned page with full data');

		return {
			page: {
				id: page.id,
				title: title,
				slug: attrs.slug || slug,
				htmlContent: cleanedHtml,
				pageType: pageType,
				description: description,
				products: products || [],
				phone: phone,
				email: email,
				city: city,
				address: address,
				metadata: metadata || {}
			}
		};
	} catch (err) {
		console.error('❌ Error loading page:', err);
		console.error('Error details:', err.message, err.stack);
		throw error(err.status || 500, err.body?.message || err.message || 'Failed to load page');
	}
}
