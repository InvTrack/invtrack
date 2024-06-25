import { browser } from "$app/environment";

export const toggleDarkMode = () => {
  if (browser) {
    if (!getTheme()) initTheme();
    if (getTheme() === "dark") {
      localStorage.setItem("theme", "light");
    } else {
      localStorage.setItem("theme", "dark");
    }
    reloadTheme();
  }
};

export const initTheme = () => {
  if (!getTheme()) {
    window.matchMedia("(prefers-color-scheme: dark)").matches
      ? localStorage.setItem("theme", "dark")
      : localStorage.setItem("theme", "light");
  }
};

export const reloadTheme = () => {
  if (!browser) return;
  if (!getTheme()) {
    initTheme();
  }
  if (getTheme() === "dark") {
    document.documentElement.classList.add("dark");
  } else {
    document.documentElement.classList.remove("dark");
  }
};

export const getTheme = () => localStorage.getItem("theme");
