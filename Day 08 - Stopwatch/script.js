const time = document.querySelector("#time");
const controls = document.querySelector("#controls");
const reset = document.querySelector("#reset");
const icon = document.querySelector("#icon");

let [seconds, minutes, hours] = [0, 0, 0];
let timer = null;
let control = 0;

const stopwatch = () => {
  seconds++;

  if (seconds / 60 === 1) {
    seconds = 0;
    minutes++;
    if (minutes / 60 === 1) {
      minutes = 0;
      hours++;
    }
  }
  let h = hours < 10 ? "0" + hours : hours;
  let m = minutes < 10 ? "0" + minutes : minutes;
  let s = seconds < 10 ? "0" + seconds : seconds;
  time.innerHTML = `${h}:${m}:${s}`;
};

const startTimer = () => {
  if (timer !== null) {
    clearInterval(timer);
  }
  timer = setInterval(stopwatch, 1000);
};

const resetTimer = () => {
  clearInterval(timer);
  [seconds, minutes, hours] = [0, 0, 0];
  time.innerHTML = "00:00:00";
  icon.classList.remove("fa-pause");
  icon.classList.add("fa-play");
  control = 0; // Reset control to indicate the timer is stopped
};
const stopTimer = () => {
  clearInterval(timer);
};

controls.onclick = () => {
  if (control === 0) {
    startTimer();
    control = 1; // Indicate timer is running
    icon.classList.remove("fa-play");
    icon.classList.add("fa-pause");
  } else {
    stopTimer();
    control = 0; // Indicate timer is stopped
    icon.classList.remove("fa-pause");
    icon.classList.add("fa-play");
  }
};

reset.onclick = () => {
  resetTimer();
};
