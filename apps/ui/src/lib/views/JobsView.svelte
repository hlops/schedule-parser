<script lang="ts">
  import { jobsStore } from '../stores/jobs.svelte';

  $effect(() => {
    void jobsStore.load();
  });
</script>

<section>
  <wired-card>
    <h2 class="m-0 mb-3">Джобы ({jobsStore.total})</h2>
    <div class="scroll-container">
      <wired-card elevation="2">
        <table>
          <thead>
          <tr>
            <th>#</th>
            <th>дата</th>
            <th>чек</th>
            <th>парсинг</th>
            <th>расписание</th>
          </tr>
          </thead>
          <tbody>
          {#each jobsStore.jobs as job, i (`${job.fileName}-${job.type}-${job.iteration}-${job.startAt}`)}
            <tr>
              <td>{i+1}.</td>
              <td>{job.id}</td>
              <td>{job.type}</td>
              <td>{job.status}</td>
            </tr>
          {/each}
          </tbody>
        </table>
      </wired-card>
    </div>
  </wired-card>
</section>
