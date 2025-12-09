// @ts-check
import { error } from '@sveltejs/kit';
import { getPageBySlug } from '$lib/server/strapi.js';
import { cleanHtml, removeEditorTools } from '$lib/server/pageProcessor.js';
import { extractPageDataFromStrapi } from '$lib/server/dataExtractor.js';

/**
 * Load page data by slug (clean view without editor tools)
 * @type {import('./$types').PageServerLoad}
 */
export async function load({ params, locals, cookies, setHeaders, url }) {
	const { slug } = params;
	
	// Disable caching to always get fresh data from Strapi
	setHeaders({
		'cache-control': 'no-cache, no-store, must-revalidate, max-age=0',
		'pragma': 'no-cache',
		'expires': '0'
	});
	
	// Log the timestamp parameter to verify fresh loads
	const timestamp = url.searchParams.get('t');
	if (timestamp) {
		console.log('🔄 Fresh load requested with timestamp:', timestamp);
	}

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
		// CRITICAL: Must use userId string from cookie, NOT numeric ID from locals.user
		// The page.userId field is a string like "google_111351120503275674259"
		// @ts-ignore - locals.userId is set in hooks.server.js
		const currentUserId = cookies.get('userId') || locals.userId;
		
		// Get page owner ID - check userId field first (string), then user relation (numeric)
		// CRITICAL: In Strapi v5, data is directly on page object, NOT in page.attributes
		const pageUserId = page.userId || attrs.userId; // String like "google_111351120503275674259"
		const pageOwnerId = attrs.user?.data?.id || attrs.user?.id; // Numeric ID from Strapi user relation
		const createdByUserId = attrs.metadata?.createdByUserId; // Backup in metadata
		
		console.log('🔍 OWNERSHIP DEBUG:');
		console.log('   - currentUserId (from cookie):', currentUserId);
		console.log('   - page.userId (direct):', page.userId);
		console.log('   - attrs.userId:', attrs.userId);
		console.log('   - pageUserId (final):', pageUserId);
		console.log('   - pageOwnerId (numeric relation):', pageOwnerId);
		console.log('   - createdByUserId (metadata):', createdByUserId);
		
		// Check ownership: compare string userId fields
		let isOwner = false;
		if (currentUserId) {
			// PRIORITY 1: Check if page.userId matches currentUserId (both strings)
			if (pageUserId && String(currentUserId) === String(pageUserId)) {
				isOwner = true;
				console.log('✅ Owner by userId match (string comparison)');
			}
			// PRIORITY 2: Check if this user created the page (by userId string in metadata)
			else if (createdByUserId && String(currentUserId) === String(createdByUserId)) {
				isOwner = true;
				console.log('✅ Owner by createdByUserId match (metadata)');
			}
			// PRIORITY 3: Check if page is linked to this user (by Strapi user relation - numeric)
			// This is a fallback for old pages that might use numeric IDs
			else if (pageOwnerId && String(currentUserId) === String(pageOwnerId)) {
				isOwner = true;
				console.log('✅ Owner by pageOwnerId match (numeric relation)');
			}
		}
		
		if (!isOwner) {
			console.log('❌ Not owner - no match found');
			console.log('   Comparison failed:');
			console.log(`   "${currentUserId}" !== "${pageUserId}"`);
		}
		
		// Get user subscription status (subscription is per user, not per page)
		let userSubscriptionStatus = 'inactive';
		if (isOwner && attrs.user) {
			const userData = attrs.user.data || attrs.user;
			userSubscriptionStatus = userData.subscriptionStatus || 'inactive';
		}
		
		console.log('👤 Ownership check:', { currentUserId, pageOwnerId, isOwner, userSubscriptionStatus });
		
		// If page has sections, use sections-based rendering
		if (pageData.hasSections || pageData.hasProducts) {
			console.log('✅ Returning sections-based page');
			console.log('📋 Page IDs:', { id: page.id, documentId: page.documentId });
			
			// Apply section overrides from metadata
			const sections = pageData.sections;
			const metadata = attrs.metadata || {};
			const sectionOverrides = metadata.sectionOverrides || {};
			
			console.log('🔄 Applying section overrides:', Object.keys(sectionOverrides).length, 'sections have overrides');
			
			// Merge overrides into sections
			sections.forEach((section, index) => {
				if (sectionOverrides[index]) {
					console.log(`🔄 Applying overrides to section ${index}:`, Object.keys(sectionOverrides[index]));
					
					// Apply each override
					for (const [fieldPath, value] of Object.entries(sectionOverrides[index])) {
						// Navigate to the target field and set the value
						// e.g., "data.title" -> section.data.title = value
						const parts = fieldPath.split('.');
						let target = section;
						
						// Navigate to the parent of the final field
						for (let i = 0; i < parts.length - 1; i++) {
							if (!target[parts[i]]) {
								target[parts[i]] = {};
							}
							target = target[parts[i]];
						}
						
						// Set the final field
						const finalKey = parts[parts.length - 1];
						target[finalKey] = value;
						
						console.log(`   ✅ Applied: ${fieldPath} = ${JSON.stringify(value).substring(0, 50)}`);
					}
				}
			});
			
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
					designStyle: attrs.designStyle || page.designStyle || 'modern', // ✅ CRITICAL FIX: Pass designStyle!
					metadata: metadata,
					// Sections-based data (with overrides applied)
					hasSections: true,
					sections: sections,
					products: pageData.products,
					// User subscription status (not page-specific)
					subscriptionStatus: userSubscriptionStatus
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
				designStyle: attrs.designStyle || page.designStyle || 'modern', // ✅ CRITICAL FIX: Pass designStyle!
				metadata: attrs.metadata || {},
				hasSections: false,
				// User subscription status (not page-specific)
				subscriptionStatus: userSubscriptionStatus
			},
			isOwner
		};
	} catch (err) {
		console.error('❌ Error loading page:', err);
		console.error('Error details:', err.message, err.stack);
		throw error(err.status || 500, err.body?.message || err.message || 'Failed to load page');
	}
}
