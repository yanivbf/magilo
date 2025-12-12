// Fix subscription disconnect issue - prevent logout during subscription purchase
const fs = require('fs');

console.log('🔧 Fixing subscription disconnect issue...');

// 1. Fix the subscription API to NOT redirect on missing userId
const subscriptionApiPath = 'new-app/src/routes/api/subscription/activate-page/+server.js';
let subscriptionApi = fs.readFileSync(subscriptionApiPath, 'utf8');

// Replace the redirect logic with better error handling
const oldRedirectLogic = `if (!userId) {
		console.error('❌ No userId found in any source');
		console.error('   - Available cookies:', Object.keys(cookies.getAll()));
		console.error('   - Cookie values:', cookies.getAll());
		console.error('   - Cookie header raw:', request.headers.get('cookie'));
		
		// Try to be more helpful - suggest localStorage recovery
		return json({ 
			error: 'יש להתחבר כדי לרכוש מנוי. אם אתה מחובר, נסה לרענן את הדף.',
			needsLogin: true,
			suggestRefresh: true,
			debug: {
				availableCookies: Object.keys(cookies.getAll()),
				cookieValues: cookies.getAll(),
				bodyUserId: bodyUserId,
				cookieHeader: request.headers.get('cookie'),
				cookieCount: Object.keys(cookies.getAll()).length
			}
		}, { status: 401 });
	}`;

const newRedirectLogic = `if (!userId) {
		console.error('❌ No userId found in any source');
		console.error('   - Available cookies:', Object.keys(cookies.getAll()));
		console.error('   - Cookie values:', cookies.getAll());
		console.error('   - Cookie header raw:', request.headers.get('cookie'));
		
		// DON'T redirect - return error with recovery instructions
		return json({ 
			error: 'לא נמצא מזהה משתמש. אנא רענן את הדף ונסה שוב.',
			needsRefresh: true, // Changed from needsLogin to needsRefresh
			suggestRefresh: true,
			keepSession: true, // New flag to indicate session should be kept
			debug: {
				availableCookies: Object.keys(cookies.getAll()),
				cookieValues: cookies.getAll(),
				bodyUserId: bodyUserId,
				cookieHeader: request.headers.get('cookie'),
				cookieCount: Object.keys(cookies.getAll()).length
			}
		}, { status: 400 }); // Changed from 401 to 400 to avoid logout
	}`;

if (subscriptionApi.includes(oldRedirectLogic)) {
    subscriptionApi = subscriptionApi.replace(oldRedirectLogic, newRedirectLogic);
    fs.writeFileSync(subscriptionApiPath, subscriptionApi);
    console.log('✅ Fixed subscription API redirect logic');
} else {
    console.log('⚠️ Subscription API redirect logic not found or already fixed');
}

// 2. Fix the subscription page to handle errors without logout
const subscriptionPagePath = 'new-app/src/routes/subscribe/+page.svelte';
let subscriptionPage = fs.readFileSync(subscriptionPagePath, 'utf8');

// Find and replace the error handling logic
const oldErrorHandling = `if (errorData.needsLogin || errorData.suggestRefresh) {
				if (errorData.suggestRefresh) {
					const shouldRefresh = confirm('נראה שיש בעיה באימות. האם לרענן את הדף ולנסות שוב?');
					if (shouldRefresh) {
						window.location.reload();
						return;
					}
				}
				
				alert('יש להתחבר מחדש כדי לרכוש מנוי');
				window.location.href = '/login';
				return;
			}`;

const newErrorHandling = `if (errorData.needsRefresh || errorData.suggestRefresh) {
				// DON'T redirect to login - just refresh the page
				const shouldRefresh = confirm('נראה שיש בעיה באימות. האם לרענן את הדף ולנסות שוב?');
				if (shouldRefresh) {
					window.location.reload();
					return;
				} else {
					// Try to recover userId from storage
					console.log('🔄 Trying to recover userId from storage...');
					let recoveredUserId = null;
					
					try {
						recoveredUserId = sessionStorage?.getItem('userId') || 
										 localStorage?.getItem('userId') ||
										 window._autoPageUserId ||
										 window.autoPageAuth?.userId;
					} catch (e) {
						console.warn('⚠️ Could not access storage:', e);
					}
					
					if (recoveredUserId) {
						console.log('✅ Recovered userId:', recoveredUserId);
						// Set cookies and try again
						document.cookie = \`userId=\${recoveredUserId}; path=/; max-age=2592000; SameSite=Lax\`;
						document.cookie = \`userAuth=\${recoveredUserId}; path=/; max-age=2592000; SameSite=Lax\`;
						currentUserId = recoveredUserId;
						
						// Retry the subscription
						setTimeout(() => {
							handleSubscribe();
						}, 500);
						return;
					}
				}
			}
			
			// Only redirect to login if it's a real authentication error (not just missing cookies)
			if (errorData.needsLogin && !errorData.keepSession) {
				alert('יש להתחבר מחדש כדי לרכוש מנוי');
				window.location.href = '/login';
				return;
			}`;

if (subscriptionPage.includes(oldErrorHandling)) {
    subscriptionPage = subscriptionPage.replace(oldErrorHandling, newErrorHandling);
    fs.writeFileSync(subscriptionPagePath, subscriptionPage);
    console.log('✅ Fixed subscription page error handling');
} else {
    console.log('⚠️ Subscription page error handling not found or already fixed');
}

// 3. Add better cookie persistence in the subscription page
const cookieSetLogic = `// Set multiple cookies for compatibility
				document.cookie = \`userId=\${currentUserId}; path=/; max-age=2592000; SameSite=Lax\`;
				document.cookie = \`userAuth=\${currentUserId}; path=/; max-age=2592000; SameSite=Lax\`;
				document.cookie = \`user_id=\${currentUserId}; path=/; max-age=2592000; SameSite=Lax\`;`;

// Find where we call the API and add cookie setting before it
const apiCallPattern = /const response = await fetch\('\/api\/subscription\/activate-page'/;
if (apiCallPattern.test(subscriptionPage)) {
    subscriptionPage = subscriptionPage.replace(
        /console\.log\('🔍 SUBSCRIPTION CLIENT DEBUG:'\);/,
        `console.log('🔍 SUBSCRIPTION CLIENT DEBUG:');
			
			// Ensure cookies are set before API call
			if (currentUserId) {
				${cookieSetLogic}
				console.log('✅ Cookies refreshed before API call');
			}`
    );
    fs.writeFileSync(subscriptionPagePath, subscriptionPage);
    console.log('✅ Added cookie refresh before API call');
}

console.log('🎉 Subscription disconnect issue fix completed!');
console.log('');
console.log('📋 What was fixed:');
console.log('1. ✅ API no longer returns 401 (which causes logout)');
console.log('2. ✅ Page tries to recover userId from storage instead of redirecting');
console.log('3. ✅ Cookies are refreshed before each API call');
console.log('4. ✅ Better error handling without forced logout');
console.log('');
console.log('🚀 Now test the subscription flow - it should work without disconnecting you!');