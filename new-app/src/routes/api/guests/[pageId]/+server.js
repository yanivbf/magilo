// Get Guests/RSVPs for Event Page
// Returns all guests who have RSVP'd to an event

import { json } from '@sveltejs/kit';
import { getPageGuests } from '$lib/server/strapi';

export async function GET({ params }) {
	try {
		const { pageId } = params;
		
		if (!pageId) {
			return json({
				success: false,
				error: 'Missing pageId'
			}, { status: 400 });
		}
		
		console.log(`📋 Getting guests for page: ${pageId}`);
		
		const result = await getPageGuests(pageId);
		
		if (result.success) {
			return json({
				success: true,
				guests: result.data || []
			});
		} else {
			throw new Error(result.error || 'Failed to get guests');
		}
		
	} catch (error) {
		console.error('❌ Error getting guests:', error);
		return json({
			success: false,
			error: error.message || 'Failed to get guests',
			guests: []
		}, { status: 500 });
	}
}
