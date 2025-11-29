// Event Page Template Configuration
export const eventTemplate = {
	id: 'event',
	name: 'אירוע',
	icon: '🎉',
	description: 'דף אירוע עם RSVP וניהול משתתפים',
	image: 'https://images.unsplash.com/photo-1492684223066-81342ee5ff30?q=80&w=2070&auto=format&fit=crop',
	
	// EXACT Legacy Info Box from page-creator.html
	infoBox: {
		title: '🎉 דף אירוע עם RSVP',
		description: '<strong>מה כולל:</strong> טופס אישור הגעה, ניהול רשימת מוזמנים, סידור שולחנות, ושליחת הזמנות אוטומטית דרך WhatsApp.',
		boxColor: 'pink'
	},
	
	fields: [
		{
			name: 'title',
			label: 'כותרת הדף (URL)',
			type: 'text',
			required: true,
			placeholder: 'לדוגמה: sarah-david-wedding',
			help: 'זה יהיה חלק מכתובת הדף שלך (באנגלית בלבד, ללא רווחים)'
		},
		{
			name: 'eventName',
			label: 'שם האירוע',
			type: 'text',
			required: true,
			placeholder: 'לדוגמה: חתונת שרה ודוד'
		},
		{
			name: 'eventDate',
			label: 'תאריך האירוע',
			type: 'date',
			required: true
		},
		{
			name: 'eventTime',
			label: 'שעת האירוע',
			type: 'time',
			required: true
		},
		{
			name: 'location',
			label: 'מיקום',
			type: 'text',
			required: true,
			placeholder: 'כתובת מלאה של האירוע'
		},
		{
			name: 'description',
			label: 'תיאור האירוע',
			type: 'textarea',
			required: true,
			placeholder: 'ספר על האירוע...'
		},
		{
			name: 'maxGuests',
			label: 'מספר מקסימלי של אורחים',
			type: 'number',
			required: false,
			placeholder: '100'
		},
		{
			name: 'phone',
			label: 'טלפון ליצירת קשר',
			type: 'tel',
			required: true,
			placeholder: '050-1234567'
		},
		{
			name: 'whatsapp',
			label: 'מספר וואטסאפ',
			type: 'tel',
			required: false,
			placeholder: '972501234567'
		}
	],
	
	designStyles: [
		{
			id: 'elegant',
			name: 'אלגנטי',
			colors: {
				primary: '#C4A962',
				secondary: '#1F2937',
				accent: '#F59E0B'
			}
		},
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
			id: 'festive',
			name: 'חגיגי',
			colors: {
				primary: '#8B5CF6',
				secondary: '#EC4899',
				accent: '#F59E0B'
			}
		}
	]
};
