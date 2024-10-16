// Initialize the map
const map = L.map('map').setView([37.8, -96], 4); // Center of the US

// Add a tile layer
L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    maxZoom: 19,
}).addTo(map);

// Function to set marker size based on magnitude
function markerSize(magnitude) {
    return magnitude * 5; // Scale factor for size
}

// Function to set color based on depth
function getColor(depth) {
    return depth > 100 ? '#FF0000' :   // Red for deep earthquakes
           depth > 50  ? '#FF7F00' :   // Orange for medium depth
           depth > 20  ? '#FFFF00' :   // Yellow for shallow depth
           depth > 0   ? '#7FFF00' :   // Light green for very shallow
                         '#00FF00';    // Green for no depth
}

// Fetch the GeoJSON data
fetch('https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_week.geojson')
    .then(response => response.json())
    .then(data => {
        // Add the GeoJSON layer to the map
        L.geoJSON(data, {
            pointToLayer: function (feature, latlng) {
                // Create a circle marker
                return L.circleMarker(latlng, {
                    radius: markerSize(feature.properties.mag),
                    fillColor: getColor(feature.geometry.coordinates[2]), // Depth
                    color: "#000",
                    weight: 1,
                    opacity: 1,
                    fillOpacity: 0.8
                });
            },
            onEachFeature: function (feature, layer) {
                layer.bindPopup(`Magnitude: ${feature.properties.mag}<br>
                                  Location: ${feature.properties.place}<br>
                                  Depth: ${feature.geometry.coordinates[2]} km`);
            }
        }).addTo(map);

        // Create a legend
        const legend = L.control({ position: 'bottomright' });

        legend.onAdd = function () {
            const div = L.DomUtil.create('div', 'info legend');
            const depthLevels = [0, 20, 50, 100];
            const labels = ['<strong>Depth (km)</strong>'];

            // Loop through depth levels and generate a colored square for each
            depthLevels.forEach((depth, index) => {
                div.innerHTML +=
                    '<i style="background:' + getColor(depth + 1) + '"></i> ' +
                    depth + (depthLevels[index + 1] ? '&ndash;' + depthLevels[index + 1] + '<br>' : '+');
            });

            return div;
        };

        legend.addTo(map);
    })
    .catch(error => console.error('Error fetching the earthquake data:', error));