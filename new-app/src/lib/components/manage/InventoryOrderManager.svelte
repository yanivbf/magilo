<!-- Store Inventory & Order Manager (Ported from legacy/store-admin.html) -->
<script>
	import { onMount } from 'svelte';

	let { data } = $props();
	
	// State
	let currentFilter = $state('all');
	let searchTerm = $state('');
	let filterDate = $state('');
	
	// Get orders from purchases data
	const allOrders = $derived(() => {
		return (data.purchases || []).map(purchase => ({
			id: purchase.documentId || purchase.id,
			date: purchase.createdAt?.split('T')[0] || new Date().toISOString().split('T')[0],
			time: purchase.createdAt ? new Date(purchase.createdAt).toLocaleTimeString('he-IL', { hour: '2-digit', minute: '2-digit' }) : '',
			customer: {
				name: purchase.customerName || 'לקוח',
				phone: purchase.customerPhone || '',
				email: purchase.customerEmail || '',
				address: purchase.shippingAddress || 'איסוף עצמי'
			},
			items: purchase.items || [],
			total: purchase.totalAmount || 0,
			status: purchase.status || 'pending',
			shipping: purchase.shippingMethod || 'delivery',
			trackingNumber: purchase.trackingNumber || '',
			notes: purchase.notes || ''
		}));
	});
	
	// Statistics
	const stats = $derived(() => {
		const orders = allOrders;
		const total = orders.length;
		const pending = orders.filter(o => o.status === 'pending' || !o.status).length;
		const processing = orders.filter(o => o.status === 'processing').length;
		const shipped = orders.filter(o => o.status === 'shipped').length;
		const delivered = orders.filter(o => o.status === 'delivered').length;
		
		const revenue = orders
			.filter(o => o.status !== 'cancelled')
			.reduce((sum, o) => sum + (o.total || 0), 0);
		
		return {
			total,
			pending,
			processing,
			shipped,
			delivered,
			revenue
		};
	});
	
	// Filtered orders
	const filteredOrders = $derived(() => {
		let orders = allOrders;
		
		// Apply status/date filter
		if (currentFilter !== 'all') {
			const today = new Date();
			today.setHours(0, 0, 0, 0);
			
			const weekStart = new Date(today);
			weekStart.setDate(weekStart.getDate() - 7);
			
			orders = orders.filter(order => {
				const orderDate = new Date(order.date);
				orderDate.setHours(0, 0, 0, 0);
				
				switch(currentFilter) {
					case 'today':
						return orderDate.getTime() === today.getTime();
					case 'week':
						return orderDate >= weekStart && orderDate <= today;
					case 'pending':
						return order.status === 'pending' || !order.status;
					case 'processing':
						return order.status === 'processing';
					case 'shipped':
						return order.status === 'shipped';
					case 'delivered':
						return order.status === 'delivered';
					case 'cancelled':
						return order.status === 'cancelled';
					default:
						return true;
				}
			});
		}
		
		// Apply date filter
		if (filterDate) {
			orders = orders.filter(order => order.date === filterDate);
		}
		
		// Apply search filter
		if (searchTerm) {
			const query = searchTerm.toLowerCase();
			orders = orders.filter(order => {
				const customerName = (order.customer?.name || '').toLowerCase();
				const customerPhone = order.customer?.phone || '';
				const orderId = (order.id || '').toLowerCase();
				const items = (order.items || []).map(i => i.name?.toLowerCase() || '').join(' ');
				
				return customerName.includes(query) ||
					   customerPhone.includes(query) ||
					   orderId.includes(query) ||
					   items.includes(query);
			});
		}
		
		return orders;
	});
	
	// Update order status
	async function updateStatus(orderId, newStatus) {
		try {
			const response = await fetch(`/api/purchase/${orderId}/status`, {
				method: 'PUT',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ status: newStatus })
			});
			
			if (response.ok) {
				showToast(`הסטטוס עודכן ל: ${getStatusText(newStatus)}`);
				// Reload page
				window.location.reload();
			} else {
				alert('שגיאה בעדכון הסטטוס');
			}
		} catch (error) {
			console.error('Error updating status:', error);
			alert('שגיאה בעדכון הסטטוס');
		}
	}
	
	function getStatusText(status) {
		const texts = {
			'pending': 'ממתינה לטיפול',
			'processing': 'בטיפול',
			'shipped': 'נשלחה',
			'delivered': 'הושלמה',
			'cancelled': 'בוטלה'
		};
		return texts[status] || status;
	}
	
	// Prompt for tracking number
	function promptTrackingNumber(orderId) {
		const trackingNumber = prompt('הזן מספר מעקב למשלוח:');
		if (trackingNumber) {
			// Update with tracking number and change status to shipped
			updateStatus(orderId, 'shipped');
			showToast('מספר המעקב נוסף והסטטוס עודכן לנשלח');
		}
	}
	
	// Contact customer via WhatsApp
	function contactCustomer(phone) {
		if (!phone) {
			alert('לא נמצא מספר טלפון');
			return;
		}
		
		const cleanPhone = phone.replace(/[^0-9]/g, '');
		const israelPhone = cleanPhone.startsWith('0') ? '972' + cleanPhone.substring(1) : cleanPhone;
		window.open(`https://wa.me/${israelPhone}`, '_blank');
	}
	
	// Export orders to CSV
	function exportOrders() {
		const headers = ['מספר הזמנה', 'תאריך', 'לקוח', 'טלפון', 'אימייל', 'כתובת', 'מוצרים', 'סה"כ', 'סטטוס'];
		const rows = allOrders.map(o => [
			o.id,
			o.date,
			o.customer?.name || '',
			o.customer?.phone || '',
			o.customer?.email || '',
			o.customer?.address || '',
			(o.items || []).map(i => `${i.name}(${i.quantity})`).join('; '),
			o.total,
			getStatusText(o.status)
		]);
		
		const csv = [headers.join(','), ...rows.map(r => r.map(c => `"${c}"`).join(','))].join('\n');
		const blob = new Blob(['\ufeff' + csv], { type: 'text/csv;charset=utf-8;' });
		const url = URL.createObjectURL(blob);
		const link = document.createElement('a');
		link.href = url;
		link.download = `orders_${new Date().toISOString().split('T')[0]}.csv`;
		link.click();
		
		showToast('הקובץ הורד בהצלחה');
	}
	
	// Refresh data
	function refreshData() {
		window.location.reload();
		showToast('הנתונים עודכנו');
	}
	
	// Show toast notification
	function showToast(message) {
		const toast = document.createElement('div');
		toast.className = 'fixed bottom-4 left-4 bg-gray-800 text-white px-6 py-3 rounded-lg shadow-lg z-50';
		toast.textContent = message;
		document.body.appendChild(toast);
		
		setTimeout(() => {
			toast.remove();
		}, 3000);
	}
	
	// Format currency
	function formatCurrency(amount) {
		return `₪${(amount || 0).toLocaleString()}`;
	}
	
	// Format date
	function formatDate(dateString) {
		const hebrewDays = ['ראשון', 'שני', 'שלישי', 'רביעי', 'חמישי', 'שישי', 'שבת'];
		const date = new Date(dateString);
		const dayName = hebrewDays[date.getDay()];
		return `${dayName}, ${date.getDate()}/${date.getMonth() + 1}/${date.getFullYear()}`;
	}
</script>

<!-- EXACT LEGACY LAYOUT FROM store-admin.html -->
<div class="min-h-screen bg-gray-50">
	<!-- Header (EXACT from legacy) -->
	<header class="bg-white shadow-md sticky top-0 z-50">
		<div class="container mx-auto px-6 py-4">
			<div class="flex items-center justify-between">
				<div class="flex items-center gap-4">
					<h1 class="text-2xl font-bold text-gray-800">🛒 ניהול חנות</h1>
					<span class="text-lg text-gray-600">({data.page?.title || 'החנות שלי'})</span>
				</div>
				<div class="flex gap-3">
					<button onclick={refreshData} class="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition">
						🔄 רענן
					</button>
					<button onclick={() => window.print()} class="px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition">
						🖨️ הדפס
					</button>
					<button onclick={exportOrders} class="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition">
						📊 ייצא לאקסל
					</button>
					<a href="/dashboard" class="px-4 py-2 bg-purple-500 text-white rounded-lg hover:bg-purple-600 transition">
						← חזור לדשבורד
					</a>
				</div>
			</div>
		</div>
	</header>

	<div class="container mx-auto px-6 py-8">
		<!-- Statistics Cards (EXACT from legacy) -->
		<div class="grid grid-cols-1 md:grid-cols-5 gap-4 mb-8">
			<div class="stat-card">
				<div class="text-sm opacity-90 mb-2">סה"כ הזמנות</div>
				<div class="text-3xl font-bold">{stats.total}</div>
			</div>
			<div class="stat-card amber">
				<div class="text-sm opacity-90 mb-2">ממתינות לטיפול</div>
				<div class="text-3xl font-bold">{stats.pending}</div>
			</div>
			<div class="stat-card blue">
				<div class="text-sm opacity-90 mb-2">בטיפול</div>
				<div class="text-3xl font-bold">{stats.processing}</div>
			</div>
			<div class="stat-card purple">
				<div class="text-sm opacity-90 mb-2">נשלחו</div>
				<div class="text-3xl font-bold">{stats.shipped}</div>
			</div>
			<div class="stat-card green">
				<div class="text-sm opacity-90 mb-2">הושלמו</div>
				<div class="text-3xl font-bold">{stats.delivered}</div>
			</div>
		</div>

		<!-- Revenue Card (EXACT from legacy) -->
		<div class="bg-gradient-to-r from-emerald-500 to-teal-600 rounded-xl shadow-lg p-6 mb-8 text-white">
			<div class="flex items-center justify-between">
				<div>
					<div class="text-sm opacity-90 mb-1">סה"כ הכנסות</div>
					<div class="text-4xl font-bold">{formatCurrency(stats.revenue)}</div>
				</div>
				<div class="text-6xl opacity-50">💰</div>
			</div>
		</div>

		<!-- Filter Tabs (EXACT from legacy) -->
		<div class="bg-white rounded-xl shadow-md p-6 mb-8">
			<div class="flex gap-3 flex-wrap">
				<button 
					class="tab-button {currentFilter === 'all' ? 'active' : ''}" 
					onclick={() => currentFilter = 'all'}
				>
					הכל
				</button>
				<button 
					class="tab-button {currentFilter === 'today' ? 'active' : ''}" 
					onclick={() => currentFilter = 'today'}
				>
					היום
				</button>
				<button 
					class="tab-button {currentFilter === 'week' ? 'active' : ''}" 
					onclick={() => currentFilter = 'week'}
				>
					השבוע
				</button>
				<button 
					class="tab-button {currentFilter === 'pending' ? 'active' : ''}" 
					onclick={() => currentFilter = 'pending'}
				>
					⏳ ממתינות
				</button>
				<button 
					class="tab-button {currentFilter === 'processing' ? 'active' : ''}" 
					onclick={() => currentFilter = 'processing'}
				>
					🔄 בטיפול
				</button>
				<button 
					class="tab-button {currentFilter === 'shipped' ? 'active' : ''}" 
					onclick={() => currentFilter = 'shipped'}
				>
					📦 נשלחו
				</button>
				<button 
					class="tab-button {currentFilter === 'delivered' ? 'active' : ''}" 
					onclick={() => currentFilter = 'delivered'}
				>
					✅ הושלמו
				</button>
			</div>
			
			<div class="mt-4 flex gap-3">
				<input 
					type="date" 
					bind:value={filterDate}
					class="px-4 py-2 border border-gray-300 rounded-lg"
				/>
				<input 
					type="text" 
					bind:value={searchTerm}
					placeholder="חפש לפי שם, טלפון, מוצר או מספר הזמנה..." 
					class="flex-1 px-4 py-2 border border-gray-300 rounded-lg"
				/>
			</div>
		</div>

		<!-- Orders List (EXACT from legacy) -->
		<div class="space-y-4">
			{#if filteredOrders.length === 0}
				<!-- Empty State -->
				<div class="text-center py-12">
					<div class="text-6xl mb-4">🛒</div>
					<h3 class="text-2xl font-bold text-gray-700 mb-2">אין הזמנות להצגה</h3>
					<p class="text-gray-600">ההזמנות שיתקבלו יופיעו כאן</p>
				</div>
			{:else}
				{#each filteredOrders as order (order.id)}
					<div class="order-card {order.status} bg-white rounded-xl shadow-md p-6">
						<div class="flex justify-between items-start mb-4">
							<div>
								<div class="flex items-center gap-3 mb-2">
									<h3 class="text-xl font-bold text-gray-800">{order.customer?.name || 'לקוח'}</h3>
									<span class="text-sm text-gray-500 bg-gray-100 px-2 py-1 rounded">{order.id || 'ללא מספר'}</span>
								</div>
								<div class="flex items-center gap-2 text-gray-600">
									<span>📅 {formatDate(order.date)}</span>
									{#if order.time}
										<span>•</span>
										<span>🕐 {order.time}</span>
									{/if}
								</div>
							</div>
							<div class="text-right">
								<select 
									class="status-select" 
									onchange={(e) => updateStatus(order.id, e.target.value)}
									value={order.status}
									disabled={order.status === 'cancelled'}
								>
									<option value="pending">⏳ ממתינה</option>
									<option value="processing">🔄 בטיפול</option>
									<option value="shipped">📦 נשלחה</option>
									<option value="delivered">✅ הושלמה</option>
									<option value="cancelled">❌ בוטלה</option>
								</select>
							</div>
						</div>
						
						<!-- Customer Info -->
						<div class="grid grid-cols-1 md:grid-cols-2 gap-3 mb-4 p-3 bg-gray-50 rounded-lg">
							{#if order.customer?.phone}
								<div class="flex items-center gap-2">
									<span class="text-gray-500">📞</span>
									<a href="tel:{order.customer.phone}" class="text-blue-600 hover:underline">{order.customer.phone}</a>
								</div>
							{/if}
							{#if order.customer?.email}
								<div class="flex items-center gap-2">
									<span class="text-gray-500">✉️</span>
									<a href="mailto:{order.customer.email}" class="text-blue-600 hover:underline">{order.customer.email}</a>
								</div>
							{/if}
							<div class="flex items-center gap-2 md:col-span-2">
								<span class="text-gray-500">{order.shipping === 'pickup' ? '🏠 איסוף עצמי' : '🚚 משלוח לכתובת'}</span>
								{#if order.shipping !== 'pickup' && order.customer?.address}
									<span class="text-gray-700">{order.customer.address}</span>
								{/if}
							</div>
						</div>
						
						<!-- Products -->
						<div class="mb-4">
							<div class="text-sm font-semibold text-gray-600 mb-2">מוצרים:</div>
							{#each order.items as item}
								<div class="product-mini">
									{#if item.image}
										<img src={item.image} alt={item.name} onerror="this.style.display='none'" />
									{/if}
									<div class="flex-1">
										<div class="font-semibold text-gray-800">{item.name}</div>
										<div class="text-sm text-gray-600">כמות: {item.quantity} × ₪{item.price}</div>
									</div>
									<div class="font-bold text-gray-800">₪{item.price * item.quantity}</div>
								</div>
							{/each}
						</div>
						
						<!-- Total -->
						<div class="flex justify-between items-center p-3 bg-gradient-to-r from-gray-100 to-gray-50 rounded-lg mb-4">
							<span class="text-lg font-bold text-gray-800">סה"כ לתשלום:</span>
							<span class="text-2xl font-bold text-green-600">{formatCurrency(order.total)}</span>
						</div>
						
						{#if order.trackingNumber}
							<div class="bg-purple-50 rounded-lg p-3 mb-4">
								<div class="text-sm text-purple-600 font-semibold mb-1">📦 מספר מעקב:</div>
								<div class="text-purple-800 font-mono">{order.trackingNumber}</div>
							</div>
						{/if}
						
						{#if order.notes}
							<div class="bg-yellow-50 rounded-lg p-3 mb-4">
								<div class="text-sm text-yellow-700 font-semibold mb-1">📝 הערות:</div>
								<div class="text-gray-700">{order.notes}</div>
							</div>
						{/if}
						
						<div class="flex gap-2">
							<button 
								onclick={() => contactCustomer(order.customer?.phone || '')} 
								class="flex-1 px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition"
							>
								💬 WhatsApp
							</button>
							{#if order.status === 'processing'}
								<button 
									onclick={() => promptTrackingNumber(order.id)} 
									class="flex-1 px-4 py-2 bg-purple-500 text-white rounded-lg hover:bg-purple-600 transition"
								>
									📦 הוסף מספר מעקב
								</button>
							{/if}
						</div>
					</div>
				{/each}
			{/if}
		</div>
	</div>
</div>

<style>
	/* EXACT STYLES FROM LEGACY store-admin.html */
	.order-card {
		transition: all 0.3s ease;
		border-left: 4px solid transparent;
	}
	
	.order-card.pending {
		border-left-color: #f59e0b;
		background-color: #fffbeb;
	}
	
	.order-card.processing {
		border-left-color: #3b82f6;
		background-color: #eff6ff;
	}
	
	.order-card.shipped {
		border-left-color: #8b5cf6;
		background-color: #f5f3ff;
	}
	
	.order-card.delivered {
		border-left-color: #10b981;
		background-color: #f0fdf4;
	}
	
	.order-card.cancelled {
		border-left-color: #ef4444;
		background-color: #fef2f2;
	}
	
	.order-card:hover {
		transform: translateX(-5px);
		box-shadow: 0 4px 12px rgba(0,0,0,0.1);
	}
	
	.stat-card {
		background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
		color: white;
		border-radius: 12px;
		padding: 24px;
		box-shadow: 0 8px 24px rgba(102, 126, 234, 0.3);
	}
	
	.stat-card.green {
		background: linear-gradient(135deg, #10b981 0%, #059669 100%);
	}
	
	.stat-card.amber {
		background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%);
	}
	
	.stat-card.blue {
		background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%);
	}
	
	.stat-card.purple {
		background: linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%);
	}
	
	.tab-button {
		padding: 12px 24px;
		border-radius: 8px;
		transition: all 0.3s ease;
		font-weight: 600;
	}
	
	.tab-button.active {
		background-color: #667eea;
		color: white;
	}
	
	.tab-button:not(.active):hover {
		background-color: #f3f4f6;
	}
	
	.product-mini {
		display: flex;
		align-items: center;
		gap: 10px;
		padding: 8px;
		background: #f9fafb;
		border-radius: 8px;
		margin-bottom: 8px;
	}
	
	.product-mini img {
		width: 50px;
		height: 50px;
		object-fit: cover;
		border-radius: 6px;
	}
	
	.status-select {
		padding: 8px 12px;
		border-radius: 8px;
		border: 2px solid #e5e7eb;
		font-weight: 600;
		cursor: pointer;
		transition: all 0.2s ease;
	}
	
	.status-select:focus {
		outline: none;
		border-color: #667eea;
	}
	
	@media print {
		header {
			display: none !important;
		}
	}
</style>
