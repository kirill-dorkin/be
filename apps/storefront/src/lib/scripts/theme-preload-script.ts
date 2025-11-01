export const themePreloadScript = `
try {
  // Force light theme only - dark theme is disabled for now
  // If you want to re-enable dark theme in the future, restore the original logic
  document.documentElement.classList.remove("dark");
  // Clear any dark theme stored in localStorage to prevent flashing
  if (localStorage.getItem("theme") === "dark") {
    localStorage.setItem("theme", "light");
  }
} catch(e) {}
`;
