import { ref, watch } from 'vue';
import { langueActive } from '../i18n/index';

export const API_BASE_URL = import.meta.env.VITE_API_URL || (import.meta.env.DEV ? 'http://localhost:8080' : 'https://epikbrand-backoffice.onrender.com');

export const projects = ref([]);
export const teamMembers = ref([]);
export const isLoading = ref(false);
export const error = ref(null);

/**
 * Mélange un tableau de façon aléatoire (algorithme de Fisher-Yates)
 */
function shuffleArray(array) {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
  return array;
}

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

    // Remplir les données réactives s'ils sont valides et les mélanger de manière aléatoire
    const validProjects = Array.isArray(projectsData) ? projectsData : [];
    projects.value = shuffleArray(validProjects);
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

/**
 * Détermine si l'URL pointe vers un fichier vidéo direct
 * (ex: .mp4, .webm, ou vidéo brute hébergée sur Cloudinary).
 */
export function isDirectVideo(url) {
  if (!url) return false;
  const lowerUrl = url.toLowerCase();
  return (
    lowerUrl.includes('.mp4') ||
    lowerUrl.includes('.webm') ||
    lowerUrl.includes('.ogg') ||
    lowerUrl.includes('.mov') ||
    (lowerUrl.includes('cloudinary.com') && lowerUrl.includes('/video/upload/'))
  );
}

/**
 * Génère l'URL d'intégration correcte pour les iframes (cartes / arrière-plans)
 * sans contrôles, muette et en boucle infinie.
 */
export function getEmbedUrl(url) {
  if (!url) return '';

  // Si c'est déjà un URL d'intégration, on le renvoie
  if (url.includes('youtube.com/embed/') || url.includes('player.vimeo.com/video/')) {
    return url;
  }

  // URL YouTube standard ou abrégée
  let ytMatch = url.match(/(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/ ]{11})/i);
  if (ytMatch && ytMatch[1]) {
    const videoId = ytMatch[1];
    return `https://www.youtube.com/embed/${videoId}?autoplay=1&mute=1&loop=1&playlist=${videoId}&controls=0&modestbranding=1&rel=0&playsinline=1&showinfo=0&iv_load_policy=3&enablejsapi=1&end=20`;
  }

  // URL Vimeo
  let vimeoMatch = url.match(/(?:vimeo\.com\/|player\.vimeo\.com\/video\/)([0-9]+)/i);
  if (vimeoMatch && vimeoMatch[1]) {
    return `https://player.vimeo.com/video/${vimeoMatch[1]}?autoplay=1&loop=1&muted=1&background=1&controls=0&playsinline=1`;
  }

  return url;
}

/**
 * Génère l'URL d'intégration pour la galerie de détails du projet
 * (avec contrôles utilisateur activés et pas d'autoplay forcé).
 */
export function getEmbedUrlForGallery(url) {
  if (!url) return '';

  if (url.includes('youtube.com/embed/') || url.includes('player.vimeo.com/video/')) {
    return url;
  }

  let ytMatch = url.match(/(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/ ]{11})/i);
  if (ytMatch && ytMatch[1]) {
    return `https://www.youtube.com/embed/${ytMatch[1]}?autoplay=0&controls=1&rel=0&playsinline=1&modestbranding=1`;
  }

  let vimeoMatch = url.match(/(?:vimeo\.com\/|player\.vimeo\.com\/video\/)([0-9]+)/i);
  if (vimeoMatch && vimeoMatch[1]) {
    return `https://player.vimeo.com/video/${vimeoMatch[1]}?autoplay=0&controls=1&playsinline=1`;
  }

  return url;
}

/**
 * Vérifie si l'URL est une vidéo YouTube.
 */
export function isYoutubeVideo(url) {
  if (!url) return false;
  return /(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/ ]{11})/i.test(url);
}

/**
 * Extrait l'image miniature d'une vidéo YouTube à partir de son URL.
 */
export function getYoutubeThumbnail(url) {
  if (!url) return '';
  let match = url.match(/(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/ ]{11})/i);
  if (match && match[1]) {
    return `https://img.youtube.com/vi/${match[1]}/hqdefault.jpg`;
  }
  return '';
}

/**
 * Vérifie si l'URL pointe vers n'importe quel type de vidéo (directe, youtube, vimeo).
 */
export function isVideo(url) {
  if (!url) return false;
  return isDirectVideo(url) || isYoutubeVideo(url) || url.includes('vimeo');
}

/**
 * Retourne une URL de vidéo directe limitée aux 20 premières secondes pour économiser de la bande passante.
 */
export function getPreviewVideoUrl(url) {
  if (!url) return '';
  if (isDirectVideo(url) && !url.includes('#')) {
    return `${url}#t=0,20`;
  }
  return url;
}

