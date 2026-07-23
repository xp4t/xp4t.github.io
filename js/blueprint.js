document.addEventListener("DOMContentLoaded", () => {
  const tabs = Array.from(document.querySelectorAll("#project-tabs button"));
  const pcbGroups = Array.from(document.querySelectorAll(".pcb-group"));

  function previewProject(id) {
    tabs.forEach(t => t.classList.toggle("active", t.dataset.project === id));
    pcbGroups.forEach(g => g.classList.toggle("active", g.dataset.project === id));
    const pulse = document.querySelector(`.signal-pulse[data-project="${id}"]`);
    if (pulse) {
      pulse.classList.remove("fire");
      void pulse.getBBox(); // restart the CSS animation
      pulse.classList.add("fire");
    }
    window.dispatchEvent(new CustomEvent("project-selected", { detail: { project: id } }));
  }

  function activateProject(id) {
    previewProject(id);
    window.dispatchEvent(new CustomEvent("project-activate", { detail: { project: id } }));
  }

  tabs.forEach(tab => {
    tab.addEventListener("mouseenter", () => previewProject(tab.dataset.project));
    tab.addEventListener("focus", () => previewProject(tab.dataset.project));
    tab.addEventListener("click", () => activateProject(tab.dataset.project));
  });
  pcbGroups.forEach(group => {
    group.style.cursor = "pointer";
    group.addEventListener("mouseenter", () => previewProject(group.dataset.project));
    group.addEventListener("click", () => activateProject(group.dataset.project));
  });

  // default selection once the DOM (and projects.js listener) is ready
  requestAnimationFrame(() => previewProject("ov7670"));
});
