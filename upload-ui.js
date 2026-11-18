/* Browser controller for the same idea/link field and native photo/file pickers. */
"use strict";
const OH_UPLOAD_UI = (() => {
  let items = [],
    pending = Promise.resolve(),
    busy = 0;
  const galleries = new Map();
  const asFiles = (value) =>
    Array.isArray(value)
      ? value.filter(OH_UPLOADS.validDescriptor).slice(0, OH_UPLOADS.MAX_FILES)
      : [];
  const find = (selector) => document.querySelector(selector);
  const isLink = (value) => /^(?:https?:\/\/|www\.)/i.test(value);
  const fileKind = (kind) =>
    ({ image: "Photo", video: "Video", document: "PDF", text: "Text file" })[
      kind
    ] || "File";
  function status(message, error = false) {
    const node = find("#upload-status");
    node.hidden = !message;
    node.textContent = message;
    node.classList.toggle("has-error", error);
  }
  function release(root) {
    for (const url of galleries.get(root) || []) URL.revokeObjectURL(url);
    galleries.delete(root);
  }
  function cleanDetached() {
    for (const root of galleries.keys()) if (!root.isConnected) release(root);
  }
  function releaseDialog() {
    for (const root of galleries.keys())
      if (root.closest("#detail-dialog")) release(root);
  }
  function cards(root, descriptors, editable = false) {
    release(root);
    cleanDetached();
    const urls = [];
    galleries.set(root, urls);
    root.innerHTML = descriptors
      .map(
        (file) =>
          `<article class="reference-file" data-reference="${html(file.id)}"><div class="reference-file-picture"><span class="reference-file-placeholder">${html(fileKind(file.kind))}</span></div><div class="reference-file-info"><strong>${html(file.name)}</strong><small>${html(fileKind(file.kind))} · ${OH_UPLOADS.sizeLabel(file.size)}</small><span class="reference-file-open"></span></div>${editable ? `<button type="button" class="reference-file-remove" data-upload-remove="${html(file.id)}" aria-label="Remove ${html(file.name)}">×</button>` : ""}</article>`,
      )
      .join("");
    return { urls, cards: [...root.querySelectorAll("[data-reference]")] };
  }
  function setFilePreview(card, row, urls) {
    const blob = row?.file || row?.blob;
    if (!(blob instanceof Blob)) {
      card.querySelector(".reference-file-open").textContent =
        "File unavailable on this device";
      return;
    }
    const url = URL.createObjectURL(blob);
    urls.push(url);
    card.querySelector(".reference-file-open").innerHTML =
      `<a href="${html(url)}" download="${html(row.name)}" aria-label="Open original ${html(row.name)}" target="_blank" rel="noopener">Open original</a>`;
    if (row.kind === "image") {
      const image = document.createElement("img");
      image.alt = "Your reference: " + row.name;
      image.loading = "lazy";
      image.decoding = "async";
      image.width = 160;
      image.height = 110;
      image.addEventListener(
        "load",
        () => (card.querySelector(".reference-file-placeholder").hidden = true),
      );
      image.addEventListener("error", () => {
        image.remove();
        card.querySelector(".reference-file-placeholder").textContent =
          "Photo attached · preview unavailable";
      });
      image.src = url;
      card.querySelector(".reference-file-picture").append(image);
    }
  }
  async function references(root, sourceFiles) {
    if (!root) return;
    const descriptors = asFiles(sourceFiles);
    root.hidden = !descriptors.length;
    if (!descriptors.length) {
      release(root);
      root.innerHTML = "";
      return;
    }
    const view = cards(root, descriptors);
    const missing = descriptors.filter(
      (file) => !items.some((item) => item.id === file.id),
    );
    let stored = [];
    try {
      stored = await OH_UPLOADS.getFiles(missing.map((file) => file.id));
    } catch {
      /* The text plan remains usable when browser storage is unavailable. */
    }
    if (!root.isConnected || galleries.get(root) !== view.urls) return;
    descriptors.forEach((file, i) =>
      setFilePreview(
        view.cards[i],
        items.find((item) => item.id === file.id) ||
          stored.find((row) => row?.id === file.id),
        view.urls,
      ),
    );
  }
  function isCurrent(source) {
    return (
      items
        .map((file) => file.id)
        .sort()
        .join(",") ===
      asFiles(source?.attachments)
        .map((file) => file.id)
        .sort()
        .join(",")
    );
  }
  function updateResultState() {
    const button = find("#save-plan"),
      note = find("#attachment-change-note");
    if (!button || !currentInspiration) return;
    const stale = !isCurrent(currentInspiration);
    button.disabled = !!busy || stale;
    if (note) note.hidden = !stale;
  }
  function draft() {
    const root = find("#upload-list");
    find("#upload-draft").hidden = !items.length;
    find("#upload-count").textContent =
      `${items.length} / ${OH_UPLOADS.MAX_FILES} reference files`;
    const view = cards(root, items, true);
    items.forEach((item, i) => setFilePreview(view.cards[i], item, view.urls));
    find("#caption-container").hidden =
      !items.length && !isLink(find("#search-query").value.trim());
    updateResultState();
  }
  function add(files) {
    const chosen = [...files];
    if (!chosen.length) return pending;
    busy++;
    find("#upload-list").setAttribute("aria-busy", "true");
    find("#search-form button[type=submit]").disabled = true;
    status("Opening your reference files…");
    updateResultState();
    pending = pending
      .then(async () => {
        const result = await OH_UPLOADS.readFiles(chosen, items);
        items.push(...result.accepted);
        draft();
        const summary = result.accepted.length
          ? `${result.accepted.length} file${result.accepted.length === 1 ? "" : "s"} added. Add a description or choose Find my thing.`
          : "";
        status(
          [summary, ...result.errors].filter(Boolean).join(" "),
          !!result.errors.length,
        );
      })
      .catch((error) => status(error.message, true))
      .finally(() => {
        busy--;
        find("#upload-list").setAttribute("aria-busy", String(!!busy));
        find("#search-form button[type=submit]").disabled = !!busy || linkBusy;
        updateResultState();
      });
    return pending;
  }
  function augment(baseResult = null, query = "") {
    if (!items.length) return baseResult;
    return OH_INGESTION.fromUploads(
      {
        attachments: items,
        query,
        description: find("#caption-input").value,
        textKind: find("#text-kind").value,
      },
      { data, discovery },
      baseResult,
    );
  }
  async function saveReferences(source) {
    const descriptors = asFiles(source?.attachments);
    if (!descriptors.length) return [];
    if (!isCurrent(source))
      throw new Error(
        "Your reference files changed. Choose Find my thing again before saving.",
      );
    const selected = items.filter((item) =>
      descriptors.some((file) => file.id === item.id),
    );
    if (selected.length !== descriptors.length)
      throw new Error(
        "Some reference files are missing. Add them again before saving.",
      );
    const existing = await OH_UPLOADS.getFiles(
      descriptors.map((file) => file.id),
    );
    await OH_UPLOADS.saveFiles(selected);
    return descriptors
      .filter((file) => !existing.some((row) => row?.id === file.id))
      .map((file) => file.id);
  }
  async function removeUnreferenced(sourceFiles, remainingPlans) {
    const keep = new Set(
      remainingPlans.flatMap((plan) =>
        asFiles(plan.source?.attachments).map((file) => file.id),
      ),
    );
    const ids = asFiles(sourceFiles)
      .map((file) => file.id)
      .filter((id) => !keep.has(id));
    try {
      await OH_UPLOADS.deleteFiles(ids);
    } catch {
      /* A later retry can remove unused blobs; never remove another plan’s references. */
    }
  }
  function decorate(result) {
    references(find("#inspiration-file-gallery"), result.attachments);
    updateResultState();
    cleanDetached();
  }
  function init() {
    find("#add-photos").addEventListener("click", () =>
      find("#photo-upload").click(),
    );
    find("#add-files").addEventListener("click", () =>
      find("#file-upload").click(),
    );
    for (const selector of ["#photo-upload", "#file-upload"])
      find(selector).addEventListener("change", (event) => {
        add(event.target.files);
        event.target.value = "";
      });
    find("#upload-list").addEventListener("click", (event) => {
      const remove = event.target.closest("[data-upload-remove]");
      if (!remove) return;
      items = items.filter((file) => file.id !== remove.dataset.uploadRemove);
      draft();
      status(
        items.length
          ? "Reference removed. Choose Find my thing again to update the plan."
          : "References removed. Your link and notes are still here.",
      );
      find("#add-photos").focus({ preventScroll: true });
    });
    find("#clear-uploads").addEventListener("click", () => {
      items = [];
      draft();
      status("References removed. Your link and notes are still here.");
      find("#add-photos").focus({ preventScroll: true });
    });
    const form = find("#search-form");
    let depth = 0;
    form.addEventListener("dragenter", (event) => {
      event.preventDefault();
      depth++;
      form.classList.add("is-dragging");
    });
    form.addEventListener("dragover", (event) => {
      event.preventDefault();
      event.dataTransfer.dropEffect = "copy";
    });
    form.addEventListener("dragleave", () => {
      depth = Math.max(0, depth - 1);
      if (!depth) form.classList.remove("is-dragging");
    });
    form.addEventListener("drop", (event) => {
      event.preventDefault();
      depth = 0;
      form.classList.remove("is-dragging");
      if (event.dataTransfer.files.length) {
        add(event.dataTransfer.files);
        return;
      }
      const value = (
        event.dataTransfer.getData("text/uri-list") ||
        event.dataTransfer.getData("text/plain")
      )
        .split(/\r?\n/)
        .find((line) => line.trim() && !line.startsWith("#"));
      if (value) {
        find("#search-query").value = value.trim();
        find("#search-query").dispatchEvent(
          new Event("input", { bubbles: true }),
        );
        form.requestSubmit();
      }
    });
    form.addEventListener("paste", (event) => {
      if (event.clipboardData?.files.length) {
        event.preventDefault();
        add(event.clipboardData.files);
      }
    });
    // Capture only file-based submissions; ordinary idea and link behavior stays in app.js.
    form.addEventListener(
      "submit",
      (event) => {
        if (!items.length || isLink(find("#search-query").value.trim())) return;
        event.preventDefault();
        event.stopImmediatePropagation();
        if (busy) {
          status("Wait for your files to finish opening, then try again.");
          return;
        }
        renderInspiration(augment(null, find("#search-query").value.trim()));
        status(
          currentInspiration.matches.length
            ? "A starter guide is ready from your notes or text file. Your reference files are attached."
            : "Your reference files are ready. Describe the project above, or choose a starter guide below.",
        );
        find("#link-result").scrollIntoView({
          behavior: "smooth",
          block: "start",
        });
      },
      true,
    );
    find("#search-query").addEventListener("input", () => {
      if (items.length) find("#caption-container").hidden = false;
    });
    window.addEventListener("pagehide", (event) => {
      if (!event.persisted) for (const root of galleries.keys()) release(root);
    });
  }
  return {
    init,
    add,
    augment,
    decorate,
    updateResultState,
    references,
    saveReferences,
    removeUnreferenced,
    releaseDialog,
    cleanDetached,
    get count() {
      return items.length;
    },
  };
})();
