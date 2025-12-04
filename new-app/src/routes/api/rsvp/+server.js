// RSVP Submission Endpoint
// Handles event RSVP submissions from guests

import { json } from '@sveltejs/kit';
import { createOrUpdateGuest } from '$lib/server/strapi';

export async function POST({ request }) {
	try {
		const data = await request.json();
		console.log('🎉 RSVP Request received:', data);
		
		const {
			pageId,
			userId,
			name,
			phone,
			email,
			status, // 'confirmed', 'pending', 'declined'
			plus = 0, // Number of additional guests
			notes = '',
			gift = '',
			giftAmount = 0
		} = data;
		
		// Validation
		if (!pageId || !name) {
			return json({
				success: false,
				error: 'Missing required fields: pageId, name'
			}, { status: 400 });
		}
		
		// Create guest entry in Strapi
		const guestData = {
			page: pageId,
			name,
			phone: phone || '',
			email: email || '',
			status: status || 'pending',
			plus: parseInt(plus) || 0,
			notes: notes || '',
			gift: gift || '',
			giftAmount: parseFloat(giftAmount) || 0,
			table: 0, // Will be assigned later
			submittedAt: new Date().toISOString()
		};
		
		const result = await createOrUpdateGuest(guestData);
		
		if (result.success) {
			console.log('✅ RSVP saved successfully');
			return json({
				success: true,
				message: 'תודה! האישור שלך נקלט במערכת',
				guest: result.data
			});
		} else {
			throw new Error(result.error || 'Failed to save RSVP');
		}
		
	} catch (error) {
		console.error('❌ Error saving RSVP:', error);
		return json({
			success: false,
			error: error.message || 'Failed to save RSVP'
		}, { status: 500 });
	}
}
