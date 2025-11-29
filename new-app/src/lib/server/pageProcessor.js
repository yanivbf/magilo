// @ts-check
import { fixStorePageIssues, fixEventPageWhatsApp } from './pageFixes.js';

/**
 * Inject necessary scripts into HTML based on page type
 * @param {string} html - HTML content
 * @param {string} pageType - Page type (store, event, serviceProvider, etc.)
 * @returns {string} - HTML with injected scripts
 */
export function injectScripts(html, pageType) {
	let processedHtml = html;

	// Check if template-based store (skip injection)
	const isTemplateBasedStore =
		html.includes('<meta name="skip-store-injection"') ||
		html.includes('cart-float-btn') ||
		html.includes('id="cart-float-btn"');

	// Inject store-checkout.js for store/course/restaurantMenu pages
	if (
		(pageType === 'store' || pageType === 'course' || pageType === 'restaurantMenu') &&
		!isTemplateBasedStore &&
		!html.includes('store-checkout.js')
	) {
		const storeScript = `
<script src="/store-checkout.js"></script>
<!-- CHECKOUT_SCRIPTS_INJECTED -->`;

		// Try to inject before </body>
		if (processedHtml.includes('</body>')) {
			processedHtml = processedHtml.replace('</body>', storeScript + '\n</body>');
		} else if (processedHtml.includes('</html>')) {
			processedHtml = processedHtml.replace('</html>', storeScript + '\n</html>');
		} else {
			processedHtml += storeScript;
		}
	}

	// Inject universal data extractor for ALL pages
	if (!html.includes('function extractPageData()')) {
		const dataExtractorScript = `
<script>
// Universal page data extractor
function extractPageData() {
  const data = {};
  
  // Extract products
  const productCards = document.querySelectorAll('.product-card, [class*="product"], .card');
  if (productCards.length > 0) {
    data.products = Array.from(productCards).map(card => ({
      name: card.querySelector('h1, h2, h3, h4, .name, .title')?.textContent?.trim() || '',
      price: parseFloat(card.querySelector('[class*="price"]')?.textContent?.replace(/[^0-9.]/g, '') || '0'),
      image: card.querySelector('img')?.src || ''
    })).filter(p => p.name && p.price);
  }
  
  // Extract contact info
  const phoneEl = document.querySelector('[href^="tel:"]');
  if (phoneEl) data.phone = phoneEl.textContent?.trim();
  
  const emailEl = document.querySelector('[href^="mailto:"]');
  if (emailEl) data.email = emailEl.textContent?.trim();
  
  return data;
}

// Make available globally
window.extractPageData = extractPageData;
</script>`;

		if (processedHtml.includes('</body>')) {
			processedHtml = processedHtml.replace('</body>', dataExtractorScript + '\n</body>');
		} else if (processedHtml.includes('</html>')) {
			processedHtml = processedHtml.replace('</html>', dataExtractorScript + '\n</html>');
		} else {
			processedHtml += dataExtractorScript;
		}
	}

	// Inject page-type meta tag
	if (!html.includes('name="page-type"')) {
		const metaTag = `<meta name="page-type" content="${pageType}">`;
		if (processedHtml.includes('</head>')) {
			processedHtml = processedHtml.replace('</head>', `    ${metaTag}\n</head>`);
		}
	}

	return processedHtml;
}

/**
 * Fix WhatsApp integration code for event pages
 * @param {string} html - HTML content
 * @param {string} pageType - Page type
 * @returns {string} - HTML with fixed WhatsApp code
 */
export function fixWhatsAppCode(html, pageType) {
	if (pageType !== 'event') {
		return html;
	}

	// Fix WhatsApp links - ensure they have proper format
	let processedHtml = html;

	// Fix WhatsApp links without proper protocol
	processedHtml = processedHtml.replace(
		/href="whatsapp:\/\/send\?phone=([0-9]+)"/gi,
		'href="https://wa.me/$1"'
	);

	// Fix WhatsApp links with text parameter
	processedHtml = processedHtml.replace(
		/href="https:\/\/wa\.me\/([0-9]+)\?text=([^"]+)"/gi,
		(match, phone, text) => {
			const encodedText = encodeURIComponent(decodeURIComponent(text));
			return `href="https://wa.me/${phone}?text=${encodedText}"`;
		}
	);

	return processedHtml;
}

/**
 * Clean HTML content
 * @param {string} html - HTML content
 * @returns {string} - Cleaned HTML
 */
export function cleanHtml(html) {
	let cleaned = html;

	// Ensure DOCTYPE is present
	if (!cleaned.trim().toLowerCase().startsWith('<!doctype')) {
		cleaned = '<!DOCTYPE html>\n' + cleaned;
	}

	// Remove duplicate closing </html> tags
	const htmlCloseCount = (cleaned.match(/<\/html>/gi) || []).length;
	if (htmlCloseCount > 1) {
		// Keep only the first complete HTML document
		const firstHtmlClose = cleaned.indexOf('</html>');
		if (firstHtmlClose !== -1) {
			cleaned = cleaned.substring(0, firstHtmlClose + 7); // +7 for '</html>'
		}
	}

	// Remove any content after </html> tag
	const lastHtmlClose = cleaned.lastIndexOf('</html>');
	if (lastHtmlClose !== -1 && lastHtmlClose < cleaned.length - 7) {
		const afterHtml = cleaned.substring(lastHtmlClose + 7).trim();
		if (afterHtml.length > 0) {
			cleaned = cleaned.substring(0, lastHtmlClose + 7);
		}
	}

	return cleaned;
}

/**
 * Process complete page before saving
 * Orchestrates all processing steps
 * @param {string} html - HTML content
 * @param {string} pageType - Page type
 * @returns {string} - Fully processed HTML
 */
export function processPage(html, pageType) {
	let processed = html;

	// Step 1: Clean HTML
	processed = cleanHtml(processed);

	// Step 2: Inject scripts
	processed = injectScripts(processed, pageType);

	// Step 3: Fix WhatsApp code (for event pages)
	processed = fixWhatsAppCode(processed, pageType);

	// Step 4: Fix Event Page Issues (RSVP, countdown, etc.)
	if (pageType === 'event') {
		processed = fixEventPageWhatsApp(processed, pageType);
	}

	// Step 5: Fix Store Page Issues (cart, bubbles, fonts)
	if (pageType === 'store' || pageType === 'course' || pageType === 'restaurantMenu') {
		processed = fixStorePageIssues(processed);
	}

	return processed;
}

/**
 * Remove editor tools from HTML for clean viewing
 * @param {string} html - HTML content
 * @returns {string} - HTML without editor tools
 */
export function removeEditorTools(html) {
	// DON'T REMOVE ANYTHING - just return the HTML as-is
	// The user wants to keep all functionality (videos, galleries, calendars, etc.)
	return html;
}
