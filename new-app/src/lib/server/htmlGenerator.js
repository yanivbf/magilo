// @ts-check

/**
 * Generate a URL-friendly slug from title and userId
 * @param {string} title - Page title
 * @param {string} userId - User ID
 * @returns {string} - Generated slug
 */
export function generateSlug(title, userId) {
	// Clean the title: lowercase, replace special chars with hyphens
	// Remove Hebrew characters and keep only English letters, numbers, hyphens
	const cleanTitle = title
		.toLowerCase()
		.trim()
		// Remove Hebrew characters
		.replace(/[\u0590-\u05FF]/g, '')
		// Replace spaces and special chars with hyphens
		.replace(/[^a-z0-9]+/g, '-')
		// Remove leading/trailing hyphens
		.replace(/^-+|-+$/g, '')
		// Limit length
		.substring(0, 50);

	// Use first 8 characters of userId as prefix
	const userPrefix = userId.substring(0, 8);
	
	// If cleanTitle is empty (all Hebrew), use timestamp
	const finalTitle = cleanTitle || `page`;
	
	// Add timestamp to ensure uniqueness
	const timestamp = Date.now();

	return `${userPrefix}-${finalTitle}-${timestamp}`;
}

/**
 * Generate complete HTML page from template and data
 * This is a basic implementation - can be expanded with actual templates
 * @param {Object} pageData
 * @param {string} pageData.title
 * @param {string} [pageData.description]
 * @param {string} [pageData.content]
 * @param {string} [pageData.pageType]
 * @param {string} [pageData.facebookLink]
 * @param {string} [pageData.instagramLink]
 * @param {string} [pageData.tiktokLink]
 * @param {string} [pageData.linkedinLink]
 * @param {string} [pageData.twitterLink]
 * @param {string} [pageData.youtubeLink]
 * @param {string} userId
 * @returns {string} - Complete HTML string with DOCTYPE
 */
export function generatePageHtml(pageData, userId) {
	const { 
		title, 
		description = '', 
		content = '', 
		pageType = 'generic',
		facebookLink = '',
		instagramLink = '',
		tiktokLink = '',
		linkedinLink = '',
		twitterLink = '',
		youtubeLink = ''
	} = pageData;

	// 🔥 INJECT: Accessibility Widget Script
	const accessibilityScript = `
<!-- Accessibility Widget -->
<script src="https://cdn.enable.co.il/licenses/enable-L37136ixqvqxqxqx-0124-50913/init.js"></script>
`;

	// 🔥 INJECT: Social Media Links (if provided)
	const socialMediaLinks = [];
	if (facebookLink) socialMediaLinks.push({ icon: 'facebook', url: facebookLink, color: '#1877F2' });
	if (instagramLink) socialMediaLinks.push({ icon: 'instagram', url: instagramLink, color: '#E4405F' });
	if (tiktokLink) socialMediaLinks.push({ icon: 'tiktok', url: tiktokLink, color: '#000000' });
	if (linkedinLink) socialMediaLinks.push({ icon: 'linkedin', url: linkedinLink, color: '#0A66C2' });
	if (twitterLink) socialMediaLinks.push({ icon: 'twitter', url: twitterLink, color: '#1DA1F2' });
	if (youtubeLink) socialMediaLinks.push({ icon: 'youtube', url: youtubeLink, color: '#FF0000' });

	const socialMediaScript = socialMediaLinks.length > 0 ? `
<!-- Social Media Links -->
<script>
window.addEventListener('load', function() {
	const socialLinks = ${JSON.stringify(socialMediaLinks)};
	const container = document.createElement('div');
	container.style.cssText = \`
		position: fixed;
		bottom: 100px;
		left: 20px;
		display: flex;
		flex-direction: column;
		gap: 10px;
		z-index: 9998;
	\`;
	
	socialLinks.forEach(link => {
		const btn = document.createElement('a');
		btn.href = link.url;
		btn.target = '_blank';
		btn.style.cssText = \`
			width: 50px;
			height: 50px;
			background: \${link.color};
			border-radius: 50%;
			display: flex;
			align-items: center;
			justify-content: center;
			box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
			transition: transform 0.3s ease;
			color: white;
			text-decoration: none;
		\`;
		btn.innerHTML = '<span style="font-size: 24px;">📱</span>';
		btn.addEventListener('mouseenter', () => btn.style.transform = 'scale(1.1)');
		btn.addEventListener('mouseleave', () => btn.style.transform = 'scale(1)');
		container.appendChild(btn);
	});
	
	document.body.appendChild(container);
});
</script>
` : '';

	// 🔥 INJECT: WhatsApp Bot Integration
	const whatsappBotScript = `
<!-- WhatsApp Bot Integration -->
<script>
window.addEventListener('load', function() {
	const botConfig = {
		phone: '972544443333',
		message: 'היי, אני מעוניין בפרטים נוספים',
		position: 'left'
	};
	
	const whatsappBtn = document.createElement('a');
	whatsappBtn.href = \`https://wa.me/\${botConfig.phone}?text=\${encodeURIComponent(botConfig.message)}\`;
	whatsappBtn.target = '_blank';
	whatsappBtn.style.cssText = \`
		position: fixed;
		bottom: 20px;
		\${botConfig.position}: 20px;
		width: 60px;
		height: 60px;
		background: linear-gradient(135deg, #25D366 0%, #128C7E 100%);
		border-radius: 50%;
		display: flex;
		align-items: center;
		justify-content: center;
		box-shadow: 0 4px 12px rgba(37, 211, 102, 0.4);
		z-index: 9999;
		transition: transform 0.3s ease;
	\`;
	whatsappBtn.innerHTML = \`
		<svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="white">
			<path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893A11.821 11.821 0 0020.893 3.488"/>
		</svg>
	\`;
	whatsappBtn.addEventListener('mouseenter', () => whatsappBtn.style.transform = 'scale(1.1)');
	whatsappBtn.addEventListener('mouseleave', () => whatsappBtn.style.transform = 'scale(1)');
	document.body.appendChild(whatsappBtn);
});
</script>
`;

	return `<!DOCTYPE html>
<html lang="he" dir="rtl">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <meta name="description" content="${escapeHtml(description)}">
    <meta name="page-type" content="${pageType}">
    <title>${escapeHtml(title)}</title>
    ${accessibilityScript}
    <style>
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }
        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif;
            line-height: 1.6;
            color: #333;
            background: #f5f5f5;
        }
        .container {
            max-width: 1200px;
            margin: 0 auto;
            padding: 20px;
        }
        header {
            background: white;
            padding: 20px;
            margin-bottom: 20px;
            border-radius: 8px;
            box-shadow: 0 2px 4px rgba(0,0,0,0.1);
        }
        h1 {
            color: #2c3e50;
            margin-bottom: 10px;
        }
        .content {
            background: white;
            padding: 30px;
            border-radius: 8px;
            box-shadow: 0 2px 4px rgba(0,0,0,0.1);
        }
    </style>
</head>
<body>
    <div class="container">
        <header>
            <h1>${escapeHtml(title)}</h1>
            ${description ? `<p>${escapeHtml(description)}</p>` : ''}
        </header>
        <div class="content">
            ${content}
        </div>
    </div>
    ${socialMediaScript}
    ${whatsappBotScript}
</body>
</html>`;
}

/**
 * Escape HTML special characters to prevent XSS
 * @param {string} text
 * @returns {string}
 */
function escapeHtml(text) {
	/** @type {Record<string, string>} */
	const map = {
		'&': '&amp;',
		'<': '&lt;',
		'>': '&gt;',
		'"': '&quot;',
		"'": '&#039;'
	};
	return text.replace(/[&<>"']/g, (m) => map[m] || m);
}

/**
 * Ensure HTML has DOCTYPE declaration
 * @param {string} html
 * @returns {string}
 */
export function ensureDoctype(html) {
	const trimmed = html.trim();
	if (!trimmed.toLowerCase().startsWith('<!doctype')) {
		return '<!DOCTYPE html>\n' + html;
	}
	return html;
}

/**
 * Generate a unique filename for a page
 * @param {string} title
 * @param {string} pageType
 * @returns {string}
 */
export function generateFileName(title, pageType = 'generic') {
	const timestamp = Date.now();
	const cleanTitle = title
		.replace(/[^a-zA-Z0-9\u0590-\u05FF]/g, '_')
		.substring(0, 30);

	return `${cleanTitle}_${pageType}_${timestamp}.html`;
}
