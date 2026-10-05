<script lang="ts">
	import './lib/wired';
	import { Router } from 'sv-router';
	import { navigate, route } from './lib/router';
	import { TABS } from './lib/tabs';
  import dayjs from 'dayjs';
  import 'dayjs/locale/ru';

	/** Активная вкладка выводится из URL — единственный источник истины теперь маршрут */
	const activeTab = $derived(TABS.find((tab) => route.pathname === tab.path)?.id);

  $effect(() => {
    dayjs.locale('ru');
  })
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
					onclick={() => navigate(tab.path)}
				>
					{tab.label}
				</wired-item>
			{/each}
		</div>
	</header>

	<main class="py-4">
		<div role="tabpanel">
			<Router />
		</div>
	</main>
</div>

