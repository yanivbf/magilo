// @ts-check
import { json } from '@sveltejs/kit';

/**
 * POST /api/generate-html
 * Generate complete HTML page from template data (legacy compatibility)
 * @type {import('./$types').RequestHandler}
 */
export async function POST({ request }) {
	try {
		const body = await request.json();
		
		console.log('🎨 GENERATE HTML REQUEST:', JSON.stringify(body).substring(0, 200));

		// This endpoint is used by the legacy page-creator
		// It should generate a complete HTML page with all features
		
		// For now, redirect to the new create-page-with-template endpoint
		const response = await fetch('http://localhost:3000/api/create-page-with-template', {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json'
			},
			body: JSON.stringify(body)
		});

		const result = await response.json();
		
		return json(result);

	} catch (error) {
		console.error('❌ Error generating HTML:', error);
		return json(
			{ 
				success: false,
				error: error.message || 'Failed to generate HTML' 
			},
			{ status: 500 }
		);
	}
}
