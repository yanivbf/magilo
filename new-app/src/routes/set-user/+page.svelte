<script>
	import { goto } from '$app/navigation';
	
	let userId = $state('');
	let email = $state('');
	let name = $state('');
	let message = $state('');
	let loading = $state(false);
	
	async function setUser() {
		if (!userId) {
			message = '❌ נא להזין User ID';
			return;
		}
		
		loading = true;
		message = '⏳ יוצר משתמש...';
		
		try {
			// Create or find user in Strapi
			const response = await fetch('/api/user/create-or-find', {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json'
				},
				body: JSON.stringify({
					userId,
					email: email || `${userId}@autopage.local`,
					name: name || `משתמש ${userId.substring(0, 8)}`
				})
			});
			
			if (response.ok) {
				const result = await response.json();
				
				// Set cookie with the UUID
				document.cookie = `userId=${userId}; path=/; max-age=31536000`;
				
				message = `✅ משתמש נוצר בהצלחה! (Strapi ID: ${result.strapiUserId})`;
				
				setTimeout(() => {
					goto('/dashboard?userId=' + userId);
				}, 1500);
			} else {
				const error = await response.json();
				message = `❌ שגיאה: ${error.error}`;
				loading = false;
			}
		} catch (error) {
			message = `❌ שגיאה: ${error.message}`;
			loading = false;
		}
	}
	
	// Generate random UUID
	function generateUUID() {
		return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
			const r = Math.random() * 16 | 0;
			const v = c === 'x' ? r : (r & 0x3 | 0x8);
			return v.toString(16);
		});
	}
	
	function generateRandomUser() {
		userId = generateUUID();
		name = `משתמש ${Math.floor(Math.random() * 1000)}`;
		email = `user${Math.floor(Math.random() * 10000)}@autopage.local`;
	}
	
	function useExistingUser() {
		userId = 'ef0bfa04-0d2a-48b0-8c0e-67c8b4ed0241';
		name = 'משתמש קיים';
		email = 'existing@autopage.local';
	}
</script>

<div class="container">
	<div class="card">
		<h1>🔧 יצירת משתמש חדש</h1>
		<p>צור משתמש חדש במערכת (עד שההתחברות עם Google תתוקן)</p>
		
		<div class="form">
			<label for="name">שם:</label>
			<input 
				id="name"
				type="text" 
				bind:value={name}
				placeholder="השם שלך"
			/>
			
			<label for="email">אימייל:</label>
			<input 
				id="email"
				type="email" 
				bind:value={email}
				placeholder="email@example.com"
			/>
			
			<label for="userId">User ID (UUID):</label>
			<div style="display: flex; gap: 0.5rem;">
				<input 
					id="userId"
					type="text" 
					bind:value={userId}
					placeholder="xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx"
					style="flex: 1;"
				/>
				<button 
					type="button"
					onclick={generateRandomUser}
					style="padding: 0.75rem 1rem; background: #48bb78;"
				>
					🎲 אקראי
				</button>
			</div>
			
			<button onclick={setUser} disabled={loading}>
				{loading ? '⏳ יוצר...' : '✅ צור משתמש והתחבר'}
			</button>
			
			{#if message}
				<div class="message" class:error={message.includes('❌')}>
					{message}
				</div>
			{/if}
		</div>
		
		<div class="quick-login">
			<h3>⚡ התחברות מהירה</h3>
			<p>יש לך כבר משתמש? התחבר עם ה-ID הקיים שלך:</p>
			<button 
				type="button"
				onclick={useExistingUser}
				style="background: #48bb78; margin-bottom: 1rem;"
			>
				👤 השתמש במשתמש הקיים
			</button>
		</div>
		
		<div class="info">
			<h3>💡 הסבר</h3>
			<p>המערכת תיצור משתמש חדש ב-Strapi ותקשר אותו ל-UUID שלך</p>
			<p>לחץ על "🎲 אקראי" כדי ליצור פרטים אוטומטית</p>
			<p>אחרי יצירת המשתמש תועבר לדשבורד</p>
		</div>
		
		<div class="divider">או</div>
		
		<a href="/login" class="secondary-button">
			🔐 התחבר עם Google
		</a>
	</div>
</div>

<style>
	.container {
		min-height: 100vh;
		display: flex;
		align-items: center;
		justify-content: center;
		background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
		padding: 2rem;
	}
	
	.card {
		background: white;
		padding: 3rem;
		border-radius: 20px;
		box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
		max-width: 500px;
		width: 100%;
	}
	
	h1 {
		margin: 0 0 0.5rem 0;
		color: #1a202c;
		text-align: center;
	}
	
	p {
		margin: 0 0 2rem 0;
		color: #718096;
		text-align: center;
	}
	
	.form {
		display: flex;
		flex-direction: column;
		gap: 1rem;
	}
	
	label {
		font-weight: 600;
		color: #2d3748;
	}
	
	input {
		padding: 0.75rem;
		border: 2px solid #e2e8f0;
		border-radius: 8px;
		font-size: 1rem;
		transition: border-color 0.2s;
	}
	
	input:focus {
		outline: none;
		border-color: #667eea;
	}
	
	button {
		padding: 1rem;
		background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
		color: white;
		border: none;
		border-radius: 8px;
		font-size: 1rem;
		font-weight: 600;
		cursor: pointer;
		transition: transform 0.2s;
	}
	
	button:hover {
		transform: translateY(-2px);
	}
	
	.message {
		padding: 1rem;
		background: #c6f6d5;
		color: #22543d;
		border-radius: 8px;
		text-align: center;
		font-weight: 600;
	}
	
	.info {
		margin-top: 2rem;
		padding: 1rem;
		background: #edf2f7;
		border-radius: 8px;
	}
	
	.info h3 {
		margin: 0 0 0.5rem 0;
		color: #2d3748;
		font-size: 1rem;
	}
	
	.info p {
		margin: 0.5rem 0;
		font-size: 0.9rem;
		text-align: right;
	}
	
	code {
		background: #cbd5e0;
		padding: 0.2rem 0.4rem;
		border-radius: 4px;
		font-family: monospace;
	}
	
	.message.error {
		background: #fed7d7;
		color: #742a2a;
	}
	
	.divider {
		text-align: center;
		margin: 2rem 0;
		color: #a0aec0;
		position: relative;
	}
	
	.divider::before,
	.divider::after {
		content: '';
		position: absolute;
		top: 50%;
		width: 40%;
		height: 1px;
		background: #e2e8f0;
	}
	
	.divider::before {
		right: 0;
	}
	
	.divider::after {
		left: 0;
	}
	
	.secondary-button {
		display: block;
		padding: 1rem;
		background: white;
		color: #667eea;
		border: 2px solid #667eea;
		border-radius: 8px;
		font-size: 1rem;
		font-weight: 600;
		text-align: center;
		text-decoration: none;
		transition: all 0.2s;
	}
	
	.secondary-button:hover {
		background: #667eea;
		color: white;
		transform: translateY(-2px);
	}
</style>
