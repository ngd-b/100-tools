declare module "@evan/wasm/target/opus/deno.js" {
  export class Encoder {
    constructor(options?: { channels?: 1 | 2; application?: "voip" | "audio" | "restricted_lowdelay"; sample_rate?: 8000 | 12000 | 16000 | 24000 | 48000 });
    channels: 1 | 2;
    readonly lookahead: number;
    bitrate: number;
    encode(buf: Int16Array | ArrayBufferView): Uint8Array;
    reset(): void;
  }
}
