<script>
	import { invalidate } from '$app/navigation';
	
	let { 
		onUpload, 
		label = 'העלה תמונה', 
		multiple = false,
		sectionId = null,
		existingImages = []
	} = $props();
	
	let uploading = $state(false);
	let uploadedImages = $state(existingImages);
	let error = $state('');
	
	$effect(() => {
		uploadedImages = existingImages;
	});
	
	async function handleFileChange(event) {
		const files = event.target.files;
		if (!files || files.length === 0) return;
		
		uploading = true;
		error = '';
		
		try {
			const formData = new FormData();
			
			if (multiple) {
				for (let i = 0; i < files.length; i++) {
					formData.append('images', files[i]);
				}
			} else {
				formData.append('image', files[0]);
			}
			
			if (sectionId) {
				formData.append('sectionId', sectionId);
			}
			
			const endpoint = sectionId ? '/api/upload-section-image' : '/api/upload-image';
			
			const response = await fetch(endpoint, {
				method: 'POST',
				body: formData
			});
			
			if (!response.ok) {
				throw new Error('Failed to upload image');
			}
			
			const result = await response.json();
			
			if (result.success) {
				if (multiple) {
					const newUrls = Array.isArray(result.urls) ? result.urls : [result.url];
					uploadedImages = [...uploadedImages, ...newUrls];
					onUpload?.(uploadedImages);
				} else {
					uploadedImages = [result.url];
					onUpload?.(result.url);
				}
				
				if (sectionId) {
					await invalidate('app:sections');
				}
			} else {
				throw new Error(result.error || 'Upload failed');
			}
		} catch (err) {
			console.error('Upload error:', err);
			error = 'שגיאה בהעלאת התמונה: ' + err.message;
		} finally {
			uploading = false;
		}
	}
	
	async function removeImage(index) {
		const imageUrl = uploadedImages[index];
		
		if (sectionId && imageUrl) {
			try {
				const response = await fetch('/api/delete-section-image', {
					method: 'POST',
					headers: { 'Content-Type': 'application/json' },
					body: JSON.stringify({
						sectionId,
						imageUrl
					})
				});
				
				if (!response.ok) {
					throw new Error('Failed to delete image');
				}
				
				await invalidate('app:sections');
			} catch (err) {
				console.error('Delete error:', err);
				error = 'שגיאה במחיקת התמונה';
				return;
			}
		}
		
		uploadedImages = uploadedImages.filter((_, i) => i !== index);
		
		if (multiple) {
			onUpload?.(uploadedImages);
		} else {
			onUpload?.(null);
		}
	}
</script>

<div class="image-uploader">
	<label class="block text-sm font-medium text-gray-700 mb-2">
		{label}
	</label>
	
	<div class="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-purple-500 transition-colors">
		<input
			type="file"
			accept="image/*"
			{multiple}
			onchange={handleFileChange}
			disabled={uploading}
			class="hidden"
			id="file-upload"
		/>
		
		<label for="file-upload" class="cursor-pointer">
			{#if uploading}
				<div class="flex flex-col items-center">
					<div class="loader mb-2"></div>
					<p class="text-gray-600">מעלה תמונה...</p>
				</div>
			{:else}
				<div class="flex flex-col items-center">
					<svg class="w-12 h-12 text-gray-400 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
						<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"></path>
					</svg>
					<p class="text-gray-600 mb-1">לחץ להעלאת תמונה</p>
					<p class="text-sm text-gray-500">PNG, JPG, GIF עד 5MB</p>
				</div>
			{/if}
		</label>
	</div>
	
	{#if error}
		<p class="text-red-600 text-sm mt-2">{error}</p>
	{/if}
	
	{#if uploadedImages.length > 0}
		<div class="mt-4 grid grid-cols-2 md:grid-cols-3 gap-4">
			{#each uploadedImages as imageUrl, index}
				<div class="relative group">
					<img src={imageUrl} alt="Uploaded" class="w-full h-32 object-cover rounded-lg" />
					<button
						type="button"
						onclick={() => removeImage(index)}
						class="absolute top-2 right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
					>
						×
					</button>
				</div>
			{/each}
		</div>
	{/if}
</div>
