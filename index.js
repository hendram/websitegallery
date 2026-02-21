const user="hendram";
const repo="websitegallery";

const gallery=document.getElementById("gallery");
const viewer=document.getElementById("viewer");
const viewerImg=document.getElementById("viewerImg");

const tier1=document.getElementById("tier1");
const tier2=document.getElementById("tier2");
const tier3=document.getElementById("tier3");

let currentImages=[];
let currentIndex=0;

/* ---------- API ---------- */

async function fetchJSON(url){
  const r=await fetch(url);
  if(!r.ok) throw new Error(await r.text());
  return await r.json();
}

function enc(p){
  return p.split("/").map(encodeURIComponent).join("/");
}

function message(t){
  gallery.innerHTML=`<div class="empty">${t}</div>`;
}

/* ---------- DIR FETCH ---------- */

async function getDirs(path=""){
  const items=await fetchJSON(
    `https://api.github.com/repos/${user}/${repo}/contents/${enc(path)}`
  );
  return items.filter(i=>i.type==="dir");
}

/* ---------- BUILD MENUS ---------- */

async function buildTier1(){
  if(!tier1.children.length) tier1.innerHTML="Loading...";
  const dirs=await getDirs("");
  tier1.innerHTML="";

  dirs.forEach(d=>{
    const el=document.createElement("div");
    el.textContent=d.name;
    el.onmouseenter=()=>buildTier2(d.path);
    el.onclick=()=>loadImages(d.path);
    tier1.appendChild(el);
  });
}

async function buildTier2(parent){
  if(!tier2.children.length) tier2.innerHTML="Loading...";
  tier3.innerHTML="";
  const dirs=await getDirs(parent);
  tier2.innerHTML="";

  dirs.forEach(d=>{
    const el=document.createElement("div");
    el.textContent=d.name;
    el.onmouseenter=()=>buildTier3(d.path);
    el.onclick=()=>loadImages(d.path);
    tier2.appendChild(el);
  });
}

async function buildTier3(parent){
  if(!tier3.children.length) tier3.innerHTML="Loading...";
  const dirs=await getDirs(parent);
  tier3.innerHTML="";

  dirs.forEach(d=>{
    const el=document.createElement("div");
    el.textContent=d.name;
    el.onclick=()=>loadImages(d.path);
    tier3.appendChild(el);
  });
}

/* ---------- IMAGE LOAD ---------- */

async function loadImages(path){
  message("Loading...");
  currentImages=[];
  const items=await fetchJSON(
    `https://api.github.com/repos/${user}/${repo}/contents/${enc(path)}`
  );

  items.forEach(item=>{
    if(item.type==="file" && item.name.match(/\.(png|jpg|jpeg|webp|gif)$/i)){
      currentImages.push(item);
    }
  });

  render();
}

/* ---------- RENDER ---------- */

function render(){
  const term=document.getElementById("search").value.toLowerCase();
  gallery.innerHTML="";

  const filtered=currentImages.filter(i=>
    i.name.toLowerCase().includes(term)
  );

  if(!filtered.length){
    message("No images");
    return;
  }

  filtered.forEach((file,i)=>{
    const card=document.createElement("div");
    card.className="card";
    card.innerHTML=`<img src="${file.download_url}"><div class="label">${file.name}</div>`;
    card.onclick=()=>{
      currentIndex=i;
      openViewer();
    };
    gallery.appendChild(card);
  });
}

/* ---------- VIEWER ---------- */

function openViewer(){
  viewerImg.src=currentImages[currentIndex].download_url;
  viewer.style.display="flex";
}

function next(){
  currentIndex=(currentIndex+1)%currentImages.length;
  openViewer();
}

function prev(){
  currentIndex=(currentIndex-1+currentImages.length)%currentImages.length;
  openViewer();
}

viewer.onclick=e=>{
  if(e.target===viewer) viewer.style.display="none";
};

document.addEventListener("keydown",e=>{
  if(viewer.style.display!=="flex") return;
  if(e.key==="Escape") viewer.style.display="none";
  if(e.key==="ArrowRight") next();
  if(e.key==="ArrowLeft") prev();
});

/* ---------- SEARCH ---------- */

searchBtn.onclick=render;
search.oninput=render;

/* ---------- INIT ---------- */

buildTier1();
