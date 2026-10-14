<script lang="ts">
  import ky from 'ky';
  import type { CalendarJobDto, CheckJobDto, JobDto, ParseJobDto, ScheduleJobDto } from '@schedule-parser/shared';
  import { p } from '../router';
  import { JsonView } from '@zerodevx/svelte-json-view';
  import { jobsStore } from '../stores/jobs.svelte';
  import { searchParams } from 'sv-router';
  import dayjs from 'dayjs';

  /** Идентификатор джобы из строки запроса: `/job?id=<id>` */
  const id = $derived(searchParams.get('id'));
  /**
   * `ky` сам отклоняет промис на любом не-2xx статусе (`HTTPError`),
   * поэтому 404 из `GET /api/job` попадает в ветку `{:catch}`.
   */
  const job = $derived(ky.get('api/job', { searchParams: { id: String(id) } }).json<JobDto>());
</script>

{#snippet checkJobView(job: CheckJobDto)}
  <li>Метрики:
    <JsonView json={job.metrics} depth={1} />
  </li>
{/snippet}

{#snippet parseJobView(job: ParseJobDto)}
  <li>Модель: {job.model}</li>
  <li>
    parseAttempt: {job.parseAttempt}
  </li>
  {#if job.response}
    <li>
      response:
      <JsonView json={typeof job.response === 'string' ? JSON.parse(job.response) : job.response} depth={0} />
    </li>
  {/if}
  <wired-button onclick={() => jobsStore.createSchedule(job.id).then(id => {searchParams.set('id', id);})}>
    Создать расписание
  </wired-button>
{/snippet}

{#snippet scheduleJobView(job: ScheduleJobDto)}
  <JsonView json={job} depth={1} />
  <li>
    date: {job.date}
  </li>
  <li>
    classes: {job.classes}
  </li>
{/snippet}

{#snippet calendarJobView(job: CalendarJobDto)}
  <wired-button onclick={() => jobsStore.restart(job.id).then(id => { searchParams.set('id', id); })}>
    Перезапустить
  </wired-button>
  <li>
    date: {dayjs(job.date).format('DD MMM YYYY')}
  </li>
  <li>
    events:
    <JsonView json={job.events} depth={1} />
  </li>
{/snippet}

<section>
  <wired-card>
    {#await job}
    {:then value}
      <h2 class="m-0 mb-3">Джоба {value.id}</h2>
      <ul class="content list-['-_'] list-outside px-5">
        <li>Картинка: <a
          href={`uploads/${value.fileName}`}
          target="_blank"
          rel="noopener noreferrer"
          aria-label={`Открыть картинку ${value.fileName}`}
        >{value.fileName}</a></li>
        <li>Тип: {value.type}</li>
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
          {@render checkJobView(value)}
        {:else if value.type === 'parse'}
          {@render parseJobView(value)}
        {:else if value.type === 'schedule'}
          {@render scheduleJobView(value)}
        {:else if value.type === 'upload'}
          {@render calendarJobView(value)}
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
