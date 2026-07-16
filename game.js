/* ====================================
   WORLD STRATEGY v0.1.1 - Game Engine
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
        this.canvas.width = rect.width * window.devicePixelRatio;
        this.canvas.height = rect.height * window.devicePixelRatio;
        this.ctx.scale(window.devicePixelRatio, window.devicePixelRatio);
    }

    setupCamera() {
        this.camera = {
            x: 2500,           // Start at middle of world
            y: 2500,
            zoom: 1,
            minZoom: 0.3,
            maxZoom: 4,
            targetZoom: 1,
            zoomSpeed: 0.15    // Smooth zoom transition
        };
    }

    setupInput() {
        this.input = {
            isDragging: false,
            dragStartX: 0,
            dragStartY: 0,
            lastX: 0,
            lastY: 0,
            panSpeed: 1
        };

        // Mouse Events
        this.canvas.addEventListener('mousedown', (e) => this.onMouseDown(e));
        this.canvas.addEventListener('mousemove', (e) => this.onMouseMove(e));
        this.canvas.addEventListener('mouseup', (e) => this.onMouseUp(e));
        this.canvas.addEventListener('wheel', (e) => this.onMouseWheel(e), { passive: false });
        this.canvas.addEventListener('contextmenu', (e) => e.preventDefault());
    }

    setupGameState() {
        this.gameState = {
            money: 50000,
            oil: 10000,
            population: 1000000
        };

        this.world = {
            width: 5000,
            height: 5000,
            gridSize: 50
        };

        // Performance
        this.fps = 0;
        this.frameCount = 0;
        this.lastTime = Date.now();
    }

    init() {
        console.log('🎮 WORLD STRATEGY v0.1.1 Engine Initializing...');
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

        const zoomSpeed = 0.08;
        const direction = e.deltaY > 0 ? -1 : 1;
        this.camera.targetZoom += direction * zoomSpeed;

        this.camera.targetZoom = Math.max(
            this.camera.minZoom,
            Math.min(this.camera.maxZoom, this.camera.targetZoom)
        );
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

        // Smooth zoom transition
        this.camera.zoom += (this.camera.targetZoom - this.camera.zoom) * this.camera.zoomSpeed;

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
        // Clear canvas with background color
        this.drawBackground();

        // Save context state
        this.ctx.save();

        // Get canvas dimensions
        const width = this.canvas.width / window.devicePixelRatio;
        const height = this.canvas.height / window.devicePixelRatio;

        // Apply camera transformation
        this.ctx.translate(width / 2, height / 2);
        this.ctx.scale(this.camera.zoom, this.camera.zoom);
        this.ctx.translate(-this.camera.x, -this.camera.y);

        // Draw world grid
        this.drawGrid();

        // Restore context
        this.ctx.restore();
    }

    // ==================== DRAWING FUNCTIONS ====================
    /**
     * Draw background - fills entire screen
     */
    drawBackground() {
        const width = this.canvas.width / window.devicePixelRatio;
        const height = this.canvas.height / window.devicePixelRatio;
        
        this.ctx.fillStyle = '#0a2540';
        this.ctx.fillRect(0, 0, width, height);
    }

    /**
     * Draw strategic grid that moves with camera
     */
    drawGrid() {
        // Calculate visible grid bounds
        const gridSpacing = this.world.gridSize;
        const startX = Math.floor(this.camera.x / gridSpacing) * gridSpacing;
        const startY = Math.floor(this.camera.y / gridSpacing) * gridSpacing;

        // Grid line styling
        this.ctx.strokeStyle = 'rgba(0, 212, 255, 0.15)';
        this.ctx.lineWidth = 1;

        const width = this.canvas.width / window.devicePixelRatio / this.camera.zoom;
        const height = this.canvas.height / window.devicePixelRatio / this.camera.zoom;

        // Draw vertical grid lines
        for (let x = startX; x < this.camera.x + width; x += gridSpacing) {
            if (x >= 0 && x <= this.world.width) {
                this.ctx.beginPath();
                this.ctx.moveTo(x, this.camera.y - height / 2);
                this.ctx.lineTo(x, this.camera.y + height / 2);
                this.ctx.stroke();
            }
        }

        // Draw horizontal grid lines
        for (let y = startY; y < this.camera.y + height; y += gridSpacing) {
            if (y >= 0 && y <= this.world.height) {
                this.ctx.beginPath();
                this.ctx.moveTo(this.camera.x - width / 2, y);
                this.ctx.lineTo(this.camera.x + width / 2, y);
                this.ctx.stroke();
            }
        }

        // Draw grid coordinate labels when zoomed in
        if (this.camera.zoom >= 0.8) {
            this.drawGridLabels(startX, startY, gridSpacing);
        }

        // Draw world border
        this.drawWorldBorder();
    }

    /**
     * Draw coordinate labels on grid
     */
    drawGridLabels(startX, startY, gridSpacing) {
        this.ctx.fillStyle = 'rgba(0, 212, 255, 0.4)';
        this.ctx.font = '10px monospace';
        this.ctx.textAlign = 'left';

        for (let x = startX; x <= this.camera.x + 2000; x += gridSpacing * 2) {
            for (let y = startY; y <= this.camera.y + 2000; y += gridSpacing * 2) {
                if (x >= 0 && x <= this.world.width && y >= 0 && y <= this.world.height) {
                    const gridX = Math.floor(x / gridSpacing);
                    const gridY = Math.floor(y / gridSpacing);
                    this.ctx.fillText(`${gridX},${gridY}`, x + 3, y + 12);
                }
            }
        }
    }

    /**
     * Draw world border
     */
    drawWorldBorder() {
        this.ctx.strokeStyle = 'rgba(0, 212, 255, 0.5)';
        this.ctx.lineWidth = 2;
        this.ctx.strokeRect(0, 0, this.world.width, this.world.height);
    }
}

// ==================== START GAME ====================
document.addEventListener('DOMContentLoaded', () => {
    const game = new GameEngine();
    window.game = game; // For debugging in console
    console.log('💡 Tip: Use window.game to access the engine in console');
});
