// Script to activate subscription for a user
const STRAPI_URL = 'http://localhost:1337';
const STRAPI_API_TOKEN = '8ba3301bbe92b271829befae8c0c268dbe65efa2bd66517f9309d2e3127c36eca41e91db5a53deb48e8d8aaf095d700bbc4dd1ab32ad509705723f052241d1f0a352eb020cb675aa2e4d733d4bb48855d206eafed5d1196975ad06365767082044a7b5d955e5e3b43398e13aabee36a89e70392a390ef5b96bb4deff6ca43c6a';

// Get userId from command line argument
const userId = process.argv[2];

if (!userId) {
	console.error('❌ Usage: node activate-subscription.js <userId>');
	console.error('   Example: node activate-subscription.js 36c0bd16-5a25-45a3-8735-8b5913ccc9c9');
	process.exit(1);
}

async function activateSubscription() {
	try {
		console.log(`🎯 Activating subscription for user: ${userId}`);
		
		// Calculate expiry date (1 month from now)
		const expiryDate = new Date();
		expiryDate.setMonth(expiryDate.getMonth() + 1);
		
		console.log(`📅 Expiry date: ${expiryDate.toISOString()}`);
		
		// Update user in Strapi
		const response = await fetch(`${STRAPI_URL}/api/users/${userId}`, {
			method: 'PUT',
			headers: {
				'Authorization': `Bearer ${STRAPI_API_TOKEN}`,
				'Content-Type': 'application/json'
			},
			body: JSON.stringify({
				subscriptionStatus: 'active',
				subscriptionExpiry: expiryDate.toISOString()
			})
		});
		
		if (!response.ok) {
			const errorText = await response.text();
			console.error('❌ Failed to update user:', response.status);
			console.error('   Error:', errorText);
			process.exit(1);
		}
		
		const updatedUser = await response.json();
		
		console.log('\n✅ Subscription activated successfully!');
		console.log(`   User: ${updatedUser.username || updatedUser.email}`);
		console.log(`   Status: ${updatedUser.subscriptionStatus}`);
		console.log(`   Expires: ${updatedUser.subscriptionExpiry}`);
		
	} catch (error) {
		console.error('❌ Error:', error.message);
		process.exit(1);
	}
}

// Run the script
activateSubscription();
