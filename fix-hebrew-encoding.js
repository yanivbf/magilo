// Fix Hebrew encoding in Strapi
const STRAPI_URL = 'http://localhost:1337';
const STRAPI_API_TOKEN = '8ba3301bbe92b271829befae8c0c268dbe65efa2bd66517f9309d2e3127c36eca41e91db5a53deb48e8d8aaf095d700bbc4dd1ab32ad509705723f052241d1f0a352eb020cb675aa2e4d733d4bb48855d206eafed5d1196975ad06365767082044a7b5d955e5e3b43398e13aabee36a89e70392a390ef5b96bb4deff6ca43c6a';

async function fixUser() {
	const userId = 'google_111351120503275674259';
	
	console.log('🔧 Fixing Hebrew encoding for user:', userId);
	
	try {
		// Get user
		const getUrl = `${STRAPI_URL}/api/users?filters[userId][$eq]=${userId}`;
		const getResponse = await fetch(getUrl, {
			headers: {
				'Authorization': `Bearer ${STRAPI_API_TOKEN}`
			}
		});
		
		const getData = await getResponse.json();
		
		if (!getData.data || getData.data.length === 0) {
			console.error('❌ User not found');
			return;
		}
		
		const user = getData.data[0];
		console.log('📥 Current name (broken):', user.name);
		
		// Fix the name - set it to the correct Hebrew
		const correctName = 'בריט עולמיק';
		
		// Update user with correct name
		const updateUrl = `${STRAPI_URL}/api/users/${user.documentId || user.id}`;
		const updateResponse = await fetch(updateUrl, {
			method: 'PUT',
			headers: {
				'Content-Type': 'application/json; charset=utf-8',
				'Authorization': `Bearer ${STRAPI_API_TOKEN}`
			},
			body: JSON.stringify({
				data: {
					name: correctName
				}
			})
		});
		
		if (updateResponse.ok) {
			console.log('✅ Name fixed successfully!');
			console.log('📤 New name:', correctName);
		} else {
			const error = await updateResponse.json();
			console.error('❌ Failed to update:', error);
		}
		
	} catch (error) {
		console.error('❌ Error:', error.message);
	}
}

fixUser();
