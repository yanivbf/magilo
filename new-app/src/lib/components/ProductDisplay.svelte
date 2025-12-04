<script>
	// Product Display Component for Store Pages (View Mode)
	let { products = [], pageId } = $props();
	
	let cart = $state([]);
	let showCart = $state(false);
	
	function addToCart(product) {
		const existingItem = cart.find(item => item.id === product.id);
		
		if (existingItem) {
			existingItem.quantity++;
		} else {
			cart = [...cart, { ...product, quantity: 1 }];
		}
		
		showNotification('המוצר נוסף לעגלה!');
	}
	
	function removeFromCart(productId) {
		cart = cart.filter(item => item.id !== productId);
	}
	
	function updateQuantity(productId, delta) {
		const item = cart.find(i => i.id === productId);
		if (item) {
			item.quantity += delta;
			if (item.quantity <= 0) {
				removeFromCart(productId);
			}
		}
		cart = [...cart];
	}
	
	function getCartTotal() {
		return cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
	}
	
	function getCartCount() {
		return cart.reduce((sum, item) => sum + item.quantity, 0);
	}
	
	function checkout() {
		if (cart.length === 0) {
			alert('העגלה ריקה!');
			return;
		}
		
		// Create WhatsApp message
		const message = cart.map(item => 
			`${item.name} x${item.quantity} - ₪${item.price * item.quantity}`
		).join('\n');
		const total = getCartTotal();
		
		// You can customize this with actual phone number from page data
		const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(`היי! אני רוצה להזמין:\n${message}\n\nסה"כ: ₪${total}`)}`;
		
		window.open(whatsappUrl, '_blank');
	}
	
	function showNotification(message) {
		// Simple notification - you can enhance this
		const notification = document.createElement('div');
		notification.className = 'fixed top-4 right-4 bg-green-500 text-white px-6 py-3 rounded-lg shadow-lg z-50 animate-fade-in';
		notification.textContent = message;
		document.body.appendChild(notification);
		
		setTimeout(() => {
			notification.remove();
		}, 2000);
	}
</script>

<!-- Products Grid -->
<div class="products-grid">
	{#each products as product, index}
		<div class="product-card">
			{#if product.image}
				<img src={product.image} alt={product.name} class="product-image" />
			{:else}
				<div class="product-image-placeholder">
					<span class="text-6xl">🛍️</span>
				</div>
			{/if}
			<div class="product-info">
				<h3 class="product-name">{product.name}</h3>
				{#if product.description}
					<p class="product-description">{product.description}</p>
				{/if}
				<div class="product-footer">
					<span class="product-price">₪{product.price}</span>
					<button
						onclick={() => addToCart({ ...product, id: index })}
						class="add-to-cart-btn"
					>
						הוסף לעגלה
					</button>
				</div>
			</div>
		</div>
	{/each}
</div>

<!-- Floating Cart Button -->
{#if getCartCount() > 0}
	<button
		onclick={() => showCart = true}
		class="cart-button"
	>
		<svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
			<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
		</svg>
		<span class="cart-badge">{getCartCount()}</span>
	</button>
{/if}

<!-- Cart Modal -->
{#if showCart}
	<div class="cart-modal-overlay" onclick={() => showCart = false}>
		<div class="cart-modal" onclick={(e) => e.stopPropagation()}>
			<div class="cart-header">
				<h3 class="cart-title">עגלת קניות</h3>
				<button onclick={() => showCart = false} class="close-btn">
					<svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
						<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
					</svg>
				</button>
			</div>
			
			<div class="cart-items">
				{#if cart.length === 0}
					<p class="empty-cart">העגלה ריקה</p>
				{:else}
					{#each cart as item}
						<div class="cart-item">
							{#if item.image}
								<img src={item.image} alt={item.name} class="cart-item-image" />
							{:else}
								<div class="cart-item-image-placeholder">🛍️</div>
							{/if}
							<div class="cart-item-info">
								<h4 class="cart-item-name">{item.name}</h4>
								<p class="cart-item-price">₪{item.price}</p>
							</div>
							<div class="cart-item-controls">
								<button onclick={() => updateQuantity(item.id, -1)} class="quantity-btn">-</button>
								<span class="quantity">{item.quantity}</span>
								<button onclick={() => updateQuantity(item.id, 1)} class="quantity-btn">+</button>
							</div>
							<button onclick={() => removeFromCart(item.id)} class="remove-btn">
								<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
									<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
								</svg>
							</button>
						</div>
					{/each}
				{/if}
			</div>
			
			{#if cart.length > 0}
				<div class="cart-footer">
					<div class="cart-total">
						<span class="total-label">סה"כ:</span>
						<span class="total-amount">₪{getCartTotal()}</span>
					</div>
					<button onclick={checkout} class="checkout-btn">
						המשך לתשלום
					</button>
				</div>
			{/if}
		</div>
	</div>
{/if}

<style>
	.products-grid {
		display: grid;
		grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
		gap: 2rem;
		padding: 1rem 0;
	}
	
	.product-card {
		background: white;
		border-radius: 16px;
		overflow: hidden;
		box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
		transition: transform 0.3s, box-shadow 0.3s;
	}
	
	.product-card:hover {
		transform: translateY(-8px);
		box-shadow: 0 8px 30px rgba(0, 0, 0, 0.15);
	}
	
	.product-image {
		width: 100%;
		height: 250px;
		object-fit: cover;
	}
	
	.product-image-placeholder {
		width: 100%;
		height: 250px;
		background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
		display: flex;
		align-items: center;
		justify-content: center;
	}
	
	.product-info {
		padding: 1.5rem;
	}
	
	.product-name {
		font-size: 1.25rem;
		font-weight: bold;
		margin: 0 0 0.5rem 0;
		color: #1f2937;
	}
	
	.product-description {
		font-size: 0.9rem;
		color: #6b7280;
		margin: 0 0 1rem 0;
		line-height: 1.5;
	}
	
	.product-footer {
		display: flex;
		justify-content: space-between;
		align-items: center;
		gap: 1rem;
	}
	
	.product-price {
		font-size: 1.5rem;
		font-weight: bold;
		color: #8b5cf6;
	}
	
	.add-to-cart-btn {
		background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
		color: white;
		padding: 0.75rem 1.5rem;
		border-radius: 50px;
		border: none;
		font-weight: bold;
		cursor: pointer;
		transition: transform 0.2s, box-shadow 0.2s;
		white-space: nowrap;
	}
	
	.add-to-cart-btn:hover {
		transform: scale(1.05);
		box-shadow: 0 4px 15px rgba(102, 126, 234, 0.4);
	}
	
	/* Cart Button */
	.cart-button {
		position: fixed;
		bottom: 2rem;
		right: 2rem;
		width: 60px;
		height: 60px;
		background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
		border-radius: 50%;
		border: none;
		color: white;
		cursor: pointer;
		box-shadow: 0 4px 20px rgba(102, 126, 234, 0.4);
		display: flex;
		align-items: center;
		justify-content: center;
		z-index: 100;
		transition: transform 0.3s;
	}
	
	.cart-button:hover {
		transform: scale(1.1);
	}
	
	.cart-badge {
		position: absolute;
		top: -5px;
		right: -5px;
		background: #ef4444;
		color: white;
		border-radius: 50%;
		width: 24px;
		height: 24px;
		display: flex;
		align-items: center;
		justify-content: center;
		font-size: 0.75rem;
		font-weight: bold;
	}
	
	/* Cart Modal */
	.cart-modal-overlay {
		position: fixed;
		inset: 0;
		background: rgba(0, 0, 0, 0.5);
		display: flex;
		align-items: center;
		justify-content: center;
		z-index: 1000;
		padding: 1rem;
	}
	
	.cart-modal {
		background: white;
		border-radius: 20px;
		max-width: 600px;
		width: 100%;
		max-height: 80vh;
		display: flex;
		flex-direction: column;
		box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
	}
	
	.cart-header {
		display: flex;
		justify-content: space-between;
		align-items: center;
		padding: 1.5rem;
		border-bottom: 1px solid #e5e7eb;
	}
	
	.cart-title {
		font-size: 1.5rem;
		font-weight: bold;
		margin: 0;
	}
	
	.close-btn {
		background: none;
		border: none;
		cursor: pointer;
		color: #6b7280;
		padding: 0.5rem;
		border-radius: 8px;
		transition: background 0.2s;
	}
	
	.close-btn:hover {
		background: #f3f4f6;
	}
	
	.cart-items {
		flex: 1;
		overflow-y: auto;
		padding: 1.5rem;
	}
	
	.empty-cart {
		text-align: center;
		color: #9ca3af;
		padding: 3rem 0;
	}
	
	.cart-item {
		display: flex;
		align-items: center;
		gap: 1rem;
		padding: 1rem;
		border-bottom: 1px solid #e5e7eb;
	}
	
	.cart-item:last-child {
		border-bottom: none;
	}
	
	.cart-item-image {
		width: 80px;
		height: 80px;
		object-fit: cover;
		border-radius: 8px;
	}
	
	.cart-item-image-placeholder {
		width: 80px;
		height: 80px;
		background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
		border-radius: 8px;
		display: flex;
		align-items: center;
		justify-content: center;
		font-size: 2rem;
	}
	
	.cart-item-info {
		flex: 1;
	}
	
	.cart-item-name {
		font-weight: bold;
		margin: 0 0 0.25rem 0;
	}
	
	.cart-item-price {
		color: #8b5cf6;
		font-weight: bold;
		margin: 0;
	}
	
	.cart-item-controls {
		display: flex;
		align-items: center;
		gap: 0.5rem;
	}
	
	.quantity-btn {
		width: 32px;
		height: 32px;
		border-radius: 50%;
		border: none;
		background: #f3f4f6;
		cursor: pointer;
		font-weight: bold;
		transition: background 0.2s;
	}
	
	.quantity-btn:hover {
		background: #e5e7eb;
	}
	
	.quantity {
		min-width: 30px;
		text-align: center;
		font-weight: bold;
	}
	
	.remove-btn {
		background: none;
		border: none;
		cursor: pointer;
		color: #ef4444;
		padding: 0.5rem;
		border-radius: 8px;
		transition: background 0.2s;
	}
	
	.remove-btn:hover {
		background: #fee2e2;
	}
	
	.cart-footer {
		padding: 1.5rem;
		border-top: 1px solid #e5e7eb;
	}
	
	.cart-total {
		display: flex;
		justify-content: space-between;
		align-items: center;
		margin-bottom: 1rem;
		font-size: 1.25rem;
		font-weight: bold;
	}
	
	.total-amount {
		color: #8b5cf6;
	}
	
	.checkout-btn {
		width: 100%;
		background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
		color: white;
		padding: 1rem;
		border-radius: 12px;
		border: none;
		font-size: 1.1rem;
		font-weight: bold;
		cursor: pointer;
		transition: transform 0.2s, box-shadow 0.2s;
	}
	
	.checkout-btn:hover {
		transform: translateY(-2px);
		box-shadow: 0 8px 20px rgba(102, 126, 234, 0.4);
	}
	
	@keyframes fade-in {
		from {
			opacity: 0;
			transform: translateY(-10px);
		}
		to {
			opacity: 1;
			transform: translateY(0);
		}
	}
	
	.animate-fade-in {
		animation: fade-in 0.3s ease-out;
	}
</style>
