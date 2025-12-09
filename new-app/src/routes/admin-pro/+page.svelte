<script>
	import { onMount } from 'svelte';
	import { goto } from '$app/navigation';
	import { currentUser } from '$lib/stores/auth';
	
	// Redirect if not admin
	$effect(() => {
		if ($currentUser && $currentUser.email !== 'britolam1@gmail.com' && !$currentUser.isAdmin) {
			goto('/dashboard');
		}
	});
	
	// Sidebar state
	let sidebarOpen = $state(true);
	let activeSection = $state('dashboard');
	
	// Data states
	let stats = $state({
		totalUsers: 0,
		totalPages: 0,
		totalPurchases: 0,
		totalRevenue: 0,
		totalExpenses: 0,
		netProfit: 0,
		activeSubscriptions: 0,
		recentUsers: [],
		recentPurchases: [],
		recentPages: [],
		allUsers: [],
		allPages: [],
		expenses: [],
		financialData: {
			subscriptionRevenue: 0,
			deliveryRevenue: 0,
			storeRevenue: 0,
			eventRevenue: 0,
			monthlyRevenue: [],
			yearlyReport: {}
		}
	});
	
	let loading = $state(true);
	let selectedUser = $state(null);
	let searchQuery = $state('');
	let editingUser = $state(null);
	let showExpenseModal = $state(false);
	let newExpense = $state({
		description: '',
		amount: 0,
		category: 'server',
		date: new Date().toISOString().split('T')[0]
	});
	
	onMount(async () => {
		await loadStats();
		await loadExpenses();
	});
	
	async function loadStats() {
		loading = true;
		try {
			const response = await fetch('/api/admin/stats');
			if (response.ok) {
				stats = await response.json();
				// Calculate net profit
				stats.netProfit = stats.totalRevenue - stats.totalExpenses;
			}
		} catch (error) {
			console.error('Error loading admin stats:', error);
		}
		loading = false;
	}
	
	async function loadExpenses() {
		try {
			const response = await fetch('/api/admin/expenses');
			if (response.ok) {
				const data = await response.json();
				stats.expenses = data.expenses || [];
				stats.totalExpenses = data.totalExpenses || 0;
			}
		} catch (error) {
			console.error('Error loading expenses:', error);
		}
	}
	
	async function addExpense() {
		try {
			const response = await fetch('/api/admin/expenses', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify(newExpense)
			});
			
			if (response.ok) {
				alert('ההוצאה נוספה בהצלחה!');
				showExpenseModal = false;
				newExpense = {
					description: '',
					amount: 0,
					category: 'server',
					date: new Date().toISOString().split('T')[0]
				};
				await loadExpenses();
				await loadStats();
			}
		} catch (error) {
			console.error('Error adding expense:', error);
			alert('שגיאה בהוספת הוצאה');
		}
	}

	
	async function toggleUserSubscription(userId