/**
 * Map Handler Module
 * Manages the Leaflet map and geofence visualization (WKT polygon support)
 */

const MapHandler = {
    map: null,
    geofences: [],
    currentLayer: null,
    activeLayerKey: 'normal',

    /**
     * Tile layer definitions
     */
    tileLayers: {
        normal: {
            label: 'Normal',
            url: 'https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png',
            options: {
                attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/">CARTO</a>',
                maxZoom: 19,
                subdomains: 'abcd'
            }
        },
        terrain: {
            label: 'Terrain',
            url: 'https://tile.opentopomap.org/{z}/{x}/{y}.png',
            options: {
                attribution: '&copy; <a href="https://opentopomap.org">OpenTopoMap</a> contributors',
                maxZoom: 17
            }
        },
        satellite: {
            label: 'Satellite',
            url: 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
            options: {
                attribution: '&copy; <a href="https://www.esri.com/">Esri</a>, Maxar, GeoEye, Earthstar Geographics',
                maxZoom: 19
            }
        }
    },

    /**
     * Initialize the map
     */
    init() {
        this.map = L.map('map', {
            center: CONFIG.map.defaultCenter,
            zoom: CONFIG.map.defaultZoom,
            zoomControl: true
        });

        const { url, options } = this.tileLayers.normal;
        this.currentLayer = L.tileLayer(url, options).addTo(this.map);

        this.addFullscreenControl();
        this.addLayerSwitcherControl();

        console.log('Map initialized');
    },

    /**
     * Switch tile layer
     */
    switchLayer(key) {
        if (!this.tileLayers[key] || key === this.activeLayerKey) return;

        if (this.currentLayer) {
            this.map.removeLayer(this.currentLayer);
        }

        const { url, options } = this.tileLayers[key];
        this.currentLayer = L.tileLayer(url, options);
        this.currentLayer.addTo(this.map);
        this.currentLayer.bringToBack();

        this.activeLayerKey = key;
        this.updateLayerButtons(key);
    },

    updateLayerButtons(activeKey) {
        document.querySelectorAll('.layer-btn').forEach(btn => {
            btn.classList.toggle('layer-btn--active', btn.dataset.layer === activeKey);
        });
    },

    addLayerSwitcherControl() {
        const layerControl = L.control({ position: 'topright' });

        layerControl.onAdd = () => {
            const wrapper = L.DomUtil.create('div', 'leaflet-bar leaflet-control layer-switcher');
            L.DomEvent.disableClickPropagation(wrapper);
            L.DomEvent.disableScrollPropagation(wrapper);

            const layers = [
                { key: 'normal',    icon: '🗺', label: 'Normal'    },
                { key: 'terrain',   icon: '⛰',  label: 'Terrain'   },
                { key: 'satellite', icon: '🛰', label: 'Satellite' }
            ];

            layers.forEach(({ key, icon, label }) => {
                const btn = L.DomUtil.create('button', 'layer-btn', wrapper);
                btn.dataset.layer = key;
                btn.title = `Switch to ${label} view`;
                btn.innerHTML = `<span class="layer-btn__icon">${icon}</span><span class="layer-btn__label">${label}</span>`;

                if (key === this.activeLayerKey) btn.classList.add('layer-btn--active');

                btn.onclick = (e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    this.switchLayer(key);
                };
            });

            return wrapper;
        };

        layerControl.addTo(this.map);
    },

    addFullscreenControl() {
        const fullscreenControl = L.control({ position: 'topright' });

        fullscreenControl.onAdd = () => {
            const button = L.DomUtil.create('button', 'leaflet-bar leaflet-control leaflet-control-custom fullscreen-btn');
            button.innerHTML = `
                <svg class="fullscreen-icon" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M8 3H5a2 2 0 0 0-2 2v3m18 0V5a2 2 0 0 0-2-2h-3m0 18h3a2 2 0 0 0 2-2v-3M3 16v3a2 2 0 0 0 2 2h3"></path>
                </svg>
                <svg class="exit-fullscreen-icon" style="display:none;" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
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

    toggleFullscreen() {
        const mapContainer = document.getElementById('map');
        const fullscreenIcon    = document.querySelector('.fullscreen-icon');
        const exitFullscreenIcon = document.querySelector('.exit-fullscreen-icon');

        if (!document.fullscreenElement) {
            (mapContainer.requestFullscreen || mapContainer.webkitRequestFullscreen || mapContainer.msRequestFullscreen).call(mapContainer);
            if (fullscreenIcon)    fullscreenIcon.style.display    = 'none';
            if (exitFullscreenIcon) exitFullscreenIcon.style.display = 'block';
        } else {
            (document.exitFullscreen || document.webkitExitFullscreen || document.msExitFullscreen).call(document);
            if (fullscreenIcon)    fullscreenIcon.style.display    = 'block';
            if (exitFullscreenIcon) exitFullscreenIcon.style.display = 'none';
        }

        setTimeout(() => this.map.invalidateSize(), 100);
    },

    /**
     * Clear all geofences from the map
     */
    clearGeofences() {
        this.geofences.forEach(g => this.map.removeLayer(g.layer));
        this.geofences = [];
        console.log('Cleared all geofences');
    },

    /**
     * Add a single polygon geofence to the map
     * @param {Object} data  - { name, coordinates: [[lat,lng], ...] }
     * @param {number} index - Index for colour cycling
     */
    addGeofence(data, index) {
        const { name, coordinates } = data;

        if (!coordinates || coordinates.length < 3) {
            console.warn(`Skipping geofence "${name}": insufficient coordinates`);
            return null;
        }

        const color   = CONFIG.geofence.colors[index % CONFIG.geofence.colors.length];
        const polygon = L.polygon(coordinates, {
            color,
            weight:      CONFIG.geofence.strokeWeight,
            fillOpacity: CONFIG.geofence.fillOpacity
        });

        polygon.bindPopup(this.createPopupContent(name, coordinates));

        const geofence = {
            name,
            coordinates,
            layer:   polygon,
            color,
            visible: false,
            id:      `geofence-${index}`
        };

        this.geofences.push(geofence);
        console.log(`Added polygon geofence: ${name} (${coordinates.length} points)`);
        return geofence;
    },

    /**
     * Build popup HTML for a polygon geofence
     */
    createPopupContent(name, coordinates) {
        const center  = this._polygonCenter(coordinates);
        const latStr  = center[0].toFixed(6);
        const lngStr  = center[1].toFixed(6);
        return `
            <strong>${name}</strong><br>
            Center: ${latStr}, ${lngStr}<br>
            Vertices: ${coordinates.length}
        `;
    },

    /**
     * Simple centroid calculation for display purposes
     */
    _polygonCenter(coords) {
        const lat = coords.reduce((s, c) => s + c[0], 0) / coords.length;
        const lng = coords.reduce((s, c) => s + c[1], 0) / coords.length;
        return [lat, lng];
    },

    fitBounds() {
        if (this.geofences.length === 0) return;
        const group = new L.featureGroup(this.geofences.map(g => g.layer));
        this.map.fitBounds(group.getBounds().pad(CONFIG.map.boundsePadding));
    },

    getGeofences()  { return this.geofences; },
    getCount()      { return this.geofences.length; },

    /**
     * Show a single geofence; optionally fly the map to it
     * @param {string}  id
     * @param {boolean} flyTo - if true, animate camera to the geofence
     */
    showGeofence(id, flyTo = false) {
        const geofence = this.geofences.find(g => g.id === id);
        if (geofence && !geofence.visible) {
            geofence.layer.addTo(this.map);
            geofence.visible = true;
        }
        if (geofence && flyTo) {
            this.map.flyToBounds(geofence.layer.getBounds(), {
                padding:  [40, 40],
                maxZoom:  15,
                duration: 1.2
            });
        }
    },

    hideGeofence(id) {
        const geofence = this.geofences.find(g => g.id === id);
        if (geofence && geofence.visible) {
            this.map.removeLayer(geofence.layer);
            geofence.visible = false;
        }
    },

    showAllGeofences() {
        this.geofences.forEach(g => {
            if (!g.visible) {
                g.layer.addTo(this.map);
                g.visible = true;
            }
        });
        this.fitBoundsToVisible();
    },

    hideAllGeofences() {
        this.geofences.forEach(g => {
            if (g.visible) {
                this.map.removeLayer(g.layer);
                g.visible = false;
            }
        });
    },

    fitBoundsToVisible() {
        const visible = this.geofences.filter(g => g.visible);
        if (visible.length === 0) return;
        const group = new L.featureGroup(visible.map(g => g.layer));
        this.map.fitBounds(group.getBounds().pad(CONFIG.map.boundsePadding));
    },

    getVisibleGeofences() {
        return this.geofences.filter(g => g.visible);
    }
};