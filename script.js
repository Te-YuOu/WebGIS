// 初始化地圖（Leaflet）
const map = L.map("map").setView([23.5, 121], 7);

// 加入 OSM 底圖
L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
  attribution: "© OpenStreetMap contributors",
}).addTo(map);

// 四季名稱
const seasons = ["DJF", "MAM", "JJA", "SON"];

// 儲存圖層與圖層控制器
const rrLayers = {};
const overlayMaps = {};

// 自訂色階函數（對應 Reduction Ratio 數值）
function getColor(val) {
  if (val === null || val === undefined) return null;
  if (val > 0.6) return "#800026";
  if (val > 0.5) return "#BD0026";
  if (val > 0.4) return "#E31A1C";
  if (val > 0.3) return "#FC4E2A";
  if (val > 0.2) return "#FD8D3C";
  if (val > 0.1) return "#FEB24C";
  if (val > 0.01) return "#FED976";
  return "#FFEDA0";
}

// 載入每一季的 GeoTIFF
seasons.forEach((season) => {
  fetch(`data/RR_map_${season}.tif`)
    .then((res) => res.arrayBuffer())
    .then((buffer) => parseGeoraster(buffer))
    .then((georaster) => {
      const layer = new GeoRasterLayer({
        georaster: georaster,
        opacity: 0.7,
        pixelValuesToColorFn: (values) => getColor(values[0]),
        resolution: 256, // 解析度與效能平衡
      });

      rrLayers[season] = layer;
      overlayMaps[season] = layer;

      // 預設顯示 DJF 並自動縮放
      if (season === "DJF") {
        layer.addTo(map);
        map.fitBounds(layer.getBounds());
      }

      // 所有圖層載入後再加入圖層控制器
      if (Object.keys(overlayMaps).length === seasons.length) {
        L.control.layers({}, overlayMaps, { collapsed: false }).addTo(map);
      }
    })
    .catch((err) => {
      console.error(`載入 ${season} 失敗:`, err);
    });
});