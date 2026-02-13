/**
 * Configuration file for the Geofence Mapper
 * Contains all constants and settings
 */

const CONFIG = {
    // Map settings
    map: {
        defaultCenter: [24.4539, 54.3773], // Abu Dhabi coordinates
        defaultZoom: 11,
        tileLayerUrl: 'https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png',
        attribution: '© OpenStreetMap contributors © CARTO',
        maxZoom: 19,
        boundsePadding: 0.1 // 10% padding when fitting bounds
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

    // Excel column names (case-insensitive)
    excel: {
        requiredColumns: ['minx', 'miny', 'maxx', 'maxy'],
        optionalColumns: ['name']
    },

    // Template data for sample Excel file
    template: [
        { 
            name: 'Abu Dhabi Downtown', 
            minx: 54.350, 
            miny: 24.460, 
            maxx: 54.380, 
            maxy: 24.480 
        },
        { 
            name: 'Yas Island', 
            minx: 54.590, 
            miny: 24.470, 
            maxx: 54.630, 
            maxy: 24.500 
        },
        { 
            name: 'Saadiyat Island', 
            minx: 54.410, 
            miny: 24.530, 
            maxx: 54.450, 
            maxy: 24.560 
        }
    ],

    // Messages
    messages: {
        noFile: 'No file chosen',
        noData: 'No data found in Excel file',
        missingColumns: 'Excel file must contain columns: minx, miny, maxx, maxy',
        invalidCoordinates: 'Invalid coordinates found',
        noValidGeofences: 'No valid geofences found in the Excel file',
        readError: 'Error reading Excel file: '
    }
};
