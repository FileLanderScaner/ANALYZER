"use client";

import React, { createContext, useContext, useEffect, useState } from 'react';

const themes = {
  light: {
    name: 'Claro',
    className: '',
  },
  dark: {
    name: 'Oscuro',
    className: 'dark',
  },
  matrix: {
    name: 'Matrix',
    className: 'matrix',
  },
};

const ThemeContext = createContext({
  theme: 'dark',
  setTheme: (theme: string) => {},
  themes: Object.keys(themes),
});

export const useTheme = () => useContext(ThemeContext);

export const ThemeProvider = ({ children }: { children: React.ReactNode }) => {
  const [theme, setTheme] = useState('dark');

  useEffect(() => {
    document.documentElement.classList.remove('light', 'dark', 'matrix');
    const className = themes[theme]?.className;
    if (className) {
      document.documentElement.classList.add(className);
    }
  }, [theme]);

  return (
    <ThemeContext.Provider value={{ theme, setTheme, themes: Object.keys(themes) }}>
      {children}
    </ThemeContext.Provider>
  );
};
