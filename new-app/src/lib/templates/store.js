// Online Store Template Configuration
export const storeTemplate = {
	id: 'onlineStore',
	name: 'חנות מקוונת',
	icon: '🛍️',
	description: 'חנות אונליין עם עגלת קניות ותשלום',
	image: 'https://images.unsplash.com/photo-1472851294608-062f824d29cc?q=80&w=2070&auto=format&fit=crop',
	
	// EXACT Legacy Info Box from page-creator.html
	infoBox: {
		title: '💳 חנות מקוונת מלאה',
		description: '<strong>מה זה חנות מקוונת?</strong><br>גלריית מוצרים עם כפתורי "הוסף לעגלה", עגלת קניות צפה, וטופס תשלום מלא.<br><strong>כולל:</strong> כרטיס אשראי, PayPal, ביט, משלוח/איסוף עצמי.',
		boxColor: 'blue',
		features: [
			'💬 בוט WhatsApp (פינה שמאלית)',
			'🤖 בוט AI (פינה ימנית)',
			'♿ כפתור נגישות (פינה עליונה)',
			'🛒 עגלת קניות צפה',
			'💳 טופס תשלום מלא (אשראי, PayPal, ביט)',
			'📊 ניהול קניות (נתונים, סטטיסטיקות)'
		]
	},
	
	fields: [
		{
			name: 'title',
			label: 'כותרת הדף (URL)',
			type: 'text',
			required: true,
			placeholder: 'לדוגמה: my-fashion-store',
			help: 'זה יהיה חלק מכתובת הדף שלך (באנגלית בלבד, ללא רווחים)'
		},
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
			name: 'productCount',
			label: '📦 כמה מוצרים להציג בחנות?',
			type: 'select',
			required: true,
			options: [
				{ value: '3', label: '3 מוצרים' },
				{ value: '4', label: '4 מוצרים' },
				{ value: '6', label: '6 מוצרים (מומלץ)' },
				{ value: '8', label: '8 מוצרים' },
				{ value: '12', label: '12 מוצרים' }
			],
			defaultValue: '6',
			help: 'בחר כמה מוצרים תרצה להציג בקטלוג שלך'
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
	]
};
