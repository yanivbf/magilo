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
			name: 'city',
			label: 'עיר',
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
			colors: {
				primary: '#8B5CF6',
				secondary: '#EC4899',
				accent: '#F59E0B'
			}
		},
		{
			id: 'dark',
			name: 'כהה',
			colors: {
				primary: '#1F2937',
				secondary: '#4B5563',
				accent: '#F59E0B'
			}
		},
		{
			id: 'vibrant',
			name: 'צבעוני',
			colors: {
				primary: '#EC4899',
				secondary: '#8B5CF6',
				accent: '#10B981'
			}
		}
	]
};
