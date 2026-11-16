<script lang="ts">
  let {
    currentPage = $bindable(1),
    totalPages,
    onPageChange
  }: {
    currentPage: number;
    totalPages: number;
    onPageChange?: (page: number) => void;
  } = $props();

  function goToPage(page: number) {
    if (page < 1 || page > totalPages) return;
    currentPage = page;
    onPageChange?.(page);
  }
</script>

<div class="pagination">
  <wired-button
    disabled={currentPage <= 1}
    onclick={() => goToPage(currentPage - 1)}
  >
    Назад
  </wired-button>

  <span>Страница {currentPage} из {totalPages}</span>

  <wired-button
    disabled={currentPage >= totalPages}
    onclick={() => goToPage(currentPage + 1)}
  >
    Вперед
  </wired-button>
</div>

<style>
  .pagination {
    display: flex;
    align-items: center;
    gap: 1rem;
    margin-top: 1rem;
  }
</style>
