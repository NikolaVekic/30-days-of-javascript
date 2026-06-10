const audioPlayer = document.querySelector(".control-play");
const audioPlayerIcon = document.querySelector("#icon");
const song = document.querySelector("#song");
const rangeBar = document.querySelector("#customRange");

const playAudio = () => {
  if (song.paused) {
    song.play();
    audioPlayerIcon.classList.remove("fa-play");
    audioPlayerIcon.classList.add("fa-pause");
  } else {
    song.pause();
    audioPlayerIcon.classList.remove("fa-pause");
    audioPlayerIcon.classList.add("fa-play");
  }
};

audioPlayer.onclick = () => {
  playAudio();
};

song.addEventListener("timeupdate", () => {
  const percentage = (song.currentTime / song.duration) * 100;
  rangeBar.value = percentage;
});

rangeBar.addEventListener("input", () => {
  const percentage = rangeBar.value;
  const time = (song.duration / 100) * percentage;
  song.currentTime = time;
});
