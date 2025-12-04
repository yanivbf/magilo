<script>
	import EditableImage from '$lib/components/editing/EditableImage.svelte';
	
	/** @type {{ data: { images: string[], title?: string, subtitle?: string }, pageId?: string, sectionId?: string, sectionIndex?: number, editable?: boolean }} */
	let { data, pageId, sectionId, sectionIndex, editable = true } = $props();
	
	let lightboxOpen = $state(false);
	let currentImage = $state(0);
	let images = $state(data.images || []);
	
	function openLightbox(index) {
		currentImage = index;
		lightboxOpen = true;
	}
	
	function closeLightbox() {
		lightboxOpen = false;
	}
	
	function nextImage() {
		currentImage = (currentImage + 1) % images.length;
	}
	
	function prevImage() {
		currentImage = (currentImage - 1 + images.length) % images.length;
	}
	
	async function handleImageUpload(index, file) {
		if (!pageId) {
			console.error('Missing pageId');
			return;
		}
		
		// Step 1: Upload image to Strapi
		const uploadFormData = new FormData();
		uploadFormData.append('image', file);
		uploadFormData.append('userId', 'temp');
		uploadFormData.append('pageName', 'gallery');
		
		const uploadResponse = await fetch('/api/upload-image', {
			method: 'POST',
			body: uploadFormData
		});
		
		if (!uploadResponse.ok) {
			throw new Error('Failed to upload image');
		}
		
		const uploadResult = await uploadResponse.json();
		const imageUrl = uploadResult.url;
		
		// Step 2: Update local state
		images[index] = imageUrl;
		images = [...images]; // Trigger reactivity
		
		// Step 3: Update page in Strapi
		const updateResponse = await fetch('/api/update-page', {
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify({
				pageId,
				field: `sections.${sectionIndex}.data.images`,
				value: images
			})
		});
		
		if (updateResponse.ok) {
			showNotification('✅ התמונה הוחלפה בהצלחה');
		} else {
			throw new Error('Failed to update page');
		}
	}
	
	async function addImage() {
		const input = document.createElement('input');
		input.type = 'file';
		input.accept = 'image/*';
		input.onchange = async (e) => {
			const file = e.target?.files?.[0];
			if (!file) return;
			
			// Step 1: Upload image
			const uploadFormData = new FormData();
			uploadFormData.append('image', file);
			uploadFormData.append('userId', 'temp');
			uploadFormData.append('pageName', 'gallery');
			
			const uploadResponse = await fetch('/api/upload-image', {
				method: 'POST',
				body: uploadFormData
			});
			
			if (!uploadResponse.ok) return;
			
			const uploadResult = await uploadResponse.json();
			const imageUrl = uploadResult.url;
			
			// Step 2: Update local state
			images = [...images, imageUrl];
			
			// Step 3: Update page in Strapi
			const updateResponse = await fetch('/api/update-page', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({
					pageId,
					field: `sections.${sectionIndex}.data.images`,
					value: images
				})
			});
			
			if (updateResponse.ok) {
				showNotification('✅ התמונה נוספה בהצלחה');
			}
		};
		input.click();
	}
	
	async function deleteImage(index) {
		if (!confirm('האם למחוק את התמונה?')) return;
		
		// Update local state
		images = images.filter((_, i) => i !== index);
		
		// Update page in Strapi
		const response = await fetch('/api/update-page', {
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify({
				pageId,
				field: `sections.${sectionIndex}.data.images`,
				value: images
			})
		});
		
		if (response.ok) {
			showNotification('✅ התמונה נמחקה בהצלחה');
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

<section class="gallery-section">
	<div class="container">
		<h2 class="section-title">{data.title || '🖼️ גלריית תמונות'}</h2>
		{#if data.subtitle}
			<p class="section-subtitle">{data.subtitle}</p>
		{/if}
		
		<div class="gallery-grid">
			{#each images as image, index}
				<div 
					class="gallery-item"
					style="--delay: {index * 0.1}s"
				>
					{#if editable && pageId && (sectionIndex !== null && sectionIndex !== undefined)}
						<EditableImage 
							src={image} 
							alt="תמונה {index + 1}"
							onUpload={(file) => handleImageUpload(index, file)}
							className="gallery-image"
						/>
						<button 
							class="delete-image-btn"
							onclick={() => deleteImage(index)}
							type="button"
							title="מחק תמונה"
						>
							×
						</button>
						<button 
							class="view-image-btn"
							onclick={() => openLightbox(index)}
							type="button"
							title="הצג בגדול"
						>
							<svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
								<circle cx="11" cy="11" r="8"></circle>
								<path d="m21 21-4.35-4.35"></path>
							</svg>
						</button>
					{:else}
						<button 
							class="gallery-image-btn"
							onclick={() => openLightbox(index)}
							type="button"
						>
							<img src={image} alt="תמונה {index + 1}" loading="lazy" />
							<div class="gallery-overlay">
								<svg class="zoom-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor">
									<circle cx="11" cy="11" r="8"></circle>
									<path d="m21 21-4.35-4.35"></path>
									<line x1="11" y1="8" x2="11" y2="14"></line>
									<line x1="8" y1="11" x2="14" y2="11"></line>
								</svg>
							</div>
						</button>
					{/if}
				</div>
			{/each}
			
			{#if editable && pageId && (sectionIndex !== null && sectionIndex !== undefined)}
				<button class="add-image-btn" onclick={addImage} type="button">
					<svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
						<line x1="12" y1="5" x2="12" y2="19"></line>
						<line x1="5" y1="12" x2="19" y2="12"></line>
					</svg>
					<p>הוסף תמונה</p>
				</button>
			{/if}
		</div>
	</div>
</section>

{#if lightboxOpen}
	<div class="lightbox" onclick={closeLightbox}>
		<button class="lightbox-close" onclick={closeLightbox}>×</button>
		<button class="lightbox-nav prev" onclick={(e) => { e.stopPropagation(); prevImage(); }}>❮</button>
		<button class="lightbox-nav next" onclick={(e) => { e.stopPropagation(); nextImage(); }}>❯</button>
		<img 
			src={data.images[currentImage]} 
			alt="תמונה {currentImage + 1}"
			onclick={(e) => e.stopPropagation()}
		/>
		<div class="lightbox-counter">{currentImage + 1} / {data.images.length}</div>
	</div>
{/if}

<style>
	.gallery-section {
		padding: 5rem 0;
		background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
		position: relative;
		overflow: hidden;
	}
	
	.gallery-section::before {
		content: '';
		position: absolute;
		top: -50%;
		right: -20%;
		width: 800px;
		height: 800px;
		background: radial-gradient(circle, rgba(255, 255, 255, 0.1) 0%, transparent 70%);
		border-radius: 50%;
		animation: float 20s ease-in-out infinite;
	}
	
	@keyframes float {
		0%, 100% { transform: translateY(0) rotate(0deg); }
		50% { transform: translateY(-30px) rotate(5deg); }
	}
	
	.container {
		max-width: 1400px;
		margin: 0 auto;
		padding: 0 2rem;
		position: relative;
		z-index: 1;
	}
	
	.section-title {
		text-align: center;
		font-size: 3rem;
		font-weight: 800;
		color: white;
		margin-bottom: 1rem;
		text-shadow: 0 4px 20px rgba(0, 0, 0, 0.3);
		animation: fadeInUp 0.8s ease-out;
	}
	
	.section-subtitle {
		text-align: center;
		font-size: 1.3rem;
		color: rgba(255, 255, 255, 0.9);
		margin-bottom: 4rem;
		animation: fadeInUp 0.8s ease-out 0.2s backwards;
	}
	
	.gallery-grid {
		display: grid;
		grid-template-columns: repeat(auto-fit, minmax(350px, 1fr));
		gap: 2rem;
		padding: 1rem 0;
	}
	
	.gallery-item {
		position: relative;
		aspect-ratio: 4/3;
		border-radius: 24px;
		overflow: hidden;
		box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
		transition: all 0.5s cubic-bezier(0.4, 0, 0.2, 1);
		animation: fadeInUp 0.6s ease-out backwards;
		animation-delay: var(--delay);
	}
	
	.gallery-item:hover {
		transform: translateY(-15px) scale(1.03);
		box-shadow: 0 30px 80px rgba(0, 0, 0, 0.4);
	}
	
	.gallery-image-btn {
		width: 100%;
		height: 100%;
		border: none;
		padding: 0;
		background: none;
		cursor: pointer;
	}
	
	.gallery-image-btn img {
		width: 100%;
		height: 100%;
		object-fit: cover;
		transition: transform 0.5s cubic-bezier(0.4, 0, 0.2, 1);
	}
	
	.gallery-image-btn:hover img {
		transform: scale(1.1) rotate(2deg);
	}
	
	:global(.gallery-item .gallery-image) {
		width: 100%;
		height: 100%;
	}
	
	:global(.gallery-item .gallery-image img) {
		border-radius: 24px;
	}
	
	.delete-image-btn {
		position: absolute;
		top: 10px;
		right: 10px;
		width: 36px;
		height: 36px;
		border-radius: 50%;
		border: 2px solid white;
		background: rgba(239, 68, 68, 0.9);
		color: white;
		font-size: 24px;
		font-weight: bold;
		cursor: pointer;
		display: flex;
		align-items: center;
		justify-content: center;
		opacity: 0;
		transition: all 0.3s ease;
		z-index: 10;
	}
	
	.gallery-item:hover .delete-image-btn {
		opacity: 1;
	}
	
	.delete-image-btn:hover {
		background: rgba(239, 68, 68, 1);
		transform: scale(1.1);
	}
	
	.view-image-btn {
		position: absolute;
		top: 10px;
		left: 10px;
		width: 36px;
		height: 36px;
		border-radius: 50%;
		border: 2px solid white;
		background: rgba(102, 126, 234, 0.9);
		color: white;
		cursor: pointer;
		display: flex;
		align-items: center;
		justify-content: center;
		opacity: 0;
		transition: all 0.3s ease;
		z-index: 10;
		padding: 0;
	}
	
	.gallery-item:hover .view-image-btn {
		opacity: 1;
	}
	
	.view-image-btn:hover {
		background: rgba(102, 126, 234, 1);
		transform: scale(1.1);
	}
	
	.view-image-btn svg {
		width: 20px;
		height: 20px;
		stroke-width: 2;
	}
	
	.add-image-btn {
		aspect-ratio: 4/3;
		border-radius: 24px;
		border: 3px dashed rgba(255, 255, 255, 0.5);
		background: rgba(255, 255, 255, 0.1);
		backdrop-filter: blur(10px);
		color: white;
		cursor: pointer;
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		gap: 1rem;
		transition: all 0.3s ease;
		animation: fadeInUp 0.6s ease-out backwards;
		animation-delay: calc(var(--delay) + 0.1s);
	}
	
	.add-image-btn:hover {
		background: rgba(255, 255, 255, 0.2);
		border-color: white;
		transform: translateY(-5px);
	}
	
	.add-image-btn svg {
		width: 48px;
		height: 48px;
		stroke-width: 2;
	}
	
	.add-image-btn p {
		margin: 0;
		font-size: 1.2rem;
		font-weight: 600;
	}
	
	.gallery-overlay {
		position: absolute;
		inset: 0;
		background: linear-gradient(135deg, rgba(102, 126, 234, 0.9) 0%, rgba(118, 75, 162, 0.9) 100%);
		display: flex;
		align-items: center;
		justify-content: center;
		opacity: 0;
		transition: opacity 0.4s ease;
	}
	
	.gallery-item:hover .gallery-overlay {
		opacity: 1;
	}
	
	.zoom-icon {
		width: 60px;
		height: 60px;
		color: white;
		stroke-width: 2;
		filter: drop-shadow(0 4px 10px rgba(0, 0, 0, 0.3));
		animation: pulse 2s ease-in-out infinite;
	}
	
	@keyframes pulse {
		0%, 100% { transform: scale(1); }
		50% { transform: scale(1.1); }
	}
	
	/* Lightbox */
	.lightbox {
		position: fixed;
		inset: 0;
		background: rgba(0, 0, 0, 0.95);
		backdrop-filter: blur(20px);
		display: flex;
		align-items: center;
		justify-content: center;
		z-index: 10000;
		animation: fadeIn 0.3s ease;
		padding: 2rem;
	}
	
	.lightbox img {
		max-width: 90%;
		max-height: 90%;
		object-fit: contain;
		border-radius: 20px;
		box-shadow: 0 0 100px rgba(102, 126, 234, 0.5);
		animation: zoomIn 0.4s cubic-bezier(0.4, 0, 0.2, 1);
	}
	
	.lightbox-close {
		position: absolute;
		top: 2rem;
		right: 2rem;
		width: 60px;
		height: 60px;
		border-radius: 50%;
		border: 2px solid rgba(255, 255, 255, 0.3);
		background: rgba(255, 255, 255, 0.1);
		backdrop-filter: blur(10px);
		color: white;
		font-size: 2rem;
		cursor: pointer;
		transition: all 0.3s ease;
		display: flex;
		align-items: center;
		justify-content: center;
	}
	
	.lightbox-close:hover {
		background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
		transform: rotate(90deg) scale(1.1);
		border-color: white;
	}
	
	.lightbox-nav {
		position: absolute;
		top: 50%;
		transform: translateY(-50%);
		width: 60px;
		height: 60px;
		border-radius: 50%;
		border: 2px solid rgba(255, 255, 255, 0.3);
		background: rgba(255, 255, 255, 0.1);
		backdrop-filter: blur(10px);
		color: white;
		font-size: 1.5rem;
		cursor: pointer;
		transition: all 0.3s ease;
	}
	
	.lightbox-nav:hover {
		background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
		transform: translateY(-50%) scale(1.2);
		border-color: white;
	}
	
	.lightbox-nav.prev { left: 2rem; }
	.lightbox-nav.next { right: 2rem; }
	
	.lightbox-counter {
		position: absolute;
		bottom: 2rem;
		left: 50%;
		transform: translateX(-50%);
		padding: 0.75rem 1.5rem;
		background: rgba(255, 255, 255, 0.1);
		backdrop-filter: blur(10px);
		border-radius: 50px;
		color: white;
		font-size: 1.1rem;
		font-weight: 600;
		border: 1px solid rgba(255, 255, 255, 0.2);
	}
	
	@keyframes fadeIn {
		from { opacity: 0; }
		to { opacity: 1; }
	}
	
	@keyframes fadeInUp {
		from {
			opacity: 0;
			transform: translateY(30px);
		}
		to {
			opacity: 1;
			transform: translateY(0);
		}
	}
	
	@keyframes zoomIn {
		from {
			opacity: 0;
			transform: scale(0.8);
		}
		to {
			opacity: 1;
			transform: scale(1);
		}
	}
	
	@media (max-width: 768px) {
		.gallery-grid {
			grid-template-columns: 1fr;
			gap: 1.5rem;
		}
		
		.section-title {
			font-size: 2rem;
		}
		
		.lightbox-nav {
			width: 50px;
			height: 50px;
		}
		
		.lightbox-nav.prev { left: 1rem; }
		.lightbox-nav.next { right: 1rem; }
	}
</style>
