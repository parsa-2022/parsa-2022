/* ====================================
   Country.js - Country Data Object
   ==================================== */

class Country {
    constructor(feature) {
        this.id = feature.properties['ISO3166-1-Alpha-2'] || 'UN';
        this.name = feature.properties.name || 'Unknown';
        this.geometry = feature.geometry;
        this.selected = false;
        this.color = '#2d5016';
        this.borderColor = '#1a3d0a';
        this.boundingBox = this.calculateBounds();
    }

    calculateBounds() {
        let minLon = Infinity, maxLon = -Infinity;
        let minLat = Infinity, maxLat = -Infinity;

        if (this.geometry.type === 'MultiPolygon') {
            this.geometry.coordinates.forEach(polygon => {
                polygon.forEach(ring => {
                    ring.forEach(coord => {
                        const [lon, lat] = coord;
                        minLon = Math.min(minLon, lon);
                        maxLon = Math.max(maxLon, lon);
                        minLat = Math.min(minLat, lat);
                        maxLat = Math.max(maxLat, lat);
                    });
                });
            });
        } else if (this.geometry.type === 'Polygon') {
            this.geometry.coordinates.forEach(ring => {
                ring.forEach(coord => {
                    const [lon, lat] = coord;
                    minLon = Math.min(minLon, lon);
                    maxLon = Math.max(maxLon, lon);
                    minLat = Math.min(minLat, lat);
                    maxLat = Math.max(maxLat, lat);
                });
            });
        }

        return { minLon, maxLon, minLat, maxLat };
    }

    select() {
        this.selected = true;
        this.color = '#ffc800';
    }

    deselect() {
        this.selected = false;
        this.color = '#2d5016';
    }

    isPointInside(lon, lat) {
        // Simple bounding box check first
        if (lon < this.boundingBox.minLon || lon > this.boundingBox.maxLon ||
            lat < this.boundingBox.minLat || lat > this.boundingBox.maxLat) {
            return false;
        }

        // Ray casting algorithm for precise point-in-polygon
        return this.pointInPolygon(lon, lat);
    }

    pointInPolygon(lon, lat) {
        let inside = false;
        let polygons = [];

        if (this.geometry.type === 'MultiPolygon') {
            polygons = this.geometry.coordinates;
        } else if (this.geometry.type === 'Polygon') {
            polygons = [this.geometry.coordinates];
        }

        for (let polygon of polygons) {
            const ring = polygon[0]; // Outer ring
            for (let i = 0, j = ring.length - 1; i < ring.length; j = i++) {
                const [lon1, lat1] = ring[i];
                const [lon2, lat2] = ring[j];

                if ((lat1 > lat) !== (lat2 > lat) &&
                    lon < (lon2 - lon1) * (lat - lat1) / (lat2 - lat1) + lon1) {
                    inside = !inside;
                }
            }
        }

        return inside;
    }
}
