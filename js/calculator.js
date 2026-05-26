/**
 * Scientific calculator engine — expression parsing and evaluation.
 */

const CONSTANTS = {
  π: Math.PI,
  pi: Math.PI,
  e: Math.E,
};

const FUNCTIONS = new Set([
  'sin', 'cos', 'tan', 'asin', 'acos', 'atan',
  'log', 'ln', 'sqrt', 'exp', 'abs',
]);

export class CalculatorEngine {
  constructor() {
    this.angleMode = 'deg';
    this.memory = 0;
    this.expression = '0';
    this.lastResult = '0';
    this.justEvaluated = false;
  }

  setAngleMode(mode) {
    this.angleMode = mode === 'rad' ? 'rad' : 'deg';
  }

  getAngleMode() {
    return this.angleMode;
  }

  getExpression() {
    return this.expression;
  }

  setExpression(expr) {
    this.expression = expr || '0';
    this.justEvaluated = false;
  }

  getLastResult() {
    return this.lastResult;
  }

  hasMemory() {
    return this.memory !== 0;
  }

  getMemory() {
    return this.memory;
  }

  memoryClear() {
    this.memory = 0;
  }

  memoryStore(value) {
    const n = this._toNumber(value ?? this.lastResult);
    if (!Number.isFinite(n)) throw new Error('Invalid memory value');
    this.memory = n;
  }

  memoryRecall() {
    this.expression = this._formatNumber(this.memory);
    this.justEvaluated = false;
    return this.expression;
  }

  memoryAdd(value) {
    const n = this._toNumber(value ?? this.lastResult);
    if (!Number.isFinite(n)) throw new Error('Invalid value');
    this.memory += n;
  }

  memorySubtract(value) {
    const n = this._toNumber(value ?? this.lastResult);
    if (!Number.isFinite(n)) throw new Error('Invalid value');
    this.memory -= n;
  }

  insert(token) {
    if (this.justEvaluated && !this._isOperatorStart(token)) {
      this.expression = '';
      this.justEvaluated = false;
    }

    if (this.expression === '0' && !this._isOperatorStart(token) && token !== '.') {
      if (token === 'π' || token === '(' || /^[a-z]/i.test(token)) {
        this.expression = '';
      } else if (token !== '0') {
        this.expression = '';
      }
    }

    this.expression += token;
    return this.expression;
  }

  backspace() {
    if (this.justEvaluated) {
      this.justEvaluated = false;
      return this.expression;
    }
    if (this.expression.length <= 1) {
      this.expression = '0';
    } else {
      this.expression = this.expression.slice(0, -1);
    }
    return this.expression;
  }

  clear() {
    this.expression = '0';
    this.justEvaluated = false;
    return this.expression;
  }

  clearEntry() {
    this.expression = '0';
    this.justEvaluated = false;
    return this.expression;
  }

  applyPercent() {
    try {
      const val = this.evaluate(this.expression);
      const result = val / 100;
      this.expression = this._formatNumber(result);
      this.justEvaluated = false;
      return this.expression;
    } catch {
      return this.expression;
    }
  }

  applyFactorial() {
    const match = this.expression.match(/(\d+(?:\.\d+)?)\s*$/);
    if (!match) throw new Error('Factorial requires a number at the end');
    const n = parseInt(match[1], 10);
    if (n < 0 || n > 170 || !Number.isInteger(Number(match[1]))) {
      throw new Error('Factorial requires a non-negative integer');
    }
    let fact = 1;
    for (let i = 2; i <= n; i++) fact *= i;
    this.expression = this.expression.slice(0, -match[0].length) + this._formatNumber(fact);
    return this.expression;
  }

  evaluate(expr = this.expression) {
    const normalized = this._normalize(expr);
    if (!normalized.trim()) throw new Error('Empty expression');

    const result = this._parseExpression(normalized);
    if (!Number.isFinite(result)) {
      throw new Error('Result is not a finite number');
    }

    const formatted = this._formatNumber(result);
    this.lastResult = formatted;
    this.expression = formatted;
    this.justEvaluated = true;
    return formatted;
  }

  preview(expr = this.expression) {
    try {
      const normalized = this._normalize(expr);
      if (!normalized.trim() || normalized === '0') return null;
      const result = this._parseExpression(normalized);
      if (!Number.isFinite(result)) return null;
      return this._formatNumber(result);
    } catch {
      return null;
    }
  }

  _isOperatorStart(token) {
    return /^[+\-*/^%)]/.test(token) || token === ')';
  }

  _normalize(expr) {
    let s = String(expr)
      .replace(/×/g, '*')
      .replace(/÷/g, '/')
      .replace(/−/g, '-')
      .replace(/\s+/g, '');

    s = s.replace(/(\d)!/g, (_, n) => `fact(${n})`);
    s = s.replace(/π/g, 'π');
    return s;
  }

  _toNumber(val) {
    if (typeof val === 'number') return val;
    const n = parseFloat(String(val).replace(/,/g, ''));
    return n;
  }

  _formatNumber(num) {
    if (Math.abs(num) < 1e-10 && num !== 0) {
      return num.toExponential(6).replace(/\.?0+e/, 'e');
    }
    if (Math.abs(num) >= 1e15 || (Math.abs(num) < 1e-6 && num !== 0)) {
      return num.toPrecision(10).replace(/\.?0+$/, '');
    }
    const rounded = Math.round(num * 1e12) / 1e12;
    let str = String(rounded);
    if (str.includes('e')) return str;
    if (str.includes('.')) str = str.replace(/\.?0+$/, '');
    return str;
  }

  _toRadians(deg) {
    return (deg * Math.PI) / 180;
  }

  _applyTrig(fn, x) {
    const angle = this.angleMode === 'deg' ? this._toRadians(x) : x;
    return fn(angle);
  }

  _applyInverseTrig(fn, x) {
    const result = fn(x);
    return this.angleMode === 'deg' ? (result * 180) / Math.PI : result;
  }

  _parseExpression(input) {
    const tokens = this._tokenize(input);
    let pos = 0;

    const peek = () => tokens[pos];
    const consume = () => tokens[pos++];

    const parseExpression = () => {
      let left = parseTerm();
      while (peek() && (peek().value === '+' || peek().value === '-')) {
        const op = consume().value;
        const right = parseTerm();
        left = op === '+' ? left + right : left - right;
      }
      return left;
    };

    const parseTerm = () => {
      let left = parsePower();
      while (peek() && (peek().value === '*' || peek().value === '/' || peek().value === '%')) {
        const op = consume().value;
        const right = parsePower();
        if (op === '*') left *= right;
        else if (op === '/') {
          if (right === 0) throw new Error('Division by zero');
          left /= right;
        } else left %= right;
      }
      return left;
    };

    const parsePower = () => {
      let left = parseUnary();
      while (peek() && peek().value === '^') {
        consume();
        const right = parseUnary();
        left = Math.pow(left, right);
      }
      return left;
    };

    const parseUnary = () => {
      if (peek()?.value === '-') {
        consume();
        return -parseUnary();
      }
      if (peek()?.value === '+') {
        consume();
        return parseUnary();
      }
      return parsePrimary();
    };

    const parsePrimary = () => {
      const token = peek();
      if (!token) throw new Error('Unexpected end of expression');

      if (token.type === 'number') {
        consume();
        return token.value;
      }

      if (token.type === 'constant') {
        consume();
        return CONSTANTS[token.value] ?? token.value;
      }

      if (token.type === 'function') {
        const name = consume().value;
        if (peek()?.value !== '(') throw new Error(`Expected ( after ${name}`);
        consume();
        const args = [];
        if (peek()?.value !== ')') {
          args.push(parseExpression());
          while (peek()?.value === ',') {
            consume();
            args.push(parseExpression());
          }
        }
        if (peek()?.value !== ')') throw new Error('Missing closing parenthesis');
        consume();
        return this._callFunction(name, args);
      }

      if (token.value === '(') {
        consume();
        const val = parseExpression();
        if (peek()?.value !== ')') throw new Error('Missing closing parenthesis');
        consume();
        return val;
      }

      throw new Error(`Unexpected token: ${token.value}`);
    };

    const result = parseExpression();
    if (pos < tokens.length) throw new Error('Invalid expression');
    return result;
  }

  _callFunction(name, args) {
    const [x] = args;
    switch (name) {
      case 'sin': return this._applyTrig(Math.sin, x);
      case 'cos': return this._applyTrig(Math.cos, x);
      case 'tan': return this._applyTrig(Math.tan, x);
      case 'asin': return this._applyInverseTrig(Math.asin, x);
      case 'acos': return this._applyInverseTrig(Math.acos, x);
      case 'atan': return this._applyInverseTrig(Math.atan, x);
      case 'log': return Math.log10(x);
      case 'ln': return Math.log(x);
      case 'sqrt':
        if (x < 0) throw new Error('Invalid input for sqrt');
        return Math.sqrt(x);
      case 'exp': return Math.exp(x);
      case 'abs': return Math.abs(x);
      case 'fact':
        if (x < 0 || !Number.isInteger(x) || x > 170) throw new Error('Invalid factorial');
        let r = 1;
        for (let i = 2; i <= x; i++) r *= i;
        return r;
      default:
        throw new Error(`Unknown function: ${name}`);
    }
  }

  _tokenize(input) {
    const tokens = [];
    let i = 0;

    while (i < input.length) {
      const ch = input[i];

      if (/\s/.test(ch)) {
        i++;
        continue;
      }

      if (/[\d.]/.test(ch)) {
        let num = '';
        while (i < input.length && /[\d.eE+-]/.test(input[i])) {
          if ((input[i] === '+' || input[i] === '-') && input[i - 1] && !/[eE]/.test(input[i - 1])) break;
          num += input[i++];
        }
        const value = parseFloat(num);
        if (Number.isNaN(value)) throw new Error('Invalid number');
        tokens.push({ type: 'number', value });
        continue;
      }

      if (ch === 'π') {
        tokens.push({ type: 'constant', value: 'π' });
        i++;
        continue;
      }

      if (/[a-z]/i.test(ch)) {
        let name = '';
        while (i < input.length && /[a-z]/i.test(input[i])) name += input[i++];
        const lower = name.toLowerCase();
        if (lower === 'pi') {
          tokens.push({ type: 'constant', value: 'π' });
        } else if (FUNCTIONS.has(lower) || lower === 'fact') {
          tokens.push({ type: 'function', value: lower });
        } else if (lower === 'e' && (!tokens.length || this._isBinaryContext(tokens))) {
          tokens.push({ type: 'constant', value: 'e' });
        } else {
          throw new Error(`Unknown identifier: ${name}`);
        }
        continue;
      }

      if ('+-*/^%(),'.includes(ch)) {
        if (ch === '-' && this._isUnaryContext(tokens)) {
          tokens.push({ type: 'operator', value: '-' });
        } else if (ch === '+' && this._isUnaryContext(tokens)) {
          tokens.push({ type: 'operator', value: '+' });
        } else {
          tokens.push({ type: 'operator', value: ch });
        }
        i++;
        continue;
      }

      throw new Error(`Invalid character: ${ch}`);
    }

    return tokens;
  }

  _isUnaryContext(tokens) {
    if (!tokens.length) return true;
    const last = tokens[tokens.length - 1];
    return last.value === '(' || last.value === ',' ||
      last.value === '+' || last.value === '-' ||
      last.value === '*' || last.value === '/' ||
      last.value === '^' || last.value === '%' ||
      last.type === 'function';
  }

  _isBinaryContext(tokens) {
    if (!tokens.length) return false;
    const last = tokens[tokens.length - 1];
    return last.type === 'number' || last.type === 'constant' ||
      last.value === ')';
  }
}
