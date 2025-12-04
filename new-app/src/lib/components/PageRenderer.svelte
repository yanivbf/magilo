<script>
	// @ts-check
	import { onMount } from 'svelte';
	import ProductDisplay from './ProductDisplay.svelte';
	import BookingCalendar from './BookingCalendar.svelte';
	import AppointmentBookingForm from './AppointmentBookingForm.svelte';
	import EventForm from './EventForm.svelte';
	import DynamicForm from './DynamicForm.svelte';
	import PageEditToolbar from './PageEditToolbar.svelte';
	import NavigationBar from './NavigationBar.svelte';
	import QuickEditButton from './QuickEditButton.svelte';
	// Import new premium sections
	import GallerySection from './sections/GallerySection.svelte';
	import FAQSection from './sections/FAQSection.svelte';
	import TestimonialsSection from './sections/TestimonialsSection.svelte';
	import AboutSection from './sections/AboutSection.svelte';
	import ProductsGallerySection from './sections/ProductsGallerySection.svelte';
	import PageBotBubble from './PageBotBubble.svelte';

	/** @type {{ pageData: any, isOwner?: boolean }} */
	let { pageData, isOwner = false } = $props();
	
	// Use pageData directly
	const page = pageData;

	// Parse metadata for additional features
	const metadata = page.metadata || {};
	const videoUrl = metadata.videoUrl || metadata.video || '';
	const socialLinks = metadata.socialLinks || {};
	let gallery = metadata.gallery || metadata.images || [];
	
	// Add default gallery images if includeGallery is enabled but no images
	if (page.includeGallery && gallery.length === 0) {
		gallery = [
			'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?q=80&w=2070',
			'https://images.unsplash.com/photo-1523275335684-37898b6baf30?q=80&w=2099',
			'https://images.unsplash.com/photo-1572635196237-14b3f281503f?q=80&w=2080'
		];
	}
	
	// Gallery visibility state - SHOW BY DEFAULT
	let showGallery = $state(true);
	
	// WhatsApp number
	const whatsappNumber = page.phone || socialLinks.whatsapp || '';
	
	// Load accessibility widget
	onMount(() => {
		// Load Enable accessibility widget
		const script = document.createElement('script');
		script.src = 'https://cdn.enable.co.il/licenses/enable-L37136ixqvqxqxqx-0124-50913/init.js';
		script.async = true;
		document.body.appendChild(script);
		
		return () => {
			// Cleanup
			if (script.parentNode) {
				script.parentNode.removeChild(script);
			}
		};
	});
</script>

<div class="page-view">
	<!-- Edit Toolbar - Only for owners -->
	{#if isOwner}
		<PageEditToolbar pageData={page} {isOwner} />
	{/if}
	
	<!-- Navigation Bar -->
	<NavigationBar pageData={pageData} />
	
	<!-- Hero Section -->
	<section id="hero" class="hero" style="background: linear-gradient(135deg, rgba(102, 126, 234, 0.9) 0%, rgba(118, 75, 162, 0.9) 100%), url('{page.headerImage || 'https://images.unsplash.com/photo-1556740749-887f6717d7e4?q=80&w=2070'}') center/cover; position: relative;">
		<div class="hero-content">
			<h1>{page.title}</h1>
			{#if page.description}
				<p class="description">{page.description}</p>
			{/if}
			{#if page.city}
				<p class="location">📍 {page.city}</p>
			{/if}
			
			<!-- Dynamic CTA based on page type -->
			{#if page.pageType === 'store' || page.pageType === 'onlineStore'}
				<a href="#products" class="hero-cta">
					🛍️ גלריית המוצרים
				</a>
			{:else if page.pageType === 'serviceProvider' || page.pageType === 'artist'}
				<a href="#calendar" class="hero-cta">
					📅 קבע תור עכשיו
				</a>
			{:else if page.phone}
				<a href="tel:{page.phone}" class="hero-cta">
					📞 התקשר עכשיו
				</a>
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

	<!-- Gallery Section - Show only if has images -->
	{#if gallery && gallery.length > 0}
		<div id="gallery">
			<GallerySection data={{ images: gallery, title: '🖼️ גלריית תמונות', subtitle: 'הציצו בעבודות שלנו ותתרשמו בעצמכם' }} />
		</div>
	{/if}
	
	<!-- About Section - Show only if has content -->
	{#if page.aboutText || page.description}
		<div id="about">
			<AboutSection data={{ 
				title: 'ℹ️ אודותינו',
				content: page.aboutText || page.description,
				image: page.headerImage,
				features: [
					{ icon: '🎯', title: 'מקצועיות', text: 'צוות מקצועי ומנוסה' },
					{ icon: '⚡', title: 'מהירות', text: 'שירות מהיר ויעיל' },
					{ icon: '💎', title: 'איכות', text: 'איכות ללא פשרות' }
				]
			}} />
		</div>
	{/if}
	
	<!-- Testimonials Section - Show only if has testimonials -->
	{#if page.testimonials && page.testimonials.length > 0}
		<div id="testimonials">
			<TestimonialsSection data={{
				title: '⭐ מה אומרים עלינו',
				subtitle: 'לקוחות מרוצים משתפים את החוויה שלהם',
				items: page.testimonials
			}} />
		</div>
	{/if}

	<!-- Services Section -->
	<div id="services">
		{#if page.services && page.services.length > 0}
			<section class="services-section">
				<div class="container">
					<h2>השירותים שלנו</h2>
					<div class="services-grid">
						{#each page.services as service}
							<div class="service-item">
								<h3>{service.name}</h3>
								{#if service.description}
									<p>{service.description}</p>
								{/if}
								{#if service.price}
									<div class="service-price">₪{service.price}</div>
								{/if}
								{#if service.duration}
									<div class="service-duration">⏱️ {service.duration} דקות</div>
								{/if}
							</div>
						{/each}
					</div>
				</div>
			</section>
		{/if}
	</div>

	<!-- Legacy Sections - HIDDEN (use structured sections instead) -->
	<!-- The old sections system is deprecated. Use Gallery, FAQ, Testimonials, About sections instead -->

	<!-- Structured Sections (from Strapi) -->
	{#if page.sections && page.sections.length > 0}
		{#each page.sections as section}
			{#if section.attributes.enabled}
				{#if section.attributes.type === 'products'}
					<div id="products">
						<ProductsGallerySection data={{
							...section.attributes.data,
							products: page.products || []
						}} />
					</div>
				{:else if section.attributes.type === 'gallery'}
					<div id="gallery">
						<GallerySection data={section.attributes.data} />
					</div>
				{:else if section.attributes.type === 'faq'}
					<div id="faq">
						<FAQSection data={section.attributes.data} />
					</div>
				{:else if section.attributes.type === 'testimonials'}
					<div id="testimonials">
						<TestimonialsSection data={section.attributes.data} />
					</div>
				{:else if section.attributes.type === 'about'}
					<div id="about">
						<AboutSection data={section.attributes.data} />
					</div>
				{/if}
			{/if}
		{/each}
	{/if}
	
	<!-- Legacy Products Section (fallback if no sections) -->
	{#if (!page.sections || page.sections.length === 0) && page.products && page.products.length > 0}
		<section id="products" class="products-section">
			<div class="container">
				<h2>המוצרים שלנו</h2>
				<ProductDisplay products={page.products} pageId={page.id} />
			</div>
		</section>
	{:else if (!page.sections || page.sections.length === 0) && (page.pageType === 'store' || page.pageType === 'onlineStore')}
		<!-- Show message if store has no products -->
		<section id="products" class="products-section">
			<div class="container">
				<h2>המוצרים שלנו</h2>
				<div style="text-align: center; padding: 4rem 2rem; background: #f9fafb; border-radius: 12px;">
					<p style="font-size: 1.2rem; color: #6b7280; margin-bottom: 1rem;">
						🛍️ טרם הוספו מוצרים לחנות
					</p>
					<p style="color: #9ca3af;">
						היכנס לדף הניהול כדי להוסיף מוצרים
					</p>
				</div>
			</div>
		</section>
	{/if}

	<!-- Calendar Section (for service providers) -->
	{#if page.pageType === 'serviceProvider' || page.pageType === 'artist'}
		<section id="calendar" class="calendar-section">
			<div class="container">
				<h2>קביעת תור</h2>
				<!-- New Appointment Booking Form -->
				<AppointmentBookingForm 
					pageId={page.id} 
					services={page.services || []} 
				/>
				<!-- Legacy Calendar (can be removed later) -->
				<!-- <BookingCalendar pageId={page.id} /> -->
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
	<section id="contact" class="contact-info">
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

	<!-- FAQ Section - Show only if has FAQ items -->
	{#if page.faq && page.faq.length > 0}
		<div id="faq">
			<FAQSection data={{
				title: '❓ שאלות ותשובות',
				subtitle: 'תשובות לשאלות הנפוצות ביותר',
				items: page.faq
			}} />
		</div>
	{/if}

	
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
	
	<!-- Footer with Accessibility Statement -->
	<footer class="footer">
		<div class="container">
			<div class="footer-content">
				<div class="footer-links">
					<a href="/legal/accessibility" target="_blank" class="footer-link">
						♿ הצהרת נגישות
					</a>
					<span class="footer-separator">|</span>
					<a href="/legal/privacy" target="_blank" class="footer-link">
						🔒 מדיניות פרטיות
					</a>
					<span class="footer-separator">|</span>
					<a href="/legal/terms" target="_blank" class="footer-link">
						📋 תנאי שימוש
					</a>
				</div>
				<div class="footer-credit">
					<p>נבנה באמצעות <a href="/" class="footer-brand">AutoPage</a></p>
				</div>
			</div>
		</div>
	</footer>
	
	<!-- Bot Bubble -->
	<PageBotBubble pageData={pageData} />
</div>

<!-- Quick Edit Button - Always visible in localhost -->
<QuickEditButton pageData={page} />

<!-- Floating WhatsApp Button -->
{#if whatsappNumber}
	<a 
		href="https://wa.me/{whatsappNumber.replace(/[^0-9]/g, '')}" 
		target="_blank" 
		rel="noopener"
		class="whatsapp-float"
		title="שלח הודעה ב-WhatsApp"
	>
		<svg viewBox="0 0 32 32" class="whatsapp-icon">
			<path fill="currentColor" d="M16 0c-8.837 0-16 7.163-16 16 0 2.825 0.737 5.607 2.137 8.048l-2.137 7.952 7.933-2.127c2.42 1.37 5.173 2.127 8.067 2.127 8.837 0 16-7.163 16-16s-7.163-16-16-16zM16 29.467c-2.482 0-4.908-0.646-7.07-1.87l-0.507-0.292-5.247 1.408 1.417-5.267-0.321-0.525c-1.331-2.197-2.039-4.736-2.039-7.321 0-7.605 6.195-13.8 13.8-13.8s13.8 6.195 13.8 13.8-6.195 13.867-13.833 13.867zM21.933 18.333c-0.333-0.167-1.967-0.967-2.267-1.083s-0.525-0.167-0.75 0.167c-0.225 0.333-0.867 1.083-1.067 1.317-0.2 0.225-0.4 0.258-0.733 0.092s-1.433-0.525-2.733-1.683c-1.008-0.9-1.692-2.008-1.892-2.342s-0.021-0.517 0.146-0.683c0.15-0.146 0.333-0.383 0.5-0.575s0.225-0.333 0.333-0.558c0.108-0.225 0.058-0.425-0.025-0.592s-0.75-1.8-1.025-2.467c-0.267-0.65-0.542-0.558-0.75-0.567-0.192-0.008-0.417-0.008-0.642-0.008s-0.583 0.083-0.892 0.417c-0.308 0.333-1.175 1.15-1.175 2.8s1.2 3.242 1.367 3.467c0.167 0.225 2.333 3.567 5.667 5 0.792 0.333 1.408 0.533 1.892 0.683 0.8 0.25 1.525 0.217 2.1 0.133 0.642-0.092 1.967-0.8 2.242-1.567s0.275-1.433 0.192-1.567c-0.083-0.142-0.308-0.225-0.642-0.392z"/>
		</svg>
	</a>
{/if}

<style>
	.page-view {
		width: 100%;
		min-height: 100vh;
		direction: rtl;
		position: relative;
		overflow-x: hidden;
	}
	
	/* Glass Morphism Effect */
	:global(.glass) {
		background: rgba(255, 255, 255, 0.1);
		backdrop-filter: blur(20px);
		-webkit-backdrop-filter: blur(20px);
		border: 1px solid rgba(255, 255, 255, 0.2);
		box-shadow: 0 8px 32px 0 rgba(31, 38, 135, 0.37);
	}
	
	/* Neumorphism Effect */
	:global(.neomorph) {
		background: #e0e5ec;
		box-shadow: 
			20px 20px 60px #bebebe,
			-20px -20px 60px #ffffff;
		border-radius: 20px;
	}
	
	/* 3D Transform Effects */
	:global(.card-3d) {
		transform-style: preserve-3d;
		transition: transform 0.6s cubic-bezier(0.23, 1, 0.32, 1);
	}
	
	:global(.card-3d:hover) {
		transform: rotateY(10deg) rotateX(10deg) scale(1.05);
	}
	
	/* Gradient Text */
	:global(.gradient-text) {
		background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
		-webkit-background-clip: text;
		-webkit-text-fill-color: transparent;
		background-clip: text;
	}
	
	/* Floating Animation */
	@keyframes float {
		0%, 100% {
			transform: translateY(0px);
		}
		50% {
			transform: translateY(-20px);
		}
	}
	
	:global(.floating) {
		animation: float 3s ease-in-out infinite;
	}
	
	/* Pulse Glow */
	@keyframes pulse-glow {
		0%, 100% {
			box-shadow: 0 0 20px rgba(102, 126, 234, 0.5);
		}
		50% {
			box-shadow: 0 0 40px rgba(102, 126, 234, 0.8), 0 0 60px rgba(118, 75, 162, 0.6);
		}
	}
	
	:global(.pulse-glow) {
		animation: pulse-glow 2s ease-in-out infinite;
	}

	/* Premium Hero Section - TEXT ON IMAGE */
	.hero {
		padding: 6rem 2rem;
		text-align: center;
		color: white;
		position: relative;
		overflow: hidden;
		min-height: 600px;
		display: flex;
		align-items: center;
		justify-content: center;
	}
	
	.hero-overlay {
		position: absolute;
		top: 0;
		left: 0;
		right: 0;
		bottom: 0;
		background: linear-gradient(135deg, rgba(102, 126, 234, 0.85) 0%, rgba(118, 75, 162, 0.85) 100%);
		z-index: 1;
		animation: gradient-shift 10s ease infinite;
	}
	
	@keyframes gradient-shift {
		0%, 100% {
			background: linear-gradient(135deg, rgba(102, 126, 234, 0.85) 0%, rgba(118, 75, 162, 0.85) 100%);
		}
		25% {
			background: linear-gradient(135deg, rgba(240, 147, 251, 0.85) 0%, rgba(245, 87, 108, 0.85) 100%);
		}
		50% {
			background: linear-gradient(135deg, rgba(79, 172, 254, 0.85) 0%, rgba(0, 242, 254, 0.85) 100%);
		}
		75% {
			background: linear-gradient(135deg, rgba(67, 233, 123, 0.85) 0%, rgba(56, 249, 215, 0.85) 100%);
		}
	}
	
	/* Floating Shapes */
	.floating-shapes {
		position: absolute;
		top: 0;
		left: 0;
		right: 0;
		bottom: 0;
		z-index: 2;
		overflow: hidden;
		pointer-events: none;
	}
	
	.shape {
		position: absolute;
		border-radius: 50%;
		background: rgba(255, 255, 255, 0.1);
		backdrop-filter: blur(10px);
	}
	
	.shape-1 {
		width: 300px;
		height: 300px;
		top: 10%;
		right: 10%;
		animation: float-shape 20s ease-in-out infinite;
	}
	
	.shape-2 {
		width: 200px;
		height: 200px;
		bottom: 20%;
		left: 15%;
		animation: float-shape 15s ease-in-out infinite reverse;
	}
	
	.shape-3 {
		width: 150px;
		height: 150px;
		top: 50%;
		left: 50%;
		animation: float-shape 25s ease-in-out infinite;
	}
	
	@keyframes float-shape {
		0%, 100% {
			transform: translate(0, 0) rotate(0deg);
		}
		25% {
			transform: translate(50px, -50px) rotate(90deg);
		}
		50% {
			transform: translate(0, -100px) rotate(180deg);
		}
		75% {
			transform: translate(-50px, -50px) rotate(270deg);
		}
	}
	
	/* Scroll Indicator */
	.scroll-indicator {
		position: absolute;
		bottom: 30px;
		left: 50%;
		transform: translateX(-50%);
		z-index: 10;
		text-align: center;
	}
	
	.mouse {
		width: 30px;
		height: 50px;
		border: 2px solid white;
		border-radius: 15px;
		position: relative;
		margin: 0 auto 10px;
	}
	
	.wheel {
		width: 4px;
		height: 10px;
		background: white;
		border-radius: 2px;
		position: absolute;
		top: 8px;
		left: 50%;
		transform: translateX(-50%);
		animation: scroll-wheel 2s ease-in-out infinite;
	}
	
	@keyframes scroll-wheel {
		0% {
			opacity: 1;
			top: 8px;
		}
		100% {
			opacity: 0;
			top: 30px;
		}
	}
	
	.arrow {
		display: flex;
		flex-direction: column;
		align-items: center;
	}
	
	.arrow span {
		display: block;
		width: 10px;
		height: 10px;
		border-bottom: 2px solid white;
		border-right: 2px solid white;
		transform: rotate(45deg);
		margin: -5px;
		animation: arrow-move 2s ease-in-out infinite;
	}
	
	.arrow span:nth-child(2) {
		animation-delay: 0.2s;
	}
	
	.arrow span:nth-child(3) {
		animation-delay: 0.4s;
	}
	
	@keyframes arrow-move {
		0% {
			opacity: 0;
			transform: rotate(45deg) translate(-10px, -10px);
		}
		50% {
			opacity: 1;
		}
		100% {
			opacity: 0;
			transform: rotate(45deg) translate(10px, 10px);
		}
	}
	
	.hero::before {
		content: '';
		position: absolute;
		top: -50%;
		right: -20%;
		width: 800px;
		height: 800px;
		background: radial-gradient(circle, rgba(255, 255, 255, 0.15) 0%, transparent 70%);
		border-radius: 50%;
		animation: float 25s ease-in-out infinite;
	}
	
	.hero::after {
		content: '';
		position: absolute;
		bottom: -50%;
		left: -20%;
		width: 600px;
		height: 600px;
		background: radial-gradient(circle, rgba(255, 255, 255, 0.1) 0%, transparent 70%);
		border-radius: 50%;
		animation: float 30s ease-in-out infinite reverse;
	}
	
	.hero-content {
		position: relative;
		z-index: 1;
	}

	.hero-content h1 {
		font-size: 3.5rem;
		margin: 0 0 1.5rem 0;
		font-weight: 800;
		text-shadow: 0 4px 20px rgba(0, 0, 0, 0.3);
		animation: fadeInUp 0.8s ease-out;
		letter-spacing: -1px;
	}

	.description {
		font-size: 1.4rem;
		margin: 1.5rem 0;
		opacity: 0.95;
		text-shadow: 0 2px 10px rgba(0, 0, 0, 0.2);
		animation: fadeInUp 0.8s ease-out 0.2s backwards;
		line-height: 1.6;
	}

	.location {
		font-size: 1.2rem;
		margin: 1rem 0;
		opacity: 0.9;
		animation: fadeInUp 0.8s ease-out 0.4s backwards;
		display: inline-block;
		padding: 0.5rem 1.5rem;
		background: rgba(255, 255, 255, 0.2);
		backdrop-filter: blur(10px);
		border-radius: 50px;
		border: 1px solid rgba(255, 255, 255, 0.3);
	}
	
	.hero-cta {
		display: inline-block;
		margin-top: 2rem;
		padding: 1rem 3rem;
		background: white;
		color: #667eea;
		text-decoration: none;
		border-radius: 50px;
		font-size: 1.2rem;
		font-weight: 700;
		box-shadow: 0 10px 30px rgba(0, 0, 0, 0.3);
		transition: all 0.3s ease;
		animation: fadeInUp 0.8s ease-out 0.6s backwards;
	}
	
	.hero-cta:hover {
		transform: translateY(-5px) scale(1.05);
		box-shadow: 0 15px 40px rgba(0, 0, 0, 0.4);
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

	/* Modern Gallery Carousel */
	.gallery-carousel {
		position: relative;
		max-width: 100%;
		margin: 0 auto;
	}
	
	.gallery-track {
		display: flex;
		gap: 1.5rem;
		overflow-x: auto;
		scroll-behavior: smooth;
		padding: 1rem 0;
		scrollbar-width: thin;
		scrollbar-color: #667eea #f1f1f1;
	}
	
	.gallery-track::-webkit-scrollbar {
		height: 8px;
	}
	
	.gallery-track::-webkit-scrollbar-track {
		background: #f1f1f1;
		border-radius: 10px;
	}
	
	.gallery-track::-webkit-scrollbar-thumb {
		background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
		border-radius: 10px;
	}
	
	.gallery-track::-webkit-scrollbar-thumb:hover {
		background: linear-gradient(135deg, #764ba2 0%, #667eea 100%);
	}
	
	/* Premium Gallery Styles */
	.premium-gallery {
		background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
		padding: 5rem 0;
		position: relative;
		overflow: hidden;
	}
	
	.premium-gallery::before {
		content: '';
		position: absolute;
		top: -30%;
		left: -20%;
		width: 600px;
		height: 600px;
		background: radial-gradient(circle, rgba(255, 255, 255, 0.1) 0%, transparent 70%);
		border-radius: 50%;
		animation: float 20s ease-in-out infinite;
	}
	
	.premium-title {
		text-align: center;
		font-size: 2.5rem;
		margin-bottom: 1rem;
		color: white;
		text-shadow: 0 2px 20px rgba(0, 0, 0, 0.2);
		animation: fadeInUp 0.8s ease-out;
	}
	
	.gallery-subtitle {
		text-align: center;
		font-size: 1.2rem;
		color: rgba(255, 255, 255, 0.9);
		margin-bottom: 3rem;
		animation: fadeInUp 0.8s ease-out 0.2s backwards;
	}
	
	.gallery-item {
		flex: 0 0 320px;
		height: 350px;
		position: relative;
		border-radius: 20px;
		overflow: hidden;
		box-shadow: 0 10px 40px rgba(0, 0, 0, 0.3);
		transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
		cursor: pointer;
		border: 3px solid rgba(255, 255, 255, 0.3);
	}
	
	.gallery-item::before {
		content: '';
		position: absolute;
		top: 0;
		left: 0;
		right: 0;
		bottom: 0;
		background: linear-gradient(135deg, rgba(102, 126, 234, 0.3) 0%, rgba(118, 75, 162, 0.3) 100%);
		opacity: 0;
		transition: opacity 0.3s ease;
		z-index: 1;
	}
	
	.gallery-item:hover::before {
		opacity: 1;
	}
	
	.gallery-item:hover {
		transform: translateY(-15px) scale(1.05);
		box-shadow: 0 20px 60px rgba(0, 0, 0, 0.4);
		border-color: white;
	}
	
	.gallery-item img {
		width: 100%;
		height: 100%;
		object-fit: cover;
		transition: transform 0.4s cubic-bezier(0.4, 0, 0.2, 1);
	}
	
	.gallery-item:hover img {
		transform: scale(1.15) rotate(2deg);
	}
	
	.carousel-btn {
		position: absolute;
		top: 50%;
		transform: translateY(-50%);
		background: rgba(255, 255, 255, 0.95);
		backdrop-filter: blur(10px);
		border: 2px solid rgba(255, 255, 255, 0.5);
		width: 60px;
		height: 60px;
		border-radius: 50%;
		font-size: 28px;
		cursor: pointer;
		z-index: 10;
		box-shadow: 0 8px 25px rgba(0, 0, 0, 0.3);
		transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
		color: #667eea;
		font-weight: bold;
	}
	
	.carousel-btn:hover {
		background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
		color: white;
		transform: translateY(-50%) scale(1.2);
		box-shadow: 0 12px 35px rgba(102, 126, 234, 0.5);
		border-color: white;
	}
	
	.carousel-btn:active {
		transform: translateY(-50%) scale(1.1);
	}
	
	.carousel-btn.prev {
		left: -25px;
	}
	
	.carousel-btn.next {
		right: -25px;
	}
	
	/* Premium Lightbox */
	.lightbox {
		display: none;
		position: fixed;
		top: 0;
		left: 0;
		width: 100%;
		height: 100%;
		background: rgba(0, 0, 0, 0.97);
		backdrop-filter: blur(20px);
		z-index: 9999;
		align-items: center;
		justify-content: center;
		animation: fadeIn 0.3s ease;
	}
	
	.lightbox img {
		max-width: 90%;
		max-height: 90%;
		object-fit: contain;
		border-radius: 20px;
		box-shadow: 0 0 80px rgba(102, 126, 234, 0.5), 0 0 120px rgba(118, 75, 162, 0.3);
		animation: zoomIn 0.4s cubic-bezier(0.4, 0, 0.2, 1);
		border: 3px solid rgba(255, 255, 255, 0.2);
	}
	
	.lightbox-close {
		position: absolute;
		top: 30px;
		right: 50px;
		font-size: 60px;
		color: white;
		cursor: pointer;
		transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
		z-index: 10000;
		width: 70px;
		height: 70px;
		display: flex;
		align-items: center;
		justify-content: center;
		background: rgba(255, 255, 255, 0.1);
		backdrop-filter: blur(10px);
		border-radius: 50%;
		border: 2px solid rgba(255, 255, 255, 0.3);
	}
	
	.lightbox-close:hover {
		background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
		transform: rotate(90deg) scale(1.1);
		box-shadow: 0 8px 25px rgba(102, 126, 234, 0.5);
		border-color: white;
	}
	
	@keyframes fadeIn {
		from {
			opacity: 0;
		}
		to {
			opacity: 1;
		}
	}
	
	@keyframes zoomIn {
		from {
			transform: scale(0.8);
			opacity: 0;
		}
		to {
			transform: scale(1);
			opacity: 1;
		}
	}
	
	/* Mobile adjustments */
	@media (max-width: 768px) {
		.gallery-item {
			flex: 0 0 250px;
			height: 250px;
		}
		
		.carousel-btn {
			width: 40px;
			height: 40px;
			font-size: 20px;
		}
		
		.carousel-btn.prev {
			left: 10px;
		}
		
		.carousel-btn.next {
			right: 10px;
		}
		
		.lightbox-close {
			top: 10px;
			right: 20px;
			font-size: 40px;
		}
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
	
	.gallery-toggle-btn {
		display: block;
		margin: 0 auto 2rem auto;
		padding: 1rem 2rem;
		background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
		color: white;
		border: none;
		border-radius: 50px;
		font-size: 1.1rem;
		font-weight: bold;
		cursor: pointer;
		transition: transform 0.3s, box-shadow 0.3s;
		box-shadow: 0 4px 15px rgba(102, 126, 234, 0.3);
	}
	
	.gallery-toggle-btn:hover {
		transform: translateY(-2px);
		box-shadow: 0 6px 20px rgba(102, 126, 234, 0.4);
	}
	
	/* Footer Styles */
	.footer {
		background: #1f2937;
		color: white;
		padding: 2rem 1rem;
		margin-top: 4rem;
	}
	
	.footer-content {
		text-align: center;
	}
	
	.footer-links {
		display: flex;
		justify-content: center;
		align-items: center;
		flex-wrap: wrap;
		gap: 0.5rem;
		margin-bottom: 1rem;
	}
	
	.footer-link {
		color: #e5e7eb;
		text-decoration: none;
		transition: color 0.3s;
		font-size: 0.95rem;
	}
	
	.footer-link:hover {
		color: #a78bfa;
	}
	
	.footer-separator {
		color: #6b7280;
	}
	
	.footer-credit {
		color: #9ca3af;
		font-size: 0.875rem;
	}
	
	.footer-brand {
		color: #a78bfa;
		text-decoration: none;
		font-weight: 600;
	}
	
	.footer-brand:hover {
		color: #c4b5fd;
	}
	
	/* Floating WhatsApp Button */
	.whatsapp-float {
		position: fixed;
		bottom: 20px;
		left: 20px;
		width: 60px;
		height: 60px;
		background: #25D366;
		border-radius: 50%;
		display: flex;
		align-items: center;
		justify-content: center;
		color: white;
		box-shadow: 0 4px 20px rgba(37, 211, 102, 0.4);
		z-index: 999;
		transition: transform 0.3s, box-shadow 0.3s;
		text-decoration: none;
	}
	
	.whatsapp-float:hover {
		transform: scale(1.1);
		box-shadow: 0 6px 25px rgba(37, 211, 102, 0.6);
	}
	
	/* Premium Animations */
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
	
	@keyframes float {
		0%, 100% {
			transform: translateY(0) rotate(0deg);
		}
		50% {
			transform: translateY(-20px) rotate(5deg);
		}
	}
	
	@keyframes pulse {
		0%, 100% {
			transform: scale(1);
		}
		50% {
			transform: scale(1.1);
		}
	}
	
	@keyframes shimmer {
		0% {
			background-position: -1000px 0;
		}
		100% {
			background-position: 1000px 0;
		}
	}
	
	/* FAQ Section - Premium Design */
	.faq-section {
		background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
		padding: 5rem 0;
		position: relative;
		overflow: hidden;
	}
	
	.faq-section::before {
		content: '';
		position: absolute;
		top: -50%;
		right: -10%;
		width: 500px;
		height: 500px;
		background: radial-gradient(circle, rgba(102, 126, 234, 0.1) 0%, transparent 70%);
		border-radius: 50%;
		animation: float 20s ease-in-out infinite;
	}
	
	.faq-section h2 {
		text-align: center;
		font-size: 2.5rem;
		margin-bottom: 3rem;
		background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
		-webkit-background-clip: text;
		-webkit-text-fill-color: transparent;
		background-clip: text;
		animation: fadeInUp 0.8s ease-out;
	}
	
	.faq-list {
		max-width: 900px;
		margin: 0 auto;
		position: relative;
		z-index: 1;
	}
	
	.faq-item {
		background: rgba(255, 255, 255, 0.95);
		backdrop-filter: blur(10px);
		padding: 2.5rem;
		margin-bottom: 1.5rem;
		border-radius: 20px;
		box-shadow: 0 10px 40px rgba(0, 0, 0, 0.08);
		border: 1px solid rgba(255, 255, 255, 0.8);
		transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
		animation: fadeInUp 0.6s ease-out backwards;
	}
	
	.faq-item:nth-child(1) { animation-delay: 0.1s; }
	.faq-item:nth-child(2) { animation-delay: 0.2s; }
	.faq-item:nth-child(3) { animation-delay: 0.3s; }
	
	.faq-item:hover {
		transform: translateY(-8px) scale(1.02);
		box-shadow: 0 20px 60px rgba(102, 126, 234, 0.2);
		border-color: #667eea;
	}
	
	.faq-item h3 {
		background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
		-webkit-background-clip: text;
		-webkit-text-fill-color: transparent;
		background-clip: text;
		margin-bottom: 1rem;
		font-size: 1.3rem;
		font-weight: 700;
		display: flex;
		align-items: center;
		gap: 0.5rem;
	}
	
	.faq-item h3::before {
		content: '💡';
		font-size: 1.5rem;
		animation: pulse 2s ease-in-out infinite;
	}
	
	.faq-item p {
		color: #4b5563;
		line-height: 1.8;
		margin: 0;
		font-size: 1.05rem;
	}
	
	/* Testimonials Section - Premium Design */
	.testimonials-section {
		padding: 5rem 0;
		background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
		position: relative;
		overflow: hidden;
	}
	
	.testimonials-section::before {
		content: '';
		position: absolute;
		top: -50%;
		left: -10%;
		width: 600px;
		height: 600px;
		background: radial-gradient(circle, rgba(255, 255, 255, 0.1) 0%, transparent 70%);
		border-radius: 50%;
		animation: float 25s ease-in-out infinite reverse;
	}
	
	.testimonials-section h2 {
		text-align: center;
		font-size: 2.5rem;
		margin-bottom: 3rem;
		color: white;
		text-shadow: 0 2px 20px rgba(0, 0, 0, 0.2);
		animation: fadeInUp 0.8s ease-out;
	}
	
	.testimonials-grid {
		display: grid;
		grid-template-columns: repeat(auto-fit, minmax(320px, 1fr));
		gap: 2rem;
		margin-top: 2rem;
		position: relative;
		z-index: 1;
	}
	
	.testimonial-item {
		background: rgba(255, 255, 255, 0.95);
		backdrop-filter: blur(10px);
		padding: 2.5rem;
		border-radius: 20px;
		box-shadow: 0 10px 40px rgba(0, 0, 0, 0.15);
		text-align: center;
		transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
		border: 2px solid rgba(255, 255, 255, 0.3);
		animation: fadeInUp 0.6s ease-out backwards;
	}
	
	.testimonial-item:nth-child(1) { animation-delay: 0.1s; }
	.testimonial-item:nth-child(2) { animation-delay: 0.2s; }
	.testimonial-item:nth-child(3) { animation-delay: 0.3s; }
	
	.testimonial-item:hover {
		transform: translateY(-10px) scale(1.05);
		box-shadow: 0 20px 60px rgba(0, 0, 0, 0.25);
		border-color: white;
	}
	
	.stars {
		font-size: 1.8rem;
		margin-bottom: 1.5rem;
		animation: pulse 2s ease-in-out infinite;
	}
	
	.testimonial-item p {
		font-style: italic;
		color: #374151;
		margin-bottom: 1.5rem;
		line-height: 1.8;
		font-size: 1.05rem;
		position: relative;
	}
	
	.testimonial-item p::before {
		content: '"';
		font-size: 3rem;
		color: #667eea;
		opacity: 0.3;
		position: absolute;
		top: -20px;
		left: -10px;
	}
	
	.customer {
		font-weight: 700;
		background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
		-webkit-background-clip: text;
		-webkit-text-fill-color: transparent;
		background-clip: text;
		font-size: 1.1rem;
	}
	
	/* About Section - Premium Design */
	.about-section {
		background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
		padding: 5rem 0;
		position: relative;
		overflow: hidden;
	}
	
	.about-section::before {
		content: '';
		position: absolute;
		bottom: -50%;
		left: -10%;
		width: 500px;
		height: 500px;
		background: radial-gradient(circle, rgba(102, 126, 234, 0.1) 0%, transparent 70%);
		border-radius: 50%;
		animation: float 22s ease-in-out infinite;
	}
	
	.about-section h2 {
		text-align: center;
		font-size: 2.5rem;
		margin-bottom: 3rem;
		background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
		-webkit-background-clip: text;
		-webkit-text-fill-color: transparent;
		background-clip: text;
		animation: fadeInUp 0.8s ease-out;
	}
	
	.about-content {
		max-width: 900px;
		margin: 0 auto;
		text-align: center;
		position: relative;
		z-index: 1;
	}
	
	.about-content p {
		font-size: 1.15rem;
		line-height: 2;
		color: #374151;
		margin-bottom: 2rem;
		background: rgba(255, 255, 255, 0.8);
		backdrop-filter: blur(10px);
		padding: 2rem;
		border-radius: 15px;
		box-shadow: 0 10px 30px rgba(0, 0, 0, 0.08);
		animation: fadeInUp 0.6s ease-out backwards;
		border: 1px solid rgba(255, 255, 255, 0.8);
		transition: all 0.3s ease;
	}
	
	.about-content p:nth-child(1) { animation-delay: 0.1s; }
	.about-content p:nth-child(2) { animation-delay: 0.2s; }
	.about-content p:nth-child(3) { animation-delay: 0.3s; }
	
	.about-content p:hover {
		transform: translateY(-5px);
		box-shadow: 0 15px 40px rgba(102, 126, 234, 0.15);
		border-color: #667eea;
	}
	
	.whatsapp-icon {
		width: 32px;
		height: 32px;
	}
	
	/* Sections Area - Premium Design */
	.sections-area {
		background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
		padding: 5rem 0;
		position: relative;
		overflow: hidden;
	}
	
	.sections-area::before {
		content: '';
		position: absolute;
		top: -30%;
		left: -10%;
		width: 500px;
		height: 500px;
		background: radial-gradient(circle, rgba(102, 126, 234, 0.1) 0%, transparent 70%);
		border-radius: 50%;
		animation: float 20s ease-in-out infinite;
	}
	
	.sections-area h2 {
		text-align: center;
		font-size: 2.5rem;
		margin-bottom: 3rem;
		background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
		-webkit-background-clip: text;
		-webkit-text-fill-color: transparent;
		background-clip: text;
		animation: fadeInUp 0.8s ease-out;
	}
	
	.sections-list {
		max-width: 900px;
		margin: 0 auto;
		position: relative;
		z-index: 1;
	}
	
	.section-item {
		background: rgba(255, 255, 255, 0.95);
		backdrop-filter: blur(10px);
		padding: 2.5rem;
		margin-bottom: 2rem;
		border-radius: 20px;
		box-shadow: 0 10px 40px rgba(0, 0, 0, 0.08);
		border: 1px solid rgba(255, 255, 255, 0.8);
		transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
		animation: fadeInUp 0.6s ease-out backwards;
		display: flex;
		gap: 2rem;
		align-items: flex-start;
	}
	
	.section-item:nth-child(1) { animation-delay: 0.1s; }
	.section-item:nth-child(2) { animation-delay: 0.2s; }
	.section-item:nth-child(3) { animation-delay: 0.3s; }
	.section-item:nth-child(4) { animation-delay: 0.4s; }
	.section-item:nth-child(5) { animation-delay: 0.5s; }
	
	.section-item:hover {
		transform: translateY(-8px) scale(1.02);
		box-shadow: 0 20px 60px rgba(102, 126, 234, 0.2);
		border-color: #667eea;
	}
	
	.section-image {
		flex: 0 0 200px;
		height: 150px;
		border-radius: 15px;
		overflow: hidden;
		box-shadow: 0 4px 15px rgba(0, 0, 0, 0.1);
	}
	
	.section-image img {
		width: 100%;
		height: 100%;
		object-fit: cover;
		transition: transform 0.4s ease;
	}
	
	.section-item:hover .section-image img {
		transform: scale(1.1);
	}
	
	.section-content {
		flex: 1;
	}
	
	.section-item h3 {
		background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
		-webkit-background-clip: text;
		-webkit-text-fill-color: transparent;
		background-clip: text;
		margin-bottom: 1rem;
		font-size: 1.5rem;
		font-weight: 700;
		display: flex;
		align-items: center;
		gap: 0.5rem;
	}
	
	.section-item h3::before {
		content: '💡';
		font-size: 1.5rem;
		animation: pulse 2s ease-in-out infinite;
	}
	
	.section-item p {
		color: #4b5563;
		line-height: 1.8;
		margin: 0;
		font-size: 1.05rem;
	}
	
	/* Mobile adjustments for sections */
	@media (max-width: 768px) {
		.section-item {
			flex-direction: column;
			padding: 1.5rem;
		}
		
		.section-image {
			flex: 0 0 auto;
			width: 100%;
			height: 200px;
		}
	}

	/* Responsive adjustments */
	@media (max-width: 768px) {
		.footer-links {
			flex-direction: column;
			gap: 0.75rem;
		}
		
		.footer-separator {
			display: none;
		}
		
		.whatsapp-float {
			width: 50px;
			height: 50px;
			bottom: 15px;
			left: 15px;
		}
		
		.whatsapp-icon {
			width: 28px;
			height: 28px;
		}
	}
</style>
