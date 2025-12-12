<script>
	import { getContext, onMount } from 'svelte';
	import EditableText from '$lib/components/editing/EditableText.svelte';
	
	/** @type {{ data: { title?: string, subtitle?: string, businessName?: string, businessPhone?: string, workingHours?: string, workingDays?: string }, sectionIndex?: number, editable?: boolean }} */
	let { data, sectionIndex = 0, editable = false } = $props();
	
	// Get context
	const editModeGetter = getContext('editMode');
	const pageId = getContext('pageId');
	const saveField = getContext('saveField');
	
	// Get the actual editMode value
	let editMode = $derived(typeof editModeGetter === 'function' ? editModeGetter() : editModeGetter);
	
	// Form state
	let formData = $state({
		customerName: '',
		customerPhone: '',
		preferredDate: '',
		preferredTime: '',
		serviceType: '',
		notes: ''
	});
	
	let isSubmitting = $state(false);
	let showSuccess = $state(false);
	let showError = $state(false);
	let errorMessage = $state('');
	
	// Available time slots
	const timeSlots = [
		'08:00', '09:00', '10:00', '11:00', '12:00',
		'13:00', '14:00', '15:00', '16:00', '17:00', '18:00'
	];
	
	// Set minimum date to today
	onMount(() => {
		const today = new Date().toISOString().split('T')[0];
		const dateInput = document.getElementById('preferredDate');
		if (dateInput) {
			dateInput.min = today;
		}
	});
	
	async function submitAppointment() {
		// Validate required fields
		if (!formData.customerName || !formData.customerPhone) {
			showError = true;
			errorMessage = 'נא למלא שם וטלפון';
			return;
		}
		
		isSubmitting = true;
		showError = false;
		showSuccess = false;
		
		try {
			const response = await fetch('/api/appointments', {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
				},
				body: JSON.stringify({
					pageId: pageId,
					customerName: formData.customerName,
					customerPhone: formData.customerPhone,
					date: formData.preferredDate,
					time: formData.preferredTime,
					service: formData.serviceType,
					notes: formData.notes,
					businessName: data.businessName || 'נותן שירות',
					businessPhone: data.businessPhone || '',
					status: 'pending'
				})
			});
			
			if (response.ok) {
				showSuccess = true;
				// Reset form
				formData = {
					customerName: '',
					customerPhone: '',
					preferredDate: '',
					preferredTime: '',
					serviceType: '',
					notes: ''
				};
				
				// Scroll to success message
				setTimeout(() => {
					const successEl = document.getElementById('successMessage');
					if (successEl) {
						successEl.scrollIntoView({ behavior: 'smooth', block: 'center' });
					}
				}, 100);
			} else {
				throw new Error('Server error');
			}
		} catch (error) {
			console.error('Error:', error);
			showError = true;
			errorMessage = 'אירעה שגיאה. אנא נסה שוב או התקשר אלינו ישירות.';
		} finally {
			isSubmitting = false;
		}
	}
	
	function showNotification(message) {
		const notification = document.createElement('div');
		notification.className = 'appointment-notification';
		notification.textContent = message;
		document.body.appendChild(notification);
		
		setTimeout(() => {
			notification.classList.add('show');
		}, 10);
		
		setTimeout(() => {
			notification.classList.remove('show');
			setTimeout(() => {
				notification.remove();
			}, 300);
		}, 3000);
	}
</script>

<section class="appointment-section">
	<div class="container">
		{#if editMode}
			<EditableText
				value={data.title || '📅 קביעת תור'}
				onsave={(value) => saveField(`sections.${sectionIndex}.data.title`, value)}
				class="section-title"
				tag="h2"
			/>
		{:else}
			<h2 class="section-title">{data.title || '📅 קביעת תור'}</h2>
		{/if}
		
		{#if data.subtitle || editMode}
			{#if editMode}
				<EditableText
					value={data.subtitle || 'קבע תור בקלות ונוחות'}
					onsave={(value) => saveField(`sections.${sectionIndex}.data.subtitle`, value)}
					class="section-subtitle"
					tag="p"
				/>
			{:else if data.subtitle}
				<p class="section-subtitle">{data.subtitle}</p>
			{/if}
		{/if}
		
		<div class="appointment-container">
			<!-- Business Hours Info -->
			{#if data.workingHours || editMode}
				<div class="business-hours">
					<h3 class="hours-title">🕐 שעות עבודה</h3>
					{#if editMode}
						<EditableText
							value={data.workingHours || 'ראשון-חמישי: 08:00-17:00'}
							onsave={(value) => saveField(`sections.${sectionIndex}.data.workingHours`, value)}
							class="hours-text"
							tag="div"
						/>
					{:else if data.workingHours}
						<div class="hours-text">{data.workingHours}</div>
					{/if}
				</div>
			{/if}
			
			<!-- Success Message -->
			{#if showSuccess}
				<div class="success-message" id="successMessage">
					✅ התור נקבע בהצלחה! נחזור אליך בהקדם לאישור.
				</div>
			{/if}
			
			<!-- Error Message -->
			{#if showError}
				<div class="error-message">
					❌ {errorMessage}
				</div>
			{/if}
			
			<!-- Loading -->
			{#if isSubmitting}
				<div class="loading">
					<div class="spinner"></div>
					<div>שולח בקשה...</div>
				</div>
			{/if}
			
			<!-- Appointment Form -->
			<form class="appointment-form" on:submit|preventDefault={submitAppointment}>
				<div class="form-row">
					<div class="form-group">
						<label for="customerName">שם מלא *</label>
						<input
							type="text"
							id="customerName"
							bind:value={formData.customerName}
							placeholder="הזן את שמך המלא"
							required
						/>
					</div>
					<div class="form-group">
						<label for="customerPhone">טלפון *</label>
						<input
							type="tel"
							id="customerPhone"
							bind:value={formData.customerPhone}
							placeholder="050-1234567"
							required
						/>
					</div>
				</div>
				
				<div class="form-row">
					<div class="form-group">
						<label for="preferredDate">תאריך מועדף</label>
						<input
							type="date"
							id="preferredDate"
							bind:value={formData.preferredDate}
						/>
					</div>
					<div class="form-group">
						<label for="preferredTime">שעה מועדפת</label>
						<select id="preferredTime" bind:value={formData.preferredTime}>
							<option value="">בחר שעה</option>
							{#each timeSlots as time}
								<option value={time}>{time}</option>
							{/each}
						</select>
					</div>
				</div>
				
				<div class="form-group">
					<label for="serviceType">סוג השירות</label>
					<input
						type="text"
						id="serviceType"
						bind:value={formData.serviceType}
						placeholder="לדוגמה: תיקון, בדיקה, התקנה..."
					/>
				</div>
				
				<div class="form-group">
					<label for="notes">הערות נוספות</label>
					<textarea
						id="notes"
						bind:value={formData.notes}
						placeholder="פרט על הבעיה או השירות הנדרש..."
						rows="4"
					></textarea>
				</div>
				
				<button type="submit" class="submit-btn" disabled={isSubmitting}>
					{#if isSubmitting}
						<span class="loading-spinner"></span>
						<span>שולח...</span>
					{:else}
						📅 קבע תור
					{/if}
				</button>
			</form>
		</div>
	</div>
</section>

<style>
	.appointment-section {
		padding: 3rem 0;
		background-color: transparent !important;
		direction: rtl;
	}
	
	.container {
		max-width: 800px;
		margin: 0 auto;
		padding: 0 1.5rem;
	}
	
	.section-title {
		text-align: center;
		font-size: 3rem;
		font-weight: 800;
		margin-bottom: 1rem;
	}
	
	.section-subtitle {
		text-align: center;
		font-size: 1.1rem;
		margin-bottom: 3rem;
		opacity: 0.8;
	}
	
	.appointment-container {
		background: white;
		border-radius: 20px;
		padding: 2.5rem;
		box-shadow: 0 10px 40px rgba(0,0,0,0.1);
		border: 1px solid rgba(0,0,0,0.05);
	}
	
	.business-hours {
		background: linear-gradient(135deg, #f8f9ff 0%, #e8f2ff 100%);
		padding: 1.5rem;
		border-radius: 12px;
		margin-bottom: 2rem;
		border: 1px solid rgba(102, 126, 234, 0.1);
	}
	
	.hours-title {
		margin: 0 0 0.5rem 0;
		color: #667eea;
		font-size: 1.2rem;
		font-weight: 700;
	}
	
	.hours-text {
		font-size: 1rem;
		color: #4a5568;
		line-height: 1.6;
	}
	
	.success-message {
		background: linear-gradient(135deg, #d4edda 0%, #c3e6cb 100%);
		color: #155724;
		padding: 1.5rem;
		border-radius: 12px;
		margin-bottom: 2rem;
		border: 1px solid #c3e6cb;
		font-weight: 600;
		text-align: center;
		animation: slideIn 0.5s ease;
	}
	
	.error-message {
		background: linear-gradient(135deg, #f8d7da 0%, #f5c6cb 100%);
		color: #721c24;
		padding: 1.5rem;
		border-radius: 12px;
		margin-bottom: 2rem;
		border: 1px solid #f5c6cb;
		font-weight: 600;
		text-align: center;
		animation: slideIn 0.5s ease;
	}
	
	.loading {
		text-align: center;
		padding: 2rem;
		color: #667eea;
		font-weight: 600;
	}
	
	.spinner {
		border: 4px solid #f3f3f3;
		border-top: 4px solid #667eea;
		border-radius: 50%;
		width: 40px;
		height: 40px;
		animation: spin 1s linear infinite;
		margin: 0 auto 1rem;
	}
	
	.appointment-form {
		display: flex;
		flex-direction: column;
		gap: 1.5rem;
	}
	
	.form-row {
		display: grid;
		grid-template-columns: 1fr 1fr;
		gap: 1.5rem;
	}
	
	.form-group {
		display: flex;
		flex-direction: column;
		gap: 0.5rem;
	}
	
	.form-group label {
		font-weight: 700;
		color: #2d3748;
		font-size: 1rem;
	}
	
	.form-group input,
	.form-group select,
	.form-group textarea {
		padding: 1rem;
		border: 2px solid #e2e8f0;
		border-radius: 12px;
		font-size: 1rem;
		transition: all 0.3s ease;
		font-family: inherit;
		background: white;
	}
	
	.form-group input:focus,
	.form-group select:focus,
	.form-group textarea:focus {
		outline: none;
		border-color: #667eea;
		box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
		transform: translateY(-2px);
	}
	
	.form-group textarea {
		resize: vertical;
		min-height: 100px;
	}
	
	.submit-btn {
		background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
		color: white;
		padding: 1.2rem 2rem;
		border: none;
		border-radius: 12px;
		font-size: 1.2rem;
		font-weight: 700;
		cursor: pointer;
		transition: all 0.3s ease;
		margin-top: 1rem;
		display: flex;
		align-items: center;
		justify-content: center;
		gap: 0.5rem;
		box-shadow: 0 4px 15px rgba(102, 126, 234, 0.3);
	}
	
	.submit-btn:hover:not(:disabled) {
		transform: translateY(-2px);
		box-shadow: 0 8px 25px rgba(102, 126, 234, 0.4);
	}
	
	.submit-btn:disabled {
		opacity: 0.7;
		cursor: not-allowed;
		transform: none;
	}
	
	.loading-spinner {
		width: 20px;
		height: 20px;
		border: 3px solid rgba(255, 255, 255, 0.3);
		border-top-color: white;
		border-radius: 50%;
		animation: spin 0.8s linear infinite;
	}
	
	@keyframes spin {
		to {
			transform: rotate(360deg);
		}
	}
	
	@keyframes slideIn {
		from {
			opacity: 0;
			transform: translateY(-20px);
		}
		to {
			opacity: 1;
			transform: translateY(0);
		}
	}
	
	/* Notification */
	:global(.appointment-notification) {
		position: fixed;
		top: 30px;
		left: 50%;
		transform: translateX(-50%) translateY(-100px);
		background: rgba(34, 197, 94, 0.95);
		color: white;
		padding: 1rem 2rem;
		border-radius: 50px;
		font-weight: 600;
		box-shadow: 0 4px 20px rgba(34, 197, 94, 0.3);
		z-index: 10001;
		opacity: 0;
		transition: all 0.3s ease;
		direction: rtl;
	}
	
	:global(.appointment-notification.show) {
		opacity: 1;
		transform: translateX(-50%) translateY(0);
	}
	
	@media (max-width: 768px) {
		.appointment-container {
			padding: 1.5rem;
		}
		
		.section-title {
			font-size: 2rem;
		}
		
		.form-row {
			grid-template-columns: 1fr;
		}
		
		.business-hours {
			padding: 1rem;
		}
	}
</style>