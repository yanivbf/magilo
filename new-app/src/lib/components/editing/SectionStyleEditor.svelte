<script>
	/** @type {{ show: boolean, onClose: () => void, onSave: (styles: any) => void, currentStyles?: any }} */
	let { show = $bindable(false), onClose, onSave, currentStyles = {} } = $props();
	
	// Style state
	let backgroundColor = $state(currentStyles.backgroundColor || '#ffffff');
	let textColor = $state(currentStyles.textColor || '#000000');
	let fontSize = $state(currentStyles.fontSize || '16');
	let fontFamily = $state(currentStyles.fontFamily || 'inherit');
	
	// Available fonts
	const fonts = [
		{ value: 'inherit', label: 'ברירת מחדל' },
		{ value: 'Arial, sans-serif', label: 'Arial' },
		{ value: '"Heebo", sans-serif', label: 'Heebo' },
		{ value: '"Rubik", sans-serif', label: 'Rubik' },
		{ value: '"Assistant", sans-serif', label: 'Assistant' },
		{ value: '"Open Sans", sans-serif', label: 'Open Sans' },
		{ value: '"Roboto", sans-serif', label: 'Roboto' },
		{ value: 'Georgia, serif', label: 'Georgia' },
		{ value: '"Times New Roman", serif', label: 'Times New Roman' },
		{ value: '"Courier New", monospace', label: 'Courier New' }
	];
	
	function handleSave() {
		onSave({
			backgroundColor,
			textColor,
			fontSize: `${fontSize}px`,
			fontFamily
		});
		onClose();
	}
	
	function handleCancel() {
		onClose();
	}
</script>

{#if show}
	<div class="modal-overlay" onclick={handleCancel}>
		<div class="style-editor-modal" onclick={(e) => e.stopPropagation()}>
			<div class="modal-header">
				<h3 class="modal-title">🎨 עיצוב מקטע</h3>
				<button onclick={handleCancel} class="close-btn" title="סגור">×</button>
			</div>
			
			<div class="modal-content">
				<!-- Background Color -->
				<div class="form-group">
					<label for="bg-color">צבע רקע</label>
					<div class="color-input-wrapper">
						<input
							type="color"
							id="bg-color"
							bind:value={backgroundColor}
							class="color-picker"
						/>
						<input
							type="text"
							bind:value={backgroundColor}
							class="color-text"
							placeholder="#ffffff"
						/>
					</div>
				</div>
				
				<!-- Text Color -->
				<div class="form-group">
					<label for="text-color">צבע טקסט</label>
					<div class="color-input-wrapper">
						<input
							type="color"
							id="text-color"
							bind:value={textColor}
							class="color-picker"
						/>
						<input
							type="text"
							bind:value={textColor}
							class="color-text"
							placeholder="#000000"
						/>
					</div>
				</div>
				
				<!-- Font Size -->
				<div class="form-group">
					<label for="font-size">גודל טקסט (px)</label>
					<div class="range-wrapper">
						<input
							type="range"
							id="font-size"
							bind:value={fontSize}
							min="12"
							max="48"
							step="1"
							class="range-slider"
						/>
						<span class="range-value">{fontSize}px</span>
					</div>
				</div>
				
				<!-- Font Family -->
				<div class="form-group">
					<label for="font-family">פונט</label>
					<select id="font-family" bind:value={fontFamily} class="font-select">
						{#each fonts as font}
							<option value={font.value} style="font-family: {font.value}">
								{font.label}
							</option>
						{/each}
					</select>
				</div>
				
				<!-- Preview -->
				<div class="preview-section">
					<label>תצוגה מקדימה</label>
					<div 
						class="preview-box"
						style="background-color: {backgroundColor}; color: {textColor}; font-size: {fontSize}px; font-family: {fontFamily};"
					>
						<p>זהו טקסט לדוגמה</p>
						<p>This is sample text</p>
					</div>
				</div>
			</div>
			
			<div class="modal-footer">
				<button onclick={handleCancel} class="btn-cancel">ביטול</button>
				<button onclick={handleSave} class="btn-save">✅ שמור שינויים</button>
			</div>
		</div>
	</div>
{/if}

<style>
	.modal-overlay {
		position: fixed;
		inset: 0;
		background: rgba(0, 0, 0, 0.6);
		display: flex;
		align-items: center;
		justify-content: center;
		z-index: 10000;
		padding: 1rem;
		animation: fadeIn 0.2s ease;
		direction: rtl;
	}
	
	.style-editor-modal {
		background: white;
		border-radius: 20px;
		max-width: 500px;
		width: 100%;
		max-height: 90vh;
		display: flex;
		flex-direction: column;
		box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
		animation: slideUp 0.3s ease;
	}
	
	.modal-header {
		display: flex;
		justify-content: space-between;
		align-items: center;
		padding: 1.5rem;
		border-bottom: 1px solid #e5e7eb;
	}
	
	.modal-title {
		font-size: 1.5rem;
		font-weight: bold;
		margin: 0;
		background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
		-webkit-background-clip: text;
		-webkit-text-fill-color: transparent;
		background-clip: text;
	}
	
	.close-btn {
		background: none;
		border: none;
		cursor: pointer;
		color: #6b7280;
		font-size: 2rem;
		line-height: 1;
		padding: 0.5rem;
		border-radius: 8px;
		transition: all 0.2s;
		width: 40px;
		height: 40px;
		display: flex;
		align-items: center;
		justify-content: center;
	}
	
	.close-btn:hover {
		background: #f3f4f6;
		color: #1f2937;
	}
	
	.modal-content {
		flex: 1;
		overflow-y: auto;
		padding: 1.5rem;
	}
	
	.form-group {
		margin-bottom: 1.5rem;
	}
	
	.form-group label {
		display: block;
		font-weight: 600;
		margin-bottom: 0.5rem;
		color: #374151;
		font-size: 0.95rem;
	}
	
	.color-input-wrapper {
		display: flex;
		gap: 0.75rem;
		align-items: center;
	}
	
	.color-picker {
		width: 60px;
		height: 40px;
		border: 2px solid #e5e7eb;
		border-radius: 8px;
		cursor: pointer;
		transition: all 0.2s;
	}
	
	.color-picker:hover {
		border-color: #667eea;
	}
	
	.color-text {
		flex: 1;
		padding: 0.75rem;
		border: 2px solid #e5e7eb;
		border-radius: 8px;
		font-size: 0.95rem;
		transition: all 0.2s;
		font-family: monospace;
	}
	
	.color-text:focus {
		outline: none;
		border-color: #667eea;
		box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
	}
	
	.range-wrapper {
		display: flex;
		gap: 1rem;
		align-items: center;
	}
	
	.range-slider {
		flex: 1;
		height: 6px;
		border-radius: 3px;
		background: #e5e7eb;
		outline: none;
		-webkit-appearance: none;
	}
	
	.range-slider::-webkit-slider-thumb {
		-webkit-appearance: none;
		appearance: none;
		width: 20px;
		height: 20px;
		border-radius: 50%;
		background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
		cursor: pointer;
		box-shadow: 0 2px 8px rgba(102, 126, 234, 0.3);
	}
	
	.range-slider::-moz-range-thumb {
		width: 20px;
		height: 20px;
		border-radius: 50%;
		background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
		cursor: pointer;
		border: none;
		box-shadow: 0 2px 8px rgba(102, 126, 234, 0.3);
	}
	
	.range-value {
		min-width: 50px;
		text-align: center;
		font-weight: 600;
		color: #667eea;
		font-size: 1rem;
	}
	
	.font-select {
		width: 100%;
		padding: 0.75rem;
		border: 2px solid #e5e7eb;
		border-radius: 8px;
		font-size: 0.95rem;
		transition: all 0.2s;
		background: white;
		cursor: pointer;
	}
	
	.font-select:focus {
		outline: none;
		border-color: #667eea;
		box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
	}
	
	.preview-section {
		margin-top: 2rem;
		padding-top: 1.5rem;
		border-top: 1px solid #e5e7eb;
	}
	
	.preview-box {
		padding: 1.5rem;
		border-radius: 12px;
		border: 2px dashed #e5e7eb;
		margin-top: 0.75rem;
		transition: all 0.3s;
	}
	
	.preview-box p {
		margin: 0.5rem 0;
	}
	
	.modal-footer {
		display: flex;
		gap: 1rem;
		padding: 1.5rem;
		border-top: 1px solid #e5e7eb;
		background: #f9fafb;
		border-radius: 0 0 20px 20px;
	}
	
	.btn-cancel,
	.btn-save {
		flex: 1;
		padding: 0.875rem 1.5rem;
		border-radius: 12px;
		font-weight: 600;
		font-size: 1rem;
		cursor: pointer;
		transition: all 0.2s;
		border: none;
	}
	
	.btn-cancel {
		background: #f3f4f6;
		color: #6b7280;
	}
	
	.btn-cancel:hover {
		background: #e5e7eb;
		color: #374151;
	}
	
	.btn-save {
		background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
		color: white;
		box-shadow: 0 4px 15px rgba(102, 126, 234, 0.3);
	}
	
	.btn-save:hover {
		transform: translateY(-2px);
		box-shadow: 0 6px 20px rgba(102, 126, 234, 0.4);
	}
	
	@keyframes fadeIn {
		from {
			opacity: 0;
		}
		to {
			opacity: 1;
		}
	}
	
	@keyframes slideUp {
		from {
			opacity: 0;
			transform: translateY(30px);
		}
		to {
			opacity: 1;
			transform: translateY(0);
		}
	}
</style>
