// @ts-check
import { json } from '@sveltejs/kit';

/**
 * POST /api/generate-html
 * Generate complete HTML page from template data or quick prompt
 * @type {import('./$types').RequestHandler}
 */
export async function POST({ request }) {
	try {
		const body = await request.json();
		
		console.log('🎨 GENERATE HTML REQUEST:', JSON.stringify(body).substring(0, 200));

		// Check if this is a quick HTML generation request
		if (body.prompt) {
			const html = generateQuickHTML(body.prompt);
			return json({ success: true, html });
		}

		// This endpoint is used by the legacy page-creator
		// It should generate a complete HTML page with all features
		
		// For now, redirect to the new create-page-with-template endpoint
		const response = await fetch('http://localhost:3000/api/create-page-with-template', {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json'
			},
			body: JSON.stringify(body)
		});

		const result = await response.json();
		
		return json(result);

	} catch (error) {
		console.error('❌ Error generating HTML:', error);
		const err = /** @type {Error} */ (error);
		return json(
			{ 
				success: false,
				error: err.message || 'Failed to generate HTML' 
			},
			{ status: 500 }
		);
	}
}

/**
 * Generate quick HTML from a text prompt
 * @param {string} prompt
 * @returns {string}
 */
function generateQuickHTML(prompt) {
	const title = extractTitle(prompt) || 'דף חדש';
	const content = generateContentFromPrompt(prompt);
	
	return `<!DOCTYPE html>
<html lang="he" dir="rtl">
<head>
	<meta charset="UTF-8">
	<meta name="viewport" content="width=device-width, initial-scale=1.0">
	<title>${title}</title>
	<style>
		* { margin: 0; padding: 0; box-sizing: border-box; }
		body {
			font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
			line-height: 1.6;
			color: #333;
			background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
			min-height: 100vh;
			padding: 20px;
		}
		.container {
			max-width: 1200px;
			margin: 0 auto;
			background: white;
			border-radius: 20px;
			box-shadow: 0 20px 60px rgba(0,0,0,0.3);
			overflow: hidden;
		}
		.header {
			background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
			color: white;
			padding: 60px 40px;
			text-align: center;
		}
		.header h1 {
			font-size: 3em;
			margin-bottom: 20px;
			text-shadow: 2px 2px 4px rgba(0,0,0,0.2);
		}
		.content { padding: 60px 40px; }
		.section { margin-bottom: 40px; }
		.section h2 {
			color: #667eea;
			font-size: 2em;
			margin-bottom: 20px;
			border-bottom: 3px solid #667eea;
			padding-bottom: 10px;
		}
		.cta-button {
			display: inline-block;
			background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
			color: white;
			padding: 18px 40px;
			text-decoration: none;
			border-radius: 50px;
			font-size: 1.2em;
			font-weight: bold;
			transition: transform 0.3s;
		}
		.cta-button:hover { transform: translateY(-3px); }
		.features {
			display: grid;
			grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
			gap: 30px;
			margin-top: 40px;
		}
		.feature {
			background: #f8f9fa;
			padding: 30px;
			border-radius: 15px;
			text-align: center;
		}
		.feature-icon { font-size: 3em; margin-bottom: 15px; }
		.footer {
			background: #2d3748;
			color: white;
			padding: 40px;
			text-align: center;
		}
	</style>
</head>
<body>
	<div class="container">
		<div class="header">
			<h1>${title}</h1>
			<p>${content.subtitle}</p>
		</div>
		<div class="content">
			${content.sections.map(s => `
				<div class="section">
					<h2>${s.title}</h2>
					<p>${s.content}</p>
				</div>
			`).join('')}
			${content.features.length > 0 ? `
				<div class="features">
					${content.features.map(f => `
						<div class="feature">
							<div class="feature-icon">${f.icon}</div>
							<h3>${f.title}</h3>
							<p>${f.description}</p>
						</div>
					`).join('')}
				</div>
			` : ''}
			<div style="text-align: center; margin-top: 60px;">
				<a href="#contact" class="cta-button">${content.ctaText}</a>
			</div>
		</div>
		<div class="footer">
			<p>© ${new Date().getFullYear()} ${title}. כל הזכויות שמורות.</p>
		</div>
	</div>
</body>
</html>`;
}

/**
 * @param {string} prompt
 * @returns {string}
 */
function extractTitle(prompt) {
	const titlePatterns = [
		/דף (.*?) עם/i,
		/דף (.*?)$/i,
		/^(.*?) -/,
		/^(.*?)\./
	];
	
	for (const pattern of titlePatterns) {
		const match = prompt.match(pattern);
		if (match) return match[1].trim();
	}
	
	if (prompt.includes('מוצר')) return 'המוצר שלנו';
	if (prompt.includes('שירות')) return 'השירות שלנו';
	if (prompt.includes('אירוע')) return 'האירוע שלנו';
	
	return 'ברוכים הבאים';
}

/**
 * @param {string} prompt
 */
function generateContentFromPrompt(prompt) {
	const content = {
		subtitle: 'פתרון מושלם עבורך',
		sections: /** @type {Array<{title: string, content: string}>} */ ([]),
		features: /** @type {Array<{icon: string, title: string, description: string}>} */ ([]),
		ctaText: 'צור קשר'
	};
	
	if (prompt.includes('מוצר')) {
		content.subtitle = 'המוצר המושלם שחיפשת';
		content.ctaText = 'קנה עכשיו';
	} else if (prompt.includes('שירות')) {
		content.subtitle = 'שירות מקצועי ואיכותי';
		content.ctaText = 'הזמן שירות';
	}
	
	content.sections.push({
		title: 'אודות',
		content: prompt + ' - אנחנו מציעים פתרון מקצועי ואיכותי שיענה על כל הצרכים שלך.'
	});
	
	if (prompt.includes('מוצר')) {
		content.features = [
			{ icon: '🎯', title: 'איכות גבוהה', description: 'מוצרים באיכות פרימיום' },
			{ icon: '🚚', title: 'משלוח מהיר', description: 'משלוח עד הבית' },
			{ icon: '💰', title: 'מחיר הוגן', description: 'המחירים הטובים ביותר' }
		];
	} else if (prompt.includes('שירות')) {
		content.features = [
			{ icon: '⭐', title: 'מקצועיות', description: 'צוות מנוסה' },
			{ icon: '⚡', title: 'זמינות', description: 'זמינים 24/7' },
			{ icon: '✅', title: 'אמינות', description: 'שירות אמין' }
		];
	}
	
	return content;
}
