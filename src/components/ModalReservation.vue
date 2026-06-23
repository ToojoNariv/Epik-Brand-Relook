<template>
  <Transition name="fade-modal">
    <div v-if="ouvert" class="reservation-modal-overlay" @click.self="fermer">
      <div class="reservation-modal-carte" role="dialog" aria-modal="true" aria-labelledby="modal-titre">
        <button type="button" class="bouton-fermer-modal" @click="fermer" aria-label="Fermer">
          ✕
        </button>
        
        <!-- Left Side: Title and Intro -->
        <div class="modal-gauche">
          <h2 id="modal-titre" class="modal-titre">
            {{ t('modal.title') }} {{ offre?.titre }}
          </h2>
          <p class="modal-description-intro">
            {{ t('modal.descriptionIntro') }}
          </p>
        </div>

        <!-- Right Side: Form Content -->
        <div class="modal-droite">
          <Transition name="fade-form" mode="out-in">
            <!-- Success Screen -->
            <div v-if="statutEnvoi === 'success'" class="reservation-success-card">
              <div class="success-icon-wrap">
                <span class="success-icon">✓</span>
              </div>
              <h2 class="success-titre">{{ t('common.successDemande') }}</h2>
              <p class="success-texte">
                {{ t('modal.successText') }}
              </p>
              <button type="button" class="bouton-retour-success" @click="fermer">
                <span class="plus plus-gauche">+</span>
                <span class="texte">{{ t('common.close') }}</span>
                <span class="plus plus-droit">+</span>
              </button>
            </div>

            <!-- Form Fields -->
            <form v-else @submit.prevent="envoyerReservation" class="reservation-form" novalidate>
              <div style="display: none;" aria-hidden="true">
                <input type="checkbox" name="botcheck" v-model="form.botcheck" tabindex="-1" autocomplete="off" />
              </div>
              <div class="form-range">
                <div class="form-groupe" :class="{ 'a-erreur': erreurs.nomClient }">
                  <label for="modal-nom">{{ t('modal.nom') }}</label>
                  <input
                    type="text"
                    id="modal-nom"
                    v-model="form.nomClient"
                    @input="effacerErreur('nomClient')"
                    autocomplete="name"
                  />
                  <span class="message-erreur" v-if="erreurs.nomClient">{{ erreurs.nomClient }}</span>
                </div>

                <div class="form-groupe" :class="{ 'a-erreur': erreurs.email }">
                  <label for="modal-email">{{ t('modal.email') }}</label>
                  <input
                    type="email"
                    id="modal-email"
                    v-model="form.email"
                    @input="effacerErreur('email')"
                    autocomplete="email"
                  />
                  <span class="message-erreur" v-if="erreurs.email">{{ erreurs.email }}</span>
                </div>
              </div>

              <div class="form-range">
                <div class="form-groupe" :class="{ 'a-erreur': erreurs.telephone }">
                  <label for="modal-telephone">{{ t('modal.tel') }}</label>
                  <input
                    type="tel"
                    id="modal-telephone"
                    v-model="form.telephone"
                    @input="effacerErreur('telephone')"
                    autocomplete="tel"
                  />
                  <span class="message-erreur" v-if="erreurs.telephone">{{ erreurs.telephone }}</span>
                </div>

                <div class="form-groupe" :class="{ 'a-erreur': erreurs.whatsapp }">
                  <label for="modal-whatsapp">{{ t('modal.whatsapp') }}</label>
                  <input
                    type="text"
                    id="modal-whatsapp"
                    v-model="form.whatsapp"
                    @input="effacerErreur('whatsapp')"
                  />
                  <span class="message-erreur" v-if="erreurs.whatsapp">{{ erreurs.whatsapp }}</span>
                </div>
              </div>

              <div class="form-groupe" :class="{ 'a-erreur': erreurs.nomProjet }">
                <label for="modal-nom-projet">{{ t('modal.nomProjet') }}</label>
                <input
                  type="text"
                  id="modal-nom-projet"
                  v-model="form.nomProjet"
                  @input="effacerErreur('nomProjet')"
                />
                <span class="message-erreur" v-if="erreurs.nomProjet">{{ erreurs.nomProjet }}</span>
              </div>

              <div class="form-groupe" :class="{ 'a-erreur': erreurs.description }">
                <label for="modal-description">{{ t('modal.description') }}</label>
                <textarea
                  id="modal-description"
                  v-model="form.description"
                  @input="effacerErreur('description')"
                  rows="3"
                ></textarea>
                <span class="message-erreur" v-if="erreurs.description">{{ erreurs.description }}</span>
              </div>

              <div class="form-bouton-wrap">
                <button
                  type="submit"
                  class="bouton-envoyer-modal"
                  :disabled="statutEnvoi === 'sending'"
                >
                  <span class="plus plus-gauche">+</span>
                  <span class="texte">{{ labelBouton }}</span>
                  <span class="plus plus-droit">+</span>
                </button>
              </div>
            </form>
          </Transition>
        </div>
      </div>
    </div>
  </Transition>
</template>

<script setup>
import { ref, computed, watch } from 'vue';
import { playDefaultClick, playTypewriter } from '../services/audioService';
import { t } from '../i18n/index';
import { trackEvent } from '../services/analyticsService';

const props = defineProps({
  ouvert: {
    type: Boolean,
    required: true
  },
  offre: {
    type: Object,
    default: null
  }
});

const emit = defineEmits(['close']);

const form = ref({
  nomProjet: '',
  nomClient: '',
  email: '',
  telephone: '',
  whatsapp: '',
  description: '',
  botcheck: false
});

const erreurs = ref({
  nomProjet: '',
  nomClient: '',
  email: '',
  telephone: '',
  whatsapp: '',
  description: ''
});

const statutEnvoi = ref('idle');

const labelBouton = computed(() => {
  if (statutEnvoi.value === 'sending') return t('common.sending');
  return t('common.sendRequest');
});

// Watch when modal opens to reset form and ensure the project name is NOT pre-filled (empty by default)
watch(() => props.ouvert, (newVal) => {
  if (newVal) {
    form.value.nomProjet = '';
    form.value.nomClient = '';
    form.value.email = '';
    form.value.telephone = '';
    form.value.whatsapp = '';
    form.value.description = '';
    form.value.botcheck = false;
    erreurs.value = {
      nomProjet: '',
      nomClient: '',
      email: '',
      telephone: '',
      whatsapp: '',
      description: ''
    };
    statutEnvoi.value = 'idle';
  }
});

const effacerErreur = (champ) => {
  erreurs.value[champ] = '';
  playTypewriter();
};

const fermer = () => {
  playDefaultClick();
  emit('close');
};

const validerFormulaire = () => {
  let estValide = true;
  
  if (!form.value.nomClient.trim()) {
    erreurs.value.nomClient = t('modal.nomRequis');
    estValide = false;
  }
  
  if (!form.value.email.trim()) {
    erreurs.value.email = t('modal.emailRequis');
    estValide = false;
  } else {
    const regexEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!regexEmail.test(form.value.email.trim())) {
      erreurs.value.email = t('modal.emailValide');
      estValide = false;
    }
  }
  
  if (!form.value.telephone.trim()) {
    erreurs.value.telephone = t('modal.telRequis');
    estValide = false;
  }
  
  if (!form.value.whatsapp.trim()) {
    erreurs.value.whatsapp = t('modal.whatsappRequis');
    estValide = false;
  }
  
  if (!form.value.nomProjet.trim()) {
    erreurs.value.nomProjet = t('modal.nomProjetRequis');
    estValide = false;
  }
  
  if (!form.value.description.trim()) {
    erreurs.value.description = t('modal.descriptionRequise');
    estValide = false;
  }
  
  return estValide;
};

const envoyerReservation = async () => {
  playDefaultClick();
  if (!validerFormulaire()) return;
  
  // Anti-bot honeypot check
  if (form.value.botcheck) {
    // Silent success to trick bots
    statutEnvoi.value = 'success';
    return;
  }
  
  statutEnvoi.value = 'sending';
  
  // Capture local copy of form details for analytics tracking before reset
  const submittedData = {
    nomClient: form.value.nomClient,
    email: form.value.email,
    nomProjet: form.value.nomProjet,
    telephone: form.value.telephone,
    whatsapp: form.value.whatsapp,
    description: form.value.description,
    offreId: props.offre?.id || 'personalise',
    offreTitre: props.offre?.titre || 'Projet personnalisé'
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
        subject: `Nouvelle réservation d'offre (${submittedData.offreTitre}) - ${submittedData.nomClient}`,
        from_name: submittedData.nomClient,
        replyto: submittedData.email,
        botcheck: form.value.botcheck,
        "Nom du Client": submittedData.nomClient,
        "Email de Contact": submittedData.email,
        "Numéro de Téléphone": submittedData.telephone,
        "Contact WhatsApp": submittedData.whatsapp,
        "Nom du Projet": submittedData.nomProjet,
        "Offre Sélectionnée": submittedData.offreTitre,
        "Description du Projet": submittedData.description
      })
    });

    const result = await response.json();

    if (response.ok && result.success) {
      // Track conversion event in Google Analytics
      trackEvent('booking_form_submit', {
        offre_id: submittedData.offreId,
        offre_name: submittedData.offreTitre,
        project_name: submittedData.nomProjet,
        user_name: submittedData.nomClient,
        user_email: submittedData.email
      });

      statutEnvoi.value = 'success';
    } else {
      throw new Error(result.message || 'Erreur lors du traitement Web3Forms.');
    }
  } catch (error) {
    console.error('Erreur d\'envoi:', error);
    alert(t('common.errorSubmit'));
    statutEnvoi.value = 'idle';
  }
};
</script>

<style scoped>
/* Modal overlay transitions */
.fade-modal-enter-active,
.fade-modal-leave-active {
  transition: opacity 0.4s ease;
}
.fade-modal-enter-from,
.fade-modal-leave-to {
  opacity: 0;
}

.fade-modal-enter-active .reservation-modal-carte {
  transition: transform 0.4s cubic-bezier(0.25, 0.8, 0.25, 1), opacity 0.4s ease;
}
.fade-modal-leave-active .reservation-modal-carte {
  transition: transform 0.3s ease, opacity 0.3s ease;
}
.fade-modal-enter-from .reservation-modal-carte {
  opacity: 0;
  transform: scale(0.95) translateY(10px);
}
.fade-modal-leave-to .reservation-modal-carte {
  opacity: 0;
  transform: scale(0.97) translateY(-5px);
}

/* Modal core styles */
.reservation-modal-overlay {
  position: fixed;
  inset: 0;
  z-index: 10000;
  background-image: linear-gradient(rgba(5, 5, 5, 0), rgba(5, 5, 5, 0)), url('https://ik.imagekit.io/h5zy3jui5/Contact/Contact%20Background.jpg?updatedAt=1781289122652');
  background-size: cover;
  background-position: center;
  background-repeat: no-repeat;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 3rem 1.5rem;
  overflow-y: auto;
}

.reservation-modal-carte {
  width: min(1300px, 92vw);
  background: transparent; /* No black background */
  border: none; /* No border */
  box-shadow: none; /* No shadow box */
  position: relative;
  border-radius: 0px; /* Sharp corners */
  display: grid;
  grid-template-columns: 0.8fr 1.2fr;
  gap: clamp(2rem, 5vw, 6rem);
  padding: 0;
}

.bouton-fermer-modal {
  position: absolute;
  top: -4rem;
  right: 0rem;
  background: none;
  border: none;
  color: rgba(255, 255, 255, 0.6);
  font-size: 1.6rem;
  cursor: pointer;
  transition: color 0.2s ease, transform 0.2s ease;
  z-index: 10;
}

.bouton-fermer-modal:hover {
  color: #fff;
  transform: rotate(90deg);
}

/* Left side styling */
.modal-gauche {
  display: flex;
  flex-direction: column;
  justify-content: flex-start;
  text-align: left;
}

.modal-titre {
  font-family: 'Space Grotesk', sans-serif;
  font-size: clamp(2rem, 2.6vw, 3.2rem);
  font-weight: 300;
  color: #fff; /* Monochrome white color */
  line-height: 1.15;
  margin: 0 0 1.5rem;
  letter-spacing: -0.01em;
}

.modal-description-intro {
  font-family: 'Poppins', sans-serif;
  font-size: clamp(0.95rem, 1.1vw, 1.15rem);
  font-weight: 300;
  line-height: 1.6;
  color: rgba(255, 255, 255, 0.7);
  margin: 0;
}

/* Right side styling */
.modal-droite {
  display: flex;
  flex-direction: column;
  justify-content: center;
}

.reservation-form {
  display: flex;
  flex-direction: column;
  gap: 1.4rem;
  width: 100%;
}

/* Form fields layout */
.form-range {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: clamp(1rem, 2vw, 2.5rem);
}

.form-groupe {
  display: flex;
  flex-direction: column;
  position: relative;
  width: 100%;
}

.form-groupe label {
  font-family: 'Poppins', sans-serif;
  font-size: 0.72rem;
  font-weight: 500;
  letter-spacing: 0.08em;
  color: rgba(255, 255, 255, 0.5);
  transition: color 0.3s ease;
  margin-bottom: 0.2rem;
  text-align: left;
}

.form-groupe input,
.form-groupe textarea {
  background: transparent;
  border: none;
  border-bottom: 1px solid rgba(255, 255, 255, 0.3);
  color: #fff;
  font-family: 'Poppins', sans-serif;
  font-size: 1rem;
  font-weight: 300;
  padding: 0.4rem 0;
  outline: none;
  transition: border-bottom-color 0.3s ease;
  width: 100%;
  border-radius: 0px; /* Force sharp border for inputs */
}

.form-groupe textarea {
  resize: none;
  min-height: 60px;
}

.form-groupe input:focus,
.form-groupe textarea:focus {
  border-bottom-color: #0096e7;
}

.form-groupe input:focus + label,
.form-groupe textarea:focus + label {
  color: #0096e7;
}

.form-groupe.a-erreur input,
.form-groupe.a-erreur textarea {
  border-bottom-color: #ff3b30;
}

.form-groupe.a-erreur label {
  color: #ff3b30;
}

.message-erreur {
  font-size: 0.7rem;
  color: #ff3b30;
  position: absolute;
  bottom: -1.1rem;
  left: 0;
  font-weight: 400;
}

.form-bouton-wrap {
  margin-top: 1rem;
  text-align: left;
}

.bouton-envoyer-modal {
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
  border: none;
  cursor: pointer;
}

.bouton-envoyer-modal:hover:not(:disabled) {
  background-color: var(--couleur-bleu-survol);
  box-shadow: 0 6px 25px rgba(0, 130, 200, 0.5);
}

.bouton-envoyer-modal:active:not(:disabled) {
  transform: translateY(0);
}

.bouton-envoyer-modal:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.plus-gauche,
.plus-droit {
  font-weight: 400;
  font-size: 1.5rem;
  display: inline-block;
  transition: transform 0.5s cubic-bezier(0.16, 1, 0.3, 1);
}

.bouton-envoyer-modal:hover:not(:disabled) .plus-gauche,
.bouton-retour-success:hover .plus-gauche {
  transform: rotate(180deg);
}

.bouton-envoyer-modal:hover:not(:disabled) .plus-droit,
.bouton-retour-success:hover .plus-droit {
  transform: rotate(-180deg);
}

/* Success Card Inside Modal */
.reservation-success-card {
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  padding: 1.5rem 0;
}

.success-icon-wrap {
  width: 60px;
  height: 60px;
  border-radius: 50%;
  border: 2px solid #0096e7;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 1.5rem;
}

.success-icon {
  font-size: 2rem;
  color: #0096e7;
  line-height: 1;
}

.success-titre {
  font-family: 'Space Grotesk', sans-serif;
  font-size: 1.8rem;
  font-weight: 500;
  margin-bottom: 1rem;
  color: #fff;
}

.success-texte {
  font-family: 'Poppins', sans-serif;
  font-weight: 300;
  font-size: 0.95rem;
  line-height: 1.5;
  color: rgba(255, 255, 255, 0.7);
  max-width: 440px;
  margin-bottom: 2rem;
}

.bouton-retour-success {
  background: transparent;
  border: 1px solid rgba(255, 255, 255, 0.25);
  color: #fff;
  font-family: 'Poppins', sans-serif;
  padding: 0.6rem 1.5rem;
  border-radius: 0px;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 1.5rem;
  transition: all 0.3s ease;
}

.bouton-retour-success:hover {
  background: #fff;
  color: #050505;
  border-color: #fff;
}

/* Fade form transition inside modal */
.fade-form-enter-active,
.fade-form-leave-active {
  transition: opacity 0.3s ease;
}
.fade-form-enter-from,
.fade-form-leave-to {
  opacity: 0;
}

/* Mobile responsiveness adjustments */
@media (max-width: 768px) {
  .reservation-modal-carte {
    grid-template-columns: 1fr;
    gap: 2rem;
    padding: 0;
    width: min(560px, 95vw);
  }
  .modal-titre {
    text-align: center;
  }
  .modal-description-intro {
    text-align: center;
  }
  .bouton-fermer-modal {
    top: -3.5rem;
  }
  .form-bouton-wrap {
    display: flex;
    justify-content: center;
  }
  .bouton-envoyer-modal,
  .bouton-retour-success {
    width: 100%;
    max-width: 340px;
    margin: 0 auto;
    justify-content: space-between;
  }
}
</style>
