const map = L.map("map").setView([23.5, 121], 7);

// OSM 底圖
L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
  attribution: "© OpenStreetMap contributors",
}).addTo(map);

// 建立空物件儲存圖層
const rrLayers = {};
const seasons = ["DJF", "MAM", "JJA", "SON"];
const overlayMaps = {};

// 遞迴載入四季 GeoTIFF
seasons.forEach(season => {
  fetch(`data/RR_map_${season}.tif`)
    .then(res => res.arrayBuffer())
    .then(buffer => parseGeoraster(buffer))
    .then(georaster => {
      const layer = new GeoRasterLayer({
        georaster,
        opacity: 0.7,
        pixelValuesToColorFn: (val) => {
          if (val[0] === null) return null;
          if (val[0] > 0.5) return "#800026";
          if (val[0] > 0.4) return "#BD0026";
          if (val[0] > 0.3) return "#E31A1C";
          if (val[0] > 0.2) return "#FC4E2A";
          if (val[0] > 0.1) return "#FD8D3C";
          if (val[0] > 0.05) return "#FEB24C";
          if (val[0] > 0.01) return "#FED976";
          return "#FFEDA0";
        },
        resolution: 256
      });

      rrLayers[season] = layer;
      overlayMaps[season] = layer;

      // 預設加載 DJF
      if (season === "DJF") {
        layer.addTo(map);
        map.fitBounds(layer.getBounds());
      }

      // 更新圖層切換控制
      L.control.layers({}, overlayMaps, { collapsed: false }).addTo(map);
    });
});