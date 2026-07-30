// ======================================
// pdfTools Reader Module (LEGACY)
// ======================================

pdfjsLib.GlobalWorkerOptions.workerSrc = "libs/pdfjs/pdf.worker.min.js";

let pdfDoc = null;
let currentPage = 1;
let totalPages = 0;

function initReader() {

    const fileInput = document.getElementById("pdfFile");
    const btnOpen = document.getElementById("btnOpen");

    if (!fileInput || !btnOpen) return;

    btnOpen.onclick = () => fileInput.click();

    fileInput.onchange = openPdf;

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

        document.getElementById("emptyState").style.display = "none";

        console.log("PDF Loaded");

    } catch (err) {

        console.error(err);

        alert("Gagal membuka PDF");

    }

}

// supaya bisa dipanggil dari router
window.initReader = initReader;
