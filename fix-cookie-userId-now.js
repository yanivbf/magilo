// Fix userId cookie immediately
// Run this in browser console or as a script

console.log('🔧 Starting userId cookie fix...');

const MAIN_USER_ID = 'google_111351120503275674259';

function setCookie(name, value, days = 30) {
    const expires = new Date(Date.now() + days * 24 * 60 * 60 * 1000).toUTCString();
    document.cookie = `${name}=${value}; expires=${expires}; path=/; SameSite=Lax`;
    console.log(`✅ Cookie set: ${name}=${value}`);
}

function getCookie(name) {
    const value = `; ${document.cookie}`;
    const parts = value.split(`; ${name}=`);
    if (parts.length === 2) return parts.pop().split(';').shift();
    return null;
}

// Check current state
console.log('📊 Current cookies:');
console.log('  userId:', getCookie('userId'));
console.log('  subscriptionStatus:', getCookie('subscriptionStatus'));

// Set the main user cookies
console.log('🔧 Setting main user cookies...');
setCookie('userId', MAIN_USER_ID, 30);
setCookie('subscriptionStatus', 'active', 30);
setCookie('subscriptionExpiry', new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(), 30);

// Set localStorage
try {
    const userData = {
        id: MAIN_USER_ID,
        userId: MAIN_USER_ID,
        email: '',
        name: 'משתמש רשום',
        avatar: null,
        subscriptionStatus: 'active'
    };
    localStorage.setItem('currentUser', JSON.stringify(userData));
    console.log('✅ localStorage updated');
} catch (e) {
    console.warn('⚠️ localStorage not available:', e.message);
}

// Verify
console.log('✅ Fix completed! New cookies:');
console.log('  userId:', getCookie('userId'));
console.log('  subscriptionStatus:', getCookie('subscriptionStatus'));

console.log('🔄 Reload the page to see the changes take effect');

// Auto-reload after 2 seconds
setTimeout(() => {
    console.log('🔄 Auto-reloading page...');
    window.location.reload();
}, 2000);