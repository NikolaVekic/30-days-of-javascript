const buttons = document.querySelectorAll(".btn");
const output = document.querySelector(".output");

let currentInput = "";
let previousInput = "";
let operation = null;

const calculate = () => {
  let result = parseFloat(previousInput);
  const current = parseFloat(currentInput);

  switch (operation) {
    case "+":
      result += current;
      break;
    case "-":
      result -= current;
      break;
    case "*":
      result *= current;
      break;
    case "/":
      result /= current;
      break;
    default:
      return;
  }

  currentInput = result.toString();
  operation = null;
  previousInput = "";
};

const updateDisplay = (value) => {
  output.innerHTML = value;
};

const handleButtonClick = (value) => {
  if (!isNaN(value) || value === ".") {
    // If number or dot
    if (value === "." && currentInput.includes(".")) return; // Avoid multiple dots
    currentInput += value;
  } else if (value === "AC") {
    // Clear
    currentInput = "";
    previousInput = "";
    operation = null;
    updateDisplay("0");
    return;
  } else if (value === "=") {
    // Calculate
    if (!operation || !currentInput || !previousInput) return;
    calculate();
    updateDisplay(currentInput);
    return;
  } else {
    // Operation
    if (!currentInput) return;
    if (previousInput) calculate();
    operation = value;
    previousInput = currentInput;
    currentInput = "";
    return;
  }

  updateDisplay(currentInput);
};

buttons.forEach((button) => {
  button.addEventListener("click", () =>
    handleButtonClick(button.textContent.trim())
  );
});
