const buttons = document.querySelectorAll(".faq-toggle");

buttons.forEach((element) => {
  element.addEventListener("click", () => {
    element.parentNode.classList.toggle("active");
  });
});
