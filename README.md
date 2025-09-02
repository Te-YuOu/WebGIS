# WebGIS

Leaflet-based WebGIS that visualizes seasonal raster layers (GeoTIFF) over an OpenStreetMap basemap and is published with GitHub Pages.

- Live site: https://te-yuou.github.io/WebGIS/
- Repo: https://github.com/Te-YuOu/WebGIS

## Features
- Leaflet + OSM basemap with pan/zoom.
- Four seasonal raster layers (`DJF`, `MAM`, `JJA`, `SON`) rendered client-side from GeoTIFF using `georaster-layer-for-leaflet`.
- Color scale for raster values, with layer toggle via Leaflet layer control.
- Responsive full-screen map layout.

## Project Structure
```
WebGIS/
├─ index.html          # App shell and CDN imports
├─ script.js           # Leaflet map, rasters, layers
├─ style.css           # Basic layout and loading UI styles
├─ data/
│  ├─ RR_map_DJF.tif   # Seasonal rasters (GeoTIFF)
│  ├─ RR_map_MAM.tif
│  ├─ RR_map_JJA.tif
│  ├─ RR_map_SON.tif
│  └─ cloud_fog.geojson # Example point data (not yet added to map)
└─ README.md
```

## Getting Started (Local)
You can serve the site from the `WebGIS/` folder with any static server.

Option A: Python
```
cd WebGIS
python3 -m http.server 8000
# Open http://localhost:8000
```

Option B: VS Code Live Server extension (or any static server you prefer).

## Deployment (GitHub Pages)
This repository is configured for GitHub Pages. To publish updates:

1) Commit and push changes to the default branch (e.g., `main`).
2) Pages builds automatically; visit: https://te-yuou.github.io/WebGIS/

If you need to (re)configure Pages:
- Repository Settings → Pages → Build and deployment → Source: `GitHub Actions` or `Deploy from a branch` (typically `main`/`root`).

## Data
- Rasters: `data/RR_map_*.tif` rendered on the client via `georaster-layer-for-leaflet`.
- Points (optional): `data/cloud_fog.geojson` is included as example data. You can add it with `L.geoJSON` and style by properties.

## Tech Stack
- Leaflet (map, controls)
- geotiff + georaster + georaster-layer-for-leaflet (client-side raster rendering)
- OpenStreetMap tiles for basemap

## Notes & Enhancements (Nice-to-have)
- Add a legend to explain the raster color breaks.
- Toggle the loading indicator while rasters fetch and render.
- Add `cloud_fog.geojson` as a point overlay with popups.
- Pin CDN versions to avoid future breaking changes.

## License
If you intend to add a license, include a LICENSE file and reference it here.
