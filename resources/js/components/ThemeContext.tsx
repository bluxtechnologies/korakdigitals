import * as React from 'react';

export type Appearance = 'light' | 'dark' | 'system';

interface ThemeContextType {
    appearance: Appearance;
    setAppearance: (appearance: Appearance) => void;
    isDark: boolean;
}

const ThemeContext = React.createContext<ThemeContextType | undefined>(undefined);

const fallbackThemeContext: ThemeContextType = {
    appearance: 'system',
    setAppearance: () => {},
    isDark: false,
};

export const useTheme = () => {
    const context = React.useContext(ThemeContext);
    return context || fallbackThemeContext;
};

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [appearance, setAppearanceState] = React.useState<Appearance>(() => {
        if (typeof window !== 'undefined') {
            const saved = localStorage.getItem('cipher-appearance') || localStorage.getItem('cliq-appearance');
            if (saved === 'light' || saved === 'dark' || saved === 'system') {
                return saved;
            }
        }
        return 'system';
    });

    const [isDark, setIsDark] = React.useState(false);

    const updateTheme = React.useCallback((currentAppearance: Appearance) => {
        const root = window.document.documentElement;
        let resolvedDark = false;

        if (currentAppearance === 'dark') {
            resolvedDark = true;
        } else if (currentAppearance === 'light') {
            resolvedDark = false;
        } else {
            // System appearance
            resolvedDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
        }

        setIsDark(resolvedDark);

        if (resolvedDark) {
            root.classList.add('dark');
        } else {
            root.classList.remove('dark');
        }
    }, []);

    const setAppearance = React.useCallback((newAppearance: Appearance) => {
        setAppearanceState(newAppearance);
        if (typeof window !== 'undefined') {
            localStorage.setItem('cipher-appearance', newAppearance);
        }
        updateTheme(newAppearance);
    }, [updateTheme]);

    // Handle system changes in real-time when in system mode
    React.useEffect(() => {
        updateTheme(appearance);

        if (appearance === 'system') {
            const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
            const listener = (e: MediaQueryListEvent) => {
                const root = window.document.documentElement;
                setIsDark(e.matches);
                if (e.matches) {
                    root.classList.add('dark');
                } else {
                    root.classList.remove('dark');
                }
            };

            mediaQuery.addEventListener('change', listener);
            return () => mediaQuery.removeEventListener('change', listener);
        }
    }, [appearance, updateTheme]);

    return (
        <ThemeContext.Provider value={{ appearance, setAppearance, isDark }}>
            {children}
        </ThemeContext.Provider>
    );
};
