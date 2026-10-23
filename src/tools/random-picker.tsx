"use client";
import { useState } from "react";
import { useI18n } from "@/components/LanguageProvider";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { drawIndices, drawNumbers, parseNames } from "@/lib/random-picker";
import { downloadText } from "@/lib/download-text";
export function RandomPicker() {
 const {t}=useI18n(); const [mode,setMode]=useState('names'); const [names,setNames]=useState(''); const [min,setMin]=useState('1'); const [max,setMax]=useState('100'); const [count,setCount]=useState('1'); const [repeat,setRepeat]=useState(false); const [result,setResult]=useState<string[]|null>(null); const [message,setMessage]=useState('');
 function reset(){setResult(null);setMessage('');}
 function draw(){reset();try {if(!count.trim() || (mode==='numbers' && (!min.trim() || !max.trim()))) throw new Error('请填写全部数字字段。');if(mode==='names'){const entries=parseNames(names);setResult(drawIndices(entries.length,Number(count),repeat).map(i=>entries[i]));}else setResult(drawNumbers(Number(min),Number(max),Number(count),repeat).map(String));}catch(e){setMessage((e as Error).message);}}
 return <div className="space-y-4"><label>{t('抽取模式')} <select value={mode} onChange={e=>{setMode(e.target.value);reset();}}><option value="names">{t('名单抽签')}</option><option value="numbers">{t('整数范围')}</option></select></label>
 {mode==='names'?<div><label htmlFor="draw-names">{t('候选名单（每行一项）')}</label><Textarea id="draw-names" value={names} maxLength={1000000} className="min-h-48" onChange={e=>{setNames(e.target.value);reset();}}/><Button variant="ghost" onClick={()=>{setNames('Alice\nBob\nCharlie\nDiana');reset();}}>{t('填入示例')}</Button></div>:<div className="grid gap-4 sm:grid-cols-2"><label>{t('最小值')}<Input type="number" value={min} onChange={e=>{setMin(e.target.value);reset();}}/></label><label>{t('最大值')}<Input type="number" value={max} onChange={e=>{setMax(e.target.value);reset();}}/></label></div>}
 <div className="flex flex-wrap items-center gap-4"><label>{t('抽取数量')}<Input type="number" min={1} max={10000} value={count} onChange={e=>{setCount(e.target.value);reset();}}/></label><label><input type="checkbox" checked={repeat} onChange={e=>{setRepeat(e.target.checked);reset();}}/> {t('允许重复')}</label><Button onClick={draw}>{t('开始抽取')}</Button></div>
 <p className="text-sm text-gray-500">{t('名单自动去除空行、首尾空格和完全相同的项。允许重复仅作用于本轮抽取；每轮重新开始。使用浏览器安全随机数，最多抽取 10000 项。')}</p>{message&&<p role="status">{t(message)}</p>}
 {result&&<section className="space-y-3"><label htmlFor="draw-result">{t('抽取结果')}</label><Textarea id="draw-result" readOnly value={result.join('\n')} className="min-h-40"/><div className="flex gap-2"><Button onClick={async()=>{try{await navigator.clipboard.writeText(result.join('\n'));setMessage('已复制');}catch{setMessage('复制失败，可以下载结果文件。');}}}>{t('复制结果')}</Button><Button onClick={()=>downloadText(result.join('\n'),'draw.txt')}>{t('下载结果')}</Button></div></section>}</div>;
}
