document.addEventListener("DOMContentLoaded", () => {
  const counter = document.querySelector("#counter");
  const remaining = document.querySelector("#remaining");
  const textarea = document.querySelector("#textarea");
  const characterLimit = 30;

  textarea.addEventListener("keydown", () => {
    const count = textarea.value.length;
    remaining.innerHTML = characterLimit - count;
    counter.innerHTML = count;
  });
});
