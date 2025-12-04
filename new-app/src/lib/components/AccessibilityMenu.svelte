<script>
	let isOpen = $state(false);
	let fontSize = $state(100);
	let contrast = $state('normal');
	let cursorSize = $state('normal');
	let lineHeight = $state(1.5);
	let letterSpacing = $state(0);
	
	function toggleMenu() {
		isOpen = !isOpen;
	}
	
	function increaseFontSize() {
		fontSize = Math.min(fontSize + 10, 200);
		applyFontSize();
	}
	
	function decreaseFontSize() {
		fontSize = Math.max(fontSize - 10, 80);
		applyFontSize();
	}
	
	function applyFontSize() {
		document.documentElement.style.fontSize = `${fontSize}%`;
	}
	
	function toggleContrast() {
		if (contrast === 'normal') {
			contrast = 'high';
			document.body.classList.add('high-contrast');
		} else {
			contrast = 'normal';
			document.body.classList.remove('high-contrast');
		}
	}
	
	function toggleCursor() {
		if (cursorSize === 'normal') {
			cursorSize = 'large';
			document.body.classList.add('large-cursor');
		} else {
			cursorSize = 'normal';
			document.body.classList.remove('large-cursor');
		}
	}
	
	function increaseLineHeight() {
		lineHeight = Math.min(lineHeight + 0.2, 2.5);
		document.body.style.lineHeight = lineHeight;
	}
	
	function decreaseLineHeight() {
		lineHeight = Math.max(lineHeight - 0.2, 1.2);
		document.body.style.lineHeight = lineHeight;
	}
	
	function increaseLetterSpacing() {
		letterSpacing = Math.min(letterSpacing + 1, 5);
		document.body.style.letterSpacing = `${letterSpacing}px`;
	}
	
	function decreaseLetterSpacing() {
		letterSpacing = Math.max(letterSpacing - 1, 0);
		document.body.style.letterSpacing = `${letterSpacing}px`;
	}
	
	function resetAll() {
		fontSize = 100;
		contrast = 'normal';
		cursorSize = 'normal';
		lineHeight = 1.5;
		letterSpacing = 0;
		
		document.documentElement.style.fontSize = '100%';
		document.body.classList.remove('high-contrast', 'large-cursor');
		document.body.style.lineHeight = '1.5';
		document.body.style.letterSpacing = '0';
	}
</script>

<!-- Accessibility Button -->
<button 
	class="accessibility-btn" 
	onclick={toggleMenu}
	aria-label="תפריט נגישות"
	title="נגישות"
>
	<svg viewBox="0 0 24 24" fill="currentColor">
		<path d="M12 2a2 2 0 1 0 0 4 2 2 0 0 0 0-4zM21 9h-6V7h-2v2H7V7H5v2H3v2h2v2H3v2h2v2H3v2h2v-2h6v2h2v-2h6v2h2v-2h-2v-2h2v-2h-2v-2h2V9zm-8 6h-2v-2h2v2zm0-4h-2v-2h2v2z"/>
	</svg>
</button>

<!-- Accessibility Menu -->
{#if isOpen}
	<div class="accessibility-menu">
		<div class="menu-header">
			<h3>תפריט נגישות</h3>
			<button class="close-btn" onclick={toggleMenu} aria-label="סגור">✕</button>
		</div>
		
		<div class="menu-content">
			<!-- Font Size -->
			<div class="control-group">
				<label>גודל טקסט</label>
				<div class="control-buttons">
					<button onclick={decreaseFontSize} aria-label="הקטן טקסט">A-</button>
					<span>{fontSize}%</span>
					<button onclick={increaseFontSize} aria-label="הגדל טקסט">A+</button>
				</div>
			</div>
			
			<!-- Contrast -->
			<div class="control-group">
				<label>ניגודיות</label>
				<button class="toggle-btn" onclick={toggleContrast}>
					{contrast === 'normal' ? 'ניגודיות גבוהה' : 'ניגודיות רגילה'}
				</button>
			</div>
			
			<!-- Cursor Size -->
			<div class="control-group">
				<label>גודל סמן</label>
				<button class="toggle-btn" onclick={toggleCursor}>
					{cursorSize === 'normal' ? 'סמן גדול' : 'סמן רגיל'}
				</button>
			</div>
			
			<!-- Line Height -->
			<div class="control-group">
				<label>גובה שורה</label>
				<div class="control-buttons">
					<button onclick={decreaseLineHeight}>-</button>
					<span>{lineHeight.toFixed(1)}</span>
					<button onclick={increaseLineHeight}>+</button>
				</div>
			</div>
			
			<!-- Letter Spacing -->
			<div class="control-group">
				<label>ריווח אותיות</label>
				<div class="control-buttons">
					<button onclick={decreaseLetterSpacing}>-</button>
					<span>{letterSpacing}px</span>
					<button onclick={increaseLetterSpacing}>+</button>
				</div>
			</div>
			
			<!-- Reset -->
			<button class="reset-btn" onclick={resetAll}>
				איפוס הגדרות
			</button>
		</div>
	</div>
{/if}

<style>
	.accessibility-btn {
		position: fixed;
		bottom: 240px;
		right: 30px;
		width: 60px;
		height: 60px;
		background: #4A90E2;
		border: none;
		border-radius: 50%;
		display: flex;
		align-items: center;
		justify-content: center;
		box-shadow: 0 4px 20px rgba(74, 144, 226, 0.4);
		cursor: pointer;
		z-index: 9997;
		transition: all 0.3s ease;
	}
	
	.accessibility-btn:hover {
		transform: scale(1.1);
		box-shadow: 0 6px 30px rgba(74, 144, 226, 0.6);
	}
	
	.accessibility-btn svg {
		width: 32px;
		height: 32px;
		color: white;
	}
	
	.accessibility-menu {
		position: fixed;
		bottom: 310px;
		right: 30px;
		width: 320px;
		background: white;
		border-radius: 16px;
		box-shadow: 0 10px 40px rgba(0, 0, 0, 0.2);
		z-index: 9998;
		animation: slideUp 0.3s ease-out;
	}
	
	@keyframes slideUp {
		from {
			opacity: 0;
			transform: translateY(20px);
		}
		to {
			opacity: 1;
			transform: translateY(0);
		}
	}
	
	.menu-header {
		display: flex;
		justify-content: space-between;
		align-items: center;
		padding: 1.5rem;
		border-bottom: 1px solid #e5e7eb;
	}
	
	.menu-header h3 {
		margin: 0;
		font-size: 1.25rem;
		font-weight: 700;
		color: #1f2937;
	}
	
	.close-btn {
		background: none;
		border: none;
		font-size: 1.5rem;
		color: #6b7280;
		cursor: pointer;
		padding: 0;
		width: 30px;
		height: 30px;
		display: flex;
		align-items: center;
		justify-content: center;
		border-radius: 50%;
		transition: all 0.2s;
	}
	
	.close-btn:hover {
		background: #f3f4f6;
		color: #1f2937;
	}
	
	.menu-content {
		padding: 1.5rem;
		max-height: 400px;
		overflow-y: auto;
	}
	
	.control-group {
		margin-bottom: 1.5rem;
	}
	
	.control-group label {
		display: block;
		font-weight: 600;
		color: #374151;
		margin-bottom: 0.5rem;
		font-size: 0.95rem;
	}
	
	.control-buttons {
		display: flex;
		align-items: center;
		gap: 1rem;
		justify-content: space-between;
	}
	
	.control-buttons button {
		flex: 1;
		padding: 0.75rem;
		background: #f3f4f6;
		border: none;
		border-radius: 8px;
		font-weight: 600;
		cursor: pointer;
		transition: all 0.2s;
	}
	
	.control-buttons button:hover {
		background: #e5e7eb;
	}
	
	.control-buttons span {
		flex: 1;
		text-align: center;
		font-weight: 600;
		color: #4A90E2;
	}
	
	.toggle-btn {
		width: 100%;
		padding: 0.75rem;
		background: #4A90E2;
		color: white;
		border: none;
		border-radius: 8px;
		font-weight: 600;
		cursor: pointer;
		transition: all 0.2s;
	}
	
	.toggle-btn:hover {
		background: #357ABD;
	}
	
	.reset-btn {
		width: 100%;
		padding: 0.75rem;
		background: #ef4444;
		color: white;
		border: none;
		border-radius: 8px;
		font-weight: 600;
		cursor: pointer;
		transition: all 0.2s;
		margin-top: 1rem;
	}
	
	.reset-btn:hover {
		background: #dc2626;
	}
	
	:global(body.high-contrast) {
		filter: contrast(1.5);
	}
	
	:global(body.large-cursor) {
		cursor: url('data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="32" height="32"><circle cx="16" cy="16" r="10" fill="black"/></svg>') 16 16, auto;
	}
	
	@media (max-width: 768px) {
		.accessibility-menu {
			width: calc(100vw - 40px);
			right: 20px;
			bottom: 310px;
			max-height: 350px;
		}
		
		.accessibility-btn {
			right: 20px;
			bottom: 240px;
		}
		
		.menu-content {
			max-height: 250px;
		}
	}
</style>
