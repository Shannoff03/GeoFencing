/**
 * Configuration file for the Geofence Mapper
 * WKT POLYGON format edition
 */

const CONFIG = {
    // Map settings
    map: {
        defaultCenter: [24.4539, 54.3773], // Abu Dhabi coordinates
        defaultZoom: 11,
        tileLayerUrl: 'https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png',
        attribution: '© OpenStreetMap contributors © CARTO',
        maxZoom: 19,
        boundsePadding: 0.1
    },

    // Geofence visualization
    geofence: {
        colors: [
            '#ef4444', // red
            '#3b82f6', // blue
            '#10b981', // green
            '#f59e0b', // amber
            '#8b5cf6', // violet
            '#ec4899', // pink
            '#14b8a6', // teal
            '#f97316'  // orange
        ],
        strokeWeight: 2,
        fillOpacity: 0.2
    },

    // Excel column names expected in uploaded files
    excel: {
        // Name column candidates (case-insensitive, first match wins)
        nameColumns: ['name'],

        // Polygon/WKT column candidates (case-insensitive, first match wins)
        // Supports both the old format (polygon / geometry / wkt)
        // and the new format (wktshape)
        requiredColumns: ['polygon'],
        alternateColumns: ['geometry', 'wkt', 'wktshape']
    },

    // Sample rows for the downloadable template (WKT POLYGON strings)
    template: [
        {
            name: 'Abu Dhabi Downtown',
            polygon: 'POLYGON ((54.350 24.460, 54.380 24.460, 54.380 24.480, 54.350 24.480, 54.350 24.460))'
        },
        {
            name: 'Yas Island',
            polygon: 'POLYGON ((54.590 24.470, 54.630 24.470, 54.630 24.500, 54.590 24.500, 54.590 24.470))'
        },
        {
            name: 'Custom L-Shape',
            polygon: 'POLYGON ((54.410 24.530, 54.440 24.530, 54.440 24.545, 54.425 24.545, 54.425 24.560, 54.410 24.560, 54.410 24.530))'
        }
    ],

    // Messages
    messages: {
        noFile: 'No file chosen',
        noData: 'No data found in Excel file',
        missingColumns: 'Excel file must contain a polygon/WKT column (accepted names: "polygon", "geometry", "wkt", "wktshape") with WKT POLYGON strings',
        invalidCoordinates: 'Invalid WKT polygon found',
        noValidGeofences: 'No valid polygon geofences found in the Excel file',
        readError: 'Error reading Excel file: '
    }
};