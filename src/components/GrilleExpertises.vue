<template>
  <div class="expertises-section">
    <!-- Grille des expertises (Fidèle 100% à l'Aperçu) -->
    <div class="expertises-grille">
      <template v-for="set in [0, 1, 2]" :key="set">

        <!-- 1. Photographie -->
        <div 
          class="expertise-carte" 
          :class="{ 'original-set': set === 1 }"
          :id="set === 1 ? 'carte-photo' : undefined" 
          @click="$emit('selectionner', { id: 'photo', set, element: $event.currentTarget })"
        >
          <div class="expertise-conteneur-image">
            <!-- Ce wrapper sera animé par GSAP pour passer du plein écran à la taille carte -->
            <div class="image-wrapper" :id="set === 1 ? 'photo-image-wrapper' : undefined">
              <img src="/images/Photographie Background.jpg" alt="Photographie Epik Brand" class="image-fond" decoding="async" />
              <div class="image-overlay">
                <h3 class="nom-expertise texte-titre">
                  <span class="lettre-titre-carte" v-for="(lettre, i) in t('expertises.photo').split('')" :key="i">{{ lettre === ' ' ? '\u00A0' : lettre }}</span>
                </h3>
              </div>
            </div>
          </div>
        </div>

        <!-- 2. Graphique Design -->
        <div 
          class="expertise-carte" 
          :class="{ 'original-set': set === 1 }"
          :id="set === 1 ? 'carte-graphique' : undefined" 
          @click="$emit('selectionner', { id: 'graphique', set, element: $event.currentTarget })"
        >
          <div class="expertise-conteneur-image">
            <div class="image-wrapper">
              <img src="https://ik.imagekit.io/h5zy3jui5/Home%20photo/design.jpg" alt="Graphique design Epik Brand"
                class="image-fond" decoding="async" />
              <div class="image-overlay">
                <h3 class="nom-expertise texte-titre">
                  <span class="lettre-titre-carte" v-for="(lettre, i) in t('expertises.graphique').split('')" :key="i">{{ lettre === ' ' ? '\u00A0' : lettre }}</span>
                </h3>
              </div>
            </div>
          </div>
        </div>

        <!-- 3. Montage Vidéo -->
        <div 
          class="expertise-carte" 
          :class="{ 'original-set': set === 1 }"
          :id="set === 1 ? 'carte-video' : undefined" 
          @click="$emit('selectionner', { id: 'video', set, element: $event.currentTarget })"
        >
          <div class="expertise-conteneur-image">
            <div class="image-wrapper">
              <video 
                src="/images/Background vidéo.mp4" 
                autoplay 
                loop 
                muted 
                playsinline 
                class="image-fond"
                style="width: 100%; height: 100%; object-fit: cover;"
              ></video>
              <div class="image-overlay">
                <h3 class="nom-expertise texte-titre">
                  <span class="lettre-titre-carte" v-for="(lettre, i) in t('expertises.video').split('')" :key="i">{{ lettre === ' ' ? '\u00A0' : lettre }}</span>
                </h3>
              </div>
            </div>
          </div>
        </div>

        <!-- 4. Web -->
        <div 
          class="expertise-carte" 
          :class="{ 'original-set': set === 1 }"
          :id="set === 1 ? 'carte-web' : undefined" 
          @click="$emit('selectionner', { id: 'web', set, element: $event.currentTarget })"
        >
          <div class="expertise-conteneur-image">
            <div class="image-wrapper">
              <img src="/images/Web Background.jpg" alt="Web Epik Brand" class="image-fond" decoding="async" />
              <div class="image-overlay">
                <h3 class="nom-expertise texte-titre">
                  <span class="lettre-titre-carte" v-for="(lettre, i) in t('expertises.web').split('')" :key="i">{{ lettre === ' ' ? '\u00A0' : lettre }}</span>
                </h3>
              </div>
            </div>
          </div>
        </div>

      </template>
    </div>
  </div>
</template>

<script setup>
import { t } from '../i18n/index';
</script>

<style scoped>
.expertises-section {
  width: 100%;
  height: 100vh;
  padding: 0;
  display: flex;
  flex-direction: column;
  justify-content: center;
  background: transparent;
  position: relative;
  z-index: 2;
  pointer-events: none;
  overflow: hidden;
}

.expertises-grille {
  display: flex;
  overflow: visible;
  gap: 1rem;
  width: max-content;
  padding: 0 7vw;
  height: 50vh;
  align-items: stretch;
  pointer-events: auto;
  will-change: transform;
}

.expertise-carte {
  position: relative;
  overflow: hidden;
  background: #000000;
  display: flex;
  flex-direction: column;
  cursor: pointer;
  flex: 0 0 35vw;
  scroll-snap-align: center;
  /* Fix Safari/Webkit overflow bug with transformed children */
  transform: translateZ(0);
  -webkit-mask-image: -webkit-radial-gradient(white, black);
  mask-image: radial-gradient(white, black);
  isolation: isolate;
}

.expertise-conteneur-image {
  flex: 1;
  width: 100%;
  height: 100%;
  position: relative;
  overflow: hidden;
  transform: translateZ(0);
  -webkit-mask-image: -webkit-radial-gradient(white, black);
  mask-image: radial-gradient(white, black);
}

.image-wrapper {
  width: 100%;
  height: 100%;
  position: relative;
}

.image-fond {
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
  will-change: transform;
}

.image-overlay {
  position: absolute;
  inset: 0;
  background: rgba(5, 5, 5, 0.22);
  z-index: 1;
}

.nom-expertise {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  z-index: 2;
  font-size: 2rem;
  font-weight: 500;
  color: var(--couleur-texte);
  letter-spacing: -0.02em;
  font-family: var(--police-titre);
  text-shadow: 0 4px 10px rgba(0, 0, 0, 0.401);
  padding: 0 1rem 0.1rem 1rem;
  white-space: nowrap;
  overflow: hidden;
  line-height: 1.2;
}

.lettre-titre-carte {
  display: inline-block;
  transform: translateY(115%); /* Position initiale cachée sous le masque */
}

/* Version responsive pour tablettes et mobiles */
@media (max-width: 1024px) {
  .expertises-section {
    height: 100vh;
    padding: 0;
  }

  .expertises-grille {
    display: flex;
    flex-direction: row;
    width: max-content;
    height: 55vh;
    padding: 0 10vw;
    gap: 1.5rem;
    /* Reset from grid configurations if any */
    grid-template-columns: none !important;
  }

  .expertise-carte {
    flex: 0 0 60vw;
    aspect-ratio: auto;
    height: 100%;
    background: #000000;
  }

  .nom-expertise {
    font-size: 1.9rem;
  }
}

@media (max-width: 768px) {
  .expertises-grille {
    height: 50vh;
    padding: 0 12vw;
    gap: 1rem;
  }

  .expertise-carte {
    flex: 0 0 76vw;
  }
  
  .nom-expertise {
    font-size: 1.7rem;
  }
}
</style>
