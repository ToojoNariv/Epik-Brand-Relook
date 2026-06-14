<template>
  <div class="projet-detail-root" :style="{ backgroundColor: projet.bgColor }">
    
    <header class="entete-detail">
      <div class="logo-conteneur" @click="$emit('close')">
        <img src="/logo.svg" alt="Epik Brand Logo" class="logo-image" />
      </div>

      <div class="navigation-milieu">
        <nav class="liens-navigation">
          <a href="#close" class="lien-nav" @click.prevent="$emit('close')">{{ t('menu.expertises') }}</a>
          <a href="#close" class="lien-nav" @click.prevent="$emit('close')">{{ t('menu.menu') }}</a>
        </nav>
      </div>

      <div class="controle-musique">
        <span class="musique-label">{{ t('menu.musique') }} — {{ estEnLecture ? 'On' : 'Off' }}</span>
      </div>
    </header>

    <aside 
      class="track-navigation-latérale"
      ref="trackRef"
      @mousedown="startDrag"
      @touchstart="startDragTouch"
    >
      <div class="track-miniatures-liste">
        <div 
          v-for="(media, index) in projet.galerie" 
          :key="index"
          :class="['track-miniature-item', { 'actif': activeMediaIndex === index }]"
          @click="scrollerVersMedia(index)"
        >
          <video 
            v-if="media.type === 'video'" 
            :src="media.src" 
            muted 
            class="miniature-img"
            draggable="false"
          ></video>
          <img 
            v-else 
            :src="media.src" 
            class="miniature-img" 
            draggable="false"
          />
          <div 
            class="miniature-repere-progres" 
            :style="{ width: (progressObj[index] || 0) + '%' }"
          ></div>
        </div>
      </div>
    </aside>

    <div class="scroll-wrapper" ref="rootRef" @scroll="gererScroll">
      
      <section class="hero-section" id="media-0" ref="heroRef">
        <div class="hero-media-wrapper">
          <video 
            v-if="projet.mediaType === 'video'" 
            :src="projet.src" 
            autoplay 
            loop 
            muted 
            playsinline 
            class="hero-media"
          ></video>
          <img 
            v-else 
            :src="projet.src" 
            :alt="projet.titre.join(' ')" 
            class="hero-media" 
          />
          <div class="hero-overlay"></div>
        </div>

        <div class="hero-contenu">
          <button class="bouton-retour" @click="$emit('close')">
            <span class="tiret">-</span> {{ t('common.back') }} <span class="tiret">-</span>
          </button>
          <h1 class="projet-titre texte-titre">
            <span v-for="(line, idx) in projet.titre" :key="idx" class="titre-ligne">
              {{ line }}
            </span>
          </h1>
          <p class="projet-description">
            {{ projet.description }}
          </p>
        </div>
      </section>

      <section class="galerie-section">
        <div class="galerie-conteneur">
          <div 
            v-for="(media, index) in projet.galerie.slice(1)" 
            :key="index"
            :id="'media-' + (index + 1)"
            class="galerie-item-wrapper"
          >
            <!-- Wrapper pour le lecteur vidéo personnalisé -->
            <div v-if="media.type === 'video'" class="custom-video-player">
              <video 
                :src="media.src" 
                autoplay 
                loop 
                :muted="isMuted(index + 1)" 
                playsinline 
                class="galerie-media"
                :ref="el => setVideoRef(index + 1, el)"
                @timeupdate="gererTimeUpdate(index + 1, $event)"
                @loadedmetadata="gererLoadedMetadata(index + 1, $event)"
              ></video>
              
              <!-- Barre de contrôle personnalisée -->
              <div 
                class="video-controles-overlay"
                :class="{ 'visible-scrubbing': estScrubbing && indexScrubbingActif === index + 1 }"
              >
                <!-- Bouton Lecture/Pause -->
                <button type="button" class="btn-controle" @click="togglePlay(index + 1)">
                  <svg v-if="isPlaying(index + 1)" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z"/>
                  </svg>
                  <svg v-else viewBox="0 0 24 24" fill="currentColor">
                    <path d="M8 5v14l11-7z"/>
                  </svg>
                </button>
                
                <!-- Barre de progression de la vidéo (Scrubber) -->
                <div 
                  class="barre-temps-conteneur" 
                  @mousedown="commencerScrub(index + 1, $event)"
                  @touchstart="commencerScrub(index + 1, $event)"
                >
                  <div class="barre-temps-fond"></div>
                  <div class="barre-temps-progres" :style="{ width: getProgresPct(index + 1) + '%' }"></div>
                  <div class="barre-temps-curseur" :style="{ left: getProgresPct(index + 1) + '%' }"></div>
                </div>
                
                <!-- Affichage du temps de lecture -->
                <span class="temps-affichage">
                  {{ formaterTemps(getCurrentTime(index + 1)) }} / {{ formaterTemps(getDuration(index + 1)) }}
                </span>

                <!-- Bouton Mute/Unmute -->
                <button type="button" class="btn-controle" @click="toggleMute(index + 1)">
                  <svg v-if="isMuted(index + 1)" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M16.5 12c0-1.77-1.02-3.29-2.5-4.03v2.21l2.45 2.45c.03-.21.05-.42.05-.63zm2.5 0c0 .94-.2 1.82-.54 2.64l1.51 1.51C20.63 14.91 21 13.5 21 12c0-4.28-2.99-7.86-7-8.77v2.06c2.89.86 5 3.54 5 6.71zM4.27 3L3 4.27 7.73 9H3v6h4l5 5v-6.73l4.25 4.25c-.67.52-1.42.93-2.25 1.18v2.06c1.38-.31 2.63-.95 3.69-1.81L19.73 21 21 19.73l-9-9L4.27 3zM12 4L9.91 6.09 12 8.18V4z"/>
                  </svg>
                  <svg v-else viewBox="0 0 24 24" fill="currentColor">
                    <path d="M3 9v6h4l5 5V4L7 9H3zm13.5 3c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02zM14 3.23v2.06c2.89.86 5 3.54 5 6.71s-2.11 5.85-5 6.71v2.06c4.01-.91 7-4.49 7-8.77s-2.99-7.86-7-8.77z"/>
                  </svg>
                </button>
              </div>
            </div>
            <img 
              v-else 
              :src="media.src" 
              :alt="projet.titre.join(' ') + ' - ' + index" 
              class="galerie-media"
              decoding="async"
            />
          </div>
        </div>
      </section>
      
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onBeforeUnmount, nextTick } from 'vue';
import { gsap } from 'gsap';
import { estEnLecture, playDefaultClick, playScrollTick, playCursorWithTextClick } from '../services/audioService';
import { t } from '../i18n/index';

const props = defineProps({
  projet: {
    type: Object,
    required: true
  }
});

defineEmits(['close']);

const rootRef = ref(null);
const heroRef = ref(null);
const trackRef = ref(null);
const activeMediaIndex = ref(0);
const progressObj = ref({});

// ─── ETATS DU LECTEUR VIDÉO CUSTOM ───
const videoStates = ref({});
const videoRefs = ref({});

const setVideoRef = (index, el) => {
  if (el) {
    videoRefs.value[index] = el;
  } else {
    delete videoRefs.value[index];
  }
};

const getVolumeState = (index) => {
  if (!videoStates.value[index]) {
    videoStates.value[index] = { playing: true, muted: true, currentTime: 0, duration: 0 };
  }
  return videoStates.value[index];
};

const isPlaying = (index) => getVolumeState(index).playing;
const isMuted = (index) => getVolumeState(index).muted;
const getCurrentTime = (index) => getVolumeState(index).currentTime;
const getDuration = (index) => getVolumeState(index).duration;
const getProgresPct = (index) => {
  const dur = getDuration(index);
  return dur > 0 ? (getCurrentTime(index) / dur) * 100 : 0;
};

const togglePlay = (index) => {
  const video = videoRefs.value[index];
  const state = getVolumeState(index);
  if (video) {
    if (state.playing) {
      video.pause();
      state.playing = false;
    } else {
      video.play().catch(() => {});
      state.playing = true;
    }
  }
};

const toggleMute = (index) => {
  const video = videoRefs.value[index];
  const state = getVolumeState(index);
  if (video) {
    video.muted = !video.muted;
    state.muted = video.muted;
  }
};

const gererTimeUpdate = (index, event) => {
  const video = event.target;
  const state = getVolumeState(index);
  state.currentTime = video.currentTime;
};

const gererLoadedMetadata = (index, event) => {
  const video = event.target;
  const state = getVolumeState(index);
  state.duration = video.duration;
};

// ─── GESTION DU GLISSER SUR LA BARRE DE TEMPS (DRAG-TO-SCRUB) ───
const estScrubbing = ref(false);
const indexScrubbingActif = ref(null);

const commencerScrub = (index, event) => {
  if (event.type === 'mousedown' && event.button !== 0) return;
  
  // Éviter la sélection de texte ou le scroll par défaut pendant le drag
  event.preventDefault();
  event.stopPropagation();
  
  estScrubbing.value = true;
  indexScrubbingActif.value = index;
  
  mettreAJourPositionScrub(event);
  
  if (event.type === 'mousedown') {
    document.addEventListener('mousemove', surScrubMove);
    document.addEventListener('mouseup', surScrubFin);
    document.body.style.userSelect = 'none';
  } else if (event.type === 'touchstart') {
    document.addEventListener('touchmove', surScrubTouchMove, { passive: false });
    document.addEventListener('touchend', surScrubFin);
  }
};

const mettreAJourPositionScrub = (event) => {
  if (!estScrubbing.value || indexScrubbingActif.value === null) return;
  const index = indexScrubbingActif.value;
  const video = videoRefs.value[index];
  if (!video || !video.duration) return;
  
  const conteneur = document.querySelector(`#media-${index} .barre-temps-conteneur`);
  if (!conteneur) return;
  
  const rect = conteneur.getBoundingClientRect();
  let clientX = 0;
  if (event.touches && event.touches.length > 0) {
    clientX = event.touches[0].clientX;
  } else if (event.changedTouches && event.changedTouches.length > 0) {
    clientX = event.changedTouches[0].clientX;
  } else {
    clientX = event.clientX;
  }
  
  const clickX = clientX - rect.left;
  const width = rect.width;
  const pct = Math.max(0, Math.min(1, clickX / width));
  
  video.currentTime = pct * video.duration;
  
  const state = getVolumeState(index);
  state.currentTime = video.currentTime;
};

const surScrubMove = (e) => {
  if (estScrubbing.value) {
    mettreAJourPositionScrub(e);
  }
};

const surScrubTouchMove = (e) => {
  if (estScrubbing.value) {
    e.preventDefault();
    mettreAJourPositionScrub(e);
  }
};

const surScrubFin = () => {
  estScrubbing.value = false;
  indexScrubbingActif.value = null;
  
  document.removeEventListener('mousemove', surScrubMove);
  document.removeEventListener('mouseup', surScrubFin);
  document.removeEventListener('touchmove', surScrubTouchMove);
  document.removeEventListener('touchend', surScrubFin);
  
  document.body.style.userSelect = '';
};

const formaterTemps = (time) => {
  if (isNaN(time) || time === null) return '0:00';
  const mins = Math.floor(time / 60);
  const secs = Math.floor(time % 60);
  return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
};

let isDragging = false;
let startY = 0;
let startScrollTop = 0;
let hasMoved = false;
let dernierePositionScroll = 0;

// ─── GESTION DU DRAG (SCRUBBER DYNAMIQUE) SUR LES MINIATURES ───
const startDrag = (e) => {
  if (e.button !== 0) return;
  isDragging = true;
  hasMoved = false;
  startY = e.clientY;
  startScrollTop = rootRef.value.scrollTop;
  
  document.addEventListener('mousemove', onDrag);
  document.addEventListener('mouseup', stopDrag);
  document.body.style.userSelect = 'none';
  document.body.style.cursor = 'grabbing';
};

const onDrag = (e) => {
  if (!isDragging) return;
  const deltaY = e.clientY - startY;
  
  if (Math.abs(deltaY) > 3) {
    hasMoved = true;
  }
  
  const scrollHeight = rootRef.value.scrollHeight;
  const clientHeight = rootRef.value.clientHeight;
  const maxScroll = scrollHeight - clientHeight;
  
  const trackHeight = trackRef.value ? trackRef.value.getBoundingClientRect().height : 300;
  const ratio = maxScroll / (trackHeight * 0.8);
  
  rootRef.value.scrollTop = startScrollTop + deltaY * ratio;
};

const stopDrag = () => {
  isDragging = false;
  document.removeEventListener('mousemove', onDrag);
  document.removeEventListener('mouseup', stopDrag);
  document.body.style.userSelect = '';
  document.body.style.cursor = '';
  
  setTimeout(() => {
    hasMoved = false;
  }, 50);
};

const startDragTouch = (e) => {
  isDragging = true;
  hasMoved = false;
  startY = e.touches[0].clientY;
  startScrollTop = rootRef.value.scrollTop;
  
  document.addEventListener('touchmove', onDragTouch, { passive: false });
  document.addEventListener('touchend', stopDragTouch);
};

const onDragTouch = (e) => {
  if (!isDragging) return;
  const deltaY = e.touches[0].clientY - startY;
  
  if (Math.abs(deltaY) > 3) {
    hasMoved = true;
    e.preventDefault();
  }
  
  const scrollHeight = rootRef.value.scrollHeight;
  const clientHeight = rootRef.value.clientHeight;
  const maxScroll = scrollHeight - clientHeight;
  
  const trackHeight = trackRef.value ? trackRef.value.getBoundingClientRect().height : 300;
  const ratio = maxScroll / (trackHeight * 0.8);
  
  rootRef.value.scrollTop = startScrollTop + deltaY * ratio;
};

const stopDragTouch = () => {
  isDragging = false;
  document.removeEventListener('touchmove', onDragTouch);
  document.removeEventListener('touchend', stopDragTouch);
  
  setTimeout(() => {
    hasMoved = false;
  }, 50);
};

// ─── NAVIGUER EN CLIQUANT SUR UNE MINIATURE ───
const scrollerVersMedia = (index) => {
  if (hasMoved) return;
  playDefaultClick();
  const el = document.getElementById(`media-${index}`);
  if (el) {
    el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    activeMediaIndex.value = index;
  }
};

// ─── CALCUL DES ETATS AU SCROLL ───
const gererScroll = (e) => {
  const container = e ? e.target : rootRef.value;
  if (!container) return;
  
  const scrollTop = container.scrollTop;
  
  // Jouer le son de scroll (cliquetis)
  if (Math.abs(scrollTop - dernierePositionScroll) >= 45) {
    dernierePositionScroll = scrollTop;
    playScrollTick();
  }
  
  const clientHeight = container.clientHeight;
  const scrollHeight = container.scrollHeight;
  const maxScroll = scrollHeight - clientHeight;
  
  const items = [];
  const heroEl = heroRef.value;
  if (heroEl) {
    items.push({ el: heroEl, index: 0 });
  }
  const wrappers = container.querySelectorAll('.galerie-item-wrapper');
  wrappers.forEach((el, idx) => {
    items.push({ el, index: idx + 1 });
  });
  
  const viewportCenter = scrollTop + clientHeight / 2;
  let currentActiveIndex = 0;
  
  items.forEach((item) => {
    const el = item.el;
    if (!el) return;
    const itemTop = el.offsetTop;
    const itemHeight = el.offsetHeight;
    
    let progress = (viewportCenter - itemTop) / itemHeight;
    progress = Math.max(0, Math.min(1, progress));
    progressObj.value[item.index] = progress * 100;
    
    if (viewportCenter >= itemTop && viewportCenter <= itemTop + itemHeight) {
      currentActiveIndex = item.index;
    }
  });
  
  if (maxScroll > 0 && scrollTop + clientHeight >= scrollHeight - 10) {
    currentActiveIndex = items.length - 1;
  }
  
  activeMediaIndex.value = currentActiveIndex;
};

onMounted(() => {
  document.body.style.overflow = 'hidden';

  playCursorWithTextClick();

  // Animation d'entrée globale
  gsap.fromTo(rootRef.value, 
    { opacity: 0, scale: 1.02 },
    { opacity: 1, scale: 1, duration: 0.6, ease: 'power3.out' }
  );

  gsap.fromTo('.hero-contenu > *',
    { opacity: 0, y: 25 },
    { opacity: 1, y: 0, duration: 0.7, stagger: 0.12, ease: 'power3.out', delay: 0.15 }
  );

  nextTick(() => {
    gererScroll();
  });
});

onBeforeUnmount(() => {
  document.body.style.overflow = '';
  surScrubFin();
});
</script>

<style scoped>
/* ─── CONTENEUR PRINCIPAL FIXE ET ABSOLU ───────────────────────────────────── */
.projet-detail-root {
  position: fixed;
  inset: 0;
  scrollbar-width: none;
  width: 100vw;
  height: 100vh;
  z-index: 1500;
  overflow: hidden; 
  color: #ffffff;
}

/* ─── CONTENEUR DE SCROLL DÉDIÉ ET FLUIDE ───────────────────────────────────── */
.scroll-wrapper {
  width: 100%;
  height: 100%;
  overflow-y: auto;
  overflow-x: hidden;
  scrollbar-width: none;
  -ms-overflow-style: none;
  scroll-behavior: smooth;
  will-change: transform; /* Prépare le navigateur à optimiser le scroll */
}

.scroll-wrapper::-webkit-scrollbar {
  display: none;
}

/* ─── EN-TÊTE FIXE PARFAITE ─────────────────────────────────────────────────── */
.entete-detail {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  padding: 3rem 7rem 0;
  display: flex;
  justify-content: space-between;
  align-items: center;
  z-index: 1600;
  pointer-events: none;
}

.entete-detail > * {
  pointer-events: auto;
}

.logo-conteneur {
  height: 40px;
  display: flex;
  align-items: center;
  cursor: pointer;
}

.logo-image {
  height: 55px;
  width: auto;
  object-fit: contain;
}

.navigation-milieu {
  position: absolute;
  left: 50%;
  transform: translateX(-50%);
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 40px;
}

.liens-navigation {
  display: flex;
  gap: 2.5rem;
  align-items: center;
}

.lien-nav {
  font-size: 1.3rem;
  font-weight: 500;
  color: rgba(255, 255, 255, 0.7);
  position: relative;
  padding: 0.4rem 0;
}

.lien-nav:hover {
  color: #ffffff;
}

.controle-musique {
  font-family: var(--police-texte);
  font-size: 1.05rem;
  font-weight: 500;
  color: rgba(255, 255, 255, 0.7);
}

/* ─── HÉRO BANNER ──────────────────────────────────────────────────────────── */
.hero-section {
  position: relative;
  width: 100%;
  height: 100vh;
  display: flex;
  flex-direction: column;
  justify-content: flex-start;
  align-items: flex-start;
  padding: 0 7rem 0;
  overflow: hidden;
}

.hero-media-wrapper {
  position: absolute;
  inset: 0;
  z-index: 1;
}

.hero-media {
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
  transform: translateZ(0); /* Accélération matérielle */
  backface-visibility: hidden;
}

.hero-overlay {
  position: absolute;
  inset: 0;
  background: linear-gradient(
    to bottom,
    rgba(5, 5, 5, 0.4) 0%,
    rgba(5, 5, 5, 0.2) 50%,
    rgba(5, 5, 5, 0.75) 100%
  );
  z-index: 2;
}

.hero-contenu {
  position: relative;
  z-index: 3;
  margin-top: 9vh;
  max-width: 650px;
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  padding-top: 15vh;
  padding-bottom: 8vh;
}

/* BOUTON RETOUR NEUTRE (SANS EFFET HOVER) */
.bouton-retour {
    background-color: #ffffff;
    color: #000000;
    border-radius: 0px;
    font-family: var(--police-texte);
    font-size: 1.2rem;
    font-weight: 300;
    padding: 0.5rem 1rem;
    cursor: pointer;
    display: inline-flex;
    align-items: center;
    gap: 1.5rem;
    transition: none;
}

.tiret {
  display: inline-block;
}

.projet-titre {
    font-size: clamp(3.2rem, 6.5vw, 6rem);
    font-weight: 500;
    line-height: 0.95;
    font-family: 'Poppins', sans-serif;
    letter-spacing: 0.01em;
    text-shadow: 0 8px 24px rgba(0, 0, 0, 0.2);
    margin-top: 1rem;
    margin-bottom: 1.5rem;
}

.titre-ligne {
  display: block;
}

.projet-description {
  font-family: 'Poppins', sans-serif;
  font-size: 1rem;
  line-height: 1.2;
  max-width: 480px;
  color: rgb(255, 255, 255);
  text-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
}

/* ─── GALERIE D'IMAGES OPTIMISÉE (SANS SAUTS NI CLIGNOTEMENTS) ───────────────── */
.galerie-section {
  width: 100%;
  padding-bottom: 0px; /* Aucun espace vide sous le dernier élément */
}

.galerie-conteneur {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0;
  width: 100%;
}

.galerie-item-wrapper {
  width: 72vw;
  height: auto;
  overflow: hidden;
  /* content-visibility dit au navigateur de ne pas calculer l'image si elle est hors-écran */
  content-visibility: auto; 
  contain-intrinsic-size: 100vh;
}

.galerie-media {
  width: 100%;
  height: auto;
  display: block;
  object-fit: cover;
  /* L'arme secrète anti-clignotement : pousse l'image sur une couche GPU dédiée */
  transform: translateZ(0); 
  will-change: transform;
  backface-visibility: hidden;
  -webkit-backface-visibility: hidden;
}

/* ─── DECORATION / BARRE DE MINIATURES 100% IMMOBILE ET FIXE ─────────────────── */
.track-navigation-latérale {
  position: fixed;
  right: 3vw;
  top: 50%;
  transform: translateY(-50%);
  z-index: 1600;
  display: flex;
  align-items: center;
  justify-content: center;
  pointer-events: auto;
  overflow: visible;
}

.track-miniatures-liste {
  display: flex;
  flex-direction: column;
  gap: 0;
}

.track-miniature-item {
  position: relative;
  width: 75px;
  height: 48px;
  cursor: grab;
  overflow: hidden;
  opacity: 0.4;
  box-sizing: border-box;
  transition: opacity 0.25s ease;
}

.track-miniature-item:active {
  cursor: grabbing;
}

/* REPERE EXACTEMENT IDENTIQUE A LA MAQUETTE PHOTOS4.JPG */
.track-miniature-item.actif {
  opacity: 1;
  outline: 2px solid #ffffff;
  outline-offset: -2px;
}

.miniature-img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
  pointer-events: none;
  -webkit-user-drag: none;
}

.miniature-repere-progres {
  position: absolute;
  left: 0;
  bottom: 0;
  height: 3px;
  background-color: #ffffff;
  pointer-events: none;
  transition: width 0.1s ease;
}

/* ─── RESPONSIVE DESIGN ─────────────────────────────────────────────────────── */
@media (max-width: 1024px) {
  .entete-detail {
    padding: 2.5rem 4vw 0;
  }
  .navigation-milieu {
    display: none;
  }
  
  .hero-section {
    padding: 0 5vw 6vh;
  }
  
  .galerie-item-wrapper {
    width: 82vw;
  }
  
  .track-navigation-latérale {
    display: none;
  }
}

@media (max-width: 768px) {
  .entete-detail {
    padding: 2rem 5% 0;
  }
  
  .controle-musique {
    display: none;
  }

  .bouton-retour {
    padding: 8px 18px;
    font-size: 0.75rem;
  }
  
  .projet-titre {
    font-size: 2.2rem;
  }
  
  .projet-description {
    font-size: 0.95rem;
  }
  
  .galerie-item-wrapper {
    width: 90vw;
  }
}

/* ─── CUSTOM VIDEO PLAYER ──────────────────────────────────────────────────── */
.custom-video-player {
  position: relative;
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
}

/* Barre de contrôles en surimpression */
.video-controles-overlay {
  position: absolute;
  bottom: 2rem;
  left: 50%;
  transform: translate(-50%, 10px);
  width: calc(100% - 4rem);
  max-width: 800px;
  background-color: rgba(10, 10, 10, 0.65);
  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px);
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 4px;
  padding: 0.8rem 1.2rem;
  display: flex;
  align-items: center;
  gap: 1.5rem;
  z-index: 10;
  opacity: 0;
  pointer-events: none;
  transition: opacity 0.3s ease, transform 0.3s cubic-bezier(0.25, 0.8, 0.25, 1);
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.5);
}

.custom-video-player:hover .video-controles-overlay,
.video-controles-overlay.visible-scrubbing {
  opacity: 1;
  pointer-events: auto;
  transform: translate(-50%, 0);
}

/* Style des boutons */
.btn-controle {
  background: none;
  border: none;
  color: #ffffff;
  width: 24px;
  height: 24px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  opacity: 0.8;
  transition: opacity 0.2s ease, transform 0.2s ease;
  padding: 0;
}

.btn-controle:hover {
  opacity: 1;
  transform: scale(1.1);
}

.btn-controle svg {
  width: 20px;
  height: 20px;
}

/* Barre de temps de lecture (Scrubber) */
.barre-temps-conteneur {
  flex-grow: 1;
  height: 20px;
  display: flex;
  align-items: center;
  position: relative;
  cursor: pointer;
}

.barre-temps-fond {
  width: 100%;
  height: 4px;
  background-color: rgba(255, 255, 255, 0.2);
  border-radius: 2px;
  transition: height 0.2s ease;
}

.barre-temps-progres {
  position: absolute;
  left: 0;
  height: 4px;
  background: linear-gradient(90deg, #0096E7 0%, #0072B1 100%);
  border-radius: 2px;
  pointer-events: none;
  transition: height 0.2s ease;
}

.barre-temps-curseur {
  position: absolute;
  width: 12px;
  height: 12px;
  background-color: #ffffff;
  border-radius: 50%;
  pointer-events: none;
  transform: translate(-50%, -50%);
  top: 50%;
  opacity: 0;
  transition: opacity 0.2s ease, width 0.2s ease, height 0.2s ease;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.4);
}

.barre-temps-conteneur:hover .barre-temps-fond {
  height: 6px;
}

.barre-temps-conteneur:hover .barre-temps-progres {
  height: 6px;
}

.barre-temps-conteneur:hover .barre-temps-curseur {
  opacity: 1;
}

/* Affichage du temps en texte */
.temps-affichage {
  font-family: var(--police-texte);
  font-size: 0.85rem;
  color: rgba(255, 255, 255, 0.8);
  min-width: 80px;
  text-align: center;
  user-select: none;
}
</style>