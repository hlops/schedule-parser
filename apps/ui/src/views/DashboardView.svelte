<script lang="ts">
  import ky from 'ky';
  import type { ModelsStatisticsDto } from '@schedule-parser/shared';
  import { JsonView } from '@zerodevx/svelte-json-view';

  const dashboard = $derived(ky.get('api/dashboard').json<ModelsStatisticsDto>());
</script>

<section>
  <wired-card>
    <h2 class="m-0 mb-3">Дашборд</h2>
    <p class="m-0 text-[#777]">
      {#await dashboard}
      {:then value}
      <JsonView json={value} depth={3} />
      {:catch error}
        Ошибка: {error}
      {/await}
    </p>
  </wired-card>
</section>
