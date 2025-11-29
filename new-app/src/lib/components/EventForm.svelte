<!-- Event Form Component - EXACT Legacy Port with RAW HTML/CSS -->
<script>
	let { formData = $bindable({}) } = $props();
	
	// Initialize event-specific fields
	if (!formData.eventName) formData.eventName = '';
	if (!formData.eventDate) formData.eventDate = '';
	if (!formData.eventTime) formData.eventTime = '';
	if (!formData.location) formData.location = '';
	if (!formData.maxGuests) formData.maxGuests = '';
	if (!formData.phone) formData.phone = '';
	if (!formData.whatsapp) formData.whatsapp = '';
</script>

<fieldset class="form-fieldset">
	<legend class="form-legend">🎉 פרטי האירוע</legend>
	
	<div class="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-4">
		<!-- Event Name -->
		<div class="sm:col-span-2">
			<label for="eventName" class="block text-sm font-medium text-slate-700 mb-1">
				שם האירוע <span class="text-red-500">*</span>
			</label>
			<input 
				type="text" 
				id="eventName" 
				name="eventName" 
				bind:value={formData.eventName}
				class="mt-1 block w-full px-4 py-2 bg-white border border-slate-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500" 
				placeholder="לדוגמה: חתונת שרה ודוד"
				required
			/>
		</div>
		
		<!-- Event Date -->
		<div>
			<label for="eventDate" class="block text-sm font-medium text-slate-700 mb-1">
				תאריך האירוע <span class="text-red-500">*</span>
			</label>
			<input 
				type="date" 
				id="eventDate" 
				name="eventDate" 
				bind:value={formData.eventDate}
				class="mt-1 block w-full px-4 py-2 bg-white border border-slate-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500" 
				required
			/>
		</div>
		
		<!-- Event Time -->
		<div>
			<label for="eventTime" class="block text-sm font-medium text-slate-700 mb-1">
				שעת האירוע <span class="text-red-500">*</span>
			</label>
			<input 
				type="time" 
				id="eventTime" 
				name="eventTime" 
				bind:value={formData.eventTime}
				class="mt-1 block w-full px-4 py-2 bg-white border border-slate-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500" 
				required
			/>
		</div>
		
		<!-- Location -->
		<div class="sm:col-span-2">
			<label for="location" class="block text-sm font-medium text-slate-700 mb-1">
				מיקום <span class="text-red-500">*</span>
			</label>
			<input 
				type="text" 
				id="location" 
				name="location" 
				bind:value={formData.location}
				class="mt-1 block w-full px-4 py-2 bg-white border border-slate-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500" 
				placeholder="כתובת מלאה של האירוע"
				required
			/>
		</div>
		
		<!-- Max Guests -->
		<div>
			<label for="maxGuests" class="block text-sm font-medium text-slate-700 mb-1">
				מספר מקסימלי של אורחים
			</label>
			<input 
				type="number" 
				id="maxGuests" 
				name="maxGuests" 
				bind:value={formData.maxGuests}
				class="mt-1 block w-full px-4 py-2 bg-white border border-slate-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500" 
				placeholder="100"
				min="1"
			/>
		</div>
		
		<!-- Phone -->
		<div>
			<label for="phone" class="block text-sm font-medium text-slate-700 mb-1">
				טלפון ליצירת קשר <span class="text-red-500">*</span>
			</label>
			<input 
				type="tel" 
				id="phone" 
				name="phone" 
				bind:value={formData.phone}
				class="mt-1 block w-full px-4 py-2 bg-white border border-slate-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500" 
				placeholder="050-1234567"
				required
			/>
		</div>
		
		<!-- WhatsApp -->
		<div class="sm:col-span-2">
			<label for="whatsapp" class="block text-sm font-medium text-slate-700 mb-1">
				מספר וואטסאפ (אופציונלי)
			</label>
			<input 
				type="tel" 
				id="whatsapp" 
				name="whatsapp" 
				bind:value={formData.whatsapp}
				class="mt-1 block w-full px-4 py-2 bg-white border border-slate-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500" 
				placeholder="972501234567"
			/>
			<p class="mt-1 text-xs text-slate-500">
				💡 הזן מספר בפורמט בינלאומי (לדוגמה: 972501234567) לשליחת הזמנות אוטומטיות
			</p>
		</div>
	</div>
</fieldset>

<style>
	/* EXACT Legacy Form Styles */
	:global(.form-fieldset) {
		border: 1px solid #e5e7eb !important;
		border-radius: 0.75rem !important;
		padding: 1.5rem !important;
		background-color: rgba(255,255,255,0.5) !important;
		margin-bottom: 1.5rem !important;
	}
	
	:global(.form-legend) {
		padding: 0 0.5rem !important;
		font-weight: 600 !important;
		color: #4c1d95 !important;
		font-size: 1.125rem !important;
	}
</style>
