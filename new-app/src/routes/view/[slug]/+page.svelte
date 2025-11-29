<script>
	// @ts-check
	/** @type {import('./$types').PageData} */
	let { data } = $props();

	// Set page title
	$effect(() => {
		if (data.page.title) {
			document.title = data.page.title;
		}
	});
</script>

<svelte:head>
	<title>{data.page.title}</title>
	{#if data.page.description}
		<meta name="description" content={data.page.description} />
	{/if}
</svelte:head>

<!-- Render the original HTML content exactly as it was -->
<div class="page-container">
	{@html data.page.htmlContent}
</div>

<style>
	.page-container {
		width: 100%;
		min-height: 100vh;
	}

	/* Reset any default styles */
	:global(body) {
		margin: 0;
		padding: 0;
	}
</style>
