<script>
	import { getContext } from 'svelte';
	
	/** @type {{ src: string, alt?: string, onUpload: (file: File) => Promise<void>, className?: string }} */
	let { src, alt = '', onUpload, className = '' } = $props();
	
	// Get editMode from context - if false, disable editing
	const editMode = getContext('editMode');
	const isEditable = $derived(typeof editMode === 'function' ? editMode() : editMode);
	
	let fileInput;
	let uploading = $state(false);
	
	function openFileDialog() {
		if (!isEditable) return; // Don't allow editing if not in edit mode
		fileInput.click();
	}
	
	async function handleFileChange(event) {
		const file = event.target.files?.[0];
		if (!file) return;
		
		uploading = true;
		try {
			await onUpload(file);
		} catch (error) {
			console.error('Upload failed:', error);
		} finally {
			uploading = false;
			event.target.value = ''; // Reset input
		}
	}
</script>

<input 
	type="file" 
	accept="image/*" 
	bind:this={fileInput}
	onchange={handleFileChange}
	style="display: none;"
/>

<div class="editable-image-wrapper {className}" class:uploading class:edit-mode={isEditable}>
	<img {src} {alt} />
	
	{#if isEditable}
		<button class="image-overlay" onclick={openFileDialog} type="button">
			<div class="overlay-content">
				{#if uploading}
					<div class="spinner"></div>
					<p>מעלה...</p>
				{:else}
					<svg class="camera-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
						<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
						<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
					</svg>
					<p>לחץ להחלפת תמונה</p>
				{/if}
			</div>
		</button>
	{/if}
</div>

<style>
	.editable-image-wrapper {
		position: relative;
		overflow: hidden;
	}
	
	/* Only show cursor pointer in edit mode */
	.editable-image-wrapper.edit-mode {
		cursor: pointer;
	}
	
	.editable-image-wrapper img {
		width: 100%;
		height: 100%;
		object-fit: cover;
		transition: transform 0.3s ease;
	}
	
	.image-overlay {
		position: absolute;
		inset: 0;
		background: rgba(102, 126, 234, 0.9);
		display: flex;
		align-items: center;
		justify-content: center;
		opacity: 0;
		transition: opacity 0.3s ease;
		border: none;
		cursor: pointer;
		color: white;
	}
	
	/* Only show overlay on hover in edit mode */
	.editable-image-wrapper.edit-mode:hover .image-overlay {
		opacity: 1;
	}
	
	.editable-image-wrapper.edit-mode:hover img {
		transform: scale(1.05);
	}
	
	.overlay-content {
		text-align: center;
	}
	
	.camera-icon {
		width: 48px;
		height: 48px;
		margin: 0 auto 0.5rem;
		filter: drop-shadow(0 2px 8px rgba(0, 0, 0, 0.3));
	}
	
	.overlay-content p {
		font-weight: 600;
		font-size: 1.1rem;
		margin: 0;
		text-shadow: 0 2px 4px rgba(0, 0, 0, 0.3);
	}
	
	.spinner {
		width: 48px;
		height: 48px;
		border: 4px solid rgba(255, 255, 255, 0.3);
		border-top-color: white;
		border-radius: 50%;
		animation: spin 0.8s linear infinite;
		margin: 0 auto 0.5rem;
	}
	
	@keyframes spin {
		to { transform: rotate(360deg); }
	}
	
	.uploading {
		pointer-events: none;
	}
	
	.uploading .image-overlay {
		opacity: 1;
	}
</style>
