<script lang="ts">
  import type { JobDto } from '@schedule-parser/shared';

  interface JobStatusProps {
    jobs: JobDto[];
    type: JobDto['type']
  }

  const { jobs, type }: JobStatusProps = $props();
  const job = $derived(jobs.filter(job => job.type == type).at(-1));
</script>

<div>
  {#if job?.status === 'new'}
    <mwc-icon class="">circle</mwc-icon>
  {:else if job?.status === 'processing'}
    <mwc-icon class="">schedule</mwc-icon>
  {:else if job?.status === 'pending'}
    <mwc-icon class="">run_circle</mwc-icon>
  {:else if job?.status === 'done'}
    <mwc-icon class="text-green-700">check_circle</mwc-icon>
  {:else if job?.status === 'error'}
    <mwc-icon class="text-red-700 cursor-pointer" title={job.error}>error</mwc-icon>
  {/if}
</div>
