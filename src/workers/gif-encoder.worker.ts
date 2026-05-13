// Minimal GIF Encoder (GIF89a) — runs in Web Worker to avoid blocking the main thread

interface FrameData {
  data: ArrayBuffer;
  width: number;
  height: number;
}

interface EncodeRequest {
  frames: FrameData[];
  delayMs: number;
  loop: boolean;
}

function strBytes(s: string): Uint8Array {
  const arr = new Uint8Array(s.length);
  for (let i = 0; i < s.length; i++) arr[i] = s.charCodeAt(i);
  return arr;
}

function buildPalette(frames: ImageData[]): [number, number, number][] {
  const colorCount = new Map<number, number>();
  for (const frame of frames) {
    const d = frame.data;
    for (let i = 0; i < d.length; i += 4) {
      const r = d[i] >> 3 << 3;
      const g = d[i + 1] >> 3 << 3;
      const b = d[i + 2] >> 3 << 3;
      const key = (r << 16) | (g << 8) | b;
      colorCount.set(key, (colorCount.get(key) || 0) + 1);
    }
  }
  const sorted = [...colorCount.entries()].sort((a, b) => b[1] - a[1]).slice(0, 256);
  const palette: [number, number, number][] = sorted.map(([k]) => [(k >> 16) & 0xff, (k >> 8) & 0xff, k & 0xff]);
  while (palette.length < 256) palette.push([0, 0, 0]);
  return palette;
}

function paletteToTable(palette: [number, number, number][]): Uint8Array {
  const table = new Uint8Array(768);
  for (let i = 0; i < 256; i++) {
    table[i * 3] = palette[i][0];
    table[i * 3 + 1] = palette[i][1];
    table[i * 3 + 2] = palette[i][2];
  }
  return table;
}

function nearestColor(r: number, g: number, b: number, palette: [number, number, number][]): number {
  let bestIdx = 0;
  let bestDist = Infinity;
  for (let i = 0; i < palette.length; i++) {
    const dr = r - palette[i][0];
    const dg = g - palette[i][1];
    const db = b - palette[i][2];
    const dist = dr * dr + dg * dg + db * db;
    if (dist < bestDist) { bestDist = dist; bestIdx = i; }
    if (dist === 0) break;
  }
  return bestIdx;
}

function indexFrame(frame: ImageData, palette: [number, number, number][]): Uint8Array {
  const result = new Uint8Array(frame.width * frame.height);
  const d = frame.data;
  for (let i = 0; i < d.length; i += 4) {
    const r = d[i], g = d[i + 1], b = d[i + 2];
    result[i / 4] = nearestColor(r, g, b, palette);
  }
  return result;
}

function lzwEncode(data: Uint8Array, minCodeSize: number): Uint8Array {
  const clearCode = 1 << minCodeSize;
  const eoiCode = clearCode + 1;
  let codeSize = minCodeSize + 1;
  let nextCode = eoiCode + 1;

  const output: number[] = [];
  const subBlocks: number[][] = [];
  let currentBlock: number[] = [];
  let bitBuffer = 0;
  let bitCount = 0;

  function writeBits(code: number, size: number) {
    bitBuffer |= code << bitCount;
    bitCount += size;
    while (bitCount >= 8) {
      currentBlock.push(bitBuffer & 0xff);
      bitBuffer >>= 8;
      bitCount -= 8;
      if (currentBlock.length === 255) {
        subBlocks.push(currentBlock);
        currentBlock = [];
      }
    }
  }

  writeBits(clearCode, codeSize);

  const dict = new Map<string, number>();
  for (let i = 0; i < clearCode; i++) dict.set(String.fromCharCode(i), i);

  let prefix = String.fromCharCode(data[0]);
  for (let i = 1; i < data.length; i++) {
    const c = String.fromCharCode(data[i]);
    const combo = prefix + c;
    if (dict.has(combo)) {
      prefix = combo;
    } else {
      writeBits(dict.get(prefix)!, codeSize);
      if (nextCode < 4096) {
        dict.set(combo, nextCode++);
        if (nextCode > (1 << codeSize) && codeSize < 12) codeSize++;
      } else {
        writeBits(clearCode, codeSize);
        dict.clear();
        for (let j = 0; j < clearCode; j++) dict.set(String.fromCharCode(j), j);
        nextCode = eoiCode + 1;
        codeSize = minCodeSize + 1;
      }
      prefix = c;
    }
  }
  writeBits(dict.get(prefix)!, codeSize);
  writeBits(eoiCode, codeSize);

  if (bitCount > 0) {
    currentBlock.push(bitBuffer & 0xff);
  }
  if (currentBlock.length > 0) subBlocks.push(currentBlock);

  const result: number[] = [];
  result.push(minCodeSize);
  for (const block of subBlocks) {
    result.push(block.length);
    result.push(...block);
  }
  result.push(0);

  return new Uint8Array(result);
}

function encodeGIF(frames: ImageData[], delayMs: number, loop: boolean): Uint8Array {
  const w = frames[0].width;
  const h = frames[0].height;
  const parts: Uint8Array[] = [];

  const palette = buildPalette(frames);
  const globalColorTable = paletteToTable(palette);

  parts.push(strBytes("GIF89a"));
  const lsd = new Uint8Array(7);
  lsd[0] = w & 0xff; lsd[1] = (w >> 8) & 0xff;
  lsd[2] = h & 0xff; lsd[3] = (h >> 8) & 0xff;
  lsd[4] = 0xf7;
  lsd[5] = 0; lsd[6] = 0;
  parts.push(lsd);
  parts.push(globalColorTable);

  if (loop) {
    parts.push(new Uint8Array([0x21, 0xff, 0x0b]));
    parts.push(strBytes("NETSCAPE2.0"));
    parts.push(new Uint8Array([3, 1, 0, 0, 0]));
  }

  for (const frame of frames) {
    const indexed = indexFrame(frame, palette);
    parts.push(new Uint8Array([0x21, 0xf9, 0x04, 0x00]));
    const delay = Math.round(delayMs / 10);
    parts.push(new Uint8Array([delay & 0xff, (delay >> 8) & 0xff]));
    parts.push(new Uint8Array([0, 0]));
    parts.push(new Uint8Array([0x2c]));
    const imgDesc = new Uint8Array(9);
    imgDesc[4] = w & 0xff; imgDesc[5] = (w >> 8) & 0xff;
    imgDesc[6] = h & 0xff; imgDesc[7] = (h >> 8) & 0xff;
    imgDesc[8] = 0;
    parts.push(imgDesc);
    const lzw = lzwEncode(indexed, 8);
    parts.push(lzw);
  }

  parts.push(new Uint8Array([0x3b]));

  const total = parts.reduce((s, p) => s + p.length, 0);
  const result = new Uint8Array(total);
  let offset = 0;
  for (const p of parts) { result.set(p, offset); offset += p.length; }
  return result;
}

self.onmessage = (e: MessageEvent<EncodeRequest>) => {
  const { frames: rawFrames, delayMs, loop } = e.data;

  const frames: ImageData[] = rawFrames.map((f) =>
    new ImageData(new Uint8ClampedArray(f.data), f.width, f.height)
  );

  const gifBytes = encodeGIF(frames, delayMs, loop);

  // Transfer the buffer back to the main thread
  const buffer = gifBytes.buffer.slice(0, gifBytes.byteLength) as ArrayBuffer;
  self.postMessage({ buffer }, { transfer: [buffer] });
};
