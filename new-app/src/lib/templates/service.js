// Service Provider Template Configuration
export const serviceTemplate = {
	id: 'serviceProvider',
	name: 'בעל מקצוע',
	icon: '💼',
	description: 'דף שירות מקצועי עם טופס הזמנה',
	image: 'https://images.unsplash.com/photo-1556761175-5973dc0f32e7?q=80&w=2070&auto=format&fit=crop',
	
	// EXACT Legacy Info Box from page-creator.html
	infoBox: {
		title: '📅 מערכת קביעת תורים חכמה',
		description: '<strong>מה כולל:</strong> יומן תורים אוטומטי, טופס קביעת תור עם שעות פנויות בלבד, ניהול תורים מתקדם, והתראות ללקוחות.',
		boxColor: 'purple'
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
			label: 'מקצוע',
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
			name: 'yearsExperience',
			label: 'שנות ניסיון',
			type: 'number',
			required: false,
			placeholder: '10'
		},
		{
			name: 'daySettings',
			label: 'הגדרות ימי עבודה',
			type: 'day-settings',
			required: false,
			help: 'הגדר שעות עבודה, הפסקות וימי חופש'
		}
	],
	
	designStyles: [
		{
			id: 'professional',
			name: 'מקצועי',
			colors: {
				primary: '#1F2937',
				secondary: '#4B5563',
				accent: '#3B82F6'
			}
		},
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
			id: 'trustworthy',
			name: 'אמין',
			colors: {
				primary: '#0F766E',
				secondary: '#115E59',
				accent: '#F59E0B'
			}
		}
	]
};
