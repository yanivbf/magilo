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
