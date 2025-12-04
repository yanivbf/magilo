<script>
	import { onMount } from 'svelte';
	
	let { pageId, userId } = $props();
	
	let subscription = $state({
		hasSubscription: false,
		status: 'none',
		plan: null,
		expiresAt: null,
		daysRemaining: 0
	});
	
	let loading = $state(true);
	let processing = $state(false);
	let error = $state('');
	let success = $state('');
	
	const plans = [
		{
			id: 'free',
			name: 'חינם',
			price: 0,
			features: [
				'דף נחיתה בסיסי',
				'מיתוג AutoPage',
				'תמיכה בסיסית',
				'עד 100 צפיות בחודש'
			]
		},
		{
			id: 'premium',
			name: 'פרימיום',
			price: 49,
			duration: 'monthly',
			features: [
				'הסרת מיתוג AutoPage',
				'דומיין מותאם אישית',
				'אנליטיקס מתקדם',
				'תמיכה עדיפות',
				'צפיות ללא הגבלה',
				'גיבוי אוטומטי'
			],
			popular: true
		},
		{
			id: 'premium-yearly',
			name: 'פרימיום שנתי',
			price: 490,
			duration: 'yearly',
			savings: '2 חודשים חינם!',
			features: [
				'כל תכונות הפרימיום',
				'חיסכון של 20%',
				'תמיכה VIP',
				'ייעוץ אישי'
			]
		}
	];
	
	onMount(() => {
		loadSubscription();
	});
	
	async function loadSubscription() {
		loading = true;
		error = '';
		
		try {
			const response = await fetch(`/api/subscription/status/${pageId}`);
			if (!response.ok) {
				throw new Error('Failed to load subscription');
			}
			
			const data = await response.json();
			if (data.success) {
				subscription = data;
			}
		} catch (err) {
			error = err.message;
			console.error('Error loading subscription:', err);
		} finally {
			loading = false;
		}
	}
	
	async function activateSubscription(plan, duration = 'monthly') {
		if (!confirm(`האם אתה בטוח שברצונך להפעיל מנוי ${plan}?`)) {
			return;
		}
		
		processing = true;
		error = '';
		success = '';
		
		try {
			const response = await fetch('/api/subscription/activate', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({
					pageId,
					userId,
					plan,
					duration
				})
			});
			
			if (!response.ok) {
				throw new Error('Failed to activate subscription');
			}
			
			const data = await response.json();
			if (data.success) {
				success = 'המנוי הופעל בהצלחה!';
				await loadSubscription();
			} else {
				throw new Error(data.error || 'Activation failed');
			}
		} catch (err) {
			error = err.message;
		} finally {
			processing = false;
		}
	}
	
	async function deactivateSubscription() {
		if (!confirm('האם אתה בטוח שברצונך לבטל את המנוי? התכונות הפרימיום יפסיקו לפעול.')) {
			return;
		}
		
		processing = true;
		error = '';
		success = '';
		
		try {
			const response = await fetch('/api/subscription/deactivate', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ pageId, userId })
			});
			
			if (!response.ok) {
				throw new Error('Failed to deactivate subscription');
			}
			
			const data = await response.json();
			if (data.success) {
				success = 'המנוי בוטל בהצלחה';
				await loadSubscription();
			} else {
				throw new Error(data.error || 'Deactivation failed');
			}
		} catch (err) {
			error = err.message;
		} finally {
			processing = false;
		}
	}
	
	function formatDate(dateString) {
		return new Date(dateString).toLocaleDateString('he-IL', {
			year: 'numeric',
			month: 'long',
			day: 'numeric'
		});
	}
</script>

<div class="subscription-manager">
	<div class="header">
		<h2 class="text-3xl font-bold text-purple-600 mb-2">⭐ ניהול מנוי</h2>
		<p class="text-gray-600">שדרג את הדף שלך לפרימיום</p>
	</div>
	
	{#if loading}
		<div class="loading">
			<div class="spinner"></div>
			<p>טוען מידע...</p>
		</div>
	{:else}
		<!-- Current Status -->
		{#if subscription.hasSubscription && subscription.status === 'active'}
			<div class="current-plan">
				<div class="plan-badge active">✅ מנוי פעיל</div>
				<h3>מנוי {subscription.plan}</h3>
				<p>תוקף עד: {formatDate(subscription.expiresAt)}</p>
				<p class="days-remaining">
					{subscription.daysRemaining} ימים נותרו
				</p>
				<button onclick={deactivateSubscription} disabled={processing} class="cancel-btn">
					ביטול מנוי
				</button>
			</div>
		{:else}
			<div class="current-plan free">
				<div class="plan-badge">חינם</div>
				<h3>אתה משתמש בתוכנית החינמית</h3>
				<p>שדרג לפרימיום לתכונות מתקדמות</p>
			</div>
		{/if}
		
		<!-- Messages -->
		{#if error}
			<div class="message error">❌ {error}</div>
		{/if}
		{#if success}
			<div class="message success">✅ {success}</div>
		{/if}
		
		<!-- Plans -->
		<div class="plans-grid">
			{#each plans as plan}
				<div class="plan-card {plan.popular ? 'popular' : ''}">
					{#if plan.popular}
						<div class="popular-badge">🔥 הכי פופולרי</div>
					{/if}
					
					<h3 class="plan-name">{plan.name}</h3>
					
					<div class="plan-price">
						{#if plan.price === 0}
							<span class="price">חינם</span>
						{:else}
							<span class="price">₪{plan.price}</span>
							<span class="period">/{plan.duration === 'yearly' ? 'שנה' : 'חודש'}</span>
						{/if}
					</div>
					
					{#if plan.savings}
						<div class="savings">{plan.savings}</div>
					{/if}
					
					<ul class="features">
						{#each plan.features as feature}
							<li>✓ {feature}</li>
						{/each}
					</ul>
					
					{#if plan.id !== 'free'}
						<button 
							onclick={() => activateSubscription(plan.id, plan.duration)}
							disabled={processing || (subscription.status === 'active' && subscription.plan === plan.id)}
							class="activate-btn"
						>
							{processing ? 'מעבד...' : 
							 subscription.status === 'active' && subscription.plan === plan.id ? 'מנוי פעיל' :
							 'הפעל מנוי'}
						</button>
					{/if}
				</div>
			{/each}
		</div>
		
		<!-- FAQ -->
		<div class="faq">
			<h3>שאלות נפוצות</h3>
			<div class="faq-item">
				<strong>מה קורה אם אבטל את המנוי?</strong>
				<p>המנוי יישאר פעיל עד תום התקופה ששילמת עבורה.</p>
			</div>
			<div class="faq-item">
				<strong>האם אוכל לשדרג/להוריד דרגה?</strong>
				<p>כן, תוכל לשנות את התוכנית בכל עת.</p>
			</div>
			<div class="faq-item">
				<strong>איך מתבצע התשלום?</strong>
				<p>התשלום מתבצע באמצעות כרטיס אשראי או PayPal.</p>
			</div>
		</div>
	{/if}
</div>

<style>
	.subscription-manager {
		padding: 2rem;
		max-width: 1200px;
		margin: 0 auto;
	}
	
	.header {
		margin-bottom: 2rem;
	}
	
	.loading {
		text-align: center;
		padding: 4rem 2rem;
	}
	
	.spinner {
		width: 50px;
		height: 50px;
		border: 4px solid #f3f4f6;
		border-top-color: #8b5cf6;
		border-radius: 50%;
		animation: spin 1s linear infinite;
		margin: 0 auto 1rem;
	}
	
	@keyframes spin {
		to { transform: rotate(360deg); }
	}
	
	.current-plan {
		background: white;
		border-radius: 16px;
		padding: 2rem;
		margin-bottom: 2rem;
		box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
		text-align: center;
	}
	
	.current-plan.free {
		background: linear-gradient(135deg, #f3f4f6 0%, #e5e7eb 100%);
	}
	
	.plan-badge {
		display: inline-block;
		padding: 0.5rem 1rem;
		border-radius: 9999px;
		font-weight: 600;
		margin-bottom: 1rem;
		background: #e5e7eb;
		color: #374151;
	}
	
	.plan-badge.active {
		background: #d1fae5;
		color: #065f46;
	}
	
	.days-remaining {
		color: #8b5cf6;
		font-weight: 600;
		margin: 1rem 0;
	}
	
	.cancel-btn {
		background: #ef4444;
		color: white;
		padding: 0.75rem 2rem;
		border-radius: 12px;
		border: none;
		font-weight: 600;
		cursor: pointer;
		margin-top: 1rem;
	}
	
	.cancel-btn:hover:not(:disabled) {
		background: #dc2626;
	}
	
	.message {
		padding: 1rem;
		border-radius: 12px;
		margin-bottom: 2rem;
		text-align: center;
		font-weight: 600;
	}
	
	.message.error {
		background: #fee2e2;
		color: #991b1b;
	}
	
	.message.success {
		background: #d1fae5;
		color: #065f46;
	}
	
	.plans-grid {
		display: grid;
		grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
		gap: 2rem;
		margin-bottom: 3rem;
	}
	
	.plan-card {
		background: white;
		border-radius: 16px;
		padding: 2rem;
		box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
		position: relative;
		transition: transform 0.3s ease;
	}
	
	.plan-card:hover {
		transform: translateY(-5px);
	}
	
	.plan-card.popular {
		border: 3px solid #8b5cf6;
		box-shadow: 0 8px 30px rgba(139, 92, 246, 0.3);
	}
	
	.popular-badge {
		position: absolute;
		top: -12px;
		right: 50%;
		transform: translateX(50%);
		background: linear-gradient(135deg, #8b5cf6 0%, #6d28d9 100%);
		color: white;
		padding: 0.5rem 1rem;
		border-radius: 9999px;
		font-size: 0.875rem;
		font-weight: 700;
	}
	
	.plan-name {
		font-size: 1.5rem;
		font-weight: 700;
		color: #1f2937;
		margin-bottom: 1rem;
	}
	
	.plan-price {
		margin-bottom: 1rem;
	}
	
	.price {
		font-size: 3rem;
		font-weight: 700;
		color: #8b5cf6;
	}
	
	.period {
		color: #6b7280;
		font-size: 1rem;
	}
	
	.savings {
		background: #fef3c7;
		color: #92400e;
		padding: 0.5rem 1rem;
		border-radius: 9999px;
		font-size: 0.875rem;
		font-weight: 600;
		display: inline-block;
		margin-bottom: 1rem;
	}
	
	.features {
		list-style: none;
		padding: 0;
		margin: 2rem 0;
	}
	
	.features li {
		padding: 0.75rem 0;
		border-bottom: 1px solid #f3f4f6;
		color: #374151;
	}
	
	.activate-btn {
		width: 100%;
		background: linear-gradient(135deg, #8b5cf6 0%, #6d28d9 100%);
		color: white;
		padding: 1rem;
		border-radius: 12px;
		border: none;
		font-weight: 700;
		font-size: 1.125rem;
		cursor: pointer;
		transition: all 0.3s ease;
	}
	
	.activate-btn:hover:not(:disabled) {
		transform: translateY(-2px);
		box-shadow: 0 10px 25px rgba(139, 92, 246, 0.3);
	}
	
	.activate-btn:disabled {
		opacity: 0.5;
		cursor: not-allowed;
	}
	
	.faq {
		background: white;
		border-radius: 16px;
		padding: 2rem;
		box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
	}
	
	.faq h3 {
		font-size: 1.5rem;
		font-weight: 700;
		color: #1f2937;
		margin-bottom: 1.5rem;
	}
	
	.faq-item {
		padding: 1rem 0;
		border-bottom: 1px solid #f3f4f6;
	}
	
	.faq-item:last-child {
		border-bottom: none;
	}
	
	.faq-item strong {
		display: block;
		color: #1f2937;
		margin-bottom: 0.5rem;
	}
	
	.faq-item p {
		color: #6b7280;
	}
	
	@media (max-width: 768px) {
		.plans-grid {
			grid-template-columns: 1fr;
		}
	}
</style>
