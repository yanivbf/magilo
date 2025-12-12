// Service Provider with Appointment Booking Template
export const serviceAppointmentTemplate = {
	id: 'serviceAppointment',
	name: 'נותני שירות + קביעת תור',
	icon: '📅',
	description: 'דף נותני שירות עם טופס פשוט לקביעת תור',
	image: 'https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?q=80&w=2070&auto=format&fit=crop',
	
	infoBox: {
		title: '📅 דף נותני שירות עם קביעת תור',
		description: '<strong>מה כולל:</strong> דף מקצועי לנותני שירות עם טופס פשוט לקביעת תור - שם, טלפון, פרטים ותאריך.',
		boxColor: 'blue'
	},
	
	fields: [
		{
			name: 'businessName',
			label: 'שם העסק',
			type: 'text',
			required: true,
			placeholder: 'לדוגמה: מוסך דוד'
		},
		{
			name: 'profession',
			label: 'מקצוע/שירות',
			type: 'text',
			required: true,
			placeholder: 'לדוגמה: מכונאי, אינסטלטור, חשמלאי'
		},
		{
			name: 'description',
			label: 'תיאור השירות',
			type: 'textarea',
			required: true,
			placeholder: 'תאר את השירותים שאתה מציע...'
		},
		{
			name: 'services',
			label: 'רשימת שירותים',
			type: 'textarea',
			required: true,
			placeholder: 'שירות 1\nשירות 2\nשירות 3',
			help: 'הזן שירות אחד בכל שורה'
		},
		{
			name: 'phone',
			label: 'טלפון',
			type: 'tel',
			required: true,
			placeholder: '050-1234567'
		},
		{
			name: 'email',
			label: 'אימייל',
			type: 'email',
			required: false,
			placeholder: 'service@example.com'
		},
		{
			name: 'whatsapp',
			label: 'מספר וואטסאפ',
			type: 'tel',
			required: false,
			placeholder: '972501234567'
		},
		{
			name: 'address',
			label: 'כתובת',
			type: 'text',
			required: false,
			placeholder: 'רחוב 123, תל אביב'
		},
		{
			name: 'workingHours',
			label: 'שעות עבודה',
			type: 'textarea',
			required: false,
			placeholder: 'ראשון-חמישי: 08:00-17:00\nשישי: 08:00-13:00'
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
			id: 'professional',
			name: 'מקצועי',
			description: 'עיצוב מקצועי ואמין',
			colors: {
				primary: '#1e40af',
				secondary: '#6b7280',
				accent: '#1e293b'
			}
		},
		{
			id: 'colorful',
			name: 'צבעוני',
			description: 'עיצוב תוסס ומלא חיים',
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
		}
	]
};