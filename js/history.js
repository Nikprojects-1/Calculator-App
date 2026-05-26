/**
 * Calculation history — persistence and UI helpers.
 */

const STORAGE_KEY = 'scientific-calc-history';
const MAX_ENTRIES = 100;

export class HistoryManager {
  constructor() {
    this.entries = this._load();
  }

  _load() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return [];
      const parsed = JSON.parse(raw);
      return Array.isArray(parsed) ? parsed : [];
    } catch {
      return [];
    }
  }

  _save() {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(this.entries));
    } catch {
      /* quota exceeded — trim and retry */
      this.entries = this.entries.slice(0, 50);
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(this.entries));
      } catch {
        /* ignore */
      }
    }
  }

  add(expression, result) {
    const entry = {
      id: `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`,
      expression: String(expression),
      result: String(result),
      timestamp: Date.now(),
    };
    this.entries.unshift(entry);
    if (this.entries.length > MAX_ENTRIES) {
      this.entries = this.entries.slice(0, MAX_ENTRIES);
    }
    this._save();
    return entry;
  }

  clear() {
    this.entries = [];
    this._save();
  }

  getAll() {
    return [...this.entries];
  }

  remove(id) {
    this.entries = this.entries.filter((e) => e.id !== id);
    this._save();
  }
}

export function formatHistoryTime(timestamp) {
  const date = new Date(timestamp);
  return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}
