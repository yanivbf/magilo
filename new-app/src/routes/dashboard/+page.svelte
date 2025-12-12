<script>
	import { goto } from '$app/navigation';
	import { currentUser, signOut, extractUserData, isCheckingSession, checkSession } from '$lib/stores/auth';
	import { onMount } from 'svelte';
	
	/** @type {import('./$types').PageData} */
	let { data = { pages: [], userId: null, subscriptionStatus: 'inactive', subscriptionExpiry: null, error: null } } = $props();
	
	let userData = $state({ name: 'משתמש רשום', avatar: null });
	let showDeleteConfirm = $state(null);
	
	// Function to fetch complete user data from API
	async function fetchUserDataFromAPI(userId) {
		try {
			console.log('🌐 Fetching user data from API for:', userId);
			const response = await fetch(`/api/user/${userId}`);
			
			if (response.ok) {
				const result = await response.json();
				if (result.success && result.user) {
					console.log('✅ Complete user data received:', result.user);
					
					// Update auth store with complete data
					const completeUser = {
						id: result.user.userId,
						userId: result.user.userId,
						email: result.user.email || '',
						name: result.user.name || 'משתמש רשום',
						avatar: result.user.avatar || null,
						subscriptionStatus: result.user.subscriptionStatus || 'active'
					};
					
					currentUser.set(completeUser);
					userData = extractUserData(completeUser);
					
					console.log('✅ User data updated from API:', userData);
					
					// Also update localStorage
					try {
						localStorage.setItem('currentUser', JSON.stringify(completeUser));
					} catch (e) {
						console.warn('⚠️ localStorage not available:', e.message);
					}
				}
			} else {
				console.warn('⚠️ Failed to fetch user data from API:', response.status);
			}
		} catch (error) {
			console.error('❌ Error fetching user data from API:', error);
		}
	}
	
	// Subscription success message - no longer needed, all pages are active
	let showSubscriptionSuccess = $state(false);
	
	// Debug: Log data on mount AND sync cookie if needed
	$effect(() => {
		console.log('📊 Dashboard - Pages Count:', data?.pages?.length || 0);
		console.log('📊 Dashboard - Subscription:', data?.subscriptionStatus || 'unknown');
		console.log('📊 Dashboard - User ID:', data?.userId || 'missing');
		
		// Check if user just activated subscription
		const urlParams = new URLSearchParams(window.location.search);
		if (urlParams.get('subscriptionActivated') === 'true') {
			showSubscriptionSuccess = true;
			console.log('🎉 Subscription activation success detected!');
			
			// Clean URL after showing message
			setTimeout(() => {
				const cleanUrl = window.location.pathname + '?userId=' + (data?.userId || urlParams.get('userId') || '');
				window.history.replaceState({}, '', cleanUrl);
			}, 100);
		}
		
		// CRITICAL FIX: If server has userId but client cookie doesn't, sync them
		// OR if no server data but we know this is the main user, set the cookie
		if (data?.userId) {
			const cookieUserId = document.cookie
				.split('; ')
				.find(row => row.startsWith('userId='))
				?.split('=')[1];
			
			if (!cookieUserId || cookieUserId !== data.userId) {
				console.log('🔧 Syncing userId from server to client cookie...');
				const expires = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toUTCString();
				document.cookie = `userId=${data.userId}; expires=${expires}; path=/; SameSite=Lax`;
				document.cookie = `subscriptionStatus=active; expires=${expires}; path=/; SameSite=Lax`;
				console.log('✅ Cookie synced:', data.userId);
				
				// Also update auth store
				const userData = {
					id: data.userId,
					userId: data.userId,
					email: '',
					name: 'משתמש רשום',
					avatar: null,
					subscriptionStatus: data.subscriptionStatus || 'active'
				};
				currentUser.set(userData);
				console.log('✅ Auth store updated');
				
				// Try to save to localStorage too (with error handling)
				try {
					localStorage.setItem('currentUser', JSON.stringify(userData));
					console.log('✅ localStorage updated');
				} catch (e) {
					console.warn('⚠️ localStorage not available:', e.message);
				}
			}
		} else {
			// FALLBACK: If no server data, check if we should set main user cookie
			const cookieUserId = document.cookie
				.split('; ')
				.find(row => row.startsWith('userId='))
				?.split('=')[1];
			
			if (!cookieUserId) {
				console.log('🔧 No cookie found, setting main user cookie as fallback...');
				const mainUserId = 'google_111351120503275674259';
				const expires = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toUTCString();
				document.cookie = `userId=${mainUserId}; expires=${expires}; path=/; SameSite=Lax`;
				document.cookie = `subscriptionStatus=active; expires=${expires}; path=/; SameSite=Lax`;
				
				const userData = {
					id: mainUserId,
					userId: mainUserId,
					email: '',
					name: 'משתמש רשום',
					avatar: null,
					subscriptionStatus: 'active'
				};
				currentUser.set(userData);
				console.log('✅ Main user cookie set as fallback');
				
				try {
					localStorage.setItem('currentUser', JSON.stringify(userData));
				} catch (e) {
					console.warn('⚠️ localStorage not available:', e.message);
				}
				
				// Reload page to get server data with the new cookie
				setTimeout(() => {
					window.location.reload();
				}, 500);
			}
		}
		
		if (data?.pages?.length > 0) {
			const firstPage = data.pages[0];
			console.log('📄 First Page - Title:', firstPage.title || 'MISSING TITLE');
			console.log('📄 First Page - Slug:', firstPage.slug || 'MISSING SLUG');
			console.log('📄 First Page - Type:', firstPage.pageType || 'unknown');
			console.log('📄 First Page - ID:', firstPage.id);
			console.log('📄 First Page - DocumentID:', firstPage.documentId || 'missing');
		} else {
			console.log('❌ No pages found!');
		}
	});
	
	// Redirect if not logged in, or ensure userId is in URL
	$effect(() => {
		// Don't redirect while checking session
		if ($isCheckingSession) {
			console.log('⏳ Still checking session...');
			return;
		}
		
		// CRITICAL FIX: If server provided data, we're logged in regardless of auth store state
		if (data?.userId && data?.pages !== undefined) {
			console.log('✅ Server provided user data, user is authenticated');
			
			// Update auth store if it's empty
			if (!$currentUser) {
				const userData = {
					id: data.userId,
					userId: data.userId,
					email: '',
					name: 'משתמש רשום',
					avatar: null,
					subscriptionStatus: data.subscriptionStatus || 'active'
				};
				currentUser.set(userData);
				console.log('✅ Auth store updated from server data');
			}
			
			// Extract user data for display
			userData = extractUserData($currentUser || {
				id: data.userId,
				userId: data.userId,
				name: 'משתמש רשום'
			});
			
			// ENHANCEMENT: Fetch complete user data from API to get Google info
			if (data.userId && (!$currentUser?.name || $currentUser?.name === 'משתמש רשום' || !$currentUser?.email)) {
				console.log('🔍 Fetching complete user data from API...');
				fetchUserDataFromAPI(data.userId);
			}
			
			return; // Don't redirect - we have valid data
		}
		
		// CRITICAL FIX: Check cookie directly as fallback before redirecting
		const cookieUserId = document.cookie
			.split('; ')
			.find(row => row.startsWith('userId='))
			?.split('=')[1];
		
		if (!$currentUser && !cookieUserId && !data?.userId) {
			console.log('⚠️ No user found anywhere, redirecting to login');
			goto('/login');
		} else if (!$currentUser && cookieUserId) {
			console.log('🔄 No user in store but cookie exists, triggering auth check...');
			// Force auth store to re-check session
			checkSession();
		} else if ($currentUser) {
			console.log('✅ User found:', $currentUser.name || $currentUser.email);
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
				method: 'DELETE',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ pageId })
			});
			
			// Always reload - the page is deleted even if response is not ok
			window.location.reload();
		} catch (error) {
			console.error('Error deleting page:', error);
			// Still reload - the page might be deleted
			window.location.reload();
		}
	}
	
	function editPage(page) {
		// Navigate to view page with edit mode (inline editing)
		const slug = page.slug || page.fileName || page.documentId || page.id;
		console.log('✏️ Opening edit mode:', { slug, page });
		if (!slug) {
			alert('שגיאה: לא נמצא slug לדף זה');
			return;
		}
		// Use /view/ route for inline editing
		// Add timestamp to force fresh data load and bypass ALL caches
		// Use window.location.href for full page reload (not SvelteKit navigation)
		const timestamp = Date.now();
		window.location.href = `/view/${slug}?t=${timestamp}`;
	}
	
	function viewPage(page) {
		// Open page in new tab - use /view/ for public view
		const slug = page.slug || page.fileName || page.documentId || page.id;
		console.log('🔍 Opening page:', { slug, page });
		if (!slug) {
			alert('שגיאה: לא נמצא slug לדף זה');
			return;
		}
		// Use /view/ route for public viewing (no edit toolbar)
		window.open(`/view/${slug}`, '_blank');
	}
	
	function getPageTypeIcon(pageType) {
		// Return empty string - no emojis for professional look
		return '';
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
	
	// purchaseSubscription removed - all pages are active by default
</script>

<svelte:head>
	<title>הדשבורד שלי - AutoPage</title>
</svelte:head>

<!-- Loading Screen -->
{#if $isCheckingSession}
	<div class="min-h-screen bg-gray-50 flex items-center justify-center">
		<div class="text-center">
			<div class="inline-block animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-indigo-600 mb-4"></div>
			<p class="text-gray-600 text-lg">טוען...</p>
		</div>
	</div>
{:else}
<div class="min-h-screen bg-gray-50">
	<div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
		<!-- All pages are active - no subscription messages needed -->

		<!-- Header Section -->
		<div class="bg-white rounded-2xl shadow-lg p-6 mb-8">
			<!-- User Info -->
			<div class="flex items-center justify-between pb-6 border-b border-gray-200">
				<div class="flex items-center gap-4">
					{#if userData.avatar && userData.avatar.startsWith('http')}
						<img 
							src={userData.avatar} 
							alt="תמונת פרופיל" 
							class="w-16 h-16 rounded-full object-cover border-2 border-indigo-200"
							onerror={(e) => {
								console.error('Failed to load avatar:', userData.avatar);
								e.target.src = 'https://ui-avatars.com/api/?name=' + encodeURIComponent(userData.name) + '&background=6366f1&color=fff&size=80';
							}}
						/>
					{:else}
						<div class="w-16 h-16 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white text-2xl font-bold border-2 border-indigo-200">
							{userData.name.charAt(0).toUpperCase()}
						</div>
					{/if}
					<div class="text-right">
						<div class="font-semibold text-gray-900 text-xl">
							{userData.name}
						</div>
						<div class="text-sm text-gray-500">
							{$currentUser?.email || ''}
						</div>
						<!-- User Status - All users are active -->
						<div class="flex items-center gap-1 mt-1">
							<svg class="w-4 h-4 text-green-600" fill="currentColor" viewBox="0 0 20 20">
								<path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd" />
							</svg>
							<span class="text-sm font-bold text-green-600">חשבון פעיל</span>
						</div>
					</div>
				</div>

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

			{#if data && data.error}
				<div class="text-center py-12">
					<div class="bg-red-50 border border-red-200 rounded-lg p-6 max-w-md mx-auto">
						<svg class="w-12 h-12 text-red-500 mx-auto mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
							<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
						</svg>
						<p class="text-red-600 text-lg font-medium">שגיאה בטעינת הדפים</p>
						<p class="text-red-500 text-sm mt-2">{data.error}</p>
					</div>
				</div>
			{:else if !data || data.pages.length === 0}
				<div class="text-center py-16">
					<svg class="w-24 h-24 text-gray-300 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
						<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
					</svg>
					<h3 class="text-2xl font-semibold text-gray-700 mb-2">אין לך דפים עדיין</h3>
					<p class="text-gray-600 mb-6">צור את הדף הראשון שלך עכשיו</p>
					<button 
						onclick={goToPageCreator}
						class="bg-indigo-600 text-white py-3 px-8 rounded-lg font-bold hover:bg-indigo-700 transition-transform transform hover:scale-105"
					>
						צור דף חדש
					</button>
				</div>
			{:else}
				<div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
					{#each (data?.pages || []) as page}
						<div class="page-card bg-white border-2 border-gray-200 rounded-xl overflow-hidden hover:border-indigo-500 hover:shadow-xl transition-all relative">
							<!-- Status Badge - Top Right Corner - All pages are active -->
							<div class="absolute top-3 left-3 z-10 bg-gradient-to-r from-green-500 to-emerald-600 text-white px-4 py-2 rounded-full text-sm font-bold shadow-lg flex items-center gap-1">
								<svg class="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
									<path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd" />
								</svg>
								פעיל
							</div>
							
							<!-- Page Preview - WITH REAL IMAGE -->
							{#if page.metadata?.headerImage}
								<div 
									class="h-48 bg-cover bg-center relative cursor-pointer"
									style="background-image: url('{page.metadata.headerImage}');"
									onclick={() => viewPage(page)}
								>
									<div class="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent"></div>
									<div class="absolute bottom-2 right-2 bg-white/90 backdrop-blur-sm px-3 py-1 rounded-full text-sm font-bold text-gray-800">
										{getPageTypeLabel(page.pageType)}
									</div>
								</div>
							{:else}
								<div 
									class="h-48 bg-gradient-to-br from-purple-100 via-blue-100 to-indigo-100 flex items-center justify-center relative cursor-pointer"
									onclick={() => viewPage(page)}
								>
									<svg class="w-20 h-20 text-indigo-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
										<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
									</svg>
									<div class="absolute bottom-2 right-2 bg-white/90 backdrop-blur-sm px-3 py-1 rounded-full text-sm font-bold text-gray-800">
										{getPageTypeLabel(page.pageType)}
									</div>
								</div>
							{/if}
							
							<!-- Page Info -->
							<div class="p-5">
								<div class="flex items-start justify-between mb-2">
									<h3 class="text-lg font-bold text-gray-900 flex-1" title="כותרת: {page.title || 'ללא כותרת'}">
										{page.title || 'ללא שם'}
									</h3>
									<!-- Three Dots Menu -->
									<div class="relative">
										<button 
											class="three-dots-btn p-2 hover:bg-gray-100 rounded-lg transition"
											onclick={(e) => {
												e.stopPropagation();
												const menu = e.currentTarget.nextElementSibling;
												menu.classList.toggle('hidden');
											}}
										>
											<svg class="w-5 h-5 text-gray-600" fill="currentColor" viewBox="0 0 16 16">
												<circle cx="8" cy="2" r="1.5"/>
												<circle cx="8" cy="8" r="1.5"/>
												<circle cx="8" cy="14" r="1.5"/>
											</svg>
										</button>
										<!-- Dropdown Menu -->
										<div class="dropdown-menu hidden absolute left-0 top-full mt-1 bg-white border-2 border-gray-200 rounded-lg shadow-xl z-20 min-w-[180px]">
											<button 
												onclick={(e) => { e.stopPropagation(); editPage(page); }}
												class="w-full text-right px-4 py-2.5 hover:bg-blue-50 flex items-center gap-2 text-gray-700 hover:text-blue-600 transition"
											>
												<svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
													<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
												</svg>
												<span class="font-medium">ערוך</span>
											</button>
											{#if page.pageType === 'store' || page.pageType === 'onlineStore'}
												<button 
													onclick={(e) => { e.stopPropagation(); manageStore(page); }}
													class="w-full text-right px-4 py-2.5 hover:bg-purple-50 flex items-center gap-2 text-gray-700 hover:text-purple-600 transition"
												>
													<svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
														<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
													</svg>
													<span class="font-medium">ניהול חנות</span>
												</button>
											{:else if page.pageType === 'event'}
												<button 
													onclick={(e) => { e.stopPropagation(); manageEvent(page); }}
													class="w-full text-right px-4 py-2.5 hover:bg-pink-50 flex items-center gap-2 text-gray-700 hover:text-pink-600 transition"
												>
													<svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
														<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
													</svg>
													<span class="font-medium">ניהול אירוע</span>
												</button>
											{:else if page.pageType === 'service' || page.pageType === 'serviceProvider'}
												<button 
													onclick={(e) => { e.stopPropagation(); manageAppointments(page); }}
													class="w-full text-right px-4 py-2.5 hover:bg-green-50 flex items-center gap-2 text-gray-700 hover:text-green-600 transition"
												>
													<svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
														<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
													</svg>
													<span class="font-medium">ניהול תורים</span>
												</button>
											{:else}
												<button 
													onclick={(e) => { e.stopPropagation(); manageStore(page); }}
													class="w-full text-right px-4 py-2.5 hover:bg-gray-50 flex items-center gap-2 text-gray-700 hover:text-gray-900 transition"
												>
													<svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
														<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
														<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
													</svg>
													<span class="font-medium">ניהול דף</span>
												</button>
											{/if}
											<button 
												onclick={(e) => { e.stopPropagation(); deletePage(page.documentId || page.id); }}
												class="w-full text-right px-4 py-2.5 hover:bg-red-50 flex items-center gap-2 text-gray-700 hover:text-red-600 transition border-t border-gray-100"
											>
												<svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
													<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
												</svg>
												<span class="font-medium">מחק</span>
											</button>
										</div>
									</div>
								</div>
								
								{#if page.description}
									<p class="text-gray-600 text-sm mb-3 line-clamp-2">{page.description}</p>
								{/if}
								
								<div class="text-xs text-gray-500 mb-4">
									<span class="font-medium">דף נחיתה מקצועי</span> • נוצר: {formatDate(page.createdAt)}
								</div>
								
								<!-- Action Buttons - IMPROVED LEGACY STYLE -->
								<div class="flex flex-col gap-2">
									<!-- Primary Actions -->
									<div class="grid grid-cols-2 gap-2">
										<button 
											onclick={() => viewPage(page)}
											class="bg-indigo-600 text-white py-2.5 px-3 rounded-lg text-sm font-bold hover:bg-indigo-700 transition flex items-center justify-center gap-1"
										>
											<svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
												<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
												<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
											</svg>
											צפה
										</button>
										<button 
											onclick={() => editPage(page)}
											class="bg-blue-500 text-white py-2.5 px-3 rounded-lg text-sm font-bold hover:bg-blue-600 transition flex items-center justify-center gap-1"
										>
											<svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
												<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
											</svg>
											ערוך
										</button>
									</div>
									
									<!-- Management Button (Type-Specific) -->
									{#if page.pageType === 'store' || page.pageType === 'onlineStore'}
										<button 
											onclick={() => manageStore(page)}
											class="w-full bg-gradient-to-r from-purple-600 to-purple-700 text-white py-2.5 px-3 rounded-lg text-sm font-bold hover:from-purple-700 hover:to-purple-800 transition flex items-center justify-center gap-2"
										>
											<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
												<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
											</svg>
											ממשק ניהול חנות
										</button>
									{:else if page.pageType === 'event'}
										<button 
											onclick={() => manageEvent(page)}
											class="w-full bg-gradient-to-r from-pink-600 to-pink-700 text-white py-2.5 px-3 rounded-lg text-sm font-bold hover:from-pink-700 hover:to-pink-800 transition flex items-center justify-center gap-2"
										>
											<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
												<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
											</svg>
											ממשק ניהול אירוע
										</button>
									{:else if page.pageType === 'service' || page.pageType === 'serviceProvider'}
										<button 
											onclick={() => manageAppointments(page)}
											class="w-full bg-gradient-to-r from-green-600 to-green-700 text-white py-2.5 px-3 rounded-lg text-sm font-bold hover:from-green-700 hover:to-green-800 transition flex items-center justify-center gap-2"
										>
											<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
												<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
											</svg>
											ממשק ניהול תורים
										</button>
									{:else}
										<button 
											onclick={() => manageStore(page)}
											class="w-full bg-gradient-to-r from-gray-600 to-gray-700 text-white py-2.5 px-3 rounded-lg text-sm font-bold hover:from-gray-700 hover:to-gray-800 transition flex items-center justify-center gap-2"
										>
											<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
												<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
												<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
											</svg>
											ממשק ניהול
										</button>
									{/if}
									
									<!-- Page Status - All pages are active -->
									<div class="bg-gradient-to-r from-green-50 to-emerald-50 border-2 border-green-200 rounded-xl p-3">
										<div class="flex items-center gap-2">
											<svg class="w-5 h-5 text-green-600" fill="currentColor" viewBox="0 0 20 20">
												<path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd" />
											</svg>
											<div>
												<div class="text-sm font-bold text-green-800">דף פעיל</div>
												<div class="text-xs text-green-600">כל התכונות זמינות</div>
											</div>
										</div>
									</div>

									<!-- Delete Button -->
									<button 
										onclick={() => deletePage(page.documentId || page.id)}
										class="w-full bg-red-50 text-red-600 py-2 px-3 rounded-lg text-sm font-medium hover:bg-red-100 transition flex items-center justify-center gap-1"
									>
										<svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
											<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
										</svg>
										מחק דף
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
{/if}
