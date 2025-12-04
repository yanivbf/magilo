<script>
	import { invalidate } from '$app/navigation';
	
	let { pageId, services = [] } = $props();
	
	let showModal = $state(false);
	let editingService = $state(null);
	let loading = $state(false);
	let error = $state('');
	
	let formData = $state({
		name: '',
		description: '',
		price: '',
		duration: ''
	});
	
	function openAddModal() {
		editingService = null;
		formData = {
			name: '',
			description: '',
			price: '',
			duration: ''
		};
		showModal = true;
	}
	
	function openEditModal(service, index) {
		editingService = index;
		formData = {
			name: service.name || '',
			description: service.description || '',
			price: service.price || '',
			duration: service.duration || ''
		};
		showModal = true;
	}
	
	function closeModal() {
		showModal = false;
		editingService = null;
		error = '';
	}
	
	async function handleSubmit() {
		if (!formData.name) {
			error = 'שם השירות הוא שדה חובה';
			return;
		}
		
		loading = true;
		error = '';
		
		try {
			let updatedServices = [...services];
			
			if (editingService !== null) {
				updatedServices[editingService] = formData;
			} else {
				updatedServices.push(formData);
			}
			
			const response = await fetch(`/api/services/${pageId}`, {
				method: 'PUT',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ services: updatedServices })
			});
			
			if (!response.ok) {
				throw new Error('Failed to save services');
			}
			
			await invalidate('app:services');
			closeModal();
		} catch (err) {
			console.error('Save error:', err);
			error = 'שגיאה בשמירת השירות';
		} finally {
			loading = false;
		}
	}
	
	async function handleDelete(index) {
		if (!confirm('האם אתה בטוח שברצונך למחוק שירות זה?')) return;
		
		loading = true;
		
		try {
			const updatedServices = services.filter((_, i) => i !== index);
			
			const response = await fetch(`/api/services/${pageId}`, {
				method: 'PUT',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ services: updatedServices })
			});
			
			if (!response.ok) {
				throw new Error('Failed to delete service');
			}
			
			await invalidate('app:services');
		} catch (err) {
			console.error('Delete error:', err);
			error = 'שגיאה במחיקת השירות';
		} finally {
			loading = false;
		}
	}
</script>

<div class="services-editor">
	<div class="flex justify-between items-center mb-6">
		<h2 class="text-2xl font-bold">ניהול שירותים</h2>
		<button
			onclick={openAddModal}
			class="bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 transition-colors"
		>
			+ הוסף שירות
		</button>
	</div>
	
	{#if error && !showModal}
		<div class="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
			{error}
		</div>
	{/if}
	
	<div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
		{#each services as service, index}
			<div class="border rounded-lg p-4 bg-white">
				<h3 class="font-bold text-lg mb-2">{service.name}</h3>
				<p class="text-gray-600 text-sm mb-2">{service.description || ''}</p>
				
				<div class="flex gap-2 text-sm text-gray-700 mb-4">
					{#if service.price}
						<span class="bg-purple-100 px-2 py-1 rounded">₪{service.price}</span>
					{/if}
					{#if service.duration}
						<span class="bg-blue-100 px-2 py-1 rounded">{service.duration} דקות</span>
					{/if}
				</div>
				
				<div class="flex gap-2">
					<button
						onclick={() => openEditModal(service, index)}
						class="flex-1 bg-blue-500 text-white px-3 py-2 rounded hover:bg-blue-600 transition-colors text-sm"
					>
						ערוך
					</button>
					<button
						onclick={() => handleDelete(index)}
						class="bg-red-500 text-white px-3 py-2 rounded hover:bg-red-600 transition-colors text-sm"
					>
						מחק
					</button>
				</div>
			</div>
		{/each}
	</div>
	
	{#if services.length === 0}
		<div class="text-center py-12 text-gray-500">
			<p>אין שירותים עדיין</p>
			<p class="text-sm">לחץ על "הוסף שירות" כדי להתחיל</p>
		</div>
	{/if}
</div>

{#if showModal}
	<div class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
		<div class="bg-white rounded-lg p-6 max-w-md w-full">
			<h3 class="text-xl font-bold mb-4">
				{editingService !== null ? 'ערוך שירות' : 'הוסף שירות חדש'}
			</h3>
			
			{#if error}
				<div class="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
					{error}
				</div>
			{/if}
			
			<form onsubmit={(e) => { e.preventDefault(); handleSubmit(); }}>
				<div class="mb-4">
					<label class="block text-sm font-medium mb-2">שם השירות *</label>
					<input
						type="text"
						bind:value={formData.name}
						class="w-full border rounded-lg px-3 py-2"
						required
					/>
				</div>
				
				<div class="mb-4">
					<label class="block text-sm font-medium mb-2">תיאור</label>
					<textarea
						bind:value={formData.description}
						class="w-full border rounded-lg px-3 py-2"
						rows="3"
					></textarea>
				</div>
				
				<div class="grid grid-cols-2 gap-4 mb-6">
					<div>
						<label class="block text-sm font-medium mb-2">מחיר (₪)</label>
						<input
							type="number"
							bind:value={formData.price}
							class="w-full border rounded-lg px-3 py-2"
							step="0.01"
						/>
					</div>
					
					<div>
						<label class="block text-sm font-medium mb-2">משך (דקות)</label>
						<input
							type="number"
							bind:value={formData.duration}
							class="w-full border rounded-lg px-3 py-2"
						/>
					</div>
				</div>
				
				<div class="flex gap-2">
					<button
						type="submit"
						disabled={loading}
						class="flex-1 bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 transition-colors disabled:opacity-50"
					>
						{loading ? 'שומר...' : 'שמור'}
					</button>
					<button
						type="button"
						onclick={closeModal}
						disabled={loading}
						class="flex-1 bg-gray-300 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-400 transition-colors"
					>
						ביטול
					</button>
				</div>
			</form>
		</div>
	</div>
{/if}

<style>
	.services-editor {
		padding: 1rem;
	}
</style>
