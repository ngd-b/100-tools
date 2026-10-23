export function validateImageFiles(files: File[]) {
 if(!files.length||files.length>20||files.reduce((s,f)=>s+f.size,0)>30*1024*1024)throw new Error('请选择 1–20 张图片，总大小不超过 30 MB。');
 if(files.some(f=>!['image/png','image/jpeg','image/webp'].includes(f.type)))throw new Error('仅支持 PNG、JPEG 和 WebP 图片。');
}
export async function readBitmap(file: File) {
 let image: ImageBitmap;
 try {image=await createImageBitmap(file,{imageOrientation:'from-image'});}catch{throw new Error('图片无法读取，请检查文件是否损坏。');}
 if(image.width*image.height>24000000||image.width>16384||image.height>16384){image.close();throw new Error('单张图片过大，请先缩小到 2400 万像素以内。');}
 return image;
}
export function canvasBlob(canvas: HTMLCanvasElement,type='image/png'):Promise<Blob> {
 return new Promise((resolve,reject)=>canvas.toBlob(blob=>blob?resolve(blob):reject(new Error('图片导出失败，请减小尺寸后重试。')),type,0.92));
}
export function downloadBlob(blob: Blob,filename: string) {
 const url=URL.createObjectURL(blob);const link=document.createElement('a');link.href=url;link.download=filename;document.body.appendChild(link);link.click();link.remove();setTimeout(()=>URL.revokeObjectURL(url),1000);
}
