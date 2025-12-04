<script>
	import { onMount } from 'svelte';
	
	let { pageId } = $props();
	
	let analytics = $state({
		totalSales: 0,
		totalOrders: 0,
		totalCustomers: 0,
		totalLeads: 0,
		dailySales: {},
		monthlySales: {},
		topProducts: [],
		recentPurchases: []
	});
	
	let loading = $state(true);
	let error = $state('');
	let selectedPeriod = $state('week'); // week, month, year
	
	onMount(() => {
		loadAnalytics();
	});
	
	async function loadAnalytics() {
		loading = true;
		error = '';
		
		try {
			const response = await fetch(`/api/analytics/page/${pageId}`);
			if (!response.ok) {
				throw new Error('Failed to load analytics');
			}
			
			const data = await response.json();
			analytics = data;
		} catch (err) {
			error = err.message;
			console.error('Error loading analytics:', err);
		} finally {
			loading = false;
		}
	}
	
	function formatCurrency(amount) {
		return new Intl.NumberFormat('he-IL', {
			style: 'currency',
			currency: 'ILS'
		}).format(amount || 0);
	}
	
	function formatDate(dateString) {
		return new Date(dateString).toLocaleDateString('he-IL', {
			year: 'numeric',
			month: 'short',
			day: 'numeric'
		});
	}
	
	// Get daily sales for chart
	let dailySalesData = $derived(() => {
		const entries = Object.entries(analytics.dailySales || {});
		return entries
			.sort((a, b) => new Date(a[0]) - new Date(b[0]))
			.slice(-30); // Last 30 days
	});
	
	// Get monthly sales for chart
	let monthlySalesData = $derived(() => {
		const entries = Object.entries(analytics.monthlySales || {});
		return entries
			.sort((a, b) => new Date(a[0]) - new Date(b[0]))
			.slice(-12); // Last 12 months
	});
</script>

<div class="analytics-dashboard">
	<div class="dashboard-header">
		<h2 class="text-3xl font-bold text-purple-600 mb-2">📊 ניתוח ביצועים</h2>
		<p class="text-gray-600">סטטיסטיקות ותובנות על הדף שלך</p>
	</div>
	
	{#if loading}
		<div class="loading-state">
			<div class="spinner"></div>
			<p>טוען נתונים...</p>
		</div>
	{:else if error}
		<div class="error-state">
			<p class="text-red-600">❌ {error}</p>
			<button onclick={loadAnalytics} class="retry-btn">נסה שוב</button>
		</div>
	{:else}
		<!-- Stats Cards -->
		<div class="stats-grid">
			<div class="stat-card purple">
				<div class="stat-icon">💰</div>
				<div class="stat-value">{formatCurrency(analytics.totalSales)}</div>
				<div class="stat-label">סה"כ מכירות</div>
			</div>
			
			<div class="stat-card blue">
				<div class="stat-icon">📦</div>
				<div class="stat-value">{analytics.totalOrders}</div>
				<div class="stat-label">הזמנות</div>
			</div>
			
			<div class="stat-card green">
				<div class="stat-icon">👥</div>
				<div class="stat-value">{analytics.totalCustomers}</div>
				<div class="stat-label">לקוחות</div>
			</div>
			
			<div class="stat-card orange">
				<div class="stat-icon">📝</div>
				<div class="stat-value">{analytics.totalLeads}</div>
				<div class="stat-label">פניות</div>
			</div>
		</div>
		
		<!-- Charts Section -->
		<div class="charts-section">
			<!-- Daily Sales Chart -->
			<div class="chart-card">
				<h3 class="chart-title">📈 מכירות יומיות (30 ימים אחרונים)</h3>
				<div class="chart-container">
					{#if dailySalesData().length > 0}
						<div class="simple-bar-chart">
							{#each dailySalesData() as [date, amount]}
								{@const maxAmount = Math.max(...dailySalesData().map(d => d[1]))}
								{@const height = (amount / maxAmount) * 100}
								<div class="bar-wrapper">
									<div class="bar" style="height: {height}%">
										<span class="bar-value">{formatCurrency(amount)}</span>
									</div>
									<span class="bar-label">{formatDate(date)}</span>
								</div>
							{/each}
						</div>
					{:else}
						<p class="no-data">אין נתוני מכירות עדיין</p>
					{/if}
				</div>
			</div>
			
			<!-- Monthly Sales Chart -->
			<div class="chart-card">
				<h3 class="chart-title">📊 מכירות חודשיות (12 חודשים אחרונים)</h3>
				<div class="chart-container">
					{#if monthlySalesData().length > 0}
						<div class="simple-bar-chart">
							{#each monthlySalesData() as [month, amount]}
								{@const maxAmount = Math.max(...monthlySalesData().map(d => d[1]))}
								{@const height = (amount / maxAmount) * 100}
								<div class="bar-wrapper">
									<div class="bar monthly" style="height: {height}%">
										<span class="bar-value">{formatCurrency(amount)}</span>
									</div>
									<span class="bar-label">{month}</span>
								</div>
							{/each}
						</div>
					{:else}
						<p class="no-data">אין נתוני מכירות עדיין</p>
					{/if}
				</div>
			</div>
		</div>
		
		<!-- Top Products -->
		{#if analytics.topProducts && analytics.topProducts.length > 0}
			<div class="section-card">
				<h3 class="section-title">🏆 המוצרים המובילים</h3>
				<div class="products-grid">
					{#each analytics.topProducts.slice(0, 5) as product, index}
						<div class="product-item">
							<div class="product-rank">#{index + 1}</div>
							<div class="product-info">
								<div class="product-name">{product.name}</div>
								<div class="product-stats">
									<span class="stat">🛒 {product.sales} מכירות</span>
									<span class="stat">💰 {formatCurrency(product.revenue)}</span>
								</div>
							</div>
						</div>
					{/each}
				</div>
			</div>
		{/if}
		
		<!-- Recent Purchases -->
		{#if analytics.recentPurchases && analytics.recentPurchases.length > 0}
			<div class="section-card">
				<h3 class="section-title">🛍️ רכישות אחרונות</h3>
				<div class="purchases-list">
					{#each analytics.recentPurchases.slice(0, 10) as purchase}
						<div class="purchase-item">
							<div class="purchase-customer">{purchase.customerName}</div>
							<div class="purchase-amount">{formatCurrency(purchase.total)}</div>
							<div class="purchase-date">{formatDate(purchase.createdAt)}</div>
							<div class="purchase-status status-{purchase.status}">
								{purchase.status === 'completed' ? '✅ הושלם' : 
								 purchase.status === 'pending' ? '⏳ ממתין' : 
								 purchase.status === 'cancelled' ? '❌ בוטל' : purchase.status}
							</div>
						</div>
					{/each}
				</div>
			</div>
		{/if}
		
		<!-- Refresh Button -->
		<div class="actions">
			<button onclick={loadAnalytics} class="refresh-btn">
				🔄 רענן נתונים
			</button>
		</div>
	{/if}
</div>

<style>
	.analytics-dashboard {
		padding: 2rem;
		max-width: 1400px;
		margin: 0 auto;
	}
	
	.dashboard-header {
		margin-bottom: 2rem;
	}
	
	.loading-state, .error-state {
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
	
	.stats-grid {
		display: grid;
		grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
		gap: 1.5rem;
		margin-bottom: 2rem;
	}
	
	.stat-card {
		background: white;
		border-radius: 16px;
		padding: 2rem;
		box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
		text-align: center;
		transition: transform 0.3s ease;
	}
	
	.stat-card:hover {
		transform: translateY(-5px);
	}
	
	.stat-card.purple { border-top: 4px solid #8b5cf6; }
	.stat-card.blue { border-top: 4px solid #3b82f6; }
	.stat-card.green { border-top: 4px solid #10b981; }
	.stat-card.orange { border-top: 4px solid #f59e0b; }
	
	.stat-icon {
		font-size: 3rem;
		margin-bottom: 1rem;
	}
	
	.stat-value {
		font-size: 2rem;
		font-weight: 700;
		color: #1f2937;
		margin-bottom: 0.5rem;
	}
	
	.stat-label {
		color: #6b7280;
		font-size: 1rem;
	}
	
	.charts-section {
		display: grid;
		grid-template-columns: repeat(auto-fit, minmax(500px, 1fr));
		gap: 2rem;
		margin-bottom: 2rem;
	}
	
	.chart-card {
		background: white;
		border-radius: 16px;
		padding: 2rem;
		box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
	}
	
	.chart-title {
		font-size: 1.25rem;
		font-weight: 700;
		color: #1f2937;
		margin-bottom: 1.5rem;
	}
	
	.chart-container {
		min-height: 300px;
	}
	
	.simple-bar-chart {
		display: flex;
		align-items: flex-end;
		justify-content: space-between;
		height: 250px;
		gap: 0.5rem;
		padding: 1rem 0;
	}
	
	.bar-wrapper {
		flex: 1;
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: 0.5rem;
	}
	
	.bar {
		width: 100%;
		background: linear-gradient(135deg, #8b5cf6 0%, #6d28d9 100%);
		border-radius: 8px 8px 0 0;
		position: relative;
		min-height: 20px;
		transition: all 0.3s ease;
	}
	
	.bar:hover {
		background: linear-gradient(135deg, #7c3aed 0%, #5b21b6 100%);
		transform: scaleY(1.05);
	}
	
	.bar.monthly {
		background: linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%);
	}
	
	.bar-value {
		position: absolute;
		top: -25px;
		left: 50%;
		transform: translateX(-50%);
		font-size: 0.75rem;
		font-weight: 600;
		color: #1f2937;
		white-space: nowrap;
		opacity: 0;
		transition: opacity 0.3s ease;
	}
	
	.bar:hover .bar-value {
		opacity: 1;
	}
	
	.bar-label {
		font-size: 0.7rem;
		color: #6b7280;
		transform: rotate(-45deg);
		white-space: nowrap;
		margin-top: 1rem;
	}
	
	.no-data {
		text-align: center;
		color: #9ca3af;
		padding: 4rem 0;
	}
	
	.section-card {
		background: white;
		border-radius: 16px;
		padding: 2rem;
		box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
		margin-bottom: 2rem;
	}
	
	.section-title {
		font-size: 1.5rem;
		font-weight: 700;
		color: #1f2937;
		margin-bottom: 1.5rem;
	}
	
	.products-grid {
		display: grid;
		gap: 1rem;
	}
	
	.product-item {
		display: flex;
		align-items: center;
		gap: 1rem;
		padding: 1rem;
		background: #f9fafb;
		border-radius: 12px;
		transition: all 0.3s ease;
	}
	
	.product-item:hover {
		background: #f3f4f6;
		transform: translateX(-5px);
	}
	
	.product-rank {
		font-size: 1.5rem;
		font-weight: 700;
		color: #8b5cf6;
		min-width: 40px;
	}
	
	.product-info {
		flex: 1;
	}
	
	.product-name {
		font-weight: 600;
		color: #1f2937;
		margin-bottom: 0.25rem;
	}
	
	.product-stats {
		display: flex;
		gap: 1rem;
		font-size: 0.875rem;
		color: #6b7280;
	}
	
	.purchases-list {
		display: grid;
		gap: 0.75rem;
	}
	
	.purchase-item {
		display: grid;
		grid-template-columns: 2fr 1fr 1fr 1fr;
		gap: 1rem;
		padding: 1rem;
		background: #f9fafb;
		border-radius: 12px;
		align-items: center;
	}
	
	.purchase-customer {
		font-weight: 600;
		color: #1f2937;
	}
	
	.purchase-amount {
		font-weight: 700;
		color: #8b5cf6;
	}
	
	.purchase-date {
		font-size: 0.875rem;
		color: #6b7280;
	}
	
	.purchase-status {
		text-align: center;
		padding: 0.25rem 0.75rem;
		border-radius: 9999px;
		font-size: 0.875rem;
		font-weight: 600;
	}
	
	.status-completed {
		background: #d1fae5;
		color: #065f46;
	}
	
	.status-pending {
		background: #fef3c7;
		color: #92400e;
	}
	
	.status-cancelled {
		background: #fee2e2;
		color: #991b1b;
	}
	
	.actions {
		text-align: center;
		margin-top: 2rem;
	}
	
	.refresh-btn, .retry-btn {
		background: linear-gradient(135deg, #8b5cf6 0%, #6d28d9 100%);
		color: white;
		padding: 0.75rem 2rem;
		border-radius: 12px;
		border: none;
		font-weight: 600;
		cursor: pointer;
		transition: all 0.3s ease;
	}
	
	.refresh-btn:hover, .retry-btn:hover {
		transform: translateY(-2px);
		box-shadow: 0 10px 25px rgba(139, 92, 246, 0.3);
	}
	
	@media (max-width: 768px) {
		.charts-section {
			grid-template-columns: 1fr;
		}
		
		.purchase-item {
			grid-template-columns: 1fr;
			gap: 0.5rem;
		}
		
		.bar-label {
			font-size: 0.6rem;
		}
	}
</style>
