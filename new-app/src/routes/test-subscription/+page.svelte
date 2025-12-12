<script>
	import { onMount } from 'svelte';
	
	let userId = $state('');
	let pageId = $state('fatwpc2p7xxnl9x9sm7nfv8r');
	let months = $state(1);
	let loading = $state(false);
	let result = $state('');
	let authStatus = $state('');
	let pages = $state([]);
	
	
	function getCookie(name) {
		// Try multiple cookie names
		const cookieNames = ['userId', 'userAuth', 'user_id'];
		
		for (const cookieName of cookieNames) {
			const value = document.cookie
				.split('; ')
				.find(row => row.startsWith(cookieName + '='))
				?.split('=')[1];
			
			if (value) {
				console.log('🍪 Found cookie:', cookieName, '=', value);
				return value;
			}
		}
		
		console.log('⚠️ No user cookies found in:', document.cookie);
		return '';
	}
	
	function updateInfo() {
		userId = getCookie('userId');
		const allCookies = document.cookie;
		
		// Debug: Show all cookies
		console.log('🔍 SUBSCRIPTION CLIENT MOUNT:');
		console.log('   - userId from userId cookie:', getCookie('userId'));
		console.log('   - userId from userAuth cookie:', getCookie('userAuth'));
		console.log('   - Final userId:', userId);
		console.log('   - pageId:', pageId);
		console.log('   - All cookies:', allCookies);
		
		if (!userId) {
			console.log(' ❌ No userId found, redirecting to login');
			// Auto-redirect to login if no userId
			setTimeout(() => {
				window.location.href = '/login';
			}, 2000);
		}
		
		document.getElementById('current-info').innerHTML = `
			<strong>👤 User ID:</strong> ${userId || '❌ לא נמצא'}<br>
			<strong>🍪 Cookies:</strong> ${allCookies || 'ריק'}<br>
			<strong>🕒 זמן:</strong> ${new Date().toLocaleString('he-IL')}<br>
			<strong>🌐 URL:</strong> ${window.location.href}
		`;
	}
	
	async function checkAuth() {
		const userId = getCookie('userId');
		
		if (!userId) {
			authStatus = '❌ אין User ID ב-Cookie';
			return;
		}
		
		try {
			const response = await fetch('/api/user/current');
			const data = await response.json();
			
			authStatus = response.ok 
				? `✅ מחובר: ${data.userId}` 
				: `❌ שגיאה: ${data.error}`;
		} catch (error) {
			authStatus = `❌ שגיאת רשת: ${error.message}`;
		}
	}
	
	async function loadPages() {
		const userId = getCookie('userId');
		if (!userId) {
			pages = [];
			return;
		}
		
		try {
			const response = await fetch(`/api/pages/${userId}`);
			const data = await response.json();
			
			if (response.ok && data.pages) {
				pages = data.pages;
				// Auto-fill first page ID
				if (data.pages.length > 0) {
					pageId = data.pages[0].documentId || data.pages[0].id;
				}
			}
		} catch (error) {
			console.error('Error loading pages:', error);
		}
	}
	
	async function testSubscription() {
		loading = true;
		result = '';
		
		const currentUserId = getCookie('userId');
		
		if (!currentUserId) {
			result = '❌ אין User ID - יש להתחבר קודם';
			loading = false;
			return;
		}
		
		if (!pageId) {
			result = '❌ יש להזין מזהה דף';
			loading = false;
			return;
		}
		
		try {
			console.log('🚀 Starting subscription activation...');
			console.log('   - pageId:', pageId);
			console.log('   - months:', months);
			console.log('   - userId:', currentUserId);
			
			const response = await fetch('/api/subscription/activate-page', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ 
					documentId: pageId,
					months: months
				})
			});
			
			const data = await response.json();
			
			if (response.ok) {
				result = `✅ מנוי הופעל בהצלחה!\n📄 דף: ${data.documentId}\n📅 תפוגה: ${new Date(data.subscriptionExpiry).toLocaleDateString('he-IL')}\n🎯 סטטוס: ${data.subscriptionStatus}`;
			} else {
				let errorMsg = data.error || 'שגיאה לא ידועה';
				if (data.needsLogin) {
					errorMsg += '\n🔐 יש להתחבר מחדש';
				}
				if (data.currentUser && data.pageOwner) {
					errorMsg += `\nמשתמש נוכחי: ${data.currentUser} | בעל הדף: ${data.pageOwner}`;
				}
				result = `❌ שגיאה: ${errorMsg}`;
			}
			
		} catch (error) {
			result = `❌ שגיאת רשת: ${error.message}`;
		} finally {
			loading = false;
		}
	}
	
	onMount(() => {
		updateInfo();
		checkAuth();
		loadPages();
		
		// Update info every 5 seconds
		const interval = setInterval(updateInfo, 5000);
		return () => clearInterval(interval);
	});
</script>

<svelte:head>
	<title>בדיקת מנוי - Test Subscription</title>
</svelte:head>

<div class="container">
	<h1>💳 בדיקת הפעלת מנוי - Subscription Test</h1>
	
	<div class="section info">
		<h3>📊 מידע נוכחי</h3>
		<div id="current-info">טוען...</div>
	</div>
	
	<div class="section">
		<h3>🔐 סטטוס אימות</h3>
		<button on:click={checkAuth}>בדוק אימות</button>
		<div class="status">{authStatus}</div>
	</div>
	
	<div class="section">
		<h3>📄 דפים זמינים ({pages.length})</h3>
		<button on:click={loadPages}>רענן דפים</button>
		{#if pages.length > 0}
			<div class="pages-list">
				{#each pages as page}
					<div class="page-item">
						<strong>{page.title || 'ללא כותרת'}</strong><br>
						<small>ID: {page.documentId || page.id} | Type: {page.pageType || 'לא מוגדר'}</small>
						<button on:click={() => pageId = page.documentId || page.id}>בחר</button>
					</div>
				{/each}
			</div>
		{:else}
			<div class="no-pages">אין דפים או לא מחובר</div>
		{/if}
	</div>
	
	<div class="section">
		<h3>💳 הפעלת מנוי</h3>
		<div class="form-group">
			<label>מזהה דף (Document ID):</label>
			<input type="text" bind:value={pageId} placeholder="הזן מזהה דף">
		</div>
		
		<div class="form-group">
			<label>מספר חודשים:</label>
			<input type="number" bind:value={months} min="1" max="12">
		</div>
		
		<button 
			class="big-button" 
			on:click={testSubscription} 
			disabled={loading}
		>
			{loading ? '⏳ מפעיל...' : '🚀 הפעל מנוי עכשיו'}
		</button>
		
		{#if result}
			<div class="result {result.startsWith('✅') ? 'success' : 'error'}">
				<pre>{result}</pre>
			</div>
		{/if}
	</div>
	
	<div class="section">
		<h3>🔗 קישורים מהירים</h3>
		<button on:click={() => window.location.href = '/dashboard'}>📊 דשבורד</button>
		<button on:click={() => window.location.href = `/subscribe?pageId=${pageId}`}>📄 דף מנוי רגיל</button>
		<button on:click={() => window.location.href = '/login'}>🔐 התחברות</button>
	</div>
</div>

<style>
	.container {
		max-width: 800px;
		margin: 0 auto;
		padding: 20px;
		font-family: Arial, sans-serif;
		direction: rtl;
	}
	
	.section {
		margin: 20px 0;
		padding: 20px;
		border: 1px solid #ddd;
		border-radius: 8px;
		background: white;
	}
	
	.info {
		background: #e7f3ff;
		border-color: #bee5eb;
	}
	
	.success {
		background: #d4edda;
		border-color: #c3e6cb;
	}
	
	.error {
		background: #f8d7da;
		border-color: #f5c6cb;
	}
	
	button {
		background: #007bff;
		color: white;
		border: none;
		padding: 10px 20px;
		border-radius: 5px;
		cursor: pointer;
		margin: 5px;
	}
	
	button:hover:not(:disabled) {
		background: #0056b3;
	}
	
	button:disabled {
		background: #6c757d;
		cursor: not-allowed;
	}
	
	.big-button {
		background: #28a745;
		font-size: 1.2em;
		padding: 15px 30px;
	}
	
	.big-button:hover:not(:disabled) {
		background: #218838;
	}
	
	.form-group {
		margin: 15px 0;
	}
	
	label {
		display: block;
		margin-bottom: 5px;
		font-weight: bold;
	}
	
	input {
		width: 100%;
		padding: 10px;
		border: 1px solid #ddd;
		border-radius: 5px;
		font-size: 1em;
	}
	
	.status {
		margin-top: 10px;
		padding: 10px;
		border-radius: 5px;
		background: #f8f9fa;
	}
	
	.result {
		margin-top: 15px;
		padding: 15px;
		border-radius: 5px;
	}
	
	.pages-list {
		margin-top: 10px;
	}
	
	.page-item {
		padding: 10px;
		margin: 5px 0;
		border: 1px solid #eee;
		border-radius: 5px;
		background: #f8f9fa;
		display: flex;
		justify-content: space-between;
		align-items: center;
	}
	
	.no-pages {
		padding: 20px;
		text-align: center;
		color: #666;
		background: #f8f9fa;
		border-radius: 5px;
	}
	
	pre {
		white-space: pre-wrap;
		margin: 0;
	}
	
	h1 {
		text-align: center;
		color: #333;
		margin-bottom: 30px;
	}
	
	h3 {
		margin-top: 0;
		color: #555;
	}
</style>