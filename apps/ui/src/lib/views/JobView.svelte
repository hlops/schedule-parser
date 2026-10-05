<script lang="ts">
	import { p, route } from '../router';

	/** Идентификатор джобы из строки запроса: `/job?id=<id>` */
	const id = $derived(route.search.id);
</script>

<section>
	<wired-card>
		<h2 class="m-0 mb-3">Джоба</h2>
		{#if id}
			<p class="m-0">Идентификатор: {id}</p>
		{:else}
			<p class="m-0 text-[#777]">Идентификатор не указан.</p>
		{/if}
		<p class="mt-3 mb-0">
			<a href={p('/jobs')}>← К списку джоб</a>
		</p>
	</wired-card>
</section>
