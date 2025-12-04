<svelte:head>
	<title>הצהרת נגישות – סתיו הבינה המלכותית / Autopage</title>
</svelte:head>

<div class="legal-page">
	<div class="container">
		<h1>הצהרת נגישות – סתיו הבינה המלכותית / Autopage</h1>
		<p class="last-updated">עודכן: 2025 – התאמה לתקן הישראלי 5568 + WCAG 2.1 AA</p>
		
		<section>
			<h2>1. כללי</h2>
			<p>האתר מחויב לאפשר גלישה נוחה ונגישה לכלל המשתמשים, כולל אנשים עם מוגבלות, בהתאם לחוק שוויון זכויות לאנשים עם מוגבלות ותקנות הנגישות.</p>
		</section>
		
		<section>
			<h2>2. התאמות נגישות שבוצעו</h2>
			<ul>
				<li>ניווט מלא באמצעות מקלדת</li>
				<li>אפשרות הגדלת טקסטים</li>
				<li>ניגודיות גבוהה</li>
				<li>כותרות מסודרות לפי היררכיה</li>
				<li>טקסט חלופי לתמונות</li>
				<li>התאמות לטכנולוגיות מסייעות (קורא מסך)</li>
				<li>התאמה לצבעי רקע</li>
				<li>קישורים מודגשים וברורים</li>
				<li>טפסים נגישים</li>
				<li>מבנה HTML תקני</li>
				<li>כפתור נגישות ייעודי</li>
				<li>תגיות ARIA מתאימות</li>
				<li>אנימציות עם אפשרות ביטול</li>
			</ul>
		</section>
		
		<section>
			<h2>3. סטטוס התאמה</h2>
			<p>האתר עומד ברוב דרישות WCAG 2.1 AA. ייתכנו חלקים שעדיין בתהליך שיפור, במיוחד תכנים דינמיים או תוספים חיצוניים.</p>
		</section>
		
		<section>
			<h2>4. תקלות נגישות מוכרות</h2>
			<ul>
				<li>תוספים חיצוניים (אם קיימים) עשויים להיות מוגבלים</li>
				<li>תכנים שהוזנו על-ידי צד שלישי</li>
			</ul>
		</section>
		
		<section>
			<h2>5. פנייה בנושא נגישות</h2>
			<p>אם מצאת ליקוי – נשמח לטפל:</p>
			<ul>
				<li><strong>טלפון:</strong> 058-5378109</li>
				<li><strong>אימייל:</strong> britolam1@gmail.com</li>
			</ul>
			<p>זמן מענה לבקשות נגישות: עד 14 ימי עסקים (כנדרש בחוק).</p>
		</section>
	</div>
</div>

<style>
	.legal-page {
		min-height: 100vh;
		background: #f5f7fa;
		padding: 40px 20px;
		font-family: 'Assistant', 'Heebo', sans-serif;
		direction: rtl;
	}
	
	.container {
		max-width: 900px;
		margin: 0 auto;
		background: white;
		padding: 50px;
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
		font-size: 0.95rem;
		margin-bottom: 30px;
		padding-bottom: 20px;
		border-bottom: 2px solid #e5e7eb;
	}
	
	section {
		margin-bottom: 35px;
	}
	
	h2 {
		color: #1f2937;
		font-size: 1.6rem;
		margin-bottom: 15px;
		padding-top: 10px;
	}
	
	p {
		color: #4b5563;
		line-height: 1.9;
		margin-bottom: 15px;
		font-size: 1.05rem;
	}
	
	ul {
		margin: 15px 0;
		padding-right: 25px;
	}
	
	li {
		color: #4b5563;
		line-height: 1.9;
		margin-bottom: 10px;
		font-size: 1.05rem;
	}
	
	strong {
		color: #1f2937;
		font-weight: 600;
	}
	
	@media (max-width: 768px) {
		.container {
			padding: 25px;
		}
		
		h1 {
			font-size: 1.8rem;
		}
		
		h2 {
			font-size: 1.3rem;
		}
	}
</style>
