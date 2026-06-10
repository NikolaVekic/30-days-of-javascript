const panels = document.querySelectorAll(".panel");

panels.forEach((panel) => {
  panel.addEventListener("click", () => {
    ClassListRemove();
    panel.classList.add("active");
  });
});

const ClassListRemove = () => {
  panels.forEach((panel) => {
    panel.classList.remove("active");
  });
};
