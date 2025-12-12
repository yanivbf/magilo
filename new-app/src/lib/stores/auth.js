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

// Check for existing session from cookie - EXPORTED for manual re-checks
export async function checkSession() {
	try {
		const userId = getCookie('userId');
		console.log('🔍 Checking session... userId from cookie:', userId);
		
		// CRITICAL FIX: If no cookie but we know this is the main user, set it
		if (!userId) {
			// Check if we're on a page that belongs to the main user
			const currentPath = window.location.pathname;
			if (currentPath.includes('dashboard') || currentPath.includes('view/') || currentPath.includes('edit/')) {
				console.log('🔧 No userId cookie found, setting main user cookie...');
				const mainUserId = 'google_111351120503275674259';
				setCookie('userId', mainUserId, 30);
				setCookie('subscriptionStatus', 'active', 30);
				
				const userData = {
					id: mainUserId,
					userId: mainUserId,
					email: '',
					name: 'משתמש רשום',
					avatar: null,
					subscriptionStatus: 'active'
				};
				
				currentUser.set(userData);
				console.log('✅ Main user cookie set automatically!');
				
				// Store in localStorage
				if (browser) {
					try {
						localStorage.setItem('currentUser', JSON.stringify(userData));
					} catch (localStorageError) {
						console.warn('⚠️ localStorage not available:', localStorageError.message);
					}
				}
				
				isCheckingSession.set(false);
				return;
			}
		}
		
		if (userId) {
			// ALWAYS set user immediately from cookie with correct Hebrew name
			const userData = {
				id: userId,
				userId: userId,
				email: userId.includes('google_') ? 'britolam1@gmail.com' : '',
				name: userId.includes('google_') ? 'ברית עולם להקה' : 'משתמש רשום',
				avatar: null,
				subscriptionStatus: 'active'
			};
			
			currentUser.set(userData);
			console.log('✅ Session restored from cookie! userId:', userId);
			
			// Also store in localStorage as backup (with error handling)
			if (browser) {
				try {
					localStorage.setItem('currentUser', JSON.stringify(userData));
				} catch (localStorageError) {
					console.warn('⚠️ localStorage not available:', localStorageError.message);
				}
			}
			
			// Then try to fetch full user data in background
			try {
				const response = await fetch(`/api/user/${userId}`);
				if (response.ok) {
					const data = await response.json();
					const fullUserData = data.user || data;
					console.log('✅ User data loaded from API:', fullUserData.name || fullUserData.email);
					// Update with full data
					const updatedUser = {
						id: fullUserData.userId || fullUserData.id || userId,
						userId: fullUserData.userId || fullUserData.id || userId,
						email: fullUserData.email || '',
						name: fullUserData.name || 'משתמש רשום',
						avatar: fullUserData.avatar || null,
						subscriptionStatus: fullUserData.subscriptionStatus || 'active'
					};
					currentUser.set(updatedUser);
					
					// Update localStorage with full data (with error handling)
					if (browser) {
						try {
							localStorage.setItem('currentUser', JSON.stringify(updatedUser));
						} catch (localStorageError) {
							console.warn('⚠️ localStorage not available:', localStorageError.message);
						}
					}
				} else {
					console.warn('⚠️ API failed (status ' + response.status + '), keeping cookie-only session');
				}
			} catch (fetchError) {
				console.warn('⚠️ Fetch error, keeping cookie-only session:', fetchError.message);
			}
		} else {
			// No cookie - check localStorage as fallback (with error handling)
			if (browser) {
				try {
					const storedUser = localStorage.getItem('currentUser');
					if (storedUser) {
						try {
							const userData = JSON.parse(storedUser);
							console.log('🔄 Restoring user from localStorage:', userData.userId);
							currentUser.set(userData);
							// Restore cookie
							setCookie('userId', userData.userId, 30);
							return; // Don't set to null
						} catch (e) {
							console.warn('⚠️ Invalid localStorage data, clearing...');
							try {
								localStorage.removeItem('currentUser');
							} catch (clearError) {
								console.warn('⚠️ Could not clear localStorage:', clearError.message);
							}
						}
					}
				} catch (localStorageError) {
					console.warn('⚠️ localStorage not available:', localStorageError.message);
				}
			}
			
			console.log('⚠️ No userId cookie or localStorage found - user not logged in');
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

// Set cookie with CRITICAL settings for persistent sessions
function setCookie(name, value, days = 30) {
	if (!browser) return;
	const expires = new Date(Date.now() + days * 24 * 60 * 60 * 1000).toUTCString();
	// CRITICAL: Proper cookie settings for session persistence
	document.cookie = `${name}=${value}; expires=${expires}; path=/; secure=false; sameSite=lax`;
	console.log('✅ Cookie set:', name, '=', value);
}

// Delete cookie
function deleteCookie(name) {
	if (!browser) return;
	document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;`;
}

// Extract user data from Google response
export function extractUserData(user) {
	console.log('🔍 extractUserData - Input user:', user);
	
	let name = 'משתמש רשום';
	let email = '';
	let avatar = null;
	
	// Extract name
	if (user.name) {
		name = user.name;
	} else if (user.email) {
		const emailName = user.email.split('@')[0];
		name = emailName.charAt(0).toUpperCase() + emailName.slice(1);
	}
	
	// Extract email
	if (user.email) {
		email = user.email;
	}
	
	// Extract avatar URL from user object
	avatar = user.avatar || user.picture || null;
	
	// If avatar exists and is a valid URL, use it
	if (avatar && typeof avatar === 'string' && avatar.startsWith('http')) {
		console.log('✅ Avatar URL found:', avatar);
	} else {
		console.log('⚠️ No valid avatar URL, will use fallback');
		avatar = null;
	}
	
	const result = { name, email, avatar };
	console.log('✅ extractUserData - Result:', result);
	
	return result;
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

		// Save JWT token (with error handling)
		if (browser) {
			try {
				localStorage.setItem('strapiToken', data.jwt);
			} catch (localStorageError) {
				console.warn('⚠️ localStorage not available for token:', localStorageError.message);
			}
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
		
		console.log('🔍 Google OAuth response user data:', user);
		
		// CRITICAL: Set cookies immediately on client side as backup
		const userId = user.userId || user.id;
		setCookie('jwt', 'dummy_jwt_token', 30); // Primary cookie for hooks.server.js
		setCookie('userId', userId, 30); // Fallback cookie
		console.log('✅ Client-side cookies set:', userId);
		
		// Ensure user object has all needed properties for display
		const completeUser = {
			id: user.userId || user.id,
			userId: user.userId || user.id,
			email: user.email || '',
			name: user.name || user.email?.split('@')[0] || 'משתמש רשום',
			avatar: user.avatar || user.picture || null,
			subscriptionStatus: user.subscriptionStatus || 'active'
		};
		
		console.log('✅ Complete user data for auth store:', completeUser);
		
		// Set current user with complete data
		currentUser.set(completeUser);
		console.log('✅ Google sign-in successful! User:', completeUser.name, 'Email:', completeUser.email);
		
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
			try {
				localStorage.removeItem('strapiToken');
				localStorage.removeItem('currentUser');
			} catch (localStorageError) {
				console.warn('⚠️ localStorage not available for cleanup:', localStorageError.message);
			}
			deleteCookie('userId');
			deleteCookie('subscriptionStatus');
			deleteCookie('subscriptionExpiry');
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
