/* Shared, deterministic discovery. Runs in the browser and in Node tests. */
"use strict";
const OH_DISCOVERY = (() => {
  const normalize = (value) =>
    String(value || "")
      .normalize("NFKD")
      .replace(/[\u0300-\u036f]/g, "")
      .toLowerCase();
  function distanceKm(a, b) {
    const radians = (degrees) => (degrees * Math.PI) / 180;
    const deltaLat = radians(b.lat - a.lat),
      deltaLng = radians(b.lng - a.lng);
    const halfChord =
      Math.sin(deltaLat / 2) ** 2 +
      Math.cos(radians(a.lat)) *
        Math.cos(radians(b.lat)) *
        Math.sin(deltaLng / 2) ** 2;
    return (
      6371 * 2 * Math.atan2(Math.sqrt(halfChord), Math.sqrt(1 - halfChord))
    );
  }
  const contains = (text, term) =>
    new RegExp(
      "(?:^|[^a-z])" +
        term.replace(/[.*+?^${}()|[\]\\]/g, "\\$&") +
        "(?:s|ing|ed)?(?:$|[^a-z])",
      "i",
    ).test(text);
  function create(data, cityId = "nyc") {
    const boroughs = data.cities[cityId].boroughs;
    function intent(query) {
      const text = normalize(query);
      const result = {
        query,
        hobbyIds: [],
        borough: "",
        neighborhood: "",
        budget: "",
        beginner: false,
        free: false,
        reuse: false,
        view: "",
      };
      for (const [id, borough] of Object.entries(boroughs)) {
        if (
          contains(text, normalize(borough.name)) ||
          (id === "bronx" && contains(text, "bronx"))
        )
          result.borough = id;
        for (const neighborhood of borough.neighborhoods)
          if (contains(text, normalize(neighborhood))) {
            result.borough = id;
            result.neighborhood = neighborhood;
          }
      }
      result.hobbyIds = Object.values(data.hobbies)
        .filter(
          (hobby) =>
            hobby.synonyms.some((word) => contains(text, word)) ||
            contains(text, normalize(hobby.name)),
        )
        .map((h) => h.id);
      const budget =
        text.match(
          /(?:under|below|less than|up to|budget(?: of)?|for)\s*\$?\s*(\d{1,4})(?:\b|$)/,
        ) || text.match(/\$(\d{1,4})\b/);
      if (budget) result.budget = Number(budget[1]);
      result.beginner = /\bbeginner|\bfirst|\bnew to|\blearn|\beasy\b/.test(
        text,
      );
      result.free = /\bfree\b|\bno cost\b/.test(text);
      result.reuse =
        /\bsecondhand\b|\bsecond hand\b|\breuse\b|\bborrow\b|\bscrap\b/.test(
          text,
        );
      if (
        /\bclass|\bworkshop|\bcommunity|\bcommunities|\bpeople|\bgroup|\bclub/.test(
          text,
        )
      )
        result.view = "community";
      if (/\bcreator|\binstructor|\btutorial/.test(text))
        result.view = "people";
      if (/\bmaterials|\bsupplies|\bfabric store|\breuse store/.test(text))
        result.view = "materials";
      return result;
    }
    function inArea(item, filters) {
      const location = item.location;
      if (!filters.borough && !filters.neighborhood) return true;
      if (!location || location.cityId !== (filters.cityId || cityId))
        return false;
      if (filters.borough && !location.boroughs.includes(filters.borough))
        return false;
      if (
        filters.neighborhood &&
        !location.citywide &&
        !location.neighborhoods.includes(filters.neighborhood)
      )
        return false;
      return true;
    }
    function relevantScore(item, parsed) {
      if (!parsed.query.trim()) return 1;
      const text = normalize(
        [
          item.title,
          item.name,
          item.specialty,
          item.intro,
          ...(item.tags || []),
        ].join(" "),
      );
      if (parsed.hobbyIds.length) {
        const matchedHobbies = (item.hobbyIds || []).filter((id) =>
          parsed.hobbyIds.includes(id),
        ).length;
        if (!matchedHobbies) return 0;
        // Specific project words outrank a broad interest: leather journal > any book art.
        const title = normalize(item.title || item.name);
        const tags = normalize((item.tags || []).join(" "));
        const common = new Set(
          "make want learn how your own with from this that their have they them then paper supplies materials beginner easy project tutorial video use fold steps class classes near people".split(
            " ",
          ),
        );
        const words = [
          ...new Set(
            normalize(parsed.query)
              .split(/[^a-z]+/)
              .filter((w) => w.length > 3 && !common.has(w)),
          ),
        ];
        const specific = words.reduce(
          (score, word) =>
            score +
            (contains(title, word) ? 12 : 0) +
            (contains(tags, word) ? 8 : 0),
          0,
        );
        return matchedHobbies * 10 + specific;
      }
      // Ignore the words that describe constraints, rather than interests.
      let residual = normalize(parsed.query).replace(/\$?\d+/g, " ");
      for (const b of Object.values(boroughs))
        for (const word of [b.name, ...b.neighborhoods])
          residual = residual.replaceAll(normalize(word), " ");
      const stop = new Set(
        "i a an the want to try learn how make new hobby hobbies creative affordable budget under below less than up at for of in near around live looking find me my is with and or all nyc york city beginner beginners friendly easy free secondhand second hand reuse borrow local projects materials supplies classes workshops people groups communities something activity activities".split(
          " ",
        ),
      );
      const words = residual
        .split(/[^a-z]+/)
        .filter((word) => word.length > 2 && !stop.has(word));
      return words.length
        ? words.reduce(
            (score, word) => score + (contains(text, word) ? 5 : 0),
            0,
          )
        : 1;
    }
    function search(view, query, filters = {}, saved = []) {
      const parsed = intent(query);
      const kind = view === "saved" ? "projects" : view;
      let items =
        kind === "projects"
          ? data.projects
          : kind === "materials"
            ? Object.values(data.places)
            : kind === "people"
              ? Object.values(data.creators)
              : [
                  ...Object.values(data.classes),
                  ...Object.values(data.communities),
                ];
      if (view === "saved") items = items.filter((p) => saved.includes(p.slug));
      return items
        .map((item) => {
          const relevance = relevantScore(item, parsed);
          const localCount =
            kind === "projects"
              ? item.placeIds.filter((id) => inArea(data.places[id], filters))
                  .length
              : 0;
          const directArea = kind === "projects" ? true : inArea(item, filters);
          return {
            item,
            relevance,
            localCount,
            directArea,
            score:
              relevance * 10 +
              Math.min(localCount, 3) * 8 +
              (item.type === "reuse" ? 4 : 0),
          };
        })
        .filter(({ item, relevance, directArea }) => {
          if (relevance <= 0 || !directArea) return false;
          if (
            filters.category &&
            filters.category !== "all" &&
            !(item.hobbyIds || []).some(
              (id) => data.hobbies[id]?.category === filters.category,
            )
          )
            return false;
          if (
            filters.beginner &&
            item.beginnerFriendly !== true &&
            kind !== "materials" &&
            kind !== "people"
          )
            return false;
          if (
            filters.free &&
            (kind === "projects"
              ? !item.free
              : kind === "community"
                ? !item.free
                : false)
          )
            return false;
          if (
            filters.reuse &&
            (kind === "projects"
              ? !item.reuseAvailable
              : kind === "materials"
                ? !["reuse", "shared-equipment", "community-exchange"].includes(
                    item.type,
                  )
                : false)
          )
            return false;
          if (
            filters.budget !== "" &&
            filters.budget != null &&
            kind === "projects" &&
            (item.budgetStatus === "provider-quote-required" ||
              item.budgetMin > Number(filters.budget))
          )
            return false;
          if (
            filters.placeType &&
            kind === "materials" &&
            item.type !== filters.placeType
          )
            return false;
          return true;
        })
        .sort((a, b) => {
          if (
            kind === "projects" &&
            !query.trim() &&
            !filters.borough &&
            !filters.neighborhood &&
            (!filters.category || filters.category === "all") &&
            !filters.budget &&
            !filters.free
          ) {
            const featured = [
              "leather-journal",
              "visible-mending",
              "crochet-granny-square-bag",
              "queens-bird-walk",
              "ceramic-trinket-dish",
              "film-photo-walk",
              "beginner-dance",
              "windowsill-herbs",
            ];
            const rank = (item) =>
              featured.includes(item.slug)
                ? featured.indexOf(item.slug)
                : 100 + data.projects.indexOf(item);
            return rank(a.item) - rank(b.item);
          }
          return (
            b.score - a.score ||
            (a.item.budgetMin ?? 0) - (b.item.budgetMin ?? 0)
          );
        });
    }
    function relatedPlaces(project, filters = {}) {
      const items = project.placeIds
        .map((id) => data.places[id])
        .filter(Boolean);
      return {
        local: items.filter((p) => inArea(p, filters)),
        elsewhere: items.filter((p) => !inArea(p, filters)),
      };
    }
    return { intent, search, inArea, relatedPlaces, relevantScore };
  }
  return { create, normalize, contains, distanceKm };
})();
if (typeof module !== "undefined" && module.exports)
  module.exports = OH_DISCOVERY;
