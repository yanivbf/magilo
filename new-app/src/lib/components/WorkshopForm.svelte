<script>
	import ImageUploader from './ImageUploader.svelte';
	
	let { formData = {}, onUpdate } = $props();
	
	// Initialize form data with defaults
	let data = $state({
		title: formData.title || '',
		instructor: formData.instructor || '',
		instructorBio: formData.instructorBio || '',
		image: formData.image || '',
		date: formData.date || '',
		time: formData.time || '',
		duration: formData.duration || '',
		platform: formData.platform || 'zoom',
		location: formData.location || '',
		price: formData.price || '',
		earlyBirdPrice: formData.earlyBirdPrice || '',
		earlyBirdDeadline: formData.earlyBirdDeadline || '',
		maxParticipants: formData.maxParticipants || '',
		topics: formData.topics || '',
		requirements: formData.requirements || '',
		materials: formData.materials || '',
		targetAudience: formData.targetAudience || '',
		certificate: formData.certificate || false
	});
	
	const platformOptions = [
		{ value: 'zoom', label: 'Zoom' },
		{ value: 'teams', label: 'Microsoft Teams' },
		{ value: 'meet', label: 'Google Meet' },
		{ value: 'physical', label: 'פיזי - במקום' },
		{ value: 'hybrid', label: 'היברידי' }
	];
	
	function updateParent() {
		onUpdate?.(data);
	}
</script>

<div class="workshop-form space-y-6">
	<!-- Basic Information -->
	<div class="bg-white p-6 rounded-lg shadow">
		<h3 class="text-xl font-bold mb-4">מידע בסיסי</h3>
		
		<div class="space-y-4">
			<div>
				<label class="block text-sm font-medium mb-2">שם הסדנה *</label>
				<input
					type="text"
					bind:value={data.title}
					onchange={updateParent}
					class="w-full border rounded-lg px-3 py-2"
					required
				/>
			</div>
			
			<div>
				<ImageUploader
					label="תמונת הסדנה"
					onUpload={(url) => { data.image = url; updateParent(); }}
					existingImages={data.image ? [data.image] : []}
				/>
			</div>
			
			<div>
				<label class="block text-sm font-medium mb-2">שם המדריך/ה *</label>
				<input
					type="text"
					bind:value={data.instructor}
					onchange={updateParent}
					class="w-full border rounded-lg px-3 py-2"
					required
				/>
			</div>
			
			<div>
				<label class="block text-sm font-medium mb-2">אודות המדריך/ה</label>
				<textarea
					bind:value={data.instructorBio}
					onchange={updateParent}
					class="w-full border rounded-lg px-3 py-2"
					rows="3"
					placeholder="רקע מקצועי, ניסיון, הישגים..."
				></textarea>
			</div>
		</div>
	</div>
	
	<!-- Schedule & Platform -->
	<div class="bg-white p-6 rounded-lg shadow">
		<h3 class="text-xl font-bold mb-4">מועד ופלטפורמה</h3>
		
		<div class="grid grid-cols-1 md:grid-cols-2 gap-4">
			<div>
				<label class="block text-sm font-medium mb-2">תאריך *</label>
				<input
					type="date"
					bind:value={data.date}
					onchange={updateParent}
					class="w-full border rounded-lg px-3 py-2"
					required
				/>
			</div>
			
			<div>
				<label class="block text-sm font-medium mb-2">שעה *</label>
				<input
					type="time"
					bind:value={data.time}
					onchange={updateParent}
					class="w-full border rounded-lg px-3 py-2"
					required
				/>
			</div>
			
			<div>
				<label class="block text-sm font-medium mb-2">משך (שעות)</label>
				<input
					type="number"
					bind:value={data.duration}
					onchange={updateParent}
					step="0.5"
					class="w-full border rounded-lg px-3 py-2"
					placeholder="2.5"
				/>
			</div>
			
			<div>
				<label class="block text-sm font-medium mb-2">פלטפורמה *</label>
				<select
					bind:value={data.platform}
					onchange={updateParent}
					class="w-full border rounded-lg px-3 py-2"
					required
				>
					{#each platformOptions as option}
						<option value={option.value}>{option.label}</option>
					{/each}
				</select>
			</div>
		</div>
		
		{#if data.platform === 'physical' || data.platform === 'hybrid'}
			<div class="mt-4">
				<label class="block text-sm font-medium mb-2">מיקום</label>
				<input
					type="text"
					bind:value={data.location}
					onchange={updateParent}
					class="w-full border rounded-lg px-3 py-2"
					placeholder="כתובת מלאה"
				/>
			</div>
		{/if}
	</div>
	
	<!-- Pricing -->
	<div class="bg-white p-6 rounded-lg shadow">
		<h3 class="text-xl font-bold mb-4">תמחור</h3>
		
		<div class="grid grid-cols-1 md:grid-cols-2 gap-4">
			<div>
				<label class="block text-sm font-medium mb-2">מחיר רגיל (₪) *</label>
				<input
					type="number"
					bind:value={data.price}
					onchange={updateParent}
					class="w-full border rounded-lg px-3 py-2"
					required
				/>
			</div>
			
			<div>
				<label class="block text-sm font-medium mb-2">מספר משתתפים מקסימלי</label>
				<input
					type="number"
					bind:value={data.maxParticipants}
					onchange={updateParent}
					class="w-full border rounded-lg px-3 py-2"
					placeholder="30"
				/>
			</div>
			
			<div>
				<label class="block text-sm font-medium mb-2">מחיר מוקדם (₪)</label>
				<input
					type="number"
					bind:value={data.earlyBirdPrice}
					onchange={updateParent}
					class="w-full border rounded-lg px-3 py-2"
					placeholder="מחיר מוזל לנרשמים מוקדם"
				/>
			</div>
			
			<div>
				<label class="block text-sm font-medium mb-2">תאריך אחרון למחיר מוקדם</label>
				<input
					type="date"
					bind:value={data.earlyBirdDeadline}
					onchange={updateParent}
					class="w-full border rounded-lg px-3 py-2"
				/>
			</div>
		</div>
	</div>
	
	<!-- Content Details -->
	<div class="bg-white p-6 rounded-lg shadow">
		<h3 class="text-xl font-bold mb-4">תוכן הסדנה</h3>
		
		<div class="space-y-4">
			<div>
				<label class="block text-sm font-medium mb-2">נושאים שיילמדו</label>
				<textarea
					bind:value={data.topics}
					onchange={updateParent}
					class="w-full border rounded-lg px-3 py-2"
					rows="4"
					placeholder="רשום את הנושאים העיקריים, כל נושא בשורה חדשה"
				></textarea>
				<p class="text-sm text-gray-500 mt-1">כל שורה תהפוך לנקודה ברשימה</p>
			</div>
			
			<div>
				<label class="block text-sm font-medium mb-2">קהל יעד</label>
				<input
					type="text"
					bind:value={data.targetAudience}
					onchange={updateParent}
					class="w-full border rounded-lg px-3 py-2"
					placeholder="למי מתאימה הסדנה?"
				/>
			</div>
			
			<div>
				<label class="block text-sm font-medium mb-2">דרישות מוקדמות</label>
				<textarea
					bind:value={data.requirements}
					onchange={updateParent}
					class="w-full border rounded-lg px-3 py-2"
					rows="3"
					placeholder="ידע מוקדם נדרש, ציוד, תוכנות..."
				></textarea>
			</div>
			
			<div>
				<label class="block text-sm font-medium mb-2">חומרים שיסופקו</label>
				<textarea
					bind:value={data.materials}
					onchange={updateParent}
					class="w-full border rounded-lg px-3 py-2"
					rows="3"
					placeholder="מצגות, קבצים, הקלטות, תעודה..."
				></textarea>
			</div>
			
			<div>
				<label class="flex items-center">
					<input
						type="checkbox"
						bind:checked={data.certificate}
						onchange={updateParent}
						class="ml-2"
					/>
					<span class="font-medium">תעודת השתתפות</span>
				</label>
			</div>
		</div>
	</div>
</div>

<style>
	.workshop-form {
		max-width: 1200px;
		margin: 0 auto;
	}
</style>
