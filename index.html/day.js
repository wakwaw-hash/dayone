const dome = document.getElementById('dome');
const container = document.getElementById('container');
const flowerWrapper = document.getElementById('flowerWrapper');
const letterInside = document.getElementById('letterInside');
const screenPetals = document.getElementById('screenPetals');
const statusText = document.getElementById('statusText');

// Tombol silang surat
const closeBtnLetter = document.getElementById('closeBtn'); 

// Variabel Khusus Modal Foto & Navigasi Slider
const modal = document.getElementById("photoModal");
const modalImg = document.getElementById("modalImg");
const modalCloseBtn = document.querySelector(".close-photo-btn"); 
const prevBtn = document.querySelector(".prev-btn");
const nextBtn = document.querySelector(".next-btn");
const photoCounter = document.getElementById("photoCounter");

let tapCount = 0;
let globalRainInterval = null;
let isGlassShattered = false;

// Kumpulan data foto untuk sistem slider/navigasi panah
let arrayFoto = [];
let indeksFotoAktif = 0;

// 1. LOGIKA KETUK KACA
// Cari kode ini di bagian atas day.js Anda:
if (dome) {
  dome.addEventListener('click', (e) => {
    if (isGlassShattered) return;
    
    // 🎵 Putar lagu dari ketukan pertama di sini
    const lagu = document.getElementById('backsound');
    if (lagu) lagu.play().catch(() => {});

    tapCount++;
    const rect = dome.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    const ripple = document.createElement('div');
    ripple.className = 'ripple';
    ripple.style.left = `${x}px`;
    ripple.style.top = `${y}px`;
    container.appendChild(ripple);
    setTimeout(() => ripple.remove(), 600);

    if (tapCount === 1) {
      dome.classList.add('crack-1');
      statusText.innerText = "KACANE MULAI PECAH (3x MENEHH)";
    } else if (tapCount === 2) {
      dome.classList.remove('crack-1');
      dome.classList.add('crack-2');
      statusText.innerText = "PECAH E MULAI BANYAK! (2x MENEH)";
    } else if (tapCount === 3) {
      dome.classList.remove('crack-2');
      dome.classList.add('crack-3');
      dome.classList.add('shake-dome');
      statusText.innerText = "DIKIT LAGIII!!! (1x TOKK!)";
    } else if (tapCount >= 4) {
      shatterGlass();
    }
  });
}

function shatterGlass() {
  statusText.innerText = "DUUAAARRRRRR! KACANE PECAH DAHH";
  isGlassShattered = true;
  
  const domeWidth = dome.offsetWidth;
  const domeHeight = dome.offsetHeight;

  for (let i = 0; i < 30; i++) {
    const shard = document.createElement('div');
    shard.className = 'glass-shard';
    const sizeW = 8 + Math.random() * 20;
    const sizeH = 12 + Math.random() * 25;
    shard.style.width = `${sizeW}px`;
    shard.style.height = `${sizeH}px`;
    shard.style.clipPath = `polygon(${Math.random()*30}% 0%, 100% ${Math.random()*30}%, ${70+Math.random()*30}% 100%, 0% 100%)`;
    shard.style.left = `${Math.random() * domeWidth}px`;
    shard.style.top = `${Math.random() * domeHeight}px`;

    const dx = (Math.random() - 0.5) * 300;
    const dy = (Math.random() - 0.3) * 250 + 150;
    const dr = 720 + Math.random() * 720;
    shard.style.setProperty('--dx', `${dx}px`);
    shard.style.setProperty('--dy', `${dy}px`);
    shard.style.setProperty('--dr', `${dr}deg`);

    container.appendChild(shard);
    setTimeout(() => shard.remove(), 1200);
  }

  if (dome) dome.remove();

  setTimeout(() => {
    flowerWrapper.classList.add('free-glow');
    if (letterInside) letterInside.classList.add('show');
    startGlobalPetals();
    
    // PERBAIKAN: Aktifkan sensor klik kelopak tepat setelah kaca hilang dari layar
    aktifkanKlikKelopak();
  }, 300);
}

// 2. LOGIKA MENUTUP SURAT
if (closeBtnLetter) {
  closeBtnLetter.addEventListener('click', () => {
    if (letterInside) letterInside.classList.remove('show');
    stopGlobalPetals();
    statusText.innerText = "Pencet satu satu kelopak Bunga ne iku! Terus pencet ten juga LINGKARAN EMAS seng ada ditengah tengah itu jangan IRI tapi😜😹";
  });
}

// 3. LOGIKA KLIK KELOPAK BUNGA & PUSAT MASING-MASING FOTO
function aktifkanKlikKelopak() {
  const flowerHead = document.getElementById("flowerHead");
  const seluruhKelopak = document.querySelectorAll(".petal, .flower-center");

  if (!flowerHead) return;

  // Kumpulkan semua link foto dari atribut data-src untuk slider modal
  arrayFoto = [];
  seluruhKelopak.forEach((kelopak) => {
    const url = kelopak.getAttribute("data-src");
    if (url) arrayFoto.push(url);
  });

  // Pasang event listener klik langsung ke setiap elemen kelopak secara individu
  seluruhKelopak.forEach((kelopak) => {
    kelopak.addEventListener("click", (e) => {
      e.preventDefault();
      e.stopPropagation();
      
      const isLetterClosed = letterInside ? !letterInside.classList.contains('show') : true;
      if (isGlassShattered && isLetterClosed) {
        const photoUrl = kelopak.getAttribute("data-src");
        if (photoUrl) {
          indeksFotoAktif = arrayFoto.indexOf(photoUrl);
          bukaModalFoto();
        }
      }
    });
  });

  // Pelindung cadangan anti-ngebug jika jari meleset di sela-sela kelopak bunga
  flowerHead.addEventListener("click", (e) => {
    const isLetterClosed = letterInside ? !letterInside.classList.contains('show') : true;
    if (!isGlassShattered || !isLetterClosed) return;

    if (e.target === flowerHead) {
      e.stopPropagation();
      const centerPetal = document.querySelector(".flower-center");
      if (centerPetal) {
        const photoUrl = centerPetal.getAttribute("data-src");
        if (photoUrl) {
          indeksFotoAktif = arrayFoto.indexOf(photoUrl);
          bukaModalFoto();
        }
      }
    }
  });
}

// Fungsi memperbarui tampilan gambar & nomor indikator di dalam modal
function bukaModalFoto() {
  if (arrayFoto.length === 0 || !modal || !modalImg) return;
  
  modalImg.src = arrayFoto[indeksFotoAktif];
  if (photoCounter) {
    photoCounter.innerText = `${indeksFotoAktif + 1} / ${arrayFoto.length}`;
  }
  modal.classList.add("show-modal");
}

// 4. LOGIKA SLIDER TOMBOL NAVIGASI (KANAN & KIRI)
if (nextBtn) {
  nextBtn.addEventListener("click", (e) => {
    e.stopPropagation();
    indeksFotoAktif = (indeksFotoAktif + 1) % arrayFoto.length;
    bukaModalFoto();
  });
}

if (prevBtn) {
  prevBtn.addEventListener("click", (e) => {
    e.stopPropagation();
    indeksFotoAktif = (indeksFotoAktif - 1 + arrayFoto.length) % arrayFoto.length;
    bukaModalFoto();
  });
}

// 5. LOGIKA TUTUP FOTO POP-UP
if (modalCloseBtn) {
  modalCloseBtn.addEventListener("click", () => {
    if (modal) modal.classList.remove("show-modal");
  });
}

if (modal) {
  modal.addEventListener("click", (e) => {
    if (e.target === modal) {
      modal.classList.remove("show-modal");
    }
  });
}

// HUJAN KELOPAK GLOBAL
function startGlobalPetals() {
  if (globalRainInterval) return;
  globalRainInterval = setInterval(() => {
    const p = document.createElement('div');
    p.className = 'global-petal';
    const elements = ['🌸', '✨', '✧', '🎈'];
    p.innerText = elements[Math.floor(Math.random() * elements.length)];
    p.style.left = `${Math.random() * 100}vw`;
    p.style.fontSize = `${16 + Math.random() * 20}px`;
    p.style.opacity = `${0.6 + Math.random() * 0.4}`;
    
    const duration = 3 + Math.random() * 3;
    p.style.animationDuration = `${duration}s`;

    const gDx = (Math.random() - 0.5) * 250;
    const gDr = 360 + Math.random() * 720;
    p.style.setProperty('--g-dx', `${gDx}px`);
    p.style.setProperty('--g-dr', `${gDr}deg`);

    if (screenPetals) {
      screenPetals.appendChild(p);
      setTimeout(() => p.remove(), duration * 1000);
    }
  }, 150);
}

function stopGlobalPetals() {
  clearInterval(globalRainInterval);
  globalRainInterval = null;
}
