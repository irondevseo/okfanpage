/**
 * Chạy worker song songh với giới hạn concurrency, giữ thứ tự kết quả theo `items`.
 */
export async function runPool<T, R>(
  items: readonly T[],
  concurrency: number,
  worker: (item: T, index: number) => Promise<R>,
): Promise<R[]> {
  const n = items.length;
  if (n === 0) {
    return [];
  }
  const results: R[] = new Array(n);
  let cursor = 0;
  const limit = Math.max(1, Math.floor(concurrency));

  async function runWorker(): Promise<void> {
    for (;;) {
      const i = cursor++;
      if (i >= n) {
        return;
      }
      results[i] = await worker(items[i], i);
    }
  }

  const workers = Math.min(limit, n);
  await Promise.all(Array.from({ length: workers }, () => runWorker()));
  return results;
}
