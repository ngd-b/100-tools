export type TextOptions = {
  trim: boolean;
  removeEmpty: boolean;
  removeInvisible: boolean;
  deduplicate: boolean;
  ignoreCase: boolean;
  sort: "original" | "ascending" | "descending" | "reverse";
  letterCase: "original" | "lower" | "upper";
  prefix: string;
  suffix: string;
};

export const defaultTextOptions: TextOptions = {
  trim: true,
  removeEmpty: true,
  removeInvisible: false,
  deduplicate: false,
  ignoreCase: false,
  sort: "original",
  letterCase: "original",
  prefix: "",
  suffix: "",
};

export function processText(input: string, options: TextOptions): string {
  if (!input) return "";
  let lines = input.split(/\r\n|\r|\n/).map((line) => {
    // Preserve joiners and variation selectors used in emoji and other scripts.
    if (options.removeInvisible) line = line.replace(/[\u200B\uFEFF]/g, "");
    if (options.trim) line = line.trim();
    if (options.letterCase === "lower") line = line.toLowerCase();
    if (options.letterCase === "upper") line = line.toUpperCase();
    return line;
  });
  if (options.removeEmpty) lines = lines.filter((line) => line.trim() !== "");
  if (options.deduplicate) {
    const seen = new Set<string>();
    lines = lines.filter((line) => {
      const key = options.ignoreCase ? line.toLowerCase() : line;
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    });
  }
  if (options.sort === "reverse") lines.reverse();
  if (options.sort === "ascending" || options.sort === "descending") {
    const collator = new Intl.Collator("zh-CN", { numeric: true });
    const direction = options.sort === "ascending" ? 1 : -1;
    lines.sort((a, b) => direction * collator.compare(a, b));
  }
  return lines.map((line) => `${options.prefix}${line}${options.suffix}`).join("\n");
}
