// Earthquake mapping: location, magnitude, depth

// Create map
let myMap = L.map("map", {
  center: [39, -97],
  zoom: 3
});

// Add tile layer to map
L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
}).addTo(myMap);

// API endpoint for earthquakes in the past seven days
let url = 'https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_week.geojson';

// Get geoJSON dataset using D3
d3.json(url).then(function(response) {
    // With response, send Feature object to function  
    createFeatures(response.features);

  // Function for marker sizing by magnitude
  function markerSize(magnitude) {
      if(magnitude === 0) {
        return 1;
      }
      return magnitude * 4
  }

  // Function for map features
  function createFeatures(earthquakeData) {
  
    // Function to limit location precision
    function round(num, decimalPlaces = 0) {
      num = Math.round(num + "e" + decimalPlaces);
      return Number(num + "e" + -decimalPlaces);
      }
    
    // Define function to run once for each in the features array
    // Give each feature a popup that describes the place and time of the earthquake.
    function onEachFeature(feature, layer) {
      layer.bindPopup(`<h3>${feature.properties.place}</h3><hr>
        <p>Latitude, Longitude: ${round(feature.geometry.coordinates[1],4)}, ${round(feature.geometry.coordinates[0],4)}</p>
        <p>Magnitude: ${feature.properties.mag}</p>
        <p>Depth: ${(feature.geometry.coordinates[2])}</p>`
        );
        }
        
    // Define function for circle (geoJSON option pointToLayer)
    function createMarker(point, latlng) {
      return L.circleMarker(latlng);
      }
      
    // Function for depth color treatment
    function markerColor(depth) {
      if (depth < 10) return "green"
      else if (depth < 30) return "greenyellow"
      else if (depth < 50) return "yellow"
      else if (depth < 70) return "orange"
      else if (depth < 90) return "orangered"
      else return "red";
    };

    // Define function for styling circles
    function style(features) {
      return {
        opacity: 0.5,
        fillopacity: 0.5,
        radius: markerSize(features.properties.mag),
        fillColor: markerColor(features.geometry.coordinates[2]),
        color: 'black',
        weight: 1
        };
      };

    // Create a GeoJSON layer that contains the features array on the earthquakeData object
    let earthquakes = L.geoJSON(earthquakeData, {
      // Run the onEachFeature function once for each piece of data in the array
      onEachFeature: onEachFeature,
      pointToLayer: createMarker,
      // The function name (being the same) will become the key (e.g., style: style)
      style: style
    }).addTo(myMap);
  };

  // Create map legend
  let legend = L.control({
    position: "bottomright"
    })
    legend.onAdd = function () {
      let div = L.DomUtil.create("div", "info legend");
      let grades = [-10,10,30,50,70,90]
      let colors = [
        "green", "greenyellow", "yellow", "orange", "orangered", "red"
        ];
        // Loop to add html tags containing legend styling
        for (let i = 0; i < grades.length; i++){
          div.innerHTML += "<i style ='background: " + colors[i] + "'</i>"
          + grades[i] + (grades[i +1] ? "&ndash;" + grades[i + 1] + "<br>" : "+");
          };
          return div;
      };
          
  // Add legend to the map
  legend.addTo(myMap)
  });