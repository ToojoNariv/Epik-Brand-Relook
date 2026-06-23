import { t } from '../i18n/index';

// Base URL configuration (fallback to epikbrand.com)
const BASE_URL = 'https://epikbrand.com';

function getBaseUrl() {
  if (typeof window !== 'undefined') {
    return window.location.origin;
  }
  return BASE_URL;
}

function setMetaTag(attributeValue, content, attributeName = 'name') {
  if (!content) return;
  if (typeof document === 'undefined') return;
  
  let el = document.querySelector(`meta[${attributeName}="${attributeValue}"]`);
  if (!el) {
    el = document.createElement('meta');
    el.setAttribute(attributeName, attributeValue);
    document.head.appendChild(el);
  }
  el.setAttribute('content', content);
}

/**
 * Updates or creates a link tag.
 */
function setLinkTag(rel, href, attributes = {}) {
  if (typeof document === 'undefined') return;
  
  // Build query selector for link
  let selector = `link[rel="${rel}"]`;
  if (attributes.hreflang) {
    selector += `[hreflang="${attributes.hreflang}"]`;
  }
  
  let el = document.querySelector(selector);
  if (!el) {
    el = document.createElement('link');
    el.setAttribute('rel', rel);
    document.head.appendChild(el);
  }
  el.setAttribute('href', href);
  for (const [key, val] of Object.entries(attributes)) {
    el.setAttribute(key, val);
  }
}

/**
 * Sets JSON-LD structured data in the head.
 */
function setJsonLd(data) {
  if (typeof document === 'undefined') return;
  
  let el = document.getElementById('epik-seo-jsonld');
  if (!el) {
    el = document.createElement('script');
    el.setAttribute('type', 'application/ld+json');
    el.setAttribute('id', 'epik-seo-jsonld');
    document.head.appendChild(el);
  }
  el.textContent = JSON.stringify(data, null, 2);
}

/**
 * Dynamically updates all SEO metadata in the document head based on current state.
 * @param {Object} state - The current application view state
 * @param {string} state.lang - Active language code ('fr', 'en', 'mg')
 * @param {string} state.pageCourante - Current main view ('accueil', 'projets', 'portfolio')
 * @param {string} state.activeExpertise - Selected slider expertise ('photo', 'video', 'graphique', 'web')
 * @param {Object|null} state.projetActifDetail - Selected project object, or null
 * @param {boolean} state.aproposOuvert - Whether about overlay is open
 * @param {boolean} state.offresOuvert - Whether offers overlay is open
 * @param {boolean} state.contactOuvert - Whether contact overlay is open
 */
export function updateSEOMetadata(state) {
  if (typeof window === 'undefined') return;

  const {
    lang,
    pageCourante,
    activeExpertise,
    projetActifDetail,
    aproposOuvert,
    offresOuvert,
    contactOuvert
  } = state;

  // Set html tag lang attribute
  document.documentElement.setAttribute('lang', lang);

  const base = getBaseUrl();
  const currentPath = window.location.pathname;
  const canonicalUrl = `${base}${currentPath}?lang=${lang}`;

  // 1. Determine Title & Description based on page state
  let title = '';
  let description = '';
  let ogImage = `${base}/images/Photographie Background.jpg`; // Default OG image
  let isProject = false;

  if (projetActifDetail) {
    // Project Detail Page
    isProject = true;
    const projectTitle = Array.isArray(projetActifDetail.titre) 
      ? projetActifDetail.titre.join(' ') 
      : projetActifDetail.titre;
    
    title = `${projectTitle} | Epik Brand`;
    description = projetActifDetail.description || '';
    if (projetActifDetail.src) {
      // If project image is absolute or relative
      ogImage = projetActifDetail.src.startsWith('http') 
        ? projetActifDetail.src 
        : `${base}${projetActifDetail.src}`;
    }
  } else if (contactOuvert) {
    title = t('seo.title.contact');
    description = t('seo.description.contact');
  } else if (aproposOuvert) {
    title = t('seo.title.apropos');
    description = t('seo.description.apropos');
  } else if (offresOuvert) {
    title = t('seo.title.offres');
    description = t('seo.description.offres');
  } else if (pageCourante === 'portfolio') {
    title = t('seo.title.portfolio');
    description = t('seo.description.portfolio');
  } else {
    // Homepage: dynamic title based on active slider expertise
    const expertiseKey = activeExpertise || 'photo';
    title = t(`seo.title.${expertiseKey}`) || t('seo.title.home');
    description = t(`seo.description.${expertiseKey}`) || t('seo.description.home');
  }

  // Fallbacks if translations are missing
  title = title || "Epik Brand, Soignez votre image";
  description = description || "Allier la puissance d’une stratégie de marque au grand frisson visuel.";
  const keywords = t('seo.keywords') || "Epik Brand, rebranding, photographie studio, montage video, design web, developpement créatif, identité visuelle.";

  // 2. Set document head title and metadata tags
  document.title = title;
  setMetaTag('description', description);
  setMetaTag('keywords', keywords);
  setMetaTag('author', 'Epik Brand');

  // Open Graph Tags
  setMetaTag('og:title', title, 'property');
  setMetaTag('og:description', description, 'property');
  setMetaTag('og:image', ogImage, 'property');
  setMetaTag('og:url', canonicalUrl, 'property');
  setMetaTag('og:type', isProject ? 'article' : 'website', 'property');

  // Twitter Cards Tags
  setMetaTag('twitter:card', 'summary_large_image');
  setMetaTag('twitter:title', title);
  setMetaTag('twitter:description', description);
  setMetaTag('twitter:image', ogImage);

  // 3. Canonical and Alternates (hreflang)
  setLinkTag('canonical', canonicalUrl);
  
  // Multilingual hreflang linking
  const languages = ['fr', 'en', 'mg'];
  languages.forEach(l => {
    setLinkTag('alternate', `${base}${currentPath}?lang=${l}`, { hreflang: l });
  });
  // x-default points to French (or fallback)
  setLinkTag('alternate', `${base}${currentPath}`, { hreflang: 'x-default' });

  // 4. Schema.org JSON-LD Structured Data
  const defaultSchema = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "ProfessionalService",
        "@id": `${base}/#agency`,
        "name": "Epik Brand",
        "url": base,
        "logo": `${base}/logo.png`,
        "image": `${base}/images/Photographie Background.jpg`,
        "description": t('seo.description.home'),
        "address": {
          "@type": "PostalAddress",
          "streetAddress": "Soavimasoandro",
          "addressLocality": "Antananarivo",
          "addressRegion": "Analamanga",
          "addressCountry": "MG"
        },
        "priceRange": "$$",
        "telephone": "+261340000000", // Placeholder/Replace with official phone if needed
        "email": "hello@epicbrand.com",
        "sameAs": [
          "https://www.facebook.com/epikbrand", // Placeholder social links
          "https://www.instagram.com/epikbrand",
          "https://www.linkedin.com/company/epikbrand"
        ]
      },
      {
        "@type": "WebSite",
        "@id": `${base}/#website`,
        "url": base,
        "name": "Epik Brand",
        "description": t('seo.description.home'),
        "publisher": {
          "@id": `${base}/#agency`
        },
        "inLanguage": lang
      }
    ]
  };

  if (isProject && projetActifDetail) {
    const projectTitle = Array.isArray(projetActifDetail.titre) 
      ? projetActifDetail.titre.join(' ') 
      : projetActifDetail.titre;

    // Append CreativeWork schema for active project
    const projectSchema = {
      "@context": "https://schema.org",
      "@type": "CreativeWork",
      "name": projectTitle,
      "description": description,
      "image": ogImage,
      "url": canonicalUrl,
      "creator": {
        "@type": "Organization",
        "name": "Epik Brand",
        "url": base
      },
      "genre": projetActifDetail.category || 'design'
    };

    setJsonLd(projectSchema);
  } else {
    setJsonLd(defaultSchema);
  }
}
