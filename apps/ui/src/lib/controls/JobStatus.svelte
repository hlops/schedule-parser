<script lang="ts">
  import type { JobDto } from '@schedule-parser/dto';

  const { status } = $props();

  const ICON_BY_STATUS: Record<JobDto['status'], { icon: string; class?: string }> = {
    new: { icon: 'circle' },
    processing: { icon: 'schedule' },
    pending: { icon: 'run_circle' },
    done: { icon: 'check_circle', class: 'text-green-700' },
    error: { icon: 'error', class: 'text-red-700' }
  };

  const icon = $derived(ICON_BY_STATUS[status] ?? { icon: '', class: '' });
</script>

<div>
  <mwc-icon class="{icon.class}">{icon.icon}</mwc-icon>
</div>
