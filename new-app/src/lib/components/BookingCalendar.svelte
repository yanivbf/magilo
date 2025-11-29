<script>
	// Booking Calendar Manager for Service Template
	let { availableSlots = $bindable([]), onUpdate } = $props();
	
	let showAddForm = $state(false);
	let currentSlot = $state({
		date: '',
		time: '',
		duration: '60',
		available: true
	});
	
	function addSlot() {
		showAddForm = true;
		currentSlot = { date: '', time: '', duration: '60', available: true };
	}
	
	function saveSlot() {
		if (!currentSlot.date || !currentSlot.time) {
			alert('נא למלא תאריך ושעה');
			return;
		}
		
		availableSlots = [...availableSlots, { ...currentSlot }];
		if (onUpdate) onUpdate(availableSlots);
		cancelEdit();
	}
	
	function deleteSlot(index) {
		if (confirm('האם למחוק תור זה?')) {
			availableSlots = availableSlots.filter((_, i) => i !== index);
			if (onUpdate) onUpdate(availableSlots);
		}
	}
	
	function toggleAvailability(index) {
		availableSlots[index].available = !availableSlots[index].available;
		if (onUpdate) onUpdate(availableSlots);
	}
	
	function cancelEdit() {
		showAddForm = false;
		currentSlot = { date: '', time: '', duration: '60', available: true };
	}
	
	function formatDate(dateStr) {
		const date = new Date(dateStr);
		return date.toLocaleDateString('he-IL', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
	}
</script>

<div class="booking-calendar-manager">
	<div class="flex justify-between items-center mb-4">
		<h3 class="text-lg font-bold">תורים זמינים ({availableSlots.length})</h3>
		<button
			onclick={addSlot}
			class="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition"
		>
			+ הוסף תור
		</button>
	</div>
	
	<!-- Slots List -->
	{#if availableSlots.length > 0}
		<div class="space-y-3 mb-4">
			{#each availableSlots as slot, index}
				<div class="border border-gray-300 rounded-lg p-4 bg-white flex items-center justify-between">
					<div class="flex-1">
						<div class="flex items-center gap-2 mb-1">
							<span class="text-lg font-bold">{slot.time}</span>
							<span class={`px-2 py-1 rounded text-xs font-medium ${slot.available ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
								{slot.available ? 'פנוי' : 'תפוס'}
							</span>
						</div>
						<p class="text-gray-600 text-sm">{formatDate(slot.date)}</p>
						<p class="text-gray-500 text-xs">משך: {slot.duration} דקות</p>
					</div>
					<div class="flex gap-2">
						<button
							onclick={() => toggleAvailability(index)}
							class="bg-blue-500 text-white px-3 py-1 rounded hover:bg-blue-600 transition text-sm"
						>
							{slot.available ? 'סמן תפוס' : 'סמן פנוי'}
						</button>
						<button
							onclick={() => deleteSlot(index)}
							class="bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600 transition text-sm"
						>
							מחק
						</button>
					</div>
				</div>
			{/each}
		</div>
	{:else}
		<div class="text-center py-8 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
			<p class="text-gray-500">עדיין לא הוספת תורים</p>
			<p class="text-gray-400 text-sm">לחץ על "הוסף תור" כדי להתחיל</p>
		</div>
	{/if}
	
	<!-- Add Form Modal -->
	{#if showAddForm}
		<div class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
			<div class="bg-white rounded-2xl p-6 max-w-md w-full mx-4">
				<h3 class="text-xl font-bold mb-4">הוסף תור חדש</h3>
				
				<div class="space-y-4">
					<div>
						<label class="block text-sm font-medium text-gray-700 mb-1">תאריך *</label>
						<input
							type="date"
							bind:value={currentSlot.date}
							class="w-full border border-gray-300 rounded-lg px-3 py-2"
						/>
					</div>
					
					<div>
						<label class="block text-sm font-medium text-gray-700 mb-1">שעה *</label>
						<input
							type="time"
							bind:value={currentSlot.time}
							class="w-full border border-gray-300 rounded-lg px-3 py-2"
						/>
					</div>
					
					<div>
						<label class="block text-sm font-medium text-gray-700 mb-1">משך (דקות)</label>
						<select
							bind:value={currentSlot.duration}
							class="w-full border border-gray-300 rounded-lg px-3 py-2"
						>
							<option value="30">30 דקות</option>
							<option value="45">45 דקות</option>
							<option value="60">60 דקות</option>
							<option value="90">90 דקות</option>
							<option value="120">120 דקות</option>
						</select>
					</div>
				</div>
				
				<div class="flex gap-3 mt-6">
					<button
						onclick={cancelEdit}
						class="flex-1 bg-gray-200 text-gray-800 py-2 px-4 rounded-lg hover:bg-gray-300 transition"
					>
						ביטול
					</button>
					<button
						onclick={saveProduct}
						class="flex-1 bg-purple-600 text-white py-2 px-4 rounded-lg hover:bg-purple-700 transition"
					>
						הוסף
					</button>
				</div>
			</div>
		</div>
	{/if}
</div>

<style>
	.booking-calendar-manager {
		background: #f9fafb;
		padding: 20px;
		border-radius: 12px;
		border: 2px solid #e5e7eb;
	}
</style>
