<script>
	import { getContext, onMount, onDestroy } from 'svelte';
	import EditableText from '$lib/components/editing/EditableText.svelte';
	import EditableImage from '$lib/components/editing/EditableImage.svelte';
	
	/** @type {{ data: { title?: string, subtitle?: string, products: any, phone?: string }, sectionIndex?: number, editable?: boolean }} */
	let { data, sectionIndex = 0, editable = false } = $props();
	
	// Parse products if they're a string
	let products = $state([]);
	let productsContainer;
	let autoScrollInterval;
	
	// Shopping Cart State
	let cart = $state([]);
	let showCart = $state(false);
	
	$effect(() => {
		if (typeof data.products === 'string') {
			try {
				products = JSON.parse(data.products);
			} catch (e) {
				products = [];
			}
		} else if (Array.isArray(data.products)) {
			products = data.products;
		} else {
			products = [];
		}
	});
	
	// Get context
	const editModeGetter = getContext('editMode');
	const pageId = getContext('pageId');
	const saveField = getContext('saveField');
	
	// Get the actual editMode value (it's a function that returns the value)
	let editMode = $derived(typeof editModeGetter === 'function' ? editModeGetter() : editModeGetter);
	
	// Cart Functions
	function addToCart(product) {
		console.log('🛒 addToCart called with product:', product);
		const existingItem = cart.find(item => item.id === product.id);
		
		if (existingItem) {
			console.log('✅ Product already in cart, increasing quantity');
			existingItem.quantity++;
			cart = [...cart];
		} else {
			console.log('✅ Adding new product to cart');
			cart = [...cart, { ...product, quantity: 1 }];
		}
		
		console.log('📦 Cart after adding:', cart);
		showNotification(`${product.name} נוסף לעגלה!`);
	}
	
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
	
	function removeFromCart(productId) {
		cart = cart.filter(item => item.id !== productId);
	}
	
	let cartTotal = $derived(cart.reduce((sum, item) => sum + (item.price * item.quantity), 0));
	let cartCount = $derived(cart.reduce((sum, item) => sum + item.quantity, 0));
	
	// Checkout state
	let showCheckout = $state(false);
	let isSubmitting = $state(false);
	let customerInfo = $state({
		name: '',
		phone: '',
		email: '',
		address: '',
		city: '',
		notes: '',
		paymentMethod: 'credit'
	});
	
	function checkout() {
		if (cart.length === 0) {
			alert('העגלה ריקה!');
			return;
		}
		
		showCart = false;
		showCheckout = true;
	}
	
	async function submitOrder() {
		console.log('🛒 submitOrder called');
		console.log('📋 Customer info:', customerInfo);
		console.log('🛒 Cart:', cart);
		console.log('💰 Cart total:', cartTotal);
		console.log('📄 Page ID:', pageId);
		
		// Validate
		if (!customerInfo.name || !customerInfo.phone || !customerInfo.address || !customerInfo.city) {
			alert('נא למלא את כל השדות החובה (שם, טלפון, כתובת, עיר)');
			return;
		}
		
		console.log('✅ Validation passed, preparing order...');
		
		// Set loading state
		isSubmitting = true;
		
		try {
			// Get userId from cookie
			const userId = document.cookie.split('; ').find(row => row.startsWith('userId='))?.split('=')[1] || 'guest';
			console.log('👤 User ID from cookie:', userId);
			
			// Create order details
			const orderItems = cart.map(item => ({
				name: item.name,
				quantity: item.quantity,
				price: item.price,
				image: item.image || '',
				total: item.price * item.quantity
			}));
			console.log('📦 Order items prepared:', orderItems);
			
			// Prepare request body - send ONLY the essential data
			const requestBody = {
				userId: userId,
				pageId: pageId,
				customerName: customerInfo.name,
				customerPhone: customerInfo.phone,
				customerEmail: customerInfo.email || '',
				customerAddress: `${customerInfo.address}, ${customerInfo.city}`,
				shipping: true,
				paymentMethod: customerInfo.paymentMethod,
				products: orderItems,
				total: cartTotal,
				status: 'pending'
			};
			console.log('📤 Sending request body:', requestBody);
			
			// Save to Strapi as Purchase with timeout
			console.log('🌐 Sending POST request to /api/purchase...');
			const controller = new AbortController();
			const timeoutId = setTimeout(() => controller.abort(), 30000); // 30 second timeout
			
			const response = await fetch('/api/purchase', {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json'
				},
				body: JSON.stringify(requestBody),
				signal: controller.signal
			});
			
			clearTimeout(timeoutId);
			
			console.log('📥 Response status:', response.status, response.statusText);
			
			// Try to get response body regardless of status
			let responseData;
			try {
				responseData = await response.json();
				console.log('📥 Response data:', responseData);
			} catch (jsonError) {
				console.error('❌ Failed to parse response JSON:', jsonError);
				const responseText = await response.text();
				console.error('📥 Response text:', responseText);
			}
			
			if (!response.ok) {
				const errorMessage = responseData?.error || responseData?.details || 'Failed to save order';
				console.error('❌ Server returned error:', errorMessage);
				throw new Error(errorMessage);
			}
			
			console.log('✅ Order submitted successfully!');
			
			// Clear cart and close
			cart = [];
			showCheckout = false;
			showNotification('✅ ההזמנה נשלחה בהצלחה! תקבל אישור בקרוב');
			
			// Reset form
			customerInfo = {
				name: '',
				phone: '',
				email: '',
				address: '',
				city: '',
				notes: '',
				paymentMethod: 'credit'
			};
			
		} catch (error) {
			console.error('❌ Error submitting order:', error);
			console.error('❌ Error details:', {
				message: error.message,
				stack: error.stack,
				name: error.name
			});
			
			if (error.name === 'AbortError') {
				alert('⏱️ הבקשה לקחה יותר מדי זמן.\n\nייתכן שאתה מחובר לפורט שגוי.\nנסה לרענן את הדף (Ctrl+Shift+R) או לפתוח את:\nhttp://localhost:5176/dashboard');
			} else {
				alert(`שגיאה בשליחת ההזמנה: ${error.message}\n\nנסה שוב או פנה לתמיכה.`);
			}
		} finally {
			// Always reset loading state
			isSubmitting = false;
		}
	}
	
	function getPaymentMethodName(method) {
		const methods = {
			'credit': 'כרטיס אשראי',
			'bit': 'Bit',
			'paypal': 'PayPal',
			'cash': 'מזומן במשלוח'
		};
		return methods[method] || method;
	}
	
	function showNotification(message) {
		const notification = document.createElement('div');
		notification.className = 'cart-notification';
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
		}, 2000);
	}
	
	onMount(() => {
		if (!editMode && productsContainer && products.length > 1) {
			// Auto-scroll every 3 seconds
			autoScrollInterval = setInterval(() => {
				const scrollAmount = productsContainer.scrollLeft + 216; // width (200) + gap (16)
				const maxScroll = productsContainer.scrollWidth - productsContainer.clientWidth;
				
				if (scrollAmount >= maxScroll) {
					// Reset to start
					productsContainer.scrollTo({ left: 0, behavior: 'smooth' });
				} else {
					productsContainer.scrollBy({ left: 216, behavior: 'smooth' });
				}
			}, 3000);
		}
	});
	
	onDestroy(() => {
		if (autoScrollInterval) {
			clearInterval(autoScrollInterval);
		}
	});
	
	/**
	 * Save product field
	 */
	async function saveProductField(productId, field, value) {
		// Update local state
		products = products.map(p => 
			p.id === productId ? { ...p, [field]: value } : p
		);
		
		// Save to sections.X.data.products (like GallerySection does!)
		const response = await fetch('/api/update-page', {
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify({
				pageId: pageId,
				field: `sections.${sectionIndex}.data.products`,
				value: products
			})
		});
		
		if (response.ok) {
			console.log('✅ Product field saved successfully');
			showNotification('✅ נשמר בהצלחה!');
		} else {
			console.error('❌ Failed to save product field');
			showNotification('❌ שגיאה בשמירה');
		}
	}
	
	/**
	 * Handle product image upload
	 */
	async function handleImageUpload(productId, file) {
		// Step 1: Upload image to Strapi
		const uploadFormData = new FormData();
		uploadFormData.append('image', file);
		uploadFormData.append('userId', 'temp');
		uploadFormData.append('pageName', 'products');
		
		const uploadResponse = await fetch('/api/upload-image', {
			method: 'POST',
			body: uploadFormData
		});
		
		if (!uploadResponse.ok) {
			throw new Error('Failed to upload image');
		}
		
		const uploadResult = await uploadResponse.json();
		const imageUrl = uploadResult.url;
		
		// Step 2: Update the product image locally
		products = products.map(p => 
			p.id === productId ? { ...p, image: imageUrl } : p
		);
		
		// Step 3: Save to sections.X.data.products (like GallerySection does!)
		const response = await fetch('/api/update-page', {
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify({
				pageId: pageId,
				field: `sections.${sectionIndex}.data.products`,
				value: products
			})
		});
		
		if (response.ok) {
			showNotification('✅ התמונה הוחלפה בהצלחה');
		} else {
			throw new Error('Failed to update page');
		}
		
		return imageUrl;
	}
	
	/**
	 * Add new product
	 */
	async function addProduct() {
		const newProduct = {
			id: Date.now(),
			name: 'מוצר חדש',
			price: 0,
			description: 'תיאור המוצר',
			image: 'https://via.placeholder.com/400x300?text=מוצר+חדש'
		};
		
		products = [...products, newProduct];
		
		// Save to sections.X.data.products (like GallerySection does!)
		const response = await fetch('/api/update-page', {
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify({
				pageId: pageId,
				field: `sections.${sectionIndex}.data.products`,
				value: products
			})
		});
		
		if (response.ok) {
			showNotification('✅ המוצר נוסף בהצלחה');
		}
	}
	
	/**
	 * Delete product
	 */
	async function deleteProduct(productId) {
		if (!confirm('האם למחוק את המוצר?')) return;
		
		products = products.filter(p => p.id !== productId);
		
		// Save to sections.X.data.products (like GallerySection does!)
		const response = await fetch('/api/update-page', {
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify({
				pageId: pageId,
				field: `sections.${sectionIndex}.data.products`,
				value: products
			})
		});
		
		if (response.ok) {
			showNotification('✅ המוצר נמחק בהצלחה');
		}
	}
</script>

<section class="products-section">
	<div class="container">
		{#if editMode}
			<EditableText
				value={data.title || 'המוצרים שלנו'}
				onsave={(value) => saveField(`sections.${sectionIndex}.data.title`, value)}
				class="section-title"
				tag="h2"
			/>
		{:else}
			<h2 class="section-title">{data.title || 'המוצרים שלנו'}</h2>
		{/if}
		{#if data.subtitle || editMode}
			{#if editMode}
				<EditableText
					value={data.subtitle || 'תת כותרת'}
					onsave={(value) => saveField(`sections.${sectionIndex}.data.subtitle`, value)}
					class="section-subtitle"
					tag="p"
				/>
			{:else if data.subtitle}
				<p class="section-subtitle">{data.subtitle}</p>
			{/if}
		{/if}
		
		<div class="products-grid" bind:this={productsContainer}>
			{#each products as product, index}
				<div class="product-card card" style="--delay: {index * 0.1}s">
					{#if editMode}
						<button class="delete-btn" onclick={() => deleteProduct(product.id)} title="מחק מוצר">
							🗑️
						</button>
					{/if}
					
					<div class="product-image-wrapper">
						{#if editMode}
							<EditableImage
								src={product.image}
								alt={product.name}
								onUpload={(file) => handleImageUpload(product.id, file)}
								className="product-image"
							/>
						{:else}
							<img src={product.image} alt={product.name} class="product-image" />
						{/if}
					</div>
					
					<div class="product-info">
						{#if editMode}
							<EditableText
								value={product.name}
								onsave={(value) => saveProductField(product.id, 'name', value)}
								class="product-name"
								tag="h3"
							/>
						{:else}
							<h3 class="product-name">{product.name}</h3>
						{/if}
						<div class="product-footer">
							<div class="product-price-wrapper">
								<span>₪</span>
								{#if editMode}
									<EditableText
										value={String(product.price)}
										onsave={(value) => saveProductField(product.id, 'price', parseFloat(value) || 0)}
										class="product-price"
										tag="span"
									/>
								{:else}
									<span class="product-price">{product.price}</span>
								{/if}
							</div>
							<button 
								class="add-to-cart-btn"
								onclick={(e) => {
								console.log('🖱️ Button clicked!', e);
								e.stopPropagation();
								addToCart(product);
							}}
							>
								🛒 הוסף
							</button>
						</div>
					</div>
				</div>
			{/each}
			
			{#if editMode}
				<button class="add-product-btn" onclick={addProduct}>
					<div class="add-icon">➕</div>
					<div class="add-text">הוסף מוצר</div>
				</button>
			{/if}
		</div>
	</div>
</section>

<!-- Floating Cart Button -->
{#if cartCount > 0}
	<button
		onclick={() => showCart = true}
		class="floating-cart-btn"
		title="עגלת קניות"
	>
		🛒
		<span class="cart-badge">{cartCount}</span>
	</button>
{/if}

<!-- Cart Modal -->
{#if showCart}
	<div class="cart-modal-overlay" onclick={() => showCart = false}>
		<div class="cart-modal" onclick={(e) => e.stopPropagation()}>
			<div class="cart-header">
				<h3 class="cart-title">🛒 עגלת קניות</h3>
				<button
					onclick={() => showCart = false}
					class="close-btn"
					title="סגור"
				>
					×
				</button>
			</div>
			
			{#if cart.length === 0}
				<div class="empty-cart">
					<p class="empty-cart-text">העגלה ריקה</p>
					<p class="empty-cart-subtext">הוסף מוצרים כדי להתחיל</p>
				</div>
			{:else}
				<div class="cart-items">
					{#each cart as item}
						<div class="cart-item">
							{#if item.image}
								<img 
									src={item.image} 
									alt={item.name} 
									class="cart-item-image"
								/>
							{:else}
								<div class="cart-item-image-placeholder">
									<svg class="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
										<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
									</svg>
								</div>
							{/if}
							
							<div class="cart-item-info">
								<h4 class="cart-item-name">{item.name}</h4>
								<p class="cart-item-price">₪{item.price}</p>
							</div>
							
							<div class="cart-item-controls">
								<button
									onclick={() => updateQuantity(item.id, -1)}
									class="quantity-btn"
									title="הפחת"
								>
									−
								</button>
								<span class="quantity">{item.quantity}</span>
								<button
									onclick={() => updateQuantity(item.id, 1)}
									class="quantity-btn"
									title="הוסף"
								>
									+
								</button>
							</div>
							
							<button
								onclick={() => removeFromCart(item.id)}
								class="remove-btn"
								title="הסר מהעגלה"
							>
								🗑️
							</button>
						</div>
					{/each}
				</div>
				
				<div class="cart-footer">
					<div class="cart-total">
						<span class="total-label">סה"כ:</span>
						<span class="total-amount">₪{cartTotal}</span>
					</div>
					<button
						onclick={checkout}
						class="checkout-btn"
					>
						המשך לתשלום דרך WhatsApp
					</button>
				</div>
			{/if}
		</div>
	</div>
{/if}

<!-- Checkout Form Modal -->
{#if showCheckout}
	<div class="cart-modal-overlay" onclick={() => showCheckout = false}>
		<div class="checkout-modal" onclick={(e) => e.stopPropagation()}>
			<div class="cart-header">
				<h3 class="cart-title">📋 השלמת הזמנה</h3>
				<button
					onclick={() => showCheckout = false}
					class="close-btn"
					title="סגור"
				>
					×
				</button>
			</div>
			
			<div class="checkout-content">
				<!-- Order Summary -->
				<div class="order-summary">
					<h4 class="summary-title">סיכום הזמנה</h4>
					<div class="summary-items">
						{#each cart as item}
							<div class="summary-item">
								<span>{item.name} x{item.quantity}</span>
								<span>₪{item.price * item.quantity}</span>
							</div>
						{/each}
					</div>
					<div class="summary-total">
						<span>סה"כ לתשלום:</span>
						<span class="total-price">₪{cartTotal}</span>
					</div>
				</div>
				
				<!-- Customer Form -->
				<form class="checkout-form" onsubmit={(e) => { 
					console.log('📝 Form submitted!', e);
					e.preventDefault(); 
					submitOrder(); 
				}}>
					<div class="form-group">
						<label for="name">שם מלא *</label>
						<input
							type="text"
							id="name"
							bind:value={customerInfo.name}
							placeholder="הזן שם מלא"
							required
						/>
					</div>
					
					<div class="form-row">
						<div class="form-group">
							<label for="phone">טלפון *</label>
							<input
								type="tel"
								id="phone"
								bind:value={customerInfo.phone}
								placeholder="050-1234567"
								required
							/>
						</div>
						
						<div class="form-group">
							<label for="email">אימייל</label>
							<input
								type="email"
								id="email"
								bind:value={customerInfo.email}
								placeholder="example@email.com"
							/>
						</div>
					</div>
					
					<div class="form-group">
						<label for="address">כתובת למשלוח *</label>
						<input
							type="text"
							id="address"
							bind:value={customerInfo.address}
							placeholder="רחוב ומספר בית"
							required
						/>
					</div>
					
					<div class="form-group">
						<label for="city">עיר *</label>
						<input
							type="text"
							id="city"
							bind:value={customerInfo.city}
							placeholder="תל אביב"
							required
						/>
					</div>
					
					<div class="form-group">
						<label for="payment">אמצעי תשלום *</label>
						<select id="payment" bind:value={customerInfo.paymentMethod}>
							<option value="credit">💳 כרטיס אשראי</option>
							<option value="bit">📱 Bit</option>
							<option value="paypal">🌐 PayPal</option>
							<option value="cash">💵 מזומן במשלוח</option>
						</select>
					</div>
					
					<div class="form-group">
						<label for="notes">הערות להזמנה</label>
						<textarea
							id="notes"
							bind:value={customerInfo.notes}
							placeholder="הערות מיוחדות, בקשות..."
							rows="3"
						></textarea>
					</div>
					
					<button type="submit" class="submit-order-btn" disabled={isSubmitting}>
						{#if isSubmitting}
							<span class="loading-spinner"></span>
							<span>מעבד הזמנה...</span>
						{:else}
							✅ שלח הזמנה
						{/if}
					</button>
				</form>
			</div>
		</div>
	</div>
{/if}

<style>
	.products-section {
		padding: 3rem 0;
		background-color: transparent !important;
		position: relative;
		overflow: hidden;
		direction: rtl;
	}
	
	.container {
		max-width: 1200px;
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
	}
	
	.products-grid {
		display: flex;
		gap: 1rem;
		overflow-x: auto;
		-webkit-overflow-scrolling: touch;
		padding: 0.5rem 0;
		scrollbar-width: thin;
		scrollbar-color: rgba(102, 126, 234, 0.3) transparent;
	}
	
	.products-grid::-webkit-scrollbar {
		height: 8px;
	}
	
	.products-grid::-webkit-scrollbar-track {
		background: rgba(102, 126, 234, 0.1);
		border-radius: 10px;
	}
	
	.products-grid::-webkit-scrollbar-thumb {
		background: rgba(102, 126, 234, 0.3);
		border-radius: 10px;
	}
	
	.products-grid::-webkit-scrollbar-thumb:hover {
		background: rgba(102, 126, 234, 0.5);
	}
	
	.product-card {
		flex-shrink: 0;
		width: 200px;
		border-radius: 16px;
		overflow: hidden;
		transition: all 0.4s ease;
		position: relative;
		animation: fadeInUp 0.6s ease-out backwards;
		animation-delay: var(--delay);
		display: flex;
		flex-direction: column;
		/* ✅ אפס padding ו-margin - בלי רווחים! */
		padding: 0 !important;
		margin: 0 !important;
		/* Let DynamicDesignWrapper control background and colors */
	}
	
	.product-card:hover {
		transform: translateY(-10px);
	}
	
	.delete-btn {
		position: absolute;
		top: 10px;
		left: 10px;
		z-index: 10;
		background: rgba(239, 68, 68, 0.95);
		border: none;
		border-radius: 50%;
		width: 40px;
		height: 40px;
		display: flex;
		align-items: center;
		justify-content: center;
		cursor: pointer;
		font-size: 1.2rem;
		transition: all 0.3s ease;
		box-shadow: 0 4px 15px rgba(239, 68, 68, 0.3);
	}
	
	.delete-btn:hover {
		transform: scale(1.1);
		background: rgba(220, 38, 38, 1);
	}
	
	.product-image-wrapper {
		position: relative;
		width: 200px;
		height: 200px;
		overflow: hidden;
		background: var(--color-bg-alt);
		flex-shrink: 0;
		/* ✅ אפס margin ו-padding - בלי רווחים! */
		margin: 0 !important;
		padding: 0 !important;
		/* ✅ בלי border-radius בפינות העליונות כדי להתאים לכרטיס */
		border-radius: 16px 16px 0 0;
	}
	
	.product-image {
		width: 100%;
		height: 100%;
		object-fit: cover; /* ✅ התמונה תכסה את כל השטח */
		object-position: center; /* ✅ מרכז את התמונה */
		display: block;
		transition: transform 0.4s ease;
	}
	
	.product-card:hover .product-image {
		transform: scale(1.1);
	}
	
	.product-info {
		padding: 1rem;
		display: flex;
		flex-direction: column;
		gap: 0.75rem;
	}
	
	.product-name {
		font-size: 0.95rem;
		font-weight: 700;
		margin: 0;
		color: #1f2937; /* ✅ שחור רגיל, לא צבעוני */
	}
	
	.product-footer {
		display: flex;
		align-items: center;
		justify-content: space-between;
		gap: 0.5rem;
	}
	
	.product-price-wrapper {
		display: flex;
		align-items: center;
		gap: 0.25rem;
		font-size: 1.3rem;
		font-weight: 800;
		color: #1f2937; /* ✅ מחיר בשחור רגיל */
	}
	
	.product-price {
		display: inline;
	}
	
	.add-to-cart-btn {
		background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
		color: white;
		border: none;
		padding: 0.4rem 0.8rem;
		border-radius: 12px;
		font-weight: 700;
		font-size: 0.8rem;
		cursor: pointer;
		transition: all 0.3s ease;
		box-shadow: 0 4px 15px rgba(102, 126, 234, 0.3);
		white-space: nowrap;
	}
	
	.add-to-cart-btn:hover {
		transform: translateY(-2px);
		box-shadow: 0 6px 20px rgba(102, 126, 234, 0.4);
	}
	
	.add-product-btn {
		flex-shrink: 0;
		width: 200px;
		height: 200px;
		background: transparent;
		border: 3px dashed currentColor;
		border-radius: 16px;
		padding: 1.5rem;
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		gap: 0.75rem;
		cursor: pointer;
		transition: all 0.3s ease;
	}
	
	.add-product-btn:hover {
		transform: translateY(-10px);
		border-color: #764ba2;
		box-shadow: 0 20px 60px rgba(102, 126, 234, 0.2);
		background: rgba(102, 126, 234, 0.05);
	}
	
	.add-icon {
		font-size: 2.5rem;
		background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
		-webkit-background-clip: text;
		-webkit-text-fill-color: transparent;
		background-clip: text;
	}
	
	.add-text {
		font-size: 1rem;
		font-weight: 700;
		background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
		-webkit-background-clip: text;
		-webkit-text-fill-color: transparent;
		background-clip: text;
	}
	
	@keyframes fadeInUp {
		from {
			opacity: 0;
			transform: translateY(30px);
		}
		to {
			opacity: 1;
			transform: translateY(0);
		}
	}
	
	/* Floating Cart Button */
	.floating-cart-btn {
		position: fixed;
		bottom: 225px;
		left: 30px;
		width: 60px;
		height: 60px;
		background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
		border: none;
		border-radius: 50%;
		color: white;
		font-size: 1.5rem;
		cursor: pointer;
		box-shadow: 0 4px 20px rgba(102, 126, 234, 0.4);
		z-index: 9997;
		transition: all 0.3s ease;
		display: flex;
		align-items: center;
		justify-content: center;
	}
	
	.floating-cart-btn:hover {
		transform: scale(1.1);
		box-shadow: 0 6px 30px rgba(102, 126, 234, 0.6);
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
		box-shadow: 0 2px 8px rgba(239, 68, 68, 0.4);
	}
	
	/* Cart Modal */
	.cart-modal-overlay {
		position: fixed;
		inset: 0;
		background: rgba(0, 0, 0, 0.5);
		display: flex;
		align-items: center;
		justify-content: center;
		z-index: 10000;
		padding: 1rem;
		animation: fadeIn 0.3s ease;
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
		animation: slideUp 0.3s ease;
		direction: rtl;
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
	
	.empty-cart {
		text-align: center;
		padding: 4rem 2rem;
	}
	
	.empty-cart-text {
		font-size: 1.25rem;
		color: #9ca3af;
		margin: 0 0 0.5rem 0;
	}
	
	.empty-cart-subtext {
		font-size: 0.95rem;
		color: #d1d5db;
		margin: 0;
	}
	
	.cart-items {
		flex: 1;
		overflow-y: auto;
		padding: 1.5rem;
	}
	
	.cart-item {
		display: flex;
		align-items: center;
		gap: 1rem;
		padding: 1rem;
		border-bottom: 1px solid #e5e7eb;
		transition: background 0.2s;
	}
	
	.cart-item:hover {
		background: #f9fafb;
	}
	
	.cart-item:last-child {
		border-bottom: none;
	}
	
	.cart-item-image {
		width: 80px;
		height: 80px;
		object-fit: cover;
		border-radius: 12px;
		box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
	}
	
	.cart-item-image-placeholder {
		width: 80px;
		height: 80px;
		background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
		border-radius: 12px;
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
		color: #1f2937;
		font-size: 1rem;
	}
	
	.cart-item-price {
		color: #667eea;
		font-weight: bold;
		margin: 0;
		font-size: 1.1rem;
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
		font-size: 1.1rem;
		transition: all 0.2s;
		display: flex;
		align-items: center;
		justify-content: center;
	}
	
	.quantity-btn:hover {
		background: #e5e7eb;
		transform: scale(1.1);
	}
	
	.quantity {
		min-width: 30px;
		text-align: center;
		font-weight: bold;
		font-size: 1rem;
	}
	
	.remove-btn {
		background: none;
		border: none;
		cursor: pointer;
		font-size: 1.3rem;
		padding: 0.5rem;
		border-radius: 8px;
		transition: all 0.2s;
	}
	
	.remove-btn:hover {
		background: #fee2e2;
		transform: scale(1.1);
	}
	
	.cart-footer {
		padding: 1.5rem;
		border-top: 1px solid #e5e7eb;
		background: #f9fafb;
		border-radius: 0 0 20px 20px;
	}
	
	.cart-total {
		display: flex;
		justify-content: space-between;
		align-items: center;
		margin-bottom: 1rem;
		font-size: 1.5rem;
		font-weight: bold;
	}
	
	.total-label {
		color: #1f2937;
	}
	
	.total-amount {
		background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
		-webkit-background-clip: text;
		-webkit-text-fill-color: transparent;
		background-clip: text;
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
		transition: all 0.3s ease;
		box-shadow: 0 4px 15px rgba(102, 126, 234, 0.3);
	}
	
	.checkout-btn:hover {
		transform: translateY(-2px);
		box-shadow: 0 8px 25px rgba(102, 126, 234, 0.4);
	}
	
	/* Cart Notification */
	:global(.cart-notification) {
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
	
	:global(.cart-notification.show) {
		opacity: 1;
		transform: translateX(-50%) translateY(0);
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
	
	/* Checkout Modal */
	.checkout-modal {
		background: white;
		border-radius: 20px;
		max-width: 700px;
		width: 100%;
		max-height: 85vh;
		display: flex;
		flex-direction: column;
		box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
		animation: slideUp 0.3s ease;
		direction: rtl;
	}
	
	.checkout-content {
		flex: 1;
		overflow-y: auto;
		padding: 1.5rem;
	}
	
	.order-summary {
		background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
		padding: 1.5rem;
		border-radius: 12px;
		margin-bottom: 2rem;
	}
	
	.summary-title {
		font-size: 1.1rem;
		font-weight: bold;
		margin: 0 0 1rem 0;
		color: #1f2937;
	}
	
	.summary-items {
		margin-bottom: 1rem;
	}
	
	.summary-item {
		display: flex;
		justify-content: space-between;
		padding: 0.5rem 0;
		border-bottom: 1px solid rgba(0, 0, 0, 0.1);
		font-size: 0.95rem;
	}
	
	.summary-total {
		display: flex;
		justify-content: space-between;
		padding-top: 1rem;
		border-top: 2px solid rgba(102, 126, 234, 0.3);
		font-size: 1.2rem;
		font-weight: bold;
	}
	
	.total-price {
		background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
		-webkit-background-clip: text;
		-webkit-text-fill-color: transparent;
		background-clip: text;
	}
	
	.checkout-form {
		display: flex;
		flex-direction: column;
		gap: 1rem;
	}
	
	.form-row {
		display: grid;
		grid-template-columns: 1fr 1fr;
		gap: 1rem;
	}
	
	.form-group {
		display: flex;
		flex-direction: column;
		gap: 0.5rem;
	}
	
	.form-group label {
		font-weight: 600;
		color: #1f2937;
		font-size: 0.95rem;
	}
	
	.form-group input,
	.form-group select,
	.form-group textarea {
		padding: 0.75rem;
		border: 2px solid #e5e7eb;
		border-radius: 8px;
		font-size: 1rem;
		transition: all 0.2s;
		font-family: 'Rubik', sans-serif;
	}
	
	.form-group input:focus,
	.form-group select:focus,
	.form-group textarea:focus {
		outline: none;
		border-color: #667eea;
		box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
	}
	
	.form-group textarea {
		resize: vertical;
	}
	
	.submit-order-btn {
		width: 100%;
		background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
		color: white;
		padding: 1rem;
		border-radius: 12px;
		border: none;
		font-size: 1.1rem;
		font-weight: bold;
		cursor: pointer;
		transition: all 0.3s ease;
		box-shadow: 0 4px 15px rgba(102, 126, 234, 0.3);
		margin-top: 1rem;
		display: flex;
		align-items: center;
		justify-content: center;
		gap: 0.5rem;
	}
	
	.submit-order-btn:hover:not(:disabled) {
		transform: translateY(-2px);
		box-shadow: 0 8px 25px rgba(102, 126, 234, 0.4);
	}
	
	.submit-order-btn:disabled {
		opacity: 0.7;
		cursor: not-allowed;
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
	
	@media (max-width: 768px) {
		.product-card,
		.add-product-btn {
			width: 180px;
		}
		
		.product-image-wrapper {
			width: 180px; /* ✅ רוחב קבוע במובייל */
			height: 180px; /* ✅ גובה קבוע במובייל */
		}
		
		.section-title {
			font-size: 2rem;
		}
		
		.floating-cart-btn {
			bottom: 205px;
			left: 20px;
			width: 50px;
			height: 50px;
			font-size: 1.2rem;
		}
		
		.cart-badge {
			width: 20px;
			height: 20px;
			font-size: 0.7rem;
		}
		
		.cart-modal,
		.checkout-modal {
			max-height: 90vh;
		}
		
		.cart-item {
			gap: 0.75rem;
			padding: 0.75rem;
		}
		
		.cart-item-image,
		.cart-item-image-placeholder {
			width: 60px;
			height: 60px;
		}
		
		.cart-item-name {
			font-size: 0.9rem;
		}
		
		.cart-item-price {
			font-size: 1rem;
		}
		
		.form-row {
			grid-template-columns: 1fr;
		}
	}
</style>
