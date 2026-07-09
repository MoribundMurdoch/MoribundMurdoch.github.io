(() => {
  const year = document.getElementById("year");
  if (year) year.textContent = String(new Date().getFullYear());

  const topBtn = document.getElementById("back-to-top");
  if (topBtn) {
    topBtn.addEventListener("click", () => {
      window.scrollTo({ top: 0, behavior: "smooth" });
    });
  }

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
