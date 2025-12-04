<script>
	import { goto } from '$app/navigation';
	
	let { userId } = $props();
	
	let prompt = $state('');
	let loading = $state(false);
	let error = $state('');
	let generatedHTML = $state('');
	let showPreview = $state(false);
	
	async function generateHTML() {
		if (!prompt.trim()) {
			error = 'נא להזין תיאור לדף';
			return;
		}
		
		loading = true;
		error = '';
		generatedHTML = '';
		
		try {
			const response = await fetch('/api/generate-html', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ prompt })
			});
			
			if (!response.ok) {
				throw new Error('Failed to generate HTML');
			}
			
			const result = await response.json();
			
			if (result.success) {
				generatedHTML = result.html;
				showPreview = true;
			} else {
				throw new Error(result.error || 'Generation failed');
			}
		} catch (err) {
			console.error('Generation error:', err);
			error = 'שגיאה ביצירת הדף: ' + err.message;
		} finally {
			loading = false;
		}
	}
	
	async function savePage() {
		if (!generatedHTML) return;
		
		loading = true;
		error = '';
		
		try {
			// Extract title from HTML
			const titleMatch = generatedHTML.match(/<title>(.*?)<\/title>/);
			const title = titleMatch ? titleMatch[1] : 'דף חדש';
			
			const response = await fetch('/api/create-page', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({
					userId,
					title,
					template: 'custom',
					htmlContent: generatedHTML,
					isPublic: true
				})
			});
			
			if (!response.ok) {
				throw new Error('Failed to save page');
			}
			
			const result = await response.json();
			
			if (result.success) {
				goto(`/pages/${result.slug}`);
			} else {
				throw new Error(result.error || 'Save failed');
			}
		} catch (err) {
			console.error('Save error:', err);
			error = 'שגיאה בשמירת הדף: ' + err.message;
		} finally {
			loading = false;
		}
	}
</script>

<div class="quick-html-generator max-w-4xl mx-auto p-6">
	<div class="bg-white rounded-lg shadow-lg p-6">
		<h2 class="text-2xl font-bold mb-4">יצירת דף מהירה</h2>
		<p class="text-gray-600 mb-6">תאר את הדף שאתה רוצה ליצור, והמערכת תייצר עבורך HTML מוכן</p>
		
		{#if error}
			<div class="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
				{error}
			</div>
		{/if}
		
		{#if !showPreview}
			<div class="space-y-4">
				<div>
					<label class="block text-sm font-medium mb-2">תאר את הדף שלך</label>
					<textarea
						bind:value={prompt}
						class="w-full border rounded-lg px-3 py-2 h-32"
						placeholder="לדוגמה: דף נחיתה למוצר חדש עם כותרת, תיאור, תמונה וכפתור קנייה"
						disabled={loading}
					></textarea>
				</div>
				
				<button
					onclick={generateHTML}
					disabled={loading || !prompt.trim()}
					class="w-full bg-purple-600 text-white px-6 py-3 rounded-lg hover:bg-purple-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
				>
					{#if loading}
						<span class="flex items-center justify-center">
							<svg class="animate-spin h-5 w-5 ml-3" viewBox="0 0 24 24">
								<circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" fill="none"></circle>
								<path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
							</svg>
							מייצר דף...
						</span>
					{:else}
						צור דף
					{/if}
				</button>
			</div>
		{:else}
			<div class="space-y-4">
				<div class="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded">
					הדף נוצר בהצלחה! תוכל לראות תצוגה מקדימה למטה
				</div>
				
				<div class="border rounded-lg p-4 bg-gray-50">
					<h3 class="font-bold mb-2">תצוגה מקדימה:</h3>
					<div class="border bg-white rounded overflow-hidden" style="height: 400px;">
						<iframe
							srcdoc={generatedHTML}
							class="w-full h-full"
							title="Preview"
						></iframe>
					</div>
				</div>
				
				<div class="flex gap-3">
					<button
						onclick={savePage}
						disabled={loading}
						class="flex-1 bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50"
					>
						{loading ? 'שומר...' : 'שמור דף'}
					</button>
					<button
						onclick={() => { showPreview = false; generatedHTML = ''; }}
						disabled={loading}
						class="flex-1 bg-gray-300 text-gray-700 px-6 py-3 rounded-lg hover:bg-gray-400 transition-colors"
					>
						צור דף חדש
					</button>
				</div>
			</div>
		{/if}
	</div>
</div>

<style>
	.quick-html-generator {
		min-height: 60vh;
	}
</style>
