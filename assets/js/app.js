const sidebar=document.getElementById("sidebar");

document
.getElementById("toggleSidebar")
.onclick=()=>{

sidebar.classList.toggle("hide");

};

document
.querySelectorAll(".menu")
.forEach(menu=>{

menu.onclick=(e)=>{

e.preventDefault();

document
.querySelectorAll(".menu")
.forEach(x=>x.classList.remove("active"));

menu.classList.add("active");

const page=menu.dataset.page;

document
.getElementById("pageTitle")
.innerText=menu.innerText.trim();

loadPage(page);

};

});

loadPage("home");
