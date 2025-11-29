// @ts-check
import { json } from '@sveltejs/kit';
import { getLeadsByPage } from '$lib/server/strapi.js';

/**
 * GET /api/leads/[pageId]
 * Get all leads for a page
 * @type {import('./$types').RequestHandler}
 */
export async function GET({ params }) {
	try {
		const { pageId } = params;

		if (!pageId) {
			return json({ error: 'Missing pageId' }, { status: 400 });
		}

		console.log(`📋 Getting leads for page: ${pageId}`);

		// Get leads from Strapi
		const leads = await getLeadsByPage(pageId);

		console.log(`✅ Found ${leads.length} leads for page ${pageId}`);

		// Transform response
		const transformedLeads = leads.map((lead) => ({
			id: lead.id,
			name: lead.attributes.name,
			phone: lead.attributes.phone,
			email: lead.attributes.email,
			message: lead.attributes.message,
			appointmentDate: lead.attributes.appointmentDate,
			appointmentStatus: lead.attributes.appointmentStatus,
			createdAt: lead.attributes.createdAt,
			// Include user info if populated
			user: lead.attributes.user?.data
				? {
						id: lead.attributes.user.data.id,
						name: lead.attributes.user.data.attributes.name
					}
				: null
		}));

		return json({
			success: true,
			leads: transformedLeads,
			count: transformedLeads.length
		});
	} catch (error) {
		console.error('❌ Error getting leads:', error);
		return json(
			{
				error: 'Failed to get leads',
				details: error.message
			},
			{ status: 500 }
		);
	}
}
