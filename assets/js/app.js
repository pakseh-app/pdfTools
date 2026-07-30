// ======================================
// pdfTools App
// ======================================

// Toggle Sidebar

const sidebar = document.getElementById("sidebar");
const toggleSidebar = document.getElementById("toggleSidebar");

if (toggleSidebar) {

    toggleSidebar.addEventListener("click", () => {

        sidebar.classList.toggle("show");

    });

}
