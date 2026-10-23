import { PDFDocument, EncryptedPDFError } from 'pdf-lib';
export function validatePdfFiles(files: {name:string;size:number}[]) {
 if(!files.length||files.length>20||files.reduce((sum,f)=>sum+f.size,0)>50*1024*1024)throw new Error('最多 20 个 PDF，总大小不超过 50 MB。');
 if(files.some(file=>!file.name.toLowerCase().endsWith('.pdf')))throw new Error('请选择 PDF 文件。');
}
async function loadPdf(bytes:Uint8Array){
 if(!bytes.length||bytes.length>50*1024*1024)throw new Error('最多 20 个 PDF，总大小不超过 50 MB。');
 let document:PDFDocument;
 try {document=await PDFDocument.load(bytes,{throwOnInvalidObject:true,updateMetadata:false});}
 // pdf-lib ES5 builds do not preserve Error subclass prototypes.
 catch(error){if(error instanceof EncryptedPDFError || (error instanceof Error && error.message===new EncryptedPDFError().message))throw new Error('不支持加密 PDF，请先解除密码保护。');throw new Error('PDF 无法读取，文件可能已损坏。');}
 try {if(document.getForm().getFields().length)throw new Error('不支持交互表单 PDF，请先导出为普通 PDF。');}
 catch(error){if((error as Error).message==='不支持交互表单 PDF，请先导出为普通 PDF。')throw error;throw new Error('PDF 无法读取，文件可能已损坏。');}
 const count=document.getPageCount();
 if(count<1||count>500)throw new Error('PDF 页数必须在 1–500 页之间，合计不超过 500 页。');
 return document;
}
export async function inspectPdf(bytes:Uint8Array){return (await loadPdf(bytes)).getPageCount();}
export async function mergePdfs(inputs:Uint8Array[]){
 if(inputs.length<2||inputs.length>20)throw new Error('请选择 2–20 个 PDF 进行合并。');
 if(inputs.reduce((sum,bytes)=>sum+bytes.length,0)>50*1024*1024)throw new Error('最多 20 个 PDF，总大小不超过 50 MB。');
 const output=await PDFDocument.create();let count=0;
 for(const bytes of inputs){const source=await loadPdf(bytes);count+=source.getPageCount();if(count>500)throw new Error('PDF 页数必须在 1–500 页之间，合计不超过 500 页。');const pages=await output.copyPages(source,source.getPageIndices());for(const page of pages)output.addPage(page);}
 return {bytes:await output.save(),pageCount:count};
}
