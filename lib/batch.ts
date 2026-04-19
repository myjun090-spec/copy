export async function mapWithConcurrency<T, R>(
  items: readonly T[],
  limit: number,
  worker: (item: T, index: number) => Promise<R>,
  onProgress?: (done: number, total: number) => void,
): Promise<R[]> {
  const total = items.length;
  const results: R[] = new Array(total);
  let cursor = 0;
  let done = 0;

  const runners = new Array(Math.min(Math.max(limit, 1), total)).fill(0).map(async () => {
    while (true) {
      const current = cursor++;
      if (current >= total) return;
      results[current] = await worker(items[current], current);
      done += 1;
      onProgress?.(done, total);
    }
  });

  await Promise.all(runners);
  return results;
}
