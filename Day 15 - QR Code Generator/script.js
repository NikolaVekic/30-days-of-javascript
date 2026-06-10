const btn = document.querySelector(".btn");
const img = document.querySelector("#qrCode");
const error = document.querySelector("#error");
const qrBox = document.querySelector("#qrBox");

const getQRCode = () => {
  const data = document.querySelector("#data").value;
  if (data.length <= 0) {
    error.classList.add("d-block");
    qrBox.classList.remove("d-block");
  } else {
    error.classList.remove("d-block");
    qrBox.classList.add("d-block");
    const url = `https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${data}`;
    img.src = url;
  }
};

btn.onclick = () => {
  getQRCode();
};
