<template>
  <div class="conteneur-stats">
    <div class="stats-grille">
      <div 
        v-for="(stat, index) in statistiques" 
        :key="index" 
        class="stat-element"
      >
        <div class="stat-bloc-texte">
          <div class="stat-valeur texte-titre">
            <span class="prefixe" v-if="stat.prefixe">{{ stat.prefixe }}</span>
            <span class="nombre">{{ stat.valeurAffichee }}</span>
            <span class="suffixe" v-if="stat.suffixe">{{ stat.suffixe }}</span>
          </div>
          <div class="stat-label texte-majuscule">{{ t(stat.cleTranslation) }}</div>
        </div>
        <div 
          class="stat-separateur" 
          v-if="index < statistiques.length - 1"
        ></div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { t } from '../i18n/index';

gsap.registerPlugin(ScrollTrigger);

// Modélisation des données statistiques en français
const statistiques = ref([
  { 
    valeurCible: 150, 
    prefixe: "+", 
    suffixe: "", 
    cleTranslation: "stats.identites", 
    valeurAffichee: 0 
  },
  { 
    valeurCible: null, 
    prefixe: "", 
    suffixe: "", 
    cleTranslation: "stats.audio", 
    valeurAffichee: "24/7" 
  },
  { 
    valeurCible: 98, 
    prefixe: "", 
    suffixe: "%", 
    cleTranslation: "stats.satisfaits", 
    valeurAffichee: 0 
  },
  { 
    valeurCible: 12, 
    prefixe: "", 
    suffixe: "", 
    cleTranslation: "stats.pays", 
    valeurAffichee: 0 
  }
]);

const animerCompteurs = () => {
  statistiques.value.forEach((stat) => {
    if (stat.valeurCible !== null) {
      const cible = { valeur: 0 };
      
      gsap.to(cible, {
        valeur: stat.valeurCible,
        duration: 2.5,
        ease: "power3.out",
        onUpdate: () => {
          stat.valeurAffichee = Math.floor(cible.valeur);
        }
      });
    }
  });
  
  // Animation d'apparition de la section
  gsap.fromTo(".stat-element", {
    opacity: 0,
    y: 20
  }, {
    opacity: 1,
    y: 0,
    duration: 1.2,
    stagger: 0.15,
    ease: "power2.out"
  });
};

defineExpose({
  animer: animerCompteurs
});

onMounted(() => {
  // Masquer initialement les éléments
  gsap.set(".stat-element", { opacity: 0, y: 20 });
});
</script>

<style scoped>
.conteneur-stats {
  width: 100%;
  padding: 0 4% 3rem 4%;
  background: transparent;
  position: absolute;
  bottom: 0;
  left: 0;
  z-index: 5;
}

.stats-grille {
    display: flex;
    justify-content: center;
    align-items: center;
    max-width: 60%;
    margin: 0 auto;
    margin-bottom: 4vh;
    width: 100%;
}

.stat-element {
  display: flex;
  align-items: center;
  flex: 1;
  justify-content: space-between;
}

.stat-bloc-texte {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
}

.stat-valeur {
  font-size: 2.2rem;
  font-weight: 500;
  color: var(--couleur-texte);
  display: flex;
  align-items: center;
  justify-content: center;
  letter-spacing: -0.02em;
  line-height: 1.1;
  font-family: var(--police-titre);
  margin-bottom: 0.6rem;
}

.prefixe, .suffixe {
  color: var(--couleur-texte); 
  font-weight: 500;
}

.stat-label {
  font-size: 0.62rem;
  font-weight: 400;
  letter-spacing: 0.15em;
  color: rgb(255, 255, 255);
  text-transform: uppercase;
}

.stat-separateur {
  width: 1px;
  height: 40px;
  background-color: rgba(255, 255, 255, 0.4);
  display: block;
}

@media (max-width: 1024px) {
  .conteneur-stats {
    position: absolute !important;
    bottom: 0 !important;
    left: 0 !important;
    width: 100% !important;
    padding: 0 4% 1.5rem 4% !important;
  }
  
  .stats-grille {
    max-width: 90% !important;
    margin-bottom: 2vh !important;
  }
}

@media (max-width: 768px) {
  .stats-grille {
    flex-direction: row !important;
    justify-content: space-around !important;
    gap: 0.2rem !important;
    max-width: 80% !important;
    margin: 0 auto 1vh auto !important;
  }
  
  .stat-element {
    flex: 0 1 auto !important;
  }
  
  .stat-separateur {
    display: none !important;
  }
  
  .stat-valeur {
    font-size: 1.3rem !important;
    margin-bottom: 0.3rem !important;
  }
  
  .stat-label {
    font-size: 0.45rem !important;
    letter-spacing: 0.08em !important;
  }
}
</style>
