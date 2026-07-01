import { ref, watchEffect } from "vue";

const THEME_KEY = "theme";
const prefersDark = window.matchMedia?.("(prefers-color-scheme: dark)").matches;
const storedTheme = localStorage.getItem(THEME_KEY);

const isDark = ref(storedTheme ? storedTheme === "dark" : !!prefersDark);

watchEffect(() => {
  document.documentElement.classList.toggle("dark", isDark.value);
  localStorage.setItem(THEME_KEY, isDark.value ? "dark" : "light");
});

export function useTheme() {
  function toggleTheme() {
    isDark.value = !isDark.value;
  }

  return { isDark, toggleTheme };
}
