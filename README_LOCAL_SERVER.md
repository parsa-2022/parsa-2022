# Running WORLD STRATEGY Locally

## Quick Start

The game requires a local web server to load GeoJSON assets correctly (CORS restriction).

### Option 1: Using npm (Recommended)
```bash
npm install
npm run dev
```
This will:
1. Install http-server
2. Start server on http://localhost:8080
3. Automatically open the game in your browser

### Option 2: Using npm (Manual start)
```bash
npm install
npm start
```
Then open http://localhost:8080 in your browser.

### Option 3: Using Python (if npm not available)
```bash
npm run serve
```
Then open http://localhost:8080 in your browser.

### Option 4: Using Node.js built-in (No installation needed)
Simply run:
```bash
node -e "require('http').createServer((q,s)=>require('fs').existsSync(u=q.url.slice(1))?s.end(require('fs').readFileSync(u)):s.writeHead(404)&s.end()).listen(8080)"
```
Then open http://localhost:8080 in your browser.

## Troubleshooting

### "Failed to fetch" error
Make sure you're using a web server (http://localhost:port) and NOT opening index.html directly (file:// protocol).

### Port already in use
Change the port number:
```bash
npx http-server -p 3000 -c-1
```

### CORS errors
These should be resolved by using any of the server options above.

## Controls
- **Right-click + Drag**: Pan camera
- **Mouse Wheel**: Zoom in/out
- **Left-click**: Select location on map

## Game Features
- Real world map from countries.geojson
- Geographic coordinates system
- Smooth camera panning and zooming
- Resource tracking (Money, Oil, Population)
- Debug FPS counter
