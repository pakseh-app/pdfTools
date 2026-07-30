// ======================================
// pdfTools Reader V3
// Part 1
// ======================================

class PDFReader {

    constructor() {

        // ===== DOM =====
        this.pdfContainer = document.getElementById("pdfContainer");
        this.thumbnailList = document.getElementById("thumbnailList");

        this.emptyState = document.getElementById("emptyState");

        this.fileInput = document.getElementById("pdfFile");

        this.btnOpen = document.getElementById("btnOpen");
        this.btnPrev = document.getElementById("btnPrev");
        this.btnNext = document.getElementById("btnNext");

        this.btnZoomIn = document.getElementById("btnZoomIn");
        this.btnZoomOut = document.getElementById("btnZoomOut");

        this.pageNum = document.getElementById("pageNum");
        this.pageCount = document.getElementById("pageCount");
        this.zoomValue = document.getElementById("zoomValue");

        // ===== PDF =====
        this.pdf = null;
        this.file = null;

        this.totalPages = 0;
        this.currentPage = 1;

        // ===== View =====
        this.scale = 1.25;
        this.rotation = 0;

        this.minZoom = 0.50;
        this.maxZoom = 4.00;
        this.zoomStep = 0.20;

        // ===== Cache =====
        this.pageCache = new Map();
        this.thumbCache = new Map();

        // ===== State =====
        this.loading = false;
        this.rendering = false;

        // ===== Observer =====
        this.observer = null;

    }

    // =============================
    // Initialize
    // =============================

    init() {

        this.bindToolbar();

        this.bindKeyboard();

        this.bindMouse();

        this.updateToolbar();

    }

    // =============================
    // Update Toolbar
    // =============================

    updateToolbar() {

        this.pageNum.textContent = this.currentPage;

        this.pageCount.textContent = this.totalPages;

        this.zoomValue.textContent =
            Math.round(this.scale * 100) + "%";

    }

    // =============================
    // Loading
    // =============================

    showLoading() {

        this.loading = true;

        this.pdfContainer.innerHTML =
        `
        <div class="reader-loading">

            <i class="fa-solid fa-spinner fa-spin"></i>

            <p>Memuat PDF...</p>

        </div>
        `;

    }

    hideLoading() {

        this.loading = false;

    }

    // =============================
    // Reset
    // =============================

    reset() {

        this.pdf = null;

        this.file = null;

        this.totalPages = 0;

        this.currentPage = 1;

        this.scale = 1.25;

        this.rotation = 0;

        this.pageCache.clear();

        this.thumbCache.clear();

        this.pdfContainer.innerHTML = "";

        this.thumbnailList.innerHTML = "";

        this.updateToolbar();

        this.emptyState.style.display = "";

    }

}

window.reader = new PDFReader();

document.addEventListener("DOMContentLoaded", () => {

    reader.init();

});

// ======================================
// Toolbar Events
// ======================================

PDFReader.prototype.bindToolbar = function () {

    // Buka PDF
    this.btnOpen.addEventListener("click", () => {

        this.fileInput.click();

    });

    this.fileInput.addEventListener("change", async (e) => {

        if (!e.target.files.length) return;

        await this.open(e.target.files[0]);

    });

    // Navigasi
    this.btnPrev.addEventListener("click", () => {

        this.prevPage();

    });

    this.btnNext.addEventListener("click", () => {

        this.nextPage();

    });

    // Zoom
    this.btnZoomIn.addEventListener("click", () => {

        this.zoomIn();

    });

    this.btnZoomOut.addEventListener("click", () => {

        this.zoomOut();

    });

};

// ======================================
// Keyboard Shortcut
// ======================================

PDFReader.prototype.bindKeyboard = function () {

    document.addEventListener("keydown", (e) => {

        if (!this.pdf) return;

        switch (e.key) {

            case "ArrowLeft":
            case "PageUp":
                e.preventDefault();
                this.prevPage();
                break;

            case "ArrowRight":
            case "PageDown":
                e.preventDefault();
                this.nextPage();
                break;

            case "Home":
                e.preventDefault();
                this.gotoPage(1);
                break;

            case "End":
                e.preventDefault();
                this.gotoPage(this.totalPages);
                break;

        }

        // Ctrl + Plus
        if (e.ctrlKey && (e.key === "+" || e.key === "=")) {

            e.preventDefault();

            this.zoomIn();

        }

        // Ctrl + Minus
        if (e.ctrlKey && e.key === "-") {

            e.preventDefault();

            this.zoomOut();

        }

    });

};

// ======================================
// Mouse
// ======================================

PDFReader.prototype.bindMouse = function () {

    this.pdfContainer.addEventListener("wheel", (e) => {

        if (!e.ctrlKey) return;

        e.preventDefault();

        if (e.deltaY < 0) {

            this.zoomIn();

        } else {

            this.zoomOut();

        }

    }, {

        passive: false

    });

};

// ======================================
// PDF Open
// ======================================

PDFReader.prototype.open = async function (file) {

    this.reset();

    this.file = file;

    this.showLoading();

    const buffer = await file.arrayBuffer();

    const task = pdfjsLib.getDocument({

        data: buffer

    });

    this.pdf = await task.promise;

    this.totalPages = this.pdf.numPages;

    this.emptyState.style.display = "none";

    this.hideLoading();

    await this.renderDocument();

};

// ======================================
// Render Document
// ======================================

PDFReader.prototype.renderDocument = async function () {

    this.pdfContainer.innerHTML = "";

    this.thumbnailList.innerHTML = "";

    for (let page = 1; page <= this.totalPages; page++) {

        await this.renderPage(page);

        await this.renderThumbnail(page);

    }

    this.createObserver();

    this.updateToolbar();

};

// ======================================
// Render Page
// ======================================

PDFReader.prototype.renderPage = async function (pageNumber) {

    const page = await this.pdf.getPage(pageNumber);

    const viewport = page.getViewport({

        scale: this.scale,
        rotation: this.rotation

    });

    const pageBox = document.createElement("div");

    pageBox.className = "pdf-page";

    pageBox.dataset.page = pageNumber;

    const canvas = document.createElement("canvas");

    const ctx = canvas.getContext("2d");

    canvas.width = Math.floor(viewport.width);

    canvas.height = Math.floor(viewport.height);

    await page.render({

        canvasContext: ctx,
        viewport

    }).promise;

    pageBox.appendChild(canvas);

    this.pdfContainer.appendChild(pageBox);

    this.pageCache.set(pageNumber, {

        page,
        canvas,
        wrapper: pageBox

    });

};

// ======================================
// Render Thumbnail
// ======================================

PDFReader.prototype.renderThumbnail = async function (pageNumber) {

    const page = await this.pdf.getPage(pageNumber);

    const viewport = page.getViewport({

        scale: 1

    });

    const width = 140;

    const scale = width / viewport.width;

    const thumbViewport = page.getViewport({

        scale

    });

    const item = document.createElement("div");

    item.className = "thumb-item";

    item.dataset.page = pageNumber;

    const canvas = document.createElement("canvas");

    canvas.width = Math.floor(thumbViewport.width);

    canvas.height = Math.floor(thumbViewport.height);

    await page.render({

        canvasContext: canvas.getContext("2d"),
        viewport: thumbViewport

    }).promise;

    const label = document.createElement("div");

    label.className = "thumb-label";

    label.textContent = pageNumber;

    item.appendChild(canvas);

    item.appendChild(label);

    item.addEventListener("click", () => {

        this.gotoPage(pageNumber);

    });

    this.thumbnailList.appendChild(item);

    this.thumbCache.set(pageNumber, item);

};

// ======================================
// Active Thumbnail
// ======================================

PDFReader.prototype.setActiveThumbnail = function (pageNumber) {

    this.thumbnailList
        .querySelectorAll(".thumb-item")
        .forEach(item => {

            item.classList.remove("active");

        });

    const active = this.thumbCache.get(pageNumber);

    if (!active) return;

    active.classList.add("active");

    active.scrollIntoView({

        block: "nearest",
        behavior: "smooth"

    });

};

// ======================================
// Navigation
// ======================================

PDFReader.prototype.gotoPage = function (pageNumber) {

    if (!this.pdf) return;

    if (pageNumber < 1) pageNumber = 1;

    if (pageNumber > this.totalPages) pageNumber = this.totalPages;

    const page = this.pageCache.get(pageNumber);

    if (!page) return;

    this.currentPage = pageNumber;

    page.wrapper.scrollIntoView({

        behavior: "smooth",
        block: "start"

    });

    this.setActiveThumbnail(pageNumber);

    this.updateToolbar();

};

// ======================================
// Next Page
// ======================================

PDFReader.prototype.nextPage = function () {

    if (this.currentPage >= this.totalPages) return;

    this.gotoPage(this.currentPage + 1);

};

// ======================================
// Previous Page
// ======================================

PDFReader.prototype.prevPage = function () {

    if (this.currentPage <= 1) return;

    this.gotoPage(this.currentPage - 1);

};

// ======================================
// Page Observer
// ======================================

PDFReader.prototype.createObserver = function () {

    if (this.observer) {

        this.observer.disconnect();

    }

    this.observer = new IntersectionObserver((entries) => {

        let visiblePage = null;

        let highestRatio = 0;

        entries.forEach(entry => {

            if (!entry.isIntersecting) return;

            if (entry.intersectionRatio > highestRatio) {

                highestRatio = entry.intersectionRatio;

                visiblePage = Number(entry.target.dataset.page);

            }

        });

        if (!visiblePage) return;

        if (visiblePage === this.currentPage) return;

        this.currentPage = visiblePage;

        this.setActiveThumbnail(visiblePage);

        this.updateToolbar();

    }, {

        root: this.pdfContainer,

        threshold: [0.4, 0.6, 0.8]

    });

    this.pageCache.forEach(item => {

        this.observer.observe(item.wrapper);

    });

};

// ======================================
// Zoom
// ======================================

PDFReader.prototype.zoomIn = async function () {

    if (!this.pdf) return;

    if (this.scale >= this.maxZoom) return;

    const oldHeight = this.pdfContainer.scrollHeight;
    const ratio = this.pdfContainer.scrollTop / Math.max(oldHeight, 1);

    this.scale += this.zoomStep;

    await this.reRender();

    const newHeight = this.pdfContainer.scrollHeight;

    this.pdfContainer.scrollTop = ratio * newHeight;

};

PDFReader.prototype.zoomOut = async function () {

    if (!this.pdf) return;

    if (this.scale <= this.minZoom) return;

    const oldHeight = this.pdfContainer.scrollHeight;
    const ratio = this.pdfContainer.scrollTop / Math.max(oldHeight, 1);

    this.scale -= this.zoomStep;

    await this.reRender();

    const newHeight = this.pdfContainer.scrollHeight;

    this.pdfContainer.scrollTop = ratio * newHeight;

};

// ======================================
// ReRender
// ======================================

PDFReader.prototype.reRender = async function () {

    if (this.rendering) return;

    this.rendering = true;

    this.pdfContainer.innerHTML = "";

    this.pageCache.clear();

    for (let page = 1; page <= this.totalPages; page++) {

        await this.renderPage(page);

    }

    this.createObserver();

    this.updateToolbar();

    this.rendering = false;

};

// ======================================
// Rotate
// ======================================

PDFReader.prototype.rotateRight = async function () {

    if (!this.pdf) return;

    this.rotation += 90;

    if (this.rotation >= 360) {

        this.rotation = 0;

    }

    await this.reRender();

};

// ======================================
// Fit Width
// ======================================

PDFReader.prototype.fitWidth = async function () {

    if (!this.pdf) return;

    const first = await this.pdf.getPage(1);

    const viewport = first.getViewport({

        scale: 1

    });

    const available = this.pdfContainer.clientWidth - 40;

    this.scale = available / viewport.width;

    if (this.scale > this.maxZoom) {

        this.scale = this.maxZoom;

    }

    if (this.scale < this.minZoom) {

        this.scale = this.minZoom;

    }

    await this.reRender();

};

// ======================================
// Search
// ======================================

PDFReader.prototype.search = async function (keyword) {

    if (!this.pdf) return -1;

    keyword = keyword.trim().toLowerCase();

    if (keyword === "") return -1;

    for (let pageNumber = 1; pageNumber <= this.totalPages; pageNumber++) {

        const page = await this.pdf.getPage(pageNumber);

        const text = await page.getTextContent();

        const content = text.items
            .map(item => item.str)
            .join(" ")
            .toLowerCase();

        if (content.includes(keyword)) {

            this.gotoPage(pageNumber);

            return pageNumber;

        }

    }

    return -1;

};

// ======================================
// Print
// ======================================

PDFReader.prototype.print = function () {

    if (!this.pdf) return;

    window.print();

};

// ======================================
// Fullscreen
// ======================================

PDFReader.prototype.toggleFullscreen = async function () {

    const viewer = document.querySelector(".pdf-view");

    if (!document.fullscreenElement) {

        await viewer.requestFullscreen();

    } else {

        await document.exitFullscreen();

    }

};

// ======================================
// Keyboard Shortcut (Extended)
// ======================================

PDFReader.prototype.bindKeyboardExtra = function () {

    document.addEventListener("keydown", async (e) => {

        if (!this.pdf) return;

        // Ctrl + F
        if (e.ctrlKey && e.key.toLowerCase() === "f") {

            e.preventDefault();

            const keyword = prompt("Cari teks:");

            if (!keyword) return;

            const page = await this.search(keyword);

            if (page === -1) {

                alert("Teks tidak ditemukan.");

            }

        }

        // Ctrl + P
        if (e.ctrlKey && e.key.toLowerCase() === "p") {

            e.preventDefault();

            this.print();

        }

        // F11
        if (e.key === "F11") {

            e.preventDefault();

            this.toggleFullscreen();

        }

        // R
        if (!e.ctrlKey && !e.shiftKey && e.key.toLowerCase() === "r") {

            e.preventDefault();

            this.rotateRight();

        }

    });

};

// ======================================
// Initialize Extra Features
// ======================================

const __readerInit = PDFReader.prototype.init;

PDFReader.prototype.init = function () {

    __readerInit.call(this);

    this.bindKeyboardExtra();

};

// ======================================
// PART 7
// Cleanup & Utility
// ======================================

PDFReader.prototype.destroy = function () {

    if (this.observer) {

        this.observer.disconnect();
        this.observer = null;

    }

    this.pageCache.clear();
    this.thumbCache.clear();

    this.pdf = null;
    this.file = null;

    this.totalPages = 0;
    this.currentPage = 1;

    this.scale = 1.25;
    this.rotation = 0;

    this.loading = false;
    this.rendering = false;

    this.pdfContainer.innerHTML = "";
    this.thumbnailList.innerHTML = "";

    this.emptyState.style.display = "";

    this.updateToolbar();

};

// ======================================
// Reload Current Document
// ======================================

PDFReader.prototype.reload = async function () {

    if (!this.file) return;

    const file = this.file;

    this.destroy();

    await this.open(file);

};

// ======================================
// Public API
// ======================================

PDFReader.prototype.getCurrentPage = function () {

    return this.currentPage;

};

PDFReader.prototype.getTotalPages = function () {

    return this.totalPages;

};

PDFReader.prototype.getZoom = function () {

    return this.scale;

};

PDFReader.prototype.setZoom = async function (scale) {

    if (!this.pdf) return;

    if (scale < this.minZoom) scale = this.minZoom;

    if (scale > this.maxZoom) scale = this.maxZoom;

    this.scale = scale;

    await this.reRender();

};

PDFReader.prototype.isLoaded = function () {

    return this.pdf !== null;

};

// ======================================
// Window Resize
// ======================================

PDFReader.prototype.handleResize = function () {

    let timer = null;

    window.addEventListener("resize", () => {

        clearTimeout(timer);

        timer = setTimeout(async () => {

            if (!this.pdf) return;

            await this.reRender();

        }, 200);

    });

};

// ======================================
// Final Init
// ======================================

const __initReaderV3 = PDFReader.prototype.init;

PDFReader.prototype.init = function () {

    __initReaderV3.call(this);

    this.bindKeyboardExtra();

    this.handleResize();

};

// ======================================
// PART 8
// Final Bootstrap
// ======================================

// Inisialisasi PDF.js Worker
pdfjsLib.GlobalWorkerOptions.workerSrc =
    "libs/pdfjs/pdf.worker.min.js";

// ======================================
// Open Helper
// ======================================

window.openPDF = function () {

    reader.fileInput.click();

};

// ======================================
// Search Helper
// ======================================

window.searchPDF = async function () {

    if (!reader.isLoaded()) return;

    const keyword = prompt("Cari teks");

    if (!keyword) return;

    const result = await reader.search(keyword);

    if (result === -1) {

        alert("Teks tidak ditemukan");

    }

};

// ======================================
// Rotate Helper
// ======================================

window.rotatePDF = async function () {

    if (!reader.isLoaded()) return;

    await reader.rotateRight();

};

// ======================================
// Print Helper
// ======================================

window.printPDF = function () {

    if (!reader.isLoaded()) return;

    reader.print();

};

// ======================================
// Export API
// ======================================

window.Reader = {

    open: openPDF,

    search: searchPDF,

    rotate: rotatePDF,

    print: printPDF,

    reload: () => reader.reload(),

    destroy: () => reader.destroy(),

    zoomIn: () => reader.zoomIn(),

    zoomOut: () => reader.zoomOut(),

    fitWidth: () => reader.fitWidth(),

    next: () => reader.nextPage(),

    prev: () => reader.prevPage(),

    goto: (page) => reader.gotoPage(page),

    currentPage: () => reader.getCurrentPage(),

    totalPages: () => reader.getTotalPages(),

    zoom: () => reader.getZoom()

};

// ======================================
// Ready
// ======================================

document.addEventListener("DOMContentLoaded", () => {

    console.log(
        "%cpdfTools Reader V3 Ready",
        "color:#2563eb;font-size:16px;font-weight:bold;"
    );

});

