const resultTitle = document.body.querySelector(".result-text");
const resultText = document.body.querySelector(".result");
const scoreWin = document.body.querySelector("#win");
const scoreLoss = document.body.querySelector("#loss");
const scoreTie = document.body.querySelector("#tie");
const resetButton = document.body.querySelector(".reset-btn");

const gameChoice = (choice) => {
  const randomNumber = Math.floor(Math.random() * 3) + 1;
  const choiceAssign =
    randomNumber === 1
      ? "rock"
      : randomNumber === 2
      ? "paper"
      : randomNumber === 3
      ? "scissors"
      : null;

  if (choice === choiceAssign) {
    resultTitle.innerHTML = "It's a tie!";
    scoreTie.innerHTML = parseInt(scoreTie.innerHTML) + 1;
  } else if (choice === "rock" && choiceAssign === "paper") {
    resultTitle.innerHTML = `You lost, ${choiceAssign} beats ${choice}`;
    scoreLoss.innerHTML = parseInt(scoreLoss.innerHTML) + 1;
  } else if (choice === "paper" && choiceAssign === "scissors") {
    resultTitle.innerHTML = `You lost, ${choiceAssign} beats ${choice}`;
    scoreLoss.innerHTML = parseInt(scoreLoss.innerHTML) + 1;
  } else if (choice === "scissors" && choiceAssign === "rock") {
    resultTitle.innerHTML = `You lost, ${choiceAssign} beats ${choice}`;
    scoreLoss.innerHTML = parseInt(scoreLoss.innerHTML) + 1;
  } else if (choice === "rock" && choiceAssign === "scissors") {
    resultTitle.innerHTML = `You won, ${choice} beats ${choiceAssign}`;
    scoreWin.innerHTML = parseInt(scoreWin.innerHTML) + 1;
  } else if (choice === "paper" && choiceAssign === "rock") {
    resultTitle.innerHTML = `You won, ${choice} beats ${choiceAssign}`;
    scoreWin.innerHTML = parseInt(scoreWin.innerHTML) + 1;
  } else if (choice === "scissors" && choiceAssign === "paper") {
    resultTitle.innerHTML = `You won, ${choice} beats ${choiceAssign}`;
    scoreWin.innerHTML = parseInt(scoreWin.innerHTML) + 1;
  }
};

document.body.querySelectorAll(".option").forEach((e) => {
  e.addEventListener("click", (el) => {
    gameChoice(el.target.id);
  });
});

resetButton.addEventListener("click", () => {
  scoreLoss.innerHTML = 0;
  scoreWin.innerHTML = 0;
  scoreTie.innerHTML = 0;
  resultTitle.innerHTML = "";
});
