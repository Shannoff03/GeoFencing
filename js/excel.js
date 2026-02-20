/**
 * Excel Handler Module
 * Manages reading and processing Excel files with WKT POLYGON format.
 * Supports both old format (name + polygon/geometry/wkt columns)
 * and new format (Name + WKTShape columns, plus optional Description/MinX/MaxX etc.)
 */

const ExcelHandler = {

    /**
     * Read an Excel file and return the parsed data
     * @param {File} file - Excel file to read
     * @returns {Promise<Array>} - Array of row objects
     */
    readFile(file) {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();

            reader.onload = (e) => {
                try {
                    const data = new Uint8Array(e.target.result);
                    const workbook = XLSX.read(data, { type: 'array' });
                    const firstSheet = workbook.Sheets[workbook.SheetNames[0]];
                    const jsonData = XLSX.utils.sheet_to_json(firstSheet, { defval: '' });
                    resolve(jsonData);
                } catch (error) {
                    reject(new Error('Failed to parse Excel file: ' + error.message));
                }
            };

            reader.onerror = () => reject(new Error('Failed to read file'));
            reader.readAsArrayBuffer(file);
        });
    },

    /**
     * Validate that at least one recognised polygon column exists.
     * Accepted column names (case-insensitive): polygon, geometry, wkt, wktshape
     * @param {Array} data - Parsed Excel data
     * @returns {boolean}
     */
    validateColumns(data) {
        if (!data || data.length === 0) return false;

        const headers  = Object.keys(data[0]).map(h => h.trim().toLowerCase());
        const accepted = [
            ...CONFIG.excel.requiredColumns,
            ...(CONFIG.excel.alternateColumns || [])
        ];

        return accepted.some(col => headers.includes(col));
    },

    /**
     * Resolve the value of the first matching column from a normalised row object.
     * @param {Object} normalised  - Row with lower-cased keys
     * @param {Array}  candidates  - Ordered list of column name candidates
     * @returns {string|undefined}
     */
    _resolveColumn(normalised, candidates) {
        for (const col of candidates) {
            if (normalised[col] !== undefined && normalised[col] !== '') {
                return String(normalised[col]).trim();
            }
        }
        return undefined;
    },

    /**
     * Parse a WKT POLYGON string into an array of [lat, lng] pairs for Leaflet.
     * Handles both POLYGON and MULTIPOLYGON (uses first ring only for multi).
     *
     * Input:  "POLYGON ((56.355202 25.134027, 56.355546 25.138925, ...))"
     * Output: [[25.134027, 56.355202], [25.138925, 56.355546], ...]
     *
     * WKT order is X(lon) Y(lat); Leaflet wants [lat, lon].
     *
     * @param {string} wkt
     * @returns {Array|null}  array of [lat, lng] or null on failure
     */
    parseWKT(wkt) {
        if (!wkt || typeof wkt !== 'string') return null;

        const clean = wkt.trim().toUpperCase();

        if (!clean.startsWith('POLYGON') && !clean.startsWith('MULTIPOLYGON')) {
            return null;
        }

        // Extract the first coordinate ring
        const ringMatch = wkt.match(/\(\s*([^()]+)\s*\)/);
        if (!ringMatch) return null;

        const coordString = ringMatch[1].trim();
        const pairs = coordString.split(',');

        const coords = [];
        for (const pair of pairs) {
            const parts = pair.trim().split(/\s+/);
            if (parts.length < 2) continue;

            const lng = parseFloat(parts[0]); // WKT X = longitude
            const lat = parseFloat(parts[1]); // WKT Y = latitude

            if (isNaN(lat) || isNaN(lng)) continue;
            coords.push([lat, lng]);           // Leaflet wants [lat, lng]
        }

        return coords.length >= 3 ? coords : null;
    },

    /**
     * Process raw Excel data into geofence objects.
     * Supports:
     *   - New format: Name | Description | MinX | MinY | MaxX | MaxY | Shape | OriginalShape | WKTShape | Speed
     *   - Old format: name | polygon (or geometry / wkt)
     *
     * @param {Array} data - Raw Excel rows
     * @returns {Array} - Processed geofence objects { name, coordinates }
     */
    processData(data) {
        const geofences = [];

        // Column name candidates (lower-cased)
        const nameColumns = CONFIG.excel.nameColumns || ['name'];
        const wktColumns  = [
            ...CONFIG.excel.requiredColumns,
            ...(CONFIG.excel.alternateColumns || [])
        ]; // e.g. ['polygon', 'geometry', 'wkt', 'wktshape']

        data.forEach((row, index) => {
            // Normalise keys to lower-case for lookup
            const normalised = {};
            Object.keys(row).forEach(k => {
                normalised[k.trim().toLowerCase()] = row[k];
            });

            // --- Resolve name ---
            const name = this._resolveColumn(normalised, nameColumns) || `Geofence ${index + 1}`;

            // --- Resolve WKT value ---
            const wktString = this._resolveColumn(normalised, wktColumns) || '';

            if (!wktString) {
                console.warn(`Row ${index + 1} ("${name}"): empty polygon/wkt cell — skipping`);
                return;
            }

            const coordinates = this.parseWKT(wktString);

            if (!coordinates) {
                console.warn(`Row ${index + 1} ("${name}"): invalid WKT — skipping`);
                return;
            }

            geofences.push({ name, coordinates });
        });

        console.log(`Processed ${geofences.length} valid polygon geofences`);
        return geofences;
    },

    /**
     * Generate and download a sample Excel template
     */
    downloadTemplate() {
        const templateData = CONFIG.template.map(item => ({
            name:    item.name,
            polygon: item.polygon
        }));

        const ws = XLSX.utils.json_to_sheet(templateData);

        // Column widths: name=30, polygon=120
        ws['!cols'] = [{ wch: 30 }, { wch: 120 }];

        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, 'Geofences');
        XLSX.writeFile(wb, 'geofence_template.xlsx');

        console.log('Template downloaded');
    }
};