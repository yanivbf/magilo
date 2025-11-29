<!-- Student & Purchase Manager (for course pages) -->
<script>
	let { data } = $props();
</script>

<div class="min-h-screen bg-gray-50 p-6">
	<div class="max-w-7xl mx-auto">
		<div class="bg-white rounded-lg shadow p-6">
			<h1 class="text-2xl font-bold mb-4">🎓 ניהול תלמידים ורכישות</h1>
			<p class="text-gray-600">ממשק ניהול קורסים - בפיתוח</p>
			<p class="text-sm text-gray-500 mt-2">עמוד: {data.page?.title}</p>
			<p class="text-sm text-gray-500">סוג: {data.page?.pageType}</p>
		</div>
	</div>
</div>
