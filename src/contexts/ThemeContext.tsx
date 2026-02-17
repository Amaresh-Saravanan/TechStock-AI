import { createContext, useContext, useState, useEffect, ReactNode } from "react";

type Theme = "A" | "B";

interface ThemeContextType {
  theme: Theme;
  toggleTheme: () => void;
  setTheme: (theme: Theme) => void;
}

const ThemeContext = createContext<ThemeContextType | null>(null);

const STORAGE_KEY = "techstock-ui-theme";

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setThemeState] = useState<Theme>(() => {
    if (typeof window !== "undefined") {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored === "A" || stored === "B") return stored;
    }
    return "A"; // Default to Theme A (dark)
  });

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, theme);
    
    // Update document classes
    const root = document.documentElement;
    root.classList.remove("theme-a", "theme-b", "dark");
    
    if (theme === "A") {
      root.classList.add("theme-a", "dark");
    } else {
      root.classList.add("theme-b");
    }
  }, [theme]);

  const toggleTheme = () => {
    setThemeState((prev) => (prev === "A" ? "B" : "A"));
  };

  const setTheme = (newTheme: Theme) => {
    setThemeState(newTheme);
  };

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme, setTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error("useTheme must be used within a ThemeProvider");
  }
  return context;
}
