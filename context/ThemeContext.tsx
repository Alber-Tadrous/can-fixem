import React, { createContext, useContext, useState } from 'react';
import { useColorScheme } from 'react-native';

// Define theme colors
const lightTheme = {
  primary: '#2563EB', // Blue
  secondary: '#F97316', // Orange
  background: '#FFFFFF',
  card: '#FFFFFF',
  text: '#1F2937',
  textSecondary: '#6B7280',
  border: '#E5E7EB',
  danger: '#EF4444',
  success: '#10B981',
  warning: '#F59E0B',
  info: '#3B82F6',
  badgeBackground: '#F3F4F6',
  iconBackground: '#F1F5F9',
  inputBackground: '#F9FAFB',
};

const darkTheme = {
  primary: '#3B82F6', // Blue
  secondary: '#F97316', // Orange
  background: '#111827',
  card: '#1F2937',
  text: '#F9FAFB',
  textSecondary: '#9CA3AF',
  border: '#374151',
  danger: '#EF4444',
  success: '#10B981',
  warning: '#F59E0B',
  info: '#60A5FA',
  badgeBackground: '#374151',
  iconBackground: '#374151',
  inputBackground: '#374151',
};

// Create context
interface ThemeContextProps {
  isDark: boolean;
  colors: typeof lightTheme;
  toggleTheme: () => void;
}

const ThemeContext = createContext<ThemeContextProps>({
  isDark: false,
  colors: lightTheme,
  toggleTheme: () => {},
});

// Provider component
export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const systemColorScheme = useColorScheme();
  const [isDark, setIsDark] = useState(systemColorScheme === 'dark');
  
  const colors = isDark ? darkTheme : lightTheme;
  
  const toggleTheme = () => {
    setIsDark(prev => !prev);
  };
  
  return (
    <ThemeContext.Provider value={{ isDark, colors, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};

// Custom hook for using the theme
export const useThemeContext = () => useContext(ThemeContext);