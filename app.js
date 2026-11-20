"use strict";
const data = OH_DATA;
const discovery = OH_DISCOVERY.create(data);
const $ = (selector) => document.querySelector(selector);
const $$ = (selector) => [...document.querySelectorAll(selector)];
const html = (value = "") =>
  String(value).replace(
    /[&<>"']/g,
    (c) =>
      ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[
        c
      ],
  );
const storage = {
  get(key, fallback) {
    try {
      return JSON.parse(localStorage.getItem(key)) ?? fallback;
    } catch {
      return fallback;
    }
  },
  set(key, value) {
    try {
      localStorage.setItem(key, JSON.stringify(value));
      return true;
    } catch {
      notify("Your browser could not save this. Copy the guide to keep it.");
      return false;
    }
  },
};
const strings = (value) =>
  Array.isArray(value) ? value.filter((v) => typeof v === "string") : [];
const savedProjects = () => strings(storage.get("oh:saved", []));
const savedInterests = () => strings(storage.get("oh:interests:v2", []));
const savedPlans = () => {
  const value = storage.get("oh:plans:v1", []);
  return Array.isArray(value)
    ? value.filter(
        (p) =>
          p &&
          typeof p.id === "string" &&
          /^[a-zA-Z0-9-]+$/.test(p.id) &&
          typeof p.title === "string" &&
          typeof p.materials === "string" &&
          typeof p.steps === "string" &&
          (!p.projectSlug ||
            data.projects.some((project) => project.slug === p.projectSlug)),
      )
    : [];
};
const checkedFor = (slug) => {
  const value = storage.get("oh:checked:" + slug, []);
  return Array.isArray(value)
    ? [...new Set(value.filter((n) => Number.isInteger(n) && n >= 0))]
    : [];
};
const preference = storage.get("oh:preferences:v2", {});
const initialBorough =
  preference && data.cities.nyc.boroughs[preference.borough]
    ? preference.borough
    : "";
const initialNeighborhood =
  initialBorough &&
  data.cities.nyc.boroughs[initialBorough].neighborhoods.includes(
    preference.neighborhood,
  )
    ? preference.neighborhood
    : "";
const state = {
  view: "projects",
  query: "",
  limit: 8,
  cityId: "nyc",
  borough: initialBorough,
  neighborhood: initialNeighborhood,
  category: "all",
  budget: "",
  duration: "",
  communityType: "groups",
  center: null,
  radiusKm: 4.828032,
  includeUnlocated: true,
  beginner: false,
  free: false,
  reuse: false,
  placeType: "",
  placeDisplay: "list",
  mapReference: "",
};
const viewHashes = {
  projects: "#explore",
  materials: "#materials",
  community: "#community",
  people: "#people",
  saved: "#saved",
};
let toastTimer,
  linkBusy = false,
  currentInspiration = null,
  selectedTemplate = "",
  dialogOrigin = null;
let returnHash = "#explore",
  dialogScroll = 0;
const bookmarkIcon =
  '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M6 4h12v16l-6-4-6 4z"/></svg>';
const range = (min, max) =>
  min == null
    ? "Check provider fee"
    : min === max
      ? min
        ? "$" + min
        : "$0 with what you own"
      : `$${min}–${max}`;
const areaName = () =>
  (state.center
    ? "within " + (state.radiusKm / 1.609344).toFixed(0) + " mi of you"
    : "") ||
  state.neighborhood ||
  data.cities.nyc.boroughs[state.borough]?.name ||
  "all NYC";
const external = (url, label, className = "") =>
  /^https:\/\//.test(url || "")
    ? `<a class="${className}" href="${html(url)}" target="_blank" rel="noopener noreferrer">${html(label)}</a>`
    : "";
const mapLink = (p) =>
  "https://www.google.com/maps/search/?api=1&query=" +
  encodeURIComponent(p.name + " " + p.address);
function notify(message) {
  $("#toast").textContent = message;
  $("#toast").classList.add("show");
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => $("#toast").classList.remove("show"), 3500);
}
function persistArea() {
  storage.set("oh:preferences:v2", {
    cityId: state.cityId,
    borough: state.borough,
    neighborhood: state.neighborhood,
  });
}
const nearby = OH_NEARBY.create({
  geolocation: navigator.geolocation,
  onPosition(point) {
    state.center = point;
    state.borough = "";
    state.neighborhood = "";
    state.limit = 12;
    render();
  },
  onStatus(message, busy) {
    $("#location-status").textContent =
      (state.center &&
      OH_DISCOVERY.distanceKm(state.center, { lat: 40.7128, lng: -74.006 }) > 65
        ? "This directory currently covers NYC. No local directory is available for your area; choose an NYC neighborhood to browse. "
        : "") + message;
    $("#use-location").disabled = busy;
    $("#use-location").textContent = busy
      ? "Finding location…"
      : state.center
        ? "Refresh location"
        : "Use my location";
  },
});
function stopNearby() {
  nearby.cancel();
  state.center = null;
  $("#use-location").disabled = false;
  $("#location-status").textContent =
    "NYC directory. Choose an area or share your location for distance sorting.";
}
function proximity(item) {
  if (!state.center) return "";
  const distance = discovery.distanceTo(item, state);
  if (distance === null)
    return '<p class="proximity unlocated">Changing or unlisted location · check organizer details</p>';
  const miles = distance / 1.609344;
  return `<p class="proximity">${miles < 0.1 ? "Less than 0.1" : miles.toFixed(1)} mi ${item.type === "community" || item.type === "class" ? "to host venue" : "away"} · approximate</p>`;
}
function updateLocationControls() {
  $("#borough-select").value = state.borough;
  $("#radius-label").hidden = !state.center;
  $("#clear-location").hidden = !state.center;
  $("#unlocated-label").hidden =
    !state.center || !["materials", "community"].includes(state.view);
  $("#radius-select").value = String(state.radiusKm);
  $("#unlocated-filter").checked = state.includeUnlocated;
  if (!$("#use-location").disabled)
    $("#use-location").textContent = state.center
      ? "Refresh location"
      : "Use my location";
  const neighborhoods = state.borough
    ? data.cities.nyc.boroughs[state.borough].neighborhoods
    : Object.values(data.cities.nyc.boroughs).flatMap((b) => b.neighborhoods);
  $("#neighborhood-select").innerHTML =
    '<option value="">All neighborhoods</option>' +
    neighborhoods
      .map((n) => `<option value="${html(n)}">${html(n)}</option>`)
      .join("");
  $("#neighborhood-select").value = state.neighborhood;
}
function syncFilters() {
  updateLocationControls();
  const refinements = [
    state.category !== "all",
    state.duration,
    state.budget,
    state.beginner,
    state.free,
    state.reuse,
    state.borough,
    state.neighborhood,
    state.center,
    state.placeType,
    state.view === "community" && state.communityType !== "groups",
  ].filter(Boolean).length;
  $("#filter-count").textContent = refinements ? `(${refinements})` : "";
  $("#category-select").value = state.category;
  const budget = $("#budget-select");
  budget.querySelectorAll("[data-custom]").forEach((el) => el.remove());
  if (
    state.budget !== "" &&
    ![...budget.options].some((option) => option.value === String(state.budget))
  )
    budget.add(new Option("Under $" + state.budget, String(state.budget)));
  [...budget.options]
    .filter((o) => !["", "15", "30", "50", "100"].includes(o.value))
    .forEach((o) => (o.dataset.custom = "true"));
  budget.value = state.budget;
  const activityView = ["projects", "saved"].includes(state.view);
  budget.disabled = !activityView;
  $("#budget-label").hidden = !activityView;
  $("#duration-label").hidden = !activityView;
  const duration = $("#duration-select");
  duration.querySelectorAll("[data-custom]").forEach((o) => o.remove());
  if (
    state.duration &&
    ![...duration.options].some((o) => o.value === String(state.duration))
  ) {
    const option = new Option(
      "Up to " + state.duration + " minutes",
      String(state.duration),
    );
    option.dataset.custom = "true";
    duration.add(option);
  }
  duration.value = state.duration;
  $("#community-type-label").hidden = state.view !== "community";
  $("#community-type").value = state.communityType;
  $("#beginner-filter").checked = state.beginner;
  $("#free-filter").checked = state.free;
  $("#reuse-filter").checked = state.reuse;
  $("#beginner-filter").disabled = ["materials", "people"].includes(state.view);
  $("#free-filter").disabled = ["materials", "people"].includes(state.view);
  $("#reuse-filter").disabled = ["community", "people"].includes(state.view);
  for (const id of ["beginner-filter", "free-filter", "reuse-filter"])
    $("#" + id).closest("label").hidden = $("#" + id).disabled;
  $("#free-filter").closest("label").lastChild.textContent =
    state.view === "community" ? "Free resources" : "Free starts";
  $("#place-type").value = state.placeType;
  $("#place-type-label").hidden = state.view !== "materials";
  $$("[data-category]").forEach((button) =>
    button.setAttribute(
      "aria-pressed",
      String(button.dataset.category === state.category),
    ),
  );
}
function artFor(project) {
  if (project.slug === "leather-journal" || /book|journal/.test(project.visual))
    return "journal";
  if (/denim|tote|sashiko|patchwork/.test(project.visual)) return "sewing";
  if (/camera|cyanotype/.test(project.visual)) return "camera";
  if (/bead|ring|glass/.test(project.visual)) return "beads";
  if (/clay|candle/.test(project.visual)) return "clay";
  if (/crochet|knit|weave|needle|macrame|felting|patch/.test(project.visual))
    return "yarn";
  if (/flower|botanical/.test(project.visual)) return "botanical";
  if (/dance|bird|chess|writing/.test(project.visual)) return project.visual;
  return "print";
}
const activityPhotos = {
  bookbinding: {
    src: "./assets/photos/photo-journal.jpg",
    alt: "A journal filled with photographs and handmade paper details",
    position: "50% 50%",
  },
  sewing: {
    src: "./assets/photos/sewing.jpg",
    alt: "A person working with fabric at a sewing machine",
    position: "50% 55%",
  },
  embroidery: {
    src: "./assets/photos/fabric.webp",
    alt: "Fabric, thread and paper patterns on a worktable",
    position: "50% 50%",
  },
  textiles: {
    src: "./assets/photos/yarn.jpg",
    alt: "Yarn, scissors and thread arranged beside a sewing machine",
    position: "50% 50%",
  },
  crochet: {
    src: "./assets/photos/yarn.jpg",
    alt: "Yarn, scissors and thread arranged beside a sewing machine",
    position: "50% 50%",
  },
  ceramics: {
    src: "./assets/photos/clay-club.jpg",
    alt: "Two people working on clay pieces together",
    position: "50% 55%",
  },
  jewelry: {
    src: "./assets/photos/beads-table.jpg",
    alt: "Colorful beads and necklaces being assembled by hand",
    position: "50% 50%",
  },
  painting: {
    src: "./assets/photos/painting.jpg",
    alt: "People painting and sharing an art project at a table",
    position: "50% 55%",
  },
  printmaking: {
    src: "./assets/photos/scrapbook.webp",
    alt: "Paper, photographs and collage details in an open scrapbook",
    position: "50% 50%",
  },
  gardening: {
    src: "./assets/photos/flowers.webp",
    alt: "People arranging flowers at a table",
    position: "50% 50%",
  },
  writing: {
    src: "./assets/photos/photo-journal.jpg",
    alt: "A journal filled with photographs and handmade paper details",
    position: "50% 50%",
  },
  reading: {
    src: "./assets/photos/photo-journal.jpg",
    alt: "A journal filled with photographs and handmade paper details",
    position: "50% 50%",
  },
};
function projectCard({ item: p, localCount }, i = 0) {
  const saved = savedProjects().includes(p.slug);
  const photo =
    p.slug === "beaded-necklace"
      ? {
          src: "./assets/photos/beadwork.webp",
          alt: "Hands threading beads into jewelry",
          position: "50% 60%",
        }
      : p.slug === "glass-bead-intro"
        ? {
            src: "./assets/photos/beads.jpg",
            alt: "Colorful beads sorted in a supplies box",
            position: "50% 50%",
          }
        : p.hobbyIds.map((id) => activityPhotos[id]).find(Boolean);
  const image = photo
    ? `<img src="${photo.src}" alt="${html(photo.alt)}" width="600" height="400" loading="lazy" style="object-position:${photo.position}" />`
    : `<img src="./assets/illustrations/${artFor(p)}.svg" alt="" width="600" height="400" loading="lazy" />`;
  return `<article class="project-card ${photo ? "has-photo" : "has-illustration"} card-tone-${i % 4}"><a class="project-visual" href="#project/${p.slug}" tabindex="-1" aria-hidden="true">${image}<span class="visual-label">${p.beginnerFriendly ? "BEGINNER FRIENDLY" : html(data.hobbies[p.hobbyIds[0]].name)}</span></a><button class="bookmark" data-save="${p.slug}" aria-label="${saved ? "Unsave" : "Save"} ${html(p.title)}" aria-pressed="${saved}">${bookmarkIcon}</button><div class="card-info"><span class="card-category">${html(data.hobbies[p.hobbyIds[0]].name)}</span><h3><a href="#project/${p.slug}">${html(p.title)}</a></h3><div class="card-meta"><span>${html(p.time)}</span><span>${p.budgetStatus === "provider-quote-required" ? "Check workshop fee" : p.budgetMin === 0 ? "Free start possible" : "$" + p.budgetMin + "–" + p.budgetMax + " est."}</span></div><p class="card-area">${state.center || state.borough || state.neighborhood ? (localCount ? `${localCount} related place${localCount === 1 ? "" : "s"} ${state.center ? "" : "in "}${html(areaName())}` : "Start anywhere · NYC resources") : p.reuseAvailable ? "Reuse and borrowing options" : "Start with a beginner workshop"}</p></div></article>`;
}
const placeTypes = {
  reuse: "SECONDHAND & REUSE",
  "specialist-retail": "SPECIALIST RETAIL",
  "shared-equipment": "SHARED EQUIPMENT",
  "community-exchange": "COMMUNITY RESOURCES",
  classes: "STUDIO & LEARNING",
};
function placeCard(p, i) {
  return `<article class="directory-card"><p class="eyebrow"><span>${placeTypes[p.type]}</span><span>NEW YORK CITY</span></p><h3>${html(p.name)}</h3><p class="card-area">${html(p.area)}</p>${proximity(p)}<p class="place-address">${html(p.address)}</p><p>${html(p.summary)}</p><div class="card-actions">${external(p.url, "Visit website", "text-button")}</div><details class="place-access"><summary>Address, access &amp; what to know</summary><p>${html(p.address)}</p>${external(mapLink(p), "Open map")}<p class="access-note">${html(p.access)}</p><p>Useful for ${p.hobbyIds.map((id) => html(data.hobbies[id].name.toLowerCase())).join(", ")}. Ask about suitable materials; stock is not live.</p></details><p class="source-check">PUBLIC SOURCE · ${html(p.source.checkedAt)}${p.source.status === "access-restricted" ? " · ACCESS RESTRICTED HERE" : ""}</p></article>`;
}
const communityFormats = {
  meetup: "Meetup group",
  library: "Library programs",
  critique: "Peer critiques",
  volunteering: "Volunteer community",
  "maker-space": "Maker community",
  outdoors: "Outdoor community",
  garden: "Garden community",
  dance: "Dance community",
  "community-arts": "Community arts",
  workshop: "Workshop provider",
};
function communityCard(c, i) {
  const isClass = c.type === "class";
  return `<article class="directory-card"><p class="eyebrow"><span>${isClass ? "Classes & workshops" : html(communityFormats[c.format] || "Community")}</span></p><h3>${html(c.title || c.name)}</h3><p class="card-area">${html(c.area)}</p>${proximity(c)}<p>${html(c.summary)}</p><p>${isClass ? "Confirm fee, equipment, included supplies and beginner level with the provider." : html(c.join)}</p><div class="card-actions">${external(c.url, isClass ? "View workshops" : "Visit group / how to join", "text-button")}</div><p class="source-check">${isClass ? "PROGRAM REFERENCE · NO LIVE SEATS" : "PUBLIC ORGANIZATION · EXTERNAL TO OTHER HOURS"}</p></article>`;
}
function creatorCard(c) {
  const related = data.projects
    .filter((p) => p.creatorIds.includes(c.id))
    .slice(0, 2);
  return `<article class="creator-card"><div class="creator-top"><span class="creator-monogram" aria-hidden="true">${html(c.initials)}</span><div><p class="eyebrow">${html(c.specialty)}</p><h3>${html(c.name)}</h3></div></div><p>${html(c.area)}</p><p>${html(c.summary)}</p><div class="profile-projects">${related.map((p) => `<a href="#project/${p.slug}">${html(p.title)}</a>`).join("")}</div>${external(c.url, c.action, "text-button")}<p class="source-check">PUBLIC PROFILE · ${html(c.source.checkedAt)} · NO AFFILIATION IMPLIED</p></article>`;
}
function renderSavedExtras() {
  const plans = savedPlans(),
    interests = savedInterests().filter((id) => data.hobbies[id]);
  $("#saved-plans").hidden =
    state.view !== "saved" || (!plans.length && !interests.length);
  if (state.view !== "saved") return;
  $("#saved-plans").innerHTML =
    (interests.length
      ? `<h3 class="saved-plans-heading">Interests to come back to</h3><div class="active-query">${interests.map((id) => `<button class="button secondary" data-interest-open="${id}">${html(data.hobbies[id].name)}</button><button class="text-button" data-interest-remove="${id}" aria-label="Remove saved interest ${html(data.hobbies[id].name)}">Remove</button>`).join("")}</div>`
      : "") +
    (plans.length
      ? `<h3 class="saved-plans-heading">Your inspiration plans</h3><div class="directory-grid">${plans.map((p) => `<article class="saved-plan-card"><p class="eyebrow">EDITED BY YOU · SAVED ON THIS DEVICE</p><h3>${html(p.title)}</h3><p>${p.source?.attachments?.length ? p.source.attachments.length + " reference file(s) · saved on this device." : p.source?.provider ? "Inspired by a " + html(p.source.provider) + " link." : "Your own starter plan."}</p><button class="text-button" data-plan-open="${p.id}">Edit plan</button><button class="text-button" data-plan-delete="${p.id}">Remove</button></article>`).join("")}</div>`
      : "");
}
function renderMap(results) {
  const isMaterials = state.view === "materials";
  $("#place-display-controls").hidden = !isMaterials;
  $$("[data-place-display]").forEach((b) =>
    b.setAttribute(
      "aria-pressed",
      String(b.dataset.placeDisplay === state.placeDisplay),
    ),
  );
  $("#map-panel").hidden = !isMaterials || state.placeDisplay !== "map";
  if (!isMaterials || state.placeDisplay !== "map") {
    $("#map-panel").innerHTML = "";
    return;
  }
  const located = results
    .map((r) => r.item)
    .filter(
      (p) =>
        Number.isFinite(p.coordinates?.lat) &&
        Number.isFinite(p.coordinates?.lng),
    );
  if (!located.length) {
    $("#map-panel").innerHTML =
      '<p class="small-note">No verified address points for these filters yet. Use the address and external map links in the list below, or expand your area.</p>';
    return;
  }
  const reference =
    located.find((p) => p.id === state.mapReference) || located[0];
  state.mapReference = reference.id;
  const { lat, lng } = reference.coordinates;
  const nearby = located
    .filter((p) => p.id !== reference.id)
    .map((p) => ({
      place: p,
      distance: OH_DISCOVERY.distanceKm(reference.coordinates, p.coordinates),
    }))
    .filter((r) => r.distance <= 5)
    .sort((a, b) => a.distance - b.distance)
    .slice(0, 5);
  const mapUrl =
    "https://www.openstreetmap.org/export/embed.html?" +
    new URLSearchParams({
      bbox: [lng - 0.025, lat - 0.018, lng + 0.025, lat + 0.018].join(","),
      layer: "mapnik",
      marker: [lat, lng].join(","),
    });
  $("#map-panel").innerHTML =
    `<div class="map-heading"><label for="map-reference">Explore near <select id="map-reference">${located.map((p) => `<option value="${p.id}" ${p.id === reference.id ? "selected" : ""}>${html(p.name)}</option>`).join("")}</select></label><p class="small-note">${located.length} of ${results.length} results have sourced coordinates. The map centers on a venue; your device location is never sent to the map.</p></div><div class="map-layout"><div><iframe title="Street map near ${html(reference.name)}" src="${html(mapUrl)}" loading="lazy" referrerpolicy="no-referrer"></iframe><p class="map-attribution">Map © OpenStreetMap contributors · ${external(mapLink(reference), "Open full map")}</p></div><div class="nearby-list"><p class="eyebrow">WITHIN 5 KM OF ${html(reference.name)}</p>${nearby.length ? nearby.map(({ place: p, distance }) => `<div><strong>${external(p.url, p.name)}</strong><span>${distance < 0.1 ? "< 0.1" : distance.toFixed(1)} km</span><small>${html(p.area)} · ${external(mapLink(p), "Map")}</small></div>`).join("") : '<p class="small-note">No other verified points within 5 km among these results. Try a broader area or another interest.</p>'}<p class="small-note">Distances are straight lines between address points, not walking routes or accessible entrances. See access details in the list below.</p></div></div>`;
}
function render() {
  syncFilters();
  const saved = savedProjects();
  $("#saved-count").textContent = saved.length + savedPlans().length;
  $$("[data-view]").forEach((a) =>
    a.setAttribute(
      "aria-current",
      a.dataset.view === state.view ? "page" : "false",
    ),
  );
  $$("[data-result-view]").forEach((button) =>
    button.setAttribute(
      "aria-current",
      String(
        button.dataset.resultView === state.view ||
          (state.view === "saved" && button.dataset.resultView === "projects"),
      ),
    ),
  );
  for (const view of ["projects", "materials", "community", "people"])
    $("#" + view + "-count").textContent = discovery.search(
      view,
      state.query,
      state,
      saved,
    ).length;
  const results = discovery.search(state.view, state.query, state, saved);
  const title =
    state.view === "saved"
      ? "Your <em>saved things.</em>"
      : state.query
        ? "Search <em>results.</em>"
        : state.view === "materials"
          ? "Reuse &amp; supplies"
          : state.view === "community"
            ? "Find your people"
            : state.view === "people"
              ? "People &amp; creators"
              : "The hobby edit.";
  $("#results-title").innerHTML = title;
  $("#results-kicker").textContent =
    state.view === "saved" ? "SAVED ON THIS DEVICE" : "THE NYC HOBBY INDEX";
  $("#results-context").textContent =
    state.view === "projects"
      ? "Starter guides, with materials and local resources."
      : state.view === "materials"
        ? "Reuse first. Check access before you go."
        : state.view === "people"
          ? "Public creative profiles. Real ways to connect."
          : state.view === "saved"
            ? "Projects, interests and plans you want to keep."
            : "Public programs and communities. Check current details.";
  const resultUnit =
    state.view === "materials"
      ? "places"
      : state.view === "people"
        ? "profiles"
        : state.view === "community"
          ? "programs & groups"
          : "guides";
  const unlocated = results.filter((r) => r.distance === null).length;
  $("#result-summary").textContent = state.center
    ? state.view === "people"
      ? `${results.length} profiles · NYC · profiles are not distance-located`
      : ["projects", "saved"].includes(state.view)
        ? `${results.length} guides · related places prioritized near you`
        : `${results.length - unlocated} ${resultUnit} ${areaName()}${unlocated ? ` · ${unlocated} changing / unlisted locations` : ""}`
    : `${results.length} ${resultUnit} · ${areaName()}`;
  $("#active-query").hidden = !state.query;
  const interest = discovery.intent(state.query).hobbyIds[0];
  $("#active-query").innerHTML = state.query
    ? `<span class="query-tag">${html(state.query)}</span><button class="text-button" id="remove-query">Clear search ×</button>${interest ? `<button class="text-button" data-save-interest="${interest}">${savedInterests().includes(interest) ? "Interest saved ✓" : "Save this interest +"}</button>` : ""}`
    : "";
  const gridIds = [
    "project-grid",
    "places-grid",
    "community-grid",
    "creator-grid",
  ];
  const gridId = {
    projects: "project-grid",
    saved: "project-grid",
    materials: "places-grid",
    community: "community-grid",
    people: "creator-grid",
  }[state.view];
  gridIds.forEach((id) => {
    $("#" + id).hidden = id !== gridId || !results.length;
    if (id !== gridId) $("#" + id).innerHTML = "";
  });
  const cards = results.slice(0, state.limit);
  $("#" + gridId).innerHTML = cards
    .map((r, i) =>
      state.view === "materials"
        ? placeCard(r.item, i)
        : state.view === "community"
          ? communityCard(r.item, i)
          : state.view === "people"
            ? creatorCard(r.item)
            : projectCard(r, i),
    )
    .join("");
  renderMap(results);
  renderSavedExtras();
  const hasExtras =
    state.view === "saved" && (savedPlans().length || savedInterests().length);
  $("#empty-state").hidden = results.length !== 0 || !!hasExtras;
  $("#empty-message").textContent =
    state.view === "saved"
      ? "Save a guide with its bookmark, save an interest, or keep an editable inspiration plan. They’ll appear here on this device."
      : state.borough || state.neighborhood
        ? `No exact ${state.view === "projects" ? "guides" : "listings"} for these filters in ${areaName()}. Our directory is curated and still growing. Try all NYC or a related interest.`
        : state.center
          ? "No located results within this radius. Try 5 or 10 miles, include groups with changing venues, or choose an NYC neighborhood. This directory currently covers NYC."
          : "Try a related interest or fewer filters.";
  $("#load-more").hidden = results.length <= state.limit;
  $("#load-more").textContent =
    `Show ${Math.min(12, results.length - state.limit)} more`;
  $("#directory-note").textContent =
    state.view === "projects" || state.view === "saved"
      ? "Time filters use the upper end of stated active time; drying and ongoing care can take longer. Budgets are starting estimates using borrowed or owned tools. Check each guide’s full range."
      : state.view === "materials"
        ? "Budget and free-start filters apply to project recommendations. Shop inventory, ownership, prices and tool access are not assumed. Directory locations are curated; use the address and external map link."
        : state.view === "people"
          ? "Budget filters apply to project guides, not a person’s fees. Public professional profiles are external resources, without Other Hours accounts or endorsements."
          : "Programs are references, not live event listings. Check dates, fees, included supplies, beginner level and registration. Budget filters apply to guides; Free starts shows public free-resource organizations.";
}
function rememberSearch(query) {
  if (!query || /^https?:/i.test(query)) return;
  storage.set(
    "oh:recent:v2",
    [
      query,
      ...strings(storage.get("oh:recent:v2", [])).filter((q) => q !== query),
    ].slice(0, 4),
  );
  renderRecent();
}
function renderRecent() {
  const recent = strings(storage.get("oh:recent:v2", [])).slice(0, 3);
  $("#recent-searches").hidden = !recent.length;
  $("#recent-searches").innerHTML = recent.length
    ? `<span>RECENT</span>${recent.map((q) => `<button data-example="${html(q)}">${html(q)}</button>`).join("")}<button id="clear-recent">Clear</button>`
    : "";
}
function clearFilters(includeArea = true) {
  Object.assign(state, {
    query: "",
    category: "all",
    budget: "",
    duration: "",
    communityType: "groups",
    beginner: false,
    free: false,
    reuse: false,
    placeType: "",
    limit: 12,
  });
  if (includeArea) {
    stopNearby();
    state.borough = "";
    state.neighborhood = "";
    persistArea();
  }
  $("#search-query").value = "";
  $("#caption-container").hidden = !OH_UPLOAD_UI.count;
  $("#link-status").hidden = true;
}
function showView(view, scroll = true) {
  state.view = view;
  state.limit = 12;
  history.replaceState(null, "", viewHashes[view]);
  render();
  if (scroll)
    $("#discovery").scrollIntoView({ behavior: "smooth", block: "start" });
}
function runQuery(query) {
  const parsed = discovery.intent(query);
  state.query = query;
  state.limit = 12;
  // New searches replace old search-derived constraints; area persists unless explicitly changed.
  state.budget = parsed.budget;
  state.duration = parsed.duration;
  if (parsed.communityType) state.communityType = parsed.communityType;
  state.beginner = parsed.beginner;
  state.free = parsed.free;
  state.reuse = parsed.reuse;
  state.category = "all";
  state.placeType = "";
  if (parsed.borough) {
    stopNearby();
    state.borough = parsed.borough;
    state.neighborhood = parsed.neighborhood;
    persistArea();
  }
  state.view =
    parsed.view ||
    (/\bhobb(?:y|ies)|\bactivities?\b/.test(query.toLowerCase()) ||
    state.view === "saved"
      ? "projects"
      : state.view);
  $("#search-query").value = query;
  $("#caption-container").hidden = !OH_UPLOAD_UI.count;
  $("#link-status").hidden = true;
  $("#link-result").hidden = true;
  rememberSearch(query);
  showView(state.view);
}
function toggleSave(slug) {
  if (!data.projects.some((p) => p.slug === slug)) return;
  const saved = savedProjects(),
    next = saved.includes(slug)
      ? saved.filter((id) => id !== slug)
      : [...saved, slug];
  if (!storage.set("oh:saved", next)) return;
  const active = document.activeElement?.dataset.save;
  render();
  if (active)
    document
      .querySelector(`[data-save="${slug}"]`)
      ?.focus({ preventScroll: true });
  const detailSave = $("#detail-save");
  if (detailSave?.dataset.save === slug) {
    detailSave.textContent = next.includes(slug)
      ? "Saved to your field notes ✓"
      : "Save this guide +";
    detailSave.setAttribute("aria-pressed", String(next.includes(slug)));
  }
  notify(
    next.includes(slug)
      ? "Guide saved on this device."
      : "Guide removed from saved.",
  );
}
function sourceLinks(material) {
  const all = material.placeIds.map((id) => data.places[id]).filter(Boolean);
  const nearby = all.filter((p) => discovery.inArea(p, state));
  const chosen = nearby.length ? nearby : all;
  return chosen.length
    ? `<p class="material-source">${nearby.length || !state.borough ? "Ask locally: " : "Elsewhere in NYC: "}${chosen
        .slice(0, 3)
        .map((p) => external(p.url, p.name))
        .join(" · ")}<br />Possible sourcing routes, not a stock check.</p>`
    : '<p class="material-source">Check what you own or borrow first. No suitable local supplier is verified in this guide yet.</p>';
}
function detailPlace(p) {
  return `<article class="detail-place"><p class="small-label">${placeTypes[p.type]}</p><h4>${html(p.name)}</h4><p>${html(p.area)} · ${html(p.address)}</p><p>${html(p.summary)}</p><div>${external(p.url, "Visit website")} &nbsp; ${external(mapLink(p), "Open map")}</div><p class="access-note">${html(p.access)}</p></article>`;
}
function budgetCard(label, value) {
  return `<div class="budget-card"><h4>${html(label)}</h4><strong>${range(value?.min, value?.max)}</strong><p>${html(value?.note || "Check the provider’s current offering and fees.")}</p></div>`;
}
function openDialog() {
  dialogOrigin = document.activeElement;
  if (!$("#detail-dialog").open) $("#detail-dialog").showModal();
  $("#detail-dialog").scrollTop = 0;
  $("#close-detail").focus({ preventScroll: true });
}
function renderDetail(slug) {
  const p = data.projects.find((project) => project.slug === slug);
  if (!p) {
    notify(
      "That guide is not in this edition. Explore the index for a new starting point.",
    );
    return;
  }
  const checks = checkedFor(slug),
    related = discovery.relatedPlaces(p, state);
  const grouped = [
    { key: "consumable", title: "Materials & consumables" },
    { key: "essential", title: "Essentials & things on hand" },
    { key: "service", title: "Services" },
    { key: "tool", title: "Reusable tools & equipment" },
    { key: "optional", title: "Optional additions" },
  ];
  const classes = p.classIds
    .map((id) => data.classes[id])
    .filter(Boolean)
    .sort(
      (a, b) =>
        Number(discovery.inArea(b, state)) - Number(discovery.inArea(a, state)),
    );
  const communities = p.communityIds
    .map((id) => data.communities[id])
    .filter(Boolean)
    .sort(
      (a, b) =>
        Number(discovery.inArea(b, state)) - Number(discovery.inArea(a, state)),
    );
  const people = p.creatorIds
    .map((id) => data.creators[id])
    .filter(Boolean)
    .sort(
      (a, b) =>
        Number(discovery.inArea(b, state)) - Number(discovery.inArea(a, state)),
    );
  const recommendations = discovery
    .search("projects", data.hobbies[p.hobbyIds[0]].synonyms[0], state)
    .filter((r) => r.item.slug !== slug)
    .slice(0, 3);
  $("#detail-root").innerHTML =
    `<div class="detail-head"><a href="#explore" class="detail-brand">other hours.</a><span>YOUR PRACTICAL FIELD GUIDE</span><button id="close-detail" class="detail-close">Close ×</button></div><div class="detail-hero"><div class="detail-hero-image"><img src="./assets/illustrations/${artFor(p)}.svg" alt="An editorial illustration for ${html(p.title)}" width="400" height="380" /></div><div class="detail-intro"><p class="eyebrow">${html(data.hobbies[p.hobbyIds[0]].name)} / ${html(p.skill)}</p><h2 id="detail-title">${html(p.title)}.</h2><p>${html(p.intro)}</p><div class="detail-stats"><div><span>TIME</span><strong>${html(p.time)}</strong></div><div><span>${p.budgetStatus === "provider-quote-required" ? "WORKSHOP FEE" : "STARTER SUPPLIES · EST."}</span><strong>${p.budgetStatus === "provider-quote-required" ? "Check provider fee" : range(p.budgetMin, p.budgetMax)}</strong></div><div><span>SKILLS TO TRY</span><strong>${p.hobbyIds
      .slice(0, 2)
      .map((id) => html(data.hobbies[id].name))
      .join(
        " · ",
      )}</strong></div></div></div></div><nav class="detail-anchor-nav" aria-label="Project sections"><a href="#plan-start" data-detail-anchor="plan-start">Ways to start</a><a href="#plan-materials" data-detail-anchor="plan-materials">Your checklist</a><a href="#plan-supplies" data-detail-anchor="plan-supplies">Local places</a><a href="#plan-learn" data-detail-anchor="plan-learn">Learn &amp; connect</a></nav><div class="detail-content"><section class="detail-section" id="plan-start"><div class="detail-section-title"><h3>${p.type === "workshop" ? "Start in a supervised studio." : "Three ways into it."}</h3><span>PLANNING RANGES / USD</span></div><div class="budget-grid">${budgetCard(p.budgets.reuse.label, p.budgets.reuse)}${budgetCard(p.budgets.local.label, p.budgets.local)}${budgetCard("Learn in a workshop", p.budgets.workshop)}</div><p class="detail-budget-note"><strong>Reusable equipment, up front:</strong> ${p.budgets.equipment.min == null ? "Check the studio’s access and fee." : range(p.budgets.equipment.min, p.budgets.equipment.max) + " extra."} ${html(p.budgets.equipment.note)}<br />All ranges are editorial estimates, reviewed ${html(p.budgets.checkedAt)}; they are not supplier or class quotes. Materials estimates below describe possible pack costs and are not an itemized sum of each approach.</p></section><div class="detail-columns"><div><section class="detail-section" id="plan-materials"><div class="detail-section-title"><h3>What you’ll need.</h3><span id="material-count">${p.materials.filter((m) => checks.includes(m.legacyIndex)).length} / ${p.materials.length}</span></div><p class="small-note">Check things off as you find them. Your checklist stays on this device.</p>${grouped
      .map((group) => {
        const materials = p.materials.filter((m) => m.group === group.key);
        return materials.length
          ? `<h4 class="materials-group-title">${group.title}</h4>${materials.map((m) => `<div class="check-item ${checks.includes(m.legacyIndex) ? "done" : ""}"><input type="checkbox" id="material-${m.legacyIndex}" data-material="${m.legacyIndex}" data-project="${p.slug}" ${checks.includes(m.legacyIndex) ? "checked" : ""} /><div><div class="material-top"><label for="material-${m.legacyIndex}">${html(m.name)}</label><span>${m.estimate.min == null || (m.estimate.min === 0 && m.estimate.max === 0) ? "ACCESS / SEE FEE" : range(m.estimate.min, m.estimate.max) + " EST."}</span></div><p class="material-quantity">${html(m.quantity)}</p><p>${html(m.note)}</p><p class="material-sub">Alternative: ${html(m.substitute)}</p>${sourceLinks(m)}</div></div>`).join("")}`
          : "";
      })
      .join(
        "",
      )}<div class="copy-actions"><button class="button secondary" id="copy-supplies" data-project="${p.slug}">Copy supply list</button><button class="button secondary" id="share-project" data-project="${p.slug}">Copy guide link</button></div><div id="copy-fallback-root"></div></section><section class="detail-section" id="plan-learn"><div class="detail-section-title"><h3>Your first few steps.</h3></div><ol class="steps">${p.steps.map((step) => `<li>${html(step)}</li>`).join("")}</ol><div class="resource-links">${p.learning.map((r) => external(r.url, r.title)).join("")}</div></section><section class="detail-section"><div class="detail-section-title"><h3>Learn with someone.</h3></div>${
      classes
        .slice(0, 3)
        .map(
          (c) =>
            `<article class="detail-place"><p class="small-label">${discovery.inArea(c, state) ? "IN YOUR SELECTED AREA" : "ELSEWHERE IN NYC"} · PROGRAM REFERENCE</p><h4>${html(c.title)}</h4><p>${html(c.area)}. Confirm the fee, beginner level and whether supplies are included.</p>${external(c.url, "View workshops")}</article>`,
        )
        .join("") ||
      '<p class="small-note">No verified class program in this guide yet. Try the public learning and community resources.</p>'
    }</section></div><aside><div class="detail-tip"><p class="eyebrow">A LITTLE LESS NEW. A LITTLE MORE YOU.</p><p>${html(p.tip)}</p></div><section class="detail-section" id="plan-supplies"><div class="detail-section-title"><h3>Find it locally.</h3></div><p class="small-note">Selected area: ${html(areaName())}. Reuse and specialist shops are sourcing leads; studios offer learning or shared access.</p>${related.local.map(detailPlace).join("")}${related.elsewhere.length ? `<p class="elsewhere-label">${related.local.length ? "MORE ROUTES, ELSEWHERE IN NYC" : "NO MATCH IN THIS AREA YET. ELSEWHERE IN NYC:"}</p>${related.elsewhere.map(detailPlace).join("")}` : ""}</section><section class="detail-section"><div class="detail-section-title"><h3>People who get it.</h3></div>${communities
      .slice(0, 3)
      .map(
        (c) =>
          `<article class="detail-place"><p class="small-label">${discovery.inArea(c, state) ? "IN YOUR SELECTED AREA" : "ELSEWHERE IN NYC"} · PUBLIC GROUP / PROGRAM</p><h4>${html(c.name)}</h4><p>${html(c.summary)}</p><p>${html(c.join)}</p>${external(c.url, "How to connect")}</article>`,
      )
      .join("")}${people
      .slice(0, 2)
      .map(
        (c) =>
          `<article class="detail-place"><p class="small-label">PUBLIC CREATIVE PROFILE</p><h4>${html(c.name)}</h4><p>${html(c.specialty)} · ${html(c.area)}</p>${external(c.url, c.action)}</article>`,
      )
      .join(
        "",
      )}</section></aside></div>${recommendations.length ? `<section class="detail-section"><div class="detail-section-title"><h3>A related rabbit hole.</h3></div><div class="related-grid">${recommendations.map(({ item: p }) => `<a href="#project/${p.slug}">${html(p.title)}</a>`).join("")}</div></section>` : ""}</div><div class="detail-bottom"><p>EDITORIAL STARTER GUIDE · ${html(p.source.checkedAt)}<br />No live stock, seats or prices. Confirm details with the linked providers.</p><button class="button" id="detail-save" data-save="${p.slug}" aria-pressed="${savedProjects().includes(p.slug)}">${savedProjects().includes(p.slug) ? "Saved to your field notes ✓" : "Save this guide +"}</button></div>`;
  if ($("#detail-dialog").open) {
    $("#detail-dialog").scrollTop = 0;
    $("#close-detail").focus({ preventScroll: true });
  } else openDialog();
}
function closeDetail(updateHash = true) {
  OH_UPLOAD_UI.releaseDialog();
  if ($("#detail-dialog").open) $("#detail-dialog").close();
  if (updateHash && /^#(?:project|plan)\//.test(location.hash))
    history.replaceState(null, "", returnHash);
  if (dialogOrigin?.isConnected) dialogOrigin.focus({ preventScroll: true });
  else if (dialogOrigin)
    ($("#results-title").setAttribute("tabindex", "-1"),
      $("#results-title").focus({ preventScroll: true }));
  window.scrollTo({ top: dialogScroll, behavior: "instant" });
}
async function copyText(text, fallbackRoot = "#copy-fallback-root") {
  try {
    await navigator.clipboard.writeText(text);
    notify("Copied. A little plan to take with you.");
  } catch {
    const root = $(fallbackRoot);
    if (root) {
      root.innerHTML =
        '<label class="small-note" for="manual-copy">Copy this text:</label><textarea id="manual-copy" class="copy-fallback" readonly></textarea>';
      $("#manual-copy").value = text;
      $("#manual-copy").focus();
      $("#manual-copy").select();
    }
    notify("Select and copy the text below.");
  }
}
function supplyText(project) {
  return (
    `${project.title}\nOther Hours · editorial starter guide\n\n` +
    project.materials
      .map(
        (m) =>
          `[${checkedFor(project.slug).includes(m.legacyIndex) ? "x" : " "}] ${m.name} — ${m.quantity}\n${m.note}\nAlternative: ${m.substitute}`,
      )
      .join("\n\n") +
    `\n\n${project.budgetStatus === "provider-quote-required" ? "Workshop fee and included supplies: confirm with the provider." : "Starting materials: " + range(project.budgetMin, project.budgetMax) + " estimated. Reusable equipment extra."}\n${location.href.split("#")[0]}#project/${project.slug}`
  );
}
function renderInspiration(result, templateSlug = null) {
  currentInspiration = result;
  const slug =
    templateSlug === null ? result.matches[0]?.slug || "" : templateSlug;
  const project = data.projects.find((p) => p.slug === slug);
  selectedTemplate = slug;
  const kinds = {
    title: "Public title",
    description: "Description / caption",
    transcript: "Transcript text",
    manual: "Your description",
    document: "Uploaded text file",
    ocr: "Screenshot text · check recognition",
  };
  const evidenceTags = result.evidence
    .map(
      (e) =>
        `<span>${html(kinds[e.kind] || e.kind)} · ${["user-upload", "on-device-ocr"].includes(e.origin) ? "from " + html(e.fileName || "your file") : e.origin === "user-supplied" ? "supplied by you" : "retrieved"}</span>`,
    )
    .join("");
  $("#link-result").hidden = false;
  $("#link-result").innerHTML =
    `<div class="link-result-header"><div><p class="eyebrow">FROM YOUR INSPIRATION / ${result.provider === "uploads" ? "YOUR FILES" : html(result.provider.toUpperCase())}</p><h2 id="link-title">Your inspiration</h2></div><button id="dismiss-inspiration" class="detail-close">Close ×</button></div><p class="link-disclosure">${html(result.disclosure)} ${result.provider === "uploads" ? "" : result.transcriptStatus === "not-retrieved" ? "No transcript was retrieved; we have not watched or transcribed the video." : "Transcript text was supplied by you or an authorized service; exact results still need review."}</p><div class="evidence-tags">${evidenceTags || "<span>No accessible content yet</span>"}<span>${result.confidence === "title-only" ? "Title match only · check the fit" : result.matches.length ? "Suggested guide · confirm the fit" : "Project unresolved"}</span></div>${result.attachments?.length ? '<div class="reference-block"><h3>Your reference files.</h3><div id="inspiration-file-gallery" class="reference-file-grid"></div></div>' : ""}<details class="evidence-detail"><summary>See the source text and access notes</summary>${result.evidence.map((e) => `<p><strong>${html(kinds[e.kind])} · ${html(e.origin)}</strong><br />${html(e.text)}</p>`).join("")}${result.warnings.map((w) => `<p>${html(w)}</p>`).join("")}${external(result.sourceUrl, "Open original inspiration")}</details><div class="inspiration-matches">${result.matches.length ? `<h3>Activities you could try</h3><div class="matched-guides">${result.matches.map((m) => `<a href="#project/${html(m.slug)}">${html(m.title)}</a>`).join("")}</div>${project ? `<div class="inspiration-actions"><button class="button secondary" data-inspiration-view="community" data-interest="${html(data.hobbies[project.hobbyIds[0]].name)}">Find communities</button><button class="button secondary" data-inspiration-view="materials" data-interest="${html(data.hobbies[project.hobbyIds[0]].name)}">Find supplies</button></div>` : ""}` : `<p>We need readable text to find a useful match. Add the post’s caption, read a screenshot’s text, or describe what you want to try.</p><div class="inspiration-actions"><button type="button" class="button secondary" data-inspiration-input="caption">Add a caption / description</button><button type="button" class="button secondary" data-inspiration-input="photo">Add a screenshot</button></div>`}</div><details class="plan-details"><summary>Make and save a plan from this inspiration</summary><div class="inspiration-layout"><div class="inspiration-editor"><label for="plan-template">Choose a starter guide — check that it fits</label><select id="plan-template"><option value="">Start with your own notes</option>${data.projects.map((p) => `<option value="${p.slug}" ${p.slug === slug ? "selected" : ""}>${result.matches.some((m) => m.slug === p.slug) ? "Suggested: " : ""}${html(p.title)}</option>`).join("")}</select>${!result.matches.length ? '<p class="inspiration-empty">We couldn’t identify a hobby from the available text. Add a description above and search again, or choose a guide yourself.</p>' : ""}<label for="plan-title">Your plan’s title</label><input id="plan-title" maxlength="200" value="${html(project?.title || "My inspiration plan")}" /><label for="plan-materials">Starter supply suggestions — edit to fit your project</label><textarea id="plan-materials" maxlength="12000">${html(project ? project.materials.map((m) => m.name + " — " + m.quantity).join("\n") : result.requirements.map((m) => [m.quantity, m.name].filter(Boolean).join(" ")).join("\n"))}</textarea><label for="plan-steps">Suggested first steps — check the original instructions</label><textarea id="plan-steps" maxlength="12000">${html(project ? project.steps.join("\n") : result.steps.map((s) => s.text).join("\n"))}</textarea><div class="inspiration-actions"><button id="save-plan" class="button">Save my edited plan +</button>${project ? `<a href="#project/${project.slug}" class="button secondary">Open full guide</a>` : ""}</div><p id="attachment-change-note" class="small-note attachment-change-note" hidden>Your reference files or recognized text changed. Choose Find activities again before saving this plan.</p><p class="small-note">Your edits, reference files and source notes save on this device. Suggested supplies remain suggestions.</p></div><aside class="inspiration-aside"><h3>What the text actually says.</h3>${result.requirements.length ? `<ul class="extraction-list">${result.requirements.map((m) => `<li><strong>${html([m.quantity, m.name].filter(Boolean).join(" "))}</strong> · ${html(kinds[m.sourceKind] || "source text")}<br /><span class="small-note">“${html(m.evidence)}”</span></li>`).join("")}</ul>` : "<p>No exact supply requirements could be extracted. The editable supply list comes from a curated guide, if selected.</p>"}${result.steps.length ? `<p class="eyebrow">STEPS PRESENT IN THE TEXT</p><ol class="extraction-list">${result.steps.map((s) => `<li>${html(s.text)}</li>`).join("")}</ol>` : ""}${result.suggestions?.requirements?.length ? '<p class="eyebrow">INFERRED ADDITIONS · REVIEW BEFORE USING</p><ul class="extraction-list">' + result.suggestions.requirements.map((m) => "<li>" + html([m.quantity, m.name].filter(Boolean).join(" ")) + " — suggested, not extracted</li>").join("") + "</ul>" : ""}<h3>Put it on your map.</h3><p>Selected area: ${html(areaName())}. These are related resources, not confirmed stock or classes for this exact project.</p>${
      project
        ? [
            ...discovery.relatedPlaces(project, state).local,
            ...discovery.relatedPlaces(project, state).elsewhere,
          ]
            .slice(0, 3)
            .map(detailPlace)
            .join("") +
          project.communityIds
            .slice(0, 2)
            .map(
              (id) =>
                `<article class="detail-place"><h4>${html(data.communities[id].name)}</h4>${external(data.communities[id].url, "Connect with the community")}</article>`,
            )
            .join("")
        : "<p>Choose a guide to connect your idea to local materials, learning and people.</p>"
    }</aside></div></details>`;
  OH_UPLOAD_UI.decorate(result);
}
async function submitLink(raw) {
  if (linkBusy) return;
  if (!OH_INGESTION.identify(raw)) {
    $("#link-status").hidden = false;
    $("#link-status").textContent =
      "Use an HTTPS YouTube, TikTok, Instagram or Pinterest content link. Other URLs cannot be analyzed here.";
    return;
  }
  linkBusy = true;
  $("#caption-container").hidden = false;
  $("#link-status").hidden = false;
  $("#link-status").textContent =
    "Checking permitted public metadata and any text you supplied…";
  const button = $("#search-form button[type=submit]");
  button.disabled = true;
  try {
    const endpoint = window.OH_CONFIG?.ingestionEndpoint;
    const safeEndpoint =
      endpoint &&
      (/^https:\/\//.test(endpoint) ||
        /^http:\/\/(?:localhost|127\.0\.0\.1):\d+\/api\/ingest$/.test(endpoint))
        ? endpoint
        : "";
    const linked = await OH_INGESTION.ingest(
      {
        url: raw,
        text: $("#caption-input").value,
        textKind: $("#text-kind").value,
      },
      { data, discovery, endpoint: safeEndpoint },
    );
    const result = OH_UPLOAD_UI.augment(linked) || linked;
    renderInspiration(result);
    $("#link-status").textContent = result.matches.length
      ? "A related starter guide is ready. Review the source and confirm it fits."
      : result.evidence.length
        ? "No close activity match yet. Try a clearer description or choose a guide."
        : "This post’s content isn’t readable here. Paste its caption or add a screenshot, then read its text.";
    $("#link-result").scrollIntoView({ behavior: "smooth", block: "start" });
  } catch (error) {
    $("#link-status").textContent = error.message;
  } finally {
    linkBusy = false;
    button.disabled = false;
  }
}
function editorPlan(id) {
  const plan = savedPlans().find((p) => p.id === id);
  if (!plan) return;
  const safeSource =
    plan.source?.sourceUrl && OH_INGESTION.identify(plan.source.sourceUrl)
      ? plan.source.sourceUrl
      : "";
  $("#detail-root").innerHTML =
    `<div class="detail-head"><a class="detail-brand" href="#saved">other hours.</a><button id="close-detail" class="detail-close">Close ×</button></div><div class="plan-editor"><p class="eyebrow">YOUR INSPIRATION PLAN · SAVED ON THIS DEVICE</p><h2 id="detail-title">Make it your own.</h2><div class="inspiration-editor"><label for="saved-plan-title">Title</label><input id="saved-plan-title" value="${html(plan.title)}" maxlength="200" />${plan.source?.attachments?.length ? '<div class="reference-block"><h3>Saved reference files.</h3><div id="saved-reference-files" class="reference-file-grid"></div></div>' : ""}<label for="saved-plan-materials">Your supply list</label><textarea id="saved-plan-materials" maxlength="12000">${html(plan.materials)}</textarea><label for="saved-plan-steps">Your steps</label><textarea id="saved-plan-steps" maxlength="12000">${html(plan.steps)}</textarea><div class="inspiration-actions"><button class="button" id="update-plan" data-plan="${html(id)}">Save changes ✓</button><button class="button secondary" id="copy-plan" data-plan="${html(id)}">Copy plan</button>${plan.projectSlug ? `<a class="button secondary" href="#project/${html(plan.projectSlug)}">Open related local guide</a>` : ""}</div><p class="small-note">User-edited notes and editorial suggestions. ${plan.source?.provider === "uploads" ? "References stay on this device; matches use your notes, readable text files or recognized screenshot text." : plan.source?.transcriptStatus === "not-retrieved" ? "No transcript was retrieved." : "Review any source text and your own edits."}</p>${safeSource ? external(safeSource, "Original inspiration") : ""}<details class="evidence-detail"><summary>Preserved source notes</summary>${
      (Array.isArray(plan.source?.evidence) ? plan.source.evidence : [])
        .slice(0, 12)
        .map(
          (e) =>
            `<p><strong>${html(e.kind)} · ${html(e.origin)}</strong><br />${html(e.text)}</p>`,
        )
        .join("") || "<p>No source text was saved.</p>"
    }</details><div id="copy-fallback-root"></div></div></div>`;
  openDialog();
  OH_UPLOAD_UI.references(
    $("#saved-reference-files"),
    plan.source?.attachments,
  );
  OH_UPLOAD_UI.cleanDetached();
}
function navigate() {
  const hash = location.hash;
  if (/^#project\//.test(hash) || /^#plan\//.test(hash)) {
    if (!$("#detail-dialog").open) {
      dialogScroll = window.scrollY;
      returnHash = viewHashes[state.view] || "#explore";
    }
    const id = hash.split("/")[1];
    if (hash.startsWith("#project/")) renderDetail(id);
    else editorPlan(id);
    return;
  }
  if ($("#detail-dialog").open) closeDetail(false);
  const view = Object.keys(viewHashes).find((v) => viewHashes[v] === hash);
  if (view) {
    if (view === "saved") clearFilters(false);
    state.view = view;
    state.limit = 12;
    render();
    $("#discovery").scrollIntoView({ block: "start" });
  } else if (hash === "#home") {
    clearFilters(false);
    state.view = "projects";
    render();
    window.scrollTo({ top: 0, behavior: "smooth" });
  }
}
$("#borough-select").innerHTML += Object.entries(data.cities.nyc.boroughs)
  .map(([id, b]) => `<option value="${id}">${b.name}</option>`)
  .join("");
$("#category-select").innerHTML += data.categories
  .map((c) => `<option value="${c.id}">${html(c.name)}</option>`)
  .join("");
$("#collection-grid").innerHTML = data.categories
  .map(
    (c) =>
      `<button class="collection" data-category="${c.id}" aria-pressed="false"><span class="collection-name">${html(c.short)}</span><span class="collection-description">${html(c.name)}</span></button>`,
  )
  .join("");
$("#search-form").addEventListener("submit", (event) => {
  event.preventDefault();
  const query = $("#search-query").value.trim();
  if (/^(?:https?:\/\/|www\.)/i.test(query)) submitLink(query);
  else runQuery(query);
});
$("#search-query").addEventListener("input", () => {
  $("#caption-container").hidden = !/^https?:\/\//i.test(
    $("#search-query").value.trim(),
  );
  $("#link-status").hidden = true;
});
$("#borough-select").addEventListener("change", (event) => {
  stopNearby();
  state.borough = event.target.value;
  state.neighborhood = "";
  state.limit = 12;
  persistArea();
  render();
});
$("#neighborhood-select").addEventListener("change", (event) => {
  stopNearby();
  state.neighborhood = event.target.value;
  if (state.neighborhood)
    state.borough = Object.keys(data.cities.nyc.boroughs).find((id) =>
      data.cities.nyc.boroughs[id].neighborhoods.includes(state.neighborhood),
    );
  state.limit = 12;
  persistArea();
  render();
});
for (const [id, key] of [
  ["category-select", "category"],
  ["budget-select", "budget"],
  ["duration-select", "duration"],
  ["community-type", "communityType"],
  ["radius-select", "radiusKm"],
  ["unlocated-filter", "includeUnlocated"],
  ["place-type", "placeType"],
  ["beginner-filter", "beginner"],
  ["free-filter", "free"],
  ["reuse-filter", "reuse"],
])
  $("#" + id).addEventListener("change", (event) => {
    state[key] =
      event.target.type === "checkbox"
        ? event.target.checked
        : event.target.value;
    state.limit = 12;
    render();
  });
$("#use-location").addEventListener("click", () => nearby.locate());
$("#clear-location").addEventListener("click", () => {
  stopNearby();
  const manual = storage.get("oh:preferences:v2", {});
  state.borough =
    manual && data.cities.nyc.boroughs[manual.borough] ? manual.borough : "";
  state.neighborhood =
    state.borough &&
    data.cities.nyc.boroughs[state.borough].neighborhoods.includes(
      manual.neighborhood,
    )
      ? manual.neighborhood
      : "";
  render();
});
$("#reset-search").addEventListener("click", () => {
  clearFilters();
  render();
});
$("#reset-empty").addEventListener("click", () => {
  clearFilters();
  showView("projects");
});
$("#clear-area").addEventListener("click", () => {
  stopNearby();
  state.borough = "";
  state.neighborhood = "";
  persistArea();
  render();
});
$("#load-more").addEventListener("click", () => {
  const previous = state.limit;
  state.limit += 12;
  render();
  const firstNew = document.querySelectorAll(
    "#project-grid .project-card h3 a, #places-grid .card-actions a, #community-grid .card-actions a, #creator-grid .creator-top + p + p + .profile-projects + a",
  )[previous];
  firstNew?.focus({ preventScroll: true });
});
$("#browse-reuse").addEventListener("click", () => {
  clearFilters(false);
  state.reuse = true;
  showView("materials");
});
$("#detail-dialog").addEventListener("cancel", (event) => {
  event.preventDefault();
  closeDetail();
});
$("#detail-dialog").addEventListener("click", (event) => {
  if (event.target === $("#detail-dialog")) {
    const rect = event.target.getBoundingClientRect();
    if (
      event.clientX < rect.left ||
      event.clientX > rect.right ||
      event.clientY < rect.top ||
      event.clientY > rect.bottom
    )
      closeDetail();
  }
});
$("#detail-dialog").addEventListener("change", (event) => {
  if (!event.target.matches("[data-material]")) return;
  const slug = event.target.dataset.project,
    index = Number(event.target.dataset.material),
    checked = checkedFor(slug);
  const next = event.target.checked
    ? [...new Set([...checked, index])]
    : checked.filter((n) => n !== index);
  if (!storage.set("oh:checked:" + slug, next)) return;
  event.target
    .closest(".check-item")
    .classList.toggle("done", event.target.checked);
  const project = data.projects.find((p) => p.slug === slug);
  $("#material-count").textContent =
    `${project.materials.filter((m) => next.includes(m.legacyIndex)).length} / ${project.materials.length}`;
});
document.addEventListener("click", async (event) => {
  const target = event.target.closest("button,a");
  if (!target) return;
  if (target.dataset.save) {
    event.preventDefault();
    toggleSave(target.dataset.save);
  } else if (target.dataset.view) {
    event.preventDefault();
    showView(target.dataset.view);
  } else if (target.dataset.inspirationInput) {
    $("#caption-container").hidden = false;
    $("#search-form").scrollIntoView({ behavior: "smooth", block: "start" });
    if (target.dataset.inspirationInput === "photo") $("#photo-upload").click();
    else $("#caption-input").focus({ preventScroll: true });
  } else if (target.dataset.inspirationView) {
    state.query = target.dataset.interest;
    $("#search-query").value = state.query;
    state.category = "all";
    state.communityType = "groups";
    showView(target.dataset.inspirationView);
  } else if (target.dataset.resultView) showView(target.dataset.resultView);
  else if (target.dataset.placeDisplay) {
    state.placeDisplay = target.dataset.placeDisplay;
    render();
  } else if (target.dataset.example != null) {
    event.preventDefault();
    runQuery(target.dataset.example);
  } else if (target.dataset.category) {
    state.category = target.dataset.category;
    state.query = "";
    $("#search-query").value = "";
    showView("projects");
  } else if (target.dataset.area) {
    clearFilters();
    const parsed = discovery.intent(target.dataset.area);
    state.borough = parsed.borough;
    state.neighborhood = parsed.neighborhood;
    persistArea();
    showView("materials");
  } else if (target.id === "remove-query") {
    state.query = "";
    $("#search-query").value = "";
    render();
  } else if (target.id === "clear-recent") {
    storage.set("oh:recent:v2", []);
    renderRecent();
  } else if (target.id === "close-detail") closeDetail();
  else if (target.dataset.detailAnchor) {
    event.preventDefault();
    $("#" + target.dataset.detailAnchor).scrollIntoView({
      behavior: "smooth",
      block: "start",
    });
  } else if (target.id === "copy-supplies")
    copyText(
      supplyText(data.projects.find((p) => p.slug === target.dataset.project)),
    );
  else if (target.id === "share-project")
    copyText(
      location.href.split("#")[0] + "#project/" + target.dataset.project,
    );
  else if (target.id === "dismiss-inspiration") $("#link-result").hidden = true;
  else if (target.id === "save-plan") {
    if (!$("#plan-title").value.trim()) {
      $("#plan-title").focus();
      notify("Give your plan a title first.");
      return;
    }
    const plan = {
      id: crypto.randomUUID(),
      title: $("#plan-title").value.trim(),
      materials: $("#plan-materials").value,
      steps: $("#plan-steps").value,
      projectSlug: selectedTemplate,
      source: currentInspiration,
      updatedAt: new Date().toISOString(),
    };
    target.disabled = true;
    let newFiles = [];
    try {
      newFiles = await OH_UPLOAD_UI.saveReferences(plan.source);
      if (storage.set("oh:plans:v1", [plan, ...savedPlans()])) {
        render();
        notify(
          plan.source?.attachments?.length
            ? "Your plan and reference files are saved on this device."
            : "Your edited plan and source notes are saved.",
        );
      } else if (newFiles.length) await OH_UPLOADS.deleteFiles(newFiles);
    } catch (error) {
      notify(error.message);
    } finally {
      target.disabled = false;
      OH_UPLOAD_UI.updateResultState();
    }
  } else if (target.dataset.planOpen)
    location.hash = "#plan/" + target.dataset.planOpen;
  else if (target.dataset.planDelete) {
    const removed = savedPlans().find(
      (p) => p.id === target.dataset.planDelete,
    );
    const remaining = savedPlans().filter(
      (p) => p.id !== target.dataset.planDelete,
    );
    if (storage.set("oh:plans:v1", remaining)) {
      await OH_UPLOAD_UI.removeUnreferenced(
        removed?.source?.attachments,
        remaining,
      );
      render();
      notify("Plan removed from this device.");
    }
  } else if (target.id === "update-plan") {
    if (!$("#saved-plan-title").value.trim()) {
      $("#saved-plan-title").focus();
      return;
    }
    const plans = savedPlans().map((p) =>
      p.id === target.dataset.plan
        ? {
            ...p,
            title: $("#saved-plan-title").value.trim(),
            materials: $("#saved-plan-materials").value,
            steps: $("#saved-plan-steps").value,
            updatedAt: new Date().toISOString(),
          }
        : p,
    );
    if (storage.set("oh:plans:v1", plans)) {
      render();
      notify("Your plan is updated.");
    }
  } else if (target.id === "copy-plan")
    copyText(
      $("#saved-plan-title").value +
        "\n\n" +
        $("#saved-plan-materials").value +
        "\n\n" +
        $("#saved-plan-steps").value,
    );
  else if (target.dataset.saveInterest) {
    const id = target.dataset.saveInterest,
      ids = savedInterests();
    storage.set(
      "oh:interests:v2",
      ids.includes(id) ? ids.filter((i) => i !== id) : [...ids, id],
    );
    render();
  } else if (target.dataset.interestOpen)
    runQuery(data.hobbies[target.dataset.interestOpen].synonyms[0]);
  else if (target.dataset.interestRemove) {
    storage.set(
      "oh:interests:v2",
      savedInterests().filter((id) => id !== target.dataset.interestRemove),
    );
    render();
  }
});
$("#link-result").addEventListener("change", (event) => {
  if (event.target.id === "plan-template") {
    renderInspiration(currentInspiration, event.target.value);
    $(".plan-details").open = true;
    $("#plan-template").focus({ preventScroll: true });
  }
});
$("#map-panel").addEventListener("change", (event) => {
  if (event.target.id === "map-reference") {
    state.mapReference = event.target.value;
    renderMap(discovery.search("materials", state.query, state));
  }
});
window.addEventListener("hashchange", navigate);
window.addEventListener("storage", () => {
  render();
  renderRecent();
});
OH_UPLOAD_UI.init();
render();
renderRecent();
navigate();
