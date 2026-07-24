/* ===================================="
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
     * Convert geographic coordinates to world coordinates (in geo space -180 to 180, -90 to 90)
     * Longitude (x) stays as is: -180 to 180
     * Latitude (y) is inverted: 90 to -90 (top to bottom in canvas)
     */
    geoToWorld(lon, lat) {
        // Return geo coordinates directly - camera will handle projection
        return { x: lon, y: lat };
    }

    /**
     * Check if point is inside country using ray casting algorithm
     */
    containsPoint(x, y) {
        if (!this.geometry) return false;

        const type = this.geometry.type;
        const polygons = type === 'Polygon' 
            ? [this.geometry.coordinates[0]] 
            : this.geometry.coordinates.map(p => p[0]);

        for (let polygon of polygons) {
            if (this._pointInPolygon(x, y, polygon)) {
                return true;
            }
        }
        return false;
    }

    /**
     * Ray casting algorithm for point-in-polygon test
     */
    _pointInPolygon(x, y, polygon) {
        let inside = false;
        for (let i = 0, j = polygon.length - 1; i < polygon.length; j = i++) {
            const xi = polygon[i][0];
            const yi = polygon[i][1];
            const xj = polygon[j][0];
            const yj = polygon[j][1];

            const intersect = ((yi > y) !== (yj > y)) && (x < (xj - xi) * (y - yi) / (yj - yi) + xi);
            if (intersect) inside = !inside;
        }
        return inside;
    }

    /**
     * Draw country on canvas
     */
    draw(ctx) {
        if (!this.geometry) return;

        const type = this.geometry.type;

        if (type === 'Polygon') {
            this._drawPolygon(ctx, this.geometry.coordinates[0]);
        } else if (type === 'MultiPolygon') {
            this.geometry.coordinates.forEach(polygon => {
                this._drawPolygon(ctx, polygon[0]);
            });
        }
    }

    /**
     * Draw a single polygon
     */
    _drawPolygon(ctx, coordinates) {
        if (!coordinates || coordinates.length === 0) return;

        ctx.beginPath();

        coordinates.forEach((coord, index) => {
            const x = coord[0];
            const y = coord[1];

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
