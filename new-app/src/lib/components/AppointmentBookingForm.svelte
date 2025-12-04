<script>
	let { pageId, services = [] } = $props();

	let formData = $state({
		customerName: '',
		customerPhone: '',
		date: '',
		time: '',
		service: '',
		notes: ''
	});

	let loading = $state(false);
	let success = $state(false);
	let error = $state('');

	async function submitAppointment() {
		// Reset states
		success = false;
		error = '';

		// Validate required fields
		if (!formData.customerName || !formData.customerPhone || !formData.date || !formData.time || !formData.service) {
			error = 'נא למלא את כל השדות הנדרשים';
			return;
		}

		loading = true;

		try {
			const response = await fetch('/api/appointments', {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json'
				},
				body: JSON.stringify({
					pageId,
					...formData
				})
			});

			const result = await response.json();

			if (!response.ok) {
				error = result.error?.message || 'שגיאה ביצירת התור';
				return;
			}

			// Success!
			success = true;
			// Reset form
			formData = {
				customerName: '',
				customerPhone: '',
				date: '',
				time: '',
				service: '',
				notes: ''
			};
		} catch (err) {
			console.error('Error submitting appointment:', err);
			error = 'שגיאה בשליחת הטופס. נסה שוב.';
		} finally {
			loading = false;
		}
	}
</script>

<div class="appointment-form">
	<h2>קביעת תור</h2>

	{#if success}
		<div class="success-message">
			<p>✅ התור נקבע בהצלחה!</p>
			<p>ניצור איתך קשר בהקדם לאישור.</p>
		</div>
	{/if}

	{#if error}
		<div class="error-message">
			<p>❌ {error}</p>
		</div>
	{/if}

	<form on:submit|preventDefault={submitAppointment}>
		<div class="form-group">
			<label for="customerName">שם מלא *</label>
			<input
				type="text"
				id="customerName"
				bind:value={formData.customerName}
				required
				placeholder="הכנס את שמך המלא"
			/>
		</div>

		<div class="form-group">
			<label for="customerPhone">טלפון *</label>
			<input
				type="tel"
				id="customerPhone"
				bind:value={formData.customerPhone}
				required
				placeholder="050-1234567"
			/>
		</div>

		<div class="form-row">
			<div class="form-group">
				<label for="date">תאריך *</label>
				<input
					type="date"
					id="date"
					bind:value={formData.date}
					required
				/>
			</div>

			<div class="form-group">
				<label for="time">שעה *</label>
				<input
					type="time"
					id="time"
					bind:value={formData.time}
					required
				/>
			</div>
		</div>

		<div class="form-group">
			<label for="service">סוג שירות *</label>
			{#if services.length > 0}
				<select id="service" bind:value={formData.service} required>
					<option value="">בחר שירות</option>
					{#each services as service}
						<option value={service.name}>{service.name} - ₪{service.price}</option>
					{/each}
				</select>
			{:else}
				<input
					type="text"
					id="service"
					bind:value={formData.service}
					required
					placeholder="הכנס סוג שירות"
				/>
			{/if}
		</div>

		<div class="form-group">
			<label for="notes">הערות</label>
			<textarea
				id="notes"
				bind:value={formData.notes}
				rows="3"
				placeholder="הערות נוספות (אופציונלי)"
			></textarea>
		</div>

		<button type="submit" disabled={loading} class="submit-btn">
			{loading ? 'שולח...' : 'קבע תור'}
		</button>
	</form>
</div>

<style>
	.appointment-form {
		max-width: 600px;
		margin: 2rem auto;
		padding: 2rem;
		background: white;
		border-radius: 12px;
		box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
	}

	h2 {
		text-align: center;
		color: #2c3e50;
		margin-bottom: 1.5rem;
	}

	.success-message {
		background: #d4edda;
		border: 1px solid #c3e6cb;
		color: #155724;
		padding: 1rem;
		border-radius: 8px;
		margin-bottom: 1rem;
		text-align: center;
	}

	.error-message {
		background: #f8d7da;
		border: 1px solid #f5c6cb;
		color: #721c24;
		padding: 1rem;
		border-radius: 8px;
		margin-bottom: 1rem;
		text-align: center;
	}

	.form-group {
		margin-bottom: 1.5rem;
	}

	.form-row {
		display: grid;
		grid-template-columns: 1fr 1fr;
		gap: 1rem;
	}

	label {
		display: block;
		margin-bottom: 0.5rem;
		font-weight: 500;
		color: #2c3e50;
	}

	input,
	select,
	textarea {
		width: 100%;
		padding: 0.75rem;
		border: 1px solid #ddd;
		border-radius: 8px;
		font-size: 1rem;
		font-family: inherit;
		transition: border-color 0.3s;
	}

	input:focus,
	select:focus,
	textarea:focus {
		outline: none;
		border-color: #3498db;
	}

	textarea {
		resize: vertical;
	}

	.submit-btn {
		width: 100%;
		padding: 1rem;
		background: #3498db;
		color: white;
		border: none;
		border-radius: 8px;
		font-size: 1.1rem;
		font-weight: 600;
		cursor: pointer;
		transition: background 0.3s;
	}

	.submit-btn:hover:not(:disabled) {
		background: #2980b9;
	}

	.submit-btn:disabled {
		background: #95a5a6;
		cursor: not-allowed;
	}

	@media (max-width: 768px) {
		.appointment-form {
			padding: 1.5rem;
			margin: 1rem;
		}

		.form-row {
			grid-template-columns: 1fr;
		}
	}
</style>
