<script>
	import { goto } from '$app/navigation';
	import PageRenderer from '$lib/components/PageRenderer.svelte';
	
	let { data } = $props();
	
	let editMode = $state(true);
	let selectedElement = $state(null);
	let imageInput;
	
	// Editable page data
	let pageData = $state({ ...data.page });
	
	// Handle image upload
	async function handleImageUpload(event, field) {
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
				pageData[field] = result.url;
			}
		} catch (error) {
			console.error('Error uploading image:', error);
		}
	}
	
	// Save changes
	async function saveChanges() {
		try {
			const response = await fetch('/api/update-page', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({
					pageId: pageData.documentId || pageData.id,
					updates: pageData
				})
			});
			
			if (response.ok) {
				alert('✅ הדף נשמר בהצלחה!');
				goto(`/view/${pageData.slug}`);
			}
		} catch (error) {
			console.error('Error saving:', error);
			alert('❌ שגיאה בשמירה');
		}
	}
</script>

<div class="edit-page" dir="rtl">
	<!-- Edit Panel -->
	<div class="edit-panel">
		<div class="panel-header">
			<h2>🎨 עריכת דף</h2>
			<button onclick={() => goto('/dashboard')} class="close-btn">✕</button>
		</div>
		
		<div class="panel-content">
			<!-- Images Section -->
			<div class="edit-section">
				<h3>📷 תמונות</h3>
				
				<div class="edit-item">
					<label>תמונת רקע ראשית</label>
					<input type="file" accept="image/*" onchange={(e) => handleImageUpload(e, 'headerImage')} />
					{#if pageData.headerImage}
						<img src={pageData.headerImage} alt="Preview" class="preview-img" />
					{/if}
				</div>
				
				<div class="edit-item">
					<label>לוגו</label>
					<input type="file" accept="image/*" onchange={(e) => handleImageUpload(e, 'logo')} />
					{#if pageData.logo}
						<img src={pageData.logo} alt="Logo" class="preview-img" />
					{/if}
				</div>
			</div>
			
			<!-- Text Section -->
			<div class="edit-section">
				<h3>📝 טקסט</h3>
				
				<div class="edit-item">
					<label>כותרת</label>
					<input type="text" bind:value={pageData.title} class="text-input" />
				</div>
				
				<div class="edit-item">
					<label>תיאור</label>
					<textarea bind:value={pageData.description} class="text-input" rows="3"></textarea>
				</div>
				
				<div class="edit-item">
					<label>טלפון</label>
					<input type="tel" bind:value={pageData.phone} class="text-input" />
				</div>
				
				<div class="edit-item">
					<label>אימייל</label>
					<input type="email" bind:value={pageData.email} class="text-input" />
				</div>
			</div>
			
			<!-- Design Section -->
			<div class="edit-section">
				<h3>🎨 עיצוב</h3>
				
				<div class="edit-item">
					<label>צבע רקע</label>
					<input type="color" bind:value={pageData.backgroundColor} />
				</div>
				
				<div class="edit-item">
					<label>צבע טקסט</label>
					<input type="color" bind:value={pageData.textColor} />
				</div>
				
				<div class="edit-item">
					<label>גודל טקסט</label>
					<select bind:value={pageData.fontSize} class="text-input">
						<option value="small">קטן</option>
						<option value="medium">בינוני</option>
						<option value="large">גדול</option>
					</select>
				</div>
			</div>
			
			<!-- Save Button -->
			<button onclick={saveChanges} class="save-btn">
				💾 שמור שינויים
			</button>
		</div>
	</div>
	
	<!-- Preview -->
	<div class="preview-area">
		<div class="preview-header">
			<h3>👁️ תצוגה מקדימה</h3>
		</div>
		<div class="preview-content">
			<PageRenderer pageData={pageData} isOwner={false} />
		</div>
	</div>
</div>

<style>
	.edit-page {
		display: flex;
		height: 100vh;
		background: #f3f4f6;
	}
	
	.edit-panel {
		width: 400px;
		background: white;
		border-right: 1px solid #e5e7eb;
		display: flex;
		flex-direction: column;
		overflow: hidden;
	}
	
	.panel-header {
		padding: 1.5rem;
		background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
		color: white;
		display: flex;
		justify-content: space-between;
		align-items: center;
	}
	
	.panel-header h2 {
		margin: 0;
		font-size: 1.5rem;
	}
	
	.close-btn {
		background: rgba(255, 255, 255, 0.2);
		border: none;
		color: white;
		width: 32px;
		height: 32px;
		border-radius: 50%;
		cursor: pointer;
		font-size: 1.5rem;
		display: flex;
		align-items: center;
		justify-content: center;
	}
	
	.close-btn:hover {
		background: rgba(255, 255, 255, 0.3);
	}
	
	.panel-content {
		flex: 1;
		overflow-y: auto;
		padding: 1.5rem;
	}
	
	.edit-section {
		margin-bottom: 2rem;
		padding-bottom: 2rem;
		border-bottom: 1px solid #e5e7eb;
	}
	
	.edit-section:last-of-type {
		border-bottom: none;
	}
	
	.edit-section h3 {
		margin: 0 0 1rem 0;
		font-size: 1.25rem;
		color: #374151;
	}
	
	.edit-item {
		margin-bottom: 1rem;
	}
	
	.edit-item label {
		display: block;
		margin-bottom: 0.5rem;
		font-weight: 600;
		color: #4b5563;
		font-size: 0.875rem;
	}
	
	.text-input {
		width: 100%;
		padding: 0.75rem;
		border: 1px solid #d1d5db;
		border-radius: 0.5rem;
		font-size: 1rem;
		font-family: inherit;
	}
	
	.text-input:focus {
		outline: none;
		border-color: #667eea;
		box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
	}
	
	input[type="file"] {
		width: 100%;
		padding: 0.5rem;
		border: 2px dashed #d1d5db;
		border-radius: 0.5rem;
		cursor: pointer;
	}
	
	input[type="file"]:hover {
		border-color: #667eea;
		background: #f9fafb;
	}
	
	input[type="color"] {
		width: 100%;
		height: 50px;
		border: 1px solid #d1d5db;
		border-radius: 0.5rem;
		cursor: pointer;
	}
	
	.preview-img {
		width: 100%;
		height: 120px;
		object-fit: cover;
		border-radius: 0.5rem;
		margin-top: 0.5rem;
		border: 1px solid #e5e7eb;
	}
	
	.save-btn {
		width: 100%;
		padding: 1rem;
		background: linear-gradient(135deg, #10b981 0%, #059669 100%);
		color: white;
		border: none;
		border-radius: 0.75rem;
		font-size: 1.125rem;
		font-weight: bold;
		cursor: pointer;
		box-shadow: 0 4px 12px rgba(16, 185, 129, 0.3);
		transition: all 0.3s;
	}
	
	.save-btn:hover {
		transform: translateY(-2px);
		box-shadow: 0 6px 16px rgba(16, 185, 129, 0.4);
	}
	
	.preview-area {
		flex: 1;
		display: flex;
		flex-direction: column;
		overflow: hidden;
	}
	
	.preview-header {
		padding: 1rem 1.5rem;
		background: white;
		border-bottom: 1px solid #e5e7eb;
	}
	
	.preview-header h3 {
		margin: 0;
		font-size: 1.25rem;
		color: #374151;
	}
	
	.preview-content {
		flex: 1;
		overflow-y: auto;
		background: white;
	}
</style>
