// @ts-check
// Page fixes ported from legacy server

/**
 * Fix store page issues (cart, bubbles, font sizes)
 * @param {string} html - HTML content
 * @returns {string} - Fixed HTML
 */
export function fixStorePageIssues(html) {
	console.log('🛒 Fixing store page issues...');

	// Skip template-based stores - they have proper cart HTML
	const isTemplateBasedStore =
		html.includes('<meta name="skip-store-injection"') ||
		html.includes('class="cart-float-btn"') ||
		html.includes('id="cart-float-btn"');

	if (isTemplateBasedStore) {
		console.log('⏭️ Skipping fixStorePageIssues - template-based store with proper cart HTML');
		return html;
	}

	let fixedHtml = html;
	let fixedCount = 0;

	// 1. Clean cart placeholders - they should be COMPLETELY EMPTY
	const cartPatterns = [
		/<div[^>]*\s+id=["']cart-sidebar["'][^>]*>[\s\S]*?<\/div>/gi,
		/<div[^>]*\s+id=["']cart-overlay["'][^>]*>[\s\S]*?<\/div>/gi,
		/<div[^>]*\s+id=["']cart-button-placeholder["'][^>]*>[\s\S]*?<\/div>/gi,
		/<div[^>]*\s+id=["']cart-backdrop["'][^>]*>[\s\S]*?<\/div>/gi
	];

	for (const pattern of cartPatterns) {
		const matches = fixedHtml.match(pattern);
		if (matches) {
			for (const match of matches) {
				if (match.includes('cart-sidebar')) {
					fixedHtml = fixedHtml.replace(match, '<div id="cart-sidebar"></div>');
					fixedCount++;
				} else if (match.includes('cart-overlay')) {
					fixedHtml = fixedHtml.replace(match, '<div id="cart-overlay"></div>');
					fixedCount++;
				} else if (match.includes('cart-button-placeholder')) {
					fixedHtml = fixedHtml.replace(match, '<div id="cart-button-placeholder"></div>');
					fixedCount++;
				} else if (match.includes('cart-backdrop')) {
					fixedHtml = fixedHtml.replace(match, '<div id="cart-backdrop"></div>');
					fixedCount++;
				}
			}
		}
	}

	// 2. Remove cart buttons from header/nav only
	fixedHtml = fixedHtml.replace(/<header[^>]*>([\s\S]*?)<\/header>/gi, function (headerMatch) {
		return headerMatch.replace(
			/<button[^>]*\b(?:id|class)=["'][^"']*cart[^"']*["'][^>]*>[\s\S]*?<\/button>/gi,
			''
		);
	});
	fixedHtml = fixedHtml.replace(/<nav[^>]*>([\s\S]*?)<\/nav>/gi, function (navMatch) {
		return navMatch.replace(
			/<button[^>]*\b(?:id|class)=["'][^"']*cart[^"']*["'][^>]*>[\s\S]*?<\/button>/gi,
			''
		);
	});

	// 3. Add aggressive CSS fixes
	const fixCSS = `
<style id="store-page-fixes">
  /* Force cart to start CLOSED */
  #cart-sidebar { 
    right: -450px !important; 
    transform: translateX(0) !important;
    display: block !important;
  }
  
  #cart-sidebar.open { 
    right: 0 !important; 
  }
  
  #cart-overlay, #cart-backdrop { 
    opacity: 0 !important; 
    pointer-events: none !important;
    display: block !important;
  }
  
  #cart-overlay.open, #cart-backdrop.open { 
    opacity: 1 !important; 
    pointer-events: all !important; 
  }
  
  /* Ensure floating bubbles are ALWAYS clickable and FIXED */
  a[href*="wa.me"], 
  [id*="whatsapp"], 
  [id*="bot"], 
  [style*="#8B5CF6"],
  [style*="25D366"] {
    position: fixed !important;
    z-index: 10000 !important;
    pointer-events: all !important;
    cursor: pointer !important;
  }
  
  /* Fix bot button position */
  #ai-bot-btn {
    position: fixed !important;
    bottom: 20px !important;
    right: 20px !important;
    z-index: 10000 !important;
  }
  
  /* Fix WhatsApp bubble position */
  a[href*="wa.me"] {
    position: fixed !important;
    bottom: 20px !important;
    left: 20px !important;
    z-index: 10000 !important;
  }
  
  /* Ensure NORMAL font sizes */
  body {
    font-size: 16px !important;
  }
  
  body p {
    font-size: 16px !important;
  }
  
  body h1 {
    font-size: 2.5rem !important;
  }
  
  body h2 {
    font-size: 2rem !important;
  }
  
  body h3 {
    font-size: 1.75rem !important;
  }
  
  body button, body a, body input, body textarea {
    font-size: 16px !important;
  }
  
  /* Fix AI chat window font sizes */
  #ai-chat-window {
    font-size: 16px !important;
  }
  
  #ai-chat-window h3 {
    font-size: 20px !important;
  }
  
  #ai-chat-messages p,
  #ai-chat-messages div {
    font-size: 16px !important;
  }
  
  /* Ensure bubbles don't hide behind cart */
  #floating-cart-icon {
    z-index: 9998 !important;
  }
</style>`;

	if (!fixedHtml.includes('store-page-fixes')) {
		if (fixedHtml.includes('</head>')) {
			fixedHtml = fixedHtml.replace('</head>', fixCSS + '\n</head>');
			fixedCount++;
		}
	}

	console.log(`🛒 Fixed ${fixedCount} store page issues`);
	return fixedHtml;
}

/**
 * Fix WhatsApp code in event pages (RSVP forms, countdown timer)
 * @param {string} html - HTML content
 * @param {string} pageType - Page type
 * @returns {string} - Fixed HTML
 */
export function fixEventPageWhatsApp(html, pageType) {
	console.log(`🔍 fixEventPageWhatsApp called with pageType: "${pageType}"`);

	if (pageType !== 'event') {
		console.log(`⏭️ Skipping fix - pageType is "${pageType}", not "event"`);
		return html;
	}

	console.log('🔧 Fixing WhatsApp code in event page...');
	let fixedHtml = html;
	let fixedCount = 0;

	// 1. Remove WhatsApp floating bubble (events use RSVP instead)
	const wa1 = fixedHtml;
	fixedHtml = fixedHtml.replace(/<a[^>]*wa\.me[^>]*>[\s\S]*?<\/a>/gi, '');
	fixedHtml = fixedHtml.replace(/<!--\s*WhatsApp Floating Bubble\s*-->[\s\S]*?<\/a>/gi, '');
	if (fixedHtml !== wa1) fixedCount++;

	// 2. Remove WhatsApp JavaScript
	const wa2 = fixedHtml;
	fixedHtml = fixedHtml.replace(/const\s+whatsappUrl\s*=[\s\S]*?;/gi, '');
	fixedHtml = fixedHtml.replace(/window\.open\([^)]*wa\.me[^)]*\);?/gi, '');
	fixedHtml = fixedHtml.replace(/location\.href\s*=\s*[^;]*wa\.me[^;]*;/gi, '');
	if (fixedHtml !== wa2) fixedCount++;

	// 3. Fix RSVP form submission - inject correct handler
	const rsvpFormFix = `
<script>
// RSVP Form - API Submission (Server-Fixed)
(function() {
	document.addEventListener('DOMContentLoaded', function() {
		const rsvpForm = document.getElementById('rsvp-form');
		if (!rsvpForm) return;
		
		// Remove existing listeners by cloning
		const newForm = rsvpForm.cloneNode(true);
		rsvpForm.parentNode.replaceChild(newForm, rsvpForm);
		
		newForm.addEventListener('submit', async (e) => {
			e.preventDefault();
			e.stopPropagation();
			
			const eventId = window.location.pathname.split('/').pop().replace('.html', '').replace('_html', '');
			const userId = window.location.pathname.split('/')[2];
			
			const name = document.getElementById('rsvp-name').value;
			const phone = document.getElementById('rsvp-phone').value;
			const email = document.getElementById('rsvp-email') ? document.getElementById('rsvp-email').value : '';
			
			const statusYes = document.getElementById('rsvp-status-yes');
			const statusNo = document.getElementById('rsvp-status-no');
			const status = statusYes && statusYes.checked ? 'confirmed' : (statusNo && statusNo.checked ? 'declined' : 'confirmed');
			
			const guests = status === 'confirmed' ? (
				document.getElementById('rsvp-guests') ? parseInt(document.getElementById('rsvp-guests').value) || 1 : 
				document.getElementById('guest-count') ? parseInt(document.getElementById('guest-count').value) || 1 : 1
			) : 0;
			
			const notes = document.getElementById('rsvp-notes') ? document.getElementById('rsvp-notes').value : '';
			
			try {
				const response = await fetch('/api/rsvp', {
					method: 'POST',
					headers: {'Content-Type': 'application/json'},
					body: JSON.stringify({
						eventId, userId, name, phone, email, guests,
						status: status,
						message: notes
					})
				});
				
				if (response.ok) {
					const successDiv = document.getElementById('rsvp-success') || document.getElementById('rsvp-message');
					if (successDiv) {
						successDiv.innerHTML = '<div style="background: linear-gradient(135deg, #10b981 0%, #059669 100%); color: white; padding: 30px; border-radius: 16px; text-align: center; font-size: 24px; font-weight: bold; box-shadow: 0 10px 40px rgba(16, 185, 129, 0.3); margin: 20px 0;"><div style="font-size: 48px; margin-bottom: 10px;">✅</div>תודה רבה ' + name + '!<br>אישור ההגעה נשלח בהצלחה 🎉</div>';
						successDiv.style.display = 'block';
					}
					
					alert('✅ תודה רבה ' + name + '!\\n\\nאישור ההגעה נשלח בהצלחה 🎉');
					newForm.reset();
					
					setTimeout(() => {
						window.scrollTo({ top: 0, behavior: 'smooth' });
					}, 1500);
				} else {
					alert('אירעה שגיאה בשליחת האישור. נסה שוב.');
				}
			} catch (error) {
				console.error('RSVP Error:', error);
				alert('אירעה שגיאה בשליחת האישור. נסה שוב.');
			}
		});
	});
})();
</script>`;

	if (fixedHtml.includes('id="rsvp-form"') || fixedHtml.includes("id='rsvp-form'")) {
		if (fixedHtml.includes('</body>')) {
			fixedHtml = fixedHtml.replace('</body>', rsvpFormFix + '\n</body>');
			fixedCount++;
		} else if (fixedHtml.includes('</html>')) {
			fixedHtml = fixedHtml.replace('</html>', rsvpFormFix + '\n</html>');
			fixedCount++;
		}
	}

	// 4. Remove contact form sections (events use WhatsApp bubble instead)
	const contactFormPatterns = [
		/<section[^>]*\sid=["']contact-form["'][^>]*>[\s\S]*?<\/section>/gi,
		/<section[^>]*class=["'][^"']*contact-form[^"']*["'][^>]*>[\s\S]*?<\/section>/gi,
		/<section[^>]*>[\s\S]*?<h[1-6][^>]*>(?:צור קשר|Contact(?:\s+(?:Us|Form))?)<\/h[1-6]>[\s\S]*?<\/section>/gi
	];

	contactFormPatterns.forEach((pattern) => {
		if (fixedHtml.match(pattern)) {
			fixedHtml = fixedHtml.replace(pattern, '');
			fixedCount++;
		}
	});

	// 5. Fix countdown timer - change to 4 columns, reverse order for RTL
	if (fixedHtml.includes('id="countdown-timer"')) {
		fixedHtml = fixedHtml.replace(/grid-cols-3/gi, 'grid-cols-4');
		fixedHtml = fixedHtml.replace(
			/(<div[^>]*class="[^"]*grid[^"]*grid-cols-[^"]*"[^>]*)\s*dir="(?:ltr|rtl)"/gi,
			'$1'
		);

		const countdownFixScript = `
<script>
// Fix countdown timer - add seconds and reverse order for RTL
(function() {
	document.addEventListener('DOMContentLoaded', function() {
		const countdownSection = document.getElementById('countdown-timer');
		if (!countdownSection) return;
		
		const gridContainer = countdownSection.querySelector('.grid, [class*="grid-cols"]');
		if (!gridContainer) return;
		
		const days = document.getElementById('days');
		const hours = document.getElementById('hours');
		const minutes = document.getElementById('minutes');
		let seconds = document.getElementById('seconds');
		
		// Add seconds if missing
		if (!seconds && minutes) {
			const minutesBox = minutes.closest('.countdown-box, div[class*="countdown"]');
			if (minutesBox && minutesBox.parentElement) {
				const secondsBox = minutesBox.cloneNode(true);
				const secondsNum = secondsBox.querySelector('#minutes, [id*="minutes"]');
				const secondsLabel = secondsBox.querySelector('span');
				if (secondsNum && secondsLabel) {
					secondsNum.id = 'seconds';
					secondsNum.textContent = '00';
					secondsLabel.textContent = 'שניות';
					minutesBox.parentElement.appendChild(secondsBox);
					seconds = secondsNum;
				}
			}
		}
		
		// Reverse order for RTL: seconds → minutes → hours → days
		if (days && hours && minutes && seconds) {
			const daysBox = days.closest('.countdown-box, div[class*="countdown"]');
			const hoursBox = hours.closest('.countdown-box, div[class*="countdown"]');
			const minutesBox = minutes.closest('.countdown-box, div[class*="countdown"]');
			const secondsBox = seconds.closest('.countdown-box, div[class*="countdown"]');
			
			if (daysBox && hoursBox && minutesBox && secondsBox && gridContainer) {
				gridContainer.innerHTML = '';
				gridContainer.appendChild(secondsBox);
				gridContainer.appendChild(minutesBox);
				gridContainer.appendChild(hoursBox);
				gridContainer.appendChild(daysBox);
			}
		}
	});
})();
</script>`;

		if (fixedHtml.includes('</body>')) {
			fixedHtml = fixedHtml.replace('</body>', countdownFixScript + '\n</body>');
		}
		fixedCount++;
	}

	// 6. Add AutoPage copyright
	const copyrightText = `
<div style="text-align: center; padding: 15px 20px; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; font-size: 13px; margin-top: 30px;">
	<p style="margin: 0; font-weight: 500;">
		✨ כל הזכויות שמורות - נוצר על ידי <strong>AutoPage</strong> ✨
	</p>
	<p style="margin: 5px 0 0 0; font-size: 11px; opacity: 0.9;">
		יצירת דפי נחיתה מתקדמים בקלות | <a href="http://localhost:3002" style="color: white; text-decoration: underline;">www.autopage.co.il</a>
	</p>
</div>`;

	if (fixedHtml.includes('</body>') && !fixedHtml.includes('נוצר על ידי AutoPage')) {
		fixedHtml = fixedHtml.replace('</body>', copyrightText + '\n</body>');
		fixedCount++;
	}

	console.log(`✅ WhatsApp code fixed! (${fixedCount} changes made)`);
	return fixedHtml;
}
