<script>
	import { onMount, onDestroy, getContext } from 'svelte';
	import EditableText from '$lib/components/editing/EditableText.svelte';
	import EditableImage from '$lib/components/editing/EditableImage.svelte';
	
	let { data, sectionIndex = 0, editable = true } = $props();
	
	const editMode = getContext('editMode');
	const pageId = getContext('pageId');
	const saveField = getContext('saveField');
	
	let servicesContainer;
	let autoScrollInterval;
	
	let services = $state(data.services || []);
	
	onMount(() => {
		if (!editable && servicesContainer && services.length > 1) {
			// Auto-scroll every 3 seconds
			autoScrollInterval = setInterval(() => {
				const scrollAmount = servicesContainer.scrollLeft + 216; // width (200) + gap (16)
				const maxScroll = servicesContainer.scrollWidth - servicesContainer.clientWidth;
				
				if (scrollAmount >= maxScroll) {
					// Reset to start
					servicesContainer.scrollTo({ left: 0, behavior: 'smooth' });
				} else {
					servicesContainer.scrollBy({ left: 216, behavior: 'smooth' });
				}
			}, 3000);
		}
	});
	
	onDestroy(() => {
		if (autoScrollInterval) {
			clearInterval(autoScrollInterval);
		}
	});
	
	async function saveServiceField(index, field, value) {
		services = services.map((s, i) => 
			i === index ? { ...s, [field]: value } : s
		);
		await saveField(`sections.${sectionIndex}.data.services`, services);
	}
	
	async function handleImageUpload(index, file) {
		const uploadFormData = new FormData();
		uploadFormData.append('image', file);
		uploadFormData.append('userId', 'temp');
		uploadFormData.append('pageName', 'services');
		
		const uploadResponse = await fetch('/api/upload-image', {
			method: 'POST',
			body: uploadFormData
		});
		
		if (!uploadResponse.ok) {
			throw new Error('Failed to upload image');
		}
		
		const uploadResult = await uploadResponse.json();
		const imageUrl = uploadResult.url;
		
		services = services.map((s, i) => 
			i === index ? { ...s, icon: imageUrl } : s
		);
		
		await saveField(`sections.${sectionIndex}.data.services`, services);
		
		return imageUrl;
	}
	
	async function addService() {
		services = [...services, {
			icon: '',
			title: 'שירות חדש',
			description: 'תיאור השירות',
			price: 'לפי בקשה'
		}];
		await saveField(`sections.${sectionIndex}.data.services`, services);
	}
	
	async function deleteService(index) {
		if (!confirm('האם למחוק את השירות?')) return;
		services = services.filter((_, i) => i !== index);
		await saveField(`sections.${sectionIndex}.data.services`, services);
	}
</script>

<section class="services-section">
	<div class="container">
		<EditableText
			value={data.title || 'השירותים שלנו'}
			onsave={(value) => saveField(`sections.${sectionIndex}.data.title`, value)}
			class="section-title"
			tag="h2"
		/>
		{#if data.subtitle || editMode}
			<EditableText
				value={data.subtitle || 'תת כותרת'}
				onsave={(value) => saveField(`sections.${sectionIndex}.data.subtitle`, value)}
				class="section-subtitle"
				tag="p"
			/>
		{/if}
		
		<div class="services-grid" bind:this={servicesContainer}>
			{#each services as service, index}
				<div class="service-card" style="--delay: {index * 0.1}s">
					{#if editMode && typeof editMode === 'function' ? editMode() : editMode}
						<button class="delete-btn" onclick={() => deleteService(index)} title="מחק שירות">
							🗑️
						</button>
					{/if}
					
					<div class="service-icon">
						{#if service.icon?.startsWith('http')}
							<EditableImage
								src={service.icon}
								alt={service.title}
								onUpload={(file) => handleImageUpload(index, file)}
								className="icon-image"
							/>
						{:else}
							<EditableText
								value={service.icon || ''}
								onsave={(value) => saveServiceField(index, 'icon', value)}
								class="icon-emoji"
								tag="div"
							/>
						{/if}
					</div>
					
					<EditableText
						value={service.title}
						onsave={(value) => saveServiceField(index, 'title', value)}
						class="service-title"
						tag="h3"
					/>
					
					<EditableText
						value={service.description}
						onsave={(value) => saveServiceField(index, 'description', value)}
						class="service-description"
						tag="p"
					/>
					
					<div class="service-price">
						<EditableText
							value={service.price || 'לפי בקשה'}
							onsave={(value) => saveServiceField(index, 'price', value)}
							class="price-text"
							tag="div"
						/>
					</div>
				</div>
			{/each}
			
			{#if editMode && typeof editMode === 'function' ? editMode() : editMode}
				<button class="add-service-btn" onclick={addService}>
					<div class="add-icon">➕</div>
					<div class="add-text">הוסף שירות</div>
				</button>
			{/if}
		</div>
	</div>
</section>

<style>
	.services-section {
		padding: 3rem 0;
		background-color: transparent !important;
		direction: rtl;
	}
	
	.container {
		max-width: 1400px;
		margin: 0 auto;
		padding: 0 2rem;
	}
	
	.section-title {
		text-align: center;
		font-size: 3rem;
		font-weight: 800;
		background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
		-webkit-background-clip: text;
		-webkit-text-fill-color: transparent;
		background-clip: text;
		margin-bottom: 1rem;
	}
	
	.section-subtitle {
		text-align: center;
		font-size: 1.3rem;
		color: #6b7280;
		margin-bottom: 4rem;
	}
	
	.services-grid {
		display: flex;
		justify-content: center;
		gap: 1rem;
		padding: 0.5rem 0;
		overflow-x: auto;
		-webkit-overflow-scrolling: touch;
		scrollbar-width: thin;
		scrollbar-color: rgba(102, 126, 234, 0.3) transparent;
	}
	
	.services-grid::-webkit-scrollbar {
		height: 8px;
	}
	
	.services-grid::-webkit-scrollbar-track {
		background: rgba(102, 126, 234, 0.1);
		border-radius: 10px;
	}
	
	.services-grid::-webkit-scrollbar-thumb {
		background: rgba(102, 126, 234, 0.3);
		border-radius: 10px;
	}
	
	.services-grid::-webkit-scrollbar-thumb:hover {
		background: rgba(102, 126, 234, 0.5);
	}
	
	.service-card {
		flex-shrink: 0;
		width: 200px;
		background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
		padding: 1.5rem;
		border-radius: 16px;
		text-align: center;
		transition: all 0.4s ease;
		position: relative;
		animation: fadeInUp 0.6s ease-out backwards;
		animation-delay: var(--delay);
		border: 3px solid transparent;
	}
	
	.service-card:hover {
		transform: translateY(-10px);
		border-color: #667eea;
		box-shadow: 0 20px 60px rgba(102, 126, 234, 0.3);
	}
	
	.delete-btn {
		position: absolute;
		top: 10px;
		left: 10px;
		z-index: 10;
		background: rgba(239, 68, 68, 0.95);
		border: none;
		border-radius: 50%;
		width: 40px;
		height: 40px;
		display: flex;
		align-items: center;
		justify-content: center;
		cursor: pointer;
		font-size: 1.2rem;
		transition: all 0.3s ease;
		box-shadow: 0 4px 15px rgba(239, 68, 68, 0.3);
	}
	
	.delete-btn:hover {
		transform: scale(1.1);
		background: rgba(220, 38, 38, 1);
	}
	
	.service-icon {
		width: 60px;
		height: 60px;
		margin: 0 auto 1rem;
		background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
		border-radius: 12px;
		display: flex;
		align-items: center;
		justify-content: center;
		box-shadow: 0 10px 30px rgba(102, 126, 234, 0.3);
	}
	
	.icon-emoji {
		font-size: 2rem;
		filter: drop-shadow(0 4px 10px rgba(0, 0, 0, 0.2));
	}
	
	.icon-image {
		width: 100%;
		height: 100%;
		object-fit: cover;
		border-radius: 12px;
	}
	
	.service-title {
		font-size: 1rem;
		font-weight: 700;
		color: #1f2937;
		margin-bottom: 0.5rem;
	}
	
	.service-description {
		font-size: 0.85rem;
		color: #6b7280;
		line-height: 1.4;
		margin-bottom: 0.75rem;
	}
	
	.service-price {
		padding-top: 0.75rem;
		border-top: 2px solid rgba(102, 126, 234, 0.2);
	}
	
	.price-text {
		font-size: 1rem;
		font-weight: 800;
		background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
		-webkit-background-clip: text;
		-webkit-text-fill-color: transparent;
		background-clip: text;
	}
	
	.add-service-btn {
		flex-shrink: 0;
		width: 200px;
		background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
		border: 3px dashed #667eea;
		border-radius: 16px;
		padding: 1.5rem;
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		gap: 0.75rem;
		cursor: pointer;
		transition: all 0.3s ease;
	}
	
	.add-service-btn:hover {
		transform: translateY(-10px);
		border-color: #764ba2;
		box-shadow: 0 20px 60px rgba(102, 126, 234, 0.3);
	}
	
	.add-icon {
		font-size: 2.5rem;
		background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
		-webkit-background-clip: text;
		-webkit-text-fill-color: transparent;
		background-clip: text;
	}
	
	.add-text {
		font-size: 1rem;
		font-weight: 700;
		background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
		-webkit-background-clip: text;
		-webkit-text-fill-color: transparent;
		background-clip: text;
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
	
	@media (max-width: 768px) {
		.section-title {
			font-size: 2rem;
		}
		
		.service-card,
		.add-service-btn {
			width: 180px;
		}
	}
</style>
