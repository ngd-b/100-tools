"use client";

import { useState, useEffect } from "react";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export function TextToSpeechTool() {
  const [text, setText] = useState("Hello, 这是一个文本转语音的示例。");
  const [voices, setVoices] = useState<any[]>([]);
  const [selectedVoice, setSelectedVoice] = useState("");
  const [rate, setRate] = useState(1);
  const [pitch, setPitch] = useState(1);
  const [speaking, setSpeaking] = useState(false);

  useEffect(() => {
    function loadVoices() {
      const v = window.speechSynthesis.getVoices();
      setVoices(v);
      const zh = v.find((voice) => voice.lang.startsWith("zh"));
      if (zh) setSelectedVoice(zh.name);
    }

    loadVoices();
    window.speechSynthesis.onvoiceschanged = loadVoices;

    return () => {
      window.speechSynthesis.onvoiceschanged = null;
      window.speechSynthesis.cancel();
    };
  }, []);

  function handleSpeak() {
    if (!text || speaking) return;

    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    if (selectedVoice) {
      utterance.voice = voices.find((v) => v.name === selectedVoice) ?? null;
    }
    utterance.rate = rate;
    utterance.pitch = pitch;

    utterance.onstart = () => setSpeaking(true);
    utterance.onend = () => setSpeaking(false);
    utterance.onerror = () => setSpeaking(false);

    window.speechSynthesis.speak(utterance);
  }

  function handleStop() {
    window.speechSynthesis.cancel();
    setSpeaking(false);
  }

  return (
    <div>
      {/* Text Input */}
      <div className="glass-card mb-6">
        <Label>输入文本</Label>
        <Textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="输入要朗读的文字..."
          rows={4}
        />
        <div className="mt-3 flex items-center justify-between">
          <span className="text-xs text-gray-300">{text.length} 字符</span>
          {speaking && (
            <span className="flex items-center gap-2 text-xs text-blue-500">
              <span className="wave-bars">
                <span />
                <span />
                <span />
                <span />
              </span>
              朗读中
            </span>
          )}
        </div>
      </div>

      {/* Voice Selection */}
      <div className="glass-card mb-6">
        <Label>语音</Label>
        <Select value={selectedVoice} onValueChange={(v) => v && setSelectedVoice(v)}>
          <SelectTrigger>
            <SelectValue placeholder="选择语音" />
          </SelectTrigger>
          <SelectContent>
            {voices.map((v) => (
              <SelectItem key={v.name} value={v.name}>
                {v.name} ({v.lang})
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Controls */}
      <div className="glass-card mb-6">
        <div className="grid grid-cols-2 gap-6">
          <div>
            <Label>语速</Label>
            <Slider
              min={0.5}
              max={2}
              step={0.1}
              value={[rate]}
              onValueChange={(v) => { const val = Array.isArray(v) ? v[0] : v; setRate(val as number) }}
            />
            <div className="mt-2 text-center font-mono text-xs text-gray-400">
              {rate.toFixed(1)}x
            </div>
          </div>
          <div>
            <Label>音调</Label>
            <Slider
              min={0.5}
              max={2}
              step={0.1}
              value={[pitch]}
              onValueChange={(v) => { const val = Array.isArray(v) ? v[0] : v; setPitch(val as number) }}
            />
            <div className="mt-2 text-center font-mono text-xs text-gray-400">
              {pitch.toFixed(1)}
            </div>
          </div>
        </div>
      </div>

      {/* Buttons */}
      <div className="flex gap-3">
        <Button
          variant="gradient"
          className="flex-1"
          onClick={handleSpeak}
          disabled={!text || speaking}
        >
          {speaking ? "朗读中..." : "开始朗读"}
        </Button>
        <Button
          variant="secondary"
          onClick={handleStop}
          disabled={!speaking}
        >
          停止
        </Button>
      </div>
    </div>
  );
}
