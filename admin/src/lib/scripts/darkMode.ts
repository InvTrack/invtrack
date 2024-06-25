import { browser } from "$app/environment";

export const toggleDarkMode = () => {
  if (browser) {
    if (!localStorage.theme) initTheme();
    if (localStorage.theme === "dark") {
      localStorage.theme = "light";
    } else {
      localStorage.theme = "dark";
    }
    reloadTheme();
  }
};

export const initTheme = () => {
  window.matchMedia("(prefers-color-scheme: dark)").matches
    ? (localStorage.theme = "dark")
    : (localStorage.theme = "light");
};

export const reloadTheme = () => {
  if (!browser) return;
  if (localStorage.theme === "dark") {
    document.documentElement.classList.add("dark");
  } else {
    document.documentElement.classList.remove("dark");
  }
};

export const getIsThemeDark = () => localStorage.theme === "dark";
