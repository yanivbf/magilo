// Online Store Template Configuration
export const storeTemplate = {
	id: 'onlineStore',
	name: 'חנות מקוונת',
	icon: '🛍️',
	description: 'צור חנות מקוונת מלאה עם גלריית מוצרים ועגלת קניות',
	image: 'https://images.unsplash.com/photo-1472851294608-062f824d29cc?q=80&w=2070&auto=format&fit=crop',
	
	// EXACT Legacy Info Box from page-creator.html
	infoBox: {
		title: '💳 מה כלול בחנות?',
		description: 'גלריית מוצרים עם כפתורי "הוסף לעגלה", עגלת קניות צפה, וטופס תשלום מלא.<br><strong>כולל:</strong> כרטיס אשראי, PayPal, ביט, משלוח/איסוף עצמי.',
		boxColor: 'blue',
		features: [
			'💬 בועת WhatsApp',
			'🤖 בוט AI',
			'♿ כפתור נגישות',
			'🛒 עגלת קניות צפה',
			'💳 טופס תשלום מלא (אשראי, PayPal, ביט)',
			'📊 ניהול קניות (נתונים, סטטיסטיקות)'
		]
	},
	
	fields: [
		{
			name: 'mainName',
			label: 'שם החנות',
			type: 'text',
			required: true,
			placeholder: 'לדוגמה: חנות האופנה שלי'
		},
		{
			name: 'contactName',
			label: 'שם איש קשר',
			type: 'text',
			required: true,
			placeholder: 'השם שלך'
		},
		{
			name: 'email',
			label: 'אימייל',
			type: 'email',
			required: true,
			placeholder: 'store@example.com'
		},
		{
			name: 'phone',
			label: 'טלפון',
			type: 'tel',
			required: true,
			placeholder: '050-1234567'
		},
		{
			name: 'description',
			label: 'תיאור',
			type: 'textarea',
			required: true,
			placeholder: 'תאר את החנות שלך בקצרה...'
		},
		{
			name: 'address',
			label: 'כתובת',
			type: 'text',
			required: false,
			placeholder: 'כתובת החנות (אופציונלי)'
		},
		{
			name: 'city',
			label: 'עיר',
			type: 'text',
			required: false,
			placeholder: 'תל אביב, ירושלים, חיפה...'
		}
	],
	
	designStyles: [
		{
			id: 'modern',
			name: 'מודרני',
			colors: {
				primary: '#667eea',
				secondary: '#764ba2',
				accent: '#10B981'
			}
		},
		{
			id: 'elegant',
			name: 'אלגנטי',
			colors: {
				primary: '#1F2937',
				secondary: '#6B7280',
				accent: '#F59E0B'
			}
		},
		{
			id: 'vibrant',
			name: 'צבעוני',
			colors: {
				primary: '#EC4899',
				secondary: '#8B5CF6',
				accent: '#F59E0B'
			}
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
	]
};
