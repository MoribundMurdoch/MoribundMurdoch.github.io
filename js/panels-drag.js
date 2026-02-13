document.addEventListener("DOMContentLoaded", () => {
  // Only run if Interact is loaded
  if (typeof interact === "undefined") return;

  function dragMoveListener(event) {
    const target = event.target;

    const x =
      (parseFloat(target.getAttribute("data-x")) || 0) + event.dx;
    const y =
      (parseFloat(target.getAttribute("data-y")) || 0) + event.dy;

    target.style.transform = `translate(${x}px, ${y}px)`;

    target.setAttribute("data-x", x);
    target.setAttribute("data-y", y);
  }

  window.dragMoveListener = dragMoveListener;

  interact(".resize-drag").draggable({
    inertia: true,

    modifiers: [
      interact.modifiers.restrictRect({
        restriction: "body",
        endOnly: true,
      }),
    ],

    autoScroll: true,

    listeners: {
      move: dragMoveListener,
    },
  });
});
