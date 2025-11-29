// @ts-check
import { redirect } from '@sveltejs/kit';
import { getPagesByUser } from '$lib/server/strapi.js';

/**
 * Legacy URL redirect: /pages/:userId/:fileName -> /pages/:slug
 * @type {import('./$types').PageServerLoad}
 */
export async function load({ params }) {
	const { userId, fileName } = params;

	try {
		// Get all pages for the user
		const pages = await getPagesByUser(userId);

		// Find page by fileName (stored in metadata or match against title)
		const cleanFileName = fileName.replace(/\.html$/, '').replace(/_html$/, '');

		const page = pages.find((p) => {
			// Try to match against metadata fileName
			if (p.attributes.metadata?.fileName === cleanFileName) {
				return true;
			}
			// Try to match against title
			const titleMatch = p.attributes.title
				.replace(/[^a-zA-Z0-9\u0590-\u05FF]/g, '_')
				.toLowerCase();
			return titleMatch.includes(cleanFileName.toLowerCase());
		});

		if (page) {
			// Redirect to new slug-based URL
			throw redirect(301, `/pages/${page.attributes.slug}`);
		}

		// If no page found, redirect to user's pages list or 404
		throw redirect(302, `/`);
	} catch (err) {
		if (err.status === 301 || err.status === 302) {
			throw err;
		}
		console.error('Error in legacy URL redirect:', err);
		throw redirect(302, `/`);
	}
}
