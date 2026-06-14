<template>
  <div class="apropos-page" ref="pageRef" aria-hidden="true">

    <!-- ─── HEADER ─────────────────────────────────────────── -->
    <HeaderEpik position="fixed" @logo-click="fermer" @expertises-click="fermer" @menu-click="ouvrirMenu"
      class="headeraboutpage" />

    <!-- ─── SCROLLABLE WRAPPER ─────────────────────────────── -->
    <div class="ap-scroll" ref="scrollRef">

      <!-- ═══════════════════════════════════════════════════
           SECTION HÉRO
           ═══════════════════════════════════════════════════ -->
      <section class="ap-hero">
        <!-- Barre noire en CSS traversante -->
        <div class="ap-hero-bar"></div>

        <!-- Colonne gauche : "L'Agence" -->
        <div class="ap-hero-gauche">
          <div class="ap-hero-lagence">
            <span class="ap-hero-l">{{ t('apropos.lagence') }}</span>
            <h1 class="ap-hero-agence">{{ t('apropos.agence') }}</h1>
          </div>
        </div>

        <!-- Colonne centre : GIF NOW -->
        <div class="ap-hero-centre">
          <img src="/images/NOW dans le heropage a propos.gif" alt="NOW — Épik Brand" class="ap-hero-gif" />
        </div>

        <!-- Colonne droite : slogan -->
        <div class="ap-hero-droite">
          <div class="ap-hero-slogan">
            <span class="slogan-haut" v-html="t('hero.sloganHaut')"></span>
            <div class="slogan-milieu">
              <span class="slogan-mot" v-html="t('hero.sloganMilieu1')"></span>
              <span class="slogan-mot" v-html="t('hero.sloganMilieu2')"></span>
            </div>
            <span class="slogan-bas" v-html="t('hero.sloganBas')"></span>
          </div>
        </div>
      </section>

      <!-- ═══════════════════════════════════════════════════
           SECTION PRINCIPES
           ═══════════════════════════════════════════════════ -->
      <section class="ap-principes">
        <div class="ap-principes-header">
          <h2 class="ap-principes-titre" v-html="t('apropos.titrePrincipes')"></h2>
        </div>

        <div class="ap-principes-grille">
          <div v-for="principe in principes" :key="principe.numero" class="ap-principe-carte">
            <p class="ap-principe-label">{{ t('apropos.labelPrincipe') }}(No. {{ principe.numero }})</p>
            <h3 class="ap-principe-nom">{{ principe.titre }}</h3>
            <p class="ap-principe-texte">{{ principe.texte }}</p>
          </div>
        </div>
      </section>

      <!-- ═══════════════════════════════════════════════════
           SECTION ÉQUIPE
           ═══════════════════════════════════════════════════ -->
      <section class="ap-equipe" ref="equipeSectionRef">
        <!-- Titre gauche (sticky pendant le scroll des cartes) -->
        <div class="ap-equipe-gauche">
          <h2 class="ap-equipe-titre" v-html="t('apropos.notreEquipe')"></h2>
        </div>

        <!-- Cartes membres -->
        <div class="ap-equipe-droite">
          <div v-for="membre in equipe" :key="membre.nom" class="ap-membre">
            <div class="ap-membre-header">
              <span class="ap-membre-role">{{ membre.role }}</span>
              <span class="ap-membre-email">{{ membre.email }}</span>
            </div>
            <div class="ap-membre-photo-wrap">
              <img :src="membre.photo" :alt="membre.prenom + ' ' + membre.nom" class="ap-membre-photo" />
              <div class="ap-membre-voile"></div>
            </div>
            <div class="ap-membre-nom-bloc">
              <span class="ap-membre-prenom">{{ membre.prenom }}</span>
              <span class="ap-membre-nom">{{ membre.nom }}</span>
            </div>
          </div>
        </div>
      </section>

      <div class="ap-bas-page"></div>
    </div><!-- fin .ap-scroll -->

  </div>
</template>

<script setup>
import { nextTick, onBeforeUnmount, onMounted, ref, watch, computed } from 'vue';
import { gsap } from 'gsap';
import { playScrollTick } from '../services/audioService';
import HeaderEpik from './HeaderEpik.vue';
import { t } from '../i18n/index';

// ── Props / Emits ──────────────────────────────────────────────
const props = defineProps({ ouvert: { type: Boolean, required: true } });
const emit = defineEmits(['close', 'open-menu']);

// ── Refs DOM ───────────────────────────────────────────────────
const pageRef = ref(null);
const scrollRef = ref(null);
const equipeSectionRef = ref(null);
let tl = null;

let dernierePositionScroll = 0;
const surScrollAPropos = (e) => {
  const scrollTop = e.target.scrollTop;
  if (equipeSectionRef.value) {
    const equipeTop = equipeSectionRef.value.offsetTop;
    // Commencer à jouer le son de scroll quand on est dans la section équipe
    if (scrollTop >= equipeTop - 150) {
      if (Math.abs(scrollTop - dernierePositionScroll) >= 45) {
        dernierePositionScroll = scrollTop;
        playScrollTick();
      }
      return;
    }
  }
  dernierePositionScroll = scrollTop;
};

// ── Données ────────────────────────────────────────────────────
const principes = computed(() => t('apropos.principes'));

import { teamMembers } from '../services/apiService';

const equipe = computed(() => {
  if (teamMembers.value && teamMembers.value.length > 0) {
    return teamMembers.value;
  }
  
  // Local fallback
  return [
    {
      prenom: 'Nantenaina',
      nom: 'RANDRIA',
      role: t('apropos.ceo'),
      email: 'nantenaina@gmail.com',
      photo: '/images/Nantenaina.png'
    },
    {
      prenom: 'Miora Oliva',
      nom: 'RAHOLIARIVAO',
      role: t('apropos.pm'),
      email: 'miora@gmail.com',
      photo: '/images/Miora.png'
    }
  ];
});

// ── Animations ─────────────────────────────────────────────────
const montrer = () => {
  if (!pageRef.value) return;
  if (tl) tl.kill();

  pageRef.value.setAttribute('aria-hidden', 'false');

  // Reset scroll en haut à chaque ouverture
  if (scrollRef.value) scrollRef.value.scrollTop = 0;

  gsap.set(pageRef.value, { autoAlpha: 1, pointerEvents: 'auto' });

  // États initiaux
  gsap.set('.ap-hero-gauche', { x: -50, opacity: 0 });
  gsap.set('.ap-hero-centre', { y: 30, opacity: 0, scale: 0.9 });
  gsap.set('.ap-hero-droite', { x: 50, opacity: 0 });
  gsap.set('.ap-principes-titre', { y: 30, opacity: 0 });
  gsap.set('.ap-principe-carte', { y: 45, opacity: 0 });
  gsap.set('.ap-equipe-titre', { x: -40, opacity: 0 });
  gsap.set('.ap-membre', { y: 50, opacity: 0 });

  tl = gsap.timeline({ defaults: { ease: 'power3.out' } });

  tl.to('.ap-hero-gauche', { x: 0, opacity: 1, duration: 0.85 }, 0.1)
    .to('.ap-hero-centre', { y: 0, opacity: 1, scale: 1, duration: 1.0 }, 0.1)
    .to('.ap-hero-droite', { x: 0, opacity: 1, duration: 0.85 }, 0.15)
    .to('.ap-principes-titre', { y: 0, opacity: 1, duration: 0.75 }, 0.45)
    .to('.ap-principe-carte', { y: 0, opacity: 1, duration: 0.65, stagger: 0.1 }, 0.55)
    .to('.ap-equipe-titre', { x: 0, opacity: 1, duration: 0.8 }, 0.7)
    .to('.ap-membre', { y: 0, opacity: 1, duration: 1, stagger: 0.15 }, 0.8);
};

const cacher = () => {
  if (!pageRef.value) return;
  if (tl) tl.kill();

  tl = gsap.timeline({
    onComplete: () => {
      pageRef.value?.setAttribute('aria-hidden', 'true');
      gsap.set(pageRef.value, { autoAlpha: 0, pointerEvents: 'none' });
    }
  });
  tl.to(pageRef.value, { autoAlpha: 0, duration: 0.35, ease: 'power2.in' });
};

const fermer = () => emit('close');
const ouvrirMenu = () => emit('open-menu');

// ── Watch / Lifecycle ──────────────────────────────────────────
watch(() => props.ouvert, async (val) => {
  await nextTick();
  if (val) montrer(); else cacher();
}, { immediate: true });

onMounted(() => {
  gsap.set(pageRef.value, { autoAlpha: 0, pointerEvents: 'none' });
  if (props.ouvert) montrer();
  if (scrollRef.value) {
    scrollRef.value.addEventListener('scroll', surScrollAPropos, { passive: true });
  }
});

onBeforeUnmount(() => {
  if (tl) tl.kill();
  if (scrollRef.value) {
    scrollRef.value.removeEventListener('scroll', surScrollAPropos);
  }
});
</script>

<style scoped>
/* ══════════════════════════════════════════════════════
   ROOT — fond violet profond, position fixed scrollable
   ══════════════════════════════════════════════════════ */
.apropos-page {
  position: fixed;
  top: 0;
  scrollbar-width: none;
  left: 0;
  width: 100vw;
  height: 100vh;
  z-index: 9000;

  background-color: #000000;
  color: #fff;
  font-family: 'Poppins', sans-serif;
  opacity: 0;
  visibility: hidden;
  overflow: hidden;
}

.ap-scroll {
  height: 100%;
  overflow-y: auto;
  overflow-x: hidden;
  background: linear-gradient(180deg,
      #5E22CE 0%,
      #471AA5 15%,
      #1C0745 30%,
      #000000 55%,
      #000000 100%);
  background-attachment: local;
  /* Scrollbar discrète */
  scrollbar-width: thin;
  scrollbar-color: rgba(255, 255, 255, 0.18) transparent;
}

.ap-scroll::-webkit-scrollbar {
  width: 5px;
}

.ap-scroll::-webkit-scrollbar-thumb {
  background: rgba(255, 255, 255, 0.18);
  border-radius: 4px;
}

/* ══════════════════════════════════════════════════════
   HÉRO — 3 blocs côte à côte
   ══════════════════════════════════════════════════════ */
.ap-hero {
  position: relative;
  display: grid;
  grid-template-columns: 1fr minmax(260px, 32vw) 1fr;
  min-height: 70vh;
  align-items: center;
  overflow: hidden;
  padding-top: 8rem;
}

.ap-hero-bar {
  position: absolute;
  left: -5%;
  right: -5%;
  height: clamp(80px, 17vh, 109px);
  background: #000000;
  top: 62%;
  transform: translateY(-60%) rotate(-2.5deg);
  z-index: 1;
  pointer-events: none;
}

/* ── Gauche : "L'Agence" ── */
.ap-hero-gauche {
  position: relative;
  z-index: 2;
  display: flex;
  align-items: center;
  padding: 2rem 2rem 2rem 6vw;
}

.ap-hero-lagence {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  line-height: 0.9;
}

.ap-hero-l {
  font-family: 'Poppins', sans-serif;
  font-size: clamp(4rem, 4.5vw, 7.5rem);
  font-weight: 500;
  color: #fff;
  line-height: 0.85;
}

.ap-hero-agence {
  font-family: 'Poppins', sans-serif;
  font-size: clamp(3rem, 6.5vw, 8.5rem);
  font-weight: 400;
  color: #fff;
  line-height: 0.95;
  transform: rotate(-2.5deg);
  display: inline-block;
  transform-origin: left center;
  margin-top: -0.05em;
  white-space: nowrap;
}

/* ── Centre : GIF cyan ── */
.ap-hero-centre {
  position: relative;
  z-index: 2;
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: visible;
}

.ap-hero-gif {
  width: 100%;
  height: auto;
  margin-top: 7vh;
  aspect-ratio: 4 / 3;
  object-fit: cover;
  display: block;
  border: none;
}

/* ── Droite : slogan ── */
.ap-hero-droite {
  position: relative;
  z-index: 2;
  display: flex;
  align-items: center;
  padding: 2rem 6vw 2rem 3rem;
}

.ap-hero-slogan {
  display: flex;
  flex-direction: column;
  font-family: 'Poppins', sans-serif;
  font-size: clamp(2.6rem, 2.2vw, 2.8rem);
  color: #fff;
  line-height: 1.3;
}

.slogan-haut {
  display: block;
  font-weight: 300;
  color: #fff;
}

.slogan-milieu {
  display: flex;
  flex-direction: column;
  transform: rotate(-2.5deg);
  transform-origin: left center;
  font-weight: 600;
  font-style: italic;
  line-height: 1.1;
  margin: 0.1em 0;
  color: #fff;
}

.slogan-mot {
  display: block;
}

.slogan-bas {
  display: block;
  font-weight: 300;
  color: #fff;
}

/* ══════════════════════════════════════════════════════
   PRINCIPES
   ══════════════════════════════════════════════════════ */
.ap-principes {
  background: transparent;
  padding: 7rem 6vw 6rem;
}

.ap-principes-header {
  display: flex;
  justify-content: flex-end;
  margin-bottom: 5rem;
}

.ap-principes-titre {
  font-family: 'Poppins', sans-serif;
  font-size: clamp(2rem, 3vw, 3.6rem);
  font-weight: 300;
  line-height: 1.1;
  text-align: left;
  color: #fff;
  max-width: 41vw;
  width: 100%;
}

/* Grille 2 colonnes */
.ap-principes-grille {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 4rem 7vw;
  max-width: 1100px;
  margin: 0 auto;
}

.ap-principe-carte {
  display: flex;
  flex-direction: column;
  gap: 0.55rem;
}

.ap-principe-label {
  font-family: 'Poppins', sans-serif;
  font-size: 1rem;
  font-weight: 500;
  letter-spacing: 0.1em;
  color: rgb(255 255 255);
  text-transform: uppercase;
}

.ap-principe-nom {
  font-family: 'Poppins', sans-serif;
  font-size: clamp(2.2rem, 3.6vw, 4rem);
  font-weight: 400;
  line-height: 1;
  letter-spacing: -0.025em;
  color: #fff;
  margin-bottom: 0.5rem;
}

.ap-principe-texte {
  font-family: 'Poppins', sans-serif;
  font-size: clamp(0.8rem, 0.95vw, 1rem);
  font-weight: 300;
  line-height: 1.3;
  color: rgb(255 255 255);
}

/* ══════════════════════════════════════════════════════
   ÉQUIPE
   ══════════════════════════════════════════════════════ */
.ap-equipe {
  background: transparent;
  display: grid;
  grid-template-columns: 1fr 1.25fr;
  align-items: start;
  padding: 6rem 0 0 6vw;
  gap: 4rem;
}

/* "Notre équipe." — sticky sur le côté gauche */
.ap-equipe-gauche {
  position: sticky;
  top: 10rem;
}

.ap-equipe-titre {
  font-family: 'Space Grotesk', sans-serif;
  font-size: clamp(4rem, 6vw, 9rem);
  font-weight: 200;
  line-height: 0.9;
  margin-left: 1vw;
  color: #fff;
}

/* Cartes membres empilées à droite */
.ap-equipe-droite {
  display: flex;
  flex-direction: column;
}

.ap-membre {
  position: relative;
  overflow: hidden;
  height: 500px;
  background: #6633CC;
  border-bottom: 0.2px solid #ffffff82;
  padding: 2.5rem;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
}

.ap-membre-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  position: relative;
  z-index: 10;
  pointer-events: none;
}

.ap-membre-role {
  font-family: 'Space Grotesk', sans-serif;
  font-size: 0.85rem;
  font-weight: 500;
  letter-spacing: 0.08em;
  color: #fff;
  text-transform: uppercase;
}

.ap-membre-email {
  font-family: 'Space Grotesk', sans-serif;
  font-size: 0.85rem;
  font-weight: 400;
  color: rgba(255, 255, 255, 0.7);
}

/* Photo */
.ap-membre-photo-wrap {
  position: absolute;
  left: 50%;
  top: 50%;
  transform: translate(-50%, -50%);
  width: 50%;
  height: 60%;
  max-width: 320px;
  max-height: 360px;
  overflow: hidden;
  z-index: 1;
  transition: all 0.6s cubic-bezier(0.25, 0.8, 0.25, 1);
  display: flex;
  align-items: center;
  justify-content: center;
}

.ap-membre:hover .ap-membre-photo-wrap {
  left: 0;
  top: 0;
  transform: translate(0, 0);
  width: 100%;
  height: 100%;
  max-width: none;
  max-height: none;
}

.ap-membre-photo {
  width: 100%;
  height: 100%;
  object-fit: cover;
  object-position: center 15%;
  display: block;
  filter: grayscale(1);
  transform-origin: center 15%;
  will-change: transform, filter;

  transition: all 1s cubic-bezier(0.25, 0.8, 0.25, 1);
}

.ap-membre:hover .ap-membre-photo {
  transform: scale(1.05);
  filter: none;
}

.ap-membre-voile {
  position: absolute;
  inset: 0;
  background: rgba(0, 0, 0, 0.15);
  opacity: 0;
  transition: opacity 0.6s ease;
  z-index: 2;
}

.ap-membre:hover .ap-membre-voile {
  opacity: 1;
}

/* Nom */
.ap-membre-nom-bloc {
  position: absolute;
  left: 26%;
  bottom: 12%;
  transform: translateX(-50%);
  width: 50%;
  max-width: 320px;
  display: flex;
  flex-direction: column;
  z-index: 10;
  pointer-events: none;
}

.ap-membre-prenom {
  font-family: 'Poppins', sans-serif;
  font-size: clamp(1.6rem, 2.2vw, 3.8rem);
  font-weight: 300;
  line-height: 0.95;
  color: #fff;
}

.ap-membre-nom {
  font-family: 'Poppins', sans-serif;
  font-size: clamp(1.6rem, 2.2vw, 3.8rem);
  font-weight: 300;
  line-height: 0.95;
  text-transform: uppercase;
  color: #fff;
}

@media (max-width: 1024px) {
  .ap-entete {
    padding: 2rem 4vw 1.5rem;
    position: relative;
  }

  .ap-hero {
    grid-template-columns: 1fr;
    grid-template-rows: auto auto auto;
    min-height: unset;
    padding-top: 2rem;
  }

  .ap-hero-bar {
    display: none;
  }

  .ap-hero-gauche {
    padding: 3rem 4vw;
    justify-content: center;
    text-align: center;
  }

  .ap-hero-lagence {
    align-items: center;
  }

  .ap-hero-agence {
    transform: none;
  }

  .ap-hero-centre {
    min-height: 55vw;
  }

  .ap-hero-droite {
    padding: 3rem 4vw;
    justify-content: center;
    text-align: center;
  }

  .slogan-milieu {
    transform: none;
  }

  .ap-principes {
    padding: 5rem 4vw;
  }

  .ap-principes-header {
    justify-content: center;
  }

  .ap-principes-titre {
    text-align: center;
    max-width: 100%;
  }

  .ap-principes-grille {
    grid-template-columns: 1fr;
    gap: 3rem;
  }

  .ap-equipe {
    grid-template-columns: 1fr;
    padding: 4rem 4vw 6rem;
  }

  .ap-equipe-gauche {
    position: relative;
    top: auto;
  }

  .ap-equipe-titre {
    font-size: clamp(3.5rem, 10vw, 6rem);
  }

  .ap-membre {
    height: 480px;
    padding: 2rem;
  }

  .ap-membre-photo-wrap {
    width: 60%;
    height: 60%;
  }

  .ap-membre-nom-bloc {
    width: 60%;
    bottom: 10%;
  }
}

@media (max-width: 768px) {
  .ap-membre-photo-wrap {
    width: 80%;
    height: 65%;
  }

  .ap-membre-nom-bloc {
    width: 80%;
    bottom: 8%;
  }
}
</style>
