"use client";

import { useState, useEffect } from "react";

export default function TTSPage() {
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
    <div className="mx-auto max-w-xl px-6 py-12">
      {/* Header */}
      <div className="page-header">
        <a href="/" className="back-link">
          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
          </svg>
          返回首页
        </a>
        <h1 className="page-title">文本转语音</h1>
        <p className="page-desc">将文字转换为语音，支持多语言和参数调节</p>
      </div>

      {/* Text Input */}
      <div className="glass-card mb-6">
        <span className="field-label">输入文本</span>
        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="输入要朗读的文字..."
          rows={4}
          className="input"
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
        <span className="field-label">语音</span>
        <select
          value={selectedVoice}
          onChange={(e) => setSelectedVoice(e.target.value)}
          className="select-field"
        >
          {voices.map((v) => (
            <option key={v.name} value={v.name}>
              {v.name} ({v.lang})
            </option>
          ))}
        </select>
      </div>

      {/* Controls */}
      <div className="glass-card mb-6">
        <div className="grid grid-cols-2 gap-6">
          <div>
            <span className="field-label">语速</span>
            <input
              type="range"
              min="0.5"
              max="2"
              step="0.1"
              value={rate}
              onChange={(e) => setRate(Number(e.target.value))}
            />
            <div className="mt-2 text-center font-mono text-xs text-gray-400">
              {rate.toFixed(1)}x
            </div>
          </div>
          <div>
            <span className="field-label">音调</span>
            <input
              type="range"
              min="0.5"
              max="2"
              step="0.1"
              value={pitch}
              onChange={(e) => setPitch(Number(e.target.value))}
            />
            <div className="mt-2 text-center font-mono text-xs text-gray-400">
              {pitch.toFixed(1)}
            </div>
          </div>
        </div>
      </div>

      {/* Buttons */}
      <div className="flex gap-3">
        <button
          onClick={handleSpeak}
          disabled={!text || speaking}
          className="btn btn-primary flex-1"
        >
          {speaking ? "朗读中..." : "开始朗读"}
        </button>
        <button
          onClick={handleStop}
          disabled={!speaking}
          className="btn btn-secondary"
        >
          停止
        </button>
      </div>
    </div>
  );
}
