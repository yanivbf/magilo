<script>
	import { invalidate } from '$app/navigation';
	import { flip } from 'svelte/animate';
	
	let { pageId, sections = [], pageType = 'general' } = $props();
	
	let loading = $state(false);
	let error = $state('');
	let draggedItem = $state(null);
	
	// Define available sections per page type
	const sectionTypes = {
		store: ['hero', 'about', 'products', 'gallery', 'testimonials', 'contact'],
		service: ['hero', 'about', 'services', 'gallery', 'testimonials', 'booking', 'contact'],
		event: ['hero', 'about', 'schedule', 'gallery', 'rsvp', 'contact'],
		restaurant: ['hero', 'menu', 'gallery', 'about', 'reservations', 'contact'],
		artist: ['hero', 'portfolio', 'about', 'gallery', 'contact'],
		course: ['hero', 'about', 'curriculum', 'testimonials', 'enrollment', 'contact'],
		workshop: ['hero', 'about', 'schedule', 'gallery', 'registration', 'contact'],
		message: ['hero', 'message', 'gallery', 'contact'],
		general: ['hero', 'about', 'gallery', 'contact']
	};
	
	const sectionLabels = {
		hero: 'כותרת ראשית',
		about: 'אודות',
		products: 'מוצרים',
		services: 'שירותים',
		gallery: 'גלריה',
		testimonials: 'המלצות',
		contact: 'יצירת קשר',
		booking: 'קביעת תור',
		schedule: 'לוח זמנים',
		rsvp: 'אישור הגעה',
		menu: 'תפריט',
		reservations: 'הזמנת מקום',
		portfolio: 'תיק עבודות',
		curriculum: 'תכנית לימודים',
		enrollment: 'הרשמה',
		registration: 'רישום',
		message: 'הודעה'
	};
	
	const availableSections = sectionTypes[pageType] || sectionTypes.general;
	
	async function toggleSection(section) {
		loading = true;
		error = '';
		
		try {
			const response = await fetch(`/api/sections/${section.id}/toggle`, {
				method: 'PATCH',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({
					enabled: !section.enabled
				})
			});
			
			if (!response.ok) {
				throw new Error('Failed to toggle section');
			}
			
			await invalidate('app:sections');
		} catch (err) {
			console.error('Toggle error:', err);
			error = 'שגיאה בשינוי מצב הסקשן';
		} finally {
			loading = false;
		}
	}
	
	function handleDragStart(event, index) {
		draggedItem = index;
		event.dataTransfer.effectAllowed = 'move';
	}
	
	function handleDragOver(event) {
		event.preventDefault();
		event.dataTransfer.dropEffect = 'move';
	}
	
	function handleDrop(event, targetIndex) {
		event.preventDefault();
		
		if (draggedItem === null || draggedItem === targetIndex) return;
		
		const newSections = [...sections];
		const [removed] = newSections.splice(draggedItem, 1);
		newSections.splice(targetIndex, 0, removed);
		
		// Update order values
		newSections.forEach((section, index) => {
			section.order = index;
		});
		
		saveOrder(newSections);
		draggedItem = null;
	}
	
	async function saveOrder(orderedSections) {
		loading = true;
		error = '';
		
		try {
			const response = await fetch('/api/sections/reorder', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({
					pageId,
					sections: orderedSections.map((s, index) => ({
						id: s.id,
						order: index
					}))
				})
			});
			
			if (!response.ok) {
				throw new Error('Failed to save order');
			}
			
			await invalidate('app:sections');
		} catch (err) {
			console.error('Save order error:', err);
			error = 'שגיאה בשמירת הסדר';
		} finally {
			loading = false;
		}
	}
	
	function getSectionIcon(type) {
		const icons = {
			hero: '🏠',
			about: 'ℹ️',
			products: '🛍️',
			services: '⚙️',
			gallery: '🖼️',
			testimonials: '💬',
			contact: '📞',
			booking: '📅',
			schedule: '🗓️',
			rsvp: '✅',
			menu: '🍽️',
			reservations: '🪑',
			portfolio: '🎨',
			curriculum: '📚',
			enrollment: '✍️',
			registration: '📝',
			message: '✉️'
		};
		return icons[type] || '📄';
	}
</script>

<div class="section-manager">
	<div class="mb-6">
		<h2 class="text-2xl font-bold mb-2">ניהול סקשנים</h2>
		<p class="text-gray-600 text-sm">גרור כדי לשנות סדר, לחץ להפעלה/השבתה</p>
	</div>
	
	{#if error}
		<div class="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
			{error}
		</div>
	{/if}
	
	<div class="space-y-2">
		{#each sections as section, index (section.id)}
			<div
				animate:flip={{ duration: 300 }}
				draggable="true"
				ondragstart={(e) => handleDragStart(e, index)}
				ondragover={handleDragOver}
				ondrop={(e) => handleDrop(e, index)}
				class="section-item border rounded-lg p-4 bg-white cursor-move hover:shadow-md transition-shadow {section.enabled ? '' : 'opacity-50'}"
			>
				<div class="flex items-center justify-between">
					<div class="flex items-center gap-3">
						<span class="text-2xl">{getSectionIcon(section.type)}</span>
						<div>
							<h3 class="font-bold">{sectionLabels[section.type] || section.type}</h3>
							<p class="text-sm text-gray-500">סדר: {section.order + 1}</p>
						</div>
					</div>
					
					<div class="flex items-center gap-2">
						<button
							onclick={() => toggleSection(section)}
							disabled={loading}
							class="px-4 py-2 rounded-lg transition-colors {section.enabled 
								? 'bg-green-500 hover:bg-green-600 text-white' 
								: 'bg-gray-300 hover:bg-gray-400 text-gray-700'}"
						>
							{section.enabled ? 'פעיל' : 'מושבת'}
						</button>
						
						<div class="text-gray-400 cursor-move">
							<svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
								<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 8h16M4 16h16"></path>
							</svg>
						</div>
					</div>
				</div>
			</div>
		{/each}
	</div>
	
	{#if sections.length === 0}
		<div class="text-center py-12 text-gray-500">
			<p>אין סקשנים זמינים</p>
			<p class="text-sm">הסקשנים נוצרים אוטומטית עם הדף</p>
		</div>
	{/if}
	
	<div class="mt-6 p-4 bg-blue-50 rounded-lg">
		<h3 class="font-bold mb-2">סקשנים זמינים לסוג דף זה:</h3>
		<div class="flex flex-wrap gap-2">
			{#each availableSections as sectionType}
				<span class="px-3 py-1 bg-white rounded-full text-sm border">
					{getSectionIcon(sectionType)} {sectionLabels[sectionType] || sectionType}
				</span>
			{/each}
		</div>
	</div>
</div>

<style>
	.section-manager {
		padding: 1rem;
	}
	
	.section-item {
		user-select: none;
	}
	
	.section-item:active {
		cursor: grabbing;
	}
</style>
