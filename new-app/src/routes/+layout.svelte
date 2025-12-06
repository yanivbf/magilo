<script>
	import '../app.css';
	import { page } from '$app/stores';
	import { goto } from '$app/navigation';
	import { currentUser, signOut, extractUserData } from '$lib/stores/auth';
	
	let { children } = $props();
	
	// Determine if this is the home page for background styling (Svelte 5 Runes syntax)
	let isHomePage = $derived($page.url.pathname === '/');
	
	// User data from auth store (same as dashboard)
	let userData = $state({ name: 'משתמש רשום', avatar: null, email: '' });
	
	// Update user data when currentUser changes
	$effect(() => {
		if ($currentUser) {
			userData = extractUserData($currentUser);
		}
	});
	
	// Logout function (same as dashboard)
	async function handleSignOut() {
		const result = await signOut();
		if (result.success) {
			goto('/');
		}
	}
</script>

<svelte:head>
	<link href="https://fonts.googleapis.com/css2?family=Rubik:wght@400;500;700&display=swap" rel="stylesheet">
	<link rel="icon" type="image/x-icon" href="/favicon.ico">
</svelte:head>

<div class={isHomePage ? '' : 'bg-gray-50 min-h-screen'}>
	{#if !isHomePage}
		<!-- Navigation Bar - NEW DESIGN: Logo + Email on Right, Menu in Center -->
		<nav class="bg-white border-b shadow-sm sticky top-0 z-50">
			<div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
				<div class="flex justify-between items-center h-16">
					<!-- RIGHT SIDE: Navigation Menu -->
					<div class="flex items-center gap-8">
						<a 
							href="/" 
							class="text-gray-700 hover:text-indigo-600 font-medium transition-colors {$page.url.pathname === '/' ? 'text-indigo-600 border-b-2 border-indigo-600 pb-1' : ''}"
						>
							בית
						</a>
						<a 
							href="/dashboard" 
							class="text-gray-700 hover:text-indigo-600 font-medium transition-colors {$page.url.pathname === '/dashboard' ? 'text-indigo-600 border-b-2 border-indigo-600 pb-1' : ''}"
						>
							הדשבורד שלי
						</a>
						<a 
							href="/page-creator" 
							class="text-gray-700 hover:text-indigo-600 font-medium transition-colors {$page.url.pathname === '/page-creator' ? 'text-indigo-600 border-b-2 border-indigo-600 pb-1' : ''}"
						>
							צור דף
						</a>
						<a 
							href="/marketplace" 
							class="text-gray-700 hover:text-indigo-600 font-medium transition-colors {$page.url.pathname === '/marketplace' ? 'text-indigo-600 border-b-2 border-indigo-600 pb-1' : ''}"
						>
							שוק
						</a>
					</div>
					
					<!-- CENTER: Empty space -->
					<div></div>
					
					<!-- LEFT SIDE: Logo + Email + Logout -->
					<div class="flex items-center gap-4">
						{#if $currentUser}
							<button 
								onclick={handleSignOut}
								class="flex items-center gap-2 px-4 py-2 text-gray-700 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all"
								title="התנתק"
							>
								<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
									<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"></path>
								</svg>
								<span class="font-medium">התנתק</span>
							</button>
						{/if}
						
						{#if $currentUser && userData.email}
							<div class="text-sm text-gray-600 border-l pl-4" dir="ltr">
								{userData.email}
							</div>
						{/if}
						
						<!-- Logo - Always visible -->
						<div class="flex items-center gap-2">
							<div class="w-10 h-10 rounded-lg bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white text-xl font-bold">
								A
							</div>
							<div>
								<h1 class="text-xl font-bold text-gray-900">AutoPage</h1>
							</div>
						</div>
						
						{#if !$currentUser}
							<a 
								href="/login" 
								class="bg-indigo-600 text-white px-6 py-2 rounded-lg hover:bg-indigo-700 transition-all font-medium shadow-md hover:shadow-lg"
							>
								התחבר
							</a>
						{/if}
					</div>
				</div>
			</div>
		</nav>
	{/if}
	
	<main>
		{@render children()}
	</main>
</div>

<style>
	:global(html) {
		direction: rtl;
	}
	:global(body) {
		font-family: 'Rubik', 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
	}
	
	/* EXACT Legacy: Floating Stav Bot Button */
	.stav-bot-fab {
		position: fixed;
		bottom: 20px;
		right: 20px;
		width: 70px;
		height: 70px;
		border-radius: 50%;
		background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
		border: 3px solid white;
		box-shadow: 0 8px 24px rgba(102, 126, 234, 0.4);
		cursor: pointer;
		z-index: 9998;
		display: flex;
		align-items: center;
		justify-content: center;
		transition: all 0.3s ease;
		padding: 0;
	}
	
	.stav-bot-fab:hover {
		transform: scale(1.1);
		box-shadow: 0 12px 32px rgba(102, 126, 234, 0.6);
	}
	
	.stav-avatar {
		width: 100%;
		height: 100%;
		border-radius: 50%;
		object-fit: cover;
	}
</style>
