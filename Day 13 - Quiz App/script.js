import data from "./data.js";

let index = 0;
let score = 0;
let answerSelected = false;
const points = document.querySelector("#points");
const btn = document.querySelector("#next");
const reset = document.querySelector("#reset");
const question = document.querySelector("#question");
const answers = [
  document.querySelector("#answer1"),
  document.querySelector("#answer2"),
  document.querySelector("#answer3"),
  document.querySelector("#answer4"),
];

// Assign click event for each answer
answers.forEach((answer) => {
  answer.onclick = () => {
    if (!answerSelected) {
      // Check if an answer has not yet been selected
      quessAnswer(answer);
      answerSelected = true; // Set the flag to true after an answer is selected
    }
  };
});

// Assign click event for next button
btn.onclick = () => {
  nextQuiz();
};

// Assign click event for reset button
reset.onclick = () => {
  resetQuiz();
};

// Gets data for the current quiz
const startQuiz = () => {
  const questionTitle = data[index].question;
  const questions = data[index].options;

  question.innerHTML = questionTitle;
  answers.forEach((answer, id) => {
    answer.innerHTML = questions[id];
  });
};

const nextQuiz = () => {
  if (index < data.length - 1) {
    // Clear previous highlights
    answers.forEach((answer) => {
      answer.classList.remove("bg-success", "bg-danger");
    });
    answerSelected = false;

    index++;
    startQuiz();
  }
};

// Resets the quiz
const resetQuiz = () => {
  index = 0;
  score = 0;
  answerSelected = false;
  points.innerHTML = `Score: ${score}`;
  answers.forEach((answer) => {
    answer.classList.remove("bg-success", "bg-danger");
  });
  startQuiz();
};

const quessAnswer = (e) => {
  if (e.innerHTML === data[index].correct_answer) {
    e.classList.add("bg-success");
    score++;
    points.innerHTML = `Score: ${score}`;
  } else {
    answers.forEach((answer) => {
      if (answer.innerHTML !== data[index].correct_answer) {
        answer.classList.add("bg-danger");
      }
      if (answer.innerHTML === data[index].correct_answer) {
        answer.classList.add("bg-success");
      }
    });
  }
};

// Starts the quiz when page loads
startQuiz();
