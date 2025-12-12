<script>
	import { getContext } from 'svelte';
	
	/** @type {{ value: string, onsave: (newValue: string) => Promise<void>, tag?: string, className?: string, placeholder?: string }} */
	let { value = '', onsave, tag = 'div', className = '', placeholder = 'לחץ לעריכה...' } = $props();
	
	// Get editMode from context - if false, disable editing
	const editMode = getContext('editMode');
	const isEditable = $derived(typeof editMode === 'function' ? editMode() : editMode);
	
	let element = $state(null);
	let saving = $state(false);
	let originalValue = value;
	
	async function handleBlur(event) {
		// Get the text content from the event target
		const target = event.currentTarget;
		if (!target) return;
		
		// Get innerHTML to preserve line breaks
		const innerHTML = target.innerHTML || '';
		// Convert <br> and <div> tags to \n
		const newValue = innerHTML
			.replace(/<br\s*\/?>/gi, '\n')
			.replace(/<\/div><div>/gi, '\n')
			.replace(/<div>/gi, '\n')
			.replace(/<\/div>/gi, '')
			.replace(/<[^>]*>/g, '') // Remove any other HTML tags
			.trim();
		
		// Only save if changed
		if (newValue !== originalValue && newValue !== '') {
			saving = true;
			try {
				await onsave(newValue);
				originalValue = newValue;
				showNotification('✅ נשמר בהצלחה');
			} catch (error) {
				console.error('Save failed:', error);
				showNotification('❌ שגיאה בשמירה');
				// Revert to original value
				if (target) {
					target.innerHTML = originalValue.replace(/\n/g, '<br>');
				}
			} finally {
				saving = false;
			}
		}
	}
	
	function showNotification(message) {
		const notification = document.createElement('div');
		notification.className = 'save-notification';
		notification.textContent = message;
		document.body.appendChild(notification);
		
		setTimeout(() => notification.classList.add('show'), 10);
		setTimeout(() => {
			notification.classList.remove('show');
			setTimeout(() => notification.remove(), 300);
		}, 2000);
	}
	
	// Convert \n to <br> when displaying
	let displayValue = $derived(value ? value.replace(/\n/g, '<br>') : '');
</script>

<svelte:element 
	this={tag}
	bind:this={element}
	class="editable-text {className}"
	class:saving
	class:edit-mode={isEditable}
	contenteditable={isEditable}
	onblur={isEditable ? handleBlur : undefined}
	data-placeholder={placeholder}
>
	{@html displayValue}
</svelte:element>

<style>
	:global(.editable-text) {
		position: relative;
		transition: all 0.2s ease;
		border-radius: 8px;
		padding: 0.25rem;
		margin: -0.25rem;
		min-height: 1.5em;
	}
	
	/* In view-only mode - completely disable editing */
	:global(.editable-text:not(.edit-mode)) {
		cursor: default !important;
		user-select: text;
		-webkit-user-select: text;
		-moz-user-select: text;
		-ms-user-select: text;
	}
	
	/* Only show edit indicators when in edit mode */
	:global(.editable-text.edit-mode) {
		cursor: text;
	}
	
	:global(.editable-text.edit-mode:hover) {
		background: rgba(102, 126, 234, 0.1);
		outline: 2px dashed rgba(102, 126, 234, 0.3);
		outline-offset: 4px;
	}
	
	:global(.editable-text.edit-mode:focus) {
		background: rgba(102, 126, 234, 0.15);
		outline: 2px solid rgba(102, 126, 234, 0.5);
		outline-offset: 4px;
	}
	
	:global(.editable-text.saving) {
		opacity: 0.6;
		pointer-events: none;
	}
	
	:global(.editable-text:empty:before) {
		content: attr(data-placeholder);
		color: rgba(0, 0, 0, 0.3);
		font-style: italic;
	}
	
	:global(.save-notification) {
		position: fixed;
		bottom: 30px;
		left: 50%;
		transform: translateX(-50%) translateY(100px);
		background: rgba(34, 197, 94, 0.95);
		color: white;
		padding: 1rem 2rem;
		border-radius: 50px;
		font-weight: 600;
		box-shadow: 0 4px 20px rgba(34, 197, 94, 0.3);
		z-index: 10000;
		opacity: 0;
		transition: all 0.3s ease;
		direction: rtl;
	}
	
	:global(.save-notification.show) {
		opacity: 1;
		transform: translateX(-50%) translateY(0);
	}
</style>
