/* ====================================
   WORLD STRATEGY v0.2 - Map Loader
   ==================================== */

class MapLoader {
    constructor() {
        this.countries = [];
        this.geoJsonData = null;
    }

    /**
     * Load countries.geojson from assets
     */
    async load() {
        try {
            console.log('🔄 Loading GeoJSON from assets/maps/countries.geojson...');
            const response = await fetch('assets/maps/countries.geojson');
            if (!response.ok) {
                throw new Error(`Failed to load GeoJSON: ${response.status}`);
            }
            this.geoJsonData = await response.json();
            console.log('✅ GeoJSON loaded successfully');
            console.log('📊 Number of GeoJSON features: ' + this.geoJsonData.features.length);
            
            if (this.geoJsonData.features.length > 0) {
                const firstFeature = this.geoJsonData.features[0];
                console.log('📍 First feature geometry type: ' + firstFeature.geometry.type);
                console.log('📛 First feature name: ' + (firstFeature.properties?.name || 'Unknown'));
                
                if (firstFeature.geometry.type === 'Polygon') {
                    const coords = firstFeature.geometry.coordinates[0];
                    console.log('🔢 First five coordinates of first polygon:');
                    for (let i = 0; i < Math.min(5, coords.length); i++) {
                        console.log('   [' + i + ']: [' + coords[i][0] + ', ' + coords[i][1] + ']');
                    }
                } else if (firstFeature.geometry.type === 'MultiPolygon') {
                    const coords = firstFeature.geometry.coordinates[0][0];
                    console.log('🔢 First five coordinates of first polygon (MultiPolygon):');
                    for (let i = 0; i < Math.min(5, coords.length); i++) {
                        console.log('   [' + i + ']: [' + coords[i][0] + ', ' + coords[i][1] + ']');
                    }
                }
            }
            
            this.validateGeoJSON();
            this.parseFeatures();
            console.log('✅ Total countries parsed: ' + this.countries.length);
            return this.countries;
        } catch (error) {
            console.error('❌ Map loading failed:', error);
            return [];
        }
    }

    /**
     * Validate GeoJSON structure
     */
    validateGeoJSON() {
        if (!this.geoJsonData) {
            throw new Error('GeoJSON data is empty');
        }
        if (this.geoJsonData.type !== 'FeatureCollection') {
            throw new Error('Invalid GeoJSON: not a FeatureCollection');
        }
        if (!Array.isArray(this.geoJsonData.features)) {
            throw new Error('Invalid GeoJSON: features array missing');
        }
    }

    /**
     * Parse Features and create Country objects
     */
    parseFeatures() {
        this.countries = [];
        this.geoJsonData.features.forEach((feature, index) => {
            try {
                if (feature.type === 'Feature' && feature.geometry) {
                    const country = new Country(
                        index,
                        feature.properties?.name || `Country_${index}`,
                        feature.geometry,
                        feature.properties || {}
                    );
                    this.countries.push(country);
                }
            } catch (error) {
                console.warn(`⚠️ Skipped feature ${index}:`, error.message);
            }
        });
    }

    /**
     * Get all countries
     */
    getCountries() {
        return this.countries;
    }

    /**
     * Find country by name
     */
    findCountry(name) {
        return this.countries.find(c => c.name.toLowerCase() === name.toLowerCase());
    }

    /**
     * Find countries by point
     */
    findCountriesAtPoint(x, y) {
        return this.countries.filter(country => country.containsPoint(x, y));
    }
}
