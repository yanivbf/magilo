<script>
	// Product Gallery Manager for Store Template
	let { products = $bindable([]), onUpdate } = $props();
	
	let showAddForm = $state(false);
	let editingIndex = $state(null);
	let currentProduct = $state({
		name: '',
		description: '',
		price: '',
		image: ''
	});
	
	function addProduct() {
		showAddForm = true;
		editingIndex = null;
		currentProduct = { name: '', description: '', price: '', image: '' };
	}
	
	function editProduct(index) {
		showAddForm = true;
		editingIndex = index;
		currentProduct = { ...products[index] };
	}
	
	function saveProduct() {
		if (!currentProduct.name || !currentProduct.price) {
			alert('נא למלא שם ומחיר');
			return;
		}
		
		if (editingIndex !== null) {
			products[editingIndex] = { ...currentProduct };
		} else {
			products = [...products, { ...currentProduct }];
		}
		
		if (onUpdate) onUpdate(products);
		cancelEdit();
	}
	
	function deleteProduct(index) {
		if (confirm('האם למחוק מוצר זה?')) {
			products = products.filter((_, i) => i !== index);
			if (onUpdate) onUpdate(products);
		}
	}
	
	function cancelEdit() {
		showAddForm = false;
		editingIndex = null;
		currentProduct = { name: '', description: '', price: '', image: '' };
	}
</script>

<div class="product-gallery-manager">
	<div class="flex justify-between items-center mb-4">
		<h3 class="text-lg font-bold">מוצרים ({products.length})</h3>
		<button
			onclick={addProduct}
			class="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition"
		>
			+ הוסף מוצר
		</button>
	</div>
	
	<!-- Products List -->
	{#if products.length > 0}
		<div class="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
			{#each products as product, index}
				<div class="border border-gray-300 rounded-lg p-4 bg-white">
					{#if product.image}
						<img src={product.image} alt={product.name} class="w-full h-32 object-cover rounded-lg mb-2" />
					{/if}
					<h4 class="font-bold text-lg">{product.name}</h4>
					<p class="text-gray-600 text-sm mb-2">{product.description}</p>
					<p class="text-purple-600 font-bold text-xl mb-3">₪{product.price}</p>
					<div class="flex gap-2">
						<button
							onclick={() => editProduct(index)}
							class="flex-1 bg-blue-500 text-white px-3 py-1 rounded hover:bg-blue-600 transition text-sm"
						>
							ערוך
						</button>
						<button
							onclick={() => deleteProduct(index)}
							class="flex-1 bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600 transition text-sm"
						>
							מחק
						</button>
					</div>
				</div>
			{/each}
		</div>
	{:else}
		<div class="text-center py-8 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
			<p class="text-gray-500">עדיין לא הוספת מוצרים</p>
			<p class="text-gray-400 text-sm">לחץ על "הוסף מוצר" כדי להתחיל</p>
		</div>
	{/if}
	
	<!-- Add/Edit Form Modal -->
	{#if showAddForm}
		<div class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
			<div class="bg-white rounded-2xl p-6 max-w-md w-full mx-4">
				<h3 class="text-xl font-bold mb-4">
					{editingIndex !== null ? 'ערוך מוצר' : 'הוסף מוצר חדש'}
				</h3>
				
				<div class="space-y-4">
					<div>
						<label class="block text-sm font-medium text-gray-700 mb-1">שם המוצר *</label>
						<input
							type="text"
							bind:value={currentProduct.name}
							placeholder="לדוגמה: חולצה כחולה"
							class="w-full border border-gray-300 rounded-lg px-3 py-2"
						/>
					</div>
					
					<div>
						<label class="block text-sm font-medium text-gray-700 mb-1">תיאור</label>
						<textarea
							bind:value={currentProduct.description}
							placeholder="תיאור קצר של המוצר"
							rows="3"
							class="w-full border border-gray-300 rounded-lg px-3 py-2"
						></textarea>
					</div>
					
					<div>
						<label class="block text-sm font-medium text-gray-700 mb-1">מחיר (₪) *</label>
						<input
							type="number"
							bind:value={currentProduct.price}
							placeholder="99"
							class="w-full border border-gray-300 rounded-lg px-3 py-2"
						/>
					</div>
					
					<div>
						<label class="block text-sm font-medium text-gray-700 mb-1">תמונה (URL)</label>
						<input
							type="url"
							bind:value={currentProduct.image}
							placeholder="https://example.com/image.jpg"
							class="w-full border border-gray-300 rounded-lg px-3 py-2"
						/>
					</div>
				</div>
				
				<div class="flex gap-3 mt-6">
					<button
						onclick={cancelEdit}
						class="flex-1 bg-gray-200 text-gray-800 py-2 px-4 rounded-lg hover:bg-gray-300 transition"
					>
						ביטול
					</button>
					<button
						onclick={saveProduct}
						class="flex-1 bg-purple-600 text-white py-2 px-4 rounded-lg hover:bg-purple-700 transition"
					>
						{editingIndex !== null ? 'עדכן' : 'הוסף'}
					</button>
				</div>
			</div>
		</div>
	{/if}
</div>

<style>
	.product-gallery-manager {
		background: #f9fafb;
		padding: 20px;
		border-radius: 12px;
		border: 2px solid #e5e7eb;
	}
</style>
