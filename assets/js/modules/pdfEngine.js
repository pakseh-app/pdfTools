// ======================================
// pdfEngine.js
// PDF.js Rendering Engine
// ======================================

pdfjsLib.GlobalWorkerOptions.workerSrc = "libs/pdfjs/pdf.worker.min.js";

class PDFEngine {

    constructor(container) {

        this.container = container;

        this.pdf = null;

        this.totalPages = 0;

        this.scale = 1.3;

        this.rotation = 0;

        this.cache = new Map();

    }

    async open(file) {

        this.destroy();

        const buffer = await file.arrayBuffer();

        const loadingTask = pdfjsLib.getDocument({
            data: buffer
        });

        this.pdf = await loadingTask.promise;

        this.totalPages = this.pdf.numPages;

        return this.totalPages;

    }

    async renderPage(pageNumber) {

        if (!this.pdf) return;

        const page = await this.pdf.getPage(pageNumber);

        const viewport = page.getViewport({
            scale: this.scale,
            rotation: this.rotation
        });

        const wrapper = document.createElement("div");

        wrapper.className = "pdf-page";

        wrapper.dataset.page = pageNumber;

        const canvas = document.createElement("canvas");

        canvas.width = viewport.width;

        canvas.height = viewport.height;

        const ctx = canvas.getContext("2d");

        await page.render({
            canvasContext: ctx,
            viewport
        }).promise;

        wrapper.appendChild(canvas);

        this.container.appendChild(wrapper);

        this.cache.set(pageNumber, wrapper);

        return wrapper;

    }

    async renderAll() {

        this.container.innerHTML = "";

        this.cache.clear();

        for (let i = 1; i <= this.totalPages; i++) {

            await this.renderPage(i);

        }

    }

    zoomIn() {

        this.scale += 0.2;

    }

    zoomOut() {

        if (this.scale <= 0.4) return;

        this.scale -= 0.2;

    }

    setZoom(scale) {

        this.scale = scale;

    }

    rotateRight() {

        this.rotation += 90;

        if (this.rotation >= 360) {

            this.rotation = 0;

        }

    }

    async refresh() {

        if (!this.pdf) return;

        await this.renderAll();

    }

    async getThumbnail(pageNumber, width = 150) {

        const page = await this.pdf.getPage(pageNumber);

        const viewport = page.getViewport({
            scale: 1
        });

        const scale = width / viewport.width;

        const thumbViewport = page.getViewport({
            scale
        });

        const canvas = document.createElement("canvas");

        canvas.width = thumbViewport.width;

        canvas.height = thumbViewport.height;

        await page.render({

            canvasContext: canvas.getContext("2d"),

            viewport: thumbViewport

        }).promise;

        return canvas;

    }

    async search(keyword) {

        keyword = keyword.toLowerCase();

        for (let i = 1; i <= this.totalPages; i++) {

            const page = await this.pdf.getPage(i);

            const text = await page.getTextContent();

            const content = text.items
                .map(x => x.str)
                .join(" ")
                .toLowerCase();

            if (content.includes(keyword)) {

                return i;

            }

        }

        return -1;

    }

    destroy() {

        this.container.innerHTML = "";

        this.cache.clear();

        this.pdf = null;

        this.totalPages = 0;

    }

}

window.PDFEngine = PDFEngine;
