<script>
	import { onMount } from 'svelte';
	
	let mounted = $state(false);
	
	onMount(() => {
		mounted = true;
		
		// Parallax effect on scroll
		window.addEventListener('scroll', () => {
			const scrolled = window.pageYOffset;
			const parallaxElements = document.querySelectorAll('.parallax');
			parallaxElements.forEach((el) => {
				const speed = el.dataset.speed || 0.5;
				el.style.transform = `translateY(${scrolled * speed}px)`;
			});
		});
		
		// Animated gradient background
		const colors = [
			'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
			'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
			'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
			'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)',
			'linear-gradient(135deg, #fa709a 0%, #fee140 100%)'
		];
		
		let colorIndex = 0;
		setInterval(() => {
			colorIndex = (colorIndex + 1) % colors.length;
			const heroElements = document.querySelectorAll('.animated-gradient');
			heroElements.forEach((el) => {
				el.style.background = colors[colorIndex];
			});
		}, 5000);
	});
</script>

{#if mounted}
	<!-- Particles Background -->
	<div class="particles-container">
		{#each Array(50) as _, i}
			<div 
				class="particle" 
				style="
					left: {Math.random() * 100}%; 
					top: {Math.random() * 100}%;
					animation-delay: {Math.random() * 5}s;
					animation-duration: {5 + Math.random() * 10}s;
				"
			></div>
		{/each}
	</div>
{/if}

<style>
	.particles-container {
		position: fixed;
		top: 0;
		left: 0;
		width: 100%;
		height: 100%;
		pointer-events: none;
		z-index: 0;
		overflow: hidden;
	}
	
	.particle {
		position: absolute;
		width: 4px;
		height: 4px;
		background: radial-gradient(circle, rgba(255,255,255,0.8) 0%, transparent 70%);
		border-radius: 50%;
		animation: float-particle linear infinite;
	}
	
	@keyframes float-particle {
		0% {
			transform: translateY(0) translateX(0) scale(1);
			opacity: 0;
		}
		10% {
			opacity: 1;
		}
		90% {
			opacity: 1;
		}
		100% {
			transform: translateY(-100vh) translateX(50px) scale(0);
			opacity: 0;
		}
	}
	
	:global(.animated-gradient) {
		transition: background 2s ease-in-out;
	}
	
	:global(.parallax) {
		transition: transform 0.1s ease-out;
	}
</style>
