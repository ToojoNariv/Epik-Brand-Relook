<template>
  <div v-if="!isMobile" class="custom-cursor-wrapper" :class="{ 'hors-ecran': horsEcran }" ref="wrapperRef">
    <div class="custom-cursor-inner" :class="{
      'sur-accueil': estSurAccueil,
      'en-mouvement': estEnMouvement,
      'au-survol': estAuSurvol,
      'projet-explorer-mode': estSurActiveCard
    }">
      <!-- Point central rectangulaire visible à l'état par défaut (masqué en mode texte ou explorer) -->
      <div class="point-central"></div>

      <!-- Texte pour la page d'accueil -->
      <span class="texte-curseur" v-html="t('curseur.cliquezExplorer')"></span>

      <!-- Texte pour la page Projets (carte active) -->
      <span class="texte-curseur-explorer">{{ t('curseur.explorer') }}</span>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onBeforeUnmount, watch } from 'vue';
import { gsap } from 'gsap';
import { playDefaultClick, playCursorWithTextClick } from '../services/audioService';
import { t } from '../i18n/index';

const props = defineProps({
  estSurAccueil: {
    type: Boolean,
    default: false
  }
});

const wrapperRef = ref(null);
const estEnMouvement = ref(false);
const estAuSurvol = ref(false);
const estSurActiveCard = ref(false);
const horsEcran = ref(false);
const isMobile = ref(false);

let xTo = null;
let yTo = null;
let timeoutMouvement = null;

const mettreAJourEtatCible = (target, eventType = '') => {
  if (!target) return;

  // 1. Détection du survol de la carte active dans ProjetsView
  const surActiveCard = target.closest('.projet-cadre.actif');
  if (surActiveCard) {
    estSurActiveCard.value = true;
    estAuSurvol.value = false;
    return;
  } else {
    estSurActiveCard.value = false;
  }

  // 2. Éléments de l'accueil qui ramènent immédiatement le curseur à l'état par défaut (sans texte ni zoom)
  const elementAccueilNormal = target.closest('.miniature-cadre, .lien-vertical, .logo-conteneur, .logo-conteneur *, .lien-nav, .bouton-offres, .controle-musique, .musique-btn, .pagination-bas');
  if (elementAccueilNormal) {
    estAuSurvol.value = false;
    estEnMouvement.value = false;
    return;
  }

  // 3. Autres éléments interactifs pour l'effet zoom léger classique
  const elementInteractif = target.closest('a, button, input, select, textarea, [role="button"], .projet-carte-item, .menu-bouton, .menu-lien, .expertise-carte, .btn-offres, .social-icon, .barre-verticale, .slider-barres-bas, .custom-select-trigger, .custom-select-option');

  if (elementInteractif) {
    estAuSurvol.value = true;
  } else {
    estAuSurvol.value = false;
  }
};

const onMouseMove = (e) => {
  if (isMobile.value || !xTo || !yTo) return;

  // Suivi fluide des coordonnées client (viewport)
  xTo(e.clientX);
  yTo(e.clientY);

  if (horsEcran.value) {
    horsEcran.value = false;
  }



  // Comportement spécifique sur la page d'accueil (expansion)
  if (props.estSurAccueil) {
    // Ne s'active que si on est sur la grande photo ou le slogan de l'accueil
    const surGrandePhoto = e.target && e.target.closest('.hero-image-morph, .slogan-centre');

    if (surGrandePhoto) {
      if (!estEnMouvement.value) {
        playCursorWithTextClick();
      }
      estEnMouvement.value = true;

      // Réduction rapide après 250ms d'inactivité de mouvement
      clearTimeout(timeoutMouvement);
      timeoutMouvement = setTimeout(() => {
        estEnMouvement.value = false;
      }, 250);
    } else {
      estEnMouvement.value = false;
    }
  }
};

const onMouseOver = (e) => {
  if (isMobile.value || !e.target) return;
  mettreAJourEtatCible(e.target, 'mouseover');
};

const onMouseOut = (e) => {
  if (isMobile.value) return;
  if (e.relatedTarget) {
    mettreAJourEtatCible(e.relatedTarget, 'mouseout');
  }
};

const onMouseLeave = () => {
  horsEcran.value = true;
  estEnMouvement.value = false;
};

const onMouseEnter = () => {
  horsEcran.value = false;
};

const onClick = (e) => {
  if (isMobile.value || !e.target) return;

  const target = e.target;
  const surGrandePhoto = target.closest('.hero-image-morph, .slogan-centre');
  const cursorWithText = estSurActiveCard.value || (props.estSurAccueil && surGrandePhoto);

  if (cursorWithText) {
    playCursorWithTextClick();
  } else {
    const elementInteractif = target.closest('a, button, input, select, textarea, [role="button"], .projet-carte-item, .menu-bouton, .menu-lien, .expertise-carte, .btn-offres, .social-icon, .barre-verticale, .slider-barres-bas, .logo-conteneur, .custom-select-trigger, .custom-select-option, .miniature-cadre');
    if (elementInteractif) {
      playDefaultClick();
    }
  }

  // Attendre la mise à jour réactive du DOM par Vue (ajout/retrait de .actif)
  setTimeout(() => {
    mettreAJourEtatCible(e.target, 'click');
  }, 0);
};

// Si on change de page, réinitialiser immédiatement les états
watch(() => props.estSurAccueil, (nouveau) => {
  estEnMouvement.value = false;
  estSurActiveCard.value = false;
  estAuSurvol.value = false;
  clearTimeout(timeoutMouvement);
});

onMounted(() => {
  // Détecter si l'appareil est tactile (pas de curseur)
  if (window.matchMedia('(pointer: coarse)').matches) {
    isMobile.value = true;
    return;
  }

  // Initialisation GSAP quickTo pour un déplacement fluide à 60 FPS
  if (wrapperRef.value) {
    xTo = gsap.quickTo(wrapperRef.value, "x", { duration: 0.12, ease: "power2.out" });
    yTo = gsap.quickTo(wrapperRef.value, "y", { duration: 0.12, ease: "power2.out" });

    // Masquer le curseur initialement
    gsap.set(wrapperRef.value, { x: -100, y: -100 });
  }

  // Écouteurs d'événements globaux
  window.addEventListener('mousemove', onMouseMove);
  window.addEventListener('mouseover', onMouseOver);
  window.addEventListener('mouseout', onMouseOut);
  window.addEventListener('click', onClick, true);
  document.addEventListener('mouseleave', onMouseLeave);
  document.addEventListener('mouseenter', onMouseEnter);
});

onBeforeUnmount(() => {
  clearTimeout(timeoutMouvement);
  window.removeEventListener('mousemove', onMouseMove);
  window.removeEventListener('mouseover', onMouseOver);
  window.removeEventListener('mouseout', onMouseOut);
  window.removeEventListener('click', onClick, true);
  document.removeEventListener('mouseleave', onMouseLeave);
  document.removeEventListener('mouseenter', onMouseEnter);
});
</script>

<style scoped>
.custom-cursor-wrapper {
  position: fixed;
  top: 0;
  left: 0;
  pointer-events: none;
  z-index: 999999;
  opacity: 1;
  will-change: transform;
  transition: opacity 0.3s ease;
}

.custom-cursor-wrapper.hors-ecran {
  opacity: 0;
}

/* Le curseur par défaut est rectangulaire (carré) */
.custom-cursor-inner {
  position: absolute;
  top: 0;
  left: 0;
  width: 24px;
  height: 24px;
  border: 1.5px solid rgba(255, 255, 255, 0.95);
  /* Bordure blanche opaque */
  background-color: rgba(255, 255, 255, 0);
  transform: translate(-50%, -50%);
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
  box-shadow: none !important;

  /* Transitions fluides pour le changement de forme et de taille */
  transition:
    width 0.35s cubic-bezier(0.25, 1, 0.5, 1),
    height 0.35s cubic-bezier(0.25, 1, 0.5, 1),
    background-color 0.35s cubic-bezier(0.25, 1, 0.5, 1),
    border-color 0.35s cubic-bezier(0.25, 1, 0.5, 1),
    border-radius 0.35s cubic-bezier(0.25, 1, 0.5, 1),
    transform 0.3s cubic-bezier(0.25, 1, 0.5, 1);
}

/* Point central rectangulaire (carré) */
.point-central {
  width: 6px;
  height: 6px;
  background-color: rgba(255, 255, 255, 0.95);
  border-radius: 1px;
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  opacity: 1;
  transition:
    opacity 0.25s cubic-bezier(0.25, 1, 0.5, 1),
    transform 0.25s cubic-bezier(0.25, 1, 0.5, 1),
    background-color 0.25s cubic-bezier(0.25, 1, 0.5, 1);
}

/* Page d'accueil : quand la souris bouge (s'agrandit en rectangle horizontal) */
.custom-cursor-inner.sur-accueil.en-mouvement {
  width: 150px;
  height: 75px;
  background-color: rgba(255, 255, 255, 0.88);
  border-color: rgba(255, 255, 255, 1);
}

/* Cacher le point central lors de l'agrandissement ou en mode explorer */
.custom-cursor-inner.sur-accueil.en-mouvement .point-central,
.custom-cursor-inner.projet-explorer-mode .point-central {
  opacity: 0;
  transform: translate(-50%, -50%) scale(0);
}

/* Effet de survol sur éléments cliquables (rétrécit ou s'ajuste en petit rectangle) */
.custom-cursor-inner.au-survol {
  transform: translate(-50%, -50%) scale(1.3);
  background-color: rgba(255, 255, 255, 0.1);
  border-color: rgba(255, 255, 255, 1);
  border-radius: 2px;
}

.custom-cursor-inner.au-survol .point-central {
  background-color: rgba(255, 255, 255, 1);
  transform: translate(-50%, -50%) scale(1.1);
}

/* Mode Explorer de la page ProjetsView (Cercle noir) */
.custom-cursor-inner.projet-explorer-mode {
  width: 110px;
  height: 110px;
  background-color: #050505;
  /* Cercle noir */
  border-color: rgba(255, 255, 255, 0);
  border-radius: 50% !important;
  /* Devient cercle */
}

/* Texte interne page d'accueil (masqué si non-mouvement ou survol) */
.texte-curseur {
  color: #050505;
  font-family: 'Space Grotesk', sans-serif;
  font-size: 13px;
  font-weight: 400;
  text-transform: uppercase;
  text-align: center;
  white-space: nowrap;
  line-height: 1.3;
  opacity: 0;
  transform: translateY(8px) scale(0.95);
  transition:
    opacity 0.25s cubic-bezier(0.25, 1, 0.5, 1),
    transform 0.25s cubic-bezier(0.25, 1, 0.5, 1);
}

.custom-cursor-inner.sur-accueil.en-mouvement:not(.au-survol):not(.projet-explorer-mode) .texte-curseur {
  opacity: 1;
  transform: translateY(0) scale(1);
  transition-delay: 0.08s;
}

/* Texte interne EXPLORER pour le mode projets (cercle noir) */
.texte-curseur-explorer {
  color: #ffffff;
  font-family: 'Space Grotesk', sans-serif;
  font-size: 13px;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.14em;
  text-align: center;
  position: absolute;
  opacity: 0;
  transform: scale(0.85);
  transition:
    opacity 0.25s cubic-bezier(0.25, 1, 0.5, 1),
    transform 0.25s cubic-bezier(0.25, 1, 0.5, 1);
}

.custom-cursor-inner.projet-explorer-mode .texte-curseur-explorer {
  opacity: 1;
  transform: scale(1);
  transition-delay: 0.05s;
}
</style>
