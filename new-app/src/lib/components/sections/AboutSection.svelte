<script>
	/** @type {{ data: { title?: string, subtitle?: string, content: string, image?: string, features?: Array<{icon: string, title: string, text: string}> } }} */
	let { data } = $props();
</script>

<section class="about-section">
	<div class="container">
		<div class="about-content">
			<div class="about-text">
				<h2 class="section-title">{data.title || 'ℹ️ אודותינו'}</h2>
				{#if data.subtitle}
					<p class="section-subtitle">{data.subtitle}</p>
				{/if}
				<div class="content-text">
					{@html data.content}
				</div>
				
				{#if data.features && data.features.length > 0}
					<div class="features-grid">
						{#each data.features as feature, index}
							<div class="feature-item" style="--delay: {index * 0.1}s">
								<div class="feature-icon">{feature.icon}</div>
								<div class="feature-content">
									<h3>{feature.title}</h3>
									<p>{feature.text}</p>
								</div>
							</div>
						{/each}
					</div>
				{/if}
			</div>
			
			{#if data.image}
				<div class="about-image">
					<img src={data.image} alt="אודותינו" />
					<div class="image-decoration"></div>
				</div>
			{/if}
		</div>
	</div>
</section>

<style>
	.about-section {
		padding: 5rem 0;
		background-color: transparent !important;
		position: relative;
		overflow: hidden;
	}
	
	.container {
		max-width: 1400px;
		margin: 0 auto;
		padding: 0 2rem;
		position: relative;
		z-index: 1;
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
		background-clip: text;
		margin-bottom: 1rem;
		animation: fadeInUp 0.8s ease-out;
	}
	
	.section-subtitle {
		font-size: 1.3rem;
		color: var(--color-text-light, #6b7280);
		margin-bottom: 2rem;
		animation: fadeInUp 0.8s ease-out 0.2s backwards;
	}
	
	.content-text {
		font-size: 1.15rem;
		line-height: 1.9;
		color: var(--color-text, #374151);
		margin-bottom: 3rem;
		animation: fadeInUp 0.8s ease-out 0.4s backwards;
	}
	
	.content-text :global(p) {
		margin-bottom: 1.5rem;
	}
	
	.features-grid {
		display: grid;
		gap: 1.5rem;
	}
	
	.feature-item {
		display: flex;
		gap: 1.5rem;
		padding: 1.5rem;
		background: var(--color-bg-alt);
		backdrop-filter: blur(10px);
		border-radius: 16px;
		border: 1px solid rgba(102, 126, 234, 0.2);
		transition: all 0.3s ease;
		animation: fadeInUp 0.6s ease-out backwards;
		animation-delay: var(--delay);
	}
	
	.feature-item:hover {
		transform: translateX(-10px);
		box-shadow: 0 10px 30px rgba(102, 126, 234, 0.15);
		border-color: #667eea;
	}
	
	.feature-icon {
		font-size: 2.5rem;
		flex-shrink: 0;
		width: 60px;
		height: 60px;
		display: flex;
		align-items: center;
		justify-content: center;
		background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
		border-radius: 12px;
		box-shadow: 0 4px 15px rgba(102, 126, 234, 0.3);
	}
	
	.feature-content h3 {
		font-size: 1.2rem;
		font-weight: 700;
		color: #1f2937;
		margin-bottom: 0.5rem;
	}
	
	.feature-content p {
		font-size: 1rem;
		color: #6b7280;
		line-height: 1.6;
		margin: 0;
	}
	
	.about-image {
		position: relative;
		animation: fadeInUp 0.8s ease-out 0.6s backwards;
	}
	
	.about-image img {
		width: 100%;
		height: auto;
		border-radius: 24px;
		box-shadow: 0 20px 60px rgba(0, 0, 0, 0.15);
		position: relative;
		z-index: 2;
	}
	
	.image-decoration {
		position: absolute;
		inset: -20px;
		background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
		border-radius: 24px;
		z-index: 1;
		opacity: 0.2;
		animation: pulse 3s ease-in-out infinite;
	}
	
	@keyframes pulse {
		0%, 100% { transform: scale(1); }
		50% { transform: scale(1.05); }
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
	
	@media (max-width: 1024px) {
		.about-content {
			grid-template-columns: 1fr;
			gap: 3rem;
		}
		
		.about-image {
			order: -1;
		}
	}
	
	@media (max-width: 768px) {
		.section-title {
			font-size: 2rem;
		}
		
		.feature-item {
			flex-direction: column;
			text-align: center;
		}
		
		.feature-icon {
			margin: 0 auto;
		}
	}
</style>
