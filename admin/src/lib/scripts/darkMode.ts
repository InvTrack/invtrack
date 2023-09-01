export const toggleDarkMode = () => {
  const root = document.documentElement; // Get the :root element
  if (localStorage.getItem("color-theme")) {
    if (localStorage.getItem("color-theme") === "light") {
      document.documentElement.classList.add("dark");
      root.style.setProperty("color-scheme", "dark");
      localStorage.setItem("color-theme", "dark");
    } else {
      document.documentElement.classList.remove("dark");
      root.style.setProperty("color-scheme", "light");
      localStorage.setItem("color-theme", "light");
    }

    // if NOT set via local storage previously
  } else {
    if (document.documentElement.classList.contains("dark")) {
      document.documentElement.classList.remove("dark");
      root.style.setProperty("color-scheme", "light");
      localStorage.setItem("color-theme", "light");
    } else {
      document.documentElement.classList.add("dark");
      root.style.setProperty("color-scheme", "dark");
      localStorage.setItem("color-theme", "dark");
    }
  }
};

export const initializeDarkMode = () => {
  const root = document.documentElement; // Get the :root element
  if (
    localStorage.getItem("color-theme") === "dark" ||
    (!("color-theme" in localStorage) && window.matchMedia("(prefers-color-scheme: dark)").matches)
  ) {
    document.documentElement.classList.add("dark");
    root.style.setProperty("color-scheme", "dark");
  } else {
    document.documentElement.classList.remove("dark");
    root.style.setProperty("color-scheme", "light");
  }
};

export const getIsThemeDark = () => {
  return document.documentElement.classList.contains("dark");
};
