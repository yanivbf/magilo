<script>
	import ProductGallery from './ProductGallery.svelte';
	import ImageGallery from './ImageGallery.svelte';
	import BookingCalendar from './BookingCalendar.svelte';
	import DaySettingsManager from './DaySettingsManager.svelte';
	
	let { template, onSubmit, onBack, existingData = null, editMode = false } = $props();
	
	// Initialize formData with proper defaults BEFORE first render
	function initializeFormData() {
		const initialData = {};
		
		// Get all fields - support both flat fields and sections structure
		const allFields = template.fields || [];
		if (template.sections) {
			template.sections.forEach(section => {
				if (section.fields) {
					allFields.push(...section.fields);
				}
			});
		}
		
		// Initialize all fields with appropriate defaults
		allFields.forEach(field => {
			if (field.type === 'product-gallery') {
				initialData[field.name] = [];
			} else if (field.type === 'image-gallery') {
				initialData[field.name] = [];
			} else if (field.type === 'booking-calendar') {
				initialData[field.name] = [];
			} else if (field.type === 'checkbox') {
				initialData[field.name] = false;
			} else if (field.type === 'select') {
				initialData[field.name] = field.defaultValue || (field.options && field.options[0]?.value) || '';
			} else if (field.type === 'repeater') {
				initialData[field.name] = [];
			} else {
				initialData[field.name] = '';
			}
		});
		
		// Initialize social media links (always available)
		initialData.youtubeLink = '';
		initialData.embedYoutubeVideo = false;
		initialData.facebookLink = '';
		initialData.instagramLink = '';
		initialData.tiktokLink = '';
		initialData.linkedinLink = '';
		initialData.twitterLink = '';
		
		// If editing, merge existing data
		if (existingData && editMode) {
			return { ...initialData, ...existingData };
		}
		
		return initialData;
	}
	
	let formData = $state(initializeFormData());
	let selectedStyle = $state(
		(existingData && editMode && existingData.designStyle) || 
		template.designStyles?.[0]?.id || 
		'modern'
	);
	let optionalSections = $state([]);
	let isSubmitting = $state(false);
	
	// Available optional sections
	const availableSections = {
		faq: { title: '❓ שאלות ותשובות', description: 'הוסף מקטע שאלות נפוצות' },
		gallery: { title: '🖼️ גלריית תמונות', description: 'הוסף גלריית תמונות' },
		testimonials: { title: '⭐ המלצות', description: 'הוסף המלצות לקוחות' },
		about: { title: '📖 אודות', description: 'הוסף מקטע אודות' },
		team: { title: '👥 הצוות', description: 'הוסף מקטע צוות' },
		services: { title: '🛠️ שירותים', description: 'הוסף רשימת שירותים' },
		pricing: { title: '💰 מחירון', description: 'הוסף טבלת מחירים' }
	};
	
	function handleSubmit(e) {
		e.preventDefault();
		isSubmitting = true;
		
		const data = {
			...formData,
			pageType: template.id,
			designStyle: selectedStyle
		};
		
		// Call onSubmit with data and optionalSections
		if (typeof onSubmit === 'function') {
			onSubmit({
				data,
				optionalSections
			});
		} else {
			console.error('❌ onSubmit is not a function!', onSubmit);
		}
	}
</script>

<div class="dynamic-form">
	<div class="bg-white rounded-lg shadow-lg p-6">
		<form onsubmit={handleSubmit} class="space-y-6">
			<!-- EXACT Legacy Info Box from page-creator.html -->
			{#if template.infoBox}
				{@const boxColor = template.infoBox.boxColor || 'blue'}
				{@const colorClasses = {
					blue: { bg: 'bg-blue-50', border: 'border-blue-200', title: 'text-blue-900', text: 'text-blue-700' },
					purple: { bg: 'bg-purple-50', border: 'border-purple-200', title: 'text-purple-900', text: 'text-purple-700' },
					pink: { bg: 'bg-pink-50', border: 'border-pink-200', title: 'text-pink-900', text: 'text-pink-700' },
					indigo: { bg: 'bg-indigo-50', border: 'border-indigo-200', title: 'text-indigo-900', text: 'text-indigo-700' }
				}}
				{@const colors = colorClasses[boxColor] || colorClasses.blue}
				
				<div class="{colors.bg} p-4 rounded-lg border-2 {colors.border}">
	
					<p class="text-sm {colors.text} mb-3">
						{@html template.infoBox.description}
					</p>
					
					{#if template.infoBox.features}
						<div class="bg-green-50 p-3 rounded-lg">
							<p class="text-sm text-green-800 mb-2">
								<strong>✅ כלול אוטומטית בכל חנות:</strong>
							</p>
							<ul class="text-xs text-green-700 space-y-1 mr-4">
								{#each template.infoBox.features as feature}
									<li>• {feature}</li>
								{/each}
							</ul>
						</div>
					{/if}
				</div>
			{/if}
			
			<!-- Dynamic Fields -->
			{#if template.sections}
				<!-- Sections-based template (restaurant, course) -->
				{#each template.sections as section}
					<fieldset class="border-2 border-gray-200 rounded-lg p-6 bg-gray-50">
						<legend class="text-lg font-semibold text-gray-900 px-2">{section.title}</legend>
						{#each section.fields as field}
							{@render fieldInput(field)}
						{/each}
					</fieldset>
				{/each}
			{:else}
				<!-- Flat fields template (store, event, etc) -->
				{#each template.fields as field}
					{@render fieldInput(field)}
				{/each}
			{/if}

{#snippet fieldInput(field)}
	<div>
		{#if field.type !== 'checkbox'}
			<label for={field.name} class="block text-sm font-medium text-gray-700 mb-2">
				{field.label}
				{#if field.required}
					<span class="text-red-500">*</span>
				{/if}
			</label>
		{/if}
		
		{#if field.type === 'product-gallery'}
			<!-- Product Gallery Manager -->
			<ProductGallery 
				bind:products={formData[field.name]} 
				onUpdate={(products) => formData[field.name] = products}
			/>
		{:else if field.type === 'image-gallery'}
			<!-- Image Gallery Manager -->
			<ImageGallery 
				bind:images={formData[field.name]} 
				onUpdate={(images) => formData[field.name] = images}
			/>
		{:else if field.type === 'booking-calendar'}
			<!-- Booking Calendar Manager -->
			<BookingCalendar 
							bind:availableSlots={formData[field.name]} 
							onUpdate={(slots) => formData[field.name] = slots}
						/>
					{:else if field.type === 'day-settings'}
						<!-- CRITICAL FIX: Full Day Settings UI in Creation Form -->
						<div class="border-2 border-purple-200 rounded-lg p-6 bg-purple-50">
							<h3 class="text-lg font-bold text-purple-900 mb-4">⏰ הגדרות ימי עבודה</h3>
							
							<!-- Days of Week Settings -->
							{#each ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'] as day, index}
								{@const dayNames = ['ראשון', 'שני', 'שלישי', 'רביעי', 'חמישי', 'שישי', 'שבת']}
								{@const dayName = dayNames[index]}
								
								<div class="mb-4 p-4 bg-white rounded-lg border border-purple-100">
									<div class="flex items-center justify-between mb-3">
										<label class="flex items-center gap-2 cursor-pointer">
											<input 
												type="checkbox" 
												checked={formData[field.name]?.[day]?.isOpen !== false}
												onchange={(e) => {
													if (!formData[field.name]) formData[field.name] = {};
													if (!formData[field.name][day]) formData[field.name][day] = {};
													formData[field.name][day].isOpen = e.target.checked;
												}}
												class="w-4 h-4 text-purple-600 border-gray-300 rounded focus:ring-purple-500"
											/>
											<span class="font-semibold text-gray-900">{dayName}</span>
										</label>
									</div>
									
									{#if formData[field.name]?.[day]?.isOpen !== false}
										<!-- Working Hours -->
										<div class="grid grid-cols-2 gap-3 mb-3">
											<div>
												<label class="block text-xs font-medium text-gray-700 mb-1">שעת פתיחה</label>
												<input 
													type="time" 
													value={formData[field.name]?.[day]?.startTime || '09:00'}
													onchange={(e) => {
														if (!formData[field.name]) formData[field.name] = {};
														if (!formData[field.name][day]) formData[field.name][day] = { isOpen: true };
														formData[field.name][day].startTime = e.target.value;
													}}
													class="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
												/>
											</div>
											<div>
												<label class="block text-xs font-medium text-gray-700 mb-1">שעת סגירה</label>
												<input 
													type="time" 
													value={formData[field.name]?.[day]?.endTime || '17:00'}
													onchange={(e) => {
														if (!formData[field.name]) formData[field.name] = {};
														if (!formData[field.name][day]) formData[field.name][day] = { isOpen: true };
														formData[field.name][day].endTime = e.target.value;
													}}
													class="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
												/>
											</div>
										</div>
										
										<!-- Break Times -->
										<div class="bg-gray-50 p-3 rounded-md">
											<label class="block text-xs font-medium text-gray-700 mb-2">⏸️ הפסקות</label>
											{#if !formData[field.name]?.[day]?.breaks}
												{#if !formData[field.name]} 
													{formData[field.name] = {}}
												{/if}
												{#if !formData[field.name][day]}
													{formData[field.name][day] = { isOpen: true, breaks: [] }}
												{:else}
													{formData[field.name][day].breaks = []}
												{/if}
											{/if}
											
											{#each formData[field.name]?.[day]?.breaks || [] as breakTime, breakIndex}
												<div class="flex gap-2 mb-2">
													<input 
														type="time" 
														bind:value={breakTime.start}
														class="flex-1 px-2 py-1 border border-gray-300 rounded text-sm"
														placeholder="התחלה"
													/>
													<input 
														type="time" 
														bind:value={breakTime.end}
														class="flex-1 px-2 py-1 border border-gray-300 rounded text-sm"
														placeholder="סיום"
													/>
													<button 
														type="button"
														onclick={() => {
															formData[field.name][day].breaks = formData[field.name][day].breaks.filter((_, i) => i !== breakIndex);
														}}
														class="px-2 py-1 bg-red-100 text-red-600 rounded hover:bg-red-200 text-sm"
													>
														🗑️
													</button>
												</div>
											{/each}
											
											<button 
												type="button"
												onclick={() => {
													if (!formData[field.name]) formData[field.name] = {};
													if (!formData[field.name][day]) formData[field.name][day] = { isOpen: true, breaks: [] };
													if (!formData[field.name][day].breaks) formData[field.name][day].breaks = [];
													formData[field.name][day].breaks = [...formData[field.name][day].breaks, { start: '12:00', end: '13:00' }];
												}}
												class="w-full px-3 py-2 bg-purple-100 text-purple-700 rounded hover:bg-purple-200 text-sm font-medium"
											>
												+ הוסף הפסקה
											</button>
										</div>
									{/if}
								</div>
							{/each}
							
							<!-- Closed Dates / Holidays -->
							<div class="mt-6 p-4 bg-white rounded-lg border border-purple-100">
								<h4 class="font-semibold text-gray-900 mb-3">🚫 ימים סגורים / חגים</h4>
								
								{#if !formData[field.name]?.closedDates}
									{#if !formData[field.name]}
										{formData[field.name] = { closedDates: [] }}
									{:else}
										{formData[field.name].closedDates = []}
									{/if}
								{/if}
								
								{#each formData[field.name]?.closedDates || [] as closedDate, dateIndex}
									<div class="flex gap-2 mb-2">
										<input 
											type="date" 
											bind:value={closedDate.date}
											class="flex-1 px-3 py-2 border border-gray-300 rounded-md text-sm"
										/>
										<input 
											type="text" 
											bind:value={closedDate.reason}
											placeholder="סיבה (אופציונלי)"
											class="flex-1 px-3 py-2 border border-gray-300 rounded-md text-sm"
										/>
										<button 
											type="button"
											onclick={() => {
												formData[field.name].closedDates = formData[field.name].closedDates.filter((_, i) => i !== dateIndex);
											}}
											class="px-3 py-2 bg-red-100 text-red-600 rounded hover:bg-red-200 text-sm"
										>
											🗑️
										</button>
									</div>
								{/each}
								
								<button 
									type="button"
									onclick={() => {
										if (!formData[field.name]) formData[field.name] = { closedDates: [] };
										if (!formData[field.name].closedDates) formData[field.name].closedDates = [];
										formData[field.name].closedDates = [...formData[field.name].closedDates, { date: '', reason: '' }];
									}}
									class="w-full px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 font-medium"
								>
									+ הוסף יום סגור
								</button>
							</div>
						</div>
					{:else if field.type === 'textarea'}
						<textarea
							id={field.name}
							name={field.name}
							bind:value={formData[field.name]}
							required={field.required}
							placeholder={field.placeholder}
							rows="4"
							class="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-purple-500"
						></textarea>
					{:else if field.type === 'select'}
						<!-- EXACT Legacy Select Styling from page-creator.html -->
						{#if field.name === 'productCount'}
							<!-- Store Product Count - EXACT Legacy Structure -->
							<div class="bg-white p-3 rounded-lg mb-3 border border-gray-200">
								<label for={field.name} class="block text-sm font-semibold text-gray-900 mb-2">
									{field.label}
									{#if field.required}
										<span class="text-red-500">*</span>
									{/if}
								</label>
								<select
									id={field.name}
									name={field.name}
									bind:value={formData[field.name]}
									required={field.required}
									class="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:border-purple-500 focus:ring-2 focus:ring-purple-200 transition"
								>
									{#each field.options as option}
										<option value={option.value}>{option.label}</option>
									{/each}
								</select>
								{#if field.help}
									<p class="text-xs text-gray-500 mt-1">{field.help}</p>
								{/if}
							</div>
						{:else}
							<!-- Standard Select -->
							<select
								id={field.name}
								name={field.name}
								bind:value={formData[field.name]}
								required={field.required}
								class="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:border-purple-500 focus:ring-2 focus:ring-purple-200 transition"
							>
								{#each field.options as option}
									<option value={option.value}>{option.label}</option>
								{/each}
							</select>
						{/if}
					{:else if field.type === 'select-old'}
						<select
							id={field.name}
							name={field.name}
							bind:value={formData[field.name]}
							required={field.required}
							class="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-purple-500"
						>
							{#each field.options || [] as option}
								<option value={option.value}>{option.label}</option>
							{/each}
						</select>
					{:else if field.type === 'checkbox'}
						<label class="flex items-center gap-2 cursor-pointer">
							<input
								type="checkbox"
								id={field.name}
								name={field.name}
								bind:checked={formData[field.name]}
								class="w-4 h-4 text-purple-600 border-gray-300 rounded focus:ring-purple-500"
							/>
							<span class="text-sm font-medium text-gray-700">{field.label}</span>
						</label>
					{:else if field.type === 'color'}
						<div class="flex gap-2">
							<input
								type="color"
								id={field.name}
								name={field.name}
								bind:value={formData[field.name]}
								class="h-10 w-20 border border-gray-300 rounded-md cursor-pointer"
							/>
							<input
								type="text"
								bind:value={formData[field.name]}
								placeholder={field.placeholder}
								class="flex-1 border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-purple-500"
							/>
						</div>
					{:else}
						<input
							type={field.type}
							id={field.name}
							name={field.name}
							bind:value={formData[field.name]}
							required={field.required}
							placeholder={field.placeholder}
							class="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-purple-500"
						/>
					{/if}
					
					{#if field.help}
						<p class="text-sm text-gray-500 mt-1">{field.help}</p>
					{/if}
			</div>
{/snippet}

			<!-- Social Media Links - EXACT Legacy from page-creator.html -->
			<fieldset class="form-fieldset">
				<legend class="form-legend">רשתות חברתיות</legend>
				<div class="space-y-4">
					<!-- YouTube -->
					<div>
						<label for="youtubeLink" class="block text-sm font-medium text-gray-700 mb-2">YouTube</label>
						<div class="flex rounded-md shadow-sm mb-2">
							<span class="inline-flex items-center px-3 rounded-s-md border border-e-0 border-slate-300 bg-slate-50 text-slate-500 sm:text-sm">
								<svg class="w-5 h-5 text-red-600" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true"><path fill-rule="evenodd" d="M19.615 3.184c-3.604-.246-11.631-.245-15.23 0-3.897.266-4.356 2.62-4.385 8.816.029 6.185.484 8.549 4.385 8.816 3.6.245 11.626.246 15.23 0 3.897-.266 4.356-2.62 4.385-8.816-.029-6.185-.484-8.549-4.385-8.816zm-10.615 12.816V8l6 4-6 4z" clip-rule="evenodd" /></svg>
							</span>
							<input type="url" bind:value={formData.youtubeLink} id="youtubeLink" class="block w-full min-w-0 flex-1 rounded-none rounded-e-md border-slate-300 px-3 py-2 focus:border-purple-500 focus:ring-purple-500 sm:text-sm" placeholder="https://youtube.com/watch?v=...">
						</div>
						{#if formData.youtubeLink}
							<label class="flex items-center gap-2 cursor-pointer bg-red-50 border border-red-200 rounded-lg p-3">
								<input
									type="checkbox"
									bind:checked={formData.embedYoutubeVideo}
									class="w-4 h-4 text-red-600 border-gray-300 rounded focus:ring-red-500"
								/>
								<span class="text-sm font-medium text-red-900">🎬 הוסף מקטע וידאו לדף (הסרטון יוצג במקטע ייעודי)</span>
							</label>
							<p class="text-xs text-gray-600 mt-1 mr-6">הסרטון יוצג במקטע נפרד עם עיצוב מיוחד, לא בראש הדף</p>
						{/if}
					</div>
					
					<!-- Facebook -->
					<div>
						<label for="facebookLink" class="sr-only">Facebook</label>
						<div class="flex rounded-md shadow-sm">
							<span class="inline-flex items-center px-3 rounded-s-md border border-e-0 border-slate-300 bg-slate-50 text-slate-500 sm:text-sm">
								<svg class="w-5 h-5 text-blue-600" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true"><path fill-rule="evenodd" d="M22 12c0-5.523-4.477-10-10-10S2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.878v-6.987h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.988C18.343 21.128 22 16.991 22 12z" clip-rule="evenodd" /></svg>
							</span>
							<input type="url" bind:value={formData.facebookLink} id="facebookLink" class="block w-full min-w-0 flex-1 rounded-none rounded-e-md border-slate-300 px-3 py-2 focus:border-purple-500 focus:ring-purple-500 sm:text-sm" placeholder="https://facebook.com/your-page">
						</div>
					</div>
					
					<!-- Instagram -->
					<div>
						<label for="instagramLink" class="sr-only">Instagram</label>
						<div class="flex rounded-md shadow-sm">
							<span class="inline-flex items-center px-3 rounded-s-md border border-e-0 border-slate-300 bg-slate-50 text-slate-500 sm:text-sm">
								<svg class="w-5 h-5" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true"><path fill-rule="evenodd" d="M12 2C6.477 2 2 6.477 2 12s4.477 10 10 10 10-4.477 10-10S17.523 2 12 2zm0 16c-3.314 0-6-2.686-6-6s2.686-6 6-6 6 2.686 6 6-2.686 6-6 6zm0-10c-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4-1.79-4-4-4zm6-2a1 1 0 100-2 1 1 0 000 2z" clip-rule="evenodd" /></svg>
							</span>
							<input type="url" bind:value={formData.instagramLink} id="instagramLink" class="block w-full min-w-0 flex-1 rounded-none rounded-e-md border-slate-300 px-3 py-2 focus:border-purple-500 focus:ring-purple-500 sm:text-sm" placeholder="https://instagram.com/your-profile">
						</div>
					</div>
					
					<!-- TikTok -->
					<div>
						<label for="tiktokLink" class="sr-only">TikTok</label>
						<div class="flex rounded-md shadow-sm">
							<span class="inline-flex items-center px-3 rounded-s-md border border-e-0 border-slate-300 bg-slate-50 text-slate-500 sm:text-sm">
								<svg class="w-5 h-5" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true"><path d="M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.05-2.89-.35-4.2-.97-.57-.26-1.1-.59-1.62-.93-.01 2.92.01 5.84-.02 8.75-.08 1.4-.54 2.79-1.35 3.94-1.31 1.92-3.58 3.17-5.91 3.21-2.43.05-4.84-.94-6.37-2.96-2.2-2.95-2.2-6.82 0-9.78 1.59-2.1 4.3-3.04 6.66-2.49v4.03c-1.11-.35-2.29-.5-3.43-.5-1.72 0-3.34.7-4.52 1.95-1.24 1.3-1.86 3.02-1.86 4.73 0 3.49 2.72 6.36 6.08 6.36 3.35 0 6.08-2.87 6.08-6.36 0-1.52-.57-2.93-1.56-4.02-.98-1.09-2.38-1.68-3.8-1.68-.24 0-.48.01-.7.03v-4.03z"/></svg>
							</span>
							<input type="url" bind:value={formData.tiktokLink} id="tiktokLink" class="block w-full min-w-0 flex-1 rounded-none rounded-e-md border-slate-300 px-3 py-2 focus:border-purple-500 focus:ring-purple-500 sm:text-sm" placeholder="https://tiktok.com/@your-profile">
						</div>
					</div>
					
					<!-- LinkedIn -->
					<div>
						<label for="linkedinLink" class="sr-only">LinkedIn</label>
						<div class="flex rounded-md shadow-sm">
							<span class="inline-flex items-center px-3 rounded-s-md border border-e-0 border-slate-300 bg-slate-50 text-slate-500 sm:text-sm">
								<svg class="w-5 h-5" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true"><path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/></svg>
							</span>
							<input type="url" bind:value={formData.linkedinLink} id="linkedinLink" class="block w-full min-w-0 flex-1 rounded-none rounded-e-md border-slate-300 px-3 py-2 focus:border-purple-500 focus:ring-purple-500 sm:text-sm" placeholder="https://linkedin.com/in/your-profile">
						</div>
					</div>
					
					<!-- Twitter/X -->
					<div>
						<label for="twitterLink" class="sr-only">X (Twitter)</label>
						<div class="flex rounded-md shadow-sm">
							<span class="inline-flex items-center px-3 rounded-s-md border border-e-0 border-slate-300 bg-slate-50 text-slate-500 sm:text-sm">
								<svg class="w-5 h-5" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>
							</span>
							<input type="url" bind:value={formData.twitterLink} id="twitterLink" class="block w-full min-w-0 flex-1 rounded-none rounded-e-md border-slate-300 px-3 py-2 focus:border-purple-500 focus:ring-purple-500 sm:text-sm" placeholder="https://x.com/your-profile">
						</div>
					</div>
				</div>
			</fieldset>
			
			<!-- Optional Sections Selection -->
			<fieldset class="border-2 border-yellow-300 rounded-lg p-6 bg-yellow-50">
				<legend class="text-lg font-semibold text-yellow-900 px-2">📋 מקטעים אופציונליים</legend>
				<p class="text-sm text-yellow-700 mb-4">בחר מקטעים נוספים להוסיף לדף שלך (אופציונלי)</p>
				
				<div class="grid grid-cols-2 gap-3">
					{#each Object.entries(availableSections) as [key, section]}
						<label class="flex items-start gap-3 p-3 bg-white rounded-lg border-2 border-gray-200 cursor-pointer hover:border-yellow-400 transition-all {optionalSections.includes(key) ? 'border-yellow-500 bg-yellow-50' : ''}">
							<input
								type="checkbox"
								value={key}
								checked={optionalSections.includes(key)}
								onchange={(e) => {
									if (e.target.checked) {
										optionalSections = [...optionalSections, key];
									} else {
										optionalSections = optionalSections.filter(s => s !== key);
									}
								}}
								class="mt-1 w-4 h-4 text-yellow-600 border-gray-300 rounded focus:ring-yellow-500"
							/>
							<div class="flex-1">
								<div class="font-medium text-gray-900">{section.title}</div>
								<div class="text-xs text-gray-600">{section.description}</div>
							</div>
						</label>
					{/each}
				</div>
				
				{#if optionalSections.length > 0}
					<div class="mt-4 p-3 bg-green-50 border border-green-200 rounded-lg">
						<p class="text-sm text-green-800 font-medium">
							✅ נבחרו {optionalSections.length} מקטעים: {optionalSections.map(s => availableSections[s].title).join(', ')}
						</p>
					</div>
				{/if}
			</fieldset>

			<!-- Design Style Selection -->
			{#if template.designStyles}
				<fieldset class="border border-gray-300 rounded-lg p-4">
					<legend class="text-lg font-semibold text-gray-900 px-2">סגנון עיצוב</legend>
					<div class="grid grid-cols-3 gap-4 mt-4">
						{#each template.designStyles as style}
							<label class="cursor-pointer">
								<input
									type="radio"
									name="designStyle"
									value={style.id}
									bind:group={selectedStyle}
									class="sr-only"
								/>
								<div class="option-card border-2 rounded-lg p-4 text-center transition-all {selectedStyle === style.id ? 'border-purple-500 bg-purple-50' : 'border-gray-200'}">
									<div class="flex gap-2 justify-center mb-2">
										<div class="w-8 h-8 rounded-full" style="background-color: {style.colors.primary}"></div>
										<div class="w-8 h-8 rounded-full" style="background-color: {style.colors.secondary}"></div>
										<div class="w-8 h-8 rounded-full" style="background-color: {style.colors.accent}"></div>
									</div>
									<p class="font-medium text-gray-900">{style.name}</p>
								</div>
							</label>
						{/each}
					</div>
				</fieldset>
			{/if}
			
			<!-- Submit Buttons -->
			<div class="flex gap-4 pt-4">
				<button
					type="button"
					onclick={onBack}
					class="w-1/3 bg-slate-200 text-slate-700 font-bold py-3 px-4 rounded-lg hover:bg-slate-300 transition"
				>
					חזור
				</button>
				<button
					type="submit"
					disabled={isSubmitting}
					class="w-2/3 bg-gradient-to-r from-purple-600 to-pink-500 text-white font-bold py-3 px-8 rounded-lg hover:opacity-90 transition-transform duration-300 hover:scale-105 shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
				>
					{isSubmitting ? (editMode ? 'מעדכן דף...' : 'יוצר דף...') : (editMode ? 'עדכן דף' : 'צור דף')}
				</button>
			</div>
		</form>
	</div>
</div>


<style>
	/* ========================================
	   ABSOLUTE VISUAL OVERRIDE - LEGACY CSS ISOLATION
	   Using :global() modifiers for MAXIMUM PRIORITY
	   Direct copy from page-creator.html <style> block
	   ======================================== */
	
	/* General Body and Animation Styles */
	:global(.dynamic-form) {
		font-family: 'Inter', 'Assistant', sans-serif !important;
	}
	
	:global(.dynamic-form .bg-white) {
		background-color: rgba(255, 255, 255, 0.6) !important;
		backdrop-filter: blur(24px) !important;
	}
	
	/* Form & Editor Styles - EXACT LEGACY */
	:global(.dynamic-form .form-fieldset),
	:global(.dynamic-form fieldset) {
		border: 1px solid #e5e7eb !important;
		border-radius: 0.75rem !important;
		padding: 1.5rem !important;
		background-color: rgba(255, 255, 255, 0.5) !important;
	}
	
	:global(.dynamic-form .form-legend),
	:global(.dynamic-form legend) {
		padding: 0 0.5rem !important;
		font-weight: 600 !important;
		color: #4c1d95 !important;
	}
	
	/* Input Fields - EXACT LEGACY from page-creator.html */
	:global(.dynamic-form input[type="text"]),
	:global(.dynamic-form input[type="email"]),
	:global(.dynamic-form input[type="tel"]),
	:global(.dynamic-form input[type="number"]),
	:global(.dynamic-form input[type="date"]),
	:global(.dynamic-form input[type="time"]),
	:global(.dynamic-form input[type="url"]),
	:global(.dynamic-form textarea),
	:global(.dynamic-form select) {
		display: block !important;
		width: 100% !important;
		padding: 0.5rem 1rem !important;
		background-color: white !important;
		border: 1px solid #cbd5e1 !important;
		border-radius: 0.375rem !important;
		box-shadow: 0 1px 2px 0 rgba(0, 0, 0, 0.05) !important;
		font-size: 0.875rem !important;
		line-height: 1.25rem !important;
		transition: all 0.15s ease-in-out !important;
	}
	
	/* Legacy class names - mt-1 block w-full px-4 py-2 */
	:global(.dynamic-form .mt-1) {
		margin-top: 0.25rem !important;
	}
	
	:global(.dynamic-form .block) {
		display: block !important;
	}
	
	:global(.dynamic-form .w-full) {
		width: 100% !important;
	}
	
	:global(.dynamic-form .px-4) {
		padding-left: 1rem !important;
		padding-right: 1rem !important;
	}
	
	:global(.dynamic-form .py-2) {
		padding-top: 0.5rem !important;
		padding-bottom: 0.5rem !important;
	}
	
	:global(.dynamic-form .bg-white) {
		background-color: white !important;
	}
	
	:global(.dynamic-form .border) {
		border-width: 1px !important;
	}
	
	:global(.dynamic-form .border-slate-300),
	:global(.dynamic-form .border-gray-300) {
		border-color: #cbd5e1 !important;
	}
	
	:global(.dynamic-form .rounded-md) {
		border-radius: 0.375rem !important;
	}
	
	:global(.dynamic-form .shadow-sm) {
		box-shadow: 0 1px 2px 0 rgba(0, 0, 0, 0.05) !important;
	}
	
	:global(.dynamic-form input:focus),
	:global(.dynamic-form textarea:focus),
	:global(.dynamic-form select:focus) {
		outline: 2px solid transparent !important;
		outline-offset: 2px !important;
		border-color: #8b5cf6 !important;
		box-shadow: 0 0 0 3px rgba(139, 92, 246, 0.1) !important;
	}
	
	:global(.dynamic-form label) {
		display: block !important;
		font-size: 0.875rem !important;
		font-weight: 500 !important;
		color: #334155 !important;
		margin-bottom: 0.5rem !important;
	}
	
	:global(.dynamic-form fieldset) {
		border: 1px solid #e5e7eb !important;
		border-radius: 0.75rem !important;
		padding: 1.5rem !important;
		background-color: rgba(255, 255, 255, 0.5) !important;
		margin-bottom: 1.5rem !important;
	}
	
	:global(.dynamic-form legend) {
		padding: 0 0.5rem !important;
		font-weight: 600 !important;
		font-size: 1.125rem !important;
		color: #4c1d95 !important;
	}
	
	/* Info Box Styles - EXACT Legacy */
	:global(.dynamic-form .bg-blue-50) {
		background-color: #eff6ff !important;
		border-color: #bfdbfe !important;
	}
	
	:global(.dynamic-form .bg-purple-50) {
		background-color: #f3e8ff !important;
		border-color: #e9d5ff !important;
	}
	
	:global(.dynamic-form .bg-pink-50) {
		background-color: #fce7f3 !important;
		border-color: #fbcfe8 !important;
	}
	
	:global(.dynamic-form .bg-indigo-50) {
		background-color: #e0e7ff !important;
		border-color: #c7d2fe !important;
	}
	
	:global(.dynamic-form .bg-green-50) {
		background-color: #f0fdf4 !important;
		border-color: #bbf7d0 !important;
	}
	
	:global(.dynamic-form .text-blue-900) {
		color: #1e3a8a !important;
	}
	
	:global(.dynamic-form .text-blue-700) {
		color: #1d4ed8 !important;
	}
	
	:global(.dynamic-form .text-purple-900) {
		color: #581c87 !important;
	}
	
	:global(.dynamic-form .text-purple-700) {
		color: #7e22ce !important;
	}
	
	:global(.dynamic-form .text-pink-900) {
		color: #831843 !important;
	}
	
	:global(.dynamic-form .text-pink-700) {
		color: #be185d !important;
	}
	
	:global(.dynamic-form .text-indigo-900) {
		color: #312e81 !important;
	}
	
	:global(.dynamic-form .text-indigo-700) {
		color: #4338ca !important;
	}
	
	:global(.dynamic-form .text-green-800) {
		color: #166534 !important;
	}
	
	:global(.dynamic-form .text-green-700) {
		color: #15803d !important;
	}
	
	/* Option Card Styles - EXACT Legacy from page-creator.html */
	:global(.dynamic-form .option-card) {
		transition: all 0.3s ease-in-out !important;
		cursor: pointer !important;
		border: 2px solid #e5e7eb !important;
		border-radius: 0.5rem !important;
		padding: 1rem !important;
		background-color: white !important;
	}
	
	:global(.dynamic-form .option-card.selected),
	:global(.dynamic-form .option-card:has(input:checked)) {
		transform: scale(1.03) !important;
		box-shadow: 0 0 0 3px #8b5cf6 !important;
		border-color: #8b5cf6 !important;
		background-color: #faf5ff !important;
	}
	
	:global(.dynamic-form .option-card:hover) {
		border-color: #a78bfa !important;
	}
	
	/* Button Styles - EXACT Legacy */
	:global(.dynamic-form button[type="submit"]) {
		background: linear-gradient(to right, #9333ea, #ec4899) !important;
		color: white !important;
		font-weight: 700 !important;
		padding: 0.75rem 2rem !important;
		border-radius: 0.5rem !important;
		box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05) !important;
		transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1) !important;
		border: none !important;
		cursor: pointer !important;
	}
	
	:global(.dynamic-form button[type="submit"]:hover:not(:disabled)) {
		opacity: 0.9 !important;
		transform: scale(1.05) !important;
	}
	
	:global(.dynamic-form button[type="submit"]:disabled) {
		opacity: 0.5 !important;
		cursor: not-allowed !important;
		transform: none !important;
	}
	
	:global(.dynamic-form button[type="button"]) {
		background-color: #e2e8f0 !important;
		color: #475569 !important;
		font-weight: 700 !important;
		padding: 0.75rem 1rem !important;
		border-radius: 0.5rem !important;
		transition: background-color 0.15s ease-in-out !important;
		border: none !important;
		cursor: pointer !important;
	}
	
	:global(.dynamic-form button[type="button"]:hover) {
		background-color: #cbd5e1 !important;
	}
	
	/* Select Dropdown - EXACT Legacy for Product Count */
	:global(.dynamic-form select) {
		appearance: none !important;
		background-image: url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%236b7280' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M6 8l4 4 4-4'/%3e%3c/svg%3e") !important;
		background-position: left 0.5rem center !important;
		background-repeat: no-repeat !important;
		background-size: 1.5em 1.5em !important;
		padding-left: 2.5rem !important;
	}
	
	/* Textarea Styles */
	:global(.dynamic-form textarea) {
		min-height: 100px !important;
		resize: vertical !important;
	}
	
	/* Checkbox Styles */
	:global(.dynamic-form input[type="checkbox"]) {
		width: 1rem !important;
		height: 1rem !important;
		color: #8b5cf6 !important;
		border-radius: 0.25rem !important;
		border: 1px solid #d1d5db !important;
		cursor: pointer !important;
	}
	
	:global(.dynamic-form input[type="checkbox"]:focus) {
		outline: 2px solid transparent !important;
		outline-offset: 2px !important;
		box-shadow: 0 0 0 3px rgba(139, 92, 246, 0.1) !important;
	}
	
	/* Color Input Styles */
	:global(.dynamic-form input[type="color"]) {
		height: 2.5rem !important;
		width: 5rem !important;
		border: 1px solid #d1d5db !important;
		border-radius: 0.375rem !important;
		cursor: pointer !important;
	}
	
	/* Help Text */
	:global(.dynamic-form .text-sm.text-gray-500) {
		font-size: 0.75rem !important;
		color: #6b7280 !important;
		margin-top: 0.25rem !important;
	}
	
	/* Required Asterisk */
	:global(.dynamic-form .text-red-500) {
		color: #ef4444 !important;
	}
	
	/* Grid Layouts */
	:global(.dynamic-form .grid) {
		display: grid !important;
	}
	
	:global(.dynamic-form .grid-cols-2) {
		grid-template-columns: repeat(2, minmax(0, 1fr)) !important;
	}
	
	:global(.dynamic-form .grid-cols-3) {
		grid-template-columns: repeat(3, minmax(0, 1fr)) !important;
	}
	
	:global(.dynamic-form .gap-2) {
		gap: 0.5rem !important;
	}
	
	:global(.dynamic-form .gap-4) {
		gap: 1rem !important;
	}
	
	/* Spacing */
	:global(.dynamic-form .space-y-6 > * + *) {
		margin-top: 1.5rem !important;
	}
	
	:global(.dynamic-form .mb-2) {
		margin-bottom: 0.5rem !important;
	}
	
	:global(.dynamic-form .mb-3) {
		margin-bottom: 0.75rem !important;
	}
	
	:global(.dynamic-form .mb-4) {
		margin-bottom: 1rem !important;
	}
	
	:global(.dynamic-form .mt-1) {
		margin-top: 0.25rem !important;
	}
	
	:global(.dynamic-form .mt-4) {
		margin-top: 1rem !important;
	}
	
	:global(.dynamic-form .p-3) {
		padding: 0.75rem !important;
	}
	
	:global(.dynamic-form .p-4) {
		padding: 1rem !important;
	}
	
	:global(.dynamic-form .p-6) {
		padding: 1.5rem !important;
	}
	
	:global(.dynamic-form .px-3) {
		padding-left: 0.75rem !important;
		padding-right: 0.75rem !important;
	}
	
	:global(.dynamic-form .py-2) {
		padding-top: 0.5rem !important;
		padding-bottom: 0.5rem !important;
	}
	
	/* Border Radius */
	:global(.dynamic-form .rounded-lg) {
		border-radius: 0.5rem !important;
	}
	
	:global(.dynamic-form .rounded-full) {
		border-radius: 9999px !important;
	}
	
	/* Shadows */
	:global(.dynamic-form .shadow-lg) {
		box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05) !important;
	}
	
	/* Text Alignment */
	:global(.dynamic-form .text-center) {
		text-align: center !important;
	}
	
	/* Font Weights */
	:global(.dynamic-form .font-bold) {
		font-weight: 700 !important;
	}
	
	:global(.dynamic-form .font-semibold) {
		font-weight: 600 !important;
	}
	
	:global(.dynamic-form .font-medium) {
		font-weight: 500 !important;
	}
	
	/* Text Sizes */
	:global(.dynamic-form .text-xs) {
		font-size: 0.75rem !important;
		line-height: 1rem !important;
	}
	
	:global(.dynamic-form .text-sm) {
		font-size: 0.875rem !important;
		line-height: 1.25rem !important;
	}
	
	:global(.dynamic-form .text-lg) {
		font-size: 1.125rem !important;
		line-height: 1.75rem !important;
	}
	
	:global(.dynamic-form .text-2xl) {
		font-size: 1.5rem !important;
		line-height: 2rem !important;
	}
	
	:global(.dynamic-form .text-6xl) {
		font-size: 3.75rem !important;
		line-height: 1 !important;
	}
	
	/* Responsive Design */
	@media (max-width: 640px) {
		:global(.dynamic-form .grid-cols-2),
		:global(.dynamic-form .grid-cols-3) {
			grid-template-columns: repeat(1, minmax(0, 1fr)) !important;
		}
		
		:global(.dynamic-form .flex.gap-4) {
			flex-direction: column !important;
		}
		
		:global(.dynamic-form button) {
			width: 100% !important;
		}
	}
</style>
