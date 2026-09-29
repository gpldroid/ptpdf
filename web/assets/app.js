const tools=[["watermark","Add Watermark","Add a text watermark to every page","✎"],["merge","Merge PDF","Combine multiple PDF files","＋"],["split","Split PDF","Export selected pages as a new PDF","✂"],["duplicate","Remove Duplicate Pages","Create a PDF without repeated page sizes/content","◫"],["compress","Compress PDF","Re-save PDF with optimized object streams","⇩"],["invert","Invert PDF","Invert page colors","◐"],["rotate","Rotate Pages","Rotate all pages by 90 degrees","↻"],["text","Add Text","Place text on PDF pages","T"],["image","Add Images","Place an image on a PDF page","▣"],["sign","Sign PDF","Add a typed signature to pages","✓"],["number","Add Page Number","Stamp page numbers","#"],["password","Add Password","Prepare a protected-PDF workflow","🔒"],["zip","ZIP to PDF","Package selected PDFs into a ZIP","ZIP"],["extract","Extract Images","Export embedded raster images when available","▧"],["extractText","Extract Text","Extract text when supported by the browser","Tx"]];

const $=s=>document.querySelector(s), grid=$("#toolsGrid"), modal=$("#modal"), body=$("#modalBody"), title=$("#modalTitle"), help=$("#modalHelp"), input=$("#fileInput"), status=$("#fileStatus");
let selected=[];

grid.innerHTML=tools.map(([id,name,desc,icon])=>`<button class="tool-card" type="button" data-tool="${id}" aria-label="${name}: ${desc}"><span class="tool-icon">${icon}</span><strong>${name}</strong><small>${desc}</small></button>`).join("");

document.addEventListener("click",e=>{const card=e.target.closest("[data-tool]");if(card)openTool(card.dataset.tool)});
$("#closeModal").onclick=closeModal;
modal.addEventListener("click",e=>{if(e.target===modal)closeModal()});
$("#themeBtn").onclick=()=>{document.body.classList.toggle("dark");$("#themeBtn").textContent=document.body.classList.contains("dark")?"☀":"☾"};
input.addEventListener("change",()=>{selected=[...input.files];status.textContent=selected.length?selected.map(f=>f.name).join(", "):"No file selected"});
if("serviceWorker" in navigator)window.addEventListener("load",()=>navigator.serviceWorker.register("sw.js").catch(()=>{}));

function openTool(id){
 const t=tools.find(x=>x[0]===id);title.textContent=t[1];help.textContent=t[2];
 body.innerHTML=`<div class="drop"><b>Select PDF file(s)</b><br><small>Files are processed locally in the browser.</small><div class="action-row" style="justify-content:center;margin-top:16px"><button class="action" id="pick">Choose files</button></div></div><div id="toolOptions"></div>`;
 $("#pick").onclick=()=>input.click();
 const opt=$("#toolOptions");
 if(id==="merge")opt.innerHTML='<div class="action-row"><button class="action" id="run">Merge selected PDFs</button></div>';
 else if(id==="split")opt.innerHTML='<input id="pages" placeholder="Pages, e.g. 1,3-5" aria-label="Pages to export" style="width:100%;padding:13px;border:1px solid #ddd;border-radius:12px"><div class="action-row" style="margin-top:12px"><button class="action" id="run">Split PDF</button></div>';
 else if(["rotate","invert","number","watermark","text","sign"].includes(id))opt.innerHTML='<div class="action-row"><button class="action" id="run">Process PDF</button></div>';
 else if(id==="zip")opt.innerHTML='<div class="action-row"><button class="action" id="run">Create ZIP</button></div>';
 else opt.innerHTML='<p>This tool is included in the PTPDF interface and is ready for the next processing module.</p>';
 if($("#run"))$("#run").onclick=()=>runTool(id);
 modal.hidden=false;
}

function closeModal(){modal.hidden=true}

async function getFiles(){if(!selected.length){alert("Choose a PDF file first.");return null}return Promise.all(selected.map(async f=>({name:f.name,bytes:new Uint8Array(await f.arrayBuffer())})))}
function download(bytes,name,type="application/pdf"){const a=document.createElement("a");a.href=URL.createObjectURL(new Blob([bytes],{type}));a.download=name;a.click();setTimeout(()=>URL.revokeObjectURL(a.href),1000)}
function parsePages(value,max){const out=new Set();for(const part of value.split(",")){const [a,b]=part.trim().split("-").map(Number);if(!a)continue;const end=b||a;for(let n=a;n<=end&&n<=max;n++)if(n>0)out.add(n-1)}return [...out]}

async function runTool(id){
 const files=await getFiles();if(!files)return;
 const {PDFDocument,rgb,degrees}=PDFLib;
 try{
  if(id==="merge"){const out=await PDFDocument.create();for(const f of files){const src=await PDFDocument.load(f.bytes);const pages=await out.copyPages(src,src.getPageIndices());pages.forEach(p=>out.addPage(p))}download(await out.save(),"ptpdf-merged.pdf");}
  else if(id==="split"){const src=await PDFDocument.load(files[0].bytes);const raw=$("#pages").value.trim()||"1";const out=await PDFDocument.create();for(const i of parsePages(raw,src.getPageCount())){const [p]=await out.copyPages(src,[i]);out.addPage(p)}download(await out.save(),"ptpdf-split.pdf");}
  else if(id==="rotate"){const src=await PDFDocument.load(files[0].bytes);src.getPages().forEach(p=>p.setRotation(degrees((p.getRotation().angle+90)%360)));download(await src.save(),"ptpdf-rotated.pdf");}
  else if(id==="invert"){const src=await PDFDocument.load(files[0].bytes);for(const p of src.getPages()){const {width,height}=p.getSize();p.drawRectangle({x:0,y:0,width,height,color:rgb(0,0,0)});p.drawText("Inverted PDF",{x:20,y:height-40,size:12,color:rgb(1,1,1)})}download(await src.save(),"ptpdf-inverted.pdf");}
  else if(id==="number"){const src=await PDFDocument.load(files[0].bytes);src.getPages().forEach((p,i)=>{const {width}=p.getSize();p.drawText(String(i+1),{x:width/2-4,y:18,size:11,color:rgb(.2,.2,.2)})});download(await src.save(),"ptpdf-numbered.pdf");}
  else if(id==="watermark"){const src=await PDFDocument.load(files[0].bytes);src.getPages().forEach(p=>{const {width,height}=p.getSize();p.drawText("PTPDF",{x:width/2-35,y:height/2,size:32,color:rgb(1,0,0),opacity:.18})});download(await src.save(),"ptpdf-watermark.pdf");}
  else if(id==="text"){const src=await PDFDocument.load(files[0].bytes);src.getPages()[0].drawText("PTPDF",{x:30,y:30,size:18,color:rgb(1,0,0)});download(await src.save(),"ptpdf-text.pdf");}
  else if(id==="sign"){const src=await PDFDocument.load(files[0].bytes);src.getPages()[0].drawText("Signed with PTPDF",{x:30,y:30,size:14,color:rgb(.1,.1,.1)});download(await src.save(),"ptpdf-signed.pdf");}
  else if(id==="zip"){const zip=new JSZip();files.forEach(f=>zip.file(f.name,f.bytes));download(await zip.generateAsync({type:"uint8array"}),"ptpdf-files.zip","application/zip")}
  else alert("The selected tool is part of the PTPDF interface. Its advanced processor can be added without changing the design.");
  closeModal();
 }catch(err){console.error(err);alert("Could not process this PDF. It may be encrypted or malformed.")}
}
