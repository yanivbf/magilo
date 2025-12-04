/**
 * Script to migrate old pages from HTML-only to structured data
 * Run with: node scripts/migrate-pages-to-structured.js
 */

const STRAPI_URL = process.env.STRAPI_URL || 'http://localhost:1337';
const STRAPI_TOKEN = process.env.STRAPI_API_TOKEN;

if (!STRAPI_TOKEN) {
	console.error('❌ STRAPI_API_TOKEN environment variable is required');
	process.exit(1);
}

/**
 * Get all pages from Strapi
 */
async function getAllPages() {
	const response = await fetch(`${STRAPI_URL}/api/pages?populate=*`, {
		headers: {
			'Authorization': `Bearer ${STRAPI_TOKEN}`
		}
	});
	
	if (!response.ok) {
		throw new Error(`Failed to fetch pages: ${response.statusText}`);
	}
	
	const data = await response.json();
	return data.data;
}

/**
 * Update a page in Strapi
 */
async function updatePage(documentId, updates) {
	const response = await fetch(`${STRAPI_URL}/api/pages/${documentId}`, {
		method: 'PUT',
		headers: {
			'Authorization': `Bearer ${STRAPI_TOKEN}`,
			'Content-Type': 'application/json'
		},
		body: JSON.stringify({ data: updates })
	});
	
	if (!response.ok) {
		throw new Error(`Failed to update page: ${response.statusText}`);
	}
	
	return await response.json();
}

/**
 * Main migration function
 */
async function migratePages() {
	console.log('🔄 Starting page migration...\n');
	
	try {
		const pages = await getAllPages();
		console.log(`📄 Found ${pages.length} pages\n`);
		
		let migratedCount = 0;
		let skippedCount = 0;
		
		for (const page of pages) {
			const attrs = page.attributes;
			const metadata = attrs.metadata || {};
			
			// Check if page needs migration
			const needsMigration = (
				(metadata.gallery && !attrs.gallery) ||
				(metadata.testimonials && !attrs.testimonials) ||
				(metadata.faq && !attrs.faq) ||
				(metadata.aboutText && !attrs.aboutText)
			);
			
			if (!needsMigration) {
				console.log(`⏭️  Skipping "${attrs.title}" - already migrated`);
				skippedCount++;
				continue;
			}
			
			console.log(`🔄 Migrating "${attrs.title}"...`);
			
			// Prepare updates
			const updates = {};
			
			// Extract gallery from metadata
			if (metadata.gallery && !attrs.gallery) {
				updates.gallery = metadata.gallery;
				console.log(`  ✅ Extracted ${metadata.gallery.length} gallery images`);
			}
			
			// Extract testimonials from metadata
			if (metadata.testimonials && !attrs.testimonials) {
				updates.testimonials = metadata.testimonials;
				console.log(`  ✅ Extracted ${metadata.testimonials.length} testimonials`);
			}
			
			// Extract FAQ from metadata
			if (metadata.faq && !attrs.faq) {
				updates.faq = metadata.faq;
				console.log(`  ✅ Extracted ${metadata.faq.length} FAQ items`);
			}
			
			// Extract about text from metadata
			if (metadata.aboutText && !attrs.aboutText) {
				updates.aboutText = metadata.aboutText;
				console.log(`  ✅ Extracted about text`);
			}
			
			// Update page
			if (Object.keys(updates).length > 0) {
				await updatePage(page.documentId, updates);
				console.log(`  ✅ Page migrated successfully\n`);
				migratedCount++;
			} else {
				console.log(`  ⚠️  No data to migrate\n`);
				skippedCount++;
			}
		}
		
		console.log('\n✅ Migration complete!');
		console.log(`📊 Summary:`);
		console.log(`  - Total pages: ${pages.length}`);
		console.log(`  - Migrated: ${migratedCount}`);
		console.log(`  - Skipped: ${skippedCount}`);
		
	} catch (error) {
		console.error('❌ Migration failed:', error.message);
		process.exit(1);
	}
}

// Run migration
migratePages();
