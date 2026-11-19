"use strict";
// The small surprise button opens a real guide and avoids repeating it immediately.
(() => {
  const picker = document.getElementById("pick-hobby");
  if (!picker) return;
  let previousSlug = "";
  picker.addEventListener("click", () => {
    const choices = OH_DATA.projects.filter((p) => p.slug !== previousSlug);
    if (!choices.length) return;
    const project = choices[Math.floor(Math.random() * choices.length)];
    previousSlug = project.slug;
    window.location.hash = "#project/" + project.slug;
  });
})();
