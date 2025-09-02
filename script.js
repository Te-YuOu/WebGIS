
const map = L.map("map").setView([23.5, 121], 7);

// OSM 底圖
L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
  attribution: "© OpenStreetMap contributors",
}).addTo(map);

// 儲存圖層與控制器對應
const rrLayers = {};
const overlayMaps = {};
const seasons = ["DJF", "MAM", "JJA", "SON"];

// 自訂色階映射
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

// 載入每一個季節的 GeoTIFF
seasons.forEach((season) => {
  fetch(`data/RR_map_${season}.tif`)
    .then((res) => res.arrayBuffer())
    .then((buffer) => parseGeoraster(buffer))
    .then((georaster) => {
      const layer = new GeoRasterLayer({
        georaster,
        opacity: 0.7,
        pixelValuesToColorFn: (values) => getColor(values[0]),
        resolution: 256,
      });

      rrLayers[season] = layer;
      overlayMaps[season] = layer;

      // 預設載入 DJF
      if (season === "DJF") {
        layer.addTo(map);
        map.fitBounds(layer.getBounds());
      }

      // 若全部載入後，建立 LayerControl（只新增一次）
      if (Object.keys(overlayMaps).length === seasons.length) {
        L.control.layers({}, overlayMaps, { collapsed: false }).addTo(map);
      }
    })
    .catch((err) => {
      console.error(`載入 ${season} 失敗:`, err);
    });
});
