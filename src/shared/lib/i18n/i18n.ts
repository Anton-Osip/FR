import i18n from 'i18next';
import LanguageDetector from 'i18next-browser-languagedetector';
import Backend from 'i18next-http-backend';
import intervalPlural from 'i18next-intervalplural-postprocessor';

i18n.use(Backend).use(LanguageDetector).use(intervalPlural);

export const i18nConfig = {
  supportedLngs: ['en', 'ru'] as const,
  fallbackLng: 'en',
  load: 'languageOnly' as const,
  defaultNS: 'translation',
  ns: [
    'translation',
    'header',
    'sidebar',
    'bonuses',
    'breadcrumbs',
    'footer',
    'favorites',
    'home',
    'searchModal',
    'invite',
    'tabScreenMenu',
    'profile',
    'loginModal',
  ],
  backend: {
    loadPath: '/locales/{{lng}}/{{ns}}.json',
  },
  detection: {
    order: ['localStorage', 'navigator', 'htmlTag'],
    lookupLocalStorage: 'i18nextLng',
    caches: ['localStorage'],
  },
  interpolation: {
    escapeValue: false,
  },
  debug: import.meta.env.DEV,
};

export default i18n;
