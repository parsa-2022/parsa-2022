/* ====================================
   WORLD STRATEGY - v0.1 Game Engine
   ==================================== */

// ==================== GAME CLASS ====================
class GameEngine {
    constructor() {
        // Canvas Setup
        this.canvas = document.getElementById('game-canvas');
        this.ctx = this.canvas.getContext('2d');
        this.canvas.width = window.innerWidth;
        this.canvas.height = window.innerHeight - 70; // Adjust for top bar

        // Camera System
        this.camera = {
            x: 0,
            y: 0,
            zoom: 1,
            minZoom: 0.5,
            maxZoom: 3
        };

        // Input System
        this.input = {
            isDragging: false,
            dragStartX: 0,
            dragStartY: 0,
            lastX: 0,
            lastY: 0
        };

        // Game State
        this.gameState = {
            money: 50000,
            oil: 10000,
            population: 1000000
        };

        // Performance Tracking
        this.fps = 0;
        this.frameCount = 0;
        this.lastTime = Date.now();

        // World Map Data
        this.world = {
            width: 5000,
            height: 5000,
            gridSize: 50
        };

        // Initialize
        this.init();
    }

    // ==================== INITIALIZATION ====================
    init() {
        console.log('🎮 WORLD STRATEGY Engine Initializing...');
        
        this.setupEventListeners();
        this.setupMenuButtons();
        this.startGameLoop();
        
        console.log('✅ Engine Ready!');
    }

    // ==================== EVENT LISTENERS ====================
    setupEventListeners() {
        // Mouse Events for Camera Control
        this.canvas.addEventListener('mousedown', (e) => this.onMouseDown(e));
        this.canvas.addEventListener('mousemove', (e) => this.onMouseMove(e));
        this.canvas.addEventListener('mouseup', (e) => this.onMouseUp(e));
        this.canvas.addEventListener('wheel', (e) => this.onMouseWheel(e), { passive: false });

        // Window Resize
        window.addEventListener('resize', () => this.onWindowResize());

        // Prevent context menu
        this.canvas.addEventListener('contextmenu', (e) => e.preventDefault());
    }

    setupMenuButtons() {
        const buttons = document.querySelectorAll('.menu-btn');
        buttons.forEach(btn => {
            btn.addEventListener('click', (e) => {
                const action = e.target.dataset.action;
                console.log(`Menu Action: ${action}`);
            });
        });
    }

    // ==================== INPUT HANDLING ====================
    onMouseDown(e) {
        // Right click for camera drag
        if (e.button === 2) {
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

            this.camera.x -= deltaX;
            this.camera.y -= deltaY;

            this.input.lastX = e.clientX;
            this.input.lastY = e.clientY;
        }
    }

    onMouseUp(e) {
        if (e.button === 2) {
            this.input.isDragging = false;
        }
    }

    onMouseWheel(e) {
        e.preventDefault();

        const zoomSpeed = 0.1;
        const direction = e.deltaY > 0 ? -1 : 1;
        const newZoom = this.camera.zoom + direction * zoomSpeed;

        this.camera.zoom = Math.max(
            this.camera.minZoom,
            Math.min(this.camera.maxZoom, newZoom)
        );
    }

    onWindowResize() {
        this.canvas.width = window.innerWidth;
        this.canvas.height = window.innerHeight - 70;
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

        // Clamp camera position to world bounds
        this.camera.x = Math.max(0, Math.min(this.camera.x, this.world.width));
        this.camera.y = Math.max(0, Math.min(this.camera.y, this.world.height));

        // Update UI
        this.updateUI();
    }

    updateUI() {
        document.getElementById('money').textContent = this.gameState.money.toLocaleString();
        document.getElementById('oil').textContent = this.gameState.oil.toLocaleString();
        document.getElementById('population').textContent = this.gameState.population.toLocaleString();

        const debugText = `FPS: ${this.fps} | X: ${Math.round(this.camera.x)} Y: ${Math.round(this.camera.y)} | Zoom: ${this.camera.zoom.toFixed(2)}x`;
        document.getElementById('debug-text').textContent = debugText;
    }

    // ==================== RENDER ====================
    render() {
        // Clear canvas
        this.ctx.fillStyle = '#0f0f0f';
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

        // Save context
        this.ctx.save();

        // Apply camera transformation
        this.ctx.translate(this.canvas.width / 2, this.canvas.height / 2);
        this.ctx.scale(this.camera.zoom, this.camera.zoom);
        this.ctx.translate(-this.camera.x - this.world.width / 2, -this.camera.y - this.world.height / 2);

        // Draw world
        this.drawWorld();

        // Restore context
        this.ctx.restore();
    }

    // ==================== WORLD RENDERING ====================
    drawWorld() {
        // Draw background (Ocean)
        this.ctx.fillStyle = '#1a4d7a';
        this.ctx.fillRect(0, 0, this.world.width, this.world.height);

        // Draw grid
        this.drawGrid();

        // Draw continents (placeholder)
        this.drawContinents();
    }

    drawGrid() {
        this.ctx.strokeStyle = 'rgba(100, 150, 200, 0.2)';
        this.ctx.lineWidth = 1;

        // Vertical lines
        for (let x = 0; x <= this.world.width; x += this.world.gridSize) {
            this.ctx.beginPath();
            this.ctx.moveTo(x, 0);
            this.ctx.lineTo(x, this.world.height);
            this.ctx.stroke();
        }

        // Horizontal lines
        for (let y = 0; y <= this.world.height; y += this.world.gridSize) {
            this.ctx.beginPath();
            this.ctx.moveTo(0, y);
            this.ctx.lineTo(this.world.width, y);
            this.ctx.stroke();
        }
    }

    drawContinents() {
        // Continent 1 (North)
        this.drawContinent(1000, 600, 600, 400, '#2d5016');

        // Continent 2 (South)
        this.drawContinent(2000, 2500, 700, 500, '#2d5016');

        // Continent 3 (East)
        this.drawContinent(3500, 1500, 500, 800, '#2d5016');

        // Continent 4 (West)
        this.drawContinent(600, 2000, 400, 600, '#2d5016');
    }

    drawContinent(x, y, width, height, color) {
        // Main continent shape (simplified rectangle with rounded corners)
        this.ctx.fillStyle = color;
        this.ctx.beginPath();
        this.ctx.roundRect(x, y, width, height, 50);
        this.ctx.fill();

        // Add border
        this.ctx.strokeStyle = '#1a3d0a';
        this.ctx.lineWidth = 2;
        this.ctx.stroke();

        // Add some variation with internal shapes
        this.ctx.fillStyle = '#3d6b1f';
        this.ctx.beginPath();
        this.ctx.arc(x + width / 3, y + height / 3, 80, 0, Math.PI * 2);
        this.ctx.fill();

        this.ctx.beginPath();
        this.ctx.arc(x + (width * 2) / 3, y + (height * 2) / 3, 100, 0, Math.PI * 2);
        this.ctx.fill();
    }
}

// ==================== INITIALIZE GAME ====================
// Wait for DOM to load
document.addEventListener('DOMContentLoaded', () => {
    const game = new GameEngine();
    window.game = game; // For debugging in console
});
