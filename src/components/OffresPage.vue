<template>
  <div class="offres-page" ref="pageRef" aria-hidden="true">
    <HeaderEpik
      position="sticky"
      :gradient="true"
      @logo-click="fermer"
      @expertises-click="fermer"
      @menu-click="ouvrirMenu"
    />

    <main class="offres-contenu" ref="contenuRef">
      <article
        v-for="offre in offres"
        :key="offre.id"
        class="offre-carte"
      >
        <div class="offre-image-cadre">
          <img :src="offre.image" :alt="offre.titre" class="offre-image" />
          <div class="offre-image-voile"></div>
          <h2 class="offre-titre">{{ offre.titre }}</h2>
        </div>
        <p class="offre-signature" :style="{ '--taille-signature': offre.tailleSignature }">
          {{ offre.signature }}
        </p>

        <ul class="offre-details">
          <li v-for="detail in offre.details" :key="detail">
            <span>{{ detail }}</span>
            <span class="offre-check" aria-hidden="true"></span>
          </li>
        </ul>

        <p class="offre-prix">{{ offre.prix }}</p>

        <button type="button" class="offre-reserver" @click="ouvrirReservation(offre)">
          <span aria-hidden="true">+</span>
          <span>{{ t('offres.btnReserver') }}</span>
          <span aria-hidden="true">+</span>
        </button>
      </article>
    </main>

    <!-- Modal de Réservation (Composant Externe) -->
    <ModalReservation
      :ouvert="modalOuvert"
      :offre="offreSelectionnee"
      @close="modalOuvert = false"
    />
  </div>
</template>

<script setup>
import { nextTick, onBeforeUnmount, onMounted, ref, watch, computed } from 'vue';
import { gsap } from 'gsap';
import HeaderEpik from './HeaderEpik.vue';
import ModalReservation from './ModalReservation.vue';
import { playDefaultClick } from '../services/audioService';
import { t } from '../i18n/index';

const props = defineProps({
  ouvert: {
    type: Boolean,
    required: true
  }
});

const emit = defineEmits(['close', 'open-menu']);

const pageRef = ref(null);
const contenuRef = ref(null);
let timelineOffres = null;

// ── Booking Modal Controls ────────────────────────────────────
const modalOuvert = ref(false);
const offreSelectionnee = ref(null);

const ouvrirReservation = (offre) => {
  playDefaultClick();
  offreSelectionnee.value = offre;
  modalOuvert.value = true;
};

const offres = computed(() => [
  {
    id: 'design',
    titre: t('offres.design'),
    signature: 'BIG BRAND',
    tailleSignature: 'clamp(1.7rem, 2.5vw, 3.25rem)',
    image: 'https://ik.imagekit.io/h5zy3jui5/Home%20photo/design.jpg?updatedAt=1781289704998',
    details: t('offres.details.design'),
    prix: '799.000 Ar'
  },
  {
    id: 'video',
    titre: t('offres.video'),
    signature: 'STORY BRAND',
    tailleSignature: 'clamp(2rem, 2.5vw, 3.25rem)',
    image: 'https://ik.imagekit.io/h5zy3jui5/Home%20photo/windows-w79mIrYKcK4-unsplash.jpg',
    details: t('offres.details.video'),
    prix: '1.199.000 Ar'
  },
  {
    id: 'photo',
    titre: t('offres.photo'),
    signature: 'SPOT LIGHT',
    tailleSignature: 'clamp(2.25rem, 2.5vw, 3rem)',
    image: 'https://ik.imagekit.io/h5zy3jui5/Home%20photo/Photographie%20Background.jpg?updatedAt=1781288609519',
    details: t('offres.details.photo'),
    prix: '799.000 Ar'
  },
  {
    id: 'web',
    titre: t('offres.web'),
    signature: 'WEBOFLY',
    tailleSignature: 'clamp(2.2rem, 2.7vw, 3.65rem)',
    image: 'https://ik.imagekit.io/h5zy3jui5/Home%20photo/Web%20Background.jpg?updatedAt=1781274741057',
    details: t('offres.details.web'),
    prix: '1.999.000 Ar'
  }
]);

const montrer = () => {
  if (!pageRef.value || !contenuRef.value) return;

  if (timelineOffres) timelineOffres.kill();

  pageRef.value.setAttribute('aria-hidden', 'false');
  gsap.set(pageRef.value, { autoAlpha: 1, pointerEvents: 'auto' });
  gsap.set(contenuRef.value, { y: 90, opacity: 0 });
  gsap.set('.offre-carte', { y: 70, opacity: 0 });

  timelineOffres = gsap.timeline();
  timelineOffres
    .to(contenuRef.value, {
      y: 0,
      opacity: 1,
      duration: 0.9,
      ease: 'power3.out'
    })
    .to('.offre-carte', {
      y: 0,
      opacity: 1,
      duration: 0.75,
      stagger: 0.08,
      ease: 'power3.out'
    }, '-=0.62');
};

const cacher = () => {
  if (!pageRef.value || !contenuRef.value) return;

  if (timelineOffres) timelineOffres.kill();

  timelineOffres = gsap.timeline({
    onComplete: () => {
      if (!pageRef.value) return;
      pageRef.value.setAttribute('aria-hidden', 'true');
      gsap.set(pageRef.value, { autoAlpha: 0, pointerEvents: 'none' });
    }
  });

  timelineOffres
    .to(contenuRef.value, {
      y: 60,
      opacity: 0,
      duration: 0.45,
      ease: 'power2.in'
    })
    .to(pageRef.value, {
      autoAlpha: 0,
      duration: 0.2,
      ease: 'power2.in'
    }, '-=0.1');
};

const fermer = () => {
  emit('close');
};

const ouvrirMenu = () => {
  emit('open-menu');
};

watch(() => props.ouvert, async (val) => {
  await nextTick();
  if (val) {
    montrer();
  } else {
    cacher();
  }
}, { immediate: true });

onMounted(() => {
  gsap.set(pageRef.value, { autoAlpha: 0, pointerEvents: 'none' });
  gsap.set(contenuRef.value, { y: 90, opacity: 0 });

  if (props.ouvert) {
    montrer();
  }
});

onBeforeUnmount(() => {
  if (timelineOffres) timelineOffres.kill();
});
</script>

<style scoped>
.offres-page {
  position: fixed;
  inset: 0;
  z-index: 9000;
  min-height: 100vh;
  min-height: 100dvh;
  overflow-y: auto;
  background: #000;
  color: #fff;
  font-family: 'Poppins', sans-serif;
  opacity: 0;
  visibility: hidden;
  pointer-events: none;
}

@media (min-width: 1025px) {
  .offres-page {
    overflow-y: hidden;
    display: flex;
    flex-direction: column;
    height: 100vh;
    height: 100dvh;
  }
  .offres-contenu {
    margin: auto auto !important;
    padding-bottom: 0 !important;
  }
}

.offres-contenu {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: clamp(1.4rem, 2vw, 2.8rem);
  width: min(1740px, calc(100vw - 15rem));
  margin: 1.5rem auto 4rem;
  padding-bottom: 2rem;
}

.offre-carte {
  min-width: 0;
}

.offre-image-cadre {
  position: relative;
  height: clamp(92px, 7.6vw, 125px);
  overflow: hidden;
  background: #111;
}

.offre-image {
  width: 100%;
  height: 100%;
  display: block;
  object-fit: cover;
  position: relative;
  z-index: 0;
}

.offre-image-voile {
  position: absolute;
  inset: 0;
  background: rgba(0, 0, 0, 0.22);
  z-index: 1;
}

.offre-titre {
  position: absolute;
  left: 50%;
  top: 42%;
  transform: translate(-50%, -50%);
  width: 92%;
  color: #fff;
  z-index: 2;
  font-family: 'Space Grotesk', sans-serif;
  font-size: clamp(1.35rem, 1.7vw, 1.95rem);
  font-weight: 500;
  line-height: 1;
  text-align: center;
  letter-spacing: 0;
}

.offre-signature {
  position: relative;
  z-index: 5;
  width: 116%;
  margin: -0.33em 0 0 50%;
  transform: translateX(-50%);
  color: #fff;
  font-family: 'Advent Pro', sans-serif;
  font-size: var(--taille-signature, clamp(2rem, 2.9vw, 3.35rem));
  font-weight: 300;
  line-height: 0.72;
  text-align: center;
  white-space: nowrap;
  pointer-events: none;
}

.offre-details {
  list-style: none;
  margin-top: clamp(1.65rem, 2.25vw, 2.75rem);
  margin-bottom: 0;
}

.offre-details li {
  padding-inline: 1vw;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
  min-height: 2.05rem;
  border-bottom: 1px solid rgba(255, 255, 255, 0.42);
  color: rgba(255, 255, 255, 0.92);
  font-family: 'Poppins', sans-serif;
  font-size: clamp(1rem, 1.18vw, 1.35rem);
  font-weight: 400;
  line-height: 1.15;
}

.offre-check {
  width: 0.72rem;
  height: 1.22rem;
  margin-right: 0.2rem;
  border-right: 2px solid #0096e7;
  border-bottom: 2px solid #0096e7;
  transform: rotate(38deg) translateY(-0.12rem);
  flex: 0 0 auto;
}

.offre-prix {
  margin: clamp(4rem, 2.8vw, 4rem) 0 1.25rem;
  color: rgba(255, 255, 255, 0.92);
  font-family: 'Poppins', sans-serif;
  font-size: clamp(1.35rem, 1.6vw, 1.85rem);
  font-weight: 400;
  line-height: 1;
  text-align: center;
}

.offre-reserver {
  position: relative; /* Nécessaire pour positionner le dégradé en arrière-plan */
  z-index: 1; /* Crée un contexte d'empilement pour le texte */
  width: min(255px, 82%);
  min-height: 52px;
  margin: 0 auto;
  padding: 0 1.35rem;
  display: flex;
  align-items: center;
  justify-content: space-between;
  background-color: #fff; /* Fond de base */
  color: #050505;
  font-family: 'Poppins', sans-serif;
  font-size: 1.08rem;
  font-weight: 400;
  transition: color 0.3s ease; /* On anime fluidement la couleur du texte */
  overflow: hidden; /* Recommandé si tu ajoutes un border-radius plus tard */
}

/* Le calque invisible qui contient ton dégradé */
.offre-reserver::before {
  content: "";
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: linear-gradient(to right, #0096E7, #0072B1);
  opacity: 0; /* Invisible par défaut */
  z-index: -1; /* Reste derrière le texte pour qu'il reste lisible/cliquable */
  transition: opacity 0.3s ease; /* On anime l'apparition du dégradé */
}

/* Au survol */
.offre-reserver:hover {
  color: #fff; /* Le texte passe au blanc en 0.3s */
}

.offre-reserver:hover::before {
  opacity: 1; /* Le dégradé apparaît en fondu en 0.3s */
}

.offre-reserver span:first-child,
.offre-reserver span:last-child {
  font-size: 1.35rem;
  font-weight: 400;
  line-height: 1;
}

@media (max-width: 1024px) {
  .offres-entete {
    padding: 2rem 2rem 1rem;
  }

  .offres-contenu {
    grid-template-columns: repeat(2, minmax(0, 1fr));
    width: min(960px, calc(100vw - 4rem));
    gap: 3rem 2rem;
  }
}

@media (max-width: 768px) {


  .offres-contenu {
    grid-template-columns: 1fr;
    margin-top: 1rem;
    gap: 3rem;
  }

  .offre-image-cadre {
    height: 112px;
  }

  .offre-details {
    margin-top: 2rem;
  }

  .offre-reserver {
    width: min(260px, 84%);
  }
}
</style>
