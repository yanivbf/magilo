<script>
	import { getContext } from 'svelte';
	import EditableText from '$lib/components/editing/EditableText.svelte';
	import EditableImage from '$lib/components/editing/EditableImage.svelte';
	
	let { data, sectionIndex = 0 } = $props();
	
	const editMode = getContext('editMode');
	const pageId = getContext('pageId');
	const saveField = getContext('saveField');
	
	let features = $state(data.features || []);
	
	async function saveFeatureField(index, field, value) {
		features = features.map((f, i) => 
			i === index ? { ...f, [field]: value } : f
		);
		await saveField(`sections.${sectionIndex}.data.features`, features);
	}
	
	async function handleImageUpload(file) {
		const formData = new FormData();
		formData.append('image', file);
		formData.append('pageId', String(pageId));
		formData.append('sectionIndex', String(sectionIndex));
		formData.append('action', 'replace');
		
		const response = await fetch('/api/upload-section-image', {
			method: 'POST',
			body: formData
		});
		
		if (!response.ok) throw new Error('Failed to upload');
		
		const result = await response.json();
		await saveField(`sections.${sectionIndex}.data.image`, result.imageUrl);
		return result.imageUrl;
	}
	
	async function addFeature() {
		features = [...features, { icon: '✨', title: 'תכונה חדשה', text: 'תיאור...' }];
		await saveField(`sections.${sectionIndex}.data.features`, features);
	}
	
	async function deleteFeature(index) {
		if (!confirm('האם למחוק?')) return;
		features = features.filter((_, i) => i !== index);
		await saveField(`sections.${sectionIndex}.data.features`, features);
	}
</script>

<section class="about-section">
	<div class="container">
		<div class="about-content">
			<div class="about-text">
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
				
				{#if features.length > 0 || editMode}
					<div class="features-grid">
						{#each features as feature, index}
							<div class="feature-item">
								{#if editMode}
									<button class="delete-btn" onclick={() => deleteFeature(index)}>🗑️</button>
								{/if}
								
								<EditableText
									value={feature.icon}
									onsave={(value) => saveFeatureField(index, 'icon', value)}
									class="feature-icon"
									tag="div"
								/>
								
								<div class="feature-content">
									<EditableText
										value={feature.title}
										onsave={(value) => saveFeatureField(index, 'title', value)}
										class="feature-title"
										tag="h3"
									/>
									<EditableText
										value={feature.text}
										onsave={(value) => saveFeatureField(index, 'text', value)}
										class="feature-text"
										tag="p"
									/>
								</div>
							</div>
						{/each}
						
						{#if editMode}
							<button class="add-feature-btn" onclick={addFeature}>
								➕ הוסף תכונה
							</button>
						{/if}
					</div>
				{/if}
			</div>
			
			{#if data.image || editMode}
				<div class="about-image">
					<EditableImage
						src={data.image || 'https://via.placeholder.com/600x400?text=תמונה'}
						alt="אודותינו"
						onUpload={handleImageUpload}
						className="main-image"
					/>
				</div>
			{/if}
		</div>
	</div>
</section>

<style>
	.about-section {
		padding: 5rem 0;
		background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
		direction: rtl;
	}
	
	.container {
		max-width: 1400px;
		margin: 0 auto;
		padding: 0 2rem;
	}
	
	.about-content {
		display: grid;
		grid-template-columns: 1fr 1fr;
		gap: 4rem;
		align-items: center;
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
		margin-bottom: 3rem;
	}
	
	.features-grid {
		display: grid;
		gap: 1.5rem;
	}
	
	.feature-item {
		display: flex;
		gap: 1.5rem;
		padding: 1.5rem;
		background: white;
		border-radius: 16px;
		transition: all 0.3s ease;
		position: relative;
	}
	
	.feature-item:hover {
		transform: translateX(-10px);
		box-shadow: 0 10px 30px rgba(102, 126, 234, 0.15);
	}
	
	.delete-btn {
		position: absolute;
		top: 5px;
		left: 5px;
		background: rgba(239, 68, 68, 0.9);
		border: none;
		border-radius: 50%;
		width: 30px;
		height: 30px;
		cursor: pointer;
		font-size: 0.9rem;
	}
	
	.feature-icon {
		font-size: 2.5rem;
		width: 60px;
		height: 60px;
		display: flex;
		align-items: center;
		justify-content: center;
		background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
		border-radius: 12px;
		flex-shrink: 0;
	}
	
	.feature-content {
		flex: 1;
	}
	
	.feature-title {
		font-size: 1.2rem;
		font-weight: 700;
		color: #1f2937;
		margin-bottom: 0.5rem;
	}
	
	.feature-text {
		font-size: 1rem;
		color: #6b7280;
		line-height: 1.6;
	}
	
	.add-feature-btn {
		background: white;
		border: 3px dashed #667eea;
		border-radius: 16px;
		padding: 1.5rem;
		cursor: pointer;
		text-align: center;
		font-size: 1.1rem;
		font-weight: 700;
		color: #667eea;
	}
	
	.about-image {
		position: relative;
	}
	
	.main-image {
		width: 100%;
		height: auto;
		border-radius: 24px;
		box-shadow: 0 20px 60px rgba(0, 0, 0, 0.15);
	}
	
	@media (max-width: 1024px) {
		.about-content {
			grid-template-columns: 1fr;
		}
		
		.about-image {
			order: -1;
		}
	}
</style>
