/**
 * Aesthetic Modern Calculator
 * Features: Complete arithmetic, history log, theme switcher,
 * Web Audio haptic feedback, clipboard copy, and keyboard support.
 */

class SoundController {
  constructor() {
    this.enabled = localStorage.getItem('calc-sound') === 'true';
    this.audioCtx = null;
  }

  init() {
    if (!this.audioCtx) {
      const AudioContext = window.AudioContext || window.webkitAudioContext;
      if (AudioContext) {
        this.audioCtx = new AudioContext();
      }
    }
    if (this.audioCtx && this.audioCtx.state === 'suspended') {
      this.audioCtx.resume();
    }
  }

  playClick(type = 'default') {
    if (!this.enabled) return;
    try {
      this.init();
      if (!this.audioCtx) return;

      const osc = this.audioCtx.createOscillator();
      const gain = this.audioCtx.createGain();

      osc.type = 'sine';
      let freq = 560;
      let duration = 0.04;

      if (type === 'operator') {
        freq = 720;
        duration = 0.05;
      } else if (type === 'equals') {
        freq = 880;
        duration = 0.07;
      } else if (type === 'action') {
        freq = 420;
        duration = 0.04;
      }

      osc.frequency.setValueAtTime(freq, this.audioCtx.currentTime);
      gain.gain.setValueAtTime(0.06, this.audioCtx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.0001, this.audioCtx.currentTime + duration);

      osc.connect(gain);
      gain.connect(this.audioCtx.destination);

      osc.start();
      osc.stop(this.audioCtx.currentTime + duration);
    } catch {
      // AudioContext policy fallback
    }
  }

  toggle() {
    this.enabled = !this.enabled;
    localStorage.setItem('calc-sound', this.enabled.toString());
    return this.enabled;
  }
}

class Calculator {
  constructor(previousElement, currentElement, historyListElement, soundController) {
    this.previousElement = previousElement;
    this.currentElement = currentElement;
    this.historyListElement = historyListElement;
    this.sound = soundController;
    this.history = JSON.parse(localStorage.getItem('calc-history') || '[]');
    this.clear();
    this.renderHistory();
  }

  clear() {
    this.currentOperand = '0';
    this.previousOperand = '';
    this.operation = undefined;
    this.shouldResetScreen = false;
    this.isError = false;
    this.updateDisplay();
  }

  delete() {
    if (this.isError) {
      this.clear();
      return;
    }
    if (this.shouldResetScreen) {
      this.currentOperand = '0';
      this.shouldResetScreen = false;
      this.updateDisplay();
      return;
    }
    if (
      this.currentOperand.length === 1 ||
      (this.currentOperand.length === 2 && this.currentOperand.startsWith('-'))
    ) {
      this.currentOperand = '0';
    } else {
      this.currentOperand = this.currentOperand.slice(0, -1);
    }
    this.updateDisplay();
  }

  appendNumber(number) {
    if (this.isError) {
      this.clear();
    }
    if (this.shouldResetScreen) {
      this.currentOperand = '';
      this.shouldResetScreen = false;
    }

    // Decimal handling
    if (number === '.' && (this.currentOperand === '' || this.currentOperand === '0')) {
      this.currentOperand = '0.';
      this.updateDisplay();
      return;
    }
    if (number === '.' && this.currentOperand.includes('.')) return;

    if (this.currentOperand === '0' && number !== '.') {
      this.currentOperand = number.toString();
    } else {
      const cleanLength = this.currentOperand.replace(/[-.]/g, '').length;
      if (cleanLength >= 15) return;
      this.currentOperand = this.currentOperand.toString() + number.toString();
    }
    this.updateDisplay();
  }

  chooseOperation(operation) {
    if (this.isError) return;

    if (this.shouldResetScreen) {
      if (this.previousOperand !== '') {
        this.operation = operation;
        this.updateDisplay();
        return;
      } else {
        this.shouldResetScreen = false;
      }
    }

    if (this.currentOperand === '') return;

    if (this.previousOperand !== '') {
      this.compute();
      if (this.isError) return;
    }

    this.operation = operation;
    this.previousOperand = this.currentOperand;
    this.shouldResetScreen = true;
    this.updateDisplay();
  }

  compute() {
    let computation;
    const prev = parseFloat(this.previousOperand);
    const current = parseFloat(this.currentOperand);

    if (isNaN(prev) || isNaN(current) || !this.operation) return;

    switch (this.operation) {
      case '+':
        computation = prev + current;
        break;
      case '-':
      case '−':
        computation = prev - current;
        break;
      case '×':
      case '*':
        computation = prev * current;
        break;
      case '÷':
      case '/':
        if (current === 0) {
          this.currentOperand = 'Cannot divide by 0';
          this.previousOperand = '';
          this.operation = undefined;
          this.isError = true;
          this.updateDisplay();
          return;
        }
        computation = prev / current;
        break;
      default:
        return;
    }

    computation = this.roundResult(computation);

    // Save to history
    this.addHistoryEntry(this.previousOperand, this.operation, this.currentOperand, computation);

    this.currentOperand = computation.toString();
    this.operation = undefined;
    this.previousOperand = '';
    this.shouldResetScreen = true;
    this.updateDisplay();
  }

  negate() {
    if (this.isError || this.currentOperand === '0' || this.currentOperand === '') return;
    if (this.currentOperand.startsWith('-')) {
      this.currentOperand = this.currentOperand.slice(1);
    } else {
      this.currentOperand = '-' + this.currentOperand;
    }
    this.updateDisplay();
  }

  percent() {
    if (this.isError || this.currentOperand === '') return;
    const current = parseFloat(this.currentOperand);
    if (isNaN(current)) return;

    const result = this.roundResult(current / 100);
    this.currentOperand = result.toString();
    this.updateDisplay();
  }

  roundResult(num) {
    if (Math.abs(num) > 1e14 || (Math.abs(num) < 1e-6 && num !== 0)) {
      return parseFloat(num.toPrecision(10));
    }
    return Math.round((num + Number.EPSILON) * 1e10) / 1e10;
  }

  getDisplayNumber(number) {
    if (this.isError) return number;
    const stringNumber = number.toString();
    if (stringNumber.includes('e')) return stringNumber;

    const parts = stringNumber.split('.');
    const integerDigits = parseFloat(parts[0]);
    const decimalDigits = parts[1];
    let integerDisplay;

    if (isNaN(integerDigits)) {
      integerDisplay = '';
    } else {
      integerDisplay = integerDigits.toLocaleString('en', {
        maximumFractionDigits: 0
      });
      if (stringNumber.startsWith('-') && integerDigits === 0) {
        integerDisplay = '-' + integerDisplay;
      }
    }

    return decimalDigits != null ? `${integerDisplay}.${decimalDigits}` : integerDisplay;
  }

  updateDisplay() {
    if (this.isError) {
      this.currentElement.innerText = this.currentOperand;
      this.previousElement.innerText = '';
      this.currentElement.style.fontSize = '1.45rem';
      return;
    }

    this.currentElement.innerText = this.getDisplayNumber(this.currentOperand);

    // Dynamic responsive font size
    const len = this.currentElement.innerText.length;
    if (len > 13) {
      this.currentElement.style.fontSize = '1.4rem';
    } else if (len > 9) {
      this.currentElement.style.fontSize = '1.9rem';
    } else {
      this.currentElement.style.fontSize = '2.6rem';
    }

    if (this.operation != null) {
      this.previousElement.innerText = `${this.getDisplayNumber(this.previousOperand)} ${this.operation}`;
    } else {
      this.previousElement.innerText = '';
    }
  }

  addHistoryEntry(prev, op, curr, result) {
    const entry = {
      equation: `${this.getDisplayNumber(prev)} ${op} ${this.getDisplayNumber(curr)}`,
      result: this.getDisplayNumber(result),
      rawResult: result.toString()
    };
    this.history.unshift(entry);
    if (this.history.length > 20) this.history.pop();
    localStorage.setItem('calc-history', JSON.stringify(this.history));
    this.renderHistory();
  }

  renderHistory() {
    if (!this.historyListElement) return;
    if (this.history.length === 0) {
      this.historyListElement.innerHTML = '<p class="history-empty">No calculations yet</p>';
      return;
    }

    this.historyListElement.innerHTML = '';
    this.history.forEach((item) => {
      const itemEl = document.createElement('div');
      itemEl.className = 'history-item';
      itemEl.innerHTML = `
        <span class="history-equation">${item.equation} =</span>
        <span class="history-result">${item.result}</span>
      `;
      itemEl.addEventListener('click', () => {
        this.currentOperand = item.rawResult;
        this.shouldResetScreen = true;
        this.updateDisplay();
        document.getElementById('history-panel').classList.remove('open');
      });
      this.historyListElement.appendChild(itemEl);
    });
  }

  clearHistory() {
    this.history = [];
    localStorage.removeItem('calc-history');
    this.renderHistory();
  }
}

// ==========================================================================
// Setup Application & Event Listeners
// ==========================================================================

document.addEventListener('DOMContentLoaded', () => {
  const previousOperandElement = document.getElementById('previous-operand');
  const currentOperandElement = document.getElementById('current-operand');
  const historyListElement = document.getElementById('history-list');
  const soundToggleBtn = document.getElementById('sound-toggle');
  const soundIcon = document.getElementById('sound-icon');
  const themeToggleBtn = document.getElementById('theme-toggle');
  const themeIcon = document.getElementById('theme-icon');
  const historyToggleBtn = document.getElementById('history-toggle');
  const historyPanel = document.getElementById('history-panel');
  const clearHistoryBtn = document.getElementById('clear-history');
  const displayContainer = document.getElementById('display-container');
  const copyBadge = document.getElementById('copy-badge');

  const sound = new SoundController();
  const calculator = new Calculator(
    previousOperandElement,
    currentOperandElement,
    historyListElement,
    sound
  );

  // Update initial sound icon
  if (soundIcon) {
    soundIcon.innerText = sound.enabled ? '🔔' : '🔕';
  }

  // Sound toggle button
  soundToggleBtn.addEventListener('click', () => {
    const isEnabled = sound.toggle();
    soundIcon.innerText = isEnabled ? '🔔' : '🔕';
    sound.playClick('action');
  });

  // Theme setup and toggle
  const savedTheme = localStorage.getItem('calc-theme') || 'dark';
  document.documentElement.setAttribute('data-theme', savedTheme);
  themeIcon.innerText = savedTheme === 'dark' ? '🌙' : '☀️';

  themeToggleBtn.addEventListener('click', () => {
    sound.playClick('action');
    const currentTheme = document.documentElement.getAttribute('data-theme');
    const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
    document.documentElement.setAttribute('data-theme', newTheme);
    localStorage.setItem('calc-theme', newTheme);
    themeIcon.innerText = newTheme === 'dark' ? '🌙' : '☀️';
  });

  // History panel toggle
  historyToggleBtn.addEventListener('click', (e) => {
    e.stopPropagation();
    sound.playClick('action');
    historyPanel.classList.toggle('open');
  });

  clearHistoryBtn.addEventListener('click', (e) => {
    e.stopPropagation();
    sound.playClick('action');
    calculator.clearHistory();
  });

  // Close history panel when clicking outside
  document.addEventListener('click', (e) => {
    if (!historyPanel.contains(e.target) && e.target !== historyToggleBtn) {
      historyPanel.classList.remove('open');
    }
  });

  // Copy result to clipboard
  displayContainer.addEventListener('click', () => {
    const textToCopy = calculator.currentOperand;
    if (textToCopy && !calculator.isError) {
      navigator.clipboard.writeText(textToCopy).then(() => {
        sound.playClick('action');
        copyBadge.classList.add('visible');
        setTimeout(() => copyBadge.classList.remove('visible'), 1200);
      }).catch(() => {});
    }
  });

  // Number buttons
  document.querySelectorAll('[data-number]').forEach((button) => {
    button.addEventListener('click', () => {
      sound.playClick('default');
      calculator.appendNumber(button.getAttribute('data-number'));
    });
  });

  // Operator buttons
  document.querySelectorAll('[data-operator]').forEach((button) => {
    button.addEventListener('click', () => {
      sound.playClick('operator');
      calculator.chooseOperation(button.getAttribute('data-operator'));
    });
  });

  // Action buttons
  document.querySelectorAll('[data-action]').forEach((button) => {
    button.addEventListener('click', () => {
      const action = button.getAttribute('data-action');
      if (action === 'calculate') {
        sound.playClick('equals');
        calculator.compute();
      } else {
        sound.playClick('action');
        switch (action) {
          case 'clear':
            calculator.clear();
            break;
          case 'delete':
            calculator.delete();
            break;
          case 'negate':
            calculator.negate();
            break;
          case 'percent':
            calculator.percent();
            break;
        }
      }
    });
  });

  // Keyboard accessibility
  window.addEventListener('keydown', (e) => {
    let buttonToHighlight = null;

    if ((e.key >= '0' && e.key <= '9') || e.key === '.') {
      sound.playClick('default');
      calculator.appendNumber(e.key);
      buttonToHighlight = document.querySelector(`[data-number="${e.key}"]`);
    } else if (e.key === '+' || e.key === '-') {
      sound.playClick('operator');
      calculator.chooseOperation(e.key);
      buttonToHighlight = document.querySelector(`[data-operator="${e.key}"]`);
    } else if (e.key === '*') {
      sound.playClick('operator');
      calculator.chooseOperation('×');
      buttonToHighlight = document.querySelector(`[data-operator="×"]`);
    } else if (e.key === '/') {
      e.preventDefault();
      sound.playClick('operator');
      calculator.chooseOperation('÷');
      buttonToHighlight = document.querySelector(`[data-operator="÷"]`);
    } else if (e.key === 'Enter' || e.key === '=') {
      e.preventDefault();
      sound.playClick('equals');
      calculator.compute();
      buttonToHighlight = document.querySelector(`[data-action="calculate"]`);
    } else if (e.key === 'Backspace') {
      sound.playClick('action');
      calculator.delete();
      buttonToHighlight = document.querySelector(`[data-action="delete"]`);
    } else if (e.key === 'Escape' || e.key.toLowerCase() === 'c') {
      sound.playClick('action');
      calculator.clear();
      buttonToHighlight = document.querySelector(`[data-action="clear"]`);
    } else if (e.key === '%') {
      sound.playClick('action');
      calculator.percent();
      buttonToHighlight = document.querySelector(`[data-action="percent"]`);
    }

    if (buttonToHighlight) {
      buttonToHighlight.classList.add('key-active');
      setTimeout(() => buttonToHighlight.classList.remove('key-active'), 120);
    }
  });
});
