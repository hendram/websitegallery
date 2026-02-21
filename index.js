const user="hendram";
const repo="websitegallery";

const gallery=document.getElementById("gallery");
const viewer=document.getElementById("viewer");
const viewerImg=document.getElementById("viewerImg");

const tier1=document.getElementById("tier1");
const tier2=document.getElementById("tier2");
const tier3=document.getElementById("tier3");

const search=document.getElementById("search");
const searchBtn=document.getElementById("searchBtn");

let currentImages=[];
let currentIndex=0;

let selectedTier1=null;
let selectedTier2=null;

/* request guards */
let reqTier2=0;
let reqTier3=0;
let reqImages=0;

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
  console.log("items", items);
  return items.filter(i=>i.type==="dir");
}

/* ---------- TIER1 ---------- */
async function buildTier1(){
  const dirs=await getDirs("");
  tier1.innerHTML="";
  tier2.innerHTML="";
  tier3.innerHTML="";

  dirs.forEach(d=>{
    const el=document.createElement("div");
    el.textContent=d.name;

    /* hover = highlight only */
    el.onmouseenter=()=>highlight(tier1,el);

    /* click = load tier2 */
    el.onclick=async()=>{
      try{
        selectedTier1=d.path;
        selectedTier2=null;

        highlight(tier1,el,true);

        tier2.innerHTML="Loading...";
        tier3.innerHTML="";

        await buildTier2(d.path);
        await loadImages(d.path);

      }catch(err){
        console.error(err);
        message("Failed loading folder");
      }
    };

    tier1.appendChild(el);
  });
}


async function buildTier2(parent){
  const dirs=await getDirs(parent);

  tier2.innerHTML="";
  tier3.innerHTML="";

  dirs.forEach(d=>{
    const el=document.createElement("div");
    el.textContent=d.name;

    /* hover highlight only */
    el.onmouseenter=()=>highlight(tier2,el);

    /* click = lock tier2 + load tier3 */
    el.onclick=async()=>{
      if(!selectedTier1) return;

      selectedTier2=d.path;
      highlight(tier2,el,true);

      tier3.innerHTML="Loading...";

      await buildTier3(d.path);
      await loadImages(d.path);
    };

    tier2.appendChild(el);
  });
}


async function buildTier3(parent){
  const dirs=await getDirs(parent);

  tier3.innerHTML="";

  dirs.forEach(d=>{
    const el=document.createElement("div");
    el.textContent=d.name;

    el.onmouseenter=()=>highlight(tier3,el);

    el.onclick=async()=>{
      highlight(tier3,el,true);
      await loadImages(d.path);
    };

    tier3.appendChild(el);
  });
}

/* ---------- IMAGES ---------- */

async function loadImages(path){
  const id=++reqImages;

  message("Loading...");
  currentImages=[];

  const items=await fetchJSON(
    `https://api.github.com/repos/${user}/${repo}/contents/${enc(path)}`
  );

  if(id!==reqImages) return;

  items.forEach(item=>{
    if(item.type==="file" && item.name.match(/\.(png|jpg|jpeg|webp|gif)$/i)){
      currentImages.push(item);
    }
  });

  render();
}

/* ---------- RENDER ---------- */

function render(){
  const term=search.value.toLowerCase();
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

function highlight(container,el,lock=false){
  [...container.children].forEach(c=>c.classList.remove("active","hover"));
  el.classList.add(lock?"active":"hover");
}

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
