<script lang="ts">
	import { p } from '../router';
</script>

<section>
	<wired-card>
		<h2 class="m-0 mb-3">Страница не найдена</h2>
		<p class="m-0 text-[#777]">
			Такого адреса нет. <a href={p('/jobs')}>К списку джоб</a>.
		</p>
	</wired-card>
</section>
