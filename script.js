const map = L.map("map").setView([23.5, 121], 7);

// OSM 底圖
L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
  attribution: "© OpenStreetMap contributors",
}).addTo(map);

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

// 四季設定
const seasons = ["DJF", "MAM", "JJA", "SON"];
const rrLayers = {};  // 已載入的圖層
const overlayMaps = {};

// 建立控制器但不加入任何圖層
const layerControl = L.control.layers({}, {}, { collapsed: false }).addTo(map);

// 載入圖層函數
function loadRRLayer(season) {
  if (rrLayers[season]) {
    rrLayers[season].addTo(map);
    return;
  }

  fetch(`data/RR_map_${season}.tif`)
    .then(res => res.arrayBuffer())
    .then(buffer => parseGeoraster(buffer))
    .then(georaster => {
      const layer = new GeoRasterLayer({
        georaster,
        opacity: 0.7,
        pixelValuesToColorFn: values => getColor(values[0]),
        resolution: 128,  // 降低解析度以加速顯示
      });

      rrLayers[season] = layer;
      overlayMaps[season] = layer;
      layer.addTo(map);

      // 更新控制器（只更新一次）
      layerControl.addOverlay(layer, season);

      if (season === "DJF") {
        map.fitBounds(layer.getBounds());
      }
    })
    .catch(err => {
      console.error(`載入 ${season} 失敗:`, err);
    });
}

// 預設載入 DJF
loadRRLayer("DJF");