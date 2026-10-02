<script lang="ts">
  import dayjs from 'dayjs';
  import { jobsStore } from '../stores/jobs.svelte';
  import JobStatus from '../controls/JobStatus.svelte';
  import { computeJobsStatus } from '../utils/jobs';

  $effect(() => {
    void jobsStore.load();
  });

  const openState = $state<Record<string, boolean>>({});
</script>

<style>
  /* Сетка для строк основного списка: картинка | проверка | парсинг | загрузка | кнопка */
  .jobs-row-grid {
    display: grid;
    grid-template-columns:
    48px
    minmax(120px, 1fr)
    120px
    120px
    120px
    48px;

    /* отступы между ячейками — задаются один раз здесь */
    gap: 0.5rem;
    align-items: center;
  }

  /* Сетка для раскрывающегося блока: id | дата | тип | статус */
  .jobs-details-grid {
    display: grid;
    grid-template-columns:
    minmax(160px, 1fr)
    minmax(120px, 0.7fr)
    minmax(120px, 0.7fr)
    48px;

    gap: 0.5rem;
    align-items: center;
  }

  .small {
    --wired-icon-size: 16px;
    padding: 0;
  }
</style>

<section>
  <wired-card>
    <h2 class="m-0 mb-3">Джобы ({jobsStore.total})</h2>
    <div class="scroll-container">
      <wired-card elevation="2">
        <div class="jobs-row-grid">
          <!-- Header -->
          <div class="contents text-left font-semibold">
            <div>#</div>
            <div>картинка</div>
            <div>проверка</div>
            <div>парсинг</div>
            <div>загрузка</div>
            <div></div>
          </div>

          {#each jobsStore.jobs as jobs, i (`${jobs[0].fileName}`)}
            {@const jobId = jobs[0].fileName}

            <!-- Строка -->
            <div class="contents">
              <div>
                {i + 1}.
              </div>
              <div>
                <a href={`uploads/${jobs[0].fileName}`} target="_blank" rel="noopener noreferrer">
                  <img src={`uploads/${jobs[0].fileName}`} alt="" width="100px" />
                </a>
              </div>
              <div>
                <JobStatus status={computeJobsStatus(jobs, 'check')} />
              </div>
              <div>
                <JobStatus status={computeJobsStatus(jobs, 'parse')} />
              </div>
              <div>
                <JobStatus status={computeJobsStatus(jobs, 'schedule')} />
              </div>
              <div>
                <wired-icon-button onclick={() => openState[jobId] = !openState[jobId]}>
                  {#if openState[jobId]}
                    <mwc-icon class="small">collapse_all</mwc-icon>
                  {:else}
                    <mwc-icon class="small">expand_all</mwc-icon>
                  {/if}
                </wired-icon-button>
              </div>
            </div>

            {#if openState[jobId]}
              <!-- Раскрывающийся блок на всю ширину -->
              <div class="col-span-full bg-gray-50 border-b">
                <div class="jobs-details-grid">
                  <div class="contents text-left font-semibold">
                    <div>дата</div>
                    <div>тип</div>
                    <div>статус</div>
                    <div></div>
                  </div>

                  {#each jobs as job (job.id)}
                    <div class="contents">
                      <div>{dayjs(job.startAt).format('D MMM HH:mm:ss')}</div>
                      <div>{job.type}</div>
                      <div>{job.status}</div>
                      <div>
                        {#if job.status === 'error'}
                          <wired-icon-button onclick={() => {}}>
                            <mwc-icon class="small">replay</mwc-icon>
                          </wired-icon-button>
                        {/if}
                      </div>
                    </div>

                    {#if job.error}
                      <div class="col-span-full text-red-700">
                        {job.error}
                      </div>
                    {/if}
                  {/each}
                </div>
              </div>
            {/if}
          {/each}
        </div>
      </wired-card>
    </div>
  </wired-card>
</section>
