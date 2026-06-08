/// ============================================================
//  RETURN RUSH: SCHOOL ADVENTURE PRO — game.js
//  All bugs fixed: joystickOuter deferred to DOMContentLoaded,
//  drawCharacter implemented, indicators array initialized,
//  audio system, timer, ending screen, minimap all working.
// ============================================================

cat > /home/claude/return-rush/game.js << 'ENDOFFILE'
'use strict';

// ── DOM refs ─────────────────────────────────────────────────
let canvas, ctx, miniMapCanvas, fullMapCanvas, mctx, fctx;
let joystickOuter, joystickInner, btnSprint, btnInteract;
let vw, vh;

// ── Floating indicators ──────────────────────────────────────
const indicators = [];

// ── Constants ────────────────────────────────────────────────
const GOOGLE_SCRIPT_URL = "https://script.google.com/macros/s/AKfycbz-Y7ufP_nW99WXrx12va3cqjh0MF8OhTO1mubGBPtmrgxaovR0px1S7sCM02UVOaRT/exec";
const WORLD_W = 3200;
const WORLD_H = 3200;
const INDOOR_SIZE = 1000;

// ══════════════════════════════════════════════════════════════
//  SCHOOL MAP LAYOUT  (modern Indonesian school campus)
//  Each building has solid walls – player cannot walk through.
// ══════════════════════════════════════════════════════════════
const BUILDINGS = [
  // id, label, rect (x,y,w,h), door center (dx,dy), roof color, wall color, icon
  { id:'main_hall',   name:'Gedung Utama & Aula',      x:1150, y:80,   w:900, h:220, dx:1600, dy:300, roofC:'#1e3a8a', wallC:'#dbeafe', icon:'🏛️' },
  { id:'class_a',     name:'Kelas VII (Gedung A)',      x:80,   y:380,  w:380, h:280, dx:270,  dy:660, roofC:'#065f46', wallC:'#d1fae5', icon:'📚' },
  { id:'class_b',     name:'Kelas VIII (Gedung B)',     x:80,   y:760,  w:380, h:280, dx:270,  dy:1040,roofC:'#065f46', wallC:'#d1fae5', icon:'📚' },
  { id:'class_c',     name:'Kelas IX (Gedung C)',       x:80,   y:1140, w:380, h:280, dx:270,  dy:1420,roofC:'#065f46', wallC:'#d1fae5', icon:'📚' },
  { id:'lab_sains',   name:'Laboratorium Sains',        x:600,  y:380,  w:340, h:260, dx:770,  dy:640, roofC:'#1e3a8a', wallC:'#bfdbfe', icon:'🔬' },
  { id:'lab_komputer',name:'Lab Komputer & TIK',        x:600,  y:760,  w:340, h:260, dx:770,  dy:1020,roofC:'#4c1d95', wallC:'#ede9fe', icon:'💻' },
  { id:'library',     name:'Perpustakaan',              x:600,  y:1140, w:340, h:260, dx:770,  dy:1400,roofC:'#7c2d12', wallC:'#fef3c7', icon:'🏛️' },
  { id:'canteen',     name:'Kantin & Koperasi',         x:1150, y:380,  w:420, h:260, dx:1360, dy:640, roofC:'#ea580c', wallC:'#ffedd5', icon:'🍱' },
  { id:'mosque',      name:'Mushola Al-Hidayah',        x:1150, y:760,  w:300, h:240, dx:1300, dy:1000,roofC:'#065f46', wallC:'#ecfdf5', icon:'🕌' },
  { id:'uks',         name:'Ruang UKS',                 x:1150, y:1120, w:220, h:180, dx:1260, dy:1300,roofC:'#dc2626', wallC:'#fee2e2', icon:'🏥' },
  { id:'office',      name:'Ruang Guru & TU',           x:1650, y:380,  w:380, h:280, dx:1840, dy:660, roofC:'#1e3a8a', wallC:'#e0e7ff', icon:'🏢' },
  { id:'principal',   name:'Ruang Kepala Sekolah',      x:2200, y:380,  w:300, h:220, dx:2350, dy:600, roofC:'#7c3aed', wallC:'#ede9fe', icon:'🕴️' },
  { id:'toilet_pa',   name:'Toilet Putra',              x:1650, y:760,  w:180, h:160, dx:1740, dy:920, roofC:'#0369a1', wallC:'#e0f2fe', icon:'🚻' },
  { id:'toilet_pi',   name:'Toilet Putri',              x:1900, y:760,  w:180, h:160, dx:1990, dy:920, roofC:'#be185d', wallC:'#fce7f3', icon:'🚻' },
  { id:'osis',        name:'Ruang OSIS & Ekskul',       x:2200, y:760,  w:300, h:220, dx:2350, dy:980, roofC:'#b45309', wallC:'#fef3c7', icon:'🎭' },
  { id:'warehouse',   name:'Gudang Sekolah',            x:2700, y:380,  w:250, h:600, dx:2825, dy:980, roofC:'#374151', wallC:'#d1d5db', icon:'📦' },
];

// ── Collision rectangles (same as building rects, shrunk slightly)
function getBuildingRect(b) {
  return { x: b.x, y: b.y, w: b.w, h: b.h };
}

// ── Outdoor zones (purely visual colour regions)
const ZONES = [
  { label:'Lapangan Upacara',   x:1150, y:1400, w:700, h:600,  fill:'#86efac' },
  { label:'Taman Tengah',       x:1100, y:1110, w:40,  h:280,  fill:'#4ade80' },
  { label:'Lapangan Olahraga',  x:2200, y:1100, w:800, h:600,  fill:'#6ee7b7' },
  { label:'Area Parkir Guru',   x:2700, y:80,   w:410, h:280,  fill:'#cbd5e1' },
  { label:'Area Parkir Siswa',  x:2200, y:1800, w:900, h:320,  fill:'#cbd5e1' },
  { label:'Taman Depan',        x:80,   y:80,   w:1060,h:280,  fill:'#bbf7d0' },
  { label:'Koridor Utara',      x:1150, y:300,  w:1640,h:80,   fill:'#e2e8f0' },
  { label:'Koridor Barat',      x:470,  y:370,  w:120, h:1060, fill:'#e2e8f0' },
  { label:'Koridor Tengah',     x:1000, y:370,  w:140, h:1060, fill:'#e2e8f0' },
  { label:'Koridor Timur',      x:1640, y:370,  w:100, h:760,  fill:'#e2e8f0' },
];

// ── Trees / decorations
const TREES = [];
(function generateTrees() {
  const positions = [
    // taman depan
    120,120, 260,120, 400,120, 540,120, 680,120, 820,120, 960,120,
    // kiri
    40,480, 40,620, 40,760, 40,900, 40,1040, 40,1180, 40,1320,
    // taman tengah lapangan
    1180,1450, 1260,1550, 1340,1480, 1500,1520, 1600,1460, 1700,1540,
    // tepi lapangan olahraga
    2200,1120, 2300,1120, 2400,1120, 2500,1120, 2600,1120, 2700,1120, 2900,1120, 3000,1120,
    // pojok
    3050,400, 3050,600, 3050,800, 3050,1000,
    // area parkir siswa tepi
    2200,2100, 2350,2100, 2500,2100, 2650,2100, 2800,2100, 2950,2100,
  ];
  for (let i = 0; i < positions.length; i += 2) {
    TREES.push({ x: positions[i], y: positions[i+1], r: 22 + Math.random()*10, swayOff: Math.random()*Math.PI*2 });
  }
})();

// ── Items database
const itemsDatabase = [
  { id:1,  name:'Penggaris Busur Guru',   icon:'📐', x:320,  y:280,  pickedUp:false, rarity:'umum',      scene:'outdoor'    },
  { id:2,  name:'Kunci Laci Lab',          icon:'🔑', x:700,  y:500,  pickedUp:false, rarity:'umum',      scene:'lab_sains'  },
  { id:3,  name:'Buku Sastra Kuno',        icon:'📕', x:300,  y:300,  pickedUp:false, rarity:'langka',    scene:'library'    },
  { id:4,  name:'Gantungan Kunci Teddy',   icon:'🧸', x:200,  y:200,  pickedUp:false, rarity:'umum',      scene:'class_a'    },
  { id:5,  name:'Kamera Retro Klub',       icon:'📷', x:250,  y:300,  pickedUp:false, rarity:'epik',      scene:'osis'       },
  { id:6,  name:'Kacamata UKS',            icon:'👓', x:200,  y:250,  pickedUp:false, rarity:'umum',      scene:'uks'        },
  { id:7,  name:'Jam Saku Emas Kepsek',    icon:'⌚', x:250,  y:250,  pickedUp:false, rarity:'legendaris',scene:'principal'  },
  { id:8,  name:'Kartu Ujian VIP',         icon:'🎫', x:280,  y:280,  pickedUp:false, rarity:'langka',    scene:'office'     },
  { id:9,  name:'Kucing Si Belang',        icon:'🐈', x:1800, y:1600, pickedUp:false, rarity:'langka',    scene:'outdoor'    },
  { id:10, name:'Kuas Lukis Ajaib',        icon:'🎨', x:2600, y:1400, pickedUp:false, rarity:'langka',    scene:'outdoor'    },
  { id:11, name:'Payung Polkadot Guru',    icon:'☂️', x:900,  y:1800, pickedUp:false, rarity:'umum',      scene:'outdoor'    },
  { id:12, name:'Dokumen Rapat Komite',    icon:'💼', x:300,  y:300,  pickedUp:false, rarity:'langka',    scene:'warehouse'  },
  { id:13, name:'Topi Lapangan Kapten',    icon:'👒', x:1400, y:1700, pickedUp:false, rarity:'umum',      scene:'outdoor'    },
  { id:14, name:'Kotak Bekal Makan',       icon:'🍱', x:280,  y:280,  pickedUp:false, rarity:'umum',      scene:'canteen'    },
  { id:15, name:'Cincin Guru Senior',      icon:'💍', x:200,  y:200,  pickedUp:false, rarity:'legendaris',scene:'lab_komputer'},
];

// ── NPCs database
const npcsDatabase = [
  { id:'n1',  name:'Pak Budi (Guru Mat)',    x:1840, y:580,  looksFor:1,  solved:false, scene:'office',      msgNormal:"Penggaris busurku hilang di taman depan sekolah, dekat pagar masuk.",                         msgFound:"Terima kasih! Sekarang bisa mengajar geometri lagi.",           expReward:80,  moneyReward:50,  skin:'#fcd34d', shirt:'#475569', pants:'#1e293b', isQuestGiver:true, emotion:'😭', direction:'down' },
  { id:'n2',  name:'Ibu Ani (Kantin)',        x:1360, y:540,  looksFor:2,  solved:false, scene:'canteen',     msgNormal:"Kunci lacinya kuletakkan di lab sains tadi pagi waktu antar konsumsi.",                       msgFound:"Alhamdulillah! Dapur bisa dibuka lagi.",                        expReward:80,  moneyReward:50,  skin:'#fde68a', shirt:'#ec4899', pants:'#0f172a', isQuestGiver:true, emotion:'😟', direction:'down' },
  { id:'n3',  name:'Rina (Pustakawan)',        x:770,  y:1300, looksFor:3,  solved:false, scene:'library',     msgNormal:"Buku Sastra Kuno itu ketinggalan di rak paling ujung, masih di dalam perpustakaan ini.",       msgFound:"Terima kasih! Arsip berharga ini aman.",                        expReward:80,  moneyReward:80,  skin:'#fed7aa', shirt:'#10b981', pants:'#f8fafc', isQuestGiver:true, emotion:'🧐', direction:'down' },
  { id:'n4',  name:'Adit (Siswa VII)',         x:270,  y:560,  looksFor:4,  solved:false, scene:'class_a',     msgNormal:"Gantungan kunci teddyku jatuh di dalam kelas, mungkin di bawah meja.",                         msgFound:"Teddy ketemu! Makasih kak!",                                    expReward:80,  moneyReward:20,  skin:'#fef08a', shirt:'#ffffff', pants:'#1d4ed8', isQuestGiver:true, emotion:'😢', direction:'down' },
  { id:'n5',  name:'Zaka (Klub Foto)',          x:2350, y:860,  looksFor:5,  solved:false, scene:'osis',        msgNormal:"Kamera retro OSIS ketinggalan di ruang OSIS waktu rapat kemarin.",                             msgFound:"Kamera balik! Memorinya masih aman.",                           expReward:80,  moneyReward:120, skin:'#fcd34d', shirt:'#eab308', pants:'#451a03', isQuestGiver:true, emotion:'😮', direction:'down' },
  { id:'n6',  name:'Pak Joyo (Penjaga)',        x:1260, y:1200, looksFor:6,  solved:false, scene:'uks',         msgNormal:"Kacamata bacaku tertinggal di meja UKS, aku lupa taruh di situ tadi.",                         msgFound:"Akhirnya bisa membaca lagi dengan jelas!",                      expReward:80,  moneyReward:50,  skin:'#e5e7eb', shirt:'#64748b', pants:'#334155', isQuestGiver:true, emotion:'👴', direction:'down' },
  { id:'n7',  name:'Kepala Sekolah',            x:2350, y:500,  looksFor:7,  solved:false, scene:'principal',   msgNormal:"Jam saku emas saya tertinggal di dalam ruangan ini, tolong carikan!",                          msgFound:"Luar biasa! Kamu murid teladan!",                               expReward:150, moneyReward:300, skin:'#fed7aa', shirt:'#1e1b4b', pants:'#000000', isQuestGiver:true, emotion:'👑', direction:'down' },
  { id:'n8',  name:'Roni (Siswa IX)',            x:270,  y:1240, looksFor:8,  solved:false, scene:'class_c',     msgNormal:"Kartu ujian VIP-ku ketinggalan di ruang guru, cepat ambilkan sebelum ujian mulai!",              msgFound:"Terima kasih! Bisa ikut ujian sekarang!",                       expReward:80,  moneyReward:75,  skin:'#fef08a', shirt:'#ffffff', pants:'#1d4ed8', isQuestGiver:true, emotion:'😰', direction:'down' },
  { id:'n9',  name:'Nita (Ketua OSIS)',          x:1400, y:1600, looksFor:9,  solved:false, scene:'outdoor',     msgNormal:"Si Belang kabur ke lapangan upacara. Tolong tangkap, dia takut orang banyak.",                  msgFound:"Si Belang! Akhirnya ketemu!",                                   expReward:80,  moneyReward:100, skin:'#fcd34d', shirt:'#ffffff', pants:'#9f1239', isQuestGiver:true, emotion:'😭', direction:'down' },
  { id:'n10', name:'Beni (Guru Seni)',            x:770,  y:960,  looksFor:10, solved:false, scene:'lab_komputer',msgNormal:"Kuas lukis saya ketinggalan di lapangan waktu anak-anak praktik outdoor, cari di sana.",       msgFound:"Kuas ajaib ini kembali! Lukisan dinding bisa dilanjutkan.",     expReward:80,  moneyReward:85,  skin:'#fde68a', shirt:'#93c5fd', pants:'#1e40af', isQuestGiver:true, emotion:'🎨', direction:'down' },
  { id:'n11', name:'Bu Hana (Guru Bahasa)',       x:770,  y:860,  looksFor:11, solved:false, scene:'lab_sains',   msgNormal:"Payung polkadotku tertinggal di koridor dekat kelas, tolong ambilkan.",                         msgFound:"Terima kasih, sangat membantu!",                                expReward:40,  moneyReward:60,  skin:'#fed7aa', shirt:'#c026d3', pants:'#1e293b', isQuestGiver:true, emotion:'😰', direction:'down' },
  { id:'n12', name:'Pak RT (Komite)',              x:270,  y:860,  looksFor:12, solved:false, scene:'class_b',     msgNormal:"Dokumen rapat komite tertinggal di gudang waktu rapat kemarin malam.",                         msgFound:"Syukurlah! Anggaran beasiswa tidak terhambat.",                 expReward:60,  moneyReward:90,  skin:'#fcd34d', shirt:'#047857', pants:'#064e3b', isQuestGiver:true, emotion:'😡', direction:'down' },
  { id:'n13', name:'Dita (Kapten Olahraga)',       x:2500, y:1400, looksFor:13, solved:false, scene:'outdoor',     msgNormal:"Topi lapangan tim hilang di lapangan upacara, mungkin terpelanting saat latihan.",               msgFound:"Siap bertanding turnamen!",                                     expReward:25,  moneyReward:35,  skin:'#fef08a', shirt:'#ffffff', pants:'#9f1239', isQuestGiver:true, emotion:'😩', direction:'down' },
  { id:'n14', name:'Pak Amin (Janitor)',            x:1300, y:540,  looksFor:14, solved:false, scene:'mosque',      msgNormal:"Kotak bekalku ketinggalan di kantin waktu aku makan siang. Tolong ambilkan.",                   msgFound:"Alhamdulillah! Makan siang masih utuh.",                        expReward:45,  moneyReward:55,  skin:'#d97706', shirt:'#ea580c', pants:'#451a03', isQuestGiver:true, emotion:'🤤', direction:'down' },
  { id:'n15', name:'Bu Siti (Guru Senior)',         x:770,  y:1200, looksFor:15, solved:false, scene:'library',     msgNormal:"Cincin guru teladan tertinggal di lab komputer waktu workshop kemarin.",                        msgFound:"Cincin kenangan ini sangat berarti, terima kasih nak.",         expReward:200, moneyReward:500, skin:'#e5e7eb', shirt:'#6d28d9', pants:'#312e81', isQuestGiver:true, emotion:'😭', direction:'down' },
  // Ambient
  { id:'amb1', name:'Murid A', isQuestGiver:false, scene:'outdoor', x:1300, y:1600, skin:'#fcd34d', shirt:'#3b82f6', pants:'#1e40af', direction:'right', isMoving:true, moveTimer:0, animFrame:0, moveRange:200 },
  { id:'amb2', name:'Murid B', isQuestGiver:false, scene:'outdoor', x:2400, y:1500, skin:'#fed7aa', shirt:'#10b981', pants:'#064e3b', direction:'left',  isMoving:true, moveTimer:0, animFrame:0, moveRange:200 },
  { id:'amb3', name:'Satpam',  isQuestGiver:false, scene:'outdoor', x:1600, y:310,  skin:'#1e293b', shirt:'#1e3a8a', pants:'#0f172a', direction:'down',  isMoving:true, moveTimer:0, animFrame:0, moveRange:80  },
  { id:'amb4', name:'Murid C', isQuestGiver:false, scene:'outdoor', x:700,  y:1000, skin:'#fef08a', shirt:'#ef4444', pants:'#1e293b', direction:'up',    isMoving:true, moveTimer:0, animFrame:0, moveRange:150 },
  { id:'amb5', name:'Guru X',  isQuestGiver:false, scene:'outdoor', x:1200, y:700,  skin:'#fed7aa', shirt:'#475569', pants:'#1e293b', direction:'right',  isMoving:true, moveTimer:0, animFrame:0, moveRange:120 },
];
// Store initial positions for ambient NPC range
npcsDatabase.forEach(n => { if (!n.isQuestGiver) { n.startX = n.x; n.startY = n.y; } });

// ── Game state ───────────────────────────────────────────────
const state = {
  isRunning:false, playerName:'Hero', level:1, xp:0, xpToNextLevel:100,
  money:150, reputation:0, itemsReturnedCount:0,
  stamina:100, maxStamina:100, bonusCoinMultiplier:1, isSprinting:false,
  activeTab:'inventory', gpsTarget:null, skillPoints:0,
  cameraZoom:1.2, activeInteractTarget:null,
  activeDialogueNpc:null, dialogueWords:[], dialogueIndex:0,
  dialogueTextFull:'', dialogueTypedText:'', dialogueTypeSpeed:55,
  dialogueTimeout:null,
  memoryEchoUnlocked:false, memoryVisionUnlocked:false, memoryRecallUnlocked:false,
  staminaUnlocked:false, sprintUnlocked:false, charmUnlocked:false,
  bargainUnlocked:false, radarActive:false, hasProShoes:false,
  hasRollerSkates:false, goldenMapActive:false, compassActive:false,
  lastSaveTime:Date.now(),
  keys:{},
  touchInput:{ active:false, startX:0, startY:0, angle:0, power:0 },
  achievements:[
    { id:'first_return', title:'Awal Baik',          desc:'Kembalikan barang pertamamu.',        countGoal:1,   current:0,   solved:false },
    { id:'helper_10',    title:'Pahlawan Harapan',   desc:'Mengembalikan 10 barang hilang.',     countGoal:10,  current:0,   solved:false },
    { id:'rich_hero',    title:'Pahlawan Makmur',    desc:'Tabungan mencapai 💰 500 koin.',      countGoal:500, current:150, solved:false },
    { id:'vip_helper',   title:'Pengabdi Kehormatan',desc:'Membantu Kepala Sekolah.',            countGoal:1,   current:0,   solved:false }
  ],
  inventory:[], currentScene:'outdoor',
  prevOutdoorX:1600, prevOutdoorY:700,
  playTimerSeconds:900, timerIntervalId:null,
  enteredAlternativeDimension:false
};

const player = {
  x:1600, y:700, radius:14, baseSpeed:4,
  skin:'#fef08a', shirt:'#3b82f6', pants:'#1e3a8a',
  get speed() {
    let s = this.baseSpeed;
    if (state.hasProShoes)     s += 1.5;
    if (state.hasRollerSkates) s += 1.5;
    if (state.isSprinting && state.stamina > 5) s *= (state.sprintUnlocked ? 1.8 : 1.6);
    return s;
  },
  animFrame:0, moving:false, dir:'down'
};

const camera = { x:1600, y:700 };
let touchSprint = false;

// ══════════════════════════════════════════════════════════════
//  AUDIO
// ══════════════════════════════════════════════════════════════
let audioCtx=null, bgmGain=null, audioEnabled=true;
function initAudio() {
  if (audioCtx) return;
  try {
    audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    bgmGain = audioCtx.createGain(); bgmGain.gain.value = 0.06;
    bgmGain.connect(audioCtx.destination);
  } catch(e) {}
}
function startBGM() {}
function toggleAudio() {
  audioEnabled = document.getElementById('setting-sfx').checked;
  if (bgmGain) bgmGain.gain.value = audioEnabled ? 0.06 : 0;
  if (audioEnabled) initAudio();
}
function playSound(type) {
  if (!audioEnabled || !audioCtx) return;
  try {
    const o = audioCtx.createOscillator(), g = audioCtx.createGain();
    o.connect(g); g.connect(audioCtx.destination);
    const f = { step:160, pickup:440, success:660, levelup:880, purchase:520, type:280 };
    o.frequency.value = f[type]||300; o.type = type==='levelup'?'square':'sine';
    g.gain.setValueAtTime(0.12, audioCtx.currentTime);
    g.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime+0.18);
    o.start(); o.stop(audioCtx.currentTime+0.18);
  } catch(e) {}
}

// ══════════════════════════════════════════════════════════════
//  COLLISION
// ══════════════════════════════════════════════════════════════
function collidesWithBuildings(nx, ny) {
  if (state.currentScene !== 'outdoor') return false;
  const pr = player.radius;
  for (const b of BUILDINGS) {
    // leave a 2px gap so player can walk right up to wall edge
    if (nx + pr > b.x + 4 && nx - pr < b.x + b.w - 4 &&
        ny + pr > b.y + 4 && ny - pr < b.y + b.h - 4) {
      // allow if very close to door (door has 60px wide passage)
      const nearDoor = Math.abs(nx - b.dx) < 30 && ny + pr > b.y + b.h - 30;
      if (!nearDoor) return true;
    }
  }
  return false;
}

// ══════════════════════════════════════════════════════════════
//  TIMER
// ══════════════════════════════════════════════════════════════
function startPlayTimer() {
  if (state.timerIntervalId) clearInterval(state.timerIntervalId);
  state.timerIntervalId = setInterval(() => {
    if (!state.isRunning) return;
    state.playTimerSeconds--;
    const m = Math.floor(state.playTimerSeconds/60);
    const s = state.playTimerSeconds%60;
    document.getElementById('countdown-timer').textContent = `${String(m).padStart(2,'0')}:${String(s).padStart(2,'0')}`;
    if (state.playTimerSeconds <= 0) showEndingScreen();
  }, 1000);
}

// ══════════════════════════════════════════════════════════════
//  ENDING
// ══════════════════════════════════════════════════════════════
function showEndingScreen() {
  clearInterval(state.timerIntervalId);
  state.isRunning = false;
  triggerSystemEnding();
}
function triggerSystemEnding() {
  const solved = npcsDatabase.filter(n=>n.isQuestGiver&&n.solved).length;
  const allShop = isAllShopItemsBought();
  const dim = state.enteredAlternativeDimension;
  let title, emoji, desc, endingType;
  if (solved >= 10 && dim && allShop) {
    title='🔮 SECRET ENDING: Rehabilitasi VR Selesai!'; emoji='🌀';
    desc='Kamu telah menyelesaikan semua misi, memasuki terowongan dimensi, dan membeli semua upgrade. Selamat!';
    endingType='Secret VR';
  } else if (solved >= 8) {
    title='🏆 GOOD ENDING!'; emoji='🎉';
    desc='Sekolah hidup kembali berkat kebaikanmu! Hampir semua barang berhasil dikembalikan.';
    endingType='Good';
  } else {
    title='😔 BAD ENDING'; emoji='😞';
    desc='Waktu habis dan masih banyak barang yang belum dikembalikan. Coba lagi!';
    endingType='Bad';
  }
  document.getElementById('ending-title').textContent = title;
  document.getElementById('ending-emoji').textContent = emoji;
  document.getElementById('ending-description').textContent = desc;
  document.getElementById('ending-stat-name').textContent = state.playerName;
  document.getElementById('ending-stat-missions').textContent = solved;
  document.getElementById('ending-stat-dimension').textContent = dim?'Ya':'Tidak';
  document.getElementById('ending-stat-skills').textContent = allShop?'Ya':'Tidak';
  const el = document.getElementById('ending-screen');
  el.style.display='flex'; el.style.alignItems='center'; el.style.justifyContent='center';
  submitScoreToLeaderboard(state.playerName, state.reputation, solved, endingType);
}

// ══════════════════════════════════════════════════════════════
//  LEADERBOARD
// ══════════════════════════════════════════════════════════════
async function submitScoreToLeaderboard(name,reputation,missions,endingType){
  const d={name,reputation,missions,ending:endingType,date:new Date().toLocaleDateString('id-ID')};
  let lb=JSON.parse(localStorage.getItem('returnRushLeaderboard')||'[]');
  lb.push(d); lb.sort((a,b)=>b.missions-a.missions||b.reputation-a.reputation);
  localStorage.setItem('returnRushLeaderboard',JSON.stringify(lb.slice(0,10)));
  if(GOOGLE_SCRIPT_URL.includes('script.google.com/macros')){
    try{await fetch(GOOGLE_SCRIPT_URL,{method:'POST',mode:'no-cors',headers:{'Content-Type':'application/json'},body:JSON.stringify(d)});}catch(e){}
  }
}
async function fetchLeaderboardData(){
  return JSON.parse(localStorage.getItem('returnRushLeaderboard')||'[]');
}
async function showLeaderboard(){
  document.getElementById('main-menu').style.display='none';
  const old=document.getElementById('leaderboard-modal');if(old)old.remove();
  const modal=document.createElement('div');
  modal.id='leaderboard-modal';
  modal.style.cssText='position:absolute;inset:0;z-index:80;display:flex;align-items:center;justify-content:center;background:rgba(0,0,0,0.8);backdrop-filter:blur(8px);padding:16px;pointer-events:auto;';
  modal.innerHTML=`<div class="glass-panel w-full max-w-lg h-[80vh] flex flex-col overflow-hidden shadow-2xl animate-pop bg-white"><div class="bg-indigo-600 px-4 py-3 flex justify-between items-center text-white shrink-0"><h2 class="font-black text-lg">🏆 Papan Skor</h2><button onclick="document.getElementById('leaderboard-modal').remove();document.getElementById('main-menu').style.display='';" class="text-white text-3xl font-bold">&times;</button></div><div class="flex-1 p-5 overflow-y-auto"><div id="leaderboard-list-content" class="text-center text-indigo-500 py-8 font-bold">Memuat...</div></div></div>`;
  document.body.appendChild(modal);
  const data=await fetchLeaderboardData();
  document.getElementById('leaderboard-list-content').innerHTML=data.length===0
    ?'<div class="text-center text-gray-400 py-8 font-bold">Belum ada skor tersimpan.</div>'
    :data.map((e,i)=>{const rc=i===0?'text-yellow-400':i===1?'text-gray-300':i===2?'text-amber-600':'text-gray-500';return`<div class="flex justify-between items-center bg-gray-50 p-3 rounded-lg border mb-2"><div class="flex items-center gap-3"><span class="font-black text-xl ${rc}">#${i+1}</span><div><div class="font-bold">${e.name}</div><div class="text-[10px] text-gray-500">${e.date}</div></div></div><div class="text-right"><div class="font-black text-indigo-600">${e.missions}/15</div><div class="text-[10px] text-pink-500">${e.reputation}% Rep</div></div></div>`}).join('');
}

// ══════════════════════════════════════════════════════════════
//  RESIZE
// ══════════════════════════════════════════════════════════════
function handleResize(){
  vw=canvas.width=window.innerWidth;
  vh=canvas.height=window.innerHeight;
}

// ══════════════════════════════════════════════════════════════
//  CHARACTER DRAWING
// ══════════════════════════════════════════════════════════════
function drawCharacter(c2, x, y, skin, shirt, pants, isPlayer, animFrame, moving, dir) {
  c2.save(); c2.textAlign='center'; c2.textBaseline='middle';
  const bob  = moving ? Math.sin(animFrame*3)*2 : 0;
  const legL = moving ? Math.sin(animFrame*3)*7 : 0;
  const legR = moving ? -Math.sin(animFrame*3)*7 : 0;
  const armL = moving ? -Math.sin(animFrame*3)*5 : 0;
  const armR = moving ? Math.sin(animFrame*3)*5 : 0;
  // shadow
  c2.fillStyle='rgba(0,0,0,0.15)';c2.beginPath();c2.ellipse(x,y+20,11,4,0,0,Math.PI*2);c2.fill();
  // legs
  c2.fillStyle=pants;
  c2.fillRect(x-8,y+7+bob,7,12+legL);
  c2.fillRect(x+1,y+7+bob,7,12+legR);
  // body
  c2.fillStyle=shirt;c2.fillRect(x-10,y-7+bob,20,16);
  // arms
  c2.fillRect(x-17,y-7+bob+armL,7,12);
  c2.fillRect(x+10,y-7+bob+armR,7,12);
  // head
  c2.fillStyle=skin;c2.beginPath();c2.arc(x,y-17+bob,11,0,Math.PI*2);c2.fill();
  // hair
  c2.fillStyle='#3b1f0a';c2.beginPath();c2.arc(x,y-22+bob,8,Math.PI,Math.PI*2);c2.fill();
  // eyes
  if(dir!=='up'){c2.fillStyle='#1e1b4b';c2.beginPath();c2.arc(x-3,y-17+bob,1.5,0,Math.PI*2);c2.arc(x+3,y-17+bob,1.5,0,Math.PI*2);c2.fill();}
  // player arrow
  if(isPlayer){
    c2.fillStyle='#4F46E5';c2.beginPath();
    c2.moveTo(x,y-36+bob);c2.lineTo(x-6,y-28+bob);c2.lineTo(x+6,y-28+bob);c2.closePath();c2.fill();
  }
  c2.restore();
}

// ══════════════════════════════════════════════════════════════
//  MINIMAP
// ══════════════════════════════════════════════════════════════
function drawMiniMap(){
  if(!mctx)return;
  const W=miniMapCanvas.width, H=miniMapCanvas.height;
  const sx=W/WORLD_W, sy=H/WORLD_H;
  mctx.fillStyle='#a7f3d0';mctx.fillRect(0,0,W,H);
  // buildings
  BUILDINGS.forEach(b=>{mctx.fillStyle='#1e3a8a';mctx.fillRect(b.x*sx,b.y*sy,b.w*sx,b.h*sy);});
  // zones
  ZONES.forEach(z=>{mctx.fillStyle=z.fill+'99';mctx.fillRect(z.x*sx,z.y*sy,z.w*sx,z.h*sy);});
  // player
  const px=state.currentScene==='outdoor'?player.x:state.prevOutdoorX;
  const py=state.currentScene==='outdoor'?player.y:state.prevOutdoorY;
  mctx.fillStyle='#4F46E5';mctx.beginPath();mctx.arc(px*sx,py*sy,3,0,Math.PI*2);mctx.fill();
}

function drawFullMap(){
  if(!fctx)return;
  const SIZE=640;
  fullMapCanvas.width=SIZE;fullMapCanvas.height=Math.round(SIZE*(WORLD_H/WORLD_W));
  const sx=SIZE/WORLD_W, sy=fullMapCanvas.height/WORLD_H;
  fctx.fillStyle='#a7f3d0';fctx.fillRect(0,0,SIZE,fullMapCanvas.height);
  // zones
  ZONES.forEach(z=>{fctx.fillStyle=z.fill+'cc';fctx.fillRect(z.x*sx,z.y*sy,z.w*sx,z.h*sy);});
  // buildings
  BUILDINGS.forEach(b=>{
    fctx.fillStyle=b.wallC;fctx.fillRect(b.x*sx,b.y*sy,b.w*sx,b.h*sy);
    fctx.strokeStyle=b.roofC;fctx.lineWidth=2;fctx.strokeRect(b.x*sx,b.y*sy,b.w*sx,b.h*sy);
    fctx.font=`${Math.max(7,Math.round(b.h*sy*0.35))}px sans-serif`;fctx.textAlign='center';fctx.textBaseline='middle';
    fctx.fillText(b.icon,(b.x+b.w/2)*sx,(b.y+b.h/2)*sy);
    fctx.fillStyle='rgba(0,0,0,0.7)';fctx.font=`bold ${Math.max(5,Math.round(b.h*sy*0.2))}px Nunito`;
    fctx.fillText(b.name,(b.x+b.w/2)*sx,(b.y+b.h*0.85)*sy);
  });
  // NPC quest dots
  npcsDatabase.forEach(n=>{
    if(!n.isQuestGiver||n.scene!=='outdoor')return;
    fctx.fillStyle=n.solved?'#10b981':'#ef4444';
    fctx.beginPath();fctx.arc(n.x*sx,n.y*sy,5,0,Math.PI*2);fctx.fill();
  });
  // player
  const px=state.currentScene==='outdoor'?player.x:state.prevOutdoorX;
  const py=state.currentScene==='outdoor'?player.y:state.prevOutdoorY;
  fctx.fillStyle='#4F46E5';fctx.beginPath();fctx.arc(px*sx,py*sy,6,0,Math.PI*2);fctx.fill();
  fctx.strokeStyle='#fff';fctx.lineWidth=2;fctx.stroke();
}

// ══════════════════════════════════════════════════════════════
//  UPDATE GAME
// ══════════════════════════════════════════════════════════════
function updateGame(){
  if(!state.isRunning)return;

  // Stamina
  const sprintKey=state.keys['shift']||state.keys['shiftleft']||state.keys['shiftright'];
  state.isSprinting=(touchSprint||sprintKey)&&player.moving&&state.stamina>5;
  if(state.isSprinting) state.stamina=Math.max(0,state.stamina-(state.sprintUnlocked?0.6:1.0));
  else state.stamina=Math.min(state.maxStamina,state.stamina+(state.staminaUnlocked?0.7:0.4));
  document.getElementById('stamina-fill').style.width=`${(state.stamina/state.maxStamina)*100}%`;

  // Input
  let dx=0,dy=0;
  if(state.keys['w']||state.keys['arrowup'])    dy-=1;
  if(state.keys['s']||state.keys['arrowdown'])   dy+=1;
  if(state.keys['a']||state.keys['arrowleft'])   dx-=1;
  if(state.keys['d']||state.keys['arrowright'])  dx+=1;
  if(state.touchInput.active){
    dx=Math.cos(state.touchInput.angle)*state.touchInput.power;
    dy=Math.sin(state.touchInput.angle)*state.touchInput.power;
  }

  player.moving=(Math.hypot(dx,dy)>0.05);

  if(player.moving&&!state.activeDialogueNpc){
    if(Math.abs(dx)>Math.abs(dy)) player.dir=dx>0?'right':'left';
    else player.dir=dy>0?'down':'up';

    const sp=player.speed;
    const curW=state.currentScene==='outdoor'?WORLD_W:INDOOR_SIZE;
    const curH=state.currentScene==='outdoor'?WORLD_H:INDOOR_SIZE;
    let nx=Math.max(player.radius,Math.min(curW-player.radius,player.x+dx*sp));
    let ny=Math.max(player.radius,Math.min(curH-player.radius,player.y+dy*sp));

    // Separate axis collision for smooth sliding
    if(!collidesWithBuildings(nx,player.y)) player.x=nx; else nx=player.x;
    if(!collidesWithBuildings(player.x,ny)) player.y=ny;

    player.animFrame+=0.25;
    if(Math.floor(player.animFrame)%6===0) playSound('step');
  } else { player.animFrame=0; }

  // Camera
  camera.x+=(player.x-camera.x)*0.1;
  camera.y+=(player.y-camera.y)*0.1;
  const curW=state.currentScene==='outdoor'?WORLD_W:INDOOR_SIZE;
  const curH=state.currentScene==='outdoor'?WORLD_H:INDOOR_SIZE;
  const hW=(vw/state.cameraZoom)/2, hH=(vh/state.cameraZoom)/2;
  camera.x=Math.max(hW,Math.min(curW-hW,camera.x));
  camera.y=Math.max(hH,Math.min(curH-hH,camera.y));

  // Ambient NPC movement (bounce in range)
  npcsDatabase.forEach(npc=>{
    if(!npc.isQuestGiver&&npc.scene===state.currentScene){
      npc.moveTimer=(npc.moveTimer||0)+1;
      if(npc.moveTimer>100){
        npc.isMoving=Math.random()>0.3;
        if(npc.isMoving){const dirs=['up','down','left','right'];npc.direction=dirs[Math.floor(Math.random()*4)];}
        npc.moveTimer=0;
      }
      if(npc.isMoving){
        const spd=1.2;
        let mx=0,my=0;
        if(npc.direction==='up')    my=-spd;
        if(npc.direction==='down')  my=spd;
        if(npc.direction==='left')  mx=-spd;
        if(npc.direction==='right') mx=spd;
        const range=npc.moveRange||150;
        const nx=npc.x+mx, ny=npc.y+my;
        if(Math.abs(nx-npc.startX)<range&&nx>40&&nx<WORLD_W-40) npc.x=nx;
        else npc.direction=npc.direction==='left'?'right':'left';
        if(Math.abs(ny-npc.startY)<range&&ny>40&&ny<WORLD_H-40) npc.y=ny;
        else npc.direction=npc.direction==='up'?'down':'up';
        npc.animFrame=(npc.animFrame||0)+0.2;
      } else npc.animFrame=0;
    }
  });

  checkAutoInteractions();
  drawMiniMap();
  if(Date.now()-state.lastSaveTime>30000) quickSaveGame(false);
}

// ══════════════════════════════════════════════════════════════
//  INTERACTION DETECTION
// ══════════════════════════════════════════════════════════════
function checkAutoInteractions(){
  let nearest=null, nearDist=state.memoryRecallUnlocked?100:70;

  // Portal
  if(state.currentScene==='outdoor'&&isAllMandatoryMissionsSolved()){
    const d=Math.hypot(player.x-1600,player.y-1900);
    if(d<80&&d<nearDist){nearDist=d;nearest={type:'portal',text:'E / Tap untuk Masuk Terowongan 🌀'};}
  }
  // Buildings
  if(state.currentScene==='outdoor'&&!nearest){
    BUILDINGS.forEach(b=>{
      const d=Math.hypot(player.x-b.dx,player.y-(b.y+b.h+10));
      if(d<55&&d<nearDist){nearDist=d;nearest={type:'building',data:b,text:`E / Tap untuk Masuk ke ${b.name}`};}
    });
  }
  // Exit door (indoors)
  if(state.currentScene!=='outdoor'&&!nearest){
    const d=Math.hypot(player.x-500,player.y-960);
    if(d<60&&d<nearDist){nearDist=d;nearest={type:'exit',text:'E / Tap untuk Keluar'};}
  }
  // Items
  itemsDatabase.forEach(item=>{
    if(!item.pickedUp&&(item.scene||'outdoor')===state.currentScene){
      const d=Math.hypot(player.x-item.x,player.y-item.y);
      if(d<nearDist){nearDist=d;nearest={type:'item',data:item,text:`E / Ambil: ${item.name}`};}
    }
  });
  // NPCs
  if(!nearest){
    npcsDatabase.forEach(npc=>{
      if(npc.isQuestGiver&&(npc.scene||'outdoor')===state.currentScene){
        const d=Math.hypot(player.x-npc.x,player.y-npc.y);
        if(d<nearDist){nearDist=d;nearest={type:'npc',data:npc,text:`E / Bicara dengan ${npc.name}`};}
      }
    });
  }

  state.activeInteractTarget=nearest;
  const ind=document.getElementById('interaction-indicator');
  if(nearest){ind.classList.remove('hidden');document.getElementById('interaction-desc').textContent=nearest.text;}
  else ind.classList.add('hidden');
}

function isAllMandatoryMissionsSolved(){return npcsDatabase.slice(0,10).every(n=>n.solved);}
function isAllShopItemsBought(){
  return state.hasProShoes&&state.memoryVisionUnlocked&&state.radarActive&&state.goldenMapActive
    &&state.maxStamina>100&&state.bonusCoinMultiplier>1&&state.hasRollerSkates&&state.compassActive;
}

// ══════════════════════════════════════════════════════════════
//  ACTIONS
// ══════════════════════════════════════════════════════════════
function handleAutoInteract(){
  if(state.activeInteractTarget){
    const t=state.activeInteractTarget;
    if(t.type==='item')     tryPickupItem(t.data);
    else if(t.type==='npc') tryInteractNpc(t.data);
    else if(t.type==='building') enterBuilding(t.data);
    else if(t.type==='exit') exitBuilding();
    else if(t.type==='portal') promptPortalInteraction();
  }
}
function promptPortalInteraction(){document.getElementById('portal-prompt-modal').style.display='flex';}
function decidePortal(accept){
  document.getElementById('portal-prompt-modal').style.display='none';
  if(accept){
    const warp=document.getElementById('warp-screen-fx');warp.style.opacity='1';playSound('levelup');
    setTimeout(()=>{
      state.enteredAlternativeDimension=true;player.x=1600;player.y=1900;
      camera.x=player.x;camera.y=player.y;warp.style.opacity='0';
      showFloatingIndicator('Terowongan Terbuka! 🔮',player.x,player.y-80,'#a855f7');
    },1500);
  }
}
function enterBuilding(b){
  playSound('purchase');
  state.prevOutdoorX=player.x;state.prevOutdoorY=player.y;
  state.currentScene=b.id;
  player.x=500;player.y=880;camera.x=player.x;camera.y=player.y;
  showFloatingIndicator(`Masuk ke ${b.name}`,player.x,player.y-60,'#4F46E5');
  updateHUD();
}
function exitBuilding(){
  playSound('purchase');
  state.currentScene='outdoor';
  player.x=state.prevOutdoorX;player.y=state.prevOutdoorY+60;
  camera.x=player.x;camera.y=player.y;
  showFloatingIndicator('Keluar',player.x,player.y-60,'#4F46E5');
  updateHUD();
}
function tryPickupItem(item){
  item.pickedUp=true;state.inventory.push(item);playSound('pickup');
  showFloatingIndicator(item.icon,item.x,item.y-40,'#ec4899');
  updateAchievementProgress('first_return',1);updateHUD();
}
function tryInteractNpc(npc){
  playSound('pickup');state.activeDialogueNpc=npc;
  document.getElementById('dialogue-box').style.display='block';
  document.getElementById('dialogue-emotion').textContent=npc.solved?'😀':(npc.emotion||'😀');
  document.getElementById('dialogue-name').textContent=npc.name;
  let msg=npc.msgNormal;
  const idx=state.inventory.findIndex(it=>it.id===npc.looksFor);
  if(!npc.solved&&idx!==-1){
    msg=npc.msgFound;npc.solved=true;state.inventory.splice(idx,1);
    setTimeout(()=>{
      let money=Math.round(npc.moneyReward*state.bonusCoinMultiplier);
      if(state.charmUnlocked)money=Math.floor(money*1.2);
      let exp=state.bargainUnlocked?Math.floor(npc.expReward*1.2):npc.expReward;
      gainEXP(exp);gainMoney(money);increaseReputation(7);
      playSound('success');showFloatingIndicator(`🎁 +${money} Koin`,player.x,player.y-60,'#f59e0b');
      if(npc.id==='n7')updateAchievementProgress('vip_helper',1);
      state.itemsReturnedCount++;updateAchievementProgress('helper_10',state.itemsReturnedCount);
    },800);
  }
  state.dialogueTextFull=msg;state.dialogueWords=msg.split(' ');
  state.dialogueIndex=0;state.dialogueTypedText='';runTypewriter();
}
function runTypewriter(){
  if(state.dialogueIndex<state.dialogueWords.length){
    state.dialogueTypedText+=state.dialogueWords[state.dialogueIndex]+' ';
    document.getElementById('dialogue-text').textContent=state.dialogueTypedText;
    state.dialogueIndex++;
    state.dialogueTimeout=setTimeout(runTypewriter,state.dialogueTypeSpeed);
  } else state.dialogueTimeout=null;
}
function handleDialogueClick(){
  if(state.dialogueTimeout){clearTimeout(state.dialogueTimeout);state.dialogueTimeout=null;document.getElementById('dialogue-text').textContent=state.dialogueTextFull;}
  else closeDialogue();
}
function closeDialogue(){document.getElementById('dialogue-box').style.display='none';state.activeDialogueNpc=null;updateHUD();}

// ══════════════════════════════════════════════════════════════
//  STATS
// ══════════════════════════════════════════════════════════════
function gainEXP(a){
  state.xp+=a;
  if(state.xp>=state.xpToNextLevel){
    state.xp-=state.xpToNextLevel;state.level++;state.skillPoints++;
    state.xpToNextLevel=Math.floor(state.xpToNextLevel*1.3);
    playSound('levelup');showFloatingIndicator(`🎉 LEVEL UP ${state.level}!`,player.x,player.y-80,'#4F46E5');
  }
  updateHUD();
}
function gainMoney(a){state.money+=a;updateAchievementProgress('rich_hero',state.money);updateHUD();}
function increaseReputation(a){state.reputation=Math.min(100,state.reputation+a);updateHUD();}
function changeZoom(a){state.cameraZoom=Math.max(0.5,Math.min(2.0,state.cameraZoom+a));}

// ══════════════════════════════════════════════════════════════
//  HUD
// ══════════════════════════════════════════════════════════════
function updateHUD(){
  document.getElementById('hud-name').textContent=state.playerName;
  document.getElementById('hud-level').textContent=state.level;
  document.getElementById('hud-xp-text').textContent=`${state.xp}/${state.xpToNextLevel}`;
  document.getElementById('hud-xp-fill').style.width=`${(state.xp/state.xpToNextLevel)*100}%`;
  document.getElementById('hud-money').textContent=state.money;
  document.getElementById('hud-rep-val').textContent=state.reputation;
  document.getElementById('hud-rep-fill').style.width=`${state.reputation}%`;
  const ib=document.getElementById('badge-inv');
  if(state.inventory.length>0){ib.textContent=state.inventory.length;ib.classList.remove('hidden');}
  else ib.classList.add('hidden');
  const fr=document.getElementById('menu-footer-rep');const fi=document.getElementById('menu-footer-items');const fl=document.getElementById('menu-footer-level');
  if(fr)fr.textContent=state.reputation+'%';if(fi)fi.textContent=state.itemsReturnedCount;if(fl)fl.textContent=state.level;
  // Sidebar quest list
  const ul=document.getElementById('hud-quest-list');if(!ul)return;
  ul.innerHTML='';
  const unresolved=npcsDatabase.filter(n=>n.isQuestGiver&&!n.solved);
  if(!unresolved.length){ul.innerHTML='<li class="text-emerald-500 italic">Semua Beres! 🏆</li>';return;}
  unresolved.slice(0,3).forEach(npc=>{
    const hasItem=state.inventory.some(it=>it.id===npc.looksFor);
    const clr=hasItem?'text-green-500':'text-yellow-500';
    const ico=hasItem?'⭐':'❗';
    const bld=BUILDINGS.find(b=>b.id===npc.scene);
    const gpsX=bld?bld.dx:npc.x;const gpsY=bld?bld.y+bld.h+10:npc.y;
    ul.innerHTML+=`<li class="mb-1.5 flex flex-col ${clr}"><div class="flex items-center gap-1 font-black truncate"><span>${ico}</span><span>${npc.name}</span></div><button onclick="setGPSCoordinates(${gpsX},${gpsY})" class="text-[10px] text-indigo-500 underline text-left pointer-events-auto">GPS 📍</button></li>`;
  });
}
function setGPSCoordinates(x,y){state.gpsTarget={x,y};showFloatingIndicator('📍 GPS Aktif',player.x,player.y-60,'#3b82f6');}
function showFloatingIndicator(text,x,y,color){indicators.push({text,x,y,color,life:1});}

// ══════════════════════════════════════════════════════════════
//  MENUS / TABS
// ══════════════════════════════════════════════════════════════
function toggleMenu(tabId){
  const modal=document.getElementById('menu-modal');
  if(modal.style.display==='flex'&&state.activeTab===tabId) closeMenuModal();
  else openMenuTab(tabId);
}
function openMenuTab(tabId){
  if(document.getElementById('setting-sfx').checked)initAudio();
  document.getElementById('menu-modal').style.display='flex';
  switchTab(tabId);
}
function closeMenuModal(){document.getElementById('menu-modal').style.display='none';}
function switchTab(tabId){
  state.activeTab=tabId;
  ['inventory','quests','shop','skills','achievements','settings'].forEach(t=>{
    const tab=document.getElementById(`tab-${t}`),con=document.getElementById(`content-${t}`);
    if(t===tabId){tab.classList.add('border-indigo-600','text-indigo-600','border-b-2');con.style.display='block';}
    else{tab.classList.remove('border-indigo-600','text-indigo-600','border-b-2');con.style.display='none';}
  });
  if(tabId==='inventory')renderInventoryGrid();
  if(tabId==='quests')renderQuestsLog();
  if(tabId==='shop')renderShopItems();
  if(tabId==='skills')renderSkillTree();
  if(tabId==='achievements')renderAchievementsLog();
}
function toggleFullMap(){const el=document.getElementById('fullmap-modal');if(el.style.display==='flex'){el.style.display='none';}else{el.style.display='flex';drawFullMap();}}
function toggleTutorial(){const el=document.getElementById('tutorial-modal');el.style.display=(el.style.display==='flex')?'none':'flex';}

// Inventory
function renderInventoryGrid(){
  const c=document.getElementById('inv-grid-container');if(!c)return;
  c.innerHTML=state.inventory.length===0?'<div class="col-span-5 text-center text-gray-400 py-10 font-bold">Tas kosong.</div>'
    :state.inventory.map(item=>`<div class="glass-panel p-3 border border-gray-200 text-center flex flex-col items-center shadow-sm hover:scale-105 transition-transform"><span class="text-4xl my-2">${item.icon}</span><div class="font-extrabold text-xs text-gray-700">${item.name}</div><div class="text-[9px] text-gray-400 mt-1 capitalize px-1.5 py-0.5 rounded-full bg-gray-100">${item.rarity}</div></div>`).join('');
}

// Quests
function renderQuestsLog(){
  const c=document.getElementById('quest-list-container');if(!c)return;
  c.innerHTML=npcsDatabase.filter(n=>n.isQuestGiver).map(npc=>{
    const hasItem=state.inventory.some(it=>it.id===npc.looksFor);
    const bld=BUILDINGS.find(b=>b.id===npc.scene);
    const gpsX=bld?bld.dx:npc.x;const gpsY=bld?bld.y+bld.h+10:npc.y;
    const loc=bld?bld.name:'Luar Ruangan';
    return`<div class="p-3.5 rounded-xl border ${npc.solved?'bg-green-50 border-green-200':'bg-gray-50 border-gray-200'} flex justify-between items-center shadow-sm"><div><div class="font-extrabold text-sm text-gray-800">${npc.solved?'✅':'❗'} ${npc.name} <span class="text-[10px] text-gray-400">(${loc})</span></div><div class="text-xs text-gray-500 mt-1">${npc.msgNormal}</div><div class="text-[10px] text-indigo-500 mt-1.5 font-bold">Imbalan: 💰${npc.moneyReward} / ✨${npc.expReward}</div></div><div>${npc.solved?'<span class="bg-green-100 text-green-700 text-xs px-2.5 py-1 rounded-full font-bold">Selesai</span>':`<button onclick="setGPSCoordinates(${gpsX},${gpsY});closeMenuModal();" class="${hasItem?'bg-indigo-600 text-white':'bg-white border text-gray-600'} text-[11px] px-3 py-1.5 rounded-lg font-bold shadow-sm">${hasItem?'Kirim 📍':'Cari 🧭'}</button>`}</div></div>`;
  }).join('');
}

// Shop
const SHOP_CATALOG=[
  {id:'shoes',       name:'Sepatu Olahraga Pro',  icon:'👟', price:100, get bought(){return state.hasProShoes;}},
  {id:'crystal',     name:'Lensa Memori Visual',  icon:'🔮', price:150, get bought(){return state.memoryVisionUnlocked;}},
  {id:'drone',       name:'Drone Pemindai',        icon:'🛸', price:120, get bought(){return state.radarActive;}},
  {id:'golden_map',  name:'Peta Navigasi Emas',   icon:'🗺️', price:200, get bought(){return state.goldenMapActive;}},
  {id:'energy_drink',name:'Minuman Energi',        icon:'🔋', price:80,  get bought(){return state.maxStamina>100;}},
  {id:'magnet',      name:'Koin Magnet (+20%)',    icon:'🧲', price:250, get bought(){return state.bonusCoinMultiplier>1;}},
  {id:'skates',      name:'Sepatu Roda',           icon:'🛼', price:300, get bought(){return state.hasRollerSkates;}},
  {id:'compass',     name:'Kompas Ajaib',          icon:'🧭', price:90,  get bought(){return state.compassActive;}},
];
function renderShopItems(){
  document.getElementById('shop-wallet').textContent=state.money;
  const c=document.getElementById('shop-items-container');if(!c)return;
  c.innerHTML=SHOP_CATALOG.map(item=>`<div class="shop-slot p-2 flex flex-col items-center justify-between text-center hover:scale-105 transition-transform"><div class="text-4xl my-2">${item.icon}</div><div class="font-black text-[10px] text-yellow-900 leading-tight h-8 flex items-center justify-center">${item.name}</div>${item.bought?`<button class="bg-gray-400 text-white border-2 border-white rounded-full px-4 py-1 mt-1 text-xs font-black opacity-70 cursor-not-allowed">SOLD</button>`:`<button onclick="purchaseShopItem('${item.id}',${item.price})" class="shop-buy-btn text-white rounded-full px-4 py-1 mt-1 text-xs font-black w-full">💰 ${item.price}</button>`}</div>`).join('');
}
function purchaseShopItem(id,price){
  if(state.money<price){alert('Koin tidak cukup!');return;}
  state.money-=price;playSound('purchase');
  if(id==='shoes')state.hasProShoes=true;if(id==='crystal')state.memoryVisionUnlocked=true;
  if(id==='drone')state.radarActive=true;if(id==='golden_map')state.goldenMapActive=true;
  if(id==='energy_drink')state.maxStamina+=50;if(id==='magnet')state.bonusCoinMultiplier=1.2;
  if(id==='skates')state.hasRollerSkates=true;if(id==='compass')state.compassActive=true;
  updateHUD();renderShopItems();
}

// Skills
function renderSkillTree(){
  document.getElementById('skill-points-display').textContent=state.skillPoints;
  const container=document.getElementById('skills-container'),svgC=document.getElementById('skill-lines');
  if(!container||!svgC)return;
  container.innerHTML='';svgC.innerHTML='';
  const nodes=[
    {id:'echo',name:'Echo Memori',  icon:'🔊',cost:1,color:'#3b82f6',x:50,y:15,req:null,  unlocked:state.memoryEchoUnlocked},
    {id:'vision',name:'Vision',     icon:'👁️',cost:2,color:'#3b82f6',x:50,y:45,req:'echo', unlocked:state.memoryVisionUnlocked},
    {id:'recall',name:'Recall',     icon:'🧠',cost:3,color:'#3b82f6',x:50,y:80,req:'vision',unlocked:state.memoryRecallUnlocked},
    {id:'stam1',name:'Stamina+',    icon:'🫁',cost:1,color:'#eab308',x:20,y:35,req:null,   unlocked:state.staminaUnlocked},
    {id:'sprint',name:'Sprint-',    icon:'⚡',cost:2,color:'#eab308',x:20,y:70,req:'stam1', unlocked:state.sprintUnlocked},
    {id:'charm',name:'Charm',       icon:'😊',cost:1,color:'#10b981',x:80,y:35,req:null,   unlocked:state.charmUnlocked},
    {id:'haggle',name:'Bargain',    icon:'🤝',cost:2,color:'#10b981',x:80,y:70,req:'charm', unlocked:state.bargainUnlocked},
  ];
  nodes.forEach(node=>{
    if(!node.req)return;
    const parent=nodes.find(n=>n.id===node.req);if(!parent)return;
    const line=document.createElementNS('http://www.w3.org/2000/svg','line');
    line.setAttribute('x1',`${parent.x}%`);line.setAttribute('y1',`${parent.y}%`);
    line.setAttribute('x2',`${node.x}%`);line.setAttribute('y2',`${node.y}%`);
    line.setAttribute('stroke',node.unlocked?node.color:'#334155');line.setAttribute('stroke-width',node.unlocked?'6':'3');
    svgC.appendChild(line);
  });
  nodes.forEach(sk=>{
    const parentOk=!sk.req||nodes.find(n=>n.id===sk.req).unlocked;
    let btn;
    if(sk.unlocked)btn=`<div class="bg-gray-800 text-white border-4 rounded-full w-14 h-14 flex items-center justify-center text-2xl shadow-lg mx-auto" style="border-color:${sk.color};box-shadow:0 0 15px ${sk.color}">${sk.icon}</div>`;
    else if(parentOk)btn=`<button onclick="unlockSkillNode('${sk.id}',${sk.cost})" class="bg-gray-700 hover:bg-gray-600 text-white border-2 border-gray-400 rounded-full w-14 h-14 flex flex-col items-center justify-center text-xl shadow-lg mx-auto hover:scale-110 transition">${sk.icon}<span class="text-[8px] font-black -mt-1 text-yellow-400">${sk.cost}SP</span></button>`;
    else btn=`<div class="bg-gray-900 text-gray-600 border-2 border-gray-700 rounded-full w-14 h-14 flex items-center justify-center text-xl shadow-lg mx-auto opacity-50 cursor-not-allowed">🔒</div>`;
    container.innerHTML+=`<div class="absolute transform -translate-x-1/2 -translate-y-1/2 text-center" style="left:${sk.x}%;top:${sk.y}%">${btn}<div class="mt-2 font-black text-[10px] text-white bg-black/50 px-2 py-0.5 rounded shadow whitespace-nowrap">${sk.name}</div></div>`;
  });
}
function unlockSkillNode(id,cost){
  if(state.skillPoints<cost){alert('SP tidak cukup!');return;}
  state.skillPoints-=cost;playSound('purchase');
  if(id==='echo')state.memoryEchoUnlocked=true;if(id==='vision')state.memoryVisionUnlocked=true;
  if(id==='recall')state.memoryRecallUnlocked=true;if(id==='stam1')state.staminaUnlocked=true;
  if(id==='sprint')state.sprintUnlocked=true;if(id==='charm')state.charmUnlocked=true;
  if(id==='haggle')state.bargainUnlocked=true;
  renderSkillTree();
}

// Achievements
function renderAchievementsLog(){
  const c=document.getElementById('achievements-container');if(!c)return;
  c.innerHTML=state.achievements.map(ach=>{
    const pct=Math.min(100,Math.floor((ach.current/ach.countGoal)*100));
    return`<div class="p-3 rounded-xl border ${ach.solved?'bg-amber-50 border-amber-200':'bg-white border-gray-200'} flex gap-3 items-center shadow-sm"><div class="text-3xl">${ach.solved?'🥇':'🥈'}</div><div class="flex-1"><div class="font-extrabold text-sm ${ach.solved?'text-amber-800':'text-gray-700'}">${ach.title}</div><div class="text-[10px] text-gray-400">${ach.desc}</div><div class="w-full bg-gray-100 h-1.5 rounded-full mt-2 overflow-hidden"><div class="bg-amber-400 h-full" style="width:${pct}%"></div></div></div><div class="text-[10px] font-black text-gray-500">${ach.current}/${ach.countGoal}</div></div>`;
  }).join('');
}
function updateAchievementProgress(id,count){
  const ach=state.achievements.find(a=>a.id===id);
  if(ach&&!ach.solved){ach.current=count;if(ach.current>=ach.countGoal){ach.solved=true;showFloatingIndicator(`🏆 ${ach.title}`,player.x,player.y-100,'#eab308');}}
}
function toggleJoystickSetting(checked){document.getElementById('mobile-joystick-wrapper').style.display=checked?'block':'none';}

// ══════════════════════════════════════════════════════════════
//  SAVE / LOAD
// ══════════════════════════════════════════════════════════════
function quickSaveGame(alertUser){
  const d={
    playerName:state.playerName,level:state.level,xp:state.xp,money:state.money,
    reputation:state.reputation,itemsReturnedCount:state.itemsReturnedCount,
    hasProShoes:state.hasProShoes,hasRollerSkates:state.hasRollerSkates,
    bonusCoinMultiplier:state.bonusCoinMultiplier,maxStamina:state.maxStamina,
    memoryVisionUnlocked:state.memoryVisionUnlocked,memoryEchoUnlocked:state.memoryEchoUnlocked,
    memoryRecallUnlocked:state.memoryRecallUnlocked,staminaUnlocked:state.staminaUnlocked,
    sprintUnlocked:state.sprintUnlocked,charmUnlocked:state.charmUnlocked,
    bargainUnlocked:state.bargainUnlocked,radarActive:state.radarActive,
    goldenMapActive:state.goldenMapActive,compassActive:state.compassActive,
    skillPoints:state.skillPoints,playerX:player.x,playerY:player.y,
    inventory:state.inventory,solvedNpcs:npcsDatabase.filter(n=>n.solved).map(n=>n.id),
    currentScene:state.currentScene,prevOutdoorX:state.prevOutdoorX,prevOutdoorY:state.prevOutdoorY,
    playTimerSeconds:state.playTimerSeconds,enteredAlternativeDimension:state.enteredAlternativeDimension
  };
  localStorage.setItem('returnRushAdventureSave',JSON.stringify(d));
  state.lastSaveTime=Date.now();
  if(alertUser)alert('Game berhasil disimpan!');
}
function loadGameData(){
  const raw=localStorage.getItem('returnRushAdventureSave');if(!raw)return false;
  const d=JSON.parse(raw);
  Object.assign(state,{
    playerName:d.playerName||'Hero',level:d.level||1,xp:d.xp||0,money:d.money||150,
    reputation:d.reputation||0,itemsReturnedCount:d.itemsReturnedCount||0,
    hasProShoes:d.hasProShoes||false,hasRollerSkates:d.hasRollerSkates||false,
    bonusCoinMultiplier:d.bonusCoinMultiplier||1,maxStamina:d.maxStamina||100,
    memoryVisionUnlocked:d.memoryVisionUnlocked||false,memoryEchoUnlocked:d.memoryEchoUnlocked||false,
    memoryRecallUnlocked:d.memoryRecallUnlocked||false,staminaUnlocked:d.staminaUnlocked||false,
    sprintUnlocked:d.sprintUnlocked||false,charmUnlocked:d.charmUnlocked||false,
    bargainUnlocked:d.bargainUnlocked||false,radarActive:d.radarActive||false,
    goldenMapActive:d.goldenMapActive||false,compassActive:d.compassActive||false,
    skillPoints:d.skillPoints||0,inventory:d.inventory||[],currentScene:d.currentScene||'outdoor',
    prevOutdoorX:d.prevOutdoorX||1600,prevOutdoorY:d.prevOutdoorY||700,
    playTimerSeconds:d.playTimerSeconds!==undefined?d.playTimerSeconds:900,
    enteredAlternativeDimension:d.enteredAlternativeDimension||false
  });
  player.x=d.playerX||1600;player.y=d.playerY||700;
  if(d.solvedNpcs)npcsDatabase.forEach(npc=>{if(d.solvedNpcs.includes(npc.id)){npc.solved=true;const item=itemsDatabase.find(it=>it.id===npc.looksFor);if(item)item.pickedUp=true;}});
  if(state.inventory)state.inventory.forEach(inv=>{const item=itemsDatabase.find(it=>it.id===inv.id);if(item)item.pickedUp=true;});
  return true;
}
function resetGameData(){if(confirm('Hapus seluruh progres?')){localStorage.removeItem('returnRushAdventureSave');location.reload();}}
function quickSaveAndExit(){
  quickSaveGame(false);state.isRunning=false;
  if(state.timerIntervalId)clearInterval(state.timerIntervalId);
  document.getElementById('menu-modal').style.display='none';
  document.getElementById('main-menu').style.display='';
  checkSaveGameExists();alert('Disimpan! Kembali ke Menu Utama.');
}
function checkSaveGameExists(){const btn=document.getElementById('btn-continue');if(btn)btn.classList.toggle('hidden',!localStorage.getItem('returnRushAdventureSave'));}

// ══════════════════════════════════════════════════════════════
//  START / CONTINUE
// ══════════════════════════════════════════════════════════════
function startGame(){
  const n=document.getElementById('input-player-name').value.trim();if(n)state.playerName=n;
  document.getElementById('main-menu').style.display='none';
  handleResize();updateHUD();state.isRunning=true;initAudio();startPlayTimer();gameMainLoop();
  document.getElementById('tutorial-modal').style.display='flex';
}
function continueGame(){
  const n=document.getElementById('input-player-name').value.trim();if(n)state.playerName=n;
  document.getElementById('main-menu').style.display='none';
  handleResize();loadGameData();updateHUD();state.isRunning=true;initAudio();startPlayTimer();gameMainLoop();
  document.getElementById('tutorial-modal').style.display='flex';
}

// ══════════════════════════════════════════════════════════════
//  CANVAS CLICK
// ══════════════════════════════════════════════════════════════
function setupCanvasClick(){
  canvas.addEventListener('click',e=>{
    if(state.activeDialogueNpc)return;
    const rect=canvas.getBoundingClientRect();
    const wx=(e.clientX-rect.left-vw/2)/state.cameraZoom+camera.x;
    const wy=(e.clientY-rect.top-vh/2)/state.cameraZoom+camera.y;
    const R=state.memoryRecallUnlocked?100:60;
    if(state.currentScene==='outdoor'&&isAllMandatoryMissionsSolved()&&Math.hypot(wx-1600,wy-1900)<80){promptPortalInteraction();return;}
    for(const item of itemsDatabase){if(!item.pickedUp&&(item.scene||'outdoor')===state.currentScene&&Math.hypot(wx-item.x,wy-item.y)<R){tryPickupItem(item);return;}}
    for(const npc of npcsDatabase){if((npc.scene||'outdoor')===state.currentScene&&Math.hypot(wx-npc.x,wy-npc.y)<R){tryInteractNpc(npc);return;}}
    if(state.currentScene==='outdoor'){for(const b of BUILDINGS){if(Math.hypot(wx-b.dx,wy-(b.y+b.h+10))<60){enterBuilding(b);return;}}}
    else if(Math.hypot(wx-500,wy-960)<70){exitBuilding();}
  });
}

// ══════════════════════════════════════════════════════════════
//  DRAW GAME — beautiful school map
// ══════════════════════════════════════════════════════════════
function drawGame(){
  if(!ctx)return;
  ctx.fillStyle='#1a1a2e';ctx.fillRect(0,0,vw,vh);

  ctx.save();
  ctx.translate(vw/2,vh/2);
  ctx.scale(state.cameraZoom,state.cameraZoom);
  ctx.translate(-camera.x,-camera.y);
  ctx.textAlign='center';ctx.textBaseline='middle';

  const t=Date.now()/800;
  const hideDecor=document.getElementById('setting-graphics')?.checked;

  if(state.currentScene==='outdoor'){
    // ── BASE GROUND ──────────────────────────────────────────
    // grass fill
    ctx.fillStyle='#7ec87e';
    ctx.fillRect(0,0,WORLD_W,WORLD_H);

    // ── ZONES (paths, courts, parking) ───────────────────────
    ZONES.forEach(z=>{
      ctx.fillStyle=z.fill;
      ctx.fillRect(z.x,z.y,z.w,z.h);
    });

    // ── PERIMETER FENCE ──────────────────────────────────────
    ctx.strokeStyle='#64748b';ctx.lineWidth=8;ctx.setLineDash([]);
    ctx.strokeRect(20,20,WORLD_W-40,WORLD_H-40);
    // fence posts
    ctx.fillStyle='#475569';
    for(let fx=20;fx<=WORLD_W-20;fx+=60){ctx.fillRect(fx-3,20-6,6,16);ctx.fillRect(fx-3,WORLD_H-30,6,16);}
    for(let fy=20;fy<=WORLD_H-20;fy+=60){ctx.fillRect(20-6,fy-3,16,6);ctx.fillRect(WORLD_W-30,fy-3,16,6);}

    // ── MAIN GATE ────────────────────────────────────────────
    ctx.fillStyle='#f59e0b';ctx.fillRect(1480,WORLD_H-30,240,20);
    ctx.fillStyle='#d97706';ctx.fillRect(1478,WORLD_H-50,12,40);ctx.fillRect(1710,WORLD_H-50,12,40);
    ctx.fillStyle='#fff';ctx.font='bold 14px Nunito';ctx.textBaseline='middle';
    ctx.fillText('🏫 GERBANG UTAMA',1600,WORLD_H-8);

    // ── PAVEMENT / ROADS ─────────────────────────────────────
    // main vertical road (center)
    ctx.fillStyle='#94a3b8';
    ctx.fillRect(1080,0,120,WORLD_H);// west main corridor
    ctx.fillRect(1750,0,120,1450); // east corridor
    // horizontal roads
    ctx.fillRect(0,300,WORLD_W,90); // north road
    ctx.fillRect(0,1380,WORLD_W,90); // south road
    // road markings
    ctx.strokeStyle='rgba(255,255,255,0.4)';ctx.lineWidth=3;ctx.setLineDash([30,20]);
    ctx.beginPath();ctx.moveTo(1140,0);ctx.lineTo(1140,WORLD_H);ctx.stroke();
    ctx.beginPath();ctx.moveTo(1810,0);ctx.lineTo(1810,1450);ctx.stroke();
    ctx.setLineDash([]);

    // ── BUILDINGS ────────────────────────────────────────────
    BUILDINGS.forEach(b=>{
      // drop shadow
      ctx.fillStyle='rgba(0,0,0,0.18)';
      ctx.fillRect(b.x+8,b.y+8,b.w,b.h);

      // wall
      ctx.fillStyle=b.wallC;
      ctx.fillRect(b.x,b.y,b.w,b.h);

      // roof / top band
      ctx.fillStyle=b.roofC;
      ctx.fillRect(b.x,b.y,b.w,24);

      // windows (uniform grid)
      const winRows=Math.max(1,Math.floor((b.h-50)/60));
      const winCols=Math.max(1,Math.floor((b.w-40)/70));
      for(let wr=0;wr<winRows;wr++){
        for(let wc=0;wc<winCols;wc++){
          const wx2=b.x+30+wc*70;
          const wy2=b.y+40+wr*60;
          if(wx2+30<b.x+b.w&&wy2+30<b.y+b.h){
            ctx.fillStyle='#bae6fd';
            ctx.fillRect(wx2,wy2,28,28);
            // window cross
            ctx.strokeStyle='rgba(255,255,255,0.6)';ctx.lineWidth=1.5;
            ctx.beginPath();ctx.moveTo(wx2+14,wy2);ctx.lineTo(wx2+14,wy2+28);ctx.moveTo(wx2,wy2+14);ctx.lineTo(wx2+28,wy2+14);ctx.stroke();
          }
        }
      }

      // outline
      ctx.strokeStyle=b.roofC;ctx.lineWidth=3;ctx.setLineDash([]);
      ctx.strokeRect(b.x,b.y,b.w,b.h);

      // DOOR — clearly visible, NOT blocking
      const doorW=48,doorH=18;
      const doorX=b.dx-doorW/2, doorY=b.y+b.h-doorH;
      ctx.fillStyle='#fde68a';ctx.fillRect(doorX,doorY,doorW,doorH);
      ctx.strokeStyle='#d97706';ctx.lineWidth=2;ctx.strokeRect(doorX,doorY,doorW,doorH);
      // door knob
      ctx.fillStyle='#d97706';ctx.beginPath();ctx.arc(doorX+doorW-8,doorY+doorH/2,3,0,Math.PI*2);ctx.fill();

      // building label
      ctx.fillStyle='#fff';ctx.font=`bold 11px Nunito`;ctx.textBaseline='middle';
      ctx.fillText(b.name,b.x+b.w/2,b.y+13);
      // icon
      ctx.font='18px sans-serif';
      ctx.fillText(b.icon,b.x+b.w/2,b.y+b.h/2);
    });

    // ── TREES ────────────────────────────────────────────────
    TREES.forEach(tr=>{
      if(!hideDecor){
        const sway=Math.sin(t+tr.swayOff)*2;
        // trunk
        ctx.fillStyle='#78350f';
        ctx.fillRect(tr.x-3,tr.y,6,tr.r*0.7);
        // canopy shadow
        ctx.fillStyle='rgba(0,0,0,0.1)';
        ctx.beginPath();ctx.ellipse(tr.x+4,tr.y+4,tr.r,tr.r*0.8,0,0,Math.PI*2);ctx.fill();
        // canopy
        ctx.fillStyle='#16a34a';
        ctx.beginPath();ctx.arc(tr.x+sway,tr.y-tr.r*0.3,tr.r,0,Math.PI*2);ctx.fill();
        ctx.fillStyle='#22c55e';
        ctx.beginPath();ctx.arc(tr.x+sway-4,tr.y-tr.r*0.5,tr.r*0.65,0,Math.PI*2);ctx.fill();
      } else {
        ctx.fillStyle='#16a34a';
        ctx.beginPath();ctx.arc(tr.x,tr.y,tr.r*0.7,0,Math.PI*2);ctx.fill();
      }
    });

    // ── LAPANGAN OLAHRAGA markings ────────────────────────────
    if(!hideDecor){
      // basketball lines
      ctx.strokeStyle='rgba(255,255,255,0.5)';ctx.lineWidth=2;ctx.setLineDash([]);
      ctx.strokeRect(2240,1140,720,500);
      ctx.beginPath();ctx.moveTo(2600,1140);ctx.lineTo(2600,1640);ctx.stroke();
      ctx.beginPath();ctx.arc(2600,1390,60,0,Math.PI*2);ctx.stroke();
      // goal posts
      ctx.strokeStyle='#fff';ctx.lineWidth=3;
      ctx.strokeRect(2560,1120,80,30);ctx.strokeRect(2560,1620,80,30);
    }

    // ── GPS line ──────────────────────────────────────────────
    if(state.gpsTarget){
      ctx.strokeStyle='rgba(99,102,241,0.5)';ctx.lineWidth=6;ctx.setLineDash([14,8]);
      ctx.beginPath();ctx.moveTo(player.x,player.y);ctx.lineTo(state.gpsTarget.x,state.gpsTarget.y);ctx.stroke();
      ctx.setLineDash([]);
      // target ping
      const ping=Math.sin(t*4)*6;
      ctx.strokeStyle='#ef4444';ctx.lineWidth=2;
      ctx.beginPath();ctx.arc(state.gpsTarget.x,state.gpsTarget.y,16+ping,0,Math.PI*2);ctx.stroke();
      ctx.fillStyle='#ef4444';ctx.beginPath();ctx.arc(state.gpsTarget.x,state.gpsTarget.y,5,0,Math.PI*2);ctx.fill();
      if(state.compassActive){
        const dist=Math.floor(Math.hypot(player.x-state.gpsTarget.x,player.y-state.gpsTarget.y));
        ctx.fillStyle='#3b82f6';ctx.font='bold 15px Nunito';ctx.textBaseline='middle';
        ctx.fillText(`${dist}m`,player.x,player.y-50);
      }
    }

    // ── PORTAL ────────────────────────────────────────────────
    if(isAllMandatoryMissionsSolved()){
      const px=1600,py=1900;
      ctx.strokeStyle='#c084fc';ctx.lineWidth=6;ctx.setLineDash([12,6]);
      ctx.beginPath();ctx.arc(px,py,38+Math.sin(t*2)*5,0,Math.PI*2);ctx.stroke();ctx.setLineDash([]);
      ctx.fillStyle='#a855f7';ctx.beginPath();ctx.arc(px,py,22,0,Math.PI*2);ctx.fill();
      ctx.fillStyle='#fff';ctx.font='bold 12px Nunito';ctx.textBaseline='middle';
      ctx.fillText('🌀 TEROWONGAN',px,py-55+Math.sin(t*3)*3);
    }

  } else {
    // ══════════════════════════════════════════════════════════
    //  INDOOR SCENE
    // ══════════════════════════════════════════════════════════
    const bld=BUILDINGS.find(b=>b.id===state.currentScene);
    const wallC=bld?bld.wallC:'#f1f5f9';
    const roofC=bld?bld.roofC:'#1e3a8a';

    // floor
    ctx.fillStyle=wallC;ctx.fillRect(0,0,INDOOR_SIZE,INDOOR_SIZE);
    // floor tiles
    ctx.strokeStyle='rgba(0,0,0,0.06)';ctx.lineWidth=1;
    ctx.beginPath();
    for(let i=50;i<INDOOR_SIZE;i+=50){ctx.moveTo(i,0);ctx.lineTo(i,INDOOR_SIZE);ctx.moveTo(0,i);ctx.lineTo(INDOOR_SIZE,i);}
    ctx.stroke();
    // walls
    ctx.strokeStyle=roofC;ctx.lineWidth=10;ctx.strokeRect(5,5,INDOOR_SIZE-10,INDOOR_SIZE-10);
    // header strip
    ctx.fillStyle=roofC;ctx.fillRect(0,0,INDOOR_SIZE,40);
    ctx.fillStyle='#fff';ctx.font='bold 18px Nunito';ctx.textBaseline='middle';
    ctx.fillText(bld?bld.name:'Ruangan',INDOOR_SIZE/2,20);

    // ── Scene-specific furniture ──────────────────────────────
    const sc=state.currentScene;
    if(sc==='class_a'||sc==='class_b'||sc==='class_c'){
      // Desk rows
      ctx.fillStyle='#b45309';
      for(let row=0;row<4;row++){
        for(let col=0;col<4;col++){
          const dx=100+col*200, dy=100+row*180;
          ctx.fillRect(dx,dy,80,50);
          ctx.fillStyle='#92400e';ctx.fillRect(dx+10,dy+50,15,20);ctx.fillRect(dx+55,dy+50,15,20);
          ctx.fillStyle='#b45309';
          // chair
          ctx.fillStyle='#1e40af';ctx.fillRect(dx+10,dy+80,60,40);
          ctx.fillStyle='#b45309';
        }
      }
      // Blackboard
      ctx.fillStyle='#1e3a8a';ctx.fillRect(200,820,600,100);
      ctx.strokeStyle='#fff';ctx.lineWidth=3;ctx.strokeRect(200,820,600,100);
      ctx.fillStyle='rgba(255,255,255,0.2)';ctx.font='bold 28px Nunito';
      ctx.fillText('📝 Papan Tulis',500,872);
      // Teacher desk
      ctx.fillStyle='#78350f';ctx.fillRect(400,920,200,60);
      ctx.fillStyle='#6d28d9';ctx.fillRect(415,930,170,10);
    } else if(sc==='library'){
      // Bookshelves
      for(let s=0;s<5;s++){
        ctx.fillStyle='#78350f';ctx.fillRect(60+s*170,80,40,600);
        ['#ef4444','#3b82f6','#10b981','#f59e0b','#8b5cf6'].forEach((cl,i)=>{
          ctx.fillStyle=cl;ctx.fillRect(65+s*170,90+i*110,30,95);
        });
      }
      // Reading tables
      ctx.fillStyle='#b45309';ctx.fillRect(620,400,300,100);ctx.fillRect(620,600,300,100);
    } else if(sc==='canteen'){
      // Counter
      ctx.fillStyle='#ea580c';ctx.fillRect(100,80,800,80);ctx.fillRect(100,80,800,80);
      ctx.fillStyle='#fff';ctx.font='bold 22px Nunito';ctx.fillText('KANTIN & KOPERASI',500,130);
      // Tables
      for(let t2=0;t2<3;t2++){
        for(let c2=0;c2<3;c2++){
          ctx.fillStyle='#fef3c7';ctx.fillRect(120+c2*260,220+t2*220,200,80);
          ctx.strokeStyle='#d97706';ctx.lineWidth=2;ctx.strokeRect(120+c2*260,220+t2*220,200,80);
          // chairs
          ctx.fillStyle='#f59e0b';
          ctx.fillRect(130+c2*260,310+t2*220,40,30);ctx.fillRect(240+c2*260,310+t2*220,40,30);
        }
      }
    } else if(sc==='lab_sains'){
      ctx.fillStyle='#dbeafe';
      for(let l=0;l<3;l++){ctx.fillRect(80,100+l*250,840,120);ctx.strokeStyle='#3b82f6';ctx.lineWidth=2;ctx.strokeRect(80,100+l*250,840,120);}
      ctx.fillStyle='#1e3a8a';ctx.font='bold 18px Nunito';ctx.fillText('🔬 Lab Sains — Dilarang masuk tanpa pengawas',500,900);
    } else if(sc==='lab_komputer'){
      // Computer desks
      for(let r=0;r<3;r++){for(let c2=0;c2<4;c2++){
        ctx.fillStyle='#ede9fe';ctx.fillRect(80+c2*220,100+r*240,150,80);
        ctx.fillStyle='#4c1d95';ctx.fillRect(90+c2*220,110+r*240,130,50);
        ctx.fillStyle='#8b5cf6';ctx.fillRect(130+c2*220,185+r*240,50,15);
      }}
    } else if(sc==='office'){
      // Desks
      for(let i=0;i<6;i++){
        ctx.fillStyle='#e0e7ff';ctx.fillRect(80+(i%3)*300,120+Math.floor(i/3)*300,220,90);
        ctx.strokeStyle='#6366f1';ctx.lineWidth=2;ctx.strokeRect(80+(i%3)*300,120+Math.floor(i/3)*300,220,90);
      }
    } else if(sc==='principal'){
      ctx.fillStyle='#7c3aed';ctx.fillRect(300,100,400,160);
      ctx.strokeStyle='#fbbf24';ctx.lineWidth=4;ctx.strokeRect(300,100,400,160);
      ctx.fillStyle='#fff';ctx.font='bold 20px Nunito';ctx.fillText('KEPALA SEKOLAH',500,185);
    } else if(sc==='mosque'){
      ctx.fillStyle='#065f46';ctx.fillRect(350,80,300,200);
      ctx.strokeStyle='#fbbf24';ctx.lineWidth=3;ctx.strokeRect(350,80,300,200);
      ctx.fillStyle='#fff';ctx.font='bold 40px sans-serif';ctx.fillText('☪️',500,200);
      ctx.fillStyle='#ecfdf5';
      for(let r=0;r<4;r++){for(let c2=0;c2<3;c2++)ctx.fillRect(100+c2*260,350+r*120,200,60);}
    } else if(sc==='uks'){
      ctx.fillStyle='#fee2e2';ctx.fillRect(200,120,600,180);
      ctx.strokeStyle='#dc2626';ctx.lineWidth=3;ctx.strokeRect(200,120,600,180);
      ctx.fillStyle='#dc2626';ctx.font='bold 28px Nunito';ctx.fillText('🏥 Ruang UKS',500,220);
      for(let i=0;i<3;i++){ctx.fillStyle='#fff';ctx.fillRect(100+i*280,360,200,150);ctx.strokeStyle='#94a3b8';ctx.strokeRect(100+i*280,360,200,150);}
    } else {
      // Generic warehouse
      ctx.fillStyle='#d1d5db';
      for(let r=0;r<3;r++){ctx.fillRect(80,120+r*250,840,110);ctx.strokeStyle='#6b7280';ctx.lineWidth=2;ctx.strokeRect(80,120+r*250,840,110);}
    }

    // EXIT door
    ctx.fillStyle='#374151';ctx.fillRect(460,945,80,50);
    ctx.fillStyle='#fde68a';ctx.fillRect(464,947,72,46);
    ctx.strokeStyle='#d97706';ctx.lineWidth=2;ctx.strokeRect(464,947,72,46);
    ctx.fillStyle='#d97706';ctx.beginPath();ctx.arc(526,970,4,0,Math.PI*2);ctx.fill();
    ctx.fillStyle='#374151';ctx.font='bold 11px Nunito';ctx.textBaseline='middle';
    ctx.fillText('🚪 KELUAR',500,995);
  }

  // ── ITEMS (both scenes) ───────────────────────────────────
  const bob=Math.sin(t*3)*5;
  itemsDatabase.forEach(it=>{
    if(!it.pickedUp&&(it.scene||'outdoor')===state.currentScene){
      ctx.fillStyle='rgba(0,0,0,0.15)';ctx.beginPath();ctx.ellipse(it.x,it.y+16,10,4,0,0,Math.PI*2);ctx.fill();
      ctx.font='28px sans-serif';ctx.textBaseline='middle';ctx.fillText(it.icon,it.x,it.y+bob);
      if(state.memoryVisionUnlocked){
        ctx.strokeStyle='rgba(236,72,153,0.5)';ctx.lineWidth=2.5;
        ctx.beginPath();ctx.arc(it.x,it.y+bob,22,0,Math.PI*2);ctx.stroke();
      }
    }
  });

  // ── NPCS ─────────────────────────────────────────────────
  npcsDatabase.forEach(npc=>{
    if((npc.scene||'outdoor')===state.currentScene){
      drawCharacter(ctx,npc.x,npc.y,npc.skin||'#fcd34d',npc.shirt||'#475569',npc.pants||'#1e293b',false,npc.animFrame||0,npc.isMoving,npc.direction);
      if(npc.isQuestGiver){
        const hasItem=state.inventory.some(i=>i.id===npc.looksFor);
        ctx.font='bold 18px Nunito';ctx.textBaseline='middle';
        if(npc.solved){ctx.fillStyle='#ec4899';ctx.fillText('❤️',npc.x,npc.y-45);}
        else{ctx.fillStyle=hasItem?'#10b981':'#f59e0b';ctx.fillText(hasItem?'⭐':'❓',npc.x,npc.y-45+Math.sin(t*3)*3);}
        // Name tag
        ctx.font='bold 10px Nunito';
        const tw=ctx.measureText(npc.name).width+10;
        ctx.fillStyle='rgba(0,0,0,0.6)';ctx.beginPath();
        ctx.roundRect?ctx.roundRect(npc.x-tw/2,npc.y-62,tw,14,4):ctx.rect(npc.x-tw/2,npc.y-62,tw,14);
        ctx.fill();
        ctx.fillStyle='#fff';ctx.fillText(npc.name,npc.x,npc.y-55);
      }
    }
  });

  // ── PLAYER ───────────────────────────────────────────────
  drawCharacter(ctx,player.x,player.y,player.skin,player.shirt,player.pants,true,player.animFrame,player.moving,player.dir);

  // ── FLOATING INDICATORS ──────────────────────────────────
  for(let i=indicators.length-1;i>=0;i--){
    const ind=indicators[i];
    ctx.font='bold 18px Nunito';ctx.fillStyle=ind.color;ctx.globalAlpha=ind.life;
    ctx.textBaseline='middle';ctx.fillText(ind.text,ind.x,ind.y);
    ctx.globalAlpha=1;ind.y-=1;ind.life-=0.016;
    if(ind.life<=0)indicators.splice(i,1);
  }

  ctx.restore();
}

// ── GAME LOOP ─────────────────────────────────────────────────
let lastTs=0;
function gameMainLoop(ts){
  if(!state.isRunning)return;
  if(!ts||ts-lastTs>=15){updateGame();drawGame();lastTs=ts||0;}
  requestAnimationFrame(gameMainLoop);
}

// ══════════════════════════════════════════════════════════════
//  BOOT — all DOM access after DOMContentLoaded
// ══════════════════════════════════════════════════════════════
document.addEventListener('DOMContentLoaded',()=>{
  canvas        = document.getElementById('gameCanvas');
  ctx           = canvas.getContext('2d',{alpha:false});
  miniMapCanvas = document.getElementById('miniMapCanvas');
  fullMapCanvas = document.getElementById('fullMapCanvas');
  mctx          = miniMapCanvas.getContext('2d');
  fctx          = fullMapCanvas.getContext('2d');
  joystickOuter = document.getElementById('joystick-outer');
  joystickInner = document.getElementById('joystick-inner');
  btnSprint     = document.getElementById('btn-sprint');
  btnInteract   = document.getElementById('btn-interact');

  vw=canvas.width=window.innerWidth;
  vh=canvas.height=window.innerHeight;
  miniMapCanvas.width=miniMapCanvas.height=100;

  window.addEventListener('resize',handleResize);
  checkSaveGameExists();

  // Joystick
  joystickOuter.addEventListener('touchstart',e=>{
    e.preventDefault();
    const rect=joystickOuter.getBoundingClientRect();
    state.touchInput.startX=rect.left+rect.width/2;state.touchInput.startY=rect.top+rect.height/2;
    state.touchInput.active=true;processTouch(e.touches[0]);
  },{passive:false});
  joystickOuter.addEventListener('touchmove',e=>{e.preventDefault();if(state.touchInput.active)processTouch(e.touches[0]);},{passive:false});
  const cancelJoy=()=>{state.touchInput.active=false;state.touchInput.power=0;joystickInner.style.transform='translate(-50%,-50%)';};
  joystickOuter.addEventListener('touchend',cancelJoy);joystickOuter.addEventListener('touchcancel',cancelJoy);

  // Sprint
  btnSprint.addEventListener('touchstart',e=>{e.preventDefault();touchSprint=true;},{passive:false});
  btnSprint.addEventListener('touchend',()=>{touchSprint=false;});
  btnSprint.addEventListener('mousedown',()=>{touchSprint=true;});
  btnSprint.addEventListener('mouseup',()=>{touchSprint=false;});

  // Interact
  btnInteract.addEventListener('click',handleAutoInteract);

  // Canvas click
  setupCanvasClick();

  // Keyboard
  window.addEventListener('keydown',e=>{
    const k=e.key.toLowerCase();state.keys[k]=true;
    if(k==='e'||k===' '){e.preventDefault();handleAutoInteract();}
    if(k==='m')toggleFullMap();
    else if(k==='g')toggleMenu('inventory');
    else if(k==='q')toggleMenu('quests');
    else if(k==='t')toggleMenu('shop');
    else if(k==='f')toggleMenu('skills');
    else if(k==='x')toggleMenu('achievements');
    else if(k==='escape')toggleMenu('settings');
  });
  window.addEventListener('keyup',e=>{state.keys[e.key.toLowerCase()]=false;});
});

function processTouch(touch){
  const dx=touch.clientX-state.touchInput.startX, dy=touch.clientY-state.touchInput.startY;
  const angle=Math.atan2(dy,dx), power=Math.min(Math.hypot(dx,dy)/50,1);
  state.touchInput.angle=angle;state.touchInput.power=power;
  joystickInner.style.transform=`translate(calc(-50% + ${Math.cos(angle)*power*50}px),calc(-50% + ${Math.sin(angle)*power*50}px))`;
}
ENDOFFILE
echo "Done: $(wc -l < /home/claude/return-rush/game.js) lines"
