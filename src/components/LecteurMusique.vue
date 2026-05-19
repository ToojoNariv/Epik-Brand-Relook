<template>
  <button 
    @click="basculerMusique" 
    class="bouton-musique"
    :class="{ 'actif': estEnLecture }"
    aria-label="Contrôle de la musique d'ambiance"
  >
    Musique — {{ estEnLecture ? 'On' : 'Off' }}
  </button>
</template>

<script setup>
import { ref, onBeforeUnmount } from 'vue';

const estEnLecture = ref(false);
let contexteAudio = null;
let oscillateurs = [];
let gainGeneral = null;
let filtreNode = null;
let lfoNode = null;

// Créer le synthétiseur d'ambiance cinématique (Fmaj9 chord)
const initialiserSynthese = () => {
  contexteAudio = new (window.AudioContext || window.webkitAudioContext)();
  
  // Nœud de gain général avec fondu d'attaque
  gainGeneral = contexteAudio.createGain();
  gainGeneral.gain.setValueAtTime(0, contexteAudio.currentTime);
  
  // Filtre passe-bas pour un son feutré et profond
  filtreNode = contexteAudio.createBiquadFilter();
  filtreNode.type = 'lowpass';
  filtreNode.frequency.setValueAtTime(450, contexteAudio.currentTime);
  filtreNode.Q.setValueAtTime(1, contexteAudio.currentTime);
  
  // Connexion du circuit audio
  filtreNode.connect(gainGeneral);
  gainGeneral.connect(contexteAudio.destination);
  
  // Accord de Fa majeur 9 (Fa2, Do3, Fa3, La3, Do4, Mi4, Sol4)
  const frequencesAccord = [87.31, 130.81, 174.61, 220.00, 261.63, 329.63, 392.00];
  
  frequencesAccord.forEach((freq, index) => {
    const osc = contexteAudio.createOscillator();
    const gainOsc = contexteAudio.createGain();
    
    // Mélange d'ondes sinus et triangle pour un timbre riche et doux
    osc.type = index % 2 === 0 ? 'sine' : 'triangle';
    osc.frequency.setValueAtTime(freq, contexteAudio.currentTime);
    
    // Légère désaccords aléatoires pour créer un effet chorégraphique spatial (detune)
    osc.detune.setValueAtTime((Math.random() - 0.5) * 8, contexteAudio.currentTime);
    
    // Le volume de chaque note est plus faible pour les hautes fréquences
    const volNote = 0.12 / (index + 1);
    gainOsc.gain.setValueAtTime(volNote, contexteAudio.currentTime);
    
    osc.connect(gainOsc);
    gainOsc.connect(filtreNode);
    osc.start();
    
    // Conserver la référence pour l'arrêt
    oscillateurs.push(osc);
  });
  
  // LFO (Low-Frequency Oscillator) pour moduler lentement la fréquence de coupure du filtre
  // et donner une impression de respiration à la nappe sonore
  lfoNode = contexteAudio.createOscillator();
  const gainLfo = contexteAudio.createGain();
  
  lfoNode.type = 'sine';
  lfoNode.frequency.setValueAtTime(0.08, contexteAudio.currentTime); // Fréquence ultra-lente de 0.08Hz
  gainLfo.gain.setValueAtTime(150, contexteAudio.currentTime); // Profondeur de modulation du filtre (150Hz)
  
  lfoNode.connect(gainLfo);
  gainLfo.connect(filtreNode.frequency);
  lfoNode.start();
};

const demarrerSynthese = () => {
  if (!contexteAudio) {
    initialiserSynthese();
  }
  
  if (contexteAudio.state === 'suspended') {
    contexteAudio.resume();
  }
  
  // Fondu d'entrée très doux sur 3.5 secondes pour une transition fluide
  const t = contexteAudio.currentTime;
  gainGeneral.gain.cancelScheduledValues(t);
  gainGeneral.gain.setValueAtTime(gainGeneral.gain.value, t);
  gainGeneral.gain.linearRampToValueAtTime(0.65, t + 3.5);
};

const arreterSynthese = () => {
  if (contexteAudio && gainGeneral) {
    // Fondu de sortie sur 1.5 seconde pour éviter les coupures sèches
    const t = contexteAudio.currentTime;
    gainGeneral.gain.cancelScheduledValues(t);
    gainGeneral.gain.setValueAtTime(gainGeneral.gain.value, t);
    gainGeneral.gain.linearRampToValueAtTime(0, t + 1.5);
    
    // Suspendre le contexte après le fondu
    setTimeout(() => {
      if (!estEnLecture.value && contexteAudio) {
        contexteAudio.suspend();
      }
    }, 1600);
  }
};

const basculerMusique = () => {
  estEnLecture.value = !estEnLecture.value;
  if (estEnLecture.value) {
    demarrerSynthese();
  } else {
    arreterSynthese();
  }
};

// Nettoyage lors de la destruction du composant
onBeforeUnmount(() => {
  if (contexteAudio) {
    oscillateurs.forEach(osc => {
      try { osc.stop(); } catch (e) {}
    });
    if (lfoNode) {
      try { lfoNode.stop(); } catch (e) {}
    }
    contexteAudio.close();
  }
});
</script>

<style scoped>
.bouton-musique {
  font-size: 1.2rem;
  font-weight: 400;
  color: var(--couleur-texte);
  opacity: 0.5;
  transition: opacity 0.3s ease;
  z-index: 100;
  padding: 0.5rem 0;
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
</style>
