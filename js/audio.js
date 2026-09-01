// -------------------------------------------------------------
// 🔊 WEB AUDIO & 8-BIT RETRO RPG BGM & SFX ENGINE (INDEPENDENT CHANNELS)
// -------------------------------------------------------------

let audioCtx = null;
let masterGain = null;
let bgmGain = null;
let sfxGain = null;

let bgmPlaying = false;
let sfxEnabled = true;
let masterVolume = 30; // 0 ~ 100

// Lookahead Audio Scheduler variables for 100% stutter-free BGM
let lookaheadTimer = null;
let nextNoteTime = 0.0;
let bgmStep = 0;
const TEMPO_STEP_TIME = 0.165; // 165ms per 16th note (~90 BPM)
const SCHEDULE_AHEAD_TIME = 0.25; // Queue notes 250ms in advance
const LOOKAHEAD_MS = 30; // Check queue every 30ms

// 🎮 復古 RPG 冒險主題曲 32-Step 音符陣列 (Hz)
const BGM_MELODY = [
    // Step 1~8: C Major (明亮冒險前奏)
    523.25, 659.25, 783.99, 1046.50, 783.99, 659.25, 523.25, 392.00,
    // Step 9~16: A Minor (悠揚沉浸感)
    440.00, 523.25, 659.25, 880.00, 659.25, 523.25, 440.00, 392.00,
    // Step 17~24: F Major (輕快熱情)
    349.23, 440.00, 523.25, 698.46, 523.25, 440.00, 349.23, 440.00,
    // Step 25~32: G Major (期待與出發)
    392.00, 493.88, 587.33, 783.99, 698.46, 587.33, 493.88, 392.00
];

const BGM_BASS = [
    // C Bass
    130.81, 0, 130.81, 0, 164.81, 0, 196.00, 0,
    // Am Bass
    110.00, 0, 110.00, 0, 130.81, 0, 164.81, 0,
    // F Bass
    87.31, 0, 87.31, 0, 110.00, 0, 130.81, 0,
    // G Bass
    98.00, 0, 98.00, 0, 123.47, 0, 146.83, 0
];

function initAudioContext() {
    if (!audioCtx) {
        const AudioContextClass = window.AudioContext || window.webkitAudioContext;
        if (AudioContextClass) {
            audioCtx = new AudioContextClass();
            
            masterGain = audioCtx.createGain();
            bgmGain = audioCtx.createGain();
            sfxGain = audioCtx.createGain();

            // 獨立的 Gain 控制音軌，互不干涉
            bgmGain.connect(masterGain);
            sfxGain.connect(masterGain);
            masterGain.connect(audioCtx.destination);

            try {
                const savedVol = localStorage.getItem('tokyo_quest_volume');
                if (savedVol !== null) {
                    masterVolume = parseInt(savedVol);
                }
            } catch(e){}

            applyVolume();
        }
    }
    if (audioCtx && audioCtx.state === 'suspended') {
        audioCtx.resume();
    }
}

document.addEventListener('click', () => {
    initAudioContext();
}, { once: true });

function applyVolume() {
    if (!masterGain || !audioCtx) return;
    const volRatio = Math.max(0, Math.min(1, masterVolume / 100));
    masterGain.gain.setValueAtTime(volRatio, audioCtx.currentTime);

    const slider = document.getElementById('volumeSlider');
    const label = document.getElementById('volumeValLabel');
    if (slider) slider.value = masterVolume;
    if (label) label.textContent = masterVolume + '%';
}

function setVolume(val) {
    masterVolume = parseInt(val) || 0;
    initAudioContext();
    applyVolume();
    try {
        localStorage.setItem('tokyo_quest_volume', masterVolume);
    } catch(e){}
}

function toggleBgm() {
    initAudioContext();
    bgmPlaying = !bgmPlaying;
    const label = document.getElementById('bgmStateLabel');
    const btn = document.getElementById('bgmToggleBtn');

    if (bgmPlaying) {
        if (label) label.textContent = "🎵 BGM: 播放中";
        if (btn) btn.classList.add('border-amber-300', 'shadow-amber-500/50');
        startBgmEngine();
    } else {
        if (label) label.textContent = "🎵 BGM: 點擊播放";
        if (btn) btn.classList.remove('border-amber-300', 'shadow-amber-500/50');
        stopBgmEngine();
    }
}

// 🎼 高精度獨立 Lookahead BGM 調度器 (確保按鈕音效觸發時 BGM 絕不卡頓或中斷)
function scheduleBgmNote(step, time) {
    if (!bgmPlaying || !audioCtx || !bgmGain) return;

    const melodyFreq = BGM_MELODY[step % BGM_MELODY.length];
    const bassFreq = BGM_BASS[step % BGM_BASS.length];

    // 1. 主旋律 (Triangle 波，溫和復古 Chiptune 質感)
    if (melodyFreq > 0) {
        try {
            const osc = audioCtx.createOscillator();
            const noteGain = audioCtx.createGain();
            osc.type = 'triangle';
            osc.frequency.setValueAtTime(melodyFreq, time);

            noteGain.gain.setValueAtTime(0.12, time);
            noteGain.gain.exponentialRampToValueAtTime(0.001, time + 0.15);

            osc.connect(noteGain);
            noteGain.connect(bgmGain);
            osc.start(time);
            osc.stop(time + 0.15);
        } catch(e){}
    }

    // 2. 伴奏貝斯 (Square 波，復古電玩震撼感)
    if (bassFreq > 0) {
        try {
            const bassOsc = audioCtx.createOscillator();
            const bassGainNode = audioCtx.createGain();
            bassOsc.type = 'square';
            bassOsc.frequency.setValueAtTime(bassFreq, time);

            bassGainNode.gain.setValueAtTime(0.05, time);
            bassGainNode.gain.exponentialRampToValueAtTime(0.001, time + 0.14);

            bassOsc.connect(bassGainNode);
            bassGainNode.connect(bgmGain);
            bassOsc.start(time);
            bassOsc.stop(time + 0.14);
        } catch(e){}
    }
}

function nextBgmStep() {
    nextNoteTime += TEMPO_STEP_TIME;
    bgmStep++;
}

function bgmScheduler() {
    if (!bgmPlaying || !audioCtx) return;

    while (nextNoteTime < audioCtx.currentTime + SCHEDULE_AHEAD_TIME) {
        scheduleBgmNote(bgmStep, nextNoteTime);
        nextBgmStep();
    }
}

function startBgmEngine() {
    stopBgmEngine();
    initAudioContext();
    if (!audioCtx) return;

    bgmStep = 0;
    nextNoteTime = audioCtx.currentTime + 0.05;
    
    // 獨立播放啟動音效，不干擾音樂調度
    playSfx('fanfare');

    lookaheadTimer = setInterval(bgmScheduler, LOOKAHEAD_MS);
}

function stopBgmEngine() {
    if (lookaheadTimer) {
        clearInterval(lookaheadTimer);
        lookaheadTimer = null;
    }
}

function toggleSfx() {
    sfxEnabled = !sfxEnabled;
    const label = document.getElementById('sfxStateLabel');
    if (label) label.textContent = sfxEnabled ? "🔊 音效: 開" : "🔇 音效: 關";
}

// 🔊 獨立按鈕音效 Engine (使用獨立 sfxGain 管道，與 BGM 徹底分離)
function playSfx(type) {
    if (!sfxEnabled) return;
    initAudioContext();
    if (!audioCtx) return;

    const now = audioCtx.currentTime;
    const osc = audioCtx.createOscillator();
    const sfxNodeGain = audioCtx.createGain();
    
    osc.connect(sfxNodeGain);
    sfxNodeGain.connect(sfxGain || masterGain || audioCtx.destination);

    if (type === 'click') {
        osc.type = 'square';
        osc.frequency.setValueAtTime(700, now);
        osc.frequency.exponentialRampToValueAtTime(350, now + 0.04);
        sfxNodeGain.gain.setValueAtTime(0.08, now);
        sfxNodeGain.gain.exponentialRampToValueAtTime(0.001, now + 0.04);
        osc.start(now);
        osc.stop(now + 0.04);
    } else if (type === 'equip') {
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(440, now);
        osc.frequency.setValueAtTime(880, now + 0.08);
        sfxNodeGain.gain.setValueAtTime(0.1, now);
        sfxNodeGain.gain.exponentialRampToValueAtTime(0.001, now + 0.16);
        osc.start(now);
        osc.stop(now + 0.16);
    } else if (type === 'complete') {
        osc.type = 'sine';
        osc.frequency.setValueAtTime(523.25, now);
        osc.frequency.setValueAtTime(659.25, now + 0.08);
        osc.frequency.setValueAtTime(783.99, now + 0.16);
        sfxNodeGain.gain.setValueAtTime(0.12, now);
        sfxNodeGain.gain.exponentialRampToValueAtTime(0.001, now + 0.3);
        osc.start(now);
        osc.stop(now + 0.3);
    } else if (type === 'delete') {
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(300, now);
        osc.frequency.linearRampToValueAtTime(100, now + 0.1);
        sfxNodeGain.gain.setValueAtTime(0.08, now);
        sfxNodeGain.gain.exponentialRampToValueAtTime(0.001, now + 0.1);
        osc.start(now);
        osc.stop(now + 0.1);
    } else if (type === 'coin') {
        osc.type = 'square';
        osc.frequency.setValueAtTime(987.77, now); // B5
        osc.frequency.setValueAtTime(1318.51, now + 0.08); // E6
        sfxNodeGain.gain.setValueAtTime(0.1, now);
        sfxNodeGain.gain.exponentialRampToValueAtTime(0.001, now + 0.22);
        osc.start(now);
        osc.stop(now + 0.22);
    } else if (type === 'fanfare') {
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(523.25, now);
        osc.frequency.setValueAtTime(659.25, now + 0.08);
        osc.frequency.setValueAtTime(783.99, now + 0.16);
        osc.frequency.setValueAtTime(1046.50, now + 0.24);
        sfxNodeGain.gain.setValueAtTime(0.12, now);
        sfxNodeGain.gain.exponentialRampToValueAtTime(0.001, now + 0.4);
        osc.start(now);
        osc.stop(now + 0.4);
    }
}
