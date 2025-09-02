// 使用 Canvas 提升渲染效能
const map = L.map("map", { preferCanvas: true }).setView([23.5, 121], 7);

// 加入 OSM 底圖
L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
  attribution: "© OpenStreetMap contributors",
}).addTo(map);

// 色階
function getColor(val) {
  if (val === null || val === undefined) return null;
  if (val > 0.5) return "#800026";
  if (val > 0.4) return "#BD0026";
  if (val > 0.3) return "#E31A1C";
  if (val > 0.2) return "#FC4E2A";
  if (val > 0.1) return "#FD8D3C";
  if (val > 0.05) return "#FEB24C";
  if (val > 0.01) return "#FED976";
  return "#FFEDA0";
}

const seasons = ["DJF", "MAM", "JJA", "SON"];
const rrLayers = {};
const overlayMaps = {};
const layerControl = L.control.layers({}, {}, { collapsed: false }).addTo(map);
let firstLayerLoaded = false;
let currentSeasonLayer = null;

function loadSeason(season) {
  fetch(`data/RR_map_${season}.tif`)
    .then(res => res.arrayBuffer())
    .then(buffer => parseGeoraster(buffer))
    .then(georaster => {
      const layer = new GeoRasterLayer({
        georaster,
        opacity: 0.7,
        pixelValuesToColorFn: values => getColor(values[0]),
        resolution: 128,
      });

      rrLayers[season] = layer;
      overlayMaps[season] = layer;

      layerControl.addOverlay(layer, season);

      if (!firstLayerLoaded) {
        layer.addTo(map);
        currentSeasonLayer = layer;
        map.fitBounds(layer.getBounds());
        firstLayerLoaded = true;
      }
    })
    .catch(err => console.error(`載入 ${season} 失敗:`, err));
}

// 載入所有季節
seasons.forEach(loadSeason);

// 讓季節圖層「互斥」：啟用一個時，自動關閉其他，以避免堆疊造成卡頓
map.on("overlayadd", (e) => {
  const added = e.layer;
  // 僅在是季節圖層時處理
  const isSeasonLayer = Object.values(rrLayers).includes(added);
  if (!isSeasonLayer) return;

  Object.values(rrLayers).forEach((layer) => {
    if (layer !== added && map.hasLayer(layer)) {
      map.removeLayer(layer);
    }
  });
  currentSeasonLayer = added;
});
