// Authentication Store for SvelteKit
// Migrated from legacy public/index.html Supabase auth logic

import { writable, derived } from 'svelte/store';
import { browser } from '$app/environment';

// Supabase client configuration
const SUPABASE_URL = 'https://osoqfadqohqcauawzmmq.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9zb3FmYWRxb2hxY2F1YXd6bW1xIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTc2OTIzMjMsImV4cCI6MjA3MzI2ODMyM30.TBLmKIntYGSfBm2StItfWm87-ebojV_NbaKNcYNWMPg';
const GOOGLE_CLIENT_ID = '589919062235-o6ohhnon54a12dav2lg24goh1m4ks43p.apps.googleusercontent.com';

// User store
export const currentUser = writable(null);
export const isAuthenticated = derived(currentUser, $user => !!$user);
export const isLoading = writable(false);

// Initialize Supabase client (browser only)
let supabaseClient = null;

if (browser) {
	// Load Supabase from CDN
	const script = document.createElement('script');
	script.src = 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2';
	script.onload = () => {
		supabaseClient = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
		checkSession();
	};
	document.head.appendChild(script);
}

// Check for existing session
async function checkSession() {
	try {
		const { data: { session } } = await supabaseClient.auth.getSession();
		if (session?.user) {
			currentUser.set(session.user);
			saveCurrentUser(session.user);
		}
	} catch (error) {
		console.error('Error checking session:', error);
	}
}

// Save user to localStorage
function saveCurrentUser(user) {
	if (browser) {
		localStorage.setItem('currentUser', JSON.stringify(user));
	}
}

// Extract user data from Google/Supabase response
export function extractUserData(user) {
	let name = 'משתמש רשום';
	
	if (user.user_metadata) {
		if (user.user_metadata.name) name = user.user_metadata.name;
		else if (user.user_metadata.full_name) name = user.user_metadata.full_name;
		else if (user.user_metadata.display_name) name = user.user_metadata.display_name;
		else if (user.user_metadata.first_name || user.user_metadata.last_name) {
			name = `${user.user_metadata.first_name || ''} ${user.user_metadata.last_name || ''}`.trim();
		}
	}
	
	if (name === 'משתמש רשום' && user.email) {
		const emailName = user.email.split('@')[0];
		name = emailName.charAt(0).toUpperCase() + emailName.slice(1);
	}
	
	let avatar = null;
	if (user.user_metadata?.avatar_url) avatar = user.user_metadata.avatar_url;
	else if (user.user_metadata?.picture) avatar = user.user_metadata.picture;
	else if (user.user_metadata?.picture_url) avatar = user.user_metadata.picture_url;
	else avatar = `https://placehold.co/80x80/E2E8F0/4A5568?text=${encodeURIComponent(name.charAt(0))}`;
	
	return { name, avatar };
}

// Sign in with email/password
export async function signInWithEmail(email, password) {
	if (!supabaseClient) throw new Error('Supabase not initialized');
	
	isLoading.set(true);
	try {
		const { data, error } = await supabaseClient.auth.signInWithPassword({
			email,
			password
		});
		
		if (error) throw error;
		if (data?.user) {
			currentUser.set(data.user);
			saveCurrentUser(data.user);
			
			// Save to server
			await saveUserToServer(data.user);
			return { success: true };
		}
	} catch (error) {
		return { success: false, error: error.message };
	} finally {
		isLoading.set(false);
	}
}

// Sign up with email/password
export async function signUpWithEmail(email, password, confirmPassword) {
	if (!supabaseClient) throw new Error('Supabase not initialized');
	
	if (password !== confirmPassword) {
		return { success: false, error: 'הסיסמאות אינן תואמות' };
	}
	
	if (password.length < 6) {
		return { success: false, error: 'הסיסמה חייבת להכיל לפחות 6 תווים' };
	}
	
	isLoading.set(true);
	try {
		const { data, error } = await supabaseClient.auth.signUp({
			email,
			password,
			options: {
				data: {
					name: email.split('@')[0],
					full_name: email.split('@')[0]
				}
			}
		});
		
		if (error) throw error;
		return { success: true, message: 'הרשמה בוצעה בהצלחה! בדוק את האימייל שלך לאישור החשבון.' };
	} catch (error) {
		return { success: false, error: error.message };
	} finally {
		isLoading.set(false);
	}
}

// Sign in with Google
export async function signInWithGoogle(credential) {
	if (!supabaseClient) throw new Error('Supabase not initialized');
	
	isLoading.set(true);
	try {
		const { data, error } = await supabaseClient.auth.signInWithIdToken({
			provider: 'google',
			token: credential,
		});
		
		if (error) throw error;
		if (data?.user) {
			currentUser.set(data.user);
			saveCurrentUser(data.user);
			
			// Save to server
			await saveUserToServer(data.user);
			return { success: true };
		}
	} catch (error) {
		return { success: false, error: error.message };
	} finally {
		isLoading.set(false);
	}
}

// Reset password
export async function resetPassword(email) {
	if (!supabaseClient) throw new Error('Supabase not initialized');
	
	isLoading.set(true);
	try {
		const { error } = await supabaseClient.auth.resetPasswordForEmail(email, {
			redirectTo: window.location.origin + '/reset-password'
		});
		
		if (error) throw error;
		return { success: true, message: 'נשלח אימייל שחזור סיסמה. בדוק את תיבת הדואר שלך.' };
	} catch (error) {
		return { success: false, error: error.message };
	} finally {
		isLoading.set(false);
	}
}

// Sign out
export async function signOut() {
	if (!supabaseClient) throw new Error('Supabase not initialized');
	
	try {
		await supabaseClient.auth.signOut();
		currentUser.set(null);
		if (browser) {
			localStorage.removeItem('currentUser');
		}
		return { success: true };
	} catch (error) {
		return { success: false, error: error.message };
	}
}

// Save user to server and set cookie
async function saveUserToServer(user) {
	const userData = extractUserData(user);
	try {
		const response = await fetch(`/api/user/${user.id}`, {
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify({
				email: user.email || '',
				name: userData.name,
				avatar: userData.avatar
			})
		});
		if (response.ok) {
			console.log('✅ User data saved to server');
			// Set cookie for server-side access
			document.cookie = `userId=${user.id}; path=/; max-age=${60 * 60 * 24 * 30}`; // 30 days
		}
	} catch (error) {
		console.error('Error saving user to server:', error);
	}
}

export { supabaseClient, GOOGLE_CLIENT_ID };
