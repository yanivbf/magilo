<script>
	import { onMount } from 'svelte';
	import { goto } from '$app/navigation';
	import { currentUser } from '$lib/stores/auth';
	
	/** @type {import('./$types').PageData} */
	let { data } = $props();
	
	// Redirect if not admin
	$effect(() => {
		if ($currentUser && $currentUser.email !== 'britolam1@gmail.com' && !$currentUser.isAdmin) {
			goto('/dashboard');
		}
	});
	
	// Active tab state
	let activeTab = $state('overview');
	
	let stats = $state({
		totalUsers: 0,
		totalPages: 0,
		totalPurchases: 0,
		totalRevenue: 0,
		activeSubscriptions: 0,
		recentUsers: [],
		recentPurchases: [],
		recentPages: [],
		allUsers: [],
		allPages: [],
		allPurchases: [],
		financialData: {
			deliveryRevenue: 0,
			storeRevenue: 0,
			eventRevenue: 0,
			monthlyRevenue: [],
			yearlyReport: {}
		}
	});
	
	let loading = $state(true);
	let selectedUser = $state(null);
	let searchQuery = $state('');
	let pageSearchQuery = $state('');
	let purchaseSearchQuery = $state('');
	let purchaseStatusFilter = $state('all');
	let notification = $state({ show: false, message: '', type: 'success' });
	
	onMount(async () => {
		await loadStats();
	});
	
	async function loadStats() {
		loading = true;
		try {
			const response = await fetch('/api/admin/stats');
			if (response.ok) {
				stats = await response.json();
			}
		} catch (error) {
			console.error('Error loading admin stats:', error);
		}
		loading = false;
	}
	
	function showNotification(message, type = 'success') {
		notification = { show: true, message, type };
		setTimeout(() => {
			notification = { show: false, message: '', type: 'success' };
		}, 3000);
	}
	
	async function toggleUserSubscription(userId, currentStatus) {
		if (!confirm(`האם אתה בטוח שברצונך ${currentStatus === 'active' ? 'לבטל' : 'להפעיל'} מנוי למשתמש זה?`)) {
			return;
		}
		
		try {
			const endpoint = currentStatus === 'active' ? '/api/subscription/deactivate' : '/api/subscription/activate-user';
			const response = await fetch(endpoint, {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ userId })
			});
			
			if (response.ok) {
				showNotification('המנוי עודכן בהצלחה!', 'success');
				await loadStats();
			} else {
				showNotification('שגיאה בעדכון המנוי', 'error');
			}
		} catch (error) {
			console.error('Error toggling subscription:', error);
			showNotification('שגיאה בעדכון המנוי', 'error');
		}
	}
	
	async function deleteUserPage(pageId) {
		if (!confirm('האם אתה בטוח שברצונך למחוק דף זה? פעולה זו אינה ניתנת לביטול!')) {
			return;
		}
		
		try {
			const response = await fetch('/api/delete-page', {
				method: 'DELETE',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ pageId })
			});
			
			if (response.ok) {
				showNotification('הדף נמחק בהצלחה!', 'success');
				await loadStats();
			} else {
				showNotification('שגיאה במחיקת הדף', 'error');
			}
		} catch (error) {
			console.error('Error deleting page:', error);
			showNotification('שגיאה במחיקת הדף', 'error');
		}
	}
	
	async function updatePurchaseStatus(purchaseId, newStatus) {
		if (!confirm(`האם לשנות את סטטוס ההזמנה ל-${newStatus}?`)) {
			return;
		}
		
		try {
			const response = await fetch(`/api/purchase/${purchaseId}/status`, {
				method: 'PUT',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ status: newStatus })
			});
			
			if (response.ok) {
				showNotification('סטטוס ההזמנה עודכן בהצלחה!', 'success');
				await loadStats();
			} else {
				showNotification('שגיאה בעדכון סטטוס ההזמנה', 'error');
			}
		} catch (error) {
			console.error('Error updating purchase status:', error);
			showNotification('שגיאה בעדכון סטטוס ההזמנה', 'error');
		}
	}
	
	async function deletePurchase(purchaseId) {
		if (!confirm('האם אתה בטוח שברצונך למחוק הזמנה זו?')) {
			return;
		}
		
		try {
			const response = await fetch(`/api/purchase/${purchaseId}`, {
				method: 'DELETE'
			});
			
			if (response.ok) {
				showNotification('ההזמנה נמחקה בהצלחה!', 'success');
				await loadStats();
			} else {
				showNotification('שגיאה במחיקת ההזמנה', 'error');
			}
		} catch (error) {
			console.error('Error deleting purchase:', error);
			showNotification('שגיאה במחיקת ההזמנה', 'error');
		}
	}
	
	function formatCurrency(amount) {
		return new Intl.NumberFormat('he-IL', { 
			style: 'currency', 
			currency: 'ILS' 
		}).format(amount);
	}
	
	function formatDate(dateString) {
		if (!dateString) return '';
		return new Date(dateString).toLocaleDateString('he-IL', {
			year: 'numeric',
			month: 'short',
			day: 'numeric',
			hour: '2-digit',
			minute: '2-digit'
		});
	}
	
	function getFilteredUsers() {
		if (!searchQuery) return stats.allUsers;
		return stats.allUsers.filter(user => 
			user.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
			user.email?.toLowerCase().includes(searchQuery.toLowerCase())
		);
	}
	
	function getFilteredPages() {
		if (!pageSearchQuery) return stats.allPages;
		return stats.allPages.filter(page => 
			page.title?.toLowerCase().includes(pageSearchQuery.toLowerCase()) ||
			page.pageType?.toLowerCase().includes(pageSearchQuery.toLowerCase()) ||
			page.owner?.email?.toLowerCase().includes(pageSearchQuery.toLowerCase())
		);
	}
	
	function getFilteredPurchases() {
		let filtered = stats.allPurchases || [];
		
		// Filter by search query
		if (purchaseSearchQuery) {
			filtered = filtered.filter(purchase => 
				purchase.productName?.toLowerCase().includes(purchaseSearchQuery.toLowerCase()) ||
				purchase.customerName?.toLowerCase().includes(purchaseSearchQuery.toLowerCase()) ||
				purchase.customerEmail?.toLowerCase().includes(purchaseSearchQuery.toLowerCase())
			);
		}
		
		// Filter by status
		if (purchaseStatusFilter !== 'all') {
			filtered = filtered.filter(purchase => purchase.status === purchaseStatusFilter);
		}
		
		return filtered;
	}
	
	function getStatusBadgeClass(status) {
		switch(status) {
			case 'pending': return 'bg-yellow-100 text-yellow-800';
			case 'approved': return 'bg-green-100 text-green-800';
			case 'shipped': return 'bg-blue-100 text-blue-800';
			case 'cancelled': return 'bg-red-100 text-red-800';
			default: return 'bg-gray-100 text-gray-800';
		}
	}
	
	function getStatusText(status) {
		switch(status) {
			case 'pending': return 'ממתין';
			case 'approved': return 'אושר';
			case 'shipped': return 'נשלח';
			case 'cancelled': return 'בוטל';
			default: return status;
		}
	}
</script>

<svelte:head>
	<title>דשבורד אדמין - AutoPage</title>
</svelte:head>

<!-- Notification Toast -->
{#if notification.show}
	<div class="fixed top-4 left-1/2 transform -translate-x-1/2 z-50 animate-fade-in">
		<div class="bg-white rounded-lg shadow-2xl p-4 flex items-center gap-3 min-w-[300px] border-t-4 {notification.type === 'success' ? 'border-green-500' : 'border-red-500'}">
			{#if notification.type === 'success'}
				<svg class="w-6 h-6 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
					<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
				</svg>
			{:else}
				<svg class="w-6 h-6 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
					<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
				</svg>
			{/if}
			<p class="font-medium text-gray-900">{notification.message}</p>
		</div>
	</div>
{/if}

<div class="min-h-screen bg-gray-50">
	<div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
		<!-- Header -->
		<div class="mb-8">
			<h1 class="text-4xl font-bold text-gray-900 mb-2">🎯 דשבורד אדמין</h1>
			<p class="text-gray-600">ניהול מלא של המערכת</p>
		</div>
		
		<!-- Tabs Navigation -->
		<div class="bg-white rounded-xl shadow-lg mb-6 overflow-hidden">
			<div class="flex border-b border-gray-200 overflow-x-auto">
				<button 
					onclick={() => activeTab = 'overview'}
					class="px-6 py-4 font-bold text-sm whitespace-nowrap transition-all {activeTab === 'overview' ? 'bg-indigo-600 text-white border-b-4 border-indigo-800' : 'text-gray-600 hover:bg-gray-50'}"
				>
					📊 סקירה כללית
				</button>
				<button 
					onclick={() => activeTab = 'users'}
					class="px-6 py-4 font-bold text-sm whitespace-nowrap transition-all {activeTab === 'users' ? 'bg-indigo-600 text-white border-b-4 border-indigo-800' : 'text-gray-600 hover:bg-gray-50'}"
				>
					👥 משתמשים
				</button>
				<button 
					onclick={() => activeTab = 'pages'}
					class="px-6 py-4 font-bold text-sm whitespace-nowrap transition-all {activeTab === 'pages' ? 'bg-indigo-600 text-white border-b-4 border-indigo-800' : 'text-gray-600 hover:bg-gray-50'}"
				>
					📄 דפים
				</button>
				<button 
					onclick={() => activeTab = 'purchases'}
					class="px-6 py-4 font-bold text-sm whitespace-nowrap transition-all {activeTab === 'purchases' ? 'bg-indigo-600 text-white border-b-4 border-indigo-800' : 'text-gray-600 hover:bg-gray-50'}"
				>
					🛒 הזמנות
				</button>
				<button 
					onclick={() => activeTab = 'finances'}
					class="px-6 py-4 font-bold text-sm whitespace-nowrap transition-all {activeTab === 'finances' ? 'bg-indigo-600 text-white border-b-4 border-indigo-800' : 'text-gray-600 hover:bg-gray-50'}"
				>
					💰 כספים
				</button>
				<button 
					onclick={() => activeTab = 'reports'}
					class="px-6 py-4 font-bold text-sm whitespace-nowrap transition-all {activeTab === 'reports' ? 'bg-indigo-600 text-white border-b-4 border-indigo-800' : 'text-gray-600 hover:bg-gray-50'}"
				>
					📈 דוחות
				</button>
			</div>
		</div>
		
		{#if loading}
			<div class="flex items-center justify-center py-20">
				<div class="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-indigo-600"></div>
			</div>
		{:else}
		
		<!-- TAB: Overview -->
		{#if activeTab === 'overview'}
			<!-- Stats Cards -->
			<div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
				<!-- Total Users -->
				<div class="bg-white rounded-xl shadow-lg p-6 border-t-4 border-blue-500">
					<div class="flex items-center justify-between">
						<div>
							<p class="text-gray-500 text-sm font-medium">סך משתמשים</p>
							<p class="text-3xl font-bold text-gray-900 mt-2">{stats.totalUsers}</p>
						</div>
						<div class="bg-blue-100 rounded-full p-4">
							<svg class="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
								<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
							</svg>
						</div>
					</div>
				</div>
				
				<!-- Total Pages -->
				<div class="bg-white rounded-xl shadow-lg p-6 border-t-4 border-green-500">
					<div class="flex items-center justify-between">
						<div>
							<p class="text-gray-500 text-sm font-medium">סך דפים</p>
							<p class="text-3xl font-bold text-gray-900 mt-2">{stats.totalPages}</p>
						</div>
						<div class="bg-green-100 rounded-full p-4">
							<svg class="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
								<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
							</svg>
						</div>
					</div>
				</div>
				
				<!-- Total Purchases -->
				<div class="bg-white rounded-xl shadow-lg p-6 border-t-4 border-purple-500">
					<div class="flex items-center justify-between">
						<div>
							<p class="text-gray-500 text-sm font-medium">סך רכישות</p>
							<p class="text-3xl font-bold text-gray-900 mt-2">{stats.totalPurchases}</p>
						</div>
						<div class="bg-purple-100 rounded-full p-4">
							<svg class="w-8 h-8 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
								<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
							</svg>
						</div>
					</div>
				</div>
				
				<!-- Total Revenue -->
				<div class="bg-white rounded-xl shadow-lg p-6 border-t-4 border-yellow-500">
					<div class="flex items-center justify-between">
						<div>
							<p class="text-gray-500 text-sm font-medium">סך הכנסות</p>
							<p class="text-3xl font-bold text-gray-900 mt-2">{formatCurrency(stats.totalRevenue)}</p>
						</div>
						<div class="bg-yellow-100 rounded-full p-4">
							<svg class="w-8 h-8 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
								<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
							</svg>
						</div>
					</div>
				</div>
			</div>
			
			<!-- Recent Activity -->
			<div class="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
				<!-- Recent Users -->
				<div class="bg-white rounded-xl shadow-lg p-6">
					<h2 class="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
						<svg class="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
							<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
						</svg>
						משתמשים אחרונים
					</h2>
					<div class="space-y-3">
						{#each stats.recentUsers as user}
							<div class="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition">
								<div class="flex items-center gap-3">
									{#if user.avatar}
										<img src={user.avatar} alt={user.name} class="w-10 h-10 rounded-full" />
									{:else}
										<div class="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-bold">
											{user.name?.charAt(0) || 'U'}
										</div>
									{/if}
									<div>
										<p class="font-medium text-gray-900">{user.name || 'משתמש'}</p>
										<p class="text-sm text-gray-500">{user.email}</p>
									</div>
								</div>
								<div class="text-left">
									<p class="text-xs text-gray-500">{formatDate(user.createdAt)}</p>
								</div>
							</div>
						{/each}
					</div>
				</div>
				
				<!-- Recent Purchases -->
				<div class="bg-white rounded-xl shadow-lg p-6">
					<h2 class="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
						<svg class="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
							<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
						</svg>
						רכישות אחרונות
					</h2>
					<div class="space-y-3">
						{#each stats.recentPurchases as purchase}
							<div class="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition">
								<div>
									<p class="font-medium text-gray-900">{purchase.productName || 'מוצר'}</p>
									<p class="text-sm text-gray-500">{purchase.customerName || 'לקוח'}</p>
								</div>
								<div class="text-left">
									<p class="font-bold text-purple-600">{formatCurrency(purchase.totalPrice || 0)}</p>
									<p class="text-xs text-gray-500">{formatDate(purchase.createdAt)}</p>
								</div>
							</div>
						{/each}
					</div>
				</div>
			</div>
			
			<!-- Recent Pages -->
			<div class="bg-white rounded-xl shadow-lg p-6">
				<h2 class="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
					<svg class="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
						<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
					</svg>
					דפים אחרונים
				</h2>
				<div class="overflow-x-auto">
					<table class="w-full">
						<thead>
							<tr class="border-b-2 border-gray-200">
								<th class="text-right py-3 px-4 font-semibold text-gray-700">כותרת</th>
								<th class="text-right py-3 px-4 font-semibold text-gray-700">סוג</th>
								<th class="text-right py-3 px-4 font-semibold text-gray-700">בעלים</th>
								<th class="text-right py-3 px-4 font-semibold text-gray-700">תאריך יצירה</th>
								<th class="text-right py-3 px-4 font-semibold text-gray-700">פעולות</th>
							</tr>
						</thead>
						<tbody>
							{#each stats.recentPages as page}
								<tr class="border-b border-gray-100 hover:bg-gray-50 transition">
									<td class="py-3 px-4 font-medium text-gray-900">{page.title || 'ללא שם'}</td>
									<td class="py-3 px-4 text-gray-600">{page.pageType || 'כללי'}</td>
									<td class="py-3 px-4 text-gray-600">{page.owner?.name || page.owner?.email || 'לא ידוע'}</td>
									<td class="py-3 px-4 text-gray-500 text-sm">{formatDate(page.createdAt)}</td>
									<td class="py-3 px-4">
										<a 
											href="/view/{page.slug}" 
											target="_blank"
											class="text-indigo-600 hover:text-indigo-800 font-medium text-sm"
										>
											צפה
										</a>
									</td>
								</tr>
							{/each}
						</tbody>
					</table>
				</div>
			</div>
			
			<!-- Quick Actions -->
			<div class="mt-8 grid grid-cols-1 md:grid-cols-3 gap-6">
				<a 
					href="http://localhost:1337/admin" 
					target="_blank"
					class="bg-gradient-to-r from-red-500 to-pink-600 text-white p-6 rounded-xl shadow-lg hover:shadow-xl transition-all transform hover:scale-105 flex items-center gap-4"
				>
					<svg class="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
						<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 7v10c0 2.21 3.582 4 8 4s8-1.79 8-4V7M4 7c0 2.21 3.582 4 8 4s8-1.79 8-4M4 7c0-2.21 3.582-4 8-4s8 1.79 8 4m0 5c0 2.21-3.582 4-8 4s-8-1.79-8-4" />
					</svg>
					<div>
						<h3 class="font-bold text-lg">Strapi Admin</h3>
						<p class="text-sm opacity-90">ניהול מסד נתונים</p>
					</div>
				</a>
				
				<button 
					onclick={loadStats}
					class="bg-gradient-to-r from-blue-500 to-indigo-600 text-white p-6 rounded-xl shadow-lg hover:shadow-xl transition-all transform hover:scale-105 flex items-center gap-4"
				>
					<svg class="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
						<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
					</svg>
					<div>
						<h3 class="font-bold text-lg">רענן נתונים</h3>
						<p class="text-sm opacity-90">עדכן סטטיסטיקות</p>
					</div>
				</button>
				
				<a 
					href="/dashboard"
					class="bg-gradient-to-r from-green-500 to-teal-600 text-white p-6 rounded-xl shadow-lg hover:shadow-xl transition-all transform hover:scale-105 flex items-center gap-4"
				>
					<svg class="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
						<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
					</svg>
					<div>
						<h3 class="font-bold text-lg">דשבורד משתמש</h3>
						<p class="text-sm opacity-90">חזור לדשבורד רגיל</p>
					</div>
				</a>
			</div>
		
		<!-- TAB: Users Management -->
		{:else if activeTab === 'users'}
			<div class="bg-white rounded-xl shadow-lg p-6">
				<div class="flex justify-between items-center mb-6">
					<h2 class="text-2xl font-bold text-gray-900">ניהול משתמשים</h2>
					<input 
						type="text"
						bind:value={searchQuery}
						placeholder="חפש משתמש..."
						class="px-4 py-2 border-2 border-gray-300 rounded-lg focus:border-indigo-500 focus:outline-none"
					/>
				</div>
				
				<div class="overflow-x-auto">
					<table class="w-full">
						<thead>
							<tr class="border-b-2 border-gray-200">
								<th class="text-right py-3 px-4 font-semibold text-gray-700">משתמש</th>
								<th class="text-right py-3 px-4 font-semibold text-gray-700">אימייל</th>
								<th class="text-right py-3 px-4 font-semibold text-gray-700">דפים</th>
								<th class="text-right py-3 px-4 font-semibold text-gray-700">מנוי</th>
								<th class="text-right py-3 px-4 font-semibold text-gray-700">מחובר</th>
								<th class="text-right py-3 px-4 font-semibold text-gray-700">פעולות</th>
							</tr>
						</thead>
						<tbody>
							{#each getFilteredUsers() as user}
								<tr class="border-b border-gray-100 hover:bg-gray-50 transition">
									<td class="py-3 px-4">
										<div class="flex items-center gap-3">
											{#if user.avatar}
												<img src={user.avatar} alt={user.name} class="w-10 h-10 rounded-full" />
											{:else}
												<div class="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-bold">
													{user.name?.charAt(0) || 'U'}
												</div>
											{/if}
											<span class="font-medium text-gray-900">{user.name || 'משתמש'}</span>
										</div>
									</td>
									<td class="py-3 px-4 text-gray-600">{user.email}</td>
									<td class="py-3 px-4 text-gray-600">{user.pagesCount || 0}</td>
									<td class="py-3 px-4">
										{#if user.subscriptionStatus === 'active'}
											<span class="bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm font-bold">פעיל</span>
										{:else}
											<span class="bg-gray-100 text-gray-800 px-3 py-1 rounded-full text-sm font-bold">לא פעיל</span>
										{/if}
									</td>
									<td class="py-3 px-4">
										{#if user.isOnline}
											<span class="flex items-center gap-2 text-green-600">
												<span class="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
												מחובר
											</span>
										{:else}
											<span class="text-gray-400">לא מחובר</span>
										{/if}
									</td>
									<td class="py-3 px-4">
										<div class="flex gap-2">
											<button 
												onclick={() => selectedUser = user}
												class="text-blue-600 hover:text-blue-800 font-medium text-sm"
											>
												צפה בדפים
											</button>
											<button 
												onclick={() => toggleUserSubscription(user.id, user.subscriptionStatus)}
												class="text-purple-600 hover:text-purple-800 font-medium text-sm"
											>
												{user.subscriptionStatus === 'active' ? 'בטל מנוי' : 'הפעל מנוי'}
											</button>
										</div>
									</td>
								</tr>
							{/each}
						</tbody>
					</table>
				</div>
			</div>
		
		<!-- TAB: Pages Management -->
		{:else if activeTab === 'pages'}
			<div class="bg-white rounded-xl shadow-lg p-6">
				<div class="flex justify-between items-center mb-6">
					<h2 class="text-2xl font-bold text-gray-900">ניהול דפים</h2>
					<input 
						type="text"
						bind:value={pageSearchQuery}
						placeholder="חפש דף..."
						class="px-4 py-2 border-2 border-gray-300 rounded-lg focus:border-indigo-500 focus:outline-none"
					/>
				</div>
				
				<div class="overflow-x-auto">
					<table class="w-full">
						<thead>
							<tr class="border-b-2 border-gray-200">
								<th class="text-right py-3 px-4 font-semibold text-gray-700">כותרת</th>
								<th class="text-right py-3 px-4 font-semibold text-gray-700">סוג</th>
								<th class="text-right py-3 px-4 font-semibold text-gray-700">בעלים</th>
								<th class="text-right py-3 px-4 font-semibold text-gray-700">מנוי</th>
								<th class="text-right py-3 px-4 font-semibold text-gray-700">תאריך</th>
								<th class="text-right py-3 px-4 font-semibold text-gray-700">פעולות</th>
							</tr>
						</thead>
						<tbody>
							{#each getFilteredPages() as page}
								<tr class="border-b border-gray-100 hover:bg-gray-50 transition">
									<td class="py-3 px-4 font-medium text-gray-900">{page.title || 'ללא שם'}</td>
									<td class="py-3 px-4 text-gray-600">{page.pageType || 'כללי'}</td>
									<td class="py-3 px-4 text-gray-600">{page.owner?.name || page.owner?.email || 'לא ידוע'}</td>
									<td class="py-3 px-4">
										{#if page.subscriptionStatus === 'active'}
											<span class="bg-green-100 text-green-800 px-2 py-1 rounded text-xs font-bold">פעיל</span>
										{:else}
											<span class="bg-orange-100 text-orange-800 px-2 py-1 rounded text-xs font-bold">ממתין</span>
										{/if}
									</td>
									<td class="py-3 px-4 text-gray-500 text-sm">{formatDate(page.createdAt)}</td>
									<td class="py-3 px-4">
										<div class="flex gap-2">
											<a 
												href="/view/{page.slug}" 
												target="_blank"
												class="text-indigo-600 hover:text-indigo-800 font-medium text-sm"
											>
												צפה
											</a>
											<a 
												href="/view/{page.slug}" 
												class="text-blue-600 hover:text-blue-800 font-medium text-sm"
											>
												ערוך
											</a>
											<button 
												onclick={() => deleteUserPage(page.documentId || page.id)}
												class="text-red-600 hover:text-red-800 font-medium text-sm"
											>
												מחק
											</button>
										</div>
									</td>
								</tr>
							{/each}
						</tbody>
					</table>
				</div>
				
				{#if getFilteredPages().length === 0}
					<div class="text-center py-12">
						<p class="text-gray-500">לא נמצאו דפים</p>
					</div>
				{/if}
			</div>
		
		<!-- TAB: Purchases Management -->
		{:else if activeTab === 'purchases'}
			<div class="bg-white rounded-xl shadow-lg p-6">
				<div class="flex justify-between items-center mb-6">
					<h2 class="text-2xl font-bold text-gray-900">ניהול הזמנות</h2>
					<div class="flex gap-3">
						<select 
							bind:value={purchaseStatusFilter}
							class="px-4 py-2 border-2 border-gray-300 rounded-lg focus:border-indigo-500 focus:outline-none"
						>
							<option value="all">כל הסטטוסים</option>
							<option value="pending">ממתין</option>
							<option value="approved">אושר</option>
							<option value="shipped">נשלח</option>
							<option value="cancelled">בוטל</option>
						</select>
						<input 
							type="text"
							bind:value={purchaseSearchQuery}
							placeholder="חפש הזמנה..."
							class="px-4 py-2 border-2 border-gray-300 rounded-lg focus:border-indigo-500 focus:outline-none"
						/>
					</div>
				</div>
				
				<div class="overflow-x-auto">
					<table class="w-full">
						<thead>
							<tr class="border-b-2 border-gray-200">
								<th class="text-right py-3 px-4 font-semibold text-gray-700">מוצר</th>
								<th class="text-right py-3 px-4 font-semibold text-gray-700">לקוח</th>
								<th class="text-right py-3 px-4 font-semibold text-gray-700">סכום</th>
								<th class="text-right py-3 px-4 font-semibold text-gray-700">סטטוס</th>
								<th class="text-right py-3 px-4 font-semibold text-gray-700">תאריך</th>
								<th class="text-right py-3 px-4 font-semibold text-gray-700">פעולות</th>
							</tr>
						</thead>
						<tbody>
							{#each getFilteredPurchases() as purchase}
								<tr class="border-b border-gray-100 hover:bg-gray-50 transition">
									<td class="py-3 px-4 font-medium text-gray-900">{purchase.productName || 'מוצר'}</td>
									<td class="py-3 px-4">
										<div>
											<p class="text-gray-900">{purchase.customerName || 'לקוח'}</p>
											<p class="text-xs text-gray-500">{purchase.customerEmail || ''}</p>
										</div>
									</td>
									<td class="py-3 px-4 font-bold text-green-600">{formatCurrency(purchase.totalPrice || 0)}</td>
									<td class="py-3 px-4">
										<span class="px-3 py-1 rounded-full text-xs font-bold {getStatusBadgeClass(purchase.status)}">
											{getStatusText(purchase.status)}
										</span>
									</td>
									<td class="py-3 px-4 text-gray-500 text-sm">{formatDate(purchase.createdAt)}</td>
									<td class="py-3 px-4">
										<div class="flex gap-2">
											{#if purchase.status === 'pending'}
												<button 
													onclick={() => updatePurchaseStatus(purchase.id, 'approved')}
													class="text-green-600 hover:text-green-800 font-medium text-sm"
												>
													אשר
												</button>
												<button 
													onclick={() => updatePurchaseStatus(purchase.id, 'cancelled')}
													class="text-red-600 hover:text-red-800 font-medium text-sm"
												>
													בטל
												</button>
											{:else if purchase.status === 'approved'}
												<button 
													onclick={() => updatePurchaseStatus(purchase.id, 'shipped')}
													class="text-blue-600 hover:text-blue-800 font-medium text-sm"
												>
													סמן כנשלח
												</button>
											{/if}
											<button 
												onclick={() => deletePurchase(purchase.id)}
												class="text-red-600 hover:text-red-800 font-medium text-sm"
											>
												מחק
											</button>
										</div>
									</td>
								</tr>
							{/each}
						</tbody>
					</table>
				</div>
				
				{#if getFilteredPurchases().length === 0}
					<div class="text-center py-12">
						<svg class="w-16 h-16 text-gray-300 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
							<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
						</svg>
						<p class="text-gray-500">לא נמצאו הזמנות</p>
					</div>
				{/if}
			</div>
		
		<!-- TAB: Finances -->
		{:else if activeTab === 'finances'}
			<div class="space-y-6">
				<!-- Main Revenue Card -->
				<div class="bg-gradient-to-r from-green-500 to-emerald-600 rounded-xl shadow-2xl p-8 text-white">
					<div class="flex items-center justify-between">
						<div>
							<h2 class="text-2xl font-bold mb-2">סך הכנסות כולל</h2>
							<p class="text-5xl font-extrabold">{formatCurrency(stats.totalRevenue)}</p>
							<p class="text-sm opacity-90 mt-2">עודכן לאחרונה: {new Date().toLocaleDateString('he-IL')}</p>
						</div>
						<svg class="w-24 h-24 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
							<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
						</svg>
					</div>
				</div>
				
				<!-- Revenue Breakdown -->
				<div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
					<div class="bg-white rounded-xl shadow-lg p-6 border-t-4 border-yellow-500">
						<div class="flex items-center justify-between mb-2">
							<h3 class="text-gray-500 text-sm font-medium">הכנסות ממנויים</h3>
							<svg class="w-6 h-6 text-yellow-500" fill="currentColor" viewBox="0 0 20 20">
								<path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
							</svg>
						</div>
						<p class="text-3xl font-bold text-gray-900">{formatCurrency(stats.financialData.subscriptionRevenue || 0)}</p>
						<p class="text-xs text-gray-500 mt-2">{stats.activeSubscriptions} מנויים פעילים × ₪59</p>
					</div>
					
					<div class="bg-white rounded-xl shadow-lg p-6 border-t-4 border-blue-500">
						<div class="flex items-center justify-between mb-2">
							<h3 class="text-gray-500 text-sm font-medium">הכנסות משלוחים</h3>
							<svg class="w-6 h-6 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
								<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16V6a1 1 0 00-1-1H4a1 1 0 00-1 1v10a1 1 0 001 1h1m8-1a1 1 0 01-1 1H9m4-1V8a1 1 0 011-1h2.586a1 1 0 01.707.293l3.414 3.414a1 1 0 01.293.707V16a1 1 0 01-1 1h-1m-6-1a1 1 0 001 1h1M5 17a2 2 0 104 0m-4 0a2 2 0 114 0m6 0a2 2 0 104 0m-4 0a2 2 0 114 0" />
							</svg>
						</div>
						<p class="text-3xl font-bold text-gray-900">{formatCurrency(stats.financialData.deliveryRevenue || 0)}</p>
						<p class="text-xs text-gray-500 mt-2">עמלות משלוחים</p>
					</div>
					
					<div class="bg-white rounded-xl shadow-lg p-6 border-t-4 border-green-500">
						<div class="flex items-center justify-between mb-2">
							<h3 class="text-gray-500 text-sm font-medium">הכנסות חנויות</h3>
							<svg class="w-6 h-6 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
								<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
							</svg>
						</div>
						<p class="text-3xl font-bold text-gray-900">{formatCurrency(stats.financialData.storeRevenue || 0)}</p>
						<p class="text-xs text-gray-500 mt-2">סליקה בחנויות</p>
					</div>
					
					<div class="bg-white rounded-xl shadow-lg p-6 border-t-4 border-purple-500">
						<div class="flex items-center justify-between mb-2">
							<h3 class="text-gray-500 text-sm font-medium">הכנסות אירועים</h3>
							<svg class="w-6 h-6 text-purple-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
								<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
							</svg>
						</div>
						<p class="text-3xl font-bold text-gray-900">{formatCurrency(stats.financialData.eventRevenue || 0)}</p>
						<p class="text-xs text-gray-500 mt-2">סליקה באירועים</p>
					</div>
				</div>
				
				<!-- Active Subscriptions Details -->
				<div class="bg-white rounded-xl shadow-lg p-6">
					<h2 class="text-2xl font-bold text-gray-900 mb-4 flex items-center gap-2">
						<svg class="w-7 h-7 text-yellow-500" fill="currentColor" viewBox="0 0 20 20">
							<path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
						</svg>
						מנויים פעילים
					</h2>
					<div class="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
						<div class="bg-green-50 rounded-lg p-4 border-2 border-green-200">
							<p class="text-green-600 text-sm font-medium">מנויים פעילים</p>
							<p class="text-3xl font-bold text-green-700">{stats.activeSubscriptions}</p>
						</div>
						<div class="bg-blue-50 rounded-lg p-4 border-2 border-blue-200">
							<p class="text-blue-600 text-sm font-medium">הכנסה חודשית צפויה</p>
							<p class="text-3xl font-bold text-blue-700">{formatCurrency(stats.activeSubscriptions * 59)}</p>
						</div>
						<div class="bg-purple-50 rounded-lg p-4 border-2 border-purple-200">
							<p class="text-purple-600 text-sm font-medium">הכנסה שנתית צפויה</p>
							<p class="text-3xl font-bold text-purple-700">{formatCurrency(stats.activeSubscriptions * 59 * 12)}</p>
						</div>
					</div>
					
					<!-- Subscription List -->
					{#if stats.activeSubscriptionsList && stats.activeSubscriptionsList.length > 0}
						<div class="overflow-x-auto">
							<table class="w-full">
								<thead>
									<tr class="border-b-2 border-gray-200">
										<th class="text-right py-3 px-4 font-semibold text-gray-700">דף</th>
										<th class="text-right py-3 px-4 font-semibold text-gray-700">בעלים</th>
										<th class="text-right py-3 px-4 font-semibold text-gray-700">תאריך התחלה</th>
										<th class="text-right py-3 px-4 font-semibold text-gray-700">תאריך סיום</th>
										<th class="text-right py-3 px-4 font-semibold text-gray-700">ימים נותרים</th>
										<th class="text-right py-3 px-4 font-semibold text-gray-700">סכום</th>
									</tr>
								</thead>
								<tbody>
									{#each stats.activeSubscriptionsList as sub}
										{@const daysLeft = Math.ceil((new Date(sub.expiryDate) - new Date()) / (1000 * 60 * 60 * 24))}
										<tr class="border-b border-gray-100 hover:bg-gray-50 transition">
											<td class="py-3 px-4 font-medium text-gray-900">{sub.pageTitle}</td>
											<td class="py-3 px-4 text-gray-600">{sub.ownerEmail}</td>
											<td class="py-3 px-4 text-gray-500 text-sm">{formatDate(sub.startDate)}</td>
											<td class="py-3 px-4 text-gray-500 text-sm">{formatDate(sub.expiryDate)}</td>
											<td class="py-3 px-4">
												<span class="bg-green-100 text-green-800 px-2 py-1 rounded text-xs font-bold">
													{daysLeft} ימים
												</span>
											</td>
											<td class="py-3 px-4 font-bold text-green-600">₪59</td>
										</tr>
									{/each}
								</tbody>
							</table>
						</div>
					{/if}
				</div>
				
				<!-- Monthly Revenue Chart Placeholder -->
				<div class="bg-white rounded-xl shadow-lg p-6">
					<h2 class="text-2xl font-bold text-gray-900 mb-4">הכנסות חודשיות</h2>
					<div class="h-64 flex items-center justify-center bg-gray-50 rounded-lg">
						<p class="text-gray-500">גרף הכנסות חודשיות - בקרוב</p>
					</div>
				</div>
			</div>
		
		<!-- TAB: Reports -->
		{:else if activeTab === 'reports'}
			<div class="bg-white rounded-xl shadow-lg p-6">
				<h2 class="text-2xl font-bold text-gray-900 mb-6">דוחות ותובנות</h2>
				<div class="grid grid-cols-1 md:grid-cols-2 gap-6">
					<button class="bg-gradient-to-r from-blue-500 to-indigo-600 text-white p-6 rounded-xl shadow-lg hover:shadow-xl transition-all">
						<h3 class="font-bold text-lg mb-2">דוח שנתי למס הכנסה</h3>
						<p class="text-sm opacity-90">הורד דוח מפורט לשנת 2024</p>
					</button>
					<button class="bg-gradient-to-r from-green-500 to-teal-600 text-white p-6 rounded-xl shadow-lg hover:shadow-xl transition-all">
						<h3 class="font-bold text-lg mb-2">דוח רכישות</h3>
						<p class="text-sm opacity-90">סיכום כל הרכישות</p>
					</button>
					<button class="bg-gradient-to-r from-purple-500 to-pink-600 text-white p-6 rounded-xl shadow-lg hover:shadow-xl transition-all">
						<h3 class="font-bold text-lg mb-2">דוח משתמשים</h3>
						<p class="text-sm opacity-90">סטטיסטיקות משתמשים</p>
					</button>
					<button class="bg-gradient-to-r from-yellow-500 to-orange-600 text-white p-6 rounded-xl shadow-lg hover:shadow-xl transition-all">
						<h3 class="font-bold text-lg mb-2">תובנות עסקיות</h3>
						<p class="text-sm opacity-90">ניתוח מתקדם</p>
					</button>
				</div>
			</div>
		
		<!-- TAB: Agents (Coming Soon) -->
		{:else if activeTab === 'agents'}
			<div class="bg-white rounded-xl shadow-lg p-6">
				<h2 class="text-2xl font-bold text-gray-900 mb-4">ניהול סוכנים</h2>
				<div class="text-center py-20">
					<svg class="w-24 h-24 text-gray-300 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
						<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
					</svg>
					<h3 class="text-2xl font-semibold text-gray-700 mb-2">בקרוב</h3>
					<p class="text-gray-600">מערכת ניהול סוכנים תהיה זמינה בקרוב</p>
				</div>
			</div>
		{/if}
		{/if}
	</div>
</div>

<style>
	@keyframes fade-in {
		from {
			opacity: 0;
			transform: translate(-50%, -20px);
		}
		to {
			opacity: 1;
			transform: translate(-50%, 0);
		}
	}
	
	.animate-fade-in {
		animation: fade-in 0.3s ease-out;
	}
</style>
