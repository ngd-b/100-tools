export function secureIndex(size: number): number {
  if (!Number.isSafeInteger(size) || size < 1 || size > 4294967296) throw new Error("候选范围必须在 1 到 2³² 之间。");
  const limit = Math.floor(4294967296 / size) * size;
  const buffer = new Uint32Array(1); let value: number;
  do { crypto.getRandomValues(buffer); value = buffer[0]; } while (value >= limit);
  return value % size;
}
export function drawIndices(size: number, count: number, repeat: boolean, random = secureIndex): number[] {
  if (!Number.isSafeInteger(size) || size < 1 || size > 4294967296) throw new Error("候选范围必须在 1 到 2³² 之间。");
  if (!Number.isInteger(count) || count < 1 || count > 10000) throw new Error("抽取数量必须为 1 到 10000 的整数。");
  if (!repeat && count > size) throw new Error("不重复抽取时，数量不能超过候选数量。");
  const swaps = new Map<number, number>(); const result: number[] = [];
  for (let i = 0; i < count; i++) {
    if (repeat) result.push(random(size));
    else { const remaining = size - i; const index = random(remaining); result.push(swaps.get(index) ?? index); swaps.set(index, swaps.get(remaining - 1) ?? remaining - 1); }
  }
  return result;
}
export function parseNames(text: string) {
  if (text.length > 1000000) throw new Error("请输入内容，最多 100 万字符。");
  return [...new Set(text.split(/\r?\n/).map(s => s.trim()).filter(Boolean))];
}
export function drawNumbers(min: number, max: number, count: number, repeat: boolean) {
  if (!Number.isSafeInteger(min) || !Number.isSafeInteger(max) || max < min) throw new Error("请输入有效的安全整数范围，最大值不能小于最小值。");
  return drawIndices(max - min + 1, count, repeat).map(i => min + i);
}
