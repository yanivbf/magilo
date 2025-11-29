<script>
	// @ts-check
	import { goto } from '$app/navigation';

	/** @type {import('./$types').PageData} */
	let { data } = $props();

	// Reactive state using Svelte 5 Runes
	let searchQuery = $state(data.filters.search);
	let selectedPageType = $state(data.filters.pageType);

	// Page types for filter (Hebrew labels)
	const pageTypes = [
		{ value: '', label: 'כל הסוגים' },
		{ value: 'store', label: '🏪 חנויות' },
		{ value: 'event', label: '🎉 אירועים' },
		{ value: 'serviceProvider', label: '🔧 בעלי מקצוע' },
		{ value: 'restaurantMenu', label: '🍽️ מסעדות' },
		{ value: 'course', label: '🎓 קורסים' },
		{ value: 'workshop', label: '🎨 סדנאות' }
	];

	// Handle search
	function handleSearch() {
		const params = new URLSearchParams();
		if (searchQuery) params.set('search', searchQuery);
		if (selectedPageType) params.set('pageType', selectedPageType);
		goto(`/marketplace?${params.toString()}`);
	}

	// Handle page type filter
	function handlePageTypeChange() {
		handleSearch();
	}

	// Handle pagination
	function goToPage(page) {
		const params = new URLSearchParams();
		if (searchQuery) params.set('search', searchQuery);
		if (selectedPageType) params.set('pageType', selectedPageType);
		params.set('page', page.toString());
		goto(`/marketplace?${params.toString()}`);
	}
	
	// Filter by type button
	function filterByType(type) {
		selectedPageType = type === 'all' ? '' : type;
		handleSearch();
	}
</script>

<svelte:head>
	<title>AutoPage Marketplace</title>
	<meta name="description" content="מצא את הדף המושלם שלך" />
</svelte:head>

<!-- Hero Header with Purple Background -->
<div class="hero-gradient text-white">
	<div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
		<div class="text-center">
			<h1 class="text-4xl md:text-6xl font-bold mb-4">AutoPage Marketplace</h1>
			<p class="text-xl md:text-2xl mb-8 opacity-90">מצא את הדף המושלם שלך</p>
			
			<!-- Search Bar -->
			<div class="max-w-2xl mx-auto mb-8">
				<div class="relative">
					<input 
						type="text" 
						bind:value={searchQuery}
						placeholder="חפש דפים, עסקים, שירותים..." 
						onkeydown={(e) => e.key === 'Enter' && handleSearch()}
						class="w-full px-6 py-4 text-gray-900 text-lg rounded-full focus:ring-4 focus:ring-white focus:ring-opacity-50 focus:outline-none"
					/>
					<button 
						onclick={handleSearch}
						class="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
					>
						<svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
							<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path>
						</svg>
					</button>
				</div>
			</div>
			
			<!-- Create Page Button -->
			<div class="flex justify-center gap-4">
				<a href="/page-creator" class="bg-white text-indigo-600 px-8 py-4 rounded-full font-bold text-lg hover:bg-gray-100 transition-all transform hover:scale-105 flex items-center gap-2">
					<svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
						<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"></path>
					</svg>
					צור דף עכשיו
				</a>
			</div>
		</div>
	</div>
</div>

<!-- Filter Buttons -->
<div class="bg-white border-b">
	<div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
		<div class="flex flex-wrap justify-center gap-3">
			<button 
				onclick={() => filterByType('all')} 
				class="px-6 py-3 {selectedPageType === '' ? 'bg-indigo-500 text-white' : 'bg-gray-200 text-gray-700'} rounded-full hover:bg-indigo-600 hover:text-white transition-all"
			>
				הכל
			</button>
			<button 
				onclick={() => filterByType('store')} 
				class="px-6 py-3 {selectedPageType === 'store' ? 'bg-indigo-500 text-white' : 'bg-gray-200 text-gray-700'} rounded-full hover:bg-indigo-600 hover:text-white transition-all"
			>
				🏪 חנויות
			</button>
			<button 
				onclick={() => filterByType('event')} 
				class="px-6 py-3 {selectedPageType === 'event' ? 'bg-indigo-500 text-white' : 'bg-gray-200 text-gray-700'} rounded-full hover:bg-indigo-600 hover:text-white transition-all"
			>
				🎉 אירועים
			</button>
			<button 
				onclick={() => filterByType('course')} 
				class="px-6 py-3 {selectedPageType === 'course' ? 'bg-indigo-500 text-white' : 'bg-gray-200 text-gray-700'} rounded-full hover:bg-indigo-600 hover:text-white transition-all"
			>
				🎓 קורסים
			</button>
			<button 
				onclick={() => filterByType('serviceProvider')} 
				class="px-6 py-3 {selectedPageType === 'serviceProvider' ? 'bg-indigo-500 text-white' : 'bg-gray-200 text-gray-700'} rounded-full hover:bg-indigo-600 hover:text-white transition-all"
			>
				🔧 בעלי מקצוע
			</button>
		</div>
		<div class="text-center mt-4">
			<p class="text-gray-600">
				{#if data.pages.length === 0}
					לא נמצאו דפים
				{:else}
					נמצאו {data.pagination.total} דפים
				{/if}
			</p>
		</div>
	</div>
</div>

<!-- Pages Grid -->
<div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
	{#if data.error}
		<div class="text-center py-12">
			<p class="text-red-600 text-lg">❌ שגיאה בטעינת הדפים: {data.error}</p>
		</div>
	{:else if data.pages.length === 0}
		<div class="text-center py-12">
			<h3 class="text-2xl font-semibold text-gray-700 mb-4">אין דפים להצגה</h3>
			<p class="text-gray-600">נסה לשנות את הפילטרים או צור דף חדש</p>
		</div>
	{:else}
		<div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
			{#each data.pages as page}
				<a href="/pages/{page.slug}" class="page-card bg-white rounded-lg shadow-lg overflow-hidden hover:shadow-xl transition-all">
					<!-- Page Preview Image -->
					<div class="h-48 bg-gradient-to-br from-purple-100 to-blue-100 flex items-center justify-center text-6xl">
						{#if page.pageType === 'store'}
							🛍️
						{:else if page.pageType === 'event'}
							🎉
						{:else if page.pageType === 'course'}
							🎓
						{:else if page.pageType === 'serviceProvider'}
							🔧
						{:else if page.pageType === 'restaurantMenu'}
							🍽️
						{:else}
							📄
						{/if}
					</div>
					
					<!-- Page Info -->
					<div class="p-6">
						<h3 class="text-xl font-bold text-gray-900 mb-2">{page.title}</h3>
						
						<span class="inline-block bg-indigo-500 text-white px-3 py-1 rounded-full text-sm font-medium mb-3">
							{pageTypes.find(t => t.value === page.pageType)?.label || page.pageType}
						</span>
						
						{#if page.description}
							<p class="text-gray-600 mb-3 line-clamp-2">{page.description}</p>
						{/if}
						
						<div class="flex justify-between items-center text-sm text-gray-500">
							{#if page.user}
								<span>{page.user.name || 'משתמש אנונימי'}</span>
							{/if}
							{#if page.createdAt}
								<span>{new Date(page.createdAt).toLocaleDateString('he-IL')}</span>
							{/if}
						</div>
					</div>
				</a>
			{/each}
		</div>

		<!-- Pagination -->
		{#if data.pagination.pageCount > 1}
			<div class="flex justify-center items-center gap-4 mt-12">
				<button
					onclick={() => goToPage(data.pagination.page - 1)}
					disabled={data.pagination.page === 1}
					class="px-6 py-3 bg-indigo-500 text-white rounded-lg hover:bg-indigo-600 disabled:bg-gray-300 disabled:cursor-not-allowed transition"
				>
					← הקודם
				</button>

				<span class="text-gray-600">
					עמוד {data.pagination.page} מתוך {data.pagination.pageCount}
				</span>

				<button
					onclick={() => goToPage(data.pagination.page + 1)}
					disabled={data.pagination.page === data.pagination.pageCount}
					class="px-6 py-3 bg-indigo-500 text-white rounded-lg hover:bg-indigo-600 disabled:bg-gray-300 disabled:cursor-not-allowed transition"
				>
					הבא →
				</button>
			</div>
		{/if}
	{/if}
</div>


