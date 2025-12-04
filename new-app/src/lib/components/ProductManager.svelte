<script>
	import { invalidate } from '$app/navigation';
	
	let { pageId, products = [] } = $props();
	
	let showModal = $state(false);
	let editingProduct = $state(null);
	let loading = $state(false);
	let error = $state('');
	
	let formData = $state({
		name: '',
		description: '',
		price: '',
		image: null,
		enabled: true
	});
	
	function openAddModal() {
		editingProduct = null;
		formData = {
			name: '',
			description: '',
			price: '',
			image: null,
			enabled: true
		};
		showModal = true;
	}
	
	function openEditModal(product) {
		editingProduct = product;
		formData = {
			name: product.name || '',
			description: product.description || '',
			price: product.price || '',
			image: product.image || null,
			enabled: product.enabled !== false
		};
		showModal = true;
	}
	
	function closeModal() {
		showModal = false;
		editingProduct = null;
		error = '';
	}
	
	async function handleImageUpload(event) {
		const file = event.target.files?.[0];
		if (!file) return;
		
		const formDataUpload = new FormData();
		formDataUpload.append('image', file);
		
		try {
			const response = await fetch('/api/upload-image', {
				method: 'POST',
				body: formDataUpload
			});
			
			const result = await response.json();
			if (result.success) {
				formData.image = result.url;
			}
		} catch (err) {
			console.error('Image upload error:', err);
		}
	}
	
	async function handleSubmit() {
		if (!formData.name || !formData.price) {
			error = 'שם ומחיר הם שדות חובה';
			return;
		}
		
		loading = true;
		error = '';
		
		try {
			const url = editingProduct 
				? `/api/products/${editingProduct.id}`
				: '/api/products';
			
			const method = editingProduct ? 'PATCH' : 'POST';
			
			const response = await fetch(url, {
				method,
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({
					...formData,
					pageId
				})
			});
			
			if (!response.ok) {
				throw new Error('Failed to save product');
			}
			
			await invalidate('app:products');
			closeModal();
		} catch (err) {
			console.error('Save error:', err);
			error = 'שגיאה בשמירת המוצר';
		} finally {
			loading = false;
		}
	}
	
	async function handleDelete(productId) {
		if (!confirm('האם אתה בטוח שברצונך למחוק מוצר זה?')) return;
		
		loading = true;
		
		try {
			const response = await fetch(`/api/products/${productId}`, {
				method: 'DELETE'
			});
			
			if (!response.ok) {
				throw new Error('Failed to delete product');
			}
			
			await invalidate('app:products');
		} catch (err) {
			console.error('Delete error:', err);
			error = 'שגיאה במחיקת המוצר';
		} finally {
			loading = false;
		}
	}
	
	async function toggleEnabled(product) {
		loading = true;
		
		try {
			const response = await fetch(`/api/products/${product.id}`, {
				method: 'PATCH',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({
					enabled: !product.enabled
				})
			});
			
			if (!response.ok) {
				throw new Error('Failed to toggle product');
			}
			
			await invalidate('app:products');
		} catch (err) {
			console.error('Toggle error:', err);
		} finally {
			loading = false;
		}
	}
</script>

<div class="product-manager">
	<div class="flex justify-between items-center mb-6">
		<h2 class="text-2xl font-bold">ניהול מוצרים</h2>
		<button
			onclick={openAddModal}
			class="bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 transition-colors"
		>
			+ הוסף מוצר
		</button>
	</div>
	
	{#if error && !showModal}
		<div class="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
			{error}
		</div>
	{/if}
	
	<div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
		{#each products as product}
			<div class="border rounded-lg p-4 {product.enabled ? '' : 'opacity-50'}">
				{#if product.image}
					<img src={product.image} alt={product.name} class="w-full h-48 object-cover rounded-lg mb-4" />
				{:else}
					<div class="w-full h-48 bg-gray-200 rounded-lg mb-4 flex items-center justify-center">
						<span class="text-gray-400">אין תמונה</span>
					</div>
				{/if}
				
				<h3 class="font-bold text-lg mb-2">{product.name}</h3>
				<p class="text-gray-600 text-sm mb-2">{product.description || ''}</p>
				<p class="text-purple-600 font-bold mb-4">₪{product.price}</p>
				
				<div class="flex gap-2">
					<button
						onclick={() => openEditModal(product)}
						class="flex-1 bg-blue-500 text-white px-3 py-2 rounded hover:bg-blue-600 transition-colors text-sm"
					>
						ערוך
					</button>
					<button
						onclick={() => toggleEnabled(product)}
						class="flex-1 {product.enabled ? 'bg-yellow-500 hover:bg-yellow-600' : 'bg-green-500 hover:bg-green-600'} text-white px-3 py-2 rounded transition-colors text-sm"
					>
						{product.enabled ? 'השבת' : 'הפעל'}
					</button>
					<button
						onclick={() => handleDelete(product.id)}
						class="bg-red-500 text-white px-3 py-2 rounded hover:bg-red-600 transition-colors text-sm"
					>
						מחק
					</button>
				</div>
			</div>
		{/each}
	</div>
	
	{#if products.length === 0}
		<div class="text-center py-12 text-gray-500">
			<p>אין מוצרים עדיין</p>
			<p class="text-sm">לחץ על "הוסף מוצר" כדי להתחיל</p>
		</div>
	{/if}
</div>

{#if showModal}
	<div class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
		<div class="bg-white rounded-lg p-6 max-w-md w-full max-h-[90vh] overflow-y-auto">
			<h3 class="text-xl font-bold mb-4">
				{editingProduct ? 'ערוך מוצר' : 'הוסף מוצר חדש'}
			</h3>
			
			{#if error}
				<div class="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
					{error}
				</div>
			{/if}
			
			<form onsubmit={(e) => { e.preventDefault(); handleSubmit(); }}>
				<div class="mb-4">
					<label class="block text-sm font-medium mb-2">שם המוצר *</label>
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
				
				<div class="mb-4">
					<label class="block text-sm font-medium mb-2">מחיר *</label>
					<input
						type="number"
						bind:value={formData.price}
						class="w-full border rounded-lg px-3 py-2"
						step="0.01"
						required
					/>
				</div>
				
				<div class="mb-4">
					<label class="block text-sm font-medium mb-2">תמונה</label>
					<input
						type="file"
						accept="image/*"
						onchange={handleImageUpload}
						class="w-full border rounded-lg px-3 py-2"
					/>
					{#if formData.image}
						<img src={formData.image} alt="Preview" class="mt-2 w-full h-32 object-cover rounded" />
					{/if}
				</div>
				
				<div class="mb-6">
					<label class="flex items-center">
						<input
							type="checkbox"
							bind:checked={formData.enabled}
							class="mr-2"
						/>
						<span class="text-sm">מוצר פעיל</span>
					</label>
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
	.product-manager {
		padding: 1rem;
	}
</style>
