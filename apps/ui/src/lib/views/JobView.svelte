<script lang="ts">
  import ky from 'ky';
  import type { JobFullDto } from '@schedule-parser/dto';
  import { p } from '../router';
  import { JsonView } from '@zerodevx/svelte-json-view';
  import { jobsStore } from '../stores/jobs.svelte';
  import { searchParams } from 'sv-router';

  /** Идентификатор джобы из строки запроса: `/job?id=<id>` */
  const id = $derived(searchParams.get('id'));
  /**
   * `ky` сам отклоняет промис на любом не-2xx статусе (`HTTPError`),
   * поэтому 404 из `GET /api/job` попадает в ветку `{:catch}`.
   */
  const job = $derived(ky.get('api/job', { searchParams: { id: String(id) } }).json<JobFullDto>());
</script>

<section>
  <wired-card>
    {#await job}
    {:then value}
      <h2 class="m-0 mb-3">Джоба {value.id}</h2>
      <ul class="content list-['-_'] list-outside px-5" >
        <li>Картинка: <a
          href={`uploads/${value.fileName}`}
          target="_blank"
          rel="noopener noreferrer"
          aria-label={`Открыть картинку ${value.fileName}`}
        >{value.fileName}</a></li>
        <li>Статус: {value.status}</li>
        {#if value.error}
          <wired-divider />
          <div class="flex justify-between">
            <li class="text-red-700">Ошибка: {JSON.stringify(value.error)}</li>
            <wired-button onclick={() => jobsStore.restart(value.id).then(id => {
              searchParams.set('id', id);
            })}>Перезапустить
            </wired-button>
          </div>
        {/if}
        {#if value.type === 'check'}
          <li>Метрики: <JsonView json={value.metrics} depth={1} /></li>
        {:else if value.type === 'parse'}
          <li>
            parseAttempt: {value.parseAttempt}
          </li>
          {#if value.response}
            <li>
              response:
              <JsonView json={JSON.parse(value.response)} depth={1} />
            </li>
          {/if}
            <wired-button onclick={() => jobsStore.createSchedule(value.id).then(id => {
              searchParams.set('id', id);
            })}>Создать расписание
            </wired-button>
        {:else if value.type === 'schedule'}
          <JsonView json={value} depth={1} />
          <li>
            date: {value.date}
          </li>
          <li>
            classes: {value.classes}
          </li>
        {/if}
      </ul>
    {:catch error}
      Ошибка: {error}
    {/await}
    <p class="mt-3 mb-0">
      <a href={p('/jobs')}>← К списку джоб</a>
    </p>
  </wired-card>
</section>
