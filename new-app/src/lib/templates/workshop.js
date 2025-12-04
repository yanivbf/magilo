// Workshop Template Configuration
export const workshopTemplate = {
	id: 'workshop',
	name: 'סדנה / וובינר',
	icon: '🎓',
	description: 'סדנה חיה או וובינר עם הרשמה',
	image: 'https://images.unsplash.com/photo-1524178232363-1fb2b075b655?q=80&w=2070&auto=format&fit=crop',
	
	infoBox: {
		title: '🎓 סדנה מקצועית עם הרשמה',
		description: '<strong>מה כולל:</strong> דף הרשמה לסדנה, פרטי המדריך, תוכנית הסדנה, מחירים, ומגבלת משתתפים.',
		boxColor: 'blue'
	},
	
	sections: [
		{
			id: 'basic',
			title: 'פרטים בסיסיים',
			fields: [
				{
					name: 'workshopTitle',
					label: 'שם הסדנה',
					type: 'text',
					required: true,
					placeholder: 'לדוגמה: סדנת פיתוח אתרים'
				},
				{
					name: 'description',
					label: 'תיאור',
					type: 'textarea',
					required: true,
					placeholder: 'תאר את הסדנה...'
				},
				{
					name: 'instructor',
					label: 'שם המדריך',
					type: 'text',
					required: true,
					placeholder: 'שם מלא'
				},
				{
					name: 'instructorBio',
					label: 'אודות המדריך',
					type: 'textarea',
					required: false,
					placeholder: 'רקע מקצועי, ניסיון...'
				},
				{
					name: 'image',
					label: 'תמונה ראשית',
					type: 'image',
					required: false
				}
			]
		},
		{
			id: 'details',
			title: 'פרטי הסדנה',
			fields: [
				{
					name: 'date',
					label: 'תאריך',
					type: 'date',
					required: true
				},
				{
					name: 'time',
					label: 'שעה',
					type: 'time',
					required: true
				},
				{
					name: 'duration',
					label: 'משך (דקות)',
					type: 'number',
					required: true,
					placeholder: '120'
				},
				{
					name: 'platform',
					label: 'פלטפורמה',
					type: 'select',
					required: true,
					options: ['Zoom', 'Google Meet', 'Microsoft Teams', 'פיזית'],
					default: 'Zoom'
				},
				{
					name: 'location',
					label: 'מיקום / קישור',
					type: 'text',
					required: false,
					placeholder: 'קישור לזום או כתובת פיזית'
				},
				{
					name: 'maxParticipants',
					label: 'מספר משתתפים מקסימלי',
					type: 'number',
					required: false,
					placeholder: '30'
				}
			]
		},
		{
			id: 'pricing',
			title: 'תמחור',
			fields: [
				{
					name: 'price',
					label: 'מחיר',
					type: 'number',
					required: true,
					placeholder: '299'
				},
				{
					name: 'currency',
					label: 'מטבע',
					type: 'select',
					required: true,
					options: ['₪', '$', '€'],
					default: '₪'
				},
				{
					name: 'earlyBirdPrice',
					label: 'מחיר מוקדם',
					type: 'number',
					required: false,
					placeholder: '249'
				},
				{
					name: 'earlyBirdDeadline',
					label: 'תאריך אחרון למחיר מוקדם',
					type: 'date',
					required: false
				}
			]
		},
		{
			id: 'content',
			title: 'תוכן הסדנה',
			fields: [
				{
					name: 'topics',
					label: 'נושאים',
					type: 'textarea',
					required: false,
					placeholder: 'נושא 1\nנושא 2\nנושא 3',
					help: 'הזן נושא אחד בכל שורה'
				},
				{
					name: 'requirements',
					label: 'דרישות מוקדמות',
					type: 'textarea',
					required: false,
					placeholder: 'ידע בסיסי ב...'
				},
				{
					name: 'materials',
					label: 'חומרים נדרשים',
					type: 'textarea',
					required: false,
					placeholder: 'מחשב נייד, חיבור לאינטרנט...'
				}
			]
		}
	],
	
	designStyles: [
		{
			id: 'professional',
			name: 'מקצועי',
			colors: {
				primary: '#2C3E50',
				secondary: '#3498DB',
				accent: '#ECF0F1'
			}
		},
		{
			id: 'creative',
			name: 'יצירתי',
			colors: {
				primary: '#9B59B6',
				secondary: '#E74C3C',
				accent: '#F39C12'
			}
		},
		{
			id: 'minimal',
			name: 'מינימלי',
			colors: {
				primary: '#34495E',
				secondary: '#95A5A6',
				accent: '#FFFFFF'
			}
		}
	]
};
