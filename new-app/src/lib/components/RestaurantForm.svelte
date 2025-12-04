<script>
	import ImageUploader from './ImageUploader.svelte';
	
	let { formData = {}, onUpdate } = $props();
	
	// Initialize form data with defaults
	let data = $state({
		title: formData.title || '',
		description: formData.description || '',
		logo: formData.logo || '',
		phone: formData.phone || '',
		address: formData.address || '',
		email: formData.email || '',
		categories: formData.categories || [],
		hours: formData.hours || {
			sunday: { open: '09:00', close: '22:00', closed: false },
			monday: { open: '09:00', close: '22:00', closed: false },
			tuesday: { open: '09:00', close: '22:00', closed: false },
			wednesday: { open: '09:00', close: '22:00', closed: false },
			thursday: { open: '09:00', close: '22:00', closed: false },
			friday: { open: '09:00', close: '14:00', closed: false },
			saturday: { open: '20:00', close: '23:00', closed: false }
		},
		delivery: formData.delivery || {
			available: false,
			minOrder: '',
			deliveryFee: '',
			freeDeliveryFrom: '',
			areas: ''
		}
	});
	
	const daysHebrew = {
		sunday: 'ראשון',
		monday: 'שני',
		tuesday: 'שלישי',
		wednesday: 'רביעי',
		thursday: 'חמישי',
		friday: 'שישי',
		saturday: 'שבת'
	};
	
	const dietaryOptions = [
		{ value: 'vegetarian', label: 'צמחוני', icon: '🥗' },
		{ value: 'vegan', label: 'טבעוני', icon: '🌱' },
		{ value: 'gluten-free', label: 'ללא גלוטן', icon: '🌾' },
		{ value: 'kosher', label: 'כשר', icon: '✡️' },
		{ value: 'halal', label: 'חלאל', icon: '☪️' },
		{ value: 'spicy', label: 'חריף', icon: '🌶️' }
	];
	
	function addCategory() {
		data.categories = [...data.categories, {
			name: '',
			items: []
		}];
		updateParent();
	}
	
	function removeCategory(index) {
		data.categories = data.categories.filter((_, i) => i !== index);
		updateParent();
	}
	
	function addMenuItem(categoryIndex) {
		data.categories[categoryIndex].items = [
			...data.categories[categoryIndex].items,
			{
				name: '',
				description: '',
				price: '',
				image: '',
				dietary: []
			}
		];
		updateParent();
	}
	
	function removeMenuItem(categoryIndex, itemIndex) {
		data.categories[categoryIndex].items = data.categories[categoryIndex].items.filter((_, i) => i !== itemIndex);
		updateParent();
	}
	
	function toggleDietary(categoryIndex, itemIndex, dietary) {
		const item = data.categories[categoryIndex].items[itemIndex];
		if (item.dietary.includes(dietary)) {
			item.dietary = item.dietary.filter(d => d !== dietary);
		} else {
			item.dietary = [...item.dietary, dietary];
		}
		updateParent();
	}
	
	function updateParent() {
		onUpdate?.(data);
	}
</script>

<div class="restaurant-form space-y-6">
	<!-- Basic Information -->
	<div class="bg-white p-6 rounded-lg shadow">
		<h3 class="text-xl font-bold mb-4">מידע בסיסי</h3>
		
		<div class="space-y-4">
			<div>
				<label class="block text-sm font-medium mb-2">שם המסעדה *</label>
				<input
					type="text"
					bind:value={data.title}
					onchange={updateParent}
					class="w-full border rounded-lg px-3 py-2"
					required
				/>
			</div>
			
			<div>
				<label class="block text-sm font-medium mb-2">תיאור</label>
				<textarea
					bind:value={data.description}
					onchange={updateParent}
					class="w-full border rounded-lg px-3 py-2"
					rows="3"
				></textarea>
			</div>
			
			<div>
				<ImageUploader
					label="לוגו המסעדה"
					onUpload={(url) => { data.logo = url; updateParent(); }}
					existingImages={data.logo ? [data.logo] : []}
				/>
			</div>
			
			<div class="grid grid-cols-1 md:grid-cols-2 gap-4">
				<div>
					<label class="block text-sm font-medium mb-2">טלפון</label>
					<input
						type="tel"
						bind:value={data.phone}
						onchange={updateParent}
						class="w-full border rounded-lg px-3 py-2"
					/>
				</div>
				
				<div>
					<label class="block text-sm font-medium mb-2">אימייל</label>
					<input
						type="email"
						bind:value={data.email}
						onchange={updateParent}
						class="w-full border rounded-lg px-3 py-2"
					/>
				</div>
			</div>
			
			<div>
				<label class="block text-sm font-medium mb-2">כתובת</label>
				<input
					type="text"
					bind:value={data.address}
					onchange={updateParent}
					class="w-full border rounded-lg px-3 py-2"
				/>
			</div>
		</div>
	</div>
	
	<!-- Menu Categories -->
	<div class="bg-white p-6 rounded-lg shadow">
		<div class="flex justify-between items-center mb-4">
			<h3 class="text-xl font-bold">תפריט</h3>
			<button
				type="button"
				onclick={addCategory}
				class="bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700"
			>
				+ הוסף קטגוריה
			</button>
		</div>
		
		{#each data.categories as category, catIndex}
			<div class="border rounded-lg p-4 mb-4">
				<div class="flex justify-between items-center mb-4">
					<input
						type="text"
						bind:value={category.name}
						onchange={updateParent}
						placeholder="שם הקטגוריה (מנות ראשונות, מנות עיקריות...)"
						class="flex-1 border rounded-lg px-3 py-2 ml-2"
					/>
					<button
						type="button"
						onclick={() => removeCategory(catIndex)}
						class="bg-red-500 text-white px-3 py-2 rounded-lg hover:bg-red-600"
					>
						מחק קטגוריה
					</button>
				</div>
				
				<div class="space-y-3">
					{#each category.items as item, itemIndex}
						<div class="bg-gray-50 p-4 rounded-lg">
							<div class="grid grid-cols-1 md:grid-cols-2 gap-3 mb-3">
								<input
									type="text"
									bind:value={item.name}
									onchange={updateParent}
									placeholder="שם המנה"
									class="border rounded-lg px-3 py-2"
								/>
								<input
									type="number"
									bind:value={item.price}
									onchange={updateParent}
									placeholder="מחיר (₪)"
									class="border rounded-lg px-3 py-2"
								/>
							</div>
							
							<textarea
								bind:value={item.description}
								onchange={updateParent}
								placeholder="תיאור המנה"
								class="w-full border rounded-lg px-3 py-2 mb-3"
								rows="2"
							></textarea>
							
							<div class="mb-3">
								<ImageUploader
									label="תמונת המנה"
									onUpload={(url) => { item.image = url; updateParent(); }}
									existingImages={item.image ? [item.image] : []}
								/>
							</div>
							
							<div class="mb-3">
								<label class="block text-sm font-medium mb-2">סימוני תזונה</label>
								<div class="flex flex-wrap gap-2">
									{#each dietaryOptions as option}
										<button
											type="button"
											onclick={() => toggleDietary(catIndex, itemIndex, option.value)}
											class="px-3 py-1 rounded-full border {item.dietary.includes(option.value) ? 'bg-purple-100 border-purple-500' : 'bg-white border-gray-300'}"
										>
											{option.icon} {option.label}
										</button>
									{/each}
								</div>
							</div>
							
							<button
								type="button"
								onclick={() => removeMenuItem(catIndex, itemIndex)}
								class="bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600 text-sm"
							>
								מחק מנה
							</button>
						</div>
					{/each}
				</div>
				
				<button
					type="button"
					onclick={() => addMenuItem(catIndex)}
					class="mt-3 bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 w-full"
				>
					+ הוסף מנה
				</button>
			</div>
		{/each}
		
		{#if data.categories.length === 0}
			<p class="text-gray-500 text-center py-4">לחץ על "הוסף קטגוריה" כדי להתחיל</p>
		{/if}
	</div>
	
	<!-- Opening Hours -->
	<div class="bg-white p-6 rounded-lg shadow">
		<h3 class="text-xl font-bold mb-4">שעות פתיחה</h3>
		
		<div class="space-y-3">
			{#each Object.entries(data.hours) as [day, hours]}
				<div class="flex items-center gap-3">
					<label class="w-20 font-medium">{daysHebrew[day]}</label>
					
					<label class="flex items-center">
						<input
							type="checkbox"
							bind:checked={hours.closed}
							onchange={updateParent}
							class="ml-2"
						/>
						<span class="text-sm">סגור</span>
					</label>
					
					{#if !hours.closed}
						<input
							type="time"
							bind:value={hours.open}
							onchange={updateParent}
							class="border rounded px-2 py-1"
						/>
						<span>-</span>
						<input
							type="time"
							bind:value={hours.close}
							onchange={updateParent}
							class="border rounded px-2 py-1"
						/>
					{/if}
				</div>
			{/each}
		</div>
	</div>
	
	<!-- Delivery Information -->
	<div class="bg-white p-6 rounded-lg shadow">
		<h3 class="text-xl font-bold mb-4">משלוחים</h3>
		
		<div class="space-y-4">
			<label class="flex items-center">
				<input
					type="checkbox"
					bind:checked={data.delivery.available}
					onchange={updateParent}
					class="ml-2"
				/>
				<span class="font-medium">יש שירות משלוחים</span>
			</label>
			
			{#if data.delivery.available}
				<div class="grid grid-cols-1 md:grid-cols-3 gap-4">
					<div>
						<label class="block text-sm font-medium mb-2">הזמנה מינימלית (₪)</label>
						<input
							type="number"
							bind:value={data.delivery.minOrder}
							onchange={updateParent}
							class="w-full border rounded-lg px-3 py-2"
						/>
					</div>
					
					<div>
						<label class="block text-sm font-medium mb-2">דמי משלוח (₪)</label>
						<input
							type="number"
							bind:value={data.delivery.deliveryFee}
							onchange={updateParent}
							class="w-full border rounded-lg px-3 py-2"
						/>
					</div>
					
					<div>
						<label class="block text-sm font-medium mb-2">משלוח חינם מ- (₪)</label>
						<input
							type="number"
							bind:value={data.delivery.freeDeliveryFrom}
							onchange={updateParent}
							class="w-full border rounded-lg px-3 py-2"
						/>
					</div>
				</div>
				
				<div>
					<label class="block text-sm font-medium mb-2">אזורי משלוח</label>
					<textarea
						bind:value={data.delivery.areas}
						onchange={updateParent}
						placeholder="רשום אזורי משלוח מופרדים בפסיקים"
						class="w-full border rounded-lg px-3 py-2"
						rows="2"
					></textarea>
				</div>
			{/if}
		</div>
	</div>
</div>

<style>
	.restaurant-form {
		max-width: 1200px;
		margin: 0 auto;
	}
</style>
