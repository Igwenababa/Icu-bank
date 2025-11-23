
import React, { createContext, useState, useContext, ReactNode } from 'react';
import { en } from '../locales/en';
import { es } from '../locales/es';
import { fr } from '../locales/fr';

// Allow generic string for broader language support in the UI, even if we only have 3 translation files
type Language = string;

interface LanguageContextType {
  language: Language;
  setLanguage: (language: Language) => void;
  t: (key: string) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

const translations: Record<string, Record<string, string>> = {
  en,
  es,
  fr
};

export const LanguageProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  // Defaulting to English as requested
  const [language, setLanguage] = useState<Language>('en');

  const t = (key: string): string => {
    const translation = translations[language]?.[key];
    if (translation) {
      return translation;
    }
    
    // Fallback to English
    const fallbackTranslation = translations.en?.[key];
    if (fallbackTranslation) {
      return fallbackTranslation;
    }
    
    // Final fallback - return the key itself
    return key;
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = (): LanguageContextType => {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};
