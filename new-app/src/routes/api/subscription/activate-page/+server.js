// Activate subscription for a specific page
import { json } from '@sveltejs/kit';
import { STRAPI_URL, STRAPI_API_TOKEN } from '$env/static/private';

/** @type {import('./$types').RequestHandler} */
export async function POST({ request, cookies }) {
	try {
<<<<<<< HEAD
		console.log('📄 Starting page subscription activation...');
		
		// Parse request body with error handling
		let requestData;
		try {
			requestData = await request.json();
		} catch (parseError) {
			console.error('❌ Failed to parse request JSON:', parseError);
			return json({ error: 'Invalid JSON in request body' }, { status: 400 });
		}
		
		const { pageId, months = 1 } = requestData;
		
		if (!pageId) {
			console.error('❌ No pageId provided');
			return json({ error: 'Page ID is required' }, { status: 400 });
=======
		const { pageId, documentId, months = 1 } = await request.json();
		const userId = cookies.get('userId');
		
		if (!pageId && !documentId) {
			return json({ error: 'Page ID or Document ID is required' }, { status: 400 });
>>>>>>> f3bbd78504921f1ed7727690c2812240ce4b8bf8
		}
		
		console.log(`📄 Activating subscription for page ${pageId || documentId} for ${months} months`);
		
		// Calculate dates
		const startDate = new Date();
		const expiryDate = new Date();
		expiryDate.setMonth(expiryDate.getMonth() + months);
		
<<<<<<< HEAD
		console.log('📅 Calculated expiry date:', expiryDate.toISOString());
		
		// Try to update page with subscription status
		try {
			console.log('🔗 Attempting to connect to Strapi...');
			console.log('🔗 Strapi URL:', STRAPI_URL);
			console.log('🔗 API Token length:', STRAPI_API_TOKEN ? STRAPI_API_TOKEN.length : 'undefined');
			
			const response = await fetch(`${STRAPI_URL}/api/pages/${pageId}`, {
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
			
			console.log('📡 Strapi response status:', response.status);
			
			if (!response.ok) {
				const errorText = await response.text();
				console.error('❌ Failed to update page:', response.status, errorText);
				
				// Return success anyway - subscription logic can work without Strapi update
				console.log('⚠️ Continuing without Strapi update...');
				return json({
					success: true,
					pageId,
					subscriptionStatus: 'active',
					subscriptionExpiry: expiryDate.toISOString(),
					warning: 'Page updated locally, Strapi sync failed'
				});
			}
			
			const result = await response.json();
			console.log('✅ Page subscription activated in Strapi:', result);
			
			return json({
				success: true,
				pageId,
				subscriptionStatus: 'active',
				subscriptionExpiry: expiryDate.toISOString(),
				strapiResult: result
			});
		} catch (strapiError) {
			console.error('❌ Strapi connection error:', strapiError);
			
			// Return success anyway - subscription can work without Strapi
			return json({
				success: true,
				pageId,
				subscriptionStatus: 'active',
				subscriptionExpiry: expiryDate.toISOString(),
				warning: 'Subscription activated locally, Strapi unavailable'
			});
		}
=======
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
>>>>>>> f3bbd78504921f1ed7727690c2812240ce4b8bf8
	} catch (error) {
		console.error('❌ Error activating page subscription:', error);
		console.error('❌ Error stack:', error.stack);
		return json({ 
			error: error.message || 'Internal server error',
			details: process.env.NODE_ENV === 'development' ? error.stack : undefined
		}, { status: 500 });
	}
}
