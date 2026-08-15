// -------------------------------------------------------------
// 🔊 WEB AUDIO & 8-BIT RETRO RPG BGM ENGINE
// -------------------------------------------------------------

let audioCtx = null;
let masterGain = null;
let bgmGain = null;
let sfxGain = null;
let bgmPlaying = false;
let sfxEnabled = true;
let masterVolume = 30; // 0 ~ 100
let bgmTimer = null;
let bgmStep = 0;

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
        audioCtx = new (window.AudioContext || window.webkitAudioContext)();
        
        masterGain = audioCtx.createGain();
        bgmGain = audioCtx.createGain();
        sfxGain = audioCtx.createGain();

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

function startBgmEngine() {
    stopBgmEngine();
    bgmStep = 0;
    playSfx('fanfare');

    // 啟動 8-bit RPG 復古音樂迴圈 (每 165ms 一拍)
    bgmTimer = setInterval(() => {
        if (!bgmPlaying || !audioCtx) {
            stopBgmEngine();
            return;
        }

        const now = audioCtx.currentTime;
        const melodyFreq = BGM_MELODY[bgmStep % BGM_MELODY.length];
        const bassFreq = BGM_BASS[bgmStep % BGM_BASS.length];

        // 1. 主旋律 (Triangle 波，溫和復古 Chiptune 質感)
        if (melodyFreq > 0) {
            try {
                const osc = audioCtx.createOscillator();
                const gain = audioCtx.createGain();
                osc.type = 'triangle';
                osc.frequency.setValueAtTime(melodyFreq, now);

                gain.gain.setValueAtTime(0.12, now);
                gain.gain.exponentialRampToValueAtTime(0.001, now + 0.15);

                osc.connect(gain);
                gain.connect(bgmGain);
                osc.start(now);
                osc.stop(now + 0.15);
            } catch(e){}
        }

        // 2. 伴奏貝斯 (Square 波，復古電玩震撼感)
        if (bassFreq > 0) {
            try {
                const bassOsc = audioCtx.createOscillator();
                const bassGain = audioCtx.createGain();
                bassOsc.type = 'square';
                bassOsc.frequency.setValueAtTime(bassFreq, now);

                bassGain.gain.setValueAtTime(0.05, now);
                bassGain.gain.exponentialRampToValueAtTime(0.001, now + 0.14);

                bassOsc.connect(bassGain);
                bassGain.connect(bgmGain);
                bassOsc.start(now);
                bassOsc.stop(now + 0.14);
            } catch(e){}
        }

        bgmStep++;
    }, 165);
}

function stopBgmEngine() {
    if (bgmTimer) {
        clearInterval(bgmTimer);
        bgmTimer = null;
    }
}

function toggleSfx() {
    sfxEnabled = !sfxEnabled;
    const label = document.getElementById('sfxStateLabel');
    if (label) label.textContent = sfxEnabled ? "🔊 音效: 開" : "🔇 音效: 關";
}

function playSfx(type) {
    if (!sfxEnabled) return;
    initAudioContext();
    if (!audioCtx) return;

    const now = audioCtx.currentTime;
    const osc = audioCtx.createOscillator();
    const gain = audioCtx.createGain();
    osc.connect(gain);
    gain.connect(sfxGain || masterGain || audioCtx.destination);

    if (type === 'click') {
        osc.type = 'square';
        osc.frequency.setValueAtTime(600, now);
        gain.gain.setValueAtTime(0.08, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.05);
        osc.start(now);
        osc.stop(now + 0.05);
    } else if (type === 'equip') {
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(440, now);
        osc.frequency.setValueAtTime(880, now + 0.08);
        gain.gain.setValueAtTime(0.1, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.16);
        osc.start(now);
        osc.stop(now + 0.16);
    } else if (type === 'complete') {
        osc.type = 'sine';
        osc.frequency.setValueAtTime(523.25, now);
        osc.frequency.setValueAtTime(659.25, now + 0.08);
        osc.frequency.setValueAtTime(783.99, now + 0.16);
        gain.gain.setValueAtTime(0.12, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.3);
        osc.start(now);
        osc.stop(now + 0.3);
    } else if (type === 'delete') {
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(300, now);
        osc.frequency.linearRampToValueAtTime(100, now + 0.1);
        gain.gain.setValueAtTime(0.08, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.1);
        osc.start(now);
        osc.stop(now + 0.1);
    } else if (type === 'fanfare') {
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(523.25, now);
        osc.frequency.setValueAtTime(659.25, now + 0.1);
        osc.frequency.setValueAtTime(783.99, now + 0.2);
        osc.frequency.setValueAtTime(1046.50, now + 0.3);
        gain.gain.setValueAtTime(0.12, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.5);
        osc.start(now);
        osc.stop(now + 0.5);
    }
}
