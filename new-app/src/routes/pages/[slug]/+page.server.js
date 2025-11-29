// @ts-check
import { error } from '@sveltejs/kit';
import { getPageBySlug } from '$lib/server/strapi.js';
import { cleanHtml } from '$lib/server/pageProcessor.js';

/**
 * Load page data by slug
 * @type {import('./$types').PageServerLoad}
 */
export async function load({ params }) {
	const { slug } = params;

	try {
		// Get page from Strapi
		const page = await getPageBySlug(slug);

		if (!page) {
			throw error(404, 'Page not found');
		}

		// Clean HTML content
		const cleanedHtml = cleanHtml(page.attributes.htmlContent);

		return {
			page: {
				id: page.id,
				title: page.attributes.title,
				slug: page.attributes.slug,
				htmlContent: cleanedHtml,
				pageType: page.attributes.pageType,
				description: page.attributes.description,
				phone: page.attributes.phone,
				email: page.attributes.email,
				city: page.attributes.city,
				createdAt: page.attributes.createdAt
			}
		};
	} catch (err) {
		console.error('Error loading page:', err);
		throw error(404, 'Page not found');
	}
}
