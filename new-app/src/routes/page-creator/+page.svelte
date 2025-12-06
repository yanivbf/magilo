<script>
	import { goto } from '$app/navigation';
	import { browser } from '$app/environment';
	import { currentUser } from '$lib/stores/auth';
	import TemplateSelector from '$lib/components/TemplateSelector.svelte';
	import DynamicForm from '$lib/components/DynamicForm.svelte';
	import ImageUploader from '$lib/components/ImageUploader.svelte';
	import { templates } from '$lib/templates/index.js';
	
	// Redirect if not logged in (browser only)
	$effect(() => {
		if (browser && !$currentUser) {
			goto('/login');
		}
	});

	// State management
	let step = $state(1); // 1: Select Template, 2: Fill Form
	let selectedTemplate = $state(null);
	let formData = $state({});
	let optionalSections = $state([]);
	let isCreating = $state(false);
	let error = $state('');

	// Create page
	async function createPage() {
		isCreating = true;
		error = '';

		try {
			// Get userId from cookie (same as server uses)
			const userId = document.cookie
				.split('; ')
				.find(row => row.startsWith('userId='))
				?.split('=')[1] || $currentUser?.id || 'temp_user';
			
			console.log('👤 Creating page with userId:', userId);
			
			const response = await fetch('/api/create-structured-page', {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json'
				},
				body: JSON.stringify({
					userId: userId,
					pageType: selectedTemplate.id,
					formData: formData,
					optionalSections: optionalSections
				})
			});

			if (!response.ok) {
				throw new Error('Failed to create page');
			}

			const result = await response.json();
			
			if (result.success) {
				console.log('✅ Page created successfully');
				console.log('📄 Slug:', result.slug);
				console.log('🔗 Redirecting to view page with edit mode:', `/view/${result.slug}`);
				
				// Redirect to view page - owner will see edit mode automatically
				goto(`/view/${result.slug}`);
			} else {
				throw new Error(result.error || 'Failed to create page');
			}
		} catch (err) {
			error = err.message;
			isCreating = false;
		}
	}

	// Go back
	function goBack() {
		if (step === 2) {
			step = 1;
			selectedTemplate = null;
		}
	}
	
	// Create page directly (no preview)
	async function handleFormSubmit(data) {
		formData = data.data;
		optionalSections = data.optionalSections || [];
		
		// Create page immediately without preview
		await createPage();
	}
</script>

<svelte:head>
	<title>יוצר דפים - AutoPage</title>
</svelte:head>

<div class="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50" dir="rtl">
	<div class="container mx-auto px-4 py-8">
		<!-- Header -->
		<div class="text-center mb-8">
			<h1 class="text-4xl font-bold text-slate-800 mb-2">יוצר דפים חכם</h1>
			<p class="text-slate-600">צור דף מקצועי בדקות ספורות</p>
		</div>

		<!-- Progress Steps -->
		<div class="flex justify-center mb-8">
			<div class="flex items-center gap-4">
				<div class="flex items-center gap-2">
					<div class="w-8 h-8 rounded-full flex items-center justify-center {step >= 1 ? 'bg-purple-600 text-white' : 'bg-gray-300 text-gray-600'}">
						1
					</div>
					<span class="text-sm font-medium {step >= 1 ? 'text-purple-600' : 'text-gray-500'}">בחר טמפלייט</span>
				</div>
				<div class="w-12 h-0.5 {step >= 2 ? 'bg-purple-600' : 'bg-gray-300'}"></div>
				<div class="flex items-center gap-2">
					<div class="w-8 h-8 rounded-full flex items-center justify-center {step >= 2 ? 'bg-purple-600 text-white' : 'bg-gray-300 text-gray-600'}">
						2
					</div>
					<span class="text-sm font-medium {step >= 2 ? 'text-purple-600' : 'text-gray-500'}">מלא פרטים ויצירה</span>
				</div>
			</div>
		</div>

		<!-- Error Message -->
		{#if error}
			<div class="max-w-2xl mx-auto mb-6 bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded-lg">
				<p class="font-medium">שגיאה:</p>
				<p>{error}</p>
			</div>
		{/if}

		<!-- Step 1: Template Selection -->
		{#if step === 1}
			<div class="max-w-6xl mx-auto">
				<TemplateSelector onSelect={(template) => {
					selectedTemplate = template;
					step = 2;
				}} />
			</div>
		{/if}

		<!-- Step 2: Form -->
		{#if step === 2 && selectedTemplate}
			<div class="max-w-4xl mx-auto">
				<div class="bg-white rounded-2xl shadow-xl p-8">
					<!-- Back Button -->
					<button
						onclick={goBack}
						class="mb-6 flex items-center gap-2 text-slate-600 hover:text-slate-800 transition-colors"
					>
						<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
							<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" />
						</svg>
						חזור לבחירת טמפלייט
					</button>

					<!-- Template Info -->
					<div class="mb-8 p-6 bg-gradient-to-r from-purple-50 to-pink-50 rounded-xl">
						<div class="flex items-center gap-4">
							<div class="text-4xl">{selectedTemplate.icon}</div>
							<div>
								<h2 class="text-2xl font-bold text-slate-800">{selectedTemplate.name}</h2>
								<p class="text-slate-600">{selectedTemplate.description}</p>
							</div>
						</div>
					</div>

					<!-- Dynamic Form -->
					<DynamicForm 
						template={selectedTemplate} 
						onSubmit={handleFormSubmit}
						disabled={isCreating}
					/>

				</div>
			</div>
		{/if}


	</div>
</div>

<style>
	:global(body) {
		margin: 0;
		padding: 0;
	}
	
	/* Editable elements styling */
	[contenteditable="true"] {
		cursor: text;
		position: relative;
	}
	
	[contenteditable="true"]:focus {
		outline: 2px solid #667eea;
		outline-offset: 2px;
		background: rgba(102, 126, 234, 0.05);
	}
	
	[contenteditable="true"]:hover::after {
		content: '✏️';
		position: absolute;
		top: -8px;
		right: -8px;
		font-size: 14px;
		background: white;
		border-radius: 50%;
		padding: 2px;
		box-shadow: 0 2px 8px rgba(0,0,0,0.2);
	}
	
	/* Image hover effect */
	img[onclick]:hover {
		box-shadow: 0 0 0 3px #667eea;
		cursor: pointer;
	}
	
	img[onclick]::after {
		content: '📷 לחץ להחלפה';
		position: absolute;
		top: 50%;
		left: 50%;
		transform: translate(-50%, -50%);
		background: rgba(0, 0, 0, 0.8);
		color: white;
		padding: 8px 16px;
		border-radius: 8px;
		opacity: 0;
		transition: opacity 0.3s;
		pointer-events: none;
	}
	
	img[onclick]:hover::after {
		opacity: 1;
	}
</style>
