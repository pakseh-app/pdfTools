// ======================================
// zoom.js
// Zoom Manager
// ======================================

class ZoomManager {

    constructor(engine, container) {

        this.engine = engine;
        this.container = container;

        this.minZoom = 0.5;
        this.maxZoom = 3;
        this.step = 0.2;

        this.zoomLabel = null;

    }

    bindLabel(element) {

        this.zoomLabel = element;
        this.updateLabel();

    }

    getScale() {

        return this.engine.scale;

    }

    updateLabel() {

        if (!this.zoomLabel) return;

        this.zoomLabel.textContent =
            Math.round(this.engine.scale * 100) + "%";

    }

    async apply(scale) {

        scale = Math.max(this.minZoom,
                Math.min(this.maxZoom, scale));

        if (scale === this.engine.scale) return;

        // simpan posisi baca sekarang
        const scrollTop = this.container.scrollTop;
        const scrollHeight = this.container.scrollHeight;
        const ratio = scrollHeight > 0
            ? scrollTop / scrollHeight
            : 0;

        this.engine.setZoom(scale);

        await this.engine.refresh();

        // kembalikan posisi baca
        requestAnimationFrame(() => {

            const newHeight = this.container.scrollHeight;

            this.container.scrollTop = ratio * newHeight;

        });

        this.updateLabel();

    }

    async zoomIn() {

        await this.apply(
            this.engine.scale + this.step
        );

    }

    async zoomOut() {

        await this.apply(
            this.engine.scale - this.step
        );

    }

    async reset() {

        await this.apply(1);

    }

    async fitWidth() {

        const page = this.container.querySelector("canvas");

        if (!page) return;

        const available =
            this.container.clientWidth - 40;

        const scale =
            available / page.width * this.engine.scale;

        await this.apply(scale);

    }

    enableWheelZoom() {

        this.container.addEventListener("wheel", async e => {

            if (!e.ctrlKey) return;

            e.preventDefault();

            if (e.deltaY < 0) {

                await this.zoomIn();

            } else {

                await this.zoomOut();

            }

        }, { passive: false });

    }

}

window.ZoomManager = ZoomManager;
