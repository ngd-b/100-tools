export type ImageSize = { width: number; height: number };
export type Placement = ImageSize & { x: number; y: number };
export function collageLayout(images: ImageSize[], mode: string, size: number, gap: number, columns: number) {
 if (!images.length || images.length>20 || !['horizontal','vertical','grid'].includes(mode) || !Number.isInteger(size) || size<32 || size>4096 || !Number.isInteger(gap) || gap<0 || gap>200 || !Number.isInteger(columns) || columns<1 || columns>10 || images.some(i=>!Number.isFinite(i.width)||!Number.isFinite(i.height)||i.width<=0||i.height<=0)) throw new Error('请检查图片数量和排版参数。');
 const items: Placement[]=[]; let width=0,height=0;
 if(mode==='grid') { const cols=Math.min(columns,images.length);width=cols*size+(cols-1)*gap;height=Math.ceil(images.length/cols)*size+(Math.ceil(images.length/cols)-1)*gap;images.forEach((im,i)=>{const scale=size/Math.max(im.width,im.height);const w=im.width*scale,h=im.height*scale;items.push({x:(i%cols)*(size+gap)+(size-w)/2,y:Math.floor(i/cols)*(size+gap)+(size-h)/2,width:w,height:h});}); }
 else { images.forEach(im=>{const scale=size/(mode==='horizontal'?im.height:im.width);const w=im.width*scale,h=im.height*scale;items.push({x:width,y:height,width:w,height:h});if(mode==='horizontal')width+=w+gap;else height+=h+gap;});if(mode==='horizontal'){width-=gap;height=size;}else{height-=gap;width=size;} }
 width=Math.ceil(width);height=Math.ceil(height);
 if(width>8192||height>8192||width*height>24000000)throw new Error('输出图片过大，请减小尺寸、间距或图片数量。');
 return {width,height,items};
}
