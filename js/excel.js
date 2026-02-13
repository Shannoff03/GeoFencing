/**
 * Excel Handler Module
 * Manages Excel file reading and template generation
 */

const ExcelHandler = {
    /**
     * Read and parse Excel file
     * @param {File} file - Excel file object
     * @returns {Promise} Promise that resolves with parsed data
     */
    readFile(file) {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();

            reader.onload = function(e) {
                try {
                    const data = new Uint8Array(e.target.result);
                    const workbook = XLSX.read(data, { type: 'array' });
                    const firstSheet = workbook.Sheets[workbook.SheetNames[0]];
                    const jsonData = XLSX.utils.sheet_to_json(firstSheet);

                    console.log(`Excel file read successfully: ${jsonData.length} rows`);
                    resolve(jsonData);
                } catch (error) {
                    console.error('Error parsing Excel:', error);
                    reject(error);
                }
            };

            reader.onerror = function(error) {
                console.error('Error reading file:', error);
                reject(error);
            };

            reader.readAsArrayBuffer(file);
        });
    },

    /**
     * Validate that Excel data has required columns
     * @param {Array} data - Parsed Excel data
     * @returns {boolean} True if valid
     */
    validateColumns(data) {
        if (!data || data.length === 0) {
            return false;
        }

        const firstRow = data[0];
        const hasRequiredColumns = CONFIG.excel.requiredColumns.every(col => {
            // Check for column name in different cases
            return col in firstRow || 
                   col.toUpperCase() in firstRow || 
                   col.toLowerCase() in firstRow;
        });

        if (!hasRequiredColumns) {
            console.error('Missing required columns');
            return false;
        }

        console.log('Column validation passed');
        return true;
    },

    /**
     * Normalize column names (handle case variations)
     * @param {Object} row - Row from Excel data
     * @returns {Object} Normalized row object
     */
    normalizeRow(row, index) {
        const getColumnValue = (row, colName) => {
            return row[colName] || 
                   row[colName.toUpperCase()] || 
                   row[colName.toLowerCase()];
        };

        return {
            minx: parseFloat(getColumnValue(row, 'minx')),
            miny: parseFloat(getColumnValue(row, 'miny')),
            maxx: parseFloat(getColumnValue(row, 'maxx')),
            maxy: parseFloat(getColumnValue(row, 'maxy')),
            name: getColumnValue(row, 'name') || `Geofence ${index + 1}`
        };
    },

    /**
     * Process Excel data and extract geofences
     * @param {Array} data - Raw Excel data
     * @returns {Array} Array of normalized geofence objects
     */
    processData(data) {
        const geofences = [];

        data.forEach((row, index) => {
            const normalized = this.normalizeRow(row, index);

            // Validate coordinates
            if (isNaN(normalized.minx) || isNaN(normalized.miny) || 
                isNaN(normalized.maxx) || isNaN(normalized.maxy)) {
                console.warn(`Row ${index + 1}: Invalid coordinates, skipping`);
                return;
            }

            geofences.push(normalized);
        });

        console.log(`Processed ${geofences.length} valid geofences`);
        return geofences;
    },

    /**
     * Generate and download template Excel file
     */
    downloadTemplate() {
        try {
            // Create worksheet from template data
            const ws = XLSX.utils.json_to_sheet(CONFIG.template);
            
            // Create workbook
            const wb = XLSX.utils.book_new();
            XLSX.utils.book_append_sheet(wb, ws, 'Geofences');

            // Set column widths for better readability
            const wscols = [
                { wch: 20 }, // name
                { wch: 10 }, // minx
                { wch: 10 }, // miny
                { wch: 10 }, // maxx
                { wch: 10 }  // maxy
            ];
            ws['!cols'] = wscols;

            // Download file
            XLSX.writeFile(wb, 'geofence_template.xlsx');
            console.log('Template downloaded successfully');
        } catch (error) {
            console.error('Error generating template:', error);
            throw error;
        }
    }
};
