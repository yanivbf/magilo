<script>
	import { getContext } from 'svelte';
	import EditableText from '$lib/components/editing/EditableText.svelte';
	import EditableImage from '$lib/components/editing/EditableImage.svelte';
	
	let { data, sectionIndex = 0 } = $props();
	
	const editModeGetter = getContext('editMode');
	const pageId = getContext('pageId');
	const saveField = getContext('saveField');
	
	// Get the actual editMode value (it's a function that returns the value)
	let editMode = $derived(typeof editModeGetter === 'function' ? editModeGetter() : editModeGetter);
	
	// Track the current image - start with data.image but allow updates
	let currentImage = $state(data.image || '');
	
	// Sync with data.image when it changes (e.g., on page reload)
	$effect(() => {
		if (data.image && data.image !== currentImage) {
			currentImage = data.image;
		}
	});
	
	function showNotification(message) {
		const notification = document.createElement('div');
		notification.className = 'save-notification';
		notification.textContent = message;
		document.body.appendChild(notification);
		
		setTimeout(() => {
			notification.classList.add('show');
		}, 10);
		
		setTimeout(() => {
			notification.classList.remove('show');
			setTimeout(() => {
				notification.remove();
			}, 300);
		}, 2000);
	}
	
	async function handleImageUpload(file) {
		try {
			showNotification('⏳ מעלה תמונה...');
			
			const formData = new FormData();
			formData.append('image', file);
			formData.append('userId', 'temp');
			formData.append('pageName', 'about-section');
			
			const response = await fetch('/api/upload-image', {
				method: 'POST',
				body: formData
			});
			
			if (!response.ok) {
				const error = await response.text();
				console.error('Upload failed:', error);
				showNotification('❌ שגיאה בהעלאת התמונה');
				throw new Error('Failed to upload');
			}
			
			const result = await response.json();
			console.log('✅ Image uploaded:', result.url);
			console.log('📍 Section index:', sectionIndex);
			console.log('📍 Field path:', `sections.${sectionIndex}.data.image`);
			
			// Save the image URL to the section data in Strapi
			console.log('💾 Saving image URL to section...');
			await saveField(`sections.${sectionIndex}.data.image`, result.url);
			
			// If we get here, save was successful (saveField throws on error)
			console.log('✅ Image URL saved successfully to Strapi');
			
			// Update both the data object and local state
			data.image = result.url;
			currentImage = result.url;
			
			// Note: showNotification and reload will be handled by saveField
			
			// Log the current state
			console.log('📊 Current state after save:');
			console.log('  - data.image:', data.image);
			console.log('  - currentImage:', currentImage);
			
			return result.url;
		} catch (error) {
			console.error('❌ Error uploading image:', error);
			showNotification('❌ שגיאה בהעלאת התמונה');
			throw error;
		}
	}
</script>

<section class="about-section">
	<div class="container">
		<div class="about-content">
			<div class="about-text">
				{#if editMode}
					<EditableText
						value={data.title || 'ℹ️ אודותינו'}
						onsave={(value) => saveField(`sections.${sectionIndex}.data.title`, value)}
						class="section-title"
						tag="h2"
					/>
					
					<EditableText
						value={data.content || 'תוכן...'}
						onsave={(value) => saveField(`sections.${sectionIndex}.data.content`, value)}
						class="content-text"
						tag="div"
					/>
				{:else}
					<h2 class="section-title">{data.title || 'ℹ️ אודותינו'}</h2>
					<div class="content-text">{data.content || 'תוכן...'}</div>
				{/if}
			</div>
			
			{#if currentImage || editMode}
				<div class="about-image">
					{#if editMode}
						<EditableImage
							src={currentImage || 'https://images.unsplash.com/photo-1557804506-669a67965ba0?q=80&w=600'}
							alt="אודותינו"
							onUpload={handleImageUpload}
							className="main-image"
						/>
					{:else}
						<img 
							src={currentImage || 'https://images.unsplash.com/photo-1557804506-669a67965ba0?q=80&w=600'} 
							alt="אודותינו"
							class="main-image"
						/>
					{/if}
				</div>
			{/if}
		</div>
	</div>
</section>

<style>
	.about-section {
		padding: 3rem 0;
		background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
		direction: rtl;
	}
	
	.container {
		max-width: 1200px;
		margin: 0 auto;
		padding: 0 1.5rem;
	}
	
	.about-content {
		display: grid;
		grid-template-columns: 1.5fr 1fr;
		gap: 3rem;
		align-items: start;
	}
	
	.section-title {
		font-size: 3rem;
		font-weight: 800;
		background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
		-webkit-background-clip: text;
		-webkit-text-fill-color: transparent;
		margin-bottom: 2rem;
	}
	
	.content-text {
		font-size: 1.15rem;
		line-height: 1.9;
		color: #374151;
	}
	
	.about-image {
		position: relative;
		max-width: 400px;
	}
	
	.main-image {
		width: 100%;
		height: auto;
		border-radius: 16px;
		box-shadow: 0 10px 30px rgba(0, 0, 0, 0.15);
	}
	
	@media (max-width: 1024px) {
		.about-content {
			grid-template-columns: 1fr;
		}
		
		.about-image {
			order: -1;
		}
	}
	
	/* Save Notification */
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
	}
	
	:global(.save-notification.show) {
		opacity: 1;
		transform: translateX(-50%) translateY(0);
	}
</style>
