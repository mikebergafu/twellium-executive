import React, { createContext, useContext, useEffect, useState } from 'react';

const ThemeContext = createContext();

const readStoredTheme = () => {
    try {
        const session = sessionStorage.getItem('__THEME_CONFIG__');
        if (session) return JSON.parse(session).theme || 'light';
    } catch (_) {}
    return localStorage.getItem('theme') || 'light';
};

const applyTheme = (theme) => {
    const html = document.documentElement;
    // Bootstrap template: data-bs-theme attribute
    html.setAttribute('data-bs-theme', theme);
    // Tailwind: dark class
    html.classList.toggle('dark', theme === 'dark');
    html.classList.toggle('light', theme === 'light');
    // Persist — both storages so theme-script.js on next page load picks it up
    localStorage.setItem('theme', theme);
    try {
        const existing = JSON.parse(sessionStorage.getItem('__THEME_CONFIG__') || '{}');
        sessionStorage.setItem('__THEME_CONFIG__', JSON.stringify({ ...existing, theme }));
    } catch (_) {}
};

export const ThemeProvider = ({ children }) => {
    const [theme, setTheme] = useState(() => readStoredTheme());

    useEffect(() => {
        applyTheme(theme);
    }, [theme]);

    const toggleTheme = () => {
        setTheme(prev => (prev === 'light' ? 'dark' : 'light'));
    };

    return (
        <ThemeContext.Provider value={{ theme, toggleTheme }}>
            {children}
        </ThemeContext.Provider>
    );
};

export const useTheme = () => {
    const context = useContext(ThemeContext);
    if (context === undefined) {
        throw new Error('useTheme must be used within a ThemeProvider');
    }
    return context;
};
