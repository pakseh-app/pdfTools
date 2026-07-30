// ======================================
// pdfTools Reader
// PDF.js Legacy
// ======================================

pdfjsLib.GlobalWorkerOptions.workerSrc = "libs/pdfjs/pdf.worker.min.js";

let pdfDoc = null;
let currentPage = 1;
let totalPages = 0;
let zoom = 1.5;

const canvas = () => document.getElementById("pdfCanvas");
const ctx = () => canvas().getContext("2d");

function initReader() {

    const btnOpen = document.getElementById("btnOpen");
    const input = document.getElementById("pdfFile");

    const btnPrev = document.getElementById("btnPrev");
    const btnNext = document.getElementById("btnNext");

    const btnZoomIn = document.getElementById("btnZoomIn");
    const btnZoomOut = document.getElementById("btnZoomOut");

    if (!btnOpen || !input) return;

    btnOpen.onclick = () => input.click();
    input.onchange = openPdf;

    btnPrev.onclick = prevPage;
    btnNext.onclick = nextPage;

    btnZoomIn.onclick = zoomIn;
    btnZoomOut.onclick = zoomOut;

    updateZoomText();
}

async function openPdf(e) {

    const file = e.target.files[0];
    if (!file) return;

    try {

        const bytes = await file.arrayBuffer();

        pdfDoc = await pdfjsLib.getDocument({
            data: bytes
        }).promise;

        totalPages = pdfDoc.numPages;
        currentPage = 1;

        updatePageInfo();

        await renderPage(currentPage);

    } catch (err) {

        console.error(err);
        alert("Gagal membuka PDF");

    }

}

async function renderPage(pageNumber) {

    if (!pdfDoc) return;

    const page = await pdfDoc.getPage(pageNumber);

    const viewport = page.getViewport({
        scale: zoom
    });

    const pdfCanvas = canvas();

    pdfCanvas.width = viewport.width;
    pdfCanvas.height = viewport.height;

    document.getElementById("emptyState").style.display = "none";
    pdfCanvas.style.display = "block";

    await page.render({
        canvasContext: ctx(),
        viewport
    }).promise;

}

async function nextPage() {

    if (!pdfDoc) return;

    if (currentPage >= totalPages) return;

    currentPage++;

    updatePageInfo();

    await renderPage(currentPage);

}

async function prevPage() {

    if (!pdfDoc) return;

    if (currentPage <= 1) return;

    currentPage--;

    updatePageInfo();

    await renderPage(currentPage);

}

async function zoomIn() {

    if (!pdfDoc) return;

    zoom += 0.25;

    updateZoomText();

    await renderPage(currentPage);

}

async function zoomOut() {

    if (!pdfDoc) return;

    if (zoom <= 0.5) return;

    zoom -= 0.25;

    updateZoomText();

    await renderPage(currentPage);

}

function updatePageInfo() {

    document.getElementById("pageNum").textContent = currentPage;
    document.getElementById("pageCount").textContent = totalPages;

}

function updateZoomText() {

    document.getElementById("zoomValue").textContent =
        Math.round(zoom * 100) + "%";

}

window.initReader = initReader;
