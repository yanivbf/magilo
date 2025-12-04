<script>
	let { pageData } = $props();
	let mobileMenuOpen = $state(false);
	
	function toggleMobileMenu() {
		mobileMenuOpen = !mobileMenuOpen;
	}
	
	function scrollToSection(sectionId) {
		const element = document.getElementById(sectionId);
		if (element) {
			element.scrollIntoView({ behavior: 'smooth', block: 'start' });
		}
		mobileMenuOpen = false;
	}
	
	// Map section types to labels
	const sectionLabels = {
		about: 'אודות',
		services: 'שירותים',
		pricing: 'מחירון',
		team: 'הצוות',
		gallery: 'גלריה',
		products: 'מוצרים',
		video: 'סרטון',
		testimonials: 'המלצות',
		faq: 'שאלות'
	};
	
	// Preferred order for navigation items
	const preferredOrder = ['about', 'products', 'gallery', 'services', 'pricing', 'team', 'video', 'testimonials', 'faq'];
	
	// Check which sections exist and are enabled
	function hasSectionType(type) {
		return pageData?.sections?.some(section => section.type === type && section.enabled !== false);
	}
	
	// Build navigation items in preferred order
	const visibleNavItems = $derived.by(() => {
		const items = [{ id: 'hero', label: 'בית' }]; // Always show home first
		
		// Add sections in preferred order if they exist
		preferredOrder.forEach(type => {
			if (hasSectionType(type)) {
				items.push({
					id: type,
					label: sectionLabels[type]
				});
			}
		});
		
		return items;
	});
</script>

<header class="site-header">
	<div class="header-container">
		<div class="logo">
			{#if pageData?.headerImage}
				<img src={pageData.headerImage} alt={pageData.title || 'לוגו'} />
			{:else}
				{pageData?.title || 'העסק שלי'}
			{/if}
		</div>
		
		<button class="mobile-menu-toggle" onclick={toggleMobileMenu}>
			☰
		</button>
		
		<nav class="nav-menu" class:open={mobileMenuOpen}>
			{#each visibleNavItems as item}
				<a href="#{item.id}" class="nav-link" onclick={() => scrollToSection(item.id)}>
					{item.label}
				</a>
			{/each}
		</nav>
	</div>
</header>

<style>
	.site-header {
		background-color: rgba(255, 255, 255, 0.95);
		backdrop-filter: blur(10px);
		-webkit-backdrop-filter: blur(10px);
		padding: 16px 0;
		position: sticky;
		top: 0;
		z-index: 1000;
		border-bottom: 1px solid rgba(229, 231, 235, 0.5);
		box-shadow: 0 2px 10px rgba(0,0,0,0.05);
		width: 100%;
	}
	
	.header-container {
		display: flex;
		justify-content: space-between;
		align-items: center;
		max-width: 1200px;
		margin: 0 auto;
		padding: 0 24px;
	}
	
	.logo {
		font-size: 28px;
		font-weight: 800;
		color: #1A1A1A;
		font-family: 'Rubik', sans-serif;
	}
	
	.logo img {
		max-height: 50px;
		width: auto;
		object-fit: contain;
	}
	
	.nav-menu {
		display: flex;
		gap: 32px;
		list-style: none;
		margin: 0;
		padding: 0;
	}
	
	.nav-link {
		font-size: 17px;
		font-weight: 600;
		color: #1A1A1A;
		padding: 8px 0;
		position: relative;
		cursor: pointer;
		text-decoration: none;
		transition: color 0.3s ease;
	}
	
	.nav-link:hover {
		color: #667eea;
	}
	
	.nav-link::after {
		content: '';
		position: absolute;
		bottom: 0;
		left: 0;
		width: 0;
		height: 2px;
		background-color: #667eea;
		transition: width 0.3s ease;
	}
	
	.nav-link:hover::after {
		width: 100%;
	}
	
	.mobile-menu-toggle {
		display: none;
		font-size: 24px;
		background: none;
		border: none;
		cursor: pointer;
		color: #1A1A1A;
	}
	
	@media (max-width: 768px) {
		.mobile-menu-toggle {
			display: block;
		}
		
		.nav-menu {
			display: none;
			position: fixed;
			top: 70px;
			left: 0;
			right: 0;
			background: white;
			flex-direction: column;
			padding: 20px;
			box-shadow: 0 4px 20px rgba(0,0,0,0.1);
			z-index: 9999;
			max-height: calc(100vh - 70px);
			overflow-y: auto;
		}
		
		.nav-menu.open {
			display: flex;
		}
		
		.nav-link {
			padding: 12px 0;
			border-bottom: 1px solid #f0f0f0;
		}
	}
</style>
