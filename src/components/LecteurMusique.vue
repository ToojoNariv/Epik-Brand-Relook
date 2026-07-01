<template>
  <button 
    @click="surClicMusique" 
    class="bouton-musique"
    :class="{ 'actif': estEnLecture }"
    aria-label="Contrôle de la musique d'ambiance"
  >
    <span class="prefixe-musique">{{ t('menu.musique') }} — </span>
    <span class="masque-texte" :key="estEnLecture">
      <span 
        v-for="(lettre, i) in (estEnLecture ? 'On' : 'Off').split('')" 
        :key="i"
        class="lettre-musique"
        :style="{ animationDelay: `${i * 0.03}s` }"
      >{{ lettre }}</span>
    </span>
  </button>
</template>

<script setup>
import { estEnLecture, basculerMusique } from '../services/audioService';
import { t } from '../i18n/index';
import { trackEvent } from '../services/analyticsService';

const surClicMusique = () => {
  basculerMusique();
  trackEvent('toggle_music', { state: estEnLecture.value ? 'on' : 'off' });
};
</script>

<style scoped>
.bouton-musique {
  font-size: 1.2rem;
  font-weight: 400;
  color: var(--couleur-texte);
  opacity: 0.5;
  transition: opacity 0.3s ease;
  z-index: 100;
  padding: 0.8rem 1.5rem;
  margin-right: -1.5rem;
  border: none;
  background: none;
  cursor: pointer;
  font-family: var(--police-texte);
}

.bouton-musique:hover {
  opacity: 0.85;
}

.bouton-musique.actif {
  opacity: 1;
}

.prefixe-musique {
  display: inline-block;
  vertical-align: middle;
}

.masque-texte {
  display: inline-block;
  overflow: hidden;
  line-height: 1.2;
  white-space: nowrap;
  vertical-align: middle;
}

.lettre-musique {
  display: inline-block;
  transform: translateY(115%);
  animation: monterAscenseurMusique 0.4s cubic-bezier(0.16, 1, 0.3, 1) forwards;
}

@keyframes monterAscenseurMusique {
  from {
    transform: translateY(115%);
  }
  to {
    transform: translateY(0%);
  }
}
</style>
