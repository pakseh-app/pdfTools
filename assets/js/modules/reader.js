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

    const btn = document.getElementById("btnOpen");
    const input = document.getElementById("pdfFile");

    if (!btn || !input) return;

    btn.onclick = () => input.click();

    input.onchange = openPdf;

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

        document.getElementById("pageNum").textContent = currentPage;
        document.getElementById("pageCount").textContent = totalPages;

        await renderPage(currentPage);

    } catch (err) {

        console.error(err);
        alert("Gagal membuka PDF");

    }

}

async function renderPage(pageNumber) {

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

window.initReader = initReader;
