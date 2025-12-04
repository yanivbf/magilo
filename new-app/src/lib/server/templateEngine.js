// @ts-check
import { readFile } from 'fs/promises';
import { join } from 'path';
import { escapeHtml as secureEscapeHtml, sanitizeUrl } from './security.js';

/**
 * Decode HTML entities
 * @param {string} html - HTML string with entities
 * @returns {string} - Decoded HTML
 */
function decodeHtmlEntities(html) {
	if (!html) return html;
	return html
		.replace(/&lt;/g, '<')
		.replace(/&gt;/g, '>')
		.replace(/&quot;/g, '"')
		.replace(/&#39;/g, "'")
		.replace(/&amp;/g, '&');
}

/**
 * Load HTML template and replace placeholders with actual data
 * @param {string} templateName - Template name (store, service, event, etc.)
 * @param {Object} data - Data to inject into template
 * @param {Array<string>} optionalSections - Optional sections to include (faq, gallery, video, etc.)
 * @returns {Promise<string>} - Processed HTML
 */
export async function renderTemplate(templateName, data, optionalSections = []) {
	console.log('🎨 Rendering template with optional sections:', optionalSections);
	try {
		// Map template names to file names
		const templateMap = {
			'store': 'store-legacy.html',
			'onlineStore': 'store-legacy.html',
			'service': 'service.html',
			'serviceProvider': 'service.html',
			'event': 'event.html',
			'course': 'course.html',
			'artist': 'artist.html',
			'message': 'message.html',
			'restaurant': 'restaurant.html',
			'workshop': 'workshop.html'
		};

		const templateFile = templateMap[templateName] || 'store-legacy.html';
		
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
		html = replacePlaceholders(html, data, optionalSections);

		return html;
	} catch (error) {
		console.error('❌ Error rendering template:', error);
		console.error('❌ Error details:', error.message);
		// Fallback to basic HTML
		return generateBasicHTML(data);
	}
}

/**
 * Generate default About content
 */
function generateAboutContent(data) {
	// If AI generated about, use it (decode HTML entities)
	if (data.ABOUT_HTML) {
		return decodeHtmlEntities(data.ABOUT_HTML);
	}
	
	// If about text provided, use it
	if (data.aboutText || data.about) {
		return `<div class="about-content"><p class="text-lg">${data.aboutText || data.about}</p></div>`;
	}
	
	// Otherwise, return empty placeholder
	return `<div class="empty-section-placeholder" style="text-align: center; padding: 3rem; background: #f9fafb; border-radius: 12px; border: 2px dashed #d1d5db;">
		<p style="font-size: 1.2rem; color: #6b7280; margin-bottom: 1rem;">ℹ️ אין תיאור עדיין</p>
		<p style="color: #9ca3af;">לחץ על "ניהול דף" כדי להוסיף תיאור על העסק</p>
	</div>`;
}

/**
 * Generate default Gallery content
 */
function generateGalleryContent(data) {
	// If AI generated gallery, use it (decode HTML entities)
	if (data.GALLERY_HTML) {
		return decodeHtmlEntities(data.GALLERY_HTML);
	}
	
	// If gallery images provided, use them
	if (data.gallery && Array.isArray(data.gallery) && data.gallery.length > 0) {
		return data.gallery.map((img, idx) => `<div class="gallery-item"><img src="${img}" alt="תמונה ${idx + 1}" loading="lazy"><div class="gallery-overlay"><span class="gallery-title">תמונה ${idx + 1}</span></div></div>`).join('');
	}
	
	// Otherwise, return empty placeholder with message
	return `<div class="empty-section-placeholder" style="text-align: center; padding: 3rem; background: #f9fafb; border-radius: 12px; border: 2px dashed #d1d5db;">
		<p style="font-size: 1.2rem; color: #6b7280; margin-bottom: 1rem;">🖼️ הגלריה ריקה</p>
		<p style="color: #9ca3af;">לחץ על "ניהול דף" כדי להוסיף תמונות</p>
	</div>`;
}

/**
 * Generate default Testimonials content
 */
function generateTestimonialsContent(data) {
	// If AI generated testimonials, use them (decode HTML entities)
	if (data.TESTIMONIALS_HTML) {
		return decodeHtmlEntities(data.TESTIMONIALS_HTML);
	}
	
	// If testimonials provided, use them
	if (data.testimonials && Array.isArray(data.testimonials) && data.testimonials.length > 0) {
		return data.testimonials.map(t => `
			<div class="testimonial-card">
				<div class="testimonial-quote-icon">
					<svg viewBox="0 0 24 24" fill="currentColor">
						<path d="M14.017 21v-7.391c0-5.704 3.731-9.57 8.983-10.609l.995 2.151c-2.432.917-3.995 3.638-3.995 5.849h4v10h-9.983zm-14.017 0v-7.391c0-5.704 3.748-9.57 9-10.609l.996 2.151c-2.433.917-3.996 3.638-3.996 5.849h3.983v10h-9.983z"/>
					</svg>
				</div>
				<div class="testimonial-header">
					<div class="testimonial-avatar-wrapper">
						<div style="width: 80px; height: 80px; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); border-radius: 50%; display: flex; align-items: center; justify-content: center; color: white; font-size: 32px; font-weight: bold;">
							${t.name.charAt(0)}
						</div>
					</div>
					<div class="testimonial-info">
						<div class="testimonial-name">${t.name}</div>
						<div class="testimonial-role">${t.role}</div>
						<div class="testimonial-rating">
							${'<span class="star">★</span>'.repeat(t.rating || 5)}
						</div>
					</div>
				</div>
				<div class="testimonial-text">${t.text}</div>
			</div>
		`).join('');
	}
	
	// Generate default testimonials
	const defaultTestimonials = [
		{
			name: 'שרה כהן',
			role: 'לקוחה מרוצה',
			rating: 5,
			text: 'שירות מעולה! המוצרים הגיעו במהירות ובאיכות גבוהה. בהחלט אמליץ!'
		},
		{
			name: 'דוד לוי',
			role: 'לקוח קבוע',
			rating: 5,
			text: 'חוויית קנייה נהדרת. המחירים הוגנים והשירות אדיב ומקצועי.'
		},
		{
			name: 'מיכל אברהם',
			role: 'לקוחה חדשה',
			rating: 5,
			text: 'התרשמתי מאוד! המוצרים בדיוק כמו בתמונות והאיכות מצוינת.'
		}
	];
	
	const testimonialsHTML = defaultTestimonials.map(t => `
		<div class="testimonial-card">
			<div class="testimonial-quote-icon">
				<svg viewBox="0 0 24 24" fill="currentColor">
					<path d="M14.017 21v-7.391c0-5.704 3.731-9.57 8.983-10.609l.995 2.151c-2.432.917-3.995 3.638-3.995 5.849h4v10h-9.983zm-14.017 0v-7.391c0-5.704 3.748-9.57 9-10.609l.996 2.151c-2.433.917-3.996 3.638-3.996 5.849h3.983v10h-9.983z"/>
				</svg>
			</div>
			<div class="testimonial-header">
				<div class="testimonial-avatar-wrapper">
					<div style="width: 80px; height: 80px; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); border-radius: 50%; display: flex; align-items: center; justify-content: center; color: white; font-size: 32px; font-weight: bold;">
						${t.name.charAt(0)}
					</div>
				</div>
				<div class="testimonial-info">
					<div class="testimonial-name">${t.name}</div>
					<div class="testimonial-role">${t.role}</div>
					<div class="testimonial-rating">
						${'<span class="star">★</span>'.repeat(t.rating || 5)}
					</div>
				</div>
			</div>
			<div class="testimonial-text">${t.text}</div>
		</div>
	`).join('');
	
	return `
		<style>
			.testimonial-card {
				background: white;
				border-radius: 16px;
				padding: 2rem;
				box-shadow: 0 4px 12px rgba(0,0,0,0.1);
				margin-bottom: 2rem;
				position: relative;
			}
			.testimonial-quote-icon {
				position: absolute;
				top: 1rem;
				right: 1rem;
				width: 40px;
				height: 40px;
				opacity: 0.1;
			}
			.testimonial-quote-icon svg {
				width: 100%;
				height: 100%;
				fill: #667eea;
			}
			.testimonial-header {
				display: flex;
				align-items: center;
				gap: 1.5rem;
				margin-bottom: 1.5rem;
			}
			.testimonial-name {
				font-size: 1.25rem;
				font-weight: 700;
				color: #1f2937;
				margin-bottom: 0.25rem;
			}
			.testimonial-role {
				font-size: 0.95rem;
				color: #6b7280;
				margin-bottom: 0.5rem;
			}
			.testimonial-rating {
				color: #fbbf24;
				font-size: 1.2rem;
			}
			.testimonial-text {
				font-size: 1.05rem;
				line-height: 1.8;
				color: #4b5563;
			}
		</style>
		<div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); gap: 2rem;">
			${testimonialsHTML}
		</div>
	`;
}

/**
 * Generate default FAQ content
 */
function generateFAQContent(data) {
	// If AI generated FAQ, use it (decode HTML entities)
	if (data.FAQ_HTML) {
		return decodeHtmlEntities(data.FAQ_HTML);
	}
	
	// If FAQ provided, use it
	if (data.faq && Array.isArray(data.faq) && data.faq.length > 0) {
		return data.faq.map((faq, idx) => `
			<div class="faq-item">
				<button class="faq-question" onclick="this.parentElement.classList.toggle('active')">
					<span>${faq.question}</span>
					<svg class="faq-icon" width="20" height="20" viewBox="0 0 20 20" fill="currentColor">
						<path fill-rule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clip-rule="evenodd"/>
					</svg>
				</button>
				<div class="faq-answer">
					<p>${faq.answer}</p>
				</div>
			</div>
		`).join('');
	}
	
	// Generate default FAQ based on page type
	const pageType = data.pageType || 'store';
	let defaultFAQ = [];
	
	if (pageType === 'store' || pageType === 'onlineStore') {
		defaultFAQ = [
			{
				question: 'איך אני מבצע הזמנה?',
				answer: 'פשוט לחץ על "הוסף לעגלה" ליד המוצר הרצוי, ולאחר מכן לחץ על עגלת הקניות למעלה כדי להשלים את ההזמנה.'
			},
			{
				question: 'מה אפשרויות התשלום?',
				answer: 'אנחנו מקבלים כרטיסי אשראי, PayPal, ביט והעברה בנקאית. כל התשלומים מאובטחים ומוצפנים.'
			},
			{
				question: 'כמה זמן לוקח המשלוח?',
				answer: 'משלוח סטנדרטי לוקח 3-5 ימי עסקים. משלוח מהיר זמין תוך 1-2 ימי עסקים בתוספת תשלום.'
			},
			{
				question: 'מה מדיניות ההחזרות?',
				answer: 'ניתן להחזיר מוצרים תוך 14 יום מיום הקניה, במצב חדש ובאריזה המקורית. ההחזר יבוצע תוך 7-10 ימי עסקים.'
			},
			{
				question: 'איך אני יכול ליצור קשר?',
				answer: `ניתן ליצור קשר דרך WhatsApp, טלפון ${data.phone || ''}, או אימייל ${data.email || ''}. נשמח לעזור!`
			}
		];
	} else if (pageType === 'service' || pageType === 'serviceProvider') {
		defaultFAQ = [
			{
				question: 'איך מזמינים תור?',
				answer: 'ניתן להזמין תור דרך הלוח שנה באתר, או ליצור קשר טלפונית או דרך WhatsApp.'
			},
			{
				question: 'מה מדיניות הביטולים?',
				answer: 'ניתן לבטל תור עד 24 שעות לפני המועד ללא עלות. ביטול מאוחר יותר עשוי לכלול תשלום.'
			},
			{
				question: 'כמה זמן נמשך הטיפול?',
				answer: 'משך הטיפול משתנה בהתאם לסוג השירות. פרטים מדויקים יינתנו בעת קביעת התור.'
			}
		];
	} else {
		defaultFAQ = [
			{
				question: 'איך אני יכול ליצור קשר?',
				answer: `ניתן ליצור קשר דרך WhatsApp, טלפון ${data.phone || ''}, או אימייל ${data.email || ''}. נשמח לעזור!`
			},
			{
				question: 'מה שעות הפעילות?',
				answer: 'אנחנו זמינים בימים א׳-ה׳ בין השעות 9:00-18:00. ניתן להשאיר הודעה מחוץ לשעות אלו.'
			}
		];
	}
	
	// Generate HTML for default FAQ with styles and script
	const faqHTML = defaultFAQ.map((faq, idx) => `
		<div class="faq-item">
			<button class="faq-question" onclick="this.parentElement.classList.toggle('active')">
				<span>${faq.question}</span>
				<svg class="faq-icon" width="20" height="20" viewBox="0 0 20 20" fill="currentColor">
					<path fill-rule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clip-rule="evenodd"/>
				</svg>
			</button>
			<div class="faq-answer">
				<p>${faq.answer}</p>
			</div>
		</div>
	`).join('');
	
	// Add styles for FAQ
	return `
		<style>
			.faq-item {
				background: white;
				border-radius: 12px;
				margin-bottom: 1rem;
				box-shadow: 0 2px 8px rgba(0,0,0,0.1);
				overflow: hidden;
				transition: all 0.3s ease;
			}
			.faq-item:hover {
				box-shadow: 0 4px 12px rgba(0,0,0,0.15);
			}
			.faq-question {
				width: 100%;
				padding: 1.5rem;
				background: none;
				border: none;
				text-align: right;
				font-size: 1.1rem;
				font-weight: 600;
				color: #1f2937;
				cursor: pointer;
				display: flex;
				justify-content: space-between;
				align-items: center;
				transition: all 0.3s ease;
			}
			.faq-question:hover {
				background: #f9fafb;
			}
			.faq-icon {
				transition: transform 0.3s ease;
				flex-shrink: 0;
				margin-left: 1rem;
			}
			.faq-item.active .faq-icon {
				transform: rotate(180deg);
			}
			.faq-answer {
				max-height: 0;
				overflow: hidden;
				transition: max-height 0.3s ease, padding 0.3s ease;
				padding: 0 1.5rem;
			}
			.faq-item.active .faq-answer {
				max-height: 500px;
				padding: 0 1.5rem 1.5rem 1.5rem;
			}
			.faq-answer p {
				color: #6b7280;
				line-height: 1.8;
				margin: 0;
			}
		</style>
		${faqHTML}
	`;
}

/**
 * Replace all placeholders in HTML with actual data
 * @param {string} html - HTML template
 * @param {Object} data - Data object
 * @param {Array<string>} optionalSections - Optional sections to include
 * @returns {string} - Processed HTML
 */
function replacePlaceholders(html, data, optionalSections = []) {
	// Common replacements
	const replacements = {
		'{{BUSINESS_NAME}}': data.mainName || data.businessName || data.title || 'העסק שלי',
		'{{META_DESCRIPTION}}': data.description || 'ברוכים הבאים',
		'{{HERO_TEXT}}': data.description || data.heroText || 'ברוכים הבאים לעסק שלנו',
		'{{DESCRIPTION}}': data.description || '',
		'{{PHONE}}': data.phone || '',
		'{{EMAIL}}': data.email || '',
		'{{ADDRESS}}': data.address || '',
		'{{CONTACT_NAME}}': data.contactName || '',
		'{{WHATSAPP_NUMBER}}': data.whatsapp || (data.phone ? data.phone.replace(/^0/, '972').replace(/-/g, '') : ''),
		'{{CITY}}': data.city || '',
		'{{COUNTRY_CODE}}': data.countryCode || '972',
		'{{SHOW_ABOUT}}': optionalSections.includes('about') || data.includeAbout ? 'block' : 'none',
		'{{SHOW_SERVICES}}': optionalSections.includes('services') ? 'block' : 'none',
		'{{SHOW_PRICING}}': optionalSections.includes('pricing') ? 'block' : 'none',
		'{{SHOW_YOUTUBE}}': optionalSections.includes('video') ? 'block' : 'none',
		'{{SHOW_GALLERY}}': optionalSections.includes('gallery') || data.includeGallery ? 'block' : 'none',
		'{{SHOW_TESTIMONIALS}}': optionalSections.includes('testimonials') || data.includeTestimonials ? 'block' : 'none',
		'{{SHOW_FAQ}}': optionalSections.includes('faq') || data.includeFAQ ? 'block' : 'none',
		'{{SHOW_TEAM}}': optionalSections.includes('team') ? 'block' : 'none',
		'{{SHOW_PRODUCTS}}': 'block',
		'{{SHOW_PRODUCTS_BUTTON}}': 'true',
		'{{DESIGN_STYLE}}': data.designStyle || 'modern',
		'{{DESIGN_STYLE_CSS}}': '',
		'{{ABOUT_HTML}}': (optionalSections.includes('about') || data.includeAbout) ? generateAboutContent(data) : '',
		'{{SERVICES_HTML}}': '',
		'{{GALLERY_HTML}}': (optionalSections.includes('gallery') || data.includeGallery) ? generateGalleryContent(data) : '',
		'{{TESTIMONIALS_HTML}}': (optionalSections.includes('testimonials') || data.includeTestimonials) ? generateTestimonialsContent(data) : '',
		'{{FAQ_HTML}}': (optionalSections.includes('faq') || data.includeFAQ) ? generateFAQContent(data) : '',
		'{{TEAM_HTML}}': '',
		'{{PRODUCTS_HTML}}': '',
		'{{SOCIAL_LINKS_HTML}}': '',
		'{{YOUTUBE_EMBED_URL}}': data.youtubeUrl || '',
		// Restaurant template
		'{{RESTAURANT_NAME}}': data.restaurantName || data.mainName || data.title || 'המסעדה שלנו',
		'{{LOGO}}': data.logo || '',
		'{{DESCRIPTION}}': data.description || '',
		'{{PRIMARY_COLOR}}': data.primaryColor || '#8B4513',
		'{{SECONDARY_COLOR}}': data.secondaryColor || '#D2691E',
		'{{ACCENT_COLOR}}': data.accentColor || '#F4A460',
		'{{SUNDAY}}': data.sunday || '',
		'{{MONDAY}}': data.monday || '',
		'{{TUESDAY}}': data.tuesday || '',
		'{{WEDNESDAY}}': data.wednesday || '',
		'{{THURSDAY}}': data.thursday || '',
		'{{FRIDAY}}': data.friday || '',
		'{{SATURDAY}}': data.saturday || '',
		'{{HAS_DELIVERY}}': data.hasDelivery ? 'true' : '',
		'{{DELIVERY_FEE}}': data.deliveryFee || '',
		'{{MIN_ORDER}}': data.minOrder || '',
		'{{DELIVERY_AREAS}}': data.deliveryAreas || '',
		'{{ENABLE_RESERVATIONS}}': data.enableReservations ? 'true' : '',
		'{{RESERVATION_EMAIL}}': data.reservationEmail || '',
		// Course template
		'{{COURSE_NAME}}': data.courseName || data.mainName || data.title || 'הקורס שלנו',
		'{{START_DATE}}': data.startDate || '',
		'{{MAX_STUDENTS}}': data.maxStudents || '',
		'{{ENABLE_REGISTRATION}}': data.enableRegistration ? 'true' : '',
		'{{REGISTRATION_EMAIL}}': data.registrationEmail || '',
		'{{CURRICULUM}}': data.curriculum || '',
		'{{PAGE_ID}}': data.pageId || data.id || '',
		// Workshop template
		'{{WORKSHOP_TITLE}}': data.workshopTitle || data.mainName || data.title || 'הסדנה שלנו',
		'{{IMAGE}}': data.image || '',
		'{{DATE}}': data.date || '',
		'{{TIME}}': data.time || '',
		'{{DURATION}}': data.duration || '',
		'{{PLATFORM}}': data.platform || '',
		'{{MAX_PARTICIPANTS}}': data.maxParticipants || '',
		'{{PRICE}}': data.price || '',
		'{{CURRENCY}}': data.currency || '₪',
		'{{EARLY_BIRD_PRICE}}': data.earlyBirdPrice || '',
		'{{EARLY_BIRD_DEADLINE}}': data.earlyBirdDeadline || '',
		'{{INSTRUCTOR}}': data.instructor || '',
		'{{INSTRUCTOR_BIO}}': data.instructorBio || '',
		'{{REQUIREMENTS}}': data.requirements || '',
		'{{MATERIALS}}': data.materials || ''
	};

	// Replace all placeholders
	let processedHtml = html;
	
	// HTML content placeholders that should NOT be escaped
	const htmlPlaceholders = ['{{ABOUT_HTML}}', '{{GALLERY_HTML}}', '{{TESTIMONIALS_HTML}}', '{{FAQ_HTML}}', '{{SERVICES_HTML}}', '{{TEAM_HTML}}', '{{PRODUCTS_HTML}}', '{{SOCIAL_LINKS_HTML}}'];
	
	for (const [placeholder, value] of Object.entries(replacements)) {
		const regex = new RegExp(placeholder.replace(/[{}]/g, '\\$&'), 'g');
		// Don't escape HTML content placeholders
		if (htmlPlaceholders.includes(placeholder)) {
			processedHtml = processedHtml.replace(regex, value);
		} else {
			processedHtml = processedHtml.replace(regex, escapeHtml(value));
		}
	}
	
	// Handle products HTML generation for store template
	if (data.products && Array.isArray(data.products) && data.products.length > 0) {
		const productsHtml = data.products.map((product, index) => `
			<div class="product-card">
				<img src="${product.image || `https://placehold.co/400x400/667eea/white?text=מוצר+${index + 1}`}" alt="${escapeHtml(product.name || 'מוצר')}" class="product-image">
				<div class="product-info">
					<h3 class="product-name">${escapeHtml(product.name || 'מוצר')}</h3>
					<p class="product-description">${escapeHtml(product.description || '')}</p>
					<div class="product-footer">
						<span class="product-price">₪${product.price || 0}</span>
						<button class="btn btn-primary add-to-cart-btn" onclick="addToCart(${product.id || index})">
							הוסף לעגלה
						</button>
					</div>
				</div>
			</div>
		`).join('');
		processedHtml = processedHtml.replace(/\{\{PRODUCTS_HTML\}\}/g, productsHtml);
		
		// Also inject products as JavaScript array
		const productsJson = JSON.stringify(data.products);
		processedHtml = processedHtml.replace(/const products = \[[\s\S]*?\];/, `const products = ${productsJson};`);
	}
	
	// Handle restaurant categories (special case - needs JSON)
	if (data.categories && Array.isArray(data.categories)) {
		const categoriesJson = JSON.stringify(data.categories);
		processedHtml = processedHtml.replace(/\{\{CATEGORIES\}\}/g, categoriesJson);
	}
	
	// Handle services (convert to JSON array for dynamic rendering)
	if (data.services) {
		const servicesArray = Array.isArray(data.services) 
			? data.services
			: (typeof data.services === 'string' 
				? data.services.split('\n').filter(s => s.trim()).map(name => ({ name }))
				: []);
		const servicesJson = JSON.stringify(servicesArray);
		processedHtml = processedHtml.replace(/\{\{SERVICES_JSON\}\}/g, servicesJson);
	} else {
		// Default to empty array if no services
		processedHtml = processedHtml.replace(/\{\{SERVICES_JSON\}\}/g, '[]');
	}
	
	// Handle workshop topics (convert string to array)
	if (data.topics) {
		const topicsArray = typeof data.topics === 'string' 
			? data.topics.split('\n').filter(t => t.trim())
			: data.topics;
		const topicsJson = JSON.stringify(topicsArray);
		processedHtml = processedHtml.replace(/\{\{TOPICS\}\}/g, topicsJson);
	}
	
	// Handle course curriculum (convert string to array)
	if (data.curriculum) {
		const curriculumArray = typeof data.curriculum === 'string' 
			? data.curriculum.split('\n').filter(c => c.trim())
			: data.curriculum;
		const curriculumJson = JSON.stringify(curriculumArray);
		processedHtml = processedHtml.replace(/\{\{CURRICULUM_ITEMS\}\}/g, curriculumJson);
	}

	// Hide optional sections that were not selected
	processedHtml = hideUnselectedSections(processedHtml, optionalSections);

	// Inject dynamic content sections (only selected ones)
	processedHtml = injectDynamicContent(processedHtml, data, optionalSections);

	// Remove any remaining placeholders
	processedHtml = processedHtml.replace(/\{\{[^}]+\}\}/g, '');

	return processedHtml;
}

/**
 * Hide sections that were not selected by the user
 * @param {string} html - HTML template
 * @param {Array<string>} optionalSections - Selected optional sections
 * @returns {string} - HTML with unselected sections hidden
 */
function hideUnselectedSections(html, optionalSections = []) {
	// Define section markers and their corresponding optional section keys
	const sectionMarkers = {
		'testimonials': [/<!-- Testimonials Section -->[\s\S]*?<!-- \/Testimonials Section -->/g, /<section[^>]*class="[^"]*testimonials[^"]*"[\s\S]*?<\/section>/g],
		'faq': [/<!-- FAQ Section -->[\s\S]*?<!-- \/FAQ Section -->/g, /<section[^>]*class="[^"]*faq[^"]*"[\s\S]*?<\/section>/g],
		'about': [/<!-- About Section -->[\s\S]*?<!-- \/About Section -->/g, /<section[^>]*class="[^"]*about[^"]*"[\s\S]*?<\/section>/g],
		'team': [/<!-- Team Section -->[\s\S]*?<!-- \/Team Section -->/g, /<section[^>]*class="[^"]*team[^"]*"[\s\S]*?<\/section>/g],
		'services': [/<!-- Services Section -->[\s\S]*?<!-- \/Services Section -->/g, /<section[^>]*class="[^"]*services[^"]*"[\s\S]*?<\/section>/g],
		'pricing': [/<!-- Pricing Section -->[\s\S]*?<!-- \/Pricing Section -->/g, /<section[^>]*class="[^"]*pricing[^"]*"[\s\S]*?<\/section>/g]
	};
	
	// Remove sections that were not selected
	for (const [sectionKey, patterns] of Object.entries(sectionMarkers)) {
		if (!optionalSections.includes(sectionKey)) {
			for (const pattern of patterns) {
				html = html.replace(pattern, '');
			}
		}
	}
	
	return html;
}

/**
 * Inject dynamic content (FAQ, gallery, social links, etc.) into HTML
 * @param {string} html - HTML template
 * @param {Object} data - Data object
 * @param {Array<string>} optionalSections - Optional sections to include
 * @returns {string} - HTML with injected content
 */
function injectDynamicContent(html, data, optionalSections = []) {
	let processedHtml = html;

	console.log('💉 Injecting dynamic content. Selected sections:', optionalSections);
	
	// CRITICAL: Inject products for store pages
	if (data.products && Array.isArray(data.products) && data.products.length > 0) {
		console.log('🛍️ Injecting', data.products.length, 'products into store template');
		processedHtml = injectProducts(processedHtml, data.products);
	}

	// Inject FAQ section if selected AND has data
	if (optionalSections.includes('faq') && data.faq && Array.isArray(data.faq) && data.faq.length > 0) {
		const faqHtml = generateFAQSection(data.faq);
		// Try to inject before closing body tag
		if (processedHtml.includes('</body>')) {
			processedHtml = processedHtml.replace('</body>', faqHtml + '\n</body>');
		} else {
			processedHtml += faqHtml;
		}
	}

	// Inject gallery if selected AND has data
	if (optionalSections.includes('gallery') && data.gallery && Array.isArray(data.gallery) && data.gallery.length > 0) {
		const galleryHtml = generateGallerySection(data.gallery);
		if (processedHtml.includes('</body>')) {
			processedHtml = processedHtml.replace('</body>', galleryHtml + '\n</body>');
		} else {
			processedHtml += galleryHtml;
		}
	}

	// Inject video if selected AND has data
	if (optionalSections.includes('video') && (data.videoUrl || data.video)) {
		const videoHtml = generateVideoSection(data.videoUrl || data.video);
		if (processedHtml.includes('</body>')) {
			processedHtml = processedHtml.replace('</body>', videoHtml + '\n</body>');
		} else {
			processedHtml += videoHtml;
		}
	}

	// Inject social links if exist
	const socialLinks = {};
	// Check both direct properties and *Link properties
	if (data.facebookLink || data.facebook) socialLinks.facebook = data.facebookLink || data.facebook;
	if (data.instagramLink || data.instagram) socialLinks.instagram = data.instagramLink || data.instagram;
	if (data.youtubeLink || data.youtube) socialLinks.youtube = data.youtubeLink || data.youtube;
	if (data.tiktokLink || data.tiktok) socialLinks.tiktok = data.tiktokLink || data.tiktok;
	if (data.linkedinLink || data.linkedin) socialLinks.linkedin = data.linkedinLink || data.linkedin;
	if (data.twitterLink || data.twitter) socialLinks.twitter = data.twitterLink || data.twitter;
	if (data.whatsappLink || data.whatsapp) socialLinks.whatsapp = data.whatsappLink || data.whatsapp;

	console.log('🔗 Social links found:', Object.keys(socialLinks));

	if (Object.keys(socialLinks).length > 0) {
		const socialHtml = generateSocialLinksSection(socialLinks);
		// Insert before footer or before closing body
		if (processedHtml.includes('<footer')) {
			processedHtml = processedHtml.replace('<footer', socialHtml + '\n<footer');
		} else if (processedHtml.includes('</body>')) {
			processedHtml = processedHtml.replace('</body>', socialHtml + '\n</body>');
		} else {
			processedHtml += socialHtml;
		}
	}

	// Inject services list if selected AND has data
	if (optionalSections.includes('services') && data.services) {
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
 * Inject products into store template
 * @param {string} html - HTML template
 * @param {Array} products - Products array
 * @returns {string} - HTML with products injected
 */
function injectProducts(html, products) {
	console.log('🛍️ Injecting', products.length, 'products into HTML');
	
	// Generate products JavaScript array
	const productsJS = `const products = ${JSON.stringify(products)};`;
	
	// Try multiple patterns to find where to inject products
	const patterns = [
		/const products = \[[\s\S]*?\];/,  // Pattern 1: const products = [...]
		/let products = \[[\s\S]*?\];/,     // Pattern 2: let products = [...]
		/var products = \[[\s\S]*?\];/      // Pattern 3: var products = [...]
	];
	
	let replaced = false;
	for (const pattern of patterns) {
		if (pattern.test(html)) {
			console.log('✅ Found products placeholder with pattern:', pattern);
			html = html.replace(pattern, productsJS);
			replaced = true;
			break;
		}
	}
	
	if (!replaced) {
		// If no placeholder found, try to inject before renderProducts() or before </script>
		console.log('⚠️ No products placeholder found, trying alternative injection');
		
		// Try to find renderProducts() function and inject before it
		if (html.includes('function renderProducts()') || html.includes('renderProducts()')) {
			html = html.replace(/function renderProducts\(\)/, `${productsJS}\n\n        function renderProducts()`);
			console.log('✅ Injected before renderProducts()');
		} else {
			// Last resort: inject before first </script> tag
			html = html.replace(/<\/script>/, `\n        ${productsJS}\n    </script>`);
			console.log('✅ Injected before </script>');
		}
	}
	
	return html;
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
function generateSocialLinksSection(socialLinks) {
	// Use Font Awesome icons
	const platformNames = {
		facebook: 'Facebook',
		instagram: 'Instagram',
		youtube: 'YouTube',
		tiktok: 'TikTok',
		linkedin: 'LinkedIn',
		twitter: 'Twitter',
		whatsapp: 'WhatsApp'
	};

	const faIcons = {
		facebook: 'fab fa-facebook-f',
		instagram: 'fab fa-instagram',
		youtube: 'fab fa-youtube',
		tiktok: 'fab fa-tiktok',
		linkedin: 'fab fa-linkedin-in',
		twitter: 'fab fa-twitter',
		whatsapp: 'fab fa-whatsapp'
	};

	const socialButtons = Object.entries(socialLinks)
		.filter(([platform, url]) => url && url.trim())
		.map(([platform, url]) => `
			<a href="${escapeHtml(url)}" target="_blank" rel="noopener noreferrer" 
			   style="display: inline-flex; align-items: center; gap: 0.5rem; padding: 0.75rem 1.5rem; background: white; color: #667eea; border-radius: 25px; text-decoration: none; font-weight: 600; transition: all 0.3s; box-shadow: 0 4px 15px rgba(0,0,0,0.1);"
			   onmouseover="this.style.transform='translateY(-3px)'; this.style.boxShadow='0 8px 25px rgba(102, 126, 234, 0.3)'; this.style.background='linear-gradient(135deg, #667eea 0%, #764ba2 100%)'; this.style.color='white'"
			   onmouseout="this.style.transform='translateY(0)'; this.style.boxShadow='0 4px 15px rgba(0,0,0,0.1)'; this.style.background='white'; this.style.color='#667eea'">
				<i class="${faIcons[platform]}" style="font-size: 1.25rem;"></i>
				<span>${platformNames[platform]}</span>
			</a>
		`).join('');

	return `
<!-- Font Awesome -->
<link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css">

<section class="social-links-section" style="padding: 3rem 2rem; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); text-align: center;">
	<div class="container" style="max-width: 1200px; margin: 0 auto;">
		<h2 style="font-size: 2rem; margin-bottom: 2rem; color: white; font-weight: 700;">עקבו אחרינו ברשתות החברתיות</h2>
		<div class="social-buttons" style="display: flex; justify-content: center; gap: 1rem; flex-wrap: wrap;">
			${socialButtons}
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
 * Escape HTML special characters (uses enhanced security function)
 * @param {string} text
 * @returns {string}
 */
function escapeHtml(text) {
	return secureEscapeHtml(text);
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
