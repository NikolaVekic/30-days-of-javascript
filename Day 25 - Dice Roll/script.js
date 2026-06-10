document.addEventListener("DOMContentLoaded", () => {
  const btn = document.querySelector(".btn");
  const number = document.querySelector(".number");
  const dice = document.querySelector(".dice");

  const DURATION = 450;

  const restartAnim = (el) => {
    el.classList.remove("is-rolling");
    void el.offsetWidth;
    el.classList.add("is-rolling");
  };

  btn.addEventListener("click", () => {
    btn.disabled = true;

    restartAnim(dice);
    restartAnim(number);

    setTimeout(
      () => {
        const randomNumber = Math.floor(Math.random() * 20) + 1;
        number.textContent = randomNumber;
      },
      Math.floor(DURATION * 0.55),
    );
    setTimeout(() => {
      btn.disabled = false;
    }, DURATION);
  });
});
