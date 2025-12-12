// תיקון סופי לבעיית Cookies
// הבעיה: המשתמש מתחבר אבל ה-cookies לא נשמרים או לא נקראים נכון

const fs = require('fs');

console.log('🔧 מתקן בעיית Cookies סופית...');

// 1. תיקון subscribe page - הוספת הגדרת cookie מיידית
const subscribePagePath = 'new-app/src/routes/subscribe/+page.svelte';
let subscribeContent = fs.readFileSync(subscribePagePath, 'utf8');

// החלפת onMount עם תיקון מיידי
const newOnMount = `
	onMount(() => {
		// Get userId from cookie - try multiple sources
		userId = document.cookie
			.split('; ')
			.find(row => row.startsWith('userId='))
			?.split('=')[1] || 
			document.cookie
			.split('; ')
			.find(row => row.startsWith('userAuth='))
			?.split('=')[1] || '';
		
		// Get pageId from URL
		const urlParams = new URLSearchParams(window.location.search);
		pageId = urlParams.get('pageId') || '';
		
		console.log('🔍 SUBSCRIPTION CLIENT MOUNT:');
		console.log('   - userId from userId cookie:', document.cookie.split('; ').find(row => row.startsWith('userId='))?.split('=')[1]);
		console.log('   - userId from userAuth cookie:', document.cookie.split('; ').find(row => row.startsWith('userAuth='))?.split('=')[1]);
		console.log('   - Final userId:', userId);
		console.log('   - pageId:', pageId);
		console.log('   - All cookies:', document.cookie);
		
		// If no userId found, try to set it from a known source
		if (!userId) {
			console.log('❌ No userId found, trying to recover...');
			
			// Try to get from localStorage as backup
			const backupUserId = localStorage.getItem('userId');
			if (backupUserId) {
				console.log('🔄 Found backup userId in localStorage:', backupUserId);
				// Set cookie
				document.cookie = \`userId=\${backupUserId}; path=/; max-age=2592000; SameSite=Lax\`;
				userId = backupUserId;
			} else {
				console.log('❌ No backup userId found, redirecting to login');
				alert('יש להתחבר כדי לרכוש מנוי');
				goto('/login');
				return;
			}
		}
		
		if (!pageId) {
			console.error('❌ No pageId found, redirecting to dashboard');
			alert('לא נמצא מזהה דף. חזרה לדשבורד.');
			goto('/dashboard');
			return;
		}
		
		console.log('✅ Ready to subscribe - userId:', userId, 'pageId:', pageId);
	});`;

subscribeContent = subscribeContent.replace(
	/onMount\(\(\) => \{[\s\S]*?\}\);/,
	newOnMount
);

fs.writeFileSync(subscribePagePath, subscribeContent);
console.log('✅ Subscribe page updated');

// 2. תיקון auth store - הוספת localStorage backup
const authStorePath = 'new-app/src/lib/stores/auth.js';
let authContent = fs.readFileSync(authStorePath, 'utf8');

// הוספת פונקציה לשמירה ב-localStorage
const localStorageBackup = `
// Save userId to localStorage as backup
function saveUserIdBackup(userId) {
	if (!browser) return;
	try {
		localStorage.setItem('userId', userId);
		console.log('✅ UserId saved to localStorage backup:', userId);
	} catch (error) {
		console.warn('⚠️ Could not save to localStorage:', error);
	}
}

// Get userId from localStorage backup
function getUserIdBackup() {
	if (!browser) return null;
	try {
		const userId = localStorage.getItem('userId');
		console.log('🔍 UserId from localStorage backup:', userId);
		return userId;
	} catch (error) {
		console.warn('⚠️ Could not read from localStorage:', error);
		return null;
	}
}
`;

// הוסף את הפונקציות אחרי הפונקציות הקיימות
authContent = authContent.replace(
	/console\.log\('✅ Multiple cookies set for userId:', userId\);\s*}/,
	`console.log('✅ Multiple cookies set for userId:', userId);
	
	// Also save to localStorage as backup
	saveUserIdBackup(userId);
}`
);

// הוסף את הפונקציות החדשות
authContent = authContent.replace(
	/\/\/ Set cookie with multiple formats for compatibility/,
	`${localStorageBackup}

// Set cookie with multiple formats for compatibility`
);

// עדכן את forceCookieCheck לכלול localStorage
authContent = authContent.replace(
	/console\.log\('⚠️ No user cookies found'\);\s*return null;/,
	`console.log('⚠️ No user cookies found, trying localStorage backup');
	
	// Try localStorage as backup
	const backupUserId = getUserIdBackup();
	if (backupUserId) {
		console.log('✅ Found userId in localStorage backup:', backupUserId);
		// Restore cookie from backup
		const expires = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toUTCString();
		const cookieOptions = \`expires=\${expires}; path=/; SameSite=Lax\`;
		document.cookie = \`userId=\${backupUserId}; \${cookieOptions}\`;
		return backupUserId;
	}
	
	console.log('⚠️ No user ID found anywhere');
	return null;`
);

fs.writeFileSync(authStorePath, authContent);
console.log('✅ Auth store updated with localStorage backup');

// 3. עדכון Google auth API לשמירה ב-localStorage
const googleAuthPath = 'new-app/src/routes/api/auth/google/+server.js';
let googleAuthContent = fs.readFileSync(googleAuthPath, 'utf8');

// הוספת header לשמירה ב-localStorage
googleAuthContent = googleAuthContent.replace(
	/return json\(\{[\s\S]*?\}, \{[\s\S]*?\}\);/,
	`// Return user data with instruction to save to localStorage
		return json({
			id: user.userId,
			userId: user.userId,
			email: user.email,
			name: user.name,
			avatar: user.avatar,
			subscriptionStatus: user.subscriptionStatus,
			saveToLocalStorage: true // Flag for client to save to localStorage
		}, {
			headers: {
				'Content-Type': 'application/json; charset=utf-8',
				'X-Save-LocalStorage': user.userId // Custom header with userId
			}
		});`
);

fs.writeFileSync(googleAuthPath, googleAuthContent);
console.log('✅ Google auth API updated');

// 4. עדכון signInWithGoogle לשמירה ב-localStorage
authContent = fs.readFileSync(authStorePath, 'utf8');

authContent = authContent.replace(
	/\/\/ CRITICAL: Set multiple cookies immediately on client side[\s\S]*?console\.log\('✅ Client-side cookies set:', userId\);/,
	`// CRITICAL: Set multiple cookies immediately on client side
		const userId = user.userId || user.id;
		setMultipleCookies(userId);
		
		// Also save to localStorage immediately
		saveUserIdBackup(userId);
		
		console.log('✅ Client-side cookies and localStorage set:', userId);`
);

fs.writeFileSync(authStorePath, authContent);
console.log('✅ signInWithGoogle updated with localStorage');

console.log('🎉 תיקון Cookies סופי הושלם!');
console.log('');
console.log('📋 מה תוקן:');
console.log('1. ✅ הוספת localStorage backup לכל הפונקציות');
console.log('2. ✅ שחזור אוטומטי מ-localStorage אם אין cookies');
console.log('3. ✅ שמירה כפולה (cookies + localStorage)');
console.log('4. ✅ תיקון subscribe page עם שחזור אוטומטי');
console.log('');
console.log('🔄 עכשיו רענן את הדפדפן ונסה שוב!');