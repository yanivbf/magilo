// @ts-check
import { json } from '@sveltejs/kit';
import { updatePage } from '$lib/server/strapi.js';

/**
 * Update page content sections (FAQ, Gallery, Testimonials)
 * @type {import('./$types').RequestHandler}
 */
export async function PUT({ params, request, locals }) {
	const { pageId } = params;
	
	try {
		const { faq, gallery, testimonials } = await request.json();
		
		console.log('📝 Updating content sections for page:', pageId);
		console.log('FAQ items:', faq?.length || 0);
		console.log('Gallery images:', gallery?.length || 0);
		console.log('Testimonials:', testimonials?.length || 0);
		
		// Update page in Strapi
		const updatedPage = await updatePage(pageId, {
			faq: faq || [],
			gallery: gallery || [],
			testimonials: testimonials || []
		});
		
		console.log('✅ Content sections updated successfully');
		
		return json({ 
			success: true, 
			page: updatedPage 
		});
	} catch (error) {
		console.error('❌ Error updating content sections:', error);
		return json({ 
			success: false, 
			error: error.message 
		}, { status: 500 });
	}
}
