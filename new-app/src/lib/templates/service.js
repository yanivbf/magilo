// Service Provider Template Configuration
export const serviceTemplate = {
	id: 'serviceProvider',
	name: 'נותני שירות',
	icon: '💼',
	description: 'צור ממשק יומן קביעת תורים לעסק שלך',
	image: 'https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?q=80&w=2070&auto=format&fit=crop',
	
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
