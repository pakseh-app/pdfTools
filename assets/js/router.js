// ======================================
// pdfTools Router
// ======================================

const workspace = document.getElementById("workspace");
const pageTitle = document.getElementById("pageTitle");

const titles = {

    home: "Dashboard",

    reader: "PDF Reader",

    editor: "PDF Editor",

    templates: "Template",

    documents: "Dokumen",

    settings: "Pengaturan"

};

async function loadPage(page){

    try{

        const res = await fetch(`views/${page}.html`);

        workspace.innerHTML = await res.text();

        pageTitle.textContent = titles[page] || "pdfTools";

        document.querySelectorAll(".menu").forEach(m=>{

            m.classList.remove("active");

        });

        document
        .querySelector(`[data-page="${page}"]`)
        ?.classList.add("active");

        if(page==="reader"){

            if(typeof initReader==="function"){

                initReader();

            }

        }

    }catch(e){

        console.error(e);

        workspace.innerHTML=`

        <div class="text-center p-5">

            <h2>Halaman tidak ditemukan</h2>

        </div>

        `;

    }

}

document.querySelectorAll(".menu").forEach(menu=>{

    menu.onclick=(e)=>{

        e.preventDefault();

        loadPage(menu.dataset.page);

    };

});

window.loadPage=loadPage;

loadPage("home");
