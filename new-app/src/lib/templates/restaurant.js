// Restaurant Template Configuration
export const restaurantTemplate = {
	id: 'restaurant',
	name: 'מסעדה / בית קפה',
	icon: '🍽️',
	description: 'תפריט דיגיטלי עם קטגוריות, מנות, ומחירים',
	image: 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?q=80&w=2070&auto=format&fit=crop',
	
	infoBox: {
		title: '🍽️ תפריט דיגיטלי מקצועי',
		description: '<strong>מה כולל:</strong> תפריט מלא עם קטגוריות, תמונות מנות, מחירים, סימוני תזונה (טבעוני, ללא גלוטן), שעות פתיחה, ופרטי משלוחים.',
		boxColor: 'orange'
	},
	
	sections: [
		{
			id: 'basic',
			title: 'פרטים בסיסיים',
			fields: [
				{
					name: 'restaurantName',
					label: 'שם המסעדה',
					type: 'text',
					required: true,
					placeholder: 'לדוגמה: פיצה פאלאס'
				},
				{
					name: 'description',
					label: 'תיאור',
					type: 'textarea',
					required: true,
					placeholder: 'תאר את המסעדה שלך...'
				},
				{
					name: 'logo',
					label: 'לוגו',
					type: 'image',
					required: false
				},
				{
					name: 'phone',
					label: 'טלפון',
					type: 'tel',
					required: true,
					placeholder: '03-1234567'
				},
				{
					name: 'address',
					label: 'כתובת',
					type: 'text',
					required: true,
					placeholder: 'רחוב הרצל 123'
				},
				{
					name: 'address',
					label: 'כתובת',
					type: 'text',
					required: true,
					placeholder: 'תל אביב'
				}
			]
		},
		{
			id: 'menu',
			title: 'תפריט',
			fields: [
				{
					name: 'categories',
					label: 'קטגוריות ומנות',
					type: 'repeater',
					help: 'הוסף קטגוריות ומנות לתפריט',
					fields: [
						{
							name: 'categoryName',
							label: 'שם קטגוריה',
							type: 'text',
							placeholder: 'לדוגמה: מנות ראשונות'
						},
						{
							name: 'items',
							label: 'מנות',
							type: 'repeater',
							fields: [
								{
									name: 'itemName',
									label: 'שם המנה',
									type: 'text',
									placeholder: 'לדוגמה: סלט יווני'
								},
								{
									name: 'description',
									label: 'תיאור',
									type: 'textarea',
									placeholder: 'תאר את המנה...'
								},
								{
									name: 'price',
									label: 'מחיר (₪)',
									type: 'number',
									placeholder: '45'
								},
								{
									name: 'image',
									label: 'תמונה',
									type: 'image'
								},
								{
									name: 'isVegan',
									label: 'טבעוני',
									type: 'checkbox'
								},
								{
									name: 'isGlutenFree',
									label: 'ללא גלוטן',
									type: 'checkbox'
								}
							]
						}
					]
				}
			]
		},
		{
			id: 'hours',
			title: 'שעות פתיחה',
			fields: [
				{
					name: 'sunday',
					label: 'ראשון',
					type: 'text',
					placeholder: '10:00 - 22:00'
				},
				{
					name: 'monday',
					label: 'שני',
					type: 'text',
					placeholder: '10:00 - 22:00'
				},
				{
					name: 'tuesday',
					label: 'שלישי',
					type: 'text',
					placeholder: '10:00 - 22:00'
				},
				{
					name: 'wednesday',
					label: 'רביעי',
					type: 'text',
					placeholder: '10:00 - 22:00'
				},
				{
					name: 'thursday',
					label: 'חמישי',
					type: 'text',
					placeholder: '10:00 - 22:00'
				},
				{
					name: 'friday',
					label: 'שישי',
					type: 'text',
					placeholder: '10:00 - 15:00'
				},
				{
					name: 'saturday',
					label: 'שבת',
					type: 'text',
					placeholder: 'סגור'
				}
			]
		},
		{
			id: 'delivery',
			title: 'משלוחים',
			fields: [
				{
					name: 'hasDelivery',
					label: 'יש משלוחים',
					type: 'checkbox'
				},
				{
					name: 'deliveryFee',
					label: 'עלות משלוח (₪)',
					type: 'number',
					placeholder: '20'
				},
				{
					name: 'minOrder',
					label: 'הזמנה מינימלית (₪)',
					type: 'number',
					placeholder: '50'
				},
				{
					name: 'deliveryAreas',
					label: 'אזורי משלוח',
					type: 'textarea',
					placeholder: 'תל אביב, רמת גן, גבעתיים...'
				}
			]
		},
		{
			id: 'reservation',
			title: 'הזמנת שולחן',
			fields: [
				{
					name: 'enableReservations',
					label: 'אפשר הזמנת שולחן',
					type: 'checkbox',
					help: 'הוסף טופס הזמנת שולחן לדף'
				},
				{
					name: 'reservationEmail',
					label: 'אימייל לקבלת הזמנות',
					type: 'email',
					placeholder: 'reservations@restaurant.com',
					help: 'הזמנות ישלחו לכתובת זו'
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
