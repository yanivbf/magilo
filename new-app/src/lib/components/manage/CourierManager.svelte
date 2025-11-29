<!-- Courier/Driver Management - EXACT Legacy Port from driver-app.html -->
<script>
	import { onMount } from 'svelte';
	import { browser } from '$app/environment';
	
	let { pageData } = $props();
	
	// State
	let currentUser = $state(null);
	let allOrders = $state([]);
	let currentTab = $state('pending');
	let isOnline = $state(true);
	let notification = $state('');
	let showNotif = $state(false);
	
	// Stats
	let todayDeliveries = $derived(allOrders.filter(o => o.status === 'delivered' || o.status === 'completed').length);
	let todayEarnings = $derived(allOrders
		.filter(o => o.status === 'delivered' || o.status === 'completed')
		.reduce((sum, o) => sum + (o.deliveryFee || 30), 0));
	let pendingCount = $derived(allOrders.filter(o => o.status === 'pending' || o.status === 'new').length);
	let activeCount = $derived(allOrders.filter(o => o.status === 'picked' || o.status === 'in_transit').length);
	let completedCount = $derived(allOrders.filter(o => o.status === 'delivered' || o.status === 'completed').length);
	
	// Filtered orders based on tab
	let filteredOrders = $derived(() => {
		if (currentTab === 'pending') {
			return allOrders.filter(o => o.status === 'pending' || o.status === 'new');
		} else if (currentTab === 'active') {
			return allOrders.filter(o => o.status === 'picked' || o.status === 'in_transit');
		} else if (currentTab === 'completed') {
			return allOrders.filter(o => o.status === 'delivered' || o.status === 'completed');
		}
		return allOrders;
	});
	
	// Map state
	let map = $state(null);
	let markers = $state([]);
	let driverMarker = $state(null);
	let driverLocation = $state(null);
	let directionsService = $state(null);
	let directionsRenderer = $state(null);
	let geocoder = $state(null);
	
	onMount(() => {
		loadAllOrders();
		
		// Refresh orders every 30 seconds
		const interval = setInterval(loadAllOrders, 30000);
		
		// Initialize Google Maps if on map tab
		if (browser && window.google) {
			initMap();
		}
		
		return () => clearInterval(interval);
	});
	
	async function loadAllOrders() {
		try {
			const response = await fetch('/api/all-delivery-orders');
			if (response.ok) {
				const data = await response.json();
				allOrders = data.orders || [];
			} else {
				// Fallback: try to get from database
				const dbResponse = await fetch('/api/db-purchases');
				if (dbResponse.ok) {
					const dbData = await dbResponse.json();
					allOrders = dbData.purchases || [];
				}
			}
		} catch (error) {
			console.error('Error loading orders:', error);
			allOrders = [];
		}
	}
	
	function showTab(tab) {
		currentTab = tab;
		if (tab === 'map' && browser && window.google && !map) {
			setTimeout(initMap, 100);
		}
	}
	
	function getStatusText(status) {
		const statuses = {
			'pending': 'ממתין לאיסוף',
			'new': 'חדש',
			'picked': 'נאסף',
			'in_transit': 'בדרך',
			'delivered': 'נמסר',
			'completed': 'הושלם'
		};
		return statuses[status] || status;
	}
	
	async function pickupOrder(orderId) {
		const order = allOrders.find(o => o.id === orderId);
		if (order) {
			order.status = 'picked';
			try {
				await fetch('/api/update-order-status', {
					method: 'POST',
					headers: { 'Content-Type': 'application/json' },
					body: JSON.stringify({ orderId, status: 'picked' })
				});
			} catch (e) {
				console.log('Local update only');
			}
			showNotification('📦 ההזמנה נאספה!');
			allOrders = [...allOrders];
		}
	}
	
	async function deliverOrder(orderId) {
		const order = allOrders.find(o => o.id === orderId);
		if (order) {
			order.status = 'delivered';
			try {
				await fetch('/api/update-order-status', {
					method: 'POST',
					headers: { 'Content-Type': 'application/json' },
					body: JSON.stringify({ orderId, status: 'delivered' })
				});
			} catch (e) {
				console.log('Local update only');
			}
			showNotification('✅ המשלוח הושלם!');
			allOrders = [...allOrders];
		}
	}
	
	function navigate(address) {
		if (!address) {
			showNotification('❌ אין כתובת לנווט אליה');
			return;
		}
		const encodedAddress = encodeURIComponent(address);
		window.open(`https://www.google.com/maps/search/?api=1&query=${encodedAddress}`, '_blank');
	}
	
	function callCustomer(phone) {
		if (phone) {
			window.location.href = `tel:${phone}`;
		}
	}
	
	function toggleDriverStatus() {
		isOnline = !isOnline;
		showNotification(isOnline ? '✅ אתה מחובר ומקבל הזמנות' : '⚠️ אתה לא מחובר - לא תקבל הזמנות חדשות');
	}
	
	function showNotification(message) {
		notification = message;
		showNotif = true;
		setTimeout(() => { showNotif = false; }, 3000);
	}
	
	// Google Maps Integration
	function initMap() {
		if (!browser || !window.google) return;
		
		const defaultLocation = { lat: 32.0853, lng: 34.7818 };
		
		map = new window.google.maps.Map(document.getElementById('driver-map'), {
			center: defaultLocation,
			zoom: 13,
			styles: [
				{ elementType: "geometry", stylers: [{ color: "#1a1a2e" }] },
				{ elementType: "labels.text.stroke", stylers: [{ color: "#1a1a2e" }] },
				{ elementType: "labels.text.fill", stylers: [{ color: "#746855" }] },
				{ featureType: "road", elementType: "geometry", stylers: [{ color: "#38414e" }] },
				{ featureType: "road", elementType: "geometry.stroke", stylers: [{ color: "#212a37" }] },
				{ featureType: "road.highway", elementType: "geometry", stylers: [{ color: "#746855" }] },
				{ featureType: "water", elementType: "geometry", stylers: [{ color: "#17263c" }] },
			]
		});
		
		directionsService = new window.google.maps.DirectionsService();
		directionsRenderer = new window.google.maps.DirectionsRenderer({
			map: map,
			suppressMarkers: true,
			polylineOptions: {
				strokeColor: '#667eea',
				strokeWeight: 5
			}
		});
		geocoder = new window.google.maps.Geocoder();
		
		getDriverLocation();
	}
	
	function getDriverLocation() {
		if (navigator.geolocation) {
			navigator.geolocation.getCurrentPosition(
				(position) => {
					driverLocation = {
						lat: position.coords.latitude,
						lng: position.coords.longitude
					};
					
					if (driverMarker) {
						driverMarker.setPosition(driverLocation);
					} else {
						driverMarker = new window.google.maps.Marker({
							position: driverLocation,
							map: map,
							icon: {
								url: 'data:image/svg+xml;charset=UTF-8,' + encodeURIComponent(`
									<svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 40 40">
										<circle cx="20" cy="20" r="18" fill="#667eea" stroke="white" stroke-width="3"/>
										<text x="20" y="26" text-anchor="middle" fill="white" font-size="18">🚗</text>
									</svg>
								`),
								scaledSize: new window.google.maps.Size(40, 40)
							},
							title: 'המיקום שלי'
						});
					}
					
					map.setCenter(driverLocation);
				},
				(error) => {
					console.error('Geolocation error:', error);
					showNotification('⚠️ לא ניתן לקבל מיקום - אנא אשר גישה למיקום');
				},
				{ enableHighAccuracy: true }
			);
		}
	}
</script>

<!-- Notification -->
{#if showNotif}
	<div class="notification show">{notification}</div>
{/if}

<!-- Header -->
<div class="header">
	<h1>🚚 אפליקציית שליחים</h1>
	<button class="driver-status {isOnline ? 'online' : 'offline'}" onclick={toggleDriverStatus}>
		<span class="status-dot"></span>
		<span>{isOnline ? 'מחובר' : 'לא מחובר'}</span>
	</button>
</div>

<!-- Stats -->
<div class="stats-grid">
	<div class="stat-card">
		<div class="stat-value">{todayDeliveries}</div>
		<div class="stat-label">משלוחים היום</div>
	</div>
	<div class="stat-card">
		<div class="stat-value">₪{todayEarnings}</div>
		<div class="stat-label">הכנסות היום</div>
	</div>
	<div class="stat-card">
		<div class="stat-value">{pendingCount}</div>
		<div class="stat-label">ממתינים</div>
	</div>
</div>

<!-- Tabs -->
<div class="tabs">
	<button class="tab {currentTab === 'pending' ? 'active' : ''}" onclick={() => showTab('pending')}>
		<span class="badge">{pendingCount}</span>
		ממתינים
	</button>
	<button class="tab {currentTab === 'active' ? 'active' : ''}" onclick={() => showTab('active')}>
		<span class="badge">{activeCount}</span>
		בדרך
	</button>
	<button class="tab {currentTab === 'map' ? 'active' : ''}" onclick={() => showTab('map')}>
		🗺️ מפה
	</button>
	<button class="tab {currentTab === 'completed' ? 'active' : ''}" onclick={() => showTab('completed')}>
		<span class="badge">{completedCount}</span>
		הושלמו
	</button>
</div>

<!-- Map Container -->
{#if currentTab === 'map'}
	<div id="map-container">
		<div id="driver-map" style="width: 100%; height: 400px; border-radius: 16px; margin-bottom: 15px;"></div>
		<div id="route-info" class="route-info"></div>
	</div>
{/if}

<!-- Orders List -->
<div class="orders-list">
	{#if filteredOrders().length === 0}
		<div class="empty-state">
			<div class="emoji">{currentTab === 'completed' ? '🎉' : '📭'}</div>
			<h3>{currentTab === 'completed' ? 'עדיין אין משלוחים שהושלמו' : 'אין הזמנות ממתינות'}</h3>
			<p>{currentTab === 'pending' ? 'הזמנות חדשות יופיעו כאן' : ''}</p>
		</div>
	{:else}
		{#each filteredOrders() as order (order.id)}
			<div class="order-card">
				<div class="order-header">
					<div>
						<div class="order-id">#{order.id}</div>
						<div class="order-store">{order.storeName || order.pageName || 'חנות'}</div>
					</div>
					<span class="order-status status-{order.status}">{getStatusText(order.status)}</span>
				</div>
				
				{#if order.products && order.products.length > 0}
					<div class="products-preview">
						{#each order.products as product}
							<span class="product-chip">{product.name} x{product.quantity || 1}</span>
						{/each}
					</div>
				{/if}
				
				<div class="order-details">
					<div class="detail-row">
						<div class="detail-icon">👤</div>
						<span>{order.customerName || 'לקוח'}</span>
						<button class="call-btn" onclick={() => callCustomer(order.customerPhone)}>📞</button>
					</div>
					<div class="detail-row">
						<div class="detail-icon">📍</div>
						<span>{order.customerAddress || 'לא צוינה'}</span>
					</div>
					<div class="detail-row">
						<div class="detail-icon">📞</div>
						<span>{order.customerPhone || 'לא צוין'}</span>
					</div>
				</div>
				
				<div class="order-total">₪{order.total || 0}</div>
				
				<div class="order-actions">
					{#if order.status === 'pending' || order.status === 'new'}
						<button class="btn btn-primary" onclick={() => pickupOrder(order.id)}>
							📦 איסוף
						</button>
						<button class="btn btn-navigate" onclick={() => navigate(order.customerAddress)}>
							🗺️ נווט
						</button>
					{:else if order.status === 'picked' || order.status === 'in_transit'}
						<button class="btn btn-success" onclick={() => deliverOrder(order.id)}>
							✅ נמסר
						</button>
						<button class="btn btn-navigate" onclick={() => navigate(order.customerAddress)}>
							🗺️ נווט
						</button>
					{:else}
						<button class="btn btn-secondary" disabled>
							✅ הושלם
						</button>
					{/if}
				</div>
			</div>
		{/each}
	{/if}
</div>

<style>
	/* EXACT Legacy Styles from driver-app.html */
	.notification {
		position: fixed;
		top: 20px;
		left: 50%;
		transform: translateX(-50%);
		background: linear-gradient(135deg, #00b894, #00cec9);
		color: white;
		padding: 15px 25px;
		border-radius: 12px;
		font-weight: 600;
		z-index: 1000;
		opacity: 0;
		transition: opacity 0.3s ease;
	}
	
	.notification.show {
		opacity: 1;
	}
	
	.header {
		display: flex;
		justify-content: space-between;
		align-items: center;
		padding: 15px 0;
		border-bottom: 1px solid rgba(255,255,255,0.1);
		margin-bottom: 20px;
	}
	
	.header h1 {
		font-size: 1.5rem;
		display: flex;
		align-items: center;
		gap: 10px;
		margin: 0;
	}
	
	.driver-status {
		display: flex;
		align-items: center;
		gap: 8px;
		padding: 8px 16px;
		border-radius: 20px;
		font-size: 0.9rem;
		font-weight: 600;
		cursor: pointer;
		transition: all 0.3s ease;
		border: none;
	}
	
	.driver-status.online {
		background: linear-gradient(135deg, #00b894, #00cec9);
		color: white;
	}
	
	.driver-status.offline {
		background: rgba(255,255,255,0.1);
		color: #aaa;
	}
	
	.status-dot {
		width: 10px;
		height: 10px;
		border-radius: 50%;
		animation: pulse 2s infinite;
	}
	
	.online .status-dot {
		background: #fff;
	}
	
	.offline .status-dot {
		background: #666;
		animation: none;
	}
	
	@keyframes pulse {
		0%, 100% { opacity: 1; }
		50% { opacity: 0.5; }
	}
	
	.stats-grid {
		display: grid;
		grid-template-columns: repeat(3, 1fr);
		gap: 12px;
		margin-bottom: 25px;
	}
	
	.stat-card {
		background: rgba(255,255,255,0.05);
		border-radius: 16px;
		padding: 15px;
		text-align: center;
		border: 1px solid rgba(255,255,255,0.1);
	}
	
	.stat-value {
		font-size: 1.8rem;
		font-weight: 700;
		background: linear-gradient(135deg, #667eea, #764ba2);
		-webkit-background-clip: text;
		-webkit-text-fill-color: transparent;
	}
	
	.stat-label {
		font-size: 0.75rem;
		color: #aaa;
		margin-top: 5px;
	}
	
	.tabs {
		display: flex;
		gap: 10px;
		margin-bottom: 20px;
	}
	
	.tab {
		flex: 1;
		padding: 12px;
		border: none;
		border-radius: 12px;
		background: rgba(255,255,255,0.05);
		color: #aaa;
		font-size: 0.9rem;
		font-weight: 600;
		cursor: pointer;
		transition: all 0.3s ease;
	}
	
	.tab.active {
		background: linear-gradient(135deg, #667eea, #764ba2);
		color: white;
	}
	
	.tab .badge {
		background: rgba(255,255,255,0.2);
		padding: 2px 8px;
		border-radius: 10px;
		font-size: 0.75rem;
		margin-left: 5px;
	}
	
	.orders-list {
		display: flex;
		flex-direction: column;
		gap: 15px;
	}
	
	.order-card {
		background: rgba(255,255,255,0.05);
		border-radius: 20px;
		padding: 20px;
		border: 1px solid rgba(255,255,255,0.1);
		transition: all 0.3s ease;
	}
	
	.order-card:hover {
		transform: translateY(-2px);
		border-color: rgba(102, 126, 234, 0.5);
	}
	
	.order-header {
		display: flex;
		justify-content: space-between;
		align-items: flex-start;
		margin-bottom: 15px;
	}
	
	.order-id {
		font-size: 0.8rem;
		color: #888;
	}
	
	.order-store {
		font-size: 1.1rem;
		font-weight: 700;
		margin-top: 5px;
	}
	
	.order-status {
		padding: 6px 12px;
		border-radius: 20px;
		font-size: 0.75rem;
		font-weight: 600;
	}
	
	.status-pending, .status-new {
		background: linear-gradient(135deg, #f39c12, #e74c3c);
		color: white;
	}
	
	.status-picked, .status-in_transit {
		background: linear-gradient(135deg, #3498db, #2980b9);
		color: white;
	}
	
	.status-delivered, .status-completed {
		background: linear-gradient(135deg, #00b894, #00cec9);
		color: white;
	}
	
	.products-preview {
		display: flex;
		gap: 8px;
		flex-wrap: wrap;
		margin-bottom: 10px;
	}
	
	.product-chip {
		background: rgba(255,255,255,0.1);
		padding: 4px 10px;
		border-radius: 15px;
		font-size: 0.8rem;
		color: #ccc;
	}
	
	.order-details {
		display: flex;
		flex-direction: column;
		gap: 10px;
		margin-bottom: 15px;
	}
	
	.detail-row {
		display: flex;
		align-items: center;
		gap: 10px;
		color: #ccc;
		font-size: 0.9rem;
	}
	
	.detail-icon {
		width: 30px;
		height: 30px;
		background: rgba(255,255,255,0.1);
		border-radius: 8px;
		display: flex;
		align-items: center;
		justify-content: center;
	}
	
	.call-btn {
		width: 40px;
		height: 40px;
		border-radius: 50%;
		background: linear-gradient(135deg, #00b894, #00cec9);
		border: none;
		color: white;
		font-size: 1.2rem;
		cursor: pointer;
		display: flex;
		align-items: center;
		justify-content: center;
		margin-right: auto;
	}
	
	.order-total {
		font-size: 1.3rem;
		font-weight: 700;
		color: #00b894;
		text-align: right;
		margin-bottom: 15px;
	}
	
	.order-actions {
		display: flex;
		gap: 10px;
	}
	
	.btn {
		flex: 1;
		padding: 12px;
		border: none;
		border-radius: 12px;
		font-size: 0.9rem;
		font-weight: 600;
		cursor: pointer;
		transition: all 0.3s ease;
		display: flex;
		align-items: center;
		justify-content: center;
		gap: 8px;
	}
	
	.btn-primary {
		background: linear-gradient(135deg, #667eea, #764ba2);
		color: white;
	}
	
	.btn-success {
		background: linear-gradient(135deg, #00b894, #00cec9);
		color: white;
	}
	
	.btn-secondary {
		background: rgba(255,255,255,0.1);
		color: #fff;
	}
	
	.btn-navigate {
		background: linear-gradient(135deg, #3498db, #2980b9);
		color: white;
	}
	
	.btn:hover:not(:disabled) {
		transform: scale(1.02);
	}
	
	.btn:disabled {
		opacity: 0.5;
		cursor: not-allowed;
	}
	
	.empty-state {
		text-align: center;
		padding: 60px 20px;
		color: #888;
	}
	
	.empty-state .emoji {
		font-size: 4rem;
		margin-bottom: 20px;
	}
	
	.empty-state h3 {
		font-size: 1.2rem;
		margin-bottom: 10px;
		color: #fff;
	}
	
	#map-container {
		margin-bottom: 20px;
	}
	
	.route-info {
		background: rgba(255,255,255,0.05);
		border-radius: 12px;
		padding: 15px;
		margin-bottom: 15px;
		border: 1px solid rgba(255,255,255,0.1);
	}
</style>
