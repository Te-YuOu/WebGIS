// 初始化地圖
const map = L.map("map").setView([23.5, 121], 7);

// 加入 OSM 底圖
L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
  attribution: "© OpenStreetMap contributors",
}).addTo(map);

// 色階函數（你可以依實際數值調整）
function getColor(val) {
  if (val === null || val === undefined || isNaN(val)) return null;
  if (val > 0.5) return "#800026";
  if (val > 0.4) return "#BD0026";
  if (val > 0.3) return "#E31A1C";
  if (val > 0.2) return "#FC4E2A";
  if (val > 0.1) return "#FD8D3C";
  if (val > 0.05) return "#FEB24C";
  if (val > 0.01) return "#FED976";
  return "#FFEDA0";
}

// 要載入的季節清單
const seasons = ["DJF", "MAM", "JJA", "SON"];

// 圖層對應字典
const overlayMaps = {};
let layerControlAdded = false;

// 每一季都載入對應的 GeoTIFF
seasons.forEach((season) => {
  fetch(`data/RR_map_${season}.tif`)
    .then((response) => response.arrayBuffer())
    .then((arrayBuffer) => parseGeoraster(arrayBuffer))
    .then((georaster) => {
      const layer = new GeoRasterLayer({
        georaster,
        opacity: 0.7,
        pixelValuesToColorFn: (values) => getColor(values[0]),
        resolution: 256,
      });

      overlayMaps[season] = layer;

      if (season === "DJF") {
        layer.addTo(map);
        map.fitBounds(layer.getBounds());
      }

      if (Object.keys(overlayMaps).length === seasons.length && !layerControlAdded) {
        L.control.layers({}, overlayMaps, { collapsed: false }).addTo(map);
        layerControlAdded = true;
      }
    })
    .catch((error) => {
      console.error(`⚠️ 載入 ${season} 失敗:`, error);
    });
});