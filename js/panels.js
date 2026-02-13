document.addEventListener("DOMContentLoaded", function () {
  const dock = document.getElementById("panelDock");
  if (!dock) return;

  document.querySelectorAll(".panel__minimize").forEach((btn) => {
    btn.addEventListener("click", function () {
      const panelId = this.dataset.panel;
      if (!panelId) return;

      const panel = document.getElementById(panelId);
      if (!panel) return;

      panel.classList.add("panel--hidden");

      // Avoid duplicate tabs
      if (dock.querySelector(`.panel-tab[data-panel="${panelId}"]`)) return;

      const tab = document.createElement("div");
      tab.className = "panel-tab";
      tab.textContent = panelId.replace(/([A-Z])/g, " $1").trim();
      tab.dataset.panel = panelId;

      tab.addEventListener("click", function () {
        panel.classList.remove("panel--hidden");
        tab.remove();
      });

      dock.appendChild(tab);
    });
  });
});
