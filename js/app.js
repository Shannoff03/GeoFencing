/**
 * Main Application Module
 * Coordinates all modules and handles application flow
 */

const App = {
    /**
     * Initialize the application
     */
    init() {
        console.log('Initializing Geofence Mapper...');

        // Initialize all modules
        MapHandler.init();
        UIHandler.init();

        // Set up event listeners
        this.setupEventListeners();

        console.log('Application initialized successfully');
    },

    /**
     * Set up all event listeners
     */
    setupEventListeners() {
        // File input change event
        const fileInput = UIHandler.getFileInput();
        if (fileInput) {
            fileInput.addEventListener('change', (e) => this.handleFileSelect(e));
        }

        // Download template button click event
        const downloadBtn = UIHandler.getDownloadButton();
        if (downloadBtn) {
            downloadBtn.addEventListener('click', () => this.handleDownloadTemplate());
        }

        // Search input
        const searchInput = document.getElementById('searchInput');
        if (searchInput) {
            searchInput.addEventListener('input', (e) => this.handleSearch(e));
        }

        // Select All button
        const selectAllBtn = document.getElementById('selectAllBtn');
        if (selectAllBtn) {
            selectAllBtn.addEventListener('click', () => this.handleSelectAll());
        }

        // Clear All button
        const clearAllBtn = document.getElementById('clearAllBtn');
        if (clearAllBtn) {
            clearAllBtn.addEventListener('click', () => this.handleClearAll());
        }

        // Fullscreen change event
        document.addEventListener('fullscreenchange', () => this.handleFullscreenChange());
        document.addEventListener('webkitfullscreenchange', () => this.handleFullscreenChange());
        document.addEventListener('mozfullscreenchange', () => this.handleFullscreenChange());
        document.addEventListener('MSFullscreenChange', () => this.handleFullscreenChange());

        console.log('Event listeners attached');
    },

    /**
     * Handle fullscreen change
     */
    handleFullscreenChange() {
        const fullscreenIcon = document.querySelector('.fullscreen-icon');
        const exitFullscreenIcon = document.querySelector('.exit-fullscreen-icon');

        if (!document.fullscreenElement) {
            // Exited fullscreen
            if (fullscreenIcon && exitFullscreenIcon) {
                fullscreenIcon.style.display = 'block';
                exitFullscreenIcon.style.display = 'none';
            }
        }
    },

    /**
     * Handle file selection
     * @param {Event} event - File input change event
     */
    async handleFileSelect(event) {
        const file = event.target.files[0];
        
        if (!file) {
            return;
        }

        console.log(`File selected: ${file.name}`);
        UIHandler.updateFileName(file.name);
        UIHandler.clearError();

        try {
            await this.processFile(file);
        } catch (error) {
            UIHandler.showError(CONFIG.messages.readError + error.message);
        }
    },

    /**
     * Process uploaded Excel file
     * @param {File} file - Excel file to process
     */
    async processFile(file) {
        try {
            // Read Excel file
            const data = await ExcelHandler.readFile(file);

            // Validate data
            if (!data || data.length === 0) {
                UIHandler.showError(CONFIG.messages.noData);
                return;
            }

            // Validate columns
            if (!ExcelHandler.validateColumns(data)) {
                UIHandler.showError(CONFIG.messages.missingColumns);
                return;
            }

            // Process and render geofences
            const geofences = ExcelHandler.processData(data);
            this.renderGeofences(geofences);

        } catch (error) {
            console.error('Error processing file:', error);
            throw error;
        }
    },

    /**
     * Render geofences on the map
     * @param {Array} geofences - Array of geofence data
     */
    renderGeofences(geofences) {
        // Clear existing geofences
        MapHandler.clearGeofences();
        UIHandler.hideGeofenceInfo();
        UIHandler.hideFilterSection();

        if (geofences.length === 0) {
            UIHandler.showError(CONFIG.messages.noValidGeofences);
            return;
        }

        console.log(`Rendering ${geofences.length} geofences...`);

        // Add each geofence to the map (but don't show yet)
        geofences.forEach((geofence, index) => {
            MapHandler.addGeofence(geofence, index);
        });

        // Get all geofences
        const allGeofences = MapHandler.getGeofences();

        // Display filter section
        UIHandler.displayFilterSection(allGeofences);

        // Set up checkbox change listeners
        this.setupCheckboxListeners();

        // Update UI
        UIHandler.updateSelectedCount(0);

        console.log(`Successfully loaded ${allGeofences.length} geofences. Use checkboxes to display them on the map.`);
    },

    /**
     * Set up checkbox change listeners
     */
    setupCheckboxListeners() {
        const checkboxes = document.querySelectorAll('.checkbox-item input[type="checkbox"]');
        
        checkboxes.forEach(checkbox => {
            checkbox.addEventListener('change', () => {
                const geofenceId = checkbox.dataset.id;
                const checkboxItem = checkbox.closest('.checkbox-item');
                
                if (checkbox.checked) {
                    MapHandler.showGeofence(geofenceId, true); // ← true = fly to it
                    checkboxItem.classList.add('selected');
                } else {
                     MapHandler.hideGeofence(geofenceId);
                    checkboxItem.classList.remove('selected');
                }

                // Update selected count
                const checkedCount = UIHandler.getCheckedGeofences().length;
                UIHandler.updateSelectedCount(checkedCount);

                // Update info panel with visible geofences
                const visibleGeofences = MapHandler.getVisibleGeofences();
                if (visibleGeofences.length > 0) {
                    UIHandler.displayGeofenceInfo(visibleGeofences);
                } else {
                    UIHandler.hideGeofenceInfo();
                }
            });
        });
    },

    /**
     * Handle search input
     * @param {Event} event - Input event
     */
    handleSearch(event) {
        const searchTerm = event.target.value.toLowerCase().trim();
        const checkboxItems = document.querySelectorAll('.checkbox-item');

        checkboxItems.forEach(item => {
            const name = item.dataset.name;
            if (name.includes(searchTerm)) {
                item.classList.remove('hidden');
            } else {
                item.classList.add('hidden');
            }
        });

        console.log(`Search: "${searchTerm}"`);
    },

    /**
     * Handle Select All button
     */
    handleSelectAll() {
        UIHandler.setAllCheckboxes(true);
        MapHandler.showAllGeofences();
        
        const allGeofences = MapHandler.getGeofences();
        UIHandler.updateSelectedCount(allGeofences.length);
        UIHandler.displayGeofenceInfo(allGeofences);

        // Update selected class on visible items
        document.querySelectorAll('.checkbox-item:not(.hidden)').forEach(item => {
            item.classList.add('selected');
        });

        console.log('Selected all geofences');
    },

    /**
     * Handle Clear All button
     */
    handleClearAll() {
        UIHandler.setAllCheckboxes(false);
        MapHandler.hideAllGeofences();
        UIHandler.updateSelectedCount(0);
        UIHandler.hideGeofenceInfo();

        // Remove selected class from all items
        document.querySelectorAll('.checkbox-item').forEach(item => {
            item.classList.remove('selected');
        });

        console.log('Cleared all geofences');
    },

    /**
     * Handle download template button click
     */
    handleDownloadTemplate() {
        try {
            console.log('Generating template...');
            ExcelHandler.downloadTemplate();
        } catch (error) {
            console.error('Error downloading template:', error);
            UIHandler.showError('Failed to download template: ' + error.message);
        }
    }
};

// Initialize app when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    App.init();
});
