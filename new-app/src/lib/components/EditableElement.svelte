<script>
	import { onMount } from 'svelte';
	
	let { type = 'text', value = $bindable(''), placeholder = '', onSave } = $props();
	
	let isEditing = $state(false);
	let element;
	let imageInput;
	
	function startEdit() {
		isEditing = true;
		
		if (type === 'image') {
			imageInput?.click();
		}
	}
	
	function stopEdit() {
		isEditing = false;
		onSave?.(value);
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
				const result = await response.json();
				value = result.url;
				onSave?.(result.url);
			}
		} catch (error) {
			console.error('Error uploading image:', error);
		}
	}
</script>

<div class="editable-wrapper" bind:this={element}>
	{#if type === 'text'}
		<div class="editable-text-container">
			{#if isEditing}
				<input
					type="text"
					bind:value
					{placeholder}
					onblur={stopEdit}
					class="editable-input"
					autofocus
				/>
			{:else}
				<span class="editable-text">{value || placeholder}</span>
			{/if}
			
			<button
				onclick={startEdit}
				class="edit-button"
				title="ערוך"
			>
				<svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
					<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"></path>
				</svg>
			</button>
		</div>
	{:else if type === 'image'}
		<div class="editable-image-container">
			<img src={value} alt="" class="editable-image" />
			
			<input
				bind:this={imageInput}
				type="file"
				accept="image/*"
				onchange={handleImageUpload}
				style="display: none;"
			/>
			
			<button
				onclick={startEdit}
				class="edit-button image-edit"
				title="החלף תמונה"
			>
				<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
					<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"></path>
				</svg>
			</button>
		</div>
	{/if}
</div>

<style>
	.editable-wrapper {
		position: relative;
		display: inline-block;
	}
	
	.editable-text-container,
	.editable-image-container {
		position: relative;
		display: inline-block;
	}
	
	.editable-text-container:hover .edit-button,
	.editable-image-container:hover .edit-button {
		opacity: 1;
	}
	
	.edit-button {
		position: absolute;
		top: -12px;
		left: -12px;
		width: 36px;
		height: 36px;
		background: linear-gradient(135deg, #10b981 0%, #059669 100%);
		border: 3px solid white;
		border-radius: 50%;
		display: flex;
		align-items: center;
		justify-content: center;
		cursor: pointer;
		opacity: 0;
		transition: all 0.3s ease;
		box-shadow: 0 4px 12px rgba(16, 185, 129, 0.4);
		z-index: 10;
		color: white;
	}
	
	.edit-button:hover {
		transform: scale(1.15);
		box-shadow: 0 6px 16px rgba(16, 185, 129, 0.6);
	}
	
	.edit-button:active {
		transform: scale(1.05);
	}
	
	.image-edit {
		width: 44px;
		height: 44px;
		top: 12px;
		left: 12px;
	}
	
	.editable-text {
		display: inline-block;
		padding: 4px 8px;
		border-radius: 4px;
		transition: background 0.2s;
	}
	
	.editable-text-container:hover .editable-text {
		background: rgba(16, 185, 129, 0.1);
	}
	
	.editable-input {
		padding: 4px 8px;
		border: 2px solid #10b981;
		border-radius: 4px;
		font-size: inherit;
		font-family: inherit;
		outline: none;
		background: white;
	}
	
	.editable-image {
		display: block;
		max-width: 100%;
		height: auto;
		border-radius: 8px;
		transition: all 0.3s;
	}
	
	.editable-image-container:hover .editable-image {
		filter: brightness(0.95);
	}
</style>
