<script>
	import { onMount } from 'svelte';
	
	/** @type {{ formData: any, onUpdate: (data: any) => void }} */
	let { formData = $bindable({}), onUpdate } = $props();
	
	let editMode = $state(false);
	let selectedElement = $state(null);
	let imageInput;
	
	// Enable edit mode
	function enableEditMode() {
		editMode = true;
		makeElementsEditable();
	}
	
	// Make text elements editable
	function makeElementsEditable() {
		// Add click handlers to text elements
		document.querySelectorAll('.editable-text').forEach(el => {
			el.contentEditable = 'true';
			el.style.outline = '2px dashed #667eea';
			el.style.cursor = 'text';
			
			el.addEventListener('blur', (e) => {
				const field = el.dataset.field;
				if (field) {
					formData[field] = e.target.textContent;
					onUpdate?.(formData);
				}
			});
		});
		
		// Add click handlers to images
		document.querySelectorAll('.editable-image').forEach(el => {
			el.style.outline = '2px dashed #667eea';
			el.style.cursor = 'pointer';
			
			el.addEventListener('click', () => {
				selectedElement = el;
				imageInput.click();
			});
		});
	}
	
	// Handle image upload
	async function handleImageChange(event) {
		const file = event.target.files?.[0];
		if (!file || !selectedElement) return;
		
		const formData = new FormData();
		formData.append('image', file);
		
		try {
			const response = await fetch('/api/upload-image', {
				method: 'POST',
				body: formData
			});
			
			if (response.ok) {
				const result = await response.json();
				selectedElement.src = result.url;
				
				const field = selectedElement.dataset.field;
				if (field) {
					formData[field] = result.url;
					onUpdate?.(formData);
				}
			}
		} catch (error) {
			console.error('Error uploading image:', error);
		}
	}
	
	// Disable edit mode
	function disableEditMode() {
		editMode = false;
		document.querySelectorAll('.editable-text, .editable-image').forEach(el => {
			el.contentEditable = 'false';
			el.style.outline = 'none';
			el.style.cursor = 'default';
		});
	}
</script>

<!-- Hidden file input -->
<input
	bind:this={imageInput}
	type="file"
	accept="image/*"
	onchange={handleImageChange}
	style="display: none;"
/>

<!-- Edit Mode Toggle -->
{#if !editMode}
	<button
		onclick={enableEditMode}
		class="fixed bottom-24 right-6 z-50 bg-gradient-to-r from-purple-600 to-pink-600 text-white px-6 py-3 rounded-full shadow-lg hover:shadow-xl transition-all hover:scale-105 flex items-center gap-2"
	>
		<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
			<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
		</svg>
		✏️ עריכה מהירה
	</button>
{:else}
	<div class="fixed bottom-24 right-6 z-50 bg-white rounded-2xl shadow-2xl p-4 border-2 border-purple-600">
		<div class="text-center mb-3">
			<p class="text-sm font-bold text-purple-600">מצב עריכה פעיל</p>
			<p class="text-xs text-gray-600">לחץ על טקסט לעריכה, על תמונה להחלפה</p>
		</div>
		<button
			onclick={disableEditMode}
			class="w-full bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors"
		>
			✅ סיים עריכה
		</button>
	</div>
{/if}

<style>
	:global(.editable-text:hover) {
		background: rgba(102, 126, 234, 0.1);
	}
	
	:global(.editable-image:hover) {
		opacity: 0.8;
		transform: scale(1.02);
		transition: all 0.3s;
	}
</style>
