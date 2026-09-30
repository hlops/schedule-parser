<script lang="ts">
	import './lib/wired';
	import { DEFAULT_TAB, TABS, type TabId } from './lib/tabs';
	import DashboardView from './lib/views/DashboardView.svelte';
	import JobsView from './lib/views/JobsView.svelte';
	import LogsView from './lib/views/LogsView.svelte';

	let activeTab = $state<TabId>(DEFAULT_TAB);
</script>

<div class="mx-auto max-w-4xl">
	<header>
		<h1 class="my-2 text-2xl">ScheduleParser</h1>

		<wired-divider class="pb-3" elevation={2}></wired-divider>

		<div role="tablist">
			{#each TABS as tab (tab.id)}
				<wired-item
					role="tab"
					id={`tab-${tab.id}`}
					aria-selected={activeTab === tab.id}
					aria-controls={`panel-${tab.id}`}
					selected={activeTab === tab.id}
					onclick={() => (activeTab = tab.id)}
				>
					{tab.label}
				</wired-item>
			{/each}
		</div>
	</header>

	<main class="py-4">
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

