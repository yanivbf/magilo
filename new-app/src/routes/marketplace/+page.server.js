// @ts-check

/**
 * Load initial marketplace data
 * @type {import('./$types').PageServerLoad}
 */
export async function load({ fetch, url }) {
	const search = url.searchParams.get('search') || '';
	const pageType = url.searchParams.get('pageType') || '';
	const page = parseInt(url.searchParams.get('page') || '1');

	try {
		// Build query string
		const params = new URLSearchParams();
		if (search) params.set('search', search);
		if (pageType) params.set('pageType', pageType);
		params.set('page', page.toString());
		params.set('pageSize', '12');

		// Fetch marketplace pages
		const response = await fetch(`/api/pages/all/marketplace?${params.toString()}`);
		const data = await response.json();

		if (!response.ok) {
			throw new Error(data.error || 'Failed to load marketplace');
		}

		return {
			pages: data.pages || [],
			pagination: data.pagination || { page: 1, pageCount: 1, total: 0 },
			filters: {
				search,
				pageType
			}
		};
	} catch (error) {
		console.error('Error loading marketplace:', error);
		return {
			pages: [],
			pagination: { page: 1, pageCount: 1, total: 0 },
			filters: { search: '', pageType: '' },
			error: error.message
		};
	}
}
