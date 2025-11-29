// @ts-check
import { json } from '@sveltejs/kit';
import { STRAPI_URL, STRAPI_API_TOKEN } from '$env/static/private';

/**
 * GET - Fetch day settings for a specific page
 * @type {import('./$types').RequestHandler}
 */
export async function GET({ params }) {
	const { pageId } = params;
	
	try {
		// Fetch day settings from Strapi
		const response = await fetch(
			`${STRAPI_URL}/api/day-settings?filters[pageId][$eq]=${pageId}`,
			{
				headers: {
					'Authorization': `Bearer ${STRAPI_API_TOKEN}`,
					'Content-Type': 'application/json'
				}
			}
		);
		
		if (!response.ok) {
			throw new Error('Failed to fetch day settings from Strapi');
		}
		
		const data = await response.json();
		
		// Transform Strapi response to our format
		const settings = data.data.map((/** @type {any} */ item) => ({
			id: item.id,
			dayOfWeek: item.attributes.dayOfWeek,
			isWorkingDay: item.attributes.isWorkingDay,
			workingHours: item.attributes.workingHours,
			breaks: item.attributes.breaks || [],
			closedDates: item.attributes.closedDates || []
		}));
		
		return json({ success: true, settings });
		
	} catch (error) {
		console.error('Error fetching day settings:', error);
		return json({ 
			success: false, 
			error: 'Failed to fetch day settings',
			settings: []
		}, { status: 500 });
	}
}

/**
 * POST - Save/Update day settings for a specific page
 * @type {import('./$types').RequestHandler}
 */
export async function POST({ params, request }) {
	const { pageId } = params;
	
	try {
		const { settings } = await request.json();
		
		if (!settings || !Array.isArray(settings)) {
			return json({ 
				success: false, 
				error: 'Invalid settings data' 
			}, { status: 400 });
		}
		
		// First, fetch existing settings to determine if we need to create or update
		const existingResponse = await fetch(
			`${STRAPI_URL}/api/day-settings?filters[pageId][$eq]=${pageId}`,
			{
				headers: {
					'Authorization': `Bearer ${STRAPI_API_TOKEN}`,
					'Content-Type': 'application/json'
				}
			}
		);
		
		const existingData = await existingResponse.json();
		const existingSettings = existingData.data || [];
		
		// Create a map of existing settings by dayOfWeek
		const existingMap = new Map(
			existingSettings.map((/** @type {any} */ item) => [item.attributes.dayOfWeek, item.id])
		);
		
		// Process each day setting
		const promises = settings.map(async (/** @type {any} */ setting) => {
			const existingId = existingMap.get(setting.dayOfWeek);
			
			const payload = {
				data: {
					pageId,
					dayOfWeek: setting.dayOfWeek,
					isWorkingDay: setting.isWorkingDay,
					workingHours: setting.workingHours,
					breaks: setting.breaks || [],
					closedDates: setting.closedDates || []
				}
			};
			
			if (existingId) {
				// Update existing setting
				return fetch(`${STRAPI_URL}/api/day-settings/${existingId}`, {
					method: 'PUT',
					headers: {
						'Authorization': `Bearer ${STRAPI_API_TOKEN}`,
						'Content-Type': 'application/json'
					},
					body: JSON.stringify(payload)
				});
			} else {
				// Create new setting
				return fetch(`${STRAPI_URL}/api/day-settings`, {
					method: 'POST',
					headers: {
						'Authorization': `Bearer ${STRAPI_API_TOKEN}`,
						'Content-Type': 'application/json'
					},
					body: JSON.stringify(payload)
				});
			}
		});
		
		// Wait for all operations to complete
		await Promise.all(promises);
		
		return json({ 
			success: true, 
			message: 'Day settings saved successfully' 
		});
		
	} catch (error) {
		console.error('Error saving day settings:', error);
		return json({ 
			success: false, 
			error: 'Failed to save day settings' 
		}, { status: 500 });
	}
}
