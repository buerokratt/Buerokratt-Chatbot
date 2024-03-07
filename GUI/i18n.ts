import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

import commonEN from './translations/en/common.json';
import commonET from './translations/et/common.json';

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    debug: import.meta.env.NODE_ENV === 'development',
    fallbackLng: 'et',
    supportedLngs: ['et','en'],
    resources: {
      en: {
        common: commonEN,
      },
      et: {
        common: commonET,
      },
    },
    defaultNS: 'common',
  });

export default i18n;
