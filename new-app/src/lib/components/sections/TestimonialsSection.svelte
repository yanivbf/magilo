<script>
	import { getContext } from 'svelte';
	import EditableText from '$lib/components/editing/EditableText.svelte';
	import EditableImage from '$lib/components/editing/EditableImage.svelte';
	
	/** @type {{ data: { items: Array<{name: string, role: string, text: string, rating: number, avatar?: string}>, title?: string, subtitle?: string }, sectionIndex?: number }} */
	let { data, sectionIndex = 0 } = $props();
	
	const editMode = getContext('editMode');
	const pageId = getContext('pageId');
	const saveField = getContext('saveField');
	
	let items = $state(data.items || []);
	
	/**
	 * Save testimonial field
	 */
	async function saveTestimonialField(index, field, value) {
		items = items.map((item, i) => 
			i === index ? { ...item, [field]: value } : item
		);
		await saveField(`sections.${sectionIndex}.data.items`, items);
	}
	
	/**
	 * Handle avatar upload
	 */
	async function handleAvatarUpload(index, file) {
		// Step 1: Upload image to Strapi
		const uploadFormData = new FormData();
		uploadFormData.append('image', file);
		uploadFormData.append('userId', 'temp');
		uploadFormData.append('pageName', 'testimonials');
		
		const uploadResponse = await fetch('/api/upload-image', {
			method: 'POST',
			body: uploadFormData
		});
		
		if (!uploadResponse.ok) {
			throw new Error('Failed to upload image');
		}
		
		const uploadResult = await uploadResponse.json();
		const imageUrl = uploadResult.url;
		
		// Step 2: Update the avatar locally
		items = items.map((item, i) => 
			i === index ? { ...item, avatar: imageUrl } : item
		);
		
		// Step 3: Save to Strapi
		await saveField(`sections.${sectionIndex}.data.items`, items);
		
		return imageUrl;
	}
	
	/**
	 * Add new testimonial
	 */
	async function addTestimonial() {
		const newItem = {
			name: 'שם הלקוח',
			role: 'תפקיד',
			text: 'המלצה מעולה...',
			rating: 5
		};
		
		items = [...items, newItem];
		await saveField(`sections.${sectionIndex}.data.items`, items);
	}
	
	/**
	 * Delete testimonial
	 */
	async function deleteTestimonial(index) {
		if (!confirm('האם למחוק את ההמלצה?')) return;
		
		items = items.filter((_, i) => i !== index);
		await saveField(`sections.${sectionIndex}.data.items`, items);
	}
</script>

<section class="testimonials-section">
	<div class="container">
		<EditableText
			value={data.title || '⭐ מה אומרים עלינו'}
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
		
		<div class="testimonials-grid">
			{#each items as item, index}
				<div class="testimonial-card" style="--delay: {index * 0.15}s">
					{#if editMode}
						<button class="delete-btn" onclick={() => deleteTestimonial(index)} title="מחק המלצה">
							🗑️
						</button>
					{/if}
					
					<div class="quote-icon">
						<svg viewBox="0 0 24 24" fill="currentColor">
							<path d="M14.017 21v-7.391c0-5.704 3.731-9.57 8.983-10.609l.995 2.151c-2.432.917-3.995 3.638-3.995 5.849h4v10h-9.983zm-14.017 0v-7.391c0-5.704 3.748-9.57 9-10.609l.996 2.151c-2.433.917-3.996 3.638-3.996 5.849h3.983v10h-9.983z"/>
						</svg>
					</div>
					
					<div class="rating">
						{#each Array(item.rating || 5) as _, i}
							<span class="star">★</span>
						{/each}
					</div>
					
					<EditableText
						value={item.text}
						onsave={(value) => saveTestimonialField(index, 'text', value)}
						class="testimonial-text"
						tag="p"
					/>
					
					<div class="testimonial-author">
						<div class="avatar">
							<EditableImage
								src={item.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(item.name)}&size=200&background=667eea&color=fff&bold=true`}
								alt={item.name}
								onUpload={(file) => handleAvatarUpload(index, file)}
								className="avatar-img"
							/>
						</div>
						<div class="author-info">
							<EditableText
								value={item.name}
								onsave={(value) => saveTestimonialField(index, 'name', value)}
								class="author-name"
								tag="div"
							/>
							<EditableText
								value={item.role}
								onsave={(value) => saveTestimonialField(index, 'role', value)}
								class="author-role"
								tag="div"
							/>
						</div>
					</div>
				</div>
			{/each}
			
			{#if editMode}
				<button class="add-testimonial-btn" onclick={addTestimonial}>
					<div class="add-icon">➕</div>
					<div class="add-text">הוסף המלצה</div>
				</button>
			{/if}
		</div>
	</div>
</section>

<style>
	.testimonials-section {
		padding: 3rem 0;
		background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
		position: relative;
		overflow: hidden;
		direction: rtl;
	}
	
	.container {
		max-width: 1200px;
		margin: 0 auto;
		padding: 0 1.5rem;
		position: relative;
		z-index: 1;
	}
	
	.section-title {
		text-align: center;
		font-size: 3rem;
		font-weight: 800;
		color: white;
		margin-bottom: 0.75rem;
		text-shadow: 0 4px 20px rgba(0, 0, 0, 0.3);
	}
	
	.section-subtitle {
		text-align: center;
		font-size: 1.1rem;
		color: rgba(255, 255, 255, 0.9);
		margin-bottom: 2.5rem;
	}
	
	.testimonials-grid {
		display: grid;
		grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
		gap: 1.25rem;
	}
	
	.testimonial-card {
		background: rgba(255, 255, 255, 0.95);
		backdrop-filter: blur(10px);
		padding: 1.5rem;
		border-radius: 16px;
		box-shadow: 0 10px 30px rgba(0, 0, 0, 0.15);
		border: 2px solid rgba(255, 255, 255, 0.3);
		transition: all 0.5s ease;
		animation: fadeInUp 0.6s ease-out backwards;
		animation-delay: var(--delay);
		position: relative;
	}
	
	.testimonial-card:hover {
		transform: translateY(-10px) scale(1.02);
		box-shadow: 0 30px 80px rgba(0, 0, 0, 0.3);
		border-color: white;
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
	
	.quote-icon {
		width: 35px;
		height: 35px;
		color: #667eea;
		opacity: 0.2;
		margin-bottom: 1rem;
	}
	
	.rating {
		display: flex;
		gap: 0.2rem;
		margin-bottom: 1rem;
	}
	
	.star {
		font-size: 1.1rem;
		color: #fbbf24;
	}
	
	.testimonial-text {
		font-size: 0.95rem;
		line-height: 1.6;
		color: #374151;
		margin-bottom: 1.25rem;
		font-style: italic;
	}
	
	.testimonial-author {
		display: flex;
		align-items: center;
		gap: 0.75rem;
		padding-top: 1rem;
		border-top: 2px solid rgba(102, 126, 234, 0.1);
	}
	
	.avatar {
		width: 45px;
		height: 45px;
		flex-shrink: 0;
		box-shadow: 0 4px 15px rgba(0, 0, 0, 0.1);
	}
	
	.avatar :global(.editable-image-wrapper) {
		border-radius: 50%;
		overflow: hidden;
		width: 100%;
		height: 100%;
	}
	
	.avatar-img {
		width: 100%;
		height: 100%;
		object-fit: cover;
	}
	
	.avatar-placeholder {
		width: 100%;
		height: 100%;
		background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
		display: flex;
		align-items: center;
		justify-content: center;
		color: white;
		font-size: 1.5rem;
		font-weight: 700;
	}
	
	.author-info {
		flex: 1;
	}
	
	.author-name {
		font-size: 0.95rem;
		font-weight: 700;
		background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
		-webkit-background-clip: text;
		-webkit-text-fill-color: transparent;
		background-clip: text;
		margin-bottom: 0.2rem;
	}
	
	.author-role {
		font-size: 0.85rem;
		color: #6b7280;
	}
	
	.add-testimonial-btn {
		background: rgba(255, 255, 255, 0.95);
		backdrop-filter: blur(10px);
		border: 3px dashed white;
		border-radius: 16px;
		padding: 2rem;
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		gap: 0.75rem;
		cursor: pointer;
		transition: all 0.3s ease;
		min-height: 200px;
	}
	
	.add-testimonial-btn:hover {
		transform: translateY(-10px);
		box-shadow: 0 20px 60px rgba(255, 255, 255, 0.3);
		background: rgba(255, 255, 255, 1);
	}
	
	.add-icon {
		font-size: 2.5rem;
		background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
		-webkit-background-clip: text;
		-webkit-text-fill-color: transparent;
		background-clip: text;
	}
	
	.add-text {
		font-size: 1.1rem;
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
		.testimonials-grid {
			grid-template-columns: 1fr;
		}
		
		.section-title {
			font-size: 2rem;
		}
	}
</style>
