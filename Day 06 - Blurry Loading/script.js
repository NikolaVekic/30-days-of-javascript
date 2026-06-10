const loadText = document.querySelector(".loading-text");
const bg = document.querySelector(".bg");

let load = 0;
const interval = setInterval(() => {
  load++;
  loadText.textContent = `${load}%`;
  loadText.style.opacity = 1 - load / 100;
  bg.style.filter = `blur(${30 * (1 - load / 100)}px)`;

  if (load === 100) clearInterval(interval);
}, 30);
