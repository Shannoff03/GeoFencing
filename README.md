# 📍 Geofence Mapper

An interactive browser-based tool for visualizing geographic boundaries (geofences) on a map. Upload an Excel file containing WKT polygon data and instantly plot, filter, and explore your geofences on a live map.

---

## 🚀 Getting Started

No build tools, no installation required. Just open `index.html` in any modern browser.

```
geofence-mapper/
├── index.html
├── css/
│   └── styles.css
└── js/
    ├── config.js
    ├── map.js
    ├── excel.js
    ├── ui.js
    ├── app.js
    └── particles.js
```

---

## 📋 Excel File Format

Your Excel file must contain the following columns:

| Column | Required | Description |
|--------|----------|-------------|
| `name` | Optional | Display name for the geofence. Defaults to "Geofence 1", "Geofence 2", etc. |
| `polygon` | **Required** | WKT POLYGON string defining the boundary shape |

> The `polygon` column also accepts the header names `geometry` or `wkt`.

### WKT Polygon Format

Coordinates must be in **WKT (Well-Known Text)** format — longitude first, then latitude, separated by a space. Pairs are comma-separated inside double parentheses:

```
POLYGON ((lon1 lat1, lon2 lat2, lon3 lat3, ..., lon1 lat1))
```

**Example row:**

| name | polygon |
|------|---------|
| Zone A | `POLYGON ((56.355202 25.134027, 56.355546 25.138925, 56.35608 25.142602, 56.355202 25.134027))` |

> ⚠️ The first and last coordinate pair must be identical to close the polygon.

### Supported Shapes

Any closed polygon shape is supported — rectangles, L-shapes, irregular boundaries, complex multi-vertex zones. The tool uses the exact coordinates provided, so the shape on the map will precisely match your data.

---

## 📥 Downloading the Sample Template

Click the **"Download Sample Template"** button in the app to get a pre-filled `.xlsx` file with example geofences showing the correct format. Use this as a starting point for your own data.

---

## 🗺️ Using the Map

### Loading Geofences

1. Click **"Choose Excel File"** and select your `.xlsx` or `.xls` file
2. The app validates and parses your data
3. A list of all loaded geofences appears in the **Select Geofences** panel

### Showing / Hiding Geofences

- **Check a geofence** in the list → it appears on the map and the view flies to it automatically
- **Uncheck a geofence** → it is removed from the map
- **Select All** → all geofences appear on the map, view fits to all of them
- **Clear All** → all geofences are removed from the map

### Searching

Type in the **search box** to filter the geofence list by name. Only matching geofences are shown in the list (already-visible geofences on the map are unaffected).

### Map Layers

Use the layer switcher in the **top-right corner** to switch between:

| Layer | Description |
|-------|-------------|
| 🗺 Normal | CartoDB Voyager — clean street map with English labels |
| ⛰ Terrain | OpenTopoMap — topographic contour map |
| 🛰 Satellite | Esri World Imagery — satellite photography |

### Fullscreen Mode

Click the **fullscreen button** (top-right) to expand the map to full screen. Click again or press `Esc` to exit.

### Popups

Click any geofence polygon on the map to see a popup showing the name, centroid coordinates, and vertex count.

---

## 🎨 Geofence Colors

Up to 8 distinct colors are cycled automatically:

🔴 Red · 🔵 Blue · 🟢 Green · 🟡 Amber · 🟣 Violet · 🩷 Pink · 🩵 Teal · 🟠 Orange

If you have more than 8 geofences, colors repeat from the beginning.

---

## ⚙️ Configuration

All settings are in `js/config.js`. Key options:

```javascript
CONFIG.map.defaultCenter   // Starting map position [lat, lng]
CONFIG.map.defaultZoom     // Starting zoom level
CONFIG.geofence.colors     // Array of polygon border colors
CONFIG.geofence.fillOpacity // Fill transparency (0–1)
CONFIG.geofence.strokeWeight // Border line thickness in pixels
```

---

## 🌐 Dependencies (CDN — no install needed)

| Library | Version | Purpose |
|---------|---------|---------|
| [Leaflet](https://leafletjs.com/) | 1.9.4 | Interactive map rendering |
| [SheetJS (xlsx)](https://sheetjs.com/) | 0.18.5 | Excel file parsing |
| Google Fonts | — | Outfit + Space Mono typefaces |

All dependencies are loaded from CDN links in `index.html`. An internet connection is required.

---

## 🛠️ How It Works

1. **File Upload** — SheetJS reads the `.xlsx` file in the browser, no server needed
2. **WKT Parsing** — `ExcelHandler.parseWKT()` extracts coordinate pairs from the POLYGON string, converting from WKT `(lon lat)` order to Leaflet's `[lat, lng]` order
3. **Polygon Rendering** — Each geofence is added as a `L.polygon` layer (hidden by default)
4. **Visibility Control** — Checkboxes toggle `layer.addTo(map)` / `map.removeLayer(layer)`
5. **Auto-fly** — On single selection, `map.flyToBounds()` animates the camera to the geofence

---

## ❓ Troubleshooting

| Problem | Solution |
|---------|----------|
| "Excel file must contain a polygon column" | Rename your column header to exactly `polygon`, `geometry`, or `wkt` |
| Geofence appears in wrong location | Check that your coordinates are `longitude latitude` (X Y) order, not reversed |
| Polygon doesn't close properly | Ensure the last coordinate pair matches the first |
| Map tiles not loading | Check your internet connection — tiles are loaded from external CDNs |
| File not accepted | Only `.xlsx` and `.xls` files are supported |

---

## 📄 License

MIT — free to use, modify, and distribute.