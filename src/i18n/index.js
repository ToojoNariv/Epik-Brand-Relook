import { ref } from 'vue';
import { fr } from './fr';
import { en } from './en';
import { mg } from './mg';

const dictionaries = { fr, en, mg };

const getInitialLang = () => {
  if (typeof window !== 'undefined') {
    const saved = localStorage.getItem('langueActive');
    if (saved && dictionaries[saved]) {
      return saved;
    }
  }
  return 'fr';
};

export const langueActive = ref(getInitialLang());

export const setLangue = (langCode) => {
  if (dictionaries[langCode]) {
    langueActive.value = langCode;
    if (typeof window !== 'undefined') {
      localStorage.setItem('langueActive', langCode);
    }
  }
};

export const t = (path) => {
  const keys = path.split('.');
  let currentObj = dictionaries[langueActive.value];
  
  for (const key of keys) {
    if (currentObj && currentObj[key] !== undefined) {
      currentObj = currentObj[key];
    } else {
      // Fallback to French ('fr')
      let fallbackObj = dictionaries['fr'];
      for (const fKey of keys) {
        if (fallbackObj && fallbackObj[fKey] !== undefined) {
          fallbackObj = fallbackObj[fKey];
        } else {
          return path;
        }
      }
      return fallbackObj;
    }
  }
  return currentObj;
};
