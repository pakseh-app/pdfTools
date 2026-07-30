// ======================================
// navigation.js
// Page Navigation Manager
// ======================================

class NavigationManager {

    constructor(container) {

        this.container = container;
        this.currentPage = 1;
        this.totalPages = 0;
        this.onPageChange = null;

        this.observer = null;

    }

    init(totalPages) {

        this.totalPages = totalPages;
        this.currentPage = 1;

        this.createObserver();

    }

    createObserver() {

        if (this.observer) {

            this.observer.disconnect();

        }

        this.observer = new IntersectionObserver(entries => {

            let active = null;
            let ratio = 0;

            entries.forEach(entry => {

                if (entry.isIntersecting && entry.intersectionRatio > ratio) {

                    ratio = entry.intersectionRatio;
                    active = entry.target;

                }

            });

            if (!active) return;

            const page = Number(active.dataset.page);

            if (page === this.currentPage) return;

            this.currentPage = page;

            if (typeof this.onPageChange === "function") {

                this.onPageChange(page);

            }

        }, {

            root: this.container,
            threshold: 0.6

        });

        this.observePages();

    }

    observePages() {

        const pages = this.container.querySelectorAll(".pdf-page");

        pages.forEach(page => {

            this.observer.observe(page);

        });

    }

    goTo(page) {

        if (page < 1) page = 1;

        if (page > this.totalPages) page = this.totalPages;

        const element = this.container.querySelector(

            `.pdf-page[data-page="${page}"]`

        );

        if (!element) return;

        element.scrollIntoView({

            behavior: "smooth",
            block: "start"

        });

    }

    next() {

        this.goTo(this.currentPage + 1);

    }

    previous() {

        this.goTo(this.currentPage - 1);

    }

    first() {

        this.goTo(1);

    }

    last() {

        this.goTo(this.totalPages);

    }

    getCurrentPage() {

        return this.currentPage;

    }

    destroy() {

        if (this.observer) {

            this.observer.disconnect();

            this.observer = null;

        }

        this.currentPage = 1;
        this.totalPages = 0;

    }

}

window.NavigationManager = NavigationManager;
