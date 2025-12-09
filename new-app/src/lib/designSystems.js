/**
 * Design Systems Engine - מנוע ערכות עיצוב דינמי ULTRA
 * כל סגנון עיצוב מכיל: צבעים, פונטים, אפקטים, אנימציות, layouts, components
 */

export const designSystems = {
	modern: {
		id: 'modern',
		name: 'מודרני',
		description: 'עיצוב נקי ומודרני בסגנון Apple/Airbnb',
		colors: {
			primary: '#14b8a6',
			secondary: '#8b5cf6',
			accent: '#3b82f6',
			background: '#ffffff',
			backgroundAlt: '#f0fdfa',
			text: '#1f2937',
			textLight: '#6b7280'
		},
		fonts: {
			heading: "'Inter', 'Rubik', sans-serif",
			body: "'Rubik', 'Assistant', sans-serif",
			sizes: {
				hero: '4rem',
				h2: '3rem',
				h3: '1.5rem',
				body: '1.125rem'
			}
		},
		layout: {
			type: 'grid-clean',
			heroStyle: 'full-image-overlay',
			sectionStyle: 'centered-grid',
			cardStyle: 'elevated-clean'
		},
		effects: {
			shadows: 'modern',
			animations: 'smooth',
			borders: 'rounded',
			gradients: 'subtle'
		},
		spacing: {
			section: '5rem',
			card: '2rem',
			gap: '2rem'
		},
		components: {
			button: 'rounded-solid',
			card: 'shadow-hover',
			hero: 'image-overlay'
		}
	},

	colorful: {
		id: 'colorful',
		name: 'צבעוני',
		description: 'עיצוב תוסס ונועז בסגנון Spotify/Dribbble',
		colors: {
			primary: '#f97316',      // כתום בוהק
			secondary: '#a855f7',    // סגול
			accent: '#ec4899',       // ורוד
			background: '#ffffff',   // לבן נקי
			backgroundAlt: '#fef3c7', // צהוב בהיר
			text: '#1f2937',         // אפור כהה (קריא)
			textLight: '#4b5563'     // אפור בינוני (קריא)
		},
		fonts: {
			heading: "'Poppins', 'Rubik', sans-serif",
			body: "'Assistant', 'Rubik', sans-serif",
			sizes: {
				hero: '4.5rem',
				h2: '3.5rem',
				h3: '1.75rem',
				body: '1.125rem'
			}
		},
		layout: {
			type: 'asymmetric-bold',
			heroStyle: 'gradient-shapes',
			sectionStyle: 'overlapping-cards',
			cardStyle: 'vibrant-tilted'
		},
		effects: {
			shadows: 'vibrant',
			animations: 'bouncy',
			borders: 'rounded-xl',
			gradients: 'vibrant'
		},
		spacing: {
			section: '6rem',
			card: '2.5rem',
			gap: '2.5rem'
		},
		components: {
			button: 'gradient-bold',
			card: 'colorful-border',
			hero: 'gradient-animated'
		}
	},

	elegant: {
		id: 'elegant',
		name: 'אלגנטי',
		description: 'עיצוב מעודן ומקצועי בסגנון Luxury Brands',
		colors: {
			primary: '#1e40af',      // כחול עמוק
			secondary: '#6b7280',    // אפור
			accent: '#1e293b',       // כחול-אפור כהה
			background: '#ffffff',   // לבן נקי
			backgroundAlt: '#f8fafc', // אפור בהיר מאוד
			text: '#0f172a',         // שחור-כחול
			textLight: '#475569'     // אפור בינוני
		},
		fonts: {
			heading: "'Playfair Display', 'Frank Ruhl Libre', serif",
			body: "'Lora', 'Rubik', serif",
			sizes: {
				hero: '4.5rem',
				h2: '3rem',
				h3: '1.5rem',
				body: '1.125rem'
			}
		},
		layout: {
			type: 'classic-symmetric',
			heroStyle: 'image-dark-overlay',
			sectionStyle: 'centered-elegant',
			cardStyle: 'minimal-border'
		},
		effects: {
			shadows: 'subtle',
			animations: 'elegant',
			borders: 'sharp',
			gradients: 'elegant'
		},
		spacing: {
			section: '7rem',
			card: '2.5rem',
			gap: '3rem'
		},
		components: {
			button: 'outlined-elegant',
			card: 'border-subtle',
			hero: 'centered-overlay'
		}
	},

	minimalist: {
		id: 'minimalist',
		name: 'מינימליסטי',
		description: 'עיצוב פשוט ונקי בסגנון Brutalist/Muji',
		colors: {
			primary: '#000000',
			secondary: '#ffffff',
			accent: '#6b7280',
			background: '#ffffff',
			backgroundAlt: '#fafafa',
			text: '#000000',
			textLight: '#737373'
		},
		fonts: {
			heading: "'Helvetica Neue', 'Arial', sans-serif",
			body: "'Arial', 'Rubik', sans-serif",
			sizes: {
				hero: '5rem',
				h2: '3rem',
				h3: '1.5rem',
				body: '1rem'
			}
		},
		layout: {
			type: 'brutalist-grid',
			heroStyle: 'text-only-bold',
			sectionStyle: 'list-minimal',
			cardStyle: 'border-only'
		},
		effects: {
			shadows: 'none',
			animations: 'minimal',
			borders: 'none',
			gradients: 'none'
		},
		spacing: {
			section: '4rem',
			card: '1.5rem',
			gap: '1.5rem'
		},
		components: {
			button: 'border-black',
			card: 'flat-border',
			hero: 'text-giant'
		}
	},

	retro: {
		id: 'retro',
		name: 'רטרו',
		description: 'עיצוב וינטג\' בסגנון שנות ה-80/90',
		colors: {
			primary: '#fbbf24',
			secondary: '#f97316',
			accent: '#dc2626',
			background: '#fef3c7',
			backgroundAlt: '#fef9c3',
			text: '#78350f',
			textLight: '#92400e'
		},
		fonts: {
			heading: "'Courier New', 'Courier', monospace",
			body: "'Georgia', 'Times New Roman', serif",
			sizes: {
				hero: '4rem',
				h2: '2.5rem',
				h3: '1.5rem',
				body: '1.125rem'
			}
		},
		layout: {
			type: 'centered-classic',
			heroStyle: 'pattern-background',
			sectionStyle: 'boxed-retro',
			cardStyle: 'thick-border-shadow'
		},
		effects: {
			shadows: 'retro',
			animations: 'retro',
			borders: 'thick',
			gradients: 'retro'
		},
		spacing: {
			section: '5rem',
			card: '2rem',
			gap: '2rem'
		},
		components: {
			button: 'retro-thick',
			card: 'double-border',
			hero: 'striped-pattern'
		}
	},

	dark: {
		id: 'dark',
		name: 'כהה',
		description: 'עיצוב כהה מקצועי בסגנון Gaming/Tech',
		colors: {
			primary: '#3b82f6',      // כחול בהיר
			secondary: '#8b5cf6',    // סגול בהיר
			accent: '#06b6d4',       // ציאן
			background: '#0f172a',   // כחול כהה מאוד
			backgroundAlt: '#0f172a', // אותו צבע כמו background - הכל שחור!
			text: '#f1f5f9',         // לבן-אפור (קריא)
			textLight: '#cbd5e1'     // אפור בהיר (קריא)
		},
		fonts: {
			heading: "'Inter', 'Rubik', sans-serif",
			body: "'Rubik', 'Assistant', sans-serif",
			sizes: {
				hero: '4.5rem',
				h2: '3rem',
				h3: '1.5rem',
				body: '1.125rem'
			}
		},
		layout: {
			type: 'modern-dark-grid',
			heroStyle: 'particles-animated',
			sectionStyle: 'floating-cards',
			cardStyle: 'glassmorphism'
		},
		effects: {
			shadows: 'glow',
			animations: 'smooth',
			borders: 'rounded',
			gradients: 'dark-glow'
		},
		spacing: {
			section: '5rem',
			card: '2rem',
			gap: '2rem'
		},
		components: {
			button: 'glow-border',
			card: 'glass-dark',
			hero: 'dark-particles'
		}
	},

	neon: {
		id: 'neon',
		name: 'נאון',
		description: 'עיצוב נאון זוהר בסגנון Cyberpunk',
		colors: {
			primary: '#a855f7',      // סגול נאון
			secondary: '#ec4899',    // ורוד נאון
			accent: '#06b6d4',       // ציאן נאון
			background: '#0f172a',   // כחול כהה מאוד
			backgroundAlt: '#1e293b', // כחול כהה
			text: '#f0f9ff',         // לבן-כחול (קריא על רקע כהה)
			textLight: '#cbd5e1'     // אפור בהיר (קריא על רקע כהה)
		},
		fonts: {
			heading: "'Orbitron', 'Rubik', sans-serif",
			body: "'Rajdhani', 'Assistant', sans-serif",
			sizes: {
				hero: '5rem',
				h2: '3.5rem',
				h3: '1.75rem',
				body: '1.125rem'
			}
		},
		layout: {
			type: 'layered-neon',
			heroStyle: 'neon-borders-animated',
			sectionStyle: 'overlapping-glow',
			cardStyle: 'neon-glow-border'
		},
		effects: {
			shadows: 'neon',
			animations: 'glow',
			borders: 'neon',
			gradients: 'neon'
		},
		spacing: {
			section: '6rem',
			card: '2.5rem',
			gap: '2.5rem'
		},
		components: {
			button: 'neon-glow',
			card: 'neon-border-glow',
			hero: 'scan-lines'
		}
	},

	luxury: {
		id: 'luxury',
		name: 'לוקסוס',
		description: 'עיצוב יוקרתי בסגנון Rolex/Chanel',
		colors: {
			primary: '#fbbf24',
			secondary: '#eab308',
			accent: '#000000',
			background: '#fefce8',
			backgroundAlt: '#fef9c3',
			text: '#713f12',
			textLight: '#854d0e'
		},
		fonts: {
			heading: "'Cinzel', 'Frank Ruhl Libre', serif",
			body: "'Cormorant', 'Rubik', serif",
			sizes: {
				hero: '5rem',
				h2: '3.5rem',
				h3: '1.75rem',
				body: '1.25rem'
			}
		},
		layout: {
			type: 'spacious-luxury',
			heroStyle: 'gold-overlay',
			sectionStyle: 'wide-spacing',
			cardStyle: 'gold-border-elegant'
		},
		effects: {
			shadows: 'luxury',
			animations: 'smooth',
			borders: 'gold',
			gradients: 'luxury'
		},
		spacing: {
			section: '8rem',
			card: '3rem',
			gap: '3rem'
		},
		components: {
			button: 'gold-outlined',
			card: 'gold-accent',
			hero: 'gold-gradient'
		}
	},

	vintage: {
		id: 'vintage',
		name: 'וינטג׳',
		description: 'עיצוב עתיק וחם בסגנול קלאסי',
		colors: {
			primary: '#d97706',
			secondary: '#dc2626',
			accent: '#92400e',
			background: '#fef3c7',
			backgroundAlt: '#fed7aa',
			text: '#78350f',
			textLight: '#92400e'
		},
		fonts: {
			heading: "'Playfair Display', serif",
			body: "'Merriweather', serif",
			sizes: {
				hero: '4rem',
				h2: '3rem',
				h3: '1.5rem',
				body: '1.125rem'
			}
		},
		layout: {
			type: 'organic-flow',
			heroStyle: 'radial-vintage',
			sectionStyle: 'centered-organic',
			cardStyle: 'double-border-vintage'
		},
		effects: {
			shadows: 'vintage',
			animations: 'vintage',
			borders: 'vintage',
			gradients: 'vintage'
		},
		spacing: {
			section: '6rem',
			card: '2.5rem',
			gap: '2.5rem'
		},
		components: {
			button: 'vintage-border',
			card: 'textured-vintage',
			hero: 'radial-warm'
		}
	}
};

/**
 * Get design system by ID
 */
export function getDesignSystem(id) {
	return designSystems[id] || designSystems.modern;
}

/**
 * Get all design system IDs
 */
export function getDesignSystemIds() {
	return Object.keys(designSystems);
}

/**
 * Generate CSS variables from design system
 */
export function generateCSSVariables(designId) {
	const design = getDesignSystem(designId);
	
	return `
		--color-primary: ${design.colors.primary};
		--color-secondary: ${design.colors.secondary};
		--color-accent: ${design.colors.accent};
		--color-bg: ${design.colors.background};
		--color-bg-alt: ${design.colors.backgroundAlt};
		--color-text: ${design.colors.text};
		--color-text-light: ${design.colors.textLight};
		--font-heading: ${design.fonts.heading};
		--font-body: ${design.fonts.body};
		--font-size-hero: ${design.fonts.sizes.hero};
		--font-size-h2: ${design.fonts.sizes.h2};
		--font-size-h3: ${design.fonts.sizes.h3};
		--font-size-body: ${design.fonts.sizes.body};
		--spacing-section: ${design.spacing.section};
		--spacing-card: ${design.spacing.card};
		--spacing-gap: ${design.spacing.gap};
	`.trim();
}

/**
 * Get layout type for design
 */
export function getLayoutType(designId) {
	const design = getDesignSystem(designId);
	return design.layout?.type || 'grid-clean';
}

/**
 * Get hero style for design
 */
export function getHeroStyle(designId) {
	const design = getDesignSystem(designId);
	return design.layout?.heroStyle || 'full-image-overlay';
}

/**
 * Get section style for design
 */
export function getSectionStyle(designId) {
	const design = getDesignSystem(designId);
	return design.layout?.sectionStyle || 'centered-grid';
}

/**
 * Get card style for design
 */
export function getCardStyle(designId) {
	const design = getDesignSystem(designId);
	return design.layout?.cardStyle || 'elevated-clean';
}
