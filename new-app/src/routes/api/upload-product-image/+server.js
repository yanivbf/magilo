// @ts-check
import { json, error } from '@sveltejs/kit';
import { STRAPI_URL, STRAPI_API_TOKEN } from '$env/static/private';

/** @type {import('./$types').RequestHandler} */
export async function POST({ request }) {
	try {
		const formData = await request.formData();
		const image = formData.get('image');
		const productId = formData.get('productId');
		const pageId = formData.get('pageId');

		console.log('📸 Upload request received:', { 
			hasImage: !!image, 
			productId, 
			pageId,
			imageType: image instanceof File ? image.type : 'not a file',
			imageSize: image instanceof File ? image.size : 0
		});

		if (!image || !productId || !pageId) {
			console.error('❌ Missing required fields:', { image: !!image, productId, pageId });
			throw error(400, 'Missing image, productId, or pageId');
		}

		console.log('📸 Uploading product image:', { productId, pageId });

		// Upload image to Strapi
		const uploadFormData = new FormData();
		uploadFormData.append('files', image);

		const uploadResponse = await fetch(`${STRAPI_URL}/api/upload`, {
			method: 'POST',
			headers: {
				Authorization: `Bearer ${STRAPI_API_TOKEN}`
			},
			body: uploadFormData
		});

		if (!uploadResponse.ok) {
			const errorText = await uploadResponse.text();
			console.error('❌ Strapi upload failed:', errorText);
			throw error(500, 'Failed to upload image to Strapi');
		}

		const uploadedFiles = await uploadResponse.json();
		const uploadedFile = uploadedFiles[0];
		const imageUrl = `${STRAPI_URL}${uploadedFile.url}`;

		console.log('✅ Image uploaded to Strapi:', imageUrl);

		// Get the page to update products JSON
		console.log('📄 Fetching page:', pageId);
		
		// Try direct ID first
		let pageResponse = await fetch(`${STRAPI_URL}/api/pages/${pageId}?populate=deep,3`, {
			headers: {
				Authorization: `Bearer ${STRAPI_API_TOKEN}`
			}
		});

		// If failed, try searching by documentId
		if (!pageResponse.ok) {
			console.log('🔍 Direct ID failed, trying documentId search:', pageId);
			pageResponse = await fetch(`${STRAPI_URL}/api/pages?filters[documentId][$eq]=${pageId}&populate=deep,3`, {
				headers: {
					Authorization: `Bearer ${STRAPI_API_TOKEN}`
				}
			});
			
			if (!pageResponse.ok) {
				const errorText = await pageResponse.text();
				console.error('❌ Failed to fetch page by documentId:', errorText);
				throw error(404, 'Page not found');
			}
			
			const searchData = await pageResponse.json();
			if (!searchData.data || searchData.data.length === 0) {
				console.error('❌ No page found with documentId:', pageId);
				throw error(404, 'Page not found');
			}
			
			// Wrap the found page in the expected format
			const foundPage = searchData.data[0];
			pageResponse = {
				ok: true,
				json: async () => ({ data: foundPage })
			};
		}

		const pageData = await pageResponse.json();
		console.log('📄 Page data structure:', {
			hasData: !!pageData.data,
			dataType: typeof pageData.data,
			keys: pageData.data ? Object.keys(pageData.data) : []
		});
		
		const page = pageData.data;
		const attrs = page.attributes || page;
		
		console.log('📄 Page attributes:', {
			hasSections: !!attrs.sections,
			sectionsType: typeof attrs.sections,
			sectionsLength: Array.isArray(attrs.sections) ? attrs.sections.length : 'not array'
		});

		// Find and update the products section
		let sections = attrs.sections || [];
		let updated = false;

		console.log('🔍 Searching for product in sections...');
		
		sections = sections.map((section /** @type {any} */, index /** @type {number} */) => {
			console.log(`📦 Section ${index}:`, {
				type: section.type,
				hasData: !!section.data,
				hasProducts: !!(section.data && section.data.products),
				productsType: section.data?.products ? typeof section.data.products : 'none'
			});
			
			if (section.type === 'products' && section.data && section.data.products) {
				let products = section.data.products;
				
				// Parse if string
				if (typeof products === 'string') {
					try {
						products = JSON.parse(products);
						console.log('✅ Parsed products from string:', products.length);
					} catch (e) {
						console.error('❌ Failed to parse products:', e);
						return section;
					}
				}

				// Update the product image
				if (Array.isArray(products)) {
					console.log('🔍 Searching in', products.length, 'products for ID:', productId);
					products = products.map(p => {
						console.log('  - Product:', p.id, 'vs', productId, '=', p.id === parseInt(productId));
						if (p.id === parseInt(productId)) {
							console.log('✅ Found and updating product image:', p.id);
							updated = true;
							return { ...p, image: imageUrl };
						}
						return p;
					});

					// Stringify back
					section.data.products = JSON.stringify(products);
					console.log('💾 Stringified products back');
				} else {
					console.error('❌ Products is not an array:', typeof products);
				}
			}
			return section;
		});

		if (!updated) {
			console.error('❌ Product not found in sections. ProductId:', productId);
			throw error(404, 'Product not found');
		}
		
		console.log('✅ Product updated in sections array');

		// Get the numeric ID for update
		const numericId = page.id;
		console.log('📝 Updating page with numeric ID:', numericId);

		// Update the page with new sections
		const updateResponse = await fetch(`${STRAPI_URL}/api/pages/${numericId}`, {
			method: 'PUT',
			headers: {
				'Content-Type': 'application/json',
				Authorization: `Bearer ${STRAPI_API_TOKEN}`
			},
			body: JSON.stringify({
				data: {
					sections
				}
			})
		});

		if (!updateResponse.ok) {
			const errorText = await updateResponse.text();
			console.error('❌ Failed to update page:', errorText);
			throw error(500, 'Failed to update page');
		}

		console.log('✅ Page updated with new product image');

		return json({
			success: true,
			imageUrl,
			productId: String(productId)
		});
	} catch (err) {
		console.error('❌ Error uploading product image:', err);
		if (err && typeof err === 'object' && 'status' in err) {
			throw err; // Re-throw HTTP errors
		}
		throw error(500, err instanceof Error ? err.message : 'Failed to upload product image');
	}
}
