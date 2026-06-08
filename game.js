// ============================================================
//  RETURN RUSH: SCHOOL ADVENTURE PRO — game.js
//  All bugs fixed: joystickOuter deferred to DOMContentLoaded,
//  drawCharacter implemented, indicators array initialized,
//  audio system, timer, ending screen, minimap all working.
// ============================================================

'use strict';

// ── DOM refs (assigned in init) ──────────────────────────────
let canvas, ctx, miniMapCanvas, fullMapCanvas, mctx, fctx;
let joystickOuter, joystickInner, btnSprint, btnInteract;
let vw, vh;

// ── Constants ───────────────────────────────────────────────
const GOOGLE_SCRIPT_URL = "https://script.google.com/macros/s/AKfycbz-Y7ufP_nW99WXrx12va3cqjh0MF8OhTO1mubGBPtmrgxaovR0px1S7sCM02UVOaRT/exec";
const WORLD_SIZE = 6000;
const INDOOR_SIZE = 1200;

// ── Floating indicators ──────────────────────────────────────
const indicators = [];

// ── World data ───────────────────────────────────────────────
const buildings = [
    { id: 'office',     name: 'Ruang Guru & Kepala Sekolah', x: 3000, y: 4500, w: 320, h: 220, portalX: 3160, portalY: 4720, icon: '🏢', baseColor: '#be123c' },
    { id: 'library',    name: 'Perpustakaan Kuno',           x: 1000, y: 4500, w: 280, h: 200, portalX: 1140, portalY: 4700, icon: '🏛️', baseColor: '#7c2d12' },
    { id: 'museum',     name: 'Aula Pertunjukan & Seni',      x: 2500, y: 800,  w: 360, h: 260, portalX: 2680, portalY: 1060, icon: '🎭', baseColor: '#0f766e' },
    { id: 'supermarket',name: 'Koperasi & Kantin Siswa',      x: 500,  y: 2500, w: 300, h: 260, portalX: 650,  portalY: 2760, icon: '🍱', baseColor: '#ea580c' },
    { id: 'hospital',   name: 'Unit Kesehatan Siswa (UKS)',   x: 4500, y: 3000, w: 260, h: 280, portalX: 4630, portalY: 3280, icon: '🏥', baseColor: '#0369a1' },
    { id: 'school_bldg',name: 'Gedung Lab Sains',             x: 600,  y: 600,  w: 340, h: 240, portalX: 770,  portalY: 840,  icon: '🔬', baseColor: '#1e3a8a' }
];

const itemsDatabase = [
    { id:1,  name:'Penggaris Busur Guru',   icon:'📐', x:600,  y:600,  pickedUp:false, rarity:'umum',      scene:'supermarket' },
    { id:2,  name:'Kunci Laci Lab',          icon:'🔑', x:5500, y:5500, pickedUp:false, rarity:'umum',      scene:'outdoor'     },
    { id:3,  name:'Buku Sastra Kuno',        icon:'📕', x:2500, y:1500, pickedUp:false, rarity:'langka',    scene:'outdoor'     },
    { id:4,  name:'Gantungan Kunci Teddy',   icon:'🧸', x:800,  y:800,  pickedUp:false, rarity:'umum',      scene:'school_bldg' },
    { id:5,  name:'Kamera Retro Klub',       icon:'📷', x:300,  y:300,  pickedUp:false, rarity:'epik',      scene:'library'     },
    { id:6,  name:'Kacamata UKS',            icon:'👓', x:800,  y:400,  pickedUp:false, rarity:'umum',      scene:'hospital'    },
    { id:7,  name:'Jam Saku Emas Kepsek',    icon:'⌚', x:600,  y:400,  pickedUp:false, rarity:'legendaris',scene:'museum'      },
    { id:8,  name:'Kartu Ujian VIP',         icon:'🎫', x:300,  y:300,  pickedUp:false, rarity:'langka',    scene:'office'      },
    { id:9,  name:'Kucing Si Belang',        icon:'🐈', x:4800, y:800,  pickedUp:false, rarity:'langka',    scene:'outdoor'     },
    { id:10, name:'Kuas Lukis Ajaib',        icon:'🎨', x:800,  y:2800, pickedUp:false, rarity:'langka',    scene:'outdoor'     },
    { id:11, name:'Payung Polkadot Guru',    icon:'☂️', x:500,  y:4800, pickedUp:false, rarity:'umum',      scene:'outdoor'     },
    { id:12, name:'Dokumen Rapat Komite',    icon:'💼', x:5500, y:2500, pickedUp:false, rarity:'langka',    scene:'outdoor'     },
    { id:13, name:'Topi Lapangan Kapten',    icon:'👒', x:250,  y:250,  pickedUp:false, rarity:'umum',      scene:'supermarket' },
    { id:14, name:'Kotak Bekal Makan',       icon:'🍱', x:5000, y:5000, pickedUp:false, rarity:'umum',      scene:'outdoor'     },
    { id:15, name:'Cincin Guru Senior',      icon:'💍', x:3500, y:5500, pickedUp:false, rarity:'legendaris',scene:'outdoor'     }
];

const npcsDatabase = [
    { id:'n1',  name:'Pak Budi (Guru Mat)',  icon:'👨‍🏫', emotion:'😭', x:2800, y:2800, looksFor:1,  solved:false, msgNormal:"Aduh, penggaris busur mengajarku hilang... sepertinya tertinggal ketika aku belanja spidol di dalam Koperasi & Kantin.", msgFound:"Luar biasa! Pelajaran geometri sekarang bisa dilanjutkan kembali!", expReward:80, moneyReward:50,  scene:'outdoor', skin:'#fcd34d', shirt:'#475569', pants:'#1e293b', isQuestGiver:true, direction:'down' },
    { id:'n2',  name:'Ibu Ani (Staf Kantin)',icon:'👵', emotion:'😟', x:4800, y:2500, looksFor:2,  solved:false, msgNormal:"Aduh, kunci dapur kantinku hilang... aku sempat mengawas kebersihan di pesisir halaman rumput pojok Tenggara.", msgFound:"Terima kasih anak baik! Sekarang aku bisa kembali memasak makan siang siswa.", expReward:80, moneyReward:50,  scene:'outdoor', skin:'#fde68a', shirt:'#ec4899', pants:'#0f172a', isQuestGiver:true, direction:'down' },
    { id:'n3',  name:'Rina (Pustakawan)',    icon:'👩', emotion:'🧐', x:600,  y:700,  looksFor:3,  solved:false, msgNormal:"Buku Sastra Kuno hilang dari daftar katalog. Terakhir dibaca murid di sekitar Koridor Taman area Utara.", msgFound:"Terima kasih banyak! Ini arsip sangat penting bagi perpustakaan kami.", expReward:80, moneyReward:80,  scene:'library', skin:'#fed7aa', shirt:'#10b981', pants:'#f8fafc', isQuestGiver:true, direction:'down' },
    { id:'n4',  name:'Adit (Siswa Kls 10)', icon:'👦', emotion:'😢', x:4900, y:2850, looksFor:4,  solved:false, msgNormal:"Gantungan kunci teddy kesayanganku hilang dari tas... sepertinya tertinggal di dalam Gedung Lab Sains barat laut!", msgFound:"Teddy! Hore! Terima kasih kakak baik hati!", expReward:80, moneyReward:20,  scene:'outdoor', skin:'#fef08a', shirt:'#ffffff', pants:'#1d4ed8', isQuestGiver:true, direction:'down' },
    { id:'n5',  name:'Zaka (Klub Foto)',     icon:'📸', emotion:'😮', x:2500, y:2500, looksFor:5,  solved:false, msgNormal:"Kamera retro milik klub kami jatuh. Kemarin aku memakainya memotret arsip di dalam Perpustakaan Kuno.", msgFound:"Kameraku kembali! Untung memorinya tidak rusak!", expReward:80, moneyReward:120, scene:'outdoor', skin:'#fcd34d', shirt:'#eab308', pants:'#451a03', isQuestGiver:true, direction:'down' },
    { id:'n6',  name:'Kakek Joyo (Petugas)',icon:'👴', emotion:'👴', x:1800, y:2400, looksFor:6,  solved:false, msgNormal:"Mataku buram... sepertinya kacamata bacaku tertinggal di atas kasur dalam ruangan UKS (Unit Kesehatan).", msgFound:"Ah, akhirnya semua dokumen obat terlihat jelas kembali!", expReward:80, moneyReward:50,  scene:'outdoor', skin:'#e5e7eb', shirt:'#64748b', pants:'#334155', isQuestGiver:true, direction:'down' },
    { id:'n7',  name:'Kepala Sekolah',       icon:'🕴️', emotion:'👑', x:600,  y:250,  looksFor:7,  solved:false, msgNormal:"Jam saku kehormatan sekolah hilang! Tadi pagi aku mendampingi pentas seni di dalam gedung Aula Pertunjukan.", msgFound:"Sangat menakjubkan! Kamu murid berprestasi teladan!", expReward:150,moneyReward:300, scene:'office', skin:'#fed7aa', shirt:'#1e1b4b', pants:'#000000', isQuestGiver:true, direction:'down' },
    { id:'n8',  name:'Roni (Pelajar Baru)',  icon:'🎒', emotion:'😰', x:3000, y:1800, looksFor:8,  solved:false, msgNormal:"Kartu ujian VIP milikku hilang... sepertinya tertinggal di dalam Ruang Guru & Kepala Sekolah.", msgFound:"Selamat! Sekarang aku tidak perlu cemas dilarang ikut ujian.", expReward:80, moneyReward:75,  scene:'outdoor', skin:'#fef08a', shirt:'#ffffff', pants:'#1d4ed8', isQuestGiver:true, direction:'down' },
    { id:'n9',  name:'Nita (Ketua OSIS)',    icon:'👧', emotion:'😭', x:2500, y:3500, looksFor:9,  solved:false, msgNormal:"Si Belang kucing maskot sekolah kabur! Dia biasa mengejar tikus di sekitar area Loker Timur Laut.", msgFound:"Meow! Si Belang! Untung kamu tidak hilang di area luar!", expReward:80, moneyReward:100, scene:'outdoor', skin:'#fcd34d', shirt:'#ffffff', pants:'#9f1239', isQuestGiver:true, direction:'down' },
    { id:'n10', name:'Beni (Klub Seni)',     icon:'👨‍🎨',emotion:'🎨', x:5500, y:5200, looksFor:10, solved:false, msgNormal:"Kuas lukis andalanku hilang... kemarin sore aku memakainya menggambar poster di area Taman Loker barat.", msgFound:"Kuas seni ini luar biasa! Lukisan dinding sekolah bisa selesai!", expReward:80, moneyReward:85,  scene:'outdoor', skin:'#fde68a', shirt:'#93c5fd', pants:'#1e40af', isQuestGiver:true, direction:'down' },
    { id:'n11', name:'Ibu Hamil (Guru Bhs)',icon:'🤰', emotion:'😰', x:3000, y:1500, looksFor:11, solved:false, msgNormal:"Cuaca terik sekali... payung polkadot merahku seingatku tertinggal di halaman rumput luar gedung Perpustakaan.", msgFound:"Terima kasih banyak, sangat membantu ibu hamil berjalan ke kelas.", expReward:40, moneyReward:60,  scene:'outdoor', skin:'#fed7aa', shirt:'#c026d3', pants:'#1e293b', isQuestGiver:true, direction:'down' },
    { id:'n12', name:'Pak RT (Komite)',      icon:'👮‍♂️',emotion:'😡', x:1000, y:1500, looksFor:12, solved:false, msgNormal:"Tas dokumen komite sekolah tertinggal di area luar asrama warga sekolah sebelah timur kampus.", msgFound:"Syukurlah! Anggaran beasiswa siswa tidak jadi terkendala.", expReward:60, moneyReward:90,  scene:'outdoor', skin:'#fcd34d', shirt:'#047857', pants:'#064e3b', isQuestGiver:true, direction:'down' },
    { id:'n13', name:'Remaja (Kapten Tim)', icon:'👱‍♀️',emotion:'😩', x:5500, y:4500, looksFor:13, solved:false, msgNormal:"Topi lapangan tim kami hilang. Kata anak-anak ada yang mengamankannya di dalam lemari Koperasi Sekolah.", msgFound:"Keren! Sekarang kami siap bertanding di turnamen sekolah antar kota!", expReward:25, moneyReward:35,  scene:'outdoor', skin:'#fef08a', shirt:'#ffffff', pants:'#9f1239', isQuestGiver:true, direction:'down' },
    { id:'n14', name:'Pekerja (Janitor)',    icon:'👷', emotion:'🤤', x:4500, y:1500, looksFor:14, solved:false, msgNormal:"Aku sangat lapar, kotak makan siangku terjatuh dari gerobak pembersih. Mungkin tertinggal di pesisir halaman belakang sekolah.", msgFound:"Alhamdulillah! Makan siang lauk ayam gorengku masih utuh!", expReward:45, moneyReward:55,  scene:'outdoor', skin:'#d97706', shirt:'#ea580c', pants:'#451a03', isQuestGiver:true, direction:'down' },
    { id:'n15', name:'Nenek (Guru Senior)', icon:'👵', emotion:'😭', x:2500, y:4500, looksFor:15, solved:false, msgNormal:"Cincin guru teladan pemberian yayasan hilang saat aku mendampingi siswa melukis pemandangan di pesisir ujung selatan.", msgFound:"Air mata nenek tidak sia-sia... Cincin kenangan pensiunan ini sangat berharga.", expReward:200,moneyReward:500, scene:'outdoor', skin:'#e5e7eb', shirt:'#6d28d9', pants:'#312e81', isQuestGiver:true, direction:'down' },
    // Ambient NPCs
    { id:'amb1', name:'Murid Hanyut',   isQuestGiver:false, scene:'outdoor', x:2100, y:1000, skin:'#fcd34d', shirt:'#ffffff', pants:'#1e40af', direction:'right', isMoving:true, moveTimer:0, animFrame:0 },
    { id:'amb2', name:'Siswa Santai',   isQuestGiver:false, scene:'outdoor', x:3500, y:3300, skin:'#fed7aa', shirt:'#93c5fd', pants:'#1e40af', direction:'left',  isMoving:true, moveTimer:0, animFrame:0 },
    { id:'amb3', name:'Janitor Rajin',  isQuestGiver:false, scene:'outdoor', x:1200, y:4600, skin:'#d97706', shirt:'#4b5563', pants:'#1e293b', direction:'up',    isMoving:true, moveTimer:0, animFrame:0 },
    { id:'amb4', name:'Penjaga Gerbang',isQuestGiver:false, scene:'outdoor', x:3000, y:4100, skin:'#e5e7eb', shirt:'#1e3a8a', pants:'#0f172a', direction:'down',  isMoving:true, moveTimer:0, animFrame:0 }
];

const mapZonesLayout = {
    classroomsA:   { x:0,    y:0,    w:2000, h:2000, color:'#fef08a', name:'Gedung Kelas A (VII A - IX F)' },
    plazaGuru:     { x:2000, y:0,    w:2000, h:2000, color:'#ddd6fe', name:'Taman Plaza Guru' },
    administrative:{ x:4000, y:0,    w:2000, h:2000, color:'#fca5a5', name:'Gedung Administrasi' },
    canteen:       { x:0,    y:2000, w:2000, h:2000, color:'#fed7aa', name:'Kantin Sekolah' },
    field:         { x:2000, y:2000, w:2000, h:2000, color:'#bbf7d0', name:'Lapangan Utama & Upacara' },
    parking:       { x:4000, y:2000, w:2000, h:2000, color:'#e5e7eb', name:'Parkiran Sepeda & Motor' },
    libraryBldg:   { x:0,    y:4000, w:2000, h:2000, color:'#bfdbfe', name:'Gedung Perpustakaan' },
    laboratories:  { x:2000, y:4000, w:2000, h:2000, color:'#d9f99d', name:'Gedung B (Laboratorium)' },
    musholaBldg:   { x:4000, y:4000, w:2000, h:2000, color:'#fef3c7', name:'Mushola & Taman Belakang' }
};

// ── Game state ───────────────────────────────────────────────
const state = {
    isRunning: false, playerName: 'Hero', level: 1, xp: 0, xpToNextLevel: 100,
    money: 150, reputation: 0, itemsReturnedCount: 0,
    stamina: 100, maxStamina: 100, bonusCoinMultiplier: 1, isSprinting: false,
    activeTab: 'inventory', gpsTarget: null, skillPoints: 0,
    currentEvent: 'none', cameraZoom: 0.8, activeInteractTarget: null,
    activeDialogueNpc: null, dialogueWords: [], dialogueIndex: 0,
    dialogueTextFull: '', dialogueTypedText: '', dialogueTypeSpeed: 60,
    dialogueTimeout: null,
    // Skills / upgrades
    memoryEchoUnlocked: false, memoryVisionUnlocked: false, memoryRecallUnlocked: false,
    staminaUnlocked: false, sprintUnlocked: false, charmUnlocked: false,
    bargainUnlocked: false, radarActive: false, hasProShoes: false,
    hasRollerSkates: false, goldenMapActive: false, compassActive: false,
    // Misc
    lastSaveTime: Date.now(),
    keys: {},
    touchInput: { active:false, startX:0, startY:0, curX:0, curY:0, angle:0, power:0 },
    achievements: [
        { id:'first_return', title:'Awal Baik',           desc:'Kembalikan barang pertamamu.',              countGoal:1,   current:0,   solved:false },
        { id:'helper_10',    title:'Pahlawan Harapan',    desc:'Mengembalikan 10 barang hilang.',           countGoal:10,  current:0,   solved:false },
        { id:'rich_hero',    title:'Pahlawan Makmur',     desc:'Mencapai saldo tabungan 💰 500 koin.',      countGoal:500, current:150, solved:false },
        { id:'vip_helper',   title:'Pengabdi Kehormatan', desc:'Membantu Kepala Sekolah.',                  countGoal:1,   current:0,   solved:false }
    ],
    scenery: [], weatherParticles: [], cloudList: [],
    inventory: [], currentScene: 'outdoor',
    prevOutdoorX: 3000, prevOutdoorY: 3000,
    playTimerSeconds: 900, timerIntervalId: null,
    enteredAlternativeDimension: false, hasWarpedBefore: false,
    schoolTime: 800, ambientColor: 'rgba(0,0,0,0)'
};

const player = {
    x: 3000, y: 3000, radius: 20, baseSpeed: 5,
    skin: '#fef08a', shirt: '#3b82f6', pants: '#1e3a8a',
    get speed() {
        let s = this.baseSpeed;
        if (state.hasProShoes)    s += 2.0;
        if (state.hasRollerSkates) s += 2.0;
        if (state.isSprinting && state.stamina > 10) s *= (state.sprintUnlocked ? 1.8 : 1.6);
        return s;
    },
    animFrame: 0, moving: false, dir: 'down'
};

const camera = { x: 3000, y: 3000 };
const classroomDoors = [];
let touchSprint = false;

// ── Audio (Web Audio API) ─────────────────────────────────────
let audioCtx = null;
let audioEnabled = true;
let bgmGain = null;
let bgmOsc = null;

function initAudio() {
    if (audioCtx) return;
    try {
        audioCtx = new (window.AudioContext || window.webkitAudioContext)();
        bgmGain = audioCtx.createGain();
        bgmGain.gain.value = 0.08;
        bgmGain.connect(audioCtx.destination);
        startBGM();
    } catch(e) { console.warn('Audio init failed', e); }
}

function startBGM() {
    if (!audioCtx || !audioEnabled) return;
    if (bgmOsc) { try { bgmOsc.stop(); } catch(e) {} }
    try {
        bgmOsc = audioCtx.createOscillator();
        bgmOsc.type = 'sine';
        bgmOsc.frequency.value = 220;
        bgmOsc.connect(bgmGain);
        bgmOsc.start();
    } catch(e) {}
}

function toggleAudio() {
    audioEnabled = document.getElementById('setting-sfx').checked;
    if (bgmGain) bgmGain.gain.value = audioEnabled ? 0.08 : 0;
    if (audioEnabled) initAudio();
}

function playSound(type) {
    if (!audioEnabled || !audioCtx) return;
    try {
        const osc = audioCtx.createOscillator();
        const gain = audioCtx.createGain();
        osc.connect(gain); gain.connect(audioCtx.destination);
        const freqs = { step:180, pickup:440, success:660, levelup:880, purchase:520, type:300 };
        osc.frequency.value = freqs[type] || 300;
        osc.type = type === 'levelup' ? 'square' : 'sine';
        gain.gain.setValueAtTime(0.15, audioCtx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.18);
        osc.start(audioCtx.currentTime);
        osc.stop(audioCtx.currentTime + 0.18);
    } catch(e) {}
}

// ── World generation ─────────────────────────────────────────
function generateClassrooms() {
    const classes = ['VII A','VII B','VII C','VII D','VII E','VII F','VIII A','VIII B','VIII C','VIII D','VIII E','VIII F','IX A','IX B','IX C','IX D','IX E','IX F'];
    let idx = 0;
    for (let x = 200; x <= 1600; x += 300) {
        for (let y = 200; y <= 1600; y += 400) {
            if (idx < classes.length) {
                classroomDoors.push({ name:'Kelas '+classes[idx], x, y, w:80, h:100, portalX:x+40, portalY:y+90 });
                idx++;
            }
        }
    }
}

function generateWorldProps() {
    state.scenery = [];
    classroomDoors.forEach(d => {
        state.scenery.push({ x:d.x-40, y:d.y+90,  type:'bench',          size:20, swayOffset:0 });
        state.scenery.push({ x:d.x-15, y:d.y+95,  type:'plant_pot',      size:15, swayOffset:0 });
        state.scenery.push({ x:d.x+95, y:d.y+95,  type:'plant_pot',      size:15, swayOffset:0 });
        state.scenery.push({ x:d.x+40, y:d.y-10,  type:'bulletin_board', size:20, swayOffset:0 });
    });

    state.scenery.push({ x:2200, y:3000, type:'football_goal_left',  size:60, swayOffset:0 });
    state.scenery.push({ x:3800, y:3000, type:'football_goal_right', size:60, swayOffset:0 });
    for (let y = 2100; y <= 3900; y += 450) {
        state.scenery.push({ x:1950, y, type:'lamp', size:20, swayOffset:0 });
        state.scenery.push({ x:4050, y, type:'lamp', size:20, swayOffset:0 });
    }
    state.scenery.push({ x:3000, y:1000, type:'fountain', size:80, swayOffset:0 });
    state.scenery.push({ x:5000, y:5000, type:'pond',     size:140, swayOffset:0 });

    for (let x = 300; x <= 1700; x += 400) for (let y = 2200; y <= 3800; y += 500)
        state.scenery.push({ x, y, type:'canteen_table', size:50, swayOffset:0 });

    for (let x = 4200; x <= 5800; x += 250) {
        state.scenery.push({ x, y:2200, type:'bicycle_rack',     size:40, swayOffset:0 });
        state.scenery.push({ x, y:3800, type:'motorbike_parked', size:40, swayOffset:0 });
    }
    for (let x = 4200; x <= 5800; x += 400)
        for (let y = 4200; y <= 5800; y += 400)
            if (Math.hypot(x-5000, y-5000) > 200)
                state.scenery.push({ x, y, type:'mango_tree', size:55, swayOffset:Math.random()*Math.PI });

    buildings.forEach(b => {
        state.scenery.push({ x:b.portalX-50, y:b.portalY+15, type:'plant_pot', size:20, swayOffset:0 });
        state.scenery.push({ x:b.portalX+50, y:b.portalY+15, type:'plant_pot', size:20, swayOffset:0 });
    });

    for (let i = 0; i < 20; i++)
        state.cloudList.push({ x:Math.random()*WORLD_SIZE, y:Math.random()*WORLD_SIZE, size:150+Math.random()*200, speed:0.2+Math.random()*0.4 });
}

// ── Timer ────────────────────────────────────────────────────
function startPlayTimer() {
    if (state.timerIntervalId) clearInterval(state.timerIntervalId);
    state.timerIntervalId = setInterval(() => {
        if (!state.isRunning) return;
        state.playTimerSeconds--;
        const m = Math.floor(state.playTimerSeconds / 60);
        const s = state.playTimerSeconds % 60;
        document.getElementById('countdown-timer').textContent = `${String(m).padStart(2,'0')}:${String(s).padStart(2,'0')}`;
        if (state.playTimerSeconds <= 0) showEndingScreen();
    }, 1000);
}

// ── Ending screen ─────────────────────────────────────────────
function showEndingScreen() {
    clearInterval(state.timerIntervalId);
    state.isRunning = false;
    triggerSystemEnding();
}

function triggerSystemEnding() {
    const solvedCount = npcsDatabase.filter(n => n.isQuestGiver && n.solved).length;
    const allShopBought = isAllShopItemsBought();
    const enteredDimension = state.enteredAlternativeDimension;
    let title, emoji, desc, endingType;

    if (solvedCount >= 10 && enteredDimension && allShopBought) {
        title = '🔮 SECRET ENDING: Rehabilitasi VR Selesai!';
        emoji = '🌀';
        desc = 'Kamu telah menyelesaikan semua misi, memasuki terowongan dimensi, dan membeli semua upgrade. Sekolah ini ternyata simulasi VR untuk rehabilitasi sosialmu. Selamat, kamu lulus!';
        endingType = 'Secret VR';
    } else if (solvedCount >= 8) {
        title = '🏆 GOOD ENDING!';
        emoji = '🎉';
        desc = 'Sekolah hidup kembali berkat kebaikanmu! Kamu telah mengembalikan hampir semua barang hilang. Semua orang berterima kasih kepadamu.';
        endingType = 'Good';
    } else {
        title = '😔 BAD ENDING';
        emoji = '😞';
        desc = 'Waktu habis dan masih banyak barang yang belum dikembalikan. Sekolah masih kacau. Coba lagi untuk hasil yang lebih baik!';
        endingType = 'Bad';
    }

    document.getElementById('ending-title').textContent = title;
    document.getElementById('ending-emoji').textContent = emoji;
    document.getElementById('ending-description').textContent = desc;
    document.getElementById('ending-stat-name').textContent = state.playerName;
    document.getElementById('ending-stat-missions').textContent = solvedCount;
    document.getElementById('ending-stat-dimension').textContent = enteredDimension ? 'Ya' : 'Tidak';
    document.getElementById('ending-stat-skills').textContent = allShopBought ? 'Ya' : 'Tidak';

    const el = document.getElementById('ending-screen');
    el.style.display = 'flex';
    el.style.alignItems = 'center';
    el.style.justifyContent = 'center';

    submitScoreToLeaderboard(state.playerName, state.reputation, solvedCount, endingType);
}

// ── Leaderboard ───────────────────────────────────────────────
async function submitScoreToLeaderboard(name, reputation, missions, endingType) {
    const scoreData = { name, reputation, missions, ending: endingType, date: new Date().toLocaleDateString('id-ID') };
    let lb = JSON.parse(localStorage.getItem('returnRushLeaderboard') || '[]');
    lb.push(scoreData);
    lb.sort((a,b) => b.missions - a.missions || b.reputation - a.reputation);
    localStorage.setItem('returnRushLeaderboard', JSON.stringify(lb.slice(0,10)));
    if (GOOGLE_SCRIPT_URL.includes('script.google.com/macros')) {
        try { await fetch(GOOGLE_SCRIPT_URL, { method:'POST', mode:'no-cors', headers:{'Content-Type':'application/json'}, body:JSON.stringify(scoreData) }); } catch(e) {}
    }
}

async function fetchLeaderboardData() {
    if (GOOGLE_SCRIPT_URL.includes('script.google.com/macros')) {
        try {
            const r = await fetch(GOOGLE_SCRIPT_URL);
            const d = await r.json();
            if (d && d.length > 0) { localStorage.setItem('returnRushLeaderboard', JSON.stringify(d.slice(0,10))); return d.slice(0,10); }
        } catch(e) {}
    }
    return JSON.parse(localStorage.getItem('returnRushLeaderboard') || '[]');
}

async function showLeaderboard() {
    document.getElementById('main-menu').style.display = 'none';
    const existing = document.getElementById('leaderboard-modal');
    if (existing) existing.remove();
    const modal = document.createElement('div');
    modal.id = 'leaderboard-modal';
    modal.style.cssText = 'position:absolute;inset:0;z-index:80;display:flex;align-items:center;justify-content:center;background:rgba(0,0,0,0.8);backdrop-filter:blur(8px);padding:16px;pointer-events:auto;';
    modal.innerHTML = `
        <div class="glass-panel w-full max-w-lg h-[80vh] flex flex-col overflow-hidden shadow-2xl animate-pop bg-white">
            <div class="bg-indigo-600 px-4 py-3 flex justify-between items-center text-white shrink-0">
                <h2 class="font-black text-lg">🏆 Papan Skor Global</h2>
                <button onclick="document.getElementById('leaderboard-modal').remove(); document.getElementById('main-menu').style.display='';" class="text-white text-3xl font-bold">&times;</button>
            </div>
            <div class="flex-1 p-5 overflow-y-auto">
                <div id="leaderboard-list-content" class="text-center text-indigo-500 py-8 font-bold animate-pulse">Menghubungkan ke Server...</div>
            </div>
        </div>`;
    document.body.appendChild(modal);
    const data = await fetchLeaderboardData();
    let html = data.length === 0
        ? '<div class="text-center text-gray-400 py-8 font-bold">Belum ada pahlawan yang menyelesaikan permainan.</div>'
        : data.map((e,i) => {
            const rc = i===0?'text-yellow-400':i===1?'text-gray-300':i===2?'text-amber-600':'text-gray-500';
            const badge = e.ending==='Secret VR'?'<span class="bg-purple-600 text-white text-[10px] px-2 py-0.5 rounded ml-2">VR</span>':e.ending==='Good'?'<span class="bg-green-500 text-white text-[10px] px-2 py-0.5 rounded ml-2">Good</span>':'';
            return `<div class="flex justify-between items-center bg-gray-50 p-3 rounded-lg border border-gray-200 mb-2">
                <div class="flex items-center gap-3"><span class="font-black text-xl ${rc}">#${i+1}</span>
                <div><div class="font-bold text-gray-800">${e.name}${badge}</div><div class="text-[10px] text-gray-500">${e.date}</div></div></div>
                <div class="text-right"><div class="font-black text-indigo-600">${e.missions}/15 Misi</div><div class="text-[10px] font-bold text-pink-500">${e.reputation}% Rep</div></div>
            </div>`;
        }).join('');
    document.getElementById('leaderboard-list-content').innerHTML = html;
}

// ── Resize ───────────────────────────────────────────────────
function handleResize() {
    vw = canvas.width  = window.innerWidth;
    vh = canvas.height = window.innerHeight;
}

// ── Character drawing ─────────────────────────────────────────
function drawCharacter(ctx2, x, y, skin, shirt, pants, isPlayer, animFrame, moving, dir) {
    ctx2.save();
    ctx2.textAlign = 'center';
    ctx2.textBaseline = 'middle';

    const bob   = moving ? Math.sin(animFrame * 3) * 3 : 0;
    const legL  = moving ? Math.sin(animFrame * 3) * 8  : 0;
    const legR  = moving ? -Math.sin(animFrame * 3) * 8 : 0;
    const armL  = moving ? -Math.sin(animFrame * 3) * 6 : 0;
    const armR  = moving ? Math.sin(animFrame * 3) * 6  : 0;

    // Shadow
    ctx2.fillStyle = 'rgba(0,0,0,0.18)';
    ctx2.beginPath();
    ctx2.ellipse(x, y + 22, 14, 5, 0, 0, Math.PI * 2);
    ctx2.fill();

    // Left leg
    ctx2.fillStyle = pants;
    ctx2.fillRect(x - 9,  y + 8 + bob, 8, 14 + legL);
    // Right leg
    ctx2.fillRect(x + 1,  y + 8 + bob, 8, 14 + legR);

    // Body
    ctx2.fillStyle = shirt;
    ctx2.fillRect(x - 11, y - 8 + bob, 22, 18);

    // Left arm
    ctx2.fillStyle = shirt;
    ctx2.fillRect(x - 19, y - 8 + bob + armL, 8, 14);
    // Right arm
    ctx2.fillRect(x + 11, y - 8 + bob + armR, 8, 14);

    // Head
    ctx2.fillStyle = skin;
    ctx2.beginPath();
    ctx2.arc(x, y - 18 + bob, 13, 0, Math.PI * 2);
    ctx2.fill();

    // Hair
    ctx2.fillStyle = '#3b1f0a';
    ctx2.beginPath();
    ctx2.arc(x, y - 24 + bob, 10, Math.PI, Math.PI * 2);
    ctx2.fill();

    // Eyes
    if (dir !== 'up') {
        ctx2.fillStyle = '#1e1b4b';
        ctx2.beginPath();
        ctx2.arc(x - 4, y - 18 + bob, 2, 0, Math.PI * 2);
        ctx2.arc(x + 4, y - 18 + bob, 2, 0, Math.PI * 2);
        ctx2.fill();
    }

    // Player indicator arrow
    if (isPlayer) {
        ctx2.fillStyle = '#4F46E5';
        ctx2.beginPath();
        ctx2.moveTo(x,      y - 42 + bob);
        ctx2.lineTo(x - 7,  y - 32 + bob);
        ctx2.lineTo(x + 7,  y - 32 + bob);
        ctx2.closePath();
        ctx2.fill();
    }

    ctx2.restore();
}

// ── Minimap drawing ───────────────────────────────────────────
function drawMiniMap() {
    if (!mctx) return;
    const W = miniMapCanvas.width;
    const H = miniMapCanvas.height;
    const scale = W / WORLD_SIZE;

    mctx.fillStyle = '#e2e8f0';
    mctx.fillRect(0, 0, W, H);

    // Zones
    for (let k in mapZonesLayout) {
        const z = mapZonesLayout[k];
        mctx.fillStyle = z.color + '99';
        mctx.fillRect(z.x * scale, z.y * scale, z.w * scale, z.h * scale);
    }

    // Buildings
    mctx.fillStyle = '#7f1d1d';
    buildings.forEach(b => mctx.fillRect(b.x * scale, b.y * scale, b.w * scale, b.h * scale));

    // Player
    mctx.fillStyle = '#4F46E5';
    mctx.beginPath();
    const px = (state.currentScene === 'outdoor') ? player.x * scale : (state.prevOutdoorX * scale);
    const py = (state.currentScene === 'outdoor') ? player.y * scale : (state.prevOutdoorY * scale);
    mctx.arc(px, py, 3, 0, Math.PI * 2);
    mctx.fill();
}

function drawFullMap() {
    if (!fctx) return;
    const SIZE = 600;
    fullMapCanvas.width  = SIZE;
    fullMapCanvas.height = SIZE;
    const scale = SIZE / WORLD_SIZE;

    fctx.fillStyle = '#e2e8f0';
    fctx.fillRect(0, 0, SIZE, SIZE);

    for (let k in mapZonesLayout) {
        const z = mapZonesLayout[k];
        fctx.fillStyle = z.color + 'bb';
        fctx.fillRect(z.x*scale, z.y*scale, z.w*scale, z.h*scale);
        fctx.strokeStyle = '#94a3b8'; fctx.lineWidth = 1;
        fctx.strokeRect(z.x*scale, z.y*scale, z.w*scale, z.h*scale);
        fctx.fillStyle = 'rgba(0,0,0,0.5)';
        fctx.font = '7px Nunito';
        fctx.textAlign = 'center';
        fctx.fillText(z.name, (z.x + z.w/2)*scale, (z.y + z.h/2)*scale);
    }

    fctx.fillStyle = '#7f1d1d';
    buildings.forEach(b => {
        fctx.fillRect(b.x*scale, b.y*scale, b.w*scale, b.h*scale);
        fctx.font = '10px sans-serif';
        fctx.textAlign = 'center';
        fctx.fillText(b.icon, (b.x+b.w/2)*scale, (b.y+b.h/2)*scale);
    });

    // NPC dots
    npcsDatabase.forEach(n => {
        if (!n.isQuestGiver || n.scene !== 'outdoor') return;
        fctx.fillStyle = n.solved ? '#10b981' : '#ef4444';
        fctx.beginPath();
        fctx.arc(n.x*scale, n.y*scale, 4, 0, Math.PI*2);
        fctx.fill();
    });

    // Player
    fctx.fillStyle = '#4F46E5';
    fctx.beginPath();
    fctx.arc(player.x*scale, player.y*scale, 6, 0, Math.PI*2);
    fctx.fill();
    fctx.strokeStyle = '#fff'; fctx.lineWidth = 2; fctx.stroke();
}

// ── Game update ───────────────────────────────────────────────
function updateGame() {
    if (!state.isRunning) return;

    // Time of day
    state.schoolTime = (state.schoolTime + 0.3) % 2400;
    const hour = Math.floor(state.schoolTime / 100);
    if (hour >= 18 || hour < 5)  state.ambientColor = 'rgba(15,23,42,0.45)';
    else if (hour === 17 || hour === 5) state.ambientColor = 'rgba(249,115,22,0.15)';
    else state.ambientColor = 'rgba(0,0,0,0)';

    // Sprinting
    const sprintKey = state.keys['shift'] || state.keys['shiftleft'] || state.keys['shiftright'];
    state.isSprinting = (touchSprint || sprintKey) && player.moving && state.stamina > 5;
    const sprintDrain = state.sprintUnlocked ? 0.6 : 1.0;
    const regenRate   = state.staminaUnlocked ? 0.7 : 0.4;
    if (state.isSprinting) state.stamina = Math.max(0, state.stamina - sprintDrain);
    else state.stamina = Math.min(state.maxStamina, state.stamina + regenRate);
    document.getElementById('stamina-fill').style.width = `${(state.stamina / state.maxStamina) * 100}%`;

    // Movement input
    let dx = 0, dy = 0;
    if (state.keys['w'] || state.keys['arrowup'])    dy -= 1;
    if (state.keys['s'] || state.keys['arrowdown'])   dy += 1;
    if (state.keys['a'] || state.keys['arrowleft'])   dx -= 1;
    if (state.keys['d'] || state.keys['arrowright'])  dx += 1;
    if (state.touchInput.active) {
        dx = Math.cos(state.touchInput.angle) * state.touchInput.power;
        dy = Math.sin(state.touchInput.angle) * state.touchInput.power;
    }

    player.moving = (Math.hypot(dx, dy) > 0.05);

    if (player.moving && !state.activeDialogueNpc) {
        if (Math.abs(dx) > Math.abs(dy)) player.dir = dx > 0 ? 'right' : 'left';
        else player.dir = dy > 0 ? 'down' : 'up';
        player.x += dx * player.speed;
        player.y += dy * player.speed;
        player.animFrame += 0.25;
        if (Math.floor(player.animFrame) % 6 === 0) playSound('step');
    } else { player.animFrame = 0; }

    const curSize = state.currentScene === 'outdoor' ? WORLD_SIZE : INDOOR_SIZE;
    player.x = Math.max(player.radius, Math.min(curSize - player.radius, player.x));
    player.y = Math.max(player.radius, Math.min(curSize - player.radius, player.y));

    camera.x += (player.x - camera.x) * 0.1;
    camera.y += (player.y - camera.y) * 0.1;
    const hW = (vw / state.cameraZoom) / 2;
    const hH = (vh / state.cameraZoom) / 2;
    if (curSize > vw / state.cameraZoom) camera.x = Math.max(hW, Math.min(curSize - hW, camera.x));
    if (curSize > vh / state.cameraZoom) camera.y = Math.max(hH, Math.min(curSize - hH, camera.y));

    // Clouds
    state.cloudList.forEach(c => { c.x += c.speed; if (c.x > WORLD_SIZE) c.x = -c.size; });

    // Ambient NPC movement
    npcsDatabase.forEach(npc => {
        if (!npc.isQuestGiver && npc.scene === state.currentScene) {
            npc.moveTimer = (npc.moveTimer || 0) + 1;
            if (npc.moveTimer > 120) {
                npc.isMoving = Math.random() > 0.3;
                if (npc.isMoving) {
                    const dirs = ['up','down','left','right'];
                    npc.direction = dirs[Math.floor(Math.random()*4)];
                }
                npc.moveTimer = 0;
            }
            if (npc.isMoving) {
                if (npc.direction==='up')    npc.y -= 1.5;
                if (npc.direction==='down')  npc.y += 1.5;
                if (npc.direction==='left')  npc.x -= 1.5;
                if (npc.direction==='right') npc.x += 1.5;
                npc.x = Math.max(40, Math.min(WORLD_SIZE-40, npc.x));
                npc.y = Math.max(40, Math.min(WORLD_SIZE-40, npc.y));
                npc.animFrame = (npc.animFrame || 0) + 0.2;
            } else { npc.animFrame = 0; }
        }
    });

    checkAutoInteractions();
    drawMiniMap();

    if (Date.now() - state.lastSaveTime > 30000) quickSaveGame(false);
}

// ── Interaction detection ─────────────────────────────────────
function checkAutoInteractions() {
    let nearest = null;
    let nearDist = state.memoryRecallUnlocked ? 120 : 80;

    // Portal (all 10 main missions done)
    if (state.currentScene === 'outdoor' && isAllMandatoryMissionsSolved()) {
        const d = Math.hypot(player.x-3000, player.y-3000);
        if (d < 80 && d < nearDist) { nearDist=d; nearest={ type:'portal', text:'E / Tap untuk Masuk Terowongan Bawah Tanah 🌀' }; }
    }

    // Buildings (outdoors)
    if (state.currentScene === 'outdoor' && !nearest) {
        buildings.forEach(b => {
            const d = Math.hypot(player.x-b.portalX, player.y-b.portalY);
            if (d < 60 && d < nearDist) { nearDist=d; nearest={ type:'building', data:b, text:`E / Tap untuk Masuk ke ${b.name}` }; }
        });
    }

    // Exit door (indoors)
    if (state.currentScene !== 'outdoor' && !nearest) {
        const d = Math.hypot(player.x-600, player.y-1140);
        if (d < 70 && d < nearDist) { nearDist=d; nearest={ type:'exit', text:'E / Tap untuk Keluar Ruangan' }; }
    }

    // Items
    itemsDatabase.forEach(item => {
        if (!item.pickedUp && (item.scene||'outdoor') === state.currentScene) {
            const d = Math.hypot(player.x-item.x, player.y-item.y);
            if (d < nearDist) { nearDist=d; nearest={ type:'item', data:item, text:`E / Tap untuk Ambil: ${item.name}` }; }
        }
    });

    // NPCs
    if (!nearest) {
        npcsDatabase.forEach(npc => {
            if (npc.isQuestGiver && (npc.scene||'outdoor') === state.currentScene) {
                const d = Math.hypot(player.x-npc.x, player.y-npc.y);
                if (d < nearDist) { nearDist=d; nearest={ type:'npc', data:npc, text:`E / Tap untuk Bicara dengan ${npc.name}` }; }
            }
        });
    }

    state.activeInteractTarget = nearest;
    const ind = document.getElementById('interaction-indicator');
    if (nearest) {
        ind.classList.remove('hidden');
        document.getElementById('interaction-desc').textContent = nearest.text;
    } else {
        ind.classList.add('hidden');
    }
}

function isAllMandatoryMissionsSolved() { return npcsDatabase.slice(0,10).every(n => n.solved); }
function isAllShopItemsBought() {
    return state.hasProShoes && state.memoryVisionUnlocked && state.radarActive && state.goldenMapActive
        && state.maxStamina > 100 && state.bonusCoinMultiplier > 1 && state.hasRollerSkates && state.compassActive;
}

// ── Interaction actions ───────────────────────────────────────
function handleAutoInteract() {
    if (state.activeInteractTarget) {
        const t = state.activeInteractTarget;
        if (t.type === 'item')     tryPickupItem(t.data);
        else if (t.type === 'npc') tryInteractNpc(t.data);
        else if (t.type === 'building') enterBuilding(t.data);
        else if (t.type === 'exit') exitBuilding();
        else if (t.type === 'portal') promptPortalInteraction();
    }
}

function promptPortalInteraction() {
    const el = document.getElementById('portal-prompt-modal');
    el.style.display = 'flex';
}

function decidePortal(accept) {
    document.getElementById('portal-prompt-modal').style.display = 'none';
    if (accept) {
        const warp = document.getElementById('warp-screen-fx');
        warp.style.opacity = '1';
        playSound('levelup');
        setTimeout(() => {
            state.enteredAlternativeDimension = true;
            player.x = 3000; player.y = 3300;
            camera.x = player.x; camera.y = player.y;
            warp.style.opacity = '0';
            showFloatingIndicator('Gudang Rahasia Terlarang Terbuka! 🔮', player.x, player.y-80, '#a855f7');
        }, 1500);
    }
}

function enterBuilding(b) {
    playSound('purchase');
    state.prevOutdoorX = player.x; state.prevOutdoorY = player.y + 40;
    state.currentScene = b.id;
    player.x = 600; player.y = 1100;
    camera.x = player.x; camera.y = player.y;
    showFloatingIndicator(`Masuk ke ${b.name}`, player.x, player.y-60, '#4F46E5');
    updateHUD();
}

function exitBuilding() {
    playSound('purchase');
    state.currentScene = 'outdoor';
    player.x = state.prevOutdoorX;
    player.y = state.prevOutdoorY;
    camera.x = player.x; camera.y = player.y;
    showFloatingIndicator('Keluar ke Koridor', player.x, player.y-60, '#4F46E5');
    updateHUD();
}

function tryPickupItem(item) {
    item.pickedUp = true;
    state.inventory.push(item);
    playSound('pickup');
    showFloatingIndicator(item.icon, item.x, item.y-40, '#ec4899');
    updateAchievementProgress('first_return', 1);
    updateHUD();
}

function tryInteractNpc(npc) {
    playSound('pickup');
    state.activeDialogueNpc = npc;
    const box = document.getElementById('dialogue-box');
    box.style.display = 'block';
    document.getElementById('dialogue-emotion').textContent = npc.solved ? '😀' : (npc.emotion || '😀');
    document.getElementById('dialogue-name').textContent = npc.name;

    let msg = npc.msgNormal;
    const matchIdx = state.inventory.findIndex(it => it.id === npc.looksFor);

    if (!npc.solved && matchIdx !== -1) {
        msg = npc.msgFound;
        npc.solved = true;
        state.inventory.splice(matchIdx, 1);
        setTimeout(() => {
            let money = Math.round(npc.moneyReward * state.bonusCoinMultiplier);
            if (state.charmUnlocked) money = Math.floor(money * 1.2);
            let exp = state.bargainUnlocked ? Math.floor(npc.expReward * 1.2) : npc.expReward;
            gainEXP(exp); gainMoney(money); increaseReputation(7);
            playSound('success');
            showFloatingIndicator(`🎁 +${money} Koin`, player.x, player.y-60, '#f59e0b');
            if (npc.id === 'n7') updateAchievementProgress('vip_helper', 1);
            state.itemsReturnedCount++;
            updateAchievementProgress('helper_10', state.itemsReturnedCount);
        }, 1000);
    }

    state.dialogueTextFull = msg;
    state.dialogueWords = msg.split(' ');
    state.dialogueIndex = 0;
    state.dialogueTypedText = '';
    runTypewriter();
}

function runTypewriter() {
    if (state.dialogueIndex < state.dialogueWords.length) {
        state.dialogueTypedText += state.dialogueWords[state.dialogueIndex] + ' ';
        document.getElementById('dialogue-text').textContent = state.dialogueTypedText;
        playSound('type');
        state.dialogueIndex++;
        state.dialogueTimeout = setTimeout(runTypewriter, state.dialogueTypeSpeed);
    } else { state.dialogueTimeout = null; }
}

function handleDialogueClick() {
    if (state.dialogueTimeout) {
        clearTimeout(state.dialogueTimeout);
        state.dialogueTimeout = null;
        document.getElementById('dialogue-text').textContent = state.dialogueTextFull;
    } else { closeDialogue(); }
}

function closeDialogue() {
    document.getElementById('dialogue-box').style.display = 'none';
    state.activeDialogueNpc = null;
    updateHUD();
}

// ── Stats ─────────────────────────────────────────────────────
function gainEXP(amount) {
    state.xp += amount;
    if (state.xp >= state.xpToNextLevel) {
        state.xp -= state.xpToNextLevel;
        state.level++;
        state.skillPoints++;
        state.xpToNextLevel = Math.floor(state.xpToNextLevel * 1.3);
        playSound('levelup');
        showFloatingIndicator(`🎉 LEVEL UP (LV ${state.level})!`, player.x, player.y-80, '#4F46E5');
    }
    updateHUD();
}
function gainMoney(amount) { state.money += amount; updateAchievementProgress('rich_hero', state.money); updateHUD(); }
function increaseReputation(amount) { state.reputation = Math.min(100, state.reputation + amount); updateHUD(); }
function changeZoom(amount) { state.cameraZoom = Math.max(0.4, Math.min(1.5, state.cameraZoom + amount)); }

// ── HUD ───────────────────────────────────────────────────────
function updateHUD() {
    document.getElementById('hud-name').textContent = state.playerName;
    document.getElementById('hud-level').textContent = state.level;
    document.getElementById('hud-xp-text').textContent = `${state.xp}/${state.xpToNextLevel}`;
    document.getElementById('hud-xp-fill').style.width = `${(state.xp/state.xpToNextLevel)*100}%`;
    document.getElementById('hud-money').textContent = state.money;
    document.getElementById('hud-rep-val').textContent = state.reputation;
    document.getElementById('hud-rep-fill').style.width = `${state.reputation}%`;

    const invBadge = document.getElementById('badge-inv');
    if (state.inventory.length > 0) { invBadge.textContent = state.inventory.length; invBadge.classList.remove('hidden'); }
    else invBadge.classList.add('hidden');

    // Footer in menu
    const fr = document.getElementById('menu-footer-rep');
    const fi = document.getElementById('menu-footer-items');
    const fl = document.getElementById('menu-footer-level');
    if (fr) fr.textContent = state.reputation + '%';
    if (fi) fi.textContent = state.itemsReturnedCount;
    if (fl) fl.textContent = state.level;

    // Quest tracker sidebar
    const ul = document.getElementById('hud-quest-list');
    if (!ul) return;
    ul.innerHTML = '';
    const unresolved = npcsDatabase.filter(n => n.isQuestGiver && !n.solved);
    if (unresolved.length === 0) { ul.innerHTML = '<li class="text-emerald-500 italic">Semua Beres! 🏆</li>'; return; }
    unresolved.slice(0,3).forEach(npc => {
        const hasItem = state.inventory.some(it => it.id === npc.looksFor);
        const color = hasItem ? 'text-green-500' : 'text-yellow-500';
        const icon  = hasItem ? '⭐' : '❗';
        let gpsX = npc.x, gpsY = npc.y;
        if (npc.scene && npc.scene !== 'outdoor') {
            const b = buildings.find(b2 => b2.id === npc.scene);
            if (b) { gpsX = b.portalX; gpsY = b.portalY; }
        }
        ul.innerHTML += `<li class="mb-1.5 flex flex-col ${color}"><div class="flex items-center gap-1 font-black truncate"><span>${icon}</span><span>${npc.name}</span></div><button onclick="setGPSCoordinates(${gpsX},${gpsY})" class="text-[10px] text-indigo-500 underline text-left pointer-events-auto">GPS 📍</button></li>`;
    });
}

function setGPSCoordinates(x, y) { state.gpsTarget = {x,y}; showFloatingIndicator('📍 Navigasi GPS Aktif', player.x, player.y-60, '#3b82f6'); }
function showFloatingIndicator(text, x, y, color) { indicators.push({ text, x, y, color, life:1 }); }

// ── Menu / tabs ───────────────────────────────────────────────
function toggleMenu(tabId) {
    const modal = document.getElementById('menu-modal');
    const isOpen = modal.style.display === 'flex';
    if (!isOpen || state.activeTab !== tabId) openMenuTab(tabId);
    else closeMenuModal();
}

function openMenuTab(tabId) {
    if (document.getElementById('setting-sfx').checked) initAudio();
    document.getElementById('menu-modal').style.display = 'flex';
    switchTab(tabId);
}

function closeMenuModal() {
    document.getElementById('menu-modal').style.display = 'none';
}

function switchTab(tabId) {
    state.activeTab = tabId;
    ['inventory','quests','shop','skills','achievements','settings'].forEach(t => {
        const tab = document.getElementById(`tab-${t}`);
        const con = document.getElementById(`content-${t}`);
        if (t === tabId) {
            tab.classList.add('border-indigo-600','text-indigo-600','border-b-2');
            con.style.display = 'block';
        } else {
            tab.classList.remove('border-indigo-600','text-indigo-600','border-b-2');
            con.style.display = 'none';
        }
    });
    if (tabId === 'inventory')    renderInventoryGrid();
    if (tabId === 'quests')       renderQuestsLog();
    if (tabId === 'shop')         renderShopItems();
    if (tabId === 'skills')       renderSkillTree();
    if (tabId === 'achievements') renderAchievementsLog();
}

function toggleFullMap() {
    const el = document.getElementById('fullmap-modal');
    if (el.style.display === 'flex') el.style.display = 'none';
    else { el.style.display = 'flex'; drawFullMap(); }
}

function toggleTutorial() {
    const el = document.getElementById('tutorial-modal');
    el.style.display = (el.style.display === 'flex') ? 'none' : 'flex';
}

// ── Inventory ─────────────────────────────────────────────────
function renderInventoryGrid() {
    const c = document.getElementById('inv-grid-container');
    if (!c) return;
    c.innerHTML = '';
    if (!state.inventory.length) { c.innerHTML = '<div class="col-span-5 text-center text-gray-400 py-10 font-bold">Tas kosong.</div>'; return; }
    state.inventory.forEach(item => {
        c.innerHTML += `<div class="glass-panel p-3 border border-gray-200 text-center flex flex-col items-center shadow-sm hover:scale-105 transition-transform">
            <span class="text-4xl my-2">${item.icon}</span>
            <div class="font-extrabold text-xs text-gray-700 leading-tight">${item.name}</div>
            <div class="text-[9px] text-gray-400 mt-1 capitalize px-1.5 py-0.5 rounded-full bg-gray-100">${item.rarity}</div>
        </div>`;
    });
}

// ── Quests log ────────────────────────────────────────────────
function renderQuestsLog() {
    const c = document.getElementById('quest-list-container');
    if (!c) return;
    c.innerHTML = '';
    npcsDatabase.forEach(npc => {
        if (!npc.isQuestGiver) return;
        const hasItem = state.inventory.some(it => it.id === npc.looksFor);
        let gpsX = npc.x, gpsY = npc.y, loc = 'Luar Ruangan';
        if (npc.scene && npc.scene !== 'outdoor') {
            const b = buildings.find(b2 => b2.id === npc.scene);
            if (b) { gpsX=b.portalX; gpsY=b.portalY; loc=`Dalam ${b.name}`; }
        }
        c.innerHTML += `<div class="p-3.5 rounded-xl border ${npc.solved?'bg-green-50 border-green-200':'bg-gray-50 border-gray-200'} flex justify-between items-center shadow-sm">
            <div>
                <div class="font-extrabold text-sm text-gray-800">${npc.solved?'✅':'❗'} Misi: ${npc.name} (${loc})</div>
                <div class="text-xs text-gray-500 mt-1">${npc.msgNormal}</div>
                <div class="text-[10px] text-indigo-500 mt-1.5 font-bold">Imbalan: 💰${npc.moneyReward} / ✨${npc.expReward}</div>
            </div>
            <div>${npc.solved
                ? '<span class="bg-green-100 text-green-700 text-xs px-2.5 py-1 rounded-full font-bold">Selesai</span>'
                : `<button onclick="setGPSCoordinates(${gpsX},${gpsY});closeMenuModal();" class="${hasItem?'bg-indigo-600 text-white':'bg-white border text-gray-600'} text-[11px] px-3 py-1.5 rounded-lg font-bold shadow-sm">${hasItem?'Kirim 📍':'Cari 🧭'}</button>`
            }</div>
        </div>`;
    });
}

// ── Shop ──────────────────────────────────────────────────────
const SHOP_CATALOG = [
    { id:'shoes',       name:'Sepatu Olahraga Pro', icon:'👟', price:100, get bought(){ return state.hasProShoes; } },
    { id:'crystal',     name:'Lensa Memori Visual', icon:'🔮', price:150, get bought(){ return state.memoryVisionUnlocked; } },
    { id:'drone',       name:'Drone Pemindai Barang',icon:'🛸', price:120, get bought(){ return state.radarActive; } },
    { id:'golden_map',  name:'Peta Navigasi Emas',  icon:'🗺️', price:200, get bought(){ return state.goldenMapActive; } },
    { id:'energy_drink',name:'Minuman Energi Kantin',icon:'🔋', price:80,  get bought(){ return state.maxStamina > 100; } },
    { id:'magnet',      name:'Koin Magnet (+20%)',  icon:'🧲', price:250, get bought(){ return state.bonusCoinMultiplier > 1; } },
    { id:'skates',      name:'Sepatu Roda Siswa',   icon:'🛼', price:300, get bought(){ return state.hasRollerSkates; } },
    { id:'compass',     name:'Kompas Ajaib Sekolah',icon:'🧭', price:90,  get bought(){ return state.compassActive; } }
];

function renderShopItems() {
    document.getElementById('shop-wallet').textContent = state.money;
    const c = document.getElementById('shop-items-container');
    if (!c) return;
    c.innerHTML = '';
    SHOP_CATALOG.forEach(item => {
        c.innerHTML += `<div class="shop-slot p-2 flex flex-col items-center justify-between text-center hover:scale-105 transition-transform">
            <div class="text-4xl my-2">${item.icon}</div>
            <div class="font-black text-[10px] text-yellow-900 leading-tight h-8 flex items-center justify-center">${item.name}</div>
            ${item.bought
                ? `<button class="bg-gray-400 text-white border-2 border-white rounded-full px-4 py-1 mt-1 text-xs font-black opacity-70 cursor-not-allowed">SOLD</button>`
                : `<button onclick="purchaseShopItem('${item.id}',${item.price})" class="shop-buy-btn text-white rounded-full px-4 py-1 mt-1 text-xs font-black w-full">💰 ${item.price}</button>`
            }
        </div>`;
    });
}

function purchaseShopItem(id, price) {
    if (state.money < price) { alert('Koin Anda tidak cukup!'); return; }
    state.money -= price; playSound('purchase');
    if (id==='shoes')        state.hasProShoes = true;
    if (id==='crystal')      state.memoryVisionUnlocked = true;
    if (id==='drone')        state.radarActive = true;
    if (id==='golden_map')   state.goldenMapActive = true;
    if (id==='energy_drink') state.maxStamina += 50;
    if (id==='magnet')       state.bonusCoinMultiplier = 1.2;
    if (id==='skates')       state.hasRollerSkates = true;
    if (id==='compass')      state.compassActive = true;
    updateHUD(); renderShopItems();
}

// ── Skill tree ────────────────────────────────────────────────
function renderSkillTree() {
    document.getElementById('skill-points-display').textContent = state.skillPoints;
    const container = document.getElementById('skills-container');
    const svgCanvas = document.getElementById('skill-lines');
    if (!container || !svgCanvas) return;
    container.innerHTML = ''; svgCanvas.innerHTML = '';

    const skillNodes = [
        { id:'echo',    name:'Echo Memori',   icon:'🔊', cost:1, color:'#3b82f6', x:50, y:15, req:null,     unlocked:state.memoryEchoUnlocked },
        { id:'vision',  name:'Lensa Vision',  icon:'👁️', cost:2, color:'#3b82f6', x:50, y:45, req:'echo',   unlocked:state.memoryVisionUnlocked },
        { id:'recall',  name:'Total Recall',  icon:'🧠', cost:3, color:'#3b82f6', x:50, y:80, req:'vision', unlocked:state.memoryRecallUnlocked },
        { id:'stam1',   name:'Stamina Regen', icon:'🫁', cost:1, color:'#eab308', x:20, y:35, req:null,     unlocked:state.staminaUnlocked },
        { id:'sprint',  name:'Sprint Cost-',  icon:'⚡', cost:2, color:'#eab308', x:20, y:70, req:'stam1',  unlocked:state.sprintUnlocked },
        { id:'charm',   name:'Charm Rep+',    icon:'😊', cost:1, color:'#10b981', x:80, y:35, req:null,     unlocked:state.charmUnlocked },
        { id:'haggle',  name:'Bargain EXP+',  icon:'🤝', cost:2, color:'#10b981', x:80, y:70, req:'charm',  unlocked:state.bargainUnlocked },
    ];

    skillNodes.forEach(node => {
        if (!node.req) return;
        const parent = skillNodes.find(n => n.id === node.req);
        if (!parent) return;
        const line = document.createElementNS('http://www.w3.org/2000/svg','line');
        line.setAttribute('x1',`${parent.x}%`); line.setAttribute('y1',`${parent.y}%`);
        line.setAttribute('x2',`${node.x}%`);   line.setAttribute('y2',`${node.y}%`);
        line.setAttribute('stroke', node.unlocked ? node.color : '#334155');
        line.setAttribute('stroke-width', node.unlocked ? '6' : '3');
        svgCanvas.appendChild(line);
    });

    skillNodes.forEach(sk => {
        const parentOk = !sk.req || skillNodes.find(n=>n.id===sk.req).unlocked;
        let btnHtml;
        if (sk.unlocked)
            btnHtml = `<div class="bg-gray-800 text-white border-4 rounded-full w-14 h-14 flex items-center justify-center text-2xl shadow-lg mx-auto" style="border-color:${sk.color};box-shadow:0 0 15px ${sk.color}">${sk.icon}</div>`;
        else if (parentOk)
            btnHtml = `<button onclick="unlockSkillNode('${sk.id}',${sk.cost})" class="bg-gray-700 hover:bg-gray-600 text-white border-2 border-gray-400 rounded-full w-14 h-14 flex flex-col items-center justify-center text-xl shadow-lg mx-auto hover:scale-110 transition">${sk.icon}<span class="text-[8px] font-black -mt-1 text-yellow-400">${sk.cost} SP</span></button>`;
        else
            btnHtml = `<div class="bg-gray-900 text-gray-600 border-2 border-gray-700 rounded-full w-14 h-14 flex items-center justify-center text-xl shadow-lg mx-auto opacity-50 cursor-not-allowed">🔒</div>`;
        container.innerHTML += `<div class="absolute transform -translate-x-1/2 -translate-y-1/2 text-center" style="left:${sk.x}%;top:${sk.y}%">
            ${btnHtml}
            <div class="mt-2 font-black text-[10px] text-white bg-black/50 px-2 py-0.5 rounded shadow whitespace-nowrap">${sk.name}</div>
        </div>`;
    });
}

function unlockSkillNode(id, cost) {
    if (state.skillPoints < cost) { alert('Skill Point tidak cukup!'); return; }
    state.skillPoints -= cost; playSound('purchase');
    if (id==='echo')    state.memoryEchoUnlocked    = true;
    if (id==='vision')  state.memoryVisionUnlocked  = true;
    if (id==='recall')  state.memoryRecallUnlocked  = true;
    if (id==='stam1')   state.staminaUnlocked       = true;
    if (id==='sprint')  state.sprintUnlocked        = true;
    if (id==='charm')   state.charmUnlocked         = true;
    if (id==='haggle')  state.bargainUnlocked       = true;
    renderSkillTree();
}

// ── Achievements ──────────────────────────────────────────────
function renderAchievementsLog() {
    const c = document.getElementById('achievements-container');
    if (!c) return;
    c.innerHTML = '';
    state.achievements.forEach(ach => {
        const pct = Math.min(100, Math.floor((ach.current/ach.countGoal)*100));
        c.innerHTML += `<div class="p-3 rounded-xl border ${ach.solved?'bg-amber-50 border-amber-200':'bg-white border-gray-200'} flex gap-3 items-center shadow-sm">
            <div class="text-3xl">${ach.solved?'🥇':'🥈'}</div>
            <div class="flex-1">
                <div class="font-extrabold text-sm ${ach.solved?'text-amber-800':'text-gray-700'}">${ach.title}</div>
                <div class="text-[10px] text-gray-400">${ach.desc}</div>
                <div class="w-full bg-gray-100 h-1.5 rounded-full mt-2 overflow-hidden"><div class="bg-amber-400 h-full" style="width:${pct}%"></div></div>
            </div>
            <div class="text-[10px] font-black text-gray-500">${ach.current}/${ach.countGoal}</div>
        </div>`;
    });
}

function updateAchievementProgress(id, count) {
    const ach = state.achievements.find(a => a.id === id);
    if (ach && !ach.solved) {
        ach.current = count;
        if (ach.current >= ach.countGoal) {
            ach.solved = true;
            showFloatingIndicator(`🏆 Prestasi: ${ach.title}`, player.x, player.y-100, '#eab308');
        }
    }
}

// ── Settings helpers ──────────────────────────────────────────
function toggleJoystickSetting(checked) {
    document.getElementById('mobile-joystick-wrapper').style.display = checked ? 'block' : 'none';
}

// ── Save / Load ───────────────────────────────────────────────
function quickSaveGame(alertUser) {
    const data = {
        playerName:state.playerName, level:state.level, xp:state.xp, money:state.money,
        reputation:state.reputation, itemsReturnedCount:state.itemsReturnedCount,
        hasProShoes:state.hasProShoes, hasRollerSkates:state.hasRollerSkates,
        bonusCoinMultiplier:state.bonusCoinMultiplier, maxStamina:state.maxStamina,
        memoryVisionUnlocked:state.memoryVisionUnlocked, memoryEchoUnlocked:state.memoryEchoUnlocked,
        memoryRecallUnlocked:state.memoryRecallUnlocked, staminaUnlocked:state.staminaUnlocked,
        sprintUnlocked:state.sprintUnlocked, charmUnlocked:state.charmUnlocked,
        bargainUnlocked:state.bargainUnlocked, radarActive:state.radarActive,
        goldenMapActive:state.goldenMapActive, compassActive:state.compassActive,
        skillPoints:state.skillPoints,
        playerX:player.x, playerY:player.y, inventory:state.inventory,
        solvedNpcs:npcsDatabase.filter(n=>n.solved).map(n=>n.id),
        currentScene:state.currentScene, prevOutdoorX:state.prevOutdoorX, prevOutdoorY:state.prevOutdoorY,
        playTimerSeconds:state.playTimerSeconds, enteredAlternativeDimension:state.enteredAlternativeDimension
    };
    localStorage.setItem('returnRushAdventureSave', JSON.stringify(data));
    state.lastSaveTime = Date.now();
    if (alertUser) alert('Game berhasil disimpan!');
}

function loadGameData() {
    const raw = localStorage.getItem('returnRushAdventureSave');
    if (!raw) return false;
    const d = JSON.parse(raw);
    Object.assign(state, {
        playerName: d.playerName||'Hero', level:d.level||1, xp:d.xp||0,
        money:d.money||150, reputation:d.reputation||0, itemsReturnedCount:d.itemsReturnedCount||0,
        hasProShoes:d.hasProShoes||false, hasRollerSkates:d.hasRollerSkates||false,
        bonusCoinMultiplier:d.bonusCoinMultiplier||1, maxStamina:d.maxStamina||100,
        memoryVisionUnlocked:d.memoryVisionUnlocked||false, memoryEchoUnlocked:d.memoryEchoUnlocked||false,
        memoryRecallUnlocked:d.memoryRecallUnlocked||false, staminaUnlocked:d.staminaUnlocked||false,
        sprintUnlocked:d.sprintUnlocked||false, charmUnlocked:d.charmUnlocked||false,
        bargainUnlocked:d.bargainUnlocked||false, radarActive:d.radarActive||false,
        goldenMapActive:d.goldenMapActive||false, compassActive:d.compassActive||false,
        skillPoints:d.skillPoints||0,
        inventory:d.inventory||[], currentScene:d.currentScene||'outdoor',
        prevOutdoorX:d.prevOutdoorX||3000, prevOutdoorY:d.prevOutdoorY||3000,
        playTimerSeconds:d.playTimerSeconds!==undefined?d.playTimerSeconds:900,
        enteredAlternativeDimension:d.enteredAlternativeDimension||false
    });
    player.x = d.playerX||3000; player.y = d.playerY||3000;
    if (d.solvedNpcs) {
        npcsDatabase.forEach(npc => {
            if (d.solvedNpcs.includes(npc.id)) {
                npc.solved = true;
                const item = itemsDatabase.find(it=>it.id===npc.looksFor);
                if (item) item.pickedUp = true;
            }
        });
    }
    if (state.inventory) state.inventory.forEach(inv => {
        const item = itemsDatabase.find(it=>it.id===inv.id);
        if (item) item.pickedUp = true;
    });
    return true;
}

function resetGameData() {
    if (confirm('Apakah Anda yakin ingin menghapus seluruh progres permainan?')) {
        localStorage.removeItem('returnRushAdventureSave');
        location.reload();
    }
}

function quickSaveAndExit() {
    quickSaveGame(false);
    state.isRunning = false;
    if (state.timerIntervalId) clearInterval(state.timerIntervalId);
    document.getElementById('menu-modal').style.display = 'none';
    document.getElementById('main-menu').style.display = '';
    checkSaveGameExists();
    alert('Permainan Berhasil Disimpan! Kembali ke Menu Utama.');
}

function checkSaveGameExists() {
    const btn = document.getElementById('btn-continue');
    if (!btn) return;
    btn.classList.toggle('hidden', !localStorage.getItem('returnRushAdventureSave'));
}

// ── Start / continue ──────────────────────────────────────────
function startGame() {
    const name = document.getElementById('input-player-name').value.trim();
    if (name) state.playerName = name;
    document.getElementById('main-menu').style.display = 'none';
    handleResize();
    updateHUD();
    state.isRunning = true;
    initAudio();
    startPlayTimer();
    gameMainLoop();
    document.getElementById('tutorial-modal').style.display = 'flex';
}

function continueGame() {
    const name = document.getElementById('input-player-name').value.trim();
    if (name) state.playerName = name;
    document.getElementById('main-menu').style.display = 'none';
    handleResize();
    loadGameData();
    updateHUD();
    state.isRunning = true;
    initAudio();
    startPlayTimer();
    gameMainLoop();
    document.getElementById('tutorial-modal').style.display = 'flex';
}

// ── Canvas click (world interaction) ─────────────────────────
function setupCanvasClick() {
    canvas.addEventListener('click', e => {
        if (state.activeDialogueNpc) return;
        const rect = canvas.getBoundingClientRect();
        const worldX = (e.clientX - rect.left  - vw/2) / state.cameraZoom + camera.x;
        const worldY = (e.clientY - rect.top   - vh/2) / state.cameraZoom + camera.y;
        const R = state.memoryRecallUnlocked ? 120 : 55;

        if (state.currentScene === 'outdoor' && isAllMandatoryMissionsSolved()) {
            if (Math.hypot(worldX-3000, worldY-3000) < 80) { promptPortalInteraction(); return; }
        }
        for (const item of itemsDatabase) {
            if (!item.pickedUp && (item.scene||'outdoor') === state.currentScene && Math.hypot(worldX-item.x, worldY-item.y) < R) { tryPickupItem(item); return; }
        }
        for (const npc of npcsDatabase) {
            if ((npc.scene||'outdoor') === state.currentScene && Math.hypot(worldX-npc.x, worldY-npc.y) < R) { tryInteractNpc(npc); return; }
        }
        if (state.currentScene === 'outdoor') {
            for (const b of buildings) {
                if (Math.hypot(worldX-b.portalX, worldY-b.portalY) < 60) { enterBuilding(b); return; }
            }
        } else {
            if (Math.hypot(worldX-600, worldY-1160) < 70) { exitBuilding(); return; }
        }
    });
}

// ── Main render loop ──────────────────────────────────────────
function drawGame() {
    if (!ctx) return;
    ctx.fillStyle = '#111827';
    ctx.fillRect(0, 0, vw, vh);

    ctx.save();
    ctx.translate(vw/2, vh/2);
    ctx.scale(state.cameraZoom, state.cameraZoom);
    ctx.translate(-camera.x, -camera.y);

    const time = Date.now() / 600;
    const hideDecor = document.getElementById('setting-graphics') && document.getElementById('setting-graphics').checked;

    if (state.currentScene === 'outdoor') {
        // Ground
        ctx.fillStyle = '#a7f3d0';
        ctx.fillRect(0, 0, WORLD_SIZE, WORLD_SIZE);

        // Grid
        ctx.strokeStyle = 'rgba(0,0,0,0.06)';
        ctx.lineWidth = 1;
        ctx.beginPath();
        for (let i = 0; i < WORLD_SIZE; i += 80) { ctx.moveTo(i,0); ctx.lineTo(i,WORLD_SIZE); ctx.moveTo(0,i); ctx.lineTo(WORLD_SIZE,i); }
        ctx.stroke();

        // Zone overlays
        for (const k in mapZonesLayout) {
            const z = mapZonesLayout[k];
            ctx.globalAlpha = 0.35;
            ctx.fillStyle = state.enteredAlternativeDimension ? '#6d28d9' : z.color;
            ctx.fillRect(z.x, z.y, z.w, z.h);
            ctx.globalAlpha = 1;
            ctx.strokeStyle = state.enteredAlternativeDimension ? 'rgba(168,85,247,0.8)' : 'rgba(0,0,0,0.15)';
            ctx.lineWidth = 3;
            ctx.strokeRect(z.x, z.y, z.w, z.h);
            if (!hideDecor) {
                ctx.font = '700 24px Nunito';
                ctx.fillStyle = 'rgba(0,0,0,0.25)';
                ctx.textAlign = 'left';
                ctx.textBaseline = 'top';
                ctx.fillText(z.name, z.x+20, z.y+20);
            }
        }

        // GPS line
        if (state.gpsTarget) {
            ctx.strokeStyle = 'rgba(79,70,229,0.6)'; ctx.lineWidth = 8;
            ctx.setLineDash([12,8]);
            ctx.beginPath(); ctx.moveTo(player.x, player.y); ctx.lineTo(state.gpsTarget.x, state.gpsTarget.y); ctx.stroke();
            ctx.setLineDash([]);
            ctx.fillStyle = '#ef4444'; ctx.beginPath(); ctx.arc(state.gpsTarget.x, state.gpsTarget.y, 14, 0, Math.PI*2); ctx.fill();
            if (state.compassActive) {
                const dist = Math.floor(Math.hypot(player.x-state.gpsTarget.x, player.y-state.gpsTarget.y));
                ctx.fillStyle = '#3b82f6'; ctx.font = 'bold 16px Nunito'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
                ctx.fillText(`${dist}m`, player.x, player.y-50);
            }
        }

        // Portal
        if (isAllMandatoryMissionsSolved()) {
            ctx.strokeStyle = '#c084fc'; ctx.lineWidth = 8;
            ctx.setLineDash([15,5]);
            ctx.beginPath(); ctx.arc(3000, 3000, 42+Math.sin(time*2)*5, 0, Math.PI*2); ctx.stroke();
            ctx.setLineDash([]);
            ctx.fillStyle = '#a855f7'; ctx.beginPath(); ctx.arc(3000,3000,26+Math.cos(time*3)*4,0,Math.PI*2); ctx.fill();
            ctx.fillStyle = '#fff'; ctx.font = 'bold 13px Nunito'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
            ctx.fillText('🌀 TEROWONGAN', 3000, 2940+Math.sin(time*3)*4);
        }

        // Buildings
        buildings.forEach(b => {
            // Shadow
            ctx.fillStyle = 'rgba(0,0,0,0.12)'; ctx.fillRect(b.x+6, b.y+6, b.w, b.h);
            // Wall
            ctx.fillStyle = b.baseColor || '#7f1d1d'; ctx.fillRect(b.x, b.y, b.w, b.h);
            // Roof band
            ctx.fillStyle = 'rgba(0,0,0,0.25)'; ctx.fillRect(b.x, b.y, b.w, 18);
            // Windows
            ctx.fillStyle = '#bae6fd';
            for (let wx = b.x+30; wx < b.x+b.w-30; wx += 50) {
                ctx.fillRect(wx, b.y+30, 22, 35); ctx.fillRect(wx, b.y+85, 22, 35);
            }
            // Door glow
            ctx.fillStyle = '#fde68a'; ctx.fillRect(b.portalX-28, b.portalY-18, 56, 18);
            ctx.strokeStyle = '#f59e0b'; ctx.lineWidth = 2; ctx.strokeRect(b.portalX-28, b.portalY-18, 56, 18);
            // Icon & name
            ctx.font = '28px sans-serif'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
            ctx.fillText(b.icon, b.x+b.w/2, b.y+b.h/2);
            ctx.fillStyle = '#fff'; ctx.font = 'bold 14px Nunito'; ctx.textBaseline = 'alphabetic';
            ctx.fillText(b.name, b.x+b.w/2, b.y+22);
        });

        // Scenery props
        state.scenery.forEach(prop => {
            if (prop.x < camera.x - vw/state.cameraZoom - 100 || prop.x > camera.x + vw/state.cameraZoom + 100) return;
            if (prop.y < camera.y - vh/state.cameraZoom - 100 || prop.y > camera.y + vh/state.cameraZoom + 100) return;
            ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
            const sway = prop.swayOffset !== undefined ? Math.sin(time + prop.swayOffset) * 4 : 0;
            if (prop.type === 'mango_tree') {
                ctx.fillStyle = 'rgba(0,0,0,0.12)'; ctx.beginPath(); ctx.ellipse(prop.x, prop.y+prop.size/2, prop.size/2, prop.size/4, 0, 0, Math.PI*2); ctx.fill();
                ctx.fillStyle = '#78350f'; ctx.fillRect(prop.x-4, prop.y, 8, prop.size);
                ctx.fillStyle = state.enteredAlternativeDimension ? '#c084fc' : '#047857';
                ctx.beginPath(); ctx.arc(prop.x+sway, prop.y-10, prop.size/1.3, 0, Math.PI*2); ctx.fill();
                ctx.fillStyle = '#fbbf24'; ctx.beginPath(); ctx.arc(prop.x+sway-10, prop.y-15, 4, 0, Math.PI*2); ctx.arc(prop.x+sway+15, prop.y-5, 4, 0, Math.PI*2); ctx.fill();
            } else if (!hideDecor) {
                switch(prop.type) {
                    case 'plant_pot':
                        ctx.fillStyle = '#b45309'; ctx.fillRect(prop.x-10, prop.y-5, 20, 15);
                        ctx.fillStyle = '#22c55e'; ctx.beginPath(); ctx.arc(prop.x, prop.y-15, 12, 0, Math.PI*2); ctx.fill();
                        break;
                    case 'bench':
                        ctx.fillStyle = '#8b4513'; ctx.fillRect(prop.x-15, prop.y-5, 30, 10);
                        ctx.fillStyle = '#5c2e0b'; ctx.fillRect(prop.x-15, prop.y-10, 30, 5);
                        break;
                    case 'fountain':
                        ctx.fillStyle = '#cbd5e1'; ctx.beginPath(); ctx.arc(prop.x, prop.y, 35, 0, Math.PI*2); ctx.fill();
                        ctx.fillStyle = '#38bdf8'; ctx.beginPath(); ctx.arc(prop.x, prop.y, 25, 0, Math.PI*2); ctx.fill();
                        ctx.fillStyle = '#fff'; ctx.beginPath(); ctx.arc(prop.x, prop.y, 5+Math.sin(time*5)*2, 0, Math.PI*2); ctx.fill();
                        break;
                    case 'pond':
                        ctx.fillStyle = '#0284c7'; ctx.beginPath(); ctx.arc(prop.x, prop.y, 60, 0, Math.PI*2); ctx.fill();
                        ctx.strokeStyle = '#1e293b'; ctx.lineWidth = 4; ctx.stroke();
                        ctx.fillStyle = '#fb923c'; ctx.beginPath(); ctx.ellipse(prop.x-20+Math.sin(time)*15, prop.y-10+Math.cos(time)*15, 6, 3, time, 0, Math.PI*2); ctx.fill();
                        break;
                    case 'football_goal_left':
                    case 'football_goal_right':
                        ctx.strokeStyle = '#fff'; ctx.lineWidth = 4; ctx.strokeRect(prop.x-20, prop.y-50, 40, 100); break;
                    case 'canteen_table':
                        ctx.fillStyle = '#78350f'; ctx.fillRect(prop.x-25, prop.y-15, 50, 30);
                        ctx.fillStyle = '#b45309'; ctx.fillRect(prop.x-30, prop.y-25, 60, 10); ctx.fillRect(prop.x-30, prop.y+15, 60, 10); break;
                    case 'bulletin_board':
                        ctx.fillStyle = '#d97706'; ctx.fillRect(prop.x-20, prop.y-30, 40, 25);
                        ctx.fillStyle = '#fff'; ctx.fillRect(prop.x-15, prop.y-25, 10, 12);
                        ctx.fillStyle = '#38bdf8'; ctx.fillRect(prop.x+5, prop.y-28, 8, 10); break;
                    case 'lamp':
                        ctx.fillStyle = '#475569'; ctx.fillRect(prop.x-3, prop.y-40, 6, 40);
                        ctx.fillStyle = '#fef08a'; ctx.beginPath(); ctx.arc(prop.x, prop.y-40, 8, 0, Math.PI*2); ctx.fill(); break;
                }
            }
        });

        // Clouds
        if (!hideDecor) {
            ctx.fillStyle = 'rgba(255,255,255,0.35)';
            state.cloudList.forEach(c => {
                ctx.beginPath();
                ctx.arc(c.x, c.y, c.size/2, 0, Math.PI*2);
                ctx.arc(c.x+c.size/3, c.y-c.size/6, c.size/2.5, 0, Math.PI*2);
                ctx.arc(c.x-c.size/3, c.y+c.size/6, c.size/3, 0, Math.PI*2);
                ctx.fill();
            });
        }

    } else {
        // ── INDOOR ─────────────────────────────────────────────────
        const scenes = {
            library:     '#7c2d12', office:  '#f1f5f9', museum:     '#172554',
            supermarket: '#f8fafc', hospital:'#ecfeff', school_bldg:'#fef3c7'
        };
        ctx.fillStyle = scenes[state.currentScene] || '#1e1b4b';
        ctx.fillRect(0, 0, INDOOR_SIZE, INDOOR_SIZE);

        // Floor tiles
        ctx.strokeStyle = 'rgba(0,0,0,0.07)'; ctx.lineWidth = 1;
        ctx.beginPath();
        for (let i = 60; i < INDOOR_SIZE; i += 60) { ctx.moveTo(i,0); ctx.lineTo(i,INDOOR_SIZE); ctx.moveTo(0,i); ctx.lineTo(INDOOR_SIZE,i); }
        ctx.stroke();

        // Scene-specific furniture
        if (state.currentScene === 'library') {
            ctx.fillStyle = '#451a03';
            for (let sy = 100; sy <= 1000; sy += 180) {
                if (sy > 450 && sy < 750) continue;
                ctx.fillRect(80, sy, 40, 110);
                ['#10b981','#3b82f6','#ef4444'].forEach((col,i) => { ctx.fillStyle=col; ctx.fillRect(85, sy+10+i*30, 30, 18); });
                ctx.fillStyle = '#451a03';
            }
        } else if (state.currentScene === 'hospital') {
            for (let x = 150; x <= 1050; x += 250) for (let y = 150; y <= 850; y += 300) {
                ctx.fillStyle = '#fff'; ctx.fillRect(x, y, 100, 160); ctx.strokeStyle = '#94a3b8'; ctx.strokeRect(x, y, 100, 160);
                ctx.fillStyle = '#bae6fd'; ctx.fillRect(x+20, y+10, 60, 30);
            }
        } else if (state.currentScene === 'supermarket') {
            for (let x = 200; x <= 1000; x += 200) {
                ctx.fillStyle = '#cbd5e1'; ctx.fillRect(x, 200, 60, 600);
                [['#ef4444',220],['#3b82f6',260],['#10b981',300]].forEach(([c,yo]) => { ctx.fillStyle=c; ctx.fillRect(x+10, yo, 40, 20); });
            }
        } else if (state.currentScene === 'museum') {
            ctx.fillStyle = '#7c2d12'; ctx.fillRect(200, 50, 800, 200);
            ctx.fillStyle = '#ef4444'; ctx.fillRect(200, 50, 80, 200); ctx.fillRect(920, 50, 80, 200);
        } else if (state.currentScene === 'office') {
            ctx.fillStyle = '#b91c1c'; ctx.fillRect(520, 300, 160, 900);
            ctx.strokeStyle = '#fbbf24'; ctx.lineWidth = 5; ctx.strokeRect(520, 300, 160, 900);
            ctx.fillStyle = '#1e1b4b'; ctx.fillRect(450, 160, 300, 100);
        } else if (state.currentScene === 'school_bldg') {
            ctx.fillStyle = '#78350f';
            for (let x = 200; x <= 1000; x += 150) for (let y = 300; y <= 900; y += 150) ctx.fillRect(x, y, 80, 50);
        }

        // Exit door
        ctx.fillStyle = '#1e293b'; ctx.fillRect(550, 1160, 100, 40);
        ctx.fillStyle = '#e11d48'; ctx.fillRect(550, 1140, 100, 20);
        ctx.fillStyle = '#fff'; ctx.font = '800 12px Nunito'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
        ctx.fillText('🚪 KELUAR', 600, 1165);
    }

    // ── Items (both scenes)
    itemsDatabase.forEach(it => {
        if (!it.pickedUp && (it.scene||'outdoor') === state.currentScene) {
            const bobY = Math.sin(time*3)*6;
            ctx.fillStyle = 'rgba(0,0,0,0.18)'; ctx.beginPath(); ctx.ellipse(it.x, it.y+16, 12, 4, 0, 0, Math.PI*2); ctx.fill();
            ctx.font = '34px sans-serif'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
            ctx.fillText(it.icon, it.x, it.y+bobY);
            if (state.memoryVisionUnlocked) {
                ctx.strokeStyle = 'rgba(236,72,153,0.4)'; ctx.lineWidth = 3; ctx.beginPath(); ctx.arc(it.x, it.y+bobY, 26, 0, Math.PI*2); ctx.stroke();
            }
        }
    });

    // ── NPCs
    npcsDatabase.forEach(npc => {
        if ((npc.scene||'outdoor') === state.currentScene) {
            drawCharacter(ctx, npc.x, npc.y, npc.skin||'#fcd34d', npc.shirt||'#475569', npc.pants||'#1e293b', false, npc.animFrame||0, npc.isMoving, npc.direction);
            if (npc.isQuestGiver) {
                const hasItem = state.inventory.some(i => i.id === npc.looksFor);
                ctx.font = 'bold 22px Nunito';
                ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
                if (npc.solved) { ctx.fillStyle = '#ec4899'; ctx.fillText('❤️', npc.x, npc.y-48); }
                else { ctx.fillStyle = hasItem ? '#10b981' : '#f59e0b'; ctx.fillText(hasItem?'⭐':'❓', npc.x, npc.y-48+Math.sin(time*3.5)*4); }
            }
        }
    });

    // ── Player
    drawCharacter(ctx, player.x, player.y, player.skin, player.shirt, player.pants, true, player.animFrame, player.moving, player.dir);

    // Roller skate marker
    if (state.hasRollerSkates) {
        ctx.fillStyle = '#f43f5e'; ctx.fillRect(player.x-12, player.y+16, 24, 4);
    }

    // Night overlay
    if (state.ambientColor !== 'rgba(0,0,0,0)') {
        ctx.fillStyle = state.ambientColor;
        ctx.fillRect(camera.x-vw/state.cameraZoom, camera.y-vh/state.cameraZoom, vw/state.cameraZoom*2, vh/state.cameraZoom*2);
    }

    // Floating indicators
    for (let i = indicators.length-1; i >= 0; i--) {
        const ind = indicators[i];
        ctx.font = 'bold 20px Nunito'; ctx.fillStyle = ind.color; ctx.globalAlpha = ind.life;
        ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
        ctx.fillText(ind.text, ind.x, ind.y);
        ctx.globalAlpha = 1;
        ind.y  -= 1.2;
        ind.life -= 0.018;
        if (ind.life <= 0) indicators.splice(i,1);
    }

    ctx.restore();
}

let lastTimestamp = 0;
function gameMainLoop(timestamp) {
    if (!state.isRunning) return;
    if (timestamp - lastTimestamp >= 16) {
        updateGame();
        drawGame();
        lastTimestamp = timestamp;
    }
    requestAnimationFrame(gameMainLoop);
}

// ── Boot: wait for DOM ────────────────────────────────────────
document.addEventListener('DOMContentLoaded', () => {
    // Assign DOM refs
    canvas        = document.getElementById('gameCanvas');
    ctx           = canvas.getContext('2d', { alpha: false });
    miniMapCanvas = document.getElementById('miniMapCanvas');
    fullMapCanvas = document.getElementById('fullMapCanvas');
    mctx          = miniMapCanvas.getContext('2d');
    fctx          = fullMapCanvas.getContext('2d');
    joystickOuter = document.getElementById('joystick-outer');
    joystickInner = document.getElementById('joystick-inner');
    btnSprint     = document.getElementById('btn-sprint');
    btnInteract   = document.getElementById('btn-interact');

    // Set canvas size
    vw = canvas.width  = window.innerWidth;
    vh = canvas.height = window.innerHeight;
    miniMapCanvas.width  = 100;
    miniMapCanvas.height = 100;

    window.addEventListener('resize', handleResize);

    // Generate world
    generateClassrooms();
    generateWorldProps();

    // Check for save data
    checkSaveGameExists();

    // ── Joystick events
    joystickOuter.addEventListener('touchstart', e => {
        e.preventDefault();
        const touch = e.touches[0];
        const rect = joystickOuter.getBoundingClientRect();
        state.touchInput.startX = rect.left + rect.width/2;
        state.touchInput.startY = rect.top  + rect.height/2;
        state.touchInput.active = true;
        processTouch(touch);
    }, { passive:false });

    joystickOuter.addEventListener('touchmove', e => {
        e.preventDefault();
        if (state.touchInput.active) processTouch(e.touches[0]);
    }, { passive:false });

    const cancelJoystick = () => {
        state.touchInput.active = false;
        state.touchInput.power  = 0;
        joystickInner.style.transform = 'translate(-50%, -50%)';
    };
    joystickOuter.addEventListener('touchend',    cancelJoystick);
    joystickOuter.addEventListener('touchcancel', cancelJoystick);

    // ── Sprint button
    btnSprint.addEventListener('touchstart', e => { e.preventDefault(); touchSprint = true; }, { passive:false });
    btnSprint.addEventListener('touchend',   () => { touchSprint = false; });
    btnSprint.addEventListener('mousedown',  () => { touchSprint = true; });
    btnSprint.addEventListener('mouseup',    () => { touchSprint = false; });

    // ── Interact button
    btnInteract.addEventListener('click', handleAutoInteract);

    // ── Canvas click
    setupCanvasClick();

    // ── Keyboard
    window.addEventListener('keydown', e => {
        const key = e.key.toLowerCase();
        state.keys[key] = true;
        if (key === 'e' || key === ' ')   { e.preventDefault(); handleAutoInteract(); }
        if (key === 'm')                   toggleFullMap();
        else if (key === 'g')              toggleMenu('inventory');
        else if (key === 'q')              toggleMenu('quests');
        else if (key === 't')              toggleMenu('shop');
        else if (key === 'f')              toggleMenu('skills');
        else if (key === 'x')              toggleMenu('achievements');
        else if (key === 'escape')         toggleMenu('settings');
    });
    window.addEventListener('keyup', e => { state.keys[e.key.toLowerCase()] = false; });
});

function processTouch(touch) {
    const dx = touch.clientX - state.touchInput.startX;
    const dy = touch.clientY - state.touchInput.startY;
    const dist = Math.hypot(dx, dy);
    const maxR  = 50;
    const angle = Math.atan2(dy, dx);
    const power = Math.min(dist/maxR, 1);
    state.touchInput.angle = angle;
    state.touchInput.power = power;
    joystickInner.style.transform = `translate(calc(-50% + ${Math.cos(angle)*power*maxR}px), calc(-50% + ${Math.sin(angle)*power*maxR}px))`;
}
