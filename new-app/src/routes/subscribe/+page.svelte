<script>
	import { goto } from '$app/navigation';
	import { onMount } from 'svelte';
	
	let selectedPlan = $state('monthly');
	let loading = $state(false);
	let userId = $state('');
	let pageId = $state(''); // Page ID for per-page subscription
	
	const plans = {
		monthly: {
			name: 'חודשי',
			price: 59,
			period: 'לחודש',
			features: [
				'הסרת מיתוג AutoPage',
				'דומיין מותאם אישית',
				'אנליטיקס מתקדם',
				'תמיכה עדיפות 24/7',
				'גיבוי אוטומטי יומי',
				'SSL מאובטח'
			]
		},
		yearly: {
			name: 'שנתי',
			price: 590,
			originalPrice: 708,
			period: 'לשנה',
			save: '17% חיסכון',
			features: [
				'כל התכונות של התוכנית החודשית',
				'2 חודשים חינם!',
				'עדיפות בתמיכה',
				'ייעוץ אישי',
				'גיבוי בענן ללא הגבלה',
				'אפשרות ביטול בכל עת'
			]
		}
	};
	
	onMount(() => {
		// Get userId from cookie
		userId = document.cookie
			.split('; ')
			.find(row => row.startsWith('userId='))
			?.split('=')[1] || '';
		
		// Get pageId from URL
		const urlParams = new URLSearchParams(window.location.search);
		pageId = urlParams.get('pageId') || '';
		
		console.log('📄 Subscribing for page:', pageId);
		
		if (!userId) {
			alert('יש להתחבר כדי לרכוש מנוי');
			goto('/login');
		}
		
		if (!pageId) {
			alert('לא נמצא מזהה דף. חזרה לדשבורד.');
			goto('/dashboard');
		}
	});
	
	async function handleSubscribe() {
		loading = true;
		
		try {
			// Calculate months based on plan
			const months = selectedPlan === 'yearly' ? 12 : 1;
			
			console.log('📄 Activating subscription for page:', pageId);
			
			// Call API to activate subscription FOR THIS PAGE
			// pageId can be either numeric ID or documentId string
			const response = await fetch('/api/subscription/activate-page', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ 
					documentId: pageId, // Send as documentId (works for both formats)
					months 
				})
			});
			
			if (!response.ok) {
				const errorData = await response.json();
				console.error('❌ API Error:', errorData);
				throw new Error(errorData.error || 'Failed to activate subscription');
			}
			
			const result = await response.json();
			console.log('✅ Subscription activated for page:', result);
			
			// Redirect immediately to dashboard (alert was blocking)
			window.location.href = '/dashboard';
		} catch (error) {
			console.error('❌ Error activating subscription:', error);
			alert('שגיאה בהפעלת המנוי: ' + error.message + '\nנסה שוב.');
		} finally {
			loading = false;
		}
	}
</script>

<svelte:head>
	<title>שדרג ל-Premium - AutoPage</title>
</svelte:head>

<div class="subscribe-page">
	<!-- Header -->
	<div class="header">
		<button onclick={() => window.location.href = '/dashboard'} class="back-button">
			← חזרה
		</button>
		<h1 class="main-title">
			<span class="star">⭐</span>
			שדרג ל-Premium
			<span class="star">⭐</span>
		</h1>
		<p class="subtitle">קבל גישה לכל התכונות המתקדמות והפוך את הדף שלך למקצועי</p>
	</div>
	
	<!-- Plan Selector -->
	<div class="plan-selector">
		<button 
			class="plan-tab {selectedPlan === 'monthly' ? 'active' : ''}"
			onclick={() => selectedPlan = 'monthly'}
		>
			חודשי
		</button>
		<button 
			class="plan-tab {selectedPlan === 'yearly' ? 'active' : ''}"
			onclick={() => selectedPlan = 'yearly'}
		>
			שנתי
			<span class="save-badge">חסוך 17%</span>
		</button>
	</div>
	
	<!-- Plan Details -->
	<div class="plan-card">
		<div class="plan-header">
			<h2 class="plan-name">{plans[selectedPlan].name}</h2>
			<div class="price-container">
				{#if plans[selectedPlan].originalPrice}
					<span class="original-price">₪{plans[selectedPlan].originalPrice}</span>
				{/if}
				<span class="price">₪{plans[selectedPlan].price}</span>
				<span class="period">{plans[selectedPlan].period}</span>
			</div>
			{#if plans[selectedPlan].save}
				<div class="save-tag">{plans[selectedPlan].save}</div>
			{/if}
		</div>
		
		<div class="features-list">
			<h3 class="features-title">מה כלול בתוכנית:</h3>
			{#each plans[selectedPlan].features as feature}
				<div class="feature-item">
					<svg class="check-icon" viewBox="0 0 20 20" fill="currentColor">
						<path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd" />
					</svg>
					<span>{feature}</span>
				</div>
			{/each}
		</div>
		
		<button 
			class="subscribe-button {loading ? 'loading' : ''}"
			onclick={handleSubscribe}
			disabled={loading}
		>
			{#if loading}
				<span class="spinner"></span>
				מעבד תשלום...
			{:else}
				הפעל מנוי כעת
			{/if}
		</button>
		
		<p class="terms">
			בלחיצה על "הפעל מנוי כעת" אתה מסכים ל<a href="/legal/terms">תנאי השימוש</a> ול<a href="/legal/privacy">מדיניות הפרטיות</a>
		</p>
	</div>
	
	<!-- Trust Badges -->
	<div class="trust-section">
		<h3 class="trust-title">למה לבחור ב-Premium?</h3>
		<div class="trust-badges">
			<div class="badge">
				<div class="badge-icon">🔒</div>
				<div class="badge-title">תשלום מאובטח</div>
				<div class="badge-text">SSL 256-bit</div>
			</div>
			<div class="badge">
				<div class="badge-icon">💳</div>
				<div class="badge-title">ביטול בכל עת</div>
				<div class="badge-text">ללא התחייבות</div>
			</div>
			<div class="badge">
				<div class="badge-icon">⚡</div>
				<div class="badge-title">הפעלה מיידית</div>
				<div class="badge-text">תוך דקות</div>
			</div>
			<div class="badge">
				<div class="badge-icon">🎯</div>
				<div class="badge-title">תמיכה 24/7</div>
				<div class="badge-text">תמיד כאן בשבילך</div>
			</div>
		</div>
	</div>
	
	<!-- FAQ -->
	<div class="faq-section">
		<h3 class="faq-title">שאלות נפוצות</h3>
		<div class="faq-list">
			<details class="faq-item">
				<summary>האם אוכל לבטל את המנוי בכל עת?</summary>
				<p>כן! תוכל לבטל את המנוי בכל עת ללא עלויות נוספות. המנוי יישאר פעיל עד תום התקופה ששילמת עבורה.</p>
			</details>
			<details class="faq-item">
				<summary>מתי המנוי יופעל?</summary>
				<p>המנוי מופעל מיידית לאחר אישור התשלום, בדרך כלל תוך מספר דקות.</p>
			</details>
			<details class="faq-item">
				<summary>האם יש החזר כספי?</summary>
				<p>כן, אנחנו מציעים החזר כספי מלא תוך 14 יום מרגע הרכישה, ללא שאלות.</p>
			</details>
			<details class="faq-item">
				<summary>איזה אמצעי תשלום מקובלים?</summary>
				<p>אנחנו מקבלים כרטיסי אשראי (Visa, Mastercard, American Express), PayPal, ו-Bit.</p>
			</details>
		</div>
	</div>
</div>

<style>
	.subscribe-page {
		min-height: 100vh;
		background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
		padding: 2rem;
		font-family: 'Rubik', sans-serif;
	}
	
	.header {
		max-width: 800px;
		margin: 0 auto 3rem;
		text-align: center;
		color: white;
	}
	
	.back-button {
		background: rgba(255, 255, 255, 0.2);
		border: none;
		color: white;
		padding: 0.75rem 1.5rem;
		border-radius: 0.5rem;
		cursor: pointer;
		font-size: 1rem;
		margin-bottom: 2rem;
		transition: all 0.3s ease;
	}
	
	.back-button:hover {
		background: rgba(255, 255, 255, 0.3);
		transform: translateX(-5px);
	}
	
	.main-title {
		font-size: 3rem;
		font-weight: 800;
		margin-bottom: 1rem;
		display: flex;
		align-items: center;
		justify-content: center;
		gap: 1rem;
	}
	
	.star {
		font-size: 3.5rem;
		animation: pulse 2s ease-in-out infinite;
	}
	
	@keyframes pulse {
		0%, 100% { transform: scale(1); }
		50% { transform: scale(1.1); }
	}
	
	.subtitle {
		font-size: 1.25rem;
		opacity: 0.95;
	}
	
	.plan-selector {
		max-width: 500px;
		margin: 0 auto 2rem;
		display: flex;
		gap: 1rem;
		background: rgba(255, 255, 255, 0.2);
		padding: 0.5rem;
		border-radius: 1rem;
	}
	
	.plan-tab {
		flex: 1;
		background: transparent;
		border: none;
		color: white;
		padding: 1rem;
		border-radius: 0.75rem;
		cursor: pointer;
		font-size: 1.1rem;
		font-weight: 600;
		transition: all 0.3s ease;
		position: relative;
	}
	
	.plan-tab.active {
		background: white;
		color: #667eea;
	}
	
	.save-badge {
		display: block;
		font-size: 0.75rem;
		color: #fbbf24;
		font-weight: 700;
	}
	
	.plan-card {
		max-width: 600px;
		margin: 0 auto 3rem;
		background: white;
		border-radius: 1.5rem;
		padding: 3rem;
		box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
	}
	
	.plan-header {
		text-align: center;
		margin-bottom: 2rem;
		padding-bottom: 2rem;
		border-bottom: 2px solid #f3f4f6;
	}
	
	.plan-name {
		font-size: 2rem;
		font-weight: 700;
		color: #667eea;
		margin-bottom: 1rem;
	}
	
	.price-container {
		display: flex;
		align-items: baseline;
		justify-content: center;
		gap: 0.5rem;
	}
	
	.original-price {
		font-size: 1.5rem;
		color: #9ca3af;
		text-decoration: line-through;
	}
	
	.price {
		font-size: 3.5rem;
		font-weight: 800;
		color: #1f2937;
	}
	
	.period {
		font-size: 1.25rem;
		color: #6b7280;
	}
	
	.save-tag {
		display: inline-block;
		background: linear-gradient(135deg, #fbbf24, #f59e0b);
		color: white;
		padding: 0.5rem 1rem;
		border-radius: 2rem;
		font-weight: 700;
		margin-top: 1rem;
	}
	
	.features-list {
		margin-bottom: 2rem;
	}
	
	.features-title {
		font-size: 1.25rem;
		font-weight: 700;
		margin-bottom: 1.5rem;
		color: #1f2937;
	}
	
	.feature-item {
		display: flex;
		align-items: center;
		gap: 1rem;
		padding: 0.75rem 0;
		font-size: 1.1rem;
		color: #4b5563;
	}
	
	.check-icon {
		width: 1.5rem;
		height: 1.5rem;
		color: #10b981;
		flex-shrink: 0;
	}
	
	.subscribe-button {
		width: 100%;
		background: linear-gradient(135deg, #667eea, #764ba2);
		color: white;
		border: none;
		padding: 1.5rem;
		border-radius: 1rem;
		font-size: 1.25rem;
		font-weight: 800;
		cursor: pointer;
		transition: all 0.3s ease;
		margin-bottom: 1rem;
	}
	
	.subscribe-button:hover:not(:disabled) {
		transform: translateY(-3px);
		box-shadow: 0 10px 30px rgba(102, 126, 234, 0.4);
	}
	
	.subscribe-button:disabled {
		opacity: 0.7;
		cursor: not-allowed;
	}
	
	.subscribe-button.loading {
		display: flex;
		align-items: center;
		justify-content: center;
		gap: 0.75rem;
	}
	
	.spinner {
		width: 1.5rem;
		height: 1.5rem;
		border: 3px solid rgba(255, 255, 255, 0.3);
		border-top-color: white;
		border-radius: 50%;
		animation: spin 0.8s linear infinite;
	}
	
	@keyframes spin {
		to { transform: rotate(360deg); }
	}
	
	.terms {
		text-align: center;
		font-size: 0.875rem;
		color: #6b7280;
	}
	
	.terms a {
		color: #667eea;
		text-decoration: none;
	}
	
	.terms a:hover {
		text-decoration: underline;
	}
	
	.trust-section {
		max-width: 1000px;
		margin: 0 auto 3rem;
		text-align: center;
	}
	
	.trust-title {
		font-size: 2rem;
		font-weight: 700;
		color: white;
		margin-bottom: 2rem;
	}
	
	.trust-badges {
		display: grid;
		grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
		gap: 1.5rem;
	}
	
	.badge {
		background: white;
		padding: 2rem;
		border-radius: 1rem;
		box-shadow: 0 10px 30px rgba(0, 0, 0, 0.2);
	}
	
	.badge-icon {
		font-size: 3rem;
		margin-bottom: 1rem;
	}
	
	.badge-title {
		font-size: 1.25rem;
		font-weight: 700;
		color: #1f2937;
		margin-bottom: 0.5rem;
	}
	
	.badge-text {
		color: #6b7280;
	}
	
	.faq-section {
		max-width: 800px;
		margin: 0 auto;
		background: white;
		padding: 3rem;
		border-radius: 1.5rem;
		box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
	}
	
	.faq-title {
		font-size: 2rem;
		font-weight: 700;
		color: #1f2937;
		margin-bottom: 2rem;
		text-align: center;
	}
	
	.faq-list {
		display: flex;
		flex-direction: column;
		gap: 1rem;
	}
	
	.faq-item {
		border: 2px solid #e5e7eb;
		border-radius: 0.75rem;
		padding: 1.5rem;
		cursor: pointer;
		transition: all 0.3s ease;
	}
	
	.faq-item:hover {
		border-color: #667eea;
	}
	
	.faq-item summary {
		font-size: 1.1rem;
		font-weight: 600;
		color: #1f2937;
		list-style: none;
		display: flex;
		justify-content: space-between;
		align-items: center;
	}
	
	.faq-item summary::after {
		content: '+';
		font-size: 1.5rem;
		color: #667eea;
	}
	
	.faq-item[open] summary::after {
		content: '−';
	}
	
	.faq-item p {
		margin-top: 1rem;
		color: #6b7280;
		line-height: 1.6;
	}
	
	@media (max-width: 768px) {
		.subscribe-page {
			padding: 1rem;
		}
		
		.main-title {
			font-size: 2rem;
		}
		
		.star {
			font-size: 2.5rem;
		}
		
		.plan-card {
			padding: 2rem 1.5rem;
		}
		
		.price {
			font-size: 2.5rem;
		}
		
		.trust-badges {
			grid-template-columns: 1fr;
		}
		
		.faq-section {
			padding: 2rem 1.5rem;
		}
	}
</style>
