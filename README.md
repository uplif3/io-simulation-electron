### 📌 **README.md**

# Electron I/O Simulation

Dieses Projekt ist eine Simulation von I/O-Elementen, die mit **Electron**, **React** und **TypeScript** entwickelt wurde. Es ermöglicht die visuelle Darstellung und Steuerung von Ein- und Ausgängen mittels serieller Kommunikation.

Die Buttons 1 - 4 sind als Keybinds 1,2,3,4 eingebunden.

---

## 🚀 Installation & Setup

### 1️⃣ **Repository klonen**

```sh
git clone https://github.com/uplif3/io-simulation-electron
cd electron
```

### 2️⃣ **Abhängigkeiten installieren**

```sh
npm install
```

---

## 🛠 **Entwicklung & Live-Vorschau**

Während der Entwicklung kannst du eine Live-Instanz mit Hot-Reloading starten:

```sh
npm run dev
```

🔹 Startet **React** mit `vite` und **Electron** parallel.

Falls du nur die **React-App** (ohne Electron) starten möchtest:

```sh
npm run dev:react
```

Falls du nur **Electron** ohne React starten möchtest:

```sh
npm run dev:electron
```

---

## 📦 **Build & Distribution**

Um eine **Produktionsversion** zu erstellen:

```sh
npm run build
```

🔹 Erstellt den React-Build und transpiliert die Electron-Dateien.

### 🎯 **Plattform-Spezifische Distribution**

Für Windows:

```sh
npm run dist:win
```

Achtung hier muss im SerialPort Modul eine Änderung passieren: [SerialPort Issue](https://github.com/serialport/node-serialport/issues/2957)

Für macOS (Apple Silicon & Intel):

```sh
npm run dist:mac
```

Für Linux:

```sh
npm run dist:linux
```

Die gebauten Installationsdateien befinden sich dann im **`dist/`**-Verzeichnis.

---

## 🔍 **Linting & Code-Qualität**

Überprüfe den Code mit ESLint:

```sh
npm run lint
```

---

## 🛠 **Technologien & Abhängigkeiten**

- **Electron**: Desktop-Anwendungslaufzeit
- **React**: UI-Framework
- **Vite**: Superschnelle Entwicklung für React
- **TypeScript**: Statisch typisierte Sprache für mehr Sicherheit
- **serialport**: Unterstützung für serielle Schnittstellen

---

## ❓ **Support**

Falls du Fragen hast oder einen Fehler findest, erstelle bitte ein **GitHub-Issue** oder kontaktiere den Autor.

👨‍💻 **Autor:** Richard Auer  
📧 **E-Mail:** [richard@auer.software](mailto:richard@auer.software)

---

### 🔹 **Was deckt diese README ab?**

✅ **Installation**  
✅ **Startoptionen für Entwicklung** (`dev`, `dev:react`, `dev:electron`)  
✅ **Build & Distribution für Windows, macOS & Linux**  
✅ **Linting & Code-Qualität**  
✅ **Technologie-Übersicht**  
✅ **Autor & Kontaktinfos**
