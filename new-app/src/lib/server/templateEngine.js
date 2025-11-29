// @ts-check
import { readFile } from 'fs/promises';
import { join } from 'path';

/**
 * Load HTML template and replace placeholders with actual data
 * @param {string} templateName - Template name (store, service, event, etc.)
 * @param {Object} data - Data to inject into template
 * @returns {Promise<string>} - Processed HTML
 */
export async function renderTemplate(templateName, data) {
	try {
		// Map template names to file names
		const templateMap = {
			'store': 'store.html',
			'onlineStore': 'store.html',
			'service': 'service.html',
			'serviceProvider': 'service.html',
			'event': 'event.html',
			'course': 'course.html',
			'artist': 'artist.html',
			'message': 'message.html'
		};

		const templateFile = templateMap[templateName] || 'store.html';
		
		// Try multiple paths
		const possiblePaths = [
			join(process.cwd(), 'src', 'lib', 'templates', 'html', templateFile),
			join(process.cwd(), 'new-app', 'src', 'lib', 'templates', 'html', templateFile),
			join('src', 'lib', 'templates', 'html', templateFile)
		];

		let html = null;
		let lastError = null;

		for (const templatePath of possiblePaths) {
			try {
				console.log('🔍 Trying template path:', templatePath);
				html = await readFile(templatePath, 'utf-8');
				console.log('✅ Template loaded successfully from:', templatePath);
				break;
			} catch (err) {
				lastError = err;
				console.log('⚠️ Template not found at:', templatePath);
			}
		}

		if (!html) {
			throw lastError || new Error('Template not found');
		}

		// Replace placeholders
		html = replacePlaceholders(html, data);

		return html;
	} catch (error) {
		console.error('❌ Error rendering template:', error);
		console.error('❌ Error details:', error.message);
		// Fallback to basic HTML
		return generateBasicHTML(data);
	}
}

/**
 * Replace all placeholders in HTML with actual data
 * @param {string} html - HTML template
 * @param {Object} data - Data object
 * @returns {string} - Processed HTML
 */
function replacePlaceholders(html, data) {
	// Common replacements
	const replacements = {
		'{{BUSINESS_NAME}}': data.mainName || data.businessName || data.title || 'העסק שלי',
		'{{META_DESCRIPTION}}': data.description || 'ברוכים הבאים',
		'{{PHONE}}': data.phone || '',
		'{{EMAIL}}': data.email || '',
		'{{ADDRESS}}': data.address || '',
		'{{CONTACT_NAME}}': data.contactName || '',
		'{{WHATSAPP_NUMBER}}': data.whatsapp || (data.phone ? data.phone.replace(/^0/, '972') : ''),
		'{{CITY}}': data.city || '',
		'{{COUNTRY_CODE}}': data.countryCode || '972'
	};

	// Replace all placeholders
	let processedHtml = html;
	for (const [placeholder, value] of Object.entries(replacements)) {
		const regex = new RegExp(placeholder.replace(/[{}]/g, '\\$&'), 'g');
		processedHtml = processedHtml.replace(regex, escapeHtml(value));
	}

	// Inject dynamic content sections
	processedHtml = injectDynamicContent(processedHtml, data);

	// Remove any remaining placeholders
	processedHtml = processedHtml.replace(/\{\{[^}]+\}\}/g, '');

	return processedHtml;
}

/**
 * Inject dynamic content (FAQ, gallery, social links, etc.) into HTML
 * @param {string} html - HTML template
 * @param {Object} data - Data object
 * @returns {string} - HTML with injected content
 */
function injectDynamicContent(html, data) {
	let processedHtml = html;

	// Inject FAQ section if exists
	if (data.faq && Array.isArray(data.faq) && data.faq.length > 0) {
		const faqHtml = generateFAQSection(data.faq);
		// Try to inject before closing body tag
		if (processedHtml.includes('</body>')) {
			processedHtml = processedHtml.replace('</body>', faqHtml + '\n</body>');
		} else {
			processedHtml += faqHtml;
		}
	}

	// Inject gallery if exists
	if (data.gallery && Array.isArray(data.gallery) && data.gallery.length > 0) {
		const galleryHtml = generateGallerySection(data.gallery);
		if (processedHtml.includes('</body>')) {
			processedHtml = processedHtml.replace('</body>', galleryHtml + '\n</body>');
		} else {
			processedHtml += galleryHtml;
		}
	}

	// Inject video if exists
	if (data.videoUrl || data.video) {
		const videoHtml = generateVideoSection(data.videoUrl || data.video);
		if (processedHtml.includes('</body>')) {
			processedHtml = processedHtml.replace('</body>', videoHtml + '\n</body>');
		} else {
			processedHtml += videoHtml;
		}
	}

	// Inject social links if exist
	const socialLinks = {};
	if (data.facebook) socialLinks.facebook = data.facebook;
	if (data.instagram) socialLinks.instagram = data.instagram;
	if (data.youtube) socialLinks.youtube = data.youtube;
	if (data.tiktok) socialLinks.tiktok = data.tiktok;
	if (data.whatsapp) socialLinks.whatsapp = data.whatsapp;

	if (Object.keys(socialLinks).length > 0) {
		const socialHtml = generateSocialLinksSection(socialLinks);
		if (processedHtml.includes('</body>')) {
			processedHtml = processedHtml.replace('</body>', socialHtml + '\n</body>');
		} else {
			processedHtml += socialHtml;
		}
	}

	// Inject services list if exists
	if (data.services) {
		const servicesArray = typeof data.services === 'string' 
			? data.services.split('\n').filter(s => s.trim())
			: data.services;
		if (servicesArray.length > 0) {
			const servicesHtml = generateServicesSection(servicesArray);
			if (processedHtml.includes('</body>')) {
				processedHtml = processedHtml.replace('</body>', servicesHtml + '\n</body>');
			} else {
				processedHtml += servicesHtml;
			}
		}
	}

	return processedHtml;
}

/**
 * Generate FAQ section HTML
 */
function generateFAQSection(faq) {
	return `
<section class="faq-section" style="padding: 4rem 2rem; background: #f9fafb;">
	<div class="container" style="max-width: 1200px; margin: 0 auto;">
		<h2 style="text-align: center; font-size: 2.5rem; margin-bottom: 3rem; color: #1F2937;">שאלות ותשובות</h2>
		<div class="faq-list" style="max-width: 800px; margin: 0 auto;">
			${faq.map((item, index) => `
				<div class="faq-item" style="background: white; padding: 2rem; margin-bottom: 1rem; border-radius: 12px; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">
					<h3 style="color: #667eea; margin-bottom: 1rem; font-size: 1.25rem;">${escapeHtml(item.question)}</h3>
					<p style="color: #4B5563; line-height: 1.8;">${escapeHtml(item.answer)}</p>
				</div>
			`).join('')}
		</div>
	</div>
</section>`;
}

/**
 * Generate gallery section HTML
 */
function generateGallerySection(gallery) {
	return `
<section class="gallery-section" style="padding: 4rem 2rem; background: white;">
	<div class="container" style="max-width: 1200px; margin: 0 auto;">
		<h2 style="text-align: center; font-size: 2.5rem; margin-bottom: 3rem; color: #1F2937;">גלריה</h2>
		<div class="gallery-grid" style="display: grid; grid-template-columns: repeat(auto-fill, minmax(300px, 1fr)); gap: 1.5rem;">
			${gallery.map(img => `
				<img src="${escapeHtml(img)}" alt="תמונה" style="width: 100%; height: 300px; object-fit: cover; border-radius: 12px; box-shadow: 0 4px 15px rgba(0,0,0,0.1); transition: transform 0.3s;" onmouseover="this.style.transform='scale(1.05)'" onmouseout="this.style.transform='scale(1)'">
			`).join('')}
		</div>
	</div>
</section>`;
}

/**
 * Generate video section HTML
 */
function generateVideoSection(videoUrl) {
	const isYoutube = videoUrl.includes('youtube.com') || videoUrl.includes('youtu.be');
	const embedUrl = isYoutube ? videoUrl.replace('watch?v=', 'embed/') : videoUrl;
	
	return `
<section class="video-section" style="padding: 4rem 2rem; background: #f9fafb;">
	<div class="container" style="max-width: 1200px; margin: 0 auto;">
		<h2 style="text-align: center; font-size: 2.5rem; margin-bottom: 3rem; color: #1F2937;">סרטון</h2>
		<div class="video-wrapper" style="position: relative; padding-bottom: 56.25%; height: 0; overflow: hidden; border-radius: 12px; box-shadow: 0 4px 20px rgba(0,0,0,0.1);">
			${isYoutube 
				? `<iframe src="${escapeHtml(embedUrl)}" style="position: absolute; top: 0; left: 0; width: 100%; height: 100%;" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe>`
				: `<video controls src="${escapeHtml(videoUrl)}" style="position: absolute; top: 0; left: 0; width: 100%; height: 100%;"></video>`
			}
		</div>
	</div>
</section>`;
}

/**
 * Generate social links section HTML
 */
function generateSocialLinksSection(links) {
	return `
<section class="social-section" style="padding: 3rem 2rem; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); text-align: center;">
	<div class="container" style="max-width: 1200px; margin: 0 auto;">
		<h2 style="color: white; font-size: 2rem; margin-bottom: 2rem;">עקבו אחרינו</h2>
		<div class="social-links" style="display: flex; justify-content: center; gap: 1.5rem; flex-wrap: wrap;">
			${links.facebook ? `<a href="${escapeHtml(links.facebook)}" target="_blank" style="background: white; color: #667eea; padding: 1rem 2rem; border-radius: 50px; text-decoration: none; font-weight: bold; transition: transform 0.3s;" onmouseover="this.style.transform='scale(1.1)'" onmouseout="this.style.transform='scale(1)'">📘 Facebook</a>` : ''}
			${links.instagram ? `<a href="${escapeHtml(links.instagram)}" target="_blank" style="background: white; color: #667eea; padding: 1rem 2rem; border-radius: 50px; text-decoration: none; font-weight: bold; transition: transform 0.3s;" onmouseover="this.style.transform='scale(1.1)'" onmouseout="this.style.transform='scale(1)'">📷 Instagram</a>` : ''}
			${links.youtube ? `<a href="${escapeHtml(links.youtube)}" target="_blank" style="background: white; color: #667eea; padding: 1rem 2rem; border-radius: 50px; text-decoration: none; font-weight: bold; transition: transform 0.3s;" onmouseover="this.style.transform='scale(1.1)'" onmouseout="this.style.transform='scale(1)'">🎥 YouTube</a>` : ''}
			${links.tiktok ? `<a href="${escapeHtml(links.tiktok)}" target="_blank" style="background: white; color: #667eea; padding: 1rem 2rem; border-radius: 50px; text-decoration: none; font-weight: bold; transition: transform 0.3s;" onmouseover="this.style.transform='scale(1.1)'" onmouseout="this.style.transform='scale(1)'">🎵 TikTok</a>` : ''}
			${links.whatsapp ? `<a href="https://wa.me/${escapeHtml(links.whatsapp)}" target="_blank" style="background: white; color: #667eea; padding: 1rem 2rem; border-radius: 50px; text-decoration: none; font-weight: bold; transition: transform 0.3s;" onmouseover="this.style.transform='scale(1.1)'" onmouseout="this.style.transform='scale(1)'">💬 WhatsApp</a>` : ''}
		</div>
	</div>
</section>`;
}

/**
 * Generate services section HTML
 */
function generateServicesSection(services) {
	return `
<section class="services-section" style="padding: 4rem 2rem; background: white;">
	<div class="container" style="max-width: 1200px; margin: 0 auto;">
		<h2 style="text-align: center; font-size: 2.5rem; margin-bottom: 3rem; color: #1F2937;">השירותים שלנו</h2>
		<div class="services-grid" style="display: grid; grid-template-columns: repeat(auto-fill, minmax(250px, 1fr)); gap: 2rem;">
			${services.map(service => `
				<div class="service-card" style="background: #f9fafb; padding: 2rem; border-radius: 12px; text-align: center; box-shadow: 0 2px 10px rgba(0,0,0,0.1); transition: transform 0.3s;" onmouseover="this.style.transform='translateY(-10px)'" onmouseout="this.style.transform='translateY(0)'">
					<div style="font-size: 3rem; margin-bottom: 1rem;">✓</div>
					<h3 style="color: #667eea; font-size: 1.25rem;">${escapeHtml(service)}</h3>
				</div>
			`).join('')}
		</div>
	</div>
</section>`;
}

/**
 * Escape HTML special characters
 * @param {string} text
 * @returns {string}
 */
function escapeHtml(text) {
	if (!text) return '';
	return String(text)
		.replace(/&/g, '&amp;')
		.replace(/</g, '&lt;')
		.replace(/>/g, '&gt;')
		.replace(/"/g, '&quot;')
		.replace(/'/g, '&#039;');
}

/**
 * Generate basic HTML as fallback
 * @param {Object} data
 * @returns {string}
 */
function generateBasicHTML(data) {
	const title = data.mainName || data.title || 'דף חדש';
	const description = data.description || '';
	const phone = data.phone || '';
	const email = data.email || '';

	return `<!DOCTYPE html>
<html lang="he" dir="rtl">
<head>
	<meta charset="UTF-8">
	<meta name="viewport" content="width=device-width, initial-scale=1.0">
	<title>${escapeHtml(title)}</title>
	<style>
		* { margin: 0; padding: 0; box-sizing: border-box; }
		body { 
			font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
			background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
			min-height: 100vh;
			display: flex;
			align-items: center;
			justify-content: center;
			padding: 2rem;
		}
		.container {
			background: white;
			border-radius: 1rem;
			padding: 3rem;
			max-width: 600px;
			box-shadow: 0 20px 60px rgba(0,0,0,0.3);
		}
		h1 { 
			color: #667eea;
			font-size: 2.5rem;
			margin-bottom: 1rem;
		}
		p { 
			color: #4a5568;
			font-size: 1.1rem;
			line-height: 1.6;
			margin-bottom: 1rem;
		}
		.contact {
			margin-top: 2rem;
			padding-top: 2rem;
			border-top: 2px solid #e2e8f0;
		}
		.contact-item {
			display: flex;
			align-items: center;
			gap: 0.5rem;
			margin: 0.5rem 0;
			color: #2d3748;
		}
	</style>
</head>
<body>
	<div class="container">
		<h1>${escapeHtml(title)}</h1>
		${description ? `<p>${escapeHtml(description)}</p>` : ''}
		<div class="contact">
			<h2>צור קשר</h2>
			${phone ? `<div class="contact-item">📞 ${escapeHtml(phone)}</div>` : ''}
			${email ? `<div class="contact-item">📧 ${escapeHtml(email)}</div>` : ''}
		</div>
	</div>
</body>
</html>`;
}
