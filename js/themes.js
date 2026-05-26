/**
 * Theme management with localStorage persistence.
 */

const STORAGE_KEY = 'scientific-calc-theme';
const VALID_THEMES = ['dark', 'light', 'neon', 'cyberpunk'];

export class ThemeManager {
  constructor(root = document.documentElement) {
    this.root = root;
    this.current = this._load();
    this._apply(this.current);
  }

  _load() {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved && VALID_THEMES.includes(saved)) return saved;
    } catch {
      /* ignore */
    }
    return 'dark';
  }

  _save(theme) {
    try {
      localStorage.setItem(STORAGE_KEY, theme);
    } catch {
      /* ignore */
    }
  }

  _apply(theme) {
    this.root.setAttribute('data-theme', theme);
    this.root.classList.add('theme-transitioning');
    window.setTimeout(() => {
      this.root.classList.remove('theme-transitioning');
    }, 400);
    this.current = theme;
    this._save(theme);
  }

  getTheme() {
    return this.current;
  }

  setTheme(theme) {
    if (!VALID_THEMES.includes(theme)) return false;
    if (theme === this.current) return true;
    this._apply(theme);
    return true;
  }

  getValidThemes() {
    return [...VALID_THEMES];
  }
}
