// API endpoint for fetching appointments by page ID
import { json } from '@sveltejs/kit';
import { STRAPI_URL, STRAPI_TOKEN } from '$env/static/private';

export async function GET({ params }) {
	const { pageId } = params;

	try {
		// Fetch appointments from Strapi (using leads collection for now)
		const response = await fetch(`${STRAPI_URL}/api/leads?filters[pageId][$eq]=${pageId}&populate=*`, {
			headers: {
				'Authorization': `Bearer ${STRAPI_TOKEN}`,
				'Content-Type': 'application/json'
			}
		});

		if (!response.ok) {
			console.error('Failed to fetch appointments from Strapi');
			return json({ appointments: [] }, { status: 200 });
		}

		const data = await response.json();
		const leads = data.data || [];

		// Transform leads into appointments format
		const appointments = leads
			.filter(lead => lead.attributes?.appointmentDate && lead.attributes?.appointmentTime)
			.map(lead => {
				const attrs = lead.attributes || {};
				
				return {
					id: lead.id,
					customerName: attrs.name || attrs.customerName || 'לקוח',
					phone: attrs.phone || attrs.customerPhone || '',
					email: attrs.email || attrs.customerEmail || '',
					date: attrs.appointmentDate || new Date().toISOString().split('T')[0],
					time: attrs.appointmentTime || '09:00',
					service: attrs.service || attrs.message || '',
					notes: attrs.notes || attrs.additionalInfo || '',
					status: attrs.status || 'pending',
					createdAt: attrs.createdAt,
					updatedAt: attrs.updatedAt
				};
			});

		return json({ appointments }, { status: 200 });

	} catch (error) {
		console.error('Error fetching appointments:', error);
		return json({ appointments: [], error: error.message }, { status: 500 });
	}
}
