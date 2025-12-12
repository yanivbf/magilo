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
			placeholder: 'רחוב 123, תל אביב (אופציונלי)'
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
