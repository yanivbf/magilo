<script>
	// Image Gallery Manager - for adding images to page
	let { images = $bindable([]), onUpdate } = $props();
	
	let showAddForm = $state(false);
	let editingIndex = $state(null);
	let showImageUploader = $state(false);
	let currentImage = $state({
		url: '',
		caption: ''
	});
	
	function addImage() {
		showAddForm = true;
		editingIndex = null;
		currentImage = { url: '', caption: '' };
	}
	
	function editImage(index) {
		showAddForm = true;
		editingIndex = index;
		currentImage = { ...images[index] };
	}
	
	function saveImage() {
		if (!currentImage.url) {
			alert('נא להוסיף קישור לתמונה');
			return;
		}
		
		if (editingIndex !== null) {
			images[editingIndex] = { ...currentImage };
		} else {
			images = [...images, { ...currentImage }];
		}
		
		if (onUpdate) onUpdate(images);
		cancelEdit();
	}
	
	function deleteImage(index) {
		if (confirm('האם למחוק תמונה זו?')) {
			images = images.filter((_, i) => i !== index);
			if (onUpdate) onUpdate(images);
		}
	}
	
	function cancelEdit() {
		showAddForm = false;
		editingIndex = null;
		showImageUploader = false;
		currentImage = { url: '', caption: '' };
	}
	
	async function handleImageUpload(event) {
		const file = event.target.files?.[0];
		if (!file) return;
		
		const formData = new FormData();
		formData.append('image', file);
		
		try {
			const response = await fetch('/api/upload-image', {
				method: 'POST',
				body: formData
			});
			
			if (response.ok) {
				const data = await response.json();
				currentImage.url = data.url;
			} else {
				alert('שגיאה בהעלאת התמונה');
			}
		} catch (error) {
			console.error('Error uploading image:', error);
			alert('שגיאה בהעלאת התמונה');
		}
	}
</script>

<div class="image-gallery-manager">
	<div class="flex justify-between items-center mb-4">
		<h3 class="text-lg font-bold">🖼️ גלריית תמונות ({images.length})</h3>
		<button
			type="button"
			onclick={addImage}
			class="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition"
		>
			+ הוסף תמונה
		</button>
	</div>
	
	<!-- Images Grid -->
	{#if images.length > 0}
		<div class="grid grid-cols-2 md:grid-cols-3 gap-4 mb-4">
			{#each images as image, index}
				<div class="border border-gray-300 rounded-lg overflow-hidden bg-white">
					<img src={image.url || image} alt={image.caption || 'תמונה'} class="w-full h-32 object-cover" />
					<div class="p-2">
						{#if image.caption}
							<p class="text-sm text-gray-600 mb-2 truncate">{image.caption}</p>
						{/if}
						<div class="flex gap-2">
							<button
								type="button"
								onclick={() => editImage(index)}
								class="flex-1 bg-blue-500 text-white px-2 py-1 rounded hover:bg-blue-600 transition text-xs"
							>
								ערוך
							</button>
							<button
								type="button"
								onclick={() => deleteImage(index)}
								class="flex-1 bg-red-500 text-white px-2 py-1 rounded hover:bg-red-600 transition text-xs"
							>
								מחק
							</button>
						</div>
					</div>
				</div>
			{/each}
		</div>
	{:else}
		<div class="text-center py-8 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
			<p class="text-gray-500">עדיין לא הוספת תמונות</p>
			<p class="text-gray-400 text-sm">לחץ על "הוסף תמונה" כדי להתחיל</p>
		</div>
	{/if}
	
	<!-- Add/Edit Form Modal -->
	{#if showAddForm}
		<div class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
			<div class="bg-white rounded-2xl p-6 max-w-md w-full mx-4">
				<h3 class="text-xl font-bold mb-4">
					{editingIndex !== null ? 'ערוך תמונה' : 'הוסף תמונה חדשה'}
				</h3>
				
				<div class="space-y-4">
					<div>
						<label class="block text-sm font-medium text-gray-700 mb-1">תמונה *</label>
						
						{#if currentImage.url}
							<div class="mb-3">
								<img src={currentImage.url} alt="תצוגה מקדימה" class="w-full h-48 object-cover rounded-lg border-2 border-gray-200" />
								<button
									type="button"
									onclick={() => currentImage.url = ''}
									class="mt-2 text-sm text-red-600 hover:text-red-800"
								>
									הסר תמונה
								</button>
							</div>
						{/if}
						
						<div class="flex gap-2">
							<label class="flex-1 bg-purple-100 text-purple-700 px-4 py-2 rounded-lg hover:bg-purple-200 transition cursor-pointer text-center font-medium">
								<input
									type="file"
									accept="image/*"
									onchange={handleImageUpload}
									class="hidden"
								/>
								📤 העלה תמונה
							</label>
							<button
								type="button"
								onclick={() => showImageUploader = !showImageUploader}
								class="flex-1 bg-gray-100 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-200 transition font-medium"
							>
								🔗 הדבק קישור
							</button>
						</div>
						
						{#if showImageUploader}
							<input
								type="url"
								bind:value={currentImage.url}
								placeholder="https://example.com/image.jpg"
								class="w-full border border-gray-300 rounded-lg px-3 py-2 mt-2 focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
							/>
						{/if}
					</div>
					
					<div>
						<label class="block text-sm font-medium text-gray-700 mb-1">כיתוב (אופציונלי)</label>
						<input
							type="text"
							bind:value={currentImage.caption}
							placeholder="תיאור התמונה"
							class="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
						/>
					</div>
				</div>
				
				<div class="flex gap-3 mt-6">
					<button
						type="button"
						onclick={cancelEdit}
						class="flex-1 bg-gray-200 text-gray-800 py-2 px-4 rounded-lg hover:bg-gray-300 transition"
					>
						ביטול
					</button>
					<button
						type="button"
						onclick={saveImage}
						class="flex-1 bg-purple-600 text-white py-2 px-4 rounded-lg hover:bg-purple-700 transition"
					>
						{editingIndex !== null ? 'עדכן' : 'הוסף'}
					</button>
				</div>
			</div>
		</div>
	{/if}
</div>

<style>
	.image-gallery-manager {
		background: #f9fafb;
		padding: 20px;
		border-radius: 12px;
		border: 2px solid #e5e7eb;
	}
</style>
