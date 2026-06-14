import { ref, watch } from 'vue';
import { langueActive } from '../i18n/index';

// Lit l'URL de l'API depuis la variable d'environnement ou se rabat sur le port local 8080 par défaut
export const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080';

export const projects = ref([]);
export const teamMembers = ref([]);
export const isLoading = ref(false);
export const error = ref(null);

/**
 * Récupère l'ensemble des données (projets et équipe) depuis le backend
 * selon la langue active.
 */
export async function fetchAllData() {
  isLoading.value = true;
  error.value = null;
  
  try {
    const lang = langueActive.value;
    const [projectsRes, teamRes] = await Promise.all([
      fetch(`${API_BASE_URL}/api/projects?lang=${lang}`),
      fetch(`${API_BASE_URL}/api/team?lang=${lang}`)
    ]);

    if (!projectsRes.ok) {
      throw new Error(`Échec de récupération des projets (${projectsRes.status})`);
    }
    if (!teamRes.ok) {
      throw new Error(`Échec de récupération des membres d'équipe (${teamRes.status})`);
    }

    const projectsData = await projectsRes.json();
    const teamData = await teamRes.json();

    // Remplir les données réactives s'ils sont valides
    projects.value = Array.isArray(projectsData) ? projectsData : [];
    teamMembers.value = Array.isArray(teamData) ? teamData : [];
  } catch (err) {
    console.warn("[API Service] Le serveur backend est hors-ligne. Affichage des données locales de secours. Détail :", err.message);
    error.value = err.message;
  } finally {
    isLoading.value = false;
  }
}

// Re-charger les données automatiquement si le visiteur change la langue du site
watch(langueActive, () => {
  fetchAllData();
});
