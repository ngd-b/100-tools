"use client";
import { useI18n } from '@/components/LanguageProvider';
import { Button } from '@/components/ui/button';
export function LocalFileQueue({files,onChange,accept,onAdd}:{files:File[];onChange:(files:File[])=>void;accept:string;onAdd:(files:File[])=>void}) {
 const {t}=useI18n();
 function move(i:number,delta:number){const next=[...files];[next[i],next[i+delta]]=[next[i+delta],next[i]];onChange(next);}
 return <div className="space-y-3"><label className="block">{t('添加本地文件')}<input className="block max-w-full text-sm" type="file" accept={accept} multiple onChange={e=>{onAdd(Array.from(e.target.files??[]));e.target.value='';}}/></label><ol className="space-y-2">{files.map((file,i)=><li key={`${file.name}-${i}`} className="flex flex-wrap items-center gap-2 rounded border p-2"><span className="min-w-0 flex-1 break-all text-sm">{i+1}. {file.name}</span><Button size="sm" variant="outline" disabled={i===0} aria-label={t('上移第 {0} 项',[i+1])} onClick={()=>move(i,-1)}>{t('上移')}</Button><Button size="sm" variant="outline" disabled={i===files.length-1} aria-label={t('下移第 {0} 项',[i+1])} onClick={()=>move(i,1)}>{t('下移')}</Button><Button size="sm" variant="ghost" aria-label={t('删除第 {0} 项',[i+1])} onClick={()=>onChange(files.filter((_,j)=>i!==j))}>{t('删除')}</Button></li>)}</ol></div>;
}
