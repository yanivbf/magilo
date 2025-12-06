<script>
	import { setContext } from 'svelte';
	import { goto } from '$app/navigation';
	import NavigationBar from '$lib/components/NavigationBar.svelte';
	import GallerySection from '$lib/components/sections/GallerySection.svelte';
	import ProductsGallerySection from '$lib/components/sections/ProductsGallerySection.svelte';
	import TestimonialsSection from '$lib/components/sections/TestimonialsSection.svelte';
	import FAQSection from '$lib/components/sections/FAQSection.svelte';
	import AboutSection from '$lib/components/sections/AboutSection-editable.svelte';
	import ContactSection from '$lib/components/sections/ContactSection.svelte';
	import ServicesSection from '$lib/components/sections/ServicesSection.svelte';
	import PricingSection from '$lib/components/sections/PricingSection.svelte';
	import TeamSection from '$lib/components/sections/TeamSection.svelte';
	import VideoSection from '$lib/components/sections/VideoSection.svelte';
	import AccessibilityMenu from '$lib/components/AccessibilityMenu.svelte';
	import ChatBotBubble from '$lib/components/ChatBotBubble.svelte';
	import EditableText from '$lib/components/editing/EditableText.svelte';
	
	/** @type {import('./$types').PageData} */
	let { data } = $props();
	
	console.log('🎨 Edit page - Page ID:', data.page.id);
	console.log('📄 Edit page - Document ID:', data.page.documentId);
	
	// INLINE EDIT MODE - always enabled on edit page
	const editMode = $derived(true);
	
	console.log('✏️ Edit mode enabled:', editMode);
	
	setContext('editMode', () => editMode);
	setContext('pageId', data.page.documentId || data.page.id);
	
	// Save field function
	async function saveField(field, value) {
		try {
			console.log(`💾 Saving ${field}:`, value);
			console.log(`📄 Page ID:`, data.page.documentId || data.page.id);
			
			const response = await fetch(`/api/update-page`, {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json'
				},
				body: JSON.stringify({
					pageId: data.page.documentId || data.page.id,
					[field]: value
				})
			});
			
			console.log(`📡 Response status:`, response.status);
			
			if (response.ok) {
				const result = await response.json();
				console.log('✅ Saved successfully:', result);
				showNotification('✅ נשמר בהצלחה');
			} else {
				const errorText = await response.text();
				console.error('❌ Failed to save:', response.status, errorText);
				showNotification('❌ שגיאה בשמירה');
			}
		} catch (error) {
			console.error('❌ Error saving:', error);
			showNotification('❌ שגיאה בשמירה');
		}
	}
	
	// Show notification
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
	
	// Extract YouTube video ID from URL
	function getYouTubeId(url) {
		if (!url) return null;
		const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
		const match = url.match(regExp);
		return (match && match[2].length === 11) ? match[2] : null;
	}
	
	// Get video URL from metadata or sections
	let videoUrl = data.page.metadata?.videoUrl || '';
	let embedVideo = data.page.metadata?.embedYoutubeVideo || false;
	
	// Also check if there's a hero section with video
	const heroSection = data.page.sections?.find(s => s.type === 'hero');
	if (heroSection?.data?.videoUrl) {
		videoUrl = heroSection.data.videoUrl;
		embedVideo = true;
	}
	
	// Get header image
	const headerImage = data.page.metadata?.headerImage || data.page.headerImage || '';
	
	// Get social links
	const socialLinks = data.page.metadata?.socialLinks || {};
	
	// Sort sections by order
	const sortedSections = data.page.sections?.sort((a, b) => (a.order || 0) - (b.order || 0)) || [];
	
	// Filter enabled sections
	const enabledSections = sortedSections.filter(s => s.enabled !== false);
	
	console.log('📋 Sections:', enabledSections.length);
</script>

<svelte:head>
	<title>עריכת {data.page?.title || 'דף'}</title>
</svelte:head>

<!-- INLINE EDITING MODE - Click on any element to edit it -->
<div class="page-container" dir="rtl">
	<!-- Save Button (Floating) -->
	<button 
		onclick={() => goto('/dashboard')}
		class="floating-save-btn"
		title="חזור לדשבורד"
	>
		💾 שמור וחזור לדשבורד
	</button>
	
	<!-- Hero Section with Editable Title -->
	<section class="hero-section" style="background-image: url('{headerImage}');">
		<div class="hero-overlay"></div>
		<div class="hero-content">
			<EditableText 
				value={data.page.title} 
				field="title" 
				onSave={saveField}
				class="hero-title"
			/>
			<EditableText 
				value={data.page.description || 'תיאור העסק'} 
				field="description" 
				onSave={saveField}
				class="hero-description"
			/>
		</div>
	</section>
	
	<!-- Navigation Bar -->
	<NavigationBar 
		phone={data.page.phone}
		email={data.page.email}
		address={data.page.address}
		socialLinks={socialLinks}
	/>
	
	<!-- Video Section (if enabled) -->
	{#if embedVideo && videoUrl}
		{@const youtubeId = getYouTubeId(videoUrl)}
		{#if youtubeId}
			<section class="video-section">
				<div class="container">
					<div class="video-wrapper">
						<iframe
							src="https://www.youtube.com/embed/{youtubeId}"
							title="YouTube video"
							frameborder="0"
							allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
							allowfullscreen
						></iframe>
					</div>
				</div>
			</section>
		{/if}
	{/if}
	
	<!-- Dynamic Sections -->
	{#each enabledSections as section (section.id)}
		{#if section.type === 'about'}
			<AboutSection data={section.data} sectionId={section.id} />
		{:else if section.type === 'services'}
			<ServicesSection data={section.data} sectionId={section.id} />
		{:else if section.type === 'pricing'}
			<PricingSection data={section.data} sectionId={section.id} />
		{:else if section.type === 'team'}
			<TeamSection data={section.data} sectionId={section.id} />
		{:else if section.type === 'video'}
			<VideoSection data={section.data} sectionId={section.id} />
		{:else if section.type === 'gallery'}
			<GallerySection data={section.data} sectionId={section.id} />
		{:else if section.type === 'products'}
			<ProductsGallerySection 
				pageId={data.page.id} 
				products={data.page.products || data.page.storeProducts || []} 
			/>
		{:else if section.type === 'testimonials'}
			<TestimonialsSection data={section.data} sectionId={section.id} />
		{:else if section.type === 'faq'}
			<FAQSection data={section.data} sectionId={section.id} />
		{:else if section.type === 'contact'}
			<ContactSection 
				phone={data.page.phone}
				email={data.page.email}
				address={data.page.address}
				socialLinks={socialLinks}
			/>
		{/if}
	{/each}
	
	<!-- Accessibility Menu -->
	<AccessibilityMenu />
	
	<!-- Chat Bot Bubble -->
	<ChatBotBubble pageId={data.page.id} />
</div>

<style>
	.page-container {
		min-height: 100vh;
		background: #f9fafb;
	}
	
	/* Floating Save Button */
	.floating-save-btn {
		position: fixed;
		top: 20px;
		left: 20px;
		z-index: 9999;
		background: linear-gradient(135deg, #10b981 0%, #059669 100%);
		color: white;
		border: none;
		padding: 12px 24px;
		border-radius: 12px;
		font-size: 16px;
		font-weight: bold;
		cursor: pointer;
		box-shadow: 0 4px 12px rgba(16, 185, 129, 0.4);
		transition: all 0.3s;
	}
	
	.floating-save-btn:hover {
		transform: translateY(-2px);
		box-shadow: 0 6px 16px rgba(16, 185, 129, 0.5);
	}
	
	/* Hero Section */
	.hero-section {
		position: relative;
		min-height: 500px;
		background-size: cover;
		background-position: center;
		display: flex;
		align-items: center;
		justify-content: center;
		text-align: center;
		padding: 4rem 2rem;
	}
	
	.hero-overlay {
		position: absolute;
		top: 0;
		left: 0;
		right: 0;
		bottom: 0;
		background: linear-gradient(135deg, rgba(102, 126, 234, 0.8) 0%, rgba(118, 75, 162, 0.8) 100%);
	}
	
	.hero-content {
		position: relative;
		z-index: 1;
		max-width: 800px;
		color: white;
	}
	
	:global(.hero-title) {
		font-size: 3.5rem;
		font-weight: bold;
		margin-bottom: 1rem;
		text-shadow: 0 2px 8px rgba(0, 0, 0, 0.3);
	}
	
	:global(.hero-description) {
		font-size: 1.5rem;
		opacity: 0.95;
		text-shadow: 0 1px 4px rgba(0, 0, 0, 0.3);
	}
	
	/* Video Section */
	.video-section {
		padding: 4rem 0;
		background: white;
	}
	
	.container {
		max-width: 1200px;
		margin: 0 auto;
		padding: 0 2rem;
	}
	
	.video-wrapper {
		position: relative;
		padding-bottom: 56.25%; /* 16:9 aspect ratio */
		height: 0;
		overflow: hidden;
		border-radius: 12px;
		box-shadow: 0 8px 24px rgba(0, 0, 0, 0.1);
	}
	
	.video-wrapper iframe {
		position: absolute;
		top: 0;
		left: 0;
		width: 100%;
		height: 100%;
	}
	
	/* Save Notification */
	:global(.save-notification) {
		position: fixed;
		top: 80px;
		left: 50%;
		transform: translateX(-50%) translateY(-20px);
		background: white;
		padding: 16px 32px;
		border-radius: 12px;
		box-shadow: 0 8px 24px rgba(0, 0, 0, 0.15);
		font-size: 16px;
		font-weight: 600;
		z-index: 10000;
		opacity: 0;
		transition: all 0.3s;
	}
	
	:global(.save-notification.show) {
		opacity: 1;
		transform: translateX(-50%) translateY(0);
	}
</style>
