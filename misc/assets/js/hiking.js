document.addEventListener("DOMContentLoaded", function () {

  const container = document.getElementById("hiking-routes");

  if (!container) {
    return;
  }

  // Remove "Loading hiking routes..."
  container.innerHTML = "";

  if (typeof gpxFiles === "undefined" || gpxFiles.length === 0) {
    container.innerHTML = "<p>No hiking routes yet.</p>";
    return;
  }

  const routes = [];
  let loadedCount = 0;


  gpxFiles.forEach(function (item, index) {

    const file = item.file;

    const gpx = new L.GPX(file, {
      async: true,
      marker_options: {
        startIconUrl: null,
        endIconUrl: null,
        shadowUrl: null
      }
    });


    gpx.on("loaded", function (e) {

      const gpxLayer = e.target;

      const distance =
        (gpxLayer.get_distance() / 1000).toFixed(2);

      const startTime =
        gpxLayer.get_start_time();

      routes.push({
        file: file,
        distance: distance,
        date: startTime,
        gpx: gpxLayer
      });

      loadedCount++;

      if (loadedCount === gpxFiles.length) {
        renderRoutes();
      }

    });


    gpx.on("error", function () {

      console.error("Failed to load GPX:", file);

      loadedCount++;

      if (loadedCount === gpxFiles.length) {
        renderRoutes();
      }

    });

  });


  function renderRoutes() {

    // Latest route first
    routes.sort(function (a, b) {

      if (!a.date) return 1;
      if (!b.date) return -1;

      return b.date - a.date;

    });


    routes.forEach(function (route, index) {

      const routeElement =
        document.createElement("div");

      routeElement.className = "hiking-route";


      // Route information
      const info =
        document.createElement("div");

      info.className = "hiking-info";


      let dateText = "Unknown date";

      if (route.date) {

        dateText =
          route.date.toLocaleDateString(
            "en-GB",
            {
              day: "numeric",
              month: "short",
              year: "numeric"
            }
          );

      }


      info.innerHTML =
        "<span>" + dateText + "</span>" +
        "<span>" + route.distance + " km</span>";


      // Map
      const mapElement =
        document.createElement("div");

      mapElement.className = "hiking-map";

      mapElement.id =
        "hiking-map-" + index;


      routeElement.appendChild(info);
      routeElement.appendChild(mapElement);

      container.appendChild(routeElement);


      const map =
        L.map(mapElement.id, {
          scrollWheelZoom: false
        });


      L.tileLayer(
        "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",
        {
          maxZoom: 19,
          attribution:
            "&copy; OpenStreetMap contributors"
        }
      ).addTo(map);


      route.gpx.addTo(map);

      map.fitBounds(
        route.gpx.getBounds(),
        {
          padding: [20, 20]
        }
      );

    });

  }

});