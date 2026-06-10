const form = document.getElementById("roomForm");
const roomImageInput = document.getElementById("roomImage");
const promptInput = document.getElementById("prompt");
const originalPreview = document.getElementById("originalPreview");
const editedPreview = document.getElementById("editedPreview");
const originalEmpty = document.getElementById("originalEmpty");
const editedEmpty = document.getElementById("editedEmpty");
const loading = document.getElementById("loading");
const errorMessage = document.getElementById("errorMessage");
const statusMessage = document.getElementById("statusMessage");
const submitBtn = document.getElementById("submitBtn");
const fileName = document.getElementById("fileName");
const promptButtons = document.querySelectorAll("[data-prompt]");

const API_URL = "http://localhost:4000/api/edit-room";

function showError(message) {
  console.error("[room-decor]", message);
  errorMessage.textContent = message;
  errorMessage.classList.remove("hidden");
  statusMessage.classList.add("hidden");
}

function showStatus(message) {
  console.log("[room-decor]", message);
  statusMessage.textContent = message;
  statusMessage.classList.remove("hidden");
  errorMessage.classList.add("hidden");
}

function loadImage(file) {
  return new Promise((resolve, reject) => {
    const image = new Image();
    image.onload = () => resolve(image);
    image.onerror = () => reject(new Error("Could not read the uploaded image."));
    image.src = URL.createObjectURL(file);
  });
}

async function prepareRoomImage(file) {
  const image = await loadImage(file);
  const canvas = document.createElement("canvas");
  const size = 1024;
  canvas.width = size;
  canvas.height = size;

  const ctx = canvas.getContext("2d");
  ctx.fillStyle = "#ffffff";
  ctx.fillRect(0, 0, size, size);

  const scale = Math.min(size / image.width, size / image.height);
  const width = image.width * scale;
  const height = image.height * scale;
  const x = (size - width) / 2;
  const y = (size - height) / 2;
  ctx.drawImage(image, x, y, width, height);

  URL.revokeObjectURL(image.src);

  return new Promise((resolve, reject) => {
    canvas.toBlob((blob) => {
      if (!blob) {
        reject(new Error("Could not prepare the image for editing."));
        return;
      }

      resolve(new File([blob], "room.png", { type: "image/png" }));
    }, "image/png");
  });
}

roomImageInput.addEventListener("change", () => {
  const file = roomImageInput.files[0];
  if (!file) return;

  fileName.textContent = file.name;
  const reader = new FileReader();
  reader.onload = (event) => {
    originalPreview.src = event.target.result;
    originalPreview.style.display = "block";
    originalEmpty.classList.add("hidden");
  };
  reader.readAsDataURL(file);
});

promptButtons.forEach((button) => {
  button.addEventListener("click", () => {
    promptInput.value = button.dataset.prompt;
    promptInput.focus();
  });
});

form.addEventListener("submit", async (event) => {
  event.preventDefault();

  const file = roomImageInput.files[0];
  const prompt = promptInput.value.trim();

  if (!file) {
    showError("Please upload a room photo first.");
    return;
  }

  if (!prompt) {
    showError("Please describe how you want to redesign the room.");
    return;
  }

  loading.classList.remove("hidden");
  errorMessage.classList.add("hidden");
  showStatus("Preparing your room image...");
  editedPreview.style.display = "none";
  editedEmpty.classList.add("hidden");
  submitBtn.disabled = true;
  submitBtn.textContent = "Generating...";

  try {
    console.log("[room-decor] Preparing uploaded image", {
      name: file.name,
      type: file.type,
      size: file.size,
    });

    const preparedFile = await prepareRoomImage(file);
    showStatus("Sending your room to GPT mini...");
    console.log("[room-decor] Sending request to server", {
      endpoint: API_URL,
      preparedType: preparedFile.type,
      preparedSize: preparedFile.size,
    });

    const formData = new FormData();
    formData.append("roomImage", preparedFile);
    formData.append("prompt", prompt);

    const response = await fetch(API_URL, {
      method: "POST",
      body: formData,
    });

    const contentType = response.headers.get("content-type") || "";
    const data = contentType.includes("application/json")
      ? await response.json()
      : { error: await response.text() };

    console.log("[room-decor] Server response received", {
      ok: response.ok,
      status: response.status,
      requestId: data.requestId,
      hasImage: Boolean(data.image),
      details: data.details,
    });

    if (!response.ok) {
      const requestNote = data.requestId ? ` Request ID: ${data.requestId}.` : "";
      throw new Error(`${data.error || "Failed to generate image."}${requestNote}`);
    }

    if (!data.image) {
      throw new Error("The server did not return an edited image.");
    }

    showStatus("Image returned. Rendering preview...");
    editedPreview.onload = () => showStatus("Done. Your redesigned room is ready.");
    editedPreview.onerror = () => showError("The generated image returned, but the browser could not render it.");
    editedPreview.src = data.image;
    editedPreview.style.display = "block";
  } catch (error) {
    showError(error.message);
  } finally {
    loading.classList.add("hidden");
    submitBtn.disabled = false;
    submitBtn.textContent = "Generate";
  }
});
