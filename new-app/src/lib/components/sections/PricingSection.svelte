<script>
	import { getContext } from 'svelte';
	import EditableText from '$lib/components/editing/EditableText.svelte';
	
	let { data, sectionIndex = 0 } = $props();
	
	const editMode = getContext('editMode');
	const pageId = getContext('pageId');
	const saveField = getContext('saveField');
	
	let plans = $state(data.plans || []);
	
	async function savePlanField(index, field, value) {
		plans = plans.map((p, i) => 
			i === index ? { ...p, [field]: value } : p
		);
		await saveField(`sections.${sectionIndex}.data.plans`, plans);
	}
	
	async function saveFeature(planIndex, featureIndex, value) {
		plans = plans.map((p, i) => {
			if (i === planIndex) {
				const newFeatures = [...p.features];
				newFeatures[featureIndex] = value;
				return { ...p, features: newFeatures };
			}
			return p;
		});
		await saveField(`sections.${sectionIndex}.data.plans`, plans);
	}
	
	async function addFeature(planIndex) {
		plans = plans.map((p, i) => {
			if (i === planIndex) {
				return { ...p, features: [...p.features, 'תכונה חדשה'] };
			}
			return p;
		});
		await saveField(`sections.${sectionIndex}.data.plans`, plans);
	}
	
	async function deleteFeature(planIndex, featureIndex) {
		plans = plans.map((p, i) => {
			if (i === planIndex) {
				return { ...p, features: p.features.filter((_, fi) => fi !== featureIndex) };
			}
			return p;
		});
		await saveField(`sections.${sectionIndex}.data.plans`, plans);
	}
	
	async function addPlan() {
		plans = [...plans, {
			name: 'חבילה חדשה',
			price: '₪99',
			period: 'לחודש',
			features: ['תכונה 1', 'תכונה 2', 'תכונה 3'],
			highlighted: false
		}];
		await saveField(`sections.${sectionIndex}.data.plans`, plans);
	}
	
	async function deletePlan(index) {
		if (!confirm('האם למחוק את החבילה?')) return;
		plans = plans.filter((_, i) => i !== index);
		await saveField(`sections.${sectionIndex}.data.plans`, plans);
	}
	
	async function toggleHighlight(index) {
		plans = plans.map((p, i) => 
			i === index ? { ...p, highlighted: !p.highlighted } : p
		);
		await saveField(`sections.${sectionIndex}.data.plans`, plans);
	}
</script>

<section class="pricing-section">
	<div class="container">
		<EditableText
			value={data.title || 'מחירון'}
			onsave={(value) => saveField(`sections.${sectionIndex}.data.title`, value)}
			class="section-title"
			tag="h2"
		/>
		{#if data.subtitle || editMode}
			<EditableText
				value={data.subtitle || 'בחר את החבילה המתאימה לך'}
				onsave={(value) => saveField(`sections.${sectionIndex}.data.subtitle`, value)}
				class="section-subtitle"
				tag="p"
			/>
		{/if}
		
		<div class="pricing-grid">
			{#each plans as plan, planIndex}
				<div class="pricing-card" class:highlighted={plan.highlighted} style="--delay: {planIndex * 0.15}s">
					{#if editMode}
						<div class="card-controls">
							<button class="highlight-btn" onclick={() => toggleHighlight(planIndex)} title={plan.highlighted ? 'בטל הדגשה' : 'הדגש'}>
								{plan.highlighted ? '⭐' : '☆'}
							</button>
							<button class="delete-btn" onclick={() => deletePlan(planIndex)} title="מחק חבילה">
								🗑️
							</button>
						</div>
					{/if}
					
					{#if plan.highlighted}
						<div class="popular-badge">מומלץ</div>
					{/if}
					
					<EditableText
						value={plan.name}
						onsave={(value) => savePlanField(planIndex, 'name', value)}
						class="plan-name"
						tag="h3"
					/>
					
					<div class="price-wrapper">
						<EditableText
							value={plan.price}
							onsave={(value) => savePlanField(planIndex, 'price', value)}
							class="plan-price"
							tag="div"
						/>
						<EditableText
							value={plan.period || 'לחודש'}
							onsave={(value) => savePlanField(planIndex, 'period', value)}
							class="plan-period"
							tag="div"
						/>
					</div>
					
					<ul class="features-list">
						{#each plan.features as feature, featureIndex}
							<li class="feature-item">
								<span class="check-icon">✓</span>
								<EditableText
									value={feature}
									onsave={(value) => saveFeature(planIndex, featureIndex, value)}
									class="feature-text"
									tag="span"
								/>
								{#if editMode}
									<button class="delete-feature-btn" onclick={() => deleteFeature(planIndex, featureIndex)}>
										×
									</button>
								{/if}
							</li>
						{/each}
						{#if editMode}
							<li class="feature-item">
								<button class="add-feature-btn" onclick={() => addFeature(planIndex)}>
									+ הוסף תכונה
								</button>
							</li>
						{/if}
					</ul>
					
					<button class="cta-btn">בחר חבילה</button>
				</div>
			{/each}
			
			{#if editMode}
				<button class="add-plan-btn" onclick={addPlan}>
					<div class="add-icon">➕</div>
					<div class="add-text">הוסף חבילה</div>
				</button>
			{/if}
		</div>
	</div>
</section>

<style>
	.pricing-section {
		padding: 3rem 0;
		background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
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
	
	.pricing-grid {
		display: grid;
		grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
		gap: 1.5rem;
		align-items: start;
		justify-content: center;
		max-width: 900px;
		margin: 0 auto;
	}
	
	.pricing-card {
		background: white;
		padding: 1.5rem;
		border-radius: 16px;
		box-shadow: 0 10px 40px rgba(0, 0, 0, 0.1);
		transition: all 0.4s ease;
		position: relative;
		animation: fadeInUp 0.6s ease-out backwards;
		animation-delay: var(--delay);
		border: 3px solid transparent;
	}
	
	.pricing-card:hover {
		transform: translateY(-10px);
		box-shadow: 0 20px 60px rgba(102, 126, 234, 0.2);
	}
	
	.pricing-card.highlighted {
		border-color: #667eea;
		transform: scale(1.05);
		box-shadow: 0 20px 60px rgba(102, 126, 234, 0.3);
	}
	
	.pricing-card.highlighted:hover {
		transform: scale(1.05) translateY(-10px);
	}
	
	.card-controls {
		position: absolute;
		top: 10px;
		left: 10px;
		display: flex;
		gap: 0.5rem;
		z-index: 10;
	}
	
	.highlight-btn,
	.delete-btn {
		background: rgba(255, 255, 255, 0.95);
		border: 2px solid #e5e7eb;
		border-radius: 50%;
		width: 36px;
		height: 36px;
		display: flex;
		align-items: center;
		justify-content: center;
		cursor: pointer;
		font-size: 1.1rem;
		transition: all 0.3s ease;
	}
	
	.highlight-btn:hover {
		background: #fbbf24;
		border-color: #fbbf24;
	}
	
	.delete-btn {
		background: rgba(239, 68, 68, 0.95);
		border-color: rgba(239, 68, 68, 0.95);
	}
	
	.delete-btn:hover {
		transform: scale(1.1);
		background: rgba(220, 38, 38, 1);
	}
	
	.popular-badge {
		position: absolute;
		top: -15px;
		right: 50%;
		transform: translateX(50%);
		background: linear-gradient(135deg, #fbbf24 0%, #f59e0b 100%);
		color: white;
		padding: 0.5rem 1.5rem;
		border-radius: 20px;
		font-weight: 700;
		font-size: 0.9rem;
		box-shadow: 0 4px 15px rgba(251, 191, 36, 0.4);
	}
	
	.plan-name {
		text-align: center;
		font-size: 1.3rem;
		font-weight: 700;
		color: #1f2937;
		margin-bottom: 1rem;
	}
	
	.price-wrapper {
		text-align: center;
		margin-bottom: 1.5rem;
		padding-bottom: 1.5rem;
		border-bottom: 2px solid #e5e7eb;
	}
	
	.plan-price {
		font-size: 2rem;
		font-weight: 800;
		background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
		-webkit-background-clip: text;
		-webkit-text-fill-color: transparent;
		background-clip: text;
		margin-bottom: 0.25rem;
	}
	
	.plan-period {
		font-size: 0.9rem;
		color: #6b7280;
	}
	
	.features-list {
		list-style: none;
		padding: 0;
		margin: 0 0 1.5rem 0;
	}
	
	.feature-item {
		display: flex;
		align-items: center;
		gap: 0.5rem;
		padding: 0.5rem 0;
		position: relative;
	}
	
	.check-icon {
		width: 20px;
		height: 20px;
		background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
		color: white;
		border-radius: 50%;
		display: flex;
		align-items: center;
		justify-content: center;
		font-weight: 700;
		flex-shrink: 0;
		font-size: 0.75rem;
	}
	
	.feature-text {
		flex: 1;
		font-size: 0.9rem;
		color: #374151;
	}
	
	.delete-feature-btn {
		background: rgba(239, 68, 68, 0.1);
		border: none;
		border-radius: 50%;
		width: 24px;
		height: 24px;
		color: #ef4444;
		cursor: pointer;
		font-size: 1.2rem;
		line-height: 1;
		transition: all 0.3s ease;
		opacity: 0;
	}
	
	.feature-item:hover .delete-feature-btn {
		opacity: 1;
	}
	
	.delete-feature-btn:hover {
		background: rgba(239, 68, 68, 0.2);
	}
	
	.add-feature-btn {
		background: transparent;
		border: 2px dashed #667eea;
		border-radius: 8px;
		padding: 0.5rem 1rem;
		color: #667eea;
		cursor: pointer;
		font-weight: 600;
		width: 100%;
		transition: all 0.3s ease;
	}
	
	.add-feature-btn:hover {
		background: rgba(102, 126, 234, 0.1);
	}
	
	.cta-btn {
		width: 100%;
		padding: 0.75rem 1.5rem;
		background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
		color: white;
		border: none;
		border-radius: 12px;
		font-size: 1rem;
		font-weight: 700;
		cursor: pointer;
		transition: all 0.3s ease;
		box-shadow: 0 4px 15px rgba(102, 126, 234, 0.3);
	}
	
	.cta-btn:hover {
		transform: translateY(-2px);
		box-shadow: 0 6px 20px rgba(102, 126, 234, 0.4);
	}
	
	.add-plan-btn {
		background: white;
		border: 3px dashed #667eea;
		border-radius: 16px;
		padding: 2rem;
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		gap: 0.75rem;
		cursor: pointer;
		transition: all 0.3s ease;
		min-height: 300px;
	}
	
	.add-plan-btn:hover {
		transform: translateY(-10px);
		border-color: #764ba2;
		box-shadow: 0 20px 60px rgba(102, 126, 234, 0.2);
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
		
		.pricing-grid {
			grid-template-columns: 1fr;
		}
		
		.pricing-card.highlighted {
			transform: scale(1);
		}
	}
</style>
