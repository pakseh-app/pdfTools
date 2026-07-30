// ======================================
// thumbnail.js
// Thumbnail Manager
// ======================================

class ThumbnailManager {

    constructor(container, engine) {

        this.container = container;
        this.engine = engine;
        this.active = 1;
        this.onSelect = null;

    }

    async render() {

        this.container.innerHTML = "";

        if (!this.engine.pdf) return;

        for (let page = 1; page <= this.engine.totalPages; page++) {

            const item = document.createElement("div");
            item.className = "thumb-item";
            item.dataset.page = page;

            const canvas = await this.engine.getThumbnail(page, 140);

            const label = document.createElement("div");
            label.className = "thumb-label";
            label.textContent = page;

            item.appendChild(canvas);
            item.appendChild(label);

            item.onclick = () => {

                this.setActive(page);

                if (typeof this.onSelect === "function") {

                    this.onSelect(page);

                }

            };

            this.container.appendChild(item);

        }

        this.setActive(1);

    }

    setActive(page) {

        this.active = page;

        this.container.querySelectorAll(".thumb-item").forEach(item => {

            item.classList.remove("active");

        });

        const current = this.container.querySelector(
            `.thumb-item[data-page="${page}"]`
        );

        if (!current) return;

        current.classList.add("active");

        current.scrollIntoView({

            block: "nearest",
            behavior: "smooth"

        });

    }

    destroy() {

        this.container.innerHTML = "";
        this.active = 1;

    }

}

window.ThumbnailManager = ThumbnailManager;
