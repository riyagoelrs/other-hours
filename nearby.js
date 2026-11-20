/* Explicit, cancellable device-location lookup. No storage or network calls. */
"use strict";
const OH_NEARBY = (() => {
  function create({ geolocation, onPosition, onStatus }) {
    let generation = 0;
    function cancel() {
      generation++;
    }
    function locate() {
      const request = ++generation;
      if (!geolocation) {
        onStatus(
          "Location is unavailable here. Choose a borough or neighborhood.",
          false,
        );
        return;
      }
      onStatus("Waiting for your location…", true);
      geolocation.getCurrentPosition(
        ({ coords }) => {
          if (request !== generation) return;
          const point = { lat: coords.latitude, lng: coords.longitude };
          if (!OH_DISCOVERY.validCoordinates(point)) {
            onStatus(
              "That location could not be read. Choose an area instead.",
              false,
            );
            return;
          }
          onPosition(point);
          onStatus(
            "Distances use approximate address points, not walking routes. Your location stays in memory until you leave or choose an area.",
            false,
          );
        },
        (error) => {
          if (request !== generation) return;
          onStatus(
            error.code === 1
              ? "Location was not shared. Choose a borough or neighborhood."
              : "Location could not be found. Try again or choose an area.",
            false,
          );
        },
        { enableHighAccuracy: false, timeout: 10000, maximumAge: 300000 },
      );
    }
    return { locate, cancel };
  }
  return { create };
})();
if (typeof module !== "undefined" && module.exports) module.exports = OH_NEARBY;
