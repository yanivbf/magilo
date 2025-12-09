// N8N Webhook Proxy - to fix CORS issues
// Two different webhooks:
// 1. Content generation (for creating page content)
const N8N_CONTENT_WEBHOOK = 'https://n8n-service-how4.onrender.com/webhook/jhfuhgufkhlkuho8erhfaadsgdrghre546yrthfg12w23';
// 2. Bot bubble (for user interactions on pages)
const N8N_BOT_WEBHOOK = 'https://n8n-service-how4.onrender.com/webhook/jhfuhgufkhlkuho8erhf757754jhldkbsjkbkfhkfggyt';

// Choose webhook based on action
function getWebhookUrl(action) {
	if (action === 'generate_content') {
		return N8N_CONTENT_WEBHOOK;
	}
	return N8N_BOT_WEBHOOK;
}

export async function POST({ request }) {
	try {
		const body = await request.json();
		
		// Choose the right webhook based on action
		const webhookUrl = getWebhookUrl(body.action);
		
		console.log('📤 Proxying request to N8N:', body);
		console.log('🎯 Using webhook:', webhookUrl);
		
		const response = await fetch(webhookUrl, {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json'
			},
			body: JSON.stringify(body)
		});
		
		if (!response.ok) {
			throw new Error(`N8N webhook failed: ${response.statusText}`);
		}
		
		const data = await response.json();
		console.log('✅ N8N response:', data);
		
		return new Response(JSON.stringify(data), {
			status: 200,
			headers: {
				'Content-Type': 'application/json',
				'Access-Control-Allow-Origin': '*'
			}
		});
		
	} catch (error) {
		console.error('❌ N8N webhook error:', error);
		return new Response(JSON.stringify({ 
			error: error.message,
			success: false 
		}), {
			status: 500,
			headers: {
				'Content-Type': 'application/json'
			}
		});
	}
}

export async function OPTIONS() {
	return new Response(null, {
		status: 200,
		headers: {
			'Access-Control-Allow-Origin': '*',
			'Access-Control-Allow-Methods': 'POST, OPTIONS',
			'Access-Control-Allow-Headers': 'Content-Type'
		}
	});
}
