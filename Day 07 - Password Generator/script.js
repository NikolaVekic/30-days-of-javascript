// Global Values

const psw = document.querySelector("#password");
const btn = document.querySelector("#generate");
const copy = document.querySelector("#copy");

// Click Handlers
btn.onclick = () => {
  const password = generatePassword();
  psw.value = password;
};

copy.onclick = () => {
  copyPassword();
};

// Password Function
function generatePassword() {
  const passwordCharacters = [
    "ABCDEFGHIJKLMNOPQRSTUVWXYZ",
    "abcdefghijklmnopqrstuvwxyz",
    "0123456789",
    "!@#$%^&*()_+-=[]{}|;:'\",.<>/?",
  ];

  let password = "";

  for (let i = 0; i < 12; i++) {
    const randomIndex = Math.floor(Math.random() * passwordCharacters.length);
    const passwordGroup = passwordCharacters[randomIndex];
    const passwordChar =
      passwordGroup[Math.floor(Math.random() * passwordGroup.length)];

    password += passwordChar;
  }
  return password;
}

// Copy Function
function copyPassword() {
  if (psw.value.length > 0) {
    navigator.clipboard.writeText(psw.value);
    document.querySelector("#alert").classList.add("d-block");
  }
}
