<!-- Full-Screen Stav Bot - EXACT Legacy Implementation with Voice -->
<script>
	import { onMount } from 'svelte';
	
	let { isOpen = $bindable(false) } = $props();
	
	let messages = $state([
		{
			id: 1,
			type: 'bot',
			content: 'שלום! 👋 אני סתיו, העוזרת הדיגיטלית שלך.<br>איך אני יכולה לעזור לך היום?',
			timestamp: new Date()
		}
	]);
	
	let inputValue = $state('');
	let isTyping = $state(false);
	let isListening = $state(false);
	let isSpeaking = $state(false);
	let messagesContainer;
	let recognition;
	
	// Initialize speech recognition
	onMount(() => {
		if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
			const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
			recognition = new SpeechRecognition();
			recognition.lang = 'he-IL';
			recognition.continuous = false;
			recognition.interimResults = false;
			
			recognition.onresult = (event) => {
				const transcript = event.results[0][0].transcript;
				inputValue = transcript;
				isListening = false;
				sendMessage();
			};
			
			recognition.onerror = () => {
				isListening = false;
			};
			
			recognition.onend = () => {
				isListening = false;
			};
		}
	});
	
	// Close modal
	function closeModal() {
		isOpen = false;
		stopSpeaking();
	}
	
	// Send message
	async function sendMessage() {
		if (!inputValue.trim()) return;
		
		const userMessage = {
			id: Date.now(),
			type: 'user',
			content: inputValue.trim(),
			timestamp: new Date()
		};
		
		messages = [...messages, userMessage];
		inputValue = '';
		
		// Scroll to bottom
		setTimeout(() => scrollToBottom(), 100);
		
		// Show typing indicator
		isTyping = true;
		
		try {
			// CRITICAL FIX: Fetch all pages from Strapi first
			const pagesResponse = await fetch('/api/pages/all/marketplace');
			const pagesData = await pagesResponse.json();
			const allPages = pagesData.pages || [];
			
			// Now call search API with pages data
			const response = await fetch('/api/stav-search', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ 
					message: userMessage.content,
					allPages: allPages,
					context: 'full-screen-chat'
				})
			});
			
			const data = await response.json();
			
			isTyping = false;
			
			const botMessage = {
				id: Date.now() + 1,
				type: 'bot',
				content: data.message || 'מצטערת, לא הצלחתי להבין את השאלה',
				timestamp: new Date()
			};
			
			messages = [...messages, botMessage];
			
			// Speak the response (with fallback)
			await speakText(botMessage.content.replace(/<[^>]*>/g, ''));
			
			setTimeout(() => scrollToBottom(), 100);
			
		} catch (error) {
			console.error('Bot error:', error);
			isTyping = false;
			
			const errorMessage = {
				id: Date.now() + 1,
				type: 'bot',
				content: 'מצטערת, יש לי בעיה טכנית. נסה שוב בעוד רגע 🤖',
				timestamp: new Date()
			};
			
			messages = [...messages, errorMessage];
			setTimeout(() => scrollToBottom(), 100);
		}
	}
	
	// Speak text using Google TTS with browser fallback
	async function speakText(text) {
		if (isSpeaking) return;
		
		try {
			isSpeaking = true;
			
			const response = await fetch('/api/tts', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ text })
			});
			
			// Check if we got audio back (not JSON error)
			const contentType = response.headers.get('content-type');
			
			if (response.ok && contentType && contentType.includes('audio')) {
				// Use Google TTS
				const audioBlob = await response.blob();
				const audioUrl = URL.createObjectURL(audioBlob);
				const audio = new Audio(audioUrl);
				
				audio.onended = () => {
					isSpeaking = false;
					URL.revokeObjectURL(audioUrl);
				};
				
				audio.onerror = () => {
					isSpeaking = false;
					URL.revokeObjectURL(audioUrl);
					// Try browser fallback on error
					useBrowserSpeech(text);
				};
				
				await audio.play();
			} else {
				// Fallback to browser speech synthesis
				useBrowserSpeech(text);
			}
		} catch (error) {
			console.error('TTS error:', error);
			// Fallback to browser speech synthesis
			useBrowserSpeech(text);
		}
	}
	
	// Browser speech synthesis fallback
	function useBrowserSpeech(text) {
		if ('speechSynthesis' in window) {
			try {
				const utterance = new SpeechSynthesisUtterance(text);
				utterance.lang = 'he-IL';
				utterance.rate = 1.0;
				utterance.pitch = 1.0;
				
				utterance.onend = () => {
					isSpeaking = false;
				};
				
				utterance.onerror = () => {
					isSpeaking = false;
				};
				
				window.speechSynthesis.speak(utterance);
			} catch (error) {
				console.error('Browser speech error:', error);
				isSpeaking = false;
			}
		} else {
			isSpeaking = false;
		}
	}
	
	// Stop speaking
	function stopSpeaking() {
		isSpeaking = false;
		// Stop any playing audio
		document.querySelectorAll('audio').forEach(audio => {
			audio.pause();
			audio.currentTime = 0;
		});
	}
	
	// Start voice input
	function startListening() {
		if (!recognition || isListening) return;
		
		isListening = true;
		stopSpeaking();
		recognition.start();
	}
	
	// Stop voice input
	function stopListening() {
		if (!recognition || !isListening) return;
		
		isListening = false;
		recognition.stop();
	}
	
	// Scroll to bottom
	function scrollToBottom() {
		if (messagesContainer) {
			messagesContainer.scrollTop = messagesContainer.scrollHeight;
		}
	}
	
	// Handle Enter key
	function handleKeyPress(event) {
		if (event.key === 'Enter' && !event.shiftKey) {
			event.preventDefault();
			sendMessage();
		}
	}
	
	// Format timestamp
	function formatTime(date) {
		return date.toLocaleTimeString('he-IL', { 
			hour: '2-digit', 
			minute: '2-digit' 
		});
	}
</script>

<!-- Full-Screen Modal Overlay -->
{#if isOpen}
	<div class="stav-fullscreen-overlay" onclick={closeModal}>
		<div class="stav-fullscreen-container" onclick={(e) => e.stopPropagation()}>
			<!-- Header -->
			<div class="stav-header">
				<div class="header-content">
					<div class="avatar-container">
						<img src="https://i.ibb.co/9ZQZ8ZQ/stav-avatar.png" alt="Stav" class="header-avatar" />
						{#if isSpeaking}
							<div class="speaking-indicator"></div>
						{/if}
					</div>
					<div class="header-text">
						<h2>סתיו - העוזרת הדיגיטלית</h2>
						<p class="status">
							{#if isSpeaking}
								🔊 מדברת...
							{:else if isListening}
								🎤 מקשיבה...
							{:else}
								מחוברת ומוכנה לעזור 🤖
							{/if}
						</p>
					</div>
				</div>
				<button class="close-btn" onclick={closeModal}>
					<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
						<line x1="18" y1="6" x2="6" y2="18"></line>
						<line x1="6" y1="6" x2="18" y2="18"></line>
					</svg>
				</button>
			</div>
			
			<!-- Messages Area -->
			<div class="messages-area" bind:this={messagesContainer}>
				{#each messages as message (message.id)}
					<div class="message {message.type}">
						<div class="message-content">
							{@html message.content}
						</div>
						<div class="message-time">{formatTime(message.timestamp)}</div>
					</div>
				{/each}
				
				{#if isTyping}
					<div class="message bot typing-message">
						<div class="message-content">
							<div class="typing-indicator">
								<span>סתיו מקלידה</span>
								<div class="typing-dots">
									<div class="typing-dot"></div>
									<div class="typing-dot"></div>
									<div class="typing-dot"></div>
								</div>
							</div>
						</div>
					</div>
				{/if}
			</div>
			
			<!-- Input Area -->
			<div class="input-area">
				<div class="input-container">
					<textarea 
						bind:value={inputValue}
						onkeydown={handleKeyPress}
						placeholder="הקלד הודעה או לחץ על המיקרופון לדיבור..."
						rows="1"
						disabled={isListening}
					></textarea>
					
					<div class="input-buttons">
						<!-- Voice Input Button -->
						{#if recognition}
							<button 
								class="voice-btn {isListening ? 'listening' : ''}"
								onclick={isListening ? stopListening : startListening}
								title={isListening ? 'עצור הקלטה' : 'התחל הקלטה'}
							>
								<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
									<path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z"></path>
									<path d="M19 10v2a7 7 0 0 1-14 0v-2"></path>
									<line x1="12" y1="19" x2="12" y2="23"></line>
									<line x1="8" y1="23" x2="16" y2="23"></line>
								</svg>
							</button>
						{/if}
						
						<!-- Send Button -->
						<button 
							class="send-btn"
							onclick={sendMessage}
							disabled={!inputValue.trim() || isListening}
							title="שלח הודעה"
						>
							<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
								<line x1="22" y1="2" x2="11" y2="13"></line>
								<polygon points="22,2 15,22 11,13 2,9"></polygon>
							</svg>
						</button>
					</div>
				</div>
			</div>
		</div>
	</div>
{/if}

<style>
	/* Full-Screen Stav Bot Styles - EXACT Legacy Design with CSS Isolation */
	:global(.stav-fullscreen-overlay) {
		position: fixed !important;
		top: 0 !important;
		left: 0 !important;
		width: 100vw !important;
		height: 100vh !important;
		background: rgba(0, 0, 0, 0.8) !important;
		backdrop-filter: blur(10px) !important;
		z-index: 9999 !important;
		display: flex !important;
		align-items: center !important;
		justify-content: center !important;
		padding: 20px !important;
		animation: fadeIn 0.3s ease-out !important;
		font-family: 'Heebo', sans-serif !important;
	}
	
	:global(.stav-fullscreen-container) {
		width: 100% !important;
		max-width: 800px !important;
		height: 90vh !important;
		max-height: 700px !important;
		background: linear-gradient(135deg, #667eea 0%, #764ba2 100%) !important;
		border-radius: 20px !important;
		box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3) !important;
		display: flex !important;
		flex-direction: column !important;
		overflow: hidden !important;
		animation: slideUp 0.4s ease-out !important;
	}
	
	:global(.stav-header) {
		padding: 25px 30px !important;
		background: rgba(255, 255, 255, 0.1) !important;
		backdrop-filter: blur(10px) !important;
		border-bottom: 1px solid rgba(255, 255, 255, 0.2) !important;
		display: flex !important;
		align-items: center !important;
		justify-content: space-between !important;
		color: white !important;
	}
	
	:global(.header-content) {
		display: flex !important;
		align-items: center !important;
		gap: 20px !important;
	}
	
	:global(.avatar-container) {
		position: relative !important;
	}
	
	:global(.header-avatar) {
		width: 60px !important;
		height: 60px !important;
		border-radius: 50% !important;
		object-fit: cover !important;
		border: 3px solid rgba(255, 255, 255, 0.3) !important;
	}
	
	:global(.speaking-indicator) {
		position: absolute !important;
		top: -5px !important;
		right: -5px !important;
		width: 70px !important;
		height: 70px !important;
		border: 2px solid #00ff88 !important;
		border-radius: 50% !important;
		animation: pulse 1.5s infinite !important;
	}
	
	:global(.header-text h2) {
		margin: 0 !important;
		font-size: 24px !important;
		font-weight: 600 !important;
		font-family: 'Heebo', sans-serif !important;
	}
	
	:global(.header-text .status) {
		margin: 5px 0 0 0 !important;
		font-size: 14px !important;
		opacity: 0.9 !important;
		font-weight: 400 !important;
	}
	
	:global(.close-btn) {
		background: rgba(255, 255, 255, 0.2) !important;
		border: none !important;
		color: white !important;
		width: 45px !important;
		height: 45px !important;
		border-radius: 50% !important;
		cursor: pointer !important;
		display: flex !important;
		align-items: center !important;
		justify-content: center !important;
		transition: all 0.3s ease !important;
	}
	
	:global(.close-btn:hover) {
		background: rgba(255, 255, 255, 0.3) !important;
		transform: scale(1.1) !important;
	}
	
	:global(.messages-area) {
		flex: 1 !important;
		padding: 30px !important;
		overflow-y: auto !important;
		background: rgba(255, 255, 255, 0.95) !important;
		display: flex !important;
		flex-direction: column !important;
		gap: 20px !important;
	}
	
	:global(.message) {
		max-width: 70% !important;
		word-wrap: break-word !important;
		animation: messageIn 0.4s ease-out !important;
	}
	
	:global(.message.bot) {
		align-self: flex-start !important;
	}
	
	:global(.message.user) {
		align-self: flex-end !important;
	}
	
	:global(.message-content) {
		padding: 15px 20px !important;
		border-radius: 20px !important;
		font-size: 16px !important;
		line-height: 1.5 !important;
		font-family: 'Heebo', sans-serif !important;
	}
	
	:global(.message.bot .message-content) {
		background: #f1f5f9 !important;
		color: #334155 !important;
		border-bottom-left-radius: 8px !important;
		box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1) !important;
	}
	
	:global(.message.user .message-content) {
		background: linear-gradient(135deg, #667eea 0%, #764ba2 100%) !important;
		color: white !important;
		border-bottom-right-radius: 8px !important;
		box-shadow: 0 2px 10px rgba(102, 126, 234, 0.3) !important;
	}
	
	:global(.message-time) {
		font-size: 12px !important;
		color: #64748b !important;
		margin-top: 5px !important;
		text-align: center !important;
	}
	
	:global(.typing-indicator) {
		display: flex !important;
		align-items: center !important;
		gap: 10px !important;
		font-style: italic !important;
		color: #64748b !important;
	}
	
	:global(.typing-dots) {
		display: flex !important;
		gap: 4px !important;
	}
	
	:global(.typing-dot) {
		width: 8px !important;
		height: 8px !important;
		border-radius: 50% !important;
		background-color: #667eea !important;
		animation: bounce 1.4s infinite !important;
	}
	
	:global(.typing-dot:nth-child(2)) {
		animation-delay: 0.2s !important;
	}
	
	:global(.typing-dot:nth-child(3)) {
		animation-delay: 0.4s !important;
	}
	
	:global(.input-area) {
		padding: 25px 30px !important;
		background: rgba(255, 255, 255, 0.1) !important;
		backdrop-filter: blur(10px) !important;
		border-top: 1px solid rgba(255, 255, 255, 0.2) !important;
	}
	
	:global(.input-container) {
		display: flex !important;
		gap: 15px !important;
		align-items: flex-end !important;
	}
	
	:global(.input-container textarea) {
		flex: 1 !important;
		padding: 15px 20px !important;
		border: 2px solid rgba(255, 255, 255, 0.3) !important;
		border-radius: 25px !important;
		background: rgba(255, 255, 255, 0.9) !important;
		color: #334155 !important;
		font-size: 16px !important;
		font-family: 'Heebo', sans-serif !important;
		resize: none !important;
		outline: none !important;
		transition: all 0.3s ease !important;
		max-height: 120px !important;
	}
	
	:global(.input-container textarea:focus) {
		border-color: rgba(255, 255, 255, 0.6) !important;
		background: white !important;
		box-shadow: 0 0 0 3px rgba(255, 255, 255, 0.2) !important;
	}
	
	:global(.input-container textarea:disabled) {
		opacity: 0.6 !important;
		cursor: not-allowed !important;
	}
	
	:global(.input-buttons) {
		display: flex !important;
		gap: 10px !important;
	}
	
	:global(.voice-btn), :global(.send-btn) {
		width: 50px !important;
		height: 50px !important;
		border: none !important;
		border-radius: 50% !important;
		cursor: pointer !important;
		display: flex !important;
		align-items: center !important;
		justify-content: center !important;
		transition: all 0.3s ease !important;
		color: white !important;
	}
	
	:global(.voice-btn) {
		background: rgba(255, 255, 255, 0.2) !important;
		border: 2px solid rgba(255, 255, 255, 0.3) !important;
	}
	
	:global(.voice-btn:hover) {
		background: rgba(255, 255, 255, 0.3) !important;
		transform: scale(1.1) !important;
	}
	
	:global(.voice-btn.listening) {
		background: #ff4757 !important;
		border-color: #ff4757 !important;
		animation: pulse 1s infinite !important;
	}
	
	:global(.send-btn) {
		background: rgba(255, 255, 255, 0.9) !important;
		color: #667eea !important;
	}
	
	:global(.send-btn:hover:not(:disabled)) {
		background: white !important;
		transform: scale(1.1) !important;
	}
	
	:global(.send-btn:disabled) {
		opacity: 0.5 !important;
		cursor: not-allowed !important;
		transform: none !important;
	}
	
	/* Animations */
	@keyframes fadeIn {
		from { opacity: 0; }
		to { opacity: 1; }
	}
	
	@keyframes slideUp {
		from { 
			opacity: 0; 
			transform: translateY(50px) scale(0.9); 
		}
		to { 
			opacity: 1; 
			transform: translateY(0) scale(1); 
		}
	}
	
	@keyframes messageIn {
		from { 
			opacity: 0; 
			transform: translateY(20px); 
		}
		to { 
			opacity: 1; 
			transform: translateY(0); 
		}
	}
	
	@keyframes bounce {
		0%, 20%, 50%, 80%, 100% {
			transform: translateY(0);
		}
		40% {
			transform: translateY(-8px);
		}
		60% {
			transform: translateY(-4px);
		}
	}
	
	@keyframes pulse {
		0% {
			transform: scale(1);
			opacity: 1;
		}
		100% {
			transform: scale(1.4);
			opacity: 0;
		}
	}
	
	/* Responsive */
	@media (max-width: 768px) {
		.stav-fullscreen-container {
			max-width: 100%;
			height: 100vh;
			max-height: 100vh;
			border-radius: 0;
		}
		
		.messages-area {
			padding: 20px;
		}
		
		.input-area {
			padding: 15px 20px;
		}
	}
</style>
