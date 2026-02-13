document.addEventListener("DOMContentLoaded", function () {
  const btn = document.getElementById("back-to-top");
  if (btn) {
    btn.addEventListener("click", () => {
      window.scrollTo({ top: 0, behavior: "smooth" });
    });
  }

  const play = document.getElementById("play-button");
  const pause = document.getElementById("pause-button");
  const audio = document.getElementById("music-player");

  if (play && pause && audio) {
    play.addEventListener("click", () => {
      audio.play();
      play.style.display = "none";
      pause.style.display = "inline-block";
    });

    pause.addEventListener("click", () => {
      audio.pause();
      pause.style.display = "none";
      play.style.display = "inline-block";
    });
  }
});
