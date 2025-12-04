<script>
	import { goto } from '$app/navigation';
	
	let { pageData, isOwner = false } = $props();
	
	let isDev = $state(false);
	
	$effect(() => {
		isDev = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
	});
	
	function goToManage() {
		const slug = pageData?.slug || pageData?.fileName || pageData?.id;
		if (slug) {
			goto(`/manage/${slug}`);
		}
	}
	
	function goToDashboard() {
		goto('/dashboard');
	}
</script>

{#if isOwner || isDev}
	<!-- Simple Edit Button - Fixed position -->
	<div class="fixed top-4 right-4 z-[9999] flex gap-2">
		<button 
			onclick={goToDashboard}
			class="bg-gray-600 hover:bg-gray-700 text-white px-6 py-3 rounded-lg font-bold shadow-lg transition flex items-center gap-2"
		>
			<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
				<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"></path>
			</svg>
			דשבורד
		</button>
		
		<button 
			onclick={goToManage}
			class="bg-purple-600 hover:bg-purple-700 text-white px-6 py-3 rounded-lg font-bold shadow-lg transition flex items-center gap-2 animate-pulse"
		>
			<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
				<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"></path>
			</svg>
			ערוך דף
		</button>
	</div>
{/if}

<style>
	@keyframes pulse {
		0%, 100% {
			opacity: 1;
		}
		50% {
			opacity: 0.8;
		}
	}
	
	.animate-pulse {
		animation: pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
	}
</style>
