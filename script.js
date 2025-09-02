// 初始化地圖
const map = L.map("map").setView([23.5, 121], 7);
L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
  attribution: "© OpenStreetMap contributors",
}).addTo(map);

// 自訂色階對應函式
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
const rrLayers = {};
const overlayMaps = {};
const layerControl = L.control.layers({}, {}, { collapsed: false }).addTo(map);
let layerControlAdded = false;

// loading DOM 控制
const loadingDiv = document.getElementById("loading");
function showLoading() {
  if (loadingDiv) loadingDiv.style.display = "block";
}
function hideLoading() {
  if (loadingDiv) loadingDiv.style.display = "none";
}

// 載入 GeoTIFF 圖層函式
function loadRRLayer(season) {
  if (rrLayers[season]) {
    rrLayers[season].addTo(map);
    return;
  }

  showLoading();

  fetch(`data/RR_map_${season}.tif`)
    .then((res) => res.arrayBuffer())
    .then((buf) => parseGeoraster(buf))
    .then((georaster) => {
      const layer = new GeoRasterLayer({
        georaster,
        opacity: 0.7,
        pixelValuesToColorFn: (values) => getColor(values[0]),
        resolution: 128,
      });

      rrLayers[season] = layer;
      overlayMaps[season] = layer;
      layer.addTo(map);

      // 加入圖層控制器（只執行一次）
      if (!layerControlAdded) {
        Object.entries(overlayMaps).forEach(([s, lay]) => {
          layerControl.addOverlay(lay, s);
        });
        layerControlAdded = true;
      }

      // 初次載入自動調整視野
      if (season === "DJF") {
        map.fitBounds(layer.getBounds());
      }

      hideLoading();
    })
    .catch((err) => {
      console.error(`載入 ${season} 失敗:`, err);
      hideLoading();
      alert(`載入 ${season} 圖層失敗`);
    });
}

// 預設載入 DJF
loadRRLayer("DJF");