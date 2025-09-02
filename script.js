const map = L.map("map").setView([23.5, 121], 7);
L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
  attribution: "© OpenStreetMap contributors",
}).addTo(map);

function getColor(val) { /* 同前 */ }
const seasons = ["DJF", "MAM", "JJA", "SON"];
const rrLayers = {};
const overlayMaps = {};
const layerControl = L.control.layers({}, {}, { collapsed: false }).addTo(map);
let layerControlAdded = false;

// 新增 loading 控制
const loadingDiv = document.getElementById("loading");

function showLoading() {
  loadingDiv.style.display = "block";
}
function hideLoading() {
  loadingDiv.style.display = "none";
}

function loadRRLayer(season) {
  if (rrLayers[season]) {
    rrLayers[season].addTo(map);
    return;
  }

  showLoading();  // 顯示載入中

  fetch(`data/RR_map_${season}.tif`)
    .then(res => res.arrayBuffer())
    .then(buf => parseGeoraster(buf))
    .then(georaster => {
      const layer = new GeoRasterLayer({
        georaster,
        opacity: 0.7,
        pixelValuesToColorFn: values => getColor(values[0]),
        resolution: 128,
      });

      rrLayers[season] = layer;
      overlayMaps[season] = layer;
      layer.addTo(map);

      if (!layerControlAdded) {
        Object.entries(overlayMaps).forEach(([s, lay]) => {
          layerControl.addOverlay(lay, s);
        });
        layerControlAdded = true;
      }

      if (season === "DJF") {
        map.fitBounds(layer.getBounds());
      }

      hideLoading();  // 隱藏載入中
    })
    .catch(err => {
      console.error(`載入 ${season} 失敗:`, err);
      hideLoading();
      alert(`載入 ${season} 圖層失敗`);
    });
}

// 預設載入 DJF
loadRRLayer("DJF");