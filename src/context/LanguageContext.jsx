import { createContext, useContext, useState, useEffect } from 'react';
import translations from '../i18n/translations';

const LanguageContext = createContext();

export function LanguageProvider({ children }) {
  const [lang, setLang] = useState(() => localStorage.getItem('ns-lang') || 'fr');

  useEffect(() => {
    localStorage.setItem('ns-lang', lang);
    document.documentElement.dir = lang === 'ar' ? 'rtl' : 'ltr';
    document.documentElement.lang = lang;
    document.body.style.fontFamily = lang === 'ar' 
      ? "'Cairo', sans-serif" 
      : "'Poppins', sans-serif";
  }, [lang]);

  const t = (key) => translations[lang]?.[key] || translations.fr[key] || key;
  const toggleLang = () => setLang(prev => prev === 'fr' ? 'ar' : 'fr');
  const isRTL = lang === 'ar';

  return (
    <LanguageContext.Provider value={{ lang, setLang, t, toggleLang, isRTL }}>
      {children}
    </LanguageContext.Provider>
  );
}

export const useLang = () => useContext(LanguageContext);
