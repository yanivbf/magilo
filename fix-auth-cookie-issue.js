// תיקון בעיית Authentication Cookie
// הבעיה: המשתמש מתחבר בהצלחה אבל ה-cookie לא נשמר נכון

const fs = require('fs');

console.log('🔧 מתקן בעיית Authentication Cookie...');

// 1. תיקון auth store - הבטחת שמירת cookie מיידית
const authStorePath = 'new-app/src/lib/stores/auth.js';
let authStoreContent = fs.readFileSync(authStorePath, 'utf8');

// הוספת פונקציה לבדיקת cookie מיידית
const cookieCheckFunction = `
// Force cookie check immediately
function forceCookieCheck() {
	if (!browser) return null;
	
	// Try multiple cookie names for compatibility
	const cookieNames = ['userId', 'userAuth', 'user_id'];
	
	for (const name of cookieNames) {
		const value = getCookie(name);
		if (value) {
			console.log('✅ Found cookie:', name, '=', value);
			return value;
		}
	}
	
	console.log('⚠️ No user cookies found');
	return null;
}

// Set cookie with multiple formats for compatibility
function setMultipleCookies(userId) {
	if (!browser) return;
	
	const expires = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toUTCString();
	const cookieOptions = \`expires=\${expires}; path=/; SameSite=Lax\`;
	
	// Set multiple cookie formats
	document.cookie = \`userId=\${userId}; \${cookieOptions}\`;
	document.cookie = \`userAuth=\${userId}; \${cookieOptions}\`;
	document.cookie = \`user_id=\${userId}; \${cookieOptions}\`;
	
	console.log('✅ Multiple cookies set for userId:', userId);
}
`;

// החלפת פונקציית checkSession
const newCheckSession = `
// Check for existing session from cookie
async function checkSession() {
	try {
		// Force immediate cookie check
		const userId = forceCookieCheck();
		console.log('🔍 Checking session... userId from cookie:', userId);
		
		if (userId) {
			// ALWAYS set user immediately from cookie - don't wait for API
			currentUser.set({
				id: userId,
				userId: userId,
				email: '',
				name: 'משתמש רשום',
				avatar: null,
				subscriptionStatus: 'active'
			});
			console.log('✅ Session restored from cookie! userId:', userId);
			
			// Then try to fetch full user data in background
			try {
				const response = await fetch(\`/api/user/\${userId}\`);
				if (response.ok) {
					const data = await response.json();
					const userData = data.user || data;
					console.log('✅ User data loaded from API:', userData.name || userData.email);
					// Update with full data
					currentUser.set({
						id: userData.userId || userData.id || userId,
						userId: userData.userId || userData.id || userId,
						email: userData.email || '',
						name: userData.name || 'משתמש רשום',
						avatar: userData.avatar || null,
						subscriptionStatus: userData.subscriptionStatus || 'active'
					});
				} else {
					console.warn('⚠️ API failed (status ' + response.status + '), keeping cookie-only session');
				}
			} catch (fetchError) {
				console.warn('⚠️ Fetch error, keeping cookie-only session:', fetchError.message);
			}
		} else {
			console.log('⚠️ No userId cookie found - user not logged in');
			currentUser.set(null);
		}
	} catch (error) {
		console.error('❌ Error checking session:', error);
		currentUser.set(null);
	} finally {
		// Mark session check as complete
		isCheckingSession.set(false);
	}
}`;

// החלפת פונקציית signInWithGoogle
const newSignInWithGoogle = `
// Sign in with Google
export async function signInWithGoogle(credential) {
	isLoading.set(true);
	try {
		// Decode the JWT credential to get user info
		const payload = JSON.parse(atob(credential.split('.')[1]));
		
		// Create or find user in our system using Google ID
		const response = await fetch('/api/auth/google', {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json',
			},
			body: JSON.stringify({
				googleId: payload.sub,
				email: payload.email,
				name: payload.name,
				picture: payload.picture,
			}),
		});

		if (!response.ok) {
			throw new Error('שגיאה בהתחברות עם Google');
		}

		const user = await response.json();
		
		// CRITICAL: Set multiple cookies immediately on client side
		const userId = user.userId || user.id;
		setMultipleCookies(userId);
		console.log('✅ Client-side cookies set:', userId);
		
		// Set current user
		currentUser.set(user);
		console.log('✅ Google sign-in successful! User:', user.name || user.email);
		
		// Force immediate session check to verify
		setTimeout(() => {
			const verifyUserId = forceCookieCheck();
			console.log('🔍 Cookie verification:', verifyUserId);
		}, 100);
		
		return { success: true };
	} catch (error) {
		console.error('Google sign-in error:', error);
		return { success: false, error: error.message };
	} finally {
		isLoading.set(false);
	}
}`;

// עדכון הקובץ
authStoreContent = authStoreContent.replace(
	/\/\/ Get cookie value[\s\S]*?return null;\s*}/,
	`// Get cookie value
function getCookie(name) {
	if (!browser) return null;
	const value = \`; \${document.cookie}\`;
	const parts = value.split(\`; \${name}=\`);
	if (parts.length === 2) return parts.pop().split(';').shift();
	return null;
}

${cookieCheckFunction}`
);

authStoreContent = authStoreContent.replace(
	/\/\/ Check for existing session from cookie[\s\S]*?isCheckingSession\.set\(false\);\s*}/,
	newCheckSession
);

authStoreContent = authStoreContent.replace(
	/\/\/ Sign in with Google[\s\S]*?isLoading\.set\(false\);\s*}\s*}/,
	newSignInWithGoogle
);

fs.writeFileSync(authStorePath, authStoreContent);
console.log('✅ Auth store updated');

// 2. תיקון subscription page
const subscriptionPagePath = 'new-app/src/routes/test-subscription/+page.svelte';
let subscriptionContent = fs.readFileSync(subscriptionPagePath, 'utf8');

// החלפת פונקציית getCookie
const newGetCookie = `
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
	}`;

subscriptionContent = subscriptionContent.replace(
	/function getCookie\(name\) \{[\s\S]*?\}/,
	newGetCookie
);

fs.writeFileSync(subscriptionPagePath, subscriptionContent);
console.log('✅ Subscription page updated');

console.log('🎉 תיקון Authentication Cookie הושלם!');
console.log('');
console.log('📋 מה תוקן:');
console.log('1. ✅ הוספת בדיקת cookies מרובה');
console.log('2. ✅ שמירת cookies במספר פורמטים');
console.log('3. ✅ אימות מיידי של cookies');
console.log('4. ✅ תיקון subscription page');
console.log('');
console.log('🔄 עכשיו רענן את הדפדפן ונסה שוב!');