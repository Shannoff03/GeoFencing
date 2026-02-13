/**
 * UI Handler Module
 * Manages user interface interactions and updates
 */

const UIHandler = {
    elements: {},

    /**
     * Initialize UI elements and cache DOM references
     */
    init() {
        this.elements = {
            fileInput: document.getElementById('fileInput'),
            fileName: document.getElementById('fileName'),
            downloadBtn: document.getElementById('downloadTemplateBtn'),
            error: document.getElementById('error'),
            geofenceInfo: document.getElementById('geofenceInfo'),
            geofenceList: document.getElementById('geofenceList')
        };

        console.log('UI elements initialized');
    },

    /**
     * Update file name display
     * @param {string} name - File name to display
     */
    updateFileName(name) {
        if (this.elements.fileName) {
            this.elements.fileName.textContent = name || CONFIG.messages.noFile;
        }
    },

    /**
     * Show error message
     * @param {string} message - Error message to display
     */
    showError(message) {
        if (this.elements.error) {
            this.elements.error.className = 'error';
            this.elements.error.textContent = message;
            this.elements.error.style.display = 'block';
            console.error('UI Error:', message);
        }
    },

    /**
     * Clear error message
     */
    clearError() {
        if (this.elements.error) {
            this.elements.error.textContent = '';
            this.elements.error.style.display = 'none';
        }
    },

    /**
     * Display geofence information panel
     * @param {Array} geofences - Array of geofence objects
     */
    displayGeofenceInfo(geofences) {
        if (!this.elements.geofenceInfo || !this.elements.geofenceList) {
            return;
        }

        if (geofences.length === 0) {
            this.elements.geofenceInfo.style.display = 'none';
            return;
        }

        // Create HTML for each geofence
        const html = geofences.map((geofence, index) => {
            const countText = geofences.length > 1 
                ? `${index + 1} of ${geofences.length}` 
                : '';

            return `
                <div class="geofence-item" style="border-left-color: ${geofence.color}">
                    <strong>${geofence.name}</strong><br>
                    <span style="font-size: 12px; color: #666;">${countText}</span>
                </div>
            `;
        }).join('');

        this.elements.geofenceList.innerHTML = html;
        this.elements.geofenceInfo.style.display = 'block';

        console.log(`Displaying ${geofences.length} geofences in UI`);
    },

    /**
     * Hide geofence information panel
     */
    hideGeofenceInfo() {
        if (this.elements.geofenceInfo) {
            this.elements.geofenceInfo.style.display = 'none';
        }
    },

    /**
     * Get file input element
     * @returns {HTMLElement} File input element
     */
    getFileInput() {
        return this.elements.fileInput;
    },

    /**
     * Get download button element
     * @returns {HTMLElement} Download button element
     */
    getDownloadButton() {
        return this.elements.downloadBtn;
    },

    /**
     * Display filter section with checkboxes
     * @param {Array} geofences - Array of geofence objects
     */
    displayFilterSection(geofences) {
        const filterSection = document.getElementById('filterSection');
        const checkboxContainer = document.getElementById('geofenceCheckboxes');
        
        if (!filterSection || !checkboxContainer) {
            return;
        }

        // Clear existing checkboxes
        checkboxContainer.innerHTML = '';

        // Create checkbox for each geofence
        geofences.forEach((geofence, index) => {
            const checkboxItem = document.createElement('div');
            checkboxItem.className = 'checkbox-item';
            checkboxItem.dataset.name = geofence.name.toLowerCase();
            checkboxItem.dataset.id = geofence.id;

            checkboxItem.innerHTML = `
                <input type="checkbox" id="${geofence.id}" data-id="${geofence.id}">
                <label for="${geofence.id}">${geofence.name}</label>
                <div class="color-indicator" style="background-color: ${geofence.color};"></div>
            `;

            // Click anywhere on the item to toggle
            checkboxItem.addEventListener('click', (e) => {
                if (e.target.tagName !== 'INPUT') {
                    const checkbox = checkboxItem.querySelector('input');
                    checkbox.checked = !checkbox.checked;
                    checkbox.dispatchEvent(new Event('change'));
                }
            });

            checkboxContainer.appendChild(checkboxItem);
        });

        filterSection.style.display = 'block';
        console.log(`Filter section displayed with ${geofences.length} options`);
    },

    /**
     * Hide filter section
     */
    hideFilterSection() {
        const filterSection = document.getElementById('filterSection');
        if (filterSection) {
            filterSection.style.display = 'none';
        }
    },

    /**
     * Update selected count display
     * @param {number} count - Number of selected geofences
     */
    updateSelectedCount(count) {
        const countElement = document.getElementById('selectedCount');
        if (countElement) {
            countElement.textContent = `${count} selected`;
        }
    },

    /**
     * Get all checked geofence IDs
     * @returns {Array} Array of checked geofence IDs
     */
    getCheckedGeofences() {
        const checkboxes = document.querySelectorAll('.checkbox-item input[type="checkbox"]:checked');
        return Array.from(checkboxes).map(cb => cb.dataset.id);
    },

    /**
     * Set all checkboxes state
     * @param {boolean} checked - Whether to check or uncheck
     */
    setAllCheckboxes(checked) {
        const checkboxes = document.querySelectorAll('.checkbox-item:not(.hidden) input[type="checkbox"]');
        checkboxes.forEach(cb => {
            cb.checked = checked;
        });
    }
};
