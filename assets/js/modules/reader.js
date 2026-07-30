// ======================================
// pdfTools Reader Module
// ======================================

import * as pdfjsLib from "../../../libs/pdfjs/pdf.mjs";

pdfjsLib.GlobalWorkerOptions.workerSrc = new URL(
    "../../../libs/pdfjs/pdf.worker.mjs",
    import.meta.url
).href;

let pdfDoc = null;
let currentPage = 1;
let totalPages = 0;

export function initReader() {

    const fileInput = document.getElementById("pdfFile");
    const btnOpen = document.getElementById("btnOpen");

    if (!fileInput || !btnOpen) {
        return;
    }

    btnOpen.addEventListener("click", () => {
        fileInput.click();
    });

    fileInput.addEventListener("change", openPdf);

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
        console.log(pdfDoc);

    } catch (err) {

        console.error(err);
        alert("Gagal membuka file PDF.");

    }

}
