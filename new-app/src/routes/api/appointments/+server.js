import { json } from '@sveltejs/kit';
import { STRAPI_URL, STRAPI_API_TOKEN } from '$env/static/private';

/** @type {import('./$types').RequestHandler} */
export async function POST({ request }) {
	try {
		const body = await request.json();
		const { pageId, customerName, customerPhone, date, time, service, notes } = body;

		// Validate required fields
		if (!pageId || !customerName || !customerPhone || !date || !time || !service) {
			return json(
				{
					error: {
						status: 400,
						name: 'ValidationError',
						message: 'Missing required fields',
						details: {
							required: ['pageId', 'customerName', 'customerPhone', 'date', 'time', 'service']
						}
					}
				},
				{ status: 400 }
			);
		}

		// Create appointment in Strapi
		const response = await fetch(`${STRAPI_URL}/api/appointments`, {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json',
				Authorization: `Bearer ${STRAPI_API_TOKEN}`
			},
			body: JSON.stringify({
				data: {
					page: pageId,
					customerName,
					customerPhone,
					appointmentDate: date,
					appointmentTime: time,
					service,
					notes: notes || '',
					status: 'pending'
				}
			})
		});

		if (!response.ok) {
			const errorData = await response.json();
			return json(
				{
					error: {
						status: response.status,
						name: 'StrapiError',
						message: 'Failed to create appointment in Strapi',
						details: errorData
					}
				},
				{ status: response.status }
			);
		}

		const result = await response.json();
		const appointment = result.data;

		return json({
			id: appointment.id,
			status: appointment.attributes.status,
			appointmentDate: appointment.attributes.appointmentDate,
			appointmentTime: appointment.attributes.appointmentTime,
			customerName: appointment.attributes.customerName,
			customerPhone: appointment.attributes.customerPhone,
			service: appointment.attributes.service,
			notes: appointment.attributes.notes
		});
	} catch (error) {
		console.error('Error creating appointment:', error);
		return json(
			{
				error: {
					status: 500,
					name: 'InternalServerError',
					message: 'An unexpected error occurred',
					details: error.message
				}
			},
			{ status: 500 }
		);
	}
}
