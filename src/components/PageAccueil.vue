<template>
  <div ref="elementConteneur" class="accueil-conteneur">
    <HeaderEpik ref="headerRef" mode="accueil" position="fixed" @logo-click="retournerAHero"
      @expertises-click="gererClicExpertises" @menu-click="menuOuvert = !menuOuvert" @offres-click="ouvrirOffres" />

    <section class="section-hero" ref="elementSectionHero">
      <!-- 1. Image/Vidéo Héro autonome qui va "morpher" en carte Photographie -->
      <div class="hero-image-morph" ref="elementImageMorph" @click="ouvrirProjetsDepuisHero"
        :style="{ pointerEvents: (etatAnimation === 1 && pageCourante === 'accueil') ? 'auto' : 'none', cursor: (etatAnimation === 1 && pageCourante === 'accueil') ? 'pointer' : 'default' }">
        <video v-if="activeExpertise === 'video'" src="/images/Background vidéo.mp4" autoplay loop muted playsinline
          class="image-morphee-source" style="width: 100%; height: 100%; object-fit: cover;"></video>
        <img v-else :src="imagesExpertises[activeExpertise]" alt="Studio Photo Epik" class="image-morphee-source" />
        <div class="overlay-morph" ref="elementOverlayMorph"></div>
        <div class="overlay-morph-discret" ref="elementOverlayMorphDiscret"></div>
      </div>

      <!-- Couches de morphing pour les 3 autres expertises (Surgissent depuis les miniatures) -->
      <div class="miniature-morph-layer" ref="elementMorphVideo">
        <video v-if="expertiseMorphVideo === 'video'" src="/images/Background vidéo.mp4" autoplay loop muted playsinline
          class="image-morphee-source" style="width: 100%; height: 100%; object-fit: cover;"></video>
        <img v-else :src="imagesExpertises[expertiseMorphVideo]" alt="Vidéo Morph" class="image-morphee-source" />
        <div class="overlay-morph-mini"></div>
      </div>

      <div class="miniature-morph-layer" ref="elementMorphGraphique">
        <video v-if="expertiseMorphGraphique === 'video'" src="/images/Background vidéo.mp4" autoplay loop muted
          playsinline class="image-morphee-source" style="width: 100%; height: 100%; object-fit: cover;"></video>
        <img v-else :src="imagesExpertises[expertiseMorphGraphique]" alt="Graphique Morph"
          class="image-morphee-source" />
        <div class="overlay-morph-mini"></div>
      </div>

      <div class="miniature-morph-layer" ref="elementMorphWeb">
        <video v-if="expertiseMorphWeb === 'video'" src="/images/Background vidéo.mp4" autoplay loop muted playsinline
          class="image-morphee-source" style="width: 100%; height: 100%; object-fit: cover;"></video>
        <img v-else :src="imagesExpertises[expertiseMorphWeb]" alt="Web Morph" class="image-morphee-source" />
        <div class="overlay-morph-mini"></div>
      </div>

      <div class="slogan-centre" ref="elementSlogan">
        <div class="signe-plus-css" :key="'plus-gauche-' + activeExpertise"></div>
        <h1 class="titre-principal text-titre" :key="activeExpertise"
          style="overflow: hidden; line-height: 1.2; padding-bottom: 0.05em; display: inline-block;">
          <span v-for="(lettre, i) in t('hero.' + activeExpertise).split('')" :key="i" class="lettre-titre-hero"
            :style="{ animationDelay: `${i * 0.03}s` }">{{ lettre === ' ' ? '\u00A0' : lettre }}</span>
        </h1>
        <div class="signe-plus-css" :key="'plus-droit-' + activeExpertise"></div>
      </div>

      <div class="menu-bas-gauche texte-majuscule" ref="elementMenuGauche">
        <a href="#portfolio" class="lien-vertical" @click.prevent="ouvrirPortfolio"
          @mouseenter="playHoverMenu">{{ t('menu.portfolio') }}</a>
        <a href="#offres" class="lien-vertical" @click.prevent="ouvrirOffres" @mouseenter="playHoverMenu">{{ t('menu.offres') }}</a>
        <a href="#apropos" class="lien-vertical" @click.prevent="ouvrirAPropos" @mouseenter="playHoverMenu">{{ t('menu.apropos') }}</a>
        <a href="#contact" class="lien-vertical" @click.prevent="ouvrirContact" @mouseenter="playHoverMenu">{{ t('menu.contact') }}</a>
      </div>

      <div class="pagination-bas" ref="elementPagination">
        <span class="numero-courant" :key="indexActiveExpertise">{{ indexActiveExpertise }}</span>
        <span class="tiret-separation">—</span>
        <span class="numero-total">4</span>
      </div>

      <div class="miniatures-bas" ref="elementMiniatures">
        <template v-for="mini in miniaturesFiltrees" :key="mini.id">
          <div class="miniature-cadre" :id="'mini-' + mini.id" @click="onMiniatureClic(mini.id)">
            <video v-if="mini.id === 'video'" src="/images/Background vidéo.mp4" autoplay loop muted playsinline
              class="miniature-img" style="width: 100%; height: 100%; object-fit: cover;"></video>
            <img v-else :src="mini.src" :alt="mini.alt" class="miniature-img" />
            <!-- Overlay de survol avec texte dynamique -->
            <div class="miniature-survol-overlay">
              <span class="miniature-survol-texte">{{ obtenirMiniLabel(mini.id) }}</span>
            </div>
          </div>
        </template>
      </div>

      <div class="section-expertises-absolute" ref="elementSectionExpertises">
        <GrilleExpertises @selectionner="onCarteClic" />
      </div>
    </section>

    <SectionStats ref="elementSectionStats" />

    <!-- Vue des projets par catégorie (avec transition fluide en fondu/échelle) -->
    <Transition name="fondu-projets">
      <ProjetsView v-if="pageCourante === 'projets'" :categorie="activeExpertise" @close="retournerAExpertises"
        @open-detail="projetActifDetail = $event" />
    </Transition>

    <!-- Vue du portfolio complet avec robot 3D Spline (transition sans scale pour performance WebGL) -->
    <Transition name="fondu-portfolio">
      <Portfolio v-show="pageCourante === 'portfolio'" :visible="pageCourante === 'portfolio'"
        :categorie="activeExpertise" @close="retournerAExpertises" @open-detail="projetActifDetail = $event" />
    </Transition>

    <!-- Vue détaillée du projet (overlay plein écran) -->
    <Transition name="fondu-projets">
      <ProjetDetail v-if="projetActifDetail" :projet="projetActifDetail" @close="projetActifDetail = null" />
    </Transition>

    <Teleport to="body">
      <MenuOverlay :ouvert="menuOuvert" @close="menuOuvert = false" @open-apropos="ouvrirAPropos"
        @open-offres="ouvrirOffres" @open-portfolio="ouvrirPortfolio" @open-contact="ouvrirContact" />
    </Teleport>

    <Teleport to="body">
      <OffresPage :ouvert="offresOuvert" @close="offresOuvert = false" @open-menu="menuOuvert = true" />
    </Teleport>

    <Teleport to="body">
      <AProposPage :ouvert="aproposOuvert" @close="aproposOuvert = false" @open-menu="menuOuvert = true" />
    </Teleport>

    <Teleport to="body">
      <ContactPage :ouvert="contactOuvert" @close="contactOuvert = false" @open-menu="menuOuvert = true" />
    </Teleport>

    <!-- Curseur personnalisé fluide sur tout le site -->
    <CurseurCustom :est-sur-accueil="pageCourante === 'accueil' && etatAnimation === 1" />
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onBeforeUnmount, nextTick, watch } from 'vue';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { Observer } from 'gsap/Observer';
import { playCursorWithTextClick, playScrollTick, playShowingCard, playHoverMenu, playHomeCardApparition } from '../services/audioService';
import { t } from '../i18n/index';
import HeaderEpik from './HeaderEpik.vue';
import GrilleExpertises from './GrilleExpertises.vue';
import SectionStats from './SectionStats.vue';
import MenuOverlay from './MenuOverlay.vue';
import OffresPage from './OffresPage.vue';
import AProposPage from './AProposPage.vue';
import ContactPage from './ContactPage.vue';
import ProjetsView from './ProjetsView.vue';
import Portfolio from './Portfolio.vue';
import ProjetDetail from './ProjetDetail.vue';
import CurseurCustom from './CurseurCustom.vue';

const props = defineProps({
  startEntrance: {
    type: Boolean,
    default: false
  }
});

const headerRef = ref(null);
const menuOuvert = ref(false);
const offresOuvert = ref(false);
const aproposOuvert = ref(false);
const contactOuvert = ref(false);
const pageCourante = ref('accueil'); // 'accueil' | 'projets' | 'portfolio'
const projetActifDetail = ref(null);
const activeExpertise = ref('photo');
const imagesExpertises = {
  photo: 'https://ik.imagekit.io/h5zy3jui5/Home%20photo/Photographie%20Background.jpg?updatedAt=1781288609519',
  video: 'https://ik.imagekit.io/h5zy3jui5/Home%20photo/Background%20vid%C3%A9o.mp4?updatedAt=1781274755649',
  graphique: 'https://ik.imagekit.io/h5zy3jui5/Home%20photo/design.jpg',
  web: 'https://ik.imagekit.io/h5zy3jui5/Home%20photo/Web%20Background.jpg?updatedAt=1781274741057'
};

const titresExpertises = {
  photo: "Soignez votre image",
  video: "Sublimez vos vidéos",
  graphique: "Créez votre identité",
  web: "Digitalisez votre vision"
};

const indexActiveExpertise = computed(() => {
  const index = ['photo', 'video', 'graphique', 'web'].indexOf(activeExpertise.value);
  return index !== -1 ? index + 1 : 1;
});

const obtenirMiniLabel = (id) => {
  if (id === 'photo') return t('hero.labelPhoto');
  if (id === 'video') return t('hero.labelVideo');
  if (id === 'graphique') return t('hero.labelDesign');
  if (id === 'web') return t('hero.labelWeb');
  return '';
};

const fermerToutesLesPages = () => {
  offresOuvert.value = false;
  aproposOuvert.value = false;
  contactOuvert.value = false;
  projetActifDetail.value = null;
};

const ouvrirOffres = () => {
  menuOuvert.value = false;
  fermerToutesLesPages();
  offresOuvert.value = true;
};

const ouvrirAPropos = () => {
  menuOuvert.value = false;
  fermerToutesLesPages();
  aproposOuvert.value = true;
};

const ouvrirContact = () => {
  menuOuvert.value = false;
  fermerToutesLesPages();
  contactOuvert.value = true;
};

const toutesLesExpertises = [
  { id: 'photo', src: 'https://ik.imagekit.io/h5zy3jui5/Home%20photo/Photographie%20Background.jpg?updatedAt=1781288609519', alt: 'Vignette Photo' },
  { id: 'video', src: 'https://ik.imagekit.io/h5zy3jui5/Home%20photo/Background%20vid%C3%A9o.mp4?updatedAt=1781274755649', alt: 'Vignette Vidéo' },
  { id: 'graphique', src: 'https://ik.imagekit.io/h5zy3jui5/Home%20photo/design.jpg', alt: 'Vignette Graphique' },
  { id: 'web', src: 'https://ik.imagekit.io/h5zy3jui5/Home%20photo/Web%20Background.jpg?updatedAt=1781274741057', alt: 'Vignette Web' }
];


const miniaturesFiltrees = computed(() =>
  toutesLesExpertises.filter(e => e.id !== activeExpertise.value)
);

const expertiseMorphVideo = computed(() => {
  return activeExpertise.value === 'video' ? 'photo' : 'video';
});

const expertiseMorphGraphique = computed(() => {
  return activeExpertise.value === 'graphique' ? 'photo' : 'graphique';
});

const expertiseMorphWeb = computed(() => {
  return activeExpertise.value === 'web' ? 'photo' : 'web';
});

const gsapInstance = gsap;
gsapInstance.registerPlugin(ScrollTrigger, Observer);

// Références vers les éléments DOM
const elementConteneur = ref(null);
const elementSectionHero = ref(null);
const elementSectionExpertises = ref(null);
const elementImageMorph = ref(null);
const elementOverlayMorph = ref(null);
const elementOverlayMorphDiscret = ref(null);
const elementSlogan = ref(null);
const elementLiensNav = ref(null);
const elementBoutonOffres = ref(null);
const elementMenuGauche = ref(null);
const elementPagination = ref(null);
const elementMiniatures = ref(null);
const elementTransitionCurtain = ref(null);

// Couches de morphing des miniatures
const elementMorphVideo = ref(null);
const elementMorphGraphique = ref(null);
const elementMorphWeb = ref(null);

const elementSectionStats = ref(null);

let contexteScrollTrigger = null;
let timelinePrincipale = null;
const etatAnimation = ref(1); // 1 = hero, 2 = grille et stats
let animationEnCours = false;
let mainScrollObserver = null;

const initialiserAnimations = () => {
  if (contexteScrollTrigger) {
    contexteScrollTrigger.revert();
  }

  gsapInstance.set(elementBoutonOffres.value, { opacity: 0, scale: 0.9, display: 'none' });
  gsapInstance.set(elementLiensNav.value, { opacity: 1, display: 'flex' });
  gsapInstance.set(".expertise-carte", { opacity: 1 });
  gsapInstance.set(elementOverlayMorphDiscret.value, { opacity: 0 });

  // Masquer la section stats au départ (elle apparaît uniquement dans l'état 2)
  gsapInstance.set('.conteneur-stats', { opacity: 0, y: 30 });

  // Rétablir la visibilité et nettoyer les styles inline laissés par le morphing retour
  if (elementSlogan.value && elementMenuGauche.value && elementPagination.value) {
    // Affichage instantané des éléments satellites
    gsapInstance.set([
      elementMenuGauche.value,
      elementPagination.value
    ], { opacity: 1, y: 0, clearProps: "y" });

    // L'animation du titre Héro est maintenant gérée purement en CSS (@keyframes) 
    // pour garantir son exécution parfaite à chaque changement de 'activeExpertise'
    gsapInstance.set(elementSlogan.value, { opacity: 1, y: 0, clearProps: "y" });
  }

  // Cacher le container des titres de cartes, mais aussi masquer les lettres
  gsapInstance.set(".nom-expertise", { opacity: 1, y: 0 }); // Le conteneur reste visible
  gsapInstance.set(".lettre-titre-carte", { y: "110%", opacity: 1 }); // Masquées en bas du masque
  gsapInstance.set(".image-overlay", { opacity: 0 });

  // L'overlay d'accueil démarre à 0 et fait une transition fluide (plus de popup brusque)
  gsapInstance.set(elementOverlayMorph.value, { opacity: 0 });
  gsapInstance.to(elementOverlayMorph.value, { opacity: 1, duration: 0.8, ease: "power2.out" });

  // IMPORTANT : Rendre temporairement la grille visible pour mesurer les positions des cartes
  const grilleEl = elementSectionExpertises.value;
  grilleEl.style.visibility = 'visible';
  grilleEl.style.opacity = '1';
  grilleEl.style.pointerEvents = 'none';

  // 2. Mesurer la position cible pour les images morpheuses
  const elementCiblePhoto = document.querySelector('#carte-photo .expertise-conteneur-image');
  const elementCibleVideo = document.querySelector('#carte-video .expertise-conteneur-image');
  const elementCibleGraphique = document.querySelector('#carte-graphique .expertise-conteneur-image');
  const elementCibleWeb = document.querySelector('#carte-web .expertise-conteneur-image');

  if (!elementCiblePhoto || !elementCibleVideo || !elementCibleGraphique || !elementCibleWeb) {
    grilleEl.style.visibility = 'hidden';
    grilleEl.style.opacity = '0';
    return;
  }

  // Cacher les vraies images des cartes, leurs fonds noirs et overlays initialement
  gsapInstance.set(".expertise-carte .image-fond", { opacity: 0, scale: 1 });
  gsapInstance.set(".expertise-carte", { background: "transparent" });
  gsapInstance.set(".image-overlay", { opacity: 0 });

  // Mesurer et positionner initialement les 3 miniatures morpheuses sur les vignettes physiques
  const act = activeExpertise.value;

  const confVideo = {
    image: act === 'video' ? 'https://ik.imagekit.io/h5zy3jui5/Home%20photo/Photographie%20Background.jpg?updatedAt=1781278583752' : 'https://ik.imagekit.io/h5zy3jui5/Home%20photo/Background%20vid%C3%A9o.mp4?updatedAt=1781274755649',
    mini: act === 'video' ? '#mini-photo' : '#mini-video',
    card: act === 'video' ? '#carte-photo' : '#carte-video'
  };

  const confGraphique = {
    image: act === 'graphique' ? 'https://ik.imagekit.io/h5zy3jui5/Home%20photo/design.jpg' : 'https://ik.imagekit.io/h5zy3jui5/Home%20photo/design.jpg',
    mini: act === 'graphique' ? '#mini-photo' : '#mini-graphique',
    card: act === 'graphique' ? '#carte-photo' : '#carte-graphique'
  };

  const confWeb = {
    image: act === 'web' ? 'https://ik.imagekit.io/h5zy3jui5/Home%20photo/Photographie%20Background.jpg?updatedAt=1781278583752' : 'https://ik.imagekit.io/h5zy3jui5/Home%20photo/Web%20Background.jpg?updatedAt=1781274741057',
    mini: act === 'web' ? '#mini-photo' : '#mini-web',
    card: act === 'web' ? '#carte-photo' : '#carte-web'
  };

  // Positions de départ (les vignettes physiques)
  const miniVideo = document.querySelector(confVideo.mini);
  const miniGraphique = document.querySelector(confGraphique.mini);
  const miniWeb = document.querySelector(confWeb.mini);

  if (miniVideo && miniGraphique && miniWeb) {
    const rV = miniVideo.getBoundingClientRect();
    const rG = miniGraphique.getBoundingClientRect();
    const rW = miniWeb.getBoundingClientRect();

    // Obtenir la position de la carte cible correspondante
    const elementCibleVideoDynamique = document.querySelector(`${confVideo.card} .expertise-conteneur-image`);
    const elementCibleGraphiqueDynamique = document.querySelector(`${confGraphique.card} .expertise-conteneur-image`);
    const elementCibleWebDynamique = document.querySelector(`${confWeb.card} .expertise-conteneur-image`);

    if (elementCibleVideoDynamique && elementCibleGraphiqueDynamique && elementCibleWebDynamique) {
      const rectCibleVideo = elementCibleVideoDynamique.getBoundingClientRect();
      const rectCibleGraphique = elementCibleGraphiqueDynamique.getBoundingClientRect();
      const rectCibleWeb = elementCibleWebDynamique.getBoundingClientRect();

      const scaleVideoX = rV.width / rectCibleVideo.width;
      const scaleVideoY = rV.height / rectCibleVideo.height;
      const scaleGraphiqueX = rG.width / rectCibleGraphique.width;
      const scaleGraphiqueY = rG.height / rectCibleGraphique.height;
      const scaleWebX = rW.width / rectCibleWeb.width;
      const scaleWebY = rW.height / rectCibleWeb.height;

      gsapInstance.set(elementMorphVideo.value, {
        width: rectCibleVideo.width,
        height: rectCibleVideo.height,
        x: rV.left + (rV.width - rectCibleVideo.width) / 2,
        y: rV.top + (rV.height - rectCibleVideo.height) / 2,
        scaleX: scaleVideoX,
        scaleY: scaleVideoY,
        borderRadius: "0px",
        opacity: 0,
        display: "none",
        transformOrigin: "center center"
      });

      gsapInstance.set(elementMorphGraphique.value, {
        width: rectCibleGraphique.width,
        height: rectCibleGraphique.height,
        x: rG.left + (rG.width - rectCibleGraphique.width) / 2,
        y: rG.top + (rG.height - rectCibleGraphique.height) / 2,
        scaleX: scaleGraphiqueX,
        scaleY: scaleGraphiqueY,
        borderRadius: "0px",
        opacity: 0,
        display: "none",
        transformOrigin: "center center"
      });

      gsapInstance.set(elementMorphWeb.value, {
        width: rectCibleWeb.width,
        height: rectCibleWeb.height,
        x: rW.left + (rW.width - rectCibleWeb.width) / 2,
        y: rW.top + (rW.height - rectCibleWeb.height) / 2,
        scaleX: scaleWebX,
        scaleY: scaleWebY,
        borderRadius: "0px",
        opacity: 0,
        display: "none",
        transformOrigin: "center center"
      });
    }
  }

  // Réinitialiser les overlays de survol au chargement de l'État 1
  gsapInstance.set(".miniature-survol-overlay", { clearProps: "all" });
  gsapInstance.set(".miniature-img", { clearProps: "opacity" });


  // Création du contexte GSAP
  contexteScrollTrigger = gsapInstance.context(() => {

    let positionX = 0; // Position cible actuelle en pixels
    let positionXMax = 0; // Limite de défilement calculée dynamiquement
    let quickTranslateX = null; // Référence vers le gsap.quickTo de la grille
    let quickTranslateXImages = null; // Référence vers le gsap.quickTo des images (Parallax)
    let isScrolling = false; // Indique si un geste de scroll est en cours
    let scrollTimer = null; // Timer pour détecter la fin du geste de scroll

    // Calculer le positionX initial pour centrer l'expertise active !
    const act = activeExpertise.value;
    const grille = document.querySelector('.expertises-grille');
    const carteActive = document.querySelector(`#carte-${act}`);
    if (grille && carteActive) {
      const largeurGrille = grille.scrollWidth;
      const largeurVisible = grille.parentElement.clientWidth;
      const maxScroll = Math.max(0, largeurGrille - largeurVisible);
      const offsetLeft = carteActive.offsetLeft;
      const cardWidth = carteActive.clientWidth;

      let targetX = offsetLeft - (largeurVisible - cardWidth) / 2;
      positionX = Math.max(0, Math.min(targetX, maxScroll));

      // Appliquer instantanément le scroll pour la mesure des coordonnées
      gsapInstance.set(grille, { x: -positionX });
      gsapInstance.set(".expertises-grille .image-fond", { x: positionX * 0.15 });
    }

    const initialiserScrollHorizontal = () => {
      const grilleEl = document.querySelector('.expertises-grille');
      if (!grilleEl) return;

      const largeurGrille = grilleEl.scrollWidth;
      const largeurVisible = grilleEl.parentElement.clientWidth;
      positionXMax = Math.max(0, largeurGrille - largeurVisible);

      // quickTo pour la grille : scroll fluide et continu (sans assistance)
      quickTranslateX = gsapInstance.quickTo(grilleEl, "x", {
        duration: 0.8,
        ease: "power2.out"
      });

      // quickTo pour les images : parallax fluide synchrone
      quickTranslateXImages = gsapInstance.quickTo(".expertises-grille .image-fond", "x", {
        duration: 1.0,
        ease: "power2.out"
      });

      // Raccorder les quickTo à la positionX initiale immédiatement
      quickTranslateX(-positionX);
      quickTranslateXImages(positionX * 0.15);
    };

    let dernierePositionTick = positionX;
    const scrollerGrilleLibre = (delta) => {
      const grille = document.querySelector('.expertises-grille');
      if (!grille) return;

      if (!quickTranslateX || !quickTranslateXImages) {
        initialiserScrollHorizontal();
      }

      positionX += delta;
      positionX = Math.max(0, Math.min(positionX, positionXMax));

      quickTranslateX(-positionX);
      quickTranslateXImages(positionX * 0.15);

      if (Math.abs(positionX - dernierePositionTick) >= 40) {
        dernierePositionTick = positionX;
        playScrollTick();
      }
    };

    timelinePrincipale = gsapInstance.timeline({
      paused: true,
      onStart: () => {
        animationEnCours = true;
      },
      onComplete: () => {
        animationEnCours = false;
        etatAnimation.value = 2;
        initialiserScrollHorizontal();
      },
      onReverseComplete: () => {
        animationEnCours = false;
        etatAnimation.value = 1;
        positionX = 0;
        isScrolling = false;
        if (scrollTimer) clearTimeout(scrollTimer);
        scrollTimer = null;
        quickTranslateX = null;
        quickTranslateXImages = null;
        const grille = document.querySelector('.expertises-grille');
        if (grille) {
          gsapInstance.set(grille, { x: 0 });
        }
        gsapInstance.set(".expertises-grille .image-fond", { x: 0 });
        // Réinitialiser les propriétés transform des cartes (décalages éventuels de tlRetour)
        gsapInstance.set('.expertise-carte', { clearProps: 'y,scale,transform,opacity' });
        gsapInstance.set('.expertise-carte .image-overlay', { clearProps: 'opacity' });
      }
    });

    // ... Le reste de la construction de la timeline reste identique ...
    // Étape A : Estompage de l'État 1 (slogan, menu gauche, pagination, menu milieu) - Miniatures exclues ici
    timelinePrincipale.to([
      elementSlogan.value,
      elementMenuGauche.value,
      elementPagination.value,
      elementLiensNav.value
    ], {
      opacity: 0,
      y: (index, target) => {
        if (target === elementSlogan.value || target === elementLiensNav.value) return -45;
        return 45;
      },
      duration: 1.4,
      stagger: 0.05,
      ease: "power2.inOut"
    }, 0);

    // Rotation et disparition des plus
    timelinePrincipale.to(".signe-plus-css", {
      rotation: -180,
      scale: 0.5,
      opacity: 0,
      duration: 1.2,
      ease: "power2.inOut"
    }, 0);

    // Jouer le son d'exploration après le début de l'estompage
    timelinePrincipale.call(playCursorWithTextClick, null, 0.45);

    // À la fin de l'estompage des liens (t=1.4), on libère l'espace en les masquant physiquement (display: none)
    timelinePrincipale.set(elementLiensNav.value, { display: 'none' }, 1.4);

    // Étape B : Faire apparaître le bouton bleu "Voir nos offres" à t=1.4 (quand la place est 100% libre)
    timelinePrincipale.to(elementBoutonOffres.value, {
      display: 'block',
      opacity: 1,
      scale: 1,
      duration: 0.3,
      ease: "back.out(1.5)"
    }, 1.4);

    // Étape C : Réduction de l'image principale et agrandissement des miniatures
    const rafraichirCoordonneesMorph = () => {
      const act = activeExpertise.value;
      const elementCibleHero = document.querySelector(`#carte-${act} .expertise-conteneur-image`);
      const elementCibleVideo = document.querySelector(`${confVideo.card} .expertise-conteneur-image`);
      const elementCibleGraphique = document.querySelector(`${confGraphique.card} .expertise-conteneur-image`);
      const elementCibleWeb = document.querySelector(`${confWeb.card} .expertise-conteneur-image`);

      if (!elementCibleHero || !elementCibleVideo || !elementCibleGraphique || !elementCibleWeb) return;

      const rectHero = elementCibleHero.getBoundingClientRect();
      const rectVideo = elementCibleVideo.getBoundingClientRect();
      const rectGraphique = elementCibleGraphique.getBoundingClientRect();
      const rectWeb = elementCibleWeb.getBoundingClientRect();
      const largeurFenetre = window.innerWidth;

      // Si mobile/tablette, simple transition en opacité
      if (largeurFenetre <= 1024) {
        gsapInstance.to(elementImageMorph.value, {
          opacity: 0.2,
          borderRadius: 0,
          duration: 0.5
        });
        return;
      }

      const scaleToFill = Math.max(window.innerWidth / rectHero.width, window.innerHeight / rectHero.height);
      const startX = (window.innerWidth - rectHero.width) / 2;
      const startY = (window.innerHeight - rectHero.height) / 2;

      // FIX: Force element size and use pure scale/translate for flawless animation (no width/height interpolation stutter)
      gsapInstance.set(elementImageMorph.value, {
        width: rectHero.width,
        height: rectHero.height,
        x: startX,
        y: startY,
        scale: scaleToFill,
        transformOrigin: "center center"
      });

      // 1. L'image Héro rétrécit via un simple scale (le crop object-fit ne bouge plus !)
      timelinePrincipale.to(elementImageMorph.value, {
        x: rectHero.left,
        y: rectHero.top,
        scale: 1,
        borderRadius: "0px",
        duration: 1.8,
        ease: "power3.inOut"
      }, 0.1);

      timelinePrincipale.to(elementOverlayMorph.value, {
        opacity: 0,
        duration: 1.8,
        ease: "power3.inOut"
      }, 0.1);

      timelinePrincipale.to(elementOverlayMorphDiscret.value, {
        opacity: 1,
        duration: 1.8,
        ease: "power3.inOut"
      }, 0.1);

      // Faire apparaître le conteneur de la grille d'expertises
      timelinePrincipale.fromTo(elementSectionExpertises.value, {
        visibility: 'hidden',
        opacity: 0
      }, {
        visibility: 'visible',
        opacity: 1,
        duration: 1.1
      }, 0.1);

      // Masquer les miniatures physiques avec l'animation inverse (contraction vers la gauche)
      timelinePrincipale.to(".miniature-cadre", {
        scaleX: 0.8,
        opacity: 0,
        transformOrigin: "left center",
        duration: 0.6,
        stagger: 0.05,
        ease: "power2.in"
      }, 0.1);

      // 2. Les miniatures s'agrandissent et glissent vers leur position finale !
      // Montage Vidéo
      timelinePrincipale.to(elementMorphVideo.value, {
        scaleX: 1,
        scaleY: 1,
        x: rectVideo.left,
        y: rectVideo.top,
        borderRadius: "0px",
        duration: 1.8,
        ease: "power3.inOut"
      }, 0.1);

      // Graphique
      timelinePrincipale.to(elementMorphGraphique.value, {
        scaleX: 1,
        scaleY: 1,
        x: rectGraphique.left,
        y: rectGraphique.top,
        borderRadius: "0px",
        duration: 1.8,
        ease: "power3.inOut"
      }, 0.15);

      // Web
      timelinePrincipale.to(elementMorphWeb.value, {
        scaleX: 1,
        scaleY: 1,
        x: rectWeb.left,
        y: rectWeb.top,
        borderRadius: "0px",
        duration: 1.8,
        ease: "power3.inOut"
      }, 0.2);

      // Étape C.1 : Révéler les vraies images des cartes en douceur pendant l'atterrissage
      // Les morph layers s'estompent au même moment (crossfade parfait entre t=1.65 et t=1.95)
      timelinePrincipale.to(".expertise-carte", {
        background: "#000000",
        duration: 0.01
      }, 1.65);

      timelinePrincipale.call(playHomeCardApparition, null, 1.3);

      timelinePrincipale.to(".expertise-carte .image-fond", {
        opacity: 1,
        duration: 0.3,
        ease: "none"
      }, 1.65);

      // Zoom progressif de l'image de 1.0 à 1.6 à l'atterrissage (selon votre design)
      // IMPORTANT : On zoom en même temps la vraie image et la source du morph pour éviter un "ghosting"
      timelinePrincipale.fromTo([
        ".expertise-carte .image-fond",
        ".image-morphee-source"
      ], {
        scale: 1.0
      }, {
        scale: 1.6,
        duration: 0.8,
        ease: "power2.out"
      }, 1.65);

      // Fade-out progressif des morph layers synchronisé avec l'apparition des fonds
      timelinePrincipale.to([
        elementImageMorph.value,
        elementMorphVideo.value,
        elementMorphGraphique.value,
        elementMorphWeb.value
      ], {
        opacity: 0,
        duration: 0.3,
        ease: "none"
      }, 1.65);

      // Étape D : Apparition très fluide de l'overlay et des titres APRÈS le crossfade
      timelinePrincipale.to(".image-overlay", {
        opacity: 1,
        duration: 0.8,
        ease: "power2.out"
      }, 1.8);
    };

    rafraichirCoordonneesMorph();

    // Étape D : Révélation des titres des cartes APRÈS que les morph layers soient partis
    // Animation ascenseur vers le haut, masquée par le wrapper
    timelinePrincipale.to(".lettre-titre-carte", {
      y: "0%",
      duration: 0.5,
      stagger: 0.02, // Délai très court entre chaque lettre de chaque carte
      ease: "power3.out"
    }, 1.9);

    // Étape E : Apparition de la section stats (uniquement dans l'état 2)
    // Décalé à t=0.8 pour apparaître de façon beaucoup plus précoce et moderne
    timelinePrincipale.to('.conteneur-stats', {
      opacity: 1,
      y: 0,
      duration: 1.4,
      ease: "power2.out"
    }, 0.8);

    // Déclencher le compteur à t=1.0 pour qu'il s'anime pendant le fade-in
    timelinePrincipale.call(() => {
      if (elementSectionStats.value && elementSectionStats.value.animer) {
        elementSectionStats.value.animer();
      }
    }, null, 1.0);

    // Initialisation du contrôleur de scroll et de drag/swipe
    if (mainScrollObserver) {
      mainScrollObserver.kill();
      mainScrollObserver = null;
    }
    mainScrollObserver = Observer.create({
      target: window,
      type: "wheel,touch,pointer",
      onChange: (self) => {
        if (animationEnCours || menuOuvert.value || pageCourante.value !== 'accueil') return;

        if (etatAnimation.value === 1) {
          // Si action vers le bas (deltaY > 0)
          if (self.deltaY > 0) {
            timelinePrincipale.play();
          }
        } else if (etatAnimation.value === 2) {
          // Défilement continu et libre sans assistance (pas d'aimantation de carte)
          let delta = 0;
          let factor = 1.0;

          if (self.event.type === 'wheel') {
            // Molette ou trackpad : combiné X et Y pour un défilement naturel
            delta = self.deltaY + self.deltaX;
            factor = 1.2; // Sensibilité ajustable
          } else {
            // Drag ou Touch : suit directement le mouvement du doigt
            delta = self.deltaX + self.deltaY;
            factor = -1.0; // Inversé pour que le contenu suive le geste
          }

          scrollerGrilleLibre(delta * factor);
        }
      },
      tolerance: 10,
      preventDefault: true
    });

    if (aproposOuvert.value || offresOuvert.value || menuOuvert.value || pageCourante.value === 'projets') {
      mainScrollObserver.disable();
    }

  }, elementConteneur.value);

  // Cacher enfin la grille d'expertises après toutes les initialisations et mesures !
  grilleEl.style.visibility = 'hidden';
  grilleEl.style.opacity = '0';
  grilleEl.style.pointerEvents = 'auto';
};

const onCarteClic = (expertiseId) => {
  if (etatAnimation.value !== 2 || animationEnCours) return;
  playShowingCard();
  animationEnCours = true;

  // 1. Obtenir les rectangles actuels des cartes sur l'écran (avec leur décalage de scroll !)
  const cartePhoto = document.querySelector('#carte-photo');
  const carteVideo = document.querySelector('#carte-video');
  const carteGraphique = document.querySelector('#carte-graphique');
  const carteWeb = document.querySelector('#carte-web');

  if (!cartePhoto || !carteVideo || !carteGraphique || !carteWeb) {
    animationEnCours = false;
    return;
  }

  const rectPhoto = cartePhoto.getBoundingClientRect();
  const rectVideo = carteVideo.getBoundingClientRect();
  const rectGraphique = carteGraphique.getBoundingClientRect();
  const rectWeb = carteWeb.getBoundingClientRect();

  // 3. Positionner les morph layers exactement sur les cartes actuelles
  const act = activeExpertise.value;

  // 2. Obtenir les positions des 3 vignettes cibles actuelles en bas à droite
  const inactifs = ['photo', 'video', 'graphique', 'web'].filter(id => id !== act);
  const rectsVignettes = {};

  for (const id of inactifs) {
    const el = document.querySelector('#mini-' + id);
    if (!el) {
      animationEnCours = false;
      return;
    }
    rectsVignettes[id] = el.getBoundingClientRect();
  }
  // L'ancien hero (act) va prendre la place de l'expertise cliquée (qui devient le nouveau hero)
  rectsVignettes[act] = rectsVignettes[expertiseId];

  // elementImageMorph correspond à l'ancienne activeExpertise
  let layerOldHero = elementImageMorph.value;
  let rectOldHero = act === 'photo' ? rectPhoto : (act === 'video' ? rectVideo : (act === 'graphique' ? rectGraphique : rectWeb));

  // Positionner l'ancien Hero sur sa carte dans la grille
  gsapInstance.set(layerOldHero, {
    width: rectOldHero.width,
    height: rectOldHero.height,
    x: rectOldHero.left,
    y: rectOldHero.top,
    scaleX: 1,
    scaleY: 1,
    opacity: 1,
    display: "block"
  });

  // Identifier le morph layer de la carte cliquée
  let layerSelectionne = null;
  if (expertiseId === act) {
    layerSelectionne = layerOldHero;
  } else if (expertiseId === 'video' || (act === 'video' && expertiseId === 'photo')) {
    layerSelectionne = elementMorphVideo.value;
  } else if (expertiseId === 'graphique' || (act === 'graphique' && expertiseId === 'photo')) {
    layerSelectionne = elementMorphGraphique.value;
  } else if (expertiseId === 'web' || (act === 'web' && expertiseId === 'photo')) {
    layerSelectionne = elementMorphWeb.value;
  }

  // Positionner la carte sélectionnée si elle est différente de l'ancien hero
  if (layerSelectionne !== layerOldHero) {
    let rectSelectionne = rectPhoto;
    if (expertiseId === 'video') rectSelectionne = rectVideo;
    if (expertiseId === 'graphique') rectSelectionne = rectGraphique;
    if (expertiseId === 'web') rectSelectionne = rectWeb;

    gsapInstance.set(layerSelectionne, {
      width: rectSelectionne.width,
      height: rectSelectionne.height,
      x: rectSelectionne.left,
      y: rectSelectionne.top,
      scaleX: 1,
      scaleY: 1,
      borderRadius: "0px",
      opacity: 1,
      display: "block"
    });
  }

  // Cacher les autres morph layers inactifs pour éviter toute superposition visuelle
  const otherLayers = [
    elementMorphVideo.value,
    elementMorphGraphique.value,
    elementMorphWeb.value
  ].filter(l => l !== layerSelectionne);
  gsapInstance.set(otherLayers, { display: 'none', opacity: 0 });

  // Cacher l'image de fond et le fond CSS de la carte sélectionnée
  // (le fond #000 de .expertise-carte bloquait la vue sur le morph layer en dessous)
  const activeCard = document.querySelector(`#carte-${expertiseId}`);
  if (activeCard) {
    gsapInstance.set(activeCard, { background: 'transparent' });
  }
  const activeCardImage = document.querySelector(`#carte-${expertiseId} .image-fond`);
  if (activeCardImage) {
    gsapInstance.set(activeCardImage, { opacity: 0 });
  }

  // 5. Créer la timeline d'expansion / rétrécissement de retour
  const tlRetour = gsapInstance.timeline({
    onComplete: () => {
      // À la fin : 
      // - Masquer physiquement la grille et les stats
      gsapInstance.set(elementSectionExpertises.value, { opacity: 0, visibility: "hidden" });
      gsapInstance.set(".conteneur-stats", { opacity: 0, y: 30 });

      // - Mettre à jour l'expertise active !
      activeExpertise.value = expertiseId;

      nextTick(() => {
        // - Réinitialiser les scrolls à 0
        const grille = document.querySelector('.expertises-grille');
        if (grille) {
          gsapInstance.set(grille, { x: 0 });
        }
        gsapInstance.set(".expertises-grille .image-fond", { x: 0 });

        // - Re-créer les animations avec le nouvel activeExpertise !
        // Cela s'occupe déjà de positionner le Hero correctement via scaleToFill
        initialiserAnimations();

        // Réinitialiser les overlays de morphing
        gsapInstance.set(elementOverlayMorphDiscret.value, { opacity: 0 });
        // On ne set plus opacity 1 direct, c'est géré par initialiserAnimations() pour la transition fluide

        // Faire apparaître le slogan, menu gauche et pagination avec sa rotation de plus !
        gsapInstance.fromTo([elementSlogan.value, elementMenuGauche.value, elementPagination.value], {
          opacity: 0,
          y: 30
        }, {
          opacity: 1,
          y: 0,
          duration: 1.0,
          stagger: 0.05,
          ease: "power2.out"
        });

        gsapInstance.fromTo(".signe-plus-css", {
          rotation: 180,
          scale: 0.5,
          opacity: 0
        }, {
          rotation: 0,
          scale: 1,
          opacity: 1,
          duration: 1.0,
          ease: "power2.out"
        });

        // Apparition GSAP contrôlée des miniatures (remplace le CSS keyframes problématique)
        gsapInstance.fromTo(".miniature-cadre", {
          scaleX: 0.8,
          opacity: 0,
          transformOrigin: "left center"
        }, {
          scaleX: 1,
          opacity: 1,
          duration: 0.8,
          stagger: 0.1,
          ease: "power2.out",
          clearProps: "all"
        });

        etatAnimation.value = 1;
        animationEnCours = false;

        // Réinitialiser les propriétés transform des cartes (y, scale) pour éviter les décalages lors du prochain scroll
        gsapInstance.set('.expertise-carte', { clearProps: 'y,scale,transform' });
      });
    }
  });

  // Estomper et animer en douceur les lettres et titres de la carte active (effet ascenseur inversé haut + fade)
  const activeLetters = document.querySelectorAll(`#carte-${expertiseId} .lettre-titre-carte`);
  if (activeLetters.length > 0) {
    tlRetour.to(activeLetters, {
      y: "-50px",
      opacity: 0,
      duration: 0.6,
      stagger: 0.02,
      ease: "power2.in"
    }, 0);
  } else {
    tlRetour.to(`#carte-${expertiseId} .nom-expertise`, {
      y: "-30px",
      opacity: 0,
      duration: 0.6,
      ease: "power2.in"
    }, 0);
  }

  // Estomper également l'overlay noir de la carte active
  const activeOverlay = document.querySelector(`#carte-${expertiseId} .image-overlay`);
  if (activeOverlay) {
    tlRetour.to(activeOverlay, {
      opacity: 0,
      duration: 0.6,
      ease: "power2.out"
    }, 0);
  }

  // Estomper tous les overlays des cartes inactives également (sinon ils restent opaques par-dessus)
  const inactiveOverlays = Array.from(document.querySelectorAll('.expertise-carte .image-overlay')).filter(el => !el.closest(`#carte-${expertiseId}`));
  tlRetour.to(inactiveOverlays, {
    opacity: 0,
    duration: 0.5,
    ease: "power2.out"
  }, 0);

  // S'assurer que l'ancien texte principal s'estompe immédiatement s'il était encore visible
  if (elementSlogan.value) {
    tlRetour.to([elementSlogan.value, elementMenuGauche.value, elementPagination.value], {
      opacity: 0,
      duration: 0.5,
      ease: "power2.out"
    }, 0);
  }

  // Estomper en douceur la section des stats
  tlRetour.to(".conteneur-stats", {
    opacity: 0,
    y: 30,
    duration: 0.7,
    ease: "power2.inOut"
  }, 0);

  // 7. Animer le morph layer sélectionné pour qu'il prenne tout l'écran via un simple scale !
  let cardRectTarget = rectPhoto;
  if (expertiseId === 'video') cardRectTarget = rectVideo;
  if (expertiseId === 'graphique') cardRectTarget = rectGraphique;
  if (expertiseId === 'web') cardRectTarget = rectWeb;

  const scaleToFillBack = Math.max(window.innerWidth / cardRectTarget.width, window.innerHeight / cardRectTarget.height);
  const targetXBack = (window.innerWidth - cardRectTarget.width) / 2;
  const targetYBack = (window.innerHeight - cardRectTarget.height) / 2;

  tlRetour.to(layerSelectionne, {
    x: targetXBack,
    y: targetYBack,
    scale: scaleToFillBack,
    borderRadius: "0px",
    duration: 1.8,
    ease: "power3.inOut"
  }, 0);

  // Annuler le zoom de 1.6 appliqué lors de l'atterrissage
  const imageInterne = layerSelectionne.querySelector('.image-morphee-source');
  if (imageInterne) {
    tlRetour.to(imageInterne, {
      scale: 1.0,
      duration: 1.8,
      ease: "power3.inOut"
    }, 0);
  }

  // Animer le fade out discret de son overlay de carte
  const overlaySubtil = layerSelectionne.querySelector('.overlay-morph-mini, .overlay-morph-discret');
  if (overlaySubtil) {
    tlRetour.to(overlaySubtil, {
      opacity: 0,
      duration: 1.8,
      ease: "power3.inOut"
    }, 0);
  }

  // 8. Animer les CARTES INACTIVES DIRECTEMENT (elles glissent vers le bas, rétrécissent et s'estompent)
  // Ainsi les textes et overlays à l'intérieur s'animent en parfaite harmonie
  const cardsInactives = Array.from(document.querySelectorAll('.expertise-carte')).filter(card => card.id !== `carte-${expertiseId}`);
  tlRetour.to(cardsInactives, {
    opacity: 0,
    y: "+=60", // Léger glissement vers le bas
    scale: 0.9, // Léger rétrécissement global
    duration: 0.8, // Durée courte pour disparaître proprement pendant que le principal s'étend
    ease: "power2.out"
  }, 0);

  // Animer également le morph de l'ancien hero s'il fait partie des éléments inactifs
  if (layerOldHero !== layerSelectionne) {
    tlRetour.to(layerOldHero, {
      opacity: 0,
      y: "+=60",
      scaleX: 0.9,
      scaleY: 0.9,
      duration: 0.8,
      ease: "power2.out"
    }, 0);
  }

  // Réactiver le menu horizontal du milieu
  gsapInstance.set(elementLiensNav.value, { display: 'flex' });
  tlRetour.to(elementLiensNav.value, {
    opacity: 1,
    y: 0,
    duration: 1.4,
    ease: "power2.inOut"
  }, 0.2);

  // Estomper le bouton offres
  tlRetour.to(elementBoutonOffres.value, {
    opacity: 0,
    scale: 0.9,
    duration: 0.3,
    ease: "power2.inOut"
  }, 0);
};

const ouvrirProjetsDepuisHero = () => {
  if (etatAnimation.value !== 1 || animationEnCours || menuOuvert.value) return;
  animationEnCours = true;
  fermerToutesLesPages();

  // Animation de transition vers la vue projets depuis le Hero
  const tlProjets = gsapInstance.timeline({
    onComplete: () => {
      pageCourante.value = 'projets';
      animationEnCours = false;
    }
  });

  // 1. Estomper les éléments Héro (slogan, menu gauche, pagination, miniatures)
  tlProjets.to([
    elementSlogan.value,
    elementMenuGauche.value,
    elementPagination.value,
    elementLiensNav.value,
    '.miniature-cadre'
  ], {
    opacity: 0,
    y: (index, target) => {
      if (target === elementSlogan.value || target === elementLiensNav.value) return -45;
      return 45;
    },
    duration: 0.6,
    stagger: 0.05,
    ease: "power2.inOut"
  }, 0);

  // Masquer les miniatures et le bouton d'offres
  tlProjets.to(elementBoutonOffres.value, {
    opacity: 0,
    scale: 0.9,
    duration: 0.3,
    onComplete: () => {
      gsapInstance.set(elementBoutonOffres.value, { display: 'none' });
      gsapInstance.set(elementLiensNav.value, { display: 'flex' });
    }
  }, 0);

  tlProjets.to(elementLiensNav.value, {
    opacity: 1,
    y: 0,
    duration: 0.5,
    ease: "power2.out"
  }, 0.3);
};

const ouvrirPortfolioDepuisHero = () => {
  if (etatAnimation.value !== 1 || animationEnCours || menuOuvert.value) return;
  animationEnCours = true;

  const tlProjets = gsapInstance.timeline({
    onComplete: () => {
      pageCourante.value = 'portfolio';
      animationEnCours = false;
    }
  });

  tlProjets.to([
    elementSlogan.value,
    elementMenuGauche.value,
    elementPagination.value,
    elementLiensNav.value,
    '.miniature-cadre'
  ], {
    opacity: 0,
    y: (index, target) => {
      if (target === elementSlogan.value || target === elementLiensNav.value) return -45;
      return 45;
    },
    duration: 0.6,
    stagger: 0.05,
    ease: "power2.inOut"
  }, 0);

  tlProjets.to(elementBoutonOffres.value, {
    opacity: 0,
    scale: 0.9,
    duration: 0.3,
    onComplete: () => {
      gsapInstance.set(elementBoutonOffres.value, { display: 'none' });
      gsapInstance.set(elementLiensNav.value, { display: 'flex' });
    }
  }, 0);

  tlProjets.to(elementLiensNav.value, {
    opacity: 1,
    y: 0,
    duration: 0.5,
    ease: "power2.out"
  }, 0.3);
};

const ouvrirPortfolio = () => {
  if (menuOuvert.value) menuOuvert.value = false;
  fermerToutesLesPages();

  if (pageCourante.value === 'portfolio') return;

  if (pageCourante.value === 'projets') {
    pageCourante.value = 'portfolio';
    return;
  }

  if (etatAnimation.value === 2) {
    animationEnCours = true;
    const tlProjets = gsapInstance.timeline({
      onComplete: () => {
        pageCourante.value = 'portfolio';
        animationEnCours = false;
      }
    });
    tlProjets.to([elementSectionExpertises.value, '.conteneur-stats'], {
      opacity: 0,
      y: 45,
      duration: 0.5,
      ease: "power2.inOut"
    }, 0);
    tlProjets.to(elementBoutonOffres.value, {
      opacity: 0,
      scale: 0.9,
      duration: 0.3,
      onComplete: () => {
        gsapInstance.set(elementBoutonOffres.value, { display: 'none' });
        gsapInstance.set(elementLiensNav.value, { display: 'flex' });
      }
    }, 0);
    tlProjets.to(elementLiensNav.value, {
      opacity: 1,
      y: 0,
      duration: 0.5,
      ease: "power2.out"
    }, 0.3);
  } else {
    ouvrirPortfolioDepuisHero();
  }
};

const retournerAExpertises = () => {
  if (animationEnCours) return;
  animationEnCours = true;

  // Animer la transition vers la grille d'accueil (État 2)
  pageCourante.value = 'accueil';
  playHomeCardApparition();

  const tlRetourGrid = gsapInstance.timeline({
    onComplete: () => {
      animationEnCours = false;
    }
  });

  // S'assurer que le conteneur de la grille est visible
  gsapInstance.set(elementSectionExpertises.value, { visibility: 'visible', opacity: 1 });

  // 1. Réapparaître la grille et les statistiques
  tlRetourGrid.fromTo(['.expertises-grille', '.conteneur-stats'], {
    opacity: 0,
    y: 45
  }, {
    opacity: 1,
    y: 0,
    duration: 0.8,
    ease: "power2.out"
  }, 0);

  // 2. Masquer les liens nav et afficher le bouton offres
  tlRetourGrid.to(elementLiensNav.value, {
    opacity: 0,
    y: -15,
    duration: 0.3,
    onComplete: () => {
      gsapInstance.set(elementLiensNav.value, { display: 'none' });
      gsapInstance.set(elementBoutonOffres.value, { display: 'block' });
    }
  }, 0);

  tlRetourGrid.to(elementBoutonOffres.value, {
    opacity: 1,
    scale: 1,
    duration: 0.5,
    ease: "back.out(1.5)"
  }, 0.3);
};

const gererClicExpertises = () => {
  if (pageCourante.value === 'projets' || pageCourante.value === 'portfolio') {
    // Si on est dans les projets ou portfolio et qu'on clique sur "Nos expertises",
    // on retourne à l'accueil (grille).
    pageCourante.value = 'accueil';

    // Si la page était en état 1 (Hero), on joue l'animation pour aller au Grid (état 2)
    if (etatAnimation.value === 1) {
      nextTick(() => {
        animationEnCours = true;
        timelinePrincipale.play();
      });
    } else {
      // Sinon, si on était déjà à l'état 2, on retourne simplement à la grille
      retournerAExpertises();
    }
  } else if (etatAnimation.value === 1 && !animationEnCours) {
    timelinePrincipale.play();
  }
};

const retournerAHero = () => {
  if (animationEnCours) return;
  animationEnCours = true;

  if (mainScrollObserver) mainScrollObserver.disable();

  // Reset des états réactifs
  pageCourante.value = 'accueil';
  projetActifDetail.value = null;
  menuOuvert.value = false;
  offresOuvert.value = false;
  aproposOuvert.value = false;
  contactOuvert.value = false;
  activeExpertise.value = 'photo';
  etatAnimation.value = 1;

  if (window.location.hash) {
    history.pushState("", document.title, window.location.pathname + window.location.search);
  }

  // Masquer le bouton offres et préparer les éléments du Hero pour la révélation
  gsapInstance.set(elementLiensNav.value, { display: 'flex', opacity: 1, y: 0 });
  gsapInstance.set(elementBoutonOffres.value, { display: 'none', opacity: 0 });
  gsapInstance.set([
    elementSlogan.value,
    elementMenuGauche.value,
    elementPagination.value,
    '.miniature-cadre'
  ], { opacity: 0, y: 25 });
  gsapInstance.set(".signe-plus-css", { opacity: 0, scale: 0.5, rotation: 90 });

  // Revenir en haut de la page et réinitialiser les animations GSAP
  window.scrollTo(0, 0);
  initialiserAnimations();

  // Reconfigurer le masquage après initialiserAnimations
  gsapInstance.set(elementBoutonOffres.value, { display: 'none', opacity: 0 });
  gsapInstance.set([
    elementSlogan.value,
    elementMenuGauche.value,
    elementPagination.value,
    '.miniature-cadre'
  ], { opacity: 0, y: 25 });
  gsapInstance.set(".signe-plus-css", { opacity: 0, scale: 0.5, rotation: 90 });

  // Animation de révélation fluide du Hero
  const tlReveal = gsapInstance.timeline({
    onComplete: () => {
      animationEnCours = false;
      if (mainScrollObserver) mainScrollObserver.enable();
    }
  });

  tlReveal.fromTo([
    elementSlogan.value,
    elementMenuGauche.value,
    elementPagination.value,
    '.miniature-cadre'
  ], {
    opacity: 0,
    y: 25
  }, {
    opacity: 1,
    y: 0,
    duration: 0.7,
    stagger: 0.06,
    ease: "power2.out"
  });

  tlReveal.fromTo(".signe-plus-css", {
    rotation: 90,
    scale: 0.5,
    opacity: 0
  }, {
    rotation: 0,
    scale: 1,
    opacity: 1,
    duration: 0.6,
    ease: "back.out(1.5)"
  }, "-=0.5");
};

const onMiniatureClic = (targetId) => {
  if (etatAnimation.value !== 1 || animationEnCours) return;
  playShowingCard();
  animationEnCours = true;

  // Masquer l'overlay de survol et le texte immédiatement au clic
  gsapInstance.set(".miniature-survol-overlay", { opacity: 0, pointerEvents: "none" });

  // Handoff parfait : Afficher les morph layers invisibles et masquer les miniatures physiques
  gsapInstance.set([elementMorphVideo.value, elementMorphGraphique.value, elementMorphWeb.value], { display: "block", opacity: 1 });
  gsapInstance.set(".miniature-img", { opacity: 0 });

  const sourceId = activeExpertise.value;

  // 1. Récupérer les rectangles des 3 slots de miniatures physiques dans le DOM
  const parentMiniatures = elementMiniatures.value;
  if (!parentMiniatures) {
    animationEnCours = false;
    return;
  }
  const slotsCadres = Array.from(parentMiniatures.children);
  if (slotsCadres.length < 3) {
    animationEnCours = false;
    return;
  }

  const rectSlot1 = slotsCadres[0].getBoundingClientRect();
  const rectSlot2 = slotsCadres[1].getBoundingClientRect();
  const rectSlot3 = slotsCadres[2].getBoundingClientRect();
  const rectsSlots = [rectSlot1, rectSlot2, rectSlot3];

  // Trouver l'index actuel (avant clic) de la miniature cible
  const indexTarget = miniaturesFiltrees.value.findIndex(e => e.id === targetId);
  if (indexTarget === -1) {
    animationEnCours = false;
    return;
  }

  // Calculer l'ordre des miniatures APRES le clic (quand targetId sera l'expertise active)
  const nouvellesMiniatures = toutesLesExpertises.filter(e => e.id !== targetId);
  const indexSourceApres = nouvellesMiniatures.findIndex(e => e.id === sourceId);

  // 2. Définir le morph layer de la miniature cible qui va s'agrandir en plein écran
  const layerTarget = obtenirMorphLayerPourExpertise(targetId);
  if (!layerTarget) {
    animationEnCours = false;
    return;
  }

  // Mettre un z-index supérieur pour qu'il passe au-dessus de l'ancien hero
  gsapInstance.set(layerTarget, { zIndex: 25 });

  // 3. Récupérer les informations de dimensionnement pour le plein écran
  const cardCible = document.querySelector(`#carte-${targetId} .expertise-conteneur-image`);
  if (!cardCible) {
    animationEnCours = false;
    return;
  }
  const rectCardTarget = cardCible.getBoundingClientRect();
  const scaleToFillTarget = Math.max(window.innerWidth / rectCardTarget.width, window.innerHeight / rectCardTarget.height);
  const targetXBack = (window.innerWidth - rectCardTarget.width) / 2;
  const targetYBack = (window.innerHeight - rectCardTarget.height) / 2;

  // Créer la timeline d'animation
  const tlMini = gsapInstance.timeline({
    onComplete: () => {
      activeExpertise.value = targetId;
      nextTick(() => {
        initialiserAnimations();
        gsapInstance.set(layerTarget, { zIndex: 15 });
        animationEnCours = false;
      });
    }
  });

  // A. Animer la miniature cliquée vers le plein écran
  tlMini.to(layerTarget, {
    x: targetXBack,
    y: targetYBack,
    scaleX: scaleToFillTarget,
    scaleY: scaleToFillTarget,
    borderRadius: "0px",
    duration: 1.6,
    ease: "power4.inOut"
  }, 0);

  // B. Animer l'ancien hero (elementImageMorph) pour qu'il rétrécisse dans son nouveau slot
  const cardSource = document.querySelector(`#carte-${sourceId} .expertise-conteneur-image`);
  if (cardSource) {
    const rectCardSource = cardSource.getBoundingClientRect();
    const rectSlotDest = rectsSlots[indexSourceApres];
    const scaleXSource = rectSlotDest.width / rectCardSource.width;
    const scaleYSource = rectSlotDest.height / rectCardSource.height;
    const targetXSource = rectSlotDest.left + (rectSlotDest.width - rectCardSource.width) / 2;
    const targetYSource = rectSlotDest.top + (rectSlotDest.height - rectCardSource.height) / 2;

    tlMini.to(elementImageMorph.value, {
      x: targetXSource,
      y: targetYSource,
      scaleX: scaleXSource,
      scaleY: scaleYSource,
      borderRadius: "0px",
      duration: 1.6,
      ease: "power4.inOut"
    }, 0);
  }

  // C. Animer les deux autres miniatures si elles doivent glisser
  const expertisesGlissantes = toutesLesExpertises.filter(e => e.id !== sourceId && e.id !== targetId);
  expertisesGlissantes.forEach(exp => {
    const indexAvant = miniaturesFiltrees.value.findIndex(e => e.id === exp.id);
    const indexApres = nouvellesMiniatures.findIndex(e => e.id === exp.id);

    // Si l'index de slot a changé, on anime le morph layer correspondant vers son nouveau slot
    if (indexAvant !== indexApres && indexAvant !== -1 && indexApres !== -1) {
      const layerGlissant = obtenirMorphLayerPourExpertise(exp.id);
      const cardGlissante = document.querySelector(`#carte-${exp.id} .expertise-conteneur-image`);
      if (layerGlissant && cardGlissante) {
        const rectCardGlissante = cardGlissante.getBoundingClientRect();
        const rectSlotDest = rectsSlots[indexApres];
        const scaleX = rectSlotDest.width / rectCardGlissante.width;
        const scaleY = rectSlotDest.height / rectCardGlissante.height;
        const targetX = rectSlotDest.left + (rectSlotDest.width - rectCardGlissante.width) / 2;
        const targetY = rectSlotDest.top + (rectSlotDest.height - rectCardGlissante.height) / 2;

        tlMini.to(layerGlissant, {
          x: targetX,
          y: targetY,
          scaleX: scaleX,
          scaleY: scaleY,
          duration: 1.6,
          ease: "power4.inOut"
        }, 0);
      }
    }
  });

  // D. Estomper l'ancien slogan en douceur
  if (elementSlogan.value) {
    tlMini.to(elementSlogan.value, {
      opacity: 0,
      y: -30,
      duration: 0.6,
      ease: "power2.inOut"
    }, 0);

    tlMini.to(".signe-plus-css", {
      rotation: -180,
      scale: 0.5,
      opacity: 0,
      duration: 0.6,
      ease: "power2.inOut"
    }, 0);
  }
};

const obtenirMorphLayerPourExpertise = (id) => {
  if (id === 'video') return elementMorphVideo.value;
  if (id === 'graphique') return elementMorphGraphique.value;
  if (id === 'web') return elementMorphWeb.value;
  if (id === 'photo') {
    const act = activeExpertise.value;
    if (act === 'video') return elementMorphVideo.value;
    if (act === 'graphique') return elementMorphGraphique.value;
    if (act === 'web') return elementMorphWeb.value;
  }
  return null;
};

watch([aproposOuvert, offresOuvert, menuOuvert, pageCourante, projetActifDetail], ([ap, off, men, page, detail]) => {
  if (mainScrollObserver) {
    if (ap || off || men || page === 'projets' || page === 'portfolio' || detail) {
      mainScrollObserver.disable();
    } else {
      mainScrollObserver.enable();
    }
  }
}, { immediate: true });

// Play delayed cursor with text click sound effect when Offres, A propos, and Contact overlays open
watch(offresOuvert, (val) => {
  if (val) {
    setTimeout(() => playCursorWithTextClick(), 550);
  }
});
watch(aproposOuvert, (val) => {
  if (val) {
    setTimeout(() => playCursorWithTextClick(), 550);
  }
});
watch(contactOuvert, (val) => {
  if (val) {
    setTimeout(() => playCursorWithTextClick(), 550);
  }
});

const jouerAnimationEntree = () => {
  animationEnCours = true;
  
  // 1. Initialiser le setup (mesurer les coordonnées, cacher la grille, etc.)
  initialiserAnimations();

  // Jouer le son d'apparition
  playCursorWithTextClick();

  // 2. Créer la timeline d'entrée
  const tlReveal = gsapInstance.timeline({
    onComplete: () => {
      animationEnCours = false;
      if (mainScrollObserver) mainScrollObserver.enable();
    }
  });

  // Animer le header
  tlReveal.fromTo('.header-epik', {
    opacity: 0,
    y: -20
  }, {
    opacity: 1,
    y: 0,
    duration: 0.8,
    ease: "power2.out"
  }, 0);

  // Animer les éléments satellites (slogan, menu gauche, pagination, miniatures)
  tlReveal.fromTo([
    elementSlogan.value,
    elementMenuGauche.value,
    elementPagination.value,
    '.miniature-cadre'
  ], {
    opacity: 0,
    y: 35
  }, {
    opacity: 1,
    y: 0,
    duration: 0.9,
    stagger: 0.08,
    ease: "power2.out"
  }, 0.15);

  // Animer les signes plus
  tlReveal.fromTo(".signe-plus-css", {
    rotation: 90,
    scale: 0.5,
    opacity: 0
  }, {
    rotation: 0,
    scale: 1,
    opacity: 1,
    duration: 0.8,
    ease: "back.out(1.5)"
  }, 0.45);
};

watch(() => props.startEntrance, (val) => {
  if (val) {
    jouerAnimationEntree();
  }
});

const surResize = () => {
  ScrollTrigger.refresh();
};

onMounted(() => {
  if (headerRef.value) {
    elementLiensNav.value = headerRef.value.elementLiensNav;
    elementBoutonOffres.value = headerRef.value.elementBoutonOffres;
  }
  // Réinitialisation forcée du défilement vers le haut
  if (history.scrollRestoration) {
    history.scrollRestoration = 'manual';
  }
  window.scrollTo(0, 0);

  if (props.startEntrance) {
    jouerAnimationEntree();
  } else {
    // Mesurer et configurer les éléments en arrière-plan
    initialiserAnimations();

    // Forcer le masquage au départ en attendant le signal startEntrance
    gsapInstance.set([
      elementSlogan.value,
      elementMenuGauche.value,
      elementPagination.value,
      '.miniature-cadre',
      '.header-epik'
    ], { opacity: 0, y: 25 });
    gsapInstance.set(".signe-plus-css", { opacity: 0, scale: 0.5, rotation: 90 });
  }

  window.addEventListener('resize', surResize);
});

onBeforeUnmount(() => {
  if (contexteScrollTrigger) {
    contexteScrollTrigger.revert();
  }
  window.removeEventListener('resize', surResize);
});
</script>

<style scoped>
.accueil-conteneur {
  width: 100%;
  height: 100vh;
  scrollbar-width: none;
  overflow: hidden;
  position: relative;
  background-color: var(--couleur-fond);
}



/* Section Héro */
.section-hero {
  width: 100vw;
  height: 100vh;
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
  background-color: var(--couleur-fond);
}

/* Image Morpheuse Hero */
.hero-image-morph {
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  z-index: 15;
  overflow: hidden;
  border-radius: 0;
  pointer-events: none;
}

.image-morphee-source {
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
}

.overlay-morph {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: radial-gradient(circle,
      rgba(5, 5, 5, 0.05) 0%,
      rgba(5, 5, 5, 0.35) 100%), linear-gradient(to top, rgba(5, 5, 5, 0.4) 0%, transparent 40%);
  z-index: 2;
}

/* Couches de morphing des miniatures en fixed */
.miniature-morph-layer {
  position: fixed;
  top: 0;
  left: 0;
  z-index: 15;
  overflow: hidden;
  pointer-events: none;
  display: none;
  /* Rendu visible via JS après mesure */
}

.overlay-morph-mini {
  display: none;
}

.overlay-morph-discret {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(5, 5, 5, 0.22);
  z-index: 3;
  pointer-events: none;
}

/* Slogan central "+ Soignez votre image +" */
.slogan-centre {
  position: relative;
  z-index: 30;
  display: flex;
  align-items: center;
  gap: 5.5rem;
  text-align: center;
  color: var(--couleur-texte);
  pointer-events: none;
}

.titre-principal {
  font-size: 2.1rem;
  font-weight: 400;
  letter-spacing: -0.01em;
  word-spacing: 0.05em;
  font-family: var(--police-titre);
  text-shadow: 0 4px 15px rgb(0 0 0 / 17%);
}

@keyframes monterAscenseur {
  from {
    transform: translateY(115%);
  }

  to {
    transform: translateY(0%);
  }
}

.lettre-titre-hero {
  display: inline-block;
  transform: translateY(115%);
  animation: monterAscenseur 0.5s cubic-bezier(0.16, 1, 0.3, 1) forwards;
}

/* Signe Plus Vectoriel en CSS Pur : thon et blanc garanti ! */
.signe-plus-css {
  position: relative;
  width: 25px;
  height: 25px;
  display: inline-block;
  flex-shrink: 0;
  animation: rotationPlusEntree 0.8s cubic-bezier(0.16, 1, 0.3, 1) forwards;
}

@keyframes rotationPlusEntree {
  from {
    transform: rotate(-180deg) scale(0.4);
    opacity: 0;
  }

  to {
    transform: rotate(0deg) scale(1);
    opacity: 1;
  }
}

.signe-plus-css::before,
.signe-plus-css::after {
  content: '';
  position: absolute;
  background-color: #ffffff;
}

.signe-plus-css::before {
  top: 50%;
  left: 0;
  width: 100%;
  height: 1.5px;
  /* 1 pixel physique d'épaisseur */
  transform: translateY(-50%);
}

.signe-plus-css::after {
  left: 50%;
  top: 0;
  width: 1.5px;
  /* 1 pixel physique d'épaisseur */
  height: 100%;
  transform: translateX(-50%);
}

/* Liens verticaux en bas à gauche */
.menu-bas-gauche {
  position: absolute;
  bottom: 3.5rem;
  left: 7%;
  z-index: 30;
  display: flex;
  flex-direction: column;
  gap: 0.7rem;
}

.lien-vertical {
  font-size: 0.9rem;
  font-weight: 500;
  letter-spacing: 0.1em;
  color: var(--couleur-gris-principal);
  transition: var(--transition-rapide);
}

.lien-vertical:hover {
  color: var(--couleur-texte);
  transform: translateX(5px);
}

/* Pagination bas centre */
.pagination-bas {
  position: absolute;
  bottom: 3.5rem;
  left: 50%;
  transform: translateX(-50%);
  z-index: 30;
  display: flex;
  align-items: center;
  gap: 0.6rem;
  font-size: 0.85rem;
  font-weight: 700;
  color: var(--couleur-texte);
  letter-spacing: 0.1em;
}

.numero-courant {
  font-size: 0.95rem;
}

.tiret-separation {
  opacity: 0.5;
  font-weight: 300;
}

.numero-total {
  opacity: 0.6;
}

/* Vignettes miniatures bas droite */
.miniatures-bas {
  position: absolute;
  bottom: 3.5rem;
  right: 7%;
  z-index: 30;
  display: flex;
  gap: 0.2rem;
}

.miniature-cadre {
  width: 120px;
  height: 64px;
  border-radius: 0px;
  overflow: hidden;
  cursor: pointer;
  /* Désactivation de transition: all pour éviter tout conflit avec les animations GSAP */
  transition: box-shadow 0.4s cubic-bezier(0.25, 0.8, 0.25, 1);
  position: relative;
}

.miniature-img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
  opacity: 1;
  /* Fix : Les images physiques sont visibles par défaut dans l'État 1 ! */
}

.miniature-cadre.actif {
  box-shadow: 0 0 10px rgba(0, 130, 200, 0.4);
}

.miniature-survol-overlay {
  position: absolute;
  inset: 0;
  background: rgba(5, 5, 5, 0.35);
  /* Très léger overlay */
  display: flex;
  align-items: center;
  justify-content: center;
  opacity: 0;
  transition: opacity 0.3s ease;
  z-index: 10;
}

.miniature-survol-texte {
  color: var(--couleur-texte);
  font-family: var(--police-texte);
  font-size: 0.85rem;
  font-weight: 500;
}

.miniature-cadre:hover .miniature-survol-overlay {
  opacity: 1;
}

/* Grille expertises absolute dans le Héro */
.section-expertises-absolute {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  z-index: 20;
  /* Placé au-dessus des morph layers (z-index 15) pour pouvoir animer les textes des cartes */
  pointer-events: none;
  opacity: 0;
  visibility: hidden;
}

.section-expertises-absolute :deep(.expertise-carte) {
  pointer-events: auto;
}

/* Responsivité tablettes et mobiles */
@media (max-width: 1024px) {
  .titre-principal {
    font-size: 1.8rem;
  }

  .slogan-centre {
    gap: 2rem;
  }

  .signe-plus-css {
    width: 20px;
    height: 20px;
  }

  .liens-navigation {
    display: none;
  }

  .hero-image-morph {
    position: absolute;
  }

  .miniatures-bas {
    display: none;
  }

  .miniature-morph-layer {
    display: none !important;
  }

  .section-expertises-absolute {
    position: relative;
    height: auto;
    pointer-events: auto;
  }
}

@media (max-width: 768px) {
  .titre-principal {
    font-size: 1.5rem;
  }

  .signe-plus-css {
    display: none;
  }

  .menu-bas-gauche {
    display: none;
  }
}

@media (max-width: 480px) {
  .titre-principal {
    font-size: 1.2rem;
  }
}

/* Animation de transition pour la vue projets */
.fondu-projets-enter-active,
.fondu-projets-leave-active {
  transition: opacity 0.8s cubic-bezier(0.25, 0.8, 0.25, 1),
    transform 0.8s cubic-bezier(0.25, 0.8, 0.25, 1);
}

.fondu-projets-enter-from,
.fondu-projets-leave-to {
  opacity: 0;
  transform: scale(1.05);
}

/* Transition spécifique pour le portfolio (pas de scale pour les perfs WebGL) */
.fondu-portfolio-enter-active,
.fondu-portfolio-leave-active {
  transition: opacity 0.6s cubic-bezier(0.25, 0.8, 0.25, 1);
}

.fondu-portfolio-enter-from,
.fondu-portfolio-leave-to {
  opacity: 0;
}

/* Rideau de transition spécial pour le logo */
.transition-curtain {
  position: fixed;
  inset: 0;
  width: 100vw;
  height: 100vh;
  background: linear-gradient(135deg, #050505 0%, #0072B1 100%);
  z-index: 9999;
  transform: translateY(100%);
  pointer-events: none;
}
</style>
