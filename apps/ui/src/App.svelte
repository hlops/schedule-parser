<script lang="ts">
	import { DEFAULT_TAB, TABS, type TabId } from './lib/tabs';
	import DashboardView from './lib/views/DashboardView.svelte';
	import JobsView from './lib/views/JobsView.svelte';
	import LogsView from './lib/views/LogsView.svelte';

	let activeTab = $state<TabId>(DEFAULT_TAB);
</script>

<div class="app">
	<header>
		<h1>ScheduleParser</h1>

		<ul class="tabs" role="tablist">
			{#each TABS as tab (tab.id)}
				<li class="tab-item">
					<button
						type="button"
						role="tab"
						id={`tab-${tab.id}`}
						class="tab"
						class:active={activeTab === tab.id}
						aria-selected={activeTab === tab.id}
						aria-controls={`panel-${tab.id}`}
						onclick={() => (activeTab = tab.id)}
					>
						{tab.label}
					</button>
				</li>
			{/each}
		</ul>
	</header>

	<main>
		<div id={`panel-${activeTab}`} role="tabpanel" aria-labelledby={`tab-${activeTab}`}>
			{#if activeTab === 'dashboard'}
				<DashboardView />
			{:else if activeTab === 'jobs'}
				<JobsView />
			{:else}
				<LogsView />
			{/if}
		</div>
	</main>
</div>

<style>
	.app {
		max-width: 1024px;
		margin: 0 auto;
	}

	header {
		border-bottom: 1px solid #eee;
	}

	h1 {
		margin: 0.4em 0;
		font-size: 1.4em;
	}

	.tabs {
		display: flex;
		gap: 0.25em;
		margin: 0;
		padding: 0;
		list-style: none;
	}

	.tab-item {
		display: flex;
	}

	.tab {
		margin: 0;
		padding: 0.5em 1em;
		color: #666;
		background: transparent;
		border: none;
		border-bottom: 2px solid transparent;
		border-radius: 0;
		cursor: pointer;
	}

	.tab:hover {
		color: #333;
		background: #f4f4f4;
	}

	.tab.active {
		color: #ff3e00;
		border-bottom-color: #ff3e00;
	}

	main {
		padding: 1em 0;
	}
</style>
