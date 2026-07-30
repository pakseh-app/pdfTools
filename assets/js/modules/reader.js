// ======================================
// pdfTools Reader
// Legacy PDF.js
// ======================================

pdfjsLib.GlobalWorkerOptions.workerSrc =
"libs/pdfjs/pdf.worker.min.js";

let pdfDoc=null;

let currentPage=1;

let totalPages=0;

function initReader(){

const btn=document.getElementById("btnOpen");

const input=document.getElementById("pdfFile");

if(!btn || !input)return;

btn.onclick=()=>{

input.click();

};

input.onchange=openPdf;

}

async function openPdf(e){

const file=e.target.files[0];

if(!file)return;

try{

const bytes=await file.arrayBuffer();

pdfDoc=await pdfjsLib.getDocument({

data:bytes

}).promise;

totalPages=pdfDoc.numPages;

currentPage=1;

document.getElementById("pageNum").textContent=currentPage;

document.getElementById("pageCount").textContent=totalPages;

document.getElementById("emptyState").style.display="none";

console.log("PDF Loaded");

}catch(err){

console.error(err);

alert("Gagal membuka PDF");

}

}

window.initReader=initReader;
