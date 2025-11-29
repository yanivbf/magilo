<script>
	// @ts-check
	import ProductGallery from './ProductGallery.svelte';
	import BookingCalendar from './BookingCalendar.svelte';
	import EventForm from './EventForm.svelte';
	import DynamicForm from './DynamicForm.svelte';

	/** @type {{ page: any }} */
	let { page } = $props();

	// Parse metadata for additional features
	const metadata = page.metadata || {};
	const videoUrl = metadata.videoUrl || '';
	const socialLinks = metadata.socialLinks || {};
	const gallery = metadata.gallery || [];
</script>

<div class="page-view">
	<!-- Hero Section -->
	<section class="hero" style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);">
		<div class="hero-content">
			<h1>{page.title}</h1>
			{#if page.description}
				<p class="description">{page.description}</p>
			{/if}
			{#if page.city}
				<p class="location">📍 {page.city}</p>
			{/if}
		</div>
	</section>

	<!-- Video Section -->
	{#if videoUrl}
		<section class="video-section">
			<div class="container">
				<h2>סרטון</h2>
				<div class="video-wrapper">
					{#if videoUrl.includes('youtube.com') || videoUrl.includes('youtu.be')}
						<iframe
							src={videoUrl.replace('watch?v=', 'embed/')}
							frameborder="0"
							allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
							allowfullscreen
						></iframe>
					{:else}
						<video controls src={videoUrl}></video>
					{/if}
				</div>
			</div>
		</section>
	{/if}

	<!-- Gallery Section -->
	{#if gallery.length > 0}
		<section class="gallery-section">
			<div class="container">
				<h2>גלריה</h2>
				<div class="gallery-grid">
					{#each gallery as image}
						<img src={image} alt="תמונה" />
					{/each}
				</div>
			</div>
		</section>
	{/if}

	<!-- Products Section -->
	{#if page.products && page.products.length > 0}
		<section class="products-section">
			<div class="container">
				<h2>מוצרים ושירותים</h2>
				<ProductGallery products={page.products} pageId={page.id} />
			</div>
		</section>
	{/if}

	<!-- Calendar Section (for service providers) -->
	{#if page.pageType === 'serviceProvider' || page.pageType === 'artist'}
		<section class="calendar-section">
			<div class="container">
				<h2>קביעת תור</h2>
				<BookingCalendar pageId={page.id} />
			</div>
		</section>
	{/if}

	<!-- Event Form (for events) -->
	{#if page.pageType === 'event'}
		<section class="event-section">
			<div class="container">
				<h2>הרשמה לאירוע</h2>
				<EventForm pageId={page.id} />
			</div>
		</section>
	{/if}

	<!-- Contact Form (for messages) -->
	{#if page.pageType === 'message'}
		<section class="contact-section">
			<div class="container">
				<h2>צור קשר</h2>
				<DynamicForm pageId={page.id} formType="contact" />
			</div>
		</section>
	{/if}

	<!-- Contact Info -->
	<section class="contact-info">
		<div class="container">
			<h2>יצירת קשר</h2>
			<div class="contact-grid">
				{#if page.phone}
					<a href="tel:{page.phone}" class="contact-item">
						<span class="icon">📞</span>
						<span>{page.phone}</span>
					</a>
				{/if}
				{#if page.email}
					<a href="mailto:{page.email}" class="contact-item">
						<span class="icon">✉️</span>
						<span>{page.email}</span>
					</a>
				{/if}
				{#if page.address}
					<div class="contact-item">
						<span class="icon">📍</span>
						<span>{page.address}</span>
					</div>
				{/if}
			</div>
		</div>
	</section>

	<!-- Social Links -->
	{#if Object.keys(socialLinks).length > 0}
		<section class="social-section">
			<div class="container">
				<h2>עקבו אחרינו</h2>
				<div class="social-links">
					{#if socialLinks.facebook}
						<a href={socialLinks.facebook} target="_blank" rel="noopener" class="social-link">
							<span>Facebook</span>
						</a>
					{/if}
					{#if socialLinks.instagram}
						<a href={socialLinks.instagram} target="_blank" rel="noopener" class="social-link">
							<span>Instagram</span>
						</a>
					{/if}
					{#if socialLinks.whatsapp}
						<a href="https://wa.me/{socialLinks.whatsapp}" target="_blank" rel="noopener" class="social-link">
							<span>WhatsApp</span>
						</a>
					{/if}
				</div>
			</div>
		</section>
	{/if}
</div>

<style>
	.page-view {
		width: 100%;
		min-height: 100vh;
		direction: rtl;
	}

	.hero {
		padding: 4rem 2rem;
		text-align: center;
		color: white;
	}

	.hero-content h1 {
		font-size: 3rem;
		margin: 0 0 1rem 0;
		font-weight: bold;
	}

	.description {
		font-size: 1.25rem;
		margin: 1rem 0;
		opacity: 0.95;
	}

	.location {
		font-size: 1.1rem;
		margin: 0.5rem 0;
	}

	section {
		padding: 3rem 2rem;
	}

	.container {
		max-width: 1200px;
		margin: 0 auto;
	}

	h2 {
		font-size: 2rem;
		margin-bottom: 2rem;
		text-align: center;
		color: #333;
	}

	.video-wrapper {
		position: relative;
		padding-bottom: 56.25%;
		height: 0;
		overflow: hidden;
		border-radius: 12px;
		box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
	}

	.video-wrapper iframe,
	.video-wrapper video {
		position: absolute;
		top: 0;
		left: 0;
		width: 100%;
		height: 100%;
	}

	.gallery-grid {
		display: grid;
		grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
		gap: 1rem;
	}

	.gallery-grid img {
		width: 100%;
		height: 250px;
		object-fit: cover;
		border-radius: 8px;
		box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
		transition: transform 0.3s;
	}

	.gallery-grid img:hover {
		transform: scale(1.05);
	}

	.contact-grid {
		display: grid;
		grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
		gap: 1.5rem;
		margin-top: 2rem;
	}

	.contact-item {
		display: flex;
		align-items: center;
		gap: 1rem;
		padding: 1.5rem;
		background: white;
		border-radius: 12px;
		box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
		text-decoration: none;
		color: #333;
		transition: transform 0.3s;
	}

	.contact-item:hover {
		transform: translateY(-5px);
	}

	.icon {
		font-size: 2rem;
	}

	.social-links {
		display: flex;
		justify-content: center;
		gap: 1rem;
		flex-wrap: wrap;
	}

	.social-link {
		padding: 1rem 2rem;
		background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
		color: white;
		text-decoration: none;
		border-radius: 50px;
		font-weight: bold;
		transition: transform 0.3s;
	}

	.social-link:hover {
		transform: scale(1.1);
	}

	.contact-info,
	.social-section {
		background: #f8f9fa;
	}
</style>
