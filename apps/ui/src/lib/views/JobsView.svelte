<script lang="ts">
  import { jobsStore } from '../stores/jobs.svelte';
  import dayjs from 'dayjs';
  import JobStatus from '../controls/JobStatus.svelte';
  import { p } from '../router';

  $effect(() => {
    void jobsStore.load();
  });

  const openState = $state<Record<string, boolean>>({});
</script>

<section>
  <wired-card>
    <h2 class="m-0 mb-3">Джобы ({jobsStore.total})</h2>
    <div class="scroll-container">
      <wired-card elevation="2">
        <table class="w-full">
          <thead>
          <tr class="text-center">
            <th class="text-center">#</th>
            <th>картинка/дата</th>
            <th>проверка</th>
            <th>парсинг</th>
            <th>загрузка</th>
            <th></th>
          </tr>
          </thead>
          <tbody>
          {#each jobsStore.jobs as jobs, i (`${jobs[0].fileName}`)}
            {@const jobId = jobs[0].fileName}
            <tr class="text-center">
              <td>
                {i + 1}.
              </td>
              <td>
                <a
                  href={`uploads/${jobs[0].fileName}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={`Открыть картинку ${jobs[0].fileName}`}
                >
                  <wired-image elevation={2} src={`uploads/${jobs[0].fileName}`}
                               class="w-100 text-gray-400"></wired-image>
                </a>
              </td>
              <td>
                <JobStatus jobs={jobs} type="check" />
              </td>
              <td>
                <JobStatus jobs={jobs} type="parse" />
              </td>
              <td>
                <JobStatus jobs={jobs} type="schedule" />
              </td>
              <td>
                <!-- svelte-ignore a11y_click_events_have_key_events, a11y_no_static_element_interactions -->
                <wired-icon-button onclick={() => openState[jobId] = !openState[jobId]}>
                  {#if openState[jobId]}
                    <mwc-icon class="small">collapse_all</mwc-icon>
                  {:else}
                    <mwc-icon class="small">expand_all</mwc-icon>
                  {/if}
                </wired-icon-button>
              </td>
            </tr>
            {#if openState[jobId]}
              {#each jobs as job (job.id)}
                <tr class="bg-gray-100 text-center">
                  <td></td>
                  <td>
                    <a href={p('/job', { search: { id: job.id } })}>
                      {dayjs(job.startAt).format('D MMM hh:mm:ss')}
                    </a>
                  </td>
                  <td>
                    <JobStatus jobs={[job]} type="check" />
                  </td>
                  <td>
                    <JobStatus jobs={[job]} type="parse" />
                  </td>
                  <td>
                    <JobStatus jobs={[job]} type="schedule" />
                  </td>
                </tr>
              {/each}
            {/if}
          {/each}
          </tbody>
        </table>
      </wired-card>
    </div>
  </wired-card>
</section>
