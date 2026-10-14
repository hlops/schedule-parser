<script lang="ts">
  import ky from 'ky';
  import type { JobDto, PageDto } from '@schedule-parser/shared';
  import dayjs from 'dayjs';
  import RelativeTime from 'dayjs/plugin/relativeTime';
  import { p } from '../router';
  import type { ParseJob } from '@schedule-parser/db';

  dayjs.extend(RelativeTime);
  const jobsPromise = $derived(ky.get('api/jobs/all', {}).json<PageDto<JobDto>>());

  const getModel = (job: JobDto) => (job as ParseJob).model;
</script>

<section>
  <wired-card>
    {#await jobsPromise}
    {:then jobs}
      <h2 class="m-0 mb-3">Джобы ({jobs.total})</h2>
      <table class="w-full">
        <thead>
        <tr class="text-center">
          <th class="text-center">#</th>
          <th>картинка/дата</th>
          <th>проверка</th>
          <th>парсинг</th>
          <th>расписание</th>
          <th>загрузка</th>
          <th></th>
        </tr>
        </thead>
        <tbody>
        {#each jobs.pages as job, i (`${job.id}`)}
          <tr class="bg-gray-100 text-center">
            <td><a href={p('/job', { search: { id: job.id } })}>
              {dayjs(job.startAt).format('DD MMM hh:mm:ss')}
            </a>
            </td>
            <td>{job.type}</td>
            <td>{job.status}</td>
            <td>
              {dayjs(job.startAt).to(job.finishedAt, true)}
            </td>
            <td>
              {getModel(job)}
            </td>
          </tr>
        {/each}
        </tbody>
      </table>
    {:catch error}
      Ошибка: {error}
    {/await}
  </wired-card>
</section>
