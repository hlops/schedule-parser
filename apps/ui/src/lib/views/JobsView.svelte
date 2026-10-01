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
            <th>#</th>
            <th>дата</th>
            <th>картинка</th>
            <th>id</th>
            <th>тип</th>
            <th>статус</th>
          </tr>
          </thead>
          <tbody>
          {#each jobsStore.jobs as job, i (`${job.id}`)}
            <tr>
              <td>{i + 1}.</td>
              <td>{dayjs(job.startAt).format('D MMM hh:mm')}</td>
              <td>
                <a href={`uploads/${job.fileName}`} target="_blank" rel="noopener noreferrer">
                  <img src={`uploads/${job.fileName}`} alt="" width="100px" />
                </a>
              </td>
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
