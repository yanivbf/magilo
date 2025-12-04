<script>
	// Content Generator Bot - Generates content for sections using AI
	let { sectionType = 'about', businessName = '', onContentGenerated } = $props();
	
	let loading = $state(false);
	let error = $state('');
	
	const sectionLabels = {
		about: 'אודות',
		services: 'שירותים',
		testimonials: 'המלצות',
		faq: 'שאלות ותשובות',
		team: 'צוות',
		gallery: 'גלריה'
	};
	
	async function generateContent() {
		if (!businessName) {
			error = 'נא למלא את שם העסק קודם';
			return;
		}
		
		loading = true;
		error = '';
		
		try {
			const response = await fetch('/api/n8n-webhook', {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json'
				},
				body: JSON.stringify({
					businessName,
					sectionType,
					action: 'generate_content'
				})
			});
			
			if (!response.ok) {
				throw new Error('Failed to generate content');
			}
			
			const data = await response.json();
			
			if (data.success && data.content) {
				onContentGenerated?.(data.content);
			} else {
				throw new Error(data.error || 'No content generated');
			}
			
		} catch (err) {
			console.error('Content generation error:', err);
			error = 'שגיאה ביצירת תוכן. נסה שוב.';
		} finally {
			loading = false;
		}
	}
</script>

<button
	onclick={generateContent}
	disabled={loading || !businessName}
	class="content-generator-btn {loading ? 'loading' : ''}"
	title="צור תוכן אוטומטי עם AI"
>
	{#if loading}
		<span class="spinner"></span>
		מייצר תוכן...
	{:else}
		🤖 צור תוכן ל{sectionLabels[sectionType] || sectionType}
	{/if}
</button>

{#if error}
	<div class="error-message">
		{error}
	</div>
{/if}

<style>
	.content-generator-btn {
		display: inline-flex;
		align-items: center;
		gap: 8px;
		padding: 10px 20px;
		background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
		color: white;
		border: none;
		border-radius: 8px;
		font-size: 14px;
		font-weight: 600;
		cursor: pointer;
		transition: all 0.3s ease;
		box-shadow: 0 4px 12px rgba(102, 126, 234, 0.3);
	}
	
	.content-generator-btn:hover:not(:disabled) {
		transform: translateY(-2px);
		box-shadow: 0 6px 20px rgba(102, 126, 234, 0.4);
	}
	
	.content-generator-btn:disabled {
		opacity: 0.6;
		cursor: not-allowed;
	}
	
	.content-generator-btn.loading {
		pointer-events: none;
	}
	
	.spinner {
		display: inline-block;
		width: 16px;
		height: 16px;
		border: 2px solid rgba(255, 255, 255, 0.3);
		border-top-color: white;
		border-radius: 50%;
		animation: spin 0.8s linear infinite;
	}
	
	@keyframes spin {
		to {
			transform: rotate(360deg);
		}
	}
	
	.error-message {
		margin-top: 8px;
		padding: 8px 12px;
		background: #fee;
		color: #c33;
		border-radius: 4px;
		font-size: 14px;
	}
</style>
