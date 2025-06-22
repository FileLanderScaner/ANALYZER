"use client";
import { useTheme } from '@/context/ThemeContext';
import { MatrixRain } from '@/components/MatrixRain';
import React from 'react';

export const ThemeClientWrapper = () => {
  const { theme } = useTheme();
  return <>{theme === 'matrix' && <MatrixRain />}</>;
};
