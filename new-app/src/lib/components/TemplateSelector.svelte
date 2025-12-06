<script>
	import { templatesList } from '$lib/templates';
	
	let { onSelect } = $props();
	
	const templates = templatesList;
	
	console.log('📋 TemplateSelector loaded with templates:', templates);
	console.log('📋 Number of templates:', templates.length);
	
	function selectTemplate(template) {
		console.log('🎯 Template selected:', template);
		if (typeof onSelect === 'function') {
			onSelect(template);
		} else {
			console.error('❌ onSelect is not a function!', onSelect);
		}
	}
</script>

<div class="template-selector">
	<h2 class="text-3xl font-bold text-center text-gray-900 mb-8">בחר סוג דף</h2>
	
	<div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
		{#each templates as template}
			<button
				onclick={() => selectTemplate(template)}
				class="template-card bg-white rounded-xl overflow-hidden border-2 border-gray-200 hover:border-indigo-500 hover:shadow-xl transition-all text-right"
			>
				<div class="h-48 bg-cover bg-center relative" style="background-image: url('{template.image}')">
					<div class="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
				</div>
				<div class="p-6">
					<h3 class="text-xl font-bold text-gray-900 mb-2">{template.name}</h3>
					<p class="text-gray-600">{template.description}</p>
				</div>
			</button>
		{/each}
	</div>
</div>

<style>
	.template-card {
		cursor: pointer;
	}
	
	.template-card:hover {
		transform: translateY(-4px);
	}
</style>
