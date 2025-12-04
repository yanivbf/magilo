// @ts-check
import { json } from '@sveltejs/kit';
import { GOOGLE_TTS_API_KEY } from '$env/static/private';

/**
 * Text-to-Speech API using Google Cloud TTS
 * @type {import('./$types').RequestHandler}
 */
export async function POST({ request }) {
	try {
		const { text } = await request.json();
		
		if (!text) {
			return json({ error: 'Text is required' }, { status: 400 });
		}
		
		// Use Google Cloud TTS API
		// Note: In production, you should use proper API keys and authentication
		const API_KEY = GOOGLE_TTS_API_KEY || '';
		
		console.log('🔑 Google TTS API Key:', API_KEY ? 'Found ✅' : 'Missing ❌');
		
		if (!API_KEY) {
			// Fallback: Use browser's built-in speech synthesis
			console.log('⚠️ Using browser fallback TTS');
			return json({ 
				error: 'TTS not configured',
				fallback: true 
			}, { status: 503 });
		}
		
		const response = await fetch(
			`https://texttospeech.googleapis.com/v1/text:synthesize?key=${API_KEY}`,
			{
				method: 'POST',
				headers: {
					'Content-Type': 'application/json'
				},
				body: JSON.stringify({
					input: { text },
					voice: {
						languageCode: 'he-IL',
						name: 'he-IL-Wavenet-A', // Female voice
						ssmlGender: 'FEMALE'
					},
					audioConfig: {
						audioEncoding: 'MP3',
						pitch: 0,
						speakingRate: 1.0
					}
				})
			}
		);
		
		if (!response.ok) {
			const errorData = await response.text();
			console.error('❌ Google TTS API Error:', response.status, errorData);
			throw new Error('TTS API request failed');
		}
		
		const data = await response.json();
		
		// Convert base64 audio to buffer
		const audioBuffer = Buffer.from(data.audioContent, 'base64');
		
		console.log('✅ Google TTS Success! Audio size:', audioBuffer.length, 'bytes');
		
		return new Response(audioBuffer, {
			headers: {
				'Content-Type': 'audio/mpeg',
				'Content-Length': audioBuffer.length.toString()
			}
		});
		
	} catch (error) {
		console.error('TTS Error:', error);
		return json({ 
			error: 'Failed to generate speech',
			fallback: true 
		}, { status: 500 });
	}
}
