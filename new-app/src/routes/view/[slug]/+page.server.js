// @ts-check
import { error } from '@sveltejs/kit';
import { getPageBySlug } from '$lib/server/strapi.js';
import { cleanHtml, removeEditorTools } from '$lib/server/pageProcessor.js';
import { extractPageDataFromStrapi } from '$lib/server/dataExtractor.js';

/**
 * Load page data by slug (clean view without editor tools)
 * @type {import('./$types').PageServerLoad}
 */
export async function load({ params, locals }) {
	const { slug } = params;

	try {
		// Get page from Strapi
		console.log('🔍 Loading page with slug:', slug);
		const page = await getPageBySlug(slug);

		if (!page) {
			console.error('❌ Page not found for slug:', slug);
			throw error(404, 'Page not found');
		}

		// Extract page data (supports both HTML and sections-based pages)
		const pageData = extractPageDataFromStrapi(page);
		console.log('📄 Extracted page data:', {
			hasHtmlContent: pageData.hasHtmlContent,
			hasSections: pageData.hasSections,
			hasProducts: pageData.hasProducts,
			sectionsCount: pageData.sections.length,
			productsCount: pageData.productsCount
		});

		// Handle both Strapi v4 format (attributes) and direct format
		const attrs = page.attributes || page;
		
		// Check if current user is the owner
		// @ts-ignore - locals.user is set in hooks.server.js
		const currentUserId = locals.user?.id || locals.userId;
		// v5: attrs.user?.data?.id or attrs.user?.id, v4: attrs.user?.data?.id
		const pageOwnerId = attrs.user?.data?.id || attrs.user?.id || attrs.userId;
		const isOwner = currentUserId && pageOwnerId && String(currentUserId) === String(pageOwnerId);
		
		console.log('👤 Ownership check:', { currentUserId, pageOwnerId, isOwner });
		
		// If page has sections, use sections-based rendering
		if (pageData.hasSections || pageData.hasProducts) {
			console.log('✅ Returning sections-based page');
			console.log('📋 Page IDs:', { id: page.id, documentId: page.documentId });
			return {
				page: {
					id: page.id,
					documentId: page.documentId || page.id,
					title: attrs.title,
					slug: attrs.slug || slug,
					pageType: attrs.pageType,
					description: attrs.description,
					phone: attrs.phone,
					email: attrs.email,
					city: attrs.city,
					address: attrs.address,
					metadata: attrs.metadata || {},
					// Sections-based data
					hasSections: true,
					sections: pageData.sections,
					products: pageData.products
				},
				isOwner
			};
		}

		// Fallback to HTML-based rendering for legacy pages
		const htmlContent = attrs.htmlContent;
		if (!htmlContent) {
			console.error('❌ No content in page (neither sections nor HTML)');
			throw error(500, 'Page has no content');
		}

		// Clean HTML and remove editor tools
		let cleanedHtml = cleanHtml(htmlContent);
		cleanedHtml = removeEditorTools(cleanedHtml);
		
		console.log('✅ Returning HTML-based page');
		return {
			page: {
				id: page.id,
				title: attrs.title,
				slug: attrs.slug || slug,
				htmlContent: cleanedHtml,
				pageType: attrs.pageType,
				description: attrs.description,
				products: attrs.products || [],
				phone: attrs.phone,
				email: attrs.email,
				city: attrs.city,
				address: attrs.address,
				metadata: attrs.metadata || {},
				hasSections: false
			},
			isOwner
		};
	} catch (err) {
		console.error('❌ Error loading page:', err);
		console.error('Error details:', err.message, err.stack);
		throw error(err.status || 500, err.body?.message || err.message || 'Failed to load page');
	}
}
