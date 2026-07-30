// ======================================
// pdfTools Router
// v1.2.0
// ======================================

const workspace = document.getElementById("workspace");
const pageTitle = document.getElementById("pageTitle");

const pageTitles = {
    home: "Dashboard",
    reader: "PDF Reader",
    editor: "PDF Editor",
    templates: "Template",
    documents: "Dokumen",
    settings: "Pengaturan"
};

async function loadPage(page) {

    try {

        const response = await fetch(`views/${page}.html`);

        if (!response.ok) {
            throw new Error("Halaman tidak ditemukan");
        }

        workspace.innerHTML = await response.text();

        pageTitle.textContent = pageTitles[page] || "pdfTools";

        document.querySelectorAll(".menu").forEach(menu => {
            menu.classList.remove("active");
        });

        document
            .querySelector(`[data-page="${page}"]`)
            ?.classList.add("active");

        // Jalankan module reader hanya saat halaman reader dibuka
        if (page === "reader") {

            const reader = await import("./modules/reader.js");

            if (reader.initReader) {
                reader.initReader();
            }

        }

    } catch (err) {

        console.error(err);

        workspace.innerHTML = `
            <div class="text-center p-5">
                <h3>Halaman tidak ditemukan</h3>
            </div>
        `;

    }

}

document.querySelectorAll(".menu").forEach(menu => {

    menu.addEventListener("click", e => {

        e.preventDefault();

        loadPage(menu.dataset.page);

    });

});

loadPage("home");

