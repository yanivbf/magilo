<!-- Appointment/Queue Management - EXACT Legacy Port from appointments-manager.html -->
<script>
	import { onMount } from 'svelte';
	import { browser } from '$app/environment';
	
	let { data } = $props();
	
	// State
	let selectedDate = $state(new Date());
	let currentWeekStart = $state(new Date());
	let appointments = $state([]);
	let breaks = $state([]);
	let workingHours = $state({ start: '09:00', end: '17:00' });
	let specialHours = $state({}); // { 'YYYY-MM-DD': { start: 'HH:MM', end: 'HH:MM' } }
	let pageInfo = $state({});
	
	// Form inputs
	let workStart = $state('09:00');
	let workEnd = $state('17:00');
	let specialStart = $state('');
	let specialEnd = $state('');
	let breakStart = $state('');
	let breakEnd = $state('');
	
	// Statistics
	let totalAppointments = $derived(appointments.length);
	let todayAppointments = $derived(() => {
		const today = new Date().toISOString().split('T')[0];
		return appointments.filter(a => a.date === today).length;
	});
	let confirmedAppointments = $derived(appointments.filter(a => a.status === 'confirmed').length);
	let pendingAppointments = $derived(appointments.filter(a => a.status === 'pending').length);
	
	// Calendar
	let weekDays = $derived(() => {
		const days = [];
		for (let i = 0; i < 7; i++) {
			const date = new Date(currentWeekStart);
			date.setDate(currentWeekStart.getDate() + i);
			days.push(date);
		}
		return days;
	});
	
	let currentWeekDisplay = $derived(() => {
		const days = weekDays();
		const weekStart = days[0].toLocaleDateString('he-IL', { day: 'numeric', month: 'short' });
		const weekEnd = days[6].toLocaleDateString('he-IL', { day: 'numeric', month: 'short' });
		return `${weekStart} - ${weekEnd}`;
	});
	
	let selectedDateDisplay = $derived(() => {
		return selectedDate.toLocaleDateString('he-IL', { 
			weekday: 'long', 
			year: 'numeric', 
			month: 'long', 
			day: 'numeric' 
		});
	});
	
	// Time slots
	let timeSlots = $derived(() => {
		const dateStr = selectedDate.toISOString().split('T')[0];
		const hours = specialHours[dateStr] || workingHours;
		const [startHour, startMin] = hours.start.split(':').map(Number);
		const [endHour, endMin] = hours.end.split(':').map(Number);
		const dayAppointments = appointments.filter(a => a.date === dateStr);
		const slots = [];
		
		for (let hour = startHour; hour < endHour; hour++) {
			for (let min = 0; min < 60; min += 30) {
				const timeStr = `${hour.toString().padStart(2, '0')}:${min.toString().padStart(2, '0')}`;
				
				// Check if time is in break
				const isBreak = breaks.some(b => {
					const breakDate = new Date(b.date);
					return breakDate.toDateString() === selectedDate.toDateString() &&
						   timeStr >= b.start && timeStr < b.end;
				});
				
				// Check if time is booked
				const isBooked = dayAppointments.some(a => a.time === timeStr);
				const appointment = dayAppointments.find(a => a.time === timeStr);
				
				slots.push({
					time: timeStr,
					isBreak,
					isBooked,
					appointment
				});
			}
		}
		
		return slots;
	});
	
	// Day appointments
	let dayAppointments = $derived(() => {
		const dateStr = selectedDate.toISOString().split('T')[0];
		return appointments.filter(a => a.date === dateStr).sort((a, b) => a.time.localeCompare(b.time));
	});
	
	// Day breaks
	let dayBreaks = $derived(() => {
		const dateStr = selectedDate.toISOString().split('T')[0];
		return breaks.filter(b => new Date(b.date).toISOString().split('T')[0] === dateStr);
	});
	
	// Special hours display
	let specialHoursDisplay = $derived(() => {
		const dateStr = selectedDate.toISOString().split('T')[0];
		if (specialHours[dateStr]) {
			const { start, end } = specialHours[dateStr];
			return { text: `שעות מיוחדות ליום זה: ${start} - ${end}`, hasSpecial: true };
		}
		return { text: 'אין שעות מיוחדות ליום זה (משתמש בשעות ברירת המחדל)', hasSpecial: false };
	});
	
	onMount(() => {
		// Set current week to start from today
		const today = new Date();
		currentWeekStart = new Date(today);
		currentWeekStart.setDate(currentWeekStart.getDate() - currentWeekStart.getDay());
		
		// Set selected date to TODAY
		selectedDate = new Date(today);
		
		loadAppointments();
	});
	
	async function loadAppointments() {
		pageInfo = {
			pageId: data.page?.id,
			userId: data.page?.userId,
			pageName: data.page?.title || data.page?.fileName
		};
		
		if (!pageInfo.pageId) {
			console.warn('⚠️ Missing page ID');
			return;
		}
		
		try {
			// Load appointments from API
			const response = await fetch(`/api/appointments/${pageInfo.pageId}`);
			
			if (!response.ok) {
				throw new Error(`HTTP error! status: ${response.status}`);
			}
			
			const responseData = await response.json();
			appointments = responseData.appointments || [];
			
			console.log(`✅ Loaded ${appointments.length} appointments`);
			
			// Load settings from localStorage
			if (browser) {
				breaks = JSON.parse(localStorage.getItem(`breaks_${pageInfo.pageId}`) || '[]');
				specialHours = JSON.parse(localStorage.getItem(`specialHours_${pageInfo.pageId}`) || '{}');
				const savedHours = localStorage.getItem(`workingHours_${pageInfo.pageId}`);
				if (savedHours) {
					workingHours = JSON.parse(savedHours);
					workStart = workingHours.start;
					workEnd = workingHours.end;
				}
			}
			
		} catch (error) {
			console.error('❌ Error loading appointments:', error);
		}
	}
	
	function previousWeek() {
		currentWeekStart = new Date(currentWeekStart);
		currentWeekStart.setDate(currentWeekStart.getDate() - 7);
	}
	
	function nextWeek() {
		currentWeekStart = new Date(currentWeekStart);
		currentWeekStart.setDate(currentWeekStart.getDate() + 7);
	}
	
	function selectDate(date) {
		selectedDate = new Date(date);
		const dateStr = selectedDate.toISOString().split('T')[0];
		if (specialHours[dateStr]) {
			specialStart = specialHours[dateStr].start;
			specialEnd = specialHours[dateStr].end;
		} else {
			specialStart = '';
			specialEnd = '';
		}
	}
	
	async function updateAppointmentStatus(appointmentId, newStatus) {
		try {
			const response = await fetch(`/api/appointments/${appointmentId}/status`, {
				method: 'PUT',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ status: newStatus })
			});
			
			if (response.ok) {
				const appointment = appointments.find(a => a.id === appointmentId);
				if (appointment) {
					appointment.status = newStatus;
					appointments = [...appointments];
					alert('✅ סטטוס התור עודכן בהצלחה');
				}
			} else {
				alert('❌ שגיאה בעדכון סטטוס');
			}
		} catch (error) {
			console.error('Error updating appointment:', error);
			alert('❌ שגיאה בעדכון סטטוס');
		}
	}
	
	function updateWorkingHours() {
		workingHours = { start: workStart, end: workEnd };
		if (browser) {
			localStorage.setItem(`workingHours_${pageInfo.pageId}`, JSON.stringify(workingHours));
		}
		alert('✅ שעות העבודה עודכנו');
	}
	
	function setSpecialHours() {
		if (!specialStart || !specialEnd) {
			alert('אנא בחר שעות התחלה וסיום');
			return;
		}
		
		const dateStr = selectedDate.toISOString().split('T')[0];
		specialHours[dateStr] = { start: specialStart, end: specialEnd };
		if (browser) {
			localStorage.setItem(`specialHours_${pageInfo.pageId}`, JSON.stringify(specialHours));
		}
		specialHours = { ...specialHours };
		alert('✅ שעות מיוחדות נשמרו ליום זה');
	}
	
	function clearSpecialHours() {
		const dateStr = selectedDate.toISOString().split('T')[0];
		delete specialHours[dateStr];
		if (browser) {
			localStorage.setItem(`specialHours_${pageInfo.pageId}`, JSON.stringify(specialHours));
		}
		specialStart = '';
		specialEnd = '';
		specialHours = { ...specialHours };
		alert('✅ שעות מיוחדות נמחקו');
	}
	
	function addBreak() {
		if (!breakStart || !breakEnd) {
			alert('אנא בחר שעות התחלה וסיום');
			return;
		}
		
		breaks = [...breaks, {
			id: Date.now().toString(),
			date: selectedDate.toISOString(),
			start: breakStart,
			end: breakEnd
		}];
		
		if (browser) {
			localStorage.setItem(`breaks_${pageInfo.pageId}`, JSON.stringify(breaks));
		}
		
		breakStart = '';
		breakEnd = '';
	}
	
	function removeBreak(breakId) {
		breaks = breaks.filter(b => b.id !== breakId);
		if (browser) {
			localStorage.setItem(`breaks_${pageInfo.pageId}`, JSON.stringify(breaks));
		}
	}
	
	function getStatusText(status) {
		const statuses = {
			'pending': 'ממתין',
			'confirmed': 'מאושר',
			'completed': 'הושלם',
			'cancelled': 'בוטל'
		};
		return statuses[status] || status;
	}
</script>

<!-- Import Day Settings Manager -->
<script context="module">
	import DaySettingsManager from '../DaySettingsManager.svelte';
</script>

<!-- Header -->
<header class="bg-white shadow-lg">
	<div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
		<div class="flex justify-between items-center py-6">
			<div>
				<h1 class="text-3xl font-bold text-gray-900">📅 ניהול תורים</h1>
				<p class="text-gray-600">{pageInfo.pageName || 'טוען...'}</p>
			</div>
		</div>
	</div>
</header>

<!-- Main Dashboard -->
<div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
	<!-- Statistics -->
	<div class="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
		<div class="stat-card">
			<h3>{totalAppointments}</h3>
			<p>סה"כ תורים</p>
		</div>
		<div class="stat-card" style="background: linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%);">
			<h3>{todayAppointments()}</h3>
			<p>תורים היום</p>
		</div>
		<div class="stat-card" style="background: linear-gradient(135deg, #10b981 0%, #047857 100%);">
			<h3>{confirmedAppointments}</h3>
			<p>תורים מאושרים</p>
		</div>
		<div class="stat-card" style="background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%);">
			<h3>{pendingAppointments}</h3>
			<p>ממתינים לאישור</p>
		</div>
	</div>

	<!-- Calendar and Schedule -->
	<div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
		<!-- Calendar -->
		<div class="lg:col-span-1 bg-white rounded-lg shadow-lg p-6">
			<h2 class="text-2xl font-bold mb-4">📅 לוח שנה</h2>
			<div class="mb-4">
				<div class="flex justify-between items-center mb-4">
					<button onclick={previousWeek} class="bg-gray-200 px-3 py-1 rounded hover:bg-gray-300">◀</button>
					<span class="font-bold">{currentWeekDisplay()}</span>
					<button onclick={nextWeek} class="bg-gray-200 px-3 py-1 rounded hover:bg-gray-300">▶</button>
				</div>
				<div class="grid grid-cols-1 gap-2">
					{#each weekDays() as date}
						{@const isToday = date.toDateString() === new Date().toDateString()}
						{@const isSelected = date.toDateString() === selectedDate.toDateString()}
						{@const dateStr = date.toISOString().split('T')[0]}
						{@const dayAppointmentsCount = appointments.filter(a => a.date === dateStr).length}
						
						<button
							class="calendar-day {isToday ? 'today' : ''} {isSelected ? 'selected' : ''}"
							onclick={() => selectDate(date)}
						>
							<div class="text-xs text-gray-500">{date.toLocaleDateString('he-IL', { weekday: 'short' })}</div>
							<div class="text-2xl font-bold">{date.getDate()}</div>
							<div class="text-xs text-gray-500">{date.toLocaleDateString('he-IL', { month: 'short' })}</div>
							{#if dayAppointmentsCount > 0}
								<div class="text-xs mt-1 text-purple-600">{dayAppointmentsCount} תורים</div>
							{/if}
						</button>
					{/each}
				</div>
			</div>
			
			<!-- Working Hours Settings -->
			<div class="mt-6 border-t pt-4">
				<h3 class="font-bold mb-3">⚙️ הגדרות שעות עבודה</h3>
				<div class="space-y-2">
					<div>
						<label class="text-sm">שעת התחלה (ברירת מחדל):</label>
						<input type="time" bind:value={workStart} class="w-full border rounded px-2 py-1">
					</div>
					<div>
						<label class="text-sm">שעת סיום (ברירת מחדל):</label>
						<input type="time" bind:value={workEnd} class="w-full border rounded px-2 py-1">
					</div>
					<button onclick={updateWorkingHours} class="w-full bg-purple-600 text-white px-4 py-2 rounded hover:bg-purple-700">
						שמור שעות עבודה
					</button>
				</div>
				
				<!-- Special Hours for Selected Day -->
				<div class="mt-4 p-3 bg-blue-50 rounded">
					<h4 class="font-semibold text-sm mb-2">🕐 שעות מיוחדות ליום זה</h4>
					<p class="text-xs text-gray-600 mb-2">הגדר שעות עבודה שונות ליום הנבחר (למשל: שישי חצי יום)</p>
					<div class="space-y-2">
						<div class="flex gap-2">
							<input type="time" bind:value={specialStart} class="flex-1 border rounded px-2 py-1 text-sm" placeholder="התחלה">
							<input type="time" bind:value={specialEnd} class="flex-1 border rounded px-2 py-1 text-sm" placeholder="סיום">
						</div>
						<button onclick={setSpecialHours} class="w-full bg-blue-500 text-white px-3 py-1 rounded text-sm hover:bg-blue-600">
							הגדר שעות מיוחדות
						</button>
						<button onclick={clearSpecialHours} class="w-full bg-gray-400 text-white px-3 py-1 rounded text-sm hover:bg-gray-500">
							מחק שעות מיוחדות
						</button>
					</div>
					<div class="mt-2 text-xs {specialHoursDisplay().hasSpecial ? 'text-green-700 font-semibold' : 'text-gray-600'}">
						{specialHoursDisplay().text}
					</div>
				</div>
			</div>
			
			<!-- Add Break -->
			<div class="mt-6 border-t pt-4">
				<h3 class="font-bold mb-3">☕ הוסף הפסקה</h3>
				<div class="space-y-2">
					<input type="time" bind:value={breakStart} class="w-full border rounded px-2 py-1" placeholder="התחלה">
					<input type="time" bind:value={breakEnd} class="w-full border rounded px-2 py-1" placeholder="סיום">
					<button onclick={addBreak} class="w-full bg-yellow-500 text-white px-4 py-2 rounded hover:bg-yellow-600">
						הוסף הפסקה
					</button>
				</div>
				<div class="mt-3 space-y-1">
					{#if dayBreaks().length === 0}
						<p class="text-xs text-gray-500">אין הפסקות</p>
					{:else}
						{#each dayBreaks() as breakItem}
							<div class="flex justify-between items-center bg-yellow-50 px-2 py-1 rounded text-sm">
								<span>{breakItem.start} - {breakItem.end}</span>
								<button onclick={() => removeBreak(breakItem.id)} class="text-red-500 hover:text-red-700">🗑️</button>
							</div>
						{/each}
					{/if}
				</div>
			</div>
		</div>

		<!-- Schedule for Selected Day -->
		<div class="lg:col-span-2 bg-white rounded-lg shadow-lg p-6">
			<h2 class="text-2xl font-bold mb-4">🕐 סידור יום <span>{selectedDateDisplay()}</span></h2>
			
			<!-- Time Slots -->
			<div class="mb-6">
				{#each timeSlots() as slot}
					<div class="time-slot {slot.isBreak ? 'break' : slot.isBooked ? 'booked' : 'available'}">
						<span>{slot.time}</span>
						{#if slot.isBreak}
							<span class="text-xs">☕ הפסקה</span>
						{:else if slot.isBooked}
							<span class="text-xs">🔴 תפוס - {slot.appointment.customerName}</span>
						{:else}
							<span class="text-xs">🟢 פנוי</span>
						{/if}
					</div>
				{/each}
			</div>
			
			<!-- Appointments List -->
			<h3 class="text-xl font-bold mb-4 mt-8">📋 תורים ליום זה</h3>
			<div>
				{#if dayAppointments().length === 0}
					{#if appointments.length === 0}
						<div class="bg-blue-50 border border-blue-200 rounded-lg p-6 text-center">
							<p class="text-blue-800 font-semibold mb-2">📅 אין תורים במערכת</p>
							<p class="text-blue-600 text-sm">כשלקוחות יקבעו תורים דרך הדף, הם יופיעו כאן</p>
						</div>
					{:else}
						<p class="text-gray-500">אין תורים ליום זה</p>
					{/if}
				{:else}
					{#each dayAppointments() as appointment}
						<div class="appointment-card {appointment.status}">
							<div class="flex justify-between items-start mb-3">
								<div>
									<h3 class="text-lg font-bold">{appointment.customerName}</h3>
									<p class="text-gray-600">📞 {appointment.phone}</p>
									{#if appointment.email}
										<p class="text-gray-600">📧 {appointment.email}</p>
									{/if}
								</div>
								<span class="status-badge status-{appointment.status}">
									{getStatusText(appointment.status)}
								</span>
							</div>
							<div class="text-sm text-gray-600 mb-3">
								<p>🕐 {appointment.time}</p>
								{#if appointment.service}
									<p>💼 {appointment.service}</p>
								{/if}
								{#if appointment.notes}
									<p>📝 {appointment.notes}</p>
								{/if}
							</div>
							<div class="flex gap-2">
								{#if appointment.status === 'pending'}
									<button onclick={() => updateAppointmentStatus(appointment.id, 'confirmed')} class="bg-green-500 text-white px-3 py-1 rounded text-sm hover:bg-green-600">
										✅ אשר
									</button>
								{/if}
								{#if appointment.status === 'confirmed'}
									<button onclick={() => updateAppointmentStatus(appointment.id, 'completed')} class="bg-blue-500 text-white px-3 py-1 rounded text-sm hover:bg-blue-600">
										✓ סמן כהושלם
									</button>
								{/if}
								<button onclick={() => updateAppointmentStatus(appointment.id, 'cancelled')} class="bg-red-500 text-white px-3 py-1 rounded text-sm hover:bg-red-600">
									❌ בטל
								</button>
								<a href="https://wa.me/972{appointment.phone.replace(/^0/, '').replace(/\D/g, '')}" target="_blank" class="bg-green-600 text-white px-3 py-1 rounded text-sm hover:bg-green-700">
									💬 WhatsApp
								</a>
							</div>
						</div>
					{/each}
				{/if}
			</div>
		</div>
	</div>
</div>

<style>
	/* EXACT Legacy Styles from appointments-manager.html */
	.stat-card {
		background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
		color: white;
		border-radius: 12px;
		padding: 20px;
		box-shadow: 0 4px 15px rgba(0,0,0,0.1);
	}
	.stat-card h3 {
		font-size: 2.5rem;
		font-weight: bold;
		margin: 0;
	}
	.stat-card p {
		margin: 5px 0 0 0;
		opacity: 0.9;
	}
	.appointment-card {
		background: white;
		border-radius: 12px;
		padding: 20px;
		margin-bottom: 15px;
		box-shadow: 0 2px 10px rgba(0,0,0,0.08);
		transition: all 0.3s;
		border-right: 5px solid #8b5cf6;
	}
	.appointment-card:hover {
		transform: translateY(-3px);
		box-shadow: 0 8px 25px rgba(0,0,0,0.15);
	}
	.appointment-card.pending { border-right-color: #f59e0b; }
	.appointment-card.confirmed { border-right-color: #10b981; }
	.appointment-card.completed { border-right-color: #6b7280; }
	.appointment-card.cancelled { border-right-color: #ef4444; }
	
	.status-badge {
		display: inline-block;
		padding: 6px 14px;
		border-radius: 20px;
		font-size: 0.85rem;
		font-weight: 600;
	}
	.status-pending { background: #fef3c7; color: #92400e; }
	.status-confirmed { background: #d1fae5; color: #065f46; }
	.status-completed { background: #e5e7eb; color: #374151; }
	.status-cancelled { background: #fee2e2; color: #991b1b; }
	
	.calendar-day {
		background: white;
		border-radius: 8px;
		padding: 10px;
		text-align: center;
		cursor: pointer;
		transition: all 0.3s;
		border: 2px solid #e5e7eb;
	}
	.calendar-day:hover {
		border-color: #8b5cf6;
		transform: translateY(-2px);
	}
	.calendar-day.selected {
		background: #8b5cf6;
		color: white;
		border-color: #8b5cf6;
	}
	.calendar-day.today {
		border-color: #3b82f6;
		font-weight: bold;
	}
	
	.time-slot {
		background: white;
		border: 2px solid #e5e7eb;
		border-radius: 8px;
		padding: 12px;
		text-align: center;
		cursor: pointer;
		transition: all 0.3s;
		margin-bottom: 8px;
	}
	.time-slot:hover {
		border-color: #8b5cf6;
	}
	.time-slot.available {
		background: #d1fae5;
		border-color: #10b981;
	}
	.time-slot.booked {
		background: #fee2e2;
		border-color: #ef4444;
		cursor: not-allowed;
	}
	.time-slot.break {
		background: #fef3c7;
		border-color: #f59e0b;
		cursor: not-allowed;
	}
</style>


<!-- Day Settings Section -->
<div class="mt-8">
	<DaySettingsManager pageId={pageInfo.pageId} />
</div>
