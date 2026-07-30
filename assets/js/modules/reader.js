// ======================================
// pdfTools Reader v2
// PART 1 - Multi Page Viewer
// ======================================

pdfjsLib.GlobalWorkerOptions.workerSrc = "libs/pdfjs/pdf.worker.min.js";

let pdfDoc = null;

let currentPage = 1;
let totalPages = 0;
let zoom = 1.25;

const $ = (id) => document.getElementById(id);

// =============================
// INIT
// =============================

function initReader(){

    $("btnOpen").onclick = () => $("pdfFile").click();

    $("pdfFile").onchange = openPdf;

    $("btnPrev").onclick = prevPage;

    $("btnNext").onclick = nextPage;

    $("btnZoomIn").onclick = zoomIn;

    $("btnZoomOut").onclick = zoomOut;

    updatePageInfo();

    updateZoomText();

}

// =============================
// OPEN PDF
// =============================

async function openPdf(e){

    const file = e.target.files[0];

    if(!file) return;

    try{

        const bytes = await file.arrayBuffer();

        pdfDoc = await pdfjsLib.getDocument({
            data: bytes
        }).promise;

        totalPages = pdfDoc.numPages;
        currentPage = 1;

        $("emptyState").style.display = "none";

        await renderAllPages();

    }catch(err){

        console.error(err);

        alert("Gagal membuka PDF");

    }

}

// =============================
// RENDER
// =============================

async function renderAllPages(){

    if(!pdfDoc) return;

    const container = $("pdfContainer");

    container.innerHTML = "";

    for(let pageNumber=1; pageNumber<=totalPages; pageNumber++){

        const page = await pdfDoc.getPage(pageNumber);

        const viewport = page.getViewport({
            scale: zoom
        });

        const wrapper = document.createElement("div");

        wrapper.className = "pdf-page";

        wrapper.id = "page-"+pageNumber;

        wrapper.dataset.page = pageNumber;

        const canvas = document.createElement("canvas");

        canvas.width = viewport.width;

        canvas.height = viewport.height;

        wrapper.appendChild(canvas);

        container.appendChild(wrapper);

        await page.render({

            canvasContext: canvas.getContext("2d"),

            viewport

        }).promise;

    }

    updatePageInfo();

    updateZoomText();

}

// =============================
// NAVIGATION
// =============================

function scrollToPage(page){

    const target = $("page-"+page);

    if(!target) return;

    currentPage = page;

    updatePageInfo();

    target.scrollIntoView({

        behavior:"smooth",

        block:"start"

    });

}

function nextPage(){

    if(currentPage>=totalPages) return;

    scrollToPage(currentPage+1);

}

function prevPage(){

    if(currentPage<=1) return;

    scrollToPage(currentPage-1);

}

// =============================
// ZOOM
// =============================

function zoomIn(){

    if(!pdfDoc) return;

    zoom += 0.25;

    renderAllPages();

}

function zoomOut(){

    if(!pdfDoc) return;

    if(zoom<=0.5) return;

    zoom -= 0.25;

    renderAllPages();

}

// =============================
// UI
// =============================

function updatePageInfo(){

    $("pageNum").textContent = currentPage;

    $("pageCount").textContent = totalPages;

}

function updateZoomText(){

    $("zoomValue").textContent = Math.round(zoom*100)+"%";

}

// =============================

window.initReader = initReader;

// ======================================
// PART 2/10
// Thumbnail Engine
// ======================================

let observer = null;

async function renderAllPages(){

    if(!pdfDoc) return;

    const container = $("pdfContainer");
    const thumbs = $("thumbnailList");

    container.innerHTML = "";
    thumbs.innerHTML = "";

    for(let i=1;i<=totalPages;i++){

        const page = await pdfDoc.getPage(i);

        // ==========================
        // PAGE
        // ==========================

        const viewport = page.getViewport({
            scale:zoom
        });

        const wrapper = document.createElement("div");

        wrapper.className = "pdf-page";

        wrapper.id = "page-"+i;

        wrapper.dataset.page = i;

        const canvas = document.createElement("canvas");

        canvas.width = viewport.width;

        canvas.height = viewport.height;

        wrapper.appendChild(canvas);

        container.appendChild(wrapper);

        await page.render({

            canvasContext:canvas.getContext("2d"),

            viewport

        }).promise;

        // ==========================
        // THUMBNAIL
        // ==========================

        const thumbViewport = page.getViewport({

            scale:0.25

        });

        const thumb = document.createElement("div");

        thumb.className="thumb-item";

        thumb.dataset.page=i;

        const thumbCanvas=document.createElement("canvas");

        thumbCanvas.width=thumbViewport.width;

        thumbCanvas.height=thumbViewport.height;

        await page.render({

            canvasContext:thumbCanvas.getContext("2d"),

            viewport:thumbViewport

        }).promise;

        const label=document.createElement("div");

        label.className="thumb-number";

        label.textContent="Hal. "+i;

        thumb.appendChild(thumbCanvas);

        thumb.appendChild(label);

        thumb.onclick=()=>{

            scrollToPage(i);

        };

        thumbs.appendChild(thumb);

    }

    observePages();

    activateThumb(currentPage);

    updatePageInfo();

    updateZoomText();

}

// ======================================
// PART 3/10
// Active Page Observer
// ======================================

function activateThumb(page){

    document
        .querySelectorAll(".thumb-item")
        .forEach(item=>{

            item.classList.remove("active");

        });

    const active=document.querySelector(

        `.thumb-item[data-page="${page}"]`

    );

    if(active){

        active.classList.add("active");

        active.scrollIntoView({

            block:"nearest",

            behavior:"smooth"

        });

    }

}

function observePages(){

    if(observer){

        observer.disconnect();

    }

    observer=new IntersectionObserver(entries=>{

        entries.forEach(entry=>{

            if(entry.isIntersecting){

                currentPage=Number(

                    entry.target.dataset.page

                );

                updatePageInfo();

                activateThumb(currentPage);

            }

        });

    },{

        root:$("pdfContainer").parentElement,

        threshold:0.55

    });

    document

        .querySelectorAll(".pdf-page")

        .forEach(page=>{

            observer.observe(page);

        });

}

function scrollToPage(page){

    const target=$("page-"+page);

    if(!target) return;

    currentPage=page;

    updatePageInfo();

    activateThumb(page);

    target.scrollIntoView({

        behavior:"smooth",

        block:"start"

    });

}

function nextPage(){

    if(currentPage>=totalPages) return;

    scrollToPage(currentPage+1);

}

function prevPage(){

    if(currentPage<=1) return;

    scrollToPage(currentPage-1);

}

// ======================================
// PART 4/10
// Zoom Engine
// ======================================

function zoomIn(){

    if(!pdfDoc) return;

    zoom += 0.25;

    if(zoom>4){

        zoom=4;

    }

    updateZoomText();

    rerenderVisible();

}

function zoomOut(){

    if(!pdfDoc) return;

    zoom -= 0.25;

    if(zoom<0.50){

        zoom=0.50;

    }

    updateZoomText();

    rerenderVisible();

}

async function rerenderVisible(){

    if(!pdfDoc) return;

    const pages=document.querySelectorAll(".pdf-page");

    for(const wrapper of pages){

        const pageNumber=Number(

            wrapper.dataset.page

        );

        const page=await pdfDoc.getPage(pageNumber);

        const viewport=page.getViewport({

            scale:zoom

        });

        const canvas=wrapper.querySelector("canvas");

        canvas.width=viewport.width;

        canvas.height=viewport.height;

        await page.render({

            canvasContext:canvas.getContext("2d"),

            viewport

        }).promise;

    }

}

function updateZoomText(){

    $("zoomValue").textContent=

        Math.round(zoom*100)+"%";

}
// ======================================
// PART 5/10
// Fit Width + Responsive Canvas
// ======================================

window.addEventListener("resize",()=>{

    fitWidth();

});

function fitWidth(){

    if(!pdfDoc) return;

    const view=document.querySelector(".pdf-view");

    if(!view) return;

    const available=view.clientWidth-80;

    const first=document.querySelector(".pdf-page canvas");

    if(!first) return;

    const ratio=available/first.width;

    if(ratio>0){

        document

        .querySelectorAll(".pdf-page canvas")

        .forEach(canvas=>{

            canvas.style.width=(canvas.width*ratio)+"px";

            canvas.style.height="auto";

        });

    }

}

async function renderPage(pageNumber,canvas){

    const page=await pdfDoc.getPage(pageNumber);

    const viewport=page.getViewport({

        scale:zoom

    });

    canvas.width=viewport.width;

    canvas.height=viewport.height;

    await page.render({

        canvasContext:canvas.getContext("2d"),

        viewport

    }).promise;

}

async function refreshAllPages(){

    if(!pdfDoc) return;

    const pages=document.querySelectorAll(".pdf-page");

    for(const wrapper of pages){

        const pageNumber=Number(

            wrapper.dataset.page

        );

        const canvas=wrapper.querySelector("canvas");

        await renderPage(pageNumber,canvas);

    }

    fitWidth();

}

async function rerenderVisible(){

    await refreshAllPages();

}

setTimeout(()=>{

    fitWidth();

},300);

// ======================================
// PART 6/10
// Ctrl + Mouse Wheel Zoom
// Smooth Zoom
// ======================================

function initZoomShortcut(){

    const viewer=document.querySelector(".pdf-view");

    if(!viewer) return;

    viewer.addEventListener("wheel",onWheelZoom,{
        passive:false
    });

}

function onWheelZoom(e){

    if(!e.ctrlKey) return;

    e.preventDefault();

    const oldZoom=zoom;

    if(e.deltaY<0){

        zoom+=0.10;

        if(zoom>4){

            zoom=4;

        }

    }else{

        zoom-=0.10;

        if(zoom<0.50){

            zoom=0.50;

        }

    }

    if(oldZoom===zoom) return;

    updateZoomText();

    refreshAllPages();

}

function resetZoom(){

    zoom=1.25;

    updateZoomText();

    refreshAllPages();

}

function fitPage(){

    zoom=1.00;

    updateZoomText();

    refreshAllPages();

}

function fitWidthMode(){

    fitWidth();

}

document.addEventListener("keydown",(e)=>{

    if(!pdfDoc) return;

    // Ctrl + +
    if(e.ctrlKey && (e.key==="+" || e.key==="=")){

        e.preventDefault();

        zoomIn();

    }

    // Ctrl + -
    if(e.ctrlKey && e.key==="-"){

        e.preventDefault();

        zoomOut();

    }

    // Ctrl + 0
    if(e.ctrlKey && e.key==="0"){

        e.preventDefault();

        resetZoom();

    }

});

const __oldInitReader=initReader;

initReader=function(){

    __oldInitReader();

    initZoomShortcut();

};

// ======================================
// PART 7/10
// Lazy Render + Performance Optimizer
// ======================================

let renderedPages = new Set();

async function renderSinglePage(pageNumber){

    if(!pdfDoc) return;

    const wrapper = $("page-"+pageNumber);

    if(!wrapper) return;

    const canvas = wrapper.querySelector("canvas");

    if(!canvas) return;

    const page = await pdfDoc.getPage(pageNumber);

    const viewport = page.getViewport({
        scale: zoom
    });

    canvas.width = viewport.width;
    canvas.height = viewport.height;

    await page.render({

        canvasContext: canvas.getContext("2d"),

        viewport

    }).promise;

    renderedPages.add(pageNumber);

}

async function lazyRender(pageNumber){

    if(renderedPages.has(pageNumber)) return;

    await renderSinglePage(pageNumber);

}

async function preloadAround(pageNumber){

    const pages = [

        pageNumber-2,

        pageNumber-1,

        pageNumber,

        pageNumber+1,

        pageNumber+2

    ];

    for(const p of pages){

        if(p>=1 && p<=totalPages){

            await lazyRender(p);

        }

    }

}

function clearRenderedCache(){

    renderedPages.clear();

}

async function rerenderVisible(){

    clearRenderedCache();

    await preloadAround(currentPage);

    fitWidth();

}

async function refreshCurrentPage(){

    clearRenderedCache();

    await lazyRender(currentPage);

    fitWidth();

}

async function refreshAroundCurrent(){

    clearRenderedCache();

    await preloadAround(currentPage);

    fitWidth();

}

// ===============================
// Update observer
// ===============================

const __oldObservePages = observePages;

observePages = function(){

    __oldObservePages();

    document

        .querySelectorAll(".pdf-page")

        .forEach(page=>{

            page.addEventListener("mouseenter",()=>{

                const n = Number(page.dataset.page);

                preloadAround(n);

            });

        });

};

// ======================================
// PART 8/10
// Keyboard Shortcut + Drag / Pan PDF
// ======================================

let isDragging = false;

let startX = 0;
let startY = 0;

let scrollLeft = 0;
let scrollTop = 0;

function initPan(){

    const viewer = document.querySelector(".pdf-view");

    if(!viewer) return;

    viewer.addEventListener("mousedown",startPan);

    viewer.addEventListener("mousemove",movePan);

    viewer.addEventListener("mouseup",stopPan);

    viewer.addEventListener("mouseleave",stopPan);

}

function startPan(e){

    if(zoom<=1) return;

    const viewer=document.querySelector(".pdf-view");

    isDragging=true;

    viewer.style.cursor="grabbing";

    startX=e.pageX;

    startY=e.pageY;

    scrollLeft=viewer.scrollLeft;

    scrollTop=viewer.scrollTop;

}

function movePan(e){

    if(!isDragging) return;

    e.preventDefault();

    const viewer=document.querySelector(".pdf-view");

    const dx=e.pageX-startX;

    const dy=e.pageY-startY;

    viewer.scrollLeft=scrollLeft-dx;

    viewer.scrollTop=scrollTop-dy;

}

function stopPan(){

    if(!isDragging) return;

    isDragging=false;

    const viewer=document.querySelector(".pdf-view");

    viewer.style.cursor="default";

}

// ======================================
// Keyboard Shortcut
// ======================================

function initKeyboard(){

    document.addEventListener("keydown",(e)=>{

        if(!pdfDoc) return;

        switch(e.key){

            case "ArrowRight":

            case "PageDown":

                e.preventDefault();

                nextPage();

                break;

            case "ArrowLeft":

            case "PageUp":

                e.preventDefault();

                prevPage();

                break;

            case "Home":

                e.preventDefault();

                scrollToPage(1);

                break;

            case "End":

                e.preventDefault();

                scrollToPage(totalPages);

                break;

        }

    });

}

// ======================================
// Fullscreen
// ======================================

function toggleFullscreen(){

    const el=document.querySelector(".pdf-view");

    if(!document.fullscreenElement){

        el.requestFullscreen?.();

    }else{

        document.exitFullscreen?.();

    }

}

// ======================================
// Extend initReader
// ======================================

const __initReaderPart8 = initReader;

initReader = function(){

    __initReaderPart8();

    initPan();

    initKeyboard();

};

// ======================================
// PART 9/10
// Search Text + Rotate + Print
// ======================================

let currentRotation = 0;

async function rotateCurrentPage(){

    if(!pdfDoc) return;

    currentRotation += 90;

    if(currentRotation >= 360){

        currentRotation = 0;

    }

    const wrapper = $("page-"+currentPage);

    if(!wrapper) return;

    const canvas = wrapper.querySelector("canvas");

    canvas.style.transform = `rotate(${currentRotation}deg)`;

    canvas.style.transformOrigin = "center center";

}

async function searchText(keyword){

    if(!pdfDoc) return;

    keyword = keyword.trim().toLowerCase();

    if(keyword==="") return;

    for(let i=1;i<=totalPages;i++){

        const page = await pdfDoc.getPage(i);

        const text = await page.getTextContent();

        const content = text.items

            .map(item=>item.str)

            .join(" ")

            .toLowerCase();

        if(content.includes(keyword)){

            scrollToPage(i);

            return i;

        }

    }

    alert("Teks tidak ditemukan");

    return -1;

}

function showSearchBox(){

    const keyword = prompt("Cari teks pada PDF");

    if(keyword){

        searchText(keyword);

    }

}

function printPdf(){

    if(!pdfDoc){

        alert("Buka PDF terlebih dahulu");

        return;

    }

    window.print();

}

// ======================================
// Keyboard Shortcut
// ======================================

const __oldKeyboard = initKeyboard;

initKeyboard = function(){

    __oldKeyboard();

    document.addEventListener("keydown",(e)=>{

        if(!pdfDoc) return;

        // Ctrl + F
        if(e.ctrlKey && e.key.toLowerCase()==="f"){

            e.preventDefault();

            showSearchBox();

        }

        // Ctrl + P
        if(e.ctrlKey && e.key.toLowerCase()==="p"){

            e.preventDefault();

            printPdf();

        }

        // R = Rotate
        if(!e.ctrlKey && e.key.toLowerCase()==="r"){

            rotateCurrentPage();

        }

    });

};

// ======================================
// Optional Toolbar Button
// ======================================

// Jika nanti ditambah tombol:
//
// <button id="btnSearch">Cari</button>
// <button id="btnRotate">Rotate</button>
// <button id="btnPrint">Print</button>
//
// cukup panggil:
//
// $("btnSearch").onclick = showSearchBox;
// $("btnRotate").onclick = rotateCurrentPage;
// $("btnPrint").onclick = printPdf;

// ======================================
// PART 10/10
// FINAL CLEANUP
// ======================================

// ---------- Loading ----------

function showLoading(){

    let loader=document.getElementById("pdfLoading");

    if(loader) return;

    loader=document.createElement("div");

    loader.id="pdfLoading";

    loader.innerHTML=`
        <div class="pdf-loader">
            <i class="fa-solid fa-spinner fa-spin"></i>
            <p>Memuat PDF...</p>
        </div>
    `;

    document.querySelector(".pdf-view").appendChild(loader);

}

function hideLoading(){

    document.getElementById("pdfLoading")?.remove();

}

// ---------- Render Wrapper ----------

const __renderAllPages=renderAllPages;

renderAllPages=async function(){

    showLoading();

    try{

        await __renderAllPages();

        fitWidth();

    }catch(err){

        console.error(err);

        alert("Gagal merender PDF");

    }

    hideLoading();

};

// ---------- Open Wrapper ----------

const __openPdf=openPdf;

openPdf=async function(e){

    showLoading();

    try{

        await __openPdf(e);

    }catch(err){

        console.error(err);

        alert("Tidak dapat membuka PDF");

    }

    hideLoading();

};

// ---------- Resize ----------

let resizeTimer;

window.addEventListener("resize",()=>{

    clearTimeout(resizeTimer);

    resizeTimer=setTimeout(()=>{

        fitWidth();

    },250);

});

// ---------- Memory ----------

function destroyReader(){

    renderedPages.clear();

    pdfDoc=null;

    currentPage=1;

    totalPages=0;

    zoom=1.25;

    observer?.disconnect();

    observer=null;

    $("pdfContainer").innerHTML="";

    const thumbs=$("thumbnailList");

    if(thumbs){

        thumbs.innerHTML="";

    }

    $("pageNum").textContent="0";

    $("pageCount").textContent="0";

    $("zoomValue").textContent="125%";

    $("emptyState").style.display="block";

}

// ---------- Public API ----------

window.PDFReader={

    open:openPdf,

    destroy:destroyReader,

    zoomIn,

    zoomOut,

    next:nextPage,

    prev:prevPage,

    scrollTo:scrollToPage,

    rotate:rotateCurrentPage,

    search:searchText,

    print:printPdf,

    fitWidth,

    refresh:refreshAllPages

};

// ======================================
// END
// ======================================
