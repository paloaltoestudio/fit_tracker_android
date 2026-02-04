import React, { createContext, useState, useEffect, useContext } from 'react';
import i18n, { getSavedLocale, setLocaleAndSave, getDeviceLocale, getLocale } from '../i18n';

const LocaleContext = createContext({});

export const useLocale = () => {
  const context = useContext(LocaleContext);
  if (!context) {
    throw new Error('useLocale must be used within a LocaleProvider');
  }
  return context;
};

export const LocaleProvider = ({ children }) => {
  const [preference, setPreference] = useState('device');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    getSavedLocale().then((saved) => {
      if (!mounted) return;
      if (saved === 'en' || saved === 'es') {
        i18n.locale = saved;
        setPreference(saved);
      } else {
        i18n.locale = getDeviceLocale();
        setPreference('device');
      }
      setIsLoading(false);
    });
    return () => { mounted = false; };
  }, []);

  const setLocalePreference = async (value) => {
    const next = value === 'device' ? null : value;
    await setLocaleAndSave(next);
    setPreference(value === 'en' || value === 'es' ? value : 'device');
  };

  return (
    <LocaleContext.Provider
      value={{
        preference,
        locale: getLocale(),
        setLocalePreference,
        isLoading,
      }}
    >
      {children}
    </LocaleContext.Provider>
  );
};
