<script>
	import { onMount } from 'svelte';
	import ServicesEditor from '$lib/components/ServicesEditor.svelte';
	import ProductManager from '$lib/components/ProductManager.svelte';
	import SectionManager from '$lib/components/SectionManager.svelte';
	import ContentSectionsEditor from '$lib/components/manage/ContentSectionsEditor.svelte';
	import AnalyticsDashboard from '$lib/components/manage/AnalyticsDashboard.svelte';
	import SubscriptionManager from '$lib/components/manage/SubscriptionManager.svelte';
	
	let { pageId, pageData, userId } = $props();
	
	let activeTab = $state('services');
	
	// Determine which tabs to show based on page type
	const availableTabs = $derived(() => {
		const tabs = [];
		
		// Services tab - available for service-based pages
		if (pageData?.template === 'service' || pageData?.template === 'workshop' || pageData?.pageType === 'serviceProvider') {
			tabs.push({ id: 'services', label: 'שירותים', icon: '⚙️' });
		}
		
		// Products tab - available for store/restaurant pages
		if (pageData?.template === 'store' || pageData?.template === 'restaurant' || pageData?.pageType === 'store') {
			tabs.push({ id: 'products', label: 'מוצרים', icon: '🛍️' });
		}
		
		// Sections tab - available for all pages
		tabs.push({ id: 'sections', label: 'סקשנים', icon: '📄' });
		
		// Content Sections tab - FAQ, Gallery, Testimonials
		tabs.push({ id: 'content', label: 'תוכן מקטעים', icon: '📝' });
		
		// Analytics tab - available for all pages
		tabs.push({ id: 'analytics', label: 'ניתוח ביצועים', icon: '📊' });
		
		// Subscription tab - available for all pages
		tabs.push({ id: 'subscription', label: 'מנוי פרימיום', icon: '⭐' });
		
		return tabs;
	});
	
	// Set initial active tab to first available
	$effect(() => {
		if (availableTabs().length > 0 && !availableTabs().find(t => t.id === activeTab)) {
			activeTab = availableTabs()[0].id;
		}
	});
</script>

<div class="tabbed-management-interface bg-white rounded-lg shadow-lg">
	<!-- Tab Navigation -->
	<div class="border-b border-gray-200">
		<nav class="flex space-x-reverse space-x-4 px-6" dir="rtl">
			{#each availableTabs() as tab}
				<button
					onclick={() => activeTab = tab.id}
					class="py-4 px-6 text-sm font-medium border-b-2 transition-colors {
						activeTab === tab.id
							? 'border-purple-600 text-purple-600'
							: 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
					}"
				>
					<span class="mr-2">{tab.icon}</span>
					{tab.label}
				</button>
			{/each}
		</nav>
	</div>
	
	<!-- Tab Content -->
	<div class="p-6">
		{#if activeTab === 'services'}
			<ServicesEditor 
				{pageId} 
				services={pageData?.services || []} 
			/>
		{:else if activeTab === 'products'}
			<ProductManager 
				{pageId} 
				products={pageData?.products || pageData?.storeProducts || []} 
			/>
		{:else if activeTab === 'sections'}
			<SectionManager 
				{pageId} 
				sections={pageData?.sections || []} 
				pageType={pageData?.template || pageData?.pageType || 'general'} 
			/>
		{:else if activeTab === 'content'}
			<ContentSectionsEditor 
				{pageId} 
				faq={pageData?.faq || []}
				gallery={pageData?.gallery || []}
				testimonials={pageData?.testimonials || []}
			/>
		{:else if activeTab === 'analytics'}
			<AnalyticsDashboard {pageId} />
		{:else if activeTab === 'subscription'}
			<SubscriptionManager {pageId} {userId} />
		{/if}
	</div>
</div>

<style>
	.tabbed-management-interface {
		min-height: 500px;
	}
</style>
