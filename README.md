# ✨ Aesthetic Calculator

A modern, aesthetic, and responsive web calculator built with HTML5, CSS3, and modern Vanilla JavaScript, configured as an **NPM package powered by Vite**.

![Aesthetic Calculator Preview](https://img.shields.io/badge/Aesthetic-UI%20%26%20Glassmorphism-6366f1?style=for-the-badge)
![NPM Compatible](https://img.shields.io/badge/npm-run%20dev-ec4899?style=for-the-badge)

---

## 🎨 Key Aesthetic & Functional Features

- **Aurora Glassmorphism**: Frosted glass card with dynamic floating ambient background orbs.
- **🌓 Dark & Light Theme Switcher**: Toggle seamlessly between *Dark Obsidian Neon* and *Light Pastel Cloud* modes (persisted in `localStorage`).
- **🕒 Calculation History Flyout**: View recent calculations, click any past entry to load its result back onto the display, or clear history anytime.
- **🔊 Web Audio Haptic Feedback**: Satisfying tactile click tones synthesized natively in real-time via the Web Audio API (with an instant mute toggle 🔔/🔕).
- **📋 Click to Copy**: Click on the display value anytime to copy the result directly to your clipboard with visual tooltip confirmation.
- **🧮 Smart Arithmetic Engine**:
  - Full arithmetic (`+`, `−`, `×`, `÷`) with chaining.
  - Percentage (`%`), sign negation (`±`), backspace (`⌫`), and clear all (`AC`).
  - Floating-point precision error fix (e.g., `0.1 + 0.2 = 0.3`).
  - Division-by-zero protection.
  - Dynamic responsive font scaling to prevent long numbers from clipping.
- **⌨️ Complete Keyboard Support**: Tactile button press animations triggered both by mouse clicks and physical keyboard keys.

---

## 🚀 Getting Started

### 1. Prerequisites (Node.js & npm)
Make sure you have [Node.js](https://nodejs.org/) installed on your machine.

> **Mac Users**: If Node.js is not installed yet, download the macOS installer directly from [nodejs.org](https://nodejs.org/), or install it with Homebrew:
> ```bash
> brew install node
> ```

Verify installation by running:
```bash
node -v
npm -v
```

---

### 2. Install Dependencies
In the root directory of the project, run:
```bash
npm install
```

---

### 3. Run the Development Server
Start the local development server with Vite:
```bash
npm run dev
```

This starts the Vite server at `http://localhost:3000` and automatically opens the calculator in your default browser.

---

### 4. Build for Production
To bundle and optimize the project for production deployment:
```bash
npm run build
```

To locally preview the production build:
```bash
npm run preview
```

---

## ⌨️ Keyboard Shortcuts Reference

| Key | Action |
| :--- | :--- |
| `0` – `9` | Enter digit |
| `.` | Decimal point |
| `+` | Addition |
| `-` | Subtraction |
| `*` | Multiplication (`×`) |
| `/` | Division (`÷`) |
| `Enter` or `=` | Calculate result (`=`) |
| `Backspace` | Delete last character (`⌫`) |
| `Escape` or `C` / `c` | Clear all (`AC`) |
| `%` | Percentage calculation |

---

## 📁 Project Structure

```
calculator/
├── index.html       # Semantic HTML layout with app header, history panel & keypad
├── style.css        # Aesthetic glassmorphic styling, animations & theme definitions
├── script.js        # Calculator logic, Web Audio synthesizer, history & event listeners
├── package.json     # NPM package manifest with scripts (dev, build, preview)
├── vite.config.js   # Vite server configuration (port 3000, auto-open)
├── .gitignore       # Git ignore rules for node_modules & build output
└── README.md        # Comprehensive documentation & setup instructions
```
