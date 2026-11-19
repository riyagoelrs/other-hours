"use strict";

// A small, native-scroll scene. No scroll hijacking, tracking or animation loop.
(() => {
  const hero = document.querySelector(".scene-hero");
  const picker = document.getElementById("pick-hobby");
  if (!hero || !picker) return;

  let previousSlug = "";
  picker.addEventListener("click", () => {
    const projects = typeof OH_DATA === "undefined" ? [] : OH_DATA.projects;
    const choices = projects.filter((project) => project.slug !== previousSlug);
    if (!choices.length) return;
    const project = choices[Math.floor(Math.random() * choices.length)];
    previousSlug = project.slug;
    window.location.hash = "#project/" + project.slug;
  });

  const reduced = window.matchMedia("(prefers-reduced-motion: reduce)");
  const fine = window.matchMedia("(pointer: fine)");
  let frame = 0;
  let pointer = null;

  function reset() {
    hero.style.setProperty("--scene-progress", "0");
    hero.style.setProperty("--scene-x", "0px");
    hero.style.setProperty("--scene-y", "0px");
  }
  function paint() {
    frame = 0;
    if (reduced.matches) return;
    const bounds = hero.getBoundingClientRect();
    if (bounds.bottom < 0 || bounds.top > window.innerHeight) return;
    const progress = Math.min(1, Math.max(0, -bounds.top / bounds.height));
    const x = pointer ? (pointer.x - bounds.left) / bounds.width - 0.5 : 0;
    const y = pointer ? (pointer.y - bounds.top) / bounds.height - 0.5 : 0;
    hero.style.setProperty("--scene-progress", progress.toFixed(3));
    hero.style.setProperty("--scene-x", (x * 12).toFixed(1) + "px");
    hero.style.setProperty("--scene-y", (y * 8).toFixed(1) + "px");
  }
  function requestPaint() {
    if (!reduced.matches && !frame) frame = window.requestAnimationFrame(paint);
  }
  hero.addEventListener("pointermove", (event) => {
    if (!fine.matches || reduced.matches) return;
    pointer = { x: event.clientX, y: event.clientY };
    requestPaint();
  });
  hero.addEventListener("pointerleave", () => {
    pointer = null;
    requestPaint();
  });
  window.addEventListener("scroll", requestPaint, { passive: true });
  window.addEventListener("resize", requestPaint, { passive: true });
  reduced.addEventListener("change", () => {
    if (frame) window.cancelAnimationFrame(frame);
    frame = 0;
    pointer = null;
    reset();
  });
  window.addEventListener("pagehide", () => {
    if (frame) window.cancelAnimationFrame(frame);
    frame = 0;
  });
})();
