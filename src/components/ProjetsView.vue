<template>
  <div class="projets-view-conteneur" :style="{ backgroundColor: couleurFondCourante }" @click="reinitialiserActif">
    <!-- Conteneur horizontal de défilement des projets -->
    <div class="projets-liste-scroll" ref="conteneurDefilement" @wheel.prevent="surMolette" @mousedown="surMouseDown"
      @mousemove="surMouseMove" @mouseup="surMouseUpOrLeave" @mouseleave="surMouseUpOrLeave"
      @touchstart.passive="surTouchStart" @touchmove.prevent="surTouchMove" @touchend="surMouseUpOrLeave">
      <div class="projets-liste-interne" ref="listeInterne">
        <div v-for="(projet, index) in listeProjets" :key="projet.id" :class="['projet-cadre', {
          'actif': projetActifId === projet.id,
          'inactif': projetActifId !== null && projetActifId !== projet.id
        }]" :ref="el => { if (el) elementsCartes[projet.id] = el }" @click.stop="selectionnerProjet(projet.id, projet)">
          <!-- Média (Image ou Vidéo) -->
          <div class="projet-media-wrapper">
            <video v-if="projet.mediaType === 'video'" :src="projet.src" autoplay loop muted playsinline
              class="projet-media"></video>
            <img v-else :src="projet.src" :alt="projet.titre.join(' ')" class="projet-media" draggable="false" />
          </div>

          <!-- Le tag bleu caractéristique au bas-gauche de la photo -->
          <div class="projet-tag-bleu">
            {{ projet.titre.join(' ') }}
          </div>

          <!-- Titre double comblant le haut et le bas de la photo -->
          <Transition name="titre-fondu">
            <div class="projet-titre-overlay" v-if="projetActifId === projet.id">
              <h2 class="projet-titre-haut texte-titre">{{ projet.titre[0] }}</h2>
              <h2 class="projet-titre-bas texte-titre">{{ projet.titre[1] }}</h2>
            </div>
          </Transition>
        </div>
      </div>
    </div>

    <!-- Petites barres en bas (Slider de navigation) -->
    <div class="slider-barres-bas" ref="referenceSlider" @mousedown="surSliderMouseDown"
      @touchstart.passive="surSliderTouchStart">
      <div v-for="(_, index) in nombreBarres" :key="index" class="barre-verticale" :style="obtenirStyleBarre(index)">
      </div>
    </div>

    <!-- Informations de bas de page (Catégorie & Pagination) -->
    <div class="projets-infos-bas">
      <div class="categorie-label">
        {{ titreCategorie }}
      </div>
      <div class="projets-pagination">
        <span class="index-courant">{{ indexProjetCourant }}</span>
        <span class="separateur">—</span>
        <span class="total-projets">{{ listeProjets.length }}</span>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onBeforeUnmount, nextTick } from 'vue';
import { gsap } from 'gsap';
import { playShowingCard, playScrollTick, playCursorWithTextClick } from '../services/audioService';
import { t } from '../i18n/index';

const props = defineProps({
  categorie: { type: String, required: true }
});

const emit = defineEmits(['close', 'open-detail']);

// ─── DONNÉES DES PROJETS ─────────────────────────────────────────────────────
import { projects } from '../services/apiService';

const projetsParExpertise = computed(() => {
  return {
    photo: projects.value.filter(p => p.category === 'photo'),
    video: projects.value.filter(p => p.category === 'video'),
    graphique: projects.value.filter(p => p.category === 'graphique'),
    web: projects.value.filter(p => p.category === 'web')
  };
});

const listeProjets = computed(() => projetsParExpertise.value[props.categorie] || []);

// ─── ÉTATS ───────────────────────────────────────────────────────────────────
const projetActifId = ref(null);
const conteneurDefilement = ref(null);
const listeInterne = ref(null);
const referenceSlider = ref(null);
const elementsCartes = ref({});
const nombreBarres = 35;
const pourcentageDefilement = ref(0);

const indexProjetCourant = ref(1);

const titreCategorie = computed(() => {
  return t('projets.titreCategorie.' + props.categorie);
});

const mettreAJourProjetCourantIndex = () => {
  const c = conteneurDefilement.value;
  if (!c || !listeProjets.value.length) return;

  const scrollLeft = c.scrollLeft;
  const viewportWidth = c.clientWidth;
  const centreViewport = scrollLeft + viewportWidth / 2;

  let indexMinDist = 0;
  let minDist = Infinity;

  listeProjets.value.forEach((projet, idx) => {
    const card = elementsCartes.value[projet.id];
    if (card) {
      const cardCenter = card.offsetLeft + card.clientWidth / 2;
      const dist = Math.abs(cardCenter - centreViewport);
      if (dist < minDist) {
        minDist = dist;
        indexMinDist = idx;
      }
    }
  });

  indexProjetCourant.value = indexMinDist + 1;
};

const couleurBrandEPIK = '#FF3300';
const couleurFondCourante = computed(() => {
  if (!projetActifId.value) return couleurBrandEPIK;
  const p = listeProjets.value.find(p => p.id === projetActifId.value);
  return p ? p.bgColor : couleurBrandEPIK;
});

// ─── ANIMATION D'ENTRÉE (GSAP) ───────────────────────────────────────────────
onMounted(() => {
  nextTick(() => {
    // Attacher le listener de scroll
    if (conteneurDefilement.value) {
      conteneurDefilement.value.addEventListener('scroll', surScrollNatif, { passive: true });
      mettreAJourPourcentage();
    }

    // Stagger d'entrée — les cartes arrivent depuis le bas
    const cartes = listeInterne.value?.querySelectorAll('.projet-cadre');
    if (cartes && cartes.length) {
      playCursorWithTextClick();
      gsap.fromTo(cartes,
        { y: 80, opacity: 0 },
        {
          y: 0, opacity: 1,
          duration: 0.7,
          stagger: 0.08,
          ease: 'power3.out',
          clearProps: 'transform,opacity'
        }
      );
    }

    // Calcul initial de l'index du projet
    mettreAJourProjetCourantIndex();
  });
});

onBeforeUnmount(() => {
  conteneurDefilement.value?.removeEventListener('scroll', surScrollNatif);
  window.removeEventListener('mousemove', surSliderMouseMove);
  window.removeEventListener('mouseup', surSliderMouseUp);
  window.removeEventListener('touchmove', surSliderTouchMove);
  window.removeEventListener('touchend', surSliderTouchEnd);
});

// ─── SÉLECTION D'UN PROJET ───────────────────────────────────────────────────
const centrerCarteActive = (id) => {
  const carte = elementsCartes.value[id];
  const conteneur = conteneurDefilement.value;
  if (!carte || !conteneur) return;

  const cLeft = carte.offsetLeft;
  const cWidth = carte.clientWidth;
  const vWidth = conteneur.clientWidth;
  // Centrer la carte sélectionnée
  const target = cLeft - (vWidth - cWidth) / 2;
  conteneur.scrollTo({ left: Math.max(0, target), behavior: 'smooth' });
};

const selectionnerProjet = (id, projet) => {
  if (projetActifId.value === id) {
    explorerProjet(projet);
  } else {
    projetActifId.value = id;
    playShowingCard();
    nextTick(() => centrerCarteActive(id));
  }
};

const reinitialiserActif = () => {
  if (projetActifId.value !== null) {
    playShowingCard();
  }
  projetActifId.value = null;
};
const explorerProjet = (p) => {
  emit('open-detail', p);
};

// ─── DRAG-TO-SCROLL ───────────────────────────────────────────────────────────
let estDragging = false;
let startX = 0;
let startScrollLeft = 0;
let didDrag = false;          // distinguer drag / click

const surMouseDown = (e) => {
  estDragging = true;
  didDrag = false;
  startX = e.pageX;
  startScrollLeft = conteneurDefilement.value.scrollLeft;
  conteneurDefilement.value.style.cursor = 'grabbing';
};

const surMouseMove = (e) => {
  if (!estDragging) return;
  e.preventDefault();
  const dx = e.pageX - startX;
  if (Math.abs(dx) > 3) didDrag = true;
  conteneurDefilement.value.scrollLeft = startScrollLeft - dx;
  mettreAJourPourcentage();
};

const surMouseUpOrLeave = () => {
  estDragging = false;
  estDraggingSlider = false;
  if (conteneurDefilement.value)
    conteneurDefilement.value.style.cursor = 'grab';
};

// Tactile
const surTouchStart = (e) => {
  startX = e.touches[0].pageX;
  startScrollLeft = conteneurDefilement.value.scrollLeft;
};
const surTouchMove = (e) => {
  const dx = e.touches[0].pageX - startX;
  conteneurDefilement.value.scrollLeft = startScrollLeft - dx;
  mettreAJourPourcentage();
};

// Molette → horizontal
const surMolette = (e) => {
  conteneurDefilement.value.scrollLeft += e.deltaY + e.deltaX;
  mettreAJourPourcentage();
};

// ─── SLIDER BARRES ────────────────────────────────────────────────────────────
let estDraggingSlider = false;

const scrubberDeplacement = (clientX) => {
  const slider = referenceSlider.value;
  const conteneur = conteneurDefilement.value;
  if (!slider || !conteneur) return;

  const rect = slider.getBoundingClientRect();
  const pct = Math.max(0, Math.min(1, (clientX - rect.left) / rect.width));
  const max = conteneur.scrollWidth - conteneur.clientWidth;
  conteneur.scrollLeft = pct * max;
  pourcentageDefilement.value = pct;
};

const surSliderMouseDown = (e) => {
  estDraggingSlider = true;
  scrubberDeplacement(e.clientX);
  window.addEventListener('mousemove', surSliderMouseMove);
  window.addEventListener('mouseup', surSliderMouseUp);
};
const surSliderMouseMove = (e) => { if (estDraggingSlider) scrubberDeplacement(e.clientX); };
const surSliderMouseUp = () => {
  estDraggingSlider = false;
  window.removeEventListener('mousemove', surSliderMouseMove);
  window.removeEventListener('mouseup', surSliderMouseUp);
};

const surSliderTouchStart = (e) => {
  estDraggingSlider = true;
  scrubberDeplacement(e.touches[0].clientX);
  window.addEventListener('touchmove', surSliderTouchMove, { passive: false });
  window.addEventListener('touchend', surSliderTouchEnd);
};
const surSliderTouchMove = (e) => { e.preventDefault(); if (estDraggingSlider) scrubberDeplacement(e.touches[0].clientX); };
const surSliderTouchEnd = () => {
  estDraggingSlider = false;
  window.removeEventListener('touchmove', surSliderTouchMove);
  window.removeEventListener('touchend', surSliderTouchEnd);
};

// ─── POURCENTAGE & BARRES ─────────────────────────────────────────────────────
let dernierIndexBarre = -1;
const mettreAJourPourcentage = () => {
  const c = conteneurDefilement.value;
  if (!c) return;
  const max = c.scrollWidth - c.clientWidth;
  pourcentageDefilement.value = max > 0 ? c.scrollLeft / max : 0;

  const cursor = pourcentageDefilement.value * (nombreBarres - 1);
  const indexCourant = Math.round(cursor);
  if (indexCourant !== dernierIndexBarre) {
    if (dernierIndexBarre !== -1) {
      playScrollTick();
    }
    dernierIndexBarre = indexCourant;
  }

  // Effet de parallaxe horizontal relatif au viewport (borné) sur les images et vidéos
  const scrollLeft = c.scrollLeft;
  const viewportWidth = c.clientWidth;
  
  const cards = listeInterne.value?.querySelectorAll('.projet-cadre');
  cards?.forEach(card => {
    const media = card.querySelector('.projet-media');
    if (media) {
      const cardWidth = card.clientWidth;
      const offsetLeft = card.offsetLeft;
      
      // Calculer la position relative de la carte par rapport au centre du viewport
      const centerX = offsetLeft - scrollLeft - (viewportWidth - cardWidth) / 2;
      const pct = centerX / (viewportWidth / 2);
      
      // Décalage parallaxe fini et borné (maximum 40px)
      const offsetX = Math.max(-1, Math.min(1, pct)) * 40;
      
      // On applique la translation inverse
      gsap.set(media, { x: -offsetX, scale: 1.25 });
    }
  });

  mettreAJourProjetCourantIndex();
};

const surScrollNatif = () => mettreAJourPourcentage();

const obtenirStyleBarre = (index) => {
  const cursor = pourcentageDefilement.value * (nombreBarres - 1);
  const distance = Math.abs(index - cursor);

  // Opacité : pleine au centre, fondu très progressif sur les côtés
  const opacite = Math.max(0.4, 0.9 - distance * 0.08);
  // Hauteur : presque uniforme avec une légère surélévation (de 22px à 28px)
  const hauteur = Math.max(22, 28 - distance * 1.5);

  return {
    opacity: opacite,
    height: `${hauteur}px`,
    transition: 'height 0.12s ease-out, opacity 0.12s ease-out',
  };
};
</script>

<style scoped>
/* ─── CONTENEUR GLOBAL ─────────────────────────────────────────────────────── */
.projets-view-conteneur {
  position: fixed;
  inset: 0;
  width: 100vw;
  height: 100vh;
  z-index: 50;
  display: flex;
  flex-direction: column;
  justify-content: center;
  overflow: hidden;
  transition: background-color 0.75s cubic-bezier(0.25, 0.8, 0.25, 1);
}

/* ─── SCROLL HORIZONTAL ────────────────────────────────────────────────────── */
.projets-liste-scroll {
  width: 100%;
  height: 75vh;
  display: flex;
  align-items: center;
  overflow-x: auto;
  overflow-y: hidden;
  cursor: grab;
  /* Commence au bord gauche, comme la grille d'expertises */
  padding-left: 7vw;
  /* Espace de fin pour permettre de voir la dernière carte entière */
  padding-right: 15vw;
  /* Scroll natif sans smooth — on gère nous-mêmes la fluidité */
  scroll-behavior: auto;
  -webkit-overflow-scrolling: touch;
  /* Cache la barre de défilement */
  scrollbar-width: none;
  -ms-overflow-style: none;
}

.projets-liste-scroll::-webkit-scrollbar {
  display: none;
}

.projets-liste-scroll:active {
  cursor: grabbing;
}

/* ─── LISTE INTERNE ────────────────────────────────────────────────────────── */
.projets-liste-interne {
  display: flex;
  gap: 0.6rem;
  height: 55vh;
  align-items: stretch;
  flex-shrink: 0;
}

/* ─── CARTE PROJET ─────────────────────────────────────────────────────────── */
.projet-cadre {
  position: relative;
  /* Largeur variable selon l'état (réduite normalement, agrandie si active) */
  width: 28vw;
  min-width: 280px;
  flex-shrink: 0;
  overflow: visible;
  cursor: pointer;
  transition:
    width 0.6s cubic-bezier(0.25, 0.8, 0.25, 1),
    opacity 0.5s cubic-bezier(0.25, 0.8, 0.25, 1),
    filter 0.5s cubic-bezier(0.25, 0.8, 0.25, 1),
    box-shadow 0.4s cubic-bezier(0.16, 1, 0.3, 1);
}



/* Carte sélectionnée — légèrement plus large et sans filtre */
.projet-cadre.actif {
  width: 45vw;
  opacity: 1;
  filter: none;
  z-index: 5;
}

/* Cartes non sélectionnées — assombries et légèrement floues */
.projet-cadre.inactif {
  opacity: 0.4;
  filter: blur(3px);
}

/* ─── MÉDIA ────────────────────────────────────────────────────────────────── */
.projet-media-wrapper {
  width: 100%;
  height: 100%;
  overflow: hidden;
  position: relative;
  contain: paint;
}

.projet-media {
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
  pointer-events: none;
  user-select: none;
  transform: scale(1.25);
}

/* ─── TITRES SUPERPOSÉS ────────────────────────────────────────────────────── */
.projet-titre-overlay {
  position: absolute;
  inset: 0;
  pointer-events: none;
  z-index: 4;
}

.projet-titre-haut,
.projet-titre-bas {
  position: absolute;
  font-family: 'Poppins', sans-serif;
  left: 50%;
  white-space: nowrap;
  font-size: clamp(2.5rem, 7vw, 7rem);
  font-weight: 500;
  color: #ffffff;
  letter-spacing: 0.01em;
  line-height: 1;
  text-shadow: 0 8px 24px rgb(0 0 0 / 23%);
  transform-origin: center;
}

.projet-titre-haut {
  top: 0;
  transform: translate(-50%, -55%);
}

.projet-titre-bas {
  bottom: 0;
  transform: translate(-50%, 40%);
}

/* Transition d'entrée des titres */
.titre-fondu-enter-active {
  transition: opacity 0.4s ease, transform 0.4s cubic-bezier(0.16, 1, 0.3, 1);
}

.titre-fondu-leave-active {
  transition: opacity 0.25s ease;
}

.titre-fondu-enter-from .projet-titre-haut {
  opacity: 0;
  transform: translate(-50%, -70%);
}

.titre-fondu-enter-from .projet-titre-bas {
  opacity: 0;
  transform: translate(-50%, 70%);
}

.titre-fondu-leave-to {
  opacity: 0;
}

/* ─── BOUTON EXPLORER ──────────────────────────────────────────────────────── */
.bouton-explorer-projet {
  position: absolute;
  top: 50%;
  width: 100px;
  height: 100px;
  background-color: #050505;
  border-radius: 50%;
  color: #ffffff;
  font-family: var(--police-titre);
  font-size: 0.78rem;
  font-weight: 600;
  letter-spacing: 0.14em;
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 6;
  border: 1.5px solid rgba(255, 255, 255, 0.15);
  cursor: pointer;
  transition: transform 0.4s cubic-bezier(0.16, 1, 0.3, 1), background-color 0.3s ease;
}

.bouton-explorer-projet:hover {
  background-color: #1c1c1c;
}

.cote-droit {
  right: -50px;
  transform: translateY(-50%);
}

.cote-droit:hover {
  transform: translateY(-50%) scale(1.12);
}

.cote-gauche {
  left: -50px;
  transform: translateY(-50%);
}

.cote-gauche:hover {
  transform: translateY(-50%) scale(1.12);
}

/* Transition d'entrée du bouton EXPLORER */
.explorer-fondu-enter-active {
  transition: opacity 0.35s ease 0.1s, transform 0.35s cubic-bezier(0.16, 1, 0.3, 1) 0.1s;
}

.explorer-fondu-leave-active {
  transition: opacity 0.2s ease;
}

.explorer-fondu-enter-from {
  opacity: 0;
  transform: translateY(-50%) scale(0.7);
}

.explorer-fondu-leave-to {
  opacity: 0;
}

/* ─── SLIDER DE BARRES ─────────────────────────────────────────────────────── */
.slider-barres-bas {
  position: absolute;
  bottom: 3rem;
  left: 50%;
  transform: translateX(-50%);
  display: flex;
  align-items: flex-end;
  /* Les barres croissent vers le haut */
  gap: 4px;
  /* Hauteur conteneur assez grande pour les barres hautes */
  height: 52px;
  padding: 0 2rem;
  cursor: ew-resize;
  z-index: 8;
}

.barre-verticale {
  width: 2.5px;
  background-color: rgba(255, 255, 255, 0.9);
  border-radius: 2px;
  flex-shrink: 0;
  /* La hauteur est animée via :style dynamique */
}

/* ─── RESPONSIVE ───────────────────────────────────────────────────────────── */
@media (max-width: 1024px) {
  .projets-liste-scroll {
    padding-left: 5vw;
    padding-right: 10vw;
  }

  .projet-cadre {
    width: 55vw;
    min-width: 240px;
  }

  .projet-cadre.actif {
    width: 65vw;
  }

  .projet-titre-haut,
  .projet-titre-bas {
    font-size: clamp(2rem, 7vw, 4rem);
  }

  .bouton-explorer-projet {
    width: 84px;
    height: 84px;
    font-size: 0.72rem;
  }

  .cote-droit {
    right: -42px;
  }

  .cote-gauche {
    left: -42px;
  }
}

@media (max-width: 768px) {
  .projets-liste-scroll {
    padding-left: 4vw;
    padding-right: 8vw;
    height: 70vh;
  }

  .projets-liste-interne {
    height: 58vh;
    gap: 0.4rem;
  }

  .projet-cadre {
    width: 72vw;
    min-width: 200px;
  }

  .projet-cadre.actif {
    width: 82vw;
  }

  .slider-barres-bas {
    bottom: 1.8rem;
  }
}

/* ─── TAG DÉGRADÉ BLEU CARACTÉRISTIQUE ──────────────────────────────────────── */
.projet-tag-bleu {
    position: absolute;
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

.projet-cadre:hover .projet-tag-bleu::after {
  opacity: 1;
}

.projet-cadre.actif .projet-tag-bleu {
  display: none !important;
}

/* ─── INFORMATIONS DE BAS DE PAGE (CATÉGORIE & PAGINATION) ──────────────────── */
.projets-infos-bas {
  position: absolute;
  bottom: 3.5rem;
  left: 7rem;
  right: 7rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
  pointer-events: none;
  font-family: 'Space Grotesk', sans-serif;
  color: #fff;
  z-index: 10;
}

.categorie-label {
  font-size: 1.3rem;
  font-weight: 400;
}

.projets-pagination {
  font-size: 1.1rem;
  font-weight: 400;
}

.projets-pagination .separateur {
  margin: 0 0.9rem;
}

/* Responsive */
@media (max-width: 1024px) {
  .projets-infos-bas {
    left: 5vw;
    right: 5vw;
    bottom: 3.2rem;
  }
  .categorie-label,
  .projets-pagination {
    font-size: 0.95rem;
  }
}

@media (max-width: 768px) {
  .projets-infos-bas {
    left: 4vw;
    right: 4vw;
    bottom: 2rem;
  }
  .categorie-label {
    display: none; /* Masquer la catégorie sur petit écran pour éviter les chevauchements avec le slider */
  }
  .projets-pagination {
    font-size: 0.85rem;
  }
}
</style>
