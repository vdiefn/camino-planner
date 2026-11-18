import { ref, onMounted, onUnmounted, type Ref } from "vue";

/**
 * 動態計算二欄／三欄版面左側 Sticky 側邊欄的頂部偏移量，
 * 讓左側欄的初始位置與吸頂位置重合，避免右側滾動時左側產生位移或被吸頂列遮擋。
 */
export function useStickySidebar(
  stickyHeaderRef: Ref<HTMLElement | null>,
  defaultOffset = 132,
) {
  const sidebarTopOffset = ref<number>(defaultOffset);
  let resizeObserver: ResizeObserver | null = null;

  const updateSidebarLayout = () => {
    const el = stickyHeaderRef.value;
    if (!el) return;

    const styles = getComputedStyle(el);
    const stickyTop = parseFloat(styles.top) || 64;
    const marginBottom = parseFloat(styles.marginBottom) || 0;
    sidebarTopOffset.value = stickyTop + el.offsetHeight + marginBottom;
  };

  onMounted(() => {
    updateSidebarLayout();

    if (stickyHeaderRef.value && typeof ResizeObserver !== "undefined") {
      resizeObserver = new ResizeObserver(updateSidebarLayout);
      resizeObserver.observe(stickyHeaderRef.value);
    } else {
      window.addEventListener("resize", updateSidebarLayout);
    }
  });

  onUnmounted(() => {
    window.removeEventListener("resize", updateSidebarLayout);
    resizeObserver?.disconnect();
    resizeObserver = null;
  });

  return sidebarTopOffset;
}
