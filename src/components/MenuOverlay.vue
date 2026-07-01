<template>
  <!-- Toujours dans le DOM, caché par CSS visibility + pointer-events -->
  <div class="menu-overlay-container" ref="overlayRoot">
    <!-- Zone de menu gauche (se glisse de la gauche vers la droite) -->
    <div class="menu-sidebar-gauche" ref="sidebar">
      <!-- Sélecteur de langue en haut aligné avec l'entête -->
      <div class="menu-langues" ref="languesRef">
        <button
          v-for="lang in langues"
          :key="lang.code"
          :class="['bouton-langue', { actif: langueActive === lang.code }]"
          @click="changerLangue(lang.code)"
        >
          <span v-if="langueActive === lang.code" class="puce-active">■</span>
          {{ lang.nom }}
        </button>
      </div>

      <!-- Liens verticaux du menu -->
      <nav class="menu-liens-conteneur">
        <ul class="menu-liens-liste" ref="liensListeRef">
          <li
            v-for="item in menuItems"
            :key="item.ancrage"
            class="menu-lien-item"
            @mouseenter="survolItem(item.id)"
            @mouseleave="finSurvolItem"
            @click="clicLien(item.ancrage)"
          >
            <a :href="item.ancrage" class="menu-lien-ancre" @click.prevent>
              {{ t('menu.' + item.id) }}
            </a>
          </li>
        </ul>
      </nav>

      <!-- Contrôle Musique (uniquement mobile/visible en bas) -->
      <div class="menu-musique-mobile" ref="musiqueMobileRef">
        <LecteurMusique />
      </div>
    </div>

    <!-- Zone d'images et arrière-plan droit -->
    <div class="menu-espace-droit" ref="espaceDroit" @click="$emit('close')">
      <!-- Volet d'image qui se dévoile par survol -->
      <div class="menu-image-reveal-wrapper" ref="imageWrapper">
        <img
          v-for="item in menuItems"
          :key="item.id"
          :src="imagesRubriques[item.id]"
          :data-id="item.id"
          :alt="'Aperçu ' + item.libelle"
          class="menu-image-reveal"
        />
      </div>

      <!-- Floutage de fond sombre -->
      <div class="menu-fond-sombre"></div>
    </div>
  </div>
</template>

<script setup>
import { ref, watch, onMounted, onBeforeUnmount, nextTick } from 'vue';
import { gsap } from 'gsap';
import { playShowingCard, playHoverMenu } from '../services/audioService';
import { langueActive, setLangue, t } from '../i18n/index';
import LecteurMusique from './LecteurMusique.vue';
import { trackEvent } from '../services/analyticsService';

const props = defineProps({
  ouvert: {
    type: Boolean,
    required: true
  }
});

const emit = defineEmits(['close', 'open-apropos', 'open-offres', 'open-portfolio', 'open-contact']);

// --- Gestion clavier (Echap) ---
const handleKeyDown = (e) => {
  if (e.key === 'Escape' && props.ouvert) {
    emit('close');
  }
};

// --- Refs DOM ---
const sidebar = ref(null);
const espaceDroit = ref(null);
const imageWrapper = ref(null);
const overlayRoot = ref(null);
const languesRef = ref(null);
const liensListeRef = ref(null);
const musiqueMobileRef = ref(null);

// --- Langues ---
const langues = [
  { code: 'fr', nom: 'FRANÇAIS' },
  { code: 'en', nom: 'ENGLISH' },
  { code: 'mg', nom: 'MALAGASY' }
];
const changerLangue = (code) => {
  setLangue(code);
  trackEvent('change_language', { language: code });
};

// --- Éléments du menu ---
const menuItems = [
  { id: 'portfolio', libelle: 'Portfolio', ancrage: '#portfolio' },
  { id: 'offres', libelle: 'Nos offres', ancrage: '#offres' },
  { id: 'apropos', libelle: 'à propos', ancrage: '#apropos' },
  { id: 'contact', libelle: 'Contact', ancrage: '#contact' }
];

// --- Mapping des images de survol ---
const imagesRubriques = {
  portfolio: 'https://ik.imagekit.io/h5zy3jui5/Menu/Portfolio.jpg?updatedAt=1781288855163',
  offres: 'https://ik.imagekit.io/h5zy3jui5/Menu/Offre.jpg?updatedAt=1781288965372',
  apropos: 'https://ik.imagekit.io/h5zy3jui5/Menu/A%20propos.jpg?updatedAt=1781276235566',
  contact: 'https://ik.imagekit.io/h5zy3jui5/Menu/Contact%20menu.jpg?updatedAt=1781289372697'
};

const itemSurvole = ref(null);

// Timeline active (pour pouvoir la tuer proprement)
let tlMenuActif = null;
let estOuvert = false; // flag interne pour savoir si le menu est visible

// --- Montrer le conteneur (visibility + pointer-events) ---
const montrerOverlay = () => {
  if (!overlayRoot.value) return;
  overlayRoot.value.style.visibility = 'visible';
  overlayRoot.value.style.pointerEvents = 'auto';
};

// --- Cacher le conteneur ---
const cacherOverlay = () => {
  if (!overlayRoot.value) return;
  overlayRoot.value.style.visibility = 'hidden';
  overlayRoot.value.style.pointerEvents = 'none';
};

// --- Animation d'ouverture ---
const animerOuverture = () => {
  playShowingCard();
  if (tlMenuActif) tlMenuActif.kill();

  if (!sidebar.value || !espaceDroit.value) {
    return;
  }

  const langBtns = languesRef.value ? languesRef.value.querySelectorAll('.bouton-langue') : [];
  const lienItems = liensListeRef.value ? liensListeRef.value.querySelectorAll('.menu-lien-item') : [];

  // Rendre visible AVANT l'animation
  montrerOverlay();

  // État initial immédiat (prévient tout flash avant l'animation)
  gsap.set(sidebar.value, { x: 0, xPercent: -100 });
  gsap.set(espaceDroit.value, { opacity: 0 });
  if (langBtns.length > 0) gsap.set(langBtns, { opacity: 0, y: -15 });
  if (lienItems.length > 0) gsap.set(lienItems, { opacity: 0, x: -30 });
  if (musiqueMobileRef.value) gsap.set(musiqueMobileRef.value, { opacity: 0, y: 15 });

  tlMenuActif = gsap.timeline();

  // 1. Sidebar glisse depuis la gauche vers la droite
  tlMenuActif.to(sidebar.value, {
    x: 0,
    xPercent: 0,
    duration: 0.8,
    ease: 'power3.out'
  }, 0);

  // 2. Fondu de l'espace droit (fond sombre)
  tlMenuActif.to(espaceDroit.value, {
    opacity: 1,
    duration: 0.8,
    ease: 'power3.out'
  }, 0);

  // 3. Apparition cascade des boutons de langue
  if (langBtns.length > 0) {
    tlMenuActif.to(langBtns, {
      opacity: 1,
      y: 0,
      stagger: 0.08,
      duration: 0.5,
      ease: 'power2.out'
    }, 0.3);
  }

  // 4. Apparition cascade des liens
  if (lienItems.length > 0) {
    tlMenuActif.to(lienItems, {
      opacity: 1,
      x: 0,
      stagger: 0.1,
      duration: 0.6,
      ease: 'power3.out'
    }, 0.2);
  }

  // 5. Apparition du contrôle musique mobile
  if (musiqueMobileRef.value) {
    tlMenuActif.to(musiqueMobileRef.value, {
      opacity: 1,
      y: 0,
      duration: 0.5,
      ease: 'power2.out'
    }, 0.5);
  }

  estOuvert = true;
};

// --- Animation de fermeture ---
const animerFermeture = () => {
  playShowingCard();
  if (tlMenuActif) tlMenuActif.kill();

  if (!sidebar.value || !espaceDroit.value) {
    cacherOverlay();
    estOuvert = false;
    return;
  }

  // Bloquer les clics immédiatement
  if (overlayRoot.value) {
    overlayRoot.value.style.pointerEvents = 'none';
  }

  const langBtns = languesRef.value ? languesRef.value.querySelectorAll('.bouton-langue') : [];
  const lienItems = liensListeRef.value ? liensListeRef.value.querySelectorAll('.menu-lien-item') : [];
  const imgWrap = imageWrapper.value;

  tlMenuActif = gsap.timeline({
    onComplete: () => {
      // Cacher complètement après la fin de l'animation
      cacherOverlay();
      estOuvert = false;
      itemSurvole.value = null;
    }
  });

  // 1. Disparition cascade des liens
  if (lienItems.length > 0) {
    tlMenuActif.to(lienItems, {
      opacity: 0,
      x: -30,
      stagger: 0.05,
      duration: 0.35,
      ease: 'power2.in'
    }, 0);
  }

  // 2. Disparition cascade des boutons de langue
  if (langBtns.length > 0) {
    tlMenuActif.to(langBtns, {
      opacity: 0,
      y: -15,
      stagger: 0.04,
      duration: 0.3,
      ease: 'power2.in'
    }, 0);
  }

  // 3. Image de survol (si présente)
  if (imgWrap) {
    tlMenuActif.to(imgWrap, {
      xPercent: 100,
      opacity: 0,
      duration: 0.4,
      ease: 'power2.in'
    }, 0);
  }

  // 4. Sidebar repart vers la gauche
  tlMenuActif.to(sidebar.value, {
    x: 0,
    xPercent: -100,
    duration: 0.65,
    ease: 'power3.inOut'
  }, 0.15);

  // 5. Espace droit disparaît en fondu
  tlMenuActif.to(espaceDroit.value, {
    opacity: 0,
    duration: 0.65,
    ease: 'power3.inOut'
  }, 0.1);

  // 6. Contrôle musique mobile disparaît
  if (musiqueMobileRef.value) {
    tlMenuActif.to(musiqueMobileRef.value, {
      opacity: 0,
      y: 15,
      duration: 0.3,
      ease: 'power2.in'
    }, 0);
  }
};

// --- Watcher principal sur props.ouvert ---
watch(() => props.ouvert, async (val) => {
  await nextTick();

  if (val) {
    window.addEventListener('keydown', handleKeyDown);
    animerOuverture();
  } else {
    window.removeEventListener('keydown', handleKeyDown);
    if (estOuvert) {
      animerFermeture();
    }
  }
}, { immediate: true });

// Au montage, s'assurer que l'overlay est caché
onMounted(() => {
  cacherOverlay();
  // Positionner les éléments en état "fermé" par défaut
  if (sidebar.value) gsap.set(sidebar.value, { x: 0, xPercent: -100 });
  if (espaceDroit.value) gsap.set(espaceDroit.value, { opacity: 0 });

  if (props.ouvert) {
    animerOuverture();
  }
});


onBeforeUnmount(() => {
  window.removeEventListener('keydown', handleKeyDown);
  if (tlMenuActif) tlMenuActif.kill();
});

// --- Gestion des survols d'images ---
let animationSurvol = null;
let animationSortie = null;

const survolItem = (id) => {
  if (itemSurvole.value === id) return;
  itemSurvole.value = id;
  playHoverMenu();

  if (animationSortie) {
    animationSortie.kill();
    animationSortie = null;
  }

  if (imageWrapper.value) {
    if (animationSurvol) animationSurvol.kill();

    animationSurvol = gsap.timeline();

    // Glissement du conteneur wrapper (révélation)
    animationSurvol.to(imageWrapper.value, {
      xPercent: 0,
      opacity: 1,
      duration: 0.55,
      ease: 'power3.out'
    }, 0);

    // Cross-fade matériel-accéléré des images pré-rendues
    const images = imageWrapper.value.querySelectorAll('.menu-image-reveal');
    images.forEach(img => {
      const isTarget = img.getAttribute('data-id') === id;
      if (isTarget) {
        gsap.fromTo(img, {
          opacity: 0,
          xPercent: 15,
          scale: 1.05
        }, {
          opacity: 1,
          xPercent: 0,
          scale: 1,
          duration: 0.55,
          ease: 'power3.out',
          overwrite: "auto"
        });
      } else {
        gsap.to(img, {
          opacity: 0,
          duration: 0.35,
          ease: 'power2.out',
          overwrite: "auto"
        });
      }
    });
  }
};

const finSurvolItem = () => {
  itemSurvole.value = null;

  if (imageWrapper.value) {
    if (animationSurvol) animationSurvol.kill();

    animationSortie = gsap.timeline({
      onComplete: () => {
        animationSortie = null;
      }
    });

    animationSortie.to(imageWrapper.value, {
      xPercent: 100,
      opacity: 0,
      duration: 0.45,
      ease: 'power3.in'
    }, 0);

    const images = imageWrapper.value.querySelectorAll('.menu-image-reveal');
    animationSortie.to(images, {
      opacity: 0,
      duration: 0.35,
      ease: 'power2.in'
    }, 0);
  }
};

const clicLien = (ancrage) => {
  emit('close');
  if (ancrage === '#apropos') {
    emit('open-apropos');
  } else if (ancrage === '#offres') {
    emit('open-offres');
  } else if (ancrage === '#portfolio') {
    emit('open-portfolio');
  } else if (ancrage === '#contact') {
    emit('open-contact');
  }
};
</script>

<style scoped>
.menu-overlay-container {
  position: fixed;
  inset: 0;
  width: 100vw;
  height: 100vh;
  height: calc(var(--vh, 1vh) * 100);
  height: 100dvh;
  display: flex;
  z-index: 10000;
  overflow: hidden;
  /* Caché par défaut — GSAP contrôle visibility/pointer-events */
  visibility: hidden;
  pointer-events: none;
}

/* Sidebar Gauche (Contrôles et navigation) */
.menu-sidebar-gauche {
  position: absolute;
  left: 0;
  top: 0;
  width: 30vw;
  height: 100%;
  background-color: #D6D6D6;
  color: #050505;
  display: flex;
  flex-direction: column;
  padding: calc(3rem + env(safe-area-inset-top, 0px)) 4vw calc(4% + env(safe-area-inset-bottom, 0px)) 5vw;
  z-index: 10002;
  will-change: transform;
  /* Départ hors-écran (GSAP démarre depuis ici) */
  transform: translateX(-100%);
}

/* Sélecteur de langues */
.menu-langues {
  display: flex;
  gap: 1.5rem;
  align-items: center;
  height: 40px;
}

.bouton-langue {
  font-size: 0.85rem;
  font-weight: 500;
  letter-spacing: 0.05em;
  color: rgba(5, 5, 5, 0.45);
  display: flex;
  align-items: center;
  gap: 0.4rem;
  transition: color 0.3s ease;
  font-family: 'Poppins', sans-serif;
  background: none;
  border: none;
  cursor: pointer;
  padding: 0;
}

.bouton-langue:hover {
  color: #050505;
}

.bouton-langue.actif {
  color: #050505;
  font-weight: 700;
}

.puce-active {
  font-size: 0.7rem;
  margin-top: -1px;
}

/* Zone centrale des liens */
.menu-liens-conteneur {
  flex: 1;
  display: flex;
  align-items: center;
  padding-left: 1rem;
}

.menu-liens-liste {
  list-style: none;
  display: flex;
  flex-direction: column;
  gap: 2.2rem;
}

.menu-lien-item {
  cursor: pointer;
  display: block;
}

.menu-lien-ancre {
  font-size: 3.2rem;
  font-weight: 400;
  font-style: normal;
  color: #050505;
  display: inline-block;
  font-family: 'Poppins', sans-serif;
  line-height: 1.1;
  letter-spacing: -0.01em;
  /* skewX pour simuler l'italic de façon fluide */
  transition: transform 0.5s cubic-bezier(0.16, 1, 0.3, 1),
              font-weight 0.5s cubic-bezier(0.16, 1, 0.3, 1),
              letter-spacing 0.5s cubic-bezier(0.16, 1, 0.3, 1);
  transform-origin: left center;
  transform: skewX(0deg) translateX(0px);
}

/* Effets de survol Premium (Bold + skewX italic fluide + Glissement) */
.menu-lien-item:hover .menu-lien-ancre {
  font-weight: 700;
  transform: skewX(-8deg) translateX(18px);
  letter-spacing: 0.01em;
}

/* Zone droite de l'écran (Visuelle) */
.menu-espace-droit {
  position: absolute;
  left: 30vw;
  top: 0;
  width: 70vw;
  height: 100%;
  z-index: 10001;
  cursor: pointer;
  overflow: hidden;
  background-color: transparent;
  /* Départ transparent (GSAP démarre depuis ici) */
  opacity: 0;
  will-change: opacity;
}

/* Conteneur d'image dévoilé par glissement horizontal */
.menu-image-reveal-wrapper {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  overflow: hidden;
  opacity: 0;
  z-index: 10003;
  will-change: transform, opacity;
}

.menu-image-reveal {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
  opacity: 0;
  will-change: transform, opacity;
}

.menu-fond-sombre {
  position: absolute;
  inset: 0;
  background-color: rgba(5, 5, 5, 0.45);
  backdrop-filter: blur(8px);
  z-index: 10002;
  width: 100%;
  height: 100%;
}
.menu-musique-mobile {
  display: none;
}

/* Règle adaptative pour tablettes et mobiles */
@media (max-width: 1024px) {
  .menu-sidebar-gauche {
    width: 75vw;
    padding: 3rem 1.5rem 4%;
  }

  .menu-espace-droit {
    display: block;
    left: 75vw;
    width: 25vw;
  }

  .menu-image-reveal-wrapper {
    display: none !important;
  }

  .menu-lien-ancre {
    font-size: 3.2rem;
  }
}

@media (max-width: 768px) {
  .menu-sidebar-gauche {
    width: 75vw;
    padding: calc(3rem + env(safe-area-inset-top, 0px)) 1.5rem calc(4% + env(safe-area-inset-bottom, 0px)) !important;
  }

  .menu-espace-droit {
    left: 75vw;
    width: 25vw;
  }

  .menu-lien-ancre {
    font-size: 3rem;
  }

  .menu-musique-mobile {
    display: block;
    margin-top: auto;
    padding-top: 1.5rem;
    padding-left: 1rem;
  }
  .menu-musique-mobile :deep(.bouton-musique) {
    color: #050505 !important;
    opacity: 0.65;
    margin-right: 0;
    padding-left: 0;
    font-size: 1.4rem;
  }
  .menu-musique-mobile :deep(.bouton-musique.actif) {
    opacity: 1;
  }
}

@media (max-width: 480px) {
  .menu-sidebar-gauche {
    width: 75vw;
    padding: 3rem 1.2rem 4%;
  }

  .menu-espace-droit {
    left: 75vw;
    width: 25vw;
  }

  .menu-lien-ancre {
    font-size: 2.8rem;
  }
}
</style>
