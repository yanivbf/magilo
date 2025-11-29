<script>
	import { goto } from '$app/navigation';
	import { currentUser } from '$lib/stores/auth';
	
	// Redirect if not logged in
	$effect(() => {
		if (!$currentUser) {
			goto('/login');
		}
	});
	
	// Use the legacy page creator but make it save to Strapi
	// The legacy system is fully functional with all features
	// We just need to update its API endpoints to use Strapi
</script>

<svelte:head>
	<title>יוצר דפים - AutoPage</title>
</svelte:head>

<!-- Embed the legacy page creator directly -->
<iframe 
	src="/page-creator-legacy.html" 
	style="width: 100%; height: 100vh; border: none; position: fixed; top: 0; left: 0; right: 0; bottom: 0;"
	title="יוצר דפים"
></iframe>
