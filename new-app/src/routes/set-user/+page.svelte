<script>
	import { goto } from '$app/navigation';
	
	let userId = $state('temp_user');
	let message = $state('');
	
	function setUser() {
		// Set cookie
		document.cookie = `userId=${userId}; path=/; max-age=31536000`;
		message = `✅ User ID הוגדר ל: ${userId}`;
		
		setTimeout(() => {
			goto('/dashboard');
		}, 1500);
	}
</script>

<div class="container">
	<div class="card">
		<h1>🔧 הגדרת משתמש זמני</h1>
		<p>הגדר User ID כדי לראות את סרגל העריכה</p>
		
		<div class="form">
			<label for="userId">User ID:</label>
			<input 
				id="userId"
				type="text" 
				bind:value={userId}
				placeholder="temp_user"
			/>
			
			<button onclick={setUser}>
				הגדר User ID
			</button>
			
			{#if message}
				<div class="message">{message}</div>
			{/if}
		</div>
		
		<div class="info">
			<h3>💡 טיפ</h3>
			<p>השתמש ב-<code>temp_user</code> אם יצרת דפים עם המערכת הישנה</p>
			<p>או הזן כל User ID אחר שתרצה</p>
		</div>
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
</style>
