import { ref, watch } from 'vue';
import { langueActive } from '../i18n/index';

export const API_BASE_URL = import.meta.env.VITE_API_URL || (import.meta.env.DEV ? 'http://localhost:8080' : 'https://epikbrand-backoffice.onrender.com');

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

    // Précharger les images des projets discrètement en arrière-plan
    // Cela permet d'avoir des images qui s'affichent instantanément dans le portfolio
    if (projects.value.length > 0) {
      setTimeout(() => {
        projects.value.forEach(p => {
          if (p.category !== 'video' && p.src) {
            const img = new Image();
            img.fetchPriority = 'low'; // Basse priorité pour ne pas bloquer le reste
            img.src = p.src;
          }
        });
      }, 500); // Léger délai pour ne pas concurrencer le rendu initial
    }
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
