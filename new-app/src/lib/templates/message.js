// Message in a Bottle Template Configuration
export const messageTemplate = {
	id: 'messageInBottle',
	name: 'הודעה בבקבוק',
	icon: '💌',
	description: 'דף הודעה אישית ומיוחדת',
	image: 'https://images.unsplash.com/photo-1516589178581-6cd7833ae3b2?q=80&w=2070&auto=format&fit=crop',
	
	fields: [
		{
			name: 'title',
			label: 'כותרת',
			type: 'text',
			required: true,
			placeholder: 'לדוגמה: הודעה מיוחדת בשבילך'
		},
		{
			name: 'recipientName',
			label: 'שם המקבל',
			type: 'text',
			required: false,
			placeholder: 'שם האדם שההודעה מיועדת אליו'
		},
		{
			name: 'senderName',
			label: 'שם השולח',
			type: 'text',
			required: false,
			placeholder: 'השם שלך'
		},
		{
			name: 'message',
			label: 'ההודעה',
			type: 'textarea',
			required: true,
			placeholder: 'כתוב את ההודעה שלך כאן...',
			help: 'זו ההודעה המרכזית שתוצג בדף'
		},
		{
			name: 'occasion',
			label: 'אירוע',
			type: 'select',
			required: false,
			options: [
				{ value: '', label: 'בחר אירוע (אופציונלי)' },
				{ value: 'birthday', label: 'יום הולדת' },
				{ value: 'anniversary', label: 'יום נישואין' },
				{ value: 'love', label: 'אהבה' },
				{ value: 'thank-you', label: 'תודה' },
				{ value: 'apology', label: 'התנצלות' },
				{ value: 'congratulations', label: 'מזל טוב' },
				{ value: 'other', label: 'אחר' }
			]
		},
		{
			name: 'backgroundColor',
			label: 'צבע רקע',
			type: 'color',
			required: false,
			placeholder: '#667eea'
		},
		{
			name: 'showDate',
			label: 'הצג תאריך',
			type: 'checkbox',
			required: false
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
