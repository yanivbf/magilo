<script>
	import { onMount } from 'svelte';
	import { goto } from '$app/navigation';
	import { currentUser } from '$lib/stores/auth';
	
	// Import all management components
	import InventoryOrderManager from '$lib/components/manage/InventoryOrderManager.svelte';
	import AppointmentQueueManager from '$lib/components/manage/AppointmentQueueManager.svelte';
	import GuestListRSVPManager from '$lib/components/manage/GuestListRSVPManager.svelte';
	import StudentPurchaseManager from '$lib/components/manage/StudentPurchaseManager.svelte';
	import MessagesManager from '$lib/components/manage/MessagesManager.svelte';
	import LeadsManager from '$lib/components/manage/LeadsManager.svelte';
	import CourierManager from '$lib/components/manage/CourierManager.svelte';

	let { data } = $props();

	// Polymorphic component selection based on pageType
	const managementComponent = $derived(() => {
		const pageType = data.page?.pageType || 'general';
		
		console.log('🔄 Selecting management component for pageType:', pageType);
		
		switch(pageType) {
			case 'store':
			case 'restaurantMenu':
				console.log('📦 Loading Inventory & Order Manager (Store)');
				return InventoryOrderManager;
				
			case 'serviceProvider':
			case 'appointment':
				console.log('📅 Loading Appointment/Queue Manager (Service)');
				return AppointmentQueueManager;
				
			case 'event':
				console.log('🎉 Loading Guest List/RSVP Manager (Event)');
				return GuestListRSVPManager;
				
			case 'course':
				console.log('🎓 Loading Student & Purchase Manager (Course)');
				return StudentPurchaseManager;
				
			case 'messageInBottle':
				console.log('🍾 Loading Messages Manager (Message in Bottle)');
				return MessagesManager;
				
			case 'courier':
			case 'delivery':
				console.log('🚚 Loading Courier/Driver Manager (Delivery)');
				return CourierManager;
				
			case 'artist':
			case 'businessCard':
			case 'portfolio':
			case 'general':
			case 'landing':
			default:
				console.log('📋 Loading Leads Manager (Standard/Artist/Business Card/Portfolio)');
				return LeadsManager;
		}
	});

	// Redirect if not logged in
	$effect(() => {
		if (!$currentUser) {
			goto('/login');
		}
	});
</script>

<svelte:head>
	<title>ניהול דף - {data.page?.title || 'טוען...'}</title>
</svelte:head>

<!-- Polymorphic Management Interface Router -->
<div class="min-h-screen bg-gray-50">
	<!-- Loading state while component is being determined -->
	{#if !managementComponent}
		<div class="flex items-center justify-center min-h-screen">
			<div class="text-center">
				<div class="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
				<p class="text-gray-600">טוען ממשק ניהול...</p>
			</div>
		</div>
	{:else}
		<!-- Render the appropriate management component -->
		<svelte:component this={managementComponent} {data} />
	{/if}
</div>
