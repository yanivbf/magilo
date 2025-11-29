// @ts-check
import { json } from '@sveltejs/kit';
import { updateLeadStatus } from '$lib/server/strapi.js';

/**
 * PUT /api/lead/[leadId]/status
 * Update lead appointment status
 * @type {import('./$types').RequestHandler}
 */
export async function PUT({ params, request }) {
	try {
		const { leadId } = params;
		const body = await request.json();
		const { appointmentStatus } = body;

		console.log('📋 UPDATE LEAD STATUS:', {
			leadId,
			appointmentStatus
		});

		// Validate required fields
		if (!leadId) {
			return json({ error: 'Missing leadId' }, { status: 400 });
		}

		if (!appointmentStatus) {
			return json({ error: 'Missing appointmentStatus' }, { status: 400 });
		}

		// Validate status value
		const validStatuses = ['pending', 'confirmed', 'completed', 'cancelled'];
		if (!validStatuses.includes(appointmentStatus)) {
			return json(
				{
					error: `Invalid appointmentStatus. Must be one of: ${validStatuses.join(', ')}`
				},
				{ status: 400 }
			);
		}

		// Update lead status in Strapi
		await updateLeadStatus(leadId, appointmentStatus);

		console.log(`✅ Lead ${leadId} status updated to: ${appointmentStatus}`);

		return json({
			success: true,
			message: 'Lead status updated successfully'
		});
	} catch (error) {
		console.error('❌ Error updating lead status:', error);
		return json(
			{
				error: 'Failed to update lead status',
				details: error.message
			},
			{ status: 500 }
		);
	}
}
