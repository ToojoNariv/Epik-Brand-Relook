<template>
  <header :class="['header-epik', `pos-${position}`, { 'has-gradient': gradient }]">
    <!-- Logo -->
    <div class="logo-conteneur" style="cursor: pointer;" @click="$emit('logo-click')">
      <img src="/logo.svg" alt="Epik Brand Logo" class="logo-image" />
    </div>

    <!-- Navigation du milieu -->
    <div class="navigation-milieu">
      <template v-if="mode === 'accueil'">
        <nav class="liens-navigation" ref="elementLiensNav">
          <a href="#expertises" class="lien-nav actif" @click.prevent="$emit('expertises-click')">{{ t('menu.expertises') }}</a>
          <a href="#menu" class="lien-nav" @click.prevent="$emit('menu-click')">{{ t('menu.menu') }}</a>
        </nav>

        <div class="conteneur-bouton-offres" ref="elementBoutonOffres">
          <a href="#offres" class="bouton-offres" @click.prevent="$emit('offres-click')">
            <span class="plus-gauche">+</span>
            {{ t('menu.voirOffres') }}
            <span class="plus-droit">+</span>
          </a>
        </div>
      </template>

      <template v-else>
        <nav class="liens-navigation">
          <button type="button" class="lien-nav" @click.prevent="$emit('expertises-click')">{{ t('menu.expertises') }}</button>
          <button type="button" class="lien-nav" @click.prevent="$emit('menu-click')">{{ t('menu.menu') }}</button>
        </nav>
      </template>
    </div>

    <!-- Contrôle Musique -->
    <div class="controle-musique">
      <LecteurMusique />
    </div>
  </header>
</template>

<script setup>
import { ref } from 'vue';
import LecteurMusique from './LecteurMusique.vue';
import { t } from '../i18n/index';

defineProps({
  mode: {
    type: String,
    default: 'subpage' // 'accueil' | 'subpage'
  },
  position: {
    type: String,
    default: 'absolute' // 'absolute' | 'fixed' | 'sticky'
  },
  gradient: {
    type: Boolean,
    default: false
  }
});

defineEmits(['logo-click', 'expertises-click', 'menu-click', 'offres-click']);

const elementLiensNav = ref(null);
const elementBoutonOffres = ref(null);

defineExpose({
  elementLiensNav,
  elementBoutonOffres
});
</script>

<style scoped>
.header-epik {
  width: 100%;
  padding: 3rem 7rem 2rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
  z-index: 100;
  background: transparent;
  font-family: 'Space Grotesk', sans-serif;
  pointer-events: none;
}

.header-epik.pos-fixed {
  position: fixed;
  top: 0;
  left: 0;
}

.header-epik.pos-absolute {
  position: absolute;
  top: 0;
  left: 0;
}

.header-epik.pos-sticky {
  position: sticky;
  top: 0;
}

.header-epik.has-gradient {
  background: linear-gradient(180deg, #000 72%, rgba(0, 0, 0, 0));
}

.logo-conteneur {
  height: 40px;
  display: flex;
  align-items: center;
  background: none;
  border: none;
  padding: 0;
  pointer-events: auto;
}

.logo-image {
  height: 55px;
  width: auto;
  object-fit: contain;
}

.navigation-milieu {
  position: absolute;
  left: 50%;
  transform: translateX(-50%);
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 40px;
  pointer-events: auto;
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
  background: none;
  border: none;
  cursor: pointer;
  font-family: 'Space Grotesk', sans-serif;
}

.lien-nav.actif {
  color: var(--couleur-texte);
}

.lien-nav:hover {
  color: var(--couleur-texte);
}

.conteneur-bouton-offres {
  pointer-events: auto;
}

.bouton-offres {
  background: var(--couleur-bleu);
  color: var(--couleur-texte);
  font-size: 1.1rem;
  font-weight: 300;
  padding: 0.6rem 1rem;
  border-radius: 0px;
  display: flex;
  align-items: center;
  gap: 2.8rem;
  box-shadow: 0 4px 20px rgba(0, 130, 200, 0.35);
  transition: var(--transition-douce);
}

.bouton-offres:hover {
  background-color: var(--couleur-bleu-survol);
  box-shadow: 0 6px 25px rgba(0, 130, 200, 0.5);
}

.bouton-offres:active {
  transform: translateY(0);
}

.plus-gauche,
.plus-droit {
  font-weight: 400;
  font-size: 1.5rem;
  display: inline-block;
  transition: transform 0.5s cubic-bezier(0.16, 1, 0.3, 1);
}

.bouton-offres:hover .plus-gauche {
  transform: rotate(180deg);
}

.bouton-offres:hover .plus-droit {
  transform: rotate(-180deg);
}

.controle-musique {
  justify-self: end;
  pointer-events: auto;
}

/* responsive rule */
@media (max-width: 768px) {
  .header-epik {
    padding: 2rem 5%;
    display: grid;
    grid-template-columns: 1fr auto;
    gap: 1.25rem;
  }

  .logo-image {
    height: 45px;
  }

  .navigation-milieu {
    position: relative;
    left: auto;
    transform: none;
    justify-self: end;
  }

  .liens-navigation {
    gap: 1.5rem;
  }

  .lien-nav {
    font-size: 1.1rem;
  }

  .controle-musique {
    display: none;
  }
}
</style>
