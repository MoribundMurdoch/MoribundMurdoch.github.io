document.addEventListener("DOMContentLoaded", () => {
  // Only run if Interact is loaded
  if (typeof interact === "undefined") return;

  function dragMoveListener(event) {
    const target = event.target;

    const x = (parseFloat(target.getAttribute("data-x")) || 0) + event.dx;
    const y = (parseFloat(target.getAttribute("data-y")) || 0) + event.dy;

    target.style.transform = `translate(${x}px, ${y}px)`;
    target.setAttribute("data-x", x);
    target.setAttribute("data-y", y);
  }

  window.dragMoveListener = dragMoveListener;

  interact(".resize-drag")
    .resizable({
      // resize from all edges and corners
      edges: { left: true, right: true, bottom: true, top: true },

      listeners: {
        move(event) {
          const target = event.target;

          // keep track of the current position (so resize doesn't "jump")
          let x = parseFloat(target.getAttribute("data-x")) || 0;
          let y = parseFloat(target.getAttribute("data-y")) || 0;

          // update the element's size
          target.style.width = `${event.rect.width}px`;
          target.style.height = `${event.rect.height}px`;

          // translate when resizing from top/left
          x += event.deltaRect.left;
          y += event.deltaRect.top;

          target.style.transform = `translate(${x}px, ${y}px)`;
          target.setAttribute("data-x", x);
          target.setAttribute("data-y", y);
        },
      },

      modifiers: [
        // Keep resized edges inside the parent (layout)
        interact.modifiers.restrictEdges({
          outer: ".layout",
        }),

        // Minimum size so panels don't collapse into nothing
        interact.modifiers.restrictSize({
          min: { width: 220, height: 140 },
        }),
      ],

      inertia: true,
    })
    .draggable({
      inertia: true,

      modifiers: [
        // Keep dragging inside layout (better than "body" for your 3-column system)
        interact.modifiers.restrictRect({
          restriction: ".layout",
          endOnly: true,
        }),
      ],

      autoScroll: true,

      listeners: {
        move: dragMoveListener,
      },
    });
});
