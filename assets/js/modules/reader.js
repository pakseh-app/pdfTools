// ======================================
// reader.js
// Main Controller
// ======================================

let engine;
let thumbs;
let navigation;
let zoom;

document.addEventListener("DOMContentLoaded", () => {

    const pdfContainer = document.getElementById("pdfContainer");
    const thumbContainer = document.getElementById("thumbnailList");

    engine = new PDFEngine(pdfContainer);

    thumbs = new ThumbnailManager(
        thumbContainer,
        engine
    );

    navigation = new NavigationManager(
        pdfContainer
    );

    zoom = new ZoomManager(
        engine,
        pdfContainer
    );

    // Label zoom
    const zoomValue = document.getElementById("zoomValue");
    if (zoomValue) {
        zoom.bindLabel(zoomValue);
    }

    // ==========================
    // Open File
    // ==========================

    const fileInput = document.getElementById("fileInput");
    const btnOpen = document.getElementById("btnOpen");

    if (btnOpen && fileInput) {

        btnOpen.onclick = () => fileInput.click();

        fileInput.onchange = async () => {

            if (!fileInput.files.length) return;

            await engine.open(fileInput.files[0]);

            await engine.renderAll();

            await thumbs.render();

            navigation.init(engine.totalPages);

            updatePageInfo(1);

        };

    }

    // ==========================
    // Thumbnail Click
    // ==========================

    thumbs.onSelect = page => {

        navigation.goTo(page);

    };

    // ==========================
    // Observer Page
    // ==========================

    navigation.onPageChange = page => {

        thumbs.setActive(page);

        updatePageInfo(page);

    };

    // ==========================
    // Navigation Button
    // ==========================

    document.getElementById("btnNext")?.addEventListener("click", () => {

        navigation.next();

    });

    document.getElementById("btnPrev")?.addEventListener("click", () => {

        navigation.previous();

    });

    // ==========================
    // Zoom
    // ==========================

    document.getElementById("btnZoomIn")?.addEventListener("click", async () => {

        await zoom.zoomIn();

        navigation.observePages();

    });

    document.getElementById("btnZoomOut")?.addEventListener("click", async () => {

        await zoom.zoomOut();

        navigation.observePages();

    });

    document.getElementById("btnFit")?.addEventListener("click", async () => {

        await zoom.fitWidth();

        navigation.observePages();

    });

    zoom.enableWheelZoom();

    // ==========================
    // Keyboard
    // ==========================

    document.addEventListener("keydown", e => {

        switch (e.key) {

            case "ArrowDown":
            case "PageDown":
                navigation.next();
                break;

            case "ArrowUp":
            case "PageUp":
                navigation.previous();
                break;

            case "Home":
                navigation.first();
                break;

            case "End":
                navigation.last();
                break;

        }

    });

});

// ======================================
// Helper
// ======================================

function updatePageInfo(page) {

    const pageNum = document.getElementById("pageNum");
    const pageCount = document.getElementById("pageCount");

    if (pageNum) {
        pageNum.textContent = page;
    }

    if (pageCount) {
        pageCount.textContent = engine.totalPages;
    }

}
