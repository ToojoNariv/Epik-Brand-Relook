<template>
  <div class="expertises-section">
    <!-- Grille des expertises (Fidèle 100% à l'Aperçu) -->
    <div class="expertises-grille">

      <!-- 1. Photographie -->
      <div class="expertise-carte" id="carte-photo" @click="$emit('selectionner', 'photo')">
        <div class="expertise-conteneur-image">
          <!-- Ce wrapper sera animé par GSAP pour passer du plein écran à la taille carte -->
          <div class="image-wrapper" id="photo-image-wrapper">
            <img src="/images/Photographie Background.jpg" alt="Photographie Epik Brand" class="image-fond" />
            <div class="image-overlay">
              <h3 class="nom-expertise texte-titre">
                <span class="lettre-titre-carte" v-for="(lettre, i) in 'Photographie'" :key="i">{{ lettre === ' ' ? '\u00A0' : lettre }}</span>
              </h3>
            </div>
          </div>
        </div>
      </div>

      <!-- 2. Graphique Design -->
      <div class="expertise-carte" id="carte-graphique" @click="$emit('selectionner', 'graphique')">
        <div class="expertise-conteneur-image">
          <div class="image-wrapper">
            <img src="/images/jeff-sheldon-9SyOKYrq-rE-unsplash.jpg" alt="Graphique design Epik Brand"
              class="image-fond" />
            <div class="image-overlay">
              <h3 class="nom-expertise texte-titre">
                <span class="lettre-titre-carte" v-for="(lettre, i) in 'Graphique design'" :key="i">{{ lettre === ' ' ? '\u00A0' : lettre }}</span>
              </h3>
            </div>
          </div>
        </div>
      </div>

      <!-- 3. Montage Vidéo -->
      <div class="expertise-carte" id="carte-video" @click="$emit('selectionner', 'video')">
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
                <span class="lettre-titre-carte" v-for="(lettre, i) in 'Montage vidéo'" :key="i">{{ lettre === ' ' ? '\u00A0' : lettre }}</span>
              </h3>
            </div>
          </div>
        </div>
      </div>

      <!-- 4. Web -->
      <div class="expertise-carte" id="carte-web" @click="$emit('selectionner', 'web')">
        <div class="expertise-conteneur-image">
          <div class="image-wrapper">
            <img src="/images/Web Background.jpg" alt="Web Epik Brand" class="image-fond" />
            <div class="image-overlay">
              <h3 class="nom-expertise texte-titre">
                <span class="lettre-titre-carte" v-for="(lettre, i) in 'Développement web'" :key="i">{{ lettre === ' ' ? '\u00A0' : lettre }}</span>
              </h3>
            </div>
          </div>
        </div>
      </div>

    </div>
  </div>
</template>

<script setup>
// Géré de façon dynamique et synchronisé via PageAccueil.vue
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
  .expertises-grille {
    grid-template-columns: repeat(2, 1fr);
    height: auto;
    gap: 1.5rem;
  }

  .nom-expertise {
    font-size: 1.8rem;
  }
}

@media (max-width: 600px) {
  .expertises-grille {
    grid-template-columns: 1fr;
    gap: 1.5rem;
  }
}
</style>
