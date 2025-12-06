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
			colors: {
				primary: '#667eea',
				secondary: '#764ba2',
				accent: '#F59E0B'
			}
		},
		{
			id: 'professional',
			name: 'מקצועי',
			colors: {
				primary: '#1F2937',
				secondary: '#3B82F6',
				accent: '#10B981'
			}
		},
		{
			id: 'friendly',
			name: 'ידידותי',
			colors: {
				primary: '#EC4899',
				secondary: '#8B5CF6',
				accent: '#F59E0B'
			}
		}
	]
};
