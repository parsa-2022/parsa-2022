/* ====================================
   WORLD STRATEGY v0.2 - Country Object
   ==================================== */

class Country {
    constructor(id, name, geometry, properties = {}) {
        this.id = id;
        this.name = name;
        this.geometry = geometry;
        this.properties = properties;
        this.selected = false;
        this.hover = false;
        
        // Cache for coordinate conversion
        this._bounds = null;
    }

    /**
     * Get country bounds
     */
    getBounds() {
        if (this._bounds) return this._bounds;

        let minX = Infinity, maxX = -Infinity;
        let minY = Infinity, maxY = -Infinity;

        this._forEachCoordinate((lon, lat) => {
            minX = Math.min(minX, lon);
            maxX = Math.max(maxX, lon);
            minY = Math.min(minY, lat);
            maxY = Math.max(maxY, lat);
        });

        this._bounds = {
            minLon: minX, maxLon: maxX,
            minLat: minY, maxLat: maxY,
            width: maxX - minX,
            height: maxY - minY
        };

        return this._bounds;
    }

    /**
     * Convert geographic coordinates to canvas coordinates
     * Longitude (x) -> left to right
     * Latitude (y) -> top to bottom (inverted)
     */
    geoToCanvas(lon, lat, worldBounds, canvasWidth, canvasHeight) {
        const x = ((lon - worldBounds.minLon) / worldBounds.width) * canvasWidth;
        const y = ((worldBounds.maxLat - lat) / worldBounds.height) * canvasHeight;
        return { x, y };
    }

    /**
     * Check if point is inside country using ray casting algorithm
     */
    containsPoint(x, y, worldBounds, canvasWidth, canvasHeight) {
        if (!this.geometry) return false;

        const type = this.geometry.type;
        const polygons = type === 'Polygon' 
            ? [this.geometry.coordinates[0]] 
            : this.geometry.coordinates.map(p => p[0]);

        for (let polygon of polygons) {
            if (this._pointInPolygon(x, y, polygon, worldBounds, canvasWidth, canvasHeight)) {
                return true;
            }
        }
        return false;
    }

    /**
     * Ray casting algorithm for point-in-polygon test
     */
    _pointInPolygon(x, y, polygon, worldBounds, canvasWidth, canvasHeight) {
        let inside = false;
        for (let i = 0, j = polygon.length - 1; i < polygon.length; j = i++) {
            const { x: xi, y: yi } = this.geoToCanvas(polygon[i][0], polygon[i][1], worldBounds, canvasWidth, canvasHeight);
            const { x: xj, y: yj } = this.geoToCanvas(polygon[j][0], polygon[j][1], worldBounds, canvasWidth, canvasHeight);

            const intersect = ((yi > y) !== (yj > y)) && (x < (xj - xi) * (y - yi) / (yj - yi) + xi);
            if (intersect) inside = !inside;
        }
        return inside;
    }

    /**
     * Draw country on canvas
     */
    draw(ctx, worldBounds, canvasWidth, canvasHeight) {
        if (!this.geometry) return;

        const type = this.geometry.type;

        if (type === 'Polygon') {
            this._drawPolygon(ctx, this.geometry.coordinates[0], worldBounds, canvasWidth, canvasHeight);
        } else if (type === 'MultiPolygon') {
            this.geometry.coordinates.forEach(polygon => {
                this._drawPolygon(ctx, polygon[0], worldBounds, canvasWidth, canvasHeight);
            });
        }
    }

    /**
     * Draw a single polygon
     */
    _drawPolygon(ctx, coordinates, worldBounds, canvasWidth, canvasHeight) {
        if (!coordinates || coordinates.length === 0) return;

        ctx.beginPath();

        coordinates.forEach((coord, index) => {
            const { x, y } = this.geoToCanvas(coord[0], coord[1], worldBounds, canvasWidth, canvasHeight);

            if (index === 0) {
                ctx.moveTo(x, y);
            } else {
                ctx.lineTo(x, y);
            }
        });

        ctx.closePath();

        // Fill
        if (this.selected) {
            ctx.fillStyle = 'rgba(0, 212, 255, 0.4)';
        } else if (this.hover) {
            ctx.fillStyle = 'rgba(0, 212, 255, 0.2)';
        } else {
            ctx.fillStyle = 'rgba(0, 100, 150, 0.15)';
        }
        ctx.fill();

        // Border
        if (this.selected) {
            ctx.strokeStyle = '#00d4ff';
            ctx.lineWidth = 2;
        } else if (this.hover) {
            ctx.strokeStyle = '#0099cc';
            ctx.lineWidth = 1.5;
        } else {
            ctx.strokeStyle = '#005599';
            ctx.lineWidth = 0.8;
        }
        ctx.stroke();
    }

    /**
     * Iterate through all coordinates
     */
    _forEachCoordinate(callback) {
        if (!this.geometry) return;

        const type = this.geometry.type;

        if (type === 'Polygon') {
            this.geometry.coordinates.forEach(ring => {
                ring.forEach(coord => {
                    callback(coord[0], coord[1]);
                });
            });
        } else if (type === 'MultiPolygon') {
            this.geometry.coordinates.forEach(polygon => {
                polygon.forEach(ring => {
                    ring.forEach(coord => {
                        callback(coord[0], coord[1]);
                    });
                });
            });
        }
    }

    /**
     * Set selection state
     */
    setSelected(selected) {
        this.selected = selected;
    }

    /**
     * Set hover state
     */
    setHover(hover) {
        this.hover = hover;
    }

    /**
     * Get country display name
     */
    getDisplayName() {
        return this.name;
    }
}
