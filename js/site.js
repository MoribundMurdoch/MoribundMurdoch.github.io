(() => {
  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  const year = document.getElementById("year");
  if (year) year.textContent = String(new Date().getFullYear());

  const topBtn = document.getElementById("back-to-top");
  if (topBtn) {
    topBtn.addEventListener("click", () => {
      window.scrollTo({ top: 0, behavior: reduceMotion ? "auto" : "smooth" });
    });
  }

  // HUD bars fill on load
  requestAnimationFrame(() => {
    document.querySelectorAll("[data-bar-fill]").forEach((el) => {
      const pct = el.getAttribute("data-bar-fill");
      if (pct != null) el.style.width = `${pct}%`;
    });
  });

  // Scroll reveals
  const revealables = document.querySelectorAll(".reveal, .tool-card");
  if (revealables.length) {
    if (reduceMotion || !("IntersectionObserver" in window)) {
      revealables.forEach((el) => el.classList.add("is-visible"));
    } else {
      const io = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting) {
              entry.target.classList.add("is-visible");
              io.unobserve(entry.target);
            }
          });
        },
        { threshold: 0.12, rootMargin: "0px 0px -8% 0px" }
      );
      revealables.forEach((el) => io.observe(el));
    }
  }

  // Soft cursor aura + CSS pointer vars
  if (!reduceMotion) {
    const aura = document.createElement("div");
    aura.className = "aura";
    aura.setAttribute("aria-hidden", "true");
    document.body.appendChild(aura);

    let tx = window.innerWidth * 0.5;
    let ty = window.innerHeight * 0.3;
    let cx = tx;
    let cy = ty;
    let active = false;
    let raf = 0;

    const tick = () => {
      cx += (tx - cx) * 0.12;
      cy += (ty - cy) * 0.12;
      aura.style.transform = `translate3d(${cx}px, ${cy}px, 0)`;
      document.documentElement.style.setProperty(
        "--pointer-x",
        `${(cx / window.innerWidth) * 100}%`
      );
      document.documentElement.style.setProperty(
        "--pointer-y",
        `${(cy / window.innerHeight) * 100}%`
      );
      raf = requestAnimationFrame(tick);
    };

    window.addEventListener(
      "pointermove",
      (e) => {
        tx = e.clientX;
        ty = e.clientY;
        if (!active) {
          active = true;
          aura.classList.add("is-on");
          raf = requestAnimationFrame(tick);
        }
      },
      { passive: true }
    );

    window.addEventListener(
      "pointerleave",
      () => {
        aura.classList.remove("is-on");
      },
      { passive: true }
    );

    // Card tilt toward pointer
    document.querySelectorAll(".tool-card").forEach((card) => {
      card.addEventListener(
        "pointermove",
        (e) => {
          const r = card.getBoundingClientRect();
          const px = (e.clientX - r.left) / r.width;
          const py = (e.clientY - r.top) / r.height;
          const ry = (px - 0.5) * 8;
          const rx = (0.5 - py) * 6;
          card.classList.add("is-tilting");
          card.style.setProperty("--rx", `${rx}deg`);
          card.style.setProperty("--ry", `${ry}deg`);
        },
        { passive: true }
      );
      card.addEventListener(
        "pointerleave",
        () => {
          card.classList.remove("is-tilting");
          card.style.setProperty("--rx", "0deg");
          card.style.setProperty("--ry", "0deg");
        },
        { passive: true }
      );
    });
  }

  // Music player
  const player = document.getElementById("music-player");
  const playBtn = document.getElementById("play-button");
  const pauseBtn = document.getElementById("pause-button");
  if (!player || !playBtn || !pauseBtn) return;

  const showPlay = (playing) => {
    playBtn.hidden = playing;
    pauseBtn.hidden = !playing;
  };

  playBtn.addEventListener("click", () => {
    player.play().then(() => showPlay(true)).catch(() => showPlay(false));
  });

  pauseBtn.addEventListener("click", () => {
    player.pause();
    showPlay(false);
  });

  player.addEventListener("ended", () => showPlay(false));
  player.addEventListener("pause", () => showPlay(false));
  player.addEventListener("play", () => showPlay(true));
})();
