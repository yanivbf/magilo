<!-- Guest List/RSVP Manager - EXACT Legacy Port from event-guests.html -->
<script>
	import { onMount } from 'svelte';
	import { browser } from '$app/environment';
	
	let { data } = $props();
	
	// State
	let guests = $state([]);
	let pageInfo = $state({});
	let expectedGuests = $state(0);
	let currentTab = $state('guests');
	let viewMode = $state('cards');
	let searchQuery = $state('');
	let filterStatus = $state('all');
	
	// Table settings
	let numTables = $state(10);
	let seatsPerTable = $state(10);
	
	// Form inputs
	let expectedGuestsInput = $state('');
	
	// Statistics
	let totalGuests = $derived(guests.length);
	let totalWithPlus = $derived(() => {
		return guests
			.filter(g => g.status === 'confirmed' || g.status === 'מאושר')
			.reduce((sum, g) => sum + 1 + (parseInt(g.plus) || 0), 0);
	});
	let confirmedCount = $derived(guests.filter(g => g.status === 'confirmed' || g.status === 'מאושר').length);
	let pendingCount = $derived(guests.filter(g => g.status === 'pending' || g.status === 'ממתין').length);
	let declinedCount = $derived(guests.filter(g => g.status === 'declined' || g.status === 'לא מגיע').length);
	
	// Alert
	let showAlert = $derived(expectedGuests > 0 && totalWithPlus() > expectedGuests);
	
	// Filtered guests
	let filteredGuests = $derived(() => {
		return guests.filter(g => {
			const matchSearch = g.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
							   (g.phone && g.phone.includes(searchQuery));
			const matchFilter = filterStatus === 'all' || 
							   g.status === filterStatus || 
							   (filterStatus === 'confirmed' && g.status === 'מאושר') ||
							   (filterStatus === 'pending' && g.status === 'ממתין');
			return matchSearch && matchFilter;
		});
	});
	
	// Tables
	let tables = $derived(() => {
		const result = [];
		for (let i = 1; i <= numTables; i++) {
			const tableGuests = guests.filter(g => 
				parseInt(g.table) === i && (g.status === 'confirmed' || g.status === 'מאושר')
			);
			const occupied = tableGuests.reduce((sum, g) => sum + 1 + (parseInt(g.plus) || 0), 0);
			result.push({
				number: i,
				guests: tableGuests,
				occupied,
				isOverCapacity: occupied > seatsPerTable,
				isEmpty: tableGuests.length === 0
			});
		}
		return result;
	});
	
	onMount(() => {
		loadPageInfo();
	});
	
	async function loadPageInfo() {
		pageInfo = {
			pageId: data.page?.id,
			userId: data.page?.userId,
			pageName: data.page?.title || data.page?.fileName
		};
		
		if (!pageInfo.pageId) {
			console.warn('⚠️ Missing page ID');
			return;
		}
		
		// Load expected guests
		try {
			const response = await fetch(`/api/pages/${pageInfo.userId}`);
			if (response.ok) {
				const responseData = await response.json();
				const pages = Array.isArray(responseData) ? responseData : (responseData.pages || []);
				const currentPage = pages.find(p => p.id === pageInfo.pageId);
				if (currentPage && currentPage.expectedGuests) {
					expectedGuests = currentPage.expectedGuests;
					expectedGuestsInput = expectedGuests.toString();
				}
			}
		} catch (err) {
			console.warn('Failed to load expected guests:', err);
		}
		
		await loadGuests();
	}
	
	async function loadGuests() {
		try {
			const response = await fetch(`/api/guests/${pageInfo.pageId}`);
			if (response.ok) {
				const responseData = await response.json();
				guests = responseData.guests || [];
				console.log(`✅ Loaded ${guests.length} guests`);
				
				// Calculate required tables
				const tablesWithGuests = guests.map(g => parseInt(g.table) || 0).filter(t => t > 0);
				if (tablesWithGuests.length > 0) {
					const maxTable = Math.max(...tablesWithGuests);
					numTables = maxTable;
				}
			}
		} catch (error) {
			console.error('Error loading guests:', error);
		}
	}
	
	async function updateExpectedGuests() {
		const newLimit = parseInt(expectedGuestsInput);
		if (!newLimit || newLimit <= 0) {
			alert('אנא הזן מספר תקין של מוזמנים');
			return;
		}
		
		try {
			const response = await fetch('/api/update-expected-guests', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({
					userId: pageInfo.userId,
					pageId: pageInfo.pageId,
					expectedGuests: newLimit
				})
			});
			
			if (response.ok) {
				expectedGuests = newLimit;
				alert(`✅ מכסת המוזמנים עודכנה ל-${newLimit}`);
			} else {
				alert('❌ שגיאה בעדכון המכסה');
			}
		} catch (error) {
			console.error('Error updating expected guests:', error);
			alert('❌ שגיאה בעדכון המכסה');
		}
	}
	
	async function moveGuest(guestId, newTable) {
		if (!newTable) return;
		
		const guest = guests.find(g => g.id === guestId);
		if (!guest) return;
		
		const oldTable = guest.table;
		guest.table = parseInt(newTable);
		
		try {
			await saveGuestTableAssignment(guestId, newTable);
			guests = [...guests];
			alert(`✅ ${guest.name} הועבר משולחן ${oldTable} לשולחן ${newTable}`);
		} catch (error) {
			guest.table = oldTable;
			alert('❌ שגיאה בהעברת המוזמן');
		}
	}
	
	async function saveGuestTableAssignment(guestId, tableNumber) {
		const response = await fetch('/api/update-guest-table', {
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify({
				userId: pageInfo.userId,
				pageId: pageInfo.pageId,
				guestId: guestId,
				table: parseInt(tableNumber)
			})
		});
		
		if (!response.ok) {
			throw new Error('Failed to save');
		}
	}
	
	function autoArrange() {
		let table = 1;
		let seats = 0;
		
		guests.filter(g => g.status === 'confirmed' || g.status === 'מאושר').forEach(g => {
			const size = 1 + (parseInt(g.plus) || 0);
			if (seats + size > seatsPerTable) {
				table++;
				seats = 0;
			}
			g.table = table;
			seats += size;
		});
		
		numTables = table;
		saveAllTableAssignments();
		guests = [...guests];
		alert(`✨ השולחנות סודרו!\n${table} שולחנות בשימוש`);
	}
	
	async function saveAllTableAssignments() {
		try {
			const response = await fetch('/api/save-all-tables', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({
					userId: pageInfo.userId,
					pageId: pageInfo.pageId,
					guests: guests.map(g => ({ id: g.id, table: g.table || 0 }))
				})
			});
			
			if (!response.ok) {
				console.error('Failed to save table assignments');
			}
		} catch (error) {
			console.error('Error saving tables:', error);
		}
	}
	
	function getStatusText(status) {
		if (status === 'confirmed' || status === 'מאושר') return 'מאושר';
		if (status === 'pending' || status === 'ממתין') return 'ממתין';
		return 'לא מגיע';
	}
	
	function getStatusClass(status) {
		if (status === 'confirmed' || status === 'מאושר') return 'confirmed';
		if (status === 'pending' || status === 'ממתין') return 'pending';
		return 'declined';
	}
	
	function getBadgeClass(status) {
		if (status === 'confirmed' || status === 'מאושר') return 'bg-green-100 text-green-700';
		if (status === 'pending' || status === 'ממתין') return 'bg-orange-100 text-orange-700';
		return 'bg-red-100 text-red-700';
	}
	
	function getBadgeIcon(status) {
		if (status === 'confirmed' || status === 'מאושר') return '✓ אישר';
		if (status === 'pending' || status === 'ממתין') return '⏳ ממתין';
		return '✗ לא יגיע';
	}
</script>

<!-- Header -->
<div class="bg-white rounded-2xl shadow-xl p-8 mb-8">
	<div class="flex justify-between items-center">
		<div>
			<h1 class="text-4xl font-bold text-purple-600 mb-2">ניהול מוזמנים</h1>
			<p class="text-gray-600">{pageInfo.pageName || 'מערכת ניהול מתקדמת לאירוע שלך'}</p>
		</div>
	</div>
</div>

<!-- Statistics -->
<div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 mb-8">
	<div class="stat-box">
		<div class="text-5xl font-bold mb-2">{totalGuests}</div>
		<div class="text-lg opacity-90">סה"כ מוזמנים</div>
	</div>
	<div class="stat-box" style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);">
		<div class="text-5xl font-bold mb-2">{totalWithPlus()}</div>
		<div class="text-lg opacity-90">👥 סה"כ מגיעים</div>
		<div class="text-xs opacity-75">(כולל מלווים)</div>
	</div>
	<div class="stat-box green">
		<div class="text-5xl font-bold mb-2">{confirmedCount}</div>
		<div class="text-lg opacity-90">✓ אישרו</div>
	</div>
	<div class="stat-box orange">
		<div class="text-5xl font-bold mb-2">{pendingCount}</div>
		<div class="text-lg opacity-90">⏳ ממתינים</div>
	</div>
	<div class="stat-box red">
		<div class="text-5xl font-bold mb-2">{declinedCount}</div>
		<div class="text-lg opacity-90">✗ לא יגיעו</div>
	</div>
</div>

<!-- Guest limit control -->
<div class="mb-8 bg-white p-6 rounded-xl shadow-lg">
	<div class="flex items-center justify-between">
		<div>
			<h3 class="text-xl font-bold text-gray-800 mb-2">🎯 מכסת מוזמנים</h3>
			<p class="text-gray-600">הגדר את המספר המקסימלי של אנשים באירוע</p>
		</div>
		<div class="flex items-center gap-4">
			<input type="number" bind:value={expectedGuestsInput} min="0" 
				class="border-2 border-purple-300 rounded-lg px-4 py-2 w-32 text-center text-2xl font-bold"
				placeholder="200">
			<button onclick={updateExpectedGuests} 
				class="bg-purple-500 text-white px-6 py-2 rounded-lg hover:bg-purple-600 font-bold">
				💾 שמור
			</button>
		</div>
	</div>
</div>

<!-- Alert for exceeding guest limit -->
{#if showAlert}
	<div class="mb-8 bg-red-100 border-l-4 border-red-500 text-red-700 p-6 rounded-xl shadow-lg" role="alert">
		<div class="flex items-center">
			<div class="text-4xl mr-4">⚠️</div>
			<div>
				<p class="font-bold text-xl mb-2">עברת את מכסת המוזמנים!</p>
				<p class="text-lg">
					סה"כ אנשים שאישרו (כולל מלווים): <span class="font-bold">{totalWithPlus()}</span> / 
					<span class="font-bold">{expectedGuests}</span>
				</p>
			</div>
		</div>
	</div>
{/if}

<!-- Tabs -->
<div class="bg-white rounded-2xl shadow-xl overflow-hidden">
	<div class="flex border-b-2">
		<button class="tab-btn {currentTab === 'guests' ? 'active' : ''} flex-1" onclick={() => currentTab = 'guests'}>
			👥 רשימת מוזמנים
		</button>
		<button class="tab-btn {currentTab === 'tables' ? 'active' : ''} flex-1" onclick={() => currentTab = 'tables'}>
			🪑 סידור שולחנות
		</button>
	</div>

	<!-- Tab: Guests List -->
	{#if currentTab === 'guests'}
		<div class="p-8">
			<div class="flex gap-4 mb-6">
				<input type="text" bind:value={searchQuery} placeholder="🔍 חפש..." 
					class="flex-1 px-6 py-3 border-2 rounded-xl">
				<select bind:value={filterStatus} class="px-6 py-3 border-2 rounded-xl">
					<option value="all">הכל</option>
					<option value="confirmed">אישרו</option>
					<option value="מאושר">מאושר</option>
					<option value="pending">ממתינים</option>
					<option value="ממתין">ממתין</option>
					<option value="declined">לא יגיעו</option>
				</select>
				<select bind:value={viewMode} class="px-6 py-3 border-2 rounded-xl">
					<option value="cards">📋 קלפים</option>
					<option value="table">📊 טבלה</option>
				</select>
			</div>
			
			{#if viewMode === 'cards'}
				<div>
					{#if filteredGuests().length === 0}
						<p class="text-center text-gray-500 py-12">אין מוזמנים רשומים</p>
					{:else}
						{#each filteredGuests() as guest}
							<div class="guest-card {getStatusClass(guest.status)}">
								<div class="flex justify-between">
									<div class="flex-1">
										<h3 class="text-xl font-bold mb-2">{guest.name}</h3>
										<div class="text-sm text-gray-600">
											{#if guest.phone}📱 {guest.phone}<br>{/if}
											{#if guest.email}📧 {guest.email}<br>{/if}
											{#if guest.plus > 0}👥 +{guest.plus} מלווים<br>{/if}
											{#if guest.table > 0}🪑 שולחן {guest.table}<br>{/if}
											{#if guest.gift}🎁 מתנה: {guest.gift}<br>{/if}
											{#if guest.giftAmount}💰 סכום: ₪{guest.giftAmount}<br>{/if}
											{#if guest.notes}📝 {guest.notes}{/if}
										</div>
									</div>
									<div class="text-left">
										<span class="inline-block px-4 py-2 rounded-full text-sm font-bold {getBadgeClass(guest.status)}">
											{getBadgeIcon(guest.status)}
										</span>
									</div>
								</div>
							</div>
						{/each}
					{/if}
				</div>
			{:else}
				<div style="overflow-x: auto;">
					{#if filteredGuests().length === 0}
						<p class="text-center text-gray-500 py-12">אין מוזמנים רשומים</p>
					{:else}
						<table class="w-full border-collapse bg-white rounded-xl overflow-hidden shadow-lg">
							<thead>
								<tr class="bg-gradient-to-r from-purple-500 to-blue-500 text-white">
									<th class="p-4 text-right">#</th>
									<th class="p-4 text-right">שם</th>
									<th class="p-4 text-right">טלפון</th>
									<th class="p-4 text-right">אימייל</th>
									<th class="p-4 text-center">מלווים</th>
									<th class="p-4 text-center">סטטוס</th>
									<th class="p-4 text-center">שולחן</th>
									<th class="p-4 text-right">מתנה</th>
									<th class="p-4 text-right">הערות</th>
								</tr>
							</thead>
							<tbody>
								{#each filteredGuests() as guest, index}
									{@const rowColor = index % 2 === 0 ? 'bg-gray-50' : 'bg-white'}
									<tr class="{rowColor} hover:bg-purple-50 transition-colors">
										<td class="p-4 border-t">{index + 1}</td>
										<td class="p-4 border-t font-bold">{guest.name}</td>
										<td class="p-4 border-t">{guest.phone || '-'}</td>
										<td class="p-4 border-t">{guest.email || '-'}</td>
										<td class="p-4 border-t text-center">{guest.plus > 0 ? '+' + guest.plus : '-'}</td>
										<td class="p-4 border-t text-center">
											<span class="inline-block px-3 py-1 rounded-full text-xs font-bold {getBadgeClass(guest.status)}">
												{getStatusText(guest.status)}
											</span>
										</td>
										<td class="p-4 border-t text-center">{guest.table > 0 ? '🪑 ' + guest.table : '-'}</td>
										<td class="p-4 border-t">{guest.gift ? '🎁 ' + guest.gift : '-'}{guest.giftAmount ? ' (₪' + guest.giftAmount + ')' : ''}</td>
										<td class="p-4 border-t text-sm">{guest.notes || '-'}</td>
									</tr>
								{/each}
							</tbody>
						</table>
					{/if}
				</div>
			{/if}
		</div>
	{/if}

	<!-- Tab: Tables -->
	{#if currentTab === 'tables'}
		<div class="p-8">
			<div class="bg-white rounded-xl shadow-lg p-6 mb-8">
				<h3 class="text-2xl font-bold text-purple-600 mb-6">⚙️ הגדרות שולחנות</h3>
				<div class="grid grid-cols-1 md:grid-cols-3 gap-6">
					<div>
						<label class="block mb-2 font-bold text-gray-700">🪑 מספר שולחנות</label>
						<input type="number" bind:value={numTables} min="1" 
							class="w-full px-6 py-3 border-2 border-purple-300 rounded-xl focus:border-purple-500 focus:outline-none text-lg font-bold">
					</div>
					<div>
						<label class="block mb-2 font-bold text-gray-700">👥 מקומות לשולחן</label>
						<input type="number" bind:value={seatsPerTable} min="1" 
							class="w-full px-6 py-3 border-2 border-purple-300 rounded-xl focus:border-purple-500 focus:outline-none text-lg font-bold">
					</div>
					<div class="flex items-end gap-4">
						<button onclick={autoArrange} 
							class="flex-1 bg-gradient-to-r from-purple-500 to-blue-500 text-white px-6 py-3 rounded-xl hover:from-purple-600 hover:to-blue-600 font-bold text-lg shadow-lg transition-all hover:scale-105">
							✨ סידור אוטומטי חכם
						</button>
						<button onclick={() => { saveAllTableAssignments(); alert('✅ סידור השולחנות נשמר!'); }} 
							class="flex-1 bg-gradient-to-r from-green-500 to-teal-500 text-white px-6 py-3 rounded-xl hover:from-green-600 hover:to-teal-600 font-bold text-lg shadow-lg transition-all hover:scale-105">
							💾 שמור סידור
						</button>
					</div>
				</div>
			</div>
			
			<div class="mb-6 bg-blue-50 p-4 rounded-xl border-2 border-blue-200">
				<h3 class="text-xl font-bold text-blue-700 mb-2">💡 איך להשתמש בסידור שולחנות?</h3>
				<ul class="text-gray-700 space-y-1 text-sm">
					<li>✨ <strong>סידור אוטומטי:</strong> לחץ על הכפתור ומערכת תחלק את כל המוזמנים בצורה חכמה (שמירה אוטומטית)</li>
					<li>🔄 <strong>העברה ידנית:</strong> בחר "העבר..." ליד שם המוזמן כדי להעביר אותו לשולחן אחר (שמירה אוטומטית)</li>
					<li>💾 <strong>שמור סידור:</strong> אם עשית שינויים ידניים, לחץ על הכפתור הירוק לשמירה</li>
				</ul>
			</div>
			
			<div class="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
				{#each tables() as table}
					<div class="bg-white rounded-xl shadow-lg p-6 border-2 transition-all hover:shadow-xl {
						table.isOverCapacity ? 'border-red-500 bg-red-50' : 
						table.isEmpty ? 'border-gray-200' : 
						'border-purple-300'
					}">
						<div class="flex justify-between items-center mb-4 pb-4 border-b-2 {
							table.isOverCapacity ? 'border-red-300' : 'border-purple-200'
						}">
							<h3 class="text-2xl font-bold {table.isOverCapacity ? 'text-red-600' : 'text-purple-600'}">
								🪑 שולחן {table.number}
							</h3>
							<div class="px-4 py-2 rounded-lg text-lg font-bold {
								table.isOverCapacity ? 'bg-red-100 text-red-700' : 
								table.isEmpty ? 'bg-gray-100 text-gray-600' :
								'bg-green-100 text-green-700'
							}">
								{table.occupied}/{seatsPerTable}
							</div>
						</div>

						<div class="space-y-3 {table.isEmpty ? '' : 'max-h-96 overflow-y-auto'}">
							{#if table.isEmpty}
								<div class="text-center py-12">
									<div class="text-6xl mb-4">🪑</div>
									<p class="text-gray-400 font-bold">שולחן פנוי</p>
								</div>
							{:else}
								{#each table.guests as guest}
									{@const guestSize = 1 + (parseInt(guest.plus) || 0)}
									<div class="bg-gradient-to-r from-purple-50 to-blue-50 p-4 rounded-lg border-2 border-purple-200 hover:border-purple-400 transition-all">
										<div class="flex justify-between items-start gap-3">
											<div class="flex-1">
												<div class="font-bold text-lg text-gray-800">{guest.name}</div>
												<div class="flex items-center gap-2 mt-1">
													<span class="inline-flex items-center px-3 py-1 rounded-full text-xs font-bold bg-purple-100 text-purple-700">
														👥 {guestSize} {guestSize === 1 ? 'אדם' : 'אנשים'}
													</span>
													{#if guest.plus > 0}
														<span class="text-xs text-gray-600">+ {guest.plus} מלווים</span>
													{/if}
												</div>
											</div>
											<select onchange={(e) => moveGuest(guest.id, e.target.value)} 
												class="text-sm border-2 border-purple-300 rounded-lg px-3 py-2 focus:border-purple-500 focus:outline-none bg-white font-bold">
												<option value="">העבר...</option>
												{#each Array.from({length: numTables}, (_, idx) => idx + 1).filter(t => t !== table.number) as t}
													<option value="{t}">→ שולחן {t}</option>
												{/each}
											</select>
										</div>
									</div>
								{/each}
							{/if}
						</div>

						{#if table.isOverCapacity}
							<div class="mt-4 p-3 bg-red-100 rounded-lg text-center text-red-700 font-bold text-sm">
								⚠️ חריגה ממכסת המקומות!
							</div>
						{/if}
					</div>
				{/each}
			</div>
		</div>
	{/if}
</div>

<style>
	/* EXACT Legacy Styles from event-guests.html with CSS Isolation */
	:global(.guest-card) {
		background: white !important;
		border-radius: 12px !important;
		padding: 20px !important;
		margin-bottom: 15px !important;
		box-shadow: 0 2px 10px rgba(0,0,0,0.08) !important;
		transition: all 0.3s ease !important;
		border-right: 5px solid #8b5cf6 !important;
		font-family: 'Inter', 'Assistant', sans-serif !important;
	}
	
	:global(.guest-card:hover) {
		transform: translateY(-3px) !important;
		box-shadow: 0 8px 25px rgba(0,0,0,0.15) !important;
	}
	
	:global(.guest-card.confirmed) { border-right-color: #10b981 !important; }
	:global(.guest-card.pending) { border-right-color: #f59e0b !important; }
	:global(.guest-card.declined) { border-right-color: #ef4444 !important; }
	
	:global(.stat-box) {
		background: linear-gradient(135deg, #667eea 0%, #764ba2 100%) !important;
		color: white !important;
		border-radius: 16px !important;
		padding: 30px !important;
		text-align: center !important;
		box-shadow: 0 10px 25px rgba(102, 126, 234, 0.3) !important;
		transition: all 0.3s ease !important;
		font-family: 'Heebo', sans-serif !important;
	}
	
	:global(.stat-box:hover) {
		transform: translateY(-5px) !important;
		box-shadow: 0 15px 35px rgba(102, 126, 234, 0.4) !important;
	}
	
	:global(.stat-box.green) { 
		background: linear-gradient(135deg, #10b981 0%, #059669 100%) !important; 
		box-shadow: 0 10px 25px rgba(16, 185, 129, 0.3) !important;
	}
	:global(.stat-box.orange) { 
		background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%) !important; 
		box-shadow: 0 10px 25px rgba(245, 158, 11, 0.3) !important;
	}
	:global(.stat-box.red) { 
		background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%) !important; 
		box-shadow: 0 10px 25px rgba(239, 68, 68, 0.3) !important;
	}
	
	:global(.tab-btn) {
		padding: 15px 30px !important;
		background: #f3f4f6 !important;
		border: none !important;
		cursor: pointer !important;
		font-weight: 600 !important;
		transition: all 0.3s ease !important;
		font-size: 1.125rem !important;
		font-family: 'Heebo', sans-serif !important;
	}
	
	:global(.tab-btn:hover) {
		background: #e5e7eb !important;
	}
	
	:global(.tab-btn.active) {
		background: linear-gradient(135deg, #8b5cf6 0%, #6d28d9 100%) !important;
		color: white !important;
	}
	
	/* Table Styles */
	:global(table) {
		border-collapse: collapse !important;
		width: 100% !important;
		font-family: 'Inter', 'Assistant', sans-serif !important;
	}
	
	:global(table th) {
		padding: 1rem !important;
		text-align: right !important;
		font-weight: 700 !important;
		font-size: 0.875rem !important;
	}
	
	:global(table td) {
		padding: 1rem !important;
		font-size: 0.875rem !important;
	}
	
	:global(table tr:hover) {
		background-color: #faf5ff !important;
	}
	
	/* Input and Select Styles */
	:global(input[type="text"]),
	:global(input[type="number"]),
	:global(select) {
		transition: all 0.2s ease !important;
		font-family: 'Inter', 'Assistant', sans-serif !important;
	}
	
	:global(input[type="text"]:focus),
	:global(input[type="number"]:focus),
	:global(select:focus) {
		outline: none !important;
		ring: 2px solid #8b5cf6 !important;
		border-color: #8b5cf6 !important;
	}
	
	/* Button Styles */
	:global(button) {
		transition: all 0.3s ease !important;
		font-family: 'Heebo', sans-serif !important;
	}
	
	:global(button:hover:not(:disabled)) {
		transform: scale(1.05) !important;
	}
	
	:global(button:disabled) {
		opacity: 0.5 !important;
		cursor: not-allowed !important;
	}
</style>
