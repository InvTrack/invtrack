import { browser } from "$app/environment";

export const toggleDarkMode = () => {
  const root = document.documentElement; // Get the :root element
  if (localStorage.getItem("color-theme")) {
    if (localStorage.getItem("color-theme") === "light") {
      root.classList.remove("light");
      root.classList.add("dark");
      root.style.setProperty("color-scheme", "dark");
      localStorage.setItem("color-theme", "dark");
    } else {
      root.classList.remove("dark");
      root.classList.add("light");
      root.style.setProperty("color-scheme", "light");
      localStorage.setItem("color-theme", "light");
    }

    // if NOT set via local storage previously
  } else {
    if (root.classList.contains("dark") || root.style.getPropertyValue("color-scheme") === "dark") {
      root.classList.remove("dark");
      root.style.setProperty("color-scheme", "light");
      root.classList.add("light");
      localStorage.setItem("color-theme", "light");
    } else {
      root.classList.add("dark");
      root.style.setProperty("color-scheme", "dark");
      localStorage.setItem("color-theme", "dark");
    }
  }
};

export const initializeDarkMode = () => {
  if (!browser) return;
  const root = document.documentElement; // Get the :root element
  if (
    localStorage.getItem("color-theme") === "dark" ||
    (!("color-theme" in localStorage) && window.matchMedia("(prefers-color-scheme: dark)").matches)
  ) {
    root.classList.add("dark");
    root.style.setProperty("color-scheme", "dark");
  } else {
    root.classList.remove("dark");
    root.style.setProperty("color-scheme", "light");
  }
};

export const getIsThemeDark = () => {
  return (
    localStorage.getItem("color-theme") === "dark" ||
    document.documentElement.style.getPropertyValue("color-scheme") === "dark" ||
    document.documentElement.classList.contains("dark")
  );
};
