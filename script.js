const map = L.map('map').setView([23.5, 121], 7); // 台灣中心

L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
  attribution: '© OpenStreetMap contributors'
}).addTo(map);

fetch('data/cloud_fog.geojson')
  .then(response => response.json())
  .then(data => {
    const geojson = L.geoJSON(data, {
      onEachFeature: function (feature, layer) {
        const props = feature.properties;
        let content = "";
        for (const key in props) {
          content += `<b>${key}</b>: ${props[key]}<br>`;
        }
        layer.bindPopup(content);
      },
      pointToLayer: function (feature, latlng) {
        return L.circleMarker(latlng, {
          radius: 6,
          fillColor: "#FF5733",
          color: "#fff",
          weight: 1,
          opacity: 1,
          fillOpacity: 0.8
        });
      }
    }).addTo(map);
  });