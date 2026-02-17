/**
 * Excel Handler Module
 * Manages reading and processing Excel files with WKT POLYGON format
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
     * Validate that required columns exist.
     * Accepts any of: "polygon", "geometry", or "wkt" (case-insensitive).
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

        // At least one accepted polygon column must exist
        return accepted.some(col => headers.includes(col));
    },

    /**
     * Parse a WKT POLYGON string into an array of [lat, lng] pairs for Leaflet
     * Handles both POLYGON and MULTIPOLYGON (uses first ring only for multi)
     *
     * Input:  "POLYGON ((56.355202 25.134027, 56.355546 25.138925, ...))"
     * Output: [[25.134027, 56.355202], [25.138925, 56.355546], ...]
     *
     * WKT order is  X(lon) Y(lat);  Leaflet wants [lat, lon]
     *
     * @param {string} wkt
     * @returns {Array|null}  array of [lat, lng] or null on failure
     */
    parseWKT(wkt) {
        if (!wkt || typeof wkt !== 'string') return null;

        const clean = wkt.trim().toUpperCase();

        // Accept POLYGON or MULTIPOLYGON
        if (!clean.startsWith('POLYGON') && !clean.startsWith('MULTIPOLYGON')) {
            return null;
        }

        // Extract the first coordinate ring (everything between the first '(' pair)
        // Works for both POLYGON ((...)) and MULTIPOLYGON (((...), (...)))
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

        // Need at least 3 points for a polygon
        return coords.length >= 3 ? coords : null;
    },

    /**
     * Process raw Excel data into geofence objects
     * @param {Array} data - Raw Excel rows
     * @returns {Array} - Processed geofence objects
     */
    processData(data) {
        const geofences = [];

        data.forEach((row, index) => {
            // Normalise keys to lower-case for lookup
            const normalised = {};
            Object.keys(row).forEach(k => {
                normalised[k.trim().toLowerCase()] = row[k];
            });

            const name      = normalised['name'] || `Geofence ${index + 1}`;
            const wktValue  = normalised['polygon'] || normalised['geometry'] || normalised['wkt'] || '';
            const wktString = String(wktValue).trim();

            if (!wktString) {
                console.warn(`Row ${index + 1} ("${name}"): empty polygon cell — skipping`);
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