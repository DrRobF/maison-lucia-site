const fs=require("node:fs/promises");
const path=require("node:path");
const convert=require("heic-convert");
const jpeg=require("jpeg-js");
const dir=path.join(__dirname,"..","public");
const sources=[
 ["Blueandwhiteoutdoor.HEIC","coastal-blue-outdoor-web.jpg"],
 ["Bluesndwood.heic","coastal-blue-wood-web.jpg"],
 ["Lightblueredandwhite.HEIC","coastal-red-white-overhead-web.jpg"]
];
async function main(){
 for(const [input,output] of sources){
   const raw=await fs.readFile(path.join(dir,input));
   const result=Buffer.from(await convert({buffer:raw,format:"JPEG",quality:.87}));
   const decoded=jpeg.decode(result);
   if(result.length<10000||decoded.width<200||decoded.height<200)throw Error("Invalid converted photo: "+input);
   let min=255,max=0;for(let i=0;i<decoded.data.length;i+=4){const value=decoded.data[i];min=Math.min(min,value);max=Math.max(max,value);}
   if(max-min<20)throw Error("Blank converted photo: "+input);
   await fs.writeFile(path.join(dir,output),result);
   console.log("Verified portfolio photo:",output,decoded.width+"x"+decoded.height,result.length+" bytes");
 }
}
main().catch(error=>{console.error(error);process.exitCode=1});
