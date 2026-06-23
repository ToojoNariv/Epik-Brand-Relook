<template>
  <div class="loader-container" ref="loaderContainer">
    
    <!-- Progress Bar Initiale -->
    <div class="progress-bar-container">
      <div class="progress-bar-fill"></div>
      <div class="loader-wait-text">{{ t('common.loaderWait') }}</div>
    </div>

    <div class="colonnes-wrapper">
      
      <!-- Colonne GAUCHE (monte) -->
      <div class="colonne col-gauche">
        <div class="colonne-inner inner-gauche">
          <div class="photo-paysage" v-for="img in colGauche" :key="img">
            <img :src="img" alt="" decoding="async" loading="eager" />
            <div class="img-overlay"></div>
          </div>
        </div>
      </div>

      <!-- Colonne CENTRE (descend) - Contient l'image Héro -->
      <div class="colonne col-centre">
        <div class="colonne-inner inner-centre">
          <div class="photo-paysage" v-for="(img, idx) in colCentre" :key="img" :class="{'is-hero': idx === 1}">
            <img :src="img" alt="" decoding="async" loading="eager" />
            <div class="img-overlay"></div>
          </div>
        </div>
      </div>

      <!-- Colonne DROITE (monte) -->
      <div class="colonne col-droite">
        <div class="colonne-inner inner-droite">
          <div class="photo-paysage" v-for="img in colDroite" :key="img">
            <img :src="img" alt="" decoding="async" loading="eager" />
            <div class="img-overlay"></div>
          </div>
        </div>
      </div>

    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { gsap } from 'gsap';
import { t } from '../i18n/index';

const emit = defineEmits(['complete', 'reveal']);
const loaderContainer = ref(null);

const allImages = [
  'https://ik.imagekit.io/h5zy3jui5/Menu/A%20propos.jpg?updatedAt=1781276235566',
  'https://ik.imagekit.io/h5zy3jui5/Branding/LAROCHE/Charte%20graphique-06.jpg?updatedAt=1781426322794',
  'https://ik.imagekit.io/h5zy3jui5/Home%20photo/design.jpg?updatedAt=1781289704998',
  'https://ik.imagekit.io/h5zy3jui5/Branding/Miray/Miray%20charte%20graphique-09.jpg?updatedAt=1781517471686',
  'https://ik.imagekit.io/h5zy3jui5/Menu/Portfolio.jpg?updatedAt=1781288855163',
  'https://ik.imagekit.io/h5zy3jui5/Branding/LAROCHE/Charte%20graphique-03.jpg?updatedAt=1781426323831',
  'https://ik.imagekit.io/h5zy3jui5/Home%20photo/design.jpg',
  'https://ik.imagekit.io/h5zy3jui5/Home%20photo/windows-w79mIrYKcK4-unsplash.jpg'
];

const colGauche = [allImages[0], allImages[1], allImages[2], allImages[3]];
const colCentre = [allImages[4], 'https://ik.imagekit.io/h5zy3jui5/Home%20photo/Photographie%20Background.jpg?updatedAt=1781288609519', allImages[5], allImages[6]];
const colDroite = [allImages[7], allImages[0], allImages[1], allImages[2]];

onMounted(() => {
  const images = document.querySelectorAll('.loader-container img');
  let loadedCount = 0;
  const totalImages = images.length;

  gsap.set('.progress-bar-fill', { scaleX: 0 });

  const startAnimation = () => {
    const hero = document.querySelector('.is-hero');
    if (!hero) return;
    
    const heroHeight = hero.offsetHeight;
    const heroCenterOffset = hero.offsetTop + heroHeight / 2;
    const viewportHeight = window.innerHeight;
    const viewportCenter = viewportHeight / 2;
    
    // Position Y cible pour que l'image Hero soit parfaitement centrée verticalement
    const targetY = viewportCenter - heroCenterOffset;

    // Position initiale des colonnes pour le glissement
    gsap.set('.inner-gauche', { y: viewportHeight * 0.1 });
    gsap.set('.inner-droite', { y: viewportHeight * 0.3 });
    gsap.set('.inner-centre', { y: targetY - viewportHeight * 0.6 }); 

    const tl = gsap.timeline();

    // ─── -1. FIN DE LA PROGRESS BAR ───
    // La barre de progression est déjà à 100%, on efface directement le conteneur.
    tl.to('.progress-bar-container', {
      opacity: 0,
      duration: 0.4,
      ease: 'power2.out'
    }, 0);

    const entranceTime = 0.4;

    // ─── 0. APPARITION DES ÉLÉMENTS (Depuis les extrémités) ───
    const entranceDuration = 1.5;
    const staggerAmount = 0.5;
    
    // Les photos du centre arrivent depuis le HAUT (elles tombent)
    tl.fromTo('.inner-centre .photo-paysage', 
      { y: -viewportHeight, opacity: 0 },
      { 
        y: 0, 
        opacity: 1, 
        duration: entranceDuration, 
        ease: 'power3.out', 
        stagger: { amount: staggerAmount, from: "end" },
        force3D: true 
      }, 
      entranceTime
    );

    // Les photos des côtés arrivent depuis le BAS (elles montent)
    tl.fromTo('.inner-gauche .photo-paysage, .inner-droite .photo-paysage', 
      { y: viewportHeight, opacity: 0 },
      { 
        y: 0, 
        opacity: 1, 
        duration: entranceDuration, 
        ease: 'power3.out', 
        stagger: { amount: staggerAmount, from: "start" },
        force3D: true 
      }, 
      entranceTime
    );

    // ─── 1. EFFET SLOT MACHINE / GLISSEMENT ───
    // Commencer le glissement dès le début de l'apparition pour éliminer le moment d'arrêt
    const glideStartTime = entranceTime; 
    const glideDuration = 3; 

    tl.to('.inner-gauche', {
      y: -viewportHeight * 0.6,
      duration: glideDuration,
      ease: 'power1.out',
      force3D: true
    }, glideStartTime);

    tl.to('.inner-droite', {
      y: -viewportHeight * 0.4,
      duration: glideDuration,
      ease: 'power1.out',
      force3D: true
    }, glideStartTime);

    tl.to('.inner-centre', {
      y: targetY,
      duration: glideDuration,
      ease: 'power1.out',
      force3D: true
    }, glideStartTime);

    // ─── 2. RALENTISSEMENT ET AGRANDISSEMENT (Zoom original comme demandé) ───
    const heroExpandTime = glideStartTime + 2.2; // Commence plus tôt pour garder de la vitesse
    const expandDuration = 1.8; 

    const heightDiff = viewportHeight - heroHeight;
    const compensateY = - (heightDiff / 2);

    tl.to('.col-centre', {
      left: '0%',
      width: '100%',
      y: compensateY, 
      duration: expandDuration,
      ease: 'power3.inOut',
      onStart: () => {
        // Bloquer la hauteur des autres images pour qu'elles ne s'agrandissent pas et ne poussent pas le hero
        document.querySelectorAll('.inner-centre .photo-paysage:not(.is-hero)').forEach(el => {
          el.style.height = el.offsetHeight + 'px';
          el.style.aspectRatio = 'auto';
        });
      }
    }, heroExpandTime);

    tl.to('.is-hero', {
      width: '100%',
      height: '100vh',
      borderRadius: '0px',
      zIndex: 10,
      duration: expandDuration,
      ease: 'power3.inOut'
    }, heroExpandTime);

    // Zoom et écartement fluide pour les colonnes latérales (effet zoom plateau)
    tl.to('.col-gauche', {
      xPercent: -150,
      scale: 1.8,
      opacity: 0,
      duration: expandDuration,
      ease: 'power3.inOut'
    }, heroExpandTime);

    tl.to('.col-droite', {
      xPercent: 150,
      scale: 1.8,
      opacity: 0,
      duration: expandDuration,
      ease: 'power3.inOut'
    }, heroExpandTime);

    // Zoom et disparition rapide pour les images non-hero de la colonne centrale
    tl.to('.inner-centre .photo-paysage:not(.is-hero)', {
      scale: 1.8,
      opacity: 0,
      duration: 0.8, // Fades out faster to prevent any superposition at the end
      ease: 'power2.out'
    }, heroExpandTime);

    // Retire l'overlay pour éclaircir la photo
    tl.to('.is-hero .img-overlay', {
      opacity: 0,
      duration: expandDuration
    }, heroExpandTime);

    // ─── 3. FIN DU LOADER ET TRANSITION ───
    tl.to(loaderContainer.value, {
      opacity: 0,
      duration: 0.8,
      ease: 'power2.inOut',
      onStart: () => {
        emit('reveal');
      },
      onComplete: () => {
        emit('complete');
      }
    }, '+=0.1');
  };

  // Préchargement des images avec mise à jour de la barre de progression
  if (totalImages === 0) {
    startAnimation();
  } else {
    const onImageLoad = () => {
      loadedCount++;
      const progress = loadedCount / totalImages;

      // Animation fluide vers la progression réelle
      gsap.to('.progress-bar-fill', {
        scaleX: progress,
        duration: 0.4,
        ease: 'power2.out',
        overwrite: 'auto',
        onComplete: () => {
          if (loadedCount === totalImages) {
            // Un délai pour être sûr que le GPU a uploadé les textures et que la barre pleine est visible
            setTimeout(startAnimation, 300);
          }
        }
      });
    };

    images.forEach(img => {
      if (img.complete && img.naturalHeight !== 0) {
        onImageLoad();
      } else {
        img.onload = onImageLoad;
        img.onerror = onImageLoad; // Continue même si erreur 404
      }
    });
  }
});
</script>

<style scoped>
.loader-container {
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  z-index: 9999;
  background-color: #0d0d0d;
  overflow: hidden;
  pointer-events: none;
}

.progress-bar-container {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 15vw;
  height: 2px;
  background-color: rgba(255, 255, 255, 0.15);
  z-index: 50;
  border-radius: 0;
}

.progress-bar-fill {
  width: 100%;
  height: 100%;
  background-color: #ffffff;
  transform-origin: left center;
  will-change: transform;
}

.loader-wait-text {
  position: absolute;
  top: 12px;
  left: 50%;
  transform: translateX(-50%);
  color: rgba(255, 255, 255, 0.77);
  font-size: 0.8rem;
  font-weight: 300;
  white-space: nowrap;
  font-family: var(--police-texte);
}

.colonnes-wrapper {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
}

.colonne {
  position: absolute;
  top: 0;
  width: 33.333%;
  height: 100%;
}

.col-gauche { left: 0%; }
.col-centre { left: 33.333%; z-index: 10; }
.col-droite { left: 66.666%; }

.colonne-inner {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 5vh;
  padding: 10vh 0;
  will-change: transform;
}

.photo-paysage {
  width: 100%;
  aspect-ratio: 16 / 10;
  position: relative;
  flex-shrink: 0;
  transform: translateZ(0); /* Accélération matérielle */
  opacity: 0; /* Caché par défaut pendant le chargement */
}

.photo-paysage.is-hero {
  z-index: 10;
}

.photo-paysage img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transform: translateZ(0);
}

.img-overlay {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  margin-inline: 1vw;
  background-color: rgba(0, 0, 0, 0.079);
  pointer-events: none;
  z-index: 2;
  will-change: opacity;
}
</style>
