# Geofence Mapper

A web-based tool to visualize geofences from Excel files on an interactive map.

## 📁 Project Structure

```
geofence-project/
├── index.html              # Main HTML file
├── css/
│   └── styles.css         # All CSS styles
├── js/
│   ├── config.js          # Configuration and constants
│   ├── map.js             # Map handling (Leaflet)
│   ├── excel.js           # Excel file processing
│   ├── ui.js              # UI updates and interactions
│   └── app.js             # Main application logic
└── README.md              # This file
```

## 🚀 Getting Started

### Option 1: VS Code Live Server (Recommended)

1. Open the project folder in VS Code
2. Install the "Live Server" extension if you haven't already
3. Right-click on `index.html` and select "Open with Live Server"
4. The app will open in your default browser

### Option 2: Direct Browser

1. Simply open `index.html` in any modern web browser
2. Note: Some browsers may have CORS restrictions when loading local files

## 📊 How to Use

1. **Prepare Your Excel File:**
   - Create an Excel file (.xlsx or .xls)
   - Add columns: `minx`, `miny`, `maxx`, `maxy`
   - Optionally add a `name` column for labels
   - Fill in your bounding box coordinates:
     - `minx` = minimum longitude
     - `miny` = minimum latitude
     - `maxx` = maximum longitude
     - `maxy` = maximum latitude

2. **Or Download Template:**
   - Click "Download Template Excel" button
   - Use the template as a starting point
   - Contains sample data for major US cities

3. **Upload and Visualize:**
   - Click "Choose Excel File" and select your file
   - Geofences will automatically appear on the map
   - Click any geofence to see its coordinates
   - Map automatically zooms to fit all geofences

## 🛠️ Features

- ✅ Upload Excel files with geofence coordinates
- ✅ Interactive map with zoom and pan
- ✅ Color-coded geofences
- ✅ Click geofences to view details
- ✅ Automatic map fitting
- ✅ Download template file
- ✅ Case-insensitive column names
- ✅ Comprehensive error handling
- ✅ Console logging for debugging

## 🔍 Debugging

The application includes extensive console logging:

1. Open browser Developer Tools (F12)
2. Go to the Console tab
3. You'll see logs for:
   - Initialization steps
   - File reading progress
   - Validation results
   - Geofence rendering
   - Any errors or warnings

## 📝 Module Descriptions

### config.js
- Contains all configuration constants
- Map settings, colors, messages
- Easy to modify settings in one place

### map.js (MapHandler)
- Manages Leaflet map instance
- Handles geofence creation and rendering
- Manages map bounds and view

### excel.js (ExcelHandler)
- Reads and parses Excel files
- Validates data structure
- Generates template files
- Normalizes column names

### ui.js (UIHandler)
- Manages DOM elements
- Updates UI components
- Displays errors and information
- Handles user feedback

### app.js (App)
- Main application coordinator
- Sets up event listeners
- Orchestrates all modules
- Handles application flow

## 🎨 Customization

### Change Map Default Location
Edit `config.js`:
```javascript
map: {
    defaultCenter: [YOUR_LAT, YOUR_LNG],
    defaultZoom: 4
}
```

### Change Geofence Colors
Edit `config.js`:
```javascript
geofence: {
    colors: ['#color1', '#color2', ...]
}
```

### Modify Template Data
Edit `config.js`:
```javascript
template: [
    { name: 'Location', minx: -74, miny: 40, maxx: -73, maxy: 41 }
]
```

## 🐛 Troubleshooting

**Map not loading?**
- Check browser console for errors
- Ensure you have internet connection (map tiles load from CDN)

**Excel file not processing?**
- Verify column names are correct (minx, miny, maxx, maxy)
- Check that coordinates are valid numbers
- Look for console warnings about specific rows

**Geofences not visible?**
- Verify your coordinates are in correct range:
  - Longitude: -180 to 180
  - Latitude: -90 to 90
- Check console for coordinate validation errors

## 📦 Dependencies

- **Leaflet 1.9.4**: Interactive maps
- **SheetJS (xlsx) 0.18.5**: Excel file processing

All dependencies load from CDN - no installation required!

## 💡 Tips

- Column names are case-insensitive (MinX, minx, MINX all work)
- The `name` column is optional - defaults to "Geofence 1", "Geofence 2", etc.
- Multiple geofences are automatically color-coded
- You can upload a new file anytime - it clears previous geofences

## 📄 License

Free to use and modify for any purpose.
