// FAQ Template Configuration
export const faqTemplate = {
	id: 'faq',
	name: 'שאלות ותשובות',
	icon: '❓',
	description: 'דף שאלות נפוצות עם מקטעים וגלריה',
	image: 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?q=80&w=2070&auto=format&fit=crop',
	
	fields: [
		{
			name: 'title',
			label: 'כותרת הדף',
			type: 'text',
			required: true,
			placeholder: 'לדוגמה: שאלות נפוצות'
		},
		{
			name: 'description',
			label: 'תיאור',
			type: 'textarea',
			required: false,
			placeholder: 'תיאור קצר של הדף'
		},
		{
			name: 'phone',
			label: 'טלפון',
			type: 'tel',
			required: false,
			placeholder: '050-1234567'
		},
		{
			name: 'email',
			label: 'אימייל',
			type: 'email',
			required: false,
			placeholder: 'example@email.com'
		},
		{
			name: 'address',
			label: 'כתובת',
			type: 'text',
			required: false,
			placeholder: 'תל אביב'
		},
		{
			name: 'address',
			label: 'כתובת',
			type: 'text',
			required: false,
			placeholder: 'רחוב 123'
		},
		{
			name: 'includeGallery',
			label: 'הוסף גלריית תמונות',
			type: 'checkbox',
			required: false,
			defaultValue: true
		},
		{
			name: 'includeFAQ',
			label: 'הצג שאלות נפוצות',
			type: 'checkbox',
			required: false,
			defaultValue: true
		},
		{
			name: 'includeTestimonials',
			label: 'הצג המלצות לקוחות',
			type: 'checkbox',
			required: false,
			defaultValue: false
		},
		{
			name: 'includeAbout',
			label: 'הצג אודות',
			type: 'checkbox',
			required: false,
			defaultValue: false
		}
	],
	
	// Default sections for FAQ
	defaultSections: [
		{
			type: 'faq',
			enabled: true,
			order: 0,
			data: {
				title: 'איך אני מזמין?',
				content: 'פשוט לחץ על המוצר הרצוי והוסף אותו לעגלה. לאחר מכן עבור לתשלום.'
			}
		},
		{
			type: 'faq',
			enabled: true,
			order: 1,
			data: {
				title: 'כמה זמן לוקח המשלוח?',
				content: 'המשלוח לוקח בין 2-5 ימי עסקים, תלוי במיקום.'
			}
		},
		{
			type: 'faq',
			enabled: true,
			order: 2,
			data: {
				title: 'האם יש אחריות על המוצרים?',
				content: 'כן, יש אחריות של שנה על כל המוצרים.'
			}
		}
	],
	
	// Default products (can be used as examples)
	defaultProducts: [
		{
			name: 'מוצר לדוגמה 1',
			description: 'תיאור המוצר',
			price: 99,
			image: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?q=80&w=2070&auto=format&fit=crop',
			isVisible: true,
			order: 0
		},
		{
			name: 'מוצר לדוגמה 2',
			description: 'תיאור המוצר',
			price: 149,
			image: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?q=80&w=2099&auto=format&fit=crop',
			isVisible: true,
			order: 1
		}
	],
	
	designStyles: [
		{
			id: 'modern',
			name: 'מודרני',
			description: 'עיצוב נקי ומודרני עם צבעים רעננים',
			colors: {
				primary: '#14b8a6',
				secondary: '#8b5cf6',
				accent: '#3b82f6'
			}
		},
		{
			id: 'colorful',
			name: 'צבעוני',
			description: 'עיצוב תוסס ומלא חיים עם צבעים עזים',
			colors: {
				primary: '#f97316',
				secondary: '#a855f7',
				accent: '#ec4899'
			}
		},
		{
			id: 'elegant',
			name: 'אלגנטי',
			description: 'עיצוב מעודן ומקצועי',
			colors: {
				primary: '#1e40af',
				secondary: '#6b7280',
				accent: '#1e293b'
			}
		},
		{
			id: 'dark',
			name: 'כהה',
			description: 'עיצוב כהה ומסתורי',
			colors: {
				primary: '#3b82f6',
				secondary: '#8b5cf6',
				accent: '#06b6d4'
			}
		},
		{
			id: 'minimalist',
			name: 'מינימליסטי',
			description: 'עיצוב פשוט ונקי',
			colors: {
				primary: '#000000',
				secondary: '#ffffff',
				accent: '#6b7280'
			}
		},
		{
			id: 'retro',
			name: 'רטרו',
			description: 'עיצוב וינטג\' עם צבעים חמים',
			colors: {
				primary: '#fbbf24',
				secondary: '#f97316',
				accent: '#dc2626'
			}
		},
		{
			id: 'neon',
			name: 'נאון',
			description: 'עיצוב נאון זוהר ומרהיב',
			colors: {
				primary: '#a855f7',
				secondary: '#ec4899',
				accent: '#06b6d4'
			}
		},
		{
			id: 'luxury',
			name: 'לוקסוס',
			description: 'עיצוב יוקרתי עם זהב',
			colors: {
				primary: '#fbbf24',
				secondary: '#eab308',
				accent: '#000000'
			}
		},
		{
			id: 'vintage',
			name: 'וינטג\'',
			description: 'עיצוב עתיק וחם',
			colors: {
				primary: '#d97706',
				secondary: '#dc2626',
				accent: '#92400e'
			}
		}
	]
};
