// Quick HTML Generation Template Configuration
export const quickTemplate = {
	id: 'quick',
	name: 'יצירה מהירה',
	icon: '⚡',
	description: 'צור דף מתיאור טקסט פשוט',
	image: 'https://images.unsplash.com/photo-1499951360447-b19be8fe80f5?q=80&w=2070&auto=format&fit=crop',
	
	infoBox: {
		title: '⚡ יצירה מהירה של דפים',
		description: '<strong>מה כולל:</strong> תאר את הדף שאתה רוצה במילים פשוטות, והמערכת תיצור עבורך דף HTML מעוצב ומוכן לשימוש.',
		boxColor: 'yellow'
	},
	
	fields: [
		{
			name: 'prompt',
			label: 'תאר את הדף שאתה רוצה',
			type: 'textarea',
			required: true,
			placeholder: 'לדוגמה: דף נחיתה למוצר חדש, דף אודות לעסק, דף שירות למספרה...',
			help: 'תאר במילים פשוטות מה אתה רוצה שיהיה בדף'
		}
	],
	
	designStyles: [
		{
			id: 'modern',
			name: 'מודרני',
			colors: {
				primary: '#667eea',
				secondary: '#764ba2',
				accent: '#10B981'
			}
		}
	]
};
