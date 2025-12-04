<script>
	/** @type {{ value: string, onsave: (newValue: string) => Promise<void>, tag?: string, className?: string, placeholder?: string }} */
	let { value = '', onsave, tag = 'div', className = '', placeholder = 'לחץ לעריכה...' } = $props();
	
	let element;
	let saving = $state(false);
	let originalValue = value;
	
	async function handleBlur() {
		const newValue = element.textContent?.trim() || '';
		
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
				if (element) {
					element.textContent = originalValue;
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
</script>

<svelte:element 
	this={tag}
	bind:this={element}
	class="editable-text {className}"
	class:saving
	contenteditable="true"
	onblur={handleBlur}
	data-placeholder={placeholder}
>
	{value}
</svelte:element>

<style>
	:global(.editable-text) {
		position: relative;
		cursor: text;
		transition: all 0.2s ease;
		border-radius: 8px;
		padding: 0.25rem;
		margin: -0.25rem;
		min-height: 1.5em;
	}
	
	:global(.editable-text:hover) {
		background: rgba(102, 126, 234, 0.1);
		outline: 2px dashed rgba(102, 126, 234, 0.3);
		outline-offset: 4px;
	}
	
	:global(.editable-text:focus) {
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
