<svelte:head>
	<title>תנאי שימוש | Page Builder Pro</title>
</svelte:head>

<div class="legal-page">
	<div class="container">
		<h1>תנאי שימוש</h1>
		<p class="last-updated">עדכון אחרון: {new Date().toLocaleDateString('he-IL')}</p>
		
		<section>
			<h2>1. כללי</h2>
			<p>ברוכים הבאים לשירות Page Builder Pro. השימוש בשירות מהווה הסכמה מלאה לתנאי השימוש המפורטים להלן.</p>
		</section>
		
		<section>
			<h2>2. השירות</h2>
			<p>Page Builder Pro מספק פלטפורמה ליצירת דפי נחיתה ואתרים מקצועיים. השירות כולל:</p>
			<ul>
				<li>יצירת דפים מותאמים אישית</li>
				<li>ניהול תוכן ומוצרים</li>
				<li>מערכת ניהול לקוחות</li>
				<li>כלי שיווק ואנליטיקה</li>
			</ul>
		</section>
		
		<section>
			<h2>3. חשבון משתמש</h2>
			<p>על המשתמש לספק מידע מדויק ומעודכן בעת יצירת חשבון. המשתמש אחראי לשמירה על סודיות פרטי ההתחברות שלו.</p>
		</section>
		
		<section>
			<h2>4. תוכן משתמש</h2>
			<p>המשתמש אחראי באופן בלעדי לתוכן שהוא מעלה ומפרסם באמצעות השירות. התוכן חייב להיות חוקי ולא לפגוע בזכויות צד שלישי.</p>
		</section>
		
		<section>
			<h2>5. קניין רוחני</h2>
			<p>כל הזכויות בשירות, לרבות עיצוב, קוד, לוגו וסימני מסחר, שייכות לחברה. המשתמש מקבל רישיון מוגבל לשימוש בשירות בלבד.</p>
		</section>
		
		<section>
			<h2>6. הגבלת אחריות</h2>
			<p>השירות ניתן "כמות שהוא" (AS IS). החברה אינה אחראית לנזקים ישירים או עקיפים הנובעים משימוש בשירות.</p>
		</section>
		
		<section>
			<h2>7. שינויים בתנאים</h2>
			<p>החברה שומרת לעצמה את הזכות לשנות את תנאי השימוש בכל עת. שינויים יכנסו לתוקף מיד עם פרסומם באתר.</p>
		</section>
		
		<section>
			<h2>8. יצירת קשר</h2>
			<p>לשאלות או הבהרות בנוגע לתנאי השימוש, ניתן ליצור קשר דרך:</p>
			<ul>
				<li>אימייל: support@pagebuilder.pro</li>
				<li>טלפון: 03-1234567</li>
			</ul>
		</section>
	</div>
</div>

<style>
	.legal-page {
		min-height: 100vh;
		background: #f5f7fa;
		padding: 40px 20px;
		font-family: 'Assistant', 'Heebo', sans-serif;
	}
	
	.container {
		max-width: 800px;
		margin: 0 auto;
		background: white;
		padding: 40px;
		border-radius: 12px;
		box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
	}
	
	h1 {
		color: #8b5cf6;
		font-size: 2.5rem;
		margin-bottom: 10px;
		text-align: center;
	}
	
	.last-updated {
		text-align: center;
		color: #6b7280;
		font-size: 0.875rem;
		margin-bottom: 30px;
		padding-bottom: 20px;
		border-bottom: 2px solid #e5e7eb;
	}
	
	section {
		margin-bottom: 30px;
	}
	
	h2 {
		color: #1f2937;
		font-size: 1.5rem;
		margin-bottom: 15px;
		padding-top: 10px;
	}
	
	p {
		color: #4b5563;
		line-height: 1.8;
		margin-bottom: 15px;
	}
	
	ul {
		margin: 15px 0;
		padding-right: 25px;
	}
	
	li {
		color: #4b5563;
		line-height: 1.8;
		margin-bottom: 8px;
	}
	
	@media (max-width: 768px) {
		.container {
			padding: 20px;
		}
		
		h1 {
			font-size: 2rem;
		}
		
		h2 {
			font-size: 1.25rem;
		}
	}
</style>
