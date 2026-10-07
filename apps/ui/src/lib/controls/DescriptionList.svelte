<script lang="ts">
  export let items: Array<{ key: string; value: string | number | null | undefined }> = [];
  export let labelWidth: string = 'w-1/3'; // можно настроить ширину колонки ключа
</script>

<dl class="divide-y divide-gray-100 dark:divide-gray-800">
  {#each items as item (item.key)}
    <div class="flex py-1">
      <!-- Ключ (термин) -->
      <dt class="text-gray-500 dark:text-gray-400 shrink-0 {labelWidth}">
        {item.key}
      </dt>
      <!-- Значение -->
      <dd class="text-gray-900 dark:text-gray-100 break-words">
        {item.value ?? '—'}
      </dd>
    </div>
  {/each}
</dl>
