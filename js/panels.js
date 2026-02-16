document.addEventListener("DOMContentLoaded", function () {

  const footer = document.querySelector("footer.footer-container");
  if (!footer) return;

  let dock = document.getElementById("panelDock");

  // Ensure dock exists and is INSIDE the footer
  if (!dock) {
    dock = document.createElement("div");
    dock.id = "panelDock";
    dock.className = "panel-dock";
  }

  if (dock.parentElement !== footer) {
    footer.insertBefore(dock, footer.firstChild);
  }

  function createTab(panelId, panel) {

    // Prevent duplicate tabs
    if (dock.querySelector(`.panel-tab[data-panel="${panelId}"]`)) return;

    const tab = document.createElement("div");
    tab.className = "panel-tab";
    tab.dataset.panel = panelId;

    // Make nicer label from ID
    tab.textContent = panelId
      .replace(/([A-Z])/g, " $1")
      .replace(/[-_]/g, " ")
      .trim();

    tab.addEventListener("click", function () {
      panel.classList.remove("panel--hidden");
      tab.remove();
    });

    dock.appendChild(tab);
  }

  function wireMinimizeButtons() {
    document.querySelectorAll(".panel__minimize").forEach((btn) => {

      btn.addEventListener("click", function () {
        const panelId = this.dataset.panel;
        if (!panelId) return;

        const panel = document.getElementById(panelId);
        if (!panel) return;

        panel.classList.add("panel--hidden");
        createTab(panelId, panel);
      });

    });
  }

  wireMinimizeButtons();
});
