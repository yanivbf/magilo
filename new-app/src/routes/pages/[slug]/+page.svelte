<script>
	// @ts-check
	import { page } from '$app/stores';
	import PageEditToolbar from '$lib/components/PageEditToolbar.svelte';
	import PageBotBubble from '$lib/components/PageBotBubble.svelte';
	import PageRenderer from '$lib/components/PageRenderer.svelte';
	import QuickInlineEdit from '$lib/components/QuickInlineEdit.svelte';

	/** @type {import('./$types').PageData} */
	let { data } = $props();
	
	// Make pageData bindable for inline editing
	let pageData = $state(data.page);

	// Set page title
	$effect(() => {
		if (pageData.title) {
			document.title = pageData.title;
		}
	});
</script>

<svelte:head>
	<title>{data.page.title}</title>
	{#if data.page.description}
		<meta name="description" content={data.page.description} />
	{/if}
</svelte:head>

<!-- Render page content - PUBLIC VIEW ONLY (no edit toolbar) -->
{#if pageData.hasSections}
	<!-- Sections-based page - redirect to /view/[slug] which has the actual sections -->
	<script>
		import { goto } from '$app/navigation';
		import { onMount } from 'svelte';
		
		onMount(() => {
			// Automatically redirect to the view page
			goto(`/view/${pageData.slug}`, { replaceState: true });
		});
	</script>
	
	<div style="padding: 2rem; text-align: center;">
		<p>מעביר לדף...</p>
	</div>
{:else}
	<!-- HTML-based page - use PageRenderer (PUBLIC VIEW - no editing) -->
	<PageRenderer pageData={pageData} isOwner={false} />
{/if}

<style>
	:global(body) {
		margin: 0;
		padding: 0;
	}
	
	/* Edit Toolbar */
	.edit-toolbar {
		position: fixed;
		top: 20px;
		left: 50%;
		transform: translateX(-50%);
		background: white;
		padding: 0.5rem;
		border-radius: 50px;
		box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);
		display: flex;
		gap: 0.5rem;
		z-index: 9999;
		animation: slideDown 0.3s ease-out;
	}
	
	@keyframes slideDown {
		from {
			opacity: 0;
			transform: translateX(-50%) translateY(-20px);
		}
		to {
			opacity: 1;
			transform: translateX(-50%) translateY(0);
		}
	}
	
	.toolbar-btn {
		display: flex;
		align-items: center;
		gap: 0.5rem;
		padding: 0.75rem 1.5rem;
		border: none;
		border-radius: 50px;
		font-weight: 600;
		cursor: pointer;
		transition: all 0.2s;
		font-size: 0.95rem;
		text-decoration: none;
		background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
		color: white;
	}
	
	.toolbar-btn:hover {
		transform: translateY(-2px);
		box-shadow: 0 4px 15px rgba(102, 126, 234, 0.4);
	}
	
	.toolbar-btn.secondary {
		background: #f3f4f6;
		color: #374151;
	}
	
	.toolbar-btn.secondary:hover {
		background: #e5e7eb;
		box-shadow: 0 4px 15px rgba(0, 0, 0, 0.1);
	}
</style>
