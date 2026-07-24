/* ===================================="
   WORLD STRATEGY v0.2 - Game Engine
   ==================================== */

class GameEngine {
    constructor() {
        this.setupCanvas();
        this.setupCamera();
        this.setupInput();
        this.setupGameState();
        this.init();
    }

    // ==================== INITIALIZATION ====================
    setupCanvas() {
        this.canvas = document.getElementById('game-canvas');
        this.ctx = this.canvas.getContext('2d');
        this.resizeCanvas();
        window.addEventListener('resize', () => this.resizeCanvas());
    }

    resizeCanvas() {
        const rect = this.canvas.getBoundingClientRect();
        this.canvas.width = rect.width;
        this.canvas.height = rect.height;
    }

    setupCamera() {
        this.camera = {
            x: 0,              // Start at world center (lon 0)
            y: 0,              // Start at world center (lat 0)
            zoom: 1,
            minZoom: 0.3,
            maxZoom: 4,
            targetZoom: 1,
            zoomSpeed: 0.12,
            panX: 0,           // Smooth panning
            panY: 0,
            targetPanX: 0,
            targetPanY: 0,
            panSpeed: 0.15
        };
    }

    setupInput() {
        this.input = {
            isDragging: false,
            dragStartX: 0,
            dragStartY: 0,
            lastX: 0,
            lastY: 0
        };

        this.canvas.addEventListener('mousedown', (e) => this.onMouseDown(e));
        this.canvas.addEventListener('mousemove', (e) => this.onMouseMove(e));
        this.canvas.addEventListener('mouseup', (e) => this.onMouseUp(e));
        this.canvas.addEventListener('wheel', (e) => this.onMouseWheel(e), { passive: false });
        this.canvas.addEventListener('click', (e) => this.onClick(e));
        this.canvas.addEventListener('contextmenu', (e) => e.preventDefault());
    }

    setupGameState() {
        this.gameState = {
            money: 50000,
            oil: 10000,
            population: 1000000,
            selectedPos: null
        };

        this.world = {
            width: 5000,
            height: 5000,
            gridSize: 50
        };

        // World system modules
        this.mapLoader = new MapLoader();
        this.geoRenderer = new GeoRenderer();
        this.countries = [];

        // Performance
        this.fps = 0;
        this.frameCount = 0;
        this.lastTime = Date.now();
    }

    async init() {
        console.log('🎮 WORLD STRATEGY v0.2 Engine Initializing...');
        
        // Load GeoJSON map
        this.countries = await this.mapLoader.load();
        
        if (this.countries.length > 0) {
            // Initialize geo renderer
            this.geoRenderer.init(this.countries);
            
            // Center camera on world
            const bounds = this.geoRenderer.getWorldBounds();
            this.camera.x = (bounds.minLon + bounds.maxLon) / 2;
            this.camera.y = (bounds.minLat + bounds.maxLat) / 2;
            this.camera.panX = this.camera.x;
            this.camera.panY = this.camera.y;
            
            console.log(`✅ Loaded ${this.countries.length} countries`);
        } else {
            console.warn('⚠️ No countries loaded, map may be empty');
        }

        this.setupMenuButtons();
        this.startGameLoop();
        console.log('✅ Engine Ready!');
    }

    setupMenuButtons() {
        const buttons = document.querySelectorAll('.menu-btn');
        buttons.forEach(btn => {
            btn.addEventListener('click', (e) => {
                const action = e.target.dataset.action;
                console.log(`📌 Menu Action: ${action}`);
            });
        });
    }

    // ==================== INPUT HANDLING ====================
    onMouseDown(e) {
        if (e.button === 2) { // Right mouse button
            this.input.isDragging = true;
            this.input.dragStartX = e.clientX;
            this.input.dragStartY = e.clientY;
            this.input.lastX = e.clientX;
            this.input.lastY = e.clientY;
        }
    }

    onMouseMove(e) {
        if (this.input.isDragging) {
            const deltaX = (e.clientX - this.input.lastX) / this.camera.zoom;
            const deltaY = (e.clientY - this.input.lastY) / this.camera.zoom;

            this.input.lastX = e.clientX;
            this.input.lastY = e.clientY;

            this.camera.targetPanX -= deltaX;
            this.camera.targetPanY -= deltaY;
        }
    }

    onMouseUp(e) {
        if (e.button === 2) {
            this.input.isDragging = false;
        }
    }

    onMouseWheel(e) {
        e.preventDefault();
        const zoomSpeed = 0.08;
        const direction = e.deltaY > 0 ? -1 : 1;
        this.camera.targetZoom += direction * zoomSpeed;
        this.camera.targetZoom = Math.max(
            this.camera.minZoom,
            Math.min(this.camera.maxZoom, this.camera.targetZoom)
        );
    }

    onClick(e) {
        // Convert screen coordinates to world coordinates
        const rect = this.canvas.getBoundingClientRect();
        const screenX = e.clientX - rect.left;
        const screenY = e.clientY - rect.top;

        const worldX = (screenX - this.canvas.width / 2) / this.camera.zoom + this.camera.x;
        const worldY = (screenY - this.canvas.height / 2) / this.camera.zoom + this.camera.y;

        this.gameState.selectedPos = { x: worldX, y: worldY };
        console.log(`🎯 Clicked at: ${Math.round(worldX)}, ${Math.round(worldY)}`);
    }

    // ==================== GAME LOOP ====================
    startGameLoop() {
        const gameLoop = () => {
            this.update();
            this.render();
            requestAnimationFrame(gameLoop);
        };
        requestAnimationFrame(gameLoop);
    }

    // ==================== UPDATE ====================
    update() {
        // Calculate FPS
        const now = Date.now();
        const deltaTime = now - this.lastTime;

        this.frameCount++;
        if (deltaTime >= 1000) {
            this.fps = this.frameCount;
            this.frameCount = 0;
            this.lastTime = now;
        }

        // Smooth camera transitions
        this.camera.zoom += (this.camera.targetZoom - this.camera.zoom) * this.camera.zoomSpeed;
        this.camera.panX += (this.camera.targetPanX - this.camera.panX) * this.camera.panSpeed;
        this.camera.panY += (this.camera.targetPanY - this.camera.panY) * this.camera.panSpeed;

        this.camera.x = this.camera.panX;
        this.camera.y = this.camera.panY;

        this.updateUI();
    }

    updateUI() {
        document.getElementById('money').textContent = this.gameState.money.toLocaleString();
        document.getElementById('oil').textContent = this.gameState.oil.toLocaleString();
        document.getElementById('population').textContent = this.gameState.population.toLocaleString();

        const selectedText = this.gameState.selectedPos 
            ? `Selected: ${Math.round(this.gameState.selectedPos.x)}, ${Math.round(this.gameState.selectedPos.y)}`
            : 'Click map to select';

        const debugText = `FPS: ${this.fps} | X: ${Math.round(this.camera.x)} Y: ${Math.round(this.camera.y)} | Zoom: ${this.camera.zoom.toFixed(2)}x | ${selectedText}`;
        document.getElementById('debug-text').textContent = debugText;
    }

    // ==================== RENDER ====================
    render() {
        // Clear canvas with blue background
        this.ctx.fillStyle = '#0a2540';
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

        // Save context
        this.ctx.save();

        // Apply camera transformation
        this.ctx.translate(this.canvas.width / 2, this.canvas.height / 2);
        this.ctx.scale(this.camera.zoom, this.camera.zoom);
        this.ctx.translate(-this.camera.x, -this.camera.y);

        // Draw world
        this.drawBackground();
        this.drawCountries();
        this.drawGrid();
        this.drawSelectedPos();

        // Restore context
        this.ctx.restore();
    }

    // ==================== DRAWING FUNCTIONS ====================
    drawBackground() {
        // Ocean base
        this.ctx.fillStyle = '#0a3a5c';
        this.ctx.fillRect(-180, -90, 360, 180);

        // Subtle ocean gradient
        const gradient = this.ctx.createLinearGradient(-180, -90, 180, 90);
        gradient.addColorStop(0, 'rgba(10, 58, 92, 0)');
        gradient.addColorStop(0.5, 'rgba(15, 52, 96, 0.15)');
        gradient.addColorStop(1, 'rgba(10, 58, 92, 0)');
        this.ctx.fillStyle = gradient;
        this.ctx.fillRect(-180, -90, 360, 180);
    }

    drawCountries() {
        if (this.geoRenderer && this.geoRenderer.worldBounds) {
            this.geoRenderer.drawCountries(
                this.ctx,
                this.canvas.width,
                this.canvas.height
            );
        }
    }

    drawGrid() {
        const gridSpacing = 10; // Grid every 10 degrees
        const startX = Math.floor(this.camera.x / gridSpacing) * gridSpacing;
        const startY = Math.floor(this.camera.y / gridSpacing) * gridSpacing;

        // Grid styling
        this.ctx.strokeStyle = 'rgba(0, 212, 255, 0.1)';
        this.ctx.lineWidth = 1 / this.camera.zoom;

        const visibleWidth = this.canvas.width / this.camera.zoom;
        const visibleHeight = this.canvas.height / this.camera.zoom;

        // Vertical lines
        for (let x = startX; x < this.camera.x + visibleWidth; x += gridSpacing) {
            if (x >= -180 && x <= 180) {
                this.ctx.beginPath();
                this.ctx.moveTo(x, this.camera.y - visibleHeight);
                this.ctx.lineTo(x, this.camera.y + visibleHeight);
                this.ctx.stroke();
            }
        }

        // Horizontal lines
        for (let y = startY; y < this.camera.y + visibleHeight; y += gridSpacing) {
            if (y >= -90 && y <= 90) {
                this.ctx.beginPath();
                this.ctx.moveTo(this.camera.x - visibleWidth, y);
                this.ctx.lineTo(this.camera.x + visibleWidth, y);
                this.ctx.stroke();
            }
        }

        // Grid labels when zoomed in
        if (this.camera.zoom >= 1.2) {
            this.drawGridLabels(startX, startY, gridSpacing);
        }

        // World border
        this.ctx.strokeStyle = 'rgba(0, 212, 255, 0.4)';
        this.ctx.lineWidth = 3 / this.camera.zoom;
        this.ctx.strokeRect(-180, -90, 360, 180);
    }

    drawGridLabels(startX, startY, gridSpacing) {
        this.ctx.fillStyle = 'rgba(0, 212, 255, 0.3)';
        this.ctx.font = `${Math.max(8, 11 / this.camera.zoom)}px monospace`;
        this.ctx.textAlign = 'left';

        for (let x = startX; x <= this.camera.x + 200; x += gridSpacing) {
            for (let y = startY; y <= this.camera.y + 100; y += gridSpacing) {
                if (x >= -180 && x <= 180 && y >= -90 && y <= 90) {
                    this.ctx.fillText(`${Math.round(x)},${Math.round(y)}`, x + 5, y + 15);
                }
            }
        }
    }

    drawSelectedPos() {
        if (this.gameState.selectedPos) {
            const pos = this.gameState.selectedPos;
            
            // Draw circle marker
            this.ctx.fillStyle = 'rgba(255, 200, 0, 0.3)';
            this.ctx.beginPath();
            this.ctx.arc(pos.x, pos.y, 5, 0, Math.PI * 2);
            this.ctx.fill();

            // Draw border
            this.ctx.strokeStyle = '#ffc800';
            this.ctx.lineWidth = 1 / this.camera.zoom;
            this.ctx.beginPath();
            this.ctx.arc(pos.x, pos.y, 5, 0, Math.PI * 2);
            this.ctx.stroke();

            // Draw crosshair
            this.ctx.strokeStyle = '#ffc800';
            this.ctx.lineWidth = 0.5 / this.camera.zoom;
            this.ctx.beginPath();
            this.ctx.moveTo(pos.x - 3, pos.y);
            this.ctx.lineTo(pos.x + 3, pos.y);
            this.ctx.moveTo(pos.x, pos.y - 3);
            this.ctx.lineTo(pos.x, pos.y + 3);
            this.ctx.stroke();
        }
    }
}

// ==================== START GAME ====================
document.addEventListener('DOMContentLoaded', () => {
    const game = new GameEngine();
    window.game = game;
    console.log('💡 Commands: Right-click+drag to pan, scroll to zoom, click to select');
});
