<template>
  <div class="expertises-section">
    <!-- Grille des expertises (Fidèle 100% à l'Aperçu) -->
    <div class="expertises-grille">
      
      <!-- 1. Photographie -->
      <div class="expertise-carte" id="carte-photo">
        <div class="expertise-conteneur-image">
          <!-- Ce wrapper sera animé par GSAP pour passer du plein écran à la taille carte -->
          <div class="image-wrapper" id="photo-image-wrapper">
            <img 
              src="/images/Photographie Background.jpg" 
              alt="Photographie Epik Brand" 
              class="image-fond"
            />
            <div class="image-overlay">
              <h3 class="nom-expertise texte-titre">Photographie</h3>
            </div>
          </div>
        </div>
      </div>

      <!-- 2. Graphique Design -->
      <div class="expertise-carte" id="carte-graphique">
        <div class="expertise-conteneur-image">
          <div class="image-wrapper">
            <img 
              src="/images/jeff-sheldon-9SyOKYrq-rE-unsplash.jpg" 
              alt="Graphique design Epik Brand" 
              class="image-fond"
            />
            <div class="image-overlay">
              <h3 class="nom-expertise texte-titre">Graphique design</h3>
            </div>
          </div>
        </div>
      </div>

      <!-- 3. Montage Vidéo -->
      <div class="expertise-carte" id="carte-video">
        <div class="expertise-conteneur-image">
          <div class="image-wrapper">
            <img 
              src="/images/windows-w79mIrYKcK4-unsplash.jpg" 
              alt="Montage vidéo Epik Brand" 
              class="image-fond"
            />
            <div class="image-overlay">
              <h3 class="nom-expertise texte-titre">Montage vidéo</h3>
            </div>
          </div>
        </div>
      </div>

      <!-- 4. Web -->
      <div class="expertise-carte" id="carte-web">
        <div class="expertise-conteneur-image">
          <div class="image-wrapper">
            <img 
              src="/images/Web Background.jpg" 
              alt="Web Epik Brand" 
              class="image-fond"
            />
            <div class="image-overlay">
              <h3 class="nom-expertise texte-titre">Web</h3>
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
}

.expertises-grille {
  display: flex;
  overflow-x: auto;
  gap: 2rem;
  width: 100%;
  padding: 0 7%;
  height: 35vh; /* landscape height */
  align-items: stretch;
  scroll-snap-type: x mandatory;
  scrollbar-width: none;
  pointer-events: auto;
}

.expertises-grille::-webkit-scrollbar {
  display: none;
}

.expertise-carte {
  position: relative;
  overflow: hidden;
  background: #000000;
  display: flex;
  flex-direction: column;
  cursor: pointer;
  border-radius: 4px; /* Slight rounding for modern look or keep 0px if preferred */
  flex: 0 0 35vw; /* Landscape width */
  scroll-snap-align: center;
}

.expertise-conteneur-image {
  flex: 1;
  width: 100%;
  height: 100%;
  position: relative;
  overflow: hidden;
}

.image-wrapper {
  width: 100%;
  height: 100%;
  position: relative;
  transition: transform 0.8s cubic-bezier(0.25, 1, 0.5, 1);
}

.expertise-carte:hover .image-wrapper {
  transform: scale(1.05);
}

.image-fond {
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
}

.image-overlay {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(5, 5, 5, 0.4);
  display: flex;
  align-items: center;
  justify-content: center;
  text-align: center;
  transition: background 0.4s ease;
  z-index: 2;
}

.expertise-carte:hover .image-overlay {
  background: rgba(5, 5, 5, 0.55);
}

.nom-expertise {
  font-size: 2.2rem;
  font-weight: 500;
  color: var(--couleur-texte);
  letter-spacing: -0.02em;
  font-family: var(--police-titre);
  text-shadow: 0 4px 10px rgba(0, 0, 0, 0.6);
  padding: 0 1rem;
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
