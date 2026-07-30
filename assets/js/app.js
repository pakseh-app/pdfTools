const sidebar=document.getElementById("sidebar");

document
.getElementById("toggleSidebar")
.onclick=function(){

sidebar.classList.toggle("hide");

};

document
.querySelectorAll(".menu")
.forEach(menu=>{

menu.onclick=function(e){

e.preventDefault();

document
.querySelectorAll(".menu")
.forEach(x=>x.classList.remove("active"));

this.classList.add("active");

document
.getElementById("pageTitle")
.innerText=this.innerText.trim();

};

});
