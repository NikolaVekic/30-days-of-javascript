const body = document.body;
const slides = document.querySelectorAll(".slide");
const leftBtn = document.getElementById("left");
const rightBtn = document.getElementById("right");

let activeSlide = 0;

const updateSlider = () => {
  slides.forEach((slide) => slide.classList.remove("active"));
  slides[activeSlide].classList.add("active");
  body.style.backgroundImage = `url('src/${activeSlide + 1}.jpg')`;
};

updateSlider();

leftBtn.addEventListener("click", () => {
  activeSlide++;
  if (activeSlide >= slides.length) {
    activeSlide = 0;
  }
  updateSlider();
});

rightBtn.addEventListener("click", () => {
  activeSlide--;
  if (activeSlide < 0) {
    activeSlide = slides.length - 1;
  }
  updateSlider();
});
