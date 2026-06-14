import { ref } from 'vue';
import { gsap } from 'gsap';

export const estEnLecture = ref(false);

let backgroundAudio = null;

// Preload SFX Pools to optimize memory and CPU (zero garbage collection overhead)
const clickPool = [];
let clickPoolIndex = 0;

const textClickPool = [];
let textClickIndex = 0;

const showingCardPool = [];
let showingCardIndex = 0;

const hoverMenuPool = [];
let hoverMenuIndex = 0;

const typewriterPool = [];
let typewriterIndex = 0;

const homeCardApparitionPool = [];
let homeCardApparitionIndex = 0;

const initSFX = () => {
  if (typeof window === 'undefined') return;

  // Initialize standard click / scroll tick pool
  if (clickPool.length === 0) {
    for (let i = 0; i < 6; i++) {
      const audio = new Audio('/Effets sonores/default-click.wav');
      audio.preload = 'auto';
      audio.load();
      clickPool.push(audio);
    }
  }

  // Initialize cursor with text click pool
  if (textClickPool.length === 0) {
    for (let i = 0; i < 3; i++) {
      const audio = new Audio('/Effets sonores/cursor_with_text_click.mp3');
      audio.preload = 'auto';
      audio.load();
      textClickPool.push(audio);
    }
  }

  // Initialize showing/hiding card pool
  if (showingCardPool.length === 0) {
    for (let i = 0; i < 3; i++) {
      const audio = new Audio('/Effets sonores/showing-card.wav');
      audio.preload = 'auto';
      audio.load();
      showingCardPool.push(audio);
    }
  }

  // Initialize hover menu pool
  if (hoverMenuPool.length === 0) {
    for (let i = 0; i < 4; i++) {
      const audio = new Audio('/Effets sonores/hover-menu.wav');
      audio.preload = 'auto';
      audio.load();
      hoverMenuPool.push(audio);
    }
  }

  // Initialize typewriter pool
  if (typewriterPool.length === 0) {
    for (let i = 0; i < 8; i++) {
      const audio = new Audio('/Effets sonores/typewriter.mp3');
      audio.preload = 'auto';
      audio.load();
      typewriterPool.push(audio);
    }
  }

  // Initialize home card apparition pool
  if (homeCardApparitionPool.length === 0) {
    for (let i = 0; i < 3; i++) {
      const audio = new Audio('/Effets sonores/home-card-apparition.mp3');
      audio.preload = 'auto';
      audio.load();
      homeCardApparitionPool.push(audio);
    }
  }
};

let musicBlobUrl = null;
let musicLoadingPromise = null;

const loadMusicBlob = () => {
  if (typeof window === 'undefined') return Promise.resolve('/Music/Background-epik.mp3');
  if (musicLoadingPromise) return musicLoadingPromise;

  musicLoadingPromise = fetch('/Music/Background-epik.mp3')
    .then(res => res.blob())
    .then(blob => {
      musicBlobUrl = URL.createObjectURL(blob);
      if (backgroundAudio && !backgroundAudio.src) {
        backgroundAudio.src = musicBlobUrl;
      }
      return musicBlobUrl;
    })
    .catch(err => {
      console.warn("Failed to load background music as blob, fallback to direct path:", err);
      if (backgroundAudio && !backgroundAudio.src) {
        backgroundAudio.src = '/Music/Background-epik.mp3';
      }
      return '/Music/Background-epik.mp3';
    });

  return musicLoadingPromise;
};

const initBackgroundMusic = () => {
  if (typeof window === 'undefined') return;
  if (!backgroundAudio) {
    backgroundAudio = new Audio();
    backgroundAudio.loop = true;
    backgroundAudio.volume = 0;

    if (musicBlobUrl) {
      backgroundAudio.src = musicBlobUrl;
    } else {
      loadMusicBlob();
    }
  }
};

export const demarrerMusique = () => {
  initBackgroundMusic();
  if (!backgroundAudio) return;

  const playAudio = () => {
    backgroundAudio.play()
      .then(() => {
        estEnLecture.value = true;
        gsap.killTweensOf(backgroundAudio);
        gsap.to(backgroundAudio, {
          volume: 0.5,
          duration: 2.0,
          ease: 'power2.out'
        });
      })
      .catch((err) => {
        console.warn("Autoplay blocked or audio play error:", err);
        estEnLecture.value = false;
      });
  };

  if (!backgroundAudio.src) {
    loadMusicBlob().then((src) => {
      if (!backgroundAudio.src) {
        backgroundAudio.src = src;
      }
      playAudio();
    });
  } else {
    playAudio();
  }
};

export const arreterMusique = () => {
  if (!backgroundAudio) return;

  estEnLecture.value = false; // Mettre à jour l'état immédiatement pour la réactivité UI
  gsap.killTweensOf(backgroundAudio);
  gsap.to(backgroundAudio, {
    volume: 0,
    duration: 1.2,
    ease: 'power2.in',
    onComplete: () => {
      backgroundAudio.pause();
    }
  });
};

export const basculerMusique = () => {
  if (estEnLecture.value) {
    arreterMusique();
  } else {
    demarrerMusique();
  }
};

// Play helpers using round-robin pooling
export const playDefaultClick = () => {
  if (!estEnLecture.value) return;
  initSFX();

  try {
    const audio = clickPool[clickPoolIndex];
    clickPoolIndex = (clickPoolIndex + 1) % clickPool.length;
    audio.volume = 0.18;
    audio.currentTime = 0;
    audio.play().catch(() => { });
  } catch (e) {
    console.error("Failed to play default click sound:", e);
  }
};

let dernierJeuTextClick = 0;
const SEUIL_COOLDOWN_TEXT_CLICK = 800; // ms

export const playCursorWithTextClick = () => {
  if (!estEnLecture.value) return;

  const maintenant = Date.now();
  if (maintenant - dernierJeuTextClick < SEUIL_COOLDOWN_TEXT_CLICK) {
    return;
  }
  dernierJeuTextClick = maintenant;

  initSFX();

  try {
    const audio = textClickPool[textClickIndex];
    textClickIndex = (textClickIndex + 1) % textClickPool.length;
    audio.volume = 0.10;
    audio.currentTime = 0;
    audio.play().catch(() => { });
  } catch (e) {
    console.error("Failed to play cursor with text click sound:", e);
  }
};

export const playShowingCard = () => {
  if (!estEnLecture.value) return;
  initSFX();

  try {
    const audio = showingCardPool[showingCardIndex];
    showingCardIndex = (showingCardIndex + 1) % showingCardPool.length;
    audio.volume = 0.85;
    audio.currentTime = 0;
    audio.play().catch(() => { });
  } catch (e) {
    console.error("Failed to play showing card sound:", e);
  }
};

export const playScrollTick = () => {
  if (!estEnLecture.value) return;
  initSFX();

  try {
    const audio = clickPool[clickPoolIndex];
    clickPoolIndex = (clickPoolIndex + 1) % clickPool.length;
    audio.volume = 0.05; // soft tick
    audio.currentTime = 0;
    audio.play().catch(() => { });
  } catch (e) {
    console.error("Failed to play scroll tick sound:", e);
  }
};

export const playHoverMenu = () => {
  if (!estEnLecture.value) return;
  initSFX();

  try {
    const audio = hoverMenuPool[hoverMenuIndex];
    hoverMenuIndex = (hoverMenuIndex + 1) % hoverMenuPool.length;
    audio.volume = 0.25; // pleasant hover menu sound volume
    audio.currentTime = 0;
    audio.play().catch(() => { });
  } catch (e) {
    console.error("Failed to play hover menu sound:", e);
  }
};

export const playTypewriter = () => {
  if (!estEnLecture.value) return;
  initSFX();

  try {
    const audio = typewriterPool[typewriterIndex];
    typewriterIndex = (typewriterIndex + 1) % typewriterPool.length;
    audio.volume = 0.28; // clear typewriter keystroke
    audio.currentTime = 0;
    audio.play().catch(() => { });
  } catch (e) {
    console.error("Failed to play typewriter sound:", e);
  }
};

export const playHomeCardApparition = () => {
  if (!estEnLecture.value) return;
  initSFX();

  try {
    const audio = homeCardApparitionPool[homeCardApparitionIndex];
    homeCardApparitionIndex = (homeCardApparitionIndex + 1) % homeCardApparitionPool.length;
    gsap.killTweensOf(audio);

    audio.volume = 1; 
    audio.currentTime = 0;
    audio.play().catch(() => { });
    setTimeout(() => {
      gsap.to(audio, {
        volume: 0,
        duration: 0.3,
        onComplete: () => {
          audio.pause();
          audio.volume = 1;
        }
      });
    }, 900);
  } catch (e) {
    console.error("Failed to play home card apparition sound:", e);
  }
};

// Start pre-fetching background music as blob immediately on load to prevent browser download popups
if (typeof window !== 'undefined') {
  loadMusicBlob();
}
