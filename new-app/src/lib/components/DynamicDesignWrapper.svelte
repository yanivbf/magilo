<script>
	import { getDesignSystem, generateCSSVariables, getLayoutType, getHeroStyle, getSectionStyle, getCardStyle } from '$lib/designSystems.js';
	
	let { designStyle = 'modern', children } = $props();
	
	const design = getDesignSystem(designStyle);
	const cssVars = generateCSSVariables(designStyle);
	const layoutType = getLayoutType(designStyle);
	const heroStyle = getHeroStyle(designStyle);
	const sectionStyle = getSectionStyle(designStyle);
	const cardStyle = getCardStyle(designStyle);
	
	console.log('🎨 DynamicDesignWrapper - Design Style:', designStyle);
	console.log('🎨 Design System:', design);
	console.log('🎨 Layout Type:', layoutType);
</script>

<div 
	class="design-wrapper design-{designStyle}"
	style={cssVars}
	data-design={designStyle}
	data-layout={layoutType}
	data-hero={heroStyle}
	data-section={sectionStyle}
	data-card={cardStyle}
	data-effects={design.effects.shadows}
	data-animations={design.effects.animations}
	data-borders={design.effects.borders}
	data-gradients={design.effects.gradients}
>
	{@render children?.()}
</div>

<style>
	/* ========================================
	   DYNAMIC DESIGN WRAPPER
	   מעטפת עיצוב דינמית שמשנה את כל המראה
	   ======================================== */
	
	.design-wrapper {
		background-color: var(--color-bg) !important;
		color: var(--color-text) !important;
		font-family: var(--font-body) !important;
		min-height: 100vh;
		transition: all 0.3s ease;
	}
	
	/* All sections inherit the same background color */
	.design-wrapper :global(section) {
		background-color: inherit;
	}
	
	/* Typography */
	.design-wrapper :global(h1),
	.design-wrapper :global(h2),
	.design-wrapper :global(h3),
	.design-wrapper :global(h4),
	.design-wrapper :global(h5),
	.design-wrapper :global(h6) {
		font-family: var(--font-heading);
		color: var(--color-primary);
		font-weight: 700;
	}
	
	.design-wrapper :global(p) {
		color: var(--color-text);
		line-height: 1.7;
	}
	
	/* Buttons */
	.design-wrapper :global(.btn-primary) {
		background: var(--color-primary);
		color: white;
		padding: 0.75rem 2rem;
		border-radius: 0.5rem;
		font-weight: 600;
		transition: all 0.3s ease;
	}
	
	.design-wrapper :global(.btn-primary:hover) {
		transform: translateY(-2px);
		box-shadow: 0 10px 20px rgba(0, 0, 0, 0.2);
	}
	
	.design-wrapper :global(.btn-secondary) {
		background: var(--color-secondary);
		color: white;
		padding: 0.75rem 2rem;
		border-radius: 0.5rem;
		font-weight: 600;
		transition: all 0.3s ease;
	}
	
	/* Cards */
	.design-wrapper :global(.card) {
		background: var(--color-bg-alt);
		padding: var(--spacing-card);
		border-radius: 1rem;
		transition: all 0.3s ease;
	}
	
	/* Sections */
	.design-wrapper :global(section) {
		padding: var(--spacing-section) 0;
	}
	
	/* ========================================
	   SHADOW EFFECTS
	   ======================================== */
	
	/* Modern Shadows */
	.design-wrapper[data-effects="modern"] :global(.card) {
		box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
	}
	
	.design-wrapper[data-effects="modern"] :global(.card:hover) {
		box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04);
	}
	
	/* Vibrant Shadows */
	.design-wrapper[data-effects="vibrant"] :global(.card) {
		box-shadow: 0 10px 30px -5px rgba(249, 115, 22, 0.5);
		border: 3px solid rgba(236, 72, 153, 0.5);
	}
	
	.design-wrapper[data-effects="vibrant"] :global(.card:hover) {
		box-shadow: 0 20px 40px -5px rgba(168, 85, 247, 0.5);
		transform: translateY(-5px) scale(1.02);
	}
	
	/* Subtle Shadows */
	.design-wrapper[data-effects="subtle"] :global(.card) {
		box-shadow: 0 1px 3px 0 rgba(0, 0, 0, 0.1);
		border: 1px solid rgba(0, 0, 0, 0.1);
	}
	
	/* No Shadows */
	.design-wrapper[data-effects="none"] :global(.card) {
		box-shadow: none;
		border: 1px solid #e5e7eb;
	}
	
	/* Retro Shadows */
	.design-wrapper[data-effects="retro"] :global(.card) {
		box-shadow: 8px 8px 0 rgba(220, 38, 38, 0.8);
		border: 4px solid rgba(251, 191, 36, 0.8);
	}
	
	/* Neon Shadows */
	.design-wrapper[data-effects="neon"] :global(.card) {
		box-shadow: 0 0 20px rgba(168, 85, 247, 0.6), 0 0 40px rgba(236, 72, 153, 0.4);
		border: 2px solid rgba(6, 182, 212, 0.6);
		background: var(--color-bg-alt);
	}
	
	/* Luxury Shadows */
	.design-wrapper[data-effects="luxury"] :global(.card) {
		box-shadow: 0 10px 40px rgba(251, 191, 36, 0.3);
		border: 2px solid rgba(251, 191, 36, 0.8);
	}
	
	/* Vintage Shadows */
	.design-wrapper[data-effects="vintage"] :global(.card) {
		box-shadow: 5px 5px 15px rgba(0, 0, 0, 0.2);
		border: 3px double rgba(217, 119, 6, 0.8);
	}
	
	/* ========================================
	   ANIMATIONS
	   ======================================== */
	
	/* Smooth Animations */
	.design-wrapper[data-animations="smooth"] :global(.card) {
		transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
	}
	
	.design-wrapper[data-animations="smooth"] :global(.card:hover) {
		transform: translateY(-5px);
	}
	
	/* Bouncy Animations */
	.design-wrapper[data-animations="bouncy"] :global(.card:hover) {
		animation: bounce 0.6s ease;
	}
	
	@keyframes bounce {
		0%, 100% { transform: translateY(0); }
		25% { transform: translateY(-15px); }
		50% { transform: translateY(-7px); }
		75% { transform: translateY(-12px); }
	}
	
	/* Elegant Animations */
	.design-wrapper[data-animations="elegant"] :global(.card) {
		transition: all 0.5s ease-in-out;
	}
	
	.design-wrapper[data-animations="elegant"] :global(.card:hover) {
		transform: scale(1.02);
	}
	
	/* Minimal Animations */
	.design-wrapper[data-animations="minimal"] :global(.card) {
		transition: opacity 0.2s ease;
	}
	
	.design-wrapper[data-animations="minimal"] :global(.card:hover) {
		opacity: 0.9;
	}
	
	/* Retro Animations */
	.design-wrapper[data-animations="retro"] :global(.card:hover) {
		animation: shake 0.5s ease;
	}
	
	@keyframes shake {
		0%, 100% { transform: translateX(0); }
		25% { transform: translateX(-5px) rotate(-2deg); }
		75% { transform: translateX(5px) rotate(2deg); }
	}
	
	/* Glow Animations */
	.design-wrapper[data-animations="glow"] :global(.card) {
		animation: glow 2s ease-in-out infinite;
	}
	
	@keyframes glow {
		0%, 100% { 
			box-shadow: 0 0 20px rgba(168, 85, 247, 0.6), 0 0 40px rgba(236, 72, 153, 0.4);
		}
		50% { 
			box-shadow: 0 0 40px rgba(6, 182, 212, 0.6), 0 0 60px rgba(168, 85, 247, 0.4);
		}
	}
	
	/* Vintage Animations */
	.design-wrapper[data-animations="vintage"] :global(.card:hover) {
		animation: vintage-wobble 0.8s ease;
	}
	
	@keyframes vintage-wobble {
		0%, 100% { transform: rotate(0deg); }
		25% { transform: rotate(-1deg); }
		75% { transform: rotate(1deg); }
	}
	
	/* ========================================
	   BORDERS
	   ======================================== */
	
	.design-wrapper[data-borders="rounded"] :global(.card) {
		border-radius: 0.5rem;
	}
	
	.design-wrapper[data-borders="rounded-xl"] :global(.card) {
		border-radius: 1.5rem;
	}
	
	.design-wrapper[data-borders="sharp"] :global(.card) {
		border-radius: 0;
	}
	
	.design-wrapper[data-borders="none"] :global(.card) {
		border-radius: 0;
		border: none;
	}
	
	.design-wrapper[data-borders="thick"] :global(.card) {
		border-radius: 0.25rem;
		border-width: 4px;
	}
	
	.design-wrapper[data-borders="neon"] :global(.card) {
		border-radius: 1rem;
		border-width: 2px;
	}
	
	.design-wrapper[data-borders="gold"] :global(.card) {
		border-radius: 0.75rem;
		border: 2px solid rgba(251, 191, 36, 0.8);
	}
	
	.design-wrapper[data-borders="vintage"] :global(.card) {
		border-radius: 0.5rem;
		border: 3px double rgba(217, 119, 6, 0.8);
	}
	
	/* ========================================
	   GRADIENTS
	   ======================================== */
	
	.design-wrapper[data-gradients="subtle"] :global(.hero),
	.design-wrapper[data-gradients="subtle"] :global(.section-hero) {
		background: linear-gradient(135deg, var(--color-bg) 0%, var(--color-bg-alt) 100%);
	}
	
	.design-wrapper[data-gradients="vibrant"] :global(.hero),
	.design-wrapper[data-gradients="vibrant"] :global(.section-hero) {
		background: linear-gradient(135deg, #f97316 0%, #a855f7 50%, #ec4899 100%);
		color: white;
	}
	
	.design-wrapper[data-gradients="elegant"] :global(.hero),
	.design-wrapper[data-gradients="elegant"] :global(.section-hero) {
		background: linear-gradient(to bottom, var(--color-bg) 0%, var(--color-bg-alt) 100%);
	}
	
	.design-wrapper[data-gradients="neon"] :global(.hero),
	.design-wrapper[data-gradients="neon"] :global(.section-hero) {
		background: linear-gradient(135deg, #0f172a 0%, #1e293b 50%, #334155 100%);
		position: relative;
	}
	
	.design-wrapper[data-gradients="neon"] :global(.hero::before),
	.design-wrapper[data-gradients="neon"] :global(.section-hero::before) {
		content: '';
		position: absolute;
		inset: 0;
		background: radial-gradient(circle at 50% 50%, rgba(168, 85, 247, 0.6) 0%, transparent 70%);
		opacity: 0.3;
		animation: pulse 3s ease-in-out infinite;
	}
	
	@keyframes pulse {
		0%, 100% { opacity: 0.3; }
		50% { opacity: 0.5; }
	}
	
	.design-wrapper[data-gradients="luxury"] :global(.hero),
	.design-wrapper[data-gradients="luxury"] :global(.section-hero) {
		background: linear-gradient(135deg, #fefce8 0%, #fbbf24 100%);
	}
	
	.design-wrapper[data-gradients="retro"] :global(.hero),
	.design-wrapper[data-gradients="retro"] :global(.section-hero) {
		background: repeating-linear-gradient(
			45deg,
			var(--color-bg),
			var(--color-bg) 10px,
			var(--color-bg-alt) 10px,
			var(--color-bg-alt) 20px
		);
	}
	
	.design-wrapper[data-gradients="vintage"] :global(.hero),
	.design-wrapper[data-gradients="vintage"] :global(.section-hero) {
		background: radial-gradient(circle at center, var(--color-bg-alt) 0%, var(--color-bg) 100%);
	}
	
	/* ========================================
	   DESIGN-SPECIFIC STYLES
	   ======================================== */
	
	/* Colorful Design - Extra Vibrant */
	.design-colorful {
		background: linear-gradient(135deg, #fef3c7 0%, #fef9c3 50%, #fef3c7 100%);
	}
	
	.design-colorful :global(.hero-section),
	.design-colorful :global(.section-hero) {
		background: linear-gradient(135deg, #f97316 0%, #a855f7 50%, #ec4899 100%) !important;
		color: white !important;
	}
	
	.design-colorful :global(.hero-title),
	.design-colorful :global(.hero-description) {
		color: white !important;
		text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.3);
	}
	
	.design-colorful :global(h1),
	.design-colorful :global(h2),
	.design-colorful :global(h3) {
		color: #f97316 !important;
	}
	
	.design-colorful :global(p),
	.design-colorful :global(.text) {
		color: #1f2937 !important;
	}
	
	/* Neon Design - Dark with Glowing Text */
	.design-neon {
		background: #0f172a !important;
	}
	
	.design-neon :global(.hero-section),
	.design-neon :global(.section-hero) {
		background: linear-gradient(135deg, #0f172a 0%, #1e293b 50%, #334155 100%) !important;
	}
	
	.design-neon :global(h1),
	.design-neon :global(h2),
	.design-neon :global(h3),
	.design-neon :global(.hero-title) {
		color: #a855f7 !important;
		text-shadow: 0 0 20px rgba(168, 85, 247, 0.8), 0 0 40px rgba(168, 85, 247, 0.4);
	}
	
	.design-neon :global(p),
	.design-neon :global(.text),
	.design-neon :global(.hero-description) {
		color: #f0f9ff !important;
	}
	
	/* Sections inherit background from wrapper - NO explicit background */
	.design-neon :global(section) {
		border-top: 1px solid rgba(168, 85, 247, 0.3);
	}
	
	.design-neon :global(.card) {
		background: #1e293b !important;
		color: #f0f9ff !important;
	}
	
	/* Elegant Design - Clean and Professional */
	.design-elegant :global(.hero-section),
	.design-elegant :global(.section-hero) {
		background: linear-gradient(to bottom, #ffffff 0%, #f8fafc 100%) !important;
	}
	
	.design-elegant :global(h1),
	.design-elegant :global(h2),
	.design-elegant :global(h3) {
		color: #1e40af !important;
	}
	
	/* Luxury Design - Gold Accents */
	.design-luxury {
		background: linear-gradient(135deg, #fefce8 0%, #fef9c3 100%);
	}
	
	.design-luxury :global(.hero-section),
	.design-luxury :global(.section-hero) {
		background: linear-gradient(135deg, #fefce8 0%, #fbbf24 100%) !important;
	}
	
	.design-luxury :global(h1),
	.design-luxury :global(h2),
	.design-luxury :global(h3) {
		color: #fbbf24 !important;
		text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.1);
	}
	
	/* Retro Design - Bold and Blocky */
	.design-retro {
		background: #fef3c7;
	}
	
	.design-retro :global(.hero-section),
	.design-retro :global(.section-hero) {
		background: repeating-linear-gradient(
			45deg,
			#fbbf24,
			#fbbf24 20px,
			#f97316 20px,
			#f97316 40px
		) !important;
	}
	
	.design-retro :global(h1),
	.design-retro :global(h2),
	.design-retro :global(h3) {
		color: #dc2626 !important;
		text-transform: uppercase;
		letter-spacing: 2px;
	}
	
	/* Vintage Design - Classic Look */
	.design-vintage {
		background: radial-gradient(circle at center, #fed7aa 0%, #fef3c7 100%);
	}
	
	.design-vintage :global(.hero-section),
	.design-vintage :global(.section-hero) {
		background: radial-gradient(circle at center, #fed7aa 0%, #fef3c7 100%) !important;
	}
	
	.design-vintage :global(h1),
	.design-vintage :global(h2),
	.design-vintage :global(h3) {
		color: #d97706 !important;
	}
	
	/* Dark Design - Dark Theme with Bright Accents */
	.design-dark {
		background: #0f172a !important;
	}
	
	.design-dark :global(.hero-section),
	.design-dark :global(.section-hero) {
		background: linear-gradient(135deg, #0f172a 0%, #1e293b 100%) !important;
	}
	
	.design-dark :global(h1),
	.design-dark :global(h2),
	.design-dark :global(h3),
	.design-dark :global(.hero-title) {
		color: #3b82f6 !important;
	}
	
	.design-dark :global(p),
	.design-dark :global(.text),
	.design-dark :global(.hero-description) {
		color: #f1f5f9 !important;
	}
	
	/* Sections inherit background from wrapper - NO explicit background */
	
	.design-dark :global(.card) {
		background: #1e293b !important;
		color: #f1f5f9 !important;
		border: 1px solid rgba(59, 130, 246, 0.3);
	}
	
	/* Minimalist Design - Clean and Simple */
	.design-minimalist {
		background: #ffffff !important;
	}
	
	.design-minimalist :global(.hero-section),
	.design-minimalist :global(.section-hero) {
		background: #ffffff !important;
	}
	
	.design-minimalist :global(h1),
	.design-minimalist :global(h2),
	.design-minimalist :global(h3) {
		color: #000000 !important;
	}
	
	.design-minimalist :global(p),
	.design-minimalist :global(.text) {
		color: #000000 !important;
	}
	
	.design-minimalist :global(.card) {
		background: #ffffff !important;
		border: 1px solid #e5e7eb !important;
		box-shadow: none !important;
	}
	
	/* Modern Design - Default Clean Look */
	.design-modern :global(.hero-section),
	.design-modern :global(.section-hero) {
		background: linear-gradient(135deg, #ffffff 0%, #f0fdfa 100%) !important;
	}
	
	.design-modern :global(h1),
	.design-modern :global(h2),
	.design-modern :global(h3) {
		color: #14b8a6 !important;
	}
	
	/* ========================================
	   ENTRANCE ANIMATIONS - REMOVED
	   אנימציות הכניסה הוסרו - רק אנימציית הלוגו של AutoPage
	   ======================================== */
	
	/* ========================================
	   ULTRA DESIGN SYSTEM - TYPOGRAPHY
	   מערכת טיפוגרפיה מתקדמת לכל עיצוב
	   ======================================== */
	
	/* Apply font sizes from design system */
	.design-wrapper :global(.hero-title),
	.design-wrapper :global(h1) {
		font-size: var(--font-size-hero) !important;
	}
	
	.design-wrapper :global(.section-title),
	.design-wrapper :global(h2) {
		font-size: var(--font-size-h2) !important;
	}
	
	.design-wrapper :global(h3) {
		font-size: var(--font-size-h3) !important;
	}
	
	.design-wrapper :global(p),
	.design-wrapper :global(.text) {
		font-size: var(--font-size-body) !important;
	}
	
	/* ========================================
	   LAYOUT TYPES - כל עיצוב עם layout שונה
	   ======================================== */
	
	/* Grid Clean - Modern */
	.design-wrapper[data-layout="grid-clean"] :global(.services-grid),
	.design-wrapper[data-layout="grid-clean"] :global(.testimonials-grid) {
		display: grid !important;
		grid-template-columns: repeat(auto-fit, minmax(280px, 1fr)) !important;
		gap: var(--spacing-gap) !important;
		justify-content: center !important;
	}
	
	/* Asymmetric Bold - Colorful */
	.design-wrapper[data-layout="asymmetric-bold"] :global(.services-grid) {
		display: grid !important;
		grid-template-columns: repeat(auto-fit, minmax(250px, 1fr)) !important;
		gap: 2rem !important;
	}
	
	.design-wrapper[data-layout="asymmetric-bold"] :global(.service-card):nth-child(odd) {
		transform: rotate(-2deg) !important;
	}
	
	.design-wrapper[data-layout="asymmetric-bold"] :global(.service-card):nth-child(even) {
		transform: rotate(2deg) !important;
	}
	
	.design-wrapper[data-layout="asymmetric-bold"] :global(.service-card):hover {
		transform: rotate(0deg) translateY(-10px) scale(1.05) !important;
	}
	
	/* Classic Symmetric - Elegant */
	.design-wrapper[data-layout="classic-symmetric"] :global(.services-grid),
	.design-wrapper[data-layout="classic-symmetric"] :global(.testimonials-grid) {
		display: grid !important;
		grid-template-columns: repeat(3, 1fr) !important;
		gap: 3rem !important;
		max-width: 1200px !important;
		margin: 0 auto !important;
	}
	
	/* Modern Dark Grid - Dark */
	.design-wrapper[data-layout="modern-dark-grid"] :global(.services-grid) {
		display: grid !important;
		grid-template-columns: repeat(auto-fit, minmax(280px, 1fr)) !important;
		gap: 2rem !important;
	}
	
	.design-wrapper[data-layout="modern-dark-grid"] :global(.service-card) {
		background: rgba(30, 41, 59, 0.8) !important;
		backdrop-filter: blur(10px) !important;
		border: 1px solid rgba(59, 130, 246, 0.3) !important;
	}
	
	/* Brutalist Grid - Minimalist */
	.design-wrapper[data-layout="brutalist-grid"] :global(.services-grid) {
		display: grid !important;
		grid-template-columns: repeat(auto-fill, minmax(300px, 1fr)) !important;
		gap: 0 !important;
	}
	
	.design-wrapper[data-layout="brutalist-grid"] :global(.service-card) {
		border-radius: 0 !important;
		border: 2px solid #000 !important;
		background: #fff !important;
	}
	
	/* Centered Classic - Retro */
	.design-wrapper[data-layout="centered-classic"] :global(.services-grid) {
		display: flex !important;
		flex-wrap: wrap !important;
		justify-content: center !important;
		gap: 2rem !important;
	}
	
	/* Layered Neon - Neon */
	.design-wrapper[data-layout="layered-neon"] :global(.services-grid) {
		display: grid !important;
		grid-template-columns: repeat(auto-fit, minmax(280px, 1fr)) !important;
		gap: 2.5rem !important;
	}
	
	.design-wrapper[data-layout="layered-neon"] :global(.service-card) {
		position: relative !important;
		z-index: 1 !important;
	}
	
	.design-wrapper[data-layout="layered-neon"] :global(.service-card)::before {
		content: '' !important;
		position: absolute !important;
		inset: -5px !important;
		background: linear-gradient(135deg, #a855f7, #ec4899, #06b6d4) !important;
		border-radius: inherit !important;
		z-index: -1 !important;
		opacity: 0.5 !important;
		filter: blur(10px) !important;
	}
	
	/* Spacious Luxury - Luxury */
	.design-wrapper[data-layout="spacious-luxury"] :global(.services-grid) {
		display: grid !important;
		grid-template-columns: repeat(auto-fit, minmax(320px, 1fr)) !important;
		gap: 3rem !important;
		padding: 2rem !important;
	}
	
	/* Organic Flow - Vintage */
	.design-wrapper[data-layout="organic-flow"] :global(.services-grid) {
		display: grid !important;
		grid-template-columns: repeat(auto-fit, minmax(280px, 1fr)) !important;
		gap: 2.5rem !important;
	}
	
	/* ========================================
	   CARD STYLES - כל עיצוב עם cards שונים
	   ======================================== */
	
	/* Elevated Clean - Modern */
	.design-wrapper[data-card="elevated-clean"] :global(.service-card),
	.design-wrapper[data-card="elevated-clean"] :global(.testimonial-card) {
		background: white !important;
		border-radius: 16px !important;
		box-shadow: 0 4px 6px rgba(0,0,0,0.1) !important;
		transition: all 0.3s ease !important;
	}
	
	.design-wrapper[data-card="elevated-clean"] :global(.service-card):hover,
	.design-wrapper[data-card="elevated-clean"] :global(.testimonial-card):hover {
		transform: translateY(-8px) !important;
		box-shadow: 0 20px 40px rgba(0,0,0,0.15) !important;
	}
	
	/* Vibrant Tilted - Colorful */
	.design-wrapper[data-card="vibrant-tilted"] :global(.service-card) {
		background: linear-gradient(135deg, #fef3c7 0%, #fef9c3 100%) !important;
		border: 4px solid !important;
		border-image: linear-gradient(135deg, #f97316, #a855f7, #ec4899) 1 !important;
		border-radius: 20px !important;
		box-shadow: 0 10px 30px rgba(249, 115, 22, 0.3) !important;
	}
	
	/* Minimal Border - Elegant */
	.design-wrapper[data-card="minimal-border"] :global(.service-card),
	.design-wrapper[data-card="minimal-border"] :global(.testimonial-card) {
		background: white !important;
		border: 1px solid rgba(30, 64, 175, 0.2) !important;
		border-radius: 8px !important;
		box-shadow: 0 2px 4px rgba(0,0,0,0.05) !important;
	}
	
	.design-wrapper[data-card="minimal-border"] :global(.service-card):hover {
		border-color: rgba(30, 64, 175, 0.5) !important;
		box-shadow: 0 4px 12px rgba(30, 64, 175, 0.1) !important;
	}
	
	/* Glassmorphism - Dark */
	.design-wrapper[data-card="glassmorphism"] :global(.service-card),
	.design-wrapper[data-card="glassmorphism"] :global(.testimonial-card) {
		background: rgba(30, 41, 59, 0.7) !important;
		backdrop-filter: blur(20px) !important;
		border: 1px solid rgba(59, 130, 246, 0.3) !important;
		border-radius: 16px !important;
		box-shadow: 0 8px 32px rgba(0,0,0,0.3) !important;
	}
	
	.design-wrapper[data-card="glassmorphism"] :global(.service-card):hover {
		background: rgba(30, 41, 59, 0.9) !important;
		border-color: rgba(59, 130, 246, 0.6) !important;
		box-shadow: 0 0 40px rgba(59, 130, 246, 0.4) !important;
	}
	
	/* Border Only - Minimalist */
	.design-wrapper[data-card="border-only"] :global(.service-card),
	.design-wrapper[data-card="border-only"] :global(.testimonial-card) {
		background: white !important;
		border: 2px solid #000 !important;
		border-radius: 0 !important;
		box-shadow: none !important;
	}
	
	.design-wrapper[data-card="border-only"] :global(.service-card):hover {
		background: #fafafa !important;
	}
	
	/* Thick Border Shadow - Retro */
	.design-wrapper[data-card="thick-border-shadow"] :global(.service-card) {
		background: linear-gradient(135deg, #fef3c7 0%, #fef9c3 100%) !important;
		border: 4px solid #fbbf24 !important;
		border-radius: 8px !important;
		box-shadow: 8px 8px 0 #dc2626 !important;
	}
	
	.design-wrapper[data-card="thick-border-shadow"] :global(.service-card):hover {
		transform: translate(-4px, -4px) !important;
		box-shadow: 12px 12px 0 #dc2626 !important;
	}
	
	/* Neon Glow Border - Neon */
	.design-wrapper[data-card="neon-glow-border"] :global(.service-card),
	.design-wrapper[data-card="neon-border-glow"] :global(.testimonial-card) {
		background: rgba(15, 23, 42, 0.9) !important;
		border: 2px solid #a855f7 !important;
		border-radius: 16px !important;
		box-shadow: 0 0 20px rgba(168, 85, 247, 0.6), 0 0 40px rgba(236, 72, 153, 0.4) !important;
		animation: neon-pulse 2s ease-in-out infinite !important;
	}
	
	@keyframes neon-pulse {
		0%, 100% { 
			box-shadow: 0 0 20px rgba(168, 85, 247, 0.6), 0 0 40px rgba(236, 72, 153, 0.4);
		}
		50% { 
			box-shadow: 0 0 40px rgba(6, 182, 212, 0.8), 0 0 60px rgba(168, 85, 247, 0.6);
		}
	}
	
	/* Gold Accent - Luxury */
	.design-wrapper[data-card="gold-border-elegant"] :global(.service-card),
	.design-wrapper[data-card="gold-accent"] :global(.testimonial-card) {
		background: linear-gradient(135deg, #fefce8 0%, #fef9c3 100%) !important;
		border: 2px solid #fbbf24 !important;
		border-radius: 12px !important;
		box-shadow: 0 10px 40px rgba(251, 191, 36, 0.3) !important;
	}
	
	.design-wrapper[data-card="gold-border-elegant"] :global(.service-card):hover {
		box-shadow: 0 20px 60px rgba(251, 191, 36, 0.5) !important;
		transform: translateY(-10px) !important;
	}
	
	/* Double Border Vintage - Vintage */
	.design-wrapper[data-card="double-border-vintage"] :global(.service-card),
	.design-wrapper[data-card="textured-vintage"] :global(.testimonial-card) {
		background: linear-gradient(135deg, #fef3c7 0%, #fed7aa 100%) !important;
		border: 3px double #d97706 !important;
		border-radius: 8px !important;
		box-shadow: 5px 5px 15px rgba(0, 0, 0, 0.2) !important;
		position: relative !important;
	}
	
	.design-wrapper[data-card="double-border-vintage"] :global(.service-card)::before,
	.design-wrapper[data-card="textured-vintage"] :global(.testimonial-card)::before {
		content: '' !important;
		position: absolute !important;
		inset: 0 !important;
		background-image: url('data:image/svg+xml,%3Csvg width="100" height="100" xmlns="http://www.w3.org/2000/svg"%3E%3Cfilter id="noise"%3E%3CfeTurbulence baseFrequency="0.9" /%3E%3C/filter%3E%3Crect width="100%25" height="100%25" filter="url(%23noise)" opacity="0.08" /%3E%3C/svg%3E') !important;
		pointer-events: none !important;
		border-radius: 5px !important;
	}
	
	/* ========================================
	   HERO STYLES - כל עיצוב עם hero שונה
	   ======================================== */
	
	/* Full Image Overlay - Modern */
	.design-wrapper[data-hero="full-image-overlay"] :global(.hero-section),
	.design-wrapper[data-hero="image-overlay"] :global(.section-hero) {
		position: relative !important;
		min-height: 600px !important;
		display: flex !important;
		align-items: center !important;
		justify-content: center !important;
		background-size: cover !important;
		background-position: center !important;
	}
	
	.design-wrapper[data-hero="full-image-overlay"] :global(.hero-section)::before {
		content: '' !important;
		position: absolute !important;
		inset: 0 !important;
		background: linear-gradient(135deg, rgba(20, 184, 166, 0.8), rgba(139, 92, 246, 0.8)) !important;
	}
	
	/* Gradient Shapes - Colorful */
	.design-wrapper[data-hero="gradient-shapes"] :global(.hero-section),
	.design-wrapper[data-hero="gradient-animated"] :global(.section-hero) {
		background: linear-gradient(135deg, #f97316 0%, #a855f7 50%, #ec4899 100%) !important;
		position: relative !important;
		overflow: hidden !important;
	}
	
	.design-wrapper[data-hero="gradient-shapes"] :global(.hero-section)::before {
		content: '' !important;
		position: absolute !important;
		width: 500px !important;
		height: 500px !important;
		background: rgba(255, 255, 255, 0.1) !important;
		border-radius: 50% !important;
		top: -200px !important;
		right: -200px !important;
		animation: float-shape 20s ease-in-out infinite !important;
	}
	
	@keyframes float-shape {
		0%, 100% { transform: translate(0, 0) rotate(0deg); }
		50% { transform: translate(-50px, 50px) rotate(180deg); }
	}
	
	/* Image Dark Overlay - Elegant */
	.design-wrapper[data-hero="image-dark-overlay"] :global(.hero-section),
	.design-wrapper[data-hero="centered-overlay"] :global(.section-hero) {
		position: relative !important;
		background-size: cover !important;
		background-position: center !important;
	}
	
	.design-wrapper[data-hero="image-dark-overlay"] :global(.hero-section)::before {
		content: '' !important;
		position: absolute !important;
		inset: 0 !important;
		background: linear-gradient(to bottom, rgba(15, 23, 42, 0.7), rgba(15, 23, 42, 0.9)) !important;
	}
	
	/* Particles Animated - Dark */
	.design-wrapper[data-hero="particles-animated"] :global(.hero-section),
	.design-wrapper[data-hero="dark-particles"] :global(.section-hero) {
		background: linear-gradient(135deg, #0f172a 0%, #1e293b 100%) !important;
		position: relative !important;
		overflow: hidden !important;
	}
	
	.design-wrapper[data-hero="particles-animated"] :global(.hero-section)::after {
		content: '' !important;
		position: absolute !important;
		inset: 0 !important;
		background-image: radial-gradient(circle, rgba(59, 130, 246, 0.3) 1px, transparent 1px) !important;
		background-size: 50px 50px !important;
		animation: particles-move 20s linear infinite !important;
	}
	
	@keyframes particles-move {
		0% { background-position: 0 0; }
		100% { background-position: 50px 50px; }
	}
	
	/* Text Only Bold - Minimalist */
	.design-wrapper[data-hero="text-only-bold"] :global(.hero-section),
	.design-wrapper[data-hero="text-giant"] :global(.section-hero) {
		background: white !important;
		padding: 8rem 2rem !important;
	}
	
	.design-wrapper[data-hero="text-only-bold"] :global(.hero-title) {
		font-size: 6rem !important;
		font-weight: 900 !important;
		color: #000 !important;
		text-transform: uppercase !important;
		letter-spacing: -0.05em !important;
	}
	
	/* Pattern Background - Retro */
	.design-wrapper[data-hero="pattern-background"] :global(.hero-section),
	.design-wrapper[data-hero="striped-pattern"] :global(.section-hero) {
		background: repeating-linear-gradient(
			45deg,
			#fbbf24,
			#fbbf24 20px,
			#f97316 20px,
			#f97316 40px
		) !important;
	}
	
	/* Neon Borders Animated - Neon */
	.design-wrapper[data-hero="neon-borders-animated"] :global(.hero-section),
	.design-wrapper[data-hero="scan-lines"] :global(.section-hero) {
		background: linear-gradient(135deg, #0f172a 0%, #1e293b 100%) !important;
		border: 3px solid #a855f7 !important;
		box-shadow: 0 0 40px rgba(168, 85, 247, 0.6), inset 0 0 40px rgba(168, 85, 247, 0.2) !important;
		position: relative !important;
	}
	
	.design-wrapper[data-hero="neon-borders-animated"] :global(.hero-section)::before {
		content: '' !important;
		position: absolute !important;
		inset: 0 !important;
		background: repeating-linear-gradient(
			0deg,
			transparent,
			transparent 2px,
			rgba(168, 85, 247, 0.1) 2px,
			rgba(168, 85, 247, 0.1) 4px
		) !important;
		animation: scan-lines-move 8s linear infinite !important;
	}
	
	@keyframes scan-lines-move {
		0% { transform: translateY(0); }
		100% { transform: translateY(20px); }
	}
	
	/* Gold Overlay - Luxury */
	.design-wrapper[data-hero="gold-overlay"] :global(.hero-section),
	.design-wrapper[data-hero="gold-gradient"] :global(.section-hero) {
		background: linear-gradient(135deg, #fefce8 0%, #fbbf24 100%) !important;
		position: relative !important;
	}
	
	.design-wrapper[data-hero="gold-overlay"] :global(.hero-section)::before {
		content: '' !important;
		position: absolute !important;
		inset: 0 !important;
		background: radial-gradient(circle at center, transparent 0%, rgba(251, 191, 36, 0.3) 100%) !important;
	}
	
	/* Radial Vintage - Vintage */
	.design-wrapper[data-hero="radial-vintage"] :global(.hero-section),
	.design-wrapper[data-hero="radial-warm"] :global(.section-hero) {
		background: radial-gradient(circle at center, #fed7aa 0%, #fef3c7 100%) !important;
		position: relative !important;
	}
	
	.design-wrapper[data-hero="radial-vintage"] :global(.hero-section)::before {
		content: '' !important;
		position: absolute !important;
		inset: 0 !important;
		background-image: url('data:image/svg+xml,%3Csvg width="100" height="100" xmlns="http://www.w3.org/2000/svg"%3E%3Cfilter id="noise"%3E%3CfeTurbulence baseFrequency="0.9" /%3E%3C/filter%3E%3Crect width="100%25" height="100%25" filter="url(%23noise)" opacity="0.15" /%3E%3C/svg%3E') !important;
		pointer-events: none !important;
	}
	
	/* ========================================
	   RESPONSIVE - כל העיצובים responsive
	   ======================================== */
	
	@media (max-width: 1024px) {
		.design-wrapper[data-layout="classic-symmetric"] :global(.services-grid),
		.design-wrapper[data-layout="classic-symmetric"] :global(.testimonials-grid) {
			grid-template-columns: repeat(2, 1fr) !important;
		}
	}
	
	@media (max-width: 768px) {
		.design-wrapper :global(.hero-title),
		.design-wrapper :global(h1) {
			font-size: calc(var(--font-size-hero) * 0.6) !important;
		}
		
		.design-wrapper :global(.section-title),
		.design-wrapper :global(h2) {
			font-size: calc(var(--font-size-h2) * 0.7) !important;
		}
		
		.design-wrapper[data-layout="classic-symmetric"] :global(.services-grid),
		.design-wrapper[data-layout="classic-symmetric"] :global(.testimonials-grid),
		.design-wrapper[data-layout="brutalist-grid"] :global(.services-grid) {
			grid-template-columns: 1fr !important;
		}
		
		.design-wrapper[data-hero="text-only-bold"] :global(.hero-title) {
			font-size: 3rem !important;
		}
	}
</style>
