// Activate subscription for a specific page
import { json } from '@sveltejs/kit';
import { STRAPI_URL, STRAPI_API_TOKEN } from '$env/static/private';

/** @type {import('./$types').RequestHandler} */
export async function POST({ request, cookies }) {
	try {
		const { pageId, documentId, months = 1 } = await request.json();
		const userId = cookies.get('userId');
		
		if (!pageId && !documentId) {
			return json({ error: 'Page ID or Document ID is required' }, { status: 400 });
		}
		
		console.log(`📄 Activating subscription for page ${pageId || documentId} for ${months} months`);
		
		// Calculate dates
		const startDate = new Date();
		const expiryDate = new Date();
		expiryDate.setMonth(expiryDate.getMonth() + months);
		
		// First, get the page to find its documentId if we only have pageId
		let targetDocumentId = documentId;
		if (!targetDocumentId && pageId) {
			const pageResponse = await fetch(`${STRAPI_URL}/api/pages/${pageId}`, {
				headers: {
					'Authorization': `Bearer ${STRAPI_API_TOKEN}`
				}
			});
			
			if (pageResponse.ok) {
				const pageData = await pageResponse.json();
				targetDocumentId = pageData.data?.documentId;
			}
		}
		
		if (!targetDocumentId) {
			return json({ error: 'Could not find page document ID' }, { status: 404 });
		}
		
		// Update page with subscription status using documentId
		const updateResponse = await fetch(`${STRAPI_URL}/api/pages/${targetDocumentId}`, {
			method: 'PUT',
			headers: {
				'Content-Type': 'application/json',
				'Authorization': `Bearer ${STRAPI_API_TOKEN}`
			},
			body: JSON.stringify({
				data: {
					subscriptionStatus: 'active',
					subscriptionExpiry: expiryDate.toISOString()
				}
			})
		});
		
		if (!updateResponse.ok) {
			const errorText = await updateResponse.text();
			console.error('❌ Failed to update page:', updateResponse.status, errorText);
			return json({ error: 'Failed to activate subscription' }, { status: 500 });
		}
		
		const result = await updateResponse.json();
		console.log('✅ Page subscription activated:', result);
		
		// Also create/update subscription record in Strapi
		try {
			// Check if subscription already exists
			const existingSubResponse = await fetch(
				`${STRAPI_URL}/api/subscriptions?filters[page][documentId][$eq]=${targetDocumentId}`,
				{
					headers: {
						'Authorization': `Bearer ${STRAPI_API_TOKEN}`
					}
				}
			);
			
			if (existingSubResponse.ok) {
				const existingSubs = await existingSubResponse.json();
				
				if (existingSubs.data && existingSubs.data.length > 0) {
					// Update existing subscription
					const subId = existingSubs.data[0].id;
					await fetch(`${STRAPI_URL}/api/subscriptions/${subId}`, {
						method: 'PUT',
						headers: {
							'Content-Type': 'application/json',
							'Authorization': `Bearer ${STRAPI_API_TOKEN}`
						},
						body: JSON.stringify({
							data: {
								status: 'active',
								startDate: startDate.toISOString(),
								expiryDate: expiryDate.toISOString()
							}
						})
					});
				} else {
					// Create new subscription
					await fetch(`${STRAPI_URL}/api/subscriptions`, {
						method: 'POST',
						headers: {
							'Content-Type': 'application/json',
							'Authorization': `Bearer ${STRAPI_API_TOKEN}`
						},
						body: JSON.stringify({
							data: {
								page: result.data.id,
								user: userId ? parseInt(userId.replace('google_', '')) : null,
								status: 'active',
								startDate: startDate.toISOString(),
								expiryDate: expiryDate.toISOString()
							}
						})
					});
				}
			}
		} catch (subError) {
			console.error('⚠️ Error managing subscription record:', subError);
			// Don't fail the whole request if subscription record fails
		}
		
		return json({
			success: true,
			pageId: result.data.id,
			documentId: targetDocumentId,
			subscriptionStatus: 'active',
			subscriptionExpiry: expiryDate.toISOString()
		});
	} catch (error) {
		console.error('❌ Error activating page subscription:', error);
		return json({ error: error.message }, { status: 500 });
	}
}
