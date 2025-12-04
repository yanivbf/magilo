<script>
	import { onMount } from 'svelte';
	
	let { pageId, faq = [], gallery = [], testimonials = [] } = $props();
	
	let faqItems = $state([...faq]);
	let galleryImages = $state([...gallery]);
	let testimonialsItems = $state([...testimonials]);
	let saving = $state(false);
	let message = $state('');
	
	// FAQ Management
	function addFAQ() {
		faqItems = [...faqItems, { question: '', answer: '' }];
	}
	
	function removeFAQ(index) {
		faqItems = faqItems.filter((_, i) => i !== index);
	}
	
	// Gallery Management
	function addGalleryImage() {
		const url = prompt('הכנס קישור לתמונה:');
		if (url) {
			galleryImages = [...galleryImages, url];
		}
	}
	
	function removeGalleryImage(index) {
		galleryImages = galleryImages.filter((_, i) => i !== index);
	}
	
	// Testimonials Management
	function addTestimonial() {
		testimonialsItems = [...testimonialsItems, { name: '', text: '', rating: 5 }];
	}
	
	function removeTestimonial(index) {
		testimonialsItems = testimonialsItems.filter((_, i) => i !== index);
	}
	
	// Save all changes
	async function saveChanges() {
		saving = true;
		message = '';
		
		try {
			const response = await fetch(`/api/pages/${pageId}/content-sections`, {
				method: 'PUT',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({
					faq: faqItems,
					gallery: galleryImages,
					testimonials: testimonialsItems
				})
			});
			
			if (response.ok) {
				message = '✅ השינויים נשמרו בהצלחה!';
				setTimeout(() => message = '', 3000);
			} else {
				message = '❌ שגיאה בשמירה';
			}
		} catch (error) {
			console.error('Error saving:', error);
			message = '❌ שגיאה בשמירה';
		} finally {
			saving = false;
		}
	}
</script>

<div class="content-sections-editor">
	<h2 class="text-2xl font-bold mb-6">ניהול תוכן מקטעים</h2>
	
	<!-- FAQ Section -->
	<div class="section-group mb-8">
		<div class="section-header">
			<h3 class="text-xl font-bold">❓ שאלות ותשובות (FAQ)</h3>
			<button onclick={addFAQ} class="btn-add">+ הוסף שאלה</button>
		</div>
		
		<div class="items-list">
			{#each faqItems as item, index}
				<div class="faq-item">
					<div class="item-header">
						<span class="item-number">{index + 1}</span>
						<button onclick={() => removeFAQ(index)} class="btn-remove">🗑️</button>
					</div>
					<input
						type="text"
						bind:value={item.question}
						placeholder="השאלה..."
						class="input-field"
					/>
					<textarea
						bind:value={item.answer}
						placeholder="התשובה..."
						class="textarea-field"
						rows="3"
					></textarea>
				</div>
			{/each}
			
			{#if faqItems.length === 0}
				<div class="empty-state">
					<p>אין שאלות ותשובות. לחץ על "הוסף שאלה" כדי להתחיל.</p>
				</div>
			{/if}
		</div>
	</div>
	
	<!-- Gallery Section -->
	<div class="section-group mb-8">
		<div class="section-header">
			<h3 class="text-xl font-bold">🖼️ גלריית תמונות</h3>
			<button onclick={addGalleryImage} class="btn-add">+ הוסף תמונה</button>
		</div>
		
		<div class="gallery-grid">
			{#each galleryImages as image, index}
				<div class="gallery-item">
					<img src={image} alt="תמונה {index + 1}" />
					<button onclick={() => removeGalleryImage(index)} class="btn-remove-overlay">🗑️</button>
				</div>
			{/each}
			
			{#if galleryImages.length === 0}
				<div class="empty-state">
					<p>אין תמונות בגלריה. לחץ על "הוסף תמונה" כדי להתחיל.</p>
				</div>
			{/if}
		</div>
	</div>
	
	<!-- Testimonials Section -->
	<div class="section-group mb-8">
		<div class="section-header">
			<h3 class="text-xl font-bold">⭐ המלצות לקוחות</h3>
			<button onclick={addTestimonial} class="btn-add">+ הוסף המלצה</button>
		</div>
		
		<div class="items-list">
			{#each testimonialsItems as item, index}
				<div class="testimonial-item">
					<div class="item-header">
						<span class="item-number">{index + 1}</span>
						<button onclick={() => removeTestimonial(index)} class="btn-remove">🗑️</button>
					</div>
					<input
						type="text"
						bind:value={item.name}
						placeholder="שם הלקוח..."
						class="input-field"
					/>
					<textarea
						bind:value={item.text}
						placeholder="ההמלצה..."
						class="textarea-field"
						rows="3"
					></textarea>
					<div class="rating-selector">
						<label>דירוג:</label>
						<select bind:value={item.rating} class="select-field">
							<option value={5}>⭐⭐⭐⭐⭐</option>
							<option value={4}>⭐⭐⭐⭐</option>
							<option value={3}>⭐⭐⭐</option>
							<option value={2}>⭐⭐</option>
							<option value={1}>⭐</option>
						</select>
					</div>
				</div>
			{/each}
			
			{#if testimonialsItems.length === 0}
				<div class="empty-state">
					<p>אין המלצות. לחץ על "הוסף המלצה" כדי להתחיל.</p>
				</div>
			{/if}
		</div>
	</div>
	
	<!-- Save Button -->
	<div class="save-section">
		<button onclick={saveChanges} disabled={saving} class="btn-save">
			{saving ? '⏳ שומר...' : '💾 שמור שינויים'}
		</button>
		{#if message}
			<p class="message">{message}</p>
		{/if}
	</div>
</div>

<style>
	.content-sections-editor {
		direction: rtl;
	}
	
	.section-group {
		background: #f9fafb;
		padding: 1.5rem;
		border-radius: 12px;
		border: 1px solid #e5e7eb;
	}
	
	.section-header {
		display: flex;
		justify-content: space-between;
		align-items: center;
		margin-bottom: 1.5rem;
	}
	
	.btn-add {
		padding: 0.5rem 1.5rem;
		background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
		color: white;
		border: none;
		border-radius: 8px;
		font-weight: 600;
		cursor: pointer;
		transition: transform 0.2s;
	}
	
	.btn-add:hover {
		transform: translateY(-2px);
	}
	
	.items-list {
		display: flex;
		flex-direction: column;
		gap: 1rem;
	}
	
	.faq-item,
	.testimonial-item {
		background: white;
		padding: 1.5rem;
		border-radius: 8px;
		border: 1px solid #e5e7eb;
	}
	
	.item-header {
		display: flex;
		justify-content: space-between;
		align-items: center;
		margin-bottom: 1rem;
	}
	
	.item-number {
		background: #667eea;
		color: white;
		width: 30px;
		height: 30px;
		border-radius: 50%;
		display: flex;
		align-items: center;
		justify-content: center;
		font-weight: bold;
	}
	
	.btn-remove {
		background: #ef4444;
		color: white;
		border: none;
		padding: 0.5rem 1rem;
		border-radius: 6px;
		cursor: pointer;
		transition: background 0.2s;
	}
	
	.btn-remove:hover {
		background: #dc2626;
	}
	
	.input-field,
	.textarea-field,
	.select-field {
		width: 100%;
		padding: 0.75rem;
		border: 1px solid #d1d5db;
		border-radius: 6px;
		font-size: 1rem;
		margin-bottom: 0.75rem;
	}
	
	.textarea-field {
		resize: vertical;
		font-family: inherit;
	}
	
	.rating-selector {
		display: flex;
		align-items: center;
		gap: 1rem;
	}
	
	.rating-selector label {
		font-weight: 600;
	}
	
	.select-field {
		width: auto;
		margin-bottom: 0;
	}
	
	.gallery-grid {
		display: grid;
		grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
		gap: 1rem;
	}
	
	.gallery-item {
		position: relative;
		aspect-ratio: 1;
		border-radius: 8px;
		overflow: hidden;
		border: 2px solid #e5e7eb;
	}
	
	.gallery-item img {
		width: 100%;
		height: 100%;
		object-fit: cover;
	}
	
	.btn-remove-overlay {
		position: absolute;
		top: 0.5rem;
		right: 0.5rem;
		background: rgba(239, 68, 68, 0.9);
		color: white;
		border: none;
		padding: 0.5rem;
		border-radius: 6px;
		cursor: pointer;
		font-size: 1.2rem;
		transition: background 0.2s;
	}
	
	.btn-remove-overlay:hover {
		background: #dc2626;
	}
	
	.empty-state {
		text-align: center;
		padding: 3rem;
		color: #6b7280;
		background: white;
		border-radius: 8px;
		border: 2px dashed #d1d5db;
	}
	
	.save-section {
		text-align: center;
		margin-top: 2rem;
	}
	
	.btn-save {
		padding: 1rem 3rem;
		background: linear-gradient(135deg, #10b981 0%, #059669 100%);
		color: white;
		border: none;
		border-radius: 12px;
		font-size: 1.1rem;
		font-weight: 700;
		cursor: pointer;
		transition: transform 0.2s;
	}
	
	.btn-save:hover:not(:disabled) {
		transform: translateY(-2px);
	}
	
	.btn-save:disabled {
		opacity: 0.6;
		cursor: not-allowed;
	}
	
	.message {
		margin-top: 1rem;
		font-size: 1.1rem;
		font-weight: 600;
	}
</style>
