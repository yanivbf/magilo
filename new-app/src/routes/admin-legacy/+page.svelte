<script>
	import { onMount } from 'svelte';
	import { goto } from '$app/navigation';
	
	onMount(() => {
		// Redirect to the legacy admin HTML
		const params = new URLSearchParams(window.location.search);
		const page = params.get('page');
		const userId = params.get('userId');
		
		if (page && userId) {
			window.location.href = `/admin-legacy.html?page=${page}&userId=${userId}`;
		} else {
			window.location.href = '/admin-legacy.html';
		}
	});
</script>

<div class="min-h-screen flex items-center justify-center bg-gray-100">
	<div class="text-center">
		<div class="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-indigo-600 mx-auto mb-4"></div>
		<p class="text-gray-600">מעביר לאדמין הישן...</p>
	</div>
</div>
