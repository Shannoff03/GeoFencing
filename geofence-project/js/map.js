/**
 * Map Handler Module
 * Manages the Leaflet map and geofence visualization
 */

const MapHandler = {
    map: null,
    geofences: [],

    /**
     * Initialize the map
     */
    init() {
        this.map = L.map('map', {
            center: CONFIG.map.defaultCenter,
            zoom: CONFIG.map.defaultZoom,
            zoomControl: true,
            fullscreenControl: true
        });

        // Use CartoDB Voyager tiles (always in English)
        L.tileLayer(CONFIG.map.tileLayerUrl, {
            attribution: CONFIG.map.attribution,
            maxZoom: CONFIG.map.maxZoom,
            subdomains: 'abcd'
        }).addTo(this.map);

        // Add fullscreen control
        this.addFullscreenControl();

        console.log('Map initialized centered on Abu Dhabi with English labels');
    },

    /**
     * Add fullscreen control to the map
     */
    addFullscreenControl() {
        const fullscreenControl = L.control({ position: 'topright' });

        fullscreenControl.onAdd = () => {
            const button = L.DomUtil.create('button', 'leaflet-bar leaflet-control leaflet-control-custom fullscreen-btn');
            button.innerHTML = `
                <svg class="fullscreen-icon" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M8 3H5a2 2 0 0 0-2 2v3m18 0V5a2 2 0 0 0-2-2h-3m0 18h3a2 2 0 0 0 2-2v-3M3 16v3a2 2 0 0 0 2 2h3"></path>
                </svg>
                <svg class="exit-fullscreen-icon" style="display: none;" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M8 3v3a2 2 0 0 1-2 2H3m18 0h-3a2 2 0 0 1-2-2V3m0 18v-3a2 2 0 0 1 2-2h3M3 16h3a2 2 0 0 1 2 2v3"></path>
                </svg>
            `;
            button.title = 'Toggle Fullscreen';
            
            button.onclick = (e) => {
                e.preventDefault();
                e.stopPropagation();
                this.toggleFullscreen();
            };

            return button;
        };

        fullscreenControl.addTo(this.map);
    },

    /**
     * Toggle fullscreen mode
     */
    toggleFullscreen() {
        const mapContainer = document.getElementById('map');
        const fullscreenIcon = document.querySelector('.fullscreen-icon');
        const exitFullscreenIcon = document.querySelector('.exit-fullscreen-icon');

        if (!document.fullscreenElement) {
            // Enter fullscreen
            if (mapContainer.requestFullscreen) {
                mapContainer.requestFullscreen();
            } else if (mapContainer.webkitRequestFullscreen) {
                mapContainer.webkitRequestFullscreen();
            } else if (mapContainer.msRequestFullscreen) {
                mapContainer.msRequestFullscreen();
            }
            
            if (fullscreenIcon && exitFullscreenIcon) {
                fullscreenIcon.style.display = 'none';
                exitFullscreenIcon.style.display = 'block';
            }

            console.log('Entered fullscreen mode');
        } else {
            // Exit fullscreen
            if (document.exitFullscreen) {
                document.exitFullscreen();
            } else if (document.webkitExitFullscreen) {
                document.webkitExitFullscreen();
            } else if (document.msExitFullscreen) {
                document.msExitFullscreen();
            }
            
            if (fullscreenIcon && exitFullscreenIcon) {
                fullscreenIcon.style.display = 'block';
                exitFullscreenIcon.style.display = 'none';
            }

            console.log('Exited fullscreen mode');
        }

        // Invalidate map size after a short delay to ensure proper rendering
        setTimeout(() => {
            this.map.invalidateSize();
        }, 100);
    },

    /**
     * Clear all geofences from the map
     */
    clearGeofences() {
        this.geofences.forEach(geofence => {
            this.map.removeLayer(geofence.layer);
        });
        this.geofences = [];
        console.log('Cleared all geofences');
    },

    /**
     * Add a single geofence to the map
     * @param {Object} data - Geofence data
     * @param {number} index - Index for color selection
     */
    addGeofence(data, index) {
        const { minx, miny, maxx, maxy, name } = data;

        // Validate coordinates
        if (isNaN(minx) || isNaN(miny) || isNaN(maxx) || isNaN(maxy)) {
            console.warn(`Skipping geofence ${index + 1}: Invalid coordinates`);
            return null;
        }

        // Create rectangle bounds: [[south, west], [north, east]]
        const bounds = [[miny, minx], [maxy, maxx]];
        const color = CONFIG.geofence.colors[index % CONFIG.geofence.colors.length];

        // Create rectangle on map (initially hidden)
        const rectangle = L.rectangle(bounds, {
            color: color,
            weight: CONFIG.geofence.strokeWeight,
            fillOpacity: CONFIG.geofence.fillOpacity
        });

        // Add popup with coordinates
        const popupContent = this.createPopupContent(name, minx, miny, maxx, maxy);
        rectangle.bindPopup(popupContent);

        const geofence = {
            name,
            bounds,
            layer: rectangle,
            color,
            coordinates: { minx, miny, maxx, maxy },
            visible: false,
            id: `geofence-${index}`
        };

        this.geofences.push(geofence);
        console.log(`Added geofence: ${name}`);
        
        return geofence;
    },

    /**
     * Create popup content HTML
     * @param {string} name - Geofence name
     * @param {number} minx - Minimum longitude
     * @param {number} miny - Minimum latitude
     * @param {number} maxx - Maximum longitude
     * @param {number} maxy - Maximum latitude
     * @returns {string} HTML content
     */
    createPopupContent(name, minx, miny, maxx, maxy) {
        return `
            <strong>${name}</strong><br>
            MinX: ${minx.toFixed(6)}<br>
            MinY: ${miny.toFixed(6)}<br>
            MaxX: ${maxx.toFixed(6)}<br>
            MaxY: ${maxy.toFixed(6)}
        `;
    },

    /**
     * Fit map view to show all geofences
     */
    fitBounds() {
        if (this.geofences.length === 0) {
            return;
        }

        const layers = this.geofences.map(g => g.layer);
        const group = new L.featureGroup(layers);
        this.map.fitBounds(
            group.getBounds().pad(CONFIG.map.boundsePadding)
        );

        console.log(`Fitted map to ${this.geofences.length} geofences`);
    },

    /**
     * Get all current geofences
     * @returns {Array} Array of geofence objects
     */
    getGeofences() {
        return this.geofences;
    },

    /**
     * Get geofence count
     * @returns {number} Number of geofences
     */
    getCount() {
        return this.geofences.length;
    },

    /**
     * Show a specific geofence by ID
     * @param {string} id - Geofence ID
     */
    showGeofence(id) {
        const geofence = this.geofences.find(g => g.id === id);
        if (geofence && !geofence.visible) {
            geofence.layer.addTo(this.map);
            geofence.visible = true;
            console.log(`Showed geofence: ${geofence.name}`);
        }
    },

    /**
     * Hide a specific geofence by ID
     * @param {string} id - Geofence ID
     */
    hideGeofence(id) {
        const geofence = this.geofences.find(g => g.id === id);
        if (geofence && geofence.visible) {
            this.map.removeLayer(geofence.layer);
            geofence.visible = false;
            console.log(`Hidden geofence: ${geofence.name}`);
        }
    },

    /**
     * Show multiple geofences by IDs
     * @param {Array} ids - Array of geofence IDs
     */
    showMultipleGeofences(ids) {
        ids.forEach(id => this.showGeofence(id));
        this.fitBoundsToVisible();
    },

    /**
     * Hide all geofences
     */
    hideAllGeofences() {
        this.geofences.forEach(geofence => {
            if (geofence.visible) {
                this.map.removeLayer(geofence.layer);
                geofence.visible = false;
            }
        });
        console.log('Hidden all geofences');
    },

    /**
     * Show all geofences
     */
    showAllGeofences() {
        this.geofences.forEach(geofence => {
            if (!geofence.visible) {
                geofence.layer.addTo(this.map);
                geofence.visible = true;
            }
        });
        this.fitBoundsToVisible();
        console.log('Showed all geofences');
    },

    /**
     * Fit map bounds to visible geofences only
     */
    fitBoundsToVisible() {
        const visibleGeofences = this.geofences.filter(g => g.visible);
        
        if (visibleGeofences.length === 0) {
            return;
        }

        const layers = visibleGeofences.map(g => g.layer);
        const group = new L.featureGroup(layers);
        this.map.fitBounds(
            group.getBounds().pad(CONFIG.map.boundsePadding)
        );

        console.log(`Fitted map to ${visibleGeofences.length} visible geofences`);
    },

    /**
     * Get visible geofences
     * @returns {Array} Array of visible geofence objects
     */
    getVisibleGeofences() {
        return this.geofences.filter(g => g.visible);
    }
};
