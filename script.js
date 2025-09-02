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
// 使用群組統一管理 GeoTIFF 圖層，切換時先清空群組，避免殘影
const rasterGroup = L.layerGroup().addTo(map);
// 將季節圖層改由自訂控制元件管理（不使用 LayersControl 以避免重疊殘留）
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

      if (!firstLayerLoaded) {
        rasterGroup.addLayer(layer);
        currentSeasonLayer = layer;
        map.fitBounds(layer.getBounds());
        firstLayerLoaded = true;
      }
    })
    .catch(err => console.error(`載入 ${season} 失敗:`, err));
}

// 載入所有季節
seasons.forEach(loadSeason);

// 提供顯示指定季節的函式，先移除舊圖層再加入新圖層，避免殘留
function showSeason(season) {
  const layer = rrLayers[season];
  if (!layer) return; // 尚未載入完成
  // 先清空群組，確保舊的 GeoTIFF canvas 被移除
  rasterGroup.clearLayers();
  // 防禦性清理：移除 overlayPane 中可能遺留的 canvas
  try {
    const overlayPane = map.getPanes && map.getPanes().overlayPane;
    if (overlayPane) {
      Array.from(overlayPane.querySelectorAll('canvas')).forEach((c) => {
        if (c && c.parentNode === overlayPane) overlayPane.removeChild(c);
      });
    }
  } catch (e) {
    // ignore
  }
  rasterGroup.addLayer(layer);
  currentSeasonLayer = layer;
}

// 自訂「季節切換」控制（使用單選 radio，確保互斥）
const SeasonControl = L.Control.extend({
  options: { position: "topright" },
  onAdd: function () {
    const div = L.DomUtil.create("div", "leaflet-bar");
    div.style.background = "white";
    div.style.padding = "6px 8px";
    div.style.lineHeight = "1.2";
    div.innerHTML = "<strong>Season</strong><br>";
    seasons.forEach((s, i) => {
      const checked = i === 0 ? "checked" : "";
      div.innerHTML += `
        <label style="display:block;margin:2px 0;">
          <input type="radio" name="season" value="${s}" ${checked}/> ${s}
        </label>`;
    });
    L.DomEvent.disableClickPropagation(div);
    div.addEventListener("change", (e) => {
      if (e.target && e.target.name === "season") {
        showSeason(e.target.value);
      }
    });
    return div;
  },
});

new SeasonControl().addTo(map);
