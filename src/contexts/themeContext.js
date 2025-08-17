import React, { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';

const ThemeContext = createContext();

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};

export const ThemeProvider = ({ children }) => {
  const [theme, setTheme] = useState({
    primary: '#e91e63',
    secondary: '#f06292',
    accent: '#ec407a',
    background: 'linear-gradient(135deg, #ffeef8 0%, #fff0f5 50%, #fdf2f8 100%)',
    cardBackground: 'linear-gradient(135deg, rgba(255,255,255,0.9), rgba(253,242,248,0.7))',
    textColor: '#4a4a4a',
    borderColor: '#f8bbd9',
    themeName: 'Pink Theme'
  });

  const [loading, setLoading] = useState(true);

  // Load theme on mount for ALL users
  useEffect(() => {
    loadTheme();
    
    // Poll for theme changes every 30 seconds to catch admin updates
    const interval = setInterval(loadTheme, 30000);
    
    return () => clearInterval(interval);
  }, []);

  // Apply theme to CSS variables whenever theme changes
  useEffect(() => {
    applyThemeToCSS(theme);
  }, [theme]);

  const loadTheme = async () => {
    try {
      const response = await axios.get('/theme');
      setTheme(response.data);
    } catch (error) {
      console.error('Error loading theme:', error);
      // Use default theme if loading fails
    } finally {
      setLoading(false);
    }
  };

  const applyThemeToCSS = (themeConfig) => {
    const root = document.documentElement;
    
    // Set CSS custom properties for the entire website
    root.style.setProperty('--primary-color', themeConfig.primary);
    root.style.setProperty('--secondary-color', themeConfig.secondary);
    root.style.setProperty('--accent-color', themeConfig.accent);
    root.style.setProperty('--text-color', themeConfig.textColor);
    root.style.setProperty('--border-color', themeConfig.borderColor);
    root.style.setProperty('--background-gradient', themeConfig.background);
    root.style.setProperty('--card-background', themeConfig.cardBackground);

    // Apply background and text color to body
    document.body.style.background = themeConfig.background;
    document.body.style.color = themeConfig.textColor;
    document.body.style.transition = 'all 0.3s ease';

    // Update page title to reflect theme
    document.title = `NS Luxurious - ${themeConfig.themeName}`;
  };

  // Admin-only functions
  const updateTheme = async (newTheme) => {
    try {
      const response = await axios.post('/theme', newTheme, {
        headers: {
          'email': 'nessbusiness66@gmail.com',
          'password': 'lavieestbelle070478'
        }
      });
      
      setTheme(newTheme);
      return response.data;
    } catch (error) {
      console.error('Error updating theme:', error);
      throw error;
    }
  };

  const applyPresetTheme = async (themeName) => {
    try {
      const response = await axios.post(`/theme/preset/${themeName}`, {}, {
        headers: {
          'email': 'nessbusiness66@gmail.com',
          'password': 'lavieestbelle070478'
        }
      });
      
      setTheme(response.data.theme);
      return response.data;
    } catch (error) {
      console.error('Error applying preset theme:', error);
      throw error;
    }
  };

  const getPresetThemes = async () => {
    try {
      const response = await axios.get('/theme/presets');
      return response.data;
    } catch (error) {
      console.error('Error fetching preset themes:', error);
      return {};
    }
  };

  const value = {
    theme,
    updateTheme,
    applyPresetTheme,
    getPresetThemes,
    loading,
    refreshTheme: loadTheme // Allow manual theme refresh
  };

  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  );
};