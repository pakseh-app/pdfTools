// ================================
// pdfTools PDF Reader Engine
// v1.2.0
// ================================



let pdfDoc = null;

let currentPage = 1;

let totalPages = 0;

let zoom = 1.0;

const fileInput = document.getElementById("pdfFile");

document.addEventListener("click",(e)=>{

const btn=e.target.closest("#btnOpen");

if(btn){

fileInput.click();

}

});

fileInput.addEventListener("change",async function(){

const file=this.files[0];

if(!file)return;

const bytes=await file.arrayBuffer();

pdfDoc=await pdfjsLib.getDocument({

data:bytes

}).promise;

totalPages=pdfDoc.numPages;

currentPage=1;

document.getElementById("pageCount").innerText=totalPages;

document.getElementById("pageNum").innerText=currentPage;

document.getElementById("emptyState").style.display="none";

console.log("PDF Loaded");

console.log(pdfDoc);

});
