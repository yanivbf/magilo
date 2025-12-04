<script>
	import { getContext } from 'svelte';
	import EditableText from '$lib/components/editing/EditableText.svelte';
	
	let { data, sectionIndex = 0 } = $props();
	
	const editMode = getContext('editMode');
	const saveField = getContext('saveField');
	
	// Extract YouTube ID from URL
	function getYouTubeId(url) {
		if (!url) return null;
		const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
		const match = url.match(regExp);
		return (match && match[2].length === 11) ? match[2] : null;
	}
	
	let videoUrl = $state(data.videoUrl || '');
	let youtubeId = $derived(getYouTubeId(videoUrl));
	
	async function saveVideoUrl(url) {
		videoUrl = url;
		await saveField(`sections.${sectionIndex}.data.videoUrl`, url);
	}
</script>

<section class="video-section">
	<div class="container">
		<EditableText
			value={data.title || '🎥 סרטון'}
			onsave={(value) => saveField(`sections.${sectionIndex}.data.title`, value)}
			class="section-title"
			tag="h2"
		/>
		{#if data.subtitle || editMode}
			<EditableText
				value={data.subtitle || 'צפו בסרטון שלנו'}
				onsave={(value) => saveField(`sections.${sectionIndex}.data.subtitle`, value)}
				class="section-subtitle"
				tag="p"
			/>
		{/if}
		
		{#if youtubeId}
			<div class="video-container">
				<iframe
					src="https://www.youtube.com/embed/{youtubeId}?rel=0&modestbranding=1"
					title={data.title || 'סרטון'}
					frameborder="0"
					allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
					allowfullscreen
				></iframe>
			</div>
		{:else}
			<div class="video-placeholder">
				<div class="placeholder-icon">🎬</div>
				<p>לא נמצא סרטון</p>
			</div>
		{/if}
		
		{#if data.description || editMode}
			<EditableText
				value={data.description || 'תיאור הסרטון'}
				onsave={(value) => saveField(`sections.${sectionIndex}.data.description`, value)}
				class="video-description"
				tag="p"
			/>
		{/if}
	</div>
</section>

<style>
	.video-section {
		padding: 5rem 0;
		background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
		direction: rtl;
	}
	
	.container {
		max-width: 1200px;
		margin: 0 auto;
		padding: 0 2rem;
	}
	
	.section-title {
		text-align: center;
		font-size: 3rem;
		font-weight: 800;
		color: white;
		margin-bottom: 1rem;
		text-shadow: 0 4px 20px rgba(0, 0, 0, 0.3);
	}
	
	.section-subtitle {
		text-align: center;
		font-size: 1.3rem;
		color: rgba(255, 255, 255, 0.95);
		margin-bottom: 3rem;
	}
	
	.video-input-wrapper {
		background: rgba(255, 255, 255, 0.95);
		padding: 1.5rem;
		border-radius: 16px;
		margin-bottom: 2rem;
		box-shadow: 0 10px 30px rgba(0, 0, 0, 0.2);
	}
	
	.video-input-wrapper label {
		display: block;
		font-weight: 700;
		color: #1f2937;
		margin-bottom: 0.75rem;
		font-size: 1.1rem;
	}
	
	.video-input {
		width: 100%;
		padding: 1rem;
		border: 2px solid #e5e7eb;
		border-radius: 12px;
		font-size: 1rem;
		transition: all 0.3s ease;
	}
	
	.video-input:focus {
		outline: none;
		border-color: #667eea;
		box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
	}
	
	.video-container {
		position: relative;
		width: 100%;
		max-width: 900px;
		margin: 0 auto 2rem;
		padding-bottom: 56.25%; /* 16:9 aspect ratio */
		height: 0;
		overflow: hidden;
		border-radius: 24px;
		box-shadow: 0 20px 60px rgba(0, 0, 0, 0.4);
		animation: fadeInUp 0.8s ease-out;
	}
	
	.video-container iframe {
		position: absolute;
		top: 0;
		left: 0;
		width: 100%;
		height: 100%;
		border-radius: 24px;
	}
	
	.video-placeholder {
		background: rgba(255, 255, 255, 0.1);
		border: 3px dashed rgba(255, 255, 255, 0.5);
		border-radius: 24px;
		padding: 5rem 2rem;
		text-align: center;
		color: white;
		margin-bottom: 2rem;
	}
	
	.placeholder-icon {
		font-size: 5rem;
		margin-bottom: 1rem;
		filter: drop-shadow(0 4px 10px rgba(0, 0, 0, 0.3));
	}
	
	.video-placeholder p {
		font-size: 1.2rem;
		opacity: 0.9;
	}
	
	.video-description {
		text-align: center;
		font-size: 1.1rem;
		color: rgba(255, 255, 255, 0.95);
		max-width: 800px;
		margin: 0 auto;
		line-height: 1.8;
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
	
	@media (max-width: 768px) {
		.section-title {
			font-size: 2rem;
		}
		
		.section-subtitle {
			font-size: 1.1rem;
		}
	}
</style>
