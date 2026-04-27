"use client";

import { useState, useCallback } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const EMOJIS: Record<string, string[]> = {
  "表情": ["😀", "😃", "😄", "😁", "😆", "😅", "🤣", "😂", "🙂", "😊", "😇", "🥰", "😍", "🤩", "😘", "😋", "😛", "😜", "🤪", "😎", "🤗", "🤔", "😐", "😑", "😶", "😏", "😒", "🙄", "😬", "😮", "😯", "😲", "😳", "🥺", "😦", "😧", "😨", "😰", "😥", "😢", "😭", "😱", "😖", "😣", "😞", "😓", "😩", "😫", "🥱"],
  "手势": ["👋", "🤚", "🖐️", "✋", "🖖", "👌", "🤌", "🤏", "✌️", "🤞", "🤟", "🤘", "🤙", "👈", "👉", "👆", "🖕", "👇", "☝️", "👍", "👎", "✊", "👊", "🤛", "🤜", "👏", "🙌", "👐", "🤲", "🤝", "🙏"],
  "动物": ["🐶", "🐱", "🐭", "🐹", "🐰", "🦊", "🐻", "🐼", "🐨", "🐯", "🦁", "🐮", "🐷", "🐸", "🐵", "🐔", "🐧", "🐦", "🐤", "🦆", "🦅", "🦉", "🦇", "🐺", "🐗", "🐴", "🦄", "🐝", "🐛", "🦋"],
  "食物": ["🍎", "🍐", "🍊", "🍋", "🍌", "🍉", "🍇", "🍓", "🫐", "🍈", "🍒", "🍑", "🥭", "🍍", "🥥", "🥝", "🍅", "🍆", "🥑", "🥦", "🌽", "🥕", "🍔", "🍟", "🍕", "🌭", "🥪", "🌮", "🍜", "🍣"],
  "物品": ["⌚", "📱", "💻", "⌨️", "🖥️", "🖨️", "🖱️", "💾", "💿", "📷", "📹", "🎥", "📞", "☎️", "📺", "📻", "🎮", "🕹️", "📡", "💡", "🔦", "📖", "📚", "✏️", "📝", "📎", "📌", "✂️", "🔒", "🔑"],
  "符号": ["❤️", "🧡", "💛", "💚", "💙", "💜", "🖤", "🤍", "🤎", "💔", "❣️", "💕", "💞", "💓", "💗", "💖", "💘", "💝", "⭐", "🌟", "✨", "💫", "🔥", "💥", "☀️", "🌈", "☁️", "🌊", "❄️", "💧"],
};

export function EmojiPicker() {
  const [search, setSearch] = useState("");
  const [copied, setCopied] = useState(false);

  const filteredEmojis = useCallback(() => {
    if (!search) return EMOJIS;
    const result: Record<string, string[]> = {};
    Object.entries(EMOJIS).forEach(([cat, emojis]) => {
      result[cat] = emojis;
    });
    return result;
  }, [search]);

  const [text, setText] = useState("");

  const handleCopy = useCallback(() => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  }, [text]);

  return (
    <div>
      <div className="glass-card mb-6">
        <Label className="mb-3 block">搜索或分类浏览</Label>
        <Input placeholder="搜索 emoji..." value={search} onChange={(e) => setSearch(e.target.value)} />
      </div>

      <div className="mb-6">
        {Object.entries(filteredEmojis()).map(([category, emojis]) => (
          <div key={category} className="mb-4">
            <h4 className="mb-2 text-sm font-medium text-gray-500">{category}</h4>
            <div className="flex flex-wrap gap-1">
              {emojis.map((emoji, i) => (
                <button
                  key={i}
                  className="flex h-9 w-9 items-center justify-center rounded-lg text-xl hover:bg-gray-100 transition-colors"
                  onClick={() => setText((prev) => prev + emoji)}
                  title={emoji}
                >
                  {emoji}
                </button>
              ))}
            </div>
          </div>
        ))}
      </div>

      {text && (
        <div className="glass-card">
          <div className="mb-3 flex items-center justify-between">
            <Label>已选表情</Label>
            <button className="copy-btn text-xs text-blue-500 hover:text-blue-600" onClick={handleCopy}>
              {copied ? "✓" : "复制"}
            </button>
          </div>
          <div className="rounded-xl bg-gray-50 p-4 text-2xl leading-relaxed min-h-[60px]">
            {text}
          </div>
          <button className="mt-3 w-full rounded-lg bg-gray-100 py-2 text-xs text-gray-500 hover:bg-gray-200" onClick={() => setText("")}>
            清空
          </button>
        </div>
      )}

      <div className="mt-8 rounded-2xl border border-amber-200 bg-amber-50/50 px-5 py-4 text-xs leading-relaxed text-gray-500">
        💡 点击 Emoji 添加到下方文本框，可组合使用，一键复制。
      </div>
    </div>
  );
}
