# WORLD STRATEGY v0.1

A web-based strategy game built with Vite and PixiJS.

## Foundation Features (v0.1)

- **Game Engine**: Core PixiJS application with game loop
- **Camera System**: Pan and zoom viewport controls
- **Input Management**: Right-click drag to pan, mouse wheel to zoom
- **UI Framework**: Top resource bar and side menu

## Prerequisites

- Node.js (v16 or higher)
- npm

## Installation

```bash
npm install
```

## Running the Project

### Development Server

```bash
npm run dev
```

The game will start at `http://localhost:5173`

### Build for Production

```bash
npm run build
```

### Preview Production Build

```bash
npm preview
```

## Controls

- **Right-click + Drag**: Pan the camera around the map
- **Mouse Wheel**: Zoom in/out (0.5x - 3x)

## Project Structure

```
WORLD-STRATEGY/
├── src/
│   ├── main.js              # Entry point
│   ├── game/
│   │   ├── Game.js          # Main game class
│   │   ├── Camera.js        # Camera system (pan/zoom)
│   │   └── InputManager.js  # Input handling
│   └── ui/
│       └── UIManager.js     # UI elements (top bar, side menu)
├── index.html               # HTML template
├── package.json
├── vite.config.js
└── .gitignore
```

## Next Steps (v0.2)

- Game world generation
- Tile system
- Placeable structures/entities
- Game state management
