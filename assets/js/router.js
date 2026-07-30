async function loadPage(page){

const workspace=document.getElementById("workspace");

const html=await fetch("views/"+page+".html");

workspace.innerHTML=await html.text();

}
