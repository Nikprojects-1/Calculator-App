/**
 * Keyboard input mapping for the calculator.
 */

const IGNORE_TAGS = new Set(['INPUT', 'TEXTAREA', 'SELECT']);

export function createKeyboardHandler(handlers) {
  const {
    onInsert,
    onEquals,
    onClear,
    onClearEntry,
    onBackspace,
    onToggleHistory,
    onCopy,
    onPercent,
    onToggleAngle,
  } = handlers;

  const keyMap = {
    '0': '0', '1': '1', '2': '2', '3': '3', '4': '4',
    '5': '5', '6': '6', '7': '7', '8': '8', '9': '9',
    '.': '.', ',': '.',
    '+': '+', '-': '-', '*': '*', '/': '/',
    '(': '(', ')': ')',
    '%': '%',
    '^': '^',
    '!': '!',
  };

  return function handleKeyDown(event) {
    if (event.target && IGNORE_TAGS.has(event.target.tagName)) return;

    const key = event.key;
    const ctrl = event.ctrlKey || event.metaKey;

    if (ctrl && key.toLowerCase() === 'c') {
      event.preventDefault();
      onCopy?.();
      return;
    }

    if (ctrl && key.toLowerCase() === 'h') {
      event.preventDefault();
      onToggleHistory?.();
      return;
    }

    if (key === 'Enter' || key === '=') {
      event.preventDefault();
      onEquals?.();
      return;
    }

    if (key === 'Escape') {
      event.preventDefault();
      onClear?.();
      return;
    }

    if (key === 'Backspace') {
      event.preventDefault();
      onBackspace?.();
      return;
    }

    if (key === 'Delete') {
      event.preventDefault();
      onClearEntry?.();
      return;
    }

    if (key.toLowerCase() === 'h' && !ctrl) {
      onToggleHistory?.();
      return;
    }

    if (key.toLowerCase() === 'd' && !ctrl) {
      onToggleAngle?.('deg');
      return;
    }

    if (key.toLowerCase() === 'r' && !ctrl) {
      onToggleAngle?.('rad');
      return;
    }

    if (key === '%') {
      event.preventDefault();
      onPercent?.();
      return;
    }

    if (keyMap[key] !== undefined) {
      event.preventDefault();
      if (key === '!') {
        onInsert?.('!');
      } else {
        onInsert?.(keyMap[key]);
      }
      return;
    }

    if (key.toLowerCase() === 'p' && !ctrl) {
      event.preventDefault();
      onInsert?.('π');
      return;
    }

    if (key.toLowerCase() === 'e' && !ctrl) {
      event.preventDefault();
      onInsert?.('e');
      return;
    }

    const fnShortcuts = {
      s: 'sin(',
      c: 'cos(',
      t: 'tan(',
      l: 'log(',
    };

    if (!ctrl && fnShortcuts[key.toLowerCase()]) {
      event.preventDefault();
      onInsert?.(fnShortcuts[key.toLowerCase()]);
    }
  };
}
