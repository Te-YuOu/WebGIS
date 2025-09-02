
// 初始化地圖
const map = L.map('map').setView([23.5, 121], 7);

// OSM 底圖
L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
  attribution: '© OpenStreetMap contributors'
}).addTo(map);

// 建立四季的 RR GeoTIFF 圖層
const rrLayerDJF = new L.LeafletGeotiff('./data/RR_map_DJF.tif', {
  renderer: new L.LeafletGeotiff.Plotty({
    displayMin: 0.0,
    displayMax: 0.6,
    colorScale: 'viridis',
  }),
  name: "DJF RR"
});

const rrLayerMAM = new L.LeafletGeotiff('./data/RR_map_MAM.tif', {
  renderer: new L.LeafletGeotiff.Plotty({
    displayMin: 0.0,
    displayMax: 0.6,
    colorScale: 'viridis',
  }),
  name: "MAM RR"
});

const rrLayerJJA = new L.LeafletGeotiff('./data/RR_map_JJA.tif', {
  renderer: new L.LeafletGeotiff.Plotty({
    displayMin: 0.0,
    displayMax: 0.6,
    colorScale: 'viridis',
  }),
  name: "JJA RR"
});

const rrLayerSON = new L.LeafletGeotiff('./data/RR_map_SON.tif', {
  renderer: new L.LeafletGeotiff.Plotty({
    displayMin: 0.0,
    displayMax: 0.6,
    colorScale: 'viridis',
  }),
  name: "SON RR"
});

// 加入圖層切換控制器
const overlayMaps = {
  "DJF": rrLayerDJF,
  "MAM": rrLayerMAM,
  "JJA": rrLayerJJA,
  "SON": rrLayerSON,
};

L.control.layers({}, overlayMaps, { collapsed: false }).addTo(map);

// 預設顯示 DJF 圖層
rrLayerDJF.addTo(map);
