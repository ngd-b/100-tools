import { PDFDocument } from 'pdf-lib';
export type PdfLayoutOptions = {pageSize:'a4'|'auto';landscape:boolean;margin:number};
export function imagePageLayout(width:number,height:number,options:PdfLayoutOptions){
 if(!Number.isFinite(width)||!Number.isFinite(height)||width<=0||height<=0||width>16384||height>16384||!['a4','auto'].includes(options.pageSize)||!Number.isFinite(options.margin)||options.margin<0||options.margin>50)throw new Error('请检查页面尺寸和页边距（0–50 毫米）。');
 const margin=options.margin*72/25.4;
 const [pageWidth,pageHeight]=options.pageSize==='auto'?[width*0.75+margin*2,height*0.75+margin*2]:options.landscape?[841.89,595.28]:[595.28,841.89];
 const scale=Math.min((pageWidth-margin*2)/width,(pageHeight-margin*2)/height);
 return {pageWidth,pageHeight,width:width*scale,height:height*scale,x:(pageWidth-width*scale)/2,y:(pageHeight-height*scale)/2};
}
export async function imagesToPdf(images:AsyncIterable<Uint8Array>|Iterable<Uint8Array>,options:PdfLayoutOptions){
 const document=await PDFDocument.create();let pixels=0,count=0;
 for await(const bytes of images){
  if(++count>20)throw new Error('请选择 1–20 张图片，总大小不超过 30 MB。');
  const image=await document.embedPng(bytes);pixels+=image.width*image.height;
  if(pixels>60000000)throw new Error('图片总像素超过 6000 万，请减少图片或缩小尺寸。');
  const layout=imagePageLayout(image.width,image.height,options);const page=document.addPage([layout.pageWidth,layout.pageHeight]);page.drawImage(image,{x:layout.x,y:layout.y,width:layout.width,height:layout.height});
 }
 if(!count)throw new Error('请选择 1–20 张图片，总大小不超过 30 MB。');
 return document.save();
}
