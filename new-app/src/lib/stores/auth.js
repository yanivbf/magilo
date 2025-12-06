// Authentication Store for SvelteKit with Strapi
// Migrated from Supabase to Strapi authentication

import { writable, derived } from 'svelte/store';
import { browser } from '$app/environment';

const GOOGLE_CLIENT_ID = '965923411238-6e3a40oluusgqnvvlb1iuh70mesion3j.apps.googleusercontent.com';
const STRAPI_URL = 'http://localhost:1337';

// User store
export const currentUser = writable(null);
export const isAuthenticated = derived(currentUser, $user => !!$user);
export const isLoading = writable(false);
export const isCheckingSession = writable(true);

// Check for existing session on load
if (browser) {
	checkSession();
}

// Check for existing session from cookie
async function checkSession() {
	try {
		const userId = getCookie('userId');
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
				const response = await fetch(`/api/user/${userId}`);
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
}

// Get cookie value
function getCookie(name) {
	if (!browser) return null;
	const value = `; ${document.cookie}`;
	const parts = value.split(`; ${name}=`);
	if (parts.length === 2) return parts.pop().split(';').shift();
	return null;
}

// Set cookie
function setCookie(name, value, days = 30) {
	if (!browser) return;
	const expires = new Date(Date.now() + days * 24 * 60 * 60 * 1000).toUTCString();
	document.cookie = `${name}=${value}; expires=${expires}; path=/; SameSite=Lax`;
}

// Delete cookie
function deleteCookie(name) {
	if (!browser) return;
	document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;`;
}

// Extract user data from Google response
export function extractUserData(user) {
	let name = 'משתמש רשום';
	
	if (user.name) {
		name = user.name;
	} else if (user.email) {
		const emailName = user.email.split('@')[0];
		name = emailName.charAt(0).toUpperCase() + emailName.slice(1);
	}
	
	// Get avatar URL from user object
	let avatar = user.avatar || user.picture || null;
	
	// If avatar exists and is a valid URL, use it
	if (avatar && typeof avatar === 'string' && avatar.startsWith('http')) {
		console.log('✅ Avatar URL:', avatar);
	} else {
		console.log('⚠️ No valid avatar URL, will use fallback');
		avatar = null;
	}
	
	return { name, avatar };
}

// Sign in with email/password using Strapi
export async function signInWithEmail(email, password) {
	isLoading.set(true);
	try {
		const response = await fetch(`${STRAPI_URL}/api/auth/local`, {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json',
			},
			body: JSON.stringify({
				identifier: email,
				password: password,
			}),
		});

		const data = await response.json();

		if (!response.ok) {
			throw new Error(data.error?.message || 'שגיאה בהתחברות');
		}

		// Save JWT token
		if (browser) {
			localStorage.setItem('strapiToken', data.jwt);
		}

		// Create/update user in our system
		const user = await saveUserToSystem(data.user);
		currentUser.set(user);
		
		return { success: true };
	} catch (error) {
		console.error('Login error:', error);
		return { success: false, error: error.message };
	} finally {
		isLoading.set(false);
	}
}

// Sign up with email/password using Strapi
export async function signUpWithEmail(email, password, confirmPassword) {
	if (password !== confirmPassword) {
		return { success: false, error: 'הסיסמאות אינן תואמות' };
	}
	
	if (password.length < 6) {
		return { success: false, error: 'הסיסמה חייבת להכיל לפחות 6 תווים' };
	}
	
	isLoading.set(true);
	try {
		const username = email.split('@')[0] + '_' + Date.now();
		
		const response = await fetch(`${STRAPI_URL}/api/auth/local/register`, {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json',
			},
			body: JSON.stringify({
				username: username,
				email: email,
				password: password,
			}),
		});

		const data = await response.json();

		if (!response.ok) {
			throw new Error(data.error?.message || 'שגיאה בהרשמה');
		}

		return { success: true, message: 'הרשמה בוצעה בהצלחה! כעת תוכל להתחבר.' };
	} catch (error) {
		console.error('Registration error:', error);
		return { success: false, error: error.message };
	} finally {
		isLoading.set(false);
	}
}

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
		
		// CRITICAL: Set cookie immediately on client side as backup
		const userId = user.userId || user.id;
		setCookie('userId', userId, 30);
		console.log('✅ Client-side cookie set:', userId);
		
		// Set current user
		currentUser.set(user);
		console.log('✅ Google sign-in successful! User:', user.name || user.email);
		
		return { success: true };
	} catch (error) {
		console.error('Google sign-in error:', error);
		return { success: false, error: error.message };
	} finally {
		isLoading.set(false);
	}
}

// Reset password
export async function resetPassword(email) {
	isLoading.set(true);
	try {
		const response = await fetch(`${STRAPI_URL}/api/auth/forgot-password`, {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json',
			},
			body: JSON.stringify({
				email: email,
			}),
		});

		if (!response.ok) {
			throw new Error('שגיאה בשליחת אימייל שחזור');
		}

		return { success: true, message: 'נשלח אימייל שחזור סיסמה. בדוק את תיבת הדואר שלך.' };
	} catch (error) {
		console.error('Password reset error:', error);
		return { success: false, error: error.message };
	} finally {
		isLoading.set(false);
	}
}

// Sign out
export async function signOut() {
	try {
		currentUser.set(null);
		if (browser) {
			localStorage.removeItem('strapiToken');
			deleteCookie('userId');
		}
		return { success: true };
	} catch (error) {
		return { success: false, error: error.message };
	}
}

// Save user to our system and set cookie
async function saveUserToSystem(strapiUser) {
	try {
		// Generate a unique userId (use Strapi user ID or Google ID)
		const userId = strapiUser.id?.toString() || strapiUser.sub;
		
		// Set cookie IMMEDIATELY
		setCookie('userId', userId);
		console.log('✅ Cookie set:', userId);
		
		// Create/update user in our custom user collection
		const response = await fetch('/api/user/create-or-find', {
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify({
				userId: userId,
				email: strapiUser.email || '',
				name: strapiUser.name || strapiUser.username || strapiUser.email?.split('@')[0] || 'משתמש',
				avatar: strapiUser.picture || strapiUser.avatar || null
			})
		});
		
		if (response.ok) {
			const userData = await response.json();
			console.log('✅ User data saved to system');
			// Make sure the user object has an 'id' property for compatibility
			return {
				...userData,
				id: userData.userId || userId
			};
		}
		
		// Return basic user data if save failed
		return {
			id: userId,
			userId: userId,
			email: strapiUser.email,
			name: strapiUser.name || strapiUser.username,
			avatar: strapiUser.picture || strapiUser.avatar
		};
	} catch (error) {
		console.error('Error saving user to system:', error);
		throw error;
	}
}

export { GOOGLE_CLIENT_ID };
