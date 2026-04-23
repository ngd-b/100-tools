export interface RGB { r: number; g: number; b: number }
export interface HSL { h: number; s: number; l: number }

export function hexToRgb(hex: string): RGB | null {
  const match = hex.replace(/^#/, "").match(/[\da-f]{2}/gi);
  if (!match || match.length < 3) return null;
  return {
    r: parseInt(match[0], 16),
    g: parseInt(match[1], 16),
    b: parseInt(match[2], 16),
  };
}

export function rgbToHex(r: number, g: number, b: number): string {
  return (
    "#" +
    [r, g, b].map((v) => v.toString(16).padStart(2, "0")).join("")
  ).toUpperCase();
}

export function rgbToHsl(r: number, g: number, b: number): HSL {
  r /= 255;
  g /= 255;
  b /= 255;
  const max = Math.max(r, g, b), min = Math.min(r, g, b);
  let h = 0, s = 0;
  const l = (max + min) / 2;
  if (max !== min) {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    switch (max) {
      case r: h = ((g - b) / d + (g < b ? 6 : 0)) / 6; break;
      case g: h = ((b - r) / d + 2) / 6; break;
      case b: h = ((r - g) / d + 4) / 6; break;
    }
  }
  return { h: Math.round(h * 360), s: Math.round(s * 100), l: Math.round(l * 100) };
}

export function hslToRgb(h: number, s: number, l: number): RGB {
  h /= 360;
  s /= 100;
  l /= 100;
  let r: number, g: number, b: number;
  if (s === 0) {
    r = g = b = l;
  } else {
    const hue2rgb = (p: number, q: number, t: number) => {
      if (t < 0) t += 1;
      if (t > 1) t -= 1;
      if (t < 1 / 6) return p + (q - p) * 6 * t;
      if (t < 1 / 2) return q;
      if (t < 2 / 3) return p + (q - p) * (2 / 3 - t) * 6;
      return p;
    };
    const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
    const p = 2 * l - q;
    r = hue2rgb(p, q, h + 1 / 3);
    g = hue2rgb(p, q, h);
    b = hue2rgb(p, q, h - 1 / 3);
  }
  return { r: Math.round(r * 255), g: Math.round(g * 255), b: Math.round(b * 255) };
}

export function parseColor(input: string): RGB | null {
  input = input.trim();
  if (input.startsWith("#")) return hexToRgb(input);

  const rgbMatch = input.match(/rgb\(\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)\s*\)/i);
  if (rgbMatch) {
    return { r: Number(rgbMatch[1]), g: Number(rgbMatch[2]), b: Number(rgbMatch[3]) };
  }

  const hslMatch = input.match(/hsl\(\s*(\d+)\s*,\s*(\d+)%\s*,\s*(\d+)%\s*\)/i);
  if (hslMatch) {
    return hslToRgb(Number(hslMatch[1]), Number(hslMatch[2]), Number(hslMatch[3]));
  }

  if (/^[\da-f]{6}$/i.test(input)) return hexToRgb("#" + input);
  if (/^[\da-f]{3}$/i.test(input)) {
    const expanded = input[0] + input[0] + input[1] + input[1] + input[2] + input[2];
    return hexToRgb("#" + expanded);
  }
  return null;
}

export function generateComplementaryColor(hex: string): string[] {
  const rgb = parseColor(hex);
  if (!rgb) return [];
  const hsl = rgbToHsl(rgb.r, rgb.g, rgb.b);
  return [
    rgbToHex(rgb.r, rgb.g, rgb.b),
    (() => { const c = hslToRgb((hsl.h + 180) % 360, hsl.s, hsl.l); return rgbToHex(c.r, c.g, c.b); })(),
    (() => { const c = hslToRgb((hsl.h + 30) % 360, hsl.s, hsl.l); return rgbToHex(c.r, c.g, c.b); })(),
    (() => { const c = hslToRgb((hsl.h + 60) % 360, hsl.s, hsl.l); return rgbToHex(c.r, c.g, c.b); })(),
    (() => { const c = hslToRgb((hsl.h + 120) % 360, hsl.s, hsl.l); return rgbToHex(c.r, c.g, c.b); })(),
  ];
}
