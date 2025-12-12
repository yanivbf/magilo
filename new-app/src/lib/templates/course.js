// Course/Workshop Template Configuration
export const courseTemplate = {
	id: 'course',
	name: 'קורס / סדנה',
	icon: '🎓',
	description: 'דף קורס או סדנה עם הרשמה',
	image: 'https://images.unsplash.com/photo-1524178232363-1fb2b075b655?q=80&w=2070&auto=format&fit=crop',
	
	// EXACT Legacy Info Box from page-creator.html
	infoBox: {
		title: '📚 פלטפורמת קורסים מוקלטים',
		description: '<strong>מה זה?</strong> כל קורס = סרטון מוקלט + מחיר. הלקוחות רוכשים גישה ויכולים לצפות.<br><strong>כולל:</strong> עגלת קניות, תשלום מאובטח, ממשק ניהול רכישות + נרשמים.',
		boxColor: 'indigo'
	},
	
	sections: [
		{
			id: 'basic',
			title: 'פרטים בסיסיים',
			fields: [
		{
			name: 'courseName',
			label: 'שם הקורס/סדנה',
			type: 'text',
			required: true,
			placeholder: 'לדוגמה: קורס פיתוח אתרים'
		},
		{
			name: 'instructor',
			label: 'שם המרצה/מדריך',
			type: 'text',
			required: true,
			placeholder: 'שם המרצה'
		},
		{
			name: 'description',
			label: 'תיאור הקורס',
			type: 'textarea',
			required: true,
			placeholder: 'תאר את הקורס, מה ילמדו, למי מתאים...'
		},
		{
			name: 'curriculum',
			label: 'תכנית לימודים',
			type: 'textarea',
			required: true,
			placeholder: 'שיעור 1: מבוא\nשיעור 2: יסודות\nשיעור 3: מתקדם',
			help: 'הזן נושא אחד בכל שורה'
		},
		{
			name: 'duration',
			label: 'משך הקורס',
			type: 'text',
			required: true,
			placeholder: 'לדוגמה: 8 שבועות, 3 חודשים'
		},
		{
			name: 'startDate',
			label: 'תאריך התחלה',
			type: 'date',
			required: false
		},
		{
			name: 'price',
			label: 'מחיר',
			type: 'number',
			required: false,
			placeholder: '1500'
		},
		{
			name: 'maxStudents',
			label: 'מספר מקסימלי של משתתפים',
			type: 'number',
			required: false,
			placeholder: '20'
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
					placeholder: 'course@example.com'
				}
			]
		},
		{
			id: 'registration',
			title: 'הרשמה',
			fields: [
				{
					name: 'enableRegistration',
					label: 'אפשר הרשמה לקורס',
					type: 'checkbox',
					help: 'הוסף טופס הרשמה לדף'
				},
				{
					name: 'registrationEmail',
					label: 'אימייל לקבלת הרשמות',
					type: 'email',
					placeholder: 'register@course.com',
					help: 'הרשמות ישלחו לכתובת זו'
				}
			]
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
