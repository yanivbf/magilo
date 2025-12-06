<script>
	import { setContext } from 'svelte';
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
	
	console.log('👤 Is owner:', data.isOwner);
	console.log('🆔 Page ID:', data.page.id);
	console.log('📄 Document ID:', data.page.documentId);
	
	// Edit mode - enabled for owners (inline editing like the old system)
	const editMode = $derived(data.isOwner);
	
	console.log('🎨 Edit mode (view page):', editMode);
	
	setContext('editMode', () => editMode);
	setContext('pageId', data.page.documentId || data.page.id);
	setContext('pageData', data.page); // Add full page data to context
	setContext('saveField', saveField);
	
	// Save field function
	async function saveField(field, value) {
		try {
			console.log(`💾 Saving field: "${field}"`);
			console.log(`💾 Value:`, typeof value === 'string' ? value.substring(0, 100) : value);
			
			// CRITICAL: Use documentId for Strapi v5 (more stable than numeric ID)
			const pageId = data.page.documentId || data.page.id;
			console.log(`📄 Page ID (documentId):`, pageId);
			
			showNotification('⏳ שומר...');
			
			// Build the request body
			const requestBody = {
				pageId: pageId,
				field: field,
				value: value
			};
			
			console.log('📦 Request body:', JSON.stringify(requestBody).substring(0, 300));
			
			const response = await fetch(`/api/update-page`, {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json'
				},
				body: JSON.stringify(requestBody)
			});
			
			console.log(`📡 Response status:`, response.status);
			
			if (!response.ok) {
				const errorData = await response.json().catch(() => ({ error: 'Unknown error' }));
				console.error('❌ Failed to save:', response.status, errorData);
				showNotification(`❌ שגיאה: ${errorData.error || 'שגיאה בשמירה'}`);
				throw new Error(errorData.error || 'Save failed');
			}
			
			const result = await response.json();
			console.log('✅ Saved successfully:', result);
			showNotification('✅ נשמר בהצלחה!');
			
		} catch (error) {
			console.error('❌ Error saving:', error);
			showNotification('❌ שגיאה בשמירה');
			throw error; // Re-throw so calling code knows it failed
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
	}
	
	const youtubeId = getYouTubeId(videoUrl);
	
	console.log('🎥 Video URL:', videoUrl);
	console.log('🎥 YouTube ID:', youtubeId);
	console.log('🎥 Embed Video:', embedVideo);
	
	// Set saveField in context
	setContext('saveField', saveField);
	
	// Get CTA button text and icon based on page type
	function getCtaButton(pageType) {
		const ctaMap = {
			'store': { icon: '🛒', text: 'קנה עכשיו' },
			'service': { icon: '📅', text: 'קבע תור' },
			'event': { icon: '🎟️', text: 'הזמן כרטיסים' },
			'artist': { icon: '📅', text: 'קבע תור' },
			'course': { icon: '📝', text: 'הרשם עכשיו' },
			'workshop': { icon: '📝', text: 'הרשם עכשיו' },
			'restaurant': { icon: '📅', text: 'הזמן שולחן' }
		};
		
		return ctaMap[pageType] || { icon: '📞', text: 'התקשר עכשיו' };
	}
	
	const ctaButton = getCtaButton(data.page.pageType);
	
	let uploadingHeroImage = $state(false);
	
	// Upload header image
	async function changeHeroImage(event) {
		event.stopPropagation();
		
		const input = document.createElement('input');
		input.type = 'file';
		input.accept = 'image/*';
		
		input.onchange = async (e) => {
			const file = e.target.files[0];
			if (!file) return;
			
			uploadingHeroImage = true;
			showNotification('⏳ מעלה תמונה...');
			
			const formData = new FormData();
			formData.append('image', file);
			formData.append('userId', data.page.userId || 'temp');
			formData.append('pageName', data.page.slug || 'hero-background');
			
			try {
				const uploadResponse = await fetch('/api/upload-image', {
					method: 'POST',
					body: formData
				});
				
				if (uploadResponse.ok) {
					const { url } = await uploadResponse.json();
					
					console.log('📸 Uploaded image URL:', url);
					
					// Update page metadata
					const updateResponse = await fetch('/api/update-page', {
						method: 'POST',
						headers: {
							'Content-Type': 'application/json'
						},
						body: JSON.stringify({
							pageId: data.page.documentId || data.page.id,
							metadata: {
								...(data.page.metadata || {}),
								headerImage: url
							}
						})
					});
					
					console.log('📡 Update response status:', updateResponse.status);
					
					if (updateResponse.ok) {
						const result = await updateResponse.json();
						console.log('✅ Update result:', result);
						showNotification('✅ תמונת הרקע עודכנה');
						setTimeout(() => {
							window.location.reload();
						}, 500);
					} else {
						const error = await updateResponse.text();
						console.error('❌ Update failed:', error);
						showNotification('❌ שגיאה בעדכון');
						uploadingHeroImage = false;
					}
				} else {
					const error = await uploadResponse.text();
					console.error('❌ Upload failed:', uploadResponse.status, error);
					showNotification('❌ שגיאה בהעלאת התמונה');
					uploadingHeroImage = false;
				}
			} catch (error) {
				console.error('❌ Error uploading image:', error);
				showNotification('❌ שגיאה בהעלאת התמונה');
				uploadingHeroImage = false;
			}
		};
		
		input.click();
	}
	
	// Save page to user's area
	async function savePageToMyArea(event) {
		event.stopPropagation();
		
		// Save button reference before any async operations
		const btn = event.currentTarget;
		
		// Check if user is logged in
		const userId = document.cookie
			.split('; ')
			.find(row => row.startsWith('userId='))
			?.split('=')[1];
		
		if (!userId) {
			showNotification('⚠️ יש להתחבר כדי לשמור דף');
			setTimeout(() => {
				window.location.href = '/login';
			}, 1500);
			return;
		}
		
		// Get user info from localStorage
		let userName = '';
		let userEmail = '';
		try {
			const currentUserStr = localStorage.getItem('currentUser');
			if (currentUserStr) {
				const currentUser = JSON.parse(currentUserStr);
				userName = currentUser.user_metadata?.name || 
				          currentUser.user_metadata?.full_name || 
				          currentUser.email?.split('@')[0] || '';
				userEmail = currentUser.email || '';
			}
		} catch (e) {
			console.log('Could not get user info from localStorage');
		}
		
		showNotification('⏳ שומר דף...');
		
		try {
			const response = await fetch('/api/save-page-to-user', {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json'
				},
				body: JSON.stringify({
					pageId: data.page.documentId || data.page.id,
					userId: userId,
					userName: userName,
					userEmail: userEmail
				})
			});
			
			if (response.ok) {
				const result = await response.json();
				console.log('✅ Page saved:', result);
				showNotification('✅ הדף נשמר בהצלחה!');
				
				// Update button to show saved state (check if button still exists)
				if (btn && btn.parentNode) {
					btn.innerHTML = `
						<svg class="save-icon" fill="currentColor" stroke="none" viewBox="0 0 24 24">
							<path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/>
						</svg>
						<span>✓ נשמר</span>
					`;
					btn.classList.add('saved');
				}
				
				// Redirect to dashboard after 1 second (like old system)
				// Use replace to prevent back button issues
				setTimeout(() => {
					window.location.replace(`/dashboard?userId=${userId}`);
				}, 1000);
			} else {
				const error = await response.json();
				console.error('❌ Save failed:', error);
				
				if (error.alreadySaved) {
					showNotification('ℹ️ הדף כבר שמור באזור שלך');
					// Update button to show saved state
					if (btn && btn.parentNode) {
						btn.innerHTML = `
							<svg class="save-icon" fill="currentColor" stroke="none" viewBox="0 0 24 24">
								<path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/>
							</svg>
							<span>✓ נשמר</span>
						`;
						btn.classList.add('saved');
					}
					
					// Redirect to dashboard after 1 second
					setTimeout(() => {
						window.location.href = `/dashboard?userId=${userId}`;
					}, 1000);
				} else if (error.needsLogin) {
					showNotification('⚠️ יש להתחבר מחדש');
					setTimeout(() => {
						window.location.href = '/login';
					}, 1500);
				} else {
					showNotification('❌ שגיאה בשמירת הדף');
				}
			}
		} catch (error) {
			console.error('❌ Error saving page:', error);
			showNotification('❌ שגיאה בשמירת הדף');
		}
	}
	

</script>

<svelte:head>
	<title>{data.page.title}</title>
	{#if data.page.description}
		<meta name="description" content={data.page.description} />
	{/if}
</svelte:head>

<!-- Edit Mode Indicator removed - editing is always enabled silently -->

<!-- Render sections-based page with modern design -->
{#if data.page.hasSections}
	<div class="modern-page">
		<!-- Navigation Bar with Section Links -->
		<NavigationBar pageData={data.page} />
		
		<!-- Simple Action Buttons (only for owners) -->
		{#if data.isOwner}
			<div class="owner-action-buttons">
				<button onclick={changeHeroImage} class="action-btn upload-btn" class:uploading={uploadingHeroImage} disabled={uploadingHeroImage}>
					{#if uploadingHeroImage}
						<div class="btn-spinner"></div>
						<span>מעלה...</span>
					{:else}
						<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
							<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"></path>
						</svg>
						<span>העלה תמונה</span>
					{/if}
				</button>
				
				<button onclick={savePageToMyArea} class="action-btn save-btn">
					<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
						<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4"></path>
					</svg>
					<span>שמור לאזור שלי</span>
				</button>
			</div>
		{/if}
		
		<!-- Hero Section -->
		<section 
			class="hero-section" 
			id="hero"
			style={data.page.metadata?.headerImage ? `background-image: url('${data.page.metadata.headerImage}');` : ''}
		>
			
			<div class="hero-content">
				{#if editMode}
					<EditableText
						value={data.page.title}
						onsave={(value) => saveField('title', value)}
						className="hero-title"
						tag="h1"
					/>
					{#if data.page.description || editMode}
						<EditableText
							value={data.page.description || 'תיאור הדף...'}
							onsave={(value) => saveField('description', value)}
							className="hero-description"
							tag="p"
						/>
					{/if}
				{:else}
					<h1 class="hero-title">
						{data.page.title}
					</h1>
					{#if data.page.description}
						<p class="hero-description">
							{data.page.description}
						</p>
					{/if}
				{/if}
				
				{#if data.page.phone}
					<a 
						href={data.page.pageType === 'store' ? '#products' : `tel:${data.page.phone}`} 
						class="cta-button"
						onclick={(e) => {
							if (data.page.pageType === 'store') {
								e.preventDefault();
								document.getElementById('products')?.scrollIntoView({ behavior: 'smooth' });
							}
						}}
					>
						{ctaButton.icon} {ctaButton.text}
					</a>
				{/if}
			</div>
			<div class="hero-decoration"></div>
		</section>
		

		
		<!-- Dynamic Sections -->
		{#each data.page.sections as section, sectionIndex}
			{#if section.enabled}
				{#if section.type === 'gallery'}
					<div id="gallery">
						<GallerySection 
							data={section.data} 
							pageId={data.page.documentId || data.page.id}
							sectionId={section.id}
							sectionIndex={sectionIndex}
							editable={data.isOwner}
						/>
					</div>
				{:else if section.type === 'products'}
					<div id="products">
						<ProductsGallerySection 
							data={{ ...section.data, products: section.data.products || data.page.products || [], phone: data.page.phone }} 
							sectionIndex={sectionIndex}
							editable={false}
						/>
					</div>
				{:else if section.type === 'testimonials'}
					<div id="testimonials">
						<TestimonialsSection 
							data={section.data} 
							sectionIndex={sectionIndex}
						/>
					</div>
				{:else if section.type === 'faq'}
					<div id="faq">
						<FAQSection 
							data={section.data} 
							sectionIndex={sectionIndex}
						/>
					</div>
				{:else if section.type === 'about'}
					<div id="about">
						<AboutSection 
							data={section.data} 
							sectionIndex={sectionIndex}
						/>
					</div>
				{:else if section.type === 'video'}
					<div id="video">
						<VideoSection 
							data={section.data} 
							sectionIndex={sectionIndex}
						/>
					</div>
				{:else if section.type === 'video-old'}
					<div id="video">
						<VideoSection 
							data={section.data} 
							sectionIndex={sectionIndex}
						/>
					</div>
				{:else if section.type === 'services'}
					<div id="services">
						<ServicesSection 
							data={section.data} 
							sectionIndex={sectionIndex}
						/>
					</div>
				{:else if section.type === 'pricing'}
					<div id="pricing">
						<PricingSection 
							data={section.data} 
							sectionIndex={sectionIndex}
						/>
					</div>
				{:else if section.type === 'team'}
					<div id="team">
						<TeamSection 
							data={section.data} 
							sectionIndex={sectionIndex}
						/>
					</div>
				{/if}
			{/if}
		{/each}
		
		<!-- Footer -->
		<footer class="site-footer">
			<!-- Row 1: Social Media + Contact Info -->
			<div class="footer-row footer-contact-row">
				<!-- Social Media Icons - Always Show -->
				<div class="footer-social-icons">
					<a href={data.page.facebook || '#'} target="_blank" rel="noopener" class="social-icon" title="Facebook">
						<svg viewBox="0 0 24 24" fill="currentColor">
							<path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
						</svg>
					</a>
					<a href={data.page.instagram || '#'} target="_blank" rel="noopener" class="social-icon" title="Instagram">
						<svg viewBox="0 0 24 24" fill="currentColor">
							<path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
						</svg>
					</a>
					<a href={data.page.tiktok || '#'} target="_blank" rel="noopener" class="social-icon" title="TikTok">
						<svg viewBox="0 0 24 24" fill="currentColor">
							<path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 5 20.1a6.34 6.34 0 0 0 10.86-4.43v-7a8.16 8.16 0 0 0 4.77 1.52v-3.4a4.85 4.85 0 0 1-1-.1z"/>
						</svg>
					</a>
					<a href={data.page.twitter || '#'} target="_blank" rel="noopener" class="social-icon" title="Twitter">
						<svg viewBox="0 0 24 24" fill="currentColor">
							<path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z"/>
						</svg>
					</a>
					<a href={data.page.linkedin || '#'} target="_blank" rel="noopener" class="social-icon" title="LinkedIn">
						<svg viewBox="0 0 24 24" fill="currentColor">
							<path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
						</svg>
					</a>
				</div>
				
				<!-- Contact Info -->
				{#if data.page.phone}
					<a href="tel:{data.page.phone}" class="footer-contact-item">
						<span class="contact-icon">📞</span>
						<span>{data.page.phone}</span>
					</a>
				{/if}
				{#if data.page.email}
					<a href="mailto:{data.page.email}" class="footer-contact-item">
						<span class="contact-icon">✉️</span>
						<span>{data.page.email}</span>
					</a>
				{/if}
				{#if data.page.address}
					<div class="footer-contact-item">
						<span class="contact-icon">📍</span>
						<span>{data.page.address}</span>
					</div>
				{/if}
			</div>
			
			<!-- Row 2: Legal Links -->
			<div class="footer-row footer-legal-row">
				<a href="/legal/terms">תנאי שימוש</a>
				<span class="separator">|</span>
				<a href="/legal/privacy">מדיניות פרטיות</a>
				<span class="separator">|</span>
				<a href="/legal/accessibility">הצהרת נגישות</a>
			</div>
			
			<!-- Row 3: Copyright -->
			<div class="footer-row footer-copyright-row">
				<p>© {new Date().getFullYear()} כל הזכויות שמורות</p>
			</div>
		</footer>
	</div>
	
	<!-- WhatsApp Bot Bubble (always show for now - TODO: add proper auth) -->
	{#if data.page.phone}
		<a 
			href="https://wa.me/972{data.page.phone.replace(/^0/, '').replace(/[^0-9]/g, '')}" 
			target="_blank" 
			rel="noopener"
			class="whatsapp-bubble"
			title="פתח WhatsApp"
		>
			<svg viewBox="0 0 24 24" fill="white">
				<path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.890-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/>
			</svg>
		</a>
	{/if}
	
	<!-- Accessibility Menu -->
	<AccessibilityMenu />
	
	<!-- Chat Bot Bubble -->
	<ChatBotBubble />

<!-- Render HTML-based page (legacy) -->
{:else if data.page.htmlContent}
	{@html data.page.htmlContent}
{:else}
	<div style="padding: 2rem; text-align: center;">
		<h1>הדף עדיין לא מוכן</h1>
		<p>הדף נמצא בתהליך יצירה</p>
	</div>
{/if}

<style>
	:global(body) {
		margin: 0;
		padding: 0;
		font-family: 'Rubik', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
	}
	
	.modern-page {
		min-height: 100vh;
		background: #ffffff;
	}
	
	/* Edit Toolbar */
	.edit-toolbar-top {
		position: fixed;
		top: 80px;
		left: 50%;
		transform: translateX(-50%);
		background: white;
		padding: 0.75rem 1rem;
		border-radius: 50px;
		box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);
		display: flex;
		gap: 0.75rem;
		z-index: 9999;
		animation: slideDown 0.3s ease-out;
		direction: rtl;
	}
	
	@keyframes slideDown {
		from {
			opacity: 0;
			transform: translateX(-50%) translateY(-20px);
		}
		to {
			opacity: 1;
			transform: translateX(-50%) translateY(0);
		}
	}
	
	.toolbar-btn {
		display: flex;
		align-items: center;
		gap: 0.5rem;
		padding: 0.75rem 1.5rem;
		border: none;
		border-radius: 50px;
		font-weight: 600;
		cursor: pointer;
		transition: all 0.2s;
		font-size: 0.95rem;
		text-decoration: none;
		background: #f3f4f6;
		color: #374151;
		font-family: 'Rubik', sans-serif;
	}
	
	.toolbar-btn:hover {
		transform: translateY(-2px);
		box-shadow: 0 4px 15px rgba(0, 0, 0, 0.1);
		background: #e5e7eb;
	}
	
	.toolbar-btn.primary {
		background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
		color: white;
	}
	
	.toolbar-btn.primary:hover {
		box-shadow: 0 4px 15px rgba(102, 126, 234, 0.4);
	}
	
	.toolbar-btn.secondary {
		background: #6b7280;
		color: white;
	}
	
	.toolbar-btn.secondary:hover {
		background: #4b5563;
		box-shadow: 0 4px 15px rgba(107, 114, 128, 0.4);
	}
	
	.toolbar-btn svg {
		width: 20px;
		height: 20px;
	}
	
	@media (max-width: 768px) {
		.edit-toolbar-top {
			top: 70px;
			padding: 0.5rem;
			gap: 0.5rem;
			flex-wrap: wrap;
			max-width: 90%;
		}
		
		.toolbar-btn {
			padding: 0.6rem 1rem;
			font-size: 0.85rem;
		}
		
		.toolbar-btn svg {
			width: 18px;
			height: 18px;
		}
	}
	
	/* Editable Elements */
	:global(.editable) {
		position: relative;
		cursor: text;
		transition: all 0.2s;
		border-radius: 8px;
		padding: 0.25rem;
		margin: -0.25rem;
	}
	
	:global(.editable:hover) {
		background: rgba(255, 255, 255, 0.1);
		outline: 2px dashed rgba(255, 255, 255, 0.3);
		outline-offset: 4px;
	}
	
	:global(.editable:focus) {
		background: rgba(255, 255, 255, 0.15);
		outline: 2px solid rgba(255, 255, 255, 0.5);
		outline-offset: 4px;
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
	

	/* Hero Section */
	.hero-section {
		position: relative;
		min-height: 500px;
		background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
		background-size: cover;
		background-position: center;
		background-repeat: no-repeat;
		display: flex;
		align-items: center;
		justify-content: center;
		overflow: hidden;
		padding: 3rem 2rem;
	}
	
	.hero-section::before {
		content: '';
		position: absolute;
		top: 0;
		left: 0;
		right: 0;
		bottom: 0;
		background: linear-gradient(135deg, rgba(102, 126, 234, 0.4) 0%, rgba(118, 75, 162, 0.4) 100%);
		z-index: 0;
	}
	

	

	
	.hero-decoration {
		position: absolute;
		top: -50%;
		right: -20%;
		width: 1000px;
		height: 1000px;
		background: radial-gradient(circle, rgba(255, 255, 255, 0.1) 0%, transparent 70%);
		border-radius: 50%;
		animation: float 20s ease-in-out infinite;
	}
	
	@keyframes float {
		0%, 100% { transform: translateY(0) rotate(0deg); }
		50% { transform: translateY(-50px) rotate(10deg); }
	}
	
	.hero-content {
		position: relative;
		z-index: 10;
		text-align: center;
		max-width: 800px;
		animation: fadeInUp 1s ease-out;
	}
	
	.hero-title {
		font-size: 2.5rem;
		font-weight: 800;
		color: white;
		margin-bottom: 1rem;
		text-shadow: 
			0 2px 4px rgba(0, 0, 0, 0.8),
			0 4px 8px rgba(0, 0, 0, 0.6),
			0 8px 16px rgba(0, 0, 0, 0.4),
			2px 2px 4px rgba(0, 0, 0, 0.9);
		line-height: 1.3;
	}
	
	/* Override EditableText styles for hero-title */
	:global(.hero-title.editable-text) {
		font-size: 2.5rem !important;
		font-weight: 800 !important;
		color: white !important;
		margin-bottom: 1rem !important;
		padding: 0.5rem !important;
		margin-left: -0.5rem !important;
		margin-right: -0.5rem !important;
		margin-top: 0 !important;
		min-height: auto !important;
		text-shadow: 
			0 2px 4px rgba(0, 0, 0, 0.8),
			0 4px 8px rgba(0, 0, 0, 0.6),
			0 8px 16px rgba(0, 0, 0, 0.4),
			2px 2px 4px rgba(0, 0, 0, 0.9) !important;
		line-height: 1.3 !important;
		border-radius: 8px !important;
	}
	
	:global(.hero-title.editable-text:hover) {
		background: rgba(255, 255, 255, 0.1) !important;
		outline: 2px dashed rgba(255, 255, 255, 0.5) !important;
	}
	
	:global(.hero-title.editable-text:focus) {
		background: rgba(255, 255, 255, 0.15) !important;
		outline: 2px solid rgba(255, 255, 255, 0.7) !important;
	}
	
	.hero-description {
		font-size: 1.1rem;
		color: white;
		margin-bottom: 2rem;
		line-height: 1.6;
		text-shadow: 
			0 2px 4px rgba(0, 0, 0, 0.8),
			0 4px 8px rgba(0, 0, 0, 0.6),
			2px 2px 4px rgba(0, 0, 0, 0.9);
	}
	
	/* Override EditableText styles for hero-description */
	:global(.hero-description.editable-text) {
		font-size: 1.1rem !important;
		color: white !important;
		margin-bottom: 2rem !important;
		padding: 0.5rem !important;
		margin-left: -0.5rem !important;
		margin-right: -0.5rem !important;
		margin-top: 0 !important;
		min-height: auto !important;
		line-height: 1.6 !important;
		border-radius: 8px !important;
		text-shadow: 
			0 2px 4px rgba(0, 0, 0, 0.8),
			0 4px 8px rgba(0, 0, 0, 0.6),
			2px 2px 4px rgba(0, 0, 0, 0.9) !important;
	}
	
	:global(.hero-description.editable-text:hover) {
		background: rgba(255, 255, 255, 0.1) !important;
		outline: 2px dashed rgba(255, 255, 255, 0.5) !important;
	}
	
	:global(.hero-description.editable-text:focus) {
		background: rgba(255, 255, 255, 0.15) !important;
		outline: 2px solid rgba(255, 255, 255, 0.7) !important;
	}
	
	.cta-button {
		display: inline-block;
		padding: 0.875rem 2rem;
		background: white;
		color: #667eea;
		font-size: 1rem;
		font-weight: 700;
		border-radius: 50px;
		text-decoration: none;
		box-shadow: 0 10px 40px rgba(0, 0, 0, 0.2);
		transition: all 0.3s ease;
		position: relative;
		z-index: 11;
	}
	
	.cta-button:hover {
		transform: translateY(-5px) scale(1.05);
		box-shadow: 0 15px 50px rgba(0, 0, 0, 0.3);
	}
	
	/* Video Container */
	.video-container {
		position: relative;
		width: 100%;
		max-width: 800px;
		margin: 2.5rem auto;
		padding-bottom: 56.25%; /* 16:9 aspect ratio */
		height: 0;
		overflow: hidden;
		border-radius: 24px;
		box-shadow: 0 20px 60px rgba(0, 0, 0, 0.4);
		animation: fadeInUp 1s ease-out 0.3s backwards;
	}
	
	.video-container iframe {
		position: absolute;
		top: 0;
		left: 0;
		width: 100%;
		height: 100%;
		border-radius: 24px;
	}
	
	.container {
		max-width: 1200px;
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
		margin-bottom: 2.5rem;
	}
	
	/* Contact Section */
	.contact-section {
		padding: 5rem 0;
		background: white;
	}
	
	/* Footer */
	.site-footer {
		background: #1a1a1a;
		color: white;
		padding: 1.5rem 0;
		direction: rtl;
	}
	
	.footer-row {
		max-width: 1200px;
		margin: 0 auto;
		padding: 0.75rem 2rem;
		display: flex;
		align-items: center;
		justify-content: center;
		gap: 1.5rem;
		flex-wrap: wrap;
		border-bottom: 1px solid rgba(255, 255, 255, 0.1);
	}
	
	.footer-row:last-child {
		border-bottom: none;
	}
	
	/* Row 1: Social Media + Contact Info */
	.footer-contact-row {
		font-size: 0.9rem;
		justify-content: center;
		position: relative;
		gap: 2rem;
	}
	
	.footer-social-icons {
		display: flex;
		align-items: center;
		gap: 0.75rem;
		padding-right: 0;
		border-right: none;
		position: absolute;
		right: 2rem;
	}
	
	.social-icon {
		display: flex;
		align-items: center;
		justify-content: center;
		width: 36px;
		height: 36px;
		border-radius: 50%;
		transition: all 0.3s ease;
		text-decoration: none;
	}
	
	.social-icon:hover {
		transform: translateY(-3px) scale(1.1);
		box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
	}
	
	.social-icon svg {
		width: 20px;
		height: 20px;
	}
	
	/* Facebook - Blue */
	.social-icon:nth-child(1) {
		background: #1877F2;
		color: white;
	}
	
	/* Instagram - Gradient */
	.social-icon:nth-child(2) {
		background: linear-gradient(45deg, #f09433 0%, #e6683c 25%, #dc2743 50%, #cc2366 75%, #bc1888 100%);
		color: white;
	}
	
	/* TikTok - Black */
	.social-icon:nth-child(3) {
		background: #000000;
		color: white;
	}
	
	/* Twitter - Light Blue */
	.social-icon:nth-child(4) {
		background: #1DA1F2;
		color: white;
	}
	
	/* LinkedIn - Blue */
	.social-icon:nth-child(5) {
		background: #0A66C2;
		color: white;
	}
	
	.social-icon.whatsapp-icon {
		display: none !important;
	}
	
	.footer-contact-item {
		display: flex;
		align-items: center;
		gap: 0.4rem;
		color: rgba(255, 255, 255, 0.9);
		text-decoration: none;
		transition: color 0.3s ease;
		white-space: nowrap;
	}
	
	.footer-contact-item:hover {
		color: white;
	}
	
	.contact-icon {
		font-size: 1.1rem;
	}
	
	/* Row 2: Legal Links */
	.footer-legal-row {
		font-size: 0.85rem;
	}
	
	.footer-legal-row a {
		color: rgba(255, 255, 255, 0.8);
		text-decoration: none;
		transition: color 0.3s ease;
	}
	
	.footer-legal-row a:hover {
		color: white;
	}
	
	.footer-legal-row .separator {
		color: rgba(255, 255, 255, 0.3);
	}
	
	/* Row 3: Copyright */
	.footer-copyright-row {
		font-size: 0.8rem;
		color: rgba(255, 255, 255, 0.6);
		padding-bottom: 0.5rem;
	}
	
	.footer-copyright-row p {
		margin: 0;
	}
	
	/* Responsive Design */
	@media (max-width: 768px) {
		.footer-row {
			font-size: 0.85rem;
			padding: 0.5rem 1rem;
		}
		
		.footer-contact-row {
			flex-direction: column;
			gap: 0.75rem;
			justify-content: center;
		}
		
		.footer-social-icons {
			position: static;
			padding-right: 0;
			border-right: none;
			padding-bottom: 0.5rem;
			border-bottom: 1px solid rgba(255, 255, 255, 0.2);
		}
		
		.social-icon {
			width: 28px;
			height: 28px;
		}
		
		.social-icon svg {
			width: 18px;
			height: 18px;
		}
		
		.footer-contact-item {
			margin: 0;
		}
	}
	
	/* WhatsApp Bubble - Left Side */
	.whatsapp-bubble {
		position: fixed;
		bottom: 30px;
		left: 30px;
		width: 60px;
		height: 60px;
		background: #25D366;
		border-radius: 50%;
		display: flex;
		align-items: center;
		justify-content: center;
		box-shadow: 0 4px 20px rgba(37, 211, 102, 0.4);
		z-index: 9998;
		transition: all 0.3s ease;
		animation: pulse 2s infinite;
	}
	
	.whatsapp-bubble:hover {
		transform: scale(1.1);
		box-shadow: 0 6px 30px rgba(37, 211, 102, 0.6);
	}
	
	.whatsapp-bubble svg {
		width: 32px;
		height: 32px;
	}
	
	@keyframes pulse {
		0%, 100% {
			box-shadow: 0 4px 20px rgba(37, 211, 102, 0.4);
		}
		50% {
			box-shadow: 0 4px 30px rgba(37, 211, 102, 0.7);
		}
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
		.hero-title {
			font-size: 1.75rem;
		}
		
		.hero-description {
			font-size: 1rem;
		}
		
		.section-title {
			font-size: 1.5rem;
		}
		
		.cta-button {
			padding: 0.75rem 1.5rem;
			font-size: 0.95rem;
		}
		

	}
	
	/* Owner Action Buttons - Simple and Clean */
	.owner-action-buttons {
		position: fixed;
		top: 150px;
		left: 20px;
		z-index: 999;
		display: flex;
		gap: 10px;
		flex-direction: column;
	}
	
	.action-btn {
		display: flex;
		align-items: center;
		gap: 8px;
		padding: 12px 20px;
		border: none;
		border-radius: 12px;
		font-size: 16px;
		font-weight: 600;
		cursor: pointer;
		transition: all 0.3s ease;
		box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
		backdrop-filter: blur(10px);
	}
	
	.action-btn svg {
		width: 20px;
		height: 20px;
	}
	
	.upload-btn {
		background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
		color: white;
	}
	
	.upload-btn:hover {
		transform: translateY(-2px);
		box-shadow: 0 6px 20px rgba(102, 126, 234, 0.4);
	}
	
	.save-btn {
		background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
		color: white;
	}
	
	.save-btn:hover {
		transform: translateY(-2px);
		box-shadow: 0 6px 20px rgba(245, 87, 108, 0.4);
	}
	
	.save-btn.saved {
		background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%);
	}
	
	.action-btn:disabled {
		opacity: 0.7;
		cursor: not-allowed;
	}
	
	.action-btn.uploading {
		pointer-events: none;
	}
	
	.btn-spinner {
		width: 20px;
		height: 20px;
		border: 3px solid rgba(255, 255, 255, 0.3);
		border-top-color: white;
		border-radius: 50%;
		animation: spin 0.8s linear infinite;
	}
	
	@keyframes spin {
		to { transform: rotate(360deg); }
	}
	
	/* Mobile responsive for action buttons */
	@media (max-width: 768px) {
		.owner-action-buttons {
			top: 120px;
			left: 10px;
			gap: 8px;
		}
		
		.action-btn {
			padding: 10px 16px;
			font-size: 14px;
		}
		
		.action-btn span {
			display: none;
		}
		
		.action-btn svg {
			width: 24px;
			height: 24px;
		}
	}
</style>
