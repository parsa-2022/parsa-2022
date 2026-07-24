/* ===================================="
   WORLD STRATEGY v0.2 - Geo Renderer
   ==================================== */

class GeoRenderer {
    constructor() {
        this.countries = [];
        this.worldBounds = null;
        this.selectedCountry = null;
    }

    /**
     * Initialize renderer with countries and world bounds
     */
    init(countries) {
        this.countries = countries;
        
        // Calculate world bounds from all countries
        this.calculateWorldBounds();
        console.log('🗺️ Geo Renderer initialized with ' + countries.length + ' countries');
    }

    /**
     * Calculate bounds of all countries
     */
    calculateWorldBounds() {
        if (this.countries.length === 0) {
            this.worldBounds = { minLon: -180, maxLon: 180, minLat: -90, maxLat: 90 };
            return;
        }

        let minLon = Infinity, maxLon = -Infinity;
        let minLat = Infinity, maxLat = -Infinity;

        this.countries.forEach(country => {
            const bounds = country.getBounds();
            minLon = Math.min(minLon, bounds.minLon);
            maxLon = Math.max(maxLon, bounds.maxLon);
            minLat = Math.min(minLat, bounds.minLat);
            maxLat = Math.max(maxLat, bounds.maxLat);
        });

        this.worldBounds = {
            minLon, maxLon, minLat, maxLat,
            width: maxLon - minLon,
            height: maxLat - minLat
        };

        console.log('📍 World bounds: Lon [' + minLon.toFixed(2) + ', ' + maxLon.toFixed(2) + '], Lat [' + minLat.toFixed(2) + ', ' + maxLat.toFixed(2) + ']');
    }

    /**
     * Get world bounds
     */
    getWorldBounds() {
        return this.worldBounds;
    }

    /**
     * Draw all countries (country polygons)
     * Countries are drawn directly with their geo coordinates
     * The camera transformation handles the projection
     */
    drawCountries(ctx) {
        if (!this.worldBounds) return;

        this.countries.forEach(country => {
            country.draw(ctx);
        });
    }

    /**
     * Draw country borders (already done in drawCountries with strokeStyle)
     */
    drawBorders(ctx) {
        // Borders are drawn as part of drawCountries
        // This method exists for clarity in the rendering pipeline
    }

    /**
     * Highlight selected country
     */
    highlightSelected(ctx) {
        if (this.selectedCountry) {
            // Already drawn with selection styling in drawCountries
        }
    }

    /**
     * Find and select country at point
     */
    selectCountryAtPoint(x, y) {
        // Deselect previous
        if (this.selectedCountry) {
            this.selectedCountry.setSelected(false);
        }

        // Find country at point
        for (let country of this.countries) {
            if (country.containsPoint(x, y)) {
                country.setSelected(true);
                this.selectedCountry = country;
                console.log('✅ Selected: ' + country.getDisplayName());
                return country;
            }
        }

        this.selectedCountry = null;
        return null;
    }

    /**
     * Handle hover at point
     */
    updateHoverAtPoint(x, y) {
        // Clear previous hovers
        this.countries.forEach(c => c.setHover(false));

        // Find country at point
        for (let country of this.countries) {
            if (country.containsPoint(x, y)) {
                country.setHover(true);
                return country;
            }
        }

        return null;
    }

    /**
     * Get selected country
     */
    getSelectedCountry() {
        return this.selectedCountry;
    }

    /**
     * Get all countries
     */
    getCountries() {
        return this.countries;
    }
}
