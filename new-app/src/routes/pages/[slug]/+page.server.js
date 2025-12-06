// @ts-check
import { error, redirect } from '@sveltejs/kit';
import { getPageBySlug } from '$lib/server/strapi.js';

/**
 * Load page data by slug - REDIRECT TO /view/[slug] for public viewing
 * @type {import('./$types').PageServerLoad}
 */
export async function load({ params, locals }) {
	const { slug } = params;
	
	// Redirect to /view/[slug] for public viewing
	throw redirect(302, `/view/${slug}`);

	try {
		// Get page from Strapi
		const page = await getPageBySlug(slug);

		if (!page) {
			throw error(404, 'Page not found');
		}

		// Handle both Strapi v4 (nested) and v5 (flat) formats
		const attrs = page.attributes || page;

		// Check if current user is the owner
		// @ts-ignore - locals.user is set in hooks.server.js
		const currentUserId = locals.user?.id || locals.userId;
		// v5: attrs.user?.data?.id or attrs.user?.id, v4: attrs.user?.data?.id
		const pageOwnerId = attrs.user?.data?.id || attrs.user?.id || attrs.userId;
		const isOwner = currentUserId && pageOwnerId && String(currentUserId) === String(pageOwnerId);

		// Extract metadata for easier access
		const metadata = attrs.metadata || {};
		
		// Return full page data for PageRenderer
		return {
			page: {
				id: page.id,
				documentId: page.documentId,
				title: attrs.title,
				slug: attrs.slug,
				pageType: attrs.pageType,
				description: attrs.description,
				phone: attrs.phone,
				email: attrs.email,
				city: attrs.city,
				address: attrs.address,
				createdAt: attrs.createdAt,
				userId: pageOwnerId,
				// Store-specific fields - Load from products relation
				products: (() => {
					// First try to load from storeProducts relation (new structured way)
					// v5: attrs.storeProducts is array, v4: attrs.storeProducts.data is array
					const productsData = Array.isArray(attrs.storeProducts) 
						? attrs.storeProducts 
						: (attrs.storeProducts?.data || []);
					
					if (productsData.length > 0) {
						const products = productsData.map((/** @type {any} */ p) => {
							const pAttrs = p.attributes || p;
							return {
								id: p.id,
								name: pAttrs.name,
								description: pAttrs.description,
								price: pAttrs.price,
								image: pAttrs.image,
								enabled: pAttrs.enabled,
								order: pAttrs.order
							};
						});
						console.log('✅ Loaded', products.length, 'products from relation');
						return products;
					}
					
					// Fallback to old products field (legacy)
					const rawProducts = attrs.products;
					console.log('🔍 Fallback to legacy products field');
					
					let parsedProducts;
					if (typeof rawProducts === 'string') {
						try {
							parsedProducts = JSON.parse(rawProducts);
							console.log('✅ Parsed products from string:', parsedProducts);
						} catch (e) {
							console.error('❌ Failed to parse products:', e);
							parsedProducts = [];
						}
					} else {
						parsedProducts = rawProducts || [];
						console.log('✅ Products already array:', parsedProducts);
					}
					
					console.log('📦 Final products count:', parsedProducts.length);
					return parsedProducts;
				})(),
				headerImage: attrs.headerImage,
				logo: attrs.logo,
				socialMedia: attrs.socialMedia || {},
				// Event-specific fields
				eventDate: attrs.eventDate,
				eventTime: attrs.eventTime,
				eventLocation: attrs.eventLocation,
				// Service-specific fields
				services: attrs.services || [],
				workingHours: attrs.workingHours || {},
				// Metadata (includes gallery, video, etc.)
				metadata: metadata,
				// Extract structured data from metadata for PageRenderer
				gallery: metadata.gallery || [],
				testimonials: attrs.testimonials || [],
				faq: attrs.faq || [],
				aboutText: attrs.aboutText || '',
				// Optional sections
				includeGallery: attrs.includeGallery || false,
				includeFAQ: attrs.includeFAQ || false,
				includeTestimonials: attrs.includeTestimonials || false,
				includeAbout: attrs.includeAbout || false,
				// Sections (from relations)
				sections: (() => {
					// Handle both Strapi v4 (nested) and v5 (flat) formats
					const sectionsData = Array.isArray(attrs.sections) 
						? attrs.sections 
						: (attrs.sections?.data || []);
					
					console.log('📋 Loading', sectionsData.length, 'sections');
					sectionsData.forEach((/** @type {any} */ section, /** @type {number} */ index) => {
						const sAttrs = section.attributes || section;
						console.log(`Section ${index}:`, sAttrs.type, 'enabled:', sAttrs.enabled);
						if (sAttrs.type === 'products') {
							console.log('🛍️ Products section data:', JSON.stringify(sAttrs.data).substring(0, 200));
						}
					});
					return sectionsData;
				})(),
				hasSections: (() => {
					const sectionsData = Array.isArray(attrs.sections) 
						? attrs.sections 
						: (attrs.sections?.data || []);
					return sectionsData.length > 0;
				})(),
				// All other fields
				...attrs
			},
			isOwner
		};
	} catch (err) {
		console.error('Error loading page:', err);
		throw error(404, 'Page not found');
	}
}
