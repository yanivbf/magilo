<script>
	// Store Products Display with Shopping Cart
	let { products = [], pageData } = $props();
	
	let cart = $state([]);
	let showCart = $state(false);
	
	// Add to cart
	function addToCart(product) {
		const existingItem = cart.find(item => item.id === product.id);
		
		if (existingItem) {
			existingItem.quantity++;
		} else {
			cart = [...cart, { ...product, quantity: 1 }];
		}
		
		// Show notification
		showNotification(`${product.name} נוסף לעגלה!`);
	}
	
	// Update quantity
	function updateQuantity(productId, delta) {
		const item = cart.find(i => i.id === productId);
		if (item) {
			item.quantity += delta;
			if (item.quantity <= 0) {
				removeFromCart(productId);
			} else {
				cart = [...cart];
			}
		}
	}
	
	// Remove from cart
	function removeFromCart(productId) {
		cart = cart.filter(item => item.id !== productId);
	}
	
	// Calculate total
	$derived cartTotal = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
	$derived cartCount = cart.reduce((sum, item) => sum + item.quantity, 0);
	
	// Checkout via WhatsApp
	function checkout() {
		if (cart.length === 0) {
			alert('העגלה ריקה!');
			return;
		}
		
		const message = cart.map(item => 
			`${item.name} x${item.quantity} - ₪${item.price * item.quantity}`
		).join('%0A');
		
		const whatsappNumber = pageData.phone?.replace(/^0/, '').replace(/[^0-9]/g, '') || '';
		const whatsappUrl = `https://wa.me/972${whatsappNumber}?text=היי! אני רוצה להזמין:%0A${message}%0A%0Aסה"כ: ₪${cartTotal}`;
		
		window.open(whatsappUrl, '_blank');
	}
	
	// Show notification
	function showNotification(message) {
		const notification = document.createElement('div');
		notification.className = 'fixed top-4 left-1/2 transform -translate-x-1/2 bg-green-500 text-white px-6 py-3 rounded-lg shadow-lg z-50 animate-bounce';
		notification.textContent = message;
		document.body.appendChild(notification);
		
		setTimeout(() => {
			notification.remove();
		}, 2000);
	}
</script>

<!-- Products Grid -->
<div class="products-grid grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
	{#each products as product}
		<div class="product-card bg-white rounded-2xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-300 hover:-translate-y-2">
			{#if product.image}
				<img 
					src={product.image} 
					alt={product.name} 
					class="w-full h-64 object-cover"
				/>
			{:else}
				<div class="w-full h-64 bg-gradient-to-br from-purple-400 to-pink-400 flex items-center justify-center">
					<span class="text-white text-6xl">🛍️</span>
				</div>
			{/if}
			
			<div class="p-6">
				<h3 class="text-xl font-bold mb-2 text-gray-800">{product.name}</h3>
				
				{#if product.description}
					<p class="text-gray-600 text-sm mb-4 line-clamp-2">{product.description}</p>
				{/if}
				
				<div class="flex justify-between items-center">
					<span class="text-3xl font-bold text-purple-600">₪{product.price}</span>
					<button
						onclick={() => addToCart(product)}
						class="bg-gradient-to-r from-purple-600 to-pink-600 text-white px-6 py-3 rounded-full font-bold hover:shadow-lg transition-all duration-300 hover:scale-105"
					>
						הוסף לעגלה
					</button>
				</div>
			</div>
		</div>
	{/each}
</div>

<!-- Floating Cart Button -->
{#if cartCount > 0}
	<button
		onclick={() => showCart = true}
		class="fixed bottom-6 left-6 w-16 h-16 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-full shadow-2xl flex items-center justify-center text-2xl hover:scale-110 transition-transform duration-300 z-40"
	>
		🛒
		<span class="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-7 h-7 flex items-center justify-center text-sm font-bold">
			{cartCount}
		</span>
	</button>
{/if}

<!-- Cart Modal -->
{#if showCart}
	<div class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
		<div class="bg-white rounded-2xl p-8 max-w-2xl w-full max-h-[80vh] overflow-y-auto">
			<div class="flex justify-between items-center mb-6">
				<h3 class="text-3xl font-bold text-gray-800">🛒 עגלת קניות</h3>
				<button
					onclick={() => showCart = false}
					class="text-gray-500 hover:text-gray-700 text-4xl leading-none"
				>
					×
				</button>
			</div>
			
			{#if cart.length === 0}
				<div class="text-center py-12">
					<p class="text-gray-500 text-xl">העגלה ריקה</p>
					<p class="text-gray-400 mt-2">הוסף מוצרים כדי להתחיל</p>
				</div>
			{:else}
				<div class="space-y-4 mb-6">
					{#each cart as item}
						<div class="flex items-center gap-4 border-b pb-4">
							{#if item.image}
								<img 
									src={item.image} 
									alt={item.name} 
									class="w-24 h-24 object-cover rounded-lg"
								/>
							{:else}
								<div class="w-24 h-24 bg-gradient-to-br from-purple-400 to-pink-400 rounded-lg flex items-center justify-center text-3xl">
									🛍️
								</div>
							{/if}
							
							<div class="flex-1">
								<h4 class="font-bold text-lg text-gray-800">{item.name}</h4>
								<p class="text-purple-600 font-bold text-xl">₪{item.price}</p>
							</div>
							
							<div class="flex items-center gap-3">
								<button
									onclick={() => updateQuantity(item.id, -1)}
									class="w-10 h-10 bg-gray-200 rounded-full hover:bg-gray-300 transition font-bold text-xl"
								>
									−
								</button>
								<span class="w-12 text-center font-bold text-xl">{item.quantity}</span>
								<button
									onclick={() => updateQuantity(item.id, 1)}
									class="w-10 h-10 bg-gray-200 rounded-full hover:bg-gray-300 transition font-bold text-xl"
								>
									+
								</button>
							</div>
							
							<button
								onclick={() => removeFromCart(item.id)}
								class="text-red-500 hover:text-red-700 text-2xl"
							>
								🗑️
							</button>
						</div>
					{/each}
				</div>
				
				<div class="border-t pt-6">
					<div class="flex justify-between items-center text-2xl font-bold mb-6">
						<span class="text-gray-800">סה"כ:</span>
						<span class="text-purple-600">₪{cartTotal}</span>
					</div>
					<button
						onclick={checkout}
						class="w-full bg-gradient-to-r from-purple-600 to-pink-600 text-white py-4 rounded-xl font-bold text-xl hover:shadow-2xl transition-all duration-300 hover:scale-105"
					>
						המשך לתשלום דרך WhatsApp
					</button>
				</div>
			{/if}
		</div>
	</div>
{/if}

<style>
	.line-clamp-2 {
		display: -webkit-box;
		-webkit-line-clamp: 2;
		-webkit-box-orient: vertical;
		overflow: hidden;
	}
</style>
