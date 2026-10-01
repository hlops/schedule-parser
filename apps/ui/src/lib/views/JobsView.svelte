<script lang="ts">
  import { jobsStore } from '../stores/jobs.svelte';
  import dayjs from 'dayjs';

  $effect(() => {
    void jobsStore.load();
  });
</script>

<section>
  <wired-card>
    <h2 class="m-0 mb-3">Джобы ({jobsStore.total})</h2>
    <div class="scroll-container">
      <wired-card elevation="2">
        <table width="100%">
          <thead>
          <tr class="text-left">
            <th>картинка</th>
            <th>id</th>
            <th>дата</th>
            <th>тип</th>
            <th>статус</th>
          </tr>
          </thead>
          <tbody>
          {#each jobsStore.jobs as jobs, i (`${jobs[0].fileName}`)}
            <tr>
              <td rowspan="{jobs.length+1}">
                {i+1}.
                <a href={`uploads/${jobs[0].fileName}`} target="_blank" rel="noopener noreferrer">
                  <img src={`uploads/${jobs[0].fileName}`} alt="" width="100px" />
                </a>
              </td>
            </tr>
            {#each jobs as job (job.id)}
              <tr>
                <td>{job.id}</td>
                <td>{dayjs(job.startAt).format('D MMM hh:mm')}</td>
                <td>{job.type}</td>
                <td>{job.status}</td>
              </tr>
            {/each}
          {/each}
          </tbody>
        </table>
      </wired-card>
    </div>
  </wired-card>
</section>
