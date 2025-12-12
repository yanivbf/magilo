// Artist/Musician Page Template Configuration
export const artistTemplate = {
	id: 'artist',
	name: 'אמן / מוזיקאי',
	icon: '🎤',
	description: 'דף אמן עם גלריית עבודות ואירועים',
	image: 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?q=80&w=2070&auto=format&fit=crop',
	
	// EXACT Legacy Info Box from page-creator.html
	infoBox: {
		title: '🎨 דף אמן מקצועי',
		description: '<strong>מה כולל:</strong> גלריית עבודות/שירים, לוח אירועים קרובים, ביוגרפיה, קישורים לרשתות חברתיות, וטופס יצירת קשר.',
		boxColor: 'indigo',
		features: [
			'🎵 נגן מוזיקה מובנה',
			'🖼️ גלריית תמונות/וידאו',
			'📅 לוח אירועים',
			'💬 בוט WhatsApp',
			'🤖 בוט AI',
			'♿ כפתור נגישות'
		]
	},
	
	fields: [
		{
			name: 'artistName',
			label: 'שם האמן / הלהקה',
			type: 'text',
			required: true,
			placeholder: 'לדוגמה: להקת הרוק'
		},
		{
			name: 'genre',
			label: 'ז\'אנר / סגנון',
			type: 'text',
			required: true,
			placeholder: 'לדוגמה: רוק, פופ, ג\'אז, קלאסי'
		},
		{
			name: 'bio',
			label: 'ביוגרפיה',
			type: 'textarea',
			required: true,
			placeholder: 'ספר על עצמך, הקריירה שלך, ההשפעות המוזיקליות...'
		},
		{
			name: 'achievements',
			label: 'הישגים ופרסים',
			type: 'textarea',
			required: false,
			placeholder: 'הישג 1\nהישג 2\nהישג 3',
			help: 'הזן הישג אחד בכל שורה'
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
			placeholder: 'artist@example.com'
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
			placeholder: 'תל אביב'
		},
		{
			name: 'spotifyLink',
			label: 'קישור Spotify',
			type: 'url',
			required: false,
			placeholder: 'https://open.spotify.com/artist/...'
		},
		{
			name: 'youtubeMusicLink',
			label: 'קישור YouTube Music',
			type: 'url',
			required: false,
			placeholder: 'https://music.youtube.com/channel/...'
		},
		{
			name: 'soundcloudLink',
			label: 'קישור SoundCloud',
			type: 'url',
			required: false,
			placeholder: 'https://soundcloud.com/...'
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
