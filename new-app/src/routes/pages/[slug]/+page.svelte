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

<!-- Edit Toolbar (only for owner) -->
{#if data.isOwner}
	<div class="edit-toolbar">
		<a href="/manage/{pageData.id}" class="toolbar-btn">
			<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
				<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
			</svg>
			ערוך דף
		</a>
		<a href="/dashboard" class="toolbar-btn secondary">
			<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
				<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
			</svg>
			דשבורד
		</a>
	</div>
{/if}

<!-- Render page content -->
{#if pageData.hasSections}
	<!-- Sections-based page - redirect to view page for now -->
	<div style="padding: 2rem; text-align: center;">
		<h1>דף עם מקטעים</h1>
		<p>הדף נוצר בהצלחה!</p>
		<a href="/view/{pageData.slug}" style="display: inline-block; padding: 1rem 2rem; background: #667eea; color: white; text-decoration: none; border-radius: 8px; margin-top: 1rem;">
			צפה בדף
		</a>
		<a href="/manage/{pageData.id}" style="display: inline-block; padding: 1rem 2rem; background: #764ba2; color: white; text-decoration: none; border-radius: 8px; margin-top: 1rem; margin-right: 1rem;">
			נהל דף
		</a>
	</div>
{:else}
	<!-- HTML-based page - use PageRenderer -->
	<PageRenderer pageData={pageData} isOwner={data.isOwner} />
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
