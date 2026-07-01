<template>
  <div class="projets-view-conteneur">
    <!-- Colonne gauche : Grille des projets (scrollable) -->
    <div class="projets-grille-section" ref="grilleSectionRef">
      <!-- Grille de cartes -->
      <div class="projets-grid" ref="gridRef">
        <div 
          v-for="projet in projetsFiltrés" 
          :key="projet.id"
          class="projet-carte-item"
          @click="ouvrirDetail(projet)"
        >
          <div class="projet-media-wrapper">
            <template v-if="projet.mediaType === 'video' || isVideo(projet.src)">
              <video 
                v-if="isDirectVideo(projet.src)" 
                :src="getPreviewVideoUrl(projet.src)" 
                autoplay 
                loop 
                muted 
                playsinline 
                class="projet-media"
              ></video>
              <iframe 
                v-else 
                :src="getEmbedUrl(projet.src)" 
                :class="['projet-media iframe-media', { 'youtube-iframe-zoom': isYoutubeVideo(projet.src) }]"
                frameborder="0" 
                allow="autoplay; fullscreen; picture-in-picture" 
                allowfullscreen></iframe>
            </template>
            <img 
              v-else 
              :src="projet.src" 
              :alt="projet.titre.join(' ')" 
              class="projet-media" 
              draggable="false"
              loading="eager"
              decoding="async"
              fetchpriority="high"
            />
            <div class="projet-overlay-shadow"></div>
          </div>
          <!-- Le tag bleu caractéristique au bas-gauche de la photo -->
          <div class="projet-tag-bleu">
            {{ projet.titre.join(' ') }}
          </div>
        </div>
      </div>
    </div>

    <!-- Colonne droite : Robot Spline (Fixe) -->
    <div class="projets-visualisation-section">
      <div class="robot-3d-wrapper">
        <spline-viewer 
          v-if="!isMobile && showSpline"
          ref="splineViewerRef"
          url="https://prod.spline.design/Q4niLZ8HYuhlezDo/scene.splinecode"
          events-target="container"
          loading-anim-type="none"
        >
          <div class="spline-fallback"></div>
        </spline-viewer>
        <div v-else class="spline-fallback"></div>
      </div>

      <!-- Filtre custom avec animation GSAP -->
      <div class="trier-select-conteneur" ref="selectConteneurRef">
        <span class="trier-label">Trier par</span>
        <div class="custom-select-root" ref="customSelectRef">
          <!-- Barre affichant la valeur courante -->
          <div class="custom-select-trigger" @click="toggleDropdown" ref="selectTriggerRef">
            <span class="custom-select-value">{{ optionLabel(filtreSelectionne) }}</span>
            <div class="custom-select-caret" ref="selectCaretRef">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                <polyline points="6 9 12 15 18 9"></polyline>
              </svg>
            </div>
          </div>
          <!-- Panel déroulant -->
          <div class="custom-select-panel" ref="selectPanelRef">
            <div 
              v-for="opt in optionsFiltre" 
              :key="opt.value"
              :class="['custom-select-option', { 'actif': filtreSelectionne === opt.value }]"
              @click="choisirOption(opt.value)"
            >
              {{ opt.label }}
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Filtre visible uniquement sur mobile/tablette (fixed en bas) -->
    <div class="mobile-trier-select-conteneur" ref="mobileCustomSelectRef">
      <span class="trier-label">Trier par</span>
      <div class="custom-select-root mobile-select">
        <div class="custom-select-trigger" @click="toggleDropdown" ref="mobileSelectTriggerRef">
          <span class="custom-select-value">{{ optionLabel(filtreSelectionne) }}</span>
          <div class="custom-select-caret" ref="mobileSelectCaretRef">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
              <polyline points="6 9 12 15 18 9"></polyline>
            </svg>
          </div>
        </div>
        <div class="custom-select-panel" ref="mobileSelectPanelRef">
          <div 
            v-for="opt in optionsFiltre" 
            :key="'m-'+opt.value"
            :class="['custom-select-option', { 'actif': filtreSelectionne === opt.value }]"
            @click="choisirOption(opt.value)"
          >
            {{ opt.label }}
          </div>
        </div>
      </div>
    </div>

  </div>
</template>

<script setup>
import { ref, computed, onMounted, onBeforeUnmount, nextTick, watch } from 'vue';
import { gsap } from 'gsap';
import { playCursorWithTextClick, playScrollTick } from '../services/audioService';

const props = defineProps({
  categorie: { type: String, required: true },
  visible: { type: Boolean, default: false }
});

const emit = defineEmits(['close', 'open-detail']);
// ─── DONNÉES DES PROJETS ─────────────────────────────────────────────────────
import { projects, isDirectVideo, isVideo, isYoutubeVideo, getYoutubeThumbnail, getEmbedUrl, getPreviewVideoUrl } from '../services/apiService';

const projetsParExpertise = computed(() => {
  return {
    photo: projects.value.filter(p => p.category === 'photo'),
    video: projects.value.filter(p => p.category === 'video'),
    graphique: projects.value.filter(p => p.category === 'graphique'),
    web: projects.value.filter(p => p.category === 'web')
  };
});

// ─── FILTRE ET PROJETS ────────────────────────────────────────────────────────
const filtreSelectionne = ref('all');

const projetsFiltrés = computed(() => {
  if (filtreSelectionne.value === 'all') {
    const tous = [];
    Object.keys(projetsParExpertise.value).forEach(key => {
      projetsParExpertise.value[key].forEach(p => {
        tous.push({ ...p, categorieLabel: key });
      });
    });
    return tous;
  }
  return (projetsParExpertise.value[filtreSelectionne.value] || []).map(p => ({
    ...p,
    categorieLabel: filtreSelectionne.value
  }));
});

const obtenirCategorieNom = (cat) => {
  const noms = {
    photo: 'Photographie',
    video: 'Vidéo',
    graphique: 'Graphique design',
    web: 'Web'
  };
  return noms[cat] || cat;
};

const ouvrirDetail = (projet) => {
  emit('open-detail', projet);
};

// ─── OPTIONS DU FILTRE ────────────────────────────────────────────────────────
const optionsFiltre = [
  { value: 'all', label: 'Toutes nos réalisations' },
  { value: 'photo', label: 'Photographie' },
  { value: 'video', label: 'Vidéo' },
  { value: 'graphique', label: 'Graphique design' },
  { value: 'web', label: 'Web' },
];

const optionLabel = (val) => {
  const opt = optionsFiltre.find(o => o.value === val);
  return opt ? opt.label : val;
};

// ─── CUSTOM DROPDOWN GSAP ────────────────────────────────────────────────────
const customSelectRef = ref(null);
const selectTriggerRef = ref(null);
const selectPanelRef = ref(null);
const selectCaretRef = ref(null);
const selectConteneurRef = ref(null);

const mobileCustomSelectRef = ref(null);
const mobileSelectTriggerRef = ref(null);
const mobileSelectPanelRef = ref(null);
const mobileSelectCaretRef = ref(null);

const dropdownOuvert = ref(false);

const toggleDropdown = () => {
  dropdownOuvert.value ? fermerDropdown() : ouvrirDropdown();
};

const obtenirRefsActives = () => {
  if (isMobile.value) {
    return {
      panel: mobileSelectPanelRef.value,
      caret: mobileSelectCaretRef.value,
      trigger: mobileSelectTriggerRef.value,
      root: mobileCustomSelectRef.value
    };
  }
  return {
    panel: selectPanelRef.value,
    caret: selectCaretRef.value,
    trigger: selectTriggerRef.value,
    root: customSelectRef.value
  };
};

const ouvrirDropdown = () => {
  dropdownOuvert.value = true;
  playCursorWithTextClick();
  const { panel, caret } = obtenirRefsActives();
  const options = panel?.querySelectorAll('.custom-select-option');
  if (!panel) return;

  gsap.killTweensOf([panel, caret]);
  if (options) gsap.killTweensOf(options);

  // Reveal panel
  const isMob = isMobile.value;
  gsap.set(panel, { 
    display: 'flex', 
    opacity: 0, 
    y: isMob ? 8 : -8, 
    scaleY: 0.7, 
    transformOrigin: isMob ? 'bottom center' : 'top center' 
  });
  gsap.to(panel, {
    opacity: 1, y: 0, scaleY: 1,
    duration: 0.45,
    ease: 'power4.out'
  });

  // Rotate caret
  if (caret) {
    gsap.to(caret, { rotation: 180, duration: 0.35, ease: 'power2.out' });
  }

  // Stagger the options
  if (options && options.length) {
    gsap.fromTo(options,
      { opacity: 0, x: -18 },
      { opacity: 1, x: 0, duration: 0.35, stagger: 0.05, ease: 'power3.out', delay: 0.08 }
    );
  }
};

const fermerDropdown = () => {
  dropdownOuvert.value = false;
  const { panel, caret } = obtenirRefsActives();
  if (!panel) return;

  gsap.killTweensOf([panel, caret]);

  if (caret) {
    gsap.to(caret, { rotation: 0, duration: 0.3, ease: 'power2.inOut' });
  }
  
  const isMob = isMobile.value;
  gsap.to(panel, {
    opacity: 0, 
    y: isMob ? 8 : -8, 
    scaleY: 0.7,
    duration: 0.28,
    ease: 'power2.in',
    onComplete: () => { gsap.set(panel, { display: 'none' }); }
  });
};

const choisirOption = (val) => {
  const { trigger } = obtenirRefsActives();
  if (trigger) {
    // Flash micro-animation on trigger
    gsap.fromTo(trigger, { scale: 0.97 }, { scale: 1, duration: 0.35, ease: 'elastic.out(1.2, 0.5)' });
  }
  filtreSelectionne.value = val;
  fermerDropdown();
};

// Fermer le dropdown si on clique en dehors
const surClicExterieur = (e) => {
  const { root } = obtenirRefsActives();
  if (dropdownOuvert.value && root && !root.contains(e.target)) {
    fermerDropdown();
  }
};

// ─── GRID ANIMATIONS (GSAP) ──────────────────────────────────────────────────
const gridRef = ref(null);
const grilleSectionRef = ref(null);

const animerCartes = () => {
  const elements = gridRef.value?.querySelectorAll('.projet-carte-item');
  if (elements && elements.length > 0) {
    playCursorWithTextClick();
    gsap.killTweensOf(elements);
    gsap.fromTo(elements, 
      { y: 40, opacity: 0 },
      { 
        y: 0, 
        opacity: 1, 
        duration: 0.7, 
        stagger: 0.05, 
        ease: 'power3.out',
        clearProps: 'transform,opacity'
      }
    );
  }
};

watch(filtreSelectionne, () => {
  nextTick(() => {
    animerCartes();
    observerVideos();
    if (grilleSectionRef.value) {
      grilleSectionRef.value.scrollTo({ top: 0, behavior: 'smooth' });
    }
  });
});

// ─── OPTIMISATIONS & REAC DE DETECT MOBILE ──────────────────────────────────
const isMobile = ref(false);
const showSpline = ref(false);
let prechargerTimer = null;

const checkMobile = () => {
  isMobile.value = window.innerWidth <= 1024;
};

const injecterScriptSpline = () => {
  if (!document.getElementById('spline-viewer-script')) {
    const script = document.createElement('script');
    script.id = 'spline-viewer-script';
    script.type = 'module';
    script.src = 'https://unpkg.com/@splinetool/viewer@1.12.97/build/spline-viewer.js';
    script.async = true;
    document.head.appendChild(script);
  }
};

const chargerSplineRobot = () => {
  if (isMobile.value || showSpline.value) return;
  injecterScriptSpline();
  // Retarder l'apparition du Spline pour ne pas faire saccader l'animation d'ouverture de la page
  setTimeout(() => {
    if (!isMobile.value) {
      showSpline.value = true;
    }
  }, 600);
};

watch(isMobile, (newValue) => {
  if (!newValue && !showSpline.value) {
    chargerSplineRobot();
  }
});

watch(() => props.visible, (isVisible) => {
  if (isVisible) {
    chargerSplineRobot();
    const filtrePrecedent = filtreSelectionne.value;
    filtreSelectionne.value = 'all'; 
    if (filtrePrecedent === 'all') {
      nextTick(() => {
        animerCartes();
        observerVideos();
        if (grilleSectionRef.value) {
          grilleSectionRef.value.scrollTo({ top: 0 });
        }
      });
    }
  } else {
    const videos = gridRef.value?.querySelectorAll('video');
    videos?.forEach(v => v.pause());
    arreterObservationVideos();
    
    // Destruction immédiate et agressive du visualiseur Spline lors de la fermeture
    try {
      const viewer = splineViewerRef.value || document.querySelector('spline-viewer');
      if (viewer) {
        viewer.setAttribute('url', '');
        if (viewer.shadowRoot) {
          const canvas = viewer.shadowRoot.querySelector('canvas');
          if (canvas) {
            const gl = canvas.getContext('webgl2') || canvas.getContext('webgl');
            if (gl) {
              gl.getExtension('WEBGL_lose_context')?.loseContext();
            }
            canvas.remove();
          }
        }
        if (typeof viewer.dispose === 'function') {
          try { viewer.dispose(); } catch (e) {}
        }
      }
    } catch (e) {
      console.warn("Erreur lors de la destruction de Spline:", e);
    }
    
    showSpline.value = false;
  }
});

// ─── SPLINE ROBOT LOGO REMOVAL ───────────────────────────────────────────────
const splineViewerRef = ref(null);
let intervalHideLogo = null;

const hideSplineLogo = () => {
  const viewer = splineViewerRef.value || document.querySelector('spline-viewer');
  if (viewer && viewer.shadowRoot) {
    if (!viewer.shadowRoot.getElementById('hide-spline-logo-style')) {
      const style = document.createElement('style');
      style.id = 'hide-spline-logo-style';
      style.innerHTML = `
        #logo, 
        a[href*="spline.design"], 
        .spline-watermark, 
        [style*="spline"], 
        #logo-container { 
          display: none !important; 
          visibility: hidden !important; 
          opacity: 0 !important; 
          pointer-events: none !important; 
        }
      `;
      viewer.shadowRoot.appendChild(style);
      // Nettoyer l'intervalle dès que possible puisque la feuille de style est injectée
      if (intervalHideLogo) {
        clearInterval(intervalHideLogo);
        intervalHideLogo = null;
      }
    }
    const logo = viewer.shadowRoot.getElementById('logo');
    if (logo) {
      logo.style.display = 'none';
      logo.style.visibility = 'hidden';
      logo.style.opacity = '0';
      logo.style.pointerEvents = 'none';
      if (intervalHideLogo) {
        clearInterval(intervalHideLogo);
        intervalHideLogo = null;
      }
    }
  }
};

// ─── OBSERVATION DES VIDÉOS POUR PERFORMANCE ───────────────────────────────
let videoObserver = null;

const observerVideos = () => {
  if (typeof IntersectionObserver === 'undefined') return;
  
  if (videoObserver) {
    videoObserver.disconnect();
  }

  videoObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      const video = entry.target;
      if (entry.isIntersecting) {
        video.play().catch(() => {});
      } else {
        video.pause();
      }
    });
  }, { threshold: 0.1 });

  nextTick(() => {
    const videos = gridRef.value?.querySelectorAll('video');
    videos?.forEach(v => videoObserver.observe(v));
  });
};

const arreterObservationVideos = () => {
  if (videoObserver) {
    videoObserver.disconnect();
    videoObserver = null;
  }
};

// ─── MOUNT / UNMOUNT ─────────────────────────────────────────────────────────
let dernierePositionScroll = 0;
const surScrollPortfolio = (e) => {
  const scrollTop = e.target.scrollTop;
  if (Math.abs(scrollTop - dernierePositionScroll) >= 45) {
    dernierePositionScroll = scrollTop;
    playScrollTick();
  }
};

onMounted(() => {
  filtreSelectionne.value = 'all';

  checkMobile();
  window.addEventListener('resize', checkMobile);

  if (grilleSectionRef.value) {
    grilleSectionRef.value.addEventListener('scroll', surScrollPortfolio, { passive: true });
  }

  if (!isMobile.value) {
    chargerSplineRobot();
  }

  intervalHideLogo = setInterval(hideSplineLogo, 100);
  setTimeout(() => {
    if (intervalHideLogo) clearInterval(intervalHideLogo);
  }, 10000);

  window.addEventListener('click', surClicExterieur);

  // Initialiser le panel fermé
  nextTick(() => {
    if (selectPanelRef.value) {
      gsap.set(selectPanelRef.value, { display: 'none', opacity: 0 });
    }
    if (props.visible) {
      animerCartes();
      observerVideos();
    }
  });
});

onBeforeUnmount(() => {
  if (prechargerTimer) clearTimeout(prechargerTimer);
  if (intervalHideLogo) clearInterval(intervalHideLogo);
  arreterObservationVideos();
  window.removeEventListener('click', surClicExterieur);
  window.removeEventListener('resize', checkMobile);
  if (grilleSectionRef.value) {
    grilleSectionRef.value.removeEventListener('scroll', surScrollPortfolio);
  }

  // Destruction propre du visualiseur Spline pour éviter les fuites WebGL (ralentissement ventilateur PC)
  try {
    const viewer = splineViewerRef.value || document.querySelector('spline-viewer');
    if (viewer) {
      // Forcer le déchargement de la scène
      viewer.setAttribute('url', '');
      
      // Tuer agressivement le contexte WebGL pour libérer le GPU instantanément
      if (viewer.shadowRoot) {
        const canvas = viewer.shadowRoot.querySelector('canvas');
        if (canvas) {
          const gl = canvas.getContext('webgl2') || canvas.getContext('webgl');
          if (gl) {
            gl.getExtension('WEBGL_lose_context')?.loseContext();
          }
          // Supprimer physiquement le canvas pour empêcher toute boucle de rendu fantôme
          canvas.remove();
        }
      }

      if (typeof viewer.dispose === 'function') {
        try { viewer.dispose(); } catch (e) {}
      }
      // Retiré viewer.remove() : Vue gère la suppression du DOM
    }
  } catch (e) {
    console.warn("Erreur lors de la destruction de Spline:", e);
  }
});
</script>

<style scoped>
/* ─── CONTENEUR GLOBAL (SPLIT SCREEN) ───────────────────────────────────────── */
.projets-view-conteneur {
  position: fixed;
  inset: 0;
  width: 100vw;
  height: 100vh;
  z-index: 50;
  display: flex;
  background-color: #050505;
  overflow: hidden;
}

/* ─── SECTION GAUCHE : GRILLE PROJETS ────────────────────────────────────────── */
.projets-grille-section {
  width: 58vw;
  height: 100vh;
  overflow-y: auto;
  overflow-x: hidden;
  padding: 140px 0vw 80px 7vw;
  /* Scrollbar complètement invisible */
  scrollbar-width: none;
  -ms-overflow-style: none;
  position: relative;
  z-index: 20;
  will-change: scroll-position;
  -webkit-overflow-scrolling: touch;
}

.projets-grille-section::-webkit-scrollbar {
  display: none;
}

.projets-grid {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    margin-top: 7vh;
    gap: 1vw;
    width: 100%;
}

/* ─── CARTE PROJET ─────────────────────────────────────────────────────────── */
.projet-carte-item {
  position: relative;
  aspect-ratio: 4.5 / 5;
  width: 100%;
  overflow: hidden;
  cursor: pointer;
  background-color: transparent;
  border: none;
  transition: transform 0.4s cubic-bezier(0.16, 1, 0.3, 1), 
              box-shadow 0.4s cubic-bezier(0.16, 1, 0.3, 1);
  contain: paint;
}

.projet-carte-item:hover {
  will-change: transform;
  transform: translateY(-4px);
  box-shadow: 0 12px 28px rgba(0, 0, 0, 0.35);
}

.projet-media-wrapper {
  width: 100%;
  height: 100%;
  position: relative;
  overflow: hidden;
}

.projet-media {
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
  transition: transform 0.8s cubic-bezier(0.16, 1, 0.3, 1);
  pointer-events: none;
  user-select: none;
}

.iframe-media {
  border: none;
  pointer-events: none;
  width: 100%;
  height: 100%;
}

.youtube-iframe-zoom {
  transform: scale(1.85) !important; /* Zoom important pour cacher les bandes noires et l'UI YouTube */
}

.projet-overlay-shadow {
  position: absolute;
  inset: 0;
  background: linear-gradient(to top, rgba(0, 0, 0, 0.5) 0%, rgba(0, 0, 0, 0) 35%);
  opacity: 0.8;
  z-index: 1;
  pointer-events: none;
}

/* ─── TAG DÉGRADÉ BLEU CARACTÉRISTIQUE ──────────────────────────────────────── */
.projet-tag-bleu {
    position: absolute;
    font-family: 'Poppins', sans-serif;
    bottom: 0;
    left: 0;
    background: linear-gradient(135deg, #0096E7 0%, #0072B1 100%);
    color: #ffffff;
    padding: 10px 16px;
    font-family: var(--police-titre);
    font-size: 1rem;
    font-weight: 400;
    letter-spacing: 0.02em;
    z-index: 2;
    overflow: hidden;
}

.projet-tag-bleu::after {
  content: '';
  position: absolute;
  inset: 0;
  background-color: rgba(255, 255, 255, 0.15);
  opacity: 0;
  transition: opacity 0.3s ease;
  z-index: -1;
  pointer-events: none;
}

.projet-carte-item:hover .projet-tag-bleu::after {
  opacity: 1;
}

/* ─── SECTION DROITE : VISUALISATION 3D & FILTRES ─────────────────────────────── */
.projets-visualisation-section {
    width: 58vw;
    height: 100vh;
    right: 0;
    top: 0;
    z-index: 1;
}

.robot-3d-wrapper {
  width: 100%;
  height: 100%;
  right: 0vw;
  z-index: 1;
}

spline-viewer {
  width: 100%;
  height: 100%;
  display: block;
}

.spline-fallback {
  position: absolute;
  inset: 0;
  background: radial-gradient(circle at center, #111111 0%, #000000 100%);
  opacity: 0.9;
  z-index: -1;
}

/* ─── CONTENEUR FILTRE (position sur le robot) ─────────────────────────────── */
.trier-select-conteneur {
  position: fixed;
  bottom: 3rem;
  right: 10rem;
  display: flex;
  flex-direction: column;
  gap: 10px;
  z-index: 10;
  pointer-events: auto;
}

.trier-label {
  font-size: 0.8rem;
  font-weight: 600;
  color: var(--couleur-gris-secondaire);
  text-transform: uppercase;
  letter-spacing: 0.15em;
  font-family: var(--police-titre);
}

/* ─── CUSTOM SELECT GSAP ──────────────────────────────────────────────────── */
.custom-select-root {
  position: relative;
  user-select: none;
}

.custom-select-trigger {
background-color: rgba(217, 217, 217, 0.92);
    backdrop-filter: blur(12px);
    -webkit-backdrop-filter: blur(12px);
    color: #000000;
    border: none;
    border-radius: 0;
    padding: 10px 52px 10px 20px;
    min-width: 472px;
    font-size: 0.95rem;
    font-weight: 600;
    font-family: var(--police-texte);
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: space-between;
    transition: background-color 0.3s ease, box-shadow 0.3s ease;
    box-shadow: 0 4px 14px rgba(0, 0, 0, 0.18);
}

.custom-select-trigger:hover {
  background-color: #ffffff;
  box-shadow: 0 6px 20px rgba(0, 0, 0, 0.28);
}

.custom-select-value {
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.custom-select-caret {
  position: absolute;
  right: 18px;
  top: 50%;
  transform: translateY(-50%);
  color: #000000;
  pointer-events: none;
  display: flex;
  align-items: center;
  justify-content: center;
  will-change: transform;
}

.custom-select-caret svg {
  width: 15px;
  height: 15px;
}

.custom-select-panel {
  position: absolute;
  bottom: calc(100% + 6px);
  left: 0;
  width: 100%;
  display: none;
  flex-direction: column;
  background-color: rgba(26, 26, 26, 0.96);
  backdrop-filter: blur(18px);
  -webkit-backdrop-filter: blur(18px);
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 0;
  box-shadow: 0 -8px 28px rgba(0, 0, 0, 0.45);
  overflow: hidden;
  z-index: 20;
  transform-origin: bottom center;
}

.custom-select-option {
  padding: 12px 20px;
  font-size: 0.9rem;
  font-weight: 500;
  color: rgba(255, 255, 255, 0.7);
  cursor: pointer;
  transition: background-color 0.2s ease, color 0.2s ease, padding-left 0.25s ease;
  font-family: var(--police-texte);
}

.custom-select-option:hover {
  background-color: rgba(255, 255, 255, 0.07);
  color: #ffffff;
  padding-left: 28px;
}

.custom-select-option.actif {
  color: #ffffff;
  font-weight: 700;
  background: linear-gradient(135deg, #0096E7 0%, #0072B1 100%);
}

/* ─── FILTRE VERSION MOBILE ──────────────────────────────────────────────────── */
.mobile-trier-select-conteneur {
  display: none;
}

/* ─── MODALE DÉTAIL IMMERSIVE (LIGHTBOX) ──────────────────────────────────────── */
/* ─── RESPONSIVE DESIGN ──────────────────────────────────────────────────────── */
@media (max-width: 1024px) {
  .projets-view-conteneur {
    flex-direction: column;
  }
  
  .projets-grille-section {
    width: 100vw;
    height: 100vh;
    overflow-y: auto;
    padding: 110px 5vw 150px;
  }
  
  .projets-grid {
    grid-template-columns: repeat(2, 1fr);
    gap: 3vw;
  }
  
  .projets-visualisation-section {
    display: none;
  }
  
  .mobile-trier-select-conteneur {
    display: flex;
    position: fixed;
    bottom: 2rem;
    left: 50%;
    transform: translateX(-50%);
    z-index: 100;
    width: calc(100vw - 4rem);
    max-width: 450px;
    flex-direction: column;
    gap: 8px;
  }

  .mobile-select .custom-select-trigger {
    width: 100%;
    min-width: 0 !important;
  }

  .mobile-select .custom-select-panel {
    bottom: calc(100% + 6px);
    top: auto;
    transform-origin: bottom center;
  }
}

@media (max-width: 768px) {
  .projets-grid {
    grid-template-columns: 1fr;
    gap: 25px;
  }
  
  .projets-grille-section {
    padding-top: 100px;
    padding-bottom: 140px;
  }
}
</style>
