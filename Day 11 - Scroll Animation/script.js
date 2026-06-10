const boxes = document.querySelectorAll(".box");

// Define checkBoxes before using it as an event handler.
const checkBoxes = () => {
  const triggerBottom = (window.innerHeight / 5) * 4;

  boxes.forEach((box) => {
    const boxTop = box.getBoundingClientRect().top;

    if (boxTop < triggerBottom) {
      box.classList.add("show");
    } else {
      box.classList.remove("show");
    }
  });
};

// Now that checkBoxes is defined, we can safely add it as an event listener.
window.addEventListener("scroll", checkBoxes);

// Initial check in case the elements should be visible without scroll on page load.
checkBoxes();
