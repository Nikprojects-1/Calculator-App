# Scientific Calculator Web App

A premium, futuristic scientific calculator built with **HTML5**, **CSS3**, and **vanilla JavaScript**. Features glassmorphism UI, multiple themes, calculation history, full keyboard support, and responsive design for desktop, tablet, and mobile.

---

## Features

### Basic Operations
- Addition, subtraction, multiplication, division
- Percentage calculations
- Decimal support
- Parentheses (brackets)

### Scientific Functions
- Trigonometry: `sin`, `cos`, `tan`
- Inverse trig: `asin`, `acos`, `atan`
- Logarithms: `log` (base 10), `ln` (natural)
- Square root, power (`^`), factorial (`n!`)
- Constants: π (pi), e (Euler's number)
- Exponential: `exp()`
- **Degree / Radian** toggle for trig functions

### Memory
- **MC** — Memory Clear
- **MR** — Memory Recall
- **MS** — Memory Store
- **M+** — Memory Add
- **M−** — Memory Subtract

### History Panel
- Saves previous calculations (persisted in `localStorage`)
- Scrollable sidebar with animated entries
- Click any entry to reuse its result
- Clear all history

### Themes
- **Dark** (default)
- **Light**
- **Neon**
- **Cyberpunk**
- Theme preference saved automatically

### Keyboard Support
- Number keys and operators
- **Enter** — Calculate
- **Escape** — Clear (AC)
- **Backspace** — Delete last character
- **Delete** — Clear entry
- **H** — Toggle history panel
- **D** / **R** — Degree / Radian mode
- **Ctrl+C** — Copy result
- Shortcuts: **S** → sin(, **C** → cos(, **T** → tan(, **L** → log(, **P** → π

### UI
- Glassmorphism design with neon glow effects
- Button press animations and ripple effects
- Copy result button
- Live expression preview
- Loading animation on startup
- Fully responsive layout

---

## Technologies Used

| Technology | Purpose |
|------------|---------|
| HTML5 | Semantic structure |
| CSS3 | Layout, animations, themes (CSS variables) |
| JavaScript (ES Modules) | Calculator logic, history, themes, keyboard |

No frameworks or build tools required.

---

## Folder Structure

```
calculator app/
├── index.html          # Main HTML entry point
├── README.md           # Project documentation
├── css/
│   ├── style.css       # Base layout, components, animations
│   ├── themes.css      # Theme color overrides
│   └── responsive.css  # Breakpoints and mobile layout
├── js/
│   ├── app.js          # Application entry, UI events
│   ├── calculator.js   # Expression parser and math engine
│   ├── history.js      # History storage and management
│   ├── themes.js       # Theme switching and persistence
│   └── keyboard.js     # Keyboard shortcut handler
└── assets/
    └── images/         # Optional image assets
```

---

## How to Run in VS Code

### Step 1: Install Visual Studio Code
Download and install [Visual Studio Code](https://code.visualstudio.com/) if you do not already have it.

### Step 2: Open the Project Folder
1. Launch VS Code.
2. Go to **File → Open Folder**.
3. Select the `calculator app` folder containing `index.html`.

### Step 3: Install Live Server Extension
1. Open the Extensions view (`Ctrl+Shift+X` on Windows, `Cmd+Shift+X` on Mac).
2. Search for **Live Server** by Ritwick Dey.
3. Click **Install**.

### Step 4: Launch the App
1. In the Explorer panel, right-click `index.html`.
2. Select **Open with Live Server**.
3. Your default browser will open the calculator (usually at `http://127.0.0.1:5500`).

### Alternative: Open Directly in Browser
Double-click `index.html` or drag it into a browser window.  
**Note:** ES modules require a local server in some browsers; Live Server is recommended.

---

## Usage Guide

1. **Basic math** — Click number and operator buttons, then press **=** or **Enter**.
2. **Scientific functions** — Use the top row (e.g. `sin(30)` in DEG mode).
3. **Angle mode** — Switch **DEG** / **RAD** in the header before trig calculations.
4. **History** — Open the history panel (clock icon or **H**), click an entry to reuse its result.
5. **Copy** — Click the copy icon next to the result or press **Ctrl+C**.
6. **Themes** — Choose a theme from the dropdown in the header.

### Example Expressions
```
2 + 3 * 4
sin(30)
sqrt(16)
2^10
5!
log(100)
π * 2
```

---

## Customizing Themes

Themes are defined in `css/themes.css` using CSS custom properties on `[data-theme="..."]` selectors.

To add a new theme:

1. Add a `<option>` in `index.html` inside `#themeSelect`.
2. Add the theme name to `VALID_THEMES` in `js/themes.js`.
3. Create a new `[data-theme="your-theme"]` block in `css/themes.css` with variables such as:
   - `--bg-base`, `--primary`, `--accent`, `--text`, `--glass-bg`, etc.

Refer to the existing **dark**, **light**, **neon**, and **cyberpunk** blocks as templates.

---

## Keyboard Shortcuts Reference

| Key | Action |
|-----|--------|
| `0`–`9` | Insert digits |
| `.` | Decimal point |
| `+` `-` `*` `/` | Operators |
| `(` `)` | Brackets |
| `^` | Power |
| `Enter` | Calculate |
| `Escape` | Clear all (AC) |
| `Backspace` | Delete last character |
| `Delete` | Clear entry (CE) |
| `%` | Percentage |
| `H` | Toggle history |
| `D` | Degree mode |
| `R` | Radian mode |
| `P` | Insert π |
| `S` | Insert sin( |
| `C` | Insert cos( |
| `T` | Insert tan( |
| `L` | Insert log( |
| `E` | Insert e |
| `Ctrl+C` | Copy result |

---

## Browser Compatibility

| Browser | Minimum Version |
|---------|-----------------|
| Chrome | 80+ |
| Firefox | 78+ |
| Safari | 14+ |
| Edge | 80+ |

Requires support for:
- ES6 modules (`type="module"`)
- CSS `backdrop-filter`
- `localStorage`
- Clipboard API (fallback provided)

---

## Troubleshooting

| Issue | Solution |
|-------|----------|
| Blank page / module errors | Use Live Server instead of opening `file://` directly |
| History not saving | Check browser privacy settings; allow `localStorage` |
| Theme resets | Ensure cookies/storage are not blocked for the site |
| Copy button fails | Use HTTPS or localhost; grant clipboard permission |
| Trig results seem wrong | Verify DEG vs RAD mode in the header |

---

## Performance

- Expression evaluation uses a custom recursive-descent parser (no `eval()`).
- DOM updates are batched on user actions only.
- History is capped at 100 entries.
- CSS animations use GPU-friendly transforms where possible.
- Respects `prefers-reduced-motion` for accessibility.

---

## License

Free to use, modify, and deploy for personal or educational projects.
