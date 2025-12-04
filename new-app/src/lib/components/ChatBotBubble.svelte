<script>
	let isOpen = $state(false);
	let message = $state('');
	let messages = $state([
		{
			type: 'bot',
			text: 'שלום! 👋 אני כאן לעזור לך. במה אוכל לסייע?'
		}
	]);
	
	function toggleChat() {
		isOpen = !isOpen;
	}
	
	function sendMessage() {
		if (!message.trim()) return;
		
		// Add user message
		messages = [...messages, {
			type: 'user',
			text: message
		}];
		
		const userMessage = message;
		message = '';
		
		// Simulate bot response
		setTimeout(() => {
			messages = [...messages, {
				type: 'bot',
				text: getResponse(userMessage)
			}];
		}, 500);
	}
	
	function getResponse(msg) {
		const lower = msg.toLowerCase();
		
		if (lower.includes('שעות') || lower.includes('פתיחה')) {
			return 'שעות הפעילות שלנו: ראשון-חמישי 9:00-18:00, שישי 9:00-14:00';
		}
		if (lower.includes('מחיר') || lower.includes('עלות')) {
			return 'למידע על מחירים, אנא צור קשר בטלפון או השאר פרטים ונחזור אליך בהקדם';
		}
		if (lower.includes('כתובת') || lower.includes('מיקום')) {
			return 'ניתן למצוא את הכתובת המלאה בסוף הדף במקטע יצירת הקשר';
		}
		if (lower.includes('תור') || lower.includes('הזמנה')) {
			return 'לקביעת תור, אנא התקשר אלינו או השתמש בטופס ההזמנה באתר';
		}
		
		return 'תודה על פנייתך! נציג יחזור אליך בהקדם. לשירות מיידי, אנא התקשר אלינו 📞';
	}
	
	function handleKeyPress(e) {
		if (e.key === 'Enter' && !e.shiftKey) {
			e.preventDefault();
			sendMessage();
		}
	}
</script>

<!-- Chat Bot Button -->
<button 
	class="chatbot-btn" 
	onclick={toggleChat}
	aria-label="פתח צ'אט"
	title="צ'אט"
>
	{#if isOpen}
		<svg viewBox="0 0 24 24" fill="currentColor">
			<path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/>
		</svg>
	{:else}
		<svg viewBox="0 0 24 24" fill="currentColor">
			<path d="M20 2H4c-1.1 0-2 .9-2 2v18l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zm0 14H6l-2 2V4h16v12z"/>
		</svg>
	{/if}
</button>

<!-- Chat Window -->
{#if isOpen}
	<div class="chat-window">
		<div class="chat-header">
			<div class="header-content">
				<div class="bot-avatar">🤖</div>
				<div>
					<h3>צ'אט אונליין</h3>
					<p class="status">מקוון</p>
				</div>
			</div>
			<button class="close-btn" onclick={toggleChat} aria-label="סגור">✕</button>
		</div>
		
		<div class="chat-messages">
			{#each messages as msg}
				<div class="message {msg.type}">
					{#if msg.type === 'bot'}
						<div class="message-avatar">🤖</div>
					{/if}
					<div class="message-bubble">
						{msg.text}
					</div>
				</div>
			{/each}
		</div>
		
		<div class="chat-input">
			<input
				type="text"
				bind:value={message}
				onkeypress={handleKeyPress}
				placeholder="הקלד הודעה..."
				aria-label="הודעה"
			/>
			<button onclick={sendMessage} aria-label="שלח">
				<svg viewBox="0 0 24 24" fill="currentColor">
					<path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z"/>
				</svg>
			</button>
		</div>
	</div>
{/if}

<style>
	.chatbot-btn {
		position: fixed;
		bottom: 100px;
		right: 30px;
		width: 60px;
		height: 60px;
		background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
		border: none;
		border-radius: 50%;
		display: flex;
		align-items: center;
		justify-content: center;
		box-shadow: 0 4px 20px rgba(102, 126, 234, 0.4);
		cursor: pointer;
		z-index: 9996;
		transition: all 0.3s ease;
	}
	
	.chatbot-btn:hover {
		transform: scale(1.1);
		box-shadow: 0 6px 30px rgba(102, 126, 234, 0.6);
	}
	
	.chatbot-btn svg {
		width: 28px;
		height: 28px;
		color: white;
	}
	
	.chat-window {
		position: fixed;
		bottom: 170px;
		right: 30px;
		width: 380px;
		height: 500px;
		background: white;
		border-radius: 16px;
		box-shadow: 0 10px 40px rgba(0, 0, 0, 0.2);
		z-index: 9997;
		display: flex;
		flex-direction: column;
		animation: slideUp 0.3s ease-out;
	}
	
	@keyframes slideUp {
		from {
			opacity: 0;
			transform: translateY(20px);
		}
		to {
			opacity: 1;
			transform: translateY(0);
		}
	}
	
	.chat-header {
		display: flex;
		justify-content: space-between;
		align-items: center;
		padding: 1.25rem;
		background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
		color: white;
		border-radius: 16px 16px 0 0;
	}
	
	.header-content {
		display: flex;
		align-items: center;
		gap: 0.75rem;
	}
	
	.bot-avatar {
		width: 40px;
		height: 40px;
		background: rgba(255, 255, 255, 0.2);
		border-radius: 50%;
		display: flex;
		align-items: center;
		justify-content: center;
		font-size: 1.5rem;
	}
	
	.chat-header h3 {
		margin: 0;
		font-size: 1.1rem;
		font-weight: 700;
	}
	
	.status {
		margin: 0;
		font-size: 0.85rem;
		opacity: 0.9;
	}
	
	.close-btn {
		background: rgba(255, 255, 255, 0.2);
		border: none;
		font-size: 1.5rem;
		color: white;
		cursor: pointer;
		padding: 0;
		width: 32px;
		height: 32px;
		display: flex;
		align-items: center;
		justify-content: center;
		border-radius: 50%;
		transition: all 0.2s;
	}
	
	.close-btn:hover {
		background: rgba(255, 255, 255, 0.3);
	}
	
	.chat-messages {
		flex: 1;
		overflow-y: auto;
		padding: 1.5rem;
		background: #f9fafb;
		display: flex;
		flex-direction: column;
		gap: 1rem;
	}
	
	.message {
		display: flex;
		gap: 0.5rem;
		animation: fadeIn 0.3s ease-out;
	}
	
	@keyframes fadeIn {
		from {
			opacity: 0;
			transform: translateY(10px);
		}
		to {
			opacity: 1;
			transform: translateY(0);
		}
	}
	
	.message.user {
		flex-direction: row-reverse;
	}
	
	.message-avatar {
		width: 32px;
		height: 32px;
		background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
		border-radius: 50%;
		display: flex;
		align-items: center;
		justify-content: center;
		font-size: 1.2rem;
		flex-shrink: 0;
	}
	
	.message-bubble {
		max-width: 70%;
		padding: 0.75rem 1rem;
		border-radius: 16px;
		line-height: 1.5;
	}
	
	.message.bot .message-bubble {
		background: white;
		color: #1f2937;
		border-bottom-left-radius: 4px;
		box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
	}
	
	.message.user .message-bubble {
		background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
		color: white;
		border-bottom-right-radius: 4px;
	}
	
	.chat-input {
		display: flex;
		gap: 0.75rem;
		padding: 1rem;
		background: white;
		border-top: 1px solid #e5e7eb;
		border-radius: 0 0 16px 16px;
	}
	
	.chat-input input {
		flex: 1;
		padding: 0.75rem 1rem;
		border: 1px solid #e5e7eb;
		border-radius: 24px;
		font-size: 0.95rem;
		outline: none;
		transition: border-color 0.2s;
	}
	
	.chat-input input:focus {
		border-color: #667eea;
	}
	
	.chat-input button {
		width: 44px;
		height: 44px;
		background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
		border: none;
		border-radius: 50%;
		display: flex;
		align-items: center;
		justify-content: center;
		cursor: pointer;
		transition: all 0.2s;
		flex-shrink: 0;
	}
	
	.chat-input button:hover {
		transform: scale(1.05);
	}
	
	.chat-input button svg {
		width: 20px;
		height: 20px;
		color: white;
	}
	
	@media (max-width: 768px) {
		.chat-window {
			width: calc(100vw - 40px);
			right: 20px;
			bottom: 170px;
			height: 450px;
		}
		
		.chatbot-btn {
			right: 20px;
			bottom: 100px;
		}
	}
</style>
