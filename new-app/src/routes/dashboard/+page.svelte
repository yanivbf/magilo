<script>
	import { goto } from '$app/navigation';
	import { currentUser, signOut, extractUserData } from '$lib/stores/auth';
	import { onMount } from 'svelte';
	
	/** @type {import('./$types').PageData} */
	let { data } = $props();
	
	let userData = $state({ name: 'משתמש רשום', avatar: null });
	let showDeleteConfirm = $state(null);
	
	// Redirect if not logged in, or ensure userId is in URL
	$effect(() => {
		if (!$currentUser) {
			goto('/login');
		} else {
			userData = extractUserData($currentUser);
			// Ensure userId is in URL for server-side data fetching
			const urlParams = new URLSearchParams(window.location.search);
			if (!urlParams.get('userId')) {
				goto(`/dashboard?userId=${$currentUser.id}`, { replaceState: true });
			}
		}
	});
	
	async function handleSignOut() {
		const result = await signOut();
		if (result.success) {
			goto('/login');
		}
	}
	
	function goToPageCreator() {
		goto('/page-creator');
	}
	
	function goToMarketplace() {
		goto('/marketplace');
	}
	
	async function deletePage(pageId) {
		if (!confirm('האם אתה בטוח שברצונך למחוק דף זה?')) {
			return;
		}
		
		try {
			const response = await fetch('/api/delete-page', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ pageId })
			});
			
			if (response.ok) {
				// Reload the page to refresh the list
				window.location.reload();
			} else {
				alert('שגיאה במחיקת הדף');
			}
		} catch (error) {
			console.error('Error deleting page:', error);
			alert('שגיאה במחיקת הדף');
		}
	}
	
	function editPage(page) {
		// Navigate to page creator with edit mode
		goto(`/page-creator?edit=${page.documentId || page.id}`);
	}
	
	function viewPage(page) {
		// Open page in new tab
		const slug = page.slug || page.fileName || page.id;
		window.open(`/pages/${slug}`, '_blank');
	}
	
	function getPageTypeIcon(pageType) {
		const icons = {
			'store': '🛍️',
			'onlineStore': '🛍️',
			'event': '🎉',
			'service': '💼',
			'serviceProvider': '💼',
			'restaurant': '🍽️',
			'restaurantMenu': '🍽️',
			'course': '📚',
			'workshop': '🎓',
			'messageInBottle': '💌',
			'generic': '📄'
		};
		return icons[pageType] || '📄';
	}
	
	function getPageTypeLabel(pageType) {
		const labels = {
			'store': 'חנות מקוונת',
			'onlineStore': 'חנות מקוונת',
			'event': 'אירוע',
			'service': 'שירות',
			'serviceProvider': 'שירות',
			'restaurant': 'מסעדה',
			'restaurantMenu': 'מסעדה',
			'course': 'קורס',
			'workshop': 'סדנה',
			'messageInBottle': 'הודעה בבקבוק',
			'generic': 'כללי'
		};
		return labels[pageType] || 'כללי';
	}
	
	function formatDate(dateString) {
		if (!dateString) return '';
		const date = new Date(dateString);
		return date.toLocaleDateString('he-IL', { 
			year: 'numeric', 
			month: 'long', 
			day: 'numeric' 
		});
	}
	
	function manageStore(page) {
		const pageId = page.documentId || page.id;
		const slug = page.slug || page.fileName || pageId;
		goto(`/manage/${slug}`);
	}
	
	function manageEvent(page) {
		const pageId = page.documentId || page.id;
		const slug = page.slug || page.fileName || pageId;
		goto(`/manage/${slug}`);
	}
	
	function manageAppointments(page) {
		const pageId = page.documentId || page.id;
		const slug = page.slug || page.fileName || pageId;
		goto(`/manage/${slug}`);
	}
	
	function purchaseSubscription(page) {
		alert('תכונת רכישת מנוי תהיה זמינה בקרוב!\n\nמנוי פרימיום יכלול:\n✓ הסרת מיתוג AutoPage\n✓ דומיין מותאם אישית\n✓ אנליטיקס מתקדם\n✓ תמיכה עדיפות');
	}
</script>

<svelte:head>
	<title>הדשבורד שלי - AutoPage</title>
</svelte:head>

<div class="min-h-screen bg-gray-50">
	<div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
		<!-- Header Section -->
		<div class="bg-white rounded-2xl shadow-lg p-6 mb-8">
			<!-- Top Action Buttons -->
			<div class="flex justify-end gap-4 mb-6">
				<button 
					onclick={goToMarketplace}
					class="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg font-medium transition-colors"
				>
					Marketplace
				</button>
			</div>
			
			<!-- User Info -->
			<div class="flex items-center justify-between pb-6 border-b border-gray-200">
				<div class="flex items-center gap-4">
					<img 
						src={userData.avatar || 'https://placehold.co/80x80/E2E8F0/4A5568?text=U'} 
						alt="תמונת פרופיל" 
						class="w-16 h-16 rounded-full object-cover"
					/>
					<div class="text-right">
						<div class="font-semibold text-gray-900 text-xl">
							{userData.name}
						</div>
						<div class="text-sm text-gray-500">
							{$currentUser?.email || ''}
						</div>
						<div class="mt-1">
							<span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
								משתמש רשום
							</span>
						</div>
					</div>
				</div>
				<button 
					onclick={handleSignOut}
					title="התנתק" 
					class="text-gray-500 hover:text-red-600 transition flex items-center gap-2"
				>
					<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
						<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"></path>
					</svg>
					<span>התנתק</span>
				</button>
			</div>
		</div>

		<!-- Pages Section -->
		<div class="bg-white rounded-2xl shadow-lg p-6">
			<div class="flex justify-between items-center mb-6">
				<h2 class="text-2xl font-bold text-gray-900">דפי הנחיתה שלי</h2>
				<button 
					onclick={goToPageCreator}
					class="bg-indigo-600 text-white py-3 px-6 rounded-lg font-bold hover:bg-indigo-700 transition-transform transform hover:scale-105 flex items-center gap-2"
				>
					<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
						<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"></path>
					</svg>
					<span>דף חדש</span>
				</button>
			</div>

			{#if data.error}
				<div class="text-center py-12">
					<p class="text-red-600 text-lg">❌ שגיאה בטעינת הדפים: {data.error}</p>
				</div>
			{:else if data.pages.length === 0}
				<div class="text-center py-16">
					<div class="text-6xl mb-4">📄</div>
					<h3 class="text-2xl font-semibold text-gray-700 mb-2">אין לך דפים עדיין</h3>
					<p class="text-gray-600 mb-6">צור את הדף הראשון שלך עכשיו!</p>
					<button 
						onclick={goToPageCreator}
						class="bg-indigo-600 text-white py-3 px-8 rounded-lg font-bold hover:bg-indigo-700 transition-transform transform hover:scale-105"
					>
						צור דף חדש
					</button>
				</div>
			{:else}
				<div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
					{#each data.pages as page}
						<div class="bg-white border-2 border-gray-200 rounded-xl overflow-hidden hover:border-indigo-500 hover:shadow-lg transition-all">
							<!-- Page Preview -->
							<div class="h-48 bg-gradient-to-br from-purple-100 to-blue-100 flex items-center justify-center text-6xl">
								{getPageTypeIcon(page.pageType)}
							</div>
							
							<!-- Page Info -->
							<div class="p-5">
								<div class="flex items-start justify-between mb-2">
									<h3 class="text-lg font-bold text-gray-900 flex-1">
										{page.title || page.mainName || 'ללא שם'}
									</h3>
									<span class="inline-block bg-indigo-500 text-white px-2 py-1 rounded-full text-xs font-medium">
										{getPageTypeLabel(page.pageType)}
									</span>
								</div>
								
								{#if page.description}
									<p class="text-gray-600 text-sm mb-3 line-clamp-2">{page.description}</p>
								{/if}
								
								<div class="text-xs text-gray-500 mb-4">
									נוצר: {formatDate(page.createdAt)}
								</div>
								
								<!-- Action Buttons - LEGACY STYLE -->
								<div class="flex flex-col gap-2">
									<button 
										onclick={() => viewPage(page)}
										class="w-full bg-indigo-600 text-white py-2 px-3 rounded-lg text-sm font-medium hover:bg-indigo-700 transition"
									>
										👁️ צפה בדף
									</button>
									<button 
										onclick={() => editPage(page)}
										class="w-full bg-blue-500 text-white py-2 px-3 rounded-lg text-sm font-medium hover:bg-blue-600 transition"
									>
										✏️ עריכה
									</button>
									{#if page.pageType === 'store' || page.pageType === 'onlineStore'}
										<button 
											onclick={() => manageStore(page)}
											class="w-full bg-purple-600 text-white py-2 px-3 rounded-lg text-sm font-medium hover:bg-purple-700 transition"
										>
											🛒 ממשק ניהול חנות
										</button>
									{/if}
									{#if page.pageType === 'event'}
										<button 
											onclick={() => manageEvent(page)}
											class="w-full bg-pink-600 text-white py-2 px-3 rounded-lg text-sm font-medium hover:bg-pink-700 transition"
										>
											🎉 ניהול אירוע
										</button>
									{/if}
									{#if page.pageType === 'service' || page.pageType === 'serviceProvider'}
										<button 
											onclick={() => manageAppointments(page)}
											class="w-full bg-green-600 text-white py-2 px-3 rounded-lg text-sm font-medium hover:bg-green-700 transition"
										>
											📅 ניהול תורים
										</button>
									{/if}
									<button 
										onclick={() => purchaseSubscription(page)}
										class="w-full bg-gradient-to-r from-yellow-500 to-orange-500 text-white py-2 px-3 rounded-lg text-sm font-bold hover:from-yellow-600 hover:to-orange-600 transition"
									>
										⭐ רכוש מנוי
									</button>
									<button 
										onclick={() => deletePage(page.documentId || page.id)}
										class="w-full bg-red-100 text-red-600 py-2 px-3 rounded-lg text-sm font-medium hover:bg-red-200 transition"
									>
										🗑️ מחק
									</button>
								</div>
							</div>
						</div>
					{/each}
				</div>
			{/if}
		</div>
	</div>
</div>
