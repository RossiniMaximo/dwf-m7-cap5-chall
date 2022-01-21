const MAPBOX_TOKEN =
  "pk.eyJ1IjoibWF4emkiLCJhIjoiY2t5bHJqdzRpMHczNjJ2cGtzODc3cnd0eSJ9.X4K8_sRROGgfFfMlr56mDA";
const mapboxClient = new MapboxClient(MAPBOX_TOKEN);
function initMap() {
  mapboxgl.accessToken = MAPBOX_TOKEN;
  return new mapboxgl.Map({
    container: "map",
    style: "mapbox://styles/mapbox/streets-v11",
  });
}

function initSearchForm(callback) {
  const form = document.querySelector(".search-form");
  form.addEventListener("submit", (e) => {
    e.preventDefault();
    mapboxClient.geocodeForward(
      e.target.q.value,
      {
        // country: "ar",
        autocomplete: true,
        language: "es",
      },
      function (err, data, res) {
        console.log(data);
        if (!err) callback(data.features);
      }
    );
  });
}
(function () {
  const map = initMap();
  initSearchForm(function (results) {
    const firstResult = results[0];
    map.setCenter(firstResult.geometry.coordinates);
    const marker = new mapboxgl.Marker()
      .setLngLat(firstResult.geometry.coordinates)
      .addTo(map);
    const coordinates = firstResult.geometry.coordinates;
    const lat = coordinates[1];
    const lng = coordinates[0];
    fetch("/comerces-nearby?lat=" + lat + "&lng=" + lng, {
      method: "get",
    })
      .then((res) => {
        console.log(res);
        res.json();
      })
      .then((data) => {
        console.log("soy la data", data);
        for (const comerce of data) {
          const { lat, lng } = comerce._geoloc;
          const marker = new mapboxgl.Marker().setLngLat(lng, lat).addTo(map);
        }
      });

    map.setZoom(14);
  });
})();
