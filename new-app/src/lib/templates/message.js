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
			id: 'romantic',
			name: 'רומנטי',
			colors: {
				primary: '#EC4899',
				secondary: '#BE185D',
				accent: '#FDE68A'
			}
		},
		{
			id: 'elegant',
			name: 'אלגנטי',
			colors: {
				primary: '#C4A962',
				secondary: '#1F2937',
				accent: '#F3F4F6'
			}
		},
		{
			id: 'playful',
			name: 'שובב',
			colors: {
				primary: '#F59E0B',
				secondary: '#8B5CF6',
				accent: '#10B981'
			}
		}
	]
};
