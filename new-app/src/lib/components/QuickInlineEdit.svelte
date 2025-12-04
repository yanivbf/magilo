<script>
	/**
	 * עריכה אינטראקטיבית פשוטה - בדיוק כמו במערכת הישנה
	 * לחיצה על תמונה = החלפה
	 * לחיצה על טקסט = עריכה
	 */
	
	import { onMount } from 'svelte';
	
	let { pageId, pageData = $bindable({}) } = $props();
	
	let editMode = $state(false);
	let selectedElement = $state(null);
	let imageInput;
	let saving = $state(false);
	
	// מפה של אלמנטים לשדות ב-pageData
	const fieldMap = new Map();
	
	onMount(() => {
		// מפה את האלמנטים לשדות
		mapElements();
	});
	
	function mapElements() {
		// מפה כותרות
		document.querySelectorAll('[data-field="title"]').forEach(el => {
			fieldMap.set(el, 'title');
		});
		
		// מפה תיאורים
		document.querySelectorAll('[data-field="description"]').forEach(el => {
			fieldMap.set(el, 'description');
		});
		
		// מפה תמונות
		document.querySelectorAll('[data-field="headerImage"]').forEach(el => {
			fieldMap.set(el, 'headerImage');
		});
	}
	
	function enableEditMode() {
		editMode = true;
		
		setTimeout(() => {
			// הוסף אפשרות עריכה לכל התמונות
			document.querySelectorAll('img').forEach(img => {
				// דלג על תמונות של הממשק
				if (img.closest('.edit-toolbar') || img.closest('.bot-bubble') || img.closest('.nav-bar')) {
					return;
				}
				
				img.style.cursor = 'pointer';
				img.style.transition = 'all 0.3s';
				img.dataset.editable = 'image';
				
				img.addEventListener('click', handleImageClick);
				img.addEventListener('mouseenter', handleMouseEnter);
				img.addEventListener('mouseleave', handleMouseLeave);
			});
			
			// הוסף אפשרות עריכה לכל הטקסטים
			document.querySelectorAll('h1, h2, h3, h4, h5, h6, p, span, a, button, li').forEach(el => {
				// דלג על אלמנטים של הממשק
				if (el.closest('.edit-toolbar') || el.closest('.bot-bubble') || el.closest('.nav-bar') || el.closest('.quick-inline-edit')) {
					return;
				}
				
				// דלג על כפתורים אינטראקטיביים
				if (el.tagName === 'BUTTON' || el.tagName === 'A') {
					return;
				}
				
				el.style.cursor = 'text';
				el.style.transition = 'all 0.3s';
				el.dataset.editable = 'text';
				
				el.addEventListener('click', handleTextClick);
				el.addEventListener('mouseenter', handleMouseEnter);
				el.addEventListener('mouseleave', handleMouseLeave);
			});
		}, 100);
	}
	
	function disableEditMode() {
		editMode = false;
		
		// הסר את כל ה-listeners וה-styles
		document.querySelectorAll('[data-editable]').forEach(el => {
			el.style.outline = '';
			el.style.cursor = '';
			el.contentEditable = 'false';
			el.removeEventListener('click', handleImageClick);
			el.removeEventListener('click', handleTextClick);
			el.removeEventListener('mouseenter', handleMouseEnter);
			el.removeEventListener('mouseleave', handleMouseLeave);
			delete el.dataset.editable;
		});
		
		selectedElement = null;
	}
	
	function handleMouseEnter(e) {
		if (!editMode) return;
		const el = e.currentTarget;
		if (el !== selectedElement) {
			if (el.dataset.editable === 'image') {
				el.style.outline = '2px solid rgba(139, 92, 246, 0.5)';
			} else {
				el.style.outline = '2px solid rgba(16, 185, 129, 0.3)';
			}
		}
	}
	
	function handleMouseLeave(e) {
		if (!editMode) return;
		const el = e.currentTarget;
		if (el !== selectedElement) {
			el.style.outline = '';
		}
	}
	
	function handleImageClick(e) {
		e.preventDefault();
		e.stopPropagation();
		
		if (selectedElement) {
			selectedElement.style.outline = '';
		}
		
		selectedElement = e.currentTarget;
		selectedElement.style.outline = '3px dashed #8b5cf6';
		
		// פתח את בורר הקבצים
		imageInput.click();
	}
	
	function handleTextClick(e) {
		e.preventDefault();
		e.stopPropagation();
		
		if (selectedElement && selectedElement !== e.currentTarget) {
			selectedElement.style.outline = '';
			selectedElement.contentEditable = 'false';
		}
		
		selectedElement = e.currentTarget;
		selectedElement.style.outline = '2px dashed #10b981';
		selectedElement.contentEditable = 'true';
		selectedElement.focus();
		
		// שמור כשיוצאים מהאלמנט
		selectedElement.addEventListener('blur', handleTextBlur, { once: true });
	}
	
	async function handleTextBlur(e) {
		const el = e.currentTarget;
		const newText = el.textContent.trim();
		
		// זהה איזה שדה זה (כותרת, תיאור, וכו')
		let field = null;
		
		if (el.tagName === 'H1' || el.closest('.hero-content h1')) {
			field = 'title';
		} else if (el.classList.contains('description') || el.closest('.description')) {
			field = 'description';
		}
		
		if (field && newText) {
			pageData[field] = newText;
			await saveField(field, newText);
		}
		
		el.contentEditable = 'false';
	}
	
	async function handleImageUpload(e) {
		const file = e.target.files?.[0];
		if (!file || !selectedElement) return;
		
		saving = true;
		
		const formData = new FormData();
		formData.append('image', file);
		
		try {
			const response = await fetch('/api/upload-image', {
				method: 'POST',
				body: formData
			});
			
			if (response.ok) {
				const result = await response.json();
				const imageUrl = result.url;
				
				// עדכן את התמונה
				selectedElement.src = imageUrl;
				
				// זהה איזה שדה תמונה זה
				let field = null;
				
				if (selectedElement.closest('.hero')) {
					field = 'headerImage';
					// עדכן גם את הרקע
					const hero = selectedElement.closest('.hero');
					if (hero) {
						const currentStyle = hero.style.background;
						hero.style.background = currentStyle.replace(/url\([^)]+\)/, `url('${imageUrl}')`);
					}
				}
				
				if (field) {
					pageData[field] = imageUrl;
					await saveField(field, imageUrl);
				}
			}
		} catch (error) {
			console.error('Error uploading image:', error);
			alert('שגיאה בהעלאת התמונה');
		} finally {
			saving = false;
			e.target.value = '';
		}
	}
	
	async function saveField(field, value) {
		if (!pageId) return;
		
		saving = true;
		
		try {
			const response = await fetch('/api/update-page', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({
					pageId,
					[field]: value
				})
			});
			
			if (response.ok) {
				console.log(`✅ ${field} saved:`, value);
			} else {
				console.error(`Failed to save ${field}`);
				alert('שגיאה בשמירת השינויים');
			}
		} catch (error) {
			console.error('Error saving field:', error);
			alert('שגיאה בשמירת השינויים');
		} finally {
			saving = false;
		}
	}
</script>

<!-- Hidden file input -->
<input
	bind:this={imageInput}
	type="file"
	accept="image/*"
	onchange={handleImageUpload}
	style="display: none;"
/>

<!-- Edit Mode Toggle -->
<div class="quick-inline-edit">
	{#if !editMode}
		<button
			onclick={enableEditMode}
			class="edit-toggle-btn"
			title="הפעל מצב עריכה מהירה"
		>
			<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
				<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
			</svg>
			<span>✏️ עריכה מהירה</span>
		</button>
	{:else}
		<div class="edit-panel">
			<div class="edit-panel-header">
				<p class="edit-title">🎨 מצב עריכה פעיל</p>
				<p class="edit-instructions">
					🖼️ לחץ על תמונה להחלפה<br/>
					📝 לחץ על טקסט לעריכה
				</p>
				{#if saving}
					<div class="saving-indicator">
						<div class="spinner"></div>
						<span>שומר...</span>
					</div>
				{/if}
			</div>
			<button
				onclick={disableEditMode}
				class="done-btn"
			>
				✅ סיים עריכה
			</button>
		</div>
	{/if}
</div>

<style>
	.quick-inline-edit {
		position: fixed;
		bottom: 6rem;
		left: 1.5rem;
		z-index: 50;
	}
	
	.edit-toggle-btn {
		display: flex;
		align-items: center;
		gap: 0.5rem;
		padding: 0.75rem 1.5rem;
		background: linear-gradient(135deg, #8b5cf6 0%, #ec4899 100%);
		color: white;
		border: none;
		border-radius: 9999px;
		font-weight: 500;
		font-size: 0.95rem;
		cursor: pointer;
		box-shadow: 0 10px 25px rgba(139, 92, 246, 0.4);
		transition: all 0.3s ease;
	}
	
	.edit-toggle-btn:hover {
		transform: translateY(-2px);
		box-shadow: 0 15px 35px rgba(139, 92, 246, 0.5);
	}
	
	.edit-panel {
		background: white;
		border-radius: 1rem;
		padding: 1rem;
		box-shadow: 0 20px 50px rgba(0, 0, 0, 0.2);
		border: 2px solid #8b5cf6;
		min-width: 200px;
	}
	
	.edit-panel-header {
		text-align: center;
		margin-bottom: 0.75rem;
	}
	
	.edit-title {
		font-size: 0.875rem;
		font-weight: 700;
		color: #8b5cf6;
		margin-bottom: 0.5rem;
	}
	
	.edit-instructions {
		font-size: 0.75rem;
		color: #6b7280;
		line-height: 1.4;
		margin-bottom: 0.5rem;
	}
	
	.saving-indicator {
		display: flex;
		align-items: center;
		justify-content: center;
		gap: 0.5rem;
		color: #3b82f6;
		font-size: 0.75rem;
		margin-top: 0.5rem;
	}
	
	.spinner {
		width: 12px;
		height: 12px;
		border: 2px solid #e5e7eb;
		border-top-color: #3b82f6;
		border-radius: 50%;
		animation: spin 0.8s linear infinite;
	}
	
	@keyframes spin {
		to { transform: rotate(360deg); }
	}
	
	.done-btn {
		width: 100%;
		padding: 0.5rem 1rem;
		background: #10b981;
		color: white;
		border: none;
		border-radius: 0.5rem;
		font-weight: 500;
		cursor: pointer;
		transition: background 0.2s;
	}
	
	.done-btn:hover {
		background: #059669;
	}
	
	/* Responsive */
	@media (max-width: 768px) {
		.quick-inline-edit {
			bottom: 5rem;
			left: 1rem;
		}
		
		.edit-toggle-btn {
			padding: 0.6rem 1.2rem;
			font-size: 0.85rem;
		}
		
		.edit-panel {
			min-width: 180px;
		}
	}
</style>
