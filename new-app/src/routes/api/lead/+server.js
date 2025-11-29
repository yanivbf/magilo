// @ts-check
import { json } from '@sveltejs/kit';
import { createLead, incrementLeadAnalytics } from '$lib/server/strapi.js';

/**
 * POST /api/lead
 * Submit a lead form
 * @type {import('./$types').RequestHandler}
 */
export async function POST({ request }) {
	try {
		const body = await request.json();
		const {
			userId,
			pageId,
			name,
			phone,
			email,
			message,
			appointmentDate,
			appointmentStatus
		} = body;

		console.log('📋 LEAD SUBMISSION:', {
			userId,
			pageId,
			name,
			hasPhone: !!phone,
			hasEmail: !!email,
			isAppointment: !!appointmentDate
		});

		// Validate required fields
		if (!userId) {
			return json({ error: 'Missing userId' }, { status: 400 });
		}

		if (!pageId) {
			return json({ error: 'Missing pageId' }, { status: 400 });
		}

		if (!name) {
			return json({ error: 'Missing name' }, { status: 400 });
		}

		// Validate that at least phone or email is provided
		if (!phone && !email) {
			return json({ error: 'Either phone or email is required' }, { status: 400 });
		}

		// Create lead in Strapi
		const leadResponse = await createLead({
			userId,
			pageId,
			name,
			phone: phone || '',
			email: email || '',
			message: message || '',
			appointmentDate: appointmentDate || null,
			appointmentStatus: appointmentStatus || 'pending'
		});

		const leadId = leadResponse.data.id;
		console.log(`✅ Lead created with ID: ${leadId}`);

		// Update analytics
		try {
			await incrementLeadAnalytics(pageId);
			console.log(`✅ Analytics updated for page ${pageId}`);
		} catch (analyticsError) {
			console.error('⚠️ Failed to update analytics:', analyticsError);
			// Don't fail the request if analytics update fails
		}

		return json({
			success: true,
			leadId,
			message: 'Lead submitted successfully'
		});
	} catch (error) {
		console.error('❌ Error creating lead:', error);
		return json(
			{
				error: 'Failed to submit lead',
				details: error.message
			},
			{ status: 500 }
		);
	}
}
