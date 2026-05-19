<template>
  <div ref="elementConteneur" class="accueil-conteneur">
    <header class="entete-principale">
      <div class="logo-conteneur">
        <img src="/logo.svg" alt="Epik Brand Logo" class="logo-image" />
      </div>
      
      <div class="navigation-milieu">
        <nav class="liens-navigation" ref="elementLiensNav">
          <a href="#expertises" class="lien-nav actif">Nos expertises</a>
          <a href="#menu" class="lien-nav">Menu</a>
        </nav>
        
        <div class="conteneur-bouton-offres" ref="elementBoutonOffres">
          <a href="#offres" class="bouton-offres texte-majuscule">
            <span class="plus-gauche">+</span>
            Voir nos offres
            <span class="plus-droit">+</span>
          </a>
        </div>
      </div>
      
      <div class="controle-musique">
        <LecteurMusique />
      </div>
    </header>

    <section class="section-hero" ref="elementSectionHero">
      <!-- 1. Image Héro autonome qui va "morpher" en carte Photographie -->
      <div class="hero-image-morph" ref="elementImageMorph">
        <img 
          src="/images/Photographie Background.jpg" 
          alt="Studio Photo Epik" 
          class="image-morphee-source"
        />
        <div class="overlay-morph" ref="elementOverlayMorph"></div>
      </div>

      <!-- Couches de morphing pour les 3 autres expertises (Surgissent depuis les miniatures) -->
      <div class="miniature-morph-layer" ref="elementMorphVideo">
        <img src="/images/windows-w79mIrYKcK4-unsplash.jpg" alt="Vidéo Morph" class="image-morphee-source" />
        <div class="overlay-morph-mini"></div>
      </div>
      
      <div class="miniature-morph-layer" ref="elementMorphGraphique">
        <img src="/images/jeff-sheldon-9SyOKYrq-rE-unsplash.jpg" alt="Graphique Morph" class="image-morphee-source" />
        <div class="overlay-morph-mini"></div>
      </div>
      
      <div class="miniature-morph-layer" ref="elementMorphWeb">
        <img src="/images/Web Background.jpg" alt="Web Morph" class="image-morphee-source" />
        <div class="overlay-morph-mini"></div>
      </div>

      <!-- Slogan central "+ Soignez votre image +" avec signes plus vectoriels 1px -->
      <div class="slogan-centre" ref="elementSlogan">
        <div class="signe-plus-css"></div>
        <h1 class="titre-principal text-titre">Soignez votre image</h1>
        <div class="signe-plus-css"></div>
      </div>

      <!-- Liens verticaux en bas à gauche -->
      <div class="menu-bas-gauche texte-majuscule" ref="elementMenuGauche">
        <a href="#portfolio" class="lien-vertical">Portfolio</a>
        <a href="#offres" class="lien-vertical">Nos offres</a>
        <a href="#apropos" class="lien-vertical">A propos</a>
        <a href="#contact" class="lien-vertical">Contact</a>
      </div>

      <!-- Indicateur de page / pagination "1 — 5" au centre en bas -->
      <div class="pagination-bas" ref="elementPagination">
        <span class="numero-courant">1</span>
        <span class="tiret-separation">—</span>
        <span class="numero-total">5</span>
      </div>

      <!-- Vignettes miniatures en bas à droite (Fidèles à 100% à l'ordre du mockup) -->
      <div class="miniatures-bas" ref="elementMiniatures">
        <div class="miniature-cadre" id="mini-video">
          <img src="/images/windows-w79mIrYKcK4-unsplash.jpg" alt="Vignette Vidéo" class="miniature-img" />
        </div>
        <div class="miniature-cadre" id="mini-graphique">
          <img src="/images/jeff-sheldon-9SyOKYrq-rE-unsplash.jpg" alt="Vignette Graphique" class="miniature-img" />
        </div>
        <div class="miniature-cadre" id="mini-web">
          <img src="/images/Web Background.jpg" alt="Vignette Web" class="miniature-img" />
        </div>
        <div class="miniature-cadre actif" id="mini-photo">
          <img src="/images/suzi-kim-6uOhsJFHoI4-unsplash.jpg" alt="Vignette Travail" class="miniature-img" />
        </div>
      </div>

      <div class="section-expertises-absolute" ref="elementSectionExpertises">
        <GrilleExpertises />
      </div>
    </section>

    <SectionStats ref="elementSectionStats" />
  </div>
</template>

<script setup>
import { ref, onMounted, onBeforeUnmount } from 'vue';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { Observer } from 'gsap/Observer';
import LecteurMusique from './LecteurMusique.vue';
import GrilleExpertises from './GrilleExpertises.vue';
import SectionStats from './SectionStats.vue';

const gsapInstance = gsap;
gsapInstance.registerPlugin(ScrollTrigger, Observer);

// Références vers les éléments DOM
const elementConteneur = ref(null);
const elementSectionHero = ref(null);
const elementSectionExpertises = ref(null);
const elementImageMorph = ref(null);
const elementOverlayMorph = ref(null);
const elementSlogan = ref(null);
const elementLiensNav = ref(null);
const elementBoutonOffres = ref(null);
const elementMenuGauche = ref(null);
const elementPagination = ref(null);
const elementMiniatures = ref(null);

// Couches de morphing des miniatures
const elementMorphVideo = ref(null);
const elementMorphGraphique = ref(null);
const elementMorphWeb = ref(null);

const elementSectionStats = ref(null);

let contexteScrollTrigger = null;
let timelinePrincipale = null;
let etatAnimation = 1; // 1 = hero, 2 = grille et stats
let animationEnCours = false;

const initialiserAnimations = () => {
  gsapInstance.set(elementBoutonOffres.value, { opacity: 0, scale: 0.9, display: 'none' });
  gsapInstance.set(".expertise-carte", { opacity: 1 });
  
  // Masquer la section stats au départ (elle apparaît uniquement dans l'état 2)
  gsapInstance.set('.conteneur-stats', { opacity: 0, y: 30 });
  
  // 2. Mesurer la position cible pour les images morpheuses
  const elementCiblePhoto = document.querySelector('#carte-photo .expertise-conteneur-image');
  const elementCibleVideo = document.querySelector('#carte-video .expertise-conteneur-image');
  const elementCibleGraphique = document.querySelector('#carte-graphique .expertise-conteneur-image');
  const elementCibleWeb = document.querySelector('#carte-web .expertise-conteneur-image');
  
  if (!elementCiblePhoto || !elementCibleVideo || !elementCibleGraphique || !elementCibleWeb) return;

  // Cacher les vraies images des cartes initialement pour la transition de morphing fluide
  gsapInstance.set(".expertise-carte .image-fond", { opacity: 0 });
  
  // Mesurer et positionner initialement les 3 miniatures morpheuses sur les vignettes physiques
  const miniVideo = document.querySelector('#mini-video');
  const miniGraphique = document.querySelector('#mini-graphique');
  const miniWeb = document.querySelector('#mini-web');
  
  if (miniVideo && miniGraphique && miniWeb) {
    const rV = miniVideo.getBoundingClientRect();
    const rG = miniGraphique.getBoundingClientRect();
    const rW = miniWeb.getBoundingClientRect();
    
    gsapInstance.set(elementMorphVideo.value, {
      x: rV.left,
      y: rV.top,
      width: rV.width,
      height: rV.height,
      borderRadius: "4px",
      opacity: 1,
      display: "block"
    });
    
    gsapInstance.set(elementMorphGraphique.value, {
      x: rG.left,
      y: rG.top,
      width: rG.width,
      height: rG.height,
      borderRadius: "4px",
      opacity: 1,
      display: "block"
    });
    
    gsapInstance.set(elementMorphWeb.value, {
      x: rW.left,
      y: rW.top,
      width: rW.width,
      height: rW.height,
      borderRadius: "4px",
      opacity: 1,
      display: "block"
    });
  }
  

  // Création du contexte GSAP
  contexteScrollTrigger = gsapInstance.context(() => {
    
    // Timeline principale jouée manuellement via Observer
    timelinePrincipale = gsapInstance.timeline({
      paused: true,
      onStart: () => { animationEnCours = true; },
      onComplete: () => { 
        animationEnCours = false; 
        etatAnimation = 2;
        // Déclencher les compteurs une fois arrivé à l'état 2
        if (elementSectionStats.value && elementSectionStats.value.animer) {
          elementSectionStats.value.animer();
        }
      },
      onReverseComplete: () => { 
        animationEnCours = false; 
        etatAnimation = 1; 
      }
    });

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
      duration: 0.4,
      stagger: 0.05,
      ease: "power2.inOut"
    }, 0);

    // Étape B : Faire apparaître le bouton bleu "Voir nos offres"
    timelinePrincipale.to(elementBoutonOffres.value, {
      display: 'block',
      opacity: 1,
      scale: 1,
      duration: 0.3,
      ease: "back.out(1.5)"
    }, 0.3);

    // Étape C : Réduction de l'image principale et glissement des autres expertises depuis la droite
    const rafraichirCoordonneesMorph = () => {
      const rectPhoto = elementCiblePhoto.getBoundingClientRect();
      const rectVideo = elementCibleVideo.getBoundingClientRect();
      const rectGraphique = elementCibleGraphique.getBoundingClientRect();
      const rectWeb = elementCibleWeb.getBoundingClientRect();
      const largeurFenetre = window.innerWidth;
      const hauteurFenetre = window.innerHeight;
      
      // Si mobile, simple transition en opacité
      if (largeurFenetre <= 960) {
        gsapInstance.to(elementImageMorph.value, {
          scrollTrigger: {
            trigger: elementSectionHero.value,
            start: "top top",
            end: "+=100%",
            scrub: true
          },
          opacity: 0.2,
          borderRadius: 0
        });
        return;
      }
      
      // 1. Phase A : L'image Héro rétrécit vers le CENTRE de l'écran (sur place)
      const targetWidth = rectPhoto.width;
      const targetHeight = rectPhoto.height;
      const centerX = (largeurFenetre - targetWidth) / 2;
      const centerY = (hauteurFenetre - targetHeight) / 2;

      timelinePrincipale.to(elementImageMorph.value, {
        width: targetWidth,
        height: targetHeight,
        x: centerX,
        y: centerY,
        borderRadius: "4px",
        duration: 0.5,
        ease: "power2.out"
      }, 0.1);

      timelinePrincipale.to(elementOverlayMorph.value, {
        background: "linear-gradient(to bottom, rgba(5, 5, 5, 0.1) 0%, rgba(5, 5, 5, 0.65) 100%)",
        duration: 0.5
      }, 0.1);

      // Faire apparaître le conteneur de la grille d'expertises
      // Ce fromTo évite la superposition avec le Héro à l'état initial
      timelinePrincipale.fromTo(elementSectionExpertises.value, {
        visibility: 'hidden',
        opacity: 0
      }, {
        visibility: 'visible',
        opacity: 1,
        duration: 0.1
      }, 0.1);

      // Étape A.3 : Masquer les miniatures physiques exactement quand le morphing s'envole
      timelinePrincipale.to(elementMiniatures.value, {
        opacity: 0,
        duration: 0.1
      }, 0.6);

      // 2. Phase B : Une fois sa taille minimale atteinte au centre, elle glisse vers la GAUCHE
      timelinePrincipale.to(elementImageMorph.value, {
        x: rectPhoto.left,
        y: rectPhoto.top,
        duration: 0.6,
        ease: "power3.inOut"
      }, 0.6);

      // Et simultanément, les autres expertises grandissent depuis les miniatures bas-droite vers leur colonne finale !
      // Montage Vidéo
      timelinePrincipale.to(elementMorphVideo.value, {
        width: rectVideo.width,
        height: rectVideo.height,
        x: rectVideo.left,
        y: rectVideo.top,
        borderRadius: "0px",
        duration: 0.6,
        ease: "power3.inOut"
      }, 0.6);

      // Graphique
      timelinePrincipale.to(elementMorphGraphique.value, {
        width: rectGraphique.width,
        height: rectGraphique.height,
        x: rectGraphique.left,
        y: rectGraphique.top,
        borderRadius: "0px",
        duration: 0.6,
        ease: "power3.inOut"
      }, 0.6);

      // Web
      timelinePrincipale.to(elementMorphWeb.value, {
        width: rectWeb.width,
        height: rectWeb.height,
        x: rectWeb.left,
        y: rectWeb.top,
        borderRadius: "0px",
        duration: 0.6,
        ease: "power3.inOut"
      }, 0.6);

      // Étape finale : Handoff fluide vers les images réelles de la grille
      timelinePrincipale.to(".expertise-carte .image-fond", {
        opacity: 1,
        duration: 0.05
      }, 1.2);
      
      timelinePrincipale.to([
        elementImageMorph.value,
        elementMorphVideo.value,
        elementMorphGraphique.value,
        elementMorphWeb.value
      ], {
        opacity: 0,
        duration: 0.05
      }, 1.2);
    };

    rafraichirCoordonneesMorph();
    
    // Étape D : Révélation des titres de toutes les expertises au centre
    timelinePrincipale.from(".nom-expertise", {
      opacity: 0,
      scale: 0.95,
      duration: 0.3,
      stagger: 0.05
    }, 0.85);

    // Étape E : Apparition de la section stats (uniquement dans l'état 2)
    timelinePrincipale.to('.conteneur-stats', {
      opacity: 1,
      y: 0,
      duration: 0.4,
      ease: "power2.out"
    }, 1.0);

    // Initialisation du contrôleur de scroll "un coup"
    // onUp = l'utilisateur scrolle vers le haut (molette vers le haut) → afficher l'état 2
    // onDown = l'utilisateur scrolle vers le bas (molette vers le bas) → revenir à l'état 1
    Observer.create({
      target: window,
      type: "wheel,touch,pointer",
      onUp: () => {
        if (!animationEnCours && etatAnimation === 1) {
          timelinePrincipale.play();
        }
      },
      onDown: () => {
        if (!animationEnCours && etatAnimation === 2) {
          timelinePrincipale.reverse();
        }
      },
      tolerance: 10,
      preventDefault: true
    });
    
  }, elementConteneur.value);
};

const surResize = () => {
  ScrollTrigger.refresh();
};

onMounted(() => {
  // Réinitialisation forcée du défilement vers le haut
  if (history.scrollRestoration) {
    history.scrollRestoration = 'manual';
  }
  window.scrollTo(0, 0);

  setTimeout(() => {
    initialiserAnimations();
  }, 500);

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
  overflow: hidden;
  position: relative;
  background-color: var(--couleur-fond);
}

.entete-principale {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  padding: 3rem 7rem 4%;
  display: flex;
  justify-content: space-between;
  align-items: center;
  z-index: 100;
}

.logo-conteneur {
  height: 40px;
  display: flex;
  align-items: center;
}

.logo-image {
  height: 55px;
  width: auto;
  object-fit: contain;
  filter: drop-shadow(0 2px 4px rgba(0,0,0,0.5));
}

.navigation-milieu {
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
  color: var(--couleur-gris-secondaire);
  position: relative;
  padding: 0.4rem 0;
  transition: var(--transition-rapide);
}

.lien-nav.actif {
  color: var(--couleur-texte);
}

.lien-nav::after {
  content: '';
  position: absolute;
  bottom: 0;
  left: 0;
  width: 0;
  height: 1px;
  background-color: var(--couleur-texte);
  transition: var(--transition-rapide);
}

.lien-nav:hover {
  color: var(--couleur-texte);
}

.lien-nav:hover::after {
  width: 100%;
}

/* Bouton bleu électrique "+ Voir nos offres +" */
.conteneur-bouton-offres {
  pointer-events: auto;
}

.bouton-offres {
  background-color: var(--couleur-bleu);
  color: var(--couleur-texte);
  font-size: 0.75rem;
  font-weight: 700;
  letter-spacing: 0.15em;
  padding: 0.8rem 2rem;
  border-radius: 0px; 
  display: flex;
  align-items: center;
  gap: 0.8rem;
  box-shadow: 0 4px 20px rgba(0, 130, 200, 0.35);
  transition: var(--transition-douce);
}

.bouton-offres:hover {
  background-color: var(--couleur-bleu-survol);
  box-shadow: 0 6px 25px rgba(0, 130, 200, 0.5);
  transform: translateY(-2px);
}

.bouton-offres:active {
  transform: translateY(0);
}

.plus-gauche, .plus-droit {
  font-weight: 400;
  font-size: 0.9rem;
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
  z-index: 1;
  overflow: hidden;
  border-radius: 0;
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
  background: radial-gradient(
    circle,
    rgba(5, 5, 5, 0.1) 0%,
    rgba(5, 5, 5, 0.65) 100%
  ), linear-gradient(to top, rgba(5,5,5,0.7) 0%, transparent 40%);
  z-index: 2;
}

/* Couches de morphing des miniatures en fixed */
.miniature-morph-layer {
  position: fixed;
  z-index: 15;
  overflow: hidden;
  pointer-events: none;
  border: 1px solid rgba(255,255,255,0.15);
  display: none; /* Rendu visible via JS après mesure */
}

.overlay-morph-mini {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(5, 5, 5, 0.35);
  z-index: 2;
}

/* Slogan central "+ Soignez votre image +" */
.slogan-centre {
  position: relative;
  z-index: 10;
  display: flex;
  align-items: center;
  gap: 5.5rem;
  text-align: center;
  color: var(--couleur-texte);
}

.titre-principal {
  font-size: 2.1rem;
  font-weight: 400;
  letter-spacing: -0.01em;
  word-spacing: 0.05em;
  font-family: var(--police-titre);
  text-shadow: 0 4px 15px rgb(0 0 0 / 17%);
}

/* Signe Plus Vectoriel en CSS Pur : thon et blanc garanti ! */
.signe-plus-css {
  position: relative;
  width: 25px;  
  height: 25px;
  display: inline-block;
  flex-shrink: 0;
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
  height: 1.5px; /* 1 pixel physique d'épaisseur */
  transform: translateY(-50%);
}

.signe-plus-css::after {
  left: 50%;
  top: 0;
  width: 1.5px; /* 1 pixel physique d'épaisseur */
  height: 100%;
  transform: translateX(-50%);
}

/* Liens verticaux en bas à gauche */
.menu-bas-gauche {
  position: absolute;
  bottom: 3.5rem;
  left: 7%;
  z-index: 10;
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
  z-index: 10;
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
  z-index: 10;
  display: flex;
  gap: 0.8rem;
}

.miniature-cadre {
  width: 68px;
  height: 38px;
  border-radius: 4px;
  overflow: hidden;
  border: 1px solid rgba(255,255,255,0.2);
  cursor: pointer;
  transition: var(--transition-douce);
  position: relative;
}

.miniature-img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
}

.miniature-cadre:hover {
  transform: translateY(-4px);
  border-color: var(--couleur-texte);
}

.miniature-cadre.actif {
  border-color: var(--couleur-bleu);
  box-shadow: 0 0 10px rgba(0, 130, 200, 0.4);
}

/* Grille expertises absolute dans le Héro */
.section-expertises-absolute {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  z-index: 15;
  pointer-events: none;
  opacity: 0;
  visibility: hidden;
}

.section-expertises-absolute :deep(.expertise-carte) {
  pointer-events: auto;
}

/* Responsivité tablettes et mobiles */
@media (max-width: 960px) {
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

@media (max-width: 600px) {
  .titre-principal {
    font-size: 1.5rem;
  }
  
  .signe-plus-css {
    display: none;
  }
  
  .entete-principale {
    padding: 2rem 5%;
  }
  
  .menu-bas-gauche {
    display: none;
  }
}
</style>
