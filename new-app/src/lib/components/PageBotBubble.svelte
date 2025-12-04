<script>
	import { onMount } from 'svelte';
	
	let { pageData } = $props();
	
	let showBot = $state(false);
	let botMessage = $state('');
	let isOpen = $state(false);
	let userInput = $state('');
	let messages = $state([]);
	let isLoading = $state(false);
	
	onMount(() => {
		// Show bot bubble immediately for testing (was 2 seconds)
		setTimeout(() => {
			showBot = true;
			botMessage = getWelcomeMessage();
			console.log('🤖 Bot bubble shown:', { showBot, botMessage });
		}, 500); // Reduced from 2000ms to 500ms for faster visibility
	});
	
	function getWelcomeMessage() {
		const pageType = pageData?.pageType || 'generic';
		const messages = {
			'store': 'שלום! אני כאן לעזור לך למצוא מוצרים 🛍️',
			'event': 'שלום! יש לך שאלות על האירוע? 🎉',
			'service': 'שלום! רוצה לקבוע תור? 📅',
			'restaurant': 'שלום! אשמח לעזור לך להזמין 🍽️',
			'course': 'שלום! מעוניין בקורס? 📚',
			'generic': 'שלום! איך אוכל לעזור? 💬'
		};
		return messages[pageType] || messages.generic;
	}
	
	function toggleBot() {
		isOpen = !isOpen;
	}
	
	function closeBot() {
		isOpen = false;
	}
	
	async function sendMessage(e) {
		e.preventDefault();
		
		if (!userInput.trim() || isLoading) return;
		
		const message = userInput.trim();
		messages = [...messages, { text: message, isUser: true }];
		userInput = '';
		isLoading = true;
		
		try {
			const response = await fetch('/api/n8n-webhook', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({
					message,
					context: 'page-bot',
					pageData: {
						title: pageData?.title,
						pageType: pageData?.pageType,
						phone: pageData?.phone,
						email: pageData?.email
					}
				})
			});
			
			if (!response.ok) throw new Error('Failed to send message');
			
			const data = await response.json();
			const botReply = data.message || data.response || 'מצטער, לא הבנתי. נסה שוב.';
			
			messages = [...messages, { text: botReply, isUser: false }];
			
			// Scroll to bottom
			setTimeout(() => {
				const chatEl = document.getElementById('chatMessages');
				if (chatEl) chatEl.scrollTop = chatEl.scrollHeight;
			}, 100);
			
		} catch (error) {
			console.error('Bot error:', error);
			messages = [...messages, { text: 'אופס, משהו השתבש. נסה שוב.', isUser: false }];
		} finally {
			isLoading = false;
		}
	}
</script>

{#if showBot}
	<!-- Bot Bubble - ALWAYS VISIBLE WITH HIGH Z-INDEX -->
	<div class="fixed bottom-6 right-6 z-[9999]">
		{#if !isOpen}
			<!-- Closed State - Floating Bubble -->
			<button 
				onclick={toggleBot}
				class="relative bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-full w-16 h-16 shadow-2xl hover:scale-110 transition-transform flex items-center justify-center animate-bounce-slow"
			>
				<svg class="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
					<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z"></path>
				</svg>
				
				<!-- Notification Badge -->
				<div class="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center font-bold">
					1
				</div>
			</button>
			
			<!-- Welcome Message Tooltip -->
			<div class="absolute bottom-20 right-0 bg-white rounded-lg shadow-xl p-4 max-w-xs animate-fade-in">
				<div class="text-sm text-gray-800 mb-2">{botMessage}</div>
				<button 
					onclick={toggleBot}
					class="text-xs text-indigo-600 hover:text-indigo-700 font-medium"
				>
					לחץ לשיחה →
				</button>
				<div class="absolute bottom-0 right-6 transform translate-y-1/2 rotate-45 w-3 h-3 bg-white"></div>
			</div>
		{:else}
			<!-- Open State - Chat Window -->
			<div class="bg-white rounded-2xl shadow-2xl w-80 h-96 flex flex-col animate-scale-in">
				<!-- Header -->
				<div class="bg-gradient-to-r from-purple-600 to-indigo-600 text-white p-4 rounded-t-2xl flex items-center justify-between">
					<div class="flex items-center gap-3">
						<div class="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
							🤖
						</div>
						<div>
							<div class="font-bold">עוזר וירטואלי</div>
							<div class="text-xs opacity-90">מקוון</div>
						</div>
					</div>
					<button 
						onclick={closeBot}
						class="text-white hover:bg-white/20 rounded-full p-1 transition"
					>
						<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
							<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
						</svg>
					</button>
				</div>
				
				<!-- Chat Body -->
				<div class="flex-1 p-4 overflow-y-auto bg-gray-50" id="chatMessages">
					<div class="bg-white rounded-lg p-3 shadow-sm mb-3">
						<div class="text-sm text-gray-800">{botMessage}</div>
						<div class="text-xs text-gray-500 mt-1">עכשיו</div>
					</div>
					
					{#each messages as msg}
						<div class="bg-{msg.isUser ? 'indigo-600 text-white' : 'white'} rounded-lg p-3 shadow-sm mb-3 {msg.isUser ? 'mr-8' : 'ml-8'}">
							<div class="text-sm">{msg.text}</div>
						</div>
					{/each}
					
					{#if isLoading}
						<div class="bg-white rounded-lg p-3 shadow-sm mb-3 ml-8">
							<div class="text-sm text-gray-500">מקליד...</div>
						</div>
					{/if}
				</div>
				
				<!-- Input -->
				<div class="p-4 border-t border-gray-200">
					<form onsubmit={sendMessage} class="flex gap-2">
						<input 
							type="text" 
							bind:value={userInput}
							placeholder="הקלד הודעה..."
							class="flex-1 px-4 py-2 border border-gray-300 rounded-full focus:outline-none focus:border-indigo-500"
						/>
						<button 
							type="submit"
							class="bg-indigo-600 text-white rounded-full p-2 hover:bg-indigo-700 transition disabled:opacity-50"
							disabled={isLoading || !userInput.trim()}
						>
							<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
								<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"></path>
							</svg>
						</button>
					</form>
				</div>
			</div>
		{/if}
	</div>
{/if}

<style>
	@keyframes bounce-slow {
		0%, 100% {
			transform: translateY(0);
		}
		50% {
			transform: translateY(-10px);
		}
	}
	
	@keyframes fade-in {
		from {
			opacity: 0;
			transform: translateY(10px);
		}
		to {
			opacity: 1;
			transform: translateY(0);
		}
	}
	
	@keyframes scale-in {
		from {
			opacity: 0;
			transform: scale(0.8);
		}
		to {
			opacity: 1;
			transform: scale(1);
		}
	}
	
	.animate-bounce-slow {
		animation: bounce-slow 3s ease-in-out infinite;
	}
	
	.animate-fade-in {
		animation: fade-in 0.3s ease-out;
	}
	
	.animate-scale-in {
		animation: scale-in 0.2s ease-out;
	}
</style>
