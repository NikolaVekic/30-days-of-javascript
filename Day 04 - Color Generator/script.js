const randomHexColor = () => {
  let color = (Math.random() * 0xfffff * 1000000).toString(16);
  let hexColor = `#${color.slice(0, 6)}`;
  document.querySelector(".color").style.backgroundColor = hexColor;
  document.querySelector(".color-code").innerHTML = hexColor;
};

document.querySelector(".btn").addEventListener("click", () => {
  randomHexColor();
});

randomHexColor();
