// src/contexts/ThemeContext.tsx
import React, { createContext, useContext, useState, useEffect } from 'react';

// Tüm desteklediğimiz temaların listesi
export type Theme = 'dark' | 'light' | 'dracula' | 'orange' | 'lime' | 'pink' | 'purple';

interface ThemeContextType {
  theme: Theme;
  changeTheme: (newTheme: Theme) => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const ThemeProvider: React.FC<{children: React.ReactNode}> = ({ children }) => {
  const [theme, setTheme] = useState<Theme>(() => {
    // Sayfa açıldığında hafızadaki temayı al, yoksa 'dark' yap
    return (localStorage.getItem('app_theme') as Theme) || 'dark';
  });

  useEffect(() => {
    const root = window.document.documentElement;
    
    // GÜNCELLEME: Tüm temaların bir dizisi (array)
    const allThemes = ['dark', 'light', 'dracula', 'orange', 'lime', 'pink', 'purple'];
    
    // HTML etiketindeki tüm eski temaları temizle (Artık hiçbiri üst üste binmeyecek)
    root.classList.remove(...allThemes);
    
    // Sadece yeni seçilen temayı ekle ve hafızaya kaydet
    root.classList.add(theme);
    localStorage.setItem('app_theme', theme);
  }, [theme]);

  const changeTheme = (newTheme: Theme) => {
    setTheme(newTheme);
  };

  return (
    <ThemeContext.Provider value={{ theme, changeTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) throw new Error("useTheme, ThemeProvider içinde kullanılmalıdır!");
  return context;
};