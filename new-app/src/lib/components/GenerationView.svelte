<!-- Generation View - EXACT Legacy "Building Page" Animation -->
<script>
	import { onMount } from 'svelte';
	
	let { 
		isGenerating = $bindable(false),
		language = 'he'
	} = $props();
	
	let currentTextIndex = $state(0);
	let displayText = $state('');
	
	// EXACT Legacy generation texts
	const texts = {
		he: [
			'מערכת ה-AI המתקדמת שלנו מנתחת את הדרישות שלך...',
			'יוצרת ארכיטקטורת קוד מקצועית...',
			'מיישמת דפוסי עיצוב פרימיום...',
			'מסיימת את יצירת המופת שלך...'
		],
		en: [
			'Our advanced AI system is analyzing your requirements...',
			'Creating professional code architecture...',
			'Applying premium design patterns...',
			'Finishing your masterpiece...'
		],
		es: [
			'Nuestro sistema de IA avanzado está analizando tus requisitos...',
			'Creando arquitectura de código profesional...',
			'Aplicando patrones de diseño premium...',
			'Terminando tu obra maestra...'
		]
	};
	
	// Cycle through texts
	onMount(() => {
		if (!isGenerating) return;
		
		const interval = setInterval(() => {
			const textArray = texts[language] || texts.he;
			currentTextIndex = (currentTextIndex + 1) % textArray.length;
			displayText = textArray[currentTextIndex];
		}, 3000); // Change text every 3 seconds
		
		// Set initial text
		displayText = texts[language]?.[0] || texts.he[0];
		
		return () => clearInterval(interval);
	});
	
	$effect(() => {
		if (isGenerating) {
			displayText = texts[language]?.[0] || texts.he[0];
			currentTextIndex = 0;
		}
	});
</script>

{#if isGenerating}
	<div class="gen-view-container">
		<div class="gen-content">
			<!-- EXACT Legacy 3D Rotating Loader -->
			<div class="gen-loader">
				<div class="inner one"></div>
				<div class="inner two"></div>
				<div class="inner three"></div>
			</div>
			
			<!-- Generation Text -->
			<div class="gen-text">
				{displayText}
			</div>
		</div>
	</div>
{/if}

<style>
	/* EXACT Legacy Generation View Styles */
	.gen-view-container {
		position: fixed;
		top: 0;
		left: 0;
		width: 100vw;
		height: 100vh;
		background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
		z-index: 10000;
		display: flex;
		align-items: center;
		justify-content: center;
		animation: fadeIn 0.5s ease-out;
	}
	
	.gen-content {
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: 2rem;
	}
	
	/* EXACT Legacy 3D Rotating Loader */
	.gen-loader {
		width: 80px;
		height: 80px;
		border-radius: 50%;
		perspective: 800px;
		position: relative;
	}
	
	.gen-loader .inner {
		position: absolute;
		box-sizing: border-box;
		width: 100%;
		height: 100%;
		border-radius: 50%;
	}
	
	.gen-loader .inner.one {
		left: 0%;
		top: 0%;
		animation: rotate-one 1.5s linear infinite;
		border-bottom: 3px solid #8b5cf6;
	}
	
	.gen-loader .inner.two {
		right: 0%;
		top: 0%;
		animation: rotate-two 1.5s linear infinite;
		border-right: 3px solid #ec4899;
	}
	
	.gen-loader .inner.three {
		right: 0%;
		bottom: 0%;
		animation: rotate-three 1.5s linear infinite;
		border-top: 3px solid #3b82f6;
	}
	
	@keyframes rotate-one {
		0% {
			transform: rotateX(35deg) rotateY(-45deg) rotateZ(0deg);
		}
		100% {
			transform: rotateX(35deg) rotateY(-45deg) rotateZ(360deg);
		}
	}
	
	@keyframes rotate-two {
		0% {
			transform: rotateX(50deg) rotateY(10deg) rotateZ(0deg);
		}
		100% {
			transform: rotateX(50deg) rotateY(10deg) rotateZ(360deg);
		}
	}
	
	@keyframes rotate-three {
		0% {
			transform: rotateX(35deg) rotateY(55deg) rotateZ(0deg);
		}
		100% {
			transform: rotateX(35deg) rotateY(55deg) rotateZ(360deg);
		}
	}
	
	/* Generation Text */
	.gen-text {
		font-family: 'Heebo', sans-serif;
		font-weight: 600;
		color: #475569;
		font-size: 18px;
		text-align: center;
		min-height: 2em;
		max-width: 500px;
		padding: 0 20px;
		animation: textFade 0.5s ease-in-out;
	}
	
	@keyframes fadeIn {
		from {
			opacity: 0;
		}
		to {
			opacity: 1;
		}
	}
	
	@keyframes textFade {
		0% {
			opacity: 0;
			transform: translateY(10px);
		}
		100% {
			opacity: 1;
			transform: translateY(0);
		}
	}
	
	/* Responsive */
	@media (max-width: 768px) {
		.gen-loader {
			width: 60px;
			height: 60px;
		}
		
		.gen-text {
			font-size: 16px;
		}
	}
</style>
