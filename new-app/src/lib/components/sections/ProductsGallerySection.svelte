<script>
	import { getContext } from 'svelte';
	import EditableText from '$lib/components/editing/EditableText.svelte';
	import EditableImage from '$lib/components/editing/EditableImage.svelte';
	
	/** @type {{ data: { title?: string, subtitle?: string, products: any }, sectionIndex?: number }} */
	let { data, sectionIndex = 0 } = $props();
	
	// Parse products if they're a string
	let products = $state([]);
	
	$effect(() => {
		if (typeof data.products === 'string') {
			try {
				products = JSON.parse(data.products);
			} catch (e) {
				products = [];
			}
		} else if (Array.isArray(data.products)) {
			products = data.products;
		} else {
			products = [];
		}
	});
	
	// Get context
	const editMode = getContext('editMode');
	const pageId = getContext('pageId');
	const saveField = getContext('saveField');
	
	/**
	 * Save product field
	 */
	async function saveProductField(productId, field, value) {
		products = products.map(p => 
			p.id === productId ? { ...p, [field]: value } : p
		);
		await saveField(`sections.${sectionIndex}.data.products`, JSON.stringify(products));
	}
	
	/**
	 * Handle product image upload
	 */
	async function handleImageUpload(productId, file) {
		// Step 1: Upload image to Strapi
		const uploadFormData = new FormData();
		uploadFormData.append('image', file);
		uploadFormData.append('userId', 'temp');
		uploadFormData.append('pageName', 'products');
		
		const uploadResponse = await fetch('/api/upload-image', {
			method: 'POST',
			body: uploadFormData
		});
		
		if (!uploadResponse.ok) {
			throw new Error('Failed to upload image');
		}
		
		const uploadResult = await uploadResponse.json();
		const imageUrl = uploadResult.url;
		
		// Step 2: Update the product image locally
		products = products.map(p => 
			p.id === productId ? { ...p, image: imageUrl } : p
		);
		
		// Step 3: Save to Strapi
		await saveField(`sections.${sectionIndex}.data.products`, JSON.stringify(products));
		
		return imageUrl;
	}
	
	/**
	 * Add new product
	 */
	async function addProduct() {
		const newProduct = {
			id: Date.now(),
			name: 'מוצר חדש',
			price: 0,
			description: 'תיאור המוצר',
			image: 'https://via.placeholder.com/400x300?text=מוצר+חדש'
		};
		
		products = [...products, newProduct];
		await saveField(`sections.${sectionIndex}.data.products`, JSON.stringify(products));
	}
	
	/**
	 * Delete product
	 */
	async function deleteProduct(productId) {
		if (!confirm('האם למחוק את המוצר?')) return;
		
		products = products.filter(p => p.id !== productId);
		await saveField(`sections.${sectionIndex}.data.products`, JSON.stringify(products));
	}
</script>

<section class="products-section">
	<div class="container">
		<EditableText
			value={data.title || '🛍️ המוצרים שלנו'}
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
		
		<div class="products-grid">
			{#each products as product, index}
				<div class="product-card" style="--delay: {index * 0.1}s">
					{#if editMode}
						<button class="delete-btn" onclick={() => deleteProduct(product.id)} title="מחק מוצר">
							🗑️
						</button>
					{/if}
					
					<div class="product-image-wrapper">
						<EditableImage
							src={product.image}
							alt={product.name}
							onUpload={(file) => handleImageUpload(product.id, file)}
							className="product-image"
						/>
						<div class="product-badge">חדש</div>
					</div>
					
					<div class="product-info">
						<EditableText
							value={product.name}
							onsave={(value) => saveProductField(product.id, 'name', value)}
							class="product-name"
							tag="h3"
						/>
						<EditableText
							value={product.description || 'תיאור'}
							onsave={(value) => saveProductField(product.id, 'description', value)}
							class="product-description"
							tag="p"
						/>
						<div class="product-footer">
							<div class="product-price-wrapper">
								<span>₪</span>
								<EditableText
									value={String(product.price)}
									onsave={(value) => saveProductField(product.id, 'price', parseFloat(value) || 0)}
									class="product-price"
									tag="span"
								/>
							</div>
							<button class="add-to-cart-btn">
								<svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
									<path d="M9 2L7.17 4H4a2 2 0 00-2 2v12a2 2 0 002 2h16a2 2 0 002-2V6a2 2 0 00-2-2h-3.17L15 2H9z"/>
									<circle cx="12" cy="13" r="4"/>
								</svg>
								הוסף לעגלה
							</button>
						</div>
					</div>
				</div>
			{/each}
			
			{#if editMode}
				<button class="add-product-btn" onclick={addProduct}>
					<div class="add-icon">➕</div>
					<div class="add-text">הוסף מוצר</div>
				</button>
			{/if}
		</div>
	</div>
</section>

<style>
	.products-section {
		padding: 5rem 0;
		background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
		position: relative;
		overflow: hidden;
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
	
	.products-grid {
		display: grid;
		grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
		gap: 2rem;
	}
	
	.product-card {
		background: rgba(255, 255, 255, 0.95);
		backdrop-filter: blur(10px);
		border-radius: 24px;
		overflow: hidden;
		box-shadow: 0 10px 40px rgba(0, 0, 0, 0.1);
		transition: all 0.4s ease;
		position: relative;
		animation: fadeInUp 0.6s ease-out backwards;
		animation-delay: var(--delay);
	}
	
	.product-card:hover {
		transform: translateY(-10px);
		box-shadow: 0 20px 60px rgba(102, 126, 234, 0.2);
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
	
	.product-image-wrapper {
		position: relative;
		aspect-ratio: 4/3;
		overflow: hidden;
		background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
	}
	
	.product-image {
		width: 100%;
		height: 100%;
		object-fit: cover;
		transition: transform 0.4s ease;
	}
	
	.product-card:hover .product-image {
		transform: scale(1.1);
	}
	
	.product-badge {
		position: absolute;
		top: 15px;
		right: 15px;
		background: linear-gradient(135deg, #fbbf24 0%, #f59e0b 100%);
		color: white;
		padding: 0.5rem 1rem;
		border-radius: 20px;
		font-weight: 700;
		font-size: 0.9rem;
		box-shadow: 0 4px 15px rgba(251, 191, 36, 0.4);
	}
	
	.product-info {
		padding: 2rem;
	}
	
	.product-name {
		font-size: 1.5rem;
		font-weight: 700;
		color: #1f2937;
		margin-bottom: 0.75rem;
	}
	
	.product-description {
		font-size: 1rem;
		color: #6b7280;
		line-height: 1.6;
		margin-bottom: 1.5rem;
	}
	
	.product-footer {
		display: flex;
		align-items: center;
		justify-content: space-between;
		gap: 1rem;
	}
	
	.product-price-wrapper {
		display: flex;
		align-items: center;
		gap: 0.25rem;
		font-size: 1.8rem;
		font-weight: 800;
		background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
		-webkit-background-clip: text;
		-webkit-text-fill-color: transparent;
		background-clip: text;
	}
	
	.product-price {
		display: inline;
	}
	
	.add-to-cart-btn {
		background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
		color: white;
		border: none;
		padding: 0.75rem 1.5rem;
		border-radius: 12px;
		font-weight: 700;
		cursor: pointer;
		display: flex;
		align-items: center;
		gap: 0.5rem;
		transition: all 0.3s ease;
		box-shadow: 0 4px 15px rgba(102, 126, 234, 0.3);
	}
	
	.add-to-cart-btn:hover {
		transform: translateY(-2px);
		box-shadow: 0 6px 20px rgba(102, 126, 234, 0.4);
	}
	
	.add-to-cart-btn svg {
		width: 20px;
		height: 20px;
		stroke-width: 2;
	}
	
	.add-product-btn {
		background: rgba(255, 255, 255, 0.95);
		backdrop-filter: blur(10px);
		border: 3px dashed #667eea;
		border-radius: 24px;
		padding: 3rem;
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		gap: 1rem;
		cursor: pointer;
		transition: all 0.3s ease;
		min-height: 400px;
	}
	
	.add-product-btn:hover {
		transform: translateY(-10px);
		border-color: #764ba2;
		box-shadow: 0 20px 60px rgba(102, 126, 234, 0.2);
		background: rgba(102, 126, 234, 0.05);
	}
	
	.add-icon {
		font-size: 4rem;
		background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
		-webkit-background-clip: text;
		-webkit-text-fill-color: transparent;
		background-clip: text;
	}
	
	.add-text {
		font-size: 1.5rem;
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
		.products-grid {
			grid-template-columns: 1fr;
		}
		
		.section-title {
			font-size: 2rem;
		}
	}
</style>
