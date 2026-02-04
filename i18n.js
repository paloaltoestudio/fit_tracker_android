import AsyncStorage from '@react-native-async-storage/async-storage';
import { I18n } from 'i18n-js';
import en from './locales/en';
import es from './locales/es';

const STORAGE_KEY = 'app_locale';

const i18n = new I18n({ en, es });

export function getDeviceLocale() {
  try {
    const { getLocales } = require('expo-localization');
    const locales = getLocales();
    const code = locales?.[0]?.languageCode ?? 'en';
    return code === 'es' ? 'es' : 'en';
  } catch (e) {
    return 'en';
  }
}

export async function getSavedLocale() {
  try {
    const saved = await AsyncStorage.getItem(STORAGE_KEY);
    if (saved === 'en' || saved === 'es') return saved;
    return null;
  } catch (e) {
    return null;
  }
}

export async function setLocaleAndSave(locale) {
  const value = locale === 'es' ? 'es' : locale === 'en' ? 'en' : null;
  try {
    if (value) {
      await AsyncStorage.setItem(STORAGE_KEY, value);
      i18n.locale = value;
    } else {
      await AsyncStorage.removeItem(STORAGE_KEY);
      i18n.locale = getDeviceLocale();
    }
  } catch (e) {
    console.error('Failed to save locale:', e);
  }
  return i18n.locale;
}

// Initial locale: device (saved locale is applied by LocaleProvider)
i18n.locale = getDeviceLocale();
i18n.enableFallback = true;
i18n.defaultLocale = 'en';

export function t(key, options = {}) {
  return i18n.t(key, options);
}

export function setLocale(locale) {
  if (locale === 'es' || locale === 'en') {
    i18n.locale = locale;
  } else {
    i18n.locale = getDeviceLocale();
  }
}

export function getLocale() {
  return i18n.locale;
}

export default i18n;
