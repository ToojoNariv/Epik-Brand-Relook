<template>
  <div class="contact-page" ref="pageRef" aria-hidden="true">
    <!-- ─── HEADER ─────────────────────────────────────────── -->
    <HeaderEpik
      position="sticky"
      @logo-click="fermer"
      @expertises-click="fermer"
      @menu-click="ouvrirMenu"
    />

    <!-- ─── CONTENU PRINCIPAL ───────────────────────────────── -->
    <main class="contact-contenu" ref="contenuRef">
      <!-- Colonne Gauche : Titres -->
      <div class="contact-gauche">
        <div class="titres-wrap">
          <h1 class="contact-titre animate-item">{{ t('contact.title') }}</h1>
          <a href="hello@epik-brand.com" class="contact-email animate-item">hello@epik-brand.com</a>
        </div>
      </div>

      <!-- Colonne Droite : Infos & Formulaire -->
      <div class="contact-droite">
        <div class="contact-slogan-bloc animate-item">
          <p class="contact-slogan-texte" v-html="t('contact.slogan')"></p>
        </div>

        <div class="contact-formulaire-conteneur">
          <Transition name="fade-form" mode="out-in">
            <!-- Écran de Succès -->
            <div v-if="statutEnvoi === 'success'" class="contact-success-card">
              <div class="success-icon-wrap">
                <span class="success-icon">✓</span>
              </div>
              <h2 class="success-titre">{{ t('common.successMerci') }}</h2>
              <p class="success-texte">
                {{ t('contact.successText') }}
              </p>
              <button type="button" class="bouton-retour" @click="reinitialiserStatut">
                <span class="plus">+</span>
                <span class="texte">{{ t('contact.btnNouveau') }}</span>
                <span class="plus">+</span>
              </button>
            </div>

            <!-- Formulaire -->
            <form v-else @submit.prevent="envoyerFormulaire" class="contact-form" novalidate>
              <div style="display: none;" aria-hidden="true">
                <input type="checkbox" name="botcheck" v-model="form.botcheck" tabindex="-1" autocomplete="off" />
              </div>
              <div class="form-range animate-item">
                <div class="form-groupe" :class="{ 'a-erreur': erreurs.nom }">
                  <label for="nom">{{ t('contact.nom') }}</label>
                  <input
                    type="text"
                    id="nom"
                    v-model="form.nom"
                    @input="effacerErreur('nom')"
                    autocomplete="name"
                  />
                  <span class="message-erreur" v-if="erreurs.nom">{{ erreurs.nom }}</span>
                </div>

                <div class="form-groupe" :class="{ 'a-erreur': erreurs.prenom }">
                  <label for="prenom">{{ t('contact.prenom') }}</label>
                  <input
                    type="text"
                    id="prenom"
                    v-model="form.prenom"
                    @input="effacerErreur('prenom')"
                    autocomplete="additional-name"
                  />
                  <span class="message-erreur" v-if="erreurs.prenom">{{ erreurs.prenom }}</span>
                </div>
              </div>

              <div class="form-groupe animate-item" :class="{ 'a-erreur': erreurs.email }">
                <label for="email">{{ t('contact.email') }}</label>
                <input
                  type="email"
                  id="email"
                  v-model="form.email"
                  @input="effacerErreur('email')"
                  autocomplete="email"
                />
                <span class="message-erreur" v-if="erreurs.email">{{ erreurs.email }}</span>
              </div>

              <div class="form-groupe animate-item" :class="{ 'a-erreur': erreurs.message }">
                <label for="message">{{ t('contact.message') }}</label>
                <textarea
                  id="message"
                  v-model="form.message"
                  @input="effacerErreur('message')"
                  rows="1"
                  ref="textareaRef"
                  @input-textarea="ajusterHauteurTextarea"
                ></textarea>
                <span class="message-erreur" v-if="erreurs.message">{{ erreurs.message }}</span>
              </div>

              <div class="form-bouton-wrap animate-item">
                <button
                  type="submit"
                  class="bouton-envoyer"
                  :disabled="statutEnvoi === 'sending'"
                >
                  <span class="plus">+</span>
                  <span class="texte">{{ labelBouton }}</span>
                  <span class="plus">+</span>
                </button>
              </div>
            </form>
          </Transition>
        </div>
      </div>
    </main>
  </div>
</template>

<script setup>
import { ref, computed, watch, nextTick, onMounted, onBeforeUnmount } from 'vue';
import { gsap } from 'gsap';
import HeaderEpik from './HeaderEpik.vue';
import { playTypewriter } from '../services/audioService';
import { t } from '../i18n/index';
import { trackEvent } from '../services/analyticsService';

// ── Props & Emits ─────────────────────────────────────────────
const props = defineProps({
  ouvert: {
    type: Boolean,
    required: true
  }
});

const emit = defineEmits(['close', 'open-menu']);

// ── Refs DOM ──────────────────────────────────────────────────
const pageRef = ref(null);
const contenuRef = ref(null);
const textareaRef = ref(null);
let timelinePage = null;

// ── Formulaire & Validation ───────────────────────────────────
const form = ref({
  nom: '',
  prenom: '',
  email: '',
  message: '',
  botcheck: false
});

const erreurs = ref({
  nom: '',
  prenom: '',
  email: '',
  message: ''
});

const statutEnvoi = ref('idle'); // 'idle' | 'sending' | 'success'

const labelBouton = computed(() => {
  if (statutEnvoi.value === 'sending') return t('common.sending');
  return t('contact.btnEnvoyer');
});

const effacerErreur = (champ) => {
  erreurs.value[champ] = '';
  playTypewriter();
};

const validerFormulaire = () => {
  let estValide = true;
  
  if (!form.value.nom.trim()) {
    erreurs.value.nom = t('contact.nomRequis');
    estValide = false;
  }
  if (!form.value.prenom.trim()) {
    erreurs.value.prenom = t('contact.prenomRequis');
    estValide = false;
  }
  
  if (!form.value.email.trim()) {
    erreurs.value.email = t('contact.emailRequis');
    estValide = false;
  } else {
    const regexEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!regexEmail.test(form.value.email.trim())) {
      erreurs.value.email = t('contact.emailValide');
      estValide = false;
    }
  }
  
  if (!form.value.message.trim()) {
    erreurs.value.message = t('contact.messageRequis');
    estValide = false;
  }
  
  return estValide;
};

const envoyerFormulaire = async () => {
  if (!validerFormulaire()) return;
  
  // Anti-bot honeypot check
  if (form.value.botcheck) {
    // Silent success to trick bots
    statutEnvoi.value = 'success';
    form.value = {
      nom: '',
      prenom: '',
      email: '',
      message: '',
      botcheck: false
    };
    if (textareaRef.value) {
      textareaRef.value.style.height = 'auto';
    }
    return;
  }
  
  statutEnvoi.value = 'sending';
  
  // Capture local copy of form details for analytics tracking before reset
  const submittedData = {
    nom: form.value.nom,
    prenom: form.value.prenom,
    email: form.value.email,
    message: form.value.message
  };
  
  try {
    const response = await fetch('https://api.web3forms.com/submit', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      body: JSON.stringify({
        access_key: import.meta.env.VITE_WEB3FORMS_ACCESS_KEY,
        subject: `Nouveau message de contact - ${submittedData.prenom} ${submittedData.nom}`,
        from_name: `${submittedData.prenom} ${submittedData.nom}`,
        replyto: submittedData.email,
        botcheck: form.value.botcheck,
        "Nom Complet": `${submittedData.prenom} ${submittedData.nom}`,
        "Email de Contact": submittedData.email,
        "Message": submittedData.message
      })
    });

    const result = await response.json();

    if (response.ok && result.success) {
      // Track conversion event in Google Analytics
      trackEvent('contact_form_submit');

      statutEnvoi.value = 'success';
      // Réinitialisation du formulaire
      form.value = {
        nom: '',
        prenom: '',
        email: '',
        message: '',
        botcheck: false
      };
      if (textareaRef.value) {
        textareaRef.value.style.height = 'auto';
      }
    } else {
      throw new Error(result.message || 'Erreur lors du traitement Web3Forms.');
    }
  } catch (error) {
    console.error('Erreur d\'envoi:', error);
    alert(t('common.errorSubmit'));
    statutEnvoi.value = 'idle';
  }
};

const reinitialiserStatut = () => {
  statutEnvoi.value = 'idle';
  erreurs.value = { nom: '', prenom: '', email: '', message: '' };
};

const ajusterHauteurTextarea = () => {
  const el = textareaRef.value;
  if (!el) return;
  el.style.height = 'auto';
  el.style.height = el.scrollHeight + 'px';
};

// ── Fermer / Ouvrir le menu ──────────────────────────────────
const fermer = () => {
  emit('close');
};

const ouvrirMenu = () => {
  emit('open-menu');
};

// --- Clavier (Échap) ---
const handleKeyDown = (e) => {
  if (e.key === 'Escape' && props.ouvert) {
    fermer();
  }
};

// ── Animations GSAP ──────────────────────────────────────────
const animerEntree = () => {
  if (!pageRef.value) return;
  if (timelinePage) timelinePage.kill();
  
  pageRef.value.setAttribute('aria-hidden', 'false');
  gsap.set(pageRef.value, { autoAlpha: 1, pointerEvents: 'auto' });
  
  // Reset scroll
  pageRef.value.scrollTop = 0;
  
  // États initiaux des éléments internes
  gsap.set('.logo-image', { opacity: 0, y: -20 });
  gsap.set('.lien-nav', { opacity: 0, y: -20 });
  gsap.set('.controle-musique', { opacity: 0, y: -20 });
  gsap.set('.contact-gauche .animate-item', { opacity: 0, x: -60 });
  gsap.set('.contact-droite .animate-item', { opacity: 0, y: 40 });
  
  timelinePage = gsap.timeline({ defaults: { ease: 'power3.out' } });
  
  timelinePage
    // Révéler le fond et l'entête
    .to('.logo-image', { opacity: 1, y: 0, duration: 0.65 }, 0.1)
    .to('.lien-nav', { opacity: 1, y: 0, duration: 0.65, stagger: 0.08 }, 0.15)
    .to('.controle-musique', { opacity: 1, y: 0, duration: 0.65 }, 0.2)
    // Révéler les titres à gauche
    .to('.contact-gauche .animate-item', { opacity: 1, x: 0, duration: 0.9, stagger: 0.12 }, 0.25)
    // Révéler les formulaires et slogans à droite
    .to('.contact-droite .animate-item', { opacity: 1, y: 0, duration: 0.85, stagger: 0.1 }, 0.3);
};

const animerSortie = () => {
  if (!pageRef.value) return;
  if (timelinePage) timelinePage.kill();
  
  timelinePage = gsap.timeline({
    onComplete: () => {
      if (pageRef.value) {
        pageRef.value.setAttribute('aria-hidden', 'true');
        gsap.set(pageRef.value, { autoAlpha: 0, pointerEvents: 'none' });
      }
    }
  });
  
  timelinePage.to(pageRef.value, {
    autoAlpha: 0,
    duration: 0.4,
    ease: 'power2.inOut'
  });
};

// ── Watcher & Hooks ──────────────────────────────────────────
watch(() => props.ouvert, async (val) => {
  await nextTick();
  if (val) {
    window.addEventListener('keydown', handleKeyDown);
    animerEntree();
  } else {
    window.removeEventListener('keydown', handleKeyDown);
    animerSortie();
  }
}, { immediate: true });

onMounted(() => {
  gsap.set(pageRef.value, { autoAlpha: 0, pointerEvents: 'none' });
  if (props.ouvert) {
    window.addEventListener('keydown', handleKeyDown);
    animerEntree();
  }
});

onBeforeUnmount(() => {
  window.removeEventListener('keydown', handleKeyDown);
  if (timelinePage) timelinePage.kill();
});
</script>

<style scoped>
/* ─── CADRE DE PAGE ────────────────────────────────────────── */
.contact-page {
  position: fixed;
  inset: 0;
  width: 100vw;
  height: 100vh;
  height: calc(var(--vh, 1vh) * 100);
  height: 100dvh;
  z-index: 9000;
  overflow-y: auto;
  overflow-x: hidden;
  background-image: url('https://ik.imagekit.io/h5zy3jui5/Contact/Contact%20Background.jpg?updatedAt=1781289122652');
  background-size: cover;
  background-position: center;
  background-repeat: no-repeat;
  color: #fff;
  font-family: 'Poppins', sans-serif;
  opacity: 0;
  visibility: hidden;
  pointer-events: none;
}



/* ─── CONTENU DE LA PAGE ────────────────────────────────────── */
.contact-contenu {
  display: grid;
  grid-template-columns: 0.7fr 1.1fr;
  width: min(1740px, calc(100vw - 14rem));
  margin: 3.5rem auto 4rem;
  padding-bottom: 2rem;
  align-items: start;
}

/* ── Colonne Gauche (Info) ── */
.contact-gauche {
    display: flex;
    flex-direction: column;
    justify-content: flex-start;
    min-height: 50vh;

}

.contact-titre {
    font-family: 'Poppins', sans-serif;
    font-size: clamp(3rem, 3vw, 6rem);
    font-weight: 300;
    line-height: 1.1;
    color: #fff;
    margin: 0 0 1rem;
    letter-spacing: -0.01em;
}

.contact-email {
display: inline-block;
    font-size: clamp(1.4rem, 1vw, 2.8rem);
    font-weight: 300;
    color: rgb(255 255 255);
    text-decoration: none;
    transition: color 0.3s ease, transform 0.3s ease;
    transform-origin: left center;
}

.contact-email:hover {
  color: #0096e7;
  transform: scale(1.02);
}

/* ── Colonne Droite (Formulaire) ── */
.contact-droite {
  display: flex;
  flex-direction: column;
  gap: clamp(2rem, 2.5vw, 4.5rem);
}

.contact-slogan-bloc {
  align-self: flex-end;
  text-align: right;
}

.contact-slogan-texte {
  font-family: 'Poppins', sans-serif;
  font-size: clamp(1.05rem, 1.35vw, 1.6rem);
  font-weight: 300;
  line-height: 1.2;
  color: rgba(255, 255, 255, 0.82);
  margin: 0;
}

.contact-formulaire-conteneur {
  position: relative;
  width: 100%;
}

/* Formulaire Elements */
.contact-form {
    display: flex;
    flex-direction: column;
    gap: 1rem;
    width: 100%;
}

.form-range {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: clamp(1.5rem, 2.5vw, 3rem);
}

.form-groupe {
  display: flex;
  flex-direction: column;
  position: relative;
  width: 100%;
}

.form-groupe label {
  font-family: 'Poppins', sans-serif;
  font-size: 0.8rem;
  font-weight: 500;
  letter-spacing: 0.08em;
  color: rgba(255, 255, 255, 0.62);
  transition: color 0.3s ease;
}

.form-groupe input,
.form-groupe textarea {
  background: transparent;
  border: none;
  border-bottom: 1px solid rgba(255, 255, 255, 0.42);
  color: #fff;
  font-family: 'Poppins', sans-serif;
  font-size: 1.15rem;
  font-weight: 300;
  padding: 0.5rem 0;
  outline: none;
  transition: border-bottom-color 0.3s ease;
  width: 100%;
}

.form-groupe textarea {
  resize: none;
  min-height: 38px;
  overflow-y: hidden;
}

.form-groupe input:focus,
.form-groupe textarea:focus {
  border-bottom-color: #0096e7;
}

.form-groupe input:focus + label,
.form-groupe textarea:focus + label {
  color: #0096e7;
}

/* Erreurs de validation */
.form-groupe.a-erreur input,
.form-groupe.a-erreur textarea {
  border-bottom-color: #ff3b30;
}

.form-groupe.a-erreur label {
  color: #ff3b30;
}

.message-erreur {
  font-size: 0.75rem;
  color: #ff3b30;
  position: absolute;
  bottom: -1.2rem;
  left: 0;
  font-weight: 400;
}

/* Bouton Envoyer */
.form-bouton-wrap {
  margin-top: 1rem;
}

.bouton-envoyer {
  background: linear-gradient(to right, #0096E7, #0072B1);
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
  border: none;
  cursor: pointer;
}

.bouton-envoyer:hover:not(:disabled) {
  background: linear-gradient(to right, #009cf0, #0081c7);
  box-shadow: 0 6px 25px rgba(0, 130, 200, 0.5);
}

.bouton-envoyer:disabled {
  opacity: 0.7;
  cursor: not-allowed;
}

.bouton-envoyer .plus {
  font-weight: 400;
  font-size: 1.5rem;
  display: inline-block;
  transition: transform 0.5s cubic-bezier(0.16, 1, 0.3, 1);
}

.bouton-envoyer:hover .plus:first-child {
  transform: rotate(180deg);
}

.bouton-envoyer:hover .plus:last-child {
  transform: rotate(-180deg);
}

/* ÉCRAN DE SUCCÈS */
.contact-success-card {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  padding: 3rem;
  background: rgba(255, 255, 255, 0.04);
  backdrop-filter: blur(12px);
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 4px;
  width: 100%;
}

.success-icon-wrap {
  width: 64px;
  height: 64px;
  border-radius: 50%;
  background-color: rgba(0, 150, 231, 0.15);
  border: 2px solid #0096e7;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 2rem;
}

.success-icon {
  color: #0096e7;
  font-size: 2.2rem;
  font-weight: bold;
  line-height: 1;
}

.success-titre {
  font-family: 'Poppins', sans-serif;
  font-size: 2.5rem;
  font-weight: 400;
  margin: 0 0 1rem;
  color: #fff;
}

.success-texte {
  font-family: 'Poppins', sans-serif;
  font-size: 1.15rem;
  font-weight: 300;
  line-height: 1.5;
  color: rgba(255, 255, 255, 0.8);
  margin: 0 0 2.5rem;
}

.bouton-retour {
  width: min(255px, 85%);
  min-height: 52px;
  padding: 0 1.5rem;
  display: flex;
  align-items: center;
  justify-content: space-between;
  background-color: transparent;
  color: #fff;
  border: 1px solid rgba(255, 255, 255, 0.3);
  font-family: 'Poppins', sans-serif;
  font-size: 1.05rem;
  font-weight: 400;
  cursor: pointer;
  transition: transform 0.25s ease, background-color 0.25s ease, border-color 0.25s ease;
}

.bouton-retour:hover {
  transform: translateY(-2px);
  background-color: rgba(255, 255, 255, 0.08);
  border-color: #fff;
}

.bouton-retour .plus {
  font-size: 1.35rem;
  line-height: 1;
}

/* ─── TRANSITIONS VUE ──────────────────────────────────────── */
.fade-form-enter-active,
.fade-form-leave-active {
  transition: opacity 0.4s ease, transform 0.4s ease;
}

.fade-form-enter-from {
  opacity: 0;
  transform: scale(0.96) translateY(10px);
}

.fade-form-leave-to {
  opacity: 0;
  transform: scale(0.96) translateY(-10px);
}

/* ─── RESPONSIVE DESIGN ────────────────────────────────────── */
@media (max-width: 1280px) {


  .contact-contenu {
    width: calc(100vw - 8rem);
    margin-top: 2rem;
  }
}

@media (max-width: 1024px) {
  .contact-contenu {
    grid-template-columns: 1fr;
    gap: 3.5rem;
    width: calc(100vw - 4rem);
    margin-top: 1rem;
  }

  .contact-gauche {
    min-height: auto;
    text-align: center;
  }

  .contact-email {
    transform-origin: center center;
  }

  .contact-slogan-bloc {
    align-self: center;
    text-align: center;
  }

  .form-range {
    grid-template-columns: 1fr;
    gap: 2.2rem;
  }

  .bouton-envoyer,
  .bouton-retour {
    width: 100%;
    max-width: 320px;
    margin: 0 auto;
    justify-content: space-between;
  }

  .form-bouton-wrap {
    display: flex;
    justify-content: center;
  }

  .contact-success-card {
    align-items: center;
    text-align: center;
    padding: 2.5rem 1.5rem;
  }
}

@media (max-width: 768px) {


  .contact-contenu {
    width: calc(100vw - 2.5rem);
    margin-top: 1rem;
    margin-bottom: 2.5rem;
    padding-bottom: calc(2rem + env(safe-area-inset-bottom, 0px)) !important;
  }

  .contact-titre {
    font-size: clamp(2.5rem, 8vw, 3.8rem);
  }

  .contact-form {
    gap: 1.8rem;
  }

  .form-groupe input,
  .form-groupe textarea {
    font-size: 1.05rem;
  }
}
</style>
