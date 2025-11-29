<script>
	// Stav Bot - Smart Marketplace Search
	let isOpen = $state(false);
	let userMessage = $state('');
	let messages = $state([]);
	let isLoading = $state(false);
	
	function toggleBot() {
		isOpen = !isOpen;
		if (isOpen && messages.length === 0) {
			// Welcome message
			messages = [{
				text: 'היי! אני סתיו 👋\n\nאני כאן לעזור לך למצוא את הדף המושלם!\n\nנסה לשאול אותי:\n• "אני מחפש מספרה בתל אביב"\n• "תראה לי חנויות אונליין"\n• "יש לך אירועים?"\n\nמה אתה מחפש?',
				isBot: true
			}];
		}
	}
	
	async function sendMessage() {
		if (!userMessage.trim() || isLoading) return;
		
		const message = userMessage.trim();
		userMessage = '';
		
		// Add user message
		messages = [...messages, { text: message, isBot: false }];
		
		// Show loading
		isLoading = true;
		messages = [...messages, { text: 'סתיו מקלידה...', isBot: true, isLoading: true }];
		
		try {
			// Fetch all pages
			const pagesResponse = await fetch('/api/pages/all/marketplace');
			const pagesData = await pagesResponse.json();
			const allPages = pagesData.pages || [];
			
			// Send to smart search
			const response = await fetch('/api/stav-search', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({
					message,
					allPages: allPages.map(p => ({
						title: p.title,
						description: p.description,
						pageType: p.pageType,
						category: p.category,
						city: p.city,
						phone: p.phone,
						slug: p.slug,
						pageId: p.id
					}))
				})
			});
			
			// Remove loading message
			messages = messages.filter(m => !m.isLoading);
			
			if (!response.ok) {
				throw new Error('Search failed');
			}
			
			const result = await response.json();
			
			// Format response
			let botMessage = '';
			
			if (result.pages && result.pages.length > 0) {
				botMessage = result.message || `מצאתי ${result.pages.length} תוצאות:\n\n`;
				
				result.pages.slice(0, 5).forEach((page, idx) => {
					botMessage += `${idx + 1}. **${page.title}**\n`;
					if (page.description) {
						botMessage += `   ${page.description}\n`;
					}
					if (page.city) {
						botMessage += `   📍 ${page.city}`;
					}
					if (page.phone) {
						botMessage += ` • 📞 ${page.phone}`;
					}
					botMessage += `\n   [צפה בדף](/view/${page.slug})\n\n`;
				});
				
				if (result.pages.length > 5) {
					botMessage += `\n...ועוד ${result.pages.length - 5} תוצאות נוספות`;
				}
			} else {
				botMessage = result.message || 'מצטערת, לא מצאתי תוצאות מתאימות. נסה לנסח אחרת?';
			}
			
			messages = [...messages, { text: botMessage, isBot: true }];
			
		} catch (error) {
			console.error('Stav Bot error:', error);
			messages = messages.filter(m => !m.isLoading);
			messages = [...messages, { 
				text: 'אופס, משהו השתבש. נסה שוב בבקשה.', 
				isBot: true 
			}];
		} finally {
			isLoading = false;
		}
	}
	
	function handleKeyPress(e) {
		if (e.key === 'Enter' && !e.shiftKey) {
			e.preventDefault();
			sendMessage();
		}
	}
</script>

<!-- Bot Button -->
<button
	onclick={toggleBot}
	class="fixed bottom-20 right-6 w-16 h-16 bg-gradient-to-r from-purple-600 to-pink-500 text-white rounded-full shadow-lg hover:scale-110 transition-transform z-50 flex items-center justify-center"
	aria-label="פתח צ'אט עם סתיו"
>
	{#if isOpen}
		<svg class="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
			<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
		</svg>
	{:else}
		<svg class="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
			<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z"></path>
		</svg>
	{/if}
</button>

<!-- Chat Window -->
{#if isOpen}
	<div class="fixed bottom-40 right-6 w-96 h-[500px] bg-white rounded-2xl shadow-2xl z-50 flex flex-col overflow-hidden">
		<!-- Header -->
		<div class="bg-gradient-to-r from-purple-600 to-pink-500 text-white p-4 flex items-center justify-between">
			<div class="flex items-center gap-3">
				<div class="w-10 h-10 bg-white rounded-full flex items-center justify-center text-2xl">
					🤖
				</div>
				<div>
					<h3 class="font-bold">סתיו</h3>
					<p class="text-xs opacity-90">עוזרת חכמה</p>
				</div>
			</div>
			<button
				onclick={toggleBot}
				class="hover:bg-white/20 rounded-full p-1 transition"
			>
				<svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
					<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
				</svg>
			</button>
		</div>
		
		<!-- Messages -->
		<div class="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50">
			{#each messages as message}
				<div class="flex {message.isBot ? 'justify-start' : 'justify-end'}">
					<div class="max-w-[80%] {message.isBot ? 'bg-white' : 'bg-purple-600 text-white'} rounded-2xl px-4 py-3 shadow">
						{#if message.isLoading}
							<div class="flex gap-1">
								<div class="w-2 h-2 bg-purple-600 rounded-full animate-bounce"></div>
								<div class="w-2 h-2 bg-purple-600 rounded-full animate-bounce" style="animation-delay: 0.1s"></div>
								<div class="w-2 h-2 bg-purple-600 rounded-full animate-bounce" style="animation-delay: 0.2s"></div>
							</div>
						{:else}
							<p class="text-sm whitespace-pre-wrap">{@html message.text.replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>').replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" class="underline" target="_blank">$1</a>')}</p>
						{/if}
					</div>
				</div>
			{/each}
		</div>
		
		<!-- Input -->
		<div class="p-4 border-t border-gray-200 bg-white">
			<div class="flex gap-2">
				<input
					type="text"
					bind:value={userMessage}
					onkeypress={handleKeyPress}
					placeholder="הקלד הודעה..."
					disabled={isLoading}
					class="flex-1 border border-gray-300 rounded-full px-4 py-2 focus:outline-none focus:ring-2 focus:ring-purple-500 disabled:opacity-50"
				/>
				<button
					onclick={sendMessage}
					disabled={isLoading || !userMessage.trim()}
					class="bg-purple-600 text-white rounded-full w-10 h-10 flex items-center justify-center hover:bg-purple-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
				>
					<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
						<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"></path>
					</svg>
				</button>
			</div>
		</div>
	</div>
{/if}

<style>
	@keyframes bounce {
		0%, 100% {
			transform: translateY(0);
		}
		50% {
			transform: translateY(-5px);
		}
	}
	
	.animate-bounce {
		animation: bounce 0.6s infinite;
	}
</style>
