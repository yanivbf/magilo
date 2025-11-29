<!-- Day Settings Manager for Service Provider - EXACT Legacy Implementation -->
<script>
	let { pageId } = $props();
	
	// State
	let daySettings = $state([]);
	let isLoading = $state(true);
	let errorMessage = $state('');
	let successMessage = $state('');
	
	// Days of week
	const daysOfWeek = [
		{ value: 'sunday', label: 'ראשון' },
		{ value: 'monday', label: 'שני' },
		{ value: 'tuesday', label: 'שלישי' },
		{ value: 'wednesday', label: 'רביעי' },
		{ value: 'thursday', label: 'חמישי' },
		{ value: 'friday', label: 'שישי' },
		{ value: 'saturday', label: 'שבת' }
	];
	
	// Initialize default settings
	function initializeDefaultSettings() {
		return daysOfWeek.map(day => ({
			dayOfWeek: day.value,
			isWorkingDay: day.value !== 'saturday', // Saturday closed by default
			workingHours: {
				start: '09:00',
				end: '17:00'
			},
			breaks: [],
			closedDates: []
		}));
	}
	
	// Load settings
	async function loadSettings() {
		isLoading = true;
		errorMessage = '';
		
		try {
			const response = await fetch(`/api/day-settings/${pageId}`);
			
			if (!response.ok) {
				throw new Error('Failed to load day settings');
			}
			
			const data = await response.json();
			
			if (data.settings && data.settings.length > 0) {
				daySettings = data.settings;
			} else {
				// Initialize with defaults
				daySettings = initializeDefaultSettings();
			}
		} catch (error) {
			console.error('Error loading day settings:', error);
			errorMessage = 'שגיאה בטעינת הגדרות ימים';
			daySettings = initializeDefaultSettings();
		} finally {
			isLoading = false;
		}
	}
	
	// Save settings
	async function saveSettings() {
		errorMessage = '';
		successMessage = '';
		
		try {
			const response = await fetch(`/api/day-settings/${pageId}`, {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ settings: daySettings })
			});
			
			if (!response.ok) {
				throw new Error('Failed to save day settings');
			}
			
			successMessage = 'ההגדרות נשמרו בהצלחה!';
			setTimeout(() => successMessage = '', 3000);
		} catch (error) {
			console.error('Error saving day settings:', error);
			errorMessage = 'שגיאה בשמירת ההגדרות';
		}
	}
	
	// Add break
	function addBreak(dayIndex) {
		if (!daySettings[dayIndex].breaks) {
			daySettings[dayIndex].breaks = [];
		}
		daySettings[dayIndex].breaks.push({
			start: '12:00',
			end: '13:00'
		});
	}
	
	// Remove break
	function removeBreak(dayIndex, breakIndex) {
		daySettings[dayIndex].breaks.splice(breakIndex, 1);
	}
	
	// Add closed date
	function addClosedDate(dayIndex) {
		if (!daySettings[dayIndex].closedDates) {
			daySettings[dayIndex].closedDates = [];
		}
		daySettings[dayIndex].closedDates.push('');
	}
	
	// Remove closed date
	function removeClosedDate(dayIndex, dateIndex) {
		daySettings[dayIndex].closedDates.splice(dateIndex, 1);
	}
	
	// Load on mount
	$effect(() => {
		if (pageId) {
			loadSettings();
		}
	});
</script>

<div class="day-settings-manager">
	<div class="bg-white rounded-lg shadow-lg p-6">
		<!-- Header -->
		<div class="border-b pb-4 mb-6">
			<h2 class="text-2xl font-bold text-gray-900 mb-2">⚙️ הגדרות ימי עבודה</h2>
			<p class="text-gray-600">הגדר שעות עבודה, הפסקות וימי חופש לכל יום בשבוע</p>
		</div>
		
		<!-- Messages -->
		{#if errorMessage}
			<div class="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg mb-4">
				{errorMessage}
			</div>
		{/if}
		
		{#if successMessage}
			<div class="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded-lg mb-4">
				{successMessage}
			</div>
		{/if}
		
		<!-- Loading State -->
		{#if isLoading}
			<div class="text-center py-12">
				<div class="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
				<p class="mt-4 text-gray-600">טוען הגדרות...</p>
			</div>
		{:else}
			<!-- Day Settings Grid -->
			<div class="space-y-6">
				{#each daySettings as daySetting, dayIndex}
					{@const dayLabel = daysOfWeek.find(d => d.value === daySetting.dayOfWeek)?.label || daySetting.dayOfWeek}
					
					<div class="border border-gray-300 rounded-lg p-4 {!daySetting.isWorkingDay ? 'bg-gray-50' : 'bg-white'}">
						<!-- Day Header -->
						<div class="flex items-center justify-between mb-4">
							<h3 class="text-lg font-semibold text-gray-900">{dayLabel}</h3>
							<label class="flex items-center gap-2 cursor-pointer">
								<input
									type="checkbox"
									bind:checked={daySetting.isWorkingDay}
									class="w-5 h-5 text-purple-600 border-gray-300 rounded focus:ring-purple-500"
								/>
								<span class="text-sm font-medium text-gray-700">יום עבודה</span>
							</label>
						</div>
						
						{#if daySetting.isWorkingDay}
							<!-- Working Hours -->
							<div class="grid grid-cols-2 gap-4 mb-4">
								<div>
									<label class="block text-sm font-medium text-gray-700 mb-2">שעת התחלה</label>
									<input
										type="time"
										bind:value={daySetting.workingHours.start}
										class="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-purple-500"
									/>
								</div>
								<div>
									<label class="block text-sm font-medium text-gray-700 mb-2">שעת סיום</label>
									<input
										type="time"
										bind:value={daySetting.workingHours.end}
										class="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-purple-500"
									/>
								</div>
							</div>
							
							<!-- Breaks Section -->
							<div class="mb-4">
								<div class="flex items-center justify-between mb-2">
									<label class="block text-sm font-medium text-gray-700">הפסקות</label>
									<button
										type="button"
										onclick={() => addBreak(dayIndex)}
										class="text-sm text-purple-600 hover:text-purple-700 font-medium"
									>
										+ הוסף הפסקה
									</button>
								</div>
								
								{#if daySetting.breaks && daySetting.breaks.length > 0}
									<div class="space-y-2">
										{#each daySetting.breaks as breakTime, breakIndex}
											<div class="flex items-center gap-2 bg-gray-50 p-2 rounded">
												<input
													type="time"
													bind:value={breakTime.start}
													class="flex-1 border border-gray-300 rounded px-2 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
												/>
												<span class="text-gray-500">-</span>
												<input
													type="time"
													bind:value={breakTime.end}
													class="flex-1 border border-gray-300 rounded px-2 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
												/>
												<button
													type="button"
													onclick={() => removeBreak(dayIndex, breakIndex)}
													class="text-red-600 hover:text-red-700 px-2"
													title="מחק הפסקה"
												>
													🗑️
												</button>
											</div>
										{/each}
									</div>
								{:else}
									<p class="text-sm text-gray-500 italic">אין הפסקות מוגדרות</p>
								{/if}
							</div>
							
							<!-- Closed Dates Section -->
							<div>
								<div class="flex items-center justify-between mb-2">
									<label class="block text-sm font-medium text-gray-700">תאריכים סגורים (חגים/חופשות)</label>
									<button
										type="button"
										onclick={() => addClosedDate(dayIndex)}
										class="text-sm text-purple-600 hover:text-purple-700 font-medium"
									>
										+ הוסף תאריך
									</button>
								</div>
								
								{#if daySetting.closedDates && daySetting.closedDates.length > 0}
									<div class="space-y-2">
										{#each daySetting.closedDates as closedDate, dateIndex}
											<div class="flex items-center gap-2 bg-gray-50 p-2 rounded">
												<input
													type="date"
													bind:value={daySetting.closedDates[dateIndex]}
													class="flex-1 border border-gray-300 rounded px-2 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
												/>
												<button
													type="button"
													onclick={() => removeClosedDate(dayIndex, dateIndex)}
													class="text-red-600 hover:text-red-700 px-2"
													title="מחק תאריך"
												>
													🗑️
												</button>
											</div>
										{/each}
									</div>
								{:else}
									<p class="text-sm text-gray-500 italic">אין תאריכים סגורים</p>
								{/if}
							</div>
						{:else}
							<p class="text-sm text-gray-500 italic">יום זה מוגדר כיום לא עובד</p>
						{/if}
					</div>
				{/each}
			</div>
			
			<!-- Save Button -->
			<div class="mt-6 flex justify-end">
				<button
					type="button"
					onclick={saveSettings}
					class="bg-gradient-to-r from-purple-600 to-pink-500 text-white font-bold py-3 px-8 rounded-lg hover:opacity-90 transition-transform duration-300 hover:scale-105 shadow-lg"
				>
					💾 שמור הגדרות
				</button>
			</div>
		{/if}
	</div>
</div>

<style>
	/* EXACT Legacy Day Settings Styles with CSS Isolation */
	:global(.day-settings-manager) {
		max-width: 1200px !important;
		margin: 0 auto !important;
		font-family: 'Inter', 'Assistant', sans-serif !important;
	}
	
	:global(.day-settings-manager .bg-white) {
		background-color: white !important;
		border-radius: 0.5rem !important;
		box-shadow: 0 10px 25px rgba(0,0,0,0.1) !important;
	}
	
	:global(.day-settings-manager input[type="checkbox"]) {
		width: 1.25rem !important;
		height: 1.25rem !important;
		color: #8b5cf6 !important;
		border-color: #d1d5db !important;
		border-radius: 0.25rem !important;
		cursor: pointer !important;
	}
	
	:global(.day-settings-manager input[type="checkbox"]:focus) {
		ring-color: #8b5cf6 !important;
		ring-width: 2px !important;
	}
	
	:global(.day-settings-manager input[type="time"]),
	:global(.day-settings-manager input[type="date"]) {
		width: 100% !important;
		border: 1px solid #d1d5db !important;
		border-radius: 0.375rem !important;
		padding: 0.5rem 0.75rem !important;
		font-size: 0.875rem !important;
		transition: all 0.2s !important;
	}
	
	:global(.day-settings-manager input[type="time"]:focus),
	:global(.day-settings-manager input[type="date"]:focus) {
		outline: none !important;
		ring: 2px solid #8b5cf6 !important;
		border-color: #8b5cf6 !important;
	}
	
	:global(.day-settings-manager button) {
		transition: all 0.3s ease !important;
		cursor: pointer !important;
		font-weight: 600 !important;
	}
	
	:global(.day-settings-manager button:hover) {
		transform: scale(1.05) !important;
	}
	
	:global(.day-settings-manager .border) {
		border-width: 1px !important;
		border-style: solid !important;
	}
	
	:global(.day-settings-manager .rounded-lg) {
		border-radius: 0.5rem !important;
	}
	
	:global(.day-settings-manager .shadow-lg) {
		box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05) !important;
	}
</style>
