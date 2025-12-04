<script>
	import '../app.css';
	import { page } from '$app/stores';
	
	let { children } = $props();
	
	// Determine if this is the home page for background styling (Svelte 5 Runes syntax)
	let isHomePage = $derived($page.url.pathname === '/');
</script>

<svelte:head>
	<link href="https://fonts.googleapis.com/css2?family=Rubik:wght@400;500;700&display=swap" rel="stylesheet">
	<link rel="icon" type="image/x-icon" href="/favicon.ico">
</svelte:head>

<div class={isHomePage ? '' : 'bg-gray-50 min-h-screen'}>
	{#if !isHomePage}
		<!-- Navigation Bar (White with Shadow) -->
		<nav class="bg-white border-b shadow-sm">
			<div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
				<div class="flex justify-between items-center h-16">
					<div class="flex items-center">
						<h1 class="text-2xl font-bold text-gray-900">AutoPage</h1>
						<span class="mr-2 text-sm text-gray-500">יוצר דפים אוטומטי</span>
					</div>
					<div class="flex items-center gap-6">
						<a href="/" class="text-gray-700 hover:text-indigo-600 font-medium transition">בית</a>
						<a href="/marketplace" class="text-gray-700 hover:text-indigo-600 font-medium transition">שוק</a>
						<a href="/dashboard" class="text-gray-700 hover:text-indigo-600 font-medium transition">הדשבורד שלי</a>
						<a href="/login" class="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition">התחבר</a>
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
