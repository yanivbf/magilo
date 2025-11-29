<script>
	// @ts-check
	import { goto } from '$app/navigation';
	import { currentUser } from '$lib/stores/auth';
	import { onMount } from 'svelte';
	
	// Redirect based on auth status
	onMount(() => {
		// Give a moment for auth to initialize
		setTimeout(() => {
			if ($currentUser) {
				goto('/dashboard');
			}
		}, 100);
	});
</script>

<svelte:head>
	<title>AutoPage - דף כניסה</title>
	<meta name="description" content="דף נחיתה מנצח. בלחיצת כפתור." />
</svelte:head>

<!-- Purple Gradient Background -->
<div class="bg-gradient-to-br from-purple-50 via-blue-50 to-indigo-100 min-h-screen">
	<!-- Hero Section with Purple Gradient -->
	<div class="hero-gradient text-white">
		<div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
			<div class="text-center">
				<h1 class="text-4xl md:text-6xl font-bold mb-4">AutoPage</h1>
				<p class="text-xl md:text-2xl mb-8 opacity-90">דף נחיתה מנצח. בלחיצת כפתור.</p>
				
				<!-- CTA Buttons -->
				<div class="flex justify-center gap-4 flex-wrap">
					<a href="/login" class="bg-white text-indigo-600 px-8 py-4 rounded-full font-bold text-lg hover:bg-gray-100 transition-all transform hover:scale-105 flex items-center gap-2">
						<svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
							<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1"></path>
						</svg>
						התחבר
					</a>
					<a href="/marketplace" class="bg-purple-600 text-white px-8 py-4 rounded-full font-bold text-lg hover:bg-purple-700 transition-all transform hover:scale-105">
						עיין בשוק
					</a>
				</div>
			</div>
		</div>
	</div>

	<!-- Features Section -->
	<div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
		<div class="text-center mb-12">
			<h2 class="text-3xl md:text-4xl font-bold text-gray-900 mb-4">מה אנחנו מציעים?</h2>
			<p class="text-xl text-gray-600">תפסיק לבזבז זמן וכסף. הבוט החכם של AutoPage יבנה לך דף נחיתה מקצועי</p>
		</div>

		<div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
			<!-- Feature 1 -->
			<div class="bg-white rounded-lg shadow-lg p-6 hover:shadow-xl transition-shadow">
				<div class="text-5xl mb-4">✨</div>
				<h3 class="text-xl font-bold text-gray-900 mb-2">יצירה מיידית</h3>
				<p class="text-gray-600">ענה על כמה שאלות והדף שלך באוויר</p>
			</div>

			<!-- Feature 2 -->
			<div class="bg-white rounded-lg shadow-lg p-6 hover:shadow-xl transition-shadow">
				<div class="text-5xl mb-4">🎨</div>
				<h3 class="text-xl font-bold text-gray-900 mb-2">עיצוב יוקרתי</h3>
				<p class="text-gray-600">בחר מתוך תבניות שנראות כאילו עוצבו בסטודיו</p>
			</div>

			<!-- Feature 3 -->
			<div class="bg-white rounded-lg shadow-lg p-6 hover:shadow-xl transition-shadow">
				<div class="text-5xl mb-4">🚀</div>
				<h3 class="text-xl font-bold text-gray-900 mb-2">מוכן לצמיחה</h3>
				<p class="text-gray-600">חיבור קל לוואטסאפ, אימייל וניהול לידים</p>
			</div>

			<!-- Feature 4 -->
			<div class="bg-white rounded-lg shadow-lg p-6 hover:shadow-xl transition-shadow">
				<div class="text-5xl mb-4">💡</div>
				<h3 class="text-xl font-bold text-gray-900 mb-2">24/7 בשבילך</h3>
				<p class="text-gray-600">הבוט עונה לגולשים גם כשאתה ישן</p>
			</div>

			<!-- Feature 5 -->
			<div class="bg-white rounded-lg shadow-lg p-6 hover:shadow-xl transition-shadow">
				<div class="text-5xl mb-4">🛒</div>
				<h3 class="text-xl font-bold text-gray-900 mb-2">חנות מקוונת</h3>
				<p class="text-gray-600">מכירת מוצרים עם עגלת קניות מובנית</p>
			</div>

			<!-- Feature 6 -->
			<div class="bg-white rounded-lg shadow-lg p-6 hover:shadow-xl transition-shadow">
				<div class="text-5xl mb-4">📊</div>
				<h3 class="text-xl font-bold text-gray-900 mb-2">ניתוח נתונים</h3>
				<p class="text-gray-600">מעקב אחר ביצועים ומכירות</p>
			</div>
		</div>
	</div>

	<!-- Footer -->
	<footer class="bg-gray-800 text-white py-8 mt-16">
		<div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
			<p class="opacity-80">© 2024 AutoPage - כל הזכויות שמורות</p>
		</div>
	</footer>
</div>
