/**
 * Main application — UI wiring, events, and orchestration.
 */

import { CalculatorEngine } from './calculator.js';
import { HistoryManager, formatHistoryTime } from './history.js';
import { ThemeManager } from './themes.js';
import { createKeyboardHandler } from './keyboard.js';

const ANGLE_STORAGE_KEY = 'scientific-calc-angle';

class ScientificCalculatorApp {
  constructor() {
    this.engine = new CalculatorEngine();
    this.history = new HistoryManager();
    this.themes = new ThemeManager();

    this.cacheElements();
    this.loadAngleMode();
    this.bindEvents();
    this.initKeyboard();
    this.renderHistory();
    this.syncUI();
    this.hideLoader();
  }

  cacheElements() {
    this.$ = {
      loader: document.getElementById('appLoader'),
      container: document.getElementById('appContainer'),
      expression: document.getElementById('expressionDisplay'),
      result: document.getElementById('resultDisplay'),
      memoryIndicator: document.getElementById('memoryIndicator'),
      angleIndicator: document.getElementById('angleIndicator'),
      historySidebar: document.getElementById('historySidebar'),
      historyList: document.getElementById('historyList'),
      historyEmpty: document.getElementById('historyEmpty'),
      historyToggle: document.getElementById('historyToggle'),
      clearHistoryBtn: document.getElementById('clearHistoryBtn'),
      themeSelect: document.getElementById('themeSelect'),
      copyBtn: document.getElementById('copyBtn'),
      copyFeedback: document.getElementById('copyFeedback'),
      toast: document.getElementById('toast'),
      degBtn: document.getElementById('degBtn'),
      radBtn: document.getElementById('radBtn'),
      keypad: document.querySelector('.calculator-card'),
    };
  }

  loadAngleMode() {
    try {
      const saved = localStorage.getItem(ANGLE_STORAGE_KEY);
      if (saved === 'rad' || saved === 'deg') {
        this.engine.setAngleMode(saved);
      }
    } catch {
      /* ignore */
    }
  }

  saveAngleMode() {
    try {
      localStorage.setItem(ANGLE_STORAGE_KEY, this.engine.getAngleMode());
    } catch {
      /* ignore */
    }
  }

  hideLoader() {
    requestAnimationFrame(() => {
      this.$.loader?.classList.add('hidden');
      this.$.container?.classList.add('visible');
    });
  }

  bindEvents() {
    this.$.themeSelect.value = this.themes.getTheme();
    this.$.themeSelect.addEventListener('change', (e) => {
      this.themes.setTheme(e.target.value);
    });

    this.$.degBtn.addEventListener('click', () => this.setAngleMode('deg'));
    this.$.radBtn.addEventListener('click', () => this.setAngleMode('rad'));

    this.$.historyToggle.addEventListener('click', () => this.toggleHistory());
    this.$.clearHistoryBtn.addEventListener('click', () => this.clearHistory());
    this.$.copyBtn.addEventListener('click', () => this.copyResult());

    this.$.keypad.addEventListener('click', (e) => {
      const btn = e.target.closest('button');
      if (!btn) return;
      this.handleButton(btn);
      this.createRipple(e, btn);
    });

    this.$.historyList.addEventListener('click', (e) => {
      const item = e.target.closest('[data-history-id]');
      if (!item) return;
      const result = item.dataset.result;
      if (result) this.reuseResult(result);
    });
  }

  initKeyboard() {
    const handler = createKeyboardHandler({
      onInsert: (t) => this.insert(t),
      onEquals: () => this.calculate(),
      onClear: () => this.clear(),
      onClearEntry: () => this.clearEntry(),
      onBackspace: () => this.backspace(),
      onToggleHistory: () => this.toggleHistory(),
      onCopy: () => this.copyResult(),
      onPercent: () => this.applyPercent(),
      onToggleAngle: (mode) => this.setAngleMode(mode),
    });
    document.addEventListener('keydown', handler);
  }

  handleButton(btn) {
    const insert = btn.dataset.insert;
    const action = btn.dataset.action;

    if (insert !== undefined) {
      this.insert(insert);
      return;
    }

    switch (action) {
      case 'equals': this.calculate(); break;
      case 'clear': this.clear(); break;
      case 'clear-entry': this.clearEntry(); break;
      case 'backspace': this.backspace(); break;
      case 'percent': this.applyPercent(); break;
      case 'factorial': this.applyFactorial(); break;
      case 'memory-clear': this.memoryOp('clear'); break;
      case 'memory-recall': this.memoryOp('recall'); break;
      case 'memory-add': this.memoryOp('add'); break;
      case 'memory-subtract': this.memoryOp('subtract'); break;
      case 'memory-store': this.memoryOp('store'); break;
      default: break;
    }
  }

  insert(token) {
    try {
      if (token === '!') {
        this.engine.applyFactorial();
      } else {
        this.engine.insert(token);
      }
      this.syncUI();
    } catch (err) {
      this.showError(err.message);
    }
  }

  backspace() {
    this.engine.backspace();
    this.syncUI();
  }

  clear() {
    this.engine.clear();
    this.syncUI();
  }

  clearEntry() {
    this.engine.clearEntry();
    this.syncUI();
  }

  applyPercent() {
    try {
      this.engine.applyPercent();
      this.syncUI();
    } catch (err) {
      this.showError(err.message);
    }
  }

  applyFactorial() {
    try {
      this.engine.applyFactorial();
      this.syncUI();
    } catch (err) {
      this.showError(err.message);
    }
  }

  calculate() {
    const exprBefore = this.engine.getExpression();
    try {
      const result = this.engine.evaluate();
      this.history.add(exprBefore, result);
      this.renderHistory();
      this.syncUI();
      this.flashEquals();
    } catch (err) {
      this.showError(err.message);
      this.$.result.textContent = 'Error';
      this.$.result.classList.add('error');
    }
  }

  memoryOp(op) {
    try {
      switch (op) {
        case 'clear':
          this.engine.memoryClear();
          this.showToast('Memory cleared');
          break;
        case 'recall':
          this.engine.memoryRecall();
          break;
        case 'store':
          this.engine.memoryStore();
          this.showToast('Stored in memory');
          break;
        case 'add':
          this.engine.memoryAdd();
          this.showToast('Added to memory');
          break;
        case 'subtract':
          this.engine.memorySubtract();
          this.showToast('Subtracted from memory');
          break;
        default: break;
      }
      this.syncUI();
    } catch (err) {
      this.showError(err.message);
    }
  }

  setAngleMode(mode) {
    this.engine.setAngleMode(mode);
    this.saveAngleMode();
    this.$.degBtn.classList.toggle('active', mode === 'deg');
    this.$.radBtn.classList.toggle('active', mode === 'rad');
    this.$.angleIndicator.textContent = mode.toUpperCase();
    this.syncUI();
  }

  toggleHistory() {
    const open = this.$.historySidebar.classList.toggle('open');
    this.$.historyToggle.setAttribute('aria-expanded', String(open));
  }

  clearHistory() {
    this.history.clear();
    this.renderHistory();
    this.showToast('History cleared');
  }

  reuseResult(result) {
    this.engine.setExpression(result);
    this.engine.justEvaluated = false;
    this.syncUI();
    this.showToast('Result inserted');
  }

  async copyResult() {
    const text = this.$.result.textContent;
    if (!text || text === 'Error') return;

    try {
      await navigator.clipboard.writeText(text);
      this.$.copyBtn.classList.add('copied');
      setTimeout(() => this.$.copyBtn.classList.remove('copied'), 1500);
    } catch {
      const ta = document.createElement('textarea');
      ta.value = text;
      document.body.appendChild(ta);
      ta.select();
      document.execCommand('copy');
      document.body.removeChild(ta);
      this.$.copyBtn.classList.add('copied');
      setTimeout(() => this.$.copyBtn.classList.remove('copied'), 1500);
    }
  }

  renderHistory() {
    const entries = this.history.getAll();
    this.$.historyList.innerHTML = '';

    if (!entries.length) {
      this.$.historyEmpty.hidden = false;
      return;
    }

    this.$.historyEmpty.hidden = true;

    entries.forEach((entry, index) => {
      const li = document.createElement('li');
      li.className = 'history-item';
      li.dataset.historyId = entry.id;
      li.dataset.result = entry.result;
      li.style.animationDelay = `${index * 40}ms`;
      li.innerHTML = `
        <span class="history-time">${formatHistoryTime(entry.timestamp)}</span>
        <span class="history-expr">${this.escapeHtml(entry.expression)}</span>
        <span class="history-result">= ${this.escapeHtml(entry.result)}</span>
      `;
      li.setAttribute('role', 'button');
      li.setAttribute('tabindex', '0');
      li.setAttribute('title', 'Click to reuse result');
      li.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          this.reuseResult(entry.result);
        }
      });
      this.$.historyList.appendChild(li);
    });
  }

  escapeHtml(str) {
    const div = document.createElement('div');
    div.textContent = str;
    return div.innerHTML;
  }

  syncUI() {
    const expr = this.engine.getExpression();
    const preview = this.engine.preview();

    this.$.expression.textContent = expr || '0';
    this.$.result.textContent = preview ?? this.engine.getLastResult() ?? '0';
    this.$.result.classList.remove('error');

    this.$.memoryIndicator.hidden = !this.engine.hasMemory();
    this.$.angleIndicator.textContent = this.engine.getAngleMode().toUpperCase();
  }

  showError(message) {
    this.$.result.textContent = 'Error';
    this.$.result.classList.add('error');
    this.showToast(message);
  }

  showToast(message) {
    if (!this.$.toast) return;
    this.$.toast.textContent = message;
    this.$.toast.classList.add('show');
    clearTimeout(this._toastTimer);
    this._toastTimer = setTimeout(() => {
      this.$.toast.classList.remove('show');
    }, 2800);
  }

  flashEquals() {
    const eq = this.$.keypad.querySelector('[data-action="equals"]');
    eq?.classList.add('flash');
    setTimeout(() => eq?.classList.remove('flash'), 300);
  }

  createRipple(event, button) {
    const rect = button.getBoundingClientRect();
    const ripple = document.createElement('span');
    ripple.className = 'ripple';
    const size = Math.max(rect.width, rect.height);
    ripple.style.width = ripple.style.height = `${size}px`;
    ripple.style.left = `${event.clientX - rect.left - size / 2}px`;
    ripple.style.top = `${event.clientY - rect.top - size / 2}px`;
    button.appendChild(ripple);
    ripple.addEventListener('animationend', () => ripple.remove());
  }
}

document.addEventListener('DOMContentLoaded', () => {
  new ScientificCalculatorApp();
});
