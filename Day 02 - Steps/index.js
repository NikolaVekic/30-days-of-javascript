const progress = document.getElementById("progress");
const prev = document.getElementById("prev");
const next = document.getElementById("next");
const circle = document.querySelectorAll(".circle");

let currentActive = 1;

next.addEventListener("click", () => {
  currentActive++;

  if (currentActive > circle.length) {
    currentActive = circle.length;
  }

  update();
});

prev.addEventListener("click", () => {
  currentActive--;

  if (currentActive < 1) {
    currentActive = 1;
  }

  update();
});

const update = () => {
  circle.forEach((item, idx) => {
    if (idx < currentActive) {
      item.classList.add("active");
    } else {
      item.classList.remove("active");
    }
  });

  const actives = document.querySelectorAll(".active");

  const progressPercentage = ((actives.length - 1) / (circle.length - 1)) * 100;
  progress.style.width = `${progressPercentage}%`;

  if (currentActive === 1) {
    prev.disabled = true;
  } else if (currentActive === circle.length) {
    next.disabled = true;
  } else {
    prev.disabled = false;
    next.disabled = false;
  }
};
