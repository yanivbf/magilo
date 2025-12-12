<script>
	import { onMount } from 'svelte';
	import { goto } from '$app/navigation';
	import { currentUser } from '$lib/stores/auth';
	
	// Redirect if not admin
	$effect(() => {
		if ($currentUser && $currentUser.email !== 'britolam1@gmail.com' && !$currentUser.isAdmin) {
			goto('/dashboard');
		}
	});
	
	let stats = $state({
		totalUsers: 0,
		totalPages: 0,
		activeSubscriptions: 0,
		subscriptionRevenue: 0,
		recentUsers: [],
		allUsers: [],
		allPages: [],
		activeSubscriptionsList: []
	});
	
	let loading = $state(true);
	
	onMount(async () => {
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
	});
	
	function formatCurrency(amount) {
		return new Intl.NumberFormat('he-IL', { 
			style: 'currency', 
			currency: 'ILS' 
		}).format(amount);
	}
</script>

<svelte:head>
	<title>דשבורד אדמין - AutoPage</title>
</svelte:head>

<div class="min-h-screen bg-gray-50 p-8">
	<div class="max-w-7xl mx-auto">
		<!-- Header -->
		<div class="mb-8">
			<h1 class="text-4xl font-bold text-gray-900 mb-2">🎯 דשבורד אדמין</h1>
			<p class="text-gray-600">ניהול מלא של המערכת</p>
		</div>
		
		{#if loading}
			<div class="flex items-center justify-center py-20">
				<div class="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-indigo-600"></div>
			</div>
		{:else}
		
		<!-- Stats Cards -->
		<div class="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
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
			
			<!-- Active Subscriptions -->
			<div class="bg-white rounded-xl shadow-lg p-6 border-t-4 border-yellow-500">
				<div class="flex items-center justify-between">
					<div>
						<p class="text-gray-500 text-sm font-medium">מנויים פעילים</p>
						<p class="text-3xl font-bold text-gray-900 mt-2">{stats.activeSubscriptions}</p>
					</div>
					<div class="bg-yellow-100 rounded-full p-4">
						<svg class="w-8 h-8 text-yellow-600" fill="currentColor" viewBox="0 0 20 20">
							<path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
						</svg>
					</div>
				</div>
			</div>
		</div>
		
		<!-- Revenue from Subscriptions -->
		<div class="bg-gradient-to-r from-green-500 to-emerald-600 rounded-xl shadow-2xl p-8 text-white mb-8">
			<div class="flex items-center justify-between">
				<div>
					<h2 class="text-2xl font-bold mb-2">💰 הכנסות ממנויים</h2>
					<p class="text-5xl font-extrabold">{formatCurrency(stats.subscriptionRevenue || stats.activeSubscriptions * 59)}</p>
					<div class="mt-4 space-y-2">
						<p class="text-lg opacity-90">📊 {stats.activeSubscriptions} מנויים פעילים × ₪59</p>
						<p class="text-sm opacity-80">הכנסה חודשית: {formatCurrency(stats.activeSubscriptions * 59)}</p>
						<p class="text-sm opacity-80">הכנסה שנתית צפויה: {formatCurrency(stats.activeSubscriptions * 59 * 12)}</p>
					</div>
				</div>
				<svg class="w-24 h-24 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
					<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
				</svg>
			</div>
		</div>
		
		<!-- Active Subscriptions List -->
		{#if stats.activeSubscriptionsList && stats.activeSubscriptionsList.length > 0}
		<div class="bg-white rounded-xl shadow-lg p-6 mb-8">
			<h2 class="text-2xl font-bold text-gray-900 mb-4 flex items-center gap-2">
				<svg class="w-7 h-7 text-yellow-500" fill="currentColor" viewBox="0 0 20 20">
					<path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
				</svg>
				רשימת מנויים פעילים
			</h2>
			<div class="overflow-x-auto">
				<table class="w-full">
					<thead>
						<tr class="border-b-2 border-gray-200">
							<th class="text-right py-3 px-4 font-semibold text-gray-700">דף</th>
							<th class="text-right py-3 px-4 font-semibold text-gray-700">בעלים</th>
							<th class="text-right py-3 px-4 font-semibold text-gray-700">תאריך התחלה</th>
							<th class="text-right py-3 px-4 font-semibold text-gray-700">תאריך סיום</th>
							<th class="text-right py-3 px-4 font-semibold text-gray-700">ימים נותרים</th>
							<th class="text-right py-3 px-4 font-semibold text-gray-700">סכום חודשי</th>
						</tr>
					</thead>
					<tbody>
						{#each stats.activeSubscriptionsList as sub}
							{@const daysLeft = Math.ceil((new Date(sub.expiryDate) - new Date()) / (1000 * 60 * 60 * 24))}
							<tr class="border-b border-gray-100 hover:bg-gray-50 transition">
								<td class="py-3 px-4 font-medium text-gray-900">{sub.pageTitle}</td>
								<td class="py-3 px-4 text-gray-600">{sub.ownerEmail}</td>
								<td class="py-3 px-4 text-gray-500 text-sm">{new Date(sub.startDate).toLocaleDateString('he-IL')}</td>
								<td class="py-3 px-4 text-gray-500 text-sm">{new Date(sub.expiryDate).toLocaleDateString('he-IL')}</td>
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
		</div>
		{/if}
		
		<!-- Users Connected Status -->
		<div class="bg-white rounded-xl shadow-lg p-6 mb-8">
			<h2 class="text-2xl font-bold text-gray-900 mb-4 flex items-center gap-2">
				<svg class="w-7 h-7 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
					<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
				</svg>
				משתמשים במערכת
			</h2>
			<div class="grid grid-cols-1 md:grid-cols-2 gap-4">
				<div class="bg-green-50 rounded-lg p-4 border-2 border-green-200">
					<p class="text-green-600 text-sm font-medium">משתמשים רשומים</p>
					<p class="text-3xl font-bold text-green-700">{stats.totalUsers}</p>
				</div>
				<div class="bg-blue-50 rounded-lg p-4 border-2 border-blue-200">
					<p class="text-blue-600 text-sm font-medium">דפים שנוצרו</p>
					<p class="text-3xl font-bold text-blue-700">{stats.totalPages}</p>
				</div>
			</div>
		</div>
		
		<!-- Quick Actions -->
		<div class="grid grid-cols-1 md:grid-cols-3 gap-6">
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
				onclick={() => window.location.reload()}
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
		
		{/if}
	</div>
</div>
